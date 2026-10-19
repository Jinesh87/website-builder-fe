import { describe, expect, it } from "vitest";
import {
  addPage,
  deletePage,
  updatePageMeta,
  type EditorDraft,
} from "./editor-state.ts";
import { DEFAULT_THEME, type HeaderData, type Section } from "../../../site-kit/index.ts";

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

    const headerSec = draft.pages[0]?.sections.find((s) => s.type === "header");
    expect((headerSec?.data as any)?.logo?.url).toContain("data:image/svg+xml");
    expect((headerSec?.data as any)?.logoDisplay).toBe("logo_only");
  });
});
