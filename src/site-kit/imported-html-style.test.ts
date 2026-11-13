import { describe, expect, it } from "vitest";
import { hasImportedStyle, importedStyleCss } from "./imported-html-style.ts";
import type { SectionSettings } from "./types.ts";

const ID = "11111111-1111-4111-8111-111111111111";
const base: SectionSettings = { background: "default", hideOnMobile: false };
const ROOT = `.wb-site .wb-imported-html[data-section-id="${ID}"]`;

describe("imported block style overrides", () => {
  it("adds nothing while every option is left as imported", () => {
    expect(importedStyleCss(ID, base)).toBe("");
    expect(hasImportedStyle({ ...base, hideOnMobile: true, anchor: "x" })).toBe(false);
  });

  it("turns colours into overrides aimed at this section only", () => {
    const css = importedStyleCss(ID, { ...base, customColors: { background: "#112233", text: "#ff0000", muted: "#00ff00", primary: "#0000ff" } });
    expect(css).toContain(`${ROOT},${ROOT} [data-wb-import-ancestor]`);
    expect(css).toContain("background:#112233 !important");
    expect(css).toContain(`${ROOT} :is(h1,h2,h3,h4,h5,h6):not(${ROOT} :is([class*="card"],[class*="tile"]) *){color:#ff0000 !important}`);
    expect(css).toContain("color:#00ff00 !important");
    expect(css).toContain("background:#0000ff !important;border-color:#0000ff !important");
  });

  it("uses theme colours for background presets and scales sizes", () => {
    const css = importedStyleCss(ID, { ...base, background: "dark", headingSize: "large", spacing: "compact", font: "inter", align: "center" });
    expect(css).toContain("background:var(--wb-text) !important");
    expect(css).toContain("color:var(--wb-bg) !important");
    expect(css).toContain("zoom:1.250 !important");
    expect(css).toContain("text-align:center !important");
    expect(css).toMatch(/padding-top:calc\(var\(--wb-section-y, 80px\) \* 0\.5\)/);
    expect(css).toMatch(/font-family:[^;]*Inter/);
  });

  it("ignores unsafe values and section ids", () => {
    expect(importedStyleCss('x"]{}*{', { ...base, customColors: { text: "#ff0000" } })).toBe("");
    expect(importedStyleCss(ID, { ...base, customColors: { text: "red}</style><script>" } })).toBe("");
  });
});
