import { describe, expect, it } from "vitest";
import { galleryTabs, showsGalleryFilters } from "./gallery-filters.ts";
import type { GalleryData } from "./types.ts";

const photo = (url: string, category?: string) => ({ url, alt: url, category });

const gallery = (images: GalleryData["images"], extra: Partial<GalleryData> = {}): GalleryData => ({
  columns: 3,
  mobileColumns: 1,
  images,
  ...extra,
});

describe("galleryTabs", () => {
  it("groups photos by category in first-seen order, ignoring case and blanks", () => {
    const data = gallery([photo("a", "Kitchen"), photo("b", "Living Room"), photo("c", " kitchen "), photo("d"), photo("e", "  ")]);
    const tabs = galleryTabs(data);
    expect(tabs.map((tab) => [tab.label, tab.images.map((image) => image.url)])).toEqual([
      ["All", ["a", "b", "c", "d", "e"]],
      ["Kitchen", ["a", "c"]],
      ["Living Room", ["b"]],
    ]);
  });

  it("uses a custom label for the show-everything tab", () => {
    expect(galleryTabs(gallery([], { allLabel: " Everything " }))[0]!.label).toBe("Everything");
  });
});

describe("showsGalleryFilters", () => {
  it("needs filters switched on and at least two categories", () => {
    const two = gallery([photo("a", "Kitchen"), photo("b", "Doors")], { filters: true });
    expect(showsGalleryFilters(two, galleryTabs(two))).toBe(true);

    const one = gallery([photo("a", "Kitchen"), photo("b", "Kitchen")], { filters: true });
    expect(showsGalleryFilters(one, galleryTabs(one))).toBe(false);

    const off = { ...two, filters: false };
    expect(showsGalleryFilters(off, galleryTabs(off))).toBe(false);
  });
});
