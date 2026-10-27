import type { CSSProperties } from "react";
import { sectionFontStyle, sectionTypographyClasses, sectionTypographyStyle } from "../theme.ts";
import type { SectionSettings } from "../types.ts";

/**
 * Section settings (background, custom colors, font, font size) for the header and footer, applied to their own root
 * element. Colors are CSS variables rather than an inline background, so a transparent header stays transparent.
 */
export function chromeStyle(settings: Partial<SectionSettings> | undefined): { className: string; style: CSSProperties } {
  if (!settings) return { className: "", style: {} };
  const colors = settings.customColors;
  const style = {
    ...sectionFontStyle(settings.font),
    ...sectionTypographyStyle(settings),
    ...(colors?.background ? { "--wb-bg": colors.background, "--wb-surface": colors.background } : {}),
    ...(colors?.text ? { "--wb-text": colors.text, color: colors.text } : {}),
    ...(colors?.muted ? { "--wb-muted": colors.muted } : {}),
    ...(colors?.primary ? { "--wb-primary": colors.primary } : {}),
    ...(colors?.border ? { "--wb-border": colors.border } : {}),
  } as CSSProperties;
  const preset = settings.background && settings.background !== "default" && !colors?.background ? settings.background : null;
  const typographyClass = sectionTypographyClasses(settings);
  const className = [preset ? `wb-chrome-bg-${preset}` : "", typographyClass].filter(Boolean).join(" ");
  return { className, style };
}
