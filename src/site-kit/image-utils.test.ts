import { describe, expect, it } from "vitest";
import {
  detectImageCategory,
  getAmbientGradient,
  getCuratedFallbackImage,
  normalizeImageUrl,
} from "./image-utils.ts";

describe("image-utils", () => {
  describe("detectImageCategory", () => {
    it("detects restaurant / dining / gourmet context", () => {
      expect(detectImageCategory("Welcome to Gourmet Delight")).toBe("restaurant");
      expect(detectImageCategory("Fine dining experience with artisan chef")).toBe("restaurant");
      expect(detectImageCategory("Bistro & Wine Bar")).toBe("restaurant");
    });

    it("detects tech and software context", () => {
      expect(detectImageCategory("Next-Gen AI Platform for SaaS")).toBe("tech");
      expect(detectImageCategory("Cloud infrastructure and analytics")).toBe("tech");
    });

    it("detects agency and creative context", () => {
      expect(detectImageCategory("Digital Design Agency Studio")).toBe("agency");
    });

    it("detects travel and nature context", () => {
      expect(detectImageCategory("Luxury Resort & Beach Vacation")).toBe("travel");
    });

    it("falls back to general when ambiguous", () => {
      expect(detectImageCategory(undefined)).toBe("general");
      expect(detectImageCategory("")).toBe("general");
      expect(detectImageCategory("12345 Hello World")).toBe("general");
    });
  });

  describe("getCuratedFallbackImage", () => {
    it("returns high-res restaurant image for restaurant text", () => {
      const url = getCuratedFallbackImage("Welcome to Gourmet Delight");
      expect(url).toContain("images.unsplash.com");
      expect(url).toContain("auto=format");
    });

    it("returns tech image for tech text", () => {
      const url = getCuratedFallbackImage("SaaS Cloud Platform");
      expect(url).toContain("images.unsplash.com");
    });
  });

  describe("getAmbientGradient", () => {
    it("returns warm ambient gradient for dining context", () => {
      const grad = getAmbientGradient("Gourmet Delight Dining");
      expect(grad).toContain("radial-gradient");
      expect(grad).toContain("#3b1d11");
    });

    it("returns midnight indigo gradient for tech", () => {
      const grad = getAmbientGradient("Cloud AI SaaS");
      expect(grad).toContain("radial-gradient");
      expect(grad).toContain("#1e1b4b");
    });
  });

  describe("normalizeImageUrl", () => {
    it("handles empty and null inputs safely", () => {
      expect(normalizeImageUrl("")).toBe("");
      expect(normalizeImageUrl(null)).toBe("");
      expect(normalizeImageUrl(undefined)).toBe("");
      expect(normalizeImageUrl("   ")).toBe("");
    });

    it("replaces dummy/placeholder tokens with curated fallbacks", () => {
      const res = normalizeImageUrl("IMAGE_1", "Gourmet Delight");
      expect(res).toContain("images.unsplash.com");
      expect(res).not.toBe("IMAGE_1");
    });

    it("normalizes relative API paths", () => {
      const res = normalizeImageUrl("/api/media/files/123");
      expect(res).toBe("/api/media/files/123");
    });

    it("ensures Unsplash URLs have optimal query parameters", () => {
      const raw = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";
      const normalized = normalizeImageUrl(raw);
      expect(normalized).toContain("auto=format");
      expect(normalized).toContain("fit=crop");
      expect(normalized).toContain("q=85");
    });
  });
});
