/**
 * Style audit, step 1 of 2: renders every section preset once as-is and once per Style-tab control
 * into HTML pages (SITE_CSS only, like a live page). Step 2, measure.cjs, compares them in Chrome and
 * writes src/site-kit/style-support.generated.ts.
 *
 *   AUDIT_OUT=/tmp/style-audit npx vitest run scripts/style-audit
 *   NODE_PATH=../backend/node_modules node scripts/style-audit/measure.cjs /tmp/style-audit
 *
 * Skipped in normal test runs (no AUDIT_OUT).
 */
import fs from "node:fs";
import path from "node:path";
import { it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_THEME, SECTION_PRESETS, SectionView, SITE_CSS, themeToCssVars } from "../../src/site-kit/index.ts";
import type { Section, SectionSettings } from "../../src/site-kit/index.ts";
import { STYLE_CONTROLS, styleVariantKey, type StyleControl } from "../../src/site-kit/style-support.ts";

const OUT = process.env.AUDIT_OUT;
const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

/** One change per control, always different from the preset's own value. */
const CHANGES: Record<StyleControl, (s: SectionSettings) => Partial<SectionSettings>> = {
  background: (s) => ({ background: s.background === "dark" ? "default" : "dark" }),
  spacing: (s) => ({ spacing: s.spacing === "none" ? "relaxed" : "none" }),
  containerWidth: (s) => ({ containerWidth: s.containerWidth === "narrow" ? "full" : "narrow" }),
  align: (s) => ({ align: s.align === "right" ? "left" : "right" }),
  font: (s) => ({ font: (s.font === "sora" ? "inter" : "sora") as SectionSettings["font"] }),
  fontSize: () => ({ fontSize: "huge" }),
  headingSize: () => ({ headingSize: "huge" }),
  headingWeight: () => ({ headingWeight: "300" }),
  headingItalic: () => ({ headingItalic: true }),
  bodySize: () => ({ bodySize: "huge" }),
  bodyWeight: () => ({ bodyWeight: "300" }),
  bodyItalic: () => ({ bodyItalic: true }),
  colorBackground: (s) => ({ customColors: { ...s.customColors, background: "#ff00aa" } }),
  colorText: (s) => ({ customColors: { ...s.customColors, text: "#00aa55" } }),
  colorPrimary: (s) => ({ customColors: { ...s.customColors, primary: "#aa5500" } }),
  colorMuted: (s) => ({ customColors: { ...s.customColors, muted: "#5500aa" } }),
  colorBorder: (s) => ({ customColors: { ...s.customColors, border: "#00ffff" } }),
  colorGradient: (s) => ({ customColors: { ...s.customColors, gradientFrom: "#ff0000", gradientTo: "#0000ff" } }),
  colorCard: (s) => ({ customColors: { ...s.customColors, card: "#aa0055", cardText: "#00ff88" } }),
};

// Images are blanked so the pages render offline and the same every time.
const render = (section: Section) =>
  renderToStaticMarkup(<SectionView section={section} />)
    .replace(/(src|poster)="[^"]*"/g, `$1="${BLANK}"`)
    .replace(/srcSet="[^"]*"/gi, "");

const themeStyle = Object.entries(themeToCssVars(DEFAULT_THEME))
  .map(([name, value]) => `${name}:${String(value).replace(/"/g, "&quot;")}`)
  .join(";");

it.skipIf(!OUT)(
  "renders the style audit pages",
  () => {
    fs.mkdirSync(path.join(OUT!, "pages"), { recursive: true });
    const presets = SECTION_PRESETS.map((preset) => {
      const base = preset.create();
      const blocks = [`<div data-audit="base">${render(base)}</div>`];
      for (const control of STYLE_CONTROLS) {
        const section = { ...base, settings: { ...base.settings, ...CHANGES[control](base.settings) } } as Section;
        blocks.push(`<div data-audit="${control}">${render(section)}</div>`);
      }
      fs.writeFileSync(
        path.join(OUT!, "pages", `${preset.key}.html`),
        `<!doctype html><html><head><meta charset="utf-8"><style>${SITE_CSS}</style></head><body>` +
          `<div class="wb-site wb-buttons-${DEFAULT_THEME.buttonStyle} wb-cards-${DEFAULT_THEME.cardStyle}" style="${themeStyle}">` +
          `${blocks.join("\n")}</div></body></html>`,
      );
      return { key: preset.key, type: base.type, layout: styleVariantKey(base) };
    });
    fs.writeFileSync(path.join(OUT!, "index.json"), JSON.stringify({ controls: STYLE_CONTROLS, presets }, null, 1));
  },
  300_000,
);
