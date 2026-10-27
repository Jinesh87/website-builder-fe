import { parseRichText, SectionShell, SiteButton, SiteLink } from "../primitives.tsx";
import type { SectionOf } from "../types.ts";

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
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className="wb-cta-vintage-banner"
        label={data.heading}
        fullWidth
      >
        <div className="wb-container">
          <div className="wb-cta-banner-card">
            <h2 className="wb-cta-banner-heading">
              {parseRichText(data.heading)}
              {data.italicText && <em> {data.italicText}</em>}
            </h2>
            {data.button && (
              <SiteLink link={data.button} className="wb-cta-banner-btn">
                {data.button.label}
              </SiteLink>
            )}
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
                <span className="wb-cta-eyebrow">{data.eyebrow}</span>
              </div>
            )}
            <h2 className="wb-cta-split-heading">{data.heading}</h2>
            {data.text && <p className="wb-cta-split-text">{data.text}</p>}

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
                    {data.highlightMetric.subtext}
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
                <span className="wb-cta-eyebrow">{data.eyebrow}</span>
              </div>
            )}
            <h2 className="wb-cta-floating-heading">{data.heading}</h2>
            {data.text && <p className="wb-cta-floating-text">{data.text}</p>}

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
              <span className="wb-cta-eyebrow">{data.eyebrow}</span>
            )}
          </div>

          <div className="wb-cta-editorial-grid">
            <div className="wb-cta-editorial-title-col">
              <h2 className="wb-cta-editorial-heading">{data.heading}</h2>
            </div>
            <div className="wb-cta-editorial-actions-col">
              {data.text && <p className="wb-cta-editorial-text">{data.text}</p>}
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
            <span className="wb-cta-eyebrow">{data.eyebrow}</span>
          </div>
        )}
        <h2 className="wb-cta-centered-heading">{data.heading}</h2>
        {data.text && <p className="wb-cta-centered-text">{data.text}</p>}

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
