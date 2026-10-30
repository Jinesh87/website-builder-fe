import { parseRichText } from "../rich-text.tsx";
import { gridStyle, SectionHead, SectionShell, SiteButton } from "../primitives.tsx";
import type { GridColumns, SectionOf } from "../types.ts";

function CheckMark() {
  return (
    <svg
      className="wb-pricing-check-icon"
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

function CrossMark() {
  return (
    <svg
      className="wb-pricing-cross-icon"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 8H12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PricingSection({ section }: { section: SectionOf<"pricing"> }) {
  const { data } = section;
  const variant = data.variant || "cards-grid";
  const cardStyle = data.cardStyle || "default";
  const align = data.align || section.settings.align || "center";
  const fallbackCols = Math.min(Math.max(data.plans.length, 1), 4) as GridColumns;
  const columns = (data.columns || fallbackCols) as GridColumns;
  const mobileCols = data.mobileColumns || 1;

  // Header Sub-banner for Billing cycle / Discount badge
  const renderBillingBanner = () => {
    if (!data.billingCycleLabel && !data.discountBadge) return null;
    return (
      <div className={`wb-pricing-billing-bar wb-align-${align}`}>
        <div className="wb-pricing-pill-wrap">
          {data.billingCycleLabel && (
            <span className="wb-pricing-cycle-label">{data.billingCycleLabel}</span>
          )}
          {data.discountBadge && (
            <span className="wb-pricing-discount-badge">{data.discountBadge}</span>
          )}
        </div>
      </div>
    );
  };

  // Footer Reassurance note
  const renderFooterNote = () => {
    if (!data.footerNote) return null;
    return (
      <p className={`wb-pricing-footer-note wb-align-${align}`}>
        {data.footerNote}
      </p>
    );
  };

  // 1. Minimal Monochrome (Swiss Architectural / High-End Editorial)
  if (variant === "minimal-monochrome") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-pricing wb-pricing-variant-minimal wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead
          heading={data.heading}
          intro={data.intro}
          eyebrow={data.eyebrow}
          align={align}
        />

        {renderBillingBanner()}

        <div
          className="wb-grid wb-pricing-minimal-grid"
          style={gridStyle(columns, mobileCols)}
        >
          {data.plans.map((plan, index) => {
            const isFeatured = plan.featured;
            return (
              <article
                key={index}
                className={`wb-pricing-minimal-card wb-pricing-card-style-${cardStyle}${
                  isFeatured ? " wb-pricing-minimal-featured" : ""
                }`}
              >
                <div className="wb-pricing-minimal-header">
                  <div className="wb-pricing-minimal-topline">
                    <span className="wb-pricing-minimal-index">0{index + 1}</span>
                    {plan.badge ? (
                      <span className="wb-pricing-badge">{plan.badge}</span>
                    ) : isFeatured ? (
                      <span className="wb-pricing-badge">Featured</span>
                    ) : null}
                  </div>
                  <h3 className="wb-pricing-plan-name">{plan.name}</h3>
                  {plan.description && (
                    <p className="wb-pricing-plan-desc">{parseRichText(plan.description)}</p>
                  )}
                </div>

                <div className="wb-pricing-minimal-price-row">
                  {plan.originalPrice && (
                    <span className="wb-pricing-orig-price">{plan.originalPrice}</span>
                  )}
                  <div className="wb-pricing-price-group">
                    <strong className="wb-pricing-amount">{plan.price}</strong>
                    {plan.period && (
                      <span className="wb-pricing-period">{plan.period}</span>
                    )}
                  </div>
                </div>

                <div className="wb-pricing-minimal-features-wrap">
                  <ul className="wb-pricing-features-list">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="wb-pricing-feature-item wb-included">
                        <CheckMark />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.excludedFeatures?.map((feature, fIdx) => (
                      <li key={`ex-${fIdx}`} className="wb-pricing-feature-item wb-excluded">
                        <CrossMark />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="wb-pricing-action-wrap">
                  <SiteButton
                    link={plan.cta || { label: "Get started", href: "/contact" }}
                    tone={isFeatured ? "primary" : "secondary"}
                  />
                  {plan.highlightNote && (
                    <span className="wb-pricing-highlight-note">{plan.highlightNote}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {renderFooterNote()}
      </SectionShell>
    );
  }

  // 2. Spotlight Tier (Asymmetric Spotlight Pro Focus)
  if (variant === "spotlight-tier") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-pricing wb-pricing-variant-spotlight wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead
          heading={data.heading}
          intro={data.intro}
          eyebrow={data.eyebrow}
          align={align}
        />

        {renderBillingBanner()}

        <div
          className="wb-grid wb-pricing-spotlight-grid"
          style={gridStyle(columns, mobileCols)}
        >
          {data.plans.map((plan, index) => {
            const isFeatured = plan.featured;
            return (
              <article
                key={index}
                className={`wb-pricing-card wb-pricing-spotlight-card wb-pricing-card-style-${cardStyle}${
                  isFeatured ? " wb-pricing-spotlight-featured" : ""
                }`}
              >
                {isFeatured && (
                  <div className="wb-pricing-spotlight-tag">
                    {plan.badge || "RECOMMENDED"}
                  </div>
                )}

                <div className="wb-pricing-head">
                  {!isFeatured && plan.badge && (
                    <span className="wb-pricing-badge">{plan.badge}</span>
                  )}
                  <h3 className="wb-pricing-plan-name">{plan.name}</h3>
                  {plan.description && (
                    <p className="wb-pricing-plan-desc">{parseRichText(plan.description)}</p>
                  )}
                </div>

                <div className="wb-pricing-price-wrap">
                  {plan.originalPrice && (
                    <span className="wb-pricing-orig-price">{plan.originalPrice}</span>
                  )}
                  <div className="wb-pricing-price-group">
                    <strong className="wb-pricing-amount">{plan.price}</strong>
                    {plan.period && (
                      <span className="wb-pricing-period">{plan.period}</span>
                    )}
                  </div>
                </div>

                <div className="wb-pricing-divider" />

                <div className="wb-pricing-features-wrap">
                  <span className="wb-pricing-features-title">Features included:</span>
                  <ul className="wb-pricing-features-list">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="wb-pricing-feature-item wb-included">
                        <CheckMark />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.excludedFeatures?.map((feature, fIdx) => (
                      <li key={`ex-${fIdx}`} className="wb-pricing-feature-item wb-excluded">
                        <CrossMark />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="wb-pricing-action-wrap">
                  <SiteButton
                    link={plan.cta || { label: "Choose plan", href: "/contact" }}
                    tone={isFeatured ? "primary" : "secondary"}
                  />
                  {plan.highlightNote && (
                    <span className="wb-pricing-highlight-note">{plan.highlightNote}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {renderFooterNote()}
      </SectionShell>
    );
  }

  // 3. Horizontal Rows (Enterprise / Consultative Detailed Rows)
  if (variant === "horizontal-rows") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-pricing wb-pricing-variant-rows wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead
          heading={data.heading}
          intro={data.intro}
          eyebrow={data.eyebrow}
          align={align}
        />

        {renderBillingBanner()}

        <div className="wb-pricing-rows-container">
          {data.plans.map((plan, index) => {
            const isFeatured = plan.featured;
            return (
              <article
                key={index}
                className={`wb-pricing-row-card wb-pricing-card-style-${cardStyle}${
                  isFeatured ? " wb-pricing-row-featured" : ""
                }`}
              >
                <div className="wb-pricing-row-left">
                  <div className="wb-pricing-row-identity">
                    {plan.badge && (
                      <span className="wb-pricing-badge">{plan.badge}</span>
                    )}
                    <h3 className="wb-pricing-plan-name">{plan.name}</h3>
                  </div>
                  {plan.description && (
                    <p className="wb-pricing-plan-desc">{parseRichText(plan.description)}</p>
                  )}
                </div>

                <div className="wb-pricing-row-middle">
                  <ul className="wb-pricing-row-features-grid">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="wb-pricing-feature-item wb-included">
                        <CheckMark />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.excludedFeatures?.map((feature, fIdx) => (
                      <li key={`ex-${fIdx}`} className="wb-pricing-feature-item wb-excluded">
                        <CrossMark />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="wb-pricing-row-right">
                  <div className="wb-pricing-price-wrap">
                    {plan.originalPrice && (
                      <span className="wb-pricing-orig-price">{plan.originalPrice}</span>
                    )}
                    <div className="wb-pricing-price-group">
                      <strong className="wb-pricing-amount">{plan.price}</strong>
                      {plan.period && (
                        <span className="wb-pricing-period">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <div className="wb-pricing-action-wrap">
                    <SiteButton
                      link={plan.cta || { label: "Select plan", href: "/contact" }}
                      tone={isFeatured ? "primary" : "secondary"}
                    />
                    {plan.highlightNote && (
                      <span className="wb-pricing-highlight-note">{plan.highlightNote}</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {renderFooterNote()}
      </SectionShell>
    );
  }

  // 4. Standard Cards Grid Variant (Default Clean High-End Standard)
  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-pricing wb-pricing-variant-cards wb-align-${align}`}
      label={data.heading}
    >
      <SectionHead
        heading={data.heading}
        intro={data.intro}
        eyebrow={data.eyebrow}
        align={align}
      />

      {renderBillingBanner()}

      <div
        className="wb-grid wb-pricing-cards-grid"
        style={gridStyle(columns, mobileCols)}
      >
        {data.plans.map((plan, index) => {
          const isFeatured = plan.featured;
          return (
            <article
              key={index}
              className={`wb-pricing-card wb-pricing-card-style-${cardStyle}${
                isFeatured ? " wb-pricing-card-featured" : ""
              }`}
            >
              {isFeatured && (
                <div className="wb-pricing-featured-tag">
                  {plan.badge || "Most popular"}
                </div>
              )}

              <div className="wb-pricing-card-head">
                {!isFeatured && plan.badge && (
                  <span className="wb-pricing-badge">{plan.badge}</span>
                )}
                <h3 className="wb-pricing-plan-name">{plan.name}</h3>
                {plan.description && (
                  <p className="wb-pricing-plan-desc">{parseRichText(plan.description)}</p>
                )}
              </div>

              <div className="wb-pricing-price-wrap">
                {plan.originalPrice && (
                  <span className="wb-pricing-orig-price">{plan.originalPrice}</span>
                )}
                <div className="wb-pricing-price-group">
                  <strong className="wb-pricing-amount">{plan.price}</strong>
                  {plan.period && (
                    <span className="wb-pricing-period">{plan.period}</span>
                  )}
                </div>
              </div>

              <div className="wb-pricing-divider" />

              <div className="wb-pricing-features-wrap">
                <ul className="wb-pricing-features-list">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="wb-pricing-feature-item wb-included">
                      <CheckMark />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.excludedFeatures?.map((feature, fIdx) => (
                    <li key={`ex-${fIdx}`} className="wb-pricing-feature-item wb-excluded">
                      <CrossMark />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="wb-pricing-action-wrap">
                <SiteButton
                  link={plan.cta || { label: "Get started", href: "/contact" }}
                  tone={isFeatured ? "primary" : "secondary"}
                />
                {plan.highlightNote && (
                  <span className="wb-pricing-highlight-note">{plan.highlightNote}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {renderFooterNote()}
    </SectionShell>
  );
}
