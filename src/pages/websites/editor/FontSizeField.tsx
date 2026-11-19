import { useEffect, useState } from "react";
import { SelectField, TextField } from "./fields.tsx";
import { FONT_SIZE_PRESETS, parseFontSize } from "./font-size.ts";

const DEFAULT = "default";
const CUSTOM = "custom";

/**
 * Font size: "As imported", a preset, or a typed size (22, 22px, 1.4rem…). `value` is the CSS
 * size or "" for as imported; a typed size applies on blur or Enter.
 */
export function FontSizeField({
  label,
  value,
  defaultLabel,
  onChange,
}: {
  label: string;
  value: string;
  defaultLabel: string;
  onChange: (value: string) => void;
}) {
  const isPreset = !value || FONT_SIZE_PRESETS.includes(value);
  const [custom, setCustom] = useState(!isPreset);
  const [draft, setDraft] = useState(isPreset ? "" : value);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!value || FONT_SIZE_PRESETS.includes(value)) return;
    setCustom(true);
    setDraft(value);
  }, [value]);

  const options = [
    { value: DEFAULT, label: defaultLabel },
    ...FONT_SIZE_PRESETS.map((size) => ({ value: size, label: size })),
    { value: CUSTOM, label: custom && value && !isPreset ? `Custom (${value})` : "Custom…" },
  ];
  const selected = custom ? CUSTOM : value || DEFAULT;

  function choose(next: string) {
    setError(null);
    if (next === CUSTOM) {
      setCustom(true);
      setDraft(value);
      return;
    }
    setCustom(false);
    onChange(next === DEFAULT ? "" : next);
  }

  function commit() {
    if (!draft.trim()) return setError(null);
    const size = parseFontSize(draft);
    if (!size) return setError("Enter a size like 22, 22px or 1.4rem.");
    setError(null);
    setDraft(size);
    if (size !== value) onChange(size);
  }

  return (
    <div className="space-y-2">
      <SelectField label={label} value={selected} options={options} onChange={choose} />
      {custom && (
        <TextField
          label="Custom size"
          value={draft}
          onChange={(next) => {
            setDraft(next);
            setError(null);
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
          }}
          placeholder="e.g. 22px or 1.4rem"
          error={error ?? undefined}
          hint={error ? undefined : "A number is read as pixels. Press Enter to apply."}
        />
      )}
    </div>
  );
}
