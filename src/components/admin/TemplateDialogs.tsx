import { useEffect, useId, useState } from "react";
import { Spinner } from "@heroui/react";
import { LayoutTemplate, Pencil } from "lucide-react";
import type { TemplateCategory } from "../../api/admin-template-categories.ts";
import { adminTemplatesApi, type AdminTemplate, type StudioStartFrom, type TemplateDetails } from "../../api/admin-templates.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { websitesApi, type WebsiteSummary } from "../../api/websites.ts";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import CommonModal from "../ui/AppModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../ui/SelectInput.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";
import TextInput from "../ui/TextInput.tsx";
import TemplatePicker from "./TemplatePicker.tsx";

type StartFrom = StudioStartFrom["startFrom"];

const START_OPTIONS: { value: StartFrom; label: string; hint: string }[] = [
  { value: "blank", label: "Blank", hint: "One empty home page." },
  { value: "template", label: "A template", hint: "Copy a live template." },
  { value: "website", label: "A client's website", hint: "Copy its pages and images." },
];

const NAME_MAX = 120;

/** Suggested working name for a copy, e.g. "Bakery · Coral copy". */
const copyName = (name: string) => `${name} copy`.slice(0, NAME_MAX);

function categoryOptions(categories: TemplateCategory[]): SelectOption<string>[] {
  return [{ value: "", label: "Choose a category" }, ...categories.map((category) => ({ value: category.id, label: category.name }))];
}

const nameProblem = (name: string) => (name.trim().length < 2 ? "Use at least 2 characters" : undefined);

/**
 * Creates a Template Studio website and hands its id back so the caller can open the editor.
 * `initialTemplate` preselects "A template" with that live template, e.g. from a card's menu.
 */
export function NewTemplateDialog({
  initialTemplate,
  onClose,
  onCreated,
}: {
  initialTemplate?: Pick<AdminTemplate, "key" | "name">;
  onClose: () => void;
  onCreated: (websiteId: string) => void;
}) {
  const radioName = useId();
  const [name, setName] = useState(initialTemplate ? copyName(initialTemplate.name) : "");
  // Picking a template suggests a name until the admin types their own.
  const [nameEdited, setNameEdited] = useState(false);
  const [startFrom, setStartFrom] = useState<StartFrom>(initialTemplate ? "template" : "blank");
  const [templateKey, setTemplateKey] = useState(initialTemplate?.key ?? "");
  const [templates, setTemplates] = useState<AdminTemplate[] | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [websites, setWebsites] = useState<WebsiteSummary[] | null>(null);
  const [websiteId, setWebsiteId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startFrom !== "template" || templates) return;
    let cancelled = false;
    adminTemplatesApi
      .list({ status: "live" })
      .then((list) => !cancelled && setTemplates(list))
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [startFrom, templates]);

  useEffect(() => {
    if (startFrom !== "website") return;
    let cancelled = false;
    setWebsites(null);
    websitesApi
      .list({ search: debouncedSearch, pageSize: 20 })
      .then((result) => !cancelled && setWebsites(result.items))
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [startFrom, debouncedSearch]);

  const source: StudioStartFrom | null =
    startFrom === "blank"
      ? { startFrom }
      : startFrom === "template"
        ? templateKey
          ? { startFrom, templateKey }
          : null
        : websiteId
          ? { startFrom, websiteId }
          : null;
  const canSubmit = !nameProblem(name) && source !== null && !submitting;

  function pickTemplate(template: AdminTemplate) {
    setTemplateKey(template.key);
    if (!nameEdited) setName(copyName(template.name));
  }

  async function submit() {
    if (!canSubmit || !source) return;
    setSubmitting(true);
    setError(null);
    try {
      onCreated(await adminTemplatesApi.createStudioWebsite({ name: name.trim(), ...source }));
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      title="New template"
      subtitle="Design it in the editor, then save it to the gallery."
      icon={<LayoutTemplate className="size-5" />}
      iconTone="brand"
      size={startFrom === "template" ? "lg" : "md"}
      primaryAction={{ label: "Open in editor", onPress: () => void submit(), isPending: submitting, isDisabled: !canSubmit }}
      secondaryAction={{ label: "Cancel", onPress: onClose }}
    >
      <div className="flex flex-col gap-4">
        {error && <FormAlert status="danger">{error}</FormAlert>}
        <TextInput
          label="Working name"
          name="templateName"
          value={name}
          onChange={(value) => {
            setName(value);
            setNameEdited(true);
          }}
          placeholder="e.g. Dental clinic modern"
          description="You can change it when you save the template."
          error={name ? nameProblem(name) : undefined}
          autoFocus={!initialTemplate}
        />

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Start from</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {START_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-brand/40 ${
                  startFrom === option.value ? "border-brand bg-brand-soft/40" : "border-line hover:bg-canvas"
                }`}
              >
                <input
                  type="radio"
                  name={radioName}
                  value={option.value}
                  checked={startFrom === option.value}
                  onChange={() => setStartFrom(option.value)}
                  className="mt-1 accent-(--color-brand)"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{option.label}</span>
                  <span className="block text-xs text-ink-muted">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {startFrom === "template" && <TemplatePicker templates={templates} value={templateKey} onChange={pickTemplate} />}

        {startFrom === "website" && (
          <div className="flex flex-col gap-2">
            <TextInput label="Find a website" name="websiteSearch" value={search} onChange={setSearch} placeholder="Website, address or client name" />
            <div role="radiogroup" aria-label="Client website" className="max-h-56 overflow-y-auto rounded-lg border border-line">
              {!websites ? (
                <div className="grid place-items-center py-6">
                  <Spinner size="sm" aria-label="Loading websites" />
                </div>
              ) : websites.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-ink-muted">No websites match.</p>
              ) : (
                websites.map((website) => (
                  <label
                    key={website.id}
                    className={`flex cursor-pointer items-center gap-3 border-b border-line px-3 py-2 last:border-b-0 ${
                      websiteId === website.id ? "bg-brand-soft/40" : "hover:bg-canvas"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${radioName}-website`}
                      checked={websiteId === website.id}
                      onChange={() => setWebsiteId(website.id)}
                      className="accent-(--color-brand)"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{website.name}</span>
                      <span className="block truncate text-xs text-ink-muted">
                        {website.clientName} · {website.pageCount} {website.pageCount === 1 ? "page" : "pages"}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-ink-muted">
              Remove the client's business name, contact details, photos and testimonials before saving it as a template.
            </p>
          </div>
        )}
      </div>
    </CommonModal>
  );
}

/** Name, category, description and visibility. Built-in templates only allow visibility. */
export function TemplateDetailsDialog({
  template,
  categories,
  onClose,
  onSaved,
}: {
  template: AdminTemplate;
  categories: TemplateCategory[];
  onClose: () => void;
  onSaved: (template: AdminTemplate) => void;
}) {
  const builtIn = template.origin === "BUILT_IN";
  const [name, setName] = useState(template.name);
  const [categoryId, setCategoryId] = useState(template.categoryId ?? "");
  const [description, setDescription] = useState(template.description ?? "");
  const [isActive, setIsActive] = useState(template.status === "LIVE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const canSubmit = (builtIn || (!nameProblem(name) && categoryId !== "")) && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const details: Partial<TemplateDetails> = builtIn
        ? { isActive }
        : { name: name.trim(), categoryId, description: description.trim(), isActive };
      onSaved(await adminTemplatesApi.updateDetails(template.id, details));
    } catch (err) {
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors());
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      title="Template details"
      subtitle={template.key}
      icon={<Pencil className="size-5" />}
      iconTone="brand"
      size="md"
      primaryAction={{ label: "Save", onPress: () => void submit(), isPending: submitting, isDisabled: !canSubmit }}
      secondaryAction={{ label: "Cancel", onPress: onClose }}
    >
      <div className="flex flex-col gap-4">
        {error && <FormAlert status="danger">{error}</FormAlert>}
        <p className="text-sm text-ink-body">
          Changes apply to new websites only. Websites already created from this template keep their own copy.
        </p>
        {builtIn ? (
          <p className="rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-ink-muted">
            Built-in templates are defined in code, so only their visibility can be changed here.
          </p>
        ) : (
          <>
            <TextInput
              label="Template name"
              name="templateName"
              value={name}
              onChange={setName}
              error={fieldErrors.name ?? (name ? nameProblem(name) : undefined)}
              isRequired
            />
            <SelectInput
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions(categories)}
              error={fieldErrors.categoryId}
              isRequired
            />
            <TextAreaInput
              label="Description (optional)"
              name="templateDescription"
              value={description}
              onChange={setDescription}
              rows={3}
              error={fieldErrors.description}
            />
          </>
        )}
        <label className="flex items-start gap-3 text-sm text-ink">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="mt-1 accent-(--color-brand)" />
          <span>
            Show in the gallery
            <span className="block text-xs text-ink-muted">Hidden templates can't be picked for new websites.</span>
          </span>
        </label>
      </div>
    </CommonModal>
  );
}
