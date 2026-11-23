import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** An ID in monospace with a small copy button, for table cells. */
export default function CopyableId({ value, label = "ID" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure origin): the ID is still selectable.
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <code className="font-mono text-xs text-ink-body select-all">{value}</code>
      <button
        type="button"
        onClick={() => void copy()}
        className="cursor-pointer text-ink-muted transition-colors hover:text-ink"
        title={copied ? "Copied" : `Copy ${label}`}
        aria-label={copied ? "Copied" : `Copy ${label}`}
      >
        {copied ? <Check className="size-3.5 text-emerald-600" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      </button>
    </span>
  );
}
