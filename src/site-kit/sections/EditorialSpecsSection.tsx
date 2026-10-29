import type { SectionOf } from "../types.ts";
import { parseRichText, SectionShell, SiteButton } from "../primitives.tsx";

type Props = {
  section: SectionOf<"services">;
};

export default function EditorialSpecsSection({ section }: Props) {
  const data = section.data;
  const isGrid = (data.columns ?? 1) > 1;
  const align = data.align ?? "center";

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-services-editorial-specs ${isGrid ? "wb-specs-grid-mode" : ""}`}
      label={data.heading || "The Specs"}
      fullWidth
    >
      <div className="wb-container">
        {data.eyebrow && <p className="wb-vr-eyebrow">{data.eyebrow}</p>}
        {data.heading && (
          <h2
            className={
              isGrid ? "wb-specs-shoot-heading" : "wb-specs-heading-title"
            }
          >
            {parseRichText(data.heading)}
          </h2>
        )}

        {isGrid ? (
          <div className="wb-specs-columns-grid">
            {data.items.map((item, index) => {
              const num = String(index + 1).padStart(2, "0");
              return (
                <div key={index} className="wb-specs-grid-cell">
                  <span className="wb-specs-grid-num">[{num}]</span>
                  <h3 className="wb-specs-grid-title">{item.title}</h3>
                  <p className="wb-specs-grid-desc">{item.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="wb-specs-list">
            {data.items.map((item, index) => {
              const num = String(index + 1).padStart(2, "0");
              const isStamp = item.stampHighlight ?? false;
              return (
                <div key={index} className="wb-specs-row">
                  <span className="wb-specs-num">{num}</span>
                  <h3
                    className={`wb-specs-title ${isStamp ? "wb-specs-stamp" : ""}`}
                    data-text={item.title}
                  >
                    {item.title}
                  </h3>
                  <p className="wb-specs-desc">{item.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {data.bottomCta && (
          <div
            className={`wb-services-bottom-cta wb-align-${align}`}
            style={{ marginTop: "32px" }}
          >
            <SiteButton link={data.bottomCta} tone="primary" />
          </div>
        )}
      </div>
    </SectionShell>
  );
}
