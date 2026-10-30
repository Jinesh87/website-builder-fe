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
    googleAxes: "wght@100..900",
  },
  geist: {
    label: "Geist",
    category: "sans",
    stack: family("Geist Variable", SANS),
    googleAxes: "wght@100..900",
  },
  manrope: {
    label: "Manrope",
    category: "sans",
    stack: family("Manrope Variable", SANS),
    googleAxes: "wght@200..800",
  },
  "plus-jakarta-sans": {
    label: "Plus Jakarta Sans",
    category: "sans",
    stack: family("Plus Jakarta Sans Variable", SANS),
    googleAxes: "wght@200..800",
  },
  "dm-sans": {
    label: "DM Sans",
    category: "sans",
    stack: family("DM Sans Variable", SANS),
    googleAxes: "wght@100..1000",
  },
  outfit: {
    label: "Outfit",
    category: "sans",
    stack: family("Outfit Variable", SANS),
    googleAxes: "wght@100..900",
  },
  sora: {
    label: "Sora",
    category: "sans",
    stack: family("Sora Variable", SANS),
    googleAxes: "wght@100..800",
  },
  figtree: {
    label: "Figtree",
    category: "sans",
    stack: family("Figtree Variable", SANS),
    googleAxes: "wght@300..900",
  },
  onest: {
    label: "Onest",
    category: "sans",
    stack: family("Onest Variable", SANS),
    googleAxes: "wght@100..900",
  },
  urbanist: {
    label: "Urbanist",
    category: "sans",
    stack: family("Urbanist Variable", SANS),
    googleAxes: "wght@100..900",
  },
  lexend: {
    label: "Lexend",
    category: "sans",
    stack: family("Lexend Variable", SANS),
    googleAxes: "wght@100..900",
  },
  rubik: {
    label: "Rubik",
    category: "sans",
    stack: family("Rubik Variable", SANS),
    googleAxes: "wght@300..900",
  },
  "open-sans": {
    label: "Open Sans",
    category: "sans",
    stack: family("Open Sans Variable", SANS),
    googleAxes: "wght@300..800",
  },
  roboto: {
    label: "Roboto",
    category: "sans",
    stack: family("Roboto Variable", SANS),
    googleAxes: "wght@100..900",
  },
  montserrat: {
    label: "Montserrat",
    category: "sans",
    stack: family("Montserrat Variable", SANS),
    googleAxes: "wght@100..900",
  },
  raleway: {
    label: "Raleway",
    category: "sans",
    stack: family("Raleway Variable", SANS),
    googleAxes: "wght@100..900",
  },
  nunito: {
    label: "Nunito",
    category: "sans",
    stack: family("Nunito Variable", SANS),
    googleAxes: "wght@200..1000",
  },
  "work-sans": {
    label: "Work Sans",
    category: "sans",
    stack: family("Work Sans Variable", SANS),
    googleAxes: "wght@100..900",
  },
  mulish: {
    label: "Mulish",
    category: "sans",
    stack: family("Mulish Variable", SANS),
    googleAxes: "wght@200..1000",
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
    googleAxes: "wght@300..700",
  },
  "bricolage-grotesque": {
    label: "Bricolage Grotesque",
    category: "display",
    stack: family("Bricolage Grotesque Variable", SANS),
    googleAxes: "wght@200..800",
  },
  syne: {
    label: "Syne",
    category: "display",
    stack: family("Syne Variable", SANS),
    googleAxes: "wght@400..800",
  },
  unbounded: {
    label: "Unbounded",
    category: "display",
    stack: family("Unbounded Variable", SANS),
    googleAxes: "wght@200..900",
  },
  archivo: {
    label: "Archivo",
    category: "display",
    stack: family("Archivo Variable", SANS),
    googleAxes: "wght@100..900",
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
    googleAxes: "wght@400..700",
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
    googleAxes: "wght@300..900",
  },
  "eb-garamond": {
    label: "EB Garamond",
    category: "serif",
    stack: family("EB Garamond Variable", SERIF),
    googleAxes: "wght@400..800",
  },
  cormorant: {
    label: "Cormorant",
    category: "serif",
    stack: family("Cormorant Variable", SERIF),
    googleAxes: "wght@300..700",
  },
  "source-serif-4": {
    label: "Source Serif 4",
    category: "serif",
    stack: family("Source Serif 4 Variable", SERIF),
    googleAxes: "wght@200..900",
  },
  "noto-serif": {
    label: "Noto Serif",
    category: "serif",
    stack: family("Noto Serif Variable", SERIF),
    googleAxes: "wght@100..900",
  },
  serif: { label: "Georgia", category: "serif", stack: SERIF },

  "jetbrains-mono": {
    label: "JetBrains Mono",
    category: "mono",
    stack: family("JetBrains Mono Variable", MONO),
    googleAxes: "wght@100..800",
  },
  "fira-code": {
    label: "Fira Code",
    category: "mono",
    stack: family("Fira Code Variable", MONO),
    googleAxes: "wght@300..700",
  },
  "roboto-mono": {
    label: "Roboto Mono",
    category: "mono",
    stack: family("Roboto Mono Variable", MONO),
    googleAxes: "wght@100..700",
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
