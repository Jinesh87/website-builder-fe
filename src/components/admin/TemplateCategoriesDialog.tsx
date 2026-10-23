import { useState, type FormEvent } from "react";
import { Spinner } from "@heroui/react";
import { FolderTree, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import {
  adminTemplateCategoriesApi,
  TEMPLATE_CATEGORY_NAME_MAX,
  type TemplateCategory,
} from "../../api/admin-template-categories.ts";
import { errorMessage } from "../../api/http.ts";
import CommonModal from "../ui/AppModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput from "../ui/SelectInput.tsx";

type RowMode = { kind: "rename"; id: string; name: string } | { kind: "delete"; id: string; moveTo: string } | null;

const inputClass =
  "h-9 w-full rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink placeholder:text-ink-muted/50 shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15 disabled:bg-canvas disabled:text-ink-muted";
const smallButton =
  "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const nameProblem = (name: string) => {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Use at least 2 characters";
  if (!/[\p{L}\p{N}]/u.test(trimmed)) return "Use at least one letter or number";
  return undefined;
};

const templateCount = (count: number) => `${count} ${count === 1 ? "template" : "templates"}`;

/**
 * Add, rename and delete gallery categories. Built-in categories are locked. A category in use is only
 * deleted after its templates are moved to another one; websites never reference categories.
 */
export default function TemplateCategoriesDialog({
  categories,
  onClose,
  onChanged,
}: {
  /** null while loading. */
  categories: TemplateCategory[] | null;
  onClose: () => void;
  /** Reload categories and templates after any change. */
  onChanged: (message: string) => Promise<void>;
}) {
  const [newName, setNewName] = useState("");
  const [mode, setMode] = useState<RowMode>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(busyKey: string, action: () => Promise<unknown>, message: string) {
    setBusy(busyKey);
    setError(null);
    try {
      await action();
      setMode(null);
      await onChanged(message);
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (nameProblem(name) || busy) return;
    if (await run("new", () => adminTemplateCategoriesApi.create(name), `Category “${name}” added.`)) setNewName("");
  }

  function rename(category: TemplateCategory, name: string) {
    const trimmed = name.trim();
    if (nameProblem(trimmed) || busy) return;
    if (trimmed === category.name) {
      setMode(null);
      return;
    }
    void run(category.id, () => adminTemplateCategoriesApi.rename(category.id, trimmed), `Renamed to “${trimmed}”.`);
  }

  function remove(category: TemplateCategory, moveTo: string) {
    if (busy || (category.templateCount > 0 && !moveTo)) return;
    const target = categories?.find((candidate) => candidate.id === moveTo);
    void run(
      category.id,
      () => adminTemplateCategoriesApi.remove(category.id, category.templateCount > 0 ? moveTo : undefined),
      target ? `“${category.name}” deleted; its templates moved to “${target.name}”.` : `“${category.name}” deleted.`,
    );
  }

  const newNameError = newName ? nameProblem(newName) : undefined;

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      title="Template categories"
      subtitle="Group templates in the gallery. Built-in categories are locked."
      icon={<FolderTree className="size-5" />}
      iconTone="brand"
      size="md"
      secondaryAction={{ label: "Done", onPress: onClose }}
    >
      <div className="flex flex-col gap-4">
        {error && <FormAlert status="danger">{error}</FormAlert>}

        <form onSubmit={(event) => void add(event)} noValidate className="flex flex-col gap-1">
          <label htmlFor="new-template-category" className="text-sm font-medium text-ink">
            New category
          </label>
          <div className="flex gap-2">
            <input
              id="new-template-category"
              value={newName}
              maxLength={TEMPLATE_CATEGORY_NAME_MAX}
              placeholder="e.g. Real estate"
              aria-invalid={Boolean(newNameError)}
              onChange={(event) => setNewName(event.target.value)}
              disabled={busy === "new"}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={Boolean(nameProblem(newName)) || busy !== null}
              className={`${smallButton} h-9 shrink-0 bg-brand px-3 text-white hover:bg-brand-hover`}
            >
              {busy === "new" ? <Spinner size="sm" aria-label="Adding" /> : <Plus className="size-4" aria-hidden />}
              Add
            </button>
          </div>
          {newNameError && <p className="text-xs text-ed-danger">{newNameError}</p>}
        </form>

        {!categories ? (
          <div className="grid place-items-center py-8">
            <Spinner aria-label="Loading categories" />
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {categories.map((category) => {
              const rowBusy = busy === category.id;
              const renaming = mode?.kind === "rename" && mode.id === category.id ? mode : null;
              const deleting = mode?.kind === "delete" && mode.id === category.id ? mode : null;
              const others = categories.filter((candidate) => candidate.id !== category.id);

              return (
                <li key={category.id} className="px-3 py-2.5">
                  {renaming ? (
                    <form
                      noValidate
                      className="flex flex-col gap-1"
                      onSubmit={(event) => {
                        event.preventDefault();
                        rename(category, renaming.name);
                      }}
                    >
                      <div className="flex gap-2">
                        <input
                          aria-label={`New name for ${category.name}`}
                          value={renaming.name}
                          maxLength={TEMPLATE_CATEGORY_NAME_MAX}
                          autoFocus
                          disabled={rowBusy}
                          onChange={(event) => setMode({ ...renaming, name: event.target.value })}
                          onKeyDown={(event) => event.key === "Escape" && setMode(null)}
                          className={inputClass}
                        />
                        <button
                          type="submit"
                          disabled={Boolean(nameProblem(renaming.name)) || rowBusy}
                          className={`${smallButton} h-9 bg-brand text-white hover:bg-brand-hover`}
                        >
                          {rowBusy ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode(null)}
                          disabled={rowBusy}
                          className={`${smallButton} h-9 text-ink-body hover:bg-canvas`}
                        >
                          Cancel
                        </button>
                      </div>
                      {nameProblem(renaming.name) && <p className="text-xs text-ed-danger">{nameProblem(renaming.name)}</p>}
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                          {category.name}
                          {category.isSystem && <Lock className="size-3.5 shrink-0 text-ink-muted" aria-label="Built-in, locked" />}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {templateCount(category.templateCount)}
                          {category.isSystem ? " · Built-in" : ""}
                        </p>
                      </div>
                      {!category.isSystem && !deleting && (
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            disabled={busy !== null}
                            onClick={() => setMode({ kind: "rename", id: category.id, name: category.name })}
                            className={`${smallButton} text-ink-body hover:bg-canvas hover:text-ink`}
                          >
                            <Pencil className="size-3.5" aria-hidden /> Rename
                          </button>
                          <button
                            type="button"
                            disabled={busy !== null}
                            onClick={() => setMode({ kind: "delete", id: category.id, moveTo: "" })}
                            className={`${smallButton} text-ed-danger hover:bg-ed-danger-soft`}
                          >
                            <Trash2 className="size-3.5" aria-hidden /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {deleting && (
                    <div className="mt-2.5 flex flex-col gap-2.5 rounded-lg border border-ed-danger/25 bg-ed-danger-soft/40 p-3">
                      {category.templateCount > 0 ? (
                        <SelectInput
                          label={`Move its ${templateCount(category.templateCount)} to`}
                          value={deleting.moveTo}
                          onChange={(moveTo) => setMode({ ...deleting, moveTo })}
                          options={[
                            { value: "", label: "Choose a category" },
                            ...others.map((other) => ({ value: other.id, label: other.name })),
                          ]}
                          isRequired
                        />
                      ) : (
                        <p className="text-sm text-ink-body">Delete “{category.name}”? No templates use it.</p>
                      )}
                      <p className="text-xs text-ink-muted">Websites already made from these templates are not changed.</p>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setMode(null)}
                          disabled={rowBusy}
                          className={`${smallButton} text-ink-body hover:bg-canvas`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(category, deleting.moveTo)}
                          disabled={rowBusy || (category.templateCount > 0 && !deleting.moveTo)}
                          className={`${smallButton} bg-ed-danger text-white hover:bg-ed-danger/90`}
                        >
                          {rowBusy ? "Deleting…" : category.templateCount > 0 ? "Move and delete" : "Delete category"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </CommonModal>
  );
}
