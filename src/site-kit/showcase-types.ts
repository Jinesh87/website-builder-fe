/**
 * Product showcase: a display-only catalogue (no cart, no checkout). Products and
 * categories live in the section's own data. Values are stored in site data, so
 * enum lists are only ever appended. Mirrored in the backend validator.
 */

import type { GridColumns, ImageRef, LinkRef } from "./types.ts";

/** What the section lists. */
export const SHOWCASE_MODES = ["products", "tabs", "grouped", "categories"] as const;
export type ShowcaseMode = (typeof SHOWCASE_MODES)[number];

export const SHOWCASE_PRODUCT_DESIGNS = ["classic", "minimal", "overlay", "horizontal", "spotlight", "catalogue"] as const;
export type ShowcaseProductDesign = (typeof SHOWCASE_PRODUCT_DESIGNS)[number];

export const SHOWCASE_CATEGORY_DESIGNS = ["tiles", "cards", "circles", "pills"] as const;
export type ShowcaseCategoryDesign = (typeof SHOWCASE_CATEGORY_DESIGNS)[number];

export const SHOWCASE_IMAGE_ASPECTS = ["1:1", "4:3", "3:4", "16:9"] as const;
export type ShowcaseImageAspect = (typeof SHOWCASE_IMAGE_ASPECTS)[number];

export const SHOWCASE_MAX_PRODUCTS = 200;
export const SHOWCASE_MAX_CATEGORIES = 40;
export const SHOWCASE_SUMMARY_LINES_MAX = 6;

export type ShowcaseCategory = {
  id: string;
  name: string;
  description?: string;
  image?: ImageRef;
  /** Where the category card goes, e.g. a page that lists only this category. */
  link?: LinkRef;
};

export type ShowcaseProduct = {
  id: string;
  name: string;
  summary?: string;
  /** Free text, e.g. "₹1,200", "From $40" or "Price on request". */
  price?: string;
  image?: ImageRef;
  /** Small label such as "NEW" or "BESTSELLER". */
  badge?: string;
  /** Id of one of the section's categories; unset or unknown means uncategorised. */
  categoryId?: string;
  /** The product's button. Unset falls back to the section's `defaultLink`. */
  link?: LinkRef;
};

export type ShowcaseData = {
  mode: ShowcaseMode;
  /** Card design for products. Unset is "classic". */
  design?: ShowcaseProductDesign;
  /** Card design for the "categories" mode. Unset is "tiles". */
  categoryDesign?: ShowcaseCategoryDesign;
  eyebrow?: string;
  heading: string;
  intro?: string;
  headerAlign?: "center" | "left";
  /** "products" mode: list only this category. Unset lists every product. */
  categoryId?: string;
  /** "tabs" mode: label of the first tab. Unset is "All". */
  allLabel?: string;
  /** "grouped" / "tabs": heading for products without a category. Unset is "Other". */
  otherLabel?: string;
  columns: GridColumns;
  tabletColumns?: GridColumns;
  mobileColumns: GridColumns;
  imageAspect?: ShowcaseImageAspect;
  imageFit?: "cover" | "contain";
  /** Unset means shown, except `showCategory` and `showCount` which are off unless set. */
  showImage?: boolean;
  showName?: boolean;
  showSummary?: boolean;
  showPrice?: boolean;
  showCategory?: boolean;
  showBadge?: boolean;
  showButton?: boolean;
  /** Product count on category cards. */
  showCount?: boolean;
  showCategoryDescription?: boolean;
  /** Clamp summaries to this many lines; 0 shows the full text. Unset is 3. */
  summaryLines?: number;
  /** Button for products that have no link of their own, e.g. "Enquire" → /contact. */
  defaultLink?: LinkRef;
  emptyMessage?: string;
  categories: ShowcaseCategory[];
  products: ShowcaseProduct[];
};
