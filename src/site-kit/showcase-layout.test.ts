import { describe, expect, it } from "vitest";
import {
  clampSummaryLines,
  groupShowcaseProducts,
  productsIn,
  resolveShowcaseDisplay,
  showcaseDesign,
  visibleProducts,
} from "./showcase-layout.ts";
import type { ShowcaseData } from "./showcase-types.ts";

const data = (overrides: Partial<ShowcaseData> = {}): ShowcaseData => ({
  mode: "products",
  heading: "Products",
  columns: 3,
  mobileColumns: 1,
  categories: [
    { id: "a", name: "Chairs" },
    { id: "b", name: "Tables" },
    { id: "c", name: "Lamps" },
  ],
  products: [
    { id: "1", name: "Oak chair", categoryId: "a" },
    { id: "2", name: "Desk", categoryId: "b" },
    { id: "3", name: "Stool", categoryId: "a" },
    { id: "4", name: "Rug" },
    { id: "5", name: "Orphan", categoryId: "deleted" },
  ],
  ...overrides,
});

describe("groupShowcaseProducts", () => {
  it("groups in category order, skips empty categories and puts uncategorised last", () => {
    const groups = groupShowcaseProducts(data());
    expect(groups.map((group) => group.category?.name ?? null)).toEqual(["Chairs", "Tables", null]);
    expect(groups[0]!.products.map((product) => product.id)).toEqual(["1", "3"]);
    expect(groups[2]!.products.map((product) => product.id)).toEqual(["4", "5"]);
  });

  it("has no uncategorised group when every product has a category", () => {
    const groups = groupShowcaseProducts(data({ products: [{ id: "1", name: "Oak chair", categoryId: "a" }] }));
    expect(groups).toHaveLength(1);
  });
});

describe("visibleProducts", () => {
  it("lists everything without a category filter", () => {
    expect(visibleProducts(data())).toHaveLength(5);
  });

  it("lists one category when one is chosen", () => {
    expect(visibleProducts(data({ categoryId: "b" })).map((product) => product.id)).toEqual(["2"]);
  });

  it("falls back to everything when the chosen category was deleted", () => {
    expect(visibleProducts(data({ categoryId: "gone" }))).toHaveLength(5);
  });
});

describe("productsIn", () => {
  it("treats unknown category ids as uncategorised", () => {
    expect(productsIn(data(), null).map((product) => product.id)).toEqual(["4", "5"]);
  });
});

describe("display settings", () => {
  it("shows most fields by default, but not the category label or count", () => {
    const display = resolveShowcaseDisplay(data());
    expect(display).toMatchObject({ image: true, name: true, price: true, category: false, count: false, summaryLines: 3 });
  });

  it("respects switches", () => {
    expect(resolveShowcaseDisplay(data({ showPrice: false, showCategory: true })).price).toBe(false);
    expect(resolveShowcaseDisplay(data({ showCategory: true })).category).toBe(true);
  });

  it("clamps summary lines and ignores unknown designs", () => {
    expect(clampSummaryLines(99)).toBe(6);
    expect(clampSummaryLines(-2)).toBe(0);
    expect(clampSummaryLines("x")).toBe(3);
    expect(showcaseDesign(data({ design: "nope" as never }))).toBe("classic");
  });
});
