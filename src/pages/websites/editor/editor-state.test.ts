import { describe, expect, it } from "vitest";
import {
  addPage,
  deletePage,
  updatePageMeta,
  type EditorDraft,
} from "./editor-state.ts";
import { DEFAULT_SECTION_SETTINGS, DEFAULT_THEME, type FooterData, type HeaderData, type Section } from "../../../site-kit/index.ts";

describe("editor-state header navigation sync", () => {
  const initialHeader: HeaderData = {
    design: "minimalist",
    siteName: "Test Company",
    sticky: true,
    menu: [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
    ],
  };

  const createInitialDraft = (): EditorDraft => ({
    theme: DEFAULT_THEME,
    header: structuredClone(initialHeader),
    footer: {
      design: "simple",
      siteName: "Test Company",
      columns: [],
      social: [],
      copyright: "2026 Test Company",
    },
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
        sections: [
          {
            id: "sec-header-1",
            type: "header",
            hidden: false,
            data: structuredClone(initialHeader),
          } as Section,
        ],
      },
      {
        id: "page-about",
        name: "About Us",
        slug: "/about",
        pageType: "CUSTOM",
        visible: true,
        showInNav: false,
        seoTitle: null,
        seoDescription: null,
        seoKeywords: [],
        sections: [
          {
            id: "sec-header-2",
            type: "header",
            hidden: false,
            data: structuredClone(initialHeader),
          } as Section,
        ],
      },
    ],
  });

  it("toggling showInNav to true adds the page link to both global header and page header sections", () => {
    const draft = createInitialDraft();
    const updated = updatePageMeta(draft, "page-about", { showInNav: true });

    // Global header check
    expect(updated.header.menu.some((item) => item.href === "/about")).toBe(true);

    // Page header sections check
    for (const page of updated.pages) {
      const headerSection = page.sections.find((s) => s.type === "header");
      expect(headerSection).toBeDefined();
      const menu = (headerSection?.data as HeaderData).menu;
      expect(menu.some((item) => item.href === "/about" && item.label === "About Us")).toBe(true);
    }
  });

  it("toggling showInNav to false removes the page link from both global header and page header sections", () => {
    const draft = createInitialDraft();
    const updated = updatePageMeta(draft, "page-home", { showInNav: false });

    // Global header check
    expect(updated.header.menu.some((item) => item.href === "/")).toBe(false);

    // Page header sections check
    for (const page of updated.pages) {
      const headerSection = page.sections.find((s) => s.type === "header");
      expect(headerSection).toBeDefined();
      const menu = (headerSection?.data as HeaderData).menu;
      expect(menu.some((item) => item.href === "/")).toBe(false);
    }
  });

  it("renaming page updates label across all header menus", () => {
    const draft = createInitialDraft();
    const updated = updatePageMeta(draft, "page-home", { name: "Homepage" });

    expect(updated.header.menu.find((item) => item.href === "/")?.label).toBe("Homepage");

    for (const page of updated.pages) {
      const headerSection = page.sections.find((s) => s.type === "header");
      expect(headerSection).toBeDefined();
      const menu = (headerSection?.data as HeaderData).menu;
      expect(menu.find((item) => item.href === "/")?.label).toBe("Homepage");
    }
  });

  it("adding a new page automatically includes it in the header menu", () => {
    const draft = createInitialDraft();
    const result = addPage(draft, "Pricing");

    expect(result.draft.header.menu.some((item) => item.href === "/pricing" && item.label === "Pricing")).toBe(true);
    for (const page of result.draft.pages) {
      const headerSection = page.sections.find((s) => s.type === "header");
      if (headerSection) {
        const menu = (headerSection.data as HeaderData).menu;
        expect(menu.some((item) => item.href === "/pricing" && item.label === "Pricing")).toBe(true);
      }
    }
  });

  it("deleting a page removes it from the header menu", () => {
    const draft = createInitialDraft();
    // First add /about to nav
    const withAboutInNav = updatePageMeta(draft, "page-about", { showInNav: true });
    // Now delete /about
    const afterDelete = deletePage(withAboutInNav, "page-about");

    expect(afterDelete.header.menu.some((item) => item.href === "/about")).toBe(false);
    for (const page of afterDelete.pages) {
      const headerSection = page.sections.find((s) => s.type === "header");
      if (headerSection) {
        const menu = (headerSection.data as HeaderData).menu;
        expect(menu.some((item) => item.href === "/about")).toBe(false);
      }
    }
  });

  it("draftFromWebsite automatically backfills template logo for header, footer and page sections", async () => {
    const { draftFromWebsite } = await import("./editor-state.ts");
    const mockWebsite: any = {
      id: "site-1",
      clientId: "client-1",
      clientName: "Test Client",
      name: "Accounting Firm · Classic",
      builderType: "MANUAL",
      status: "DRAFT",
      subdomain: "accounting-test",
      pageCount: 1,
      generationStatus: null,
      hasUnpublishedChanges: false,
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customDomain: null,
      info: {
        businessName: "Accounting Firm · Classic",
        websiteType: "Business",
        industry: "Finance",
        description: null,
        contactEmail: null,
        contactPhone: null,
        address: null,
      },
      generation: null,
      draft: {
        theme: DEFAULT_THEME,
        header: {
          design: "logo-left",
          siteName: "Accounting Firm · Classic",
          menu: [],
        },
        footer: {
          design: "columns",
          siteName: "Accounting Firm · Classic",
          columns: [],
        },
        pages: [
          {
            id: "page-1",
            name: "Home",
            slug: "/",
            pageType: "HOME",
            visible: true,
            showInNav: true,
            seoTitle: null,
            seoDescription: null,
            seoKeywords: [],
            templateKey: "accounting-firm-classic",
            sections: [
              {
                id: "sec-header",
                type: "header",
                hidden: false,
                data: {
                  design: "logo-left",
                  siteName: "Accounting Firm · Classic",
                },
              },
            ],
          },
        ],
        draftUpdatedAt: new Date().toISOString(),
      },
    };

    const draft = draftFromWebsite(mockWebsite);
    expect(draft.header.logo).toBeDefined();
    expect(draft.header.logo?.url).toContain("data:image/svg+xml");
    expect(draft.header.logoDisplay).toBe("logo_only");
    expect(draft.footer.logo).toBeDefined();
    expect(draft.footer.logo?.url).toContain("data:image/svg+xml");
    expect(draft.footer.logoDisplay).toBe("logo_only");

    // The page's own header copy became the site-wide header and was removed from the page.
    expect(draft.pages[0]?.sections.some((s) => s.type === "header")).toBe(false);
    expect(draft.header.design).toBe("logo-left");
    expect(draft.header.siteName).toBe("Accounting Firm · Classic");
  });

  it("pre-populates the same header and footer design from the home page when creating new pages", () => {
    const customHeader: HeaderData = {
      design: "glass-dock",
      siteName: "Bytezora Studio",
      sticky: true,
      logo: { url: "https://example.com/logo.png", alt: "Bytezora" },
      logoDisplay: "logo_left",
      cta: { label: "Contact Us", href: "/contact" },
      menu: [{ label: "Home", href: "/" }],
      settings: { ...DEFAULT_SECTION_SETTINGS, customColors: { background: "#0a0a0a" } },
    };

    const customFooter: FooterData = {
      design: "columns",
      siteName: "Bytezora Studio",
      copyright: "© 2026 Bytezora Studio",
      columns: [
        {
          title: "Pages",
          links: [{ label: "Home", href: "/" }],
        },
      ],
      social: [{ label: "Twitter", href: "https://twitter.com/bytezora" }],
      settings: { ...DEFAULT_SECTION_SETTINGS, customColors: { text: "#ffffff" } },
    };

    const draftWithHomeChrome: EditorDraft = {
      theme: DEFAULT_THEME,
      header: customHeader,
      footer: customFooter,
      pages: [
        {
          id: "page-home",
          name: "Home",
          slug: "/",
          pageType: "HOME",
          visible: true,
          showInNav: true,
          seoTitle: "Home Page",
          seoDescription: null,
          seoKeywords: [],
          sections: [],
        },
      ],
    };

    // Create a new page
    const result = addPage(draftWithHomeChrome, "About Us");

    // Header design, logo, cta, and custom settings must match the home page
    expect(result.draft.header.design).toBe("glass-dock");
    expect(result.draft.header.logo).toEqual(customHeader.logo);
    expect(result.draft.header.logoDisplay).toBe("logo_left");
    expect(result.draft.header.cta).toEqual(customHeader.cta);
    expect(result.draft.header.settings?.customColors?.background).toBe("#0a0a0a");

    // Header menu should include the new page while keeping existing items
    expect(result.draft.header.menu).toEqual([
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about-us" },
    ]);

    // Footer design, columns, copyright, and custom settings must match the home page
    expect(result.draft.footer.design).toBe("columns");
    expect(result.draft.footer.copyright).toBe("© 2026 Bytezora Studio");
    expect(result.draft.footer.social).toEqual(customFooter.social);
    expect(result.draft.footer.settings?.customColors?.text).toBe("#ffffff");
    expect(result.draft.footer.columns[0]?.links).toContainEqual({ label: "About Us", href: "/about-us" });
  });

  it("pre-populates header and footer design when home page has custom page-level chrome sections", () => {
    const homeCustomHeader: HeaderData = {
      design: "split-stacked",
      siteName: "Custom Home Brand",
      sticky: false,
      logo: { url: "https://example.com/custom-logo.svg", alt: "Brand" },
      cta: { label: "Get Started", href: "/pricing" },
      menu: [{ label: "Home", href: "/" }],
    };

    const homeCustomFooter: FooterData = {
      design: "centered",
      siteName: "Custom Home Brand",
      copyright: "Custom 2026",
      columns: [],
      social: [],
    };

    const draftWithHomeSection: EditorDraft = {
      theme: DEFAULT_THEME,
      header: { design: "logo-left", siteName: "Old", menu: [], sticky: true },
      footer: { design: "simple", siteName: "Old", columns: [], social: [], copyright: "2026 Old" },
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
          sections: [
            {
              id: "page-header",
              type: "header",
              hidden: false,
              settings: { ...DEFAULT_SECTION_SETTINGS, customColors: { primary: "#ff0000" } },
              data: homeCustomHeader,
            } as Section,
            {
              id: "page-footer",
              type: "footer",
              hidden: false,
              settings: { ...DEFAULT_SECTION_SETTINGS },
              data: homeCustomFooter,
            } as Section,
          ],
        },
      ],
    };

    const result = addPage(draftWithHomeSection, "Services");

    // The new page pre-populates the design that was on the home page
    expect(result.draft.header.design).toBe("split-stacked");
    expect(result.draft.header.logo).toEqual(homeCustomHeader.logo);
    expect(result.draft.header.cta).toEqual(homeCustomHeader.cta);
    expect(result.draft.header.settings?.customColors?.primary).toBe("#ff0000");
    expect(result.draft.header.menu.some((it) => it.href === "/services" && it.label === "Services")).toBe(true);

    expect(result.draft.footer.design).toBe("centered");
    expect(result.draft.footer.copyright).toBe("Custom 2026");
  });
});
