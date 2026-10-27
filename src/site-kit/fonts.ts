export const FONT_CATEGORIES = ["sans", "serif", "display", "mono"] as const;

export type FontCategory = (typeof FONT_CATEGORIES)[number];

export type FontDefinition = {
  label: string;
  category: FontCategory;
  stack: string;
  /** Google Fonts axis spec; defaults to static weights 400–700. */
  googleAxes?: string;
  /** Fontsource stylesheets to import instead of the package default. */
  fontsourceCss?: readonly string[];
};

const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF = 'Georgia, Cambria, "Times New Roman", serif';
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function family(name: string, fallback: string): string {
  return `"${name}", ${fallback}`;
}

export const FONTS = {
  inter: {
    label: "Inter",
    category: "sans",
    stack: family("Inter Variable", SANS),
  },
  geist: {
    label: "Geist",
    category: "sans",
    stack: family("Geist Variable", SANS),
  },
  manrope: {
    label: "Manrope",
    category: "sans",
    stack: family("Manrope Variable", SANS),
  },
  "plus-jakarta-sans": {
    label: "Plus Jakarta Sans",
    category: "sans",
    stack: family("Plus Jakarta Sans Variable", SANS),
  },
  "dm-sans": {
    label: "DM Sans",
    category: "sans",
    stack: family("DM Sans Variable", SANS),
  },
  outfit: {
    label: "Outfit",
    category: "sans",
    stack: family("Outfit Variable", SANS),
  },
  sora: {
    label: "Sora",
    category: "sans",
    stack: family("Sora Variable", SANS),
  },
  figtree: {
    label: "Figtree",
    category: "sans",
    stack: family("Figtree Variable", SANS),
  },
  onest: {
    label: "Onest",
    category: "sans",
    stack: family("Onest Variable", SANS),
  },
  urbanist: {
    label: "Urbanist",
    category: "sans",
    stack: family("Urbanist Variable", SANS),
  },
  lexend: {
    label: "Lexend",
    category: "sans",
    stack: family("Lexend Variable", SANS),
  },
  rubik: {
    label: "Rubik",
    category: "sans",
    stack: family("Rubik Variable", SANS),
  },
  "open-sans": {
    label: "Open Sans",
    category: "sans",
    stack: family("Open Sans Variable", SANS),
  },
  roboto: {
    label: "Roboto",
    category: "sans",
    stack: family("Roboto Variable", SANS),
  },
  montserrat: {
    label: "Montserrat",
    category: "sans",
    stack: family("Montserrat Variable", SANS),
  },
  raleway: {
    label: "Raleway",
    category: "sans",
    stack: family("Raleway Variable", SANS),
  },
  nunito: {
    label: "Nunito",
    category: "sans",
    stack: family("Nunito Variable", SANS),
  },
  "work-sans": {
    label: "Work Sans",
    category: "sans",
    stack: family("Work Sans Variable", SANS),
  },
  mulish: {
    label: "Mulish",
    category: "sans",
    stack: family("Mulish Variable", SANS),
  },
  poppins: {
    label: "Poppins",
    category: "sans",
    stack: family("Poppins", SANS),
  },
  "plex-sans": {
    label: "IBM Plex Sans",
    category: "sans",
    stack: family("IBM Plex Sans", SANS),
  },
  system: { label: "System UI", category: "sans", stack: SANS },

  "space-grotesk": {
    label: "Space Grotesk",
    category: "display",
    stack: family("Space Grotesk Variable", SANS),
  },
  "bricolage-grotesque": {
    label: "Bricolage Grotesque",
    category: "display",
    stack: family("Bricolage Grotesque Variable", SANS),
  },
  syne: {
    label: "Syne",
    category: "display",
    stack: family("Syne Variable", SANS),
  },
  unbounded: {
    label: "Unbounded",
    category: "display",
    stack: family("Unbounded Variable", SANS),
  },
  archivo: {
    label: "Archivo",
    category: "display",
    stack: family("Archivo Variable", SANS),
  },

  "playfair-display": {
    label: "Playfair Display",
    category: "serif",
    stack: family("Playfair Display Variable", SERIF),
    googleAxes: "ital,wght@0,400..900;1,400..900",
  },
  lora: {
    label: "Lora",
    category: "serif",
    stack: family("Lora Variable", SERIF),
  },
  fraunces: {
    label: "Fraunces",
    category: "serif",
    stack: family("Fraunces Variable", SERIF),
    googleAxes: "ital,opsz,wght@0,9..144,100..900;1,9..144,100..900",
    fontsourceCss: ["opsz.css", "opsz-italic.css"],
  },
  merriweather: {
    label: "Merriweather",
    category: "serif",
    stack: family("Merriweather Variable", SERIF),
  },
  "eb-garamond": {
    label: "EB Garamond",
    category: "serif",
    stack: family("EB Garamond Variable", SERIF),
  },
  cormorant: {
    label: "Cormorant",
    category: "serif",
    stack: family("Cormorant Variable", SERIF),
  },
  "source-serif-4": {
    label: "Source Serif 4",
    category: "serif",
    stack: family("Source Serif 4 Variable", SERIF),
  },
  "noto-serif": {
    label: "Noto Serif",
    category: "serif",
    stack: family("Noto Serif Variable", SERIF),
  },
  serif: { label: "Georgia", category: "serif", stack: SERIF },

  "jetbrains-mono": {
    label: "JetBrains Mono",
    category: "mono",
    stack: family("JetBrains Mono Variable", MONO),
  },
  "fira-code": {
    label: "Fira Code",
    category: "mono",
    stack: family("Fira Code Variable", MONO),
  },
  "roboto-mono": {
    label: "Roboto Mono",
    category: "mono",
    stack: family("Roboto Mono Variable", MONO),
  },
  mono: {
    label: "IBM Plex Mono",
    category: "mono",
    stack: family("IBM Plex Mono", MONO),
  },
} as const satisfies Record<string, FontDefinition>;

export type FontKey = keyof typeof FONTS;

export const FONT_KEYS = Object.keys(FONTS) as [FontKey, ...FontKey[]];

export const DEFAULT_FONT: FontKey = "plex-sans";

export function isFontKey(value: unknown): value is FontKey {
  return typeof value === "string" && Object.hasOwn(FONTS, value);
}

/** Safe CSS stack for a stored key; unknown keys fall back to the default font. */
export function fontStack(key: string | undefined): string {
  return isFontKey(key) ? FONTS[key].stack : FONTS[DEFAULT_FONT].stack;
}
