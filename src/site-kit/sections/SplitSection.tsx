import { splitParagraphs } from "../links.ts";
import { SectionShell, SiteButton, SiteIcon, SiteImage } from "../primitives.tsx";
import type { SectionOf } from "../types.ts";

export default function SplitSection({ section }: { section: SectionOf<"split"> }) {
  const { data } = section;
  const polaroid = data.imageStyle === "polaroid";
  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-split wb-split-${data.imagePosition}${polaroid ? " wb-split-vintage" : ""}`}
      label={data.heading}
    >
      <div className="wb-split-grid">
        <div className="wb-split-copy">
          {data.eyebrow && <p className="wb-eyebrow">{data.eyebrow}</p>}
          <h2>{data.heading}</h2>
          {splitParagraphs(data.body).map((paragraph, index) => (
            <p key={index} className="wb-muted">
              {paragraph}
            </p>
          ))}
          {data.bullets.length > 0 && (
            <ul className="wb-split-list">
              {data.bullets.map((bullet, index) => (
                <li key={index}>
                  <SiteIcon name="check" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
          {data.cta && (
            <div className="wb-actions">
              <SiteButton link={data.cta} />
            </div>
          )}
        </div>
        <div className="wb-split-media">
          {data.image ? (
            polaroid ? (
              <div className="wb-split-polaroid">
                <SiteImage image={data.image} />
                {data.imageTapeLabel && (
                  <div className="wb-polaroid-tape-label">{data.imageTapeLabel}</div>
                )}
              </div>
            ) : (
              <SiteImage image={data.image} />
            )
          ) : (
            <div className="wb-media-placeholder" aria-hidden="true" />
          )}
        </div>
      </div>
    </SectionShell>
  );
}
