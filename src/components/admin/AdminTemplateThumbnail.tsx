import { useEffect, useRef, useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { adminTemplatesApi } from "../../api/admin-templates.ts";
import { websitesApi } from "../../api/websites.ts";
import type { SiteData } from "../../site-kit/index.ts";
import SiteThumbnail from "../websites/SiteThumbnail.tsx";

/** A saved platform template, or an unsaved draft (its Template Studio website). */
export type ThumbnailSource = { kind: "template"; templateId: string } | { kind: "draft"; websiteId: string };

type AdminTemplateThumbnailProps = {
  source: ThumbnailSource;
  /** Reloads the preview when the content changes. */
  version: string;
};

async function loadSite(source: ThumbnailSource): Promise<SiteData> {
  if (source.kind === "template") return (await adminTemplatesApi.preview(source.templateId)).site;
  const { draft } = await websitesApi.get(source.websiteId);
  return { theme: draft.theme, header: draft.header, footer: draft.footer, pages: draft.pages };
}

/** Home page of a template or draft, hidden and archived ones included; loads once scrolled into view. */
export default function AdminTemplateThumbnail({ source, version }: AdminTemplateThumbnailProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [site, setSite] = useState<SiteData | null>(null);
  const [failed, setFailed] = useState(false);
  const sourceId = source.kind === "template" ? source.templateId : source.websiteId;
  const sourceRef = useRef(source);
  sourceRef.current = source;

  useEffect(() => {
    const box = boxRef.current;
    if (!box || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setVisible(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setFailed(false);
    loadSite(sourceRef.current)
      .then((loaded) => !cancelled && setSite(loaded))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [visible, sourceId, version]);

  if (site && site.pages.some((page) => page.sections.length > 0)) return <SiteThumbnail site={site} />;

  return (
    <div
      ref={boxRef}
      className={`grid aspect-[16/10] w-full place-items-center bg-canvas ${failed || site ? "" : "animate-pulse"}`}
      aria-hidden
    >
      <LayoutTemplate className="size-6 text-ink-muted/50" />
    </div>
  );
}
