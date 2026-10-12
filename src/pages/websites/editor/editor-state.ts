import type { SaveDraftInput, WebsiteDetail, WebsitePage } from "../../../api/websites.ts";
import type { FooterData, HeaderData, LinkRef, Section, ThemeSettings } from "../../../site-kit/index.ts";

export type EditorDraft = {
  theme: ThemeSettings;
  header: HeaderData;
  footer: FooterData;
  pages: WebsitePage[];
};

export type Selection =
  | { kind: "section"; sectionId: string }
  | { kind: "page" }
  | { kind: "header" }
  | { kind: "footer" }
  | { kind: "theme" };

/** Limits mirrored from the backend validators. */
export const LIMITS = { pages: 50, sectionsPerPage: 60, menuLinks: 12 } as const;

export const PAGE_SLUG_PATTERN = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/;

export function draftFromWebsite(website: WebsiteDetail): EditorDraft {
  const { theme, header, footer, pages } = website.draft;
  return { theme, header, footer, pages };
}

export function toSaveInput(draft: EditorDraft, expectedDraftUpdatedAt: string): SaveDraftInput {
  return { expectedDraftUpdatedAt, ...draft };
}

export function moveItem<T>(items: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  return next;
}

export function homePage(pages: WebsitePage[]): WebsitePage | undefined {
  return pages.find((page) => page.slug === "/") ?? pages[0];
}

export function updatePage(draft: EditorDraft, pageId: string, update: (page: WebsitePage) => WebsitePage): EditorDraft {
  return { ...draft, pages: draft.pages.map((page) => (page.id === pageId ? update(page) : page)) };
}

export function updateSections(
  draft: EditorDraft,
  pageId: string,
  update: (sections: Section[]) => Section[],
): EditorDraft {
  return updatePage(draft, pageId, (page) => ({ ...page, sections: update(page.sections) }));
}

export function duplicateSection(section: Section): Section {
  return { ...structuredClone(section), id: crypto.randomUUID() };
}

export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return `/${slug || "page"}`;
}

function uniqueSlug(base: string, pages: WebsitePage[], ignoreId?: string): string {
  const taken = new Set(pages.filter((page) => page.id !== ignoreId).map((page) => page.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/** Rewrites every `href` equal to `from` anywhere in the value (menus, buttons, section links). */
function replaceHref<T>(value: T, from: string, to: string): T {
  if (Array.isArray(value)) return value.map((item) => replaceHref(item, from, to)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, key === "href" && item === from ? to : replaceHref(item, from, to)]),
    ) as T;
  }
  return value;
}

function withoutHref(links: LinkRef[], href: string): LinkRef[] {
  return links.filter((link) => link.href !== href);
}

function removeNavLinks(draft: EditorDraft, href: string): EditorDraft {
  return {
    ...draft,
    header: { ...draft.header, menu: withoutHref(draft.header.menu, href) },
    footer: {
      ...draft.footer,
      columns: draft.footer.columns.map((column) => ({ ...column, links: withoutHref(column.links, href) })),
    },
  };
}

function addMenuLink(header: HeaderData, link: LinkRef): HeaderData {
  if (header.menu.some((item) => item.href === link.href) || header.menu.length >= LIMITS.menuLinks) return header;
  return { ...header, menu: [...header.menu, link] };
}

export function addPage(draft: EditorDraft, name: string): { draft: EditorDraft; pageId: string } {
  const trimmed = name.trim() || "New page";
  const page: WebsitePage = {
    id: crypto.randomUUID(),
    name: trimmed,
    slug: uniqueSlug(slugify(trimmed), draft.pages),
    pageType: "CUSTOM",
    visible: true,
    showInNav: true,
    seoTitle: null,
    seoDescription: null,
    seoKeywords: [],
    sections: [],
  };
  return {
    pageId: page.id,
    draft: {
      ...draft,
      header: addMenuLink(draft.header, { label: page.name, href: page.slug }),
      pages: [...draft.pages, page],
    },
  };
}

export type PageMetaPatch = Partial<
  Pick<WebsitePage, "name" | "slug" | "visible" | "showInNav" | "seoTitle" | "seoDescription" | "seoKeywords">
>;

/** Applies page settings and keeps the header menu and every link to the page in step. */
export function updatePageMeta(draft: EditorDraft, pageId: string, patch: PageMetaPatch): EditorDraft {
  const before = draft.pages.find((page) => page.id === pageId);
  if (!before) return draft;
  const after = { ...before, ...patch };
  let next = updatePage(draft, pageId, () => after);

  if (after.slug !== before.slug) {
    next = replaceHref(next, before.slug, after.slug);
  }
  if (after.name !== before.name) {
    next = {
      ...next,
      header: {
        ...next.header,
        menu: next.header.menu.map((link) =>
          link.href === after.slug && link.label === before.name ? { ...link, label: after.name } : link,
        ),
      },
    };
  }
  if (after.showInNav !== before.showInNav) {
    next = after.showInNav
      ? { ...next, header: addMenuLink(next.header, { label: after.name, href: after.slug }) }
      : { ...next, header: { ...next.header, menu: withoutHref(next.header.menu, after.slug) } };
  }
  return next;
}

export function deletePage(draft: EditorDraft, pageId: string): EditorDraft {
  const page = draft.pages.find((candidate) => candidate.id === pageId);
  if (!page || page.slug === "/") return draft;
  return removeNavLinks({ ...draft, pages: draft.pages.filter((candidate) => candidate.id !== pageId) }, page.slug);
}

/** Header menu rebuilt from the pages marked "show in menu", in page order. */
export function menuFromPages(pages: WebsitePage[]): LinkRef[] {
  return pages
    .filter((page) => page.showInNav && page.visible)
    .slice(0, LIMITS.menuLinks)
    .map((page) => ({ label: page.name, href: page.slug }));
}
