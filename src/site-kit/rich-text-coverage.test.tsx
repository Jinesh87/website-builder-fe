import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SECTION_DEFINITIONS, SECTION_PRESETS, SECTION_TYPES } from "./registry.ts";
import { SAMPLE_SITE } from "./sample-site.ts";
import { SectionView, SiteFooterView, SiteHeaderView } from "./SitePage.tsx";
import { SiteRenderModeProvider } from "./render-mode.tsx";
import { getTemplateSite } from "./templates/index.ts";
import { RICH_TEXT_KEYS } from "./rich-text-keys.ts";
import type { Section, SiteData } from "./types.ts";

const TEMPLATE_IDS = Array.from({ length: 24 }, (_, index) => String(2134 + index));

/** Wraps every rich text value in a span naming its key, so a leak says which field it came from. */
function markRichText(value: unknown, key?: string): unknown {
  if (typeof value === "string") {
    return key && RICH_TEXT_KEYS.has(key) && value.trim() ? `<span class="wb-k-${key}">${value}</span>` : value;
  }
  if (Array.isArray(value)) return value.map((item) => markRichText(item, key));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, markRichText(child, childKey)]));
  }
  return value;
}

const LEAK = /&lt;span class=&quot;wb-k-([a-zA-Z]+)/g;

function leaksIn(markup: string, where: string, leaks: Set<string>) {
  for (const match of markup.matchAll(LEAK)) leaks.add(`${where}: ${match[1]}`);
}

function render(node: React.ReactNode): string {
  return renderToStaticMarkup(<SiteRenderModeProvider mode="static">{node}</SiteRenderModeProvider>);
}

function sectionsToCheck(): { where: string; section: Section }[] {
  const sections: { where: string; section: Section }[] = [];
  const sites: SiteData[] = [SAMPLE_SITE];
  for (const id of TEMPLATE_IDS) {
    const site = getTemplateSite(id);
    if (site) sites.push(site);
  }
  for (const site of sites) {
    for (const page of site.pages) for (const section of page.sections) sections.push({ where: section.type, section });
  }
  for (const preset of SECTION_PRESETS) sections.push({ where: preset.type, section: preset.create() as Section });
  for (const type of SECTION_TYPES) {
    const definition = SECTION_DEFINITIONS[type];
    sections.push({
      where: type,
      section: { id: `default-${type}`, type, hidden: false, settings: { background: "default", hideOnMobile: false }, data: definition.createData() } as Section,
    });
  }
  return sections;
}

describe("rich text rendering", () => {
  it("renders formatting in every rich text field instead of showing tags", () => {
    const leaks = new Set<string>();
    for (const { where, section } of sectionsToCheck()) {
      const marked = { ...section, data: markRichText(section.data) } as Section;
      leaksIn(render(<SectionView section={marked} />), where, leaks);
    }
    const sites: SiteData[] = [SAMPLE_SITE, ...TEMPLATE_IDS.map((id) => getTemplateSite(id)).filter((site): site is SiteData => Boolean(site))];
    for (const site of sites) {
      if (site.header) leaksIn(render(<SiteHeaderView header={markRichText(site.header) as SiteData["header"]} />), "header", leaks);
      if (site.footer) leaksIn(render(<SiteFooterView footer={markRichText(site.footer) as SiteData["footer"]} />), "footer", leaks);
    }
    if (leaks.size > 0) console.log(`RICH_TEXT_LEAKS ${JSON.stringify([...leaks].sort())}`);
    expect([...leaks].sort()).toEqual([]);
  });
});
