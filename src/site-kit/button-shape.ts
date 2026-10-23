import { BUTTON_RADIUS_MAX, BUTTON_SHAPES, type ButtonShape } from "./types.ts";

export function isButtonShape(value: unknown): value is ButtonShape {
  return typeof value === "string" && (BUTTON_SHAPES as readonly string[]).includes(value);
}

export const BUTTON_SHAPE_RADIUS: Record<Exclude<ButtonShape, "custom">, string> = {
  square: "0px",
  soft: "6px",
  rounded: "12px",
  pill: "9999px",
  oval: "50%",
};

export const BUTTON_RADIUS_DEFAULT = 12;

export function clampButtonRadius(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(Math.max(Math.round(value), 0), BUTTON_RADIUS_MAX);
}

/** CSS radius for a shape, or `undefined` to keep the theme radius. */
export function buttonShapeRadius(shape: unknown, customRadius: unknown): string | undefined {
  if (!isButtonShape(shape)) return undefined;
  if (shape !== "custom") return BUTTON_SHAPE_RADIUS[shape];
  const radius = clampButtonRadius(customRadius);
  return radius === undefined ? undefined : `${radius}px`;
}
