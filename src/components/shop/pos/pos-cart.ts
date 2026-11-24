import type { PosCatalogProduct, PosCatalogVariant } from "../../../api/shop-pos.ts";

/** One line in the till's cart. */
export type PosCartLine = {
  variantId: string;
  productName: string;
  variantName: string;
  unitPaise: number;
  quantity: number;
  /** Most that can be sold (live stock when the catalogue loaded). */
  available: number;
};

export type PosDiscount = { type: "amount" | "percent"; value: number };

export type PosTotals = {
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  itemCount: number;
  /** Set when the discount is more than the cart. */
  discountError: string | null;
};

/** Adds one unit, or does nothing when the variant is sold out / already at its limit. */
export function addToCart(cart: PosCartLine[], product: PosCatalogProduct, variant: PosCatalogVariant): PosCartLine[] {
  const existing = cart.find((line) => line.variantId === variant.id);
  if (existing) {
    return existing.quantity >= variant.available ? cart : setQuantity(cart, variant.id, existing.quantity + 1);
  }
  if (variant.available <= 0) return cart;
  return [
    ...cart,
    {
      variantId: variant.id,
      productName: product.name,
      variantName: variant.name,
      unitPaise: variant.unitPaise,
      quantity: 1,
      available: variant.available,
    },
  ];
}

/** Clamped to 1…available; 0 or less removes the line. */
export function setQuantity(cart: PosCartLine[], variantId: string, quantity: number): PosCartLine[] {
  if (quantity <= 0) return cart.filter((line) => line.variantId !== variantId);
  return cart.map((line) =>
    line.variantId === variantId ? { ...line, quantity: Math.min(Math.floor(quantity), line.available) } : line,
  );
}

/** Same arithmetic as the server: percent rounds to whole paise; a discount can't exceed the cart. */
export function cartTotals(cart: PosCartLine[], discount: PosDiscount | null): PosTotals {
  const subtotalPaise = cart.reduce((sum, line) => sum + line.unitPaise * line.quantity, 0);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  let discountPaise = 0;
  if (discount && discount.value > 0) {
    discountPaise =
      discount.type === "percent"
        ? Math.round((subtotalPaise * Math.min(100, discount.value)) / 100)
        : Math.round(discount.value);
  }
  if (discountPaise > subtotalPaise) {
    return { subtotalPaise, discountPaise: 0, totalPaise: subtotalPaise, itemCount, discountError: "Discount is more than the cart total." };
  }
  return { subtotalPaise, discountPaise, totalPaise: subtotalPaise - discountPaise, itemCount, discountError: null };
}

/**
 * The variant a scanned or typed code belongs to: an exact barcode match first, then an exact SKU
 * (shops that put the barcode number in the SKU keep working). Ignores case and surrounding spaces.
 */
export function findByCode(
  products: PosCatalogProduct[],
  code: string,
): { product: PosCatalogProduct; variant: PosCatalogVariant } | null {
  const wanted = code.trim().toLowerCase();
  if (!wanted) return null;
  for (const field of ["barcode", "sku"] as const) {
    for (const product of products) {
      const variant = product.variants.find((item) => item[field]?.trim().toLowerCase() === wanted);
      if (variant) return { product, variant };
    }
  }
  return null;
}

/** Products whose name, category, variant name or SKU contain the search text. */
export function filterCatalog(products: PosCatalogProduct[], search: string, categoryId: string | null): PosCatalogProduct[] {
  const needle = search.trim().toLowerCase();
  return products.filter((product) => {
    if (categoryId && product.categoryId !== categoryId) return false;
    if (!needle) return true;
    return (
      product.name.toLowerCase().includes(needle) ||
      (product.categoryName?.toLowerCase().includes(needle) ?? false) ||
      product.variants.some(
        (variant) =>
          variant.name.toLowerCase().includes(needle) ||
          (variant.sku?.toLowerCase().includes(needle) ?? false) ||
          (variant.barcode?.toLowerCase().includes(needle) ?? false),
      )
    );
  });
}

/** Rupees typed by the cashier ("1,250.50") to paise; null when not a number. */
export function rupeesToPaise(text: string): number | null {
  const cleaned = text.replace(/[,\s₹]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
}
