/**
 * Vintage Reels design system (template 2143).
 *
 * All section and component styles have been moved to their respective modular stylesheets:
 * - Header: src/site-kit/header-styles.ts
 * - Cards (Film Vault, Polaroid Grid): src/site-kit/cards-styles.ts
 * - Blog (Vintage Journal): src/site-kit/blog-styles.ts
 * - Base tokens, Hero, Services, Features, Pull Quote, CTA, Footer: src/site-kit/styles.ts
 */
import type { FontKey } from "./fonts.ts";
import type { Section } from "./types.ts";

/** Fonts this stylesheet sets directly, so published pages must load them besides the theme fonts. */
export const VINTAGE_FONTS: readonly FontKey[] = ["playfair-display", "jetbrains-mono"];

const VINTAGE_VARIANTS = new Set([
  "vintage-editorial",
  "vintage-sunburst",
  "editorial-specs",
  "film-vault",
  "editorial-process",
  "colored-pillars",
  "polaroid-grid",
  "pull-quote",
  "vintage-journal",
  "vintage-story",
  "vintage-banner",
  "clapper-slate",
]);

export function usesVintageStyles(section: Section): boolean {
  const data = section.data as { variant?: unknown; imageStyle?: unknown };
  return (typeof data.variant === "string" && VINTAGE_VARIANTS.has(data.variant)) || data.imageStyle === "polaroid";
}

/** Legacy export kept for backward compatibility; styles are now split across component stylesheets */
export const VINTAGE_CSS = "";
