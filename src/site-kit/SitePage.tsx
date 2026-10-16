import { Fragment, memo, type ReactNode } from "react";
import SiteFooter from "./layout/SiteFooter.tsx";
import SiteHeader from "./layout/SiteHeader.tsx";
import AuthSection from "./sections/AuthSection.tsx";
import ContactSection from "./sections/ContactSection.tsx";
import CtaSection from "./sections/CtaSection.tsx";
import CustomSection from "./sections/CustomSection.tsx";
import FaqSection from "./sections/FaqSection.tsx";
import FeaturesSection from "./sections/FeaturesSection.tsx";
import FooterSection from "./sections/FooterSection.tsx";
import GallerySection from "./sections/GallerySection.tsx";
import HeaderSection from "./sections/HeaderSection.tsx";
import HeroSection from "./sections/HeroSection.tsx";
import LogosSection from "./sections/LogosSection.tsx";
import MediaSection from "./sections/MediaSection.tsx";
import PricingSection from "./sections/PricingSection.tsx";
import CarouselSection from "./sections/CarouselSection.tsx";
import MarqueeSection from "./sections/MarqueeSection.tsx";
import ServicesSection from "./sections/ServicesSection.tsx";
import SplitSection from "./sections/SplitSection.tsx";
import StatsSection from "./sections/StatsSection.tsx";
import TeamSection from "./sections/TeamSection.tsx";
import TestimonialsSection from "./sections/TestimonialsSection.tsx";
import TextSection from "./sections/TextSection.tsx";
import BlogSection from "./sections/BlogSection.tsx";
import BlogDetailSection from "./sections/BlogDetailSection.tsx";
import { SITE_CSS } from "./styles.ts";
import { themeToCssVars } from "./theme.ts";
import type { FooterData, HeaderData, PageData, Section, SectionOf, SiteData, ThemeSettings } from "./types.ts";

export const SectionView = memo(function SectionView({ section }: { section: Section }) {
  switch (section.type) {
    case "header":
      return <HeaderSection section={section} />;
    case "footer":
      return <FooterSection section={section} />;
    case "hero":
      return <HeroSection section={section} />;
    case "features":
      return <FeaturesSection section={section} />;
    case "services":
      return <ServicesSection section={section} />;
    case "testimonials":
      return <TestimonialsSection section={section} />;
    case "faq":
      return <FaqSection section={section} />;
    case "cta":
      return <CtaSection section={section} />;
    case "contact":
      return <ContactSection section={section} />;
    case "text":
      return <TextSection section={section} />;
    case "gallery":
      return <GallerySection section={section} />;
    case "logos":
      return <LogosSection section={section} />;
    case "split":
      return <SplitSection section={section} />;
    case "stats":
      return <StatsSection section={section} />;
    case "pricing":
      return <PricingSection section={section} />;
    case "media":
      return <MediaSection section={section} />;
    case "team":
      return <TeamSection section={section} />;
    case "carousel":
      return <CarouselSection section={section} />;
    case "marquee":
      return <MarqueeSection section={section} />;
    case "auth":
      return <AuthSection section={section} />;
    case "custom":
      return <CustomSection section={section} />;
    case "blog":
      return <BlogSection section={section} />;
    case "blog_detail":
      return <BlogDetailSection section={section} />;
  }
}, (prev, next) => {
  if (prev.section === next.section) return true;
  if (prev.section.id !== next.section.id) return false;
  if (prev.section.type !== next.section.type) return false;
  if (prev.section.hidden !== next.section.hidden) return false;
  if (prev.section.settings !== next.section.settings) {
    if (JSON.stringify(prev.section.settings) !== JSON.stringify(next.section.settings)) return false;
  }
  if (prev.section.data !== next.section.data) {
    if (JSON.stringify(prev.section.data) !== JSON.stringify(next.section.data)) return false;
  }
  return true;
});

type SiteFrameProps = {
  theme: ThemeSettings;
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

/** Themed page wrapper shared by the published page and the visual editor canvas. */
export function SiteFrame({ theme, header, footer, children }: SiteFrameProps) {
  const classes = ["wb-site", `wb-buttons-${theme.buttonStyle}`, `wb-cards-${theme.cardStyle}`].join(" ");
  return (
    <div className={classes} style={themeToCssVars(theme)}>
      {header}
      <main>{children}</main>
      {footer}
    </div>
  );
}

export function SiteHeaderView({ header }: { header: HeaderData }) {
  return <SiteHeader header={header} />;
}

export function SiteFooterView({ footer }: { footer: FooterData }) {
  return <SiteFooter footer={footer} />;
}

/** Injects the site stylesheet. Published sites link it as a file instead. */
export function SiteStyles() {
  return <style>{SITE_CSS}</style>;
}

/** Builder-only hooks for wrapping parts of the page (selection outlines, toolbars). */
export type SitePageEditorHooks = {
  renderSection: (section: Section, content: ReactNode) => ReactNode;
  renderHeader: (content: ReactNode) => ReactNode;
  renderFooter: (content: ReactNode) => ReactNode;
  /** Shown inside <main> when the page has no sections. */
  emptyState: ReactNode;
};

type SitePageProps = {
  site: SiteData;
  page: PageData;
  /** When set, hidden sections are passed to `renderSection` too, so the editor can show them dimmed. */
  editor?: SitePageEditorHooks;
};

/** One full page of a client website: header, visible sections, footer. */
export default function SitePage({ site, page, editor }: SitePageProps) {
  // If page contains an explicit header or footer section, use it; otherwise fallback to global site header/footer
  const pageHeaderSection = page.sections.find(
    (section): section is SectionOf<"header"> => section.type === "header" && (Boolean(editor) || !section.hidden),
  );
  const pageFooterSection = page.sections.find(
    (section): section is SectionOf<"footer"> => section.type === "footer" && (Boolean(editor) || !section.hidden),
  );

  const effectiveHeader = pageHeaderSection
    ? <HeaderSection section={pageHeaderSection} />
    : (site.header && !site.header.hidden && (!page.sections || page.sections.length === 0))
      ? <SiteHeader header={site.header} />
      : null;

  const effectiveFooter = pageFooterSection ? <FooterSection section={pageFooterSection} /> : null;

  // Filter out header and footer sections from main content body so they never render twice or overlap
  const bodySections = page.sections.filter(
    (section) => section.type !== "header" && section.type !== "footer" && (editor || !section.hidden),
  );

  return (
    <SiteFrame
      theme={site.theme}
      header={editor && effectiveHeader ? editor.renderHeader(effectiveHeader) : effectiveHeader}
      footer={editor && effectiveFooter ? editor.renderFooter(effectiveFooter) : effectiveFooter}
    >
      {editor
        ? bodySections.length === 0
          ? editor.emptyState
          : bodySections.map((section) => (
              <Fragment key={section.id}>{editor.renderSection(section, <SectionView section={section} />)}</Fragment>
            ))
        : bodySections.map((section) => <SectionView key={section.id} section={section} />)}
    </SiteFrame>
  );
}
