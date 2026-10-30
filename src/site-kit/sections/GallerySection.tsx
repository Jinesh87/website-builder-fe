import { parseRichText } from "../rich-text.tsx";
import { gridStyle, SectionHead, SectionShell, SiteButton, SiteImage } from "../primitives.tsx";
import type { GalleryAspect, SectionOf } from "../types.ts";

function aspectClass(aspect?: GalleryAspect): string {
  switch (aspect) {
    case "1:1":
      return "aspect-square";
    case "16:9":
      return "aspect-[16/9]";
    case "3:4":
      return "aspect-[3/4]";
    case "auto":
      return "aspect-auto";
    case "4:3":
    default:
      return "aspect-[4/3]";
  }
}

function radiusClass(radius?: "default" | "soft" | "pill" | "sharp"): string {
  switch (radius) {
    case "soft":
      return "rounded-md";
    case "pill":
      return "rounded-2xl sm:rounded-3xl";
    case "sharp":
      return "rounded-none";
    case "default":
    default:
      return "rounded-[calc(var(--wb-radius,12px))]";
  }
}

export default function GallerySection({ section }: { section: SectionOf<"gallery"> }) {
  const { data } = section;
  const align = data.align || section.settings.align || "center";
  const imageAspect = data.imageAspect || "4:3";
  const cardStyle = data.cardStyle || "default";
  const radius = radiusClass(data.imageRadius);
  const aspect = aspectClass(imageAspect);

  const introText = data.intro || data.description;

  return (
    <SectionShell sectionId={section.id} settings={section.settings} className={`wb-gallery wb-align-${align}`} label={data.heading}>
      <SectionHead
        heading={data.heading}
        intro={introText}
        eyebrow={data.eyebrow}
        align={align}
      />
      <div className="wb-grid" style={gridStyle(data.columns, data.mobileColumns)}>
        {data.images.map((image, index) => {
          const name = image.name || image.title;
          const badge = image.badge;
          const desc = image.description;
          const hasMeta = Boolean(name || badge || desc);

          const isOverlay = cardStyle === "overlay";
          const isSurface = cardStyle === "surface";

          const card = (
            <div
              className={`wb-gallery-card group flex flex-col w-full text-left transition-all ${
                isSurface
                  ? `wb-gallery-surface p-3.5 bg-surface border border-border/80 shadow-2xs hover:shadow-sm ${radius}`
                  : ""
              }`}
            >
              <div className={`wb-gallery-image-wrap relative w-full overflow-hidden ${radius}`}>
                <SiteImage
                  image={image}
                  contextText={name || data.heading}
                  className={`w-full ${aspect} object-cover transition-transform duration-300 group-hover:scale-[1.03]`}
                />
                {isOverlay && hasMeta && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <div className="flex items-center justify-between gap-2">
                      {name ? (
                        <span className="font-semibold text-sm sm:text-base text-white line-clamp-1">
                          {parseRichText(name)}
                        </span>
                      ) : (
                        <span />
                      )}
                      {badge && (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 bg-white/20 px-2 py-0.5 rounded-full shrink-0">
                          {badge}
                        </span>
                      )}
                    </div>
                    {desc && (
                      <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mt-1">
                        {parseRichText(desc)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {!isOverlay && hasMeta && (
                <div className="wb-gallery-caption flex flex-col gap-1 pt-2.5 px-0.5">
                  <div className="flex items-center justify-between gap-2.5">
                    {name ? (
                      <span className="wb-gallery-name font-semibold text-sm sm:text-base text-ink line-clamp-1">
                        {parseRichText(name)}
                      </span>
                    ) : (
                      <span />
                    )}
                    {badge && (
                      <span className="wb-gallery-badge text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">
                        {badge}
                      </span>
                    )}
                  </div>
                  {desc && (
                    <p className="wb-gallery-desc text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                      {parseRichText(desc)}
                    </p>
                  )}
                </div>
              )}
            </div>
          );

          if (image.link) {
            return (
              <a
                key={`${image.url}-${index}`}
                href={image.link}
                className={`wb-gallery-link block no-underline text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${radius}`}
              >
                {card}
              </a>
            );
          }

          return (
            <div key={`${image.url}-${index}`} className="wb-gallery-item">
              {card}
            </div>
          );
        })}
      </div>

      {data.cta && data.cta.label && (
        <div
          className={`wb-gallery-bottom-cta mt-10 sm:mt-12 flex w-full ${
            align === "left"
              ? "justify-start"
              : align === "right"
                ? "justify-end"
                : "justify-center"
          }`}
        >
          <SiteButton link={data.cta} tone="primary" />
        </div>
      )}
    </SectionShell>
  );
}
