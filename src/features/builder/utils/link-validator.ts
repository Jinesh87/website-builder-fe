import type { HeaderMenuItem, Section } from "../../../site-kit/index.ts";
import type { WebsitePage } from "../../../api/websites.ts";
import type { CreatedPageEdit } from "../schema/editor-document.ts";

/**
 * Normalizes a page slug to standard format: starts with "/", lowercase, kebab-case, no trailing slash.
 */
export function normalizeSlug(raw: string): string {
  if (!raw || raw.trim() === "" || raw === "/") return "/";
  const trimmed = raw.trim().toLowerCase();
  const withoutLeadingOrTrailing = trimmed.replace(/^\/+|\/+$/g, "");
  const slugified = withoutLeadingOrTrailing
    .replace(/[^a-z0-9\-_/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `/${slugified}`;
}

/**
 * Checks if a URL is an external link (http, mailto, tel, anchor-only).
 */
export function isExternalOrAnchor(href: string): boolean {
  if (!href) return false;
  const trimmed = href.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/api/") ||
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    /\.(pdf|doc|docx|zip|csv|xlsx|png|jpe?g|webp|svg)($|\?)/i.test(trimmed)
  );
}

/**
 * Builds a set of all canonical known route slugs for a website draft.
 */
export function getKnownRoutes(
  pages: readonly { slug: string }[],
  createdPages: readonly { slug: string }[] = [],
): Set<string> {
  const routes = new Set<string>(["/"]);
  for (const page of pages) {
    routes.add(normalizeSlug(page.slug));
  }
  for (const page of createdPages) {
    routes.add(normalizeSlug(page.slug));
  }
  return routes;
}

/**
 * Finds the closest matching valid internal slug for a candidate href.
 */
export function resolveInternalLink(candidateHref: string, validRoutes: Set<string>): string {
  if (!candidateHref || candidateHref === "#" || isExternalOrAnchor(candidateHref)) {
    return candidateHref;
  }

  const normalized = normalizeSlug(candidateHref);
  if (validRoutes.has(normalized)) {
    return normalized;
  }

  // Check case-insensitive or without slash
  for (const route of validRoutes) {
    if (route.toLowerCase() === normalized.toLowerCase()) {
      return route;
    }
  }

  // Check matching without prefixes or subpaths
  const bareCandidate = normalized.replace(/^\//, "");
  for (const route of validRoutes) {
    const bareRoute = route.replace(/^\//, "");
    if (bareRoute && (bareCandidate.includes(bareRoute) || bareRoute.includes(bareCandidate))) {
      return route;
    }
  }

  // If no match found, keep normalized slug if it is a valid format, or fallback to root
  return normalized || "/";
}

/**
 * Ensures unique slugs for newly created pages to prevent routing collisions with existing pages.
 */
export function ensureUniqueSlugs(
  existingPages: readonly WebsitePage[],
  newPages: readonly CreatedPageEdit[],
): CreatedPageEdit[] {
  const existingSlugs = new Set(existingPages.map((p) => normalizeSlug(p.slug)));
  const existingIds = new Set(existingPages.map((p) => p.id));

  return newPages.map((page) => {
    let baseSlug = normalizeSlug(page.slug || page.name);
    if (baseSlug === "/") baseSlug = "/page";
    let uniqueSlug = baseSlug;
    let counter = 2;

    while (existingSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    existingSlugs.add(uniqueSlug);

    let id = page.id;
    if (!id || existingIds.has(id)) {
      id = crypto.randomUUID();
    }
    existingIds.add(id);

    return {
      ...page,
      id,
      slug: uniqueSlug,
    };
  });
}

/**
 * Recursively inspects and sanitizes internal links inside section data so all CTA buttons,
 * menu items, cards, and banners point to valid pages.
 */
export function sanitizeSectionLinks(section: Section, validRoutes: Set<string>): Section {
  if (!section.data || typeof section.data !== "object") return section;

  const sanitizeValue = (val: unknown): unknown => {
    if (val === null || val === undefined) return val;
    if (Array.isArray(val)) {
      return val.map(sanitizeValue);
    }
    if (typeof val === "object") {
      const copy: Record<string, unknown> = { ...(val as Record<string, unknown>) };
      if (typeof copy.href === "string") {
        copy.href = resolveInternalLink(copy.href, validRoutes);
      }
      if (typeof copy.link === "string") {
        copy.link = resolveInternalLink(copy.link, validRoutes);
      }
      if (copy.cta && typeof copy.cta === "object" && typeof (copy.cta as Record<string, unknown>).href === "string") {
        (copy.cta as Record<string, unknown>).href = resolveInternalLink(
          (copy.cta as Record<string, unknown>).href as string,
          validRoutes,
        );
      }
      for (const [k, v] of Object.entries(copy)) {
        if (k !== "href" && k !== "link" && k !== "cta") {
          copy[k] = sanitizeValue(v);
        }
      }
      return copy;
    }
    return val;
  };

  return {
    ...section,
    data: sanitizeValue(section.data) as unknown as Section["data"],
  } as Section;
}

/**
 * Validates and reconciles header navigation menu items against existing pages and valid routes.
 */
export function reconcileHeaderMenu(
  menuItems: readonly HeaderMenuItem[],
  validRoutes: Set<string>,
): HeaderMenuItem[] {
  return menuItems.map((item) => {
    const resolvedHref = resolveInternalLink(item.href, validRoutes);
    const children = item.children
      ? item.children.map((child) => ({
          ...child,
          href: resolveInternalLink(child.href, validRoutes),
        }))
      : undefined;

    return {
      ...item,
      href: resolvedHref,
      children,
    };
  });
}
