import { describe, expect, it } from "vitest";
import {
  ensureUniqueSlugs,
  getKnownRoutes,
  isExternalOrAnchor,
  normalizeSlug,
  reconcileHeaderMenu,
  resolveInternalLink,
  sanitizeSectionLinks,
} from "./link-validator.ts";
import { DEFAULT_SECTION_SETTINGS, type Section } from "../../../site-kit/index.ts";
import type { WebsitePage } from "../../../api/websites.ts";
import type { CreatedPageEdit } from "../schema/editor-document.ts";

describe("link-validator", () => {
  describe("normalizeSlug", () => {
    it("handles empty or root inputs", () => {
      expect(normalizeSlug("")).toBe("/");
      expect(normalizeSlug("   ")).toBe("/");
      expect(normalizeSlug("/")).toBe("/");
    });

    it("normalizes paths to leading slash lowercase kebab-case", () => {
      expect(normalizeSlug("About Us")).toBe("/about-us");
      expect(normalizeSlug("/Pricing/")).toBe("/pricing");
      expect(normalizeSlug("contact-sales_now")).toBe("/contact-sales_now");
      expect(normalizeSlug("Special & Features!")).toBe("/special-features");
    });
  });

  describe("isExternalOrAnchor", () => {
    it("identifies external and anchor links", () => {
      expect(isExternalOrAnchor("https://example.com")).toBe(true);
      expect(isExternalOrAnchor("http://example.com")).toBe(true);
      expect(isExternalOrAnchor("mailto:test@example.com")).toBe(true);
      expect(isExternalOrAnchor("tel:+1234567890")).toBe(true);
      expect(isExternalOrAnchor("#features")).toBe(true);
      expect(isExternalOrAnchor("//cdn.example.com")).toBe(true);
    });

    it("identifies internal links", () => {
      expect(isExternalOrAnchor("/about")).toBe(false);
      expect(isExternalOrAnchor("/pricing")).toBe(false);
      expect(isExternalOrAnchor("contact")).toBe(false);
    });
  });

  describe("getKnownRoutes", () => {
    it("extracts all distinct canonical routes", () => {
      const pages = [{ slug: "/" }, { slug: "/about" }, { slug: "/pricing" }];
      const createdPages = [{ slug: "/contact" }];
      const routes = getKnownRoutes(pages, createdPages);

      expect(routes.has("/")).toBe(true);
      expect(routes.has("/about")).toBe(true);
      expect(routes.has("/pricing")).toBe(true);
      expect(routes.has("/contact")).toBe(true);
      expect(routes.has("/non-existent")).toBe(false);
    });
  });

  describe("resolveInternalLink", () => {
    const validRoutes = new Set(["/", "/about", "/pricing-plans", "/contact"]);

    it("keeps external links and anchors as-is", () => {
      expect(resolveInternalLink("https://google.com", validRoutes)).toBe("https://google.com");
      expect(resolveInternalLink("#section", validRoutes)).toBe("#section");
    });

    it("returns exact matches normalized", () => {
      expect(resolveInternalLink("/about", validRoutes)).toBe("/about");
      expect(resolveInternalLink("About", validRoutes)).toBe("/about");
      expect(resolveInternalLink("/pricing-plans/", validRoutes)).toBe("/pricing-plans");
    });

    it("resolves fuzzy matches when candidate is close to a known route", () => {
      expect(resolveInternalLink("/pricing", validRoutes)).toBe("/pricing-plans");
    });
  });

  describe("ensureUniqueSlugs", () => {
    it("generates unique slugs when duplicates exist", () => {
      const existingPages: WebsitePage[] = [
        {
          id: "page-1",
          name: "Pricing",
          slug: "/pricing",
          pageType: "CUSTOM",
          visible: true,
          showInNav: true,
          seoTitle: null,
          seoDescription: null,
          seoKeywords: [],
          sections: [],
        },
      ];

      const newPages: CreatedPageEdit[] = [
        {
          id: "page-new-1",
          name: "Pricing",
          slug: "/pricing",
          pageType: "CUSTOM",
          sections: [],
        },
        {
          id: "page-new-2",
          name: "Pricing",
          slug: "/pricing",
          pageType: "CUSTOM",
          sections: [],
        },
      ];

      const result = ensureUniqueSlugs(existingPages, newPages);
      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe("/pricing-2");
      expect(result[1].slug).toBe("/pricing-3");
    });
  });

  describe("sanitizeSectionLinks", () => {
    const validRoutes = new Set(["/", "/services", "/contact"]);

    it("recursively resolves links in section data", () => {
      const section: Section = {
        id: "hero-1",
        type: "hero",
        hidden: false,
        settings: { ...DEFAULT_SECTION_SETTINGS, background: "default" },
        data: {
          variant: "split",
          heading: "Welcome to Our Website",
          primaryCta: { label: "Contact Us", href: "/contact" },
          secondaryCta: { label: "Our Services", href: "/services" },
        },
      };

      const sanitized = sanitizeSectionLinks(section, validRoutes);
      const data = sanitized.data as { primaryCta?: { href: string }; secondaryCta?: { href: string } };
      expect(data.primaryCta?.href).toBe("/contact");
      expect(data.secondaryCta?.href).toBe("/services");
    });
  });

  describe("reconcileHeaderMenu", () => {
    const validRoutes = new Set(["/", "/about", "/pricing"]);

    it("reconciles menu links to valid internal routes", () => {
      const menu = [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Pricing", href: "/pricing" },
        { label: "External Docs", href: "https://docs.example.com" },
      ];

      const reconciled = reconcileHeaderMenu(menu, validRoutes);
      expect(reconciled[0].href).toBe("/");
      expect(reconciled[1].href).toBe("/about");
      expect(reconciled[2].href).toBe("/pricing");
      expect(reconciled[3].href).toBe("https://docs.example.com");
    });
  });

  describe("SAFE_IMAGE_URL", () => {
    it("accepts https and relative image URLs", async () => {
      const { SAFE_IMAGE_URL } = await import("../../../pages/websites/editor/fields.tsx");
      expect(SAFE_IMAGE_URL.test("https://images.unsplash.com/photo-123")).toBe(true);
      expect(SAFE_IMAGE_URL.test("/assets/logo.png")).toBe(true);
    });

    it("accepts valid SVG and raster data URIs", async () => {
      const { SAFE_IMAGE_URL } = await import("../../../pages/websites/editor/fields.tsx");
      expect(SAFE_IMAGE_URL.test("data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E")).toBe(true);
      expect(SAFE_IMAGE_URL.test("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=")).toBe(true);
      expect(SAFE_IMAGE_URL.test("data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AA/v3AAAA==")).toBe(true);
    });

    it("rejects dangerous or non-image URIs", async () => {
      const { SAFE_IMAGE_URL } = await import("../../../pages/websites/editor/fields.tsx");
      expect(SAFE_IMAGE_URL.test("javascript:alert(1)")).toBe(false);
      expect(SAFE_IMAGE_URL.test("data:text/html,<script>alert(1)</script>")).toBe(false);
      expect(SAFE_IMAGE_URL.test("//cdn.malicious.com/hack")).toBe(false);
    });
  });
});
