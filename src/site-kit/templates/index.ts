import type { SiteData } from "../types.ts";
import { ACCOUNTING_FIRM_SITE } from "./accounting-firm.ts";
import { ARCHITECTURE_FIRM_SITE } from "./architecture-firm.ts";
import { DESIGN_STUDIO_SITE } from "./design-studio.ts";
import { ELECTRICIAN_SITE } from "./electrician.ts";
import { LAW_FIRM_SITE } from "./law-firm.ts";
import { MARKETING_AGENCY_SITE } from "./marketing-agency.ts";
import { PLUMBING_SITE } from "./plumbing.ts";
import { ROOFING_SITE } from "./roofing.ts";
import { VIDEO_PRODUCTION_SITE } from "./video-production.ts";

type TemplateSite = {
  /** Key of the matching platform template seeded by the backend. */
  key: string;
  site: SiteData;
};

/** Full multi-page sites for gallery templates, keyed by marketing template ID. */
const TEMPLATE_SITES: Readonly<Record<string, TemplateSite>> = {
  "2134": { key: "accounting-firm-classic", site: ACCOUNTING_FIRM_SITE },
  "2135": { key: "electrician-classic", site: ELECTRICIAN_SITE },
  "2138": { key: "architecture-firm-minimal", site: ARCHITECTURE_FIRM_SITE },
  "2139": { key: "roofing-velvet", site: ROOFING_SITE },
  "2140": { key: "law-firm-elegant", site: LAW_FIRM_SITE },
  "2141": { key: "design-studio-bold", site: DESIGN_STUDIO_SITE },
  "2142": { key: "marketing-agency-midnight", site: MARKETING_AGENCY_SITE },
  "2143": { key: "video-production-velvet", site: VIDEO_PRODUCTION_SITE },
  "2144": { key: "plumbing-fresh", site: PLUMBING_SITE },
};

function find(templateId: string): TemplateSite | null {
  return Object.hasOwn(TEMPLATE_SITES, templateId) ? TEMPLATE_SITES[templateId] : null;
}

export function getTemplateSite(templateId: string): SiteData | null {
  return find(templateId)?.site ?? null;
}

/** Backend template key to create a website from, or null when the template has no seeded site. */
export function getTemplateKey(templateId: string): string | null {
  return find(templateId)?.key ?? null;
}
