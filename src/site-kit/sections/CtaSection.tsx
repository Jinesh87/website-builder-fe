import { useState, type CSSProperties, type FormEvent } from "react";
import { brandIconFor } from "../brand-icons.ts";
import { parseRichText, SectionShell, SiteButton, SiteIcon, SiteImage, SiteLink } from "../primitives.tsx";
import { useStaticRender } from "../render-mode.tsx";
import type { CtaData, SectionOf } from "../types.ts";

/** Email signup of the "newsletter" CTA; the published page's runtime shows the same thank-you line. */
function CtaNewsletterForm({ data }: { data: CtaData }) {
  const isStatic = useStaticRender();
  const [done, setDone] = useState(false);
  const thanks = data.successText || "Thank you for subscribing!";
  if (done && !isStatic) return <p className="wb-newsletter-thanks" role="status">{thanks}</p>;
  return (
    <form
      className="wb-newsletter-form wb-cta-newsletter-form"
      data-wb-success={thanks}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setDone(true);
      }}
    >
      <input
        type="email"
        name="email"
        required
        placeholder={data.placeholder || "Your email address"}
        aria-label="Email address"
        className="wb-newsletter-input"
      />
      <button type="submit" className="wb-btn wb-btn-primary">
        {data.button?.label || "Subscribe"}
      </button>
    </form>
  );
}

function CheckIcon() {
  return (
    <svg
      className="wb-cta-check-icon"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13.3334 4L6.00008 11.3333L2.66675 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CtaSection({ section }: { section: SectionOf<"cta"> }) {
  const { data } = section;
  const variant = data.variant || "centered-card";
  const cardStyle = data.cardStyle || "default";
  const align = data.align || section.settings.align || "center";

  if (variant === "split-banner") {
    // Coloured text panel beside a photo; the panel colour defaults to the theme's secondary colour.
    const style = (data.panelColor ? { "--wb-cta-panel": data.panelColor } : undefined) as CSSProperties | undefined;
    return (
      <SectionShell sectionId={section.id} settings={section.settings} className="wb-cta-split-banner" label={data.heading}>
        <div className="wb-cta-banner-split" style={style}>
          <div className="wb-cta-banner-text">
            {data.eyebrow && <p className="wb-eyebrow">{parseRichText(data.eyebrow)}</p>}
            <h2>{parseRichText(data.heading)}</h2>
            {data.text && <p className="wb-cta-banner-desc">{parseRichText(data.text)}</p>}
            {(data.button || data.secondaryButton) && (
              <div className="wb-actions">
                {data.button && <SiteLink link={data.button} className="wb-btn wb-cta-banner-light-btn" />}
                {data.secondaryButton && <SiteLink link={data.secondaryButton} className="wb-btn wb-cta-banner-ghost-btn" />}
              </div>
            )}
          </div>
          <div className={`wb-cta-banner-media${data.image?.url ? "" : " is-empty"}`}>
            {data.image?.url && <SiteImage image={data.image} />}
          </div>
        </div>
      </SectionShell>
    );
  }

  if (variant === "inline-bar") {
    // One-line card: round icon badge, heading and text, and a button. Brand icons (e.g. WhatsApp) tint the badge and button.
    const brand = brandIconFor(data.icon);
    const style = (brand ? { "--wb-cta-accent": `color-mix(in srgb, ${brand.color} 62%, #000)` } : undefined) as
      | CSSProperties
      | undefined;
    return (
      <SectionShell sectionId={section.id} settings={section.settings} className="wb-cta-inline-bar" label={data.heading}>
        <div className="wb-cta-inline-card" style={style}>
          {data.icon && (
            <span className="wb-cta-inline-icon">
              <SiteIcon name={data.icon} size={24} />
            </span>
          )}
          <div className="wb-cta-inline-copy">
            {data.eyebrow && <p className="wb-eyebrow">{parseRichText(data.eyebrow)}</p>}
            <h3>{parseRichText(data.heading)}</h3>
            {data.text && <p className="wb-muted">{parseRichText(data.text)}</p>}
          </div>
          {data.button && <SiteLink link={data.button} className="wb-btn wb-cta-inline-btn" />}
        </div>
      </SectionShell>
    );
  }

  if (variant === "newsletter") {
    return (
      <SectionShell sectionId={section.id} settings={section.settings} className="wb-cta-newsletter" label={data.heading}>
        <div className="wb-cta-newsletter-inner">
          {data.eyebrow && <p className="wb-eyebrow">{parseRichText(data.eyebrow)}</p>}
          <h2>{parseRichText(data.heading)}</h2>
          {data.text && <p className="wb-muted">{parseRichText(data.text)}</p>}
          <CtaNewsletterForm data={data} />
        </div>
      </SectionShell>
    );
  }

  if (variant === "vintage-story") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className="wb-cta-vintage-story"
        label={data.heading}
        fullWidth
      >
        <div className="wb-container">
          <h2 className="wb-cta-story-heading">
            {parseRichText(data.heading)}
            {data.italicText && <em> {data.italicText}</em>}
          </h2>
          {data.button && (
            <SiteLink link={data.button} className="wb-cta-story-btn">
              {data.button.label}
            </SiteLink>
          )}
        </div>
      </SectionShell>
    );
  }

  if (variant === "vintage-banner") {
    const isDark = section.settings.background === "dark";
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-cta-vintage-banner ${isDark ? "wb-cta-roll-camera" : ""}`}
        label={data.heading}
        fullWidth
      >
        <div className="wb-container">
          <div className="wb-cta-banner-card">
            {isDark && <div className="wb-cta-frame-guide left" aria-hidden="true" />}
            <h2 className="wb-cta-banner-heading">
              {parseRichText(data.heading)}
              {data.italicText && <em> {data.italicText}</em>}
            </h2>
            {data.button && (
              <SiteLink link={data.button} className="wb-cta-banner-btn">
                {data.button.label}
              </SiteLink>
            )}
            {isDark && <div className="wb-cta-frame-guide right" aria-hidden="true" />}
          </div>
        </div>
      </SectionShell>
    );
  }

  // 1. Split Visual Variant (Asymmetric Split + Live Metric Highlight)
  if (variant === "split-visual") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className="wb-cta-section wb-cta-variant-split"
        label={data.heading}
      >
        <div className={`wb-cta-split-card wb-cta-card-style-${cardStyle}`}>
          <div className="wb-cta-split-left">
            {data.eyebrow && (
              <div className="wb-cta-eyebrow-wrap">
                <span className="wb-cta-pulse-dot" />
                <span className="wb-cta-eyebrow">{parseRichText(data.eyebrow)}</span>
              </div>
            )}
            <h2 className="wb-cta-split-heading">{parseRichText(data.heading)}</h2>
            {data.text && <p className="wb-cta-split-text">{parseRichText(data.text)}</p>}

            <div className="wb-cta-actions">
              <SiteButton link={data.button} tone="primary" />
              {data.secondaryButton && (
                <SiteButton link={data.secondaryButton} tone="secondary" />
              )}
            </div>

            {data.trustBadges && data.trustBadges.length > 0 && (
              <ul className="wb-cta-trust-list">
                {data.trustBadges.map((badge, idx) => (
                  <li key={idx} className="wb-cta-trust-item">
                    <CheckIcon />
                    <span>{badge}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="wb-cta-split-right">
            <div className="wb-cta-metric-showcase">
              <div className="wb-cta-metric-inner">
                <div className="wb-cta-metric-highlight">
                  <span className="wb-cta-metric-value">
                    {data.highlightMetric?.value || "99.9%"}
                  </span>
                  <span className="wb-cta-metric-label">
                    {data.highlightMetric?.label || "Reliability & Uptime"}
                  </span>
                </div>
                {data.highlightMetric?.subtext && (
                  <p className="wb-cta-metric-subtext">
                    {parseRichText(data.highlightMetric.subtext)}
                  </p>
                )}
                <div className="wb-cta-metric-footer">
                  <span className="wb-cta-status-badge">
                    <span className="wb-cta-status-dot" /> Production Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  // 2. Floating Card Variant (Framed Ambient Glass / Contrast Card)
  if (variant === "floating-card") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className="wb-cta-section wb-cta-variant-floating"
        label={data.heading}
      >
        <div className={`wb-cta-floating-box wb-cta-card-style-${cardStyle} wb-align-${align}`}>
          <div className="wb-cta-floating-content">
            {data.eyebrow && (
              <div className="wb-cta-eyebrow-wrap">
                <span className="wb-cta-pulse-dot" />
                <span className="wb-cta-eyebrow">{parseRichText(data.eyebrow)}</span>
              </div>
            )}
            <h2 className="wb-cta-floating-heading">{parseRichText(data.heading)}</h2>
            {data.text && <p className="wb-cta-floating-text">{parseRichText(data.text)}</p>}

            <div className={`wb-cta-actions wb-align-${align}`}>
              <SiteButton link={data.button} tone="primary" />
              {data.secondaryButton && (
                <SiteButton link={data.secondaryButton} tone="secondary" />
              )}
            </div>

            {data.trustBadges && data.trustBadges.length > 0 && (
              <ul className={`wb-cta-trust-list wb-align-${align}`}>
                {data.trustBadges.map((badge, idx) => (
                  <li key={idx} className="wb-cta-trust-item">
                    <CheckIcon />
                    <span>{badge}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SectionShell>
    );
  }

  // 3. Minimal Editorial Variant (Swiss Architectural Hairline Minimal)
  if (variant === "minimal-editorial") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-cta-section wb-cta-variant-editorial wb-align-${align}`}
        label={data.heading}
      >
        <div className="wb-cta-editorial-frame">
          <div className="wb-cta-editorial-topline">
            {data.eyebrow && (
              <span className="wb-cta-eyebrow">{parseRichText(data.eyebrow)}</span>
            )}
          </div>

          <div className="wb-cta-editorial-grid">
            <div className="wb-cta-editorial-title-col">
              <h2 className="wb-cta-editorial-heading">{parseRichText(data.heading)}</h2>
            </div>
            <div className="wb-cta-editorial-actions-col">
              {data.text && <p className="wb-cta-editorial-text">{parseRichText(data.text)}</p>}
              <div className="wb-cta-editorial-buttons">
                <SiteButton link={data.button} tone="primary" />
                {data.secondaryButton && (
                  <SiteButton link={data.secondaryButton} tone="secondary" />
                )}
              </div>
              {data.trustBadges && data.trustBadges.length > 0 && (
                <ul className="wb-cta-trust-list">
                  {data.trustBadges.map((badge, idx) => (
                    <li key={idx} className="wb-cta-trust-item">
                      <CheckIcon />
                      <span>{badge}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  // 4. Centered Card Variant (Default Clean Modern Banner)
  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-cta-section wb-cta-variant-centered wb-align-${align}`}
      label={data.heading}
    >
      <div className={`wb-cta-centered-container wb-cta-card-style-${cardStyle} wb-align-${align}`}>
        {data.eyebrow && (
          <div className="wb-cta-eyebrow-wrap">
            <span className="wb-cta-pulse-dot" />
            <span className="wb-cta-eyebrow">{parseRichText(data.eyebrow)}</span>
          </div>
        )}
        <h2 className="wb-cta-centered-heading">{parseRichText(data.heading)}</h2>
        {data.text && <p className="wb-cta-centered-text">{parseRichText(data.text)}</p>}

        <div className={`wb-cta-actions wb-align-${align}`}>
          <SiteButton link={data.button} tone="primary" />
          {data.secondaryButton && (
            <SiteButton link={data.secondaryButton} tone="secondary" />
          )}
        </div>

        {data.trustBadges && data.trustBadges.length > 0 && (
          <ul className={`wb-cta-trust-list wb-align-${align}`}>
            {data.trustBadges.map((badge, idx) => (
              <li key={idx} className="wb-cta-trust-item">
                <CheckIcon />
                <span>{badge}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionShell>
  );
}
