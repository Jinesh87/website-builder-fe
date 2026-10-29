import { useEffect, useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { templatesApi, type TemplatePreview, type WebsiteTemplate } from "../../api/websites.ts";
import type { ThemeSettings } from "../../site-kit/index.ts";
import SiteThumbnail from "./SiteThumbnail.tsx";

type TemplateThumbnailProps = {
  template: Pick<WebsiteTemplate, "key" | "name" | "thumbnailUrl" | "isCustom">;
  theme?: ThemeSettings | null;
  className?: string;
};

/** Live render of a platform template's home page; uses the uploaded thumbnail when there is one. */
export default function TemplateThumbnail({ template, theme, className = "" }: TemplateThumbnailProps) {
  const canRender = !template.thumbnailUrl && !template.isCustom;
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!canRender) return;
    let cancelled = false;
    templatesApi
      .preview(template.key)
      .then((loaded) => !cancelled && setPreview(loaded))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [canRender, template.key]);

  if (template.thumbnailUrl) {
    return (
      <div className={`aspect-[16/10] w-full overflow-hidden bg-canvas ${className}`}>
        <img
          src={template.thumbnailUrl}
          alt={`${template.name} template preview`}
          loading="lazy"
          className="size-full object-cover object-top"
        />
      </div>
    );
  }

  if (preview) {
    const site = theme ? { ...preview.site, theme } : preview.site;
    return <SiteThumbnail site={site} className={className} />;
  }

  return (
    <div
      className={`grid aspect-[16/10] w-full place-items-center bg-canvas ${!failed && canRender ? "animate-pulse" : ""} ${className}`}
      aria-hidden
    >
      <LayoutTemplate className="size-6 text-ink-muted/60" />
    </div>
  );
}
