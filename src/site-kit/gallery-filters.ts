import type { GalleryData, GalleryItem } from "./types.ts";

export type GalleryTab = { key: string; label: string; images: GalleryItem[] };

/** "All" plus one tab per distinct photo category, in first-seen order (case-insensitive). */
export function galleryTabs(data: GalleryData): GalleryTab[] {
  const groups = new Map<string, GalleryTab>();
  for (const image of data.images) {
    const label = image.category?.trim();
    if (!label) continue;
    const id = label.toLowerCase();
    const group = groups.get(id) ?? { key: `c${groups.size}`, label, images: [] };
    group.images.push(image);
    groups.set(id, group);
  }
  return [{ key: "all", label: data.allLabel?.trim() || "All", images: data.images }, ...groups.values()];
}

/** Filters show only when switched on and there are at least two categories to choose between. */
export function showsGalleryFilters(data: GalleryData, tabs: GalleryTab[]): boolean {
  return Boolean(data.filters) && tabs.length > 2;
}
