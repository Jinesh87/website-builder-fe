import { useState, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { Check, Copy, ExternalLink } from "lucide-react";

/** A labelled value with a Copy button (and an optional link out), for URLs people paste into other dashboards. */
export default function CopyRow({
  label,
  value,
  hint,
  actionHref,
  actionLabel,
}: {
  label: string;
  value: string;
  hint: ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-lg border border-line bg-canvas/60 p-3.5 text-xs text-ink-body">
      <p className="font-semibold text-ink">{label}</p>
      <p className="mt-1">{hint}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-surface px-2 py-1.5 font-mono text-[11px]">{value}</code>
        <Button size="sm" variant="outline" onPress={() => void copy()}>
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </Button>
        {actionHref && actionLabel && (
          <Button
            size="sm"
            variant="outline"
            onPress={() => window.open(actionHref, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="size-3.5" aria-hidden />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
