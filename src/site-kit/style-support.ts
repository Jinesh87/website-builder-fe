import { STYLE_SUPPORT } from "./style-support.generated.ts";
import type { Section } from "./types.ts";

/** Style-tab controls whose effect depends on the section's own markup and CSS. */
export const STYLE_CONTROLS = [
  "background",
  "spacing",
  "containerWidth",
  "align",
  "font",
  "fontSize",
  "headingSize",
  "headingWeight",
  "headingItalic",
  "bodySize",
  "bodyWeight",
  "bodyItalic",
  "colorBackground",
  "colorText",
  "colorPrimary",
  "colorMuted",
  "colorBorder",
  "colorGradient",
] as const;
export type StyleControl = (typeof STYLE_CONTROLS)[number];

const LAYOUT_FIELDS = ["variant", "design", "layout", "mode", "style"] as const;

/** Which layout of its type a section uses, e.g. "variant=split" ("-" when the type has one layout). */
export function styleVariantKey(section: Pick<Section, "data">): string {
  const data = (section.data ?? {}) as Record<string, unknown>;
  for (const field of LAYOUT_FIELDS) {
    const value = data[field];
    if (typeof value === "string" && value) return `${field}=${value}`;
  }
  return "-";
}

/**
 * Style controls that visibly change this section, measured per layout by the style audit
 * (scripts/style-audit). Falls back to every layout of the type, and to null (show everything)
 * for section types the audit has not seen.
 */
export function supportedStyleControls(section: Pick<Section, "type" | "data">): ReadonlySet<StyleControl> | null {
  const byLayout = STYLE_SUPPORT[section.type];
  if (!byLayout) return null;
  const controls = byLayout[styleVariantKey(section)] ?? byLayout["*"];
  return controls ? new Set(controls) : null;
}
