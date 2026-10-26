import { splitParagraphs } from "../links.ts";
import { SectionShell } from "../primitives.tsx";
import type { SectionOf } from "../types.ts";

export default function TextSection({ section }: { section: SectionOf<"text"> }) {
  const { data } = section;
  const align = data.align || section.settings.align || "center";
  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-align-${align}`}
      label={data.heading}
    >
      <div className={`wb-text wb-align-${align}`}>
        {data.heading && <h2>{data.heading}</h2>}
        {splitParagraphs(data.body).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </SectionShell>
  );
}
