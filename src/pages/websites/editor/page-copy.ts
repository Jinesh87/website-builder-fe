import type { WebsitePage } from "../../../api/websites.ts";
import { duplicateSection, slugify, uniqueSlug, type EditorDraft } from "./editor-state.ts";

export function copyName(page: WebsitePage): string {
  return `${page.name} copy`.slice(0, 120);
}

/**
 * Copies a page with all its sections, placed right after the original. The copy is a normal page
 * with its own address, kept out of the menu so it can be linked from a button or card instead.
 */
export function duplicatePage(draft: EditorDraft, pageId: string, name: string): { draft: EditorDraft; pageId: string } | null {
  const index = draft.pages.findIndex((page) => page.id === pageId);
  const source = draft.pages[index];
  if (!source) return null;

  const pageName = name.trim() || copyName(source);
  const page: WebsitePage = {
    ...structuredClone(source),
    id: crypto.randomUUID(),
    name: pageName,
    slug: uniqueSlug(slugify(pageName), draft.pages),
    // A copy of the home page (or a contact/blog page) is just another page.
    pageType: "CUSTOM",
    showInNav: false,
    // Its own name becomes the browser title until one is set.
    seoTitle: null,
    sections: source.sections.map(duplicateSection),
  };

  const pages = [...draft.pages];
  pages.splice(index + 1, 0, page);
  return { draft: { ...draft, pages }, pageId: page.id };
}
