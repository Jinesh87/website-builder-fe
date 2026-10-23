import { Chip } from "@heroui/react";
import { Brain, Check } from "lucide-react";
import {
  formatPerMillion,
  formatRelativeCost,
  TIER_LABELS,
  type AiModelOption,
  type AiModelTier,
} from "../../api/ai-models.ts";

const TIER_COLOR: Record<AiModelTier, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

type AiModelPickerProps = {
  models: AiModelOption[];
  value: string | null;
  onChange: (modelId: string) => void;
};

export default function AiModelPicker({ models, value, onChange }: AiModelPickerProps) {
  return (
    <div role="radiogroup" aria-label="AI model" className="grid gap-3 sm:grid-cols-2">
      {models.map((model) => {
        const selected = model.id === value;
        return (
          <button
            key={model.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(model.id)}
            className={`relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
              selected
                ? "border-brand bg-brand-soft/40 shadow-sm ring-2 ring-brand/20"
                : "border-line bg-surface hover:border-ink-muted/50 hover:bg-canvas/40"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`text-sm font-semibold ${selected ? "text-brand" : "text-ink"}`}>{model.label}</p>
                <p className="font-mono text-[11px] text-ink-muted">{model.id}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {selected && (
                  <span className="flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                    <Check className="size-3 stroke-[2.5]" aria-hidden />
                    Selected
                  </span>
                )}
                <Chip size="sm" color={TIER_COLOR[model.tier]}>
                  {TIER_LABELS[model.tier]}
                </Chip>
              </div>
            </div>

            <p className="text-xs text-ink-body">{model.description}</p>

            <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
              <span className="font-semibold text-ink">{formatRelativeCost(model)}</span>
              <span>
                {formatPerMillion(model.inputPerMillion)} in / {formatPerMillion(model.outputPerMillion)} out per 1M
                tokens
              </span>
            </div>

            {model.reasoning && (
              <p className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                <Brain className="size-3.5 shrink-0" aria-hidden />
                Uses extra reasoning tokens on every request
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
