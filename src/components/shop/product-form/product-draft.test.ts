import { describe, expect, it } from "vitest";
import type { ShopProduct } from "../../../api/shop.ts";
import {
  STANDARD_KEY,
  blankOption,
  blankProduct,
  draftFromProduct,
  hasOptions,
  setPhotosBy,
  toInput,
  variantKey,
  withoutOptions,
  type ProductDraft,
} from "./product-draft.ts";

const photo = (id: string) => ({ mediaId: id, url: `https://example.test/${id}.webp`, alt: id });

function simple(price = "499"): ProductDraft {
  const draft = blankProduct();
  return { ...draft, name: "Chair", sets: [{ ...draft.sets[0]!, price }] };
}

function withColourAndSize(): ProductDraft {
  const draft = simple();
  const colour = { ...blankOption(), name: "Colour", values: ["Red", "Blue"] };
  const size = { ...blankOption(), name: "Size", values: ["S", "M"] };
  return { ...draft, sets: [{ ...draft.sets[0]!, options: [colour, size] }] };
}

function input(draft: ProductDraft) {
  const result = toInput(draft);
  if ("error" in result) throw new Error(result.error);
  return result.input;
}

describe("new product", () => {
  it("starts with no options, so a simple product needs only a name and price", () => {
    const draft = blankProduct();
    expect(hasOptions(draft)).toBe(false);
    expect(input(simple()).optionSets).toEqual([{ pricePaise: 49900, options: [] }]);
  });

  it("saves the SKU of a product without options", () => {
    const draft = simple();
    draft.sets[0]!.skus[STANDARD_KEY] = "CH-01";
    expect(input(draft).optionSets[0]?.skus).toEqual([{ key: "", sku: "CH-01" }]);
  });

  it("asks for a price against the right field", () => {
    const result = toInput(simple(""));
    expect(result).toMatchObject({ error: "Enter a price" });
    if ("error" in result) expect(Object.values(result.fieldErrors?.priceBySet ?? {})).toEqual(["Enter a price"]);
  });
});

describe("variant prices", () => {
  it("treats a blank variant price as the group price", () => {
    const draft = withColourAndSize();
    draft.sets[0]!.overrides = { [variantKey(["Red", "S"])]: "", [variantKey(["Blue", "M"])]: "  " };
    expect(input(draft).optionSets[0]?.overrides).toBeUndefined();
  });

  it("keeps a different variant price and drops one equal to the group price", () => {
    const draft = withColourAndSize();
    draft.sets[0]!.overrides = { [variantKey(["Red", "S"])]: "549", [variantKey(["Blue", "M"])]: "499.00" };
    expect(input(draft).optionSets[0]?.overrides).toEqual([{ key: variantKey(["Red", "S"]), pricePaise: 54900 }]);
  });

  it("rejects a malformed variant price", () => {
    const draft = withColourAndSize();
    draft.sets[0]!.overrides = { [variantKey(["Red", "S"])]: "abc" };
    expect(toInput(draft)).toMatchObject({ error: "Enter a valid price for Red / S" });
  });
});

describe("option photos", () => {
  it("switching which option has photos clears the other option's photos", () => {
    const draft = withColourAndSize();
    const [colour, size] = draft.sets[0]!.options;
    const set = { ...draft.sets[0]!, options: [{ ...colour!, images: { red: [photo("r")] } }, size!] };
    const switched = setPhotosBy(set, size!.key);
    expect(switched.photosBy).toBe(size!.key);
    expect(switched.options[0]?.images).toEqual({});
  });

  it("removing all options keeps the price but nothing option-specific", () => {
    const draft = withColourAndSize();
    draft.sets[0]!.skus = { [variantKey(["Red", "S"])]: "X" };
    const cleared = withoutOptions(draft);
    expect(hasOptions(cleared)).toBe(false);
    expect(cleared.sets).toHaveLength(1);
    expect(cleared.sets[0]).toMatchObject({ price: "499", options: [], skus: {}, overrides: {} });
  });
});

describe("existing product", () => {
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
    images: [photo("cover")],
    variants: [],
    updatedAt: "",
    optionSets: [
      {
        pricePaise: 49900,
        options: [
          { name: "Colour", values: ["Red", "Blue"], images: [{ value: "Blue", images: [{ mediaId: "b", alt: "b", url: "https://example.test/b.webp" }] }] },
          { name: "Size", values: ["S", "M"] },
        ],
        overrides: [{ key: variantKey(["Red", "S"]), pricePaise: 54900 }],
        skus: [{ key: variantKey(["Blue", "M"]), sku: "TS-BM" }],
      },
    ],
  };

  it("opens with the option that has photos selected", () => {
    const draft = draftFromProduct(product, 18, true);
    const set = draft.sets[0]!;
    expect(set.photosBy).toBe(set.options[0]?.key);
    expect(draft.gstOverride).toBe(false);
  });

  it("saves unchanged when opened and saved again", () => {
    const saved = input(draftFromProduct(product, 18, true));
    expect(saved.optionSets).toEqual([
      {
        pricePaise: 49900,
        options: [
          { name: "Colour", values: ["Red", "Blue"], images: [{ value: "Blue", images: [{ mediaId: "b", alt: "b" }] }] },
          { name: "Size", values: ["S", "M"] },
        ],
        overrides: [{ key: variantKey(["Red", "S"]), pricePaise: 54900 }],
        skus: [{ key: variantKey(["Blue", "M"]), sku: "TS-BM" }],
      },
    ]);
    expect(saved.images).toEqual([{ mediaId: "cover", alt: "cover" }]);
  });
});

describe("barcodes", () => {
  it("saves a barcode per variant, trimmed", () => {
    const draft = withColourAndSize();
    draft.sets[0]!.barcodes[variantKey(["Red", "S"])] = " 8901000000017 ";
    expect(input(draft).optionSets[0]?.barcodes).toEqual([{ key: variantKey(["Red", "S"]), barcode: "8901000000017" }]);
  });

  it("rejects the same barcode on two variants, and spaces inside one", () => {
    const draft = withColourAndSize();
    draft.sets[0]!.barcodes[variantKey(["Red", "S"])] = "8901000000017";
    draft.sets[0]!.barcodes[variantKey(["Blue", "M"])] = "8901000000017";
    expect(toInput(draft)).toMatchObject({ error: "Red / S and Blue / M have the same barcode" });

    const spaced = simple();
    spaced.sets[0]!.barcodes[STANDARD_KEY] = "8901 0000";
    expect(toInput(spaced)).toMatchObject({ error: expect.stringContaining("can't contain spaces") });
  });

  it("removing all options drops the barcodes too", () => {
    const draft = withColourAndSize();
    draft.sets[0]!.barcodes[variantKey(["Red", "S"])] = "8901000000017";
    expect(input(withoutOptions(draft)).optionSets[0]?.barcodes).toBeUndefined();
  });
});
