import { useEffect, useRef, useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { adminTemplatesApi } from "../../api/admin-templates.ts";
import type { TemplatePreview } from "../../api/websites.ts";
import SiteThumbnail from "../websites/SiteThumbnail.tsx";

type AdminTemplateThumbnailProps = {
  templateId: string;
  /** Reloads the preview when the template's content changes. */
  version: string;
};

/** Home page of any platform template, hidden and archived ones included; loads once scrolled into view. */
export default function AdminTemplateThumbnail({ templateId, version }: AdminTemplateThumbnailProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [failed, setFailed] = useState(false);

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
    adminTemplatesApi
      .preview(templateId)
      .then((loaded) => !cancelled && setPreview(loaded))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [visible, templateId, version]);

  if (preview) return <SiteThumbnail site={preview.site} />;

  return (
    <div
      ref={boxRef}
      className={`grid aspect-[16/10] w-full place-items-center bg-canvas ${failed ? "" : "animate-pulse"}`}
      aria-hidden
    >
      <LayoutTemplate className="size-6 text-ink-muted/50" />
    </div>
  );
}
