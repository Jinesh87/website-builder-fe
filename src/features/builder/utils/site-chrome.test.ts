import { describe, expect, it } from "vitest";
import { DEFAULT_SECTION_SETTINGS, type FooterData, type HeaderData, type Section } from "../../../site-kit/index.ts";
import {
  PAGE_FOOTER_ID,
  PAGE_HEADER_ID,
  SITE_FOOTER_ID,
  SITE_HEADER_ID,
  applyCanvasSections,
  canvasChromeFix,
  liftSiteChrome,
  pageChromeMode,
  sameChrome,
  setPageChrome,
  splitSiteChrome,
  stableJson,
  withSiteBrand,
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

describe("per-page header and footer", () => {
  const chrome = { header, footer };

  it("shows a page's own header in place of the site header, and nothing for a removed footer", () => {
    let sections = setPageChrome([hero], "header", "page", chrome);
    sections = setPageChrome(sections, "footer", "none", chrome);
    expect(pageChromeMode(sections, "header")).toBe("page");
    expect(pageChromeMode(sections, "footer")).toBe("none");
    expect(withSiteChrome(sections, chrome).map((s) => s.id)).toEqual([PAGE_HEADER_ID, "hero-1"]);
  });

  it("goes back to the site header", () => {
    const own = setPageChrome([hero], "header", "page", chrome);
    const back = setPageChrome(own, "header", "site", chrome);
    expect(back).toEqual([hero]);
    expect(withSiteChrome(back, chrome)[0]?.id).toBe(SITE_HEADER_ID);
  });

  it("saves edits to a page's own header on that page and leaves the site header alone", () => {
    const stored = setPageChrome([hero], "header", "page", chrome);
    const [shown, body, shownFooter] = withSiteChrome(stored, chrome);
    const edited = { ...shown!, data: { ...(shown!.data as HeaderData), siteName: "Blog" } } as Section;
    const split = splitSiteChrome([edited, body!, shownFooter!], chrome, stored);
    expect(split.header).toBe(header);
    expect(split.body.map((s) => s.id)).toEqual([PAGE_HEADER_ID, "hero-1"]);
    expect((split.body[0]!.data as HeaderData).siteName).toBe("Blog");
  });

  it("keeps a removed footer removed whatever the canvas shows", () => {
    const stored = setPageChrome([hero], "footer", "none", chrome);
    const split = splitSiteChrome(withSiteChrome([hero], chrome), chrome, stored);
    expect(split.body.map((s) => [s.id, s.hidden])).toEqual([
      ["hero-1", false],
      [PAGE_FOOTER_ID, true],
    ]);
  });

  it("tells the canvas which header/footer to show", () => {
    const stored = setPageChrome([hero], "footer", "none", chrome);
    expect(canvasChromeFix(withSiteChrome(stored, chrome), stored, chrome)).toBeNull();
    const fix = canvasChromeFix(withSiteChrome([hero], chrome), stored, chrome);
    expect(fix?.header?.id).toBe(SITE_HEADER_ID);
    expect(fix?.footer).toBeNull();
  });

  it("keeps the site name and logo on a new header design", () => {
    const logo = { url: "https://cdn.example.com/logo.png", alt: "Taqueria" };
    const preset = { ...hero, id: "x", type: "header", data: { ...header, design: "centered", siteName: "Sample" } } as Section;
    const branded = withSiteBrand(preset, { header: { ...header, logo }, footer });
    expect(branded.data).toMatchObject({ design: "centered", siteName: "Taqueria", logo, logoDisplay: "logo_only" });
    expect(withSiteBrand(hero, chrome)).toBe(hero);
  });

  describe("dropping a header or footer onto the canvas", () => {
    const droppedHeader = {
      ...hero,
      id: "header-123",
      type: "header",
      data: { ...header, design: "centered", siteName: "Sample" },
    } as Section;

    it("replaces the site header when the page uses it, keeping the site name", () => {
      const canvas = withSiteChrome([hero], chrome);
      const split = splitSiteChrome([canvas[0]!, hero, droppedHeader, canvas[2]!], chrome, [hero]);
      expect(split.header.design).toBe("centered");
      expect(split.header.siteName).toBe("Taqueria");
      expect(split.body).toEqual([hero]);
    });

    it("replaces a page's own header and leaves the site header alone", () => {
      const stored = setPageChrome([hero], "header", "page", chrome);
      const split = splitSiteChrome([...withSiteChrome(stored, chrome), droppedHeader], chrome, stored);
      expect(split.header).toBe(header);
      expect(split.body.map((s) => [s.id, s.hidden])).toEqual([
        [PAGE_HEADER_ID, false],
        ["hero-1", false],
      ]);
      expect((split.body[0]!.data as HeaderData).design).toBe("centered");
    });

    it("gives a page with no header its own copy", () => {
      const stored = setPageChrome([hero], "header", "none", chrome);
      const split = splitSiteChrome([hero, droppedHeader], chrome, stored);
      expect(pageChromeMode(split.body, "header")).toBe("page");
      expect((split.body[0]!.data as HeaderData).design).toBe("centered");
    });

    it("keeps the dropped header on the canvas until the page shows it, then tidies it into place", () => {
      const canvas = [...withSiteChrome([hero], chrome), droppedHeader];
      expect(canvasChromeFix(canvas, [hero], chrome)).toBeNull();
      const split = splitSiteChrome(canvas, chrome, [hero]);
      const fix = canvasChromeFix(canvas, split.body, split);
      expect(fix?.header).toMatchObject({ id: SITE_HEADER_ID, data: { design: "centered", siteName: "Taqueria" } });
    });
  });

  describe("applying a canvas change to the draft", () => {
    const draft = { header, footer, pages: [{ id: "home", sections: [hero] }] };

    it("returns the same draft when the canvas already matches it", () => {
      const saved = applyCanvasSections(draft, "home", withSiteChrome([hero], draft));
      expect(applyCanvasSections(saved, "home", withSiteChrome(saved.pages[0]!.sections, saved))).toBe(saved);
      expect(applyCanvasSections(draft, "missing", [hero])).toBe(draft);
    });

    it("keeps a header just removed from the page when the canvas without it is applied", () => {
      const removed = { ...draft, pages: [{ id: "home", sections: setPageChrome([hero], "header", "none", draft) }] };
      const canvas = withSiteChrome([hero], draft).filter((section) => section.type !== "header");
      const next = applyCanvasSections(removed, "home", canvas);
      expect(pageChromeMode(next.pages[0]!.sections, "header")).toBe("none");
      expect(withSiteChrome(next.pages[0]!.sections, next).map((s) => s.type)).toEqual(["hero", "footer"]);
      expect(next.header).toBe(header);
    });

    it("saves body edits to the page and site header edits to the site", () => {
      const [shown, , shownFooter] = withSiteChrome([hero], draft);
      const editedHero = { ...hero, data: { ...hero.data, heading: "Hola mundo" } } as Section;
      const editedHeader = { ...shown!, data: { ...(shown!.data as HeaderData), siteName: "Cantina" } } as Section;
      const next = applyCanvasSections(draft, "home", [editedHeader, editedHero, shownFooter!]);
      expect(next.pages[0]!.sections).toEqual([editedHero]);
      expect(next.header.siteName).toBe("Cantina");
    });
  });

  it("does not lift a page's own header into the site header", () => {
    const own = setPageChrome([hero], "header", "page", { header: { ...header, siteName: "Blog" }, footer });
    const content = { header, footer, pages: [{ slug: "/blog", sections: own }] };
    expect(liftSiteChrome(content)).toBe(content);
  });
});
