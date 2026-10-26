import { gridStyle, SectionShell, SiteImage } from "../primitives.tsx";
import type { SectionOf } from "../types.ts";

export default function GallerySection({ section }: { section: SectionOf<"gallery"> }) {
  const { data } = section;
  const align = data.align || section.settings.align || "center";
  return (
    <SectionShell sectionId={section.id} settings={section.settings} className={`wb-gallery wb-align-${align}`} label={data.heading}>
      {data.heading && (
        <div className={`wb-gallery-head wb-align-${align}`}>
          <h2>{data.heading}</h2>
        </div>
      )}
      <div className="wb-grid" style={gridStyle(data.columns, data.mobileColumns)}>
        {data.images.map((image, index) => (
          <SiteImage key={`${image.url}-${index}`} image={image} />
        ))}
      </div>
    </SectionShell>
  );
}
