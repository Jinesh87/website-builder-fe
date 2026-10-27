import type { SiteData } from "../types.ts";
import { ACCOUNTING_FIRM_SITE } from "./accounting-firm.ts";
import { ARCHITECTURE_FIRM_SITE } from "./architecture-firm.ts";
import { BAKERY_SITE } from "./bakery.ts";
import { DAY_SPA_SITE } from "./day-spa.ts";
import { DENTAL_CLINIC_SITE } from "./dental-clinic.ts";
import { DESIGN_STUDIO_SITE } from "./design-studio.ts";
import { ELECTRICIAN_SITE } from "./electrician.ts";
import { FOOD_TRUCK_SITE } from "./food-truck.ts";
import { LAW_FIRM_SITE } from "./law-firm.ts";
import { MARKETING_AGENCY_SITE } from "./marketing-agency.ts";
import { PLUMBING_SITE } from "./plumbing.ts";
import { RESTAURANT_SITE } from "./restaurant.ts";
import { ROOFING_SITE } from "./roofing.ts";
import { DEVELOPER_PORTFOLIO_SITE } from "./developer-portfolio.ts";
import { PHOTOGRAPHER_SITE } from "./photographer.ts";
import { UX_DESIGNER_SITE } from "./ux-designer.ts";
import { VIDEO_PRODUCTION_SITE } from "./video-production.ts";
import { YOGA_STUDIO_SITE } from "./yoga-studio.ts";
import { TECH_ACADEMY_SITE } from "./tech-academy.ts";
import { DESIGN_INSTITUTE_SITE } from "./design-institute.ts";
import { COMMUNITY_HUB_SITE } from "./community-hub.ts";
import { SAAS_PLATFORM_SITE } from "./saas-platform.ts";
import { MOBILE_APP_SITE } from "./mobile-app.ts";
import { EVENT_SUMMIT_SITE } from "./event-summit.ts";

type TemplateSite = {
  /** Key of the matching platform template seeded by the backend. */
  key: string;
  site: SiteData;
};

/** Full multi-page sites for gallery templates, keyed by marketing template ID. */
const TEMPLATE_SITES: Readonly<Record<string, TemplateSite>> = {
  "2134": { key: "accounting-firm-classic", site: ACCOUNTING_FIRM_SITE },
  "2135": { key: "electrician-classic", site: ELECTRICIAN_SITE },
  "2136": { key: "food-truck-sunny", site: FOOD_TRUCK_SITE },
  "2137": { key: "event-summit-coral", site: EVENT_SUMMIT_SITE },
  "2138": { key: "architecture-firm-minimal", site: ARCHITECTURE_FIRM_SITE },
  "2139": { key: "roofing-velvet", site: ROOFING_SITE },
  "2140": { key: "law-firm-elegant", site: LAW_FIRM_SITE },
  "2141": { key: "design-studio-bold", site: DESIGN_STUDIO_SITE },
  "2142": { key: "marketing-agency-midnight", site: MARKETING_AGENCY_SITE },
  "2143": { key: "video-production-velvet", site: VIDEO_PRODUCTION_SITE },
  "2144": { key: "plumbing-fresh", site: PLUMBING_SITE },
  "2145": { key: "dental-clinic-fresh", site: DENTAL_CLINIC_SITE },
  "2146": { key: "day-spa-bold", site: DAY_SPA_SITE },
  "2147": { key: "yoga-studio-forest", site: YOGA_STUDIO_SITE },
  "2148": { key: "restaurant-rose", site: RESTAURANT_SITE },
  "2149": { key: "bakery-coral", site: BAKERY_SITE },
  "2150": { key: "photographer-mono", site: PHOTOGRAPHER_SITE },
  "2151": { key: "ux-designer-midnight", site: UX_DESIGNER_SITE },
  "2152": { key: "developer-portfolio-ocean", site: DEVELOPER_PORTFOLIO_SITE },
  "2153": { key: "saas-platform-cyber", site: SAAS_PLATFORM_SITE },
  "2154": { key: "mobile-app-fresh", site: MOBILE_APP_SITE },
  "2155": { key: "tech-academy-indigo", site: TECH_ACADEMY_SITE },
  "2156": { key: "design-institute-editorial", site: DESIGN_INSTITUTE_SITE },
  "2157": { key: "community-hub-emerald", site: COMMUNITY_HUB_SITE },
};

function find(templateIdOrKey: string): TemplateSite | null {
  if (Object.hasOwn(TEMPLATE_SITES, templateIdOrKey)) return TEMPLATE_SITES[templateIdOrKey];
  if (templateIdOrKey === "vintage-reels" || templateIdOrKey === "vintage-reels-entertainment") {
    return TEMPLATE_SITES["2143"];
  }
  return Object.values(TEMPLATE_SITES).find((candidate) => candidate.key === templateIdOrKey) ?? null;
}

export function getTemplateSite(templateIdOrKey: string): SiteData | null {
  return find(templateIdOrKey)?.site ?? null;
}

/** Backend template key to create a website from, or null when the template has no seeded site. */
export function getTemplateKey(templateIdOrKey: string): string | null {
  return find(templateIdOrKey)?.key ?? null;
}

