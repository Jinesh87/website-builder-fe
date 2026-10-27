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
