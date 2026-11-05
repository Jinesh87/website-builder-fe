import { useState } from "react";
import { Bookmark, BookmarkPlus, BookUp, LayoutTemplate, Plus, Trash2 } from "lucide-react";
import { ApiError, errorMessage, type FieldIssue } from "../../../../api/http.ts";
import { websitesApi, type SavedSection } from "../../../../api/websites.ts";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog.tsx";
import { duplicateSection, LIMITS } from "../../../../pages/websites/editor/editor-state.ts";
import SaveNameDialog from "../../../../pages/websites/editor/SaveNameDialog.tsx";
import { SECTION_DEFINITIONS, type Section } from "../../../../site-kit/index.ts";
import { useEditor } from "../../editor-context.ts";
import { itemAsSection } from "../../puck/adapter.ts";
import { insertSections, useBuilderPuck } from "../../puck/puck-api.ts";
import { EmptyState, PanelHeader, SectionLabel, ToolButton } from "../ui.tsx";

type NameDialog = { kind: "template" } | { kind: "section"; section: Section } | null;

/** Turns a server validation error into a short hint about which field to fix. */
function sectionSaveError(err: unknown): Error {
  if (err instanceof ApiError && err.code === "VALIDATION_ERROR" && Array.isArray(err.details) && err.details.length) {
    const issue = err.details[0] as FieldIssue;
    const field = [...issue.path].reverse().find((part) => typeof part === "string") ?? "value";
    return new Error(`Fix this section first: ${field} ${issue.message.replace(/^"[^"]*"\s*/, "")}.`);
  }
  return err instanceof Error ? err : new Error(errorMessage(err));
}

export default function TemplatesPanel() {
  const { website, savedSections, setSavedSections, autosave, notify, setLeftPanel } = useEditor();
  const dispatch = useBuilderPuck((state) => state.dispatch);
  const selectedIndex = useBuilderPuck((state) => state.appState.ui.itemSelector?.index ?? null);
  const selectedItem = useBuilderPuck((state) =>
    state.appState.ui.itemSelector ? (state.appState.data.content[state.appState.ui.itemSelector.index] ?? null) : null,
  );
  const count = useBuilderPuck((state) => state.appState.data.content.length);
  const [nameDialog, setNameDialog] = useState<NameDialog>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedSection | null>(null);
  const full = count >= LIMITS.sectionsPerPage;

  function insert(saved: SavedSection) {
    if (full) return;
    insertSections(dispatch, [duplicateSection(saved.section)], selectedIndex === null ? count : selectedIndex + 1);
    notify(`${saved.name} added`);
  }

  async function openTemplateDialog() {
    if (!(await autosave.flush())) {
      notify("Save your changes before creating a template.", "danger");
      return;
    }
    setNameDialog({ kind: "template" });
  }

  async function submitName({ name, description }: { name: string; description: string }) {
    if (nameDialog?.kind === "template") {
      const template = await websitesApi.saveAsTemplate(website.id, { name, ...(description ? { description } : {}) });
      setNameDialog(null);
      notify(`“${template.name}” saved to My templates`);
      return;
    }
    if (nameDialog?.kind === "section") {
      let saved: SavedSection;
      try {
        saved = await websitesApi.saveSection(website.id, { name, section: nameDialog.section });
      } catch (err) {
        throw sectionSaveError(err);
      }
      setSavedSections((current) => [saved, ...current]);
      setNameDialog(null);
      notify(`“${saved.name}” saved to your library`);
    }
  }

  async function confirmDelete(saved: SavedSection) {
    setPendingDelete(null);
    try {
      await websitesApi.deleteSavedSection(website.id, saved.id);
      setSavedSections((current) => current.filter((candidate) => candidate.id !== saved.id));
      notify(`“${saved.name}” deleted`);
    } catch (err) {
      notify(errorMessage(err), "danger");
    }
  }

  return (
    <>
      <PanelHeader title="Templates" description="Reuse saved sections, or save this whole website as a starting point." />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3">
        <div className="flex flex-col gap-1.5 px-3 pb-2">
          <button
            type="button"
            onClick={() => selectedItem && setNameDialog({ kind: "section", section: itemAsSection(selectedItem) })}
            disabled={!selectedItem}
            className="flex h-8 items-center gap-2 rounded-ed border border-ed-border bg-ed-panel px-2.5 text-ed-sm text-ed-text shadow-ed-xs hover:bg-ed-hover disabled:opacity-50"
          >
            <BookmarkPlus className="size-3.5 text-ed-muted" aria-hidden />
            {selectedItem ? "Save selected section" : "Select a section to save it"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (website.isTemplateStudio) {
                setLeftPanel("publish-template");
              } else {
                void openTemplateDialog();
              }
            }}
            className="flex h-8 items-center gap-2 rounded-ed border border-ed-border bg-ed-panel px-2.5 text-ed-sm text-ed-text shadow-ed-xs hover:bg-ed-hover"
          >
            {website.isTemplateStudio ? (
              <>
                <BookUp className="size-3.5 text-ed-accent" aria-hidden />
                Save to template gallery
              </>
            ) : (
              <>
                <LayoutTemplate className="size-3.5 text-ed-muted" aria-hidden />
                Save website as template
              </>
            )}
          </button>
        </div>

        <SectionLabel>Saved sections</SectionLabel>
        {savedSections.length === 0 ? (
          <EmptyState icon={<Bookmark className="size-4" />} title="Nothing saved yet">
            Select a section on the canvas and save it to reuse it on any page.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-0.5 px-1.5">
            {savedSections.map((saved) => (
              <li key={saved.id} className="group flex items-center rounded-ed transition-colors hover:bg-ed-hover">
                <button type="button" onClick={() => insert(saved)} disabled={full} className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5 text-left disabled:opacity-50">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ed-sm font-medium text-ed-text">{saved.name}</span>
                    <span className="block truncate text-ed-2xs text-ed-faint">
                      {SECTION_DEFINITIONS[saved.sectionType].label}
                      {saved.isPlatform ? " · shared" : ""}
                    </span>
                  </span>
                  <Plus className="size-3.5 shrink-0 text-ed-faint transition-colors group-hover:text-ed-accent" aria-hidden />
                </button>
                {!saved.isPlatform && (
                  <span className="flex shrink-0 items-center pr-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <ToolButton label={`Delete ${saved.name}`} size="sm" onClick={() => setPendingDelete(saved)}>
                      <Trash2 className="size-3.5" aria-hidden />
                    </ToolButton>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {nameDialog && (
        <SaveNameDialog
          isOpen
          title={nameDialog.kind === "template" ? "Save as template" : "Save section"}
          intro={
            nameDialog.kind === "template"
              ? "Saves a copy of this website's current draft. Pick it under “Starting point” when you create a new website."
              : "Saves a copy of this section to your library so you can add it to any page."
          }
          defaultName={nameDialog.kind === "template" ? website.name : SECTION_DEFINITIONS[nameDialog.section.type].label}
          withDescription={nameDialog.kind === "template"}
          submitLabel="Save"
          onSubmit={submitName}
          onClose={() => setNameDialog(null)}
        />
      )}
      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete saved section?"
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => pendingDelete && void confirmDelete(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      >
        “{pendingDelete?.name}” will be removed from your library. Pages already using it are not affected.
      </ConfirmDialog>
    </>
  );
}
