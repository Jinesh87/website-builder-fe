import { AiSparklesIcon } from "../../../components/icons/AiSparklesIcon.tsx";
import { X } from "lucide-react";

export default function AiDrawerSkeleton({ onClose }: { onClose?: () => void }) {
  return (
    <aside
      aria-label="Loading AI Copilot"
      aria-busy="true"
      className="z-(--z-ed-panel) flex h-full min-h-0 w-96 shrink-0 flex-col border-l border-ed-border bg-ed-panel overflow-hidden shadow-sm select-none"
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-ed-border px-3.5 py-2.5 bg-ed-subtle/40 shrink-0">
        <div className="flex items-center gap-2">
          <AiSparklesIcon className="size-4 animate-pulse" variant="glossy" glow />
          <span className="text-ed-xs font-bold text-ed-text tracking-tight">AI Copilot</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI assistant"
            className="flex size-7 items-center justify-center rounded-ed text-ed-muted hover:bg-ed-hover hover:text-ed-text"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </header>

      {/* Body shimmer */}
      <div className="flex flex-1 min-h-0 flex-col justify-between p-3.5 gap-4 overflow-hidden">
        <div className="flex flex-col gap-3 animate-pulse">
          {/* Welcome card placeholder */}
          <div className="rounded-ed-lg border border-ed-border/70 bg-ed-subtle/30 p-3.5 flex flex-col gap-2">
            <div className="h-3.5 w-28 rounded bg-ed-muted/20" />
            <div className="h-2.5 w-full rounded bg-ed-muted/15" />
            <div className="h-2.5 w-4/5 rounded bg-ed-muted/15" />
          </div>

          {/* Quick action chips placeholders */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <div className="h-6 w-20 rounded-full bg-ed-muted/15" />
            <div className="h-6 w-24 rounded-full bg-ed-muted/15" />
            <div className="h-6 w-16 rounded-full bg-ed-muted/15" />
          </div>
        </div>

        {/* Bottom prompt input placeholder */}
        <div className="flex flex-col gap-2 rounded-ed-lg border border-ed-border/80 bg-ed-panel p-2.5 shadow-ed-xs animate-pulse shrink-0">
          <div className="h-12 w-full rounded bg-ed-muted/10" />
          <div className="flex items-center justify-between pt-1">
            <div className="h-3 w-16 rounded bg-ed-muted/20" />
            <div className="h-6 w-12 rounded bg-ed-accent/30" />
          </div>
        </div>
      </div>
    </aside>
  );
}
