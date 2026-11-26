import { describe, expect, it } from "vitest";
import type { PosCatalogProduct } from "../../../api/shop-pos.ts";
import { createScanBuffer } from "./barcode-scanner.ts";
import { addToCart, cartTotals, rupeesToPaise, setQuantity } from "./pos-cart.ts";

const kurta: PosCatalogProduct = {
  id: "p1",
  name: "Cotton Kurta",
  categoryId: "c1",
  categoryName: "Ethnic",
  imageUrl: null,
  listed: true,
  variants: [
    { id: "v-s", name: "S", sku: "KUR-S", barcode: "8901000000017", imageUrl: null, unitPaise: 111000, gstPercent: 10, available: 2 },
    { id: "v-m", name: "M", sku: null, barcode: null, imageUrl: null, unitPaise: 111000, gstPercent: 10, available: 0 },
  ],
};
const saree: PosCatalogProduct = {
  id: "p2",
  name: "Silk Saree",
  categoryId: null,
  categoryName: null,
  imageUrl: null,
  listed: false,
  variants: [{ id: "v-std", name: "Standard", sku: "SAR-1", barcode: null, imageUrl: null, unitPaise: 155000, gstPercent: 10, available: 5 }],
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

  it("reads rupee amounts typed at the till", () => {
    expect(rupeesToPaise("₹1,250.50")).toBe(125050);
    expect(rupeesToPaise("4000")).toBe(400000);
    expect(rupeesToPaise("abc")).toBeNull();
    expect(rupeesToPaise("")).toBeNull();
  });
});

describe("barcode scanner buffer", () => {
  it("turns a fast burst ending in Enter into a code", () => {
    const buffer = createScanBuffer();
    let at = 1000;
    for (const key of "8901234567890") expect(buffer.feed(key, (at += 8))).toBeNull();
    expect(buffer.feed("Enter", (at += 8))).toBe("8901234567890");
  });

  it("ignores slow typing and too-short bursts", () => {
    const buffer = createScanBuffer();
    let at = 1000;
    for (const key of "12345") buffer.feed(key, (at += 300));
    expect(buffer.feed("Enter", (at += 300))).toBeNull();
    for (const key of "12") buffer.feed(key, (at += 5));
    expect(buffer.feed("Enter", (at += 5))).toBeNull();
  });
});
