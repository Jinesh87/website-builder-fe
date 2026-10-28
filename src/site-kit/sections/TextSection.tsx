import { splitParagraphs } from "../links.ts";
import { parseRichText, SectionShell, SiteButton } from "../primitives.tsx";
import type { SectionOf } from "../types.ts";

export default function TextSection({ section }: { section: SectionOf<"text"> }) {
  const { data } = section;
  const align = data.align || section.settings.align || "center";
  const variant = data.variant || "standard";
  const isPullQuote = variant === "pull-quote";
  const maxWidth = data.maxWidth || (isPullQuote ? "narrow" : "standard");

  return (
    <SectionShell
      sectionId={section.id}
      settings={{ ...section.settings, align }}
      className={`wb-align-${align}${isPullQuote ? " wb-text-pull-quote" : ""}${
        variant === "columns-2" ? " wb-text-columns-2" : ""
      }${variant === "lead" ? " wb-text-lead" : ""}`}
      label={data.heading}
    >
      <div
        className={`wb-text wb-align-${align} wb-text-${maxWidth}${
          isPullQuote ? " wb-text-pull-quote-content" : ""
        }${variant === "columns-2" ? " wb-text-columns-2" : ""}${
          variant === "lead" ? " wb-text-lead" : ""
        }`}
      >
        {data.eyebrow && <p className="wb-eyebrow">{parseRichText(data.eyebrow)}</p>}
        {data.heading && <h2>{parseRichText(data.heading)}</h2>}
        <div className="wb-text-body">
          {splitParagraphs(data.body).map((paragraph, index) => (
            <p key={index}>{parseRichText(paragraph)}</p>
          ))}
        </div>
        {data.quoteAuthor && (
          <p className="wb-quote-author">{parseRichText(data.quoteAuthor)}</p>
        )}
        {data.cta && (
          <div className="wb-actions">
            <SiteButton link={data.cta} />
          </div>
        )}
      </div>
    </SectionShell>
  );
}

