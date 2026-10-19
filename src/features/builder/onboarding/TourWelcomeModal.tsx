import { useEffect, useRef } from "react";
import { ArrowRight, Globe, Layout, Sliders, Sparkles, X } from "lucide-react";

type TourWelcomeModalProps = {
  isOpen: boolean;
  onStart: () => void;
  onSkip: () => void;
};

export function TourWelcomeModal({ isOpen, onStart, onSkip }: TourWelcomeModalProps) {
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      startButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-(--z-ed-tour-pop) flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      aria-describedby="welcome-modal-desc"
    >
      {/* Subtle dimmed backdrop */}
      <div
        className="fixed inset-0 bg-[rgba(10,12,20,0.6)] backdrop-blur-[2px] transition-opacity duration-200 animate-in fade-in"
        onClick={onSkip}
        aria-hidden="true"
      />

      {/* Minimalist Premium Modal Card */}
      <div className="relative w-full max-w-[410px] overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 fade-in duration-150">
        {/* Top bar: Subtle pill badge & close button */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300">
            <Sparkles className="size-3 text-zinc-700 dark:text-zinc-300" aria-hidden />
            <span>Interactive Guide</span>
          </div>

          <button
            type="button"
            onClick={onSkip}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-1 mb-5">
          <h2
            id="welcome-modal-title"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white"
          >
            Let’s build your site
          </h2>
          <p
            id="welcome-modal-desc"
            className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400"
          >
            A quick 1-minute walkthrough to introduce visual canvas editing, our AI design chat, and publishing.
          </p>
        </div>

        {/* Minimal Feature Highlights (Clean & Monochrome) */}
        <div className="space-y-2 mb-6 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-800/40">
          <div className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-200">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-zinc-700 dark:text-zinc-300" />
            <div className="min-w-0">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">AI Assistant Chat:</span>{" "}
              <span className="text-zinc-500 dark:text-zinc-400">Ask AI to build sections, rewrite copy, and refine styles.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-200">
            <Layout className="mt-0.5 size-3.5 shrink-0 text-zinc-700 dark:text-zinc-300" />
            <div className="min-w-0">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Visual Editing:</span>{" "}
              <span className="text-zinc-500 dark:text-zinc-400">Click any block directly on the canvas to customize text and layout.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-200">
            <Sliders className="mt-0.5 size-3.5 shrink-0 text-zinc-700 dark:text-zinc-300" />
            <div className="min-w-0">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Settings & SEO:</span>{" "}
              <span className="text-zinc-500 dark:text-zinc-400">Fine-tune colors, fonts, page hierarchy, and search rankings.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-200">
            <Globe className="mt-0.5 size-3.5 shrink-0 text-zinc-700 dark:text-zinc-300" />
            <div className="min-w-0">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Responsive & Publish:</span>{" "}
              <span className="text-zinc-500 dark:text-zinc-400">Check desktop, tablet, and mobile, then launch live with one click.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer py-1"
          >
            Skip for now
          </button>

          <button
            ref={startButtonRef}
            type="button"
            onClick={onStart}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all cursor-pointer"
          >
            <span>Start tour</span>
            <ArrowRight className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
