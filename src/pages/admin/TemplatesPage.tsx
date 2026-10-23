import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, SearchField, Spinner } from "@heroui/react";
import { FolderTree, LayoutTemplate, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminTemplatesApi, type AdminTemplate, type AdminTemplateListParams } from "../../api/admin-templates.ts";
import { errorMessage } from "../../api/http.ts";
import AdminTemplateCard, { type AdminTemplateAction } from "../../components/admin/AdminTemplateCard.tsx";
import TemplateCategoriesDialog from "../../components/admin/TemplateCategoriesDialog.tsx";
import { NewTemplateDialog, TemplateDetailsDialog } from "../../components/admin/TemplateDialogs.tsx";
import PageHeader from "../../components/app/PageHeader.tsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../../components/ui/SelectInput.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { useTemplateCategories } from "../../hooks/use-template-categories.ts";
import "../marketing/templates-gallery.css";
import "../../components/admin/admin-template-grid.css";

type StatusFilter = NonNullable<AdminTemplateListParams["status"]> | "";
type OriginFilter = NonNullable<AdminTemplateListParams["origin"]> | "";
type Feedback = { status: "success" | "danger"; message: string } | null;
type Dialog =
  | { kind: "new"; from?: AdminTemplate }
  | { kind: "categories" }
  | { kind: "details"; template: AdminTemplate }
  | { kind: "archive"; template: AdminTemplate }
  | { kind: "purge"; template: AdminTemplate }
  | null;

const ALL = "all";

const STATUS_OPTIONS: SelectOption<StatusFilter>[] = [
  { value: "", label: "Live and hidden" },
  { value: "live", label: "Live" },
  { value: "hidden", label: "Hidden" },
  { value: "archived", label: "Archived" },
];

const ORIGIN_OPTIONS: SelectOption<OriginFilter>[] = [
  { value: "", label: "Built-in and custom" },
  { value: "built-in", label: "Built-in" },
  { value: "custom", label: "Custom" },
];

const chipClass = (selected: boolean) =>
  `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
    selected ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-body hover:border-line-strong hover:text-ink"
  }`;

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [origin, setOrigin] = useState<OriginFilter>("");
  const [categoryId, setCategoryId] = useState<string>(ALL);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const { categories, error: categoriesError, reload: reloadCategories } = useTemplateCategories();

  const [templates, setTemplates] = useState<AdminTemplate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [dialog, setDialog] = useState<Dialog>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setTemplates(
        await adminTemplatesApi.list({
          search: debouncedSearch || undefined,
          status: status || undefined,
          origin: origin || undefined,
        }),
      );
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, origin]);

  useEffect(() => {
    void load();
  }, [load]);

  // A deleted category can't stay selected.
  useEffect(() => {
    if (categoryId !== ALL && categories && !categories.some((category) => category.id === categoryId)) setCategoryId(ALL);
  }, [categories, categoryId]);

  // Category is filtered here, so each chip can count the templates matching the other filters.
  const countsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const template of templates ?? []) {
      if (template.categoryId) counts.set(template.categoryId, (counts.get(template.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [templates]);

  const visibleTemplates = useMemo(
    () => (templates ?? []).filter((template) => categoryId === ALL || template.categoryId === categoryId),
    [templates, categoryId],
  );

  async function run(template: AdminTemplate, action: () => Promise<unknown>, success: string) {
    setBusyId(template.id);
    setFeedback(null);
    try {
      await action();
      setFeedback({ status: "success", message: success });
      await Promise.all([load(), reloadCategories()]);
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setFeedback({ status: "success", message: `Template ID “${key}” copied.` });
    } catch {
      setFeedback({ status: "danger", message: "Couldn't copy the template ID." });
    }
  }

  function handleAction(template: AdminTemplate, action: AdminTemplateAction) {
    switch (action) {
      case "duplicate":
        setDialog({ kind: "new", from: template });
        return;
      case "details":
        setDialog({ kind: "details", template });
        return;
      case "toggle": {
        const show = template.status !== "LIVE";
        void run(
          template,
          () => adminTemplatesApi.updateDetails(template.id, { isActive: show }),
          show ? `“${template.name}” is live in the gallery.` : `“${template.name}” is hidden from clients.`,
        );
        return;
      }
      case "copy":
        void copyKey(template.key);
        return;
      case "archive":
        setDialog({ kind: "archive", template });
        return;
      case "restore":
        void run(template, () => adminTemplatesApi.restore(template.id), `“${template.name}” restored as hidden. Show it when it's ready.`);
        return;
      case "purge":
        setDialog({ kind: "purge", template });
        return;
    }
  }

  async function runAndClose(template: AdminTemplate, action: () => Promise<unknown>, success: string) {
    await run(template, action, success);
    setDialog(null);
  }

  const hasFilters = Boolean(debouncedSearch || status || origin || categoryId !== ALL);
  const selectedCategory = categories?.find((category) => category.id === categoryId);

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="Templates"
        description="Prebuilt templates clients start new websites from. Changes only affect websites created afterwards."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onPress={() => setDialog({ kind: "categories" })}>
              <FolderTree className="size-4" aria-hidden /> Categories
            </Button>
            <Button onPress={() => setDialog({ kind: "new" })}>
              <Plus className="size-4" aria-hidden /> New template
            </Button>
          </div>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchField aria-label="Search templates" value={search} onChange={setSearch} className="w-full max-w-xs">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by name, number or template ID" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <SelectInput ariaLabel="Filter by status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <SelectInput ariaLabel="Filter by origin" value={origin} onChange={setOrigin} options={ORIGIN_OPTIONS} />
        {loading && templates && <Spinner size="sm" aria-label="Updating" />}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter templates by category">
        <button type="button" className={chipClass(categoryId === ALL)} aria-pressed={categoryId === ALL} onClick={() => setCategoryId(ALL)}>
          All categories
          <span className="text-xs opacity-70">{templates?.length ?? 0}</span>
        </button>
        {categories?.map((category) => (
          <button
            key={category.id}
            type="button"
            className={chipClass(categoryId === category.id)}
            aria-pressed={categoryId === category.id}
            onClick={() => setCategoryId(category.id)}
          >
            {category.name}
            <span className="text-xs opacity-70">{countsByCategory.get(category.id) ?? 0}</span>
          </button>
        ))}
      </div>

      {feedback && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
        </div>
      )}
      {(loadError || categoriesError) && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status="danger">{loadError ?? categoriesError}</FormAlert>
        </div>
      )}

      {!templates && loading ? (
        <div className="mt-4 grid place-items-center rounded-xl border border-line bg-surface py-16">
          <Spinner aria-label="Loading templates" />
        </div>
      ) : templates && visibleTemplates.length === 0 ? (
        <section className="mt-4 rounded-xl border border-line bg-surface px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
            <LayoutTemplate className="size-6" aria-hidden />
          </span>
          <h2 className="mt-4 text-base font-semibold text-ink">
            {hasFilters ? "No templates match these filters" : "No templates yet"}
          </h2>
          <p className="mt-1 text-sm text-ink-body">
            {selectedCategory && !debouncedSearch && !status && !origin
              ? `Nothing is in “${selectedCategory.name}” yet. Pick it when you save a template.`
              : hasFilters
                ? "Try a different search or filter."
                : "Create one to give clients a ready-made starting point."}
          </p>
        </section>
      ) : (
        templates && (
          <section aria-label="Templates" className="admin-template-grid mt-4">
            <div className="gallery-grid">
              {visibleTemplates.map((template) => (
                <AdminTemplateCard
                  key={template.id}
                  template={template}
                  busy={busyId === template.id}
                  onAction={(action) => handleAction(template, action)}
                />
              ))}
            </div>
          </section>
        )
      )}

      {dialog?.kind === "new" && (
        <NewTemplateDialog
          initialTemplate={dialog.from}
          onClose={() => setDialog(null)}
          onCreated={(websiteId) => navigate(`/websites/${websiteId}/edit`)}
        />
      )}
      {dialog?.kind === "categories" && (
        <TemplateCategoriesDialog
          categories={categories}
          onClose={() => setDialog(null)}
          onChanged={async (message) => {
            setFeedback({ status: "success", message });
            await Promise.all([reloadCategories(), load()]);
          }}
        />
      )}
      {dialog?.kind === "details" && (
        <TemplateDetailsDialog
          template={dialog.template}
          categories={categories ?? []}
          onClose={() => setDialog(null)}
          onSaved={(saved) => {
            setDialog(null);
            setFeedback({ status: "success", message: `“${saved.name}” saved. New websites will use the change.` });
            void Promise.all([load(), reloadCategories()]);
          }}
        />
      )}
      <ConfirmDialog
        isOpen={dialog?.kind === "archive"}
        title="Delete template?"
        confirmLabel="Delete"
        tone="danger"
        isPending={dialog?.kind === "archive" && busyId === dialog.template.id}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          if (dialog?.kind !== "archive") return;
          const { template } = dialog;
          void runAndClose(template, () => adminTemplatesApi.archive(template.id), `“${template.name}” deleted. Find it under Archived to restore it.`);
        }}
      >
        “{dialog?.kind === "archive" ? dialog.template.name : ""}” leaves the gallery and can't be picked for new websites.
        Websites already created from it, draft or live, are not changed. You can restore it from Archived.
      </ConfirmDialog>
      <ConfirmDialog
        isOpen={dialog?.kind === "purge"}
        title="Delete forever?"
        confirmLabel="Delete forever"
        tone="danger"
        isPending={dialog?.kind === "purge" && busyId === dialog.template.id}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          if (dialog?.kind !== "purge") return;
          const { template } = dialog;
          void runAndClose(template, () => adminTemplatesApi.deletePermanently(template.id), `“${template.name}” was deleted permanently.`);
        }}
      >
        “{dialog?.kind === "purge" ? dialog.template.name : ""}” and its Template Studio design are removed and can't be restored.
        Websites already created from it, draft or live, keep working exactly as they are.
      </ConfirmDialog>
    </div>
  );
}
