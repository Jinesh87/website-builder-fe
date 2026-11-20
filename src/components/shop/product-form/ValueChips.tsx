import { useState } from "react";

/** Chip input for option values: type and press Enter or comma; Backspace removes the last chip. */
export default function ValueChips({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [text, setText] = useState("");

  function add(raw: string) {
    const next = raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    const merged = [...values];
    for (const value of next) {
      if (!merged.some((item) => item.toLowerCase() === value.toLowerCase())) merged.push(value);
    }
    onChange(merged);
    setText("");
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-ed-border bg-surface px-2 py-1.5 focus-within:border-ed-accent focus-within:ring-2 focus-within:ring-ed-accent/15">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(values.filter((item) => item !== value))}
            className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-xs text-ink hover:text-danger"
            aria-label={`Remove ${value}`}
          >
            {value}
            <span aria-hidden>×</span>
          </button>
        ))}
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add(text);
            } else if (event.key === "Backspace" && !text && values.length > 0) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => add(text)}
          placeholder={values.length === 0 ? placeholder : "Add more"}
          aria-label={label}
          className="h-7 min-w-32 flex-1 bg-transparent text-sm text-ink outline-none"
        />
      </div>
    </div>
  );
}
