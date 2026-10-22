import { useCallback, useEffect, useState } from "react";
import { Button, Chip, SearchField, Spinner } from "@heroui/react";
import { Check, Copy, LayoutTemplate, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  adminTemplatesApi,
  type AdminTemplate,
  type AdminTemplateListParams,
  type PlatformTemplateStatus,
} from "../../api/admin-templates.ts";
import { errorMessage } from "../../api/http.ts";
import { PLATFORM_TEMPLATE_CATEGORIES, type PlatformTemplateCategory } from "../../api/websites.ts";
import { formatDate } from "../../components/admin/client-labels.tsx";
import { NewTemplateDialog, TemplateDetailsDialog } from "../../components/admin/TemplateDialogs.tsx";
import PageHeader from "../../components/app/PageHeader.tsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../../components/ui/SelectInput.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";

type StatusFilter = NonNullable<AdminTemplateListParams["status"]> | "";
type Feedback = { status: "success" | "danger"; message: string } | null;
type Dialog = { kind: "new" } | { kind: "details"; template: AdminTemplate } | { kind: "archive"; template: AdminTemplate } | null;

const STATUS_OPTIONS: SelectOption<StatusFilter>[] = [
  { value: "", label: "Live and hidden" },
  { value: "live", label: "Live" },
  { value: "hidden", label: "Hidden" },
  { value: "archived", label: "Archived" },
];

const CATEGORY_OPTIONS: SelectOption<PlatformTemplateCategory | "">[] = [
  { value: "", label: "All categories" },
  ...PLATFORM_TEMPLATE_CATEGORIES.map((category) => ({ value: category, label: category })),
];

const STATUS_CHIP = {
  LIVE: { label: "Live", color: "success" },
  HIDDEN: { label: "Hidden", color: "default" },
  ARCHIVED: { label: "Archived", color: "warning" },
} as const satisfies Record<PlatformTemplateStatus, { label: string; color: "success" | "default" | "warning" }>;

const actionClass = "font-medium text-brand hover:underline disabled:cursor-wait disabled:opacity-60";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [category, setCategory] = useState<PlatformTemplateCategory | "">("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [templates, setTemplates] = useState<AdminTemplate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setTemplates(
        await adminTemplatesApi.list({
          search: debouncedSearch || undefined,
          status: status || undefined,
          category: category || undefined,
        }),
      );
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, category]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(template: AdminTemplate, action: () => Promise<AdminTemplate>, success: (saved: AdminTemplate) => string) {
    setBusyId(template.id);
    setFeedback(null);
    try {
      const saved = await action();
      setFeedback({ status: "success", message: success(saved) });
      await load();
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  const toggleVisibility = (template: AdminTemplate) =>
    run(
      template,
      () => adminTemplatesApi.updateDetails(template.id, { isActive: template.status !== "LIVE" }),
      (saved) => (saved.status === "LIVE" ? `“${saved.name}” is live in the gallery.` : `“${saved.name}” is hidden from clients.`),
    );

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1500);
    } catch {
      setFeedback({ status: "danger", message: "Couldn't copy the template ID." });
    }
  }

  const hasFilters = Boolean(debouncedSearch || status || category);

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="Templates"
        description="Prebuilt templates clients start new websites from. Changes only affect websites created afterwards."
        actions={
          <Button onPress={() => setDialog({ kind: "new" })}>
            <Plus className="size-4" aria-hidden /> New template
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchField aria-label="Search templates" value={search} onChange={setSearch} className="w-full max-w-xs">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by name or template ID" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <SelectInput ariaLabel="Filter by status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <SelectInput ariaLabel="Filter by category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
        {loading && templates && <Spinner size="sm" aria-label="Updating" />}
      </div>

      {feedback && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
        </div>
      )}
      {loadError && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
        {!templates && loading ? (
          <div className="grid place-items-center py-16">
            <Spinner aria-label="Loading templates" />
          </div>
        ) : templates && templates.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
              <LayoutTemplate className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">
              {hasFilters ? "No templates match these filters" : "No templates yet"}
            </h2>
            <p className="mt-1 text-sm text-ink-body">
              {hasFilters ? "Try a different search or filter." : "Create one to give clients a ready-made starting point."}
            </p>
          </div>
        ) : (
          templates && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-canvas/60 text-xs font-medium text-ink-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Template</th>
                    <th scope="col" className="px-5 py-3 font-medium">Template ID</th>
                    <th scope="col" className="px-5 py-3 font-medium">Category</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3 font-medium">Updated</th>
                    <th scope="col" className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {templates.map((template) => {
                    const busy = busyId === template.id;
                    const archived = template.status === "ARCHIVED";
                    const custom = template.origin === "ADMIN";
                    return (
                      <tr key={template.id} className="hover:bg-canvas/40">
                        <td className="max-w-xs px-5 py-3">
                          <p className="truncate font-medium text-ink">{template.name}</p>
                          <p className="truncate text-xs text-ink-muted">
                            {custom ? "Custom" : "Built-in"} · {template.pages.length} {template.pages.length === 1 ? "page" : "pages"}
                            {template.createdByName ? ` · by ${template.createdByName}` : ""}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex max-w-56 items-center gap-1.5">
                            <code className="truncate font-mono text-xs text-ink-body" title={template.key}>
                              {template.key}
                            </code>
                            <button
                              type="button"
                              aria-label={`Copy template ID ${template.key}`}
                              onClick={() => void copyKey(template.key)}
                              className="grid size-6 shrink-0 place-items-center rounded text-ink-muted hover:bg-canvas hover:text-ink"
                            >
                              {copiedKey === template.key ? <Check className="size-3.5 text-brand" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                            </button>
                          </span>
                        </td>
                        <td className="px-5 py-3 text-ink-body">{template.category}</td>
                        <td className="px-5 py-3">
                          <Chip size="sm" color={STATUS_CHIP[template.status].color}>
                            {STATUS_CHIP[template.status].label}
                          </Chip>
                        </td>
                        <td className="px-5 py-3 text-ink-body">{formatDate(template.updatedAt)}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {archived ? (
                              <button
                                type="button"
                                className={actionClass}
                                disabled={busy}
                                onClick={() =>
                                  void run(
                                    template,
                                    () => adminTemplatesApi.restore(template.id),
                                    (saved) => `“${saved.name}” restored as hidden. Show it when it's ready.`,
                                  )
                                }
                              >
                                {busy ? "Restoring…" : "Restore"}
                              </button>
                            ) : (
                              <>
                                {custom && template.sourceWebsiteId && (
                                  <Link to={`/websites/${template.sourceWebsiteId}/edit`} className={actionClass}>
                                    Edit design
                                  </Link>
                                )}
                                <button type="button" className={actionClass} disabled={busy} onClick={() => setDialog({ kind: "details", template })}>
                                  {custom ? "Edit details" : "Visibility"}
                                </button>
                                <button type="button" className={actionClass} disabled={busy} onClick={() => void toggleVisibility(template)}>
                                  {busy ? "Saving…" : template.status === "LIVE" ? "Hide" : "Show"}
                                </button>
                                {template.status === "LIVE" && (
                                  <a href={`/templates/${encodeURIComponent(template.key)}`} target="_blank" rel="noreferrer" className={actionClass}>
                                    Preview
                                  </a>
                                )}
                                {custom && (
                                  <button
                                    type="button"
                                    className="font-medium text-ed-danger hover:underline disabled:opacity-60"
                                    disabled={busy}
                                    onClick={() => setDialog({ kind: "archive", template })}
                                  >
                                    Delete
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </section>

      {dialog?.kind === "new" && (
        <NewTemplateDialog onClose={() => setDialog(null)} onCreated={(websiteId) => navigate(`/websites/${websiteId}/edit`)} />
      )}
      {dialog?.kind === "details" && (
        <TemplateDetailsDialog
          template={dialog.template}
          onClose={() => setDialog(null)}
          onSaved={(saved) => {
            setDialog(null);
            setFeedback({ status: "success", message: `“${saved.name}” saved. New websites will use the change.` });
            void load();
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
          void run(
            template,
            () => adminTemplatesApi.archive(template.id),
            (saved) => `“${saved.name}” deleted. Find it under Archived to restore it.`,
          ).then(() => setDialog(null));
        }}
      >
        “{dialog?.kind === "archive" ? dialog.template.name : ""}” leaves the gallery and can't be picked for new websites.
        Websites already created from it, draft or live, are not changed. You can restore it from Archived.
      </ConfirmDialog>
    </div>
  );
}
