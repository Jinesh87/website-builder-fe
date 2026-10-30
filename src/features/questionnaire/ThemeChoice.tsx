import { Spinner } from "@heroui/react";
import type { ThemeOption } from "../../api/websites.ts";

type ThemeChoiceProps = {
  themes: ThemeOption[] | null;
  /** null = let the team choose. */
  value: string | null;
  onChange: (themeId: string | null) => void;
  isDark: boolean;
};

export default function ThemeChoice({ themes, value, onChange, isDark }: ThemeChoiceProps) {
  const option = (selected: boolean) =>
    `rounded-xl border p-1.5 text-left transition-all ${
      selected
        ? isDark
          ? "border-brand bg-[#162138] ring-1 ring-brand"
          : "border-brand bg-brand-soft/30 ring-2 ring-brand/30"
        : isDark
          ? "border-[#222c40] bg-[#0c101a] hover:border-slate-500"
          : "border-line bg-canvas hover:border-brand/40"
    }`;
  const label = `mt-1.5 block truncate px-0.5 text-[11px] font-medium ${isDark ? "text-slate-300" : "text-ink-body"}`;

  if (themes === null) {
    return (
      <div className="grid h-16 place-items-center">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label="Website theme" className="grid grid-cols-3 gap-2">
      <button type="button" role="radio" aria-checked={value === null} onClick={() => onChange(null)} className={option(value === null)}>
        <span
          className={`grid h-9 place-items-center rounded-md border border-dashed text-[10px] ${
            isDark ? "border-slate-600 text-slate-400" : "border-line-strong text-ink-muted"
          }`}
        >
          Auto
        </span>
        <span className={label}>You choose</span>
      </button>
      {themes.map((theme) => {
        const { colors } = theme.settings;
        const selected = theme.id === value;
        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(theme.id)}
            className={option(selected)}
            title={theme.name}
          >
            <span
              className="flex h-9 items-end gap-1 rounded-md border border-black/5 p-1.5"
              style={{ background: colors.background }}
              aria-hidden
            >
              <span className="h-4 w-6 rounded-sm" style={{ background: colors.primary }} />
              <span className="h-3 w-4 rounded-sm" style={{ background: colors.secondary }} />
              <span className="h-2 flex-1 rounded-sm" style={{ background: colors.surface }} />
            </span>
            <span className={label}>{theme.name}</span>
          </button>
        );
      })}
    </div>
  );
}
