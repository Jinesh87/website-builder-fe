import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { SitePage, SiteRenderModeProvider, SITE_CSS, type SiteData } from "../site-kit/index.ts";
import { EXPORT_BASE_CSS, STATIC_STATE_CSS } from "../features/site-export/export-css.ts";
import { googleFontLinks, toGoogleFontNames, usedFonts } from "../features/site-export/export-fonts.ts";
import runtimeJs from "../features/site-export/static-runtime.js?raw";
import type { WebsitePage } from "../api/websites.ts";

export type RenderedPage = {
  /** Font stylesheets and image preloads for <head> */
  head: string;
  body: string;
  assetsVersion: string;
};

const CSS = `${EXPORT_BASE_CSS}\n${STATIC_STATE_CSS}\n${SITE_CSS.trim()}\n`;

export const ASSETS = {
  css: CSS,
  js: runtimeJs,
  version: createHash("sha256").update(CSS).update(runtimeJs).digest("hex").slice(0, 12),
};

/** React emits image preload hints ahead of the markup; they belong in <head>. */
const LEADING_LINKS = /^(?:<link [^>]*>)+/;

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** Renders one published page with the same components the editor previews. */
export function renderLivePage(site: SiteData, slug: string): RenderedPage | null {
  const page = site.pages.find((candidate) => candidate.slug === slug);
  if (!page) return null;

  const markup = renderToStaticMarkup(
    <SiteRenderModeProvider mode="static">
      <SitePage site={site} page={page} />
    </SiteRenderModeProvider>,
  );
  const preloads = markup.match(LEADING_LINKS)?.[0] ?? "";
  const fontLinks = googleFontLinks(usedFonts(site.theme, [page as WebsitePage]));
  const head = [
    ...(fontLinks.length > 0
      ? [
          `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
          `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
          ...fontLinks.map((href) => `<link rel="stylesheet" href="${escapeAttribute(href)}" />`),
        ]
      : []),
    preloads,
  ]
    .filter(Boolean)
    .join("\n");

  return { head, body: toGoogleFontNames(markup.slice(preloads.length)), assetsVersion: ASSETS.version };
}
