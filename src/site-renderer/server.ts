/**
 * Renders published websites for the API's live-site engine, using the same site-kit
 * components as the editor. Internal service: bind it to localhost or a private network.
 *
 *   POST /render   { site: SiteData, slug: string } -> RenderedPage, or 404 when the page doesn't exist
 *   GET  /assets   { version, css, js } shared by every page
 *   GET  /health
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { SiteData } from "../site-kit/index.ts";
import { ASSETS, renderLivePage } from "./render-page.tsx";

const PORT = Number(process.env.PORT ?? 3100);
const HOST = process.env.HOST ?? "127.0.0.1";
const MAX_BODY_BYTES = 20 * 1024 * 1024;

function send(res: ServerResponse, status: number, body: unknown) {
  const json = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(json) });
  res.end(json);
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error("Request body too large"), { status: 413 });
    chunks.push(chunk as Buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isRenderRequest(value: unknown): value is { site: SiteData; slug: string } {
  if (!value || typeof value !== "object") return false;
  const { site, slug } = value as Record<string, unknown>;
  return typeof slug === "string" && !!site && typeof site === "object" && Array.isArray((site as SiteData).pages);
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true, assetsVersion: ASSETS.version });
    if (req.method === "GET" && req.url === "/assets") return send(res, 200, ASSETS);
    if (req.method === "POST" && req.url === "/render") {
      const payload = await readJson(req);
      if (!isRenderRequest(payload)) return send(res, 400, { error: "Expected { site, slug }" });
      const page = renderLivePage(payload.site, payload.slug);
      return page ? send(res, 200, page) : send(res, 404, { error: "Page not found" });
    }
    send(res, 404, { error: "Not found" });
  } catch (error) {
    const status = (error as { status?: number }).status ?? (error instanceof SyntaxError ? 400 : 500);
    console.error("[site-renderer]", error);
    send(res, status, { error: error instanceof Error ? error.message : "Render failed" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[site-renderer] listening on http://${HOST}:${PORT} (assets ${ASSETS.version})`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
