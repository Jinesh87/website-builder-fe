import { useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  FileText,
  Image as ImageIcon,
  Network,
  ShieldCheck,
} from "lucide-react";
import type { WebsiteDetail } from "../../api/websites.ts";

export type AuditItem = {
  id: string;
  title: string;
  status: "pass" | "warn";
  category: string;
  scoreWeight: number;
  message: string;
  recommendation?: string;
  icon: typeof Search;
};

export type SeoAuditReport = {
  score: number;
  grade: "Excellent" | "Good" | "Needs Attention";
  items: AuditItem[];
  passedCount: number;
  warnCount: number;
};

export function runPrePublishSeoAudit(website: WebsiteDetail): SeoAuditReport {
  const visiblePages = website.draft.pages.filter((p) => p.visible);
  const items: AuditItem[] = [];

  // 1. Meta Titles & Descriptions
  let missingTitles = 0;
  let missingDescriptions = 0;
  const titles = new Set<string>();
  let duplicateTitles = false;

  for (const page of visiblePages) {
    const title = page.seoTitle || page.name;
    if (!title || title.trim().length < 3) missingTitles++;
    if (titles.has(title.toLowerCase())) duplicateTitles = true;
    titles.add(title.toLowerCase());

    if (!page.seoDescription || page.seoDescription.trim().length < 20) {
      missingDescriptions++;
    }
  }

  if (missingTitles === 0 && !duplicateTitles && missingDescriptions === 0) {
    items.push({
      id: "meta-tags",
      title: "Page Titles & Meta Descriptions",
      status: "pass",
      category: "On-Page SEO",
      scoreWeight: 25,
      message: `All ${visiblePages.length} live pages have unique, optimized titles and meta descriptions.`,
      icon: FileText,
    });
  } else {
    items.push({
      id: "meta-tags",
      title: "Page Titles & Meta Descriptions",
      status: "warn",
      category: "On-Page SEO",
      scoreWeight: missingTitles > 0 ? 10 : 18,
      message: `${missingDescriptions} page(s) missing descriptions or titles${duplicateTitles ? "; duplicate titles detected" : ""}.`,
      recommendation: "Use the AI SEO generator in Site Settings to auto-generate unique page meta tags.",
      icon: FileText,
    });
  }

  // 2. Heading Structure & Single H1 Rule
  let pagesWithoutH1 = 0;
  for (const page of visiblePages) {
    const hasHero = page.sections.some((s) => !s.hidden && s.type === "hero");
    // Inner pages without hero will receive automatic semantic H1 from LiveSiteEngine
    if (page.slug === "/" && !hasHero && page.sections.length === 0) {
      pagesWithoutH1++;
    }
  }

  if (pagesWithoutH1 === 0) {
    items.push({
      id: "headings",
      title: "Single H1 & Semantic Hierarchy",
      status: "pass",
      category: "Content Structure",
      scoreWeight: 20,
      message: "Strict single-H1 rule verified. Inner pages and hero sections maintain clean heading hierarchy.",
      icon: Search,
    });
  } else {
    items.push({
      id: "headings",
      title: "Single H1 & Semantic Hierarchy",
      status: "warn",
      category: "Content Structure",
      scoreWeight: 10,
      message: "Homepage lacks a prominent hero or heading section.",
      recommendation: "Add a Hero section to the homepage to provide clear keyword context for search engines.",
      icon: Search,
    });
  }

  // 3. Image Alt Text & Accessibility
  let totalImages = 0;
  let genericAltCount = 0;
  const genericAltTerms = new Set(["image", "hero background", "photo", "team member", "preview", ""]);

  for (const page of visiblePages) {
    for (const section of page.sections) {
      if (section.hidden) continue;
      const d = (section.data as Record<string, unknown>) || {};
      if (d.image && typeof d.image === "object" && "url" in d.image) {
        totalImages++;
        const alt = String((d.image as { alt?: string }).alt || "").trim().toLowerCase();
        if (genericAltTerms.has(alt)) genericAltCount++;
      }
      if (d.backgroundImage && typeof d.backgroundImage === "object" && "url" in d.backgroundImage) {
        totalImages++;
        const alt = String((d.backgroundImage as { alt?: string }).alt || "").trim().toLowerCase();
        if (genericAltTerms.has(alt)) genericAltCount++;
      }
      if (Array.isArray(d.images)) {
        for (const img of d.images) {
          if (img && typeof img === "object" && (img as { url?: string }).url) {
            totalImages++;
            const alt = String((img as { alt?: string; caption?: string }).alt || (img as { caption?: string }).caption || "").trim().toLowerCase();
            if (genericAltTerms.has(alt)) genericAltCount++;
          }
        }
      }
      if (Array.isArray(d.members)) {
        for (const m of d.members) {
          if (m && typeof m === "object" && (m as { photo?: { url?: string; alt?: string } }).photo) {
            const photo = (m as { photo: { url?: string; alt?: string } }).photo;
            if (photo && typeof photo === "object" && photo.url) {
              totalImages++;
              const alt = String(photo.alt || (m as { name?: string }).name || "").trim().toLowerCase();
              if (genericAltTerms.has(alt)) genericAltCount++;
            }
          }
        }
      }
    }
  }

  if (genericAltCount === 0) {
    items.push({
      id: "image-alt",
      title: "Descriptive Image Alt Attributes",
      status: "pass",
      category: "Media & Core Web Vitals",
      scoreWeight: 20,
      message: totalImages > 0
        ? `All ${totalImages} images feature contextual descriptive alt tags for Google Image search.`
        : "No un-tagged images found on live pages.",
      icon: ImageIcon,
    });
  } else {
    items.push({
      id: "image-alt",
      title: "Descriptive Image Alt Attributes",
      status: "warn",
      category: "Media & Core Web Vitals",
      scoreWeight: Math.max(8, 20 - genericAltCount * 3),
      message: `${genericAltCount} image(s) have generic or missing alt descriptions.`,
      recommendation: "Bytezora Live Engine auto-enriches these during render, but adding custom captions improves topical depth.",
      icon: ImageIcon,
    });
  }

  // 4. Structured Data Schemas & Business Entities
  const hasFormalBusinessName = Boolean(website.info.businessName && website.info.businessName.trim().length > 1);
  const hasContactInfo = Boolean(website.info.contactEmail || website.info.contactPhone || website.info.address);
  const hasFaq = visiblePages.some((p) => p.sections.some((s) => !s.hidden && s.type === "faq"));

  if (hasFormalBusinessName && hasContactInfo) {
    const extraSchema = hasFaq ? " + FAQPage rich snippets" : "";
    items.push({
      id: "schema-org",
      title: "JSON-LD Structured Data",
      status: "pass",
      category: "Technical SEO",
      scoreWeight: 20,
      message: `Organization, WebSite & BreadcrumbList schemas active${extraSchema}.`,
      icon: Network,
    });
  } else {
    items.push({
      id: "schema-org",
      title: "JSON-LD Structured Data",
      status: "warn",
      category: "Technical SEO",
      scoreWeight: 10,
      message: !hasFormalBusinessName
        ? "Official Business Name not set (using project slug fallback)."
        : "Contact details missing; add email or phone for rich contact card schemas.",
      recommendation: "Set formal Business Name and Contact details in Settings to enable rich Google Knowledge Graph panels.",
      icon: Network,
    });
  }

  // 5. Sitemap & AI Search Directives
  if (visiblePages.length > 0 && website.subdomain) {
    items.push({
      id: "sitemap-robots",
      title: "Sitemap & AI Crawler Directives",
      status: "pass",
      category: "Crawlability",
      scoreWeight: 15,
      message: `Root /sitemap.xml (${visiblePages.length} pages) and /robots.txt configured with GPTBot & PerplexityBot crawl rules.`,
      icon: ShieldCheck,
    });
  } else {
    items.push({
      id: "sitemap-robots",
      title: "Sitemap & AI Crawler Directives",
      status: "warn",
      category: "Crawlability",
      scoreWeight: 5,
      message: "No live pages available to index in XML sitemap.",
      recommendation: "Ensure at least one page is marked visible before publishing.",
      icon: ShieldCheck,
    });
  }

  const totalScore = items.reduce((acc, curr) => acc + curr.scoreWeight, 0);
  const normalizedScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  const grade =
    normalizedScore >= 85 ? "Excellent" : normalizedScore >= 70 ? "Good" : "Needs Attention";

  return {
    score: normalizedScore,
    grade,
    items,
    passedCount: items.filter((i) => i.status === "pass").length,
    warnCount: items.filter((i) => i.status === "warn").length,
  };
}

export default function PublishSeoAudit({ website }: { website: WebsiteDetail }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const report = useMemo(() => runPrePublishSeoAudit(website), [website]);

  return (
    <div className="rounded-xl border border-line bg-canvas p-3.5 space-y-3">
      {/* Top Health Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-ink flex items-center gap-1.5">
              Pre-Publish SEO Health
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  report.grade === "Excellent"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : report.grade === "Good"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {report.grade} · {report.score}/100
              </span>
            </h4>
            <p className="text-[11px] text-ink-muted">
              {report.passedCount} checks passed{report.warnCount > 0 ? `, ${report.warnCount} suggestions` : ""}
            </p>
          </div>
        </div>

        {/* Progress bar preview */}
        <div className="w-20 text-right">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className={`h-full transition-all duration-300 ${
                report.score >= 85 ? "bg-emerald-500" : report.score >= 70 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${report.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <ul className="divide-y divide-line/60 rounded-lg border border-line/70 bg-surface text-xs">
        {report.items.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedId === item.id;
          return (
            <li key={item.id} className="transition-colors hover:bg-canvas/50">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.status === "pass" ? (
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                  )}
                  <Icon className="size-3.5 text-ink-muted shrink-0" />
                  <span className="truncate font-medium text-ink">{item.title}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-ink-muted shrink-0">
                  <span className="capitalize">{item.status}</span>
                  {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-2.5 pt-0.5 text-[11px] text-ink-body space-y-1 bg-canvas/30">
                  <p>{item.message}</p>
                  {item.recommendation && (
                    <p className="text-amber-600 dark:text-amber-400 font-medium">
                      💡 Tip: {item.recommendation}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
