import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SectionHead, SectionShell, SiteImage, SiteLink } from "../primitives.tsx";
import { StaticStates, useStaticRender } from "../render-mode.tsx";
import type {
  CarouselCardStyle,
  CarouselSlide,
  CarouselVariant,
  SectionAlign,
  SectionOf,
} from "../types.ts";
import CurvedBannerCarousel, {
  DEFAULT_BANNER_ITEMS,
} from "../../components/common/CurvedBannerCarousel.tsx";

function ChevronLeftIcon() {
  return (
    <svg className="wb-carousel-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="wb-carousel-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function getCardStyleClass(cardStyle?: CarouselCardStyle): string {
  switch (cardStyle) {
    case "bordered":
      return "wb-carousel-card-bordered";
    case "elevated":
      return "wb-carousel-card-elevated";
    case "flat":
      return "wb-carousel-card-flat";
    case "glass":
      return "wb-carousel-card-glass";
    case "contrast":
      return "wb-carousel-card-contrast";
    case "default":
    default:
      return "wb-carousel-card-default";
  }
}

/* =========================================================================
   VARIANT 1: Multi-Card Slider
   ========================================================================= */
function CarouselCards({
  slides,
  cardStyle,
  activeIndex,
  onPrev,
  onNext,
  onSelect,
  showArrows,
  showDots,
}: {
  slides: CarouselSlide[];
  cardStyle?: CarouselCardStyle;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  showArrows: boolean;
  showDots: boolean;
}) {
  const cardClass = getCardStyleClass(cardStyle);

  return (
    <div className="wb-carousel-cards-wrapper">
      <div className="wb-carousel-cards-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={index} className={`wb-carousel-slide-item ${index === activeIndex ? "wb-slide-active" : ""}`}>
            <div className={`wb-carousel-card ${cardClass}`}>
              {slide.image && (
                <div className="wb-carousel-card-media">
                  <SiteImage image={slide.image} className="wb-carousel-card-img" />
                  {slide.badge && <span className="wb-carousel-card-badge">{slide.badge}</span>}
                </div>
              )}
              <div className="wb-carousel-card-body">
                {!slide.image && slide.badge && (
                  <span className="wb-carousel-badge-inline">{slide.badge}</span>
                )}
                {slide.subtitle && <p className="wb-carousel-card-sub">{slide.subtitle}</p>}
                <h3 className="wb-carousel-card-title">{slide.title}</h3>
                {slide.description && <p className="wb-carousel-card-desc">{slide.description}</p>}
                {(slide.button || slide.secondaryButton) && (
                  <div className="wb-carousel-card-actions">
                    {slide.button && <SiteLink link={slide.button} className="wb-btn wb-btn-primary" />}
                    {slide.secondaryButton && <SiteLink link={slide.secondaryButton} className="wb-btn wb-btn-secondary" />}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="wb-carousel-controls-bar">
        {showDots && slides.length > 1 && (
          <div className="wb-carousel-dots" role="tablist" aria-label="Slides">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`wb-carousel-dot ${i === activeIndex ? "wb-dot-active" : ""}`}
                onClick={() => onSelect(i)}
                data-wb-go={i}
                aria-label={`Slide ${i + 1}`}
                aria-selected={i === activeIndex}
              />
            ))}
          </div>
        )}

        {showArrows && slides.length > 1 && (
          <div className="wb-carousel-arrows">
            <button
              type="button"
              className="wb-carousel-arrow-btn"
              onClick={onPrev}
              data-wb-go="prev"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="wb-carousel-arrow-btn"
              onClick={onNext}
              data-wb-go="next"
              aria-label="Next slide"
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   VARIANT 2: Hero Banner Slider
   ========================================================================= */
const DEFAULT_HERO_SLIDE_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1800&auto=format&fit=crop&q=80",
    alt: "Global digital technology studio and innovation lab",
  },
  {
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1800&auto=format&fit=crop&q=80",
    alt: "Cloud infrastructure and data network connectivity",
  },
  {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1800&auto=format&fit=crop&q=80",
    alt: "Futuristic digital intelligence and fluid architecture",
  },
];

function CarouselHeroSlider({
  slides,
  cardStyle,
  align = "left",
  activeIndex,
  onPrev,
  onNext,
  onSelect,
  showArrows,
  showDots,
}: {
  slides: CarouselSlide[];
  cardStyle?: CarouselCardStyle;
  align?: SectionAlign;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  showArrows: boolean;
  showDots: boolean;
}) {
  const cardClass = getCardStyleClass(cardStyle);
  const alignClass = `wb-align-${align}`;

  return (
    <div className={`wb-carousel-hero-container ${cardClass} ${alignClass}`}>
      <div className="wb-carousel-hero-slides-viewport">
        {slides.map((slide, i) => {
          const isActive = i === activeIndex;
          const slideImg =
            slide.image?.url && slide.image.url.trim() !== ""
              ? slide.image
              : DEFAULT_HERO_SLIDE_IMAGES[i % DEFAULT_HERO_SLIDE_IMAGES.length];

          return (
            <div
              key={i}
              className={`wb-carousel-hero-slide ${isActive ? "wb-hero-slide-active" : ""}`}
              aria-hidden={!isActive}
            >
              <div className="wb-carousel-hero-bg">
                <SiteImage image={slideImg} className="wb-carousel-hero-img" />
                <div className="wb-carousel-hero-overlay" />
                <div className="wb-carousel-hero-glow" />
              </div>

              <div className="wb-carousel-hero-content">
                {slide.badge && (
                  <div className="wb-carousel-hero-badge-pill">
                    <span className="wb-carousel-pulse-dot" aria-hidden="true" />
                    <span>{slide.badge}</span>
                  </div>
                )}
                {slide.subtitle && <p className="wb-carousel-hero-sub">{slide.subtitle}</p>}
                <h2 className="wb-carousel-hero-title">{slide.title}</h2>
                {(slide.description || slide.caption) && (
                  <p className="wb-carousel-hero-desc">
                    {slide.description || slide.caption}
                  </p>
                )}

                {(slide.button || slide.secondaryButton) && (
                  <div className="wb-carousel-hero-actions">
                    {slide.button && (
                      <SiteLink
                        link={slide.button}
                        className="wb-btn wb-btn-primary wb-btn-lg"
                      />
                    )}
                    {slide.secondaryButton && (
                      <SiteLink
                        link={slide.secondaryButton}
                        className="wb-btn wb-btn-secondary wb-btn-lg"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Controls Bar */}
      {slides.length > 1 && (
        <div className="wb-carousel-hero-nav-bar">
          <div className="wb-carousel-hero-counter">
            <span className="wb-hero-counter-current">{String(activeIndex + 1).padStart(2, "0")}</span>
            <span className="wb-hero-counter-sep">/</span>
            <span className="wb-hero-counter-total">{String(slides.length).padStart(2, "0")}</span>
          </div>

          {showDots && (
            <div className="wb-carousel-hero-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`wb-carousel-hero-dot ${i === activeIndex ? "wb-hero-dot-active" : ""}`}
                  onClick={() => onSelect(i)}
                data-wb-go={i}
                  aria-label={`Slide ${i + 1}`}
                >
                  <span className="wb-hero-dot-bar" />
                </button>
              ))}
            </div>
          )}

          {showArrows && (
            <div className="wb-carousel-hero-arrows">
              <button
                type="button"
                className="wb-carousel-hero-arrow-btn"
                onClick={onPrev}
              data-wb-go="prev"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                className="wb-carousel-hero-arrow-btn"
                onClick={onNext}
              data-wb-go="next"
                aria-label="Next slide"
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   VARIANT 3: Showcase Focus
   ========================================================================= */
function CarouselShowcase({
  slides,
  cardStyle,
  activeIndex,
  onPrev,
  onNext,
  onSelect,
}: {
  slides: CarouselSlide[];
  cardStyle?: CarouselCardStyle;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}) {
  const cardClass = getCardStyleClass(cardStyle);

  return (
    <div className="wb-carousel-showcase-container">
      <div className="wb-carousel-showcase-stage">
        {slides.map((slide, i) => {
          const offset = i - activeIndex;
          const isCenter = offset === 0;
          const isLeft = offset === -1 || (activeIndex === 0 && i === slides.length - 1);
          const isRight = offset === 1 || (activeIndex === slides.length - 1 && i === 0);

          let positionClass = "wb-showcase-hidden";
          if (isCenter) positionClass = "wb-showcase-center";
          else if (isLeft) positionClass = "wb-showcase-left";
          else if (isRight) positionClass = "wb-showcase-right";

          return (
            <div
              key={i}
              className={`wb-carousel-showcase-card ${positionClass} ${cardClass}`}
              onClick={() => onSelect(i)}
                data-wb-go={i}
            >
              {slide.image && (
                <div className="wb-carousel-showcase-media">
                  <SiteImage image={slide.image} className="wb-carousel-showcase-img" />
                </div>
              )}
              <div className="wb-carousel-showcase-info">
                {slide.badge && <span className="wb-carousel-badge-inline">{slide.badge}</span>}
                <h3 className="wb-carousel-showcase-title">{slide.title}</h3>
                {slide.description && <p className="wb-carousel-showcase-desc">{slide.description}</p>}
                {isCenter && (slide.button || slide.secondaryButton) && (
                  <div className="wb-carousel-showcase-actions" onClick={(e) => e.stopPropagation()}>
                    {slide.button && <SiteLink link={slide.button} className="wb-btn wb-btn-primary" />}
                    {slide.secondaryButton && <SiteLink link={slide.secondaryButton} className="wb-btn wb-btn-secondary" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="wb-carousel-showcase-nav">
        <button type="button" className="wb-carousel-arrow-btn" onClick={onPrev}
              data-wb-go="prev" aria-label="Previous">
          <ChevronLeftIcon />
        </button>
        <span className="wb-carousel-counter">
          {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <button type="button" className="wb-carousel-arrow-btn" onClick={onNext}
              data-wb-go="next" aria-label="Next">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   VARIANT 4: Minimal Editorial Slide Deck
   ========================================================================= */
function CarouselMinimalEditorial({
  slides,
  activeIndex,
  onPrev,
  onNext,
  onSelect,
}: {
  slides: CarouselSlide[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}) {
  const current = slides[activeIndex] || slides[0];
  if (!current) return null;

  return (
    <div className="wb-carousel-editorial-container">
      <div className="wb-carousel-editorial-grid">
        <div className="wb-carousel-editorial-left">
          <div className="wb-carousel-editorial-header">
            <span className="wb-carousel-editorial-num">
              {String(activeIndex + 1).padStart(2, "0")} <span className="wb-muted">/ {String(slides.length).padStart(2, "0")}</span>
            </span>
            {current.badge && (
              <span className="wb-carousel-editorial-tag">{current.badge}</span>
            )}
          </div>

          <div className="wb-carousel-editorial-body">
            {current.subtitle && <p className="wb-carousel-editorial-sub">{current.subtitle}</p>}
            <h2 className="wb-carousel-editorial-title">{current.title}</h2>
            {current.description && <p className="wb-carousel-editorial-desc">{current.description}</p>}

            {(current.button || current.secondaryButton) && (
              <div className="wb-carousel-editorial-actions">
                {current.button && <SiteLink link={current.button} className="wb-btn wb-btn-primary" />}
                {current.secondaryButton && <SiteLink link={current.secondaryButton} className="wb-btn wb-btn-secondary" />}
              </div>
            )}
          </div>

          <div className="wb-carousel-editorial-nav">
            <div className="wb-carousel-editorial-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`wb-carousel-editorial-tab ${idx === activeIndex ? "wb-tab-active" : ""}`}
                  onClick={() => onSelect(idx)}
                  data-wb-go={idx}
                >
                  <span className="wb-tab-line" />
                </button>
              ))}
            </div>

            <div className="wb-carousel-arrows">
              <button type="button" className="wb-carousel-arrow-btn" onClick={onPrev}
              data-wb-go="prev" aria-label="Previous">
                <ChevronLeftIcon />
              </button>
              <button type="button" className="wb-carousel-arrow-btn" onClick={onNext}
              data-wb-go="next" aria-label="Next">
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="wb-carousel-editorial-right">
          {current.image && (
            <div className="wb-carousel-editorial-media">
              <SiteImage image={current.image} className="wb-carousel-editorial-img" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   VARIANT 5: Full Image Gallery Slider (with Thumbnails & Captions)
   ========================================================================= */
function CarouselImageGallery({
  slides,
  activeIndex,
  onPrev,
  onNext,
  onSelect,
  showArrows,
  showDots,
  showThumbnails,
  aspect = "16:9",
}: {
  slides: CarouselSlide[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  showArrows: boolean;
  showDots: boolean;
  showThumbnails?: boolean;
  aspect?: "16:9" | "4:3" | "1:1" | "21:9" | "3:4";
}) {
  const current = slides[activeIndex] || slides[0];
  if (!current) return null;

  const aspectClass = `wb-aspect-${aspect.replace(":", "-")}`;

  return (
    <div className="wb-carousel-gallery-container">
      <div className={`wb-carousel-gallery-viewport ${aspectClass}`}>
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`wb-carousel-gallery-slide ${idx === activeIndex ? "wb-gallery-slide-active" : ""}`}
          >
            {slide.image && (
              <SiteImage image={slide.image} className="wb-carousel-gallery-img" />
            )}
            <div className="wb-carousel-gallery-overlay" />
          </div>
        ))}

        {/* Floating caption card */}
        {(current.title || current.caption || current.description || current.badge) && (
          <div className="wb-carousel-gallery-caption">
            <div className="wb-carousel-gallery-caption-head">
              {current.badge && (
                <span className="wb-carousel-gallery-badge">{current.badge}</span>
              )}
              <span className="wb-carousel-gallery-counter">
                {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>
            {current.title && <h3 className="wb-carousel-gallery-title">{current.title}</h3>}
            {(current.caption || current.description) && (
              <p className="wb-carousel-gallery-desc">{current.caption || current.description}</p>
            )}
            {(current.button || current.secondaryButton) && (
              <div className="wb-carousel-gallery-actions">
                {current.button && <SiteLink link={current.button} className="wb-btn wb-btn-primary wb-btn-sm" />}
                {current.secondaryButton && <SiteLink link={current.secondaryButton} className="wb-btn wb-btn-secondary wb-btn-sm" />}
              </div>
            )}
          </div>
        )}

        {/* Overlay Navigation Arrows */}
        {showArrows && slides.length > 1 && (
          <div className="wb-carousel-gallery-arrows">
            <button
              type="button"
              className="wb-carousel-gallery-arrow-btn"
              onClick={onPrev}
              data-wb-go="prev"
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="wb-carousel-gallery-arrow-btn"
              onClick={onNext}
              data-wb-go="next"
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}

        {/* Dots Bar if enabled */}
        {showDots && !showThumbnails && slides.length > 1 && (
          <div className="wb-carousel-gallery-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`wb-carousel-dot ${i === activeIndex ? "wb-dot-active" : ""}`}
                onClick={() => onSelect(i)}
                data-wb-go={i}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {showThumbnails && slides.length > 1 && (
        <div className="wb-carousel-gallery-thumbs-strip" role="tablist" aria-label="Image Thumbnails">
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              className={`wb-carousel-thumb-btn ${i === activeIndex ? "wb-thumb-active" : ""}`}
              onClick={() => onSelect(i)}
                data-wb-go={i}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === activeIndex}
            >
              {slide.image && (
                <SiteImage image={slide.image} className="wb-carousel-thumb-img" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   VARIANT 6: Multi-Image Filmstrip Reel
   ========================================================================= */
function CarouselImageStrip({
  slides,
  columns = 3,
  aspect = "4:3",
  activeIndex,
  onPrev,
  onNext,
  onSelect,
  showArrows,
  showDots,
}: {
  slides: CarouselSlide[];
  columns?: number;
  aspect?: "16:9" | "4:3" | "1:1" | "21:9" | "3:4";
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  showArrows: boolean;
  showDots: boolean;
}) {
  const aspectClass = `wb-aspect-${aspect.replace(":", "-")}`;
  const hasControls = slides.length > 1;
  const stripVars = {
    "--wb-strip-cols": columns,
    "--wb-strip-count": slides.length,
    "--wb-strip-index": activeIndex,
  } as CSSProperties;

  return (
    <div
      className={`wb-carousel-strip-wrapper${slides.length <= columns ? " wb-carousel-strip-fits" : ""}`}
      style={stripVars}
    >
      <div className="wb-carousel-strip-track-container">
        <div className="wb-carousel-strip-track">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`wb-carousel-strip-item ${index === activeIndex ? "wb-strip-active" : ""}`}
              onClick={() => onSelect(index)}
              data-wb-go={index}
            >
              <div className="wb-carousel-strip-card">
                <div className={`wb-carousel-strip-media ${aspectClass}`}>
                  {slide.image && (
                    <SiteImage image={slide.image} className="wb-carousel-strip-img" />
                  )}
                  {slide.badge && (
                    <span className="wb-carousel-strip-badge">{slide.badge}</span>
                  )}
                  <div className="wb-carousel-strip-overlay" />
                </div>
                <div className="wb-carousel-strip-content">
                  {slide.subtitle && <p className="wb-carousel-strip-sub">{slide.subtitle}</p>}
                  <h4 className="wb-carousel-strip-title">{slide.title}</h4>
                  {(slide.caption || slide.description) && (
                    <p className="wb-carousel-strip-desc">{slide.caption || slide.description}</p>
                  )}
                  {(slide.button || slide.secondaryButton) && (
                    <div className="wb-carousel-strip-actions" onClick={(e) => e.stopPropagation()}>
                      {slide.button && <SiteLink link={slide.button} className="wb-btn wb-btn-primary wb-btn-sm" />}
                      {slide.secondaryButton && <SiteLink link={slide.secondaryButton} className="wb-btn wb-btn-secondary wb-btn-sm" />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="wb-carousel-controls-bar wb-carousel-strip-controls">
        {showDots && hasControls && (
          <div className="wb-carousel-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`wb-carousel-dot ${i === activeIndex ? "wb-dot-active" : ""}`}
                onClick={() => onSelect(i)}
                data-wb-go={i}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {showArrows && hasControls && (
          <div className="wb-carousel-arrows">
            <button
              type="button"
              className="wb-carousel-arrow-btn"
              onClick={onPrev}
              data-wb-go="prev"
              aria-label="Previous images"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="wb-carousel-arrow-btn"
              onClick={onNext}
              data-wb-go="next"
              aria-label="Next images"
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   VARIANT 7: 3D Coverflow Visual Image Reel
   ========================================================================= */
function CarouselImageCoverflow({
  slides,
  aspect = "16:9",
  activeIndex,
  onPrev,
  onNext,
  onSelect,
}: {
  slides: CarouselSlide[];
  aspect?: "16:9" | "4:3" | "1:1" | "21:9" | "3:4";
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}) {
  const aspectClass = `wb-aspect-${aspect.replace(":", "-")}`;

  return (
    <div className="wb-carousel-coverflow-container">
      <div className="wb-carousel-coverflow-stage">
        {slides.map((slide, i) => {
          const offset = i - activeIndex;
          const isCenter = offset === 0;
          const isLeft = offset === -1 || (activeIndex === 0 && i === slides.length - 1);
          const isRight = offset === 1 || (activeIndex === slides.length - 1 && i === 0);

          let positionClass = "wb-coverflow-hidden";
          if (isCenter) positionClass = "wb-coverflow-center";
          else if (isLeft) positionClass = "wb-coverflow-left";
          else if (isRight) positionClass = "wb-coverflow-right";

          return (
            <div
              key={i}
              className={`wb-carousel-coverflow-card ${positionClass}`}
              onClick={() => onSelect(i)}
                data-wb-go={i}
            >
              <div className={`wb-carousel-coverflow-media ${aspectClass}`}>
                {slide.image && (
                  <SiteImage image={slide.image} className="wb-carousel-coverflow-img" />
                )}
                <div className="wb-carousel-coverflow-gloss" />
                {slide.badge && <span className="wb-carousel-coverflow-badge">{slide.badge}</span>}
              </div>
              <div className="wb-carousel-coverflow-meta">
                <h4 className="wb-carousel-coverflow-title">{slide.title}</h4>
                {(slide.caption || slide.subtitle) && (
                  <p className="wb-carousel-coverflow-sub">{slide.caption || slide.subtitle}</p>
                )}
                {(slide.button || slide.secondaryButton) && (
                  <div className="wb-carousel-coverflow-actions" onClick={(e) => e.stopPropagation()}>
                    {slide.button && <SiteLink link={slide.button} className="wb-btn wb-btn-primary wb-btn-sm" />}
                    {slide.secondaryButton && <SiteLink link={slide.secondaryButton} className="wb-btn wb-btn-secondary wb-btn-sm" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="wb-carousel-coverflow-nav">
        <button type="button" className="wb-carousel-arrow-btn" onClick={onPrev}
              data-wb-go="prev" aria-label="Previous">
          <ChevronLeftIcon />
        </button>
        <span className="wb-carousel-counter">
          {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <button type="button" className="wb-carousel-arrow-btn" onClick={onNext}
              data-wb-go="next" aria-label="Next">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN CAROUSEL COMPONENT
   ========================================================================= */
export default function CarouselSection({ section }: { section: SectionOf<"carousel"> }) {
  const { data } = section;
  const variant: CarouselVariant = data.variant || "cards";
  const slides = data.slides && data.slides.length > 0 ? data.slides : [];
  const isStatic = useStaticRender();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const autoPlay = data.autoPlay ?? false;
  const intervalSeconds = Math.max(2, data.interval || 5);
  const showArrows = data.showArrows ?? true;
  const showDots = data.showDots ?? true;
  const showThumbnails = data.showThumbnails ?? true;
  const imageAspect = data.imageAspect || "16:9";
  const columns = Number(data.columns) || 3;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % Math.max(1, slides.length));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % Math.max(1, slides.length));
  };

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;
    timerRef.current = setInterval(nextSlide, intervalSeconds * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, isPaused, intervalSeconds, slides.length]);

  if (slides.length === 0) return null;

  const align = data.align || section.settings.align || "left";

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-carousel wb-carousel-variant-${variant} wb-align-${align}`}
      label={data.heading || "Carousel"}
    >
      <div
        className="wb-carousel-container"
        onMouseEnter={() => data.pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => data.pauseOnHover && setIsPaused(false)}
      >
        {(data.heading || data.intro || data.eyebrow) && variant !== "hero-slider" && (
          <div className={`wb-carousel-header-wrapper wb-align-${align}`}>
            {data.eyebrow && <span className="wb-carousel-eyebrow">{data.eyebrow}</span>}
            {data.heading && <SectionHead heading={data.heading} intro={data.intro} align={align} />}
            {data.badge && (
              <div className="wb-carousel-badge-pill">
                <span className="wb-carousel-pulse-dot" aria-hidden="true" />
                <span>{data.badge}</span>
              </div>
            )}
          </div>
        )}

        {variant === "curved-banner" ? (
          <div className="wb-carousel-curved-wrapper">
            <CurvedBannerCarousel
              items={
                slides.length > 0
                  ? slides.map((s, idx) => ({
                      id: `slide-${idx}`,
                      title: s.title,
                      subtitle: s.subtitle || s.description,
                      badge: s.badge,
                      image:
                        s.image?.url ||
                        DEFAULT_BANNER_ITEMS[idx % DEFAULT_BANNER_ITEMS.length].image,
                      alt: s.image?.alt || s.title,
                    }))
                  : DEFAULT_BANNER_ITEMS
              }
              speed={42}
              direction="left-to-right"
              curveIntensity="medium"
              pauseOnHover={data.pauseOnHover ?? true}
            />
          </div>
        ) : isStatic ? (
          <StaticStates
            states={slides.map((_, index) => index)}
            initial={0}
            render={renderSlides}
            autoplaySeconds={autoPlay && slides.length > 1 ? intervalSeconds : undefined}
            pauseOnHover={data.pauseOnHover}
          />
        ) : (
          renderSlides(activeIndex)
        )}
      </div>
    </SectionShell>
  );

  function renderSlides(activeIndex: number) {
    return variant === "hero-slider" ? (
      <CarouselHeroSlider
        slides={slides}
        cardStyle={data.cardStyle}
        align={align}
        activeIndex={activeIndex}
        onPrev={prevSlide}
        onNext={nextSlide}
        onSelect={setActiveIndex}
        showArrows={showArrows}
        showDots={showDots}
      />
    ) : variant === "showcase" ? (
      <CarouselShowcase
        slides={slides}
        cardStyle={data.cardStyle}
        activeIndex={activeIndex}
        onPrev={prevSlide}
        onNext={nextSlide}
        onSelect={setActiveIndex}
      />
    ) : variant === "minimal-editorial" ? (
      <CarouselMinimalEditorial
        slides={slides}
        activeIndex={activeIndex}
        onPrev={prevSlide}
        onNext={nextSlide}
        onSelect={setActiveIndex}
      />
    ) : variant === "image-gallery" ? (
      <CarouselImageGallery
        slides={slides}
        activeIndex={activeIndex}
        onPrev={prevSlide}
        onNext={nextSlide}
        onSelect={setActiveIndex}
        showArrows={showArrows}
        showDots={showDots}
        showThumbnails={showThumbnails}
        aspect={imageAspect}
      />
    ) : variant === "image-strip" ? (
      <CarouselImageStrip
        slides={slides}
        columns={columns}
        aspect={imageAspect}
        activeIndex={activeIndex}
        onPrev={prevSlide}
        onNext={nextSlide}
        onSelect={setActiveIndex}
        showArrows={showArrows}
        showDots={showDots}
      />
    ) : variant === "image-coverflow" ? (
      <CarouselImageCoverflow
        slides={slides}
        aspect={imageAspect}
        activeIndex={activeIndex}
        onPrev={prevSlide}
        onNext={nextSlide}
        onSelect={setActiveIndex}
      />
    ) : (
      <CarouselCards
        slides={slides}
        cardStyle={data.cardStyle}
        activeIndex={activeIndex}
        onPrev={prevSlide}
        onNext={nextSlide}
        onSelect={setActiveIndex}
        showArrows={showArrows}
        showDots={showDots}
      />
    );
  }
}
