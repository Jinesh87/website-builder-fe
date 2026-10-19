import { useState, type FormEvent } from "react";
import { ChevronDown, ChevronUp, EyeOff, FileText, Home, Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog.tsx";
import { addPage, deletePage, homePage, LIMITS, moveItem } from "../../../../pages/websites/editor/editor-state.ts";
import type { WebsitePage } from "../../../../api/websites.ts";
import { useEditor } from "../../editor-context.ts";
import { PanelHeader, ToolButton } from "../ui.tsx";

export default function PagesPanel() {
  const { draft, page: current, editDraft, selectPage, setSiteArea, notify } = useEditor();
  const [newName, setNewName] = useState<string | null>(null);
  const [pageToDelete, setPageToDelete] = useState<WebsitePage | null>(null);
  const pages = draft.pages;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newName === null || !newName.trim()) return;
    const result = addPage(draft, newName);
    editDraft(() => result.draft);
    setNewName(null);
    selectPage(result.pageId);
    setSiteArea("page");
  }

  function removePage() {
    if (!pageToDelete) return;
    const remaining = deletePage(draft, pageToDelete.id);
    editDraft(() => remaining);
    if (current.id === pageToDelete.id) {
      const home = homePage(remaining.pages);
      if (home) selectPage(home.id);
    }
    notify(`Deleted “${pageToDelete.name}” page`);
    setPageToDelete(null);
  }

  return (
    <>
      <PanelHeader
        title="Pages"
        description={`${pages.length} of ${LIMITS.pages} pages`}
        actions={
          <ToolButton label="Add page" size="sm" onClick={() => setNewName("")} disabled={pages.length >= LIMITS.pages}>
            <Plus className="size-4" aria-hidden />
          </ToolButton>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1.5">
        {newName !== null && (
          <form onSubmit={submit} className="mx-2 mb-2 flex flex-col gap-2 rounded-ed border border-ed-border bg-ed-subtle p-2">
            <label htmlFor="new-page-name" className="text-ed-xs font-medium text-ed-text">
              Page name
            </label>
            <input
              id="new-page-name"
              autoFocus
              value={newName}
              maxLength={120}
              placeholder="e.g. About us"
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => event.key === "Escape" && setNewName(null)}
              className="h-8 rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-sm focus:border-ed-accent focus:outline-none"
            />
            <div className="flex gap-1.5">
              <button
                type="submit"
                disabled={!newName.trim()}
                className="h-7 rounded-ed bg-ed-accent px-2.5 text-ed-xs font-medium text-white hover:bg-ed-accent-hover disabled:opacity-50"
              >
                Create page
              </button>
              <button type="button" onClick={() => setNewName(null)} className="h-7 rounded-ed px-2.5 text-ed-xs text-ed-muted hover:bg-ed-hover">
                Cancel
              </button>
            </div>
          </form>
        )}
        <ul className="flex flex-col gap-0.5 px-1.5">
          {pages.map((candidate, index) => {
            const active = candidate.id === current.id;
            const isHome = candidate.slug === "/";
            return (
              <li key={candidate.id} className="group flex items-center rounded-ed transition-colors hover:bg-ed-hover has-[button[aria-current]]:bg-ed-accent-soft">
                <button
                  type="button"
                  onClick={() => {
                    selectPage(candidate.id);
                    setSiteArea("page");
                  }}
                  aria-current={active ? "page" : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5 text-left"
                >
                  {isHome ? (
                    <Home className={`size-3.5 shrink-0 ${active ? "text-ed-accent" : "text-ed-faint"}`} aria-hidden />
                  ) : (
                    <FileText className={`size-3.5 shrink-0 ${active ? "text-ed-accent" : "text-ed-faint"}`} aria-hidden />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-ed-sm ${active ? "font-semibold text-ed-accent" : "font-medium text-ed-text"}`}>{candidate.name}</span>
                    <span className="block truncate font-mono text-ed-2xs text-ed-faint">{candidate.slug}</span>
                  </span>
                  {!candidate.visible && <EyeOff className="size-3.5 shrink-0 text-ed-faint" aria-label="Hidden page" />}
                </button>
                <span className="flex shrink-0 items-center pr-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <ToolButton
                    label={`Move ${candidate.name} up`}
                    size="sm"
                    disabled={index === 0}
                    onClick={() => editDraft((d) => ({ ...d, pages: moveItem(d.pages, index, -1) }))}
                  >
                    <ChevronUp className="size-3.5" aria-hidden />
                  </ToolButton>
                  <ToolButton
                    label={`Move ${candidate.name} down`}
                    size="sm"
                    disabled={index === pages.length - 1}
                    onClick={() => editDraft((d) => ({ ...d, pages: moveItem(d.pages, index, 1) }))}
                  >
                    <ChevronDown className="size-3.5" aria-hidden />
                  </ToolButton>
                  {!isHome && (
                    <ToolButton
                      label={`Delete ${candidate.name}`}
                      size="sm"
                      tone="danger"
                      onClick={() => setPageToDelete(candidate)}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </ToolButton>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <ConfirmDialog
        isOpen={pageToDelete !== null}
        title={`Delete “${pageToDelete?.name}”?`}
        confirmLabel="Delete page"
        tone="danger"
        onConfirm={removePage}
        onCancel={() => setPageToDelete(null)}
      >
        The page &ldquo;{pageToDelete?.name}&rdquo; ({pageToDelete?.slug}) and its sections are removed from the draft, along with any menu links to it. The live site changes only when you publish.
      </ConfirmDialog>
    </>
  );
}
