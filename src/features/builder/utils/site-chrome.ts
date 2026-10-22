import {
  DEFAULT_SECTION_SETTINGS,
  type FooterData,
  type HeaderData,
  type Section,
} from "../../../site-kit/index.ts";

/** Canvas ids of the site-wide header and footer; they are never stored on a page. */
export const SITE_HEADER_ID = "site-header";
export const SITE_FOOTER_ID = "site-footer";

/**
 * Ids of a page's own header/footer, stored on that page in place of the site-wide one.
 * A hidden one means the page shows no header/footer at all.
 */
export const PAGE_HEADER_ID = "page-header";
export const PAGE_FOOTER_ID = "page-footer";

export type ChromeType = "header" | "footer";
/** "site": the shared header/footer; "page": this page's own copy; "none": nothing on this page. */
export type ChromeMode = "site" | "page" | "none";

type Chrome = { header: HeaderData; footer: FooterData };

const CHROME_TYPES: readonly ChromeType[] = ["header", "footer"];
const SITE_IDS: Record<ChromeType, string> = { header: SITE_HEADER_ID, footer: SITE_FOOTER_ID };
const PAGE_IDS: Record<ChromeType, string> = { header: PAGE_HEADER_ID, footer: PAGE_FOOTER_ID };

export function isChromeSection(section: { type: string }): boolean {
  return section.type === "header" || section.type === "footer";
}

export function isSiteChrome(section: { id: string; type: string }): boolean {
  return isChromeSection(section) && section.id === SITE_IDS[section.type as ChromeType];
}

function toChromeSection(type: ChromeType, id: string, value: HeaderData | FooterData): Section {
  const { settings, hidden, ...data } = value;
  return {
    id,
    type,
    hidden: Boolean(hidden),
    settings: { ...DEFAULT_SECTION_SETTINGS, ...settings },
    data,
  } as Section;
}

function fromChromeSection<T extends HeaderData | FooterData>(section: Section): T {
  const { settings: _settings, hidden: _hidden, ...data } = section.data as T;
  const value = { ...data, settings: section.settings } as T;
  if (section.hidden) value.hidden = true;
  return value;
}

function ownChrome(sections: readonly Section[], type: ChromeType): Section | undefined {
  return sections.find((section) => section.type === type && section.id === PAGE_IDS[type]);
}

/** A header/footer dragged onto the canvas: it carries the editor's generated id, not a site or page id. */
function droppedChrome(sections: readonly Section[], type: ChromeType): Section | undefined {
  return sections.find((section) => section.type === type && section.id !== SITE_IDS[type] && section.id !== PAGE_IDS[type]);
}

/** A new header/footer design keeps the site's name and logo. */
export function withSiteBrand(section: Section, chrome: Chrome): Section {
  if (!isChromeSection(section)) return section;
  const brand = chrome[section.type as ChromeType];
  const data = { ...(section.data as HeaderData | FooterData) };
  if (brand.logo && !data.logo) {
    data.logo = brand.logo;
    data.logoDisplay = brand.logoDisplay ?? "logo_only";
  }
  if (brand.siteName) data.siteName = brand.siteName;
  return { ...section, data } as Section;
}

export function pageChromeMode(sections: readonly Section[], type: ChromeType): ChromeMode {
  const own = ownChrome(sections, type);
  return !own ? "site" : own.hidden ? "none" : "page";
}

/** The header or footer a page shows on the canvas, or null when the page has none. */
function shownChrome(type: ChromeType, sections: readonly Section[], chrome: Chrome): Section | null {
  const own = ownChrome(sections, type);
  if (own) return own.hidden ? null : own;
  return toChromeSection(type, SITE_IDS[type], chrome[type]);
}

function around(header: Section | null | undefined, body: readonly Section[], footer: Section | null | undefined): Section[] {
  return [...(header ? [header] : []), ...body, ...(footer ? [footer] : [])];
}

/** A page's canvas: its header (own or site-wide), its body sections, then its footer. */
export function withSiteChrome(sections: readonly Section[], chrome: Chrome): Section[] {
  return around(
    shownChrome("header", sections, chrome),
    sections.filter((section) => !isChromeSection(section)),
    shownChrome("footer", sections, chrome),
  );
}

/**
 * Splits canvas sections into the page's stored sections and the site-wide header/footer.
 * Which header/footer the page uses comes from `pageSections`, never from the canvas, so a
 * header briefly missing from the canvas changes nothing; `setPageChrome` is how it switches.
 * A header/footer dropped onto the canvas replaces the one the page shows, like adding it from the panel:
 * the page's own when it has one (or has none at all), otherwise the site-wide one.
 */
export function splitSiteChrome(
  sections: readonly Section[],
  current: Chrome,
  pageSections: readonly Section[] = [],
): Chrome & { body: Section[] } {
  let { header, footer } = current;
  const own: Partial<Record<ChromeType, Section>> = {};
  for (const type of CHROME_TYPES) {
    const stored = ownChrome(pageSections, type);
    const dropped = droppedChrome(sections, type);
    if (dropped) {
      const design = withSiteBrand(dropped, current);
      if (stored) own[type] = { ...design, id: PAGE_IDS[type], hidden: false } as Section;
      else if (type === "header") header = fromChromeSection<HeaderData>(design);
      else footer = fromChromeSection<FooterData>(design);
      continue;
    }
    const shown = sections.find((section) => section.type === type && section.id === (stored ? PAGE_IDS[type] : SITE_IDS[type]));
    if (stored) {
      own[type] = !stored.hidden && shown?.id === PAGE_IDS[type] ? shown : stored;
    } else if (shown?.id === SITE_IDS[type]) {
      if (type === "header") header = fromChromeSection<HeaderData>(shown);
      else footer = fromChromeSection<FooterData>(shown);
    }
  }
  return {
    header,
    footer,
    body: around(own.header, sections.filter((section) => !isChromeSection(section)), own.footer),
  };
}

/** Page sections switched to the site header/footer, a page-only copy, or none. `seed` replaces the copy's content. */
export function setPageChrome(
  sections: readonly Section[],
  type: ChromeType,
  mode: ChromeMode,
  chrome: Chrome,
  seed?: Section,
): Section[] {
  const rest = sections.filter((section) => !(section.type === type && section.id === PAGE_IDS[type]));
  if (mode === "site") return rest;
  const base = seed ?? ownChrome(sections, type) ?? toChromeSection(type, PAGE_IDS[type], chrome[type]);
  const own = { ...base, id: PAGE_IDS[type], hidden: mode === "none" } as Section;
  return type === "header" ? [own, ...rest] : [...rest, own];
}

/**
 * The header/footer the canvas should show for a page, when the canvas doesn't show exactly
 * those (one each, same content); null when it already does. A dropped header/footer stays
 * until the page shows its design (see `splitSiteChrome`), so tidying never discards it.
 */
export function canvasChromeFix(
  canvas: readonly Section[],
  pageSections: readonly Section[],
  chrome: Chrome,
): Record<ChromeType, Section | null> | null {
  const expected = {
    header: shownChrome("header", pageSections, chrome),
    footer: shownChrome("footer", pageSections, chrome),
  };
  const matches = CHROME_TYPES.every((type) => {
    const shown = canvas.filter((section) => section.type === type);
    const want = expected[type];
    if (!want) return shown.length === 0;
    return shown.length === 1 && shown[0]!.id === want.id && sameChrome(shown[0]!, fromChromeSection(want));
  });
  if (matches) return null;
  const pending = CHROME_TYPES.some((type) => {
    const dropped = droppedChrome(canvas, type);
    if (!dropped) return false;
    const want = expected[type];
    if (!want) return true;
    const design = toChromeSection(type, want.id, fromChromeSection(withSiteBrand(dropped, chrome)));
    return !sameChrome(design, fromChromeSection(want));
  });
  return pending ? null : expected;
}

/** True when the canvas header/footer section shows exactly the given header/footer. */
export function sameChrome(section: Section, value: HeaderData | FooterData): boolean {
  const expected = toChromeSection(section.type as ChromeType, section.id, value);
  return stableJson(fromChromeSection(section)) === stableJson(fromChromeSection(expected));
}

/** JSON with object keys sorted, so equal values compare equal whatever order their keys were written in. */
export function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : item,
  );
}

/**
 * Drafts saved before the header and footer became site-wide kept a copy on every page: the home
 * page's copy (or the first one found) becomes the site header/footer and the copies are dropped.
 * A page's own header/footer (see `PAGE_HEADER_ID`) is not a copy and stays on its page.
 */
export function liftSiteChrome<P extends { slug: string; pageType?: string; sections: Section[] }>(
  content: Chrome & { pages: P[] },
): Chrome & { pages: P[] } {
  const isCopy = (section: Section) => isChromeSection(section) && section.id !== PAGE_IDS[section.type as ChromeType];
  if (!content.pages.some((page) => page.sections.some(isCopy))) return content;
  const isHome = (page: P) => page.pageType === "HOME" || page.slug === "/";
  const copies = [...content.pages.filter(isHome), ...content.pages.filter((page) => !isHome(page))]
    .flatMap((page) => page.sections)
    .filter(isCopy);
  const merge = <T extends HeaderData | FooterData>(base: T, copy: Section | undefined): T => {
    if (!copy) return base;
    const value = { ...base, ...fromChromeSection<T>(copy) };
    if (!copy.hidden) delete value.hidden;
    return value;
  };
  return {
    header: merge(content.header, copies.find((section) => section.type === "header")),
    footer: merge(content.footer, copies.find((section) => section.type === "footer")),
    pages: content.pages.map((page) =>
      page.sections.some(isCopy) ? { ...page, sections: page.sections.filter((section) => !isCopy(section)) } : page,
    ),
  };
}
