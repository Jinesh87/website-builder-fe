import type { CSSProperties } from "react";
import { fontStack, isFontKey } from "./fonts.ts";
import type { RadiusSize, SectionSettings, SpacingSize, ThemeSettings } from "./types.ts";

const RADIUS: Record<RadiusSize, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "16px",
};

const SECTION_SPACING: Record<SpacingSize, string> = {
  compact: "48px",
  normal: "80px",
  relaxed: "112px",
};

export const DEFAULT_THEME: ThemeSettings = {
  colors: {
    primary: "#0f7b6c",
    secondary: "#b4410f",
    background: "#ffffff",
    surface: "#f4f6f5",
    text: "#1a1d23",
    muted: "#5b6170",
  },
  fonts: { heading: "plex-sans", body: "plex-sans" },
  buttonStyle: "filled",
  cardStyle: "border",
  radius: "md",
  containerWidth: 1200,
  sectionSpacing: "normal",
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Theme values end up in CSS, so anything that isn't a plain hex color is dropped. */
function safeColor(value: string, fallback: string): string {
  return HEX_COLOR.test(value) ? value : fallback;
}

/** Black or white text, whichever reads better on the given hex background. */
export function contrastText(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}

function hexToRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16)) as [number, number, number];
}

function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/**
 * `color` as close to itself as possible while still readable on `background`:
 * blended towards `text` until it reaches the 3:1 contrast WCAG asks of large text and icons.
 */
function readableOn(color: string, background: string, text: string): string {
  if (contrastRatio(color, background) >= 3) return color;
  const from = hexToRgb(color);
  const to = hexToRgb(text);
  for (let step = 1; step <= 10; step++) {
    const amount = step / 10;
    const mixed = rgbToHex(from.map((channel, i) => channel + (to[i]! - channel) * amount) as [number, number, number]);
    if (contrastRatio(mixed, background) >= 3) return mixed;
  }
  return text;
}

export function themeToCssVars(theme: ThemeSettings): CSSProperties {
  const defaults = DEFAULT_THEME.colors;
  const colors = {
    primary: safeColor(theme.colors.primary, defaults.primary),
    secondary: safeColor(theme.colors.secondary, defaults.secondary),
    background: safeColor(theme.colors.background, defaults.background),
    surface: safeColor(theme.colors.surface, defaults.surface),
    text: safeColor(theme.colors.text, defaults.text),
    muted: safeColor(theme.colors.muted, defaults.muted),
  };
  const container = Number.isFinite(theme.containerWidth)
    ? Math.min(Math.max(Math.round(theme.containerWidth), 640), 1600)
    : DEFAULT_THEME.containerWidth;

  return {
    "--wb-primary": colors.primary,
    "--wb-on-primary": contrastText(colors.primary),
    "--wb-secondary": colors.secondary,
    "--wb-on-secondary": contrastText(colors.secondary),
    "--wb-secondary-ink": readableOn(colors.secondary, colors.background, colors.text),
    "--wb-bg": colors.background,
    "--wb-surface": colors.surface,
    "--wb-text": colors.text,
    "--wb-muted": colors.muted,
    "--wb-font-heading": fontStack(theme.fonts.heading),
    "--wb-font-body": fontStack(theme.fonts.body),
    "--wb-radius": RADIUS[theme.radius] ?? RADIUS.md,
    "--wb-container": `${container}px`,
    "--wb-section-y": SECTION_SPACING[theme.sectionSpacing] ?? SECTION_SPACING.normal,
  } as CSSProperties;
}

/**
 * Inline style for a section font override. Inherited `font-family` is already
 * resolved at the site root, so body text needs the property itself, not just the variable.
 */
export function sectionFontStyle(font: string | undefined): CSSProperties {
  if (!isFontKey(font)) return {};
  const stack = fontStack(font);
  return { "--wb-font-heading": stack, "--wb-font-body": stack, fontFamily: stack } as CSSProperties;
}

export const SECTION_FONT_SCALE: Record<string, string> = {
  small: "0.88",
  normal: "1",
  medium: "1.08",
  large: "1.22",
  huge: "1.38",
};

export const SECTION_HEADING_SCALE: Record<string, string> = {
  small: "0.82",
  normal: "1",
  medium: "1.12",
  large: "1.25",
  huge: "1.45",
};

export const SECTION_BODY_SIZE: Record<string, string> = {
  small: "13.5px",
  normal: "15px",
  medium: "16px",
  large: "18px",
  huge: "20px",
};

function parsePx(val: string | undefined): string | undefined {
  if (!val || val === "default") return undefined;
  if (/^\d+(\.\d+)?(px|rem|em|pt)$/i.test(val)) return val;
  if (/^\d+$/.test(val)) return `${val}px`;
  return undefined;
}

function parseWidth(val: string | undefined): string | undefined {
  if (!val || val === "default") return undefined;
  if (/^\d+(\.\d+)?(px|rem|em|vw|%|ch)$/i.test(val)) return val;
  if (/^\d+$/.test(val)) return `${val}px`;
  return undefined;
}

export function sectionTypographyStyle(settings: Partial<SectionSettings> | undefined): CSSProperties {
  if (!settings) return {};
  const style: Record<string, string> = {};
  if (settings.font && isFontKey(settings.font)) {
    const stack = fontStack(settings.font);
    style["--wb-font-heading"] = stack;
    style["--wb-font-body"] = stack;
    style["fontFamily"] = stack;
  }

  // Section container max-width:
  if (settings.containerWidth && settings.containerWidth !== "default") {
    const widthPresets: Record<string, string> = {
      narrow: "768px",
      medium: "1024px",
      wide: "1400px",
      full: "100%",
    };
    const resolvedWidth = widthPresets[settings.containerWidth] || parseWidth(settings.containerWidth);
    if (resolvedWidth) {
      style["--wb-section-max-width"] = resolvedWidth;
      style["--wb-container"] = resolvedWidth;
    }
  }

  // Overall section font scale / size:
  if (settings.fontSize && settings.fontSize !== "default") {
    if (SECTION_FONT_SCALE[settings.fontSize]) {
      style["--wb-font-scale"] = SECTION_FONT_SCALE[settings.fontSize];
    } else {
      const px = parsePx(settings.fontSize);
      if (px) {
        style["--wb-section-font-size"] = px;
        style["fontSize"] = px;
      } else if (/^\d+(\.\d+)?%$/.test(settings.fontSize)) {
        style["--wb-font-scale"] = `${parseFloat(settings.fontSize) / 100}`;
      }
    }
  }

  // Heading font size override:
  if (settings.headingSize && settings.headingSize !== "default") {
    if (SECTION_HEADING_SCALE[settings.headingSize]) {
      style["--wb-heading-scale"] = SECTION_HEADING_SCALE[settings.headingSize];
    } else {
      const px = parsePx(settings.headingSize);
      if (px) {
        style["--wb-heading-size"] = px;
      }
    }
  }

  // Body font size override:
  if (settings.bodySize && settings.bodySize !== "default") {
    if (SECTION_BODY_SIZE[settings.bodySize]) {
      style["--wb-body-size"] = SECTION_BODY_SIZE[settings.bodySize];
    } else {
      const px = parsePx(settings.bodySize);
      if (px) {
        style["--wb-body-size"] = px;
      }
    }
  }

  // Heading font weight:
  if (settings.headingWeight && settings.headingWeight !== "default") {
    const weightPresets: Record<string, string> = {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    };
    style["--wb-heading-weight"] = weightPresets[settings.headingWeight] || settings.headingWeight;
  }

  // Heading italic:
  if (settings.headingItalic) {
    style["--wb-heading-font-style"] = "italic";
  }

  // Body font weight:
  if (settings.bodyWeight && settings.bodyWeight !== "default") {
    const weightPresets: Record<string, string> = {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    };
    style["--wb-body-weight"] = weightPresets[settings.bodyWeight] || settings.bodyWeight;
  }

  // Body italic:
  if (settings.bodyItalic) {
    style["--wb-body-font-style"] = "italic";
  }

  return style as CSSProperties;
}

export function sectionTypographyClasses(settings: Partial<SectionSettings> | undefined): string {
  if (!settings) return "";
  const classes: string[] = [];
  if (settings.fontSize && settings.fontSize !== "default") {
    classes.push("wb-has-font-scale");
    if (SECTION_FONT_SCALE[settings.fontSize]) {
      classes.push(`wb-font-size-${settings.fontSize}`);
    }
  }
  if (settings.headingSize && settings.headingSize !== "default") {
    classes.push("wb-has-heading-size");
    if (SECTION_HEADING_SCALE[settings.headingSize]) {
      classes.push(`wb-heading-size-${settings.headingSize}`);
    }
  }
  if (settings.bodySize && settings.bodySize !== "default") {
    classes.push("wb-has-body-size");
    if (SECTION_BODY_SIZE[settings.bodySize]) {
      classes.push(`wb-body-size-${settings.bodySize}`);
    }
  }
  if (settings.containerWidth && settings.containerWidth !== "default") {
    classes.push(`wb-width-${settings.containerWidth}`);
  }
  if (settings.headingWeight && settings.headingWeight !== "default") {
    classes.push(`wb-heading-weight-${settings.headingWeight}`);
  }
  if (settings.headingItalic) {
    classes.push("wb-heading-italic");
  }
  if (settings.bodyWeight && settings.bodyWeight !== "default") {
    classes.push(`wb-body-weight-${settings.bodyWeight}`);
  }
  if (settings.bodyItalic) {
    classes.push("wb-body-italic");
  }
  return classes.join(" ");
}

