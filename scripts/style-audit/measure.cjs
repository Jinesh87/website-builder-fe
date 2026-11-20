/**
 * Style audit, step 2 of 2 (see render-pages.test.tsx): opens each preset page in Chrome, compares
 * every control's render with the base render, and writes which controls visibly change each
 * section layout to src/site-kit/style-support.generated.ts.
 *
 *   NODE_PATH=../backend/node_modules node scripts/style-audit/measure.cjs /tmp/style-audit
 *
 * Puppeteer comes from the backend's node_modules; CHROME_PATH defaults to /usr/bin/google-chrome.
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const DIR = process.argv[2];
if (!DIR) throw new Error("Usage: node scripts/style-audit/measure.cjs <audit dir>");
const OUT_FILE = path.join(__dirname, "../../src/site-kit/style-support.generated.ts");
const { controls, presets } = JSON.parse(fs.readFileSync(path.join(DIR, "index.json"), "utf8"));

/** Computed properties each control is expected to change; colours use the colour list. */
const PROPS = {
  background: ["color", "backgroundColor", "backgroundImage"],
  spacing: ["paddingTop", "paddingBottom", "h"],
  containerWidth: ["x", "w"],
  align: ["textAlign", "x", "justifyContent", "alignItems"],
  font: ["fontFamily"],
  fontSize: ["fontSize"],
  headingSize: ["fontSize"],
  bodySize: ["fontSize"],
  headingWeight: ["fontWeight"],
  bodyWeight: ["fontWeight"],
  headingItalic: ["fontStyle"],
  bodyItalic: ["fontStyle"],
};
const COLOR_PROPS = ["color", "backgroundColor", "backgroundImage", "borderTopColor", "borderBottomColor", "borderLeftColor", "fill", "stroke", "outlineColor", "boxShadow"];

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"], executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome" });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => (/^(file|data):/.test(request.url()) ? request.continue() : request.abort()));
  await page.setViewport({ width: 1440, height: 900 });

  const support = {};
  for (const preset of presets) {
    await page.goto(`file://${path.resolve(DIR, "pages", `${preset.key}.html`)}`, { waitUntil: "load", timeout: 60000 });
    const changed = await page.evaluate(
      (controls, PROPS, COLOR_PROPS) => {
        const ALL = [...new Set([...Object.values(PROPS).flat(), ...COLOR_PROPS])].filter((p) => !["x", "w", "h"].includes(p));
        const snapshot = (block) =>
          [...block.querySelectorAll("*")].map((el) => {
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const shot = { x: Math.round(rect.x), w: Math.round(rect.width), h: Math.round(rect.height), visible: rect.width > 0 && rect.height > 0 };
            shot.text = [...el.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim());
            shot.size = parseFloat(style.fontSize);
            shot.inHeading = Boolean(el.closest("h1, h2, h3, h4, h5, h6"));
            for (const prop of ALL) shot[prop] = style[prop];
            return shot;
          });
        const blocks = Object.fromEntries([...document.querySelectorAll("[data-audit]")].map((block) => [block.dataset.audit, snapshot(block)]));
        const base = blocks.base;
        // Heading controls must reach heading text (h1-h6; the largest text when a layout has none);
        // body controls must reach ordinary text outside headings. A stray label doesn't count.
        const texts = base.filter((el) => el.visible && el.text);
        const hasHeadings = texts.some((el) => el.inHeading);
        const largest = Math.max(0, ...texts.map((el) => el.size));
        const isHeading = (el) => el.visible && el.text && (hasHeadings ? el.inHeading : el.size >= largest * 0.9);
        const isBody = (el) => el.visible && el.text && !el.inHeading && el.size <= 20;
        const target = (control) =>
          control.startsWith("heading") ? isHeading : control.startsWith("body") ? isBody : (el, now) => el.visible || now.visible;
        return controls.filter((control) => {
          const current = blocks[control];
          // A different element count means the control changed the markup itself.
          if (!current || current.length !== base.length) return true;
          const props = PROPS[control] || COLOR_PROPS;
          const counts = target(control);
          return base.some((before, i) => counts(before, current[i]) && props.some((p) => before[p] !== current[i][p]));
        });
      },
      controls,
      PROPS,
      COLOR_PROPS,
    );
    // A control counts for a layout when it works on any preset of that layout (content can differ).
    const byLayout = (support[preset.type] ??= {});
    for (const key of [preset.layout, "*"]) byLayout[key] = [...new Set([...(byLayout[key] ?? []), ...changed])];
  }
  await browser.close();

  const order = (list) => controls.filter((control) => list.includes(control));
  const types = Object.keys(support).sort();
  const lines = types.map((type) => {
    const layouts = Object.keys(support[type]).sort();
    const entries = layouts.map((layout) => `    ${JSON.stringify(layout)}: ${JSON.stringify(order(support[type][layout]))},`);
    return `  ${JSON.stringify(type)}: {\n${entries.join("\n")}\n  },`;
  });
  fs.writeFileSync(
    OUT_FILE,
    `// Generated by scripts/style-audit (do not edit): Style-tab controls that visibly change each\n` +
      `// section layout. "*" is every layout of the type. Re-run the audit after changing section CSS.\n` +
      `import type { StyleControl } from "./style-support.ts";\n\n` +
      `export const STYLE_SUPPORT: Record<string, Record<string, readonly StyleControl[]>> = {\n${lines.join("\n")}\n};\n`,
  );
  console.log(`measured ${presets.length} presets across ${types.length} section types -> ${path.relative(process.cwd(), OUT_FILE)}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
