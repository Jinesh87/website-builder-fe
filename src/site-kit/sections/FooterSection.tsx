import SiteFooter from "../layout/SiteFooter.tsx";
import type { SectionOf } from "../types.ts";

export default function FooterSection({ section }: { section: SectionOf<"footer"> }) {
  return <SiteFooter footer={section.data} settings={section.settings} sectionId={section.id} />;
}
