import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { ArrowUpRight, Eye, Globe, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { websitesApi, type WebsiteDetail, type WebsiteSummary } from "../../api/websites.ts";
import { formatDate } from "../admin/client-labels.tsx";
import SiteThumbnail from "./SiteThumbnail.tsx";
import { BUILDER_LABELS, WebsiteStatusChip } from "./website-labels.tsx";
import { getLiveSiteUrl } from "../../utils/live-url.ts";

export default function WebsiteCard({
  website,
  onDelete,
}: {
  website: WebsiteSummary;
  onDelete?: (website: WebsiteSummary) => void;
}) {
  const [detail, setDetail] = useState<WebsiteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    websitesApi
      .get(website.id)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [website.id]);

  const siteData = detail
    ? {
        theme: detail.draft.theme,
        header: detail.draft.header,
        footer: detail.draft.footer,
        pages: detail.draft.pages,
      }
    : null;

  const hasSections = Boolean(
    detail?.draft?.pages?.some((page) => page.sections && page.sections.length > 0),
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xs transition-all duration-200 hover:border-line-strong hover:shadow-md">
      {/* Thumbnail / Preview */}
      <Link
        to={`/websites/${website.id}`}
        className="relative aspect-video w-full overflow-hidden border-b border-line bg-canvas transition-colors"
      >
        {!loading && hasSections && siteData ? (
          <SiteThumbnail site={siteData} className="size-full" />
        ) : (
          <div className="grid size-full place-items-center bg-canvas">
            <span className="grid size-12 place-items-center rounded-xl bg-surface text-xl font-semibold text-ink-muted shadow-2xs transition-transform group-hover:scale-105">
              {website.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      {/* Card Info & Actions */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/websites/${website.id}`}
            className="min-w-0 truncate font-medium text-ink transition-colors hover:text-brand"
          >
            {website.name}
          </Link>
          <WebsiteStatusChip website={website} />
        </div>

        <p className="mt-1 flex items-center gap-1.5 truncate font-mono text-xs text-ink-muted">
          <Globe className="size-3.5 shrink-0" aria-hidden />
          {website.subdomain}
        </p>

        <p className="mt-2 text-xs text-ink-muted">
          {BUILDER_LABELS[website.builderType]} · {website.pageCount}{" "}
          {website.pageCount === 1 ? "page" : "pages"} · Updated{" "}
          {formatDate(website.updatedAt)}
        </p>

        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-line/60">
          <Link
            to={`/websites/${website.id}`}
            className={buttonVariants({ size: "sm", variant: "secondary" })}
          >
            Dashboard
          </Link>
          <Link
            to={`/websites/${website.id}/edit`}
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            <Pencil className="size-3.5" aria-hidden /> Edit
          </Link>
          <Link
            to={`/websites/${website.id}/preview`}
            className={buttonVariants({ size: "sm", variant: "outline" })}
            title="Full Preview"
            aria-label="Full Preview"
          >
            <Eye className="size-3.5" aria-hidden />
          </Link>
          {website.status === "PUBLISHED" && (
            <a
              href={getLiveSiteUrl(website.subdomain)}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "sm", variant: "outline" })}
              title="Visit live published site"
              aria-label="Visit live published site"
            >
              <ArrowUpRight className="size-3.5 text-emerald-500" aria-hidden />
            </a>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              aria-label={`Delete ${website.name}`}
              onPress={() => onDelete(website)}
              className="ml-auto text-ink-muted transition-colors hover:border-ed-danger/40 hover:bg-ed-danger-soft hover:text-ed-danger focus-visible:text-ed-danger"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

