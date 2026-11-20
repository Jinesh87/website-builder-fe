import { describe, expect, it } from "vitest";
import { SECTION_PRESETS } from "./registry.ts";
import { STYLE_SUPPORT } from "./style-support.generated.ts";
import { styleVariantKey, supportedStyleControls } from "./style-support.ts";

describe("style support map", () => {
  it("covers every section preset layout (re-run scripts/style-audit when this fails)", () => {
    const missing = SECTION_PRESETS.map((preset) => preset.create())
      .filter((section) => !STYLE_SUPPORT[section.type]?.[styleVariantKey(section)])
      .map((section) => `${section.type} ${styleVariantKey(section)}`);
    expect(missing).toEqual([]);
  });

  it("hides controls a layout ignores and keeps the ones it uses", () => {
    const stats = supportedStyleControls(SECTION_PRESETS.find((p) => p.type === "stats")!.create())!;
    expect(stats.has("headingSize")).toBe(false);
    expect(stats.has("background")).toBe(true);

    const header = supportedStyleControls(SECTION_PRESETS.find((p) => p.type === "header")!.create())!;
    expect(header.has("spacing")).toBe(false);
  });

  it("falls back to the type's layouts, then to everything for unknown types", () => {
    expect(supportedStyleControls({ type: "gallery", data: { variant: "not-a-layout" } } as never)).not.toBeNull();
    expect(supportedStyleControls({ type: "imported_html", data: {} } as never)).toBeNull();
  });
});
