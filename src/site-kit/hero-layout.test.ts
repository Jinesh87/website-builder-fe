import { describe, expect, it } from "vitest";
import { heroLayoutVariant, heroPlacementForVariant, heroVariantForPlacement } from "./hero-layout.ts";
import type { HeroData } from "./types.ts";

const hero = (data: Partial<HeroData>): HeroData => ({ variant: "split", heading: "Hi", ...data });

describe("heroVariantForPlacement", () => {
  it("stacks side-by-side heroes when media moves below the CTAs", () => {
    expect(heroVariantForPlacement("split", "bottom")).toBe("centered");
    expect(heroVariantForPlacement("split-left", "bottom")).toBe("centered");
  });

  it("keeps stacked variants that already show media below the CTAs", () => {
    expect(heroVariantForPlacement("gradient", "bottom")).toBe("gradient");
  });

  it("switches to a split layout for left and right placements", () => {
    expect(heroVariantForPlacement("centered", "right")).toBe("split");
    expect(heroVariantForPlacement("centered", "left")).toBe("split-left");
    expect(heroVariantForPlacement("split-left", "right")).toBe("split");
    expect(heroVariantForPlacement("floating-cards", "left")).toBe("floating-cards");
  });

  it("uses a background layout for the background placement", () => {
    expect(heroVariantForPlacement("split", "background")).toBe("background-image");
    expect(heroVariantForPlacement("video-bg", "background")).toBe("video-bg");
  });

  it("leaves bespoke layouts alone", () => {
    expect(heroVariantForPlacement("soft-card", "right")).toBe("soft-card");
  });
});

describe("heroPlacementForVariant", () => {
  it("matches the placement to the picked variant", () => {
    expect(heroPlacementForVariant("centered", "right")).toBe("bottom");
    expect(heroPlacementForVariant("split", "bottom")).toBe("right");
    expect(heroPlacementForVariant("split-left", "right")).toBe("left");
    expect(heroPlacementForVariant("background-image", "right")).toBe("background");
    expect(heroPlacementForVariant("centered", undefined)).toBeUndefined();
  });
});

describe("heroLayoutVariant", () => {
  it("renders saved split heroes with media below the CTAs as stacked", () => {
    expect(heroLayoutVariant(hero({ imagePosition: "bottom" }))).toBe("centered");
    expect(heroLayoutVariant(hero({}))).toBe("split");
  });
});
