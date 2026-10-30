import { parseRichText } from "../rich-text.tsx";
import { useState, useEffect, useId } from "react";
import { SectionHead, SectionShell, SiteImage } from "../primitives.tsx";
import type { ImageRef, SectionOf, TestimonialItem } from "../types.ts";

/* SVG Star Rating Component */
function StarRating({ rating = 5 }: { rating?: number }) {
  const stars = Math.max(1, Math.min(5, Math.round(rating)));
  return (
    <div className="wb-testimonial-stars" aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`wb-testimonial-star ${i < stars ? "wb-star-filled" : "wb-star-empty"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* Verified Customer Badge */
function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  return (
    <span className="wb-testimonial-verified">
      <svg className="wb-verified-check" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.739a.75.75 0 0 1 1.04-.208Z"
          clipRule="evenodd"
        />
      </svg>
      <span>{label}</span>
    </span>
  );
}

/* Author Avatar with Initials Fallback */
function AuthorAvatar({
  avatar,
  name,
  size = "md",
}: {
  avatar?: ImageRef;
  name: string;
  size?: "md" | "lg";
}) {
  if (avatar?.url) {
    return (
      <div className={`wb-testimonial-avatar ${size === "lg" ? "wb-testimonial-avatar-lg" : ""}`}>
        <SiteImage image={avatar} className="wb-testimonial-avatar-img" />
      </div>
    );
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={`wb-testimonial-avatar wb-testimonial-avatar-initials ${
        size === "lg" ? "wb-testimonial-avatar-lg" : ""
      }`}
      aria-hidden="true"
    >
      {initials || "★"}
    </div>
  );
}

/* Top Rating Summary Metric Pill */
function RatingPill({
  metric,
}: {
  metric?: { score?: string; label?: string; count?: string };
}) {
  if (!metric || (!metric.score && !metric.count && !metric.label)) return null;
  return (
    <div className="wb-testimonials-rating-pill">
      <div className="wb-testimonials-rating-stars">
        <StarRating rating={5} />
      </div>
      {metric.score && <span className="wb-testimonials-rating-score">{metric.score}</span>}
      {metric.score && (metric.count || metric.label) && (
        <span className="wb-testimonials-rating-divider" />
      )}
      {(metric.count || metric.label) && (
        <span className="wb-testimonials-rating-count">
          {metric.label ? `${metric.label} · ` : ""}
          {metric.count}
        </span>
      )}
    </div>
  );
}

/* Single Testimonial Card Component */
function TestimonialCard({
  item,
  cardStyle = "default",
  showRatings = true,
  showAvatars = true,
  showBadges = true,
  className = "",
}: {
  item: TestimonialItem;
  cardStyle?: string;
  showRatings?: boolean;
  showAvatars?: boolean;
  showBadges?: boolean;
  className?: string;
}) {
  return (
    <div className={`wb-testimonial-card wb-testimonial-card-${cardStyle} ${className}`}>
      <div className="wb-testimonial-card-header">
        {showRatings && <StarRating rating={item.rating ?? 5} />}
        {item.highlight && <span className="wb-testimonial-highlight">{item.highlight}</span>}
      </div>

      <p className="wb-testimonial-quote">“{parseRichText(item.quote)}”</p>

      <div className="wb-testimonial-author">
        {showAvatars && <AuthorAvatar avatar={item.avatar} name={item.name} />}
        <div className="wb-testimonial-author-info">
          <div className="wb-testimonial-name-row">
            <span className="wb-testimonial-name">{item.name}</span>
            {showBadges && item.verified !== false && (
              <VerifiedBadge label={item.badge || "Verified"} />
            )}
          </div>
          {(item.role || item.company) && (
            <span className="wb-testimonial-role">
              {[item.role, item.company].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection({
  section,
}: {
  section: SectionOf<"testimonials">;
}) {
  const { data } = section;
  const variant = data.variant || "cards-grid";
  const cardStyle = data.cardStyle || "default";
  const align = data.align || section.settings.align || "center";
  const columns = data.columns || 3;
  const showRatings = data.showRatings ?? true;
  const showAvatars = data.showAvatars ?? true;
  const showBadges = data.showBadges ?? true;
  const items = data.items && data.items.length > 0 ? data.items : [];
  const carouselId = useId();

  // Carousel interactive active state
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-slide effect for carousel
  useEffect(() => {
    if (variant !== "carousel-slider" || items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [variant, items.length]);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };
  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % items.length);
  };

  // --------------------------------------------------------------------------
  // Variant 2: Carousel Slider (Interactive Smooth Pull-Quote Stage)
  // --------------------------------------------------------------------------
  if (variant === "carousel-slider") {
    const current = items[activeSlide] || items[0];
    if (!current) return null;

    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-testimonials-section wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead heading={data.heading} intro={data.intro} eyebrow={data.eyebrow} align={align} />
        {data.ratingMetric && (
          <div style={{ textAlign: align }}>
            <RatingPill metric={data.ratingMetric} />
          </div>
        )}

        <div className="wb-testimonials-slider-stage" id={carouselId}>
          <div className={`wb-testimonials-slider-track wb-testimonial-card wb-testimonial-card-${cardStyle} wb-testimonials-slide-card`}>
            {/* Ambient Watermark Quote Icon */}
            <svg
              className="wb-testimonials-slide-quote-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            <div className="wb-testimonial-card-header">
              {showRatings && <StarRating rating={current.rating ?? 5} />}
              {current.highlight && (
                <span className="wb-testimonial-highlight">{current.highlight}</span>
              )}
            </div>

            <blockquote className="wb-testimonials-slide-text">
              “{parseRichText(current.quote)}”
            </blockquote>

            <div className="wb-testimonial-author">
              {showAvatars && <AuthorAvatar avatar={current.avatar} name={current.name} size="lg" />}
              <div className="wb-testimonial-author-info">
                <div className="wb-testimonial-name-row">
                  <span className="wb-testimonial-name">
                    {current.name}
                  </span>
                  {showBadges && current.verified !== false && (
                    <VerifiedBadge label={current.badge || "Verified Customer"} />
                  )}
                </div>
                {(current.role || current.company) && (
                  <span className="wb-testimonial-role">
                    {[current.role, current.company].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {items.length > 1 && (
            <div className="wb-testimonials-slider-nav">
              <div className="wb-testimonials-dots" role="tablist" aria-label="Testimonial slides">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`wb-testimonials-dot ${idx === activeSlide ? "active" : ""}`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                    aria-selected={idx === activeSlide}
                    role="tab"
                  />
                ))}
              </div>

              <div className="wb-testimonials-arrows">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="wb-testimonials-arrow-btn"
                  aria-label="Previous testimonial"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="wb-testimonials-arrow-btn"
                  aria-label="Next testimonial"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionShell>
    );
  }

  // --------------------------------------------------------------------------
  // Variant 3: Marquee Wall (Infinite Smooth Floating Ticker Wall)
  // --------------------------------------------------------------------------
  if (variant === "marquee-wall") {
    // Duplicate items to ensure seamless infinite animation loop
    const displayItems = [...items, ...items];

    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-testimonials-section wb-align-${align}`}
        label={data.heading}
        fullWidth
      >
        <div className="wb-container">
          <SectionHead heading={data.heading} intro={data.intro} eyebrow={data.eyebrow} align={align} />
          {data.ratingMetric && (
            <div style={{ textAlign: align }}>
              <RatingPill metric={data.ratingMetric} />
            </div>
          )}
        </div>

        <div className="wb-testimonials-marquee-wrap">
          <div className="wb-testimonials-marquee-track">
            {displayItems.map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="wb-testimonials-marquee-item">
                <TestimonialCard
                  item={item}
                  cardStyle={cardStyle}
                  showRatings={showRatings}
                  showAvatars={showAvatars}
                  showBadges={showBadges}
                />
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    );
  }

  // --------------------------------------------------------------------------
  // Variant 4: Spotlight Featured (Executive Hero Split & Proof Matrix)
  // --------------------------------------------------------------------------
  if (variant === "spotlight-featured") {
    const featured = items[0];
    const secondaryItems = items.slice(1, 3);

    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-testimonials-section wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead heading={data.heading} intro={data.intro} eyebrow={data.eyebrow} align={align} />
        {data.ratingMetric && (
          <div style={{ textAlign: align }}>
            <RatingPill metric={data.ratingMetric} />
          </div>
        )}

        <div className="wb-testimonials-spotlight-grid">
          {featured && (
            <div className={`wb-testimonials-hero-card wb-testimonial-card wb-testimonial-card-${cardStyle}`}>
              <div className="wb-testimonial-card-header">
                {showRatings && <StarRating rating={featured.rating ?? 5} />}
                {featured.highlight && (
                  <span className="wb-testimonial-highlight">{featured.highlight}</span>
                )}
              </div>

              <blockquote className="wb-testimonials-hero-quote">
                “{parseRichText(featured.quote)}”
              </blockquote>

              <div className="wb-testimonial-author">
                {showAvatars && <AuthorAvatar avatar={featured.avatar} name={featured.name} size="lg" />}
                <div className="wb-testimonial-author-info">
                  <div className="wb-testimonial-name-row">
                    <span className="wb-testimonial-name">
                      {featured.name}
                    </span>
                    {showBadges && featured.verified !== false && (
                      <VerifiedBadge label={featured.badge || "Verified Client"} />
                    )}
                  </div>
                  {(featured.role || featured.company) && (
                    <span className="wb-testimonial-role">
                      {[featured.role, featured.company].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="wb-testimonials-side-stack">
            {secondaryItems.map((item, idx) => (
              <TestimonialCard
                key={idx}
                item={item}
                cardStyle={cardStyle}
                showRatings={showRatings}
                showAvatars={showAvatars}
                showBadges={showBadges}
                className="wb-testimonials-side-card"
              />
            ))}
          </div>
        </div>
      </SectionShell>
    );
  }

  // --------------------------------------------------------------------------
  // Variant 5: Minimal Editorial (Swiss Architectural Hairline Minimalism)
  // --------------------------------------------------------------------------
  if (variant === "minimal-editorial") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-testimonials-section wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead heading={data.heading} intro={data.intro} eyebrow={data.eyebrow} align={align} />
        {data.ratingMetric && (
          <div style={{ textAlign: align }}>
            <RatingPill metric={data.ratingMetric} />
          </div>
        )}

        <div className="wb-testimonials-editorial-frame">
          {items.map((item, idx) => (
            <div key={idx} className="wb-testimonials-editorial-item">
              <div className="wb-testimonials-editorial-author">
                <div className="flex items-center gap-2 flex-wrap">
                  {showAvatars && <AuthorAvatar avatar={item.avatar} name={item.name} />}
                  <span className="wb-testimonial-name">{item.name}</span>
                </div>
                {(item.role || item.company) && (
                  <span className="wb-testimonial-role">
                    {[item.role, item.company].filter(Boolean).join(" · ")}
                  </span>
                )}
                {showRatings && (
                  <div className="mt-1">
                    <StarRating rating={item.rating ?? 5} />
                  </div>
                )}
              </div>

              <div>
                <p className="wb-testimonials-editorial-quote">“{parseRichText(item.quote)}”</p>
                {item.highlight && (
                  <div className="mt-3">
                    <span className="wb-testimonial-highlight">{item.highlight}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  // --------------------------------------------------------------------------
  // Variant 1: Cards Grid (Balanced Multi-Column Review Matrix - Default)
  // --------------------------------------------------------------------------
  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-testimonials-section wb-align-${align}`}
      label={data.heading}
    >
      <SectionHead heading={data.heading} intro={data.intro} eyebrow={data.eyebrow} align={align} />
      {data.ratingMetric && (
        <div style={{ textAlign: align }}>
          <RatingPill metric={data.ratingMetric} />
        </div>
      )}

      <div className={`wb-testimonials-grid wb-testimonials-grid-${columns}`}>
        {items.map((item, index) => (
          <TestimonialCard
            key={index}
            item={item}
            cardStyle={cardStyle}
            showRatings={showRatings}
            showAvatars={showAvatars}
            showBadges={showBadges}
          />
        ))}
      </div>
    </SectionShell>
  );
}
