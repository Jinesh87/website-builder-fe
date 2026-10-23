import { useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "@heroui/react";
import { Check, Search } from "lucide-react";
import type { AdminTemplate } from "../../api/admin-templates.ts";
import AdminTemplateThumbnail from "./AdminTemplateThumbnail.tsx";

const ALL = "All";

type TemplatePickerProps = {
  /** null while loading. */
  templates: AdminTemplate[] | null;
  /** Key of the selected template, or "" for none. */
  value: string;
  onChange: (template: AdminTemplate) => void;
};

/** Searchable grid of template thumbnails, filterable by category; picks one template. */
export default function TemplatePicker({ templates, value, onChange }: TemplatePickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const gridRef = useRef<HTMLDivElement>(null);
  const revealed = useRef(false);

  // Bring a preselected template into view once, when the list first appears.
  useEffect(() => {
    if (revealed.current || !templates) return;
    revealed.current = true;
    gridRef.current?.querySelector('[aria-checked="true"]')?.scrollIntoView({ block: "nearest" });
  }, [templates]);

  // Categories in the order templates appear, which follows the gallery order.
  const categories = useMemo(
    () => [ALL, ...new Set((templates ?? []).map((template) => template.category))],
    [templates],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (templates ?? []).filter(
      (template) =>
        (category === ALL || template.category === category) &&
        (!query ||
          `${template.name} ${template.key} ${template.category} ${template.number ?? ""}`.toLowerCase().includes(query.replace(/^#/, ""))),
    );
  }, [templates, category, search]);

  if (!templates) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-line py-10 text-sm text-ink-muted">
        <Spinner size="sm" aria-hidden /> Loading templates…
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <p className="rounded-xl border border-line px-4 py-8 text-center text-sm text-ink-muted">
        No live templates to copy yet. Show one in the gallery first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="relative block">
        <span className="sr-only">Search templates</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or category"
          className="h-9 w-full rounded-lg border border-ed-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted/50 shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15"
        />
      </label>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              category === name ? "bg-ink text-white" : "bg-canvas text-ink-body hover:text-ink"
            }`}
          >
            {name === ALL ? "All" : name}
          </button>
        ))}
      </div>

      <div
        ref={gridRef}
        role="radiogroup"
        aria-label="Template to copy"
        className="grid max-h-[22rem] grid-cols-2 gap-3 overflow-y-auto overscroll-contain p-0.5 sm:grid-cols-3"
      >
        {visible.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-ink-muted">No templates match.</p>
        ) : (
          visible.map((template) => {
            const selected = template.key === value;
            return (
              <button
                key={template.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(template)}
                className={`group relative flex flex-col overflow-hidden rounded-xl border bg-surface text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  selected ? "border-brand ring-2 ring-brand/30" : "border-line hover:border-line-strong hover:shadow-ed-xs"
                }`}
              >
                <span className="block overflow-hidden border-b border-line">
                  <AdminTemplateThumbnail templateId={template.id} version={template.updatedAt} />
                </span>
                <span className="flex min-w-0 flex-col px-2.5 py-2">
                  <span className="truncate text-xs font-semibold text-ink">{template.name}</span>
                  <span className="truncate text-[11px] text-ink-muted">
                    {template.category} · {template.pages.length} {template.pages.length === 1 ? "page" : "pages"}
                  </span>
                </span>
                {selected && (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-brand text-white shadow-sm">
                    <Check className="size-3" aria-hidden />
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
