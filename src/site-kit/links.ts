const SAFE_SCHEME = /^(https?:|mailto:|tel:)/i;

/**
 * Published sites render user/AI-provided links, so only http(s), mailto, tel,
 * site-relative paths and in-page anchors are allowed. Anything else
 * (e.g. `javascript:`) collapses to "#".
 */
export function safeHref(href: string | undefined): string {
  const value = href?.trim() ?? "";
  if (!value) return "#";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("#")) return value;
  return SAFE_SCHEME.test(value) ? value : "#";
}

export function isExternalHref(href: string): boolean {
  return /^https?:/i.test(href);
}

/** Links that leave the site: web pages, email and phone. */
export function isOffsiteHref(href: string): boolean {
  return SAFE_SCHEME.test(href.trim());
}

type LinkablePage = { id?: string; slug: string; name: string };

export type ResolvedPageLink<P extends LinkablePage> = {
  page: P;
  /** Section anchor to scroll to, without the leading "#". Empty for the top of the page. */
  hash: string;
};

const LEGAL_PATH = /privacy|terms|disclaimer|legal|support|faq/;

/** The `#anchor` part of a link, without the "#". */
export function linkHash(href: string): string {
  const hashIndex = href.indexOf("#");
  return hashIndex >= 0 ? href.slice(hashIndex + 1).trim() : "";
}

function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "").toLowerCase();
}

/**
 * Maps a clicked site link to the page it opens inside a preview, where the
 * site's real paths don't exist. In-page anchors ("#pricing") stay on
 * `currentPage`; links to unknown pages or off-site URLs resolve to null.
 */
export function resolvePageLink<P extends LinkablePage>(
  pages: readonly P[],
  href: string,
  currentPage?: P,
): ResolvedPageLink<P> | null {
  const value = href.trim();
  if (!value || value === "#" || isOffsiteHref(value)) return null;

  const hash = linkHash(value);
  const path = value.split("#")[0].split("?")[0].trim();

  if (!path) return currentPage ? { page: currentPage, hash } : null;

  const target = normalizePath(path);
  const page =
    pages.find(
      (candidate) =>
        normalizePath(candidate.slug) === target ||
        candidate.name.toLowerCase() === target ||
        (candidate.id !== undefined && candidate.id === path),
    ) ??
    (LEGAL_PATH.test(target)
      ? pages.find((candidate) => candidate.slug === "/contact" || candidate.slug === "/about")
      : undefined);

  return page ? { page, hash } : null;
}

const YOUTUBE_ID = /^https:\/\/(?:(?:www\.|m\.)?youtube\.com\/watch\?v=([\w-]{6,20})|youtu\.be\/([\w-]{6,20}))/i;
const VIMEO_ID = /^https:\/\/(?:www\.)?vimeo\.com\/(\d{6,12})/i;

/**
 * Builds the iframe src for a YouTube or Vimeo page URL. Only ids are taken
 * from user input, so arbitrary embed URLs can never reach an iframe.
 */
export function videoEmbedUrl(url: string | undefined): string | null {
  const value = url?.trim() ?? "";
  const youtube = YOUTUBE_ID.exec(value);
  const youtubeId = youtube?.[1] ?? youtube?.[2];
  if (youtubeId) return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
  const vimeoId = VIMEO_ID.exec(value)?.[1];
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?dnt=1`;
  return null;
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
