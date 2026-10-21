import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import AppTooltip from "../ui/AppTooltip.tsx";
import { getLiveSiteDomain, getLiveSiteUrl } from "../../utils/live-url.ts";

type LiveSiteLinkProps = {
  subdomain: string;
  customDomain: string | null;
  /** "inline" for detail rows, "field" for a boxed address with buttons. */
  variant?: "inline" | "field";
};

/** The public address of a published site, with copy and open actions. */
export default function LiveSiteLink({ subdomain, customDomain, variant = "inline" }: LiveSiteLinkProps) {
  const url = getLiveSiteUrl(subdomain, customDomain);
  const domain = getLiveSiteDomain(subdomain, customDomain);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  function copy() {
    void navigator.clipboard
      ?.writeText(url)
      .then(() => setCopied(true))
      .catch(() => undefined);
  }

  const copyLabel = copied ? "Copied" : "Copy link";
  const CopyIcon = copied ? Check : Copy;

  if (variant === "field") {
    return (
      <div className="flex items-center gap-1 rounded-xl border border-line bg-canvas/60 py-1 pl-3 pr-1">
        <span className="size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 truncate px-1 font-mono text-sm text-ink hover:text-brand"
        >
          {domain}
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-ink-body transition-colors hover:bg-surface hover:text-ink"
        >
          <CopyIcon className={`size-3.5 ${copied ? "text-emerald-600" : ""}`} aria-hidden /> {copyLabel}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-medium text-white transition-colors hover:bg-ink/90"
        >
          Open <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <a href={url} target="_blank" rel="noreferrer" className="min-w-0 truncate font-mono text-ed-sm text-brand hover:underline">
        {domain}
      </a>
      <AppTooltip content={copyLabel}>
        <button
          type="button"
          onClick={copy}
          aria-label={copyLabel}
          className="grid size-6 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink"
        >
          <CopyIcon className={`size-3.5 ${copied ? "text-emerald-600" : ""}`} aria-hidden />
        </button>
      </AppTooltip>
      <AppTooltip content="Open live site">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label="Open live site"
          className="grid size-6 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink"
        >
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </AppTooltip>
    </span>
  );
}
