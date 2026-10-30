import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Spinner } from "@heroui/react";
import {
  Check,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { ApiError, errorMessage } from "../../api/http.ts";
import {
  templatesApi,
  websitesApi,
  type ThemeOption,
  type WebsiteTemplate,
} from "../../api/websites.ts";
import { useAuth } from "../../auth/auth-context.ts";
import {
  questionnaireApi,
  type QuestionnaireAnswers,
  type SubmitQuestionnaireInput,
} from "./api.ts";
import FileUploads, { type Attachments } from "./FileUploads.tsx";
import TemplateChoice from "./TemplateChoice.tsx";
import ThemeChoice from "./ThemeChoice.tsx";
import {
  BUSINESS_TYPES,
  DOMAIN_OPTIONS,
  FEATURE_OPTIONS,
  LOGO_OPTIONS,
  LOOK_OPTIONS,
  MAX_QUESTIONNAIRE_PAGES,
  NEEDED_OPTIONS,
  PALETTE_OPTIONS,
  PHOTOS_OPTIONS,
  STYLE_OPTIONS,
  TEXT_OPTIONS,
  WEBSITE_PAGES,
  type FeatureOption,
  type WebsitePage,
} from "./options.ts";
import {
  calculateProgress,
  clearSavedDraft,
  DEFAULT_ANSWERS,
  INITIAL_FORM_STATE,
  loadSavedAttachments,
  loadSavedDraft,
  saveAttachments,
  saveDraft,
} from "./prefill.ts";

const NO_ATTACHMENTS: Attachments = { logo: null, files: [] };

export type QuestionnaireFormProps = {
  onSuccess?: (submissionId?: string) => void;
  brandName?: string;
  prefillClient?: {
    businessName?: string | null;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  standalone?: boolean;
  theme?: "light" | "dark";
};

type FormErrors = Partial<
  Record<
    | "businessName"
    | "name"
    | "phone"
    | "email"
    | "businessType"
    | "pages"
    | "filesLink"
    | "consent",
    string
  >
>;

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: InstagramIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
  { id: "youtube", label: "YouTube", icon: YoutubeIcon },
  { id: "linkedin", label: "LinkedIn", icon: LinkedinIcon },
  { id: "x", label: "X (Twitter)", icon: XIcon },
  { id: "store", label: "Store / Google", icon: ShoppingBag },
] as const;

export default function QuestionnaireForm({
  onSuccess,
  brandName = "Bytezora",
  prefillClient,
  standalone = true,
  theme = "light",
}: QuestionnaireFormProps) {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [form, setForm] = useState<SubmitQuestionnaireInput>(() => {
    const draft = loadSavedDraft();
    const initial: SubmitQuestionnaireInput = {
      ...INITIAL_FORM_STATE,
      ...draft,
      answers: {
        ...DEFAULT_ANSWERS,
        ...draft?.answers,
        reach: {
          ...DEFAULT_ANSWERS.reach,
          ...draft?.answers?.reach,
        },
      },
    };
    return initial;
  });

  const [consent, setConsent] = useState(true);
  const [diffCall, setDiffCall] = useState(
    Boolean(form.answers.reach.call.differentContact),
  );
  const [diffWa, setDiffWa] = useState(
    Boolean(form.answers.reach.whatsapp.differentContact),
  );
  const [diffEmail, setDiffEmail] = useState(
    Boolean(form.answers.reach.enquiryForm.differentContact),
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailDispatched, setEmailDispatched] = useState(false);

  // Uploads go to the client's media library, so themes, templates and files need a client account.
  const clientId = user?.role === "CLIENT" ? (user.client?.id ?? null) : null;
  const [themes, setThemes] = useState<ThemeOption[] | null>(null);
  const [templates, setTemplates] = useState<WebsiteTemplate[] | null>(null);
  const [attachments, setAttachments] = useState<Attachments>(NO_ATTACHMENTS);
  const [uploading, setUploading] = useState(false);
  const attachmentsOwner = useRef<string | null>(null);

  // Field refs for scrolling to first error
  const businessNameRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Read ?ref= from URL
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam && !form.ref) {
      setForm((prev) => ({ ...prev, ref: refParam }));
    }
  }, [searchParams, form.ref]);

  // Fills empty contact fields from the signed-in account
  const prefill = useCallback(
    (prev: SubmitQuestionnaireInput): SubmitQuestionnaireInput => {
      const source =
        prefillClient ??
        (user
          ? {
              businessName: user.client?.businessName,
              name: user.fullName,
              phone: user.phone,
              email: user.email,
            }
          : null);
      if (!source) return prev;
      return {
        ...prev,
        businessName: prev.businessName || source.businessName || "",
        name: prev.name || source.name || "",
        phone: prev.phone || source.phone || "",
        email: prev.email || source.email || "",
      };
    },
    [prefillClient, user],
  );

  useEffect(() => {
    setForm(prefill);
  }, [prefill]);

  // Autosave draft to localStorage
  useEffect(() => {
    if (!submitted) {
      saveDraft(form);
    }
  }, [form, submitted]);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    websitesApi
      .themes()
      .then((loaded) => !cancelled && setThemes(loaded))
      .catch(() => !cancelled && setThemes([]));
    templatesApi
      .list()
      .then((loaded) => !cancelled && setTemplates(loaded))
      .catch(() => !cancelled && setTemplates([]));
    setAttachments(loadSavedAttachments(clientId) ?? NO_ATTACHMENTS);
    attachmentsOwner.current = clientId;
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (clientId && attachmentsOwner.current === clientId && !submitted) {
      saveAttachments({ clientId, ...attachments });
    }
  }, [clientId, attachments, submitted]);

  const progress = calculateProgress(form);
  const pageCount = new Set(["Home", ...form.answers.pages]).size;
  const pagesFull = pageCount >= MAX_QUESTIONNAIRE_PAGES;
  const selectedTheme =
    themes?.find((theme) => theme.id === form.answers.themeId) ?? null;
  const onBusyChange = useCallback((busy: boolean) => setUploading(busy), []);

  function updateField<K extends keyof SubmitQuestionnaireInput>(
    field: K,
    val: SubmitQuestionnaireInput[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function updateAnswer<K extends keyof QuestionnaireAnswers>(
    key: K,
    val: QuestionnaireAnswers[K],
  ) {
    setForm((prev) => ({
      ...prev,
      answers: { ...prev.answers, [key]: val },
    }));
  }

  function togglePage(page: WebsitePage) {
    if (page === "Home") return; // Home is locked
    setForm((prev) => {
      const current = prev.answers.pages;
      if (current.includes(page)) {
        return { ...prev, answers: { ...prev.answers, pages: current.filter((p) => p !== page) } };
      }
      if (new Set(["Home", ...current]).size >= MAX_QUESTIONNAIRE_PAGES) return prev;
      return { ...prev, answers: { ...prev.answers, pages: [...current, page] } };
    });
    if (errors.pages) setErrors((prev) => ({ ...prev, pages: undefined }));
  }

  function toggleFeature(feature: FeatureOption) {
    const current = form.answers.features;
    const exists = current.includes(feature);
    const next = exists
      ? current.filter((f) => f !== feature)
      : [...current, feature];
    updateAnswer("features", next);
  }

  function toggleSocial(platformId: string) {
    const current = form.answers.reach.socialLinks ?? [];
    const exists = current.includes(platformId);
    const next = exists
      ? current.filter((id) => id !== platformId)
      : [...current, platformId];
    updateAnswer("reach", {
      ...form.answers.reach,
      socialLinks: next,
    });
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.businessName.trim()) {
      nextErrors.businessName = "Business / website name is required";
    }
    if (!form.name.trim()) {
      nextErrors.name = "Your name is required";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = "Mobile number is required";
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      nextErrors.email = "A valid email address is required";
    }
    if (!form.answers.businessType) {
      nextErrors.businessType = "Please choose your business type";
    }
    if (!form.answers.pages || form.answers.pages.length === 0) {
      nextErrors.pages = "Please select at least one page";
    } else if (pageCount > MAX_QUESTIONNAIRE_PAGES) {
      nextErrors.pages = `Choose at most ${MAX_QUESTIONNAIRE_PAGES} pages, Home included`;
    }
    if (!consent) {
      nextErrors.consent = "Please agree to the terms to proceed";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.businessName && businessNameRef.current) {
        businessNameRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        businessNameRef.current.focus();
      } else if (nextErrors.name && nameRef.current) {
        nameRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        nameRef.current.focus();
      } else if (nextErrors.phone && phoneRef.current) {
        phoneRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneRef.current.focus();
      } else if (nextErrors.email && emailRef.current) {
        emailRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        emailRef.current.focus();
      }
      return false;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;
    if (uploading) {
      setSubmitError("Wait for your files to finish uploading.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await questionnaireApi.submit({
        ...form,
        answers: {
          ...form.answers,
          pages: form.answers.pages.includes("Home")
            ? form.answers.pages
            : ["Home", ...form.answers.pages],
          themeId: clientId ? (form.answers.themeId ?? null) : null,
          templateKey: clientId ? (form.answers.templateKey ?? null) : null,
          logoMediaId: clientId ? (attachments.logo?.id ?? null) : null,
          mediaIds: clientId ? attachments.files.map((file) => file.id) : [],
        },
      });
      clearSavedDraft();
      setEmailDispatched(res.emailDispatched);
      setSubmitted(true);
      if (onSuccess) {
        onSuccess(res.id);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const fieldErrors = err.fieldErrors();
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      setSubmitError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={`mx-auto max-w-2xl px-4 py-20 text-center ${theme === "dark" ? "text-white" : "text-ink"}`}>
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-500">
          <CheckCircle2 className="size-10" />
        </div>
        <h2 className={`mt-6 text-2xl font-bold tracking-tight sm:text-3xl ${theme === "dark" ? "text-white" : "text-ink"}`}>
          Questionnaire Submitted!
        </h2>
        <p className={`mt-3 text-base ${theme === "dark" ? "text-slate-300" : "text-ink-body"}`}>
          Thank you for sharing your website vision with{" "}
          <strong className={theme === "dark" ? "text-white" : "text-ink"}>{brandName}</strong>. Our team
          will review your brief and get back to you soon.
        </p>
        {emailDispatched && (
          <p className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-ink-muted"}`}>
            A confirmation email is on its way to{" "}
            <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-ink"}`}>{form.email}</span>.
          </p>
        )}
        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              setForm(prefill(INITIAL_FORM_STATE));
              setAttachments(NO_ATTACHMENTS);
              setDiffCall(false);
              setDiffWa(false);
              setDiffEmail(false);
              setConsent(true);
              setErrors({});
              setSubmitError(null);
              setEmailDispatched(false);
              setSubmitted(false);
            }}
            className="rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-lg hover:bg-brand-hover transition-colors"
          >
            Submit another brief
          </button>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  const cardCls = isDark
    ? "rounded-2xl border border-[#1e2638] bg-[#121824] p-5 shadow-xl sm:p-6"
    : "rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs";

  const cardTitleCls = isDark ? "text-base font-bold text-white" : "text-base font-bold text-ink";
  const sectionLabelCls = isDark
    ? "block text-[11px] font-bold uppercase tracking-wider text-slate-400"
    : "block text-[11px] font-bold uppercase tracking-wider text-ink-muted";

  const fieldLabelCls = isDark
    ? "block text-xs font-semibold text-slate-300"
    : "block text-xs font-semibold text-ink-body";

  const inputCls = (hasErr: boolean) =>
    `mt-1.5 h-11 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
      isDark
        ? `bg-[#0b0e17] text-white placeholder-slate-500 focus:border-blue-500 ${
            hasErr ? "border-red-500 ring-1 ring-red-500" : "border-[#212a3d]"
          }`
        : `bg-canvas text-ink placeholder-ink-muted focus:border-brand focus:ring-1 focus:ring-brand ${
            hasErr ? "border-red-500 ring-1 ring-red-500" : "border-line"
          }`
    }`;

  const pillCls = (selected: boolean) =>
    `rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
      selected
        ? "bg-brand border border-brand text-white shadow-xs font-semibold"
        : isDark
          ? "border border-[#222c40] bg-[#0c101a] text-slate-300 hover:border-slate-500 hover:text-white"
          : "border border-line bg-canvas text-ink-body hover:border-brand/40 hover:text-ink"
    }`;

  const boxCls = isDark
    ? "rounded-xl border border-[#20293d] bg-[#0b0e17] p-3.5"
    : "rounded-xl border border-line bg-canvas/70 p-3.5";

  const nestedInputCls = isDark
    ? "mt-2 w-full rounded-lg border border-[#2a3750] bg-[#121826] px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
    : "mt-2 w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink placeholder-ink-muted outline-none focus:border-brand";

  const toggleTrackCls = isDark ? "bg-[#1e273a]" : "bg-slate-300";

  return (
    <div className={isDark ? "min-h-screen bg-[#0d1117] text-slate-200" : "text-ink"}>
      {/* Single clean, professional header */}
      {standalone ? (
        <header
          className={`sticky top-0 z-40 border-b px-4 py-3 sm:px-8 ${
            isDark
              ? "border-[#1b2233] bg-[#0d1117]/95 backdrop-blur-md text-slate-200"
              : "border-line bg-surface/95 backdrop-blur-md text-ink shadow-xs"
          }`}
        >
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/"
                className="inline-flex items-center transition-opacity hover:opacity-85"
                aria-label="Home"
              >
                <img
                  src={
                    isDark
                      ? "/bytezora-webbuilder-logo-white-text.png"
                      : "/bytezora-webbuilder-logo.png"
                  }
                  alt="Bytezora WebBuilder"
                  className="h-7 w-auto object-contain sm:h-8"
                />
              </Link>
              <span
                className={`hidden sm:inline text-lg font-light ${
                  isDark ? "text-slate-700" : "text-line-strong"
                }`}
              >
                |
              </span>
              <div>
                <h1
                  className={`text-sm font-semibold sm:text-base ${
                    isDark ? "text-white" : "text-ink"
                  }`}
                >
                  Website Questionnaire
                </h1>
                <p
                  className={`hidden text-xs sm:block ${
                    isDark ? "text-slate-400" : "text-ink-muted"
                  }`}
                >
                  Design Brief &amp; Requirements · ~3 minutes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <div
                className={`hidden sm:flex items-center gap-1.5 text-xs font-medium ${
                  isDark ? "text-emerald-400/90" : "text-emerald-600"
                }`}
              >
                <Check className="size-3.5" />
                <span>Auto-saved</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    isDark ? "text-slate-300" : "text-ink-muted"
                  }`}
                >
                  {progress}%
                </span>
                <div
                  className={`h-2 w-24 overflow-hidden rounded-full sm:w-36 ${
                    isDark ? "bg-[#1b2334]" : "bg-slate-200"
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <Link
                to="/"
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isDark
                    ? "border-[#1b2334] bg-[#121722] text-slate-400 hover:border-slate-700 hover:text-white"
                    : "border-line bg-canvas text-ink-muted hover:border-line-strong hover:text-ink"
                }`}
                title="Save and exit to home"
              >
                <X className="size-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </Link>
            </div>
          </div>
        </header>
      ) : (
        <div className="mx-auto max-w-[1400px]">
          <div
            className={`flex items-center justify-between rounded-xl border p-4 ${
              isDark
                ? "border-[#1b2334] bg-[#111622]"
                : "border-line bg-surface shadow-xs"
            }`}
          >
            <div>
              <h1
                className={`text-base font-bold ${
                  isDark ? "text-white" : "text-ink"
                }`}
              >
                Website Questionnaire
              </h1>
              <p
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-ink-muted"
                }`}
              >
                Answer a few questions to generate your website brief
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-ink-muted"
                }`}
              >
                {progress}% complete
              </span>
              <div
                className={`h-2 w-28 overflow-hidden rounded-full sm:w-44 ${
                  isDark ? "bg-[#1b2334]" : "bg-slate-200"
                }`}
              >
                <div
                  className="h-full rounded-full bg-brand transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main 3-Column Layout Matching Screenshots Exactly */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        {submitError && (
          <div
            role="alert"
            className={`mb-6 rounded-xl border p-4 text-sm ${
              isDark
                ? "border-red-500/30 bg-red-950/40 text-red-200"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Honeypot field - hidden */}
          <input
            type="text"
            name="website"
            value={form.website || ""}
            onChange={(e) => updateField("website", e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {/* COLUMN 1 */}
            <div className="space-y-5">
              {/* Card 1: Your details */}
              <section className={cardCls}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-6 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                      1
                    </span>
                    <h2 className={cardTitleCls}>
                      Your details
                    </h2>
                  </div>
                  <span className={isDark ? "text-xs text-slate-400" : "text-xs text-ink-muted"}>* required</span>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="businessName"
                      className={fieldLabelCls}
                    >
                      Business / website name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="businessName"
                      ref={businessNameRef}
                      type="text"
                      value={form.businessName}
                      onChange={(e) =>
                        updateField("businessName", e.target.value)
                      }
                      className={inputCls(Boolean(errors.businessName))}
                    />
                    {errors.businessName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className={fieldLabelCls}
                      >
                        Your name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        ref={nameRef}
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className={inputCls(Boolean(errors.name))}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className={fieldLabelCls}
                      >
                        Mobile <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="phone"
                        ref={phoneRef}
                        type="text"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className={inputCls(Boolean(errors.phone))}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className={fieldLabelCls}
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      ref={emailRef}
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@business.com"
                      className={inputCls(Boolean(errors.email))}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Card 2: Your business */}
              <section className={cardCls}>
                <div className="flex items-center gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    2
                  </span>
                  <h2 className={cardTitleCls}>
                    Your business
                  </h2>
                </div>

                <div className="mt-5 space-y-5">
                  <div>
                    <span className={sectionLabelCls}>
                      TYPE *
                    </span>
                    <div
                      role="radiogroup"
                      aria-label="Business type"
                      className="mt-2.5 flex flex-wrap gap-2"
                    >
                      {BUSINESS_TYPES.map((type) => {
                        const selected = form.answers.businessType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => updateAnswer("businessType", type)}
                            className={pillCls(selected)}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={sectionLabelCls}>
                        PAGES YOU WANT
                      </span>
                      <span className={`text-[11px] tabular-nums ${isDark ? "text-slate-400" : "text-ink-muted"}`}>
                        {pageCount}/{MAX_QUESTIONNAIRE_PAGES}
                      </span>
                    </div>
                    <div
                      role="group"
                      aria-label="Pages you want"
                      className="mt-2.5 flex flex-wrap gap-2"
                    >
                      {WEBSITE_PAGES.map((page) => {
                        const isHome = page === "Home";
                        const selected =
                          isHome || form.answers.pages.includes(page);
                        const blocked = !selected && pagesFull;
                        return (
                          <button
                            key={page}
                            type="button"
                            aria-pressed={selected}
                            disabled={isHome || blocked}
                            onClick={() => togglePage(page)}
                            title={blocked ? `Up to ${MAX_QUESTIONNAIRE_PAGES} pages` : undefined}
                            className={`${pillCls(selected)} ${
                              isHome ? "cursor-default opacity-85" : ""
                            } ${blocked ? "cursor-not-allowed opacity-50" : ""}`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    {errors.pages ? (
                      <p className="mt-2 text-xs text-red-500">{errors.pages}</p>
                    ) : (
                      pagesFull && (
                        <p className={`mt-2 text-[11px] ${isDark ? "text-slate-400" : "text-ink-muted"}`}>
                          Up to {MAX_QUESTIONNAIRE_PAGES} pages. Remove one to pick another.
                        </p>
                      )
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* COLUMN 2 */}
            <div className="space-y-5">
              {/* Card 3: Look & colours */}
              <section className={cardCls}>
                <div className="flex items-center gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    3
                  </span>
                  <h2 className={cardTitleCls}>
                    Look &amp; colours
                  </h2>
                </div>

                <div className="mt-5 space-y-5">
                  {/* Visual Look Cards */}
                  <div
                    role="radiogroup"
                    aria-label="Look preview"
                    className="grid grid-cols-3 gap-2.5"
                  >
                    {LOOK_OPTIONS.map((look) => {
                      const selected = form.answers.look === look;
                      return (
                        <button
                          key={look}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => updateAnswer("look", look)}
                          className={`flex flex-col items-center rounded-xl p-1.5 transition-all ${
                            selected
                              ? isDark
                                ? "ring-2 ring-brand bg-[#162035]"
                                : "ring-2 ring-brand bg-brand-soft/30 border border-brand/40"
                              : isDark
                                ? "hover:bg-[#161f31]"
                                : "hover:bg-canvas border border-transparent"
                          }`}
                        >
                          <div
                            className={`flex h-14 w-full flex-col justify-between rounded-lg p-2.5 ${
                              look === "Light"
                                ? "bg-white border border-slate-200"
                                : look === "Dark"
                                  ? "bg-[#0c101a] border border-[#232d42]"
                                  : "bg-[#fef3c7] border border-amber-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-6 rounded-sm ${
                                look === "Light"
                                  ? "bg-blue-600"
                                  : look === "Dark"
                                    ? "bg-amber-500"
                                    : "bg-purple-600"
                              }`}
                            />
                            <div className="space-y-1">
                              <span
                                className={`block h-1 w-full rounded-sm ${
                                  look === "Light"
                                    ? "bg-slate-200"
                                    : look === "Dark"
                                      ? "bg-slate-600"
                                      : "bg-amber-300"
                                }`}
                              />
                              <span
                                className={`block h-1 w-2/3 rounded-sm ${
                                  look === "Light"
                                    ? "bg-slate-200"
                                    : look === "Dark"
                                      ? "bg-slate-600"
                                      : "bg-amber-300"
                                }`}
                              />
                            </div>
                          </div>
                          <span
                            className={`mt-2 text-xs font-semibold ${
                              isDark ? "text-slate-200" : "text-ink"
                            }`}
                          >
                            {look}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* STYLE */}
                  <div>
                    <span className={sectionLabelCls}>
                      STYLE
                    </span>
                    <div
                      role="radiogroup"
                      aria-label="Style"
                      className="mt-2.5 flex flex-wrap gap-2"
                    >
                      {STYLE_OPTIONS.map((style) => {
                        const selected = form.answers.style === style;
                        return (
                          <button
                            key={style}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => updateAnswer("style", style)}
                            className={pillCls(selected)}
                          >
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* COLOURS */}
                  <div>
                    <span className={sectionLabelCls}>
                      COLOURS
                    </span>
                    <div
                      role="radiogroup"
                      aria-label="Colours palette"
                      className="mt-2.5 grid grid-cols-4 gap-2"
                    >
                      {PALETTE_OPTIONS.map((p) => {
                        const selected = form.answers.palette === p.label;
                        return (
                          <button
                            key={p.key}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => updateAnswer("palette", p.label)}
                            className={`rounded-xl border p-2 text-center transition-all ${
                              selected
                                ? isDark
                                  ? "border-brand bg-[#162138] ring-1 ring-brand"
                                  : "border-brand bg-brand-soft/30 ring-2 ring-brand/30"
                                : isDark
                                  ? "border-[#222c40] bg-[#0c101a] hover:border-slate-500"
                                  : "border-line bg-canvas hover:border-brand/40"
                            }`}
                          >
                            <div className="flex h-5 w-full overflow-hidden rounded-md border border-black/10">
                              <span
                                className="h-full flex-1"
                                style={{ background: p.colors[0] }}
                              />
                              <span
                                className="h-full flex-1"
                                style={{ background: p.colors[1] }}
                              />
                              <span
                                className="h-full flex-1"
                                style={{ background: p.colors[2] }}
                              />
                            </div>
                            <span
                              className={`mt-1.5 block truncate text-[11px] font-medium ${
                                isDark ? "text-slate-300" : "text-ink-body"
                              }`}
                            >
                              {p.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {clientId && (
                    <>
                      <div>
                        <span className={sectionLabelCls}>
                          THEME · optional
                        </span>
                        <div className="mt-2.5">
                          <ThemeChoice
                            themes={themes}
                            value={form.answers.themeId ?? null}
                            onChange={(themeId) => updateAnswer("themeId", themeId)}
                            isDark={isDark}
                          />
                        </div>
                      </div>

                      <div>
                        <span className={sectionLabelCls}>
                          TEMPLATE · optional
                        </span>
                        <div className="mt-2.5">
                          <TemplateChoice
                            templates={templates}
                            value={form.answers.templateKey ?? null}
                            onChange={(templateKey) => updateAnswer("templateKey", templateKey)}
                            theme={selectedTheme}
                            isDark={isDark}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Card 4: How customers reach you */}
              <section className={cardCls}>
                <div className="flex items-center gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    4
                  </span>
                  <h2 className={cardTitleCls}>
                    How customers reach you
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Call button */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid size-9 place-items-center rounded-xl ${
                            isDark
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <Phone className="size-4" />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isDark ? "text-white" : "text-ink"
                            }`}
                          >
                            Call button
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-ink-muted"
                            }`}
                          >
                            tel:
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={form.answers.reach.call.enabled}
                          onChange={(e) =>
                            updateAnswer("reach", {
                              ...form.answers.reach,
                              call: {
                                ...form.answers.reach.call,
                                enabled: e.target.checked,
                              },
                            })
                          }
                          className="peer sr-only"
                        />
                        <div
                          className={`peer h-6 w-11 rounded-full ${toggleTrackCls} peer-checked:bg-brand peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full`}
                        />
                      </label>
                    </div>

                    <div className="mt-2.5 pl-12">
                      <label
                        className={`flex items-center gap-2 text-xs cursor-pointer ${
                          isDark ? "text-slate-400" : "text-ink-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={diffCall}
                          onChange={(e) => {
                            setDiffCall(e.target.checked);
                            if (!e.target.checked) {
                              updateAnswer("reach", {
                                ...form.answers.reach,
                                call: {
                                  ...form.answers.reach.call,
                                  differentContact: null,
                                },
                              });
                            }
                          }}
                          className="rounded border-slate-300 text-brand focus:ring-0"
                        />
                        Different number
                      </label>
                      {diffCall && (
                        <input
                          type="text"
                          placeholder="Phone number for call button"
                          value={
                            form.answers.reach.call.differentContact || ""
                          }
                          onChange={(e) =>
                            updateAnswer("reach", {
                              ...form.answers.reach,
                              call: {
                                ...form.answers.reach.call,
                                differentContact: e.target.value,
                              },
                            })
                          }
                          className={nestedInputCls}
                        />
                      )}
                    </div>
                  </div>

                  {/* WhatsApp button */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid size-9 place-items-center rounded-xl ${
                            isDark
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          <MessageCircle className="size-4" />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isDark ? "text-white" : "text-ink"
                            }`}
                          >
                            WhatsApp button
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-ink-muted"
                            }`}
                          >
                            wa.me/
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={form.answers.reach.whatsapp.enabled}
                          onChange={(e) =>
                            updateAnswer("reach", {
                              ...form.answers.reach,
                              whatsapp: {
                                ...form.answers.reach.whatsapp,
                                enabled: e.target.checked,
                              },
                            })
                          }
                          className="peer sr-only"
                        />
                        <div
                          className={`peer h-6 w-11 rounded-full ${toggleTrackCls} peer-checked:bg-brand peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full`}
                        />
                      </label>
                    </div>

                    <div className="mt-2.5 pl-12">
                      <label
                        className={`flex items-center gap-2 text-xs cursor-pointer ${
                          isDark ? "text-slate-400" : "text-ink-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={diffWa}
                          onChange={(e) => {
                            setDiffWa(e.target.checked);
                            if (!e.target.checked) {
                              updateAnswer("reach", {
                                ...form.answers.reach,
                                whatsapp: {
                                  ...form.answers.reach.whatsapp,
                                  differentContact: null,
                                },
                              });
                            }
                          }}
                          className="rounded border-slate-300 text-brand focus:ring-0"
                        />
                        Different number
                      </label>
                      {diffWa && (
                        <input
                          type="text"
                          placeholder="WhatsApp number"
                          value={
                            form.answers.reach.whatsapp.differentContact || ""
                          }
                          onChange={(e) =>
                            updateAnswer("reach", {
                              ...form.answers.reach,
                              whatsapp: {
                                ...form.answers.reach.whatsapp,
                                differentContact: e.target.value,
                              },
                            })
                          }
                          className={nestedInputCls}
                        />
                      )}
                    </div>
                  </div>

                  {/* Enquiry form */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid size-9 place-items-center rounded-xl ${
                            isDark
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          <Mail className="size-4" />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isDark ? "text-white" : "text-ink"
                            }`}
                          >
                            Enquiry form → email
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-ink-muted"
                            }`}
                          >
                            uses your email
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={form.answers.reach.enquiryForm.enabled}
                          onChange={(e) =>
                            updateAnswer("reach", {
                              ...form.answers.reach,
                              enquiryForm: {
                                ...form.answers.reach.enquiryForm,
                                enabled: e.target.checked,
                              },
                            })
                          }
                          className="peer sr-only"
                        />
                        <div
                          className={`peer h-6 w-11 rounded-full ${toggleTrackCls} peer-checked:bg-brand peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full`}
                        />
                      </label>
                    </div>

                    <div className="mt-2.5 pl-12">
                      <label
                        className={`flex items-center gap-2 text-xs cursor-pointer ${
                          isDark ? "text-slate-400" : "text-ink-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={diffEmail}
                          onChange={(e) => {
                            setDiffEmail(e.target.checked);
                            if (!e.target.checked) {
                              updateAnswer("reach", {
                                ...form.answers.reach,
                                enquiryForm: {
                                  ...form.answers.reach.enquiryForm,
                                  differentContact: null,
                                },
                              });
                            }
                          }}
                          className="rounded border-slate-300 text-brand focus:ring-0"
                        />
                        Different email
                      </label>
                      {diffEmail && (
                        <input
                          type="email"
                          placeholder="Routing email for inquiries"
                          value={
                            form.answers.reach.enquiryForm.differentContact || ""
                          }
                          onChange={(e) =>
                            updateAnswer("reach", {
                              ...form.answers.reach,
                              enquiryForm: {
                                ...form.answers.reach.enquiryForm,
                                differentContact: e.target.value,
                              },
                            })
                          }
                          className={nestedInputCls}
                        />
                      )}
                    </div>
                  </div>

                  {/* Map location row */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid size-9 place-items-center rounded-xl ${
                            isDark
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          <MapPin className="size-4" />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isDark ? "text-white" : "text-ink"
                            }`}
                          >
                            Map location
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-ink-muted"
                            }`}
                          >
                            Shows you on a map
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={Boolean(form.answers.reach.mapLocation?.enabled)}
                          onChange={(e) =>
                            updateAnswer("reach", {
                              ...form.answers.reach,
                              mapLocation: {
                                enabled: e.target.checked,
                                differentContact:
                                  form.answers.reach.mapLocation?.differentContact ?? null,
                              },
                            })
                          }
                          className="peer sr-only"
                        />
                        <div
                          className={`peer h-6 w-11 rounded-full ${toggleTrackCls} peer-checked:bg-brand peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full`}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Social links row */}
                  <div className="pt-2">
                    <span className={sectionLabelCls}>
                      SOCIAL LINKS · tap the ones you have
                    </span>
                    <div className="mt-2.5 flex items-center gap-2">
                      {SOCIAL_PLATFORMS.map(({ id, label, icon: IconComponent }) => {
                        const active = form.answers.reach.socialLinks?.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            title={label}
                            aria-pressed={active}
                            onClick={() => toggleSocial(id)}
                            className={`grid size-9 place-items-center rounded-xl border transition-all ${
                              active
                                ? "border-brand bg-brand text-white shadow-xs"
                                : isDark
                                  ? "border-[#222c40] bg-[#0c101a] text-slate-400 hover:border-slate-500 hover:text-white"
                                  : "border-line bg-canvas text-ink-muted hover:border-brand/40 hover:text-ink"
                            }`}
                          >
                            <IconComponent className="size-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* COLUMN 3 */}
            <div className="space-y-5">
              {/* Card 5: Extras */}
              <section className={cardCls}>
                <div className="flex items-center gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                    5
                  </span>
                  <h2 className={cardTitleCls}>Extras</h2>
                </div>

                <div className="mt-5 space-y-5">
                  {/* Features chips */}
                  <div
                    role="group"
                    aria-label="Features"
                    className="flex flex-wrap gap-2"
                  >
                    {FEATURE_OPTIONS.map((feat) => {
                      const selected = form.answers.features.includes(feat);
                      return (
                        <button
                          key={feat}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleFeature(feat)}
                          className={pillCls(selected)}
                        >
                          {feat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Rows with labels */}
                  <div className="space-y-3 pt-2">
                    {/* LOGO */}
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <span className={`w-20 shrink-0 ${sectionLabelCls}`}>
                        LOGO
                      </span>
                      <div
                        role="radiogroup"
                        aria-label="Logo preference"
                        className="flex flex-wrap gap-1.5"
                      >
                        {LOGO_OPTIONS.map((opt) => {
                          const selected = form.answers.logo === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => updateAnswer("logo", opt)}
                              className={pillCls(selected)}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* TEXT */}
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <span className={`w-20 shrink-0 ${sectionLabelCls}`}>
                        TEXT
                      </span>
                      <div
                        role="radiogroup"
                        aria-label="Text preference"
                        className="flex flex-wrap gap-1.5"
                      >
                        {TEXT_OPTIONS.map((opt) => {
                          const selected = form.answers.text === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => updateAnswer("text", opt)}
                              className={pillCls(selected)}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* PHOTOS */}
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <span className={`w-20 shrink-0 ${sectionLabelCls}`}>
                        PHOTOS
                      </span>
                      <div
                        role="radiogroup"
                        aria-label="Photos preference"
                        className="flex flex-wrap gap-1.5"
                      >
                        {PHOTOS_OPTIONS.map((opt) => {
                          const selected = form.answers.photos === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => updateAnswer("photos", opt)}
                              className={pillCls(selected)}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* DOMAIN */}
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <span className={`w-20 shrink-0 ${sectionLabelCls}`}>
                        DOMAIN
                      </span>
                      <div
                        role="radiogroup"
                        aria-label="Domain status"
                        className="flex flex-wrap gap-1.5"
                      >
                        {DOMAIN_OPTIONS.map((opt) => {
                          const selected = form.answers.domain === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => updateAnswer("domain", opt)}
                              className={pillCls(selected)}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* NEEDED */}
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <span className={`w-20 shrink-0 ${sectionLabelCls}`}>
                        NEEDED
                      </span>
                      <div
                        role="radiogroup"
                        aria-label="Needed timeline"
                        className="flex flex-wrap gap-1.5"
                      >
                        {NEEDED_OPTIONS.map((opt) => {
                          const selected = form.answers.needed === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => updateAnswer("needed", opt)}
                              className={pillCls(selected)}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Card 6: Your files */}
              <section className={cardCls}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-6 place-items-center rounded-full bg-rose-500 text-xs font-bold text-white">
                      6
                    </span>
                    <h2 className={cardTitleCls}>
                      Your files
                    </h2>
                  </div>
                  <span className={isDark ? "text-xs text-slate-400" : "text-xs text-ink-muted"}>optional</span>
                </div>

                <div className="mt-5 space-y-4">
                  {clientId ? (
                    <FileUploads
                      value={attachments}
                      onChange={setAttachments}
                      onBusyChange={onBusyChange}
                      isDark={isDark}
                    />
                  ) : (
                    <p
                      className={`text-[11px] leading-relaxed ${
                        isDark ? "text-slate-400" : "text-ink-muted"
                      }`}
                    >
                      Share your logo, photos and videos with a Drive or
                      WeTransfer link.{" "}
                      <Link to="/login" className="font-semibold text-brand hover:underline">
                        Sign in
                      </Link>{" "}
                      to upload files and pick a theme or template here.
                    </p>
                  )}

                  <div>
                    <label
                      htmlFor="filesLink"
                      className={fieldLabelCls}
                    >
                      {clientId
                        ? "Or a Drive / WeTransfer link (ZIPs, large files)"
                        : "Drive / WeTransfer link"}
                    </label>
                    <input
                      id="filesLink"
                      type="url"
                      value={form.filesLink || ""}
                      onChange={(e) => updateField("filesLink", e.target.value)}
                      placeholder="https://"
                      className={inputCls(false)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className={fieldLabelCls}
                    >
                      Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={form.notes || ""}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Websites you like, anything else"
                      className={`mt-1.5 w-full resize-none rounded-xl border px-3.5 py-2 text-sm outline-none transition focus:border-brand ${
                        isDark
                          ? "border-[#212a3d] bg-[#0b0e17] text-white placeholder-slate-500"
                          : "border-line bg-canvas text-ink placeholder-ink-muted focus:ring-1 focus:ring-brand"
                      }`}
                    />
                  </div>
                </div>
              </section>

              {/* Card 7: Submit Card */}
              <section
                className={`rounded-2xl p-5 shadow-xs space-y-4 ${
                  isDark
                    ? "bg-white text-slate-900 shadow-2xl"
                    : "border border-line bg-surface text-ink"
                }`}
              >
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-slate-300 text-brand focus:ring-0"
                  />
                  <span
                    className={`text-xs font-medium leading-snug ${
                      isDark ? "text-slate-700" : "text-ink-body"
                    }`}
                  >
                    I agree that [{brandName}] may use these details and files to
                    build my website.
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-xs text-red-600">{errors.consent}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="w-full rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold py-3 text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" color="current" /> Submitting...
                    </>
                  ) : uploading ? (
                    <>
                      <Spinner size="sm" color="current" /> Uploading files...
                    </>
                  ) : (
                    <>Send my answers →</>
                  )}
                </button>

                <div
                  className={`flex items-center justify-center gap-1.5 text-xs pt-0.5 ${
                    isDark ? "text-slate-500" : "text-ink-muted"
                  }`}
                >
                  <Lock className="size-3.5" />
                  <span>Your details are used only to build your website.</span>
                </div>
              </section>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
