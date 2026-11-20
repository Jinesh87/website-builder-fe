import type { ShopImage, ShopProduct, ShopVariant } from "../../api/shop.ts";

/**
 * How a product's options turn into variants, and which price and photos a
 * variant gets. Shared by the shop admin, the product form and the editor's
 * shop preview so they all read products the same way (mirrors the backend's
 * shop.service.ts).
 */

/** Every pairing of the values of the options that have values, in option order. */
export function combinations(options: { values: string[] }[]): string[][] {
  const filled = options.filter((option) => option.values.length > 0);
  if (filled.length === 0) return [];
  return filled.reduce<string[][]>((sets, option) => sets.flatMap((prefix) => option.values.map((value) => [...prefix, value])), [[]]);
}

/** What the customer pays for an entered price under the given GST rules. */
export function payablePaise(pricePaise: number, gstPercent: number, priceIncludesGst: boolean): number {
  const percent = Math.max(0, Math.min(100, Math.floor(gstPercent || 0)));
  if (percent <= 0 || priceIncludesGst) return pricePaise;
  return Math.round(pricePaise * (1 + percent / 100));
}

/** The option set a variant belongs to and its value for each option, found by the variant's "Red / S" name. */
function locateVariant(product: ShopProduct, variantName: string) {
  for (const set of product.optionSets ?? []) {
    if (set.options.length === 0) continue;
    const values = combinations(set.options).find((combo) => combo.join(" / ") === variantName);
    if (values) return { set, values };
  }
  return null;
}

/** The variant's option values, e.g. [{ name: "Colour", value: "Red" }]. `list` marks options split into separate shop cards. */
export function variantOptions(product: ShopProduct, variantName: string): { name: string; value: string; list?: boolean }[] {
  const found = locateVariant(product, variantName);
  if (!found) return [];
  return found.set.options.map((option, index) => ({
    name: option.name,
    value: found.values[index] ?? "",
    ...(option.listOnShop ? { list: true } : {}),
  }));
}

/** Photos uploaded for one of the variant's option values, such as every red size. Later options win. */
export function sharedValuePhotos(product: ShopProduct, variantName: string): ShopImage[] {
  const found = locateVariant(product, variantName);
  if (!found) return [];
  for (let index = found.set.options.length - 1; index >= 0; index -= 1) {
    const option = found.set.options[index];
    const value = (found.values[index] ?? "").toLowerCase();
    const group = option?.images?.find((item) => item.value.toLowerCase() === value);
    const photos = (group?.images ?? []).flatMap((image) => (image.url ? [{ mediaId: image.mediaId, url: image.url, alt: image.alt }] : []));
    if (photos.length > 0) return photos;
  }
  return [];
}

/** The photos shown for a variant: its own, else its option value's, else the product's main photos. */
export function variantPhotos(product: ShopProduct, variant: ShopVariant): ShopImage[] {
  if (variant.images?.length) return variant.images;
  const shared = sharedValuePhotos(product, variant.name);
  return shared.length > 0 ? shared : (product.images ?? []);
}
