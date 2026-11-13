import { ChevronDown, ChevronUp, Eye, EyeOff, Layers } from "lucide-react";
import { SECTION_DEFINITIONS } from "../../../../site-kit/index.ts";
import { getSectionType, itemAsSection, type BuilderItem } from "../../puck/adapter.ts";
import { moveSection, replaceSection, selectSection, useBuilderPuck } from "../../puck/puck-api.ts";
import { EmptyState, PanelHeader, ToolButton } from "../ui.tsx";

export function itemTitle(item: BuilderItem): string {
  const data = item.props.data as { heading?: string; siteName?: string; title?: string };
  const type = getSectionType(item.type);
  // Imported HTML blocks keep their name in `title` (heading text, "Site header", …).
  const imported = type === "imported_html" ? data.title?.trim() : undefined;
  return imported || data.heading?.trim() || data.siteName?.trim() || SECTION_DEFINITIONS[type]?.label || item.type;
}

export default function LayersPanel() {
  const content = useBuilderPuck((state) => state.appState.data.content);
  const selectedIndex = useBuilderPuck((state) => state.appState.ui.itemSelector?.index ?? null);
  const dispatch = useBuilderPuck((state) => state.dispatch);

  return (
    <>
      <PanelHeader title="Layers" description="Sections on this page, top to bottom." />
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain py-2">
        {content.length === 0 ? (
          <EmptyState icon={<Layers className="size-4" />} title="No sections yet">
            Sections you add appear here so you can reorder and select them.
          </EmptyState>
        ) : (
          <ol className="flex flex-col gap-0.5 px-1.5" aria-label="Page sections">
            {content.map((item, index) => {
              const active = selectedIndex === index;
              const hidden = item.props.hidden;
              return (
                <li
                  key={item.props.id}
                  className={`group flex items-center rounded-ed transition-colors ${active ? "bg-ed-accent-soft" : "hover:bg-ed-hover"}`}
                >
                  <button
                    type="button"
                    onClick={() => selectSection(dispatch, index)}
                    aria-current={active ? "true" : undefined}
                    className={`min-w-0 flex-1 py-1.5 pl-2.5 pr-1 text-left ${hidden ? "opacity-50" : ""}`}
                  >
                    <span className={`block truncate text-ed-sm ${active ? "font-semibold text-ed-accent" : "font-medium text-ed-text"}`}>
                      {itemTitle(item)}
                    </span>
                    <span className="block truncate text-ed-2xs text-ed-muted">
                      {SECTION_DEFINITIONS[getSectionType(item.type)]?.label || item.type}
                      {hidden ? " · hidden" : ""}
                    </span>
                  </button>
                  <span className={`flex shrink-0 items-center pr-1 ${active ? "" : "opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"}`}>
                    <ToolButton
                      label={hidden ? "Show section" : "Hide section"}
                      size="sm"
                      onClick={() => replaceSection(dispatch, index, { ...itemAsSection(item), hidden: !hidden })}
                    >
                      {hidden ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                    </ToolButton>
                    <ToolButton label="Move up" size="sm" disabled={index === 0} onClick={() => moveSection(dispatch, index, index - 1)}>
                      <ChevronUp className="size-3.5" aria-hidden />
                    </ToolButton>
                    <ToolButton
                      label="Move down"
                      size="sm"
                      disabled={index === content.length - 1}
                      onClick={() => moveSection(dispatch, index, index + 1)}
                    >
                      <ChevronDown className="size-3.5" aria-hidden />
                    </ToolButton>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </>
  );
}
