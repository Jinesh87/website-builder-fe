import { describe, expect, it } from "vitest";
import { DEFAULT_SECTION_SETTINGS, type FooterData, type HeaderData, type Section } from "../../../site-kit/index.ts";
import {
  SITE_FOOTER_ID,
  SITE_HEADER_ID,
  liftSiteChrome,
  sameChrome,
  splitSiteChrome,
  stableJson,
  withSiteChrome,
} from "./site-chrome.ts";

const header: HeaderData = {
  design: "logo-left",
  siteName: "Taqueria",
  menu: [{ label: "Home", href: "/" }],
  sticky: false,
};
const footer: FooterData = { design: "columns", siteName: "Taqueria", columns: [], social: [], copyright: "© Taqueria" };
const hero = {
  id: "hero-1",
  type: "hero",
  hidden: false,
  settings: { ...DEFAULT_SECTION_SETTINGS },
  data: { variant: "centered", heading: "Hola" },
} as Section;

describe("site chrome", () => {
  it("puts the site header first and footer last around the page body", () => {
    const sections = withSiteChrome([hero], { header, footer });
    expect(sections.map((s) => s.id)).toEqual([SITE_HEADER_ID, "hero-1", SITE_FOOTER_ID]);
    expect(sections[0]?.data).toEqual(header);
    expect(sections[0]?.settings).toEqual(DEFAULT_SECTION_SETTINGS);
  });

  it("drops header/footer copies stored on the page", () => {
    const stray = { ...hero, id: "old-header", type: "header", data: header } as Section;
    const sections = withSiteChrome([stray, hero], { header, footer });
    expect(sections.filter((s) => s.type === "header")).toHaveLength(1);
  });

  it("round-trips edits to the header, including style and visibility", () => {
    const [shown, body, shownFooter] = withSiteChrome([hero], { header, footer });
    const edited = {
      ...shown!,
      hidden: true,
      settings: { ...shown!.settings, customColors: { background: "#111111" } },
      data: { ...(shown!.data as HeaderData), menu: [...header.menu, { label: "Menu", href: "/menu" }] },
    } as Section;
    const split = splitSiteChrome([edited, body!, shownFooter!], { header, footer });
    expect(split.body).toEqual([hero]);
    expect(split.header.menu).toHaveLength(2);
    expect(split.header.hidden).toBe(true);
    expect(split.header.settings?.customColors?.background).toBe("#111111");
    expect(stableJson(split.footer)).toBe(stableJson({ ...footer, settings: DEFAULT_SECTION_SETTINGS }));
  });

  it("keeps the site header when the canvas has none, so clearing a page never removes it", () => {
    const split = splitSiteChrome([hero], { header, footer });
    expect(split.header).toBe(header);
    expect(split.footer).toBe(footer);
  });

  it("tells whether the canvas copy matches the site header", () => {
    const [shown] = withSiteChrome([], { header, footer });
    expect(sameChrome(shown!, header)).toBe(true);
    expect(sameChrome(shown!, { ...header, siteName: "Other" })).toBe(false);
  });

  it("lifts the home page's header copy into the site header and strips every copy", () => {
    const homeHeader = { ...hero, id: "h1", type: "header", data: { ...header, siteName: "From home" } } as Section;
    const otherHeader = { ...hero, id: "h2", type: "header", data: { ...header, siteName: "From menu" } } as Section;
    const lifted = liftSiteChrome({
      header: { ...header, siteName: "Old" },
      footer,
      pages: [
        { slug: "/menu", pageType: "CUSTOM", sections: [otherHeader, hero] },
        { slug: "/", pageType: "HOME", sections: [homeHeader, hero] },
      ],
    });
    expect(lifted.header.siteName).toBe("From home");
    expect(lifted.header.menu).toEqual(header.menu);
    expect(lifted.pages.every((page) => page.sections.every((s) => s.type !== "header"))).toBe(true);
    expect(lifted.footer).toBe(footer);
  });
});
