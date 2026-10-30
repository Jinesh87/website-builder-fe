import { useMemo, useState } from "react";
import { Spinner } from "@heroui/react";
import { Check, LayoutTemplate } from "lucide-react";
import type { ThemeOption, WebsiteTemplate } from "../../api/websites.ts";
import TemplateThumbnail from "../../components/websites/TemplateThumbnail.tsx";
import CommonModal from "../../components/ui/AppModal.tsx";

type TemplateChoiceProps = {
  templates: WebsiteTemplate[] | null;
  /** null = no starting template. */
  value: string | null;
  onChange: (templateKey: string | null) => void;
  /** Previews the templates in the chosen theme. */
  theme: ThemeOption | null;
  isDark: boolean;
};

export default function TemplateChoice({ templates, value, onChange, theme, isDark }: TemplateChoiceProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const selected = templates?.find((template) => template.key === value) ?? null;

  const categories = useMemo(
    () => ["All", ...new Set((templates ?? []).map((template) => template.category))],
    [templates],
  );
  const visible = (templates ?? []).filter((template) => category === "All" || template.category === category);

  function choose(key: string | null) {
    onChange(key);
    setOpen(false);
  }

  const muted = isDark ? "text-slate-400" : "text-ink-muted";
  const box = isDark ? "border-[#20293d] bg-[#0b0e17]" : "border-line bg-canvas/70";
  const button = isDark
    ? "bg-white text-slate-900 hover:bg-slate-100"
    : "border border-line bg-surface text-ink hover:bg-canvas";

  return (
    <>
      <div className={`flex items-center gap-3 rounded-xl border p-2.5 ${box}`}>
        <div className="w-20 shrink-0 overflow-hidden rounded-md border border-black/5">
          {selected ? (
            <TemplateThumbnail template={selected} theme={theme?.settings} />
          ) : (
            <div className={`grid aspect-[16/10] place-items-center ${isDark ? "bg-[#121826]" : "bg-surface"}`}>
              <LayoutTemplate className={`size-4 ${muted}`} aria-hidden />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-xs font-bold ${isDark ? "text-white" : "text-ink"}`}>
            {selected ? selected.name : "No template"}
          </p>
          <p className={`truncate text-[11px] ${muted}`}>
            {selected ? selected.category : "We design it from your answers"}
          </p>
        </div>
        {selected && (
          <button type="button" onClick={() => onChange(null)} className={`text-[11px] font-medium ${muted} hover:text-red-500`}>
            Remove
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={templates === null}
          className={`shrink-0 rounded-lg px-3 py-1 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 ${button}`}
        >
          {templates === null ? <Spinner size="sm" /> : selected ? "Change" : "Browse"}
        </button>
      </div>

      <CommonModal
        isOpen={open}
        onClose={() => setOpen(false)}
        size="full"
        title="Choose a template"
        subtitle="Optional. Pick a ready-made design to start from; colours follow the theme you picked."
        disableFooter
      >
        <div className="space-y-4">
          {categories.length > 2 && (
            <div role="tablist" aria-label="Template categories" className="flex flex-wrap gap-1.5">
              {categories.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={category === name}
                  onClick={() => setCategory(name)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    category === name ? "bg-brand text-white" : "bg-canvas text-ink-body hover:text-ink"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => choose(null)}
              className={`overflow-hidden rounded-xl border-2 text-left transition-colors ${
                value === null ? "border-brand" : "border-line hover:border-line-strong"
              }`}
            >
              <div className="grid aspect-[16/10] place-items-center bg-canvas text-xs text-ink-muted">
                <span className="flex flex-col items-center gap-1.5">
                  <LayoutTemplate className="size-6" aria-hidden />
                  Designed from your answers
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="text-sm font-semibold text-ink">No template</span>
                {value === null && <Check className="size-4 text-brand" aria-hidden />}
              </div>
            </button>

            {visible.map((template) => {
              const isSelected = template.key === value;
              return (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => choose(template.key)}
                  className={`overflow-hidden rounded-xl border-2 text-left transition-colors ${
                    isSelected ? "border-brand" : "border-line hover:border-line-strong"
                  }`}
                >
                  <TemplateThumbnail template={template} theme={theme?.settings} />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-ink">{template.name}</span>
                      {isSelected && <Check className="size-4 shrink-0 text-brand" aria-hidden />}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {template.category} · {template.pages.length} {template.pages.length === 1 ? "page" : "pages"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {templates !== null && templates.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-muted">No templates are available yet.</p>
          )}
        </div>
      </CommonModal>
    </>
  );
}
