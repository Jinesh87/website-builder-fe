import { describe, expect, it } from "vitest";
import { isOffsiteHref, resolvePageLink } from "../links.ts";
import type { SiteData } from "../types.ts";
import { getTemplateSite } from "./index.ts";

const TEMPLATE_IDS = Array.from({ length: 24 }, (_, index) => String(2134 + index));

function collectHrefs(value: unknown, hrefs: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) collectHrefs(item, hrefs);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (key === "href" && typeof item === "string") hrefs.push(item);
      else collectHrefs(item, hrefs);
    }
  }
  return hrefs;
}

/** Internal links that don't open a page, or point at an anchor the page doesn't have. */
function brokenLinks(site: SiteData): string[] {
  const broken = new Set<string>();
  for (const page of site.pages) {
    for (const href of collectHrefs(page.sections.map((section) => section.data))) {
      if (href === "#" || isOffsiteHref(href)) continue;
      const target = resolvePageLink(site.pages, href, page);
      const anchors = target?.page.sections.map((section) => section.settings.anchor);
      if (!target || (target.hash && !anchors?.includes(target.hash))) broken.add(`${page.slug} -> ${href}`);
    }
  }
  return [...broken];
}

describe("prebuilt templates", () => {
  it.each(TEMPLATE_IDS)("template %s links only to pages and sections it has", (id) => {
    const site = getTemplateSite(id);
    expect(site).not.toBeNull();
    expect(brokenLinks(site as SiteData)).toEqual([]);
  });
});
