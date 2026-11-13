import SiteHeader from "../layout/SiteHeader.tsx";
import type { SectionOf } from "../types.ts";

export default function HeaderSection({ section }: { section: SectionOf<"header"> }) {
  return <SiteHeader header={section.data} settings={section.settings} sectionId={section.id} />;
}
