import {
  FONTS,
  isFontKey,
  richTextFonts,
  usesVintageStyles,
  VINTAGE_FONTS,
  type FontDefinition,
  type FontKey,
  type ThemeSettings,
} from "../../site-kit/index.ts";
import type { WebsitePage } from "../../api/websites.ts";

/** Fonts picked on individual words anywhere in the given content. */
function collectRichTextFonts(value: unknown, keys: Set<FontKey>) {
  if (typeof value === "string") richTextFonts(value, keys);
  else if (Array.isArray(value)) for (const item of value) collectRichTextFonts(item, keys);
  else if (value && typeof value === "object") for (const item of Object.values(value)) collectRichTextFonts(item, keys);
}

/** Theme fonts, per-section overrides, fonts that section styles set directly and fonts used on individual words. */
export function usedFonts(theme: ThemeSettings, pages: WebsitePage[], chrome: unknown[] = []): FontKey[] {
  const keys = new Set<FontKey>();
  for (const key of [theme.fonts.heading, theme.fonts.body]) if (isFontKey(key)) keys.add(key);
  for (const page of pages) {
    for (const section of page.sections) {
      if (isFontKey(section.settings?.font)) keys.add(section.settings.font);
      if (usesVintageStyles(section)) for (const key of VINTAGE_FONTS) keys.add(key);
      collectRichTextFonts(section.data, keys);
    }
  }
  for (const part of chrome) collectRichTextFonts(part, keys);
  return [...keys];
}

function definition(key: FontKey): FontDefinition {
  return FONTS[key];
}

/** System stacks have no web font to load. */
function hasWebFont(key: FontKey): boolean {
  return FONTS[key].stack.startsWith('"');
}

/** The app self-hosts "<Name> Variable" builds; Google Fonts serves the same family as "<Name>". */
function isVariableBuild(key: FontKey): boolean {
  return FONTS[key].stack.startsWith(`"${FONTS[key].label} Variable"`);
}

export function googleFontLinks(keys: FontKey[]): string[] {
  return keys.filter(hasWebFont).map((key) => {
    const family = encodeURIComponent(FONTS[key].label).replace(/%20/g, "+");
    const axes = definition(key).googleAxes ?? "wght@400;500;600;700";
    return `https://fonts.googleapis.com/css2?family=${family}:${axes}&display=swap`;
  });
}

/** Points the rendered font stacks at the Google Fonts family names. */
export function toGoogleFontNames(markup: string): string {
  let result = markup;
  for (const key of Object.keys(FONTS) as FontKey[]) {
    if (isVariableBuild(key)) result = result.replaceAll(`${FONTS[key].label} Variable`, FONTS[key].label);
  }
  return result;
}

const FONTSOURCE_WEIGHTS = [400, 500, 600, 700];

/** npm packages and imports that self-host the fonts, matching the app's own setup. */
export function fontsourcePackages(keys: FontKey[]): { packages: string[]; imports: string[] } {
  const packages: string[] = [];
  const imports: string[] = [];
  for (const key of keys.filter(hasWebFont)) {
    if (isVariableBuild(key)) {
      const css = definition(key).fontsourceCss;
      packages.push(`@fontsource-variable/${key}`);
      imports.push(...(css ? css.map((file) => `@fontsource-variable/${key}/${file}`) : [`@fontsource-variable/${key}`]));
      continue;
    }
    const name = key === "plex-sans" ? "ibm-plex-sans" : key === "mono" ? "ibm-plex-mono" : key;
    const weights = key === "poppins" ? [...FONTSOURCE_WEIGHTS, 800, 900] : FONTSOURCE_WEIGHTS;
    packages.push(`@fontsource/${name}`);
    imports.push(...weights.map((weight) => `@fontsource/${name}/${weight}.css`));
  }
  return { packages, imports };
}
