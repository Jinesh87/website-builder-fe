import { websitesApi, type WebsiteDetail, type WebsitePage } from "../../api/websites.ts";
import { env } from "../../config/env.ts";
import type { FooterData, HeaderData, ThemeSettings } from "../../site-kit/index.ts";

export type ExportSite = {
  name: string;
  theme: ThemeSettings;
  header: HeaderData;
  footer: FooterData;
  pages: WebsitePage[];
};

export type ExportFile = { path: string; data: Blob | string };

export type ExportProgress = (message: string) => void;

/** The latest saved draft, visible pages only. */
export async function loadExportSite(websiteId: string): Promise<ExportSite> {
  const website: WebsiteDetail = await websitesApi.get(websiteId);
  return {
    name: website.name,
    theme: website.draft.theme,
    header: website.draft.header,
    footer: website.draft.footer,
    pages: website.draft.pages.filter((page) => page.visible),
  };
}

/** Rebuilds every string in a JSON-like value, keeping its shape. */
function mapStrings<T>(value: T, fn: (text: string) => string): T {
  if (typeof value === "string") return fn(value) as T;
  if (Array.isArray(value)) return value.map((item) => mapStrings(item, fn)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapStrings(item, fn)])) as T;
  }
  return value;
}

/** Media saved in content is `<API_PUBLIC_URL>/api/media/files/<id>`; the origin may be stale, so match on the path. */
const MEDIA_URL = /(?:https?:\/\/[^\s"'()<>]*?)?\/api\/media\/files\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
  "image/x-icon": "ico",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
};

/**
 * Downloads the site's uploaded media and points the content at the copies.
 * Files that can't be fetched keep their original URL. External images are left alone.
 */
export async function bundleMedia(
  site: ExportSite,
  pathFor: (fileName: string) => string,
  folder: string,
  onProgress: ExportProgress,
): Promise<{ site: ExportSite; files: ExportFile[] }> {
  const ids = new Set<string>();
  mapStrings(site, (text) => {
    for (const match of text.matchAll(MEDIA_URL)) ids.add(match[1].toLowerCase());
    return text;
  });

  const localPaths = new Map<string, string>();
  const files: ExportFile[] = [];
  let done = 0;
  for (const id of ids) {
    onProgress(`Downloading media (${++done} of ${ids.size})`);
    try {
      const response = await fetch(`${env.apiUrl}/media/files/${id}`, { credentials: "omit" });
      if (!response.ok) continue;
      const blob = await response.blob();
      const type = (response.headers.get("Content-Type") ?? blob.type).split(";")[0].trim();
      const fileName = `${id}.${EXTENSIONS[type] ?? "bin"}`;
      files.push({ path: `${folder}/${fileName}`, data: blob });
      localPaths.set(id, pathFor(fileName));
    } catch {
      // Unreachable files keep pointing at the live server.
    }
  }

  const rewritten = mapStrings(site, (text) =>
    text.replace(MEDIA_URL, (url, id: string) => localPaths.get(id.toLowerCase()) ?? url),
  );
  return { site: rewritten, files };
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "website"
  );
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
