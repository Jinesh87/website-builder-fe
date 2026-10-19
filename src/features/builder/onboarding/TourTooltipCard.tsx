import { useEffect, useRef, type RefObject } from "react";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import type { TooltipPosition, TourStep } from "./types.ts";

type TourTooltipCardProps = {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  position: TooltipPosition;
  cardRef: RefObject<HTMLDivElement | null>;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
};

export function TourTooltipCard({
  step,
  stepIndex,
  totalSteps,
  position,
  cardRef,
  onNext,
  onPrev,
  onSkip,
  onFinish,
}: TourTooltipCardProps) {
  const isLastStep = stepIndex === totalSteps - 1;
  const isFirstStep = stepIndex === 0;
  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  // Keep focus on the primary action button for immediate keyboard responsiveness
  useEffect(() => {
    primaryButtonRef.current?.focus();
  }, [stepIndex]);

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
      aria-describedby="tour-step-desc"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: "var(--z-ed-tour-pop, 90)",
        transition: "top 280ms cubic-bezier(0.16, 1, 0.3, 1), left 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
      }}
      key={step.id}
      className="editor-tour-card-enter w-[calc(100vw-32px)] sm:w-[380px] max-w-[420px] rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Top Header Row: Step counter pill, Badge & Skip/Close button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          {step.badge && (
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              {step.badge}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip tour"
          className="group flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          title="Skip tour (Esc)"
        >
          <X className="size-3.5 transition-transform group-hover:scale-110" aria-hidden />
        </button>
      </div>

      {/* Thin minimalist progress bar */}
      <div
        className="relative h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4"
        role="progressbar"
        aria-valuenow={stepIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        <div
          className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Content: Title & Description */}
      <div className="space-y-1 mb-5">
        <h3
          id="tour-step-title"
          className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white"
        >
          {step.title}
        </h3>
        <p
          id="tour-step-desc"
          className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400"
        >
          {step.description}
        </p>
      </div>

      {/* Footer controls: Back, Next/Finish, Skip */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer py-1"
        >
          Skip tour
        </button>

        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              <span>Back</span>
            </button>
          )}

          {isLastStep ? (
            <button
              ref={primaryButtonRef}
              type="button"
              onClick={onFinish}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 cursor-pointer"
            >
              <Sparkles className="size-3.5" aria-hidden />
              <span>Start Building</span>
            </button>
          ) : (
            <button
              ref={primaryButtonRef}
              type="button"
              onClick={onNext}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Subtle keyboard shortcuts helper row */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-mono select-none">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 text-[10px] dark:border-zinc-800 dark:bg-zinc-800/80">Esc</kbd>
          close
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 text-[10px] dark:border-zinc-800 dark:bg-zinc-800/80">←</kbd>
          <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 text-[10px] dark:border-zinc-800 dark:bg-zinc-800/80">→</kbd>
          navigate
        </span>
      </div>
    </div>
  );
}
