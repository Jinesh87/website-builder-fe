/**
 * Section Style settings for imported HTML blocks.
 *
 * Imported blocks carry their own (scoped) CSS and don't use the theme variables builder sections
 * read, so the usual SectionShell styling has no effect on them. Instead each chosen setting becomes
 * a small override stylesheet aimed at this one section (by its id). Nothing is generated for
 * settings left on "as imported", so an untouched block keeps its exact imported look.
 */
import { SECTION_FONT_SCALE, SECTION_HEADING_SCALE, sectionFontStyle } from "./theme.ts";
import type { SectionSettings } from "./types.ts";

const HEADINGS = ":is(h1,h2,h3,h4,h5,h6)";
const TEXT_TAGS = "p,li,blockquote,figcaption,label,dt,dd,td,th,small";
/** Body text blocks, outermost only (so nested ones don't scale twice), never inside buttons. */
const BODY_TEXT = `:is(${TEXT_TAGS}):not(:is(${TEXT_TAGS}) *):not(:is(a,button) *)`;
/**
 * Cards paint their own background (often white on a coloured section), so section text colours
 * leave the text inside them alone.
 */
const CARDS = ':is([class*="card"],[class*="tile"])';
const BUTTONS = ':is(a,button,input[type="submit"]):is([class*="btn"],[class*="button"],[class*="cta"],[type="submit"])';
/** Icon fonts draw glyphs with their own font: never replace it. */
const NOT_ICON = ':not(i,[class*="icon"],[class*="fa-"],[class^="fa"],[class*="bi-"],svg,svg *)';

const SECTION_ID = /^[\w-]{1,64}$/;
const SAFE_VALUE = /^[#\w\s(),.%-]{1,80}$/;

const PRESET_BACKGROUND: Record<string, { bg: string; text: string; muted: string }> = {
  surface: { bg: "var(--wb-surface)", text: "var(--wb-text)", muted: "var(--wb-muted)" },
  primary: { bg: "var(--wb-primary)", text: "var(--wb-on-primary, #fff)", muted: "var(--wb-on-primary, #fff)" },
  dark: { bg: "var(--wb-text)", text: "var(--wb-bg)", muted: "var(--wb-bg)" },
};

const SPACING: Record<string, string> = {
  none: "0",
  compact: "calc(var(--wb-section-y, 80px) * 0.5)",
  relaxed: "calc(var(--wb-section-y, 80px) * 1.4)",
};

const PX = /^\d+(\.\d+)?(px|rem|em)$/;

function safe(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && SAFE_VALUE.test(trimmed) ? trimmed : undefined;
}

function scaleOf(value: string | undefined, presets: Record<string, string>): number {
  if (!value || value === "default") return 1;
  if (presets[value]) return Number(presets[value]);
  if (/^\d+(\.\d+)?%$/.test(value)) return parseFloat(value) / 100;
  return 1;
}

/** True when any Style setting changes how an imported block looks. */
export function hasImportedStyle(settings: Partial<SectionSettings> | undefined): boolean {
  return importedStyleRules(settings, ".x").length > 0;
}

function importedStyleRules(settings: Partial<SectionSettings> | undefined, root: string): string[] {
  if (!settings) return [];
  const rules: string[] = [];
  /** `selectors` are relative to the block wrapper; "" means the wrapper itself. */
  const add = (selectors: string[], declarations: (string | false | undefined)[]) => {
    const body = declarations.filter(Boolean).map((d) => `${d} !important`).join(";");
    if (body) rules.push(`${selectors.map((sel) => (sel ? `${root} ${sel}` : root)).join(",")}{${body}}`);
  };
  const colors = settings.customColors ?? {};
  const preset = settings.background && settings.background !== "default" ? PRESET_BACKGROUND[settings.background] : undefined;
  const background = safe(colors.background) ?? preset?.bg;
  const heading = safe(colors.text) ?? preset?.text;
  const body = safe(colors.muted) ?? safe(colors.text) ?? preset?.muted;
  const accent = safe(colors.primary);
  const border = safe(colors.border);

  // The imported block element(s), below the wrappers recreated around them.
  const blockElements = [".wb-imported-html-root > :not([data-wb-import-ancestor])", "[data-wb-import-ancestor] > :not([data-wb-import-ancestor])"];
  // The scope carries the imported page background and the wrappers may paint one too.
  if (background) add(["", "[data-wb-import-ancestor]", ...blockElements], [`background:${background}`]);
  // Only cards inside this block count (the page around it may use such class names too).
  const outsideCards = `:not(${root} ${CARDS} *)`;
  if (heading) add([`${HEADINGS}${outsideCards}`], [`color:${heading}`]);
  if (body) add([`${BODY_TEXT}${outsideCards}`], [`color:${body}`]);
  if (accent) add([BUTTONS], [`background:${accent}`, `border-color:${accent}`]);
  if (border) add(["*"], [`border-color:${border}`]);

  const spacing = settings.spacing ? SPACING[settings.spacing] : undefined;
  if (spacing) add(blockElements, [`padding-top:${spacing}`, `padding-bottom:${spacing}`]);
  if (settings.align) add([HEADINGS], [`text-align:${settings.align}`]);

  const fontFamily = sectionFontStyle(settings.font).fontFamily;
  if (fontFamily) add([`*${NOT_ICON}`], [`font-family:${fontFamily}`]);

  // Size presets scale the imported sizes (keeping the block's own hierarchy); pixel values set them outright.
  const overall = scaleOf(settings.fontSize, SECTION_FONT_SCALE);
  const headingPx = settings.headingSize && PX.test(settings.headingSize) ? settings.headingSize : undefined;
  const headingScale = overall * scaleOf(settings.headingSize, SECTION_HEADING_SCALE);
  const bodyPx = settings.bodySize && PX.test(settings.bodySize) ? settings.bodySize : undefined;
  const bodyScale = overall * scaleOf(settings.bodySize, SECTION_FONT_SCALE);
  add([HEADINGS], [
    headingPx && `font-size:${headingPx}`,
    !headingPx && headingScale !== 1 && `zoom:${headingScale.toFixed(3)}`,
    settings.headingWeight && settings.headingWeight !== "default" && `font-weight:${settings.headingWeight}`,
    settings.headingItalic && "font-style:italic",
  ]);
  add([BODY_TEXT], [
    bodyPx && `font-size:${bodyPx}`,
    !bodyPx && bodyScale !== 1 && `zoom:${bodyScale.toFixed(3)}`,
    settings.bodyWeight && settings.bodyWeight !== "default" && `font-weight:${settings.bodyWeight}`,
    settings.bodyItalic && "font-style:italic",
  ]);
  return rules;
}

/** Override CSS for one imported section, or "" when every setting is left as imported. */
export function importedStyleCss(sectionId: string | undefined, settings: Partial<SectionSettings> | undefined): string {
  if (!sectionId || !SECTION_ID.test(sectionId)) return "";
  return importedStyleRules(settings, `.wb-site .wb-imported-html[data-section-id="${sectionId}"]`).join("\n").replace(/</g, "\\3c ");
}
