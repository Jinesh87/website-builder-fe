import {
  DEFAULT_SECTION_SETTINGS,
  type FooterData,
  type HeaderData,
  type Section,
} from "../../../site-kit/index.ts";

/** Canvas ids of the site-wide header and footer; they are never stored on a page. */
export const SITE_HEADER_ID = "site-header";
export const SITE_FOOTER_ID = "site-footer";

type Chrome = { header: HeaderData; footer: FooterData };

export function isChromeSection(section: { type: string }): boolean {
  return section.type === "header" || section.type === "footer";
}

function toChromeSection(type: "header" | "footer", id: string, value: HeaderData | FooterData): Section {
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

/** The site-wide header and footer as canvas sections around a page's own (body) sections. */
export function withSiteChrome(sections: readonly Section[], chrome: Chrome): Section[] {
  return [
    toChromeSection("header", SITE_HEADER_ID, chrome.header),
    ...sections.filter((section) => !isChromeSection(section)),
    toChromeSection("footer", SITE_FOOTER_ID, chrome.footer),
  ];
}

/**
 * Splits canvas sections into the page's own sections and the site-wide header/footer.
 * A header or footer missing from the canvas leaves the site's one unchanged, so clearing
 * a page never removes the header from every other page; hiding it is the way to turn it off.
 */
export function splitSiteChrome(sections: readonly Section[], current: Chrome): Chrome & { body: Section[] } {
  const header = sections.find((section) => section.type === "header");
  const footer = sections.find((section) => section.type === "footer");
  return {
    body: sections.filter((section) => !isChromeSection(section)),
    header: header ? fromChromeSection<HeaderData>(header) : current.header,
    footer: footer ? fromChromeSection<FooterData>(footer) : current.footer,
  };
}

/** True when the canvas header/footer section shows exactly the site's header/footer. */
export function sameChrome(section: Section, value: HeaderData | FooterData): boolean {
  const expected = toChromeSection(section.type as "header" | "footer", section.id, value);
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
 */
export function liftSiteChrome<P extends { slug: string; pageType?: string; sections: Section[] }>(
  content: Chrome & { pages: P[] },
): Chrome & { pages: P[] } {
  if (!content.pages.some((page) => page.sections.some(isChromeSection))) return content;
  const isHome = (page: P) => page.pageType === "HOME" || page.slug === "/";
  const sections = [...content.pages.filter(isHome), ...content.pages.filter((page) => !isHome(page))].flatMap(
    (page) => page.sections,
  );
  const lifted = splitSiteChrome(sections, content);
  const merge = <T extends HeaderData | FooterData>(base: T, copy: T): T => {
    if (copy === base) return base;
    const value = { ...base, ...copy };
    if (!copy.hidden) delete value.hidden;
    return value;
  };
  return {
    header: merge(content.header, lifted.header),
    footer: merge(content.footer, lifted.footer),
    pages: content.pages.map((page) =>
      page.sections.some(isChromeSection)
        ? { ...page, sections: page.sections.filter((section) => !isChromeSection(section)) }
        : page,
    ),
  };
}
