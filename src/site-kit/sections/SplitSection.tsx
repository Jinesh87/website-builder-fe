import { splitParagraphs } from "../links.ts";
import { parseRichText, SectionShell, SiteButton, SiteIcon, SiteImage } from "../primitives.tsx";
import type { SectionOf } from "../types.ts";

export default function SplitSection({ section }: { section: SectionOf<"split"> }) {
  const { data } = section;
  const polaroid = data.imageStyle === "polaroid";
  const arch = data.imageStyle === "arch";
  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-split wb-split-${data.imagePosition}${polaroid ? " wb-split-vintage" : ""}${arch ? " wb-split-arch" : ""}`}
      label={data.heading}
    >
      <div className="wb-split-grid">
        <div className="wb-split-copy wb-split-content">
          {data.eyebrow && <p className="wb-eyebrow">{parseRichText(data.eyebrow)}</p>}
          <h2 className="wb-split-heading">{parseRichText(data.heading)}</h2>
          {splitParagraphs(data.body).map((paragraph, index) => (
            <p key={index} className="wb-muted wb-split-desc">
              {parseRichText(paragraph)}
            </p>
          ))}
          {data.bullets.length > 0 && (
            <ul className="wb-split-list">
              {data.bullets.map((bullet, index) => (
                <li key={index}>
                  <SiteIcon name="check" />
                  <span>{parseRichText(bullet)}</span>
                </li>
              ))}
            </ul>
          )}
          {data.signature && <p className="wb-split-signature">{parseRichText(data.signature)}</p>}
          {data.cta && (
            <div className="wb-actions">
              <SiteButton link={data.cta} tone={arch ? "secondary" : "primary"} />
            </div>
          )}
        </div>
        <div className="wb-split-media">
          {data.image ? (
            polaroid ? (
              <div className="wb-split-polaroid-frame wb-split-polaroid">
                {data.imageTapeLabel && (
                  <div className="wb-split-tape-strip wb-polaroid-tape-label">{data.imageTapeLabel}</div>
                )}
                <div className="wb-split-polaroid-img-wrap">
                  <SiteImage image={data.image} />
                </div>
              </div>
            ) : (
              <SiteImage image={data.image} />
            )
          ) : (
            <div className={`wb-media-placeholder${arch ? " wb-split-arch-empty" : ""}`} aria-hidden="true" />
          )}
        </div>
      </div>
    </SectionShell>
  );
}
