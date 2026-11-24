import type { ShopImage, ShopProduct, ShopProductInput } from "../../../api/shop.ts";
import { combinations } from "../product-variants.ts";

/**
 * Editable product state for the add/edit product form, and its conversion to
 * and from the API shape. Kept free of React so it can be unit tested.
 */

export type OptionDraft = {
  key: string;
  name: string;
  values: string[];
  /** Each value becomes its own card on the shop page. */
  listOnShop: boolean;
  /** Lower-cased value → photos shared by every variant with that value. */
  images: Record<string, ShopImage[]>;
};

/**
 * A group of options whose values are all paired with each other. Most
 * products have one group; a second group covers variants that don't fit the
 * first (e.g. a size that only comes in one colour).
 */
export type SetDraft = {
  key: string;
  price: string;
  options: OptionDraft[];
  /** Variant key → rupee price, only when it differs from the group price. */
  overrides: Record<string, string>;
  /** Variant key → SKU. The key of a product without options is "". */
  skus: Record<string, string>;
  /** Variant key → printed barcode (scanned at the POS till). */
  barcodes: Record<string, string>;
  /** Variant key → photos for that single variant. */
  images: Record<string, ShopImage[]>;
  /** Key of the option whose values have their own photos, if any. */
  photosBy: string | null;
};

/** A change to a variant group: new values, or a function of the latest group. */
export type SetPatch = Partial<SetDraft> | ((current: SetDraft) => Partial<SetDraft>);

export type ProductDraft = {
  id?: string;
  originalCategoryId?: string | null;
  name: string;
  description: string;
  categoryId: string;
  listed: boolean;
  /** When false, the product uses the shop GST defaults. */
  gstOverride: boolean;
  /** Whole percent, as typed (only used when gstOverride). */
  gstPercent: string;
  /** Entered prices already include GST (only used when gstOverride). */
  priceIncludesGst: boolean;
  returnsEnabled: boolean;
  /** Empty string = use the shop default. */
  returnDays: string;
  sets: SetDraft[];
  images: ShopImage[];
};

export type ProductFieldErrors = {
  name?: string;
  priceBySet?: Record<string, string>;
  gstPercent?: string;
  returnDays?: string;
};

export type ProductParseResult = { input: ShopProductInput } | { error: string; fieldErrors?: ProductFieldErrors };

export const MAX_PRODUCT_IMAGES = 8;

/** Variant key of a product without options. */
export const STANDARD_KEY = "";

export function blankOption(): OptionDraft {
  return { key: crypto.randomUUID(), name: "", values: [], listOnShop: false, images: {} };
}

export function blankSet(withOption = false): SetDraft {
  return {
    key: crypto.randomUUID(),
    price: "",
    options: withOption ? [blankOption()] : [],
    overrides: {},
    skus: {},
    barcodes: {},
    images: {},
    photosBy: null,
  };
}

export function blankProduct(categoryId = ""): ProductDraft {
  return {
    name: "",
    description: "",
    categoryId,
    listed: true,
    gstOverride: false,
    gstPercent: "0",
    priceIncludesGst: true,
    returnsEnabled: true,
    returnDays: "",
    sets: [blankSet()],
    images: [],
  };
}

/** True once the product has options such as size or colour. */
export function hasOptions(draft: ProductDraft): boolean {
  return draft.sets.length > 1 || draft.sets.some((set) => set.options.length > 0);
}

export function variantKey(values: string[]): string {
  return values.map((value) => value.trim().toLowerCase()).join("\u001f");
}

export function valueKey(value: string): string {
  return value.trim().toLowerCase();
}

export function rupeesToPaise(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole = "0", frac = ""] = trimmed.split(".");
  const paise = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (!Number.isSafeInteger(paise) || paise > 1_000_000_000) return null;
  return paise;
}

export function paiseToRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

export function toInput(draft: ProductDraft): ProductParseResult {
  if (!draft.name.trim()) {
    return { error: "Enter a product name", fieldErrors: { name: "Enter a product name" } };
  }
  let gstPercent: number | null = null;
  let priceIncludesGst: boolean | null = null;
  if (draft.gstOverride) {
    const gstRaw = draft.gstPercent.trim();
    const parsed = gstRaw === "" ? NaN : Number(gstRaw);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      return {
        error: "GST percent must be a whole number from 0 to 100.",
        fieldErrors: { gstPercent: "Enter a whole number from 0 to 100" },
      };
    }
    gstPercent = parsed;
    priceIncludesGst = draft.priceIncludesGst;
  }
  const returnDaysRaw = draft.returnDays.trim();
  let returnDays: number | null = null;
  if (returnDaysRaw) {
    const parsed = Number(returnDaysRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 365) {
      return {
        error: "Return days must be between 1 and 365, or left blank for the shop default.",
        fieldErrors: { returnDays: "Enter 1–365, or leave blank" },
      };
    }
    returnDays = parsed;
  }
  const seen = new Set<string>();
  /** Barcode → variant label, across every variant group of the product. */
  const seenBarcodes = new Map<string, string>();
  const optionSets: ShopProductInput["optionSets"] = [];
  for (const set of draft.sets) {
    const pricePaise = rupeesToPaise(set.price);
    if (pricePaise === null) {
      const message = set.price.trim() ? "Enter a valid amount like 999 or 999.50" : "Enter a price";
      return { error: message, fieldErrors: { priceBySet: { [set.key]: message } } };
    }
    const options = set.options.filter((option) => option.name.trim() || option.values.length > 0);
    for (const option of options) {
      if (!option.name.trim()) return { error: "Name each option, such as Size or Colour" };
      if (option.values.length === 0) return { error: `Add at least one ${option.name.trim()}` };
    }
    const combos = options.length === 0 ? [[]] : combinations(options);
    const overrides = [];
    const skus = [];
    const barcodes = [];
    const imageGroups = [];
    for (const values of combos) {
      const key = variantKey(values);
      const label = values.length > 0 ? values.join(" / ") : "This product";
      if (seen.has(key)) return { error: `${label} is already in another variant group` };
      seen.add(key);
      // A blank variant price means "same as the group price".
      const custom = (set.overrides[key] ?? "").trim();
      if (custom) {
        const customPaise = rupeesToPaise(custom);
        if (customPaise === null) return { error: `Enter a valid price for ${label}` };
        if (customPaise !== pricePaise) overrides.push({ key, pricePaise: customPaise });
      }
      const sku = (set.skus[key] ?? "").trim();
      if (sku) {
        if (sku.length > 64) return { error: `SKU for ${label} must be 64 characters or less` };
        skus.push({ key, sku });
      }
      const barcode = (set.barcodes[key] ?? "").trim();
      if (barcode) {
        if (barcode.length > 64) return { error: `Barcode for ${label} must be 64 characters or less` };
        if (!/^[\x21-\x7E]+$/.test(barcode)) return { error: `Barcode for ${label} can't contain spaces or special characters` };
        const other = seenBarcodes.get(barcode);
        if (other) return { error: `${other} and ${label} have the same barcode` };
        seenBarcodes.set(barcode, label);
        barcodes.push({ key, barcode });
      }
      const photos = set.images[key] ?? [];
      if (photos.length > 0) {
        imageGroups.push({ key, images: photos.map((image) => ({ mediaId: image.mediaId, alt: image.alt })) });
      }
    }
    optionSets.push({
      pricePaise,
      options: options.map((option) => {
        const images = option.values.flatMap((value) => {
          const photos = option.images[valueKey(value)] ?? [];
          if (photos.length === 0) return [];
          return [{ value: value.trim(), images: photos.map((image) => ({ mediaId: image.mediaId, alt: image.alt })) }];
        });
        return {
          name: option.name.trim(),
          values: option.values,
          ...(option.listOnShop ? { listOnShop: true } : {}),
          ...(images.length > 0 ? { images } : {}),
        };
      }),
      ...(overrides.length > 0 ? { overrides } : {}),
      ...(skus.length > 0 ? { skus } : {}),
      ...(barcodes.length > 0 ? { barcodes } : {}),
      ...(imageGroups.length > 0 ? { images: imageGroups } : {}),
    });
  }
  return {
    input: {
      name: draft.name.trim(),
      description: draft.description.trim(),
      categoryId: draft.categoryId || null,
      listed: draft.listed,
      gstPercent,
      priceIncludesGst,
      returnsEnabled: draft.returnsEnabled,
      returnDays,
      optionSets,
      images: draft.images.map((image) => ({ mediaId: image.mediaId, alt: image.alt })),
    },
  };
}

export function setsFromProduct(product: ShopProduct): SetDraft[] {
  if ((product.optionSets ?? []).length === 0) return [blankSet()];
  const skuByName = new Map(product.variants.map((variant) => [variant.name.toLowerCase(), variant.sku ?? ""]));
  return product.optionSets.map((set) => {
    const skusFromSet = Object.fromEntries((set.skus ?? []).map((row) => [row.key, row.sku]));
    const options: OptionDraft[] = set.options.map((option) => ({
      key: crypto.randomUUID(),
      name: option.name,
      values: [...option.values],
      listOnShop: option.listOnShop === true,
      images: Object.fromEntries(
        (option.images ?? []).flatMap((group) => {
          const photos = group.images.flatMap((image) => (image.url ? [{ mediaId: image.mediaId, url: image.url, alt: image.alt }] : []));
          return photos.length > 0 ? [[valueKey(group.value), photos] as const] : [];
        }),
      ),
    }));
    const combos = options.some((option) => option.values.length > 0) ? combinations(options) : [[]];
    // Older products stored SKUs on the variants only; carry them over by name.
    const skus: Record<string, string> = { ...skusFromSet };
    for (const values of combos) {
      const key = variantKey(values);
      if (skus[key]) continue;
      const label = values.length > 0 ? values.join(" / ") : "Standard";
      const fromVariant = skuByName.get(label.toLowerCase());
      if (fromVariant) skus[key] = fromVariant;
    }
    return {
      key: crypto.randomUUID(),
      price: paiseToRupees(set.pricePaise),
      options,
      overrides: Object.fromEntries((set.overrides ?? []).map((override) => [override.key, paiseToRupees(override.pricePaise)])),
      skus,
      barcodes: Object.fromEntries((set.barcodes ?? []).map((row) => [row.key, row.barcode])),
      images: Object.fromEntries((set.images ?? []).map((group) => [group.key, group.images])),
      photosBy: options.find((option) => Object.keys(option.images).length > 0)?.key ?? null,
    };
  });
}

export function draftFromProduct(product: ShopProduct, shopGstPercent: number, shopPriceIncludesGst: boolean): ProductDraft {
  return {
    id: product.id,
    originalCategoryId: product.categoryId,
    name: product.name,
    description: product.description ?? "",
    categoryId: product.categoryId ?? "",
    listed: product.listed !== false,
    gstOverride: product.gstPercent != null || product.priceIncludesGst != null,
    gstPercent: String(product.gstPercent ?? shopGstPercent),
    priceIncludesGst: product.priceIncludesGst ?? shopPriceIncludesGst,
    returnsEnabled: product.returnsEnabled !== false,
    returnDays: product.returnDays != null ? String(product.returnDays) : "",
    sets: setsFromProduct(product),
    images: product.images ?? [],
  };
}

/** Collapses the product to a single price with no options, keeping the first price and SKU-less. */
export function withoutOptions(draft: ProductDraft): ProductDraft {
  const first = draft.sets[0];
  return { ...draft, sets: [{ ...blankSet(), key: first?.key ?? crypto.randomUUID(), price: first?.price ?? "" }] };
}

/** Points per-value photos at another option; photos uploaded for the previous option are dropped. */
export function setPhotosBy(set: SetDraft, optionKey: string | null): SetDraft {
  return {
    ...set,
    photosBy: optionKey,
    options: set.options.map((option) => (option.key === optionKey ? option : { ...option, images: {} })),
  };
}
