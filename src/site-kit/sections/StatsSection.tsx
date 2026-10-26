import { gridStyle, SectionHead, SectionShell } from "../primitives.tsx";
import type { GridColumns, SectionOf } from "../types.ts";

export default function StatsSection({ section }: { section: SectionOf<"stats"> }) {
  const { data } = section;
  const align = data.align || section.settings.align || "center";
  const columns = Math.min(Math.max(data.items.length, 1), 4) as GridColumns;
  return (
    <SectionShell sectionId={section.id} settings={section.settings} className={`wb-stats wb-align-${align}`} label={data.heading || "Statistics"}>
      {data.heading && <SectionHead heading={data.heading} intro={data.intro} align={align} />}
      <dl className="wb-grid" style={gridStyle(columns, 2)}>
        {data.items.map((item, index) => (
          <div key={index} className="wb-stat">
            <dt className="wb-muted">{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  );
}
