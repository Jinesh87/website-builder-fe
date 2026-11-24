import { describe, expect, it } from "vitest";
import type { PosCatalogProduct } from "../../../api/shop-pos.ts";
import { addToCart, cartTotals, filterCatalog, findBySku, rupeesToPaise, setQuantity } from "./pos-cart.ts";

const kurta: PosCatalogProduct = {
  id: "p1",
  name: "Cotton Kurta",
  categoryId: "c1",
  categoryName: "Ethnic",
  imageUrl: null,
  listed: true,
  variants: [
    { id: "v-s", name: "S", sku: "KUR-S", imageUrl: null, unitPaise: 111000, gstPercent: 10, available: 2 },
    { id: "v-m", name: "M", sku: null, imageUrl: null, unitPaise: 111000, gstPercent: 10, available: 0 },
  ],
};
const saree: PosCatalogProduct = {
  id: "p2",
  name: "Silk Saree",
  categoryId: null,
  categoryName: null,
  imageUrl: null,
  listed: false,
  variants: [{ id: "v-std", name: "Standard", sku: "SAR-1", imageUrl: null, unitPaise: 155000, gstPercent: 10, available: 5 }],
};

describe("pos cart", () => {
  it("adds units up to the available stock and skips sold-out variants", () => {
    let cart = addToCart([], kurta, kurta.variants[0]);
    cart = addToCart(cart, kurta, kurta.variants[0]);
    cart = addToCart(cart, kurta, kurta.variants[0]);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
    expect(addToCart(cart, kurta, kurta.variants[1])).toBe(cart);
  });

  it("clamps typed quantities and removes a line at zero", () => {
    const cart = addToCart([], saree, saree.variants[0]);
    expect(setQuantity(cart, "v-std", 99)[0].quantity).toBe(5);
    expect(setQuantity(cart, "v-std", 0)).toEqual([]);
  });

  it("totals match the server's discount arithmetic", () => {
    const cart = setQuantity(addToCart(addToCart([], kurta, kurta.variants[0]), saree, saree.variants[0]), "v-s", 2);
    expect(cartTotals(cart, null)).toMatchObject({ subtotalPaise: 377000, totalPaise: 377000, itemCount: 3 });
    expect(cartTotals(cart, { type: "amount", value: 10000 })).toMatchObject({ discountPaise: 10000, totalPaise: 367000 });
    // 10% of ₹1,110 = ₹111 (the UPI test sale on the server).
    expect(cartTotals(addToCart([], kurta, kurta.variants[0]), { type: "percent", value: 10 })).toMatchObject({
      discountPaise: 11100,
      totalPaise: 99900,
    });
    expect(cartTotals(cart, { type: "amount", value: 999999999 }).discountError).toBeTruthy();
  });

  it("finds a scanned SKU and filters by text or category", () => {
    expect(findBySku([kurta, saree], " sar-1 ")?.variant.id).toBe("v-std");
    expect(findBySku([kurta, saree], "nope")).toBeNull();
    expect(filterCatalog([kurta, saree], "kur-s", null).map((p) => p.id)).toEqual(["p1"]);
    expect(filterCatalog([kurta, saree], "", "c1").map((p) => p.id)).toEqual(["p1"]);
  });

  it("reads rupee amounts typed at the till", () => {
    expect(rupeesToPaise("₹1,250.50")).toBe(125050);
    expect(rupeesToPaise("4000")).toBe(400000);
    expect(rupeesToPaise("abc")).toBeNull();
    expect(rupeesToPaise("")).toBeNull();
  });
});
