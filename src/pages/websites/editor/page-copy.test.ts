import { describe, expect, it } from "vitest";
import type { WebsitePage } from "../../../api/websites.ts";
import { DEFAULT_THEME, type Section } from "../../../site-kit/index.ts";
import type { EditorDraft } from "./editor-state.ts";
import { duplicatePage } from "./page-copy.ts";

const page = (id: string, name: string, slug: string, extra: Partial<WebsitePage> = {}): WebsitePage => ({
  id,
  name,
  slug,
  pageType: "CUSTOM",
  visible: true,
  showInNav: true,
  seoTitle: null,
  seoDescription: null,
  seoKeywords: [],
  sections: [],
  ...extra,
});

const section = (id: string, text: string) => ({ id, type: "text", data: { body: text } }) as unknown as Section;

const draft = (): EditorDraft => ({
  theme: DEFAULT_THEME,
  header: { design: "minimalist", siteName: "Shop", sticky: true, menu: [{ label: "Home", href: "/" }] },
  footer: { design: "simple", siteName: "Shop", columns: [], social: [], copyright: "" },
  pages: [
    page("home", "Home", "/", { pageType: "HOME", seoTitle: "Shop home", sections: [section("s1", "Welcome")] }),
    page("product", "5 Layer Board", "/5-layer-board", { seoDescription: "Strong boards", sections: [section("s2", "Specs")] }),
    page("contact", "Contact", "/contact"),
  ],
});

describe("duplicatePage", () => {
  it("copies the sections into a new page right after the original, with a fresh address and ids", () => {
    const result = duplicatePage(draft(), "product", "3 Layer Board")!;
    const pages = result.draft.pages;

    expect(pages.map((p) => p.slug)).toEqual(["/", "/5-layer-board", "/3-layer-board", "/contact"]);
    const copy = pages[2]!;
    expect(copy.id).toBe(result.pageId);
    expect(copy.id).not.toBe("product");
    expect(copy).toMatchObject({ name: "3 Layer Board", pageType: "CUSTOM", showInNav: false, visible: true, seoDescription: "Strong boards" });
    expect(copy.sections).toHaveLength(1);
    expect(copy.sections[0]!.id).not.toBe("s2");
    expect(copy.sections[0]!.data).toEqual({ body: "Specs" });
  });

  it("edits to the copy never reach the original", () => {
    const original = draft();
    const result = duplicatePage(original, "product", "Copy")!;
    (result.draft.pages[2]!.sections[0]!.data as { body: string }).body = "Changed";
    expect(result.draft.pages[1]!.sections[0]!.data).toEqual({ body: "Specs" });
  });

  it("turns a home page copy into a normal page and keeps slugs unique", () => {
    const first = duplicatePage(draft(), "home", "")!;
    const home = first.draft.pages[1]!;
    expect(home).toMatchObject({ name: "Home copy", slug: "/home-copy", pageType: "CUSTOM", seoTitle: null });

    const second = duplicatePage(first.draft, "home", "")!;
    expect(second.draft.pages.filter((p) => p.name === "Home copy").map((p) => p.slug)).toEqual(["/home-copy-2", "/home-copy"]);
    expect(second.draft.header).toEqual(draft().header);
  });

  it("returns null for an unknown page", () => {
    expect(duplicatePage(draft(), "missing", "x")).toBeNull();
  });
});
