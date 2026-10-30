import { parseRichText } from "../rich-text.tsx";
import { useState } from "react";
import EditorialSpecsSection from "./EditorialSpecsSection.tsx";
import {
  gridStyle,
  SectionHead,
  SectionShell,
  SiteButton,
  SiteIcon,
  SiteImage,
  SiteLink,
} from "../primitives.tsx";
import { StaticStates, useStaticRender } from "../render-mode.tsx";
import type { FeatureColor, SectionOf, ServiceItem } from "../types.ts";

const DEFAULT_COLOR_PALETTE: FeatureColor[] = ["primary", "secondary"];

function getItemColor(item: ServiceItem, index: number): FeatureColor {
  if (item.iconColor && item.iconColor !== "default") {
    return item.iconColor as FeatureColor;
  }
  if (item.badgeColor && item.badgeColor !== "default") {
    return item.badgeColor as FeatureColor;
  }
  return DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length];
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="wb-service-check-icon"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="wb-service-arrow-icon"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="wb-service-sparkle"
      aria-hidden="true"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

export default function ServicesSection({
  section,
}: {
  section: SectionOf<"services">;
}) {
  const { data } = section;
  const isStatic = useStaticRender();
  const [activeHoverIndex, setActiveHoverIndex] = useState<number>(0);

  const variant = data.variant ?? "cards-grid";
  const cardStyle = data.cardStyle ?? "surface";
  const iconStyle = data.iconStyle ?? "pastel-circle";
  const imageAspect = data.imageAspect ?? "16:9";
  const align = data.align ?? section.settings.align ?? "left";

  const showBadges = data.showBadges !== false;
  const showIcons = data.showIcons !== false;
  const showImages = data.showImages !== false;
  const showPrices = data.showPrices !== false;
  const showBullets = data.showBullets !== false;
  const showNumbers = data.showNumbers === true;

  const aspectClass = `wb-aspect-${imageAspect.replace(":", "-")}`;

  /**
   * Render single standard service card
   */
  const renderCard = (
    item: ServiceItem,
    index: number,
    options?: { isBentoHero?: boolean; isHorizontal?: boolean }
  ) => {
    const isCustomHex = typeof item.iconColor === "string" && item.iconColor.startsWith("#");
    const itemColor = isCustomHex ? "blue" : getItemColor(item, index);
    const colorClass = isCustomHex ? "" : `wb-color-${itemColor}`;
    const isFeatured = item.featured || options?.isBentoHero;
    const num = String(index + 1).padStart(2, "0");

    const customCardStyle = item.backgroundColor
      ? {
          backgroundColor: item.backgroundColor,
          background: item.backgroundColor,
        }
      : undefined;

    const iconCustomStyle = isCustomHex
      ? iconStyle === "colored-circle"
        ? { background: item.iconColor, color: "#ffffff" }
        : iconStyle === "minimal-accent"
          ? { color: item.iconColor, background: "transparent" }
          : iconStyle === "square-badge"
            ? {
                color: item.iconColor,
                background: `color-mix(in srgb, ${item.iconColor} 12%, transparent)`,
                borderColor: `color-mix(in srgb, ${item.iconColor} 26%, transparent)`,
              }
            : {
                color: item.iconColor,
                background: `color-mix(in srgb, ${item.iconColor} 15%, transparent)`,
              }
      : undefined;

    return (
      <article
        key={index}
        className={`wb-service-card wb-card wb-service-card-${cardStyle} ${colorClass} ${
          isFeatured ? "wb-service-card-featured" : ""
        } ${options?.isHorizontal ? "wb-service-card-horizontal" : ""} ${
          options?.isBentoHero ? "wb-service-bento-hero" : ""
        } wb-align-${align}`}
        style={customCardStyle}
      >
        {/* Featured Ribbon / Badge */}
        {isFeatured && (
          <div className="wb-service-featured-pill">
            <SparkleIcon /> Featured
          </div>
        )}

        {/* Media Top / Side */}
        {showImages && item.image && (
          <div className={`wb-service-image-wrap ${aspectClass}`}>
            <SiteImage image={item.image} className="wb-service-image" />
            {item.price && showPrices && (
              <span className="wb-service-floating-price">{item.price}</span>
            )}
          </div>
        )}

        {/* Card Body */}
        <div className="wb-service-body">
          {/* Header Top Bar: Left (Icon or Number) & Right (Badge / Price) */}
          {((showIcons && item.icon && iconStyle !== "none") ||
            showNumbers ||
            (showBadges && item.badge) ||
            (!item.image && showPrices && item.price)) && (
            <div className="wb-service-top-bar">
              <div className="wb-service-top-left">
                {showNumbers && (
                  <span className="wb-service-number">{num}</span>
                )}

                {showIcons && (item.icon || item.iconImage?.url) && iconStyle !== "none" && (
                  <div
                    className={`wb-service-icon-wrap wb-icon-style-${iconStyle} ${colorClass}`}
                    style={iconCustomStyle}
                  >
                    <SiteIcon name={item.icon} image={item.iconImage} />
                  </div>
                )}
              </div>

              <div className="wb-service-top-right">
                {showBadges && item.badge && (
                  <span className={`wb-service-badge ${colorClass}`}>
                    {item.badge}
                  </span>
                )}

                {!item.image && showPrices && item.price && (
                  <span className="wb-service-price-pill">{item.price}</span>
                )}
              </div>
            </div>
          )}

          {/* Title & Duration */}
          <div className="wb-service-title-group">
            <h3 className="wb-service-title">{parseRichText(item.title)}</h3>
            {item.duration && (
              <span className="wb-service-duration">⏱ {item.duration}</span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="wb-service-desc">{parseRichText(item.description)}</p>
          )}

          {/* Feature highlights checklist */}
          {showBullets && item.features && item.features.length > 0 && (
            <ul className="wb-service-features-list">
              {item.features.map((feat, fIdx) => (
                <li key={fIdx} className="wb-service-feature-item">
                  <CheckIcon />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Action Links */}
          {(item.link || item.secondaryLink) && (
            <div className="wb-service-actions">
              {item.link && (
                <SiteLink link={item.link} className="wb-service-link">
                  <span>{item.link.label || "Learn more"}</span>
                  <ArrowRightIcon />
                </SiteLink>
              )}
              {item.secondaryLink && (
                <SiteLink
                  link={item.secondaryLink}
                  className="wb-service-secondary-link"
                >
                  {item.secondaryLink.label || "Details"}
                </SiteLink>
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  // 1. Bento Grid Variant (Modern 2026 Asymmetric Showcase)
  if (variant === "bento-grid") {
    const featuredIndex = data.items.findIndex((item) => item.featured) >= 0
      ? data.items.findIndex((item) => item.featured)
      : 0;
    const heroItem = data.items[featuredIndex] ?? data.items[0];
    const otherItems = data.items.filter((_, idx) => idx !== featuredIndex);

    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-services-section wb-services-variant-bento wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead
          heading={data.heading}
          intro={data.intro}
          eyebrow={data.eyebrow}
          align={align}
        />

        <div className="wb-services-bento-grid">
          {/* Main expansive Hero Cell */}
          {heroItem && (
            <div className="wb-bento-cell-hero">
              {renderCard(heroItem, featuredIndex, { isBentoHero: true })}
            </div>
          )}

          {/* Satellite Bento Cells */}
          <div className="wb-bento-cell-satellites">
            {otherItems.map((item, idx) => {
              const actualIndex = idx >= featuredIndex ? idx + 1 : idx;
              return renderCard(item, actualIndex);
            })}
          </div>
        </div>

        {data.bottomCta && (
          <div className={`wb-services-bottom-cta wb-align-${align}`}>
            <SiteButton link={data.bottomCta} tone="primary" />
            {data.bottomSecondaryCta && (
              <SiteButton link={data.bottomSecondaryCta} tone="secondary" />
            )}
          </div>
        )}
      </SectionShell>
    );
  }

  // 2. Split Showcase Variant (Hero Card on Left/Right + Complementary Services)
  if (variant === "split-showcase") {
    const isRight = data.splitPosition === "right";
    const heroContent = (
      <div className="wb-services-split-hero">
        {data.eyebrow && <span className="wb-eyebrow">{parseRichText(data.eyebrow)}</span>}
        <h2 className="wb-services-split-title">{parseRichText(data.heading)}</h2>
        {data.intro && (
          <p className="wb-services-split-intro">{parseRichText(data.intro)}</p>
        )}
        {data.splitTagline && (
          <p className="wb-services-split-tagline">{data.splitTagline}</p>
        )}

        {data.splitImage && (
          <div className="wb-services-split-media">
            <SiteImage
              image={data.splitImage}
              className="wb-services-split-image"
            />
          </div>
        )}

        {(data.splitCta || data.secondaryCta) && (
          <div className="wb-services-split-actions">
            {data.splitCta && <SiteButton link={data.splitCta} tone="primary" />}
            {data.secondaryCta && (
              <SiteButton link={data.secondaryCta} tone="secondary" />
            )}
          </div>
        )}
      </div>
    );

    const listContent = (
      <div className="wb-services-split-list">
        {data.items.map((item, index) => renderCard(item, index))}
      </div>
    );

    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-services-section wb-services-variant-split ${
          isRight ? "wb-services-split-reversed" : ""
        }`}
        label={data.heading}
      >
        <div className="wb-services-split-container">
          {isRight ? (
            <>
              {listContent}
              {heroContent}
            </>
          ) : (
            <>
              {heroContent}
              {listContent}
            </>
          )}
        </div>

        {data.bottomCta && (
          <div className={`wb-services-bottom-cta wb-align-${align}`}>
            <SiteButton link={data.bottomCta} tone="primary" />
          </div>
        )}
      </SectionShell>
    );
  }

  // 3. Interactive / Hover Reveal Rows (Awwwards / Agency Studio Style)
  if (variant === "interactive-list") {
    const renderInteractive = (activeIndex: number) => {
      const activeItem = data.items[activeIndex] ?? data.items[0];
      return (
        <div className="wb-services-interactive-wrapper">
          {/* Interactive Row List */}
          <div className="wb-services-interactive-list">
            {data.items.map((item, index) => {
              const isCustomHex = typeof item.iconColor === "string" && item.iconColor.startsWith("#");
              const itemColor = isCustomHex ? "blue" : getItemColor(item, index);
              const colorClass = isCustomHex ? "" : `wb-color-${itemColor}`;
              const isActive = activeIndex === index;
              const num = String(index + 1).padStart(2, "0");

              return (
                <div
                  key={index}
                  onMouseEnter={() => setActiveHoverIndex(index)}
                  data-wb-go={index}
                  data-wb-go-hover=""
                  className={`wb-services-interactive-row ${colorClass} ${
                    isActive ? "wb-row-active" : ""
                  }`}
                >
                  <div className="wb-interactive-left">
                    <span className="wb-interactive-number">{num}</span>
                    {showIcons && (item.icon || item.iconImage?.url) && (
                      <div
                        className="wb-interactive-icon"
                        style={isCustomHex ? { color: item.iconColor } : undefined}
                      >
                        <SiteIcon name={item.icon} image={item.iconImage} />
                      </div>
                    )}
                    <h3 className="wb-interactive-title">{parseRichText(item.title)}</h3>
                  </div>

                  <div className="wb-interactive-right">
                    {showBadges && item.badge && (
                      <span className={`wb-service-badge ${colorClass}`}>
                        {item.badge}
                      </span>
                    )}
                    {showPrices && item.price && (
                      <span className="wb-interactive-price">{item.price}</span>
                    )}
                    {item.link && (
                      <SiteLink
                        link={item.link}
                        className="wb-interactive-arrow-btn"
                        aria-label={`View ${item.title}`}
                      >
                        <ArrowRightIcon />
                      </SiteLink>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Preview Panel on Hover */}
          {activeItem && (
            <div className="wb-services-interactive-preview">
              {activeItem.image && (
                <div className="wb-interactive-preview-media">
                  <SiteImage
                    image={activeItem.image}
                    className="wb-interactive-preview-img"
                  />
                </div>
              )}
              <div className="wb-interactive-preview-body">
                <div className="wb-interactive-preview-meta">
                  {activeItem.badge && (
                    <span className="wb-service-badge">{activeItem.badge}</span>
                  )}
                  {activeItem.price && (
                    <span className="wb-service-price-pill">
                      {activeItem.price}
                    </span>
                  )}
                </div>
                <h4 className="wb-interactive-preview-title">
                  {parseRichText(activeItem.title)}
                </h4>
                <p className="wb-interactive-preview-desc">
                  {parseRichText(activeItem.description)}
                </p>
                {activeItem.features && activeItem.features.length > 0 && (
                  <ul className="wb-service-features-list">
                    {activeItem.features.slice(0, 3).map((feat, fIdx) => (
                      <li key={fIdx} className="wb-service-feature-item">
                        <CheckIcon />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {activeItem.link && (
                  <SiteLink
                    link={activeItem.link}
                    className="wb-service-link mt-2"
                  >
                    <span>{activeItem.link.label || "Get started"}</span>
                    <ArrowRightIcon />
                  </SiteLink>
                )}
              </div>
            </div>
          )}
        </div>
      );
    };

    return (

      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-services-section wb-services-variant-interactive wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead
          heading={data.heading}
          intro={data.intro}
          eyebrow={data.eyebrow}
          align={align}
        />

        {isStatic ? (
          <StaticStates states={data.items.map((_, index) => index)} initial={0} render={renderInteractive} />
        ) : (
          renderInteractive(activeHoverIndex)
        )}

        {data.bottomCta && (
          <div className={`wb-services-bottom-cta wb-align-${align}`}>
            <SiteButton link={data.bottomCta} tone="primary" />
          </div>
        )}
      </SectionShell>
    );
  }

  // 4. Horizontal Cards Variant (Rich Enterprise Rows)
  if (variant === "horizontal-cards") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-services-section wb-services-variant-horizontal wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead
          heading={data.heading}
          intro={data.intro}
          eyebrow={data.eyebrow}
          align={align}
        />

        <div className="wb-services-horizontal-stack">
          {data.items.map((item, index) =>
            renderCard(item, index, { isHorizontal: true })
          )}
        </div>

        {data.bottomCta && (
          <div className={`wb-services-bottom-cta wb-align-${align}`}>
            <SiteButton link={data.bottomCta} tone="primary" />
          </div>
        )}
      </SectionShell>
    );
  }

  // 5. Minimal Numbered Variant (Editorial / Consulting Luxury)
  if (variant === "minimal-numbered") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-services-section wb-services-variant-numbered wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead
          heading={data.heading}
          intro={data.intro}
          eyebrow={data.eyebrow}
          align={align}
        />

        <div
          className="wb-grid wb-services-numbered-grid"
          style={gridStyle(data.columns, data.mobileColumns)}
        >
          {data.items.map((item, index) => {
            const itemColor = getItemColor(item, index);
            const colorClass = `wb-color-${itemColor}`;
            const num = String(index + 1).padStart(2, "0");

            return (
              <div
                key={index}
                className={`wb-service-numbered-card ${colorClass} wb-align-${align}`}
              >
                <div className="wb-numbered-top">
                  <span className="wb-numbered-index">{num}</span>
                  {showBadges && item.badge && (
                    <span className={`wb-service-badge ${colorClass}`}>
                      {item.badge}
                    </span>
                  )}
                </div>

                <h3 className="wb-service-title">{parseRichText(item.title)}</h3>
                <p className="wb-service-desc">{parseRichText(item.description)}</p>

                {showBullets && item.features && item.features.length > 0 && (
                  <ul className="wb-service-features-list">
                    {item.features.map((feat, fIdx) => (
                      <li key={fIdx} className="wb-service-feature-item">
                        <CheckIcon />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {item.link && (
                  <SiteLink link={item.link} className="wb-service-link">
                    <span>{item.link.label || "Learn more"}</span>
                    <ArrowRightIcon />
                  </SiteLink>
                )}
              </div>
            );
          })}
        </div>

        {data.bottomCta && (
          <div className={`wb-services-bottom-cta wb-align-${align}`}>
            <SiteButton link={data.bottomCta} tone="primary" />
          </div>
        )}
      </SectionShell>
    );
  }

  // 6. Editorial Specs Variant (Vintage Reels "THE SPECS — WHAT WE MAKE" / "WHAT WE SHOOT")
  if (variant === "editorial-specs") {
    return <EditorialSpecsSection section={section} />;
  }

  // 7. Standard Modern Cards Grid Variant (Default)
  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-services-section wb-services-variant-${variant} wb-align-${align}`}
      label={data.heading}
    >
      <SectionHead
        heading={data.heading}
        intro={data.intro}
        eyebrow={data.eyebrow}
        align={align}
      />

      <div
        className="wb-grid wb-services-grid"
        style={gridStyle(data.columns, data.mobileColumns)}
      >
        {data.items.map((item, index) => renderCard(item, index))}
      </div>

      {data.bottomCta && (
        <div className={`wb-services-bottom-cta wb-align-${align}`}>
          <SiteButton link={data.bottomCta} tone="primary" />
          {data.bottomSecondaryCta && (
            <SiteButton link={data.bottomSecondaryCta} tone="secondary" />
          )}
        </div>
      )}
    </SectionShell>
  );
}
