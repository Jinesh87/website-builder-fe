import { describe, expect, it } from "vitest";
import {
  cardColorVars,
  cardsAspectRatios,
  cardsCornerRadius,
  clampDescriptionLines,
  resolveCardsButton,
  resolveCardsVariant,
  safeHexColor,
} from "./cards-layout.ts";
import { CARDS_PRESETS } from "./cards-defaults.ts";
import { createSection, SECTION_PRESETS } from "./registry.ts";

describe("cards layout helpers", () => {
  it("falls back to the product design for unknown variants", () => {
    expect(resolveCardsVariant("nope")).toBe("product-classic");
    expect(resolveCardsVariant("image-overlay")).toBe("image-overlay");
  });

  it("uses design defaults and derives the secondary button style", () => {
    expect(resolveCardsButton("product-classic", undefined)).toMatchObject({
      variant: "outline",
      secondaryVariant: "ghost",
      fullWidth: true,
      radius: undefined,
    });
    expect(resolveCardsButton("minimal-accent", { variant: "filled", shape: "pill" })).toMatchObject({
      variant: "filled",
      secondaryVariant: "outline",
      shape: "pill",
      radius: "9999px",
    });
  });

  it("clamps custom radii and description lines", () => {
    expect(cardsCornerRadius("custom", 500)).toBe("48px");
    expect(cardsCornerRadius("large", undefined)).toBe("28px");
    expect(cardsCornerRadius(undefined, 10)).toBeUndefined();
    expect(resolveCardsButton("floating-panel", { shape: "custom", radius: -4 }).radius).toBe("0px");
    expect(clampDescriptionLines(99, 2)).toBe(8);
    expect(clampDescriptionLines(undefined, 2)).toBe(2);
  });

  it("doubles the ratio for featured cards spanning two columns", () => {
    expect(cardsAspectRatios("4:3")).toEqual({ ratio: "4 / 3", wide: "8 / 3" });
    expect(cardsAspectRatios("auto")).toEqual({});
  });

  it("only lets plain hex colours into inline styles", () => {
    expect(safeHexColor("#0f172a")).toBe("#0F172A");
    expect(safeHexColor("rgb(0,0,0)")).toBeUndefined();
    expect(safeHexColor("red;background:url(x)") ?? "#000000").toMatch(/^#[0-9A-F]{6}$/);
    expect(cardColorVars({ backgroundColor: "#0F172A" })).toMatchObject({ "--wb-text": "#F8FAFC" });
    expect(cardColorVars({ backgroundColor: "#FFFFFF" })).toMatchObject({ "--wb-text": "#0F172A" });
    expect(cardColorVars({})).toBeUndefined();
  });

  it("registers one library preset per design", () => {
    const keys = SECTION_PRESETS.filter((preset) => preset.type === "cards").map((preset) => preset.key);
    expect(keys).toEqual(CARDS_PRESETS.map((preset) => preset.key));
    const variants = SECTION_PRESETS.filter((preset) => preset.type === "cards").map(
      (preset) => (preset.create().data as { variant?: string }).variant,
    );
    expect(new Set(variants).size).toBe(5);
    expect(createSection("cards").data.items.length).toBeGreaterThan(0);
  });
});
