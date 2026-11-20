import { describe, expect, it } from "vitest";
import type { ShopProduct, ShopVariant } from "../../api/shop.ts";
import { combinations, payablePaise, sharedValuePhotos, variantOptions, variantPhotos } from "./product-variants.ts";

const image = (id: string) => ({ mediaId: id, url: `https://example.test/${id}.webp`, alt: id });

const product: ShopProduct = {
  id: "p1",
  name: "T-shirt",
  slug: "t-shirt",
  description: null,
  categoryId: null,
  categoryName: "",
  listed: true,
  gstPercent: null,
  priceIncludesGst: null,
  returnsEnabled: true,
  returnDays: null,
  images: [image("main")],
  variants: [],
  updatedAt: "",
  optionSets: [
    {
      pricePaise: 49900,
      options: [
        { name: "Colour", values: ["Red", "Blue"], listOnShop: true, images: [{ value: "red", images: [image("red")] }] },
        { name: "Size", values: ["S", "M"], images: [{ value: "M", images: [image("m")] }] },
      ],
    },
  ],
};

const variant = (name: string, images: ShopVariant["images"] = []): ShopVariant => ({
  id: name,
  name,
  sku: null,
  pricePaise: 49900,
  sortOrder: 0,
  quantity: 1,
  images,
});

describe("combinations", () => {
  it("pairs every value, skipping options with no values", () => {
    expect(combinations([{ values: ["Red", "Blue"] }, { values: [] }, { values: ["S", "M"] }])).toEqual([
      ["Red", "S"],
      ["Red", "M"],
      ["Blue", "S"],
      ["Blue", "M"],
    ]);
    expect(combinations([{ values: [] }])).toEqual([]);
  });
});

describe("variantOptions", () => {
  it("names each value and marks options listed separately in the shop", () => {
    expect(variantOptions(product, "Blue / S")).toEqual([
      { name: "Colour", value: "Blue", list: true },
      { name: "Size", value: "S" },
    ]);
    expect(variantOptions(product, "Green / S")).toEqual([]);
  });
});

describe("photos", () => {
  it("uses the later option's value photos first, matching values case-insensitively", () => {
    expect(sharedValuePhotos(product, "Red / M").map((photo) => photo.mediaId)).toEqual(["m"]);
    expect(sharedValuePhotos(product, "Red / S").map((photo) => photo.mediaId)).toEqual(["red"]);
    expect(sharedValuePhotos(product, "Blue / S")).toEqual([]);
  });

  it("falls back from the variant's own photos to value photos to the main photos", () => {
    expect(variantPhotos(product, variant("Red / S", [image("own")])).map((photo) => photo.mediaId)).toEqual(["own"]);
    expect(variantPhotos(product, variant("Red / S")).map((photo) => photo.mediaId)).toEqual(["red"]);
    expect(variantPhotos(product, variant("Blue / S")).map((photo) => photo.mediaId)).toEqual(["main"]);
  });
});

describe("payablePaise", () => {
  it("adds GST only when prices exclude it", () => {
    expect(payablePaise(10000, 18, false)).toBe(11800);
    expect(payablePaise(10000, 18, true)).toBe(10000);
    expect(payablePaise(10000, 0, false)).toBe(10000);
  });
});
