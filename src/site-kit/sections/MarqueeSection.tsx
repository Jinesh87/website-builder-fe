import { SectionHead, SectionShell, SiteIcon } from "../primitives.tsx";
import type {
  MarqueeItem,
  MarqueeVariant,
  SectionOf,
} from "../types.ts";

function StarIcon() {
  return (
    <svg className="wb-marquee-separator-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function MarqueeTrack({
  items,
  variant,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  fontSize = "medium",
}: {
  items: MarqueeItem[];
  variant: MarqueeVariant;
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  fontSize?: "small" | "medium" | "large" | "huge";
}) {
  const speedClass = `wb-marquee-speed-${speed}`;
  const dirClass = `wb-marquee-dir-${direction}`;
  const fontClass = `wb-marquee-font-${fontSize}`;
  const pauseClass = pauseOnHover ? "wb-marquee-pause-hover" : "";

  // Render items twice for a 100% gapless continuous marquee loop
  const duplicated = [...items, ...items];

  return (
    <div className={`wb-marquee-track-wrapper ${dirClass} ${pauseClass}`}>
      <div className={`wb-marquee-track ${speedClass} ${fontClass}`}>
        {duplicated.map((item, index) => (
          <div key={index} className="wb-marquee-item-wrapper">
            {variant === "cards-stream" ? (
              <div className="wb-marquee-card">
                {(item.icon || item.iconImage?.url) && (
                  <div className="wb-marquee-card-icon">
                    <SiteIcon name={item.icon} image={item.iconImage} />
                  </div>
                )}
                <div className="wb-marquee-card-content">
                  {item.badge && <span className="wb-marquee-card-badge">{item.badge}</span>}
                  <p className="wb-marquee-card-title">{item.text}</p>
                  {item.subtext && <p className="wb-marquee-card-sub">{item.subtext}</p>}
                </div>
              </div>
            ) : variant === "pill-badges" ? (
              <div className="wb-marquee-pill">
                {(item.icon || item.iconImage?.url) && (
                  <span className="wb-marquee-pill-icon">
                    <SiteIcon name={item.icon} image={item.iconImage} />
                  </span>
                )}
                <span className="wb-marquee-pill-text">{item.text}</span>
                {item.badge && <span className="wb-marquee-pill-badge">{item.badge}</span>}
              </div>
            ) : (
              <div className="wb-marquee-text-block">
                {(item.icon || item.iconImage?.url) && (
                  <span className="wb-marquee-text-icon">
                    <SiteIcon name={item.icon} image={item.iconImage} />
                  </span>
                )}
                <span className="wb-marquee-text">{item.text}</span>
                {item.badge && <span className="wb-marquee-text-badge">{item.badge}</span>}
                <StarIcon />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN MARQUEE COMPONENT
   ========================================================================= */
export default function MarqueeSection({ section }: { section: SectionOf<"marquee"> }) {
  const { data } = section;
  const variant: MarqueeVariant = data.variant || "ticker-text";
  const items = data.items && data.items.length > 0 ? data.items : [];
  const secondaryItems =
    data.secondaryItems && data.secondaryItems.length > 0
      ? data.secondaryItems
      : items;

  const gradientFades = data.gradientFades ?? true;
  const speed = data.speed || "normal";
  const direction = data.direction || "left";
  const pauseOnHover = data.pauseOnHover ?? true;
  const fontSize = data.fontSize || "medium";

  if (items.length === 0) return null;

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      fullWidth
      className={`wb-marquee wb-marquee-variant-${variant} ${gradientFades ? "wb-marquee-has-fades" : ""}`}
      label={data.heading || "Marquee"}
    >
      {(data.heading || data.intro || data.eyebrow) && (
        <div className="wb-marquee-header-wrapper wb-align-center">
          {data.eyebrow && <span className="wb-marquee-eyebrow">{data.eyebrow}</span>}
          {data.heading && <SectionHead heading={data.heading} intro={data.intro} />}
        </div>
      )}

      <div className="wb-marquee-container">
        {/* Track 1 */}
        <MarqueeTrack
          items={items}
          variant={variant}
          direction={direction}
          speed={speed}
          pauseOnHover={pauseOnHover}
          fontSize={fontSize}
        />

        {/* Track 2 (For Dual-Directional Streaming) */}
        {variant === "dual-directional" && (
          <MarqueeTrack
            items={secondaryItems}
            variant={variant}
            direction={direction === "left" ? "right" : "left"}
            speed={speed}
            pauseOnHover={pauseOnHover}
            fontSize={fontSize}
          />
        )}

        {/* Edge Gradient Fades */}
        {gradientFades && (
          <>
            <div className="wb-marquee-fade-left" aria-hidden="true" />
            <div className="wb-marquee-fade-right" aria-hidden="true" />
          </>
        )}
      </div>
    </SectionShell>
  );
}
