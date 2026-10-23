import type { CSSProperties } from "react";
import {
  HERO_ALIGNS,
  HERO_BUTTON_RADIUS_MAX,
  HERO_BUTTON_SHAPES,
  type HeroAlign,
  type HeroAlignElement,
  type HeroButtonShape,
  type HeroData,
  type SectionSettings,
} from "./types.ts";

export function isHeroAlign(value: unknown): value is HeroAlign {
  return typeof value === "string" && (HERO_ALIGNS as readonly string[]).includes(value);
}

export function isHeroButtonShape(value: unknown): value is HeroButtonShape {
  return typeof value === "string" && (HERO_BUTTON_SHAPES as readonly string[]).includes(value);
}

/**
 * Alignment applied to every hero element. `undefined` keeps the layout's own
 * default, so heroes saved before these controls existed render unchanged.
 */
export function heroBaseAlign(data: HeroData, settings: SectionSettings): HeroAlign | undefined {
  const all = data.alignment?.all;
  if (isHeroAlign(all)) return all;
  if (data.variant === "campaign-banner") {
    return isHeroAlign(data.contentAlign) ? data.contentAlign : undefined;
  }
  return settings.align === "left" ? "left" : undefined;
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

export const HERO_BUTTON_RADIUS: Record<Exclude<HeroButtonShape, "custom">, string> = {
  square: "0px",
  soft: "6px",
  rounded: "12px",
  pill: "9999px",
  oval: "50%",
};

export const HERO_BUTTON_RADIUS_DEFAULT = 12;

export function clampButtonRadius(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(Math.max(Math.round(value), 0), HERO_BUTTON_RADIUS_MAX);
}

/** CSS radius for a shape, or `undefined` to keep the theme radius. */
export function heroButtonRadius(shape: unknown, customRadius: unknown): string | undefined {
  if (!isHeroButtonShape(shape)) return undefined;
  if (shape !== "custom") return HERO_BUTTON_RADIUS[shape];
  const radius = clampButtonRadius(customRadius);
  return radius === undefined ? undefined : `${radius}px`;
}

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
