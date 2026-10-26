import { SectionHead, SectionShell, SiteButton } from "../primitives.tsx";
import type { FaqData, SectionOf } from "../types.ts";

function ChevronDown() {
  return (
    <svg
      className="wb-faq-icon wb-faq-chevron"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="wb-faq-icon wb-faq-plus"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 4.16666V15.8333M4.16669 10H15.8334"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SupportCtaCard({ data }: { data: FaqData }) {
  if (!data.supportCta || (!data.supportCta.title && !data.supportCta.description && !data.supportCta.link)) {
    return null;
  }
  const { title, description, link } = data.supportCta;
  return (
    <div className="wb-faq-support-card">
      <div className="wb-faq-support-text">
        {title && <h4 className="wb-faq-support-title">{title}</h4>}
        {description && <p className="wb-faq-support-desc">{description}</p>}
      </div>
      {link && (
        <div className="wb-faq-support-action">
          <SiteButton link={link} tone="secondary" />
        </div>
      )}
    </div>
  );
}

export default function FaqSection({ section }: { section: SectionOf<"faq"> }) {
  const { data } = section;
  const variant = data.variant || "accordion-classic";
  const cardStyle = data.cardStyle || "default";
  const align = data.align || section.settings.align || "center";

  // 1. Two-Column Grid Variant
  if (variant === "two-column-grid") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-faq-section wb-faq-variant-grid wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead
          heading={data.heading}
          intro={data.intro}
          eyebrow={data.eyebrow}
          align={align}
        />

        <div className="wb-faq-two-cols-grid">
          {data.items.map((item, index) => (
            <details
              key={index}
              open={item.isOpenDefault}
              className={`wb-faq-card-item wb-faq-card-style-${cardStyle}`}
            >
              <summary className="wb-faq-summary">
                <div className="wb-faq-summary-content">
                  {(item.category || item.badge) && (
                    <div className="wb-faq-meta-bar">
                      {item.category && (
                        <span className="wb-faq-category-pill">{item.category}</span>
                      )}
                      {item.badge && (
                        <span className="wb-faq-badge-pill">{item.badge}</span>
                      )}
                    </div>
                  )}
                  <span className="wb-faq-question-text">{item.question}</span>
                </div>
                <ChevronDown />
              </summary>
              <div className="wb-faq-answer-body">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <SupportCtaCard data={data} />
      </SectionShell>
    );
  }

  // 2. Split Sidebar Variant (Sticky Hero / Support + Accordion Stack)
  if (variant === "split-sidebar") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className="wb-faq-section wb-faq-variant-split"
        label={data.heading}
      >
        <div className="wb-faq-split-layout">
          <div className="wb-faq-split-sidebar">
            <div className="wb-faq-sidebar-sticky">
              {data.eyebrow && <span className="wb-eyebrow">{data.eyebrow}</span>}
              <h2 className="wb-faq-split-heading">{data.heading}</h2>
              {data.intro && <p className="wb-faq-split-intro">{data.intro}</p>}

              {data.supportCta && (
                <div className="wb-faq-split-support-box">
                  {data.supportCta.title && (
                    <h4 className="wb-faq-support-title">{data.supportCta.title}</h4>
                  )}
                  {data.supportCta.description && (
                    <p className="wb-faq-support-desc">{data.supportCta.description}</p>
                  )}
                  {data.supportCta.link && (
                    <div className="wb-faq-support-action">
                      <SiteButton link={data.supportCta.link} tone="primary" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="wb-faq-split-content">
            <div className="wb-faq-accordion-stack">
              {data.items.map((item, index) => (
                <details
                  key={index}
                  open={item.isOpenDefault}
                  className={`wb-faq-accordion-item wb-faq-card-style-${cardStyle}`}
                >
                  <summary className="wb-faq-summary">
                    <div className="wb-faq-summary-content">
                      {(item.category || item.badge) && (
                        <div className="wb-faq-meta-bar">
                          {item.category && (
                            <span className="wb-faq-category-pill">{item.category}</span>
                          )}
                          {item.badge && (
                            <span className="wb-faq-badge-pill">{item.badge}</span>
                          )}
                        </div>
                      )}
                      <span className="wb-faq-question-text">{item.question}</span>
                    </div>
                    <PlusIcon />
                  </summary>
                  <div className="wb-faq-answer-body">
                    <p>{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  // 3. Minimal Numbered Variant (Swiss Architectural / Editorial)
  if (variant === "minimal-numbered") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-faq-section wb-faq-variant-minimal wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead
          heading={data.heading}
          intro={data.intro}
          eyebrow={data.eyebrow}
          align={align}
        />

        <div className="wb-faq-minimal-container">
          {data.items.map((item, index) => {
            const indexStr = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
            return (
              <details
                key={index}
                open={item.isOpenDefault}
                className="wb-faq-minimal-item"
              >
                <summary className="wb-faq-minimal-summary">
                  <span className="wb-faq-minimal-num">{indexStr}</span>
                  <div className="wb-faq-minimal-q-wrap">
                    {(item.category || item.badge) && (
                      <div className="wb-faq-meta-bar">
                        {item.category && (
                          <span className="wb-faq-category-pill">{item.category}</span>
                        )}
                        {item.badge && (
                          <span className="wb-faq-badge-pill">{item.badge}</span>
                        )}
                      </div>
                    )}
                    <span className="wb-faq-minimal-question">{item.question}</span>
                  </div>
                  <PlusIcon />
                </summary>
                <div className="wb-faq-minimal-answer">
                  <p>{item.answer}</p>
                </div>
              </details>
            );
          })}
        </div>

        <SupportCtaCard data={data} />
      </SectionShell>
    );
  }

  // 4. Categorized Cards Variant (Boxed Modular Cards)
  if (variant === "categorized-cards") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-faq-section wb-faq-variant-cards wb-align-${align}`}
        label={data.heading}
      >
        <SectionHead
          heading={data.heading}
          intro={data.intro}
          eyebrow={data.eyebrow}
          align={align}
        />

        <div className="wb-faq-categorized-grid">
          {data.items.map((item, index) => (
            <div
              key={index}
              className={`wb-faq-boxed-card wb-faq-card-style-${cardStyle}`}
            >
              <div className="wb-faq-boxed-header">
                <div className="wb-faq-meta-bar">
                  <span className="wb-faq-category-pill">
                    {item.category || "General"}
                  </span>
                  {item.badge && (
                    <span className="wb-faq-badge-pill">{item.badge}</span>
                  )}
                </div>
                <h3 className="wb-faq-boxed-question">{item.question}</h3>
              </div>
              <div className="wb-faq-boxed-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <SupportCtaCard data={data} />
      </SectionShell>
    );
  }

  // 5. Classic Modern Accordion Variant (Default)
  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-faq-section wb-faq-variant-accordion wb-align-${align}`}
      label={data.heading}
    >
      <SectionHead
        heading={data.heading}
        intro={data.intro}
        eyebrow={data.eyebrow}
        align={align}
      />

      <div className="wb-faq-classic-container">
        <div className="wb-faq-accordion-stack">
          {data.items.map((item, index) => (
            <details
              key={index}
              open={item.isOpenDefault}
              className={`wb-faq-accordion-item wb-faq-card-style-${cardStyle}`}
            >
              <summary className="wb-faq-summary">
                <div className="wb-faq-summary-content">
                  {(item.category || item.badge) && (
                    <div className="wb-faq-meta-bar">
                      {item.category && (
                        <span className="wb-faq-category-pill">{item.category}</span>
                      )}
                      {item.badge && (
                        <span className="wb-faq-badge-pill">{item.badge}</span>
                      )}
                    </div>
                  )}
                  <span className="wb-faq-question-text">{item.question}</span>
                </div>
                <ChevronDown />
              </summary>
              <div className="wb-faq-answer-body">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <SupportCtaCard data={data} />
    </SectionShell>
  );
}
