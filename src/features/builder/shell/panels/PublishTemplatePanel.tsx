import { useEffect, useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Archive, BookUp, Check, Copy, ExternalLink, Info, RotateCw, Save } from "lucide-react";
import { adminTemplatesApi, type AdminTemplate } from "../../../../api/admin-templates.ts";
import { ApiError, errorMessage } from "../../../../api/http.ts";
import { useTemplateCategories } from "../../../../hooks/use-template-categories.ts";
import { useEditor } from "../../editor-context.ts";
import { PanelHeader, SectionLabel } from "../ui.tsx";

const NAME_MAX = 120;
const DESCRIPTION_MAX = 500;
const STATUS_LABEL: Record<AdminTemplate["status"], string> = { LIVE: "Live in gallery", HIDDEN: "Draft", ARCHIVED: "Archived" };

const inputClass =
  "w-full rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-sm text-ed-text placeholder:text-ed-faint focus:border-ed-accent focus:outline-none aria-invalid:border-ed-danger disabled:opacity-60";
const buttonClass =
  "flex h-8 flex-1 items-center justify-center gap-2 rounded-ed px-2.5 text-ed-sm font-medium disabled:opacity-50";

type Load = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; template: AdminTemplate | null };
type Form = { name: string; categoryId: string; description: string };
/** "draft" keeps the template out of the gallery; "publish" makes it live for clients. */
type SaveMode = "draft" | "publish";

function formFrom(template: AdminTemplate | null, fallbackName: string): Form {
  if (!template) return { name: fallbackName, categoryId: "", description: "" };
  return { name: template.name, categoryId: template.categoryId ?? "", description: template.description ?? "" };
}

/** Super Admin, Template Studio websites only: saves this website's design as a platform template, or updates it. */
export default function PublishTemplatePanel() {
  const { website, autosave, notify } = useEditor();
  const ids = { name: useId(), category: useId(), description: useId() };
  const [attempt, setAttempt] = useState(0);
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [form, setForm] = useState<Form>(() => formFrom(null, website.name));
  const [saving, setSaving] = useState<SaveMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const { categories, error: categoriesError } = useTemplateCategories();

  useEffect(() => {
    let cancelled = false;
    setLoad({ status: "loading" });
    adminTemplatesApi
      .bySourceWebsite(website.id)
      .then((template) => {
        if (cancelled) return;
        setLoad({ status: "ready", template });
        setForm(formFrom(template, website.name));
      })
      .catch((err: unknown) => !cancelled && setLoad({ status: "error", message: errorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [website.id, website.name, attempt]);

  const template = load.status === "ready" ? load.template : null;
  const archived = template?.status === "ARCHIVED";
  const live = template?.status === "LIVE";
  const nameError = form.name.trim().length < 2 ? "Use at least 2 characters" : undefined;
  const canSubmit = load.status === "ready" && !archived && !nameError && form.categoryId !== "" && saving === null;

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(mode: SaveMode) {
    const { categoryId } = form;
    if (!canSubmit || categoryId === "") return;
    setSaving(mode);
    setError(null);
    setFieldErrors({});
    try {
      if (!(await autosave.flush())) {
        setError("Save your changes before updating the template.");
        return;
      }
      const details = { name: form.name.trim(), categoryId, description: form.description.trim(), isActive: mode === "publish" };
      const saved = template
        ? await adminTemplatesApi.updateFromSource(template.id, details)
        : await adminTemplatesApi.create(website.id, details);
      setLoad({ status: "ready", template: saved });
      setForm(formFrom(saved, website.name));
      notify(
        mode === "draft"
          ? `“${saved.name}” saved as a draft. Clients can't see it yet.`
          : live
            ? `“${saved.name}” updated for new websites`
            : `“${saved.name}” is live in the gallery`,
      );
    } catch (err) {
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors());
      setError(errorMessage(err));
    } finally {
      setSaving(null);
    }
  }

  // Enter keeps a live template live and anything else a draft; publishing is always an explicit click.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(live ? "publish" : "draft");
  }

  async function copyId(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      notify("Couldn't copy the template ID.", "danger");
    }
  }

  return (
    <>
      <PanelHeader
        title={template ? "Update template" : "Save as template"}
        description="This Template Studio website designs a prebuilt template every client can start from."
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3">
        {load.status === "loading" && <p className="px-3 py-6 text-center text-ed-xs text-ed-muted">Loading template…</p>}

        {load.status === "error" && (
          <div role="alert" className="mx-3 mt-3 flex flex-col gap-2 rounded-ed border border-ed-danger/30 bg-ed-danger-soft p-2.5 text-ed-xs text-ed-danger">
            {load.message}
            <button
              type="button"
              onClick={() => setAttempt((count) => count + 1)}
              className="inline-flex h-7 w-fit items-center gap-1.5 rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-text hover:bg-ed-hover"
            >
              <RotateCw className="size-3" aria-hidden /> Try again
            </button>
          </div>
        )}

        {template && (
          <div className="mx-3 mt-3 flex flex-col gap-1.5 rounded-ed border border-ed-border bg-ed-panel p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-ed-2xs font-medium uppercase tracking-wider text-ed-faint">
                Template ID{template.number != null && <span className="ml-1.5 normal-case tracking-normal text-ed-text">#{template.number}</span>}
              </span>
              <span className="text-ed-2xs font-medium text-ed-muted">{STATUS_LABEL[template.status]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <code className="min-w-0 flex-1 truncate font-mono text-ed-xs text-ed-text" title={template.key}>
                {template.key}
              </code>
              <button
                type="button"
                aria-label="Copy template ID"
                onClick={() => void copyId(template.key)}
                className="grid size-6 shrink-0 place-items-center rounded-ed-sm text-ed-muted hover:bg-ed-hover hover:text-ed-text"
              >
                {copied ? <Check className="size-3.5 text-ed-accent" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              </button>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {template.status === "LIVE" && (
                <a
                  href={`/templates/${encodeURIComponent(template.key)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-ed-xs font-medium text-ed-accent hover:underline"
                >
                  Preview in gallery <ExternalLink className="size-3" aria-hidden />
                </a>
              )}
              <Link to="/admin/templates" className="text-ed-xs font-medium text-ed-accent hover:underline">
                All templates
              </Link>
            </div>
          </div>
        )}

        {archived && (
          <p className="mx-3 mt-3 flex gap-2 rounded-ed border border-ed-border bg-ed-subtle p-2.5 text-ed-xs leading-relaxed text-ed-muted">
            <Archive className="mt-0.5 size-3.5 shrink-0 text-ed-faint" aria-hidden />
            <span>This template is archived. Restore it from All templates before updating it.</span>
          </p>
        )}

        {load.status === "ready" && (
          <>
            <p className="mx-3 mt-3 flex gap-2 rounded-ed border border-ed-border bg-ed-subtle p-2.5 text-ed-xs leading-relaxed text-ed-muted">
              <Info className="mt-0.5 size-3.5 shrink-0 text-ed-faint" aria-hidden />
              <span>
                {!template
                  ? "Save a draft to keep working on it later; only admins see drafts. Remove any client's name, contact details, photos and testimonials before publishing."
                  : live
                    ? "Updating changes the template for new websites only. Websites already made from it, draft or live, keep their own copy."
                    : "This template is a draft: only admins see it. Publish it when it's ready for clients."}
              </span>
            </p>

            <SectionLabel>Template details</SectionLabel>
            <form onSubmit={submit} noValidate className="flex flex-col gap-3 px-3">
              <fieldset disabled={archived || saving !== null} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor={ids.name} className="text-ed-xs font-medium text-ed-text">
                    Template name
                  </label>
                  <input
                    id={ids.name}
                    value={form.name}
                    maxLength={NAME_MAX}
                    placeholder="e.g. Dental clinic modern"
                    aria-invalid={Boolean((form.name && nameError) || fieldErrors.name)}
                    onChange={(event) => update("name", event.target.value)}
                    className={`h-8 ${inputClass}`}
                  />
                  {((form.name && nameError) || fieldErrors.name) && (
                    <p className="text-ed-2xs text-ed-danger">{fieldErrors.name ?? nameError}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor={ids.category} className="text-ed-xs font-medium text-ed-text">
                    Category
                  </label>
                  <select
                    id={ids.category}
                    value={form.categoryId}
                    disabled={!categories}
                    aria-invalid={Boolean(fieldErrors.categoryId)}
                    onChange={(event) => update("categoryId", event.target.value)}
                    className={`h-8 ${inputClass}`}
                  >
                    <option value="" disabled>
                      {categories ? "Choose a category" : "Loading categories…"}
                    </option>
                    {categories?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {(fieldErrors.categoryId ?? categoriesError) && (
                    <p className="text-ed-2xs text-ed-danger">{fieldErrors.categoryId ?? categoriesError}</p>
                  )}
                  <p className="text-ed-2xs text-ed-faint">
                    Add or rename categories under{" "}
                    <Link to="/admin/templates" className="text-ed-accent hover:underline">
                      Templates
                    </Link>
                    .
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor={ids.description} className="text-ed-xs font-medium text-ed-text">
                    Description <span className="font-normal text-ed-faint">(optional)</span>
                  </label>
                  <textarea
                    id={ids.description}
                    rows={3}
                    value={form.description}
                    maxLength={DESCRIPTION_MAX}
                    placeholder="Who is this template for?"
                    onChange={(event) => update("description", event.target.value)}
                    className={`resize-none py-1.5 ${inputClass}`}
                  />
                  <p className="text-right text-ed-2xs text-ed-faint">
                    {form.description.length}/{DESCRIPTION_MAX}
                  </p>
                </div>
              </fieldset>

              {error && (
                <p role="alert" className="rounded-ed border border-ed-danger/30 bg-ed-danger-soft px-2.5 py-2 text-ed-xs text-ed-danger">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                {!live && (
                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={() => void save("draft")}
                    className={`${buttonClass} border border-ed-border bg-ed-panel text-ed-text hover:bg-ed-hover`}
                  >
                    <Save className="size-3.5" aria-hidden />
                    {saving === "draft" ? "Saving…" : "Save draft"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => void save("publish")}
                  className={`${buttonClass} bg-ed-accent text-white hover:bg-ed-accent-hover`}
                >
                  <BookUp className="size-3.5" aria-hidden />
                  {saving === "publish" ? "Publishing…" : live ? "Update live template" : "Publish to gallery"}
                </button>
              </div>
              {live && (
                <p className="text-ed-2xs text-ed-faint">
                  To take it out of the gallery, use Unpublish on the{" "}
                  <Link to="/admin/templates" className="text-ed-accent hover:underline">
                    Templates
                  </Link>{" "}
                  page.
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </>
  );
}
