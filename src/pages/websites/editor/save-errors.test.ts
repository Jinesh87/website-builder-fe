import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, createSection } from "../../../site-kit/index.ts";
import type { EditorDraft } from "./editor-state.ts";
import { describeIssue } from "./save-errors.ts";

const LINK_MESSAGE = "Enter a valid link, like /contact, https://example.com, #section, mailto: or tel:";

const hero = createSection("hero");

const draft: EditorDraft = {
  theme: DEFAULT_THEME,
  header: { design: "logo-left", siteName: "WPC Board", sticky: false, menu: [] },
  footer: { design: "simple", siteName: "WPC Board", columns: [], social: [], copyright: "" },
  pages: [
    {
      id: "page-home",
      name: "Home",
      slug: "/",
      pageType: "HOME",
      visible: true,
      showInNav: true,
      seoTitle: null,
      seoDescription: null,
      seoKeywords: [],
      sections: [hero],
    },
  ],
};

describe("describeIssue", () => {
  it("names the slide and button of an invalid hero link", () => {
    const issue = describeIssue(draft, {
      message: LINK_MESSAGE,
      path: ["pages", 0, "sections", 0, "data", "carouselSlides", 2, "button", "href"],
    });
    expect(issue).toEqual({
      message: `Home › Hero › Slide 3 › Button › Link: ${LINK_MESSAGE}`,
      pageId: "page-home",
      selection: { kind: "section", sectionId: hero.id },
    });
  });

  it("turns CTA keys into button names", () => {
    const issue = describeIssue(draft, {
      message: LINK_MESSAGE,
      path: ["pages", 0, "sections", 0, "data", "primaryCta", "href"],
    });
    expect(issue.message).toBe(`Home › Hero › Primary button › Link: ${LINK_MESSAGE}`);
  });

  it("rewrites built-in Joi messages around the field name", () => {
    const issue = describeIssue(draft, {
      message: '"label" is not allowed to be empty',
      path: ["pages", 0, "sections", 0, "data", "secondaryCta", "label"],
    });
    expect(issue.message).toBe("Home › Hero › Secondary button: Text is not allowed to be empty");
  });

  it("describes site-wide header issues", () => {
    const issue = describeIssue(draft, {
      message: LINK_MESSAGE,
      path: ["header", "menu", 1, "children", 0, "href"],
    });
    expect(issue).toEqual({
      message: `Header › Menu item 2 › Submenu item 1 › Link: ${LINK_MESSAGE}`,
      selection: { kind: "header" },
    });
  });

  it("describes page settings issues", () => {
    const issue = describeIssue(draft, {
      message: '"slug" is not allowed to be empty',
      path: ["pages", 0, "slug"],
    });
    expect(issue).toEqual({
      message: "Home: Slug is not allowed to be empty",
      pageId: "page-home",
      selection: { kind: "page" },
    });
  });
});
