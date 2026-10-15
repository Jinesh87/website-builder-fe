import { DEFAULT_SECTION_SETTINGS } from "../registry.ts";
import type {
  FooterData,
  HeaderData,
  ImageRef,
  PageData,
  Section,
  SectionDataMap,
  SectionSettings,
  SectionType,
} from "../types.ts";

/** Unsplash photo, cropped server-side to the requested width. */
export function photo(id: string, alt: string, width = 1600): ImageRef {
  return { url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`, alt };
}

type SectionDraft = {
  [T in SectionType]: { type: T; data: SectionDataMap[T]; settings?: Partial<SectionSettings> };
}[SectionType];

export function section<T extends SectionType>(
  type: T,
  data: SectionDataMap[T],
  settings: Partial<SectionSettings> = {},
): SectionDraft {
  return { type, data, settings } as SectionDraft;
}

type PageDraft = { name: string; slug: string; sections: SectionDraft[] };

/**
 * Builds template pages with the shared header and footer placed on every page,
 * since `SitePage` only renders chrome that the page itself contains.
 */
export function buildPages(prefix: string, header: HeaderData, footer: FooterData, drafts: PageDraft[]): PageData[] {
  return drafts.map((draft, pageIndex) => {
    const all: SectionDraft[] = [section("header", header), ...draft.sections, section("footer", footer)];
    return {
      id: `${prefix}-page-${pageIndex}`,
      name: draft.name,
      slug: draft.slug,
      sections: all.map(
        (item, sectionIndex) =>
          ({
            id: `${prefix}-${pageIndex}-${sectionIndex}-${item.type}`,
            type: item.type,
            hidden: false,
            settings: { ...DEFAULT_SECTION_SETTINGS, ...item.settings },
            data: item.data,
          }) as Section,
      ),
    };
  });
}
