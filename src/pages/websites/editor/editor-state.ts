import type { SaveDraftInput, WebsiteDetail, WebsitePage } from "../../../api/websites.ts";
import type { ContactData, FooterData, HeaderData, HeaderMenuItem, LinkRef, Section, ThemeSettings } from "../../../site-kit/index.ts";
import { getTemplateSite } from "../../../site-kit/templates/index.ts";
import { liftSiteChrome } from "../../../features/builder/utils/site-chrome.ts";

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
  let { theme, header, footer, pages } = website.draft;

  const templateKey =
    pages.find((p) => p.templateKey)?.templateKey ??
    (website as unknown as { templateKey?: string }).templateKey;
  const templateSite = templateKey ? getTemplateSite(templateKey) : null;

  if (templateSite) {
    if (!header.logo?.url && templateSite.header.logo) {
      header = {
        ...header,
        logo: templateSite.header.logo,
        logoDisplay: header.logoDisplay ?? templateSite.header.logoDisplay ?? "logo_only",
      };
    }
    if (!footer.logo?.url && templateSite.footer.logo) {
      footer = {
        ...footer,
        logo: templateSite.footer.logo,
        logoDisplay: footer.logoDisplay ?? templateSite.footer.logoDisplay ?? "logo_only",
      };
    }

    pages = pages.map((page) => ({
      ...page,
      sections: page.sections.map((sec) => {
        if (sec.type === "header") {
          const secHeader = (sec.data || {}) as HeaderData;
          if (!secHeader.logo?.url && templateSite.header.logo) {
            return {
              ...sec,
              data: {
                ...secHeader,
                logo: templateSite.header.logo,
                logoDisplay: secHeader.logoDisplay ?? templateSite.header.logoDisplay ?? "logo_only",
              },
            };
          }
        }
        if (sec.type === "footer") {
          const secFooter = (sec.data || {}) as FooterData;
          if (!secFooter.logo?.url && templateSite.footer.logo) {
            return {
              ...sec,
              data: {
                ...secFooter,
                logo: templateSite.footer.logo,
                logoDisplay: secFooter.logoDisplay ?? templateSite.footer.logoDisplay ?? "logo_only",
              },
            };
          }
        }
        return sec;
      }),
    }));
  }

  if (footer.columns?.length) {
    footer = {
      ...footer,
      columns: footer.columns.map((col) => ({
        ...col,
        links: col.links.map((link) => ({
          ...link,
          label: link.label?.replace(/^\[(.*)\]$/, "$1") ?? link.label,
        })),
      })),
    };
  }

  pages = pages.map((page) => ({
    ...page,
    sections: page.sections.map((sec) => {
      if (sec.type === "contact" && sec.data) {
        const cData = sec.data as ContactData;
        const cleanField = (val: string | undefined) => (typeof val === "string" ? val.replace(/^\[(.*)\]$/, "$1") : val);
        return {
          ...sec,
          data: {
            ...cData,
            email: cleanField(cData.email),
            phone: cleanField(cData.phone),
            address: cleanField(cData.address),
            officeHours: cleanField(cData.officeHours),
            socialLinksText:
              typeof cData.socialLinksText === "string"
                ? cData.socialLinksText.replace(/[[\]]/g, "")
                : cData.socialLinksText,
          } as ContactData,
        };
      }
      return sec;
    }),
  }));

  return { theme, ...liftSiteChrome({ header, footer, pages }) };
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

function isSameHref(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const normA = a === "/" || a === "" ? "/" : a.replace(/\/+$/, "");
  const normB = b === "/" || b === "" ? "/" : b.replace(/\/+$/, "");
  return normA === normB;
}

function withoutHref(links: LinkRef[], href: string): LinkRef[] {
  return links.filter((link) => !isSameHref(link.href, href));
}

function syncHeaderMenu(
  header: HeaderData,
  page: Pick<WebsitePage, "name" | "slug">,
  action: "add" | "remove" | "rename",
  oldName?: string,
): HeaderData {
  const currentMenu: HeaderMenuItem[] = Array.isArray(header.menu) ? header.menu : [];

  if (action === "rename" && oldName) {
    const updated = currentMenu.map((item) => {
      let nextItem = item;
      if (isSameHref(item.href, page.slug) && (item.label === oldName || item.label === page.name)) {
        nextItem = { ...nextItem, label: page.name };
      }
      if (Array.isArray(item.children) && item.children.length > 0) {
        const nextChildren = item.children.map((child) =>
          isSameHref(child.href, page.slug) && (child.label === oldName || child.label === page.name)
            ? { ...child, label: page.name }
            : child,
        );
        nextItem = { ...nextItem, children: nextChildren };
      }
      return nextItem;
    });
    return { ...header, menu: updated };
  }

  if (action === "remove") {
    const updated = currentMenu
      .filter((item) => !isSameHref(item.href, page.slug))
      .map((item) => {
        if (Array.isArray(item.children) && item.children.length > 0) {
          return {
            ...item,
            children: item.children.filter((child) => !isSameHref(child.href, page.slug)),
          };
        }
        return item;
      });
    return { ...header, menu: updated };
  }

  if (action === "add") {
    const exists = currentMenu.some(
      (item) =>
        isSameHref(item.href, page.slug) ||
        (Array.isArray(item.children) && item.children.some((child) => isSameHref(child.href, page.slug))),
    );
    if (!exists && currentMenu.length < LIMITS.menuLinks) {
      const isHome = page.slug === "/" || page.slug === "";
      const newItem: HeaderMenuItem = { label: page.name, href: page.slug };
      const updatedMenu = isHome ? [newItem, ...currentMenu] : [...currentMenu, newItem];
      return {
        ...header,
        menu: updatedMenu,
      };
    }
    return header;
  }

  return header;
}

function syncHeaderAcrossDraft(
  draft: EditorDraft,
  syncFn: (header: HeaderData) => HeaderData,
): EditorDraft {
  const nextHeader = syncFn(draft.header);
  const nextPages = draft.pages.map((p) => {
    const hasHeaderSection = p.sections.some((s) => s.type === "header");
    if (!hasHeaderSection) return p;
    return {
      ...p,
      sections: p.sections.map((s) => {
        if (s.type !== "header") return s;
        return {
          ...s,
          data: syncFn((s.data || {}) as HeaderData),
        };
      }),
    };
  });
  return {
    ...draft,
    header: nextHeader,
    pages: nextPages,
  };
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
  const draftWithPage: EditorDraft = {
    ...draft,
    pages: [...draft.pages, page],
  };
  const finalDraft = syncHeaderAcrossDraft(draftWithPage, (h) => syncHeaderMenu(h, page, "add"));
  return {
    pageId: page.id,
    draft: finalDraft,
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
    next = syncHeaderAcrossDraft(next, (h) => syncHeaderMenu(h, after, "rename", before.name));
  }

  if (after.showInNav !== before.showInNav) {
    next = after.showInNav
      ? syncHeaderAcrossDraft(next, (h) => syncHeaderMenu(h, after, "add"))
      : syncHeaderAcrossDraft(next, (h) => syncHeaderMenu(h, after, "remove"));
  }

  if (after.visible !== before.visible) {
    if (!after.visible) {
      next = syncHeaderAcrossDraft(next, (h) => syncHeaderMenu(h, after, "remove"));
    } else if (after.showInNav) {
      next = syncHeaderAcrossDraft(next, (h) => syncHeaderMenu(h, after, "add"));
    }
  }

  return next;
}

export function deletePage(draft: EditorDraft, pageId: string): EditorDraft {
  const page = draft.pages.find((candidate) => candidate.id === pageId);
  if (!page || page.slug === "/") return draft;
  const withoutPage: EditorDraft = {
    ...draft,
    pages: draft.pages.filter((candidate) => candidate.id !== pageId),
  };
  const synced = syncHeaderAcrossDraft(withoutPage, (h) => syncHeaderMenu(h, page, "remove"));
  return removeNavLinks(synced, page.slug);
}

/** Header menu rebuilt from the pages marked "show in menu", in page order. */
export function menuFromPages(pages: WebsitePage[]): LinkRef[] {
  return pages
    .filter((page) => page.showInNav && page.visible)
    .slice(0, LIMITS.menuLinks)
    .map((page) => ({ label: page.name, href: page.slug }));
}
