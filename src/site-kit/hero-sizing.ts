import type { CSSProperties } from "react";
import type { HeroButtonSize, HeroData } from "./types.ts";

export const HERO_SIZING_LIMITS = {
  height: { min: 30, max: 100 },
  headingSize: { min: 20, max: 120 },
  textSize: { min: 12, max: 32 },
  gap: { min: 0, max: 64 },
  buttonsGap: { min: 0, max: 80 },
  textWidth: { min: 320, max: 1200 },
} as const;

type NumericKey = keyof typeof HERO_SIZING_LIMITS;

const NUMERIC: { key: NumericKey; className: string; variable: string; unit: string }[] = [
  { key: "height", className: "wb-hero-sz-height", variable: "--wb-hero-height", unit: "vh" },
  { key: "headingSize", className: "wb-hero-sz-heading", variable: "--wb-hero-heading", unit: "px" },
  { key: "textSize", className: "wb-hero-sz-text", variable: "--wb-hero-text", unit: "px" },
  { key: "gap", className: "wb-hero-sz-gap", variable: "--wb-hero-gap", unit: "px" },
  { key: "buttonsGap", className: "wb-hero-sz-btngap", variable: "--wb-hero-btngap", unit: "px" },
  { key: "textWidth", className: "wb-hero-sz-width", variable: "--wb-hero-width", unit: "px" },
];

const clamp = (value: number, key: NumericKey) =>
  Math.min(HERO_SIZING_LIMITS[key].max, Math.max(HERO_SIZING_LIMITS[key].min, value));

/** Classes + CSS variables for the hero's exact sizes; only the values that are set are applied. */
export function heroSizingProps(data: HeroData): { className: string; style: CSSProperties } {
  const sizing = data.sizing ?? {};
  const classes: string[] = [];
  const style: Record<string, string> = {};
  for (const { key, className, variable, unit } of NUMERIC) {
    const value = sizing[key];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    classes.push(className);
    style[variable] = `${clamp(value, key)}${unit}`;
  }
  if (sizing.buttonSize) classes.push(`wb-hero-btn-size-${sizing.buttonSize satisfies HeroButtonSize}`);
  return { className: classes.join(" "), style: style as CSSProperties };
}

/**
 * `.wb-section.wb-hero` outranks the section-level heading/body size presets (which use !important),
 * so an exact size always wins over "Small / Medium / Large".
 *
 * Interpolated into SITE_CSS, so it must not contain backticks or template placeholders.
 */
export const HERO_SIZING_CSS = `
.wb-section.wb-hero.wb-hero-sz-height { min-height: var(--wb-hero-height) !important; display: flex; flex-direction: column; justify-content: center; }
.wb-section.wb-hero.wb-hero-sz-heading h1 { font-size: clamp(calc(var(--wb-hero-heading) * 0.6), 7vw, var(--wb-hero-heading)) !important; }
.wb-section.wb-hero.wb-hero-sz-text .wb-hero-sub,
.wb-section.wb-hero.wb-hero-sz-text .wb-hero-desc { font-size: clamp(calc(var(--wb-hero-text) * 0.85), 2.6vw, var(--wb-hero-text)) !important; }
.wb-section.wb-hero.wb-hero-sz-gap .wb-hero-copy { gap: var(--wb-hero-gap) !important; }
.wb-section.wb-hero.wb-hero-sz-btngap .wb-hero-actions { margin-top: var(--wb-hero-btngap) !important; }
.wb-section.wb-hero.wb-hero-sz-width .wb-hero-copy { max-width: var(--wb-hero-width) !important; }
.wb-section.wb-hero.wb-hero-sz-width .wb-hero-sub,
.wb-section.wb-hero.wb-hero-sz-width .wb-hero-desc { max-width: none !important; }

.wb-section.wb-hero.wb-hero-btn-size-sm .wb-hero-actions .wb-btn { min-height: 36px !important; padding: 6px 16px !important; font-size: 13.5px !important; }
.wb-section.wb-hero.wb-hero-btn-size-md .wb-hero-actions .wb-btn { min-height: 44px !important; padding: 10px 22px !important; font-size: 15px !important; }
.wb-section.wb-hero.wb-hero-btn-size-lg .wb-hero-actions .wb-btn { min-height: 52px !important; padding: 13px 30px !important; font-size: 16.5px !important; }
.wb-section.wb-hero.wb-hero-btn-size-xl .wb-hero-actions .wb-btn { min-height: 60px !important; padding: 16px 38px !important; font-size: 18px !important; }
`;
