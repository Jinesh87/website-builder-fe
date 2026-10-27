import type { CSSProperties } from "react";
import { buttonShapeRadius, isButtonShape } from "./button-shape.ts";
import {
  CARDS_CORNERS,
  CARDS_DESCRIPTION_LINES_MAX,
  CARDS_RADIUS_MAX,
  CARDS_VARIANTS,
  type ButtonShape,
  type CardItem,
  type CardsButtonSettings,
  type CardsButtonSize,
  type CardsButtonVariant,
  type CardsCorner,
  type CardsData,
  type CardsHoverEffect,
  type CardsIconAlign,
  type CardsIconPlacement,
  type CardsIconShape,
  type CardsIconSize,
  type CardsIconVariant,
  type CardsImageAspect,
  type CardsVariant,
} from "./types.ts";
import { isLightColor, normalizeHexColor } from "../utils/colors.ts";

export type CssVars = CSSProperties & Record<`--${string}`, string | number>;

type VariantDefaults = {
  button: CardsButtonVariant;
  fullWidth: boolean;
  showArrow: boolean;
  aspect: CardsImageAspect;
  hover: CardsHoverEffect;
  descriptionLines: number;
};

export const CARDS_VARIANT_DEFAULTS: Record<CardsVariant, VariantDefaults> = {
  "product-classic": { button: "outline", fullWidth: true, showArrow: false, aspect: "4:3", hover: "lift", descriptionLines: 2 },
  "image-overlay": { button: "filled", fullWidth: false, showArrow: true, aspect: "3:4", hover: "zoom", descriptionLines: 3 },
  "horizontal-split": { button: "filled", fullWidth: false, showArrow: true, aspect: "16:9", hover: "lift", descriptionLines: 3 },
  "minimal-accent": { button: "link", fullWidth: false, showArrow: true, aspect: "16:9", hover: "glow", descriptionLines: 0 },
  "floating-panel": { button: "soft", fullWidth: false, showArrow: true, aspect: "4:3", hover: "lift", descriptionLines: 3 },
  "floating-icon": { button: "filled", fullWidth: false, showArrow: false, aspect: "4:3", hover: "lift", descriptionLines: 3 },
  "dos-donts": { button: "filled", fullWidth: false, showArrow: false, aspect: "auto", hover: "lift", descriptionLines: 0 },
  "film-vault": { button: "outline", fullWidth: false, showArrow: false, aspect: "4:3", hover: "lift", descriptionLines: 0 },
  "polaroid-grid": { button: "outline", fullWidth: false, showArrow: false, aspect: "4:3", hover: "lift", descriptionLines: 2 },
};

export function isCardsVariant(value: unknown): value is CardsVariant {
  return typeof value === "string" && (CARDS_VARIANTS as readonly string[]).includes(value);
}

export function resolveCardsVariant(value: unknown): CardsVariant {
  return isCardsVariant(value) ? value : "product-classic";
}

const SECONDARY_FOR: Record<CardsButtonVariant, CardsButtonVariant> = {
  filled: "outline",
  soft: "outline",
  outline: "ghost",
  ghost: "link",
  link: "link",
};

export type ResolvedCardsButton = {
  variant: CardsButtonVariant;
  secondaryVariant: CardsButtonVariant;
  size: CardsButtonSize;
  fullWidth: boolean;
  showArrow: boolean;
  shape?: ButtonShape;
  /** CSS radius, or undefined to follow the theme. */
  radius?: string;
};

export function resolveCardsButton(
  variant: CardsVariant,
  button: CardsButtonSettings | undefined,
): ResolvedCardsButton {
  const defaults = CARDS_VARIANT_DEFAULTS[variant];
  const primary = button?.variant ?? defaults.button;
  const radius = buttonShapeRadius(button?.shape, button?.radius);
  return {
    variant: primary,
    secondaryVariant: button?.secondaryVariant ?? SECONDARY_FOR[primary],
    size: button?.size ?? "md",
    fullWidth: button?.fullWidth ?? defaults.fullWidth,
    showArrow: button?.showArrow ?? defaults.showArrow,
    shape: radius && isButtonShape(button?.shape) ? button.shape : undefined,
    radius,
  };
}

export const CARDS_CORNER_RADIUS: Record<Exclude<CardsCorner, "custom">, string> = {
  square: "0px",
  soft: "8px",
  rounded: "16px",
  large: "28px",
};

export const CARDS_RADIUS_DEFAULT = 16;

export function isCardsCorner(value: unknown): value is CardsCorner {
  return typeof value === "string" && (CARDS_CORNERS as readonly string[]).includes(value);
}

export function clampCardRadius(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(Math.max(Math.round(value), 0), CARDS_RADIUS_MAX);
}

/** CSS radius for the card corners, or `undefined` to keep the theme radius. */
export function cardsCornerRadius(corner: unknown, customRadius: unknown): string | undefined {
  if (!isCardsCorner(corner)) return undefined;
  if (corner !== "custom") return CARDS_CORNER_RADIUS[corner];
  const radius = clampCardRadius(customRadius);
  return radius === undefined ? undefined : `${radius}px`;
}

const ASPECT_RATIOS: Record<Exclude<CardsImageAspect, "auto">, [number, number]> = {
  "16:9": [16, 9],
  "4:3": [4, 3],
  "1:1": [1, 1],
  "3:4": [3, 4],
};

/** CSS aspect ratios for one card and for a featured card spanning two columns. */
export function cardsAspectRatios(aspect: CardsImageAspect): { ratio?: string; wide?: string } {
  if (aspect === "auto") return {};
  const [width, height] = ASPECT_RATIOS[aspect];
  return { ratio: `${width} / ${height}`, wide: `${width * 2} / ${height}` };
}

export function clampDescriptionLines(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.round(value), 0), CARDS_DESCRIPTION_LINES_MAX);
}

/** Only plain #rrggbb values reach inline styles. */
export function safeHexColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const hex = normalizeHexColor(value);
  return hex && /^#[0-9A-F]{6}$/.test(hex) ? hex : undefined;
}

export const CARDS_ICON_SIZE_VALUES: Record<CardsIconSize, { box: number; svg: number }> = {
  sm: { box: 36, svg: 18 },
  md: { box: 44, svg: 22 },
  lg: { box: 52, svg: 26 },
  xl: { box: 60, svg: 30 },
};

export const CARDS_ICON_SHAPE_RADIUS: Record<Exclude<CardsIconShape, "custom">, string> = {
  square: "0px",
  rounded: "10px",
  circle: "9999px",
};

export function cardsIconRadius(shape?: CardsIconShape, custom?: number): string {
  if (shape === "custom" && typeof custom === "number" && Number.isFinite(custom)) {
    return `${Math.min(Math.max(Math.round(custom), 0), 48)}px`;
  }
  return CARDS_ICON_SHAPE_RADIUS[shape && shape in CARDS_ICON_SHAPE_RADIUS ? (shape as Exclude<CardsIconShape, "custom">) : "rounded"];
}

export type ResolvedCardsIcon = {
  placement: CardsIconPlacement;
  align: CardsIconAlign;
  variant: CardsIconVariant;
  shape: CardsIconShape;
  size: CardsIconSize;
  radius: string;
  boxSize: number;
  svgSize: number;
  bgColor?: string;
  color?: string;
  defaultIcon?: string;
  offsetY: number;
};

export function resolveCardsIcon(data: CardsData): ResolvedCardsIcon {
  const placement = data.iconPlacement ?? "float-seam";
  const align = data.iconAlign ?? "left";
  const variant = data.iconVariant ?? "filled";
  const shape = data.iconShape ?? "rounded";
  const size = data.iconSize ?? "md";
  const sizeVal = CARDS_ICON_SIZE_VALUES[size] ?? CARDS_ICON_SIZE_VALUES.md;
  const radius = cardsIconRadius(shape, data.iconRadius);
  const bgColor = safeHexColor(data.iconBgColor);
  const color = safeHexColor(data.iconColor);
  const defaultIcon =
    typeof data.defaultIcon === "string" && data.defaultIcon.trim() ? data.defaultIcon.trim() : undefined;
  const offsetY =
    typeof data.iconOffsetY === "number" && Number.isFinite(data.iconOffsetY)
      ? Math.min(Math.max(Math.round(data.iconOffsetY), -50), 50)
      : 0;

  return {
    placement,
    align,
    variant,
    shape,
    size,
    radius,
    boxSize: sizeVal.box,
    svgSize: sizeVal.svg,
    bgColor,
    color,
    defaultIcon,
    offsetY,
  };
}

/** Per-card colour overrides, with readable text on custom backgrounds. */
export function cardColorVars(
  item: Pick<CardItem, "backgroundColor" | "accentColor" | "iconBgColor" | "iconColor">,
): CssVars | undefined {
  const background = safeHexColor(item.backgroundColor);
  const accent = safeHexColor(item.accentColor);
  const iconBg = safeHexColor(item.iconBgColor);
  const iconColor = safeHexColor(item.iconColor);
  if (!background && !accent && !iconBg && !iconColor) return undefined;

  const vars: CssVars = {};
  if (accent) vars["--wb-cardset-accent"] = accent;
  if (iconBg) vars["--wb-cardset-item-icon-bg"] = iconBg;
  if (iconColor) vars["--wb-cardset-item-icon-color"] = iconColor;
  if (background) {
    const light = isLightColor(background);
    vars["--wb-cardset-card-bg"] = background;
    vars["--wb-text"] = light ? "#0F172A" : "#F8FAFC";
    vars["--wb-muted"] = light ? "#475569" : "#CBD5E1";
    vars["--wb-border"] = light ? "rgba(15, 23, 42, 0.12)" : "rgba(255, 255, 255, 0.16)";
  }
  return vars;
}
