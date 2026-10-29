import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button, Spinner } from "@heroui/react";
import {
  ArrowLeft,
  Check,
  LayoutTemplate,
  MousePointerClick,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { adminClientsApi, type Client } from "../../api/admin-clients.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import {
  websitesApi,
  type CreateWebsiteInput,
  type ThemeOption,
  type WebsiteTemplate,
} from "../../api/websites.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { validateEmail } from "../../auth/validation.ts";
import { AiSparklesIcon } from "../../components/icons/AiSparklesIcon.tsx";
import AiBriefStep, {
  EMPTY_AI_BRIEF,
  validateAiBrief,
  type AiBrief,
  type AiBriefErrors,
} from "../../components/websites/AiBriefStep.tsx";
import CommonModal from "../../components/ui/CommonModal.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput, {
  type SelectOption,
} from "../../components/ui/SelectInput.tsx";
import TextAreaInput from "../../components/ui/TextAreaInput.tsx";
import TextInput from "../../components/ui/TextInput.tsx";
import TemplateThumbnail from "../../components/websites/TemplateThumbnail.tsx";
import { getTemplateKey } from "../../site-kit/templates/index.ts";

type Step = 1 | 2 | 3 | 4;

type InfoForm = {
  name: string;
  businessName: string;
  websiteType: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  description: string;
};

type InfoErrors = Partial<Record<keyof InfoForm | "clientId", string>>;

export type CreatedState = { created?: boolean };

type BuilderMode = "MANUAL" | "AI";

const STEPS: Record<BuilderMode, { step: Step; label: string }[]> = {
  MANUAL: [
    { step: 1, label: "Builder type" },
    { step: 2, label: "Website info" },
    { step: 3, label: "Theme selection" },
    { step: 4, label: "Template selection" },
  ],
  AI: [
    { step: 1, label: "Builder type" },
    { step: 2, label: "Website info" },
    { step: 3, label: "Describe it" },
    { step: 4, label: "AI builds it" },
  ],
};

const WEBSITE_TYPES: SelectOption<string>[] = [
  { value: "", label: "Select a type" },
  { value: "Business / Services", label: "Business / Services" },
  { value: "Agency", label: "Agency" },
  { value: "Portfolio", label: "Portfolio" },
  { value: "Restaurant / Café", label: "Restaurant / Café" },
  { value: "Retail / Shop", label: "Retail / Shop" },
  { value: "Personal", label: "Personal" },
  { value: "Other", label: "Other" },
];

const PHONE_PATTERN = /^\+?[0-9 ()-]{7,20}$/;
const INFO_FIELDS = new Set<string>([
  "name",
  "businessName",
  "websiteType",
  "industry",
  "contactEmail",
  "contactPhone",
  "address",
  "description",
  "clientId",
]);

/** Mirrors the backend length limits for the optional text fields. */
const MAX_LENGTHS = {
  businessName: 160,
  industry: 80,
  contactEmail: 255,
  description: 2000,
} as const;

function tooLong(
  value: string,
  max: number,
  label: string,
): string | undefined {
  return value.trim().length > max
    ? `${label} must be at most ${max} characters`
    : undefined;
}

function validateInfo(
  form: InfoForm,
  needsClient: boolean,
  clientId: string,
): InfoErrors {
  const name = form.name.trim();
  const contactEmail = form.contactEmail.trim();
  const contactPhone = form.contactPhone.trim();

  return {
    clientId:
      needsClient && !clientId
        ? "Choose the client this website is for"
        : undefined,
    name: !name
      ? "Website name is required"
      : name.length < 2
        ? "Website name must be at least 2 characters"
        : tooLong(name, 120, "Website name"),
    businessName: tooLong(
      form.businessName,
      MAX_LENGTHS.businessName,
      "Business name",
    ),
    industry: tooLong(form.industry, MAX_LENGTHS.industry, "Industry"),
    contactEmail: contactEmail
      ? (validateEmail(contactEmail) ??
        tooLong(contactEmail, MAX_LENGTHS.contactEmail, "Contact email"))
      : undefined,
    contactPhone:
      contactPhone && !PHONE_PATTERN.test(contactPhone)
        ? "Enter a valid phone number"
        : undefined,
    description: tooLong(
      form.description,
      MAX_LENGTHS.description,
      "Business description",
    ),
  };
}

function optional(value: string): string | undefined {
  return value.trim() || undefined;
}

export default function CreateWebsitePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = user?.role === "SUPER_ADMIN";
  const backTo = isAdmin ? "/admin/websites" : "/websites";

  const rawRequested = searchParams.get("templateKey") ?? "";
  const requestedThemeParam = searchParams.get("themeId") ?? "";
  const [requestedTemplateKey] = useState(
    () => getTemplateKey(rawRequested) ?? rawRequested,
  );
  const [step, setStep] = useState<Step>(() =>
    searchParams.get("templateKey") ? 2 : 1,
  );
  const [mode, setMode] = useState<BuilderMode>(
    searchParams.get("builder") === "ai" ? "AI" : "MANUAL",
  );
  const [aiBrief, setAiBrief] = useState<AiBrief>(EMPTY_AI_BRIEF);
  const [aiErrors, setAiErrors] = useState<AiBriefErrors>({});
  const [form, setForm] = useState<InfoForm>({
    name: "",
    businessName: user?.client?.businessName ?? "",
    websiteType: "",
    industry: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    description: "",
  });
  const [errors, setErrors] = useState<InfoErrors>({});
  const [clientId, setClientId] = useState(searchParams.get("clientId") ?? "");
  const [clients, setClients] = useState<Client[] | null>(null);

  const [templates, setTemplates] = useState<WebsiteTemplate[] | null>(null);
  const [themes, setThemes] = useState<ThemeOption[] | null>(null);
  const [category, setCategory] = useState("All");
  /** Empty = start blank. */
  const [templateKey, setTemplateKey] = useState(requestedTemplateKey);
  const [themeId, setThemeId] = useState(requestedThemeParam);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<WebsiteTemplate | null>(null);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [deleteTemplateError, setDeleteTemplateError] = useState<string | null>(
    null,
  );

  // A Super Admin sees the selected client's own templates next to the platform ones.
  const templateOwner = isAdmin ? clientId || undefined : undefined;
  useEffect(() => {
    let cancelled = false;
    websitesApi
      .templates(templateOwner)
      .then((loaded) => {
        if (cancelled) return;
        setTemplates(loaded);
        const requested = loaded.find(
          (template) =>
            template.key === requestedTemplateKey ||
            (rawRequested && template.key === getTemplateKey(rawRequested)),
        );
        const resolvedKey =
          requested?.key ??
          (loaded.some((candidate) => candidate.key === templateKey)
            ? templateKey
            : "");
        setTemplateKey(resolvedKey);
        if (requestedThemeParam) {
          setThemeId(requestedThemeParam);
        } else if (requested?.themeId && !requested.isCustom) {
          setThemeId((current) => current || requested.themeId || "");
        }
        if (requested?.name) {
          setForm((prev) => ({
            ...prev,
            name: prev.name || requested.name,
            websiteType: prev.websiteType || requested.category || "",
          }));
        }
      })
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [templateOwner, requestedTemplateKey, rawRequested]);

  useEffect(() => {
    let cancelled = false;
    websitesApi
      .themes()
      .then((loaded) => {
        if (cancelled) return;
        setThemes(loaded);
        setThemeId((current) => current || loaded[0]?.id || "");
      })
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    if (isAdmin) {
      adminClientsApi
        .list({ pageSize: 100 })
        .then((result) => !cancelled && setClients(result.items))
        .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    }
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const selectedClient = clients?.find((client) => client.id === clientId);
  const clientLabel = isAdmin
    ? (selectedClient?.businessName ?? "Not selected")
    : (user?.client?.businessName ?? "");

  const myTemplates = (templates ?? []).filter((template) => template.isCustom);
  const selectedTemplate = templates?.find(
    (template) => template.key === templateKey,
  );
  const selectedTheme = themes?.find((theme) => theme.id === themeId);
  const platformTemplates = useMemo(
    () => (templates ?? []).filter((template) => !template.isCustom),
    [templates],
  );
  const categories = useMemo(
    () => [
      "All",
      ...new Set(platformTemplates.map((template) => template.category)),
    ],
    [platformTemplates],
  );
  const visibleTemplates = platformTemplates.filter(
    (template) => category === "All" || template.category === category,
  );

  function openTemplateDelete(template: WebsiteTemplate) {
    setDeleteTemplateError(null);
    setTemplateToDelete(template);
  }

  function closeTemplateDelete() {
    if (isDeletingTemplate) return;
    setTemplateToDelete(null);
    setDeleteTemplateError(null);
  }

  async function handleTemplateDeleteConfirm() {
    if (!templateToDelete) return;
    const template = templateToDelete;
    setIsDeletingTemplate(true);
    setDeleteTemplateError(null);
    try {
      await websitesApi.deleteTemplate(template.id);
      setTemplates(
        (current) =>
          current?.filter((candidate) => candidate.id !== template.id) ?? null,
      );
      if (templateKey === template.key) setTemplateKey("");
      setTemplateToDelete(null);
    } catch (err) {
      setDeleteTemplateError(errorMessage(err));
    } finally {
      setIsDeletingTemplate(false);
    }
  }

  const clientOptions: SelectOption<string>[] = [
    { value: "", label: clients ? "Select a client" : "Loading clients…" },
    ...(clients ?? []).map((client) => {
      const login = client.owner?.username
        ? `@${client.owner.username}`
        : client.owner?.email;
      return {
        value: client.id,
        label: login
          ? `${client.businessName} (${login})`
          : client.businessName,
      };
    }),
  ];

  function update<K extends keyof InfoForm>(key: K) {
    return (value: InfoForm[K]) =>
      setForm((current) => ({ ...current, [key]: value }));
  }

  function continueFromInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateInfo(form, isAdmin, clientId);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setStep(3);
  }

  function chooseTemplate(template: WebsiteTemplate | null) {
    setTemplateKey(template?.key ?? "");
    if (template?.isCustom) setThemeId("");
    else if (!themeId) setThemeId(template?.themeId ?? themes?.[0]?.id ?? "");
  }

  function infoInput(): CreateWebsiteInput {
    return {
      ...(isAdmin ? { clientId } : {}),
      name: form.name.trim(),
      businessName: optional(form.businessName),
      websiteType: optional(form.websiteType),
      industry: optional(form.industry),
      description: optional(form.description),
      contactEmail: optional(form.contactEmail),
      contactPhone: optional(form.contactPhone),
      address: optional(form.address),
    };
  }

  async function createDraft() {
    await submit(() =>
      websitesApi.create({
        ...infoInput(),
        ...(templateKey ? { templateKey } : {}),
        ...(themeId ? { themeId } : {}),
      }),
    );
  }

  async function generateWithAi() {
    const nextErrors = validateAiBrief(aiBrief);
    setAiErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    await submit(() =>
      websitesApi.createWithAi({
        ...infoInput(),
        prompt: aiBrief.prompt.trim(),
        pages: ["Home", ...aiBrief.pages],
        ...(aiBrief.tone ? { tone: aiBrief.tone } : {}),
        ...(aiBrief.themeId ? { themeId: aiBrief.themeId } : {}),
        ...(aiBrief.images.length > 0
          ? { mediaIds: aiBrief.images.map((image) => image.id) }
          : {}),
        ...(aiBrief.logo ? { logoMediaId: aiBrief.logo.id } : {}),
      }),
    );
  }

  async function submit(create: () => Promise<{ id: string }>) {
    setCreating(true);
    setSubmitError(null);
    try {
      const website = await create();
      navigate(`/websites/${website.id}/edit`, {
        replace: true,
        state: { created: true } satisfies CreatedState,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors: InfoErrors =
          err.code === "CLIENT_REQUIRED" || err.code === "CLIENT_NOT_FOUND"
            ? { clientId: err.message }
            : err.fieldErrors();
        if (Object.keys(fieldErrors).some((field) => INFO_FIELDS.has(field))) {
          setErrors(fieldErrors);
          setStep(2);
        }
        const briefErrors = err.fieldErrors();
        if (briefErrors.prompt || briefErrors.pages)
          setAiErrors({ prompt: briefErrors.prompt, pages: briefErrors.pages });
      }
      setSubmitError(errorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-6 py-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />{" "}
          {isAdmin ? "All websites" : "My websites"}
        </Link>
        <h1 className="text-sm font-semibold text-ink">Create a new website</h1>
        <p className="text-sm text-ink-body">
          Client: <span className="font-medium text-ink">{clientLabel}</span>
        </p>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <ol
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          aria-label="Steps"
        >
          {STEPS[mode].map(({ step: number, label }) => {
            const done = number < step;
            const current = number === step;
            return (
              <li
                key={number}
                aria-current={current ? "step" : undefined}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  current
                    ? "border-brand bg-brand-soft font-medium text-brand"
                    : "border-line bg-surface text-ink-body"
                }`}
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full text-ed-2xs font-semibold ${
                    done
                      ? "bg-brand text-white"
                      : current
                        ? "bg-brand text-white"
                        : "bg-canvas text-ink-muted"
                  }`}
                >
                  {done ? <Check className="size-3" aria-hidden /> : number}
                </span>
                {label}
              </li>
            );
          })}
        </ol>

        {loadError && (
          <div className="mt-6">
            <FormAlert status="danger">{loadError}</FormAlert>
          </div>
        )}

        {step === 1 && (
          <section className="mt-6 rounded-xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">
              How do you want to build it?
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={mode === "MANUAL"}
                onClick={() => setMode("MANUAL")}
                className={`rounded-lg border-2 p-5 text-left transition-colors ${
                  mode === "MANUAL"
                    ? "border-brand bg-brand-soft/40"
                    : "border-line hover:border-line-strong"
                }`}
              >
                <span className="flex items-center justify-between">
                  <MousePointerClick
                    className="size-5 text-brand"
                    aria-hidden
                  />
                  {mode === "MANUAL" && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-ed-2xs font-medium text-white">
                      Selected
                    </span>
                  )}
                </span>
                <span className="mt-3 block font-medium text-ink">
                  Manual Website Builder
                </span>
                <span className="mt-1 block text-sm text-ink-body">
                  Build your own pages from ready-made sections, or start from a
                  template. Change anything later.
                </span>
              </button>
              <button
                type="button"
                aria-pressed={mode === "AI"}
                onClick={() => setMode("AI")}
                className={`rounded-lg border-2 p-5 text-left transition-colors ${
                  mode === "AI"
                    ? "border-brand bg-brand-soft/40"
                    : "border-line hover:border-line-strong"
                }`}
              >
                <span className="flex items-center justify-between">
                  <AiSparklesIcon
                    className="size-6"
                    variant="glossy"
                    glow
                    aria-hidden
                  />
                  {mode === "AI" && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-ed-2xs font-medium text-white">
                      Selected
                    </span>
                  )}
                </span>
                <span className="mt-3 block font-medium text-ink">
                  AI Website Builder
                </span>
                <span className="mt-1 block text-sm text-ink-body">
                  Describe your website in a prompt. AI creates an editable
                  draft you can change any time.
                </span>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onPress={() => setStep(2)}>Continue: website info</Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <form
            onSubmit={continueFromInfo}
            noValidate
            className="mt-6 rounded-xl border border-line bg-surface p-6"
          >
            <h2 className="text-lg font-semibold text-ink">
              Website information
            </h2>
            <p className="mt-1 text-sm text-ink-body">
              You can change all of this later in website settings.
            </p>

            {isAdmin && (
              <div className="mt-5 max-w-sm">
                <SelectInput
                  label="Client"
                  value={clientId}
                  onChange={setClientId}
                  options={clientOptions}
                  error={errors.clientId}
                  isRequired
                />
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <TextInput
                label="Website name"
                name="name"
                value={form.name}
                onChange={update("name")}
                error={errors.name}
                placeholder="e.g. Main website"
                autoFocus
                isRequired
              />
              <TextInput
                label="Business name (optional)"
                name="businessName"
                value={form.businessName}
                onChange={update("businessName")}
                error={errors.businessName}
                description="Shown in the header and footer."
              />
              <SelectInput
                label="Website type (optional)"
                value={form.websiteType}
                onChange={update("websiteType")}
                options={WEBSITE_TYPES}
              />
              <TextInput
                label="Industry (optional)"
                name="industry"
                value={form.industry}
                onChange={update("industry")}
                error={errors.industry}
              />
              <TextInput
                label="Contact email (optional)"
                name="contactEmail"
                type="email"
                placeholder="hello@business.com"
                value={form.contactEmail}
                onChange={update("contactEmail")}
                error={errors.contactEmail}
                description="Contact form messages are sent here."
              />
              <TextInput
                label="Contact phone (optional)"
                name="contactPhone"
                type="tel"
                placeholder="+91"
                value={form.contactPhone}
                onChange={update("contactPhone")}
                error={errors.contactPhone}
              />
              <div className="sm:col-span-3">
                <TextInput
                  label="Preferred address (optional)"
                  name="address"
                  value={form.address}
                  onChange={update("address")}
                  placeholder="Street, Area, City, State, PIN"
                  description="Enter the full address in comma-separated form (e.g. 12 MG Road, Indiranagar, Bengaluru, Karnataka, 560038). Shown on your site contact details."
                />
              </div>
              <div className="sm:col-span-3">
                <TextAreaInput
                  label="Business description (optional)"
                  name="description"
                  value={form.description}
                  onChange={update("description")}
                  error={errors.description}
                  description={`${form.description.trim().length}/${MAX_LENGTHS.description} characters`}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <Button variant="outline" onPress={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit">
                {mode === "AI"
                  ? "Continue: describe your website"
                  : "Continue: theme selection"}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && mode === "AI" && (
          <section className="mt-6 rounded-xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">
              Describe your website
            </h2>
            <p className="mt-1 text-sm text-ink-body">
              The AI writes every page from this brief and your website info.
              You get a normal draft to edit before anything goes live.
            </p>

            {submitError && (
              <div className="mt-5">
                <FormAlert status="danger">{submitError}</FormAlert>
              </div>
            )}

            <div className="mt-5">
              <AiBriefStep
                brief={aiBrief}
                onChange={(next) => {
                  setAiBrief(next);
                  setAiErrors({});
                }}
                errors={aiErrors}
                themes={themes}
                mediaClientId={isAdmin ? clientId : (user?.client?.id ?? "")}
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <Button
                variant="outline"
                onPress={() => setStep(2)}
                isDisabled={creating}
              >
                Back
              </Button>
              <Button onPress={generateWithAi} isPending={creating}>
                <AiSparklesIcon
                  className="size-4"
                  variant="current"
                  aria-hidden
                />{" "}
                Generate website
              </Button>
            </div>
          </section>
        )}

        {step === 3 && mode === "MANUAL" && (
          <section className="mt-6 rounded-xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">Theme selection</h2>
            <p className="mt-1 text-sm text-ink-body">
              Select your preferred theme. Colours and fonts for every section
              can be fine-tuned later in the editor.
            </p>

            {submitError && (
              <div className="mt-5">
                <FormAlert status="danger">{submitError}</FormAlert>
              </div>
            )}

            {!themes && !loadError && (
              <div className="grid place-items-center py-16">
                <Spinner aria-label="Loading themes" />
              </div>
            )}

            <div className="mt-6">
              <div
                role="radiogroup"
                aria-label="Colour style"
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
              >
                {selectedTemplate?.isCustom && (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={themeId === ""}
                    onClick={() => setThemeId("")}
                    className={`rounded-lg border-2 p-3 text-left transition-colors ${
                      themeId === ""
                        ? "border-brand bg-brand-soft/20"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <span className="grid h-14 place-items-center rounded-md border border-dashed border-line-strong text-xs text-ink-body">
                      Saved with the template
                    </span>
                    <span className="mt-2 block text-sm font-medium text-ink">
                      Template’s own colours
                    </span>
                  </button>
                )}
                {(themes ?? []).map((theme) => {
                  const selected = theme.id === themeId;
                  const { colors } = theme.settings;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setThemeId(theme.id)}
                      className={`rounded-lg border-2 p-3 text-left transition-colors ${
                        selected
                          ? "border-brand bg-brand-soft/20 ring-1 ring-brand"
                          : "border-line hover:border-line-strong"
                      }`}
                    >
                      <span
                        className="flex h-14 items-end gap-1.5 rounded-md border border-black/5 p-2"
                        style={{ background: colors.background }}
                        aria-hidden
                      >
                        <span
                          className="h-6 w-10 rounded"
                          style={{ background: colors.primary }}
                        />
                        <span
                          className="h-4 w-6 rounded"
                          style={{ background: colors.secondary }}
                        />
                        <span
                          className="h-3 flex-1 rounded"
                          style={{ background: colors.surface }}
                        />
                      </span>
                      <span className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-ink">
                          {theme.name}
                        </span>
                        {selected && (
                          <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Selected
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <Button variant="outline" onPress={() => setStep(2)}>
                Back
              </Button>
              <div className="flex items-center gap-3">
                {selectedTheme && (
                  <span className="text-sm text-ink-body">
                    Selected theme:{" "}
                    <strong className="font-medium text-ink">
                      {selectedTheme.name}
                    </strong>
                  </span>
                )}
                <Button
                  onPress={() => setStep(4)}
                  isDisabled={!themeId && !selectedTemplate?.isCustom}
                >
                  Continue: template selection
                </Button>
              </div>
            </div>
          </section>
        )}

        {step === 4 && mode === "MANUAL" && (
          <section className="mt-6 rounded-xl border border-line bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Template selection
                </h2>
                <p className="mt-1 text-sm text-ink-body">
                  Build your own design from our ready-made sections, or start from
                  a template and change it.
                </p>
              </div>
              {selectedTheme && (
                <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs">
                  <span className="text-ink-body">Applied theme:</span>
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    <span
                      className="size-3 rounded-full border border-black/10 inline-block"
                      style={{ background: selectedTheme.settings.colors.primary }}
                    />
                    {selectedTheme.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="ml-1 text-brand hover:underline font-medium"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {submitError && (
              <div className="mt-5">
                <FormAlert status="danger">{submitError}</FormAlert>
              </div>
            )}

            <div
              role="button"
              tabIndex={0}
              onClick={() => chooseTemplate(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  chooseTemplate(null);
                }
              }}
              className={`mt-5 flex w-full items-center gap-4 rounded-lg border-2 p-5 transition-colors cursor-pointer ${
                templateKey === ""
                  ? "border-brand bg-brand-soft/20"
                  : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-dashed border-line-strong bg-canvas">
                <LayoutTemplate className="size-5 text-brand" aria-hidden />
              </span>
              <div className="flex-1 min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                  Start blank and build my own design
                  <span className="rounded-full bg-canvas px-2 py-0.5 text-ed-2xs font-medium text-ink-body">
                    Recommended
                  </span>
                  {templateKey === "" && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-ed-2xs font-medium text-white">
                      Selected
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-ink-body">
                  You get an empty home page. Add sections like hero, services,
                  gallery and contact from the component library, then edit the
                  text, images and layout.
                </p>
              </div>
              {templateKey !== "" && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => chooseTemplate(null)}
                >
                  Use blank
                </Button>
              )}
            </div>

            {myTemplates.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-ink">My templates</h3>
                <p className="mt-0.5 text-sm text-ink-body">
                  Designs saved from your websites.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {myTemplates.map((template) => {
                    const selected = template.key === templateKey;
                    return (
                      <div
                        key={template.id}
                        className={`relative flex items-start gap-2 rounded-lg border-2 p-4 transition-colors ${
                          selected
                            ? "border-brand bg-brand-soft/40"
                            : "border-line hover:border-line-strong"
                        }`}
                      >
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => chooseTemplate(template)}
                          className="min-w-0 flex-1 text-left after:absolute after:inset-0"
                        >
                          <span className="flex items-center gap-2 font-medium text-ink">
                            {template.name}
                            {selected && (
                              <span className="rounded-full bg-brand px-2 py-0.5 text-ed-2xs font-medium text-white">
                                Selected
                              </span>
                            )}
                          </span>
                          {template.description && (
                            <span className="mt-1 block text-sm text-ink-body">
                              {template.description}
                            </span>
                          )}
                          <span className="mt-2 block text-xs text-ink-muted">
                            Pages:{" "}
                            {template.pages.map((page) => page.name).join(", ")}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openTemplateDelete(template)}
                          aria-label={`Delete template ${template.name}`}
                          title="Delete template"
                          className="relative z-10 grid size-8 shrink-0 place-items-center rounded text-ink-muted hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Or start from a template (optional)
                </h3>
                <p className="mt-0.5 text-sm text-ink-body">
                  Pre-filled pages you can fully change, reorder or delete.
                </p>
              </div>
              <div
                role="group"
                aria-label="Template category"
                className="flex flex-wrap gap-1"
              >
                {categories.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={category === name}
                    onClick={() => setCategory(name)}
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      category === name
                        ? "bg-ink text-white"
                        : "bg-canvas text-ink-body hover:text-ink"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {!templates && !loadError && (
              <div className="grid place-items-center py-16">
                <Spinner aria-label="Loading templates" />
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTemplates.map((template) => {
                const selected = template.key === templateKey;
                return (
                  <div
                    key={template.key}
                    onClick={() => chooseTemplate(template)}
                    className={`group relative flex flex-col overflow-hidden rounded-lg border-2 text-left transition-colors cursor-pointer ${
                      selected
                        ? "border-brand bg-brand-soft/10"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <TemplateThumbnail
                      template={template}
                      theme={selectedTheme?.settings}
                      className="border-b border-line"
                    />
                    <span className="flex flex-1 flex-col p-4">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-medium text-ink">
                          {template.name}
                        </span>
                        {selected && (
                          <span className="rounded-full bg-brand px-2 py-0.5 text-ed-2xs font-medium text-white">
                            Selected
                          </span>
                        )}
                      </span>
                      {template.description && (
                        <span className="mt-1 text-sm text-ink-body">
                          {template.description}
                        </span>
                      )}
                      <span className="mt-2 text-xs text-ink-muted">
                        Pages:{" "}
                        {template.pages.map((page) => page.name).join(", ")}
                      </span>
                      <div className="mt-3 pt-2 border-t border-line flex items-center justify-between text-xs">
                        <span className="text-ink-body group-hover:text-ink font-medium">
                          Select Template
                        </span>
                        <Link
                          to={`/templates/${template.key}${themeId ? `?themeId=${encodeURIComponent(themeId)}` : ""}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="text-brand hover:underline font-medium"
                        >
                          Preview ↗
                        </Link>
                      </div>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <Button
                variant="outline"
                onPress={() => setStep(3)}
                isDisabled={creating}
              >
                Back
              </Button>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-ink-body">
                  <span>
                    {selectedTemplate
                      ? `Template: ${selectedTemplate.name}`
                      : "Blank website"}
                  </span>
                  {selectedTheme && (
                    <>
                      <span
                        className="hidden sm:inline text-ink-muted"
                        aria-hidden
                      >
                        •
                      </span>
                      <span>
                        Theme:{" "}
                        <strong className="font-medium text-ink">
                          {selectedTheme.name}
                        </strong>
                      </span>
                    </>
                  )}
                </div>
                <Button
                  onPress={createDraft}
                  isPending={creating}
                  isDisabled={!themes}
                >
                  Create and open editor
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>

      <CommonModal
        isOpen={Boolean(templateToDelete)}
        onClose={closeTemplateDelete}
        headerDetails={{
          icon: <Trash2 className="size-4.5" />,
          title: "Delete template",
          description: templateToDelete?.name,
        }}
        iconTone="danger"
        size="sm"
        primaryAction={{
          label: "Delete template",
          onPress: handleTemplateDeleteConfirm,
          isPending: isDeletingTemplate,
          tone: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onPress: closeTemplateDelete,
          isDisabled: isDeletingTemplate,
        }}
      >
        <div className="space-y-2.5">
          <p>
            Are you sure you want to delete{" "}
            <strong className="font-semibold text-ink">
              “{templateToDelete?.name}”
            </strong>
            ? It will be removed from My templates. Websites already created
            from it are not changed.
          </p>
          {deleteTemplateError && (
            <FormAlert status="danger">{deleteTemplateError}</FormAlert>
          )}
        </div>
      </CommonModal>
    </div>
  );
}
