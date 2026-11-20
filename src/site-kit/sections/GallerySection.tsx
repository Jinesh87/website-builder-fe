import { useState } from "react";
import { parseRichText } from "../rich-text.tsx";
import { gridStyle, SectionHead, SectionShell, SiteButton, SiteImage } from "../primitives.tsx";
import { StaticStates, useStaticRender } from "../render-mode.tsx";
import { galleryTabs, showsGalleryFilters, type GalleryTab } from "../gallery-filters.ts";
import type { GalleryAspect, GalleryCardStyle, GalleryData, GalleryItem, SectionOf } from "../types.ts";

// Plain wb-* classes (gallery-styles.ts): live pages load SITE_CSS only, without Tailwind utilities.
const ASPECT_CLASS: Record<GalleryAspect, string> = {
  "4:3": "wb-gallery-a-4x3",
  "1:1": "wb-gallery-a-1x1",
  "16:9": "wb-gallery-a-16x9",
  "3:4": "wb-gallery-a-3x4",
  auto: "wb-gallery-a-auto",
};

function radiusClass(radius?: "default" | "soft" | "pill" | "sharp"): string {
  return `wb-gallery-r-${radius ?? "default"}`;
}

type CardLook = { cardStyle: GalleryCardStyle; radius: string; aspect: string; heading?: string };

function GalleryCard({ image, look }: { image: GalleryItem; look: CardLook }) {
  const { cardStyle, radius, aspect } = look;
  const name = image.name || image.title;
  const badge = image.badge;
  const desc = image.description;
  const hasMeta = Boolean(name || badge || desc);
  const isOverlay = cardStyle === "overlay";
  const isSurface = cardStyle === "surface";
  const isReveal = cardStyle === "reveal";

  return (
    <div
      className={`wb-gallery-card group flex flex-col w-full text-left transition-all ${
        isSurface ? `wb-gallery-surface p-3.5 bg-surface border border-border/80 shadow-2xs hover:shadow-sm ${radius}` : ""
      } ${isReveal ? `wb-gallery-reveal ${radius}` : ""}`}
    >
      <div className={`wb-gallery-image-wrap relative w-full overflow-hidden ${radius}`}>
        <SiteImage
          image={image}
          contextText={name || look.heading}
          className={`w-full ${aspect} object-cover ${isReveal ? "" : "transition-transform duration-300 group-hover:scale-[1.03]"}`}
        />
        {isReveal && (name || desc) && (
          <div className="wb-gallery-reveal-layer">
            {name && <span className="wb-gallery-reveal-title">{parseRichText(name)}</span>}
            {desc && <p className="wb-gallery-reveal-desc">{parseRichText(desc)}</p>}
          </div>
        )}
        {isOverlay && hasMeta && (
          <div className="wb-gallery-overlay-layer">
            <div className="flex items-center justify-between gap-2">
              {name ? <span className="font-semibold text-sm sm:text-base text-white line-clamp-1">{parseRichText(name)}</span> : <span />}
              {badge && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 bg-white/20 px-2 py-0.5 rounded-full shrink-0">
                  {badge}
                </span>
              )}
            </div>
            {desc && <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mt-1">{parseRichText(desc)}</p>}
          </div>
        )}
      </div>
      {!isOverlay && !isReveal && hasMeta && (
        <div className="wb-gallery-caption flex flex-col gap-1 pt-2.5 px-0.5">
          <div className="flex items-center justify-between gap-2.5">
            {name ? (
              <span className="wb-gallery-name font-semibold text-sm sm:text-base text-ink line-clamp-1">{parseRichText(name)}</span>
            ) : (
              <span />
            )}
            {badge && <span className="wb-gallery-badge text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">{badge}</span>}
          </div>
          {desc && (
            <p className="wb-gallery-desc text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-0.5">{parseRichText(desc)}</p>
          )}
        </div>
      )}
    </div>
  );
}

function GalleryGrid({ images, data, look }: { images: GalleryItem[]; data: GalleryData; look: CardLook }) {
  return (
    <div className="wb-grid" style={gridStyle(data.columns, data.mobileColumns)}>
      {images.map((image, index) =>
        image.link ? (
          <a
            key={`${image.url}-${index}`}
            href={image.link}
            className={`wb-gallery-link block no-underline text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${look.radius}`}
          >
            <GalleryCard image={image} look={look} />
          </a>
        ) : (
          // Reveal cards are focusable so keyboard users can see the hover title too.
          <div key={`${image.url}-${index}`} className="wb-gallery-item" tabIndex={look.cardStyle === "reveal" ? 0 : undefined}>
            <GalleryCard image={image} look={look} />
          </div>
        ),
      )}
    </div>
  );
}

function FilterTabs({ tabs, active, onSelect }: { tabs: GalleryTab[]; active: string; onSelect?: (key: string) => void }) {
  return (
    <div className="wb-gallery-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === active}
          className={`wb-gallery-tab${tab.key === active ? " wb-gallery-tab-active" : ""}`}
          data-wb-go={onSelect ? undefined : tab.key}
          onClick={onSelect ? () => onSelect(tab.key) : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function FilteredGallery({ tabs, data, look }: { tabs: GalleryTab[]; data: GalleryData; look: CardLook }) {
  const isStatic = useStaticRender();
  const [active, setActive] = useState("all");
  const render = (key: string) => (
    <>
      <FilterTabs tabs={tabs} active={key} onSelect={isStatic ? undefined : setActive} />
      <GalleryGrid images={(tabs.find((tab) => tab.key === key) ?? tabs[0]!).images} data={data} look={look} />
    </>
  );
  // A category removed in the editor may leave a stale tab selected.
  const current = tabs.some((tab) => tab.key === active) ? active : "all";
  return isStatic ? <StaticStates states={tabs.map((tab) => tab.key)} initial="all" render={render} /> : render(current);
}

export default function GallerySection({ section }: { section: SectionOf<"gallery"> }) {
  const { data } = section;
  const align = data.align || section.settings.align || "center";
  const look: CardLook = {
    cardStyle: data.cardStyle || "default",
    radius: radiusClass(data.imageRadius),
    aspect: ASPECT_CLASS[data.imageAspect ?? "4:3"] ?? ASPECT_CLASS["4:3"],
    heading: data.heading,
  };
  const tabs = galleryTabs(data);

  return (
    <SectionShell sectionId={section.id} settings={section.settings} className={`wb-gallery wb-align-${align}`} label={data.heading}>
      <SectionHead heading={data.heading} intro={data.intro || data.description} eyebrow={data.eyebrow} align={align} />
      {showsGalleryFilters(data, tabs) ? (
        <FilteredGallery tabs={tabs} data={data} look={look} />
      ) : (
        <GalleryGrid images={data.images} data={data} look={look} />
      )}

      {data.cta && data.cta.label && (
        <div
          className={`wb-gallery-bottom-cta mt-10 sm:mt-12 flex w-full ${
            align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center"
          }`}
        >
          <SiteButton link={data.cta} tone="primary" />
        </div>
      )}
    </SectionShell>
  );
}
