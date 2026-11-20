import { RotateCcw } from "lucide-react";
import type { HeroData, HeroSizing } from "../../../site-kit/index.ts";
import { HERO_SIZING_LIMITS } from "../../../site-kit/hero-sizing.ts";
import { FormGroup, SelectField } from "./fields.tsx";

/** Layouts with their own fixed typography, where exact sizes don't apply. */
const FIXED_LAYOUTS = new Set(["vintage-editorial", "vintage-sunburst", "registration-form"]);

type NumericKey = keyof typeof HERO_SIZING_LIMITS;

const NUMBER_FIELDS: { key: NumericKey; label: string; unit: string; step: number; hint?: string }[] = [
  { key: "height", label: "Height", unit: "% of screen", step: 5, hint: "100 fills the whole screen." },
  { key: "headingSize", label: "Heading size", unit: "px", step: 2, hint: "Shrinks automatically on phones." },
  { key: "textSize", label: "Text size", unit: "px", step: 1 },
  { key: "gap", label: "Space between texts", unit: "px", step: 2 },
  { key: "buttonsGap", label: "Space above buttons", unit: "px", step: 2 },
  { key: "textWidth", label: "Text block width", unit: "px", step: 20 },
];

const BUTTON_SIZES = [
  { value: "", label: "Layout default" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

function SizeSlider({
  label,
  unit,
  hint,
  step,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  unit: string;
  hint?: string;
  step: number;
  value: number | undefined;
  min: number;
  max: number;
  onChange: (value: number | undefined) => void;
}) {
  const isSet = typeof value === "number";
  const shown = isSet ? value : Math.round((min + max) / 2);
  const set = (raw: number) => onChange(Math.min(max, Math.max(min, raw)));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-ed-xs font-medium text-ed-text">{label}</span>
        {isSet ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-ed-2xs text-ed-muted hover:bg-ed-subtle hover:text-ed-text"
          >
            <RotateCcw className="size-3" aria-hidden /> Reset
          </button>
        ) : (
          <span className="text-ed-2xs text-ed-faint">Layout default</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={shown}
          aria-label={label}
          onChange={(event) => set(Number(event.target.value))}
          className={`min-w-0 flex-1 cursor-pointer accent-brand ${isSet ? "" : "opacity-50"}`}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={isSet ? value : ""}
          placeholder="Auto"
          aria-label={`${label} (${unit})`}
          onChange={(event) => {
            const raw = event.target.value.trim();
            if (!raw) onChange(undefined);
            else if (Number.isFinite(Number(raw))) set(Number(raw));
          }}
          className="h-7 w-16 rounded-ed border border-ed-border bg-ed-panel px-1.5 text-right text-ed-xs focus:border-ed-accent focus:outline-none"
        />
        <span className="w-16 shrink-0 text-ed-2xs text-ed-muted">{unit}</span>
      </div>
      {hint && <span className="text-ed-2xs text-ed-muted">{hint}</span>}
    </div>
  );
}

/** Exact height, text sizes, spacing and button size for the hero. Unset values keep the layout's own. */
export default function HeroSizingFields({ data, onChange }: { data: HeroData; onChange: (data: HeroData) => void }) {
  if (FIXED_LAYOUTS.has(data.variant)) return null;
  const sizing = data.sizing ?? {};
  const update = (patch: Partial<HeroSizing>) => {
    const next: HeroSizing = { ...sizing, ...patch };
    for (const key of Object.keys(next) as (keyof HeroSizing)[]) if (next[key] === undefined) delete next[key];
    onChange({ ...data, sizing: Object.keys(next).length ? next : undefined });
  };

  return (
    <FormGroup title="Size & spacing">
      {NUMBER_FIELDS.map((field) => (
        <SizeSlider
          key={field.key}
          label={field.label}
          unit={field.unit}
          hint={field.hint}
          step={field.step}
          min={HERO_SIZING_LIMITS[field.key].min}
          max={HERO_SIZING_LIMITS[field.key].max}
          value={sizing[field.key]}
          onChange={(value) => update({ [field.key]: value })}
        />
      ))}
      <SelectField
        label="Button size"
        value={sizing.buttonSize ?? ""}
        options={BUTTON_SIZES}
        onChange={(buttonSize) => update({ buttonSize: (buttonSize || undefined) as HeroSizing["buttonSize"] })}
      />
    </FormGroup>
  );
}
