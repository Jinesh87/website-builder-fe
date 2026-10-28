import type { CSSProperties } from "react";
import {
  BUTTON_RADIUS_DEFAULT,
  BUTTON_SHAPE_RADIUS,
  buttonShapeRadius,
  clampButtonRadius,
  isButtonShape,
} from "./button-shape.ts";
import {
  HERO_ALIGNS,
  type HeroAlign,
  type HeroAlignElement,
  type HeroData,
  type SectionSettings,
} from "./types.ts";

export type VintagePolaroid = NonNullable<HeroData["vintagePolaroids"]>[number];

/** The vintage editorial hero always shows two photos; heroes without both fall back to `image` and `secondaryImage`. */
export function vintageHeroPolaroids(data: HeroData): [VintagePolaroid, VintagePolaroid] {
  const saved = data.vintagePolaroids;
  if (saved && saved.length >= 2) return [saved[0]!, saved[1]!];
  return [
    {
      image: data.image ?? {
        url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
        alt: "Photographer with vintage camera",
      },
      caption: "Up for views, press 12",
      rotation: -3,
    },
    {
      image: data.secondaryImage ?? {
        url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
        alt: "Golden Hour Espresso Bar",
      },
      caption: "Golden Hour Espresso Bar",
      rotation: 4,
    },
  ];
}

export { clampButtonRadius };

export function isHeroAlign(value: unknown): value is HeroAlign {
  return typeof value === "string" && (HERO_ALIGNS as readonly string[]).includes(value);
}

export const isHeroButtonShape = isButtonShape;

/**
 * Alignment applied to every hero element. `undefined` keeps the layout's own
 * default, so heroes saved before these controls existed render unchanged.
 */
export function heroBaseAlign(data: HeroData, settings: SectionSettings): HeroAlign | undefined {
  const all = data.alignment?.all;
  if (isHeroAlign(all)) return all;
  if (isHeroAlign(data.contentAlign)) return data.contentAlign;
  if (isHeroAlign(settings.align)) return settings.align;

  // Layout default when no explicit alignment was set
  if (
    data.variant === "centered" ||
    data.variant === "gradient" ||
    data.variant === "curved-bottom" ||
    data.variant === "curved-carousel" ||
    data.variant === "minimal-typography"
  ) {
    return "center";
  }

  return undefined;
}

export function heroElementAlign(
  data: HeroData,
  element: HeroAlignElement,
  base: HeroAlign | undefined,
): HeroAlign | undefined {
  const own = data.alignment?.[element];
  return isHeroAlign(own) ? own : base;
}

/** Spread onto an element; renders nothing when no alignment is set. */
export function alignAttr(align: HeroAlign | undefined): { "data-wb-align"?: HeroAlign } {
  return align ? { "data-wb-align": align } : {};
}

export const HERO_BUTTON_RADIUS = BUTTON_SHAPE_RADIUS;

export const HERO_BUTTON_RADIUS_DEFAULT = BUTTON_RADIUS_DEFAULT;

export const heroButtonRadius = buttonShapeRadius;

type ButtonShapeProps = {
  className: string;
  style?: CSSProperties & Record<`--${string}`, string>;
};

export function heroButtonShapeProps(data: HeroData): ButtonShapeProps {
  const radius = heroButtonRadius(data.buttonShape, data.buttonRadius);
  if (!radius) return { className: "" };
  return {
    className: `wb-hero-btn-shaped wb-hero-btn-${data.buttonShape}`,
    style: { "--wb-hero-btn-radius": radius },
  };
}
