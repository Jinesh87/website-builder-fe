import {
  SHOWCASE_CATEGORY_DESIGNS,
  SHOWCASE_IMAGE_ASPECTS,
  SHOWCASE_MODES,
  SHOWCASE_PRODUCT_DESIGNS,
  SHOWCASE_SUMMARY_LINES_MAX,
  type ShowcaseCategory,
  type ShowcaseCategoryDesign,
  type ShowcaseData,
  type ShowcaseImageAspect,
  type ShowcaseMode,
  type ShowcaseProduct,
  type ShowcaseProductDesign,
} from "./showcase-types.ts";

export type ShowcaseDisplay = {
  image: boolean;
  name: boolean;
  summary: boolean;
  price: boolean;
  category: boolean;
  badge: boolean;
  button: boolean;
  count: boolean;
  categoryDescription: boolean;
  summaryLines: number;
};

export type ShowcaseGroup = {
  /** Null holds the products without a (known) category. */
  category: ShowcaseCategory | null;
  products: ShowcaseProduct[];
};

const pick = <T extends string>(allowed: readonly T[], value: unknown, fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

export const showcaseMode = (data: ShowcaseData): ShowcaseMode => pick(SHOWCASE_MODES, data.mode, "products");
export const showcaseDesign = (data: ShowcaseData): ShowcaseProductDesign =>
  pick(SHOWCASE_PRODUCT_DESIGNS, data.design, "classic");
export const showcaseCategoryDesign = (data: ShowcaseData): ShowcaseCategoryDesign =>
  pick(SHOWCASE_CATEGORY_DESIGNS, data.categoryDesign, "tiles");
export const showcaseImageAspect = (data: ShowcaseData): ShowcaseImageAspect =>
  pick(SHOWCASE_IMAGE_ASPECTS, data.imageAspect, "4:3");

export function clampSummaryLines(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 3;
  return Math.min(Math.max(Math.round(value), 0), SHOWCASE_SUMMARY_LINES_MAX);
}

export function resolveShowcaseDisplay(data: ShowcaseData): ShowcaseDisplay {
  return {
    image: data.showImage !== false,
    name: data.showName !== false,
    summary: data.showSummary !== false,
    price: data.showPrice !== false,
    category: data.showCategory === true,
    badge: data.showBadge !== false,
    button: data.showButton !== false,
    count: data.showCount === true,
    categoryDescription: data.showCategoryDescription !== false,
    summaryLines: clampSummaryLines(data.summaryLines),
  };
}

/** "4:3" → "4 / 3" for the CSS aspect-ratio property. */
export const aspectRatioCss = (aspect: ShowcaseImageAspect): string => aspect.replace(":", " / ");

function categoryIds(data: ShowcaseData): Set<string> {
  return new Set(data.categories.map((category) => category.id));
}

/** Products of one category; null lists the uncategorised ones. */
export function productsIn(data: ShowcaseData, categoryId: string | null): ShowcaseProduct[] {
  const known = categoryIds(data);
  return data.products.filter((product) =>
    categoryId === null
      ? !product.categoryId || !known.has(product.categoryId)
      : product.categoryId === categoryId,
  );
}

/**
 * Products split by category, in the categories' order. Empty categories are left out;
 * uncategorised products come last.
 */
export function groupShowcaseProducts(data: ShowcaseData): ShowcaseGroup[] {
  const groups: ShowcaseGroup[] = data.categories
    .map((category) => ({ category, products: productsIn(data, category.id) }))
    .filter((group) => group.products.length > 0);
  const rest = productsIn(data, null);
  if (rest.length > 0) groups.push({ category: null, products: rest });
  return groups;
}

/** Products the "products" mode lists: one category when one is chosen and still exists, else all. */
export function visibleProducts(data: ShowcaseData): ShowcaseProduct[] {
  const id = data.categoryId;
  if (!id || !categoryIds(data).has(id)) return data.products;
  return productsIn(data, id);
}

export function categoryName(data: ShowcaseData, id: string | undefined): string | undefined {
  if (!id) return undefined;
  return data.categories.find((category) => category.id === id)?.name;
}
