import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Spinner } from "@heroui/react";
import {
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  Upload,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ApiError, errorMessage } from "../../api/http.ts";
import { useAuth } from "../../auth/auth-context.ts";
import {
  questionnaireApi,
  type QuestionnaireAnswers,
  type SubmitQuestionnaireInput,
} from "./api.ts";
import {
  BUSINESS_TYPES,
  DOMAIN_OPTIONS,
  FEATURE_OPTIONS,
  LOGO_OPTIONS,
  LOOK_OPTIONS,
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
  loadSavedDraft,
  saveDraft,
} from "./prefill.ts";

export type QuestionnaireFormProps = {
  onSuccess?: (submissionId?: string) => void;
  brandName?: string;
  prefillClient?: {
    businessName?: string | null;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };
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

  // Prefill from authenticated client if empty
  useEffect(() => {
    if (prefillClient) {
      setForm((prev) => ({
        ...prev,
        businessName: prev.businessName || prefillClient.businessName || "",
        name: prev.name || prefillClient.name || "",
        phone: prev.phone || prefillClient.phone || "",
        email: prev.email || prefillClient.email || "",
      }));
    } else if (user) {
      setForm((prev) => ({
        ...prev,
        businessName:
          prev.businessName || user.client?.businessName || prev.businessName,
        name: prev.name || user.fullName || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [prefillClient, user]);

  // Autosave draft to localStorage
  useEffect(() => {
    if (!submitted) {
      saveDraft(form);
    }
  }, [form, submitted]);

  const progress = calculateProgress(form);

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
    const current = form.answers.pages;
    const exists = current.includes(page);
    const next = exists
      ? current.filter((p) => p !== page)
      : [...current, page];
    updateAnswer("pages", next);
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

    setSubmitting(true);
    try {
      const res = await questionnaireApi.submit(form);
      clearSavedDraft();
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
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-white">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="size-10" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Questionnaire Submitted!
        </h2>
        <p className="mt-3 text-base text-slate-300">
          Thank you for sharing your website vision with{" "}
          <strong className="text-white">{brandName}</strong>. Our team and AI
          engine have received your brief and started structuring your website.
        </p>
        <p className="mt-2 text-sm text-slate-400">
          We have dispatched a confirmation email to{" "}
          <span className="font-semibold text-white">{form.email}</span>.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setForm(INITIAL_FORM_STATE);
            }}
            className="rounded-xl bg-[#5271ff] px-6 py-3 font-semibold text-white shadow-lg hover:bg-[#4362f0] transition-colors"
          >
            Submit another brief
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200">
      {/* Sticky Header with Exact Brand Icon & Progress Bar */}
      <header className="sticky top-0 z-40 border-b border-[#1b2233] bg-[#0d1117]/95 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Exact orange rounded square logo from image */}
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-[#f95738] to-[#ff7a59] font-bold text-white shadow-md">
              <div className="size-4 rounded-sm border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  [{brandName}]
                </span>
                <span className="hidden text-slate-600 sm:inline">|</span>
                <h1 className="text-sm font-bold text-white sm:text-base">
                  Website questionnaire
                </h1>
              </div>
              <p className="hidden text-xs text-slate-400 sm:block">
                About 3 minutes · mostly tick boxes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
              {progress}% complete
            </span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-[#1b2334] sm:w-44">
              <div
                className="h-full rounded-full bg-[#3b82f6] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout Matching Screenshots Exactly */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        {submitError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
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
              <section className="rounded-2xl border border-[#1e2638] bg-[#121824] p-5 shadow-xl sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-6 place-items-center rounded-full bg-[#3b82f6] text-xs font-bold text-white">
                      1
                    </span>
                    <h2 className="text-base font-bold text-white">
                      Your details
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">* required</span>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="businessName"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Business / website name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="businessName"
                      ref={businessNameRef}
                      type="text"
                      value={form.businessName}
                      onChange={(e) =>
                        updateField("businessName", e.target.value)
                      }
                      className={`mt-1.5 h-11 w-full rounded-xl border bg-[#0b0e17] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 ${
                        errors.businessName
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-[#212a3d]"
                      }`}
                    />
                    {errors.businessName && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-semibold text-slate-300"
                      >
                        Your name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="name"
                        ref={nameRef}
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className={`mt-1.5 h-11 w-full rounded-xl border bg-[#0b0e17] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 ${
                          errors.name
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-[#212a3d]"
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-semibold text-slate-300"
                      >
                        Mobile <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="phone"
                        ref={phoneRef}
                        type="text"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className={`mt-1.5 h-11 w-full rounded-xl border bg-[#0b0e17] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 ${
                          errors.phone
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-[#212a3d]"
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="email"
                      ref={emailRef}
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@business.com"
                      className={`mt-1.5 h-11 w-full rounded-xl border bg-[#0b0e17] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 ${
                        errors.email
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-[#212a3d]"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Card 2: Your business */}
              <section className="rounded-2xl border border-[#1e2638] bg-[#121824] p-5 shadow-xl sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-[#f97316] text-xs font-bold text-white">
                    2
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Your business
                  </h2>
                </div>

                <div className="mt-5 space-y-5">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                              selected
                                ? "bg-[#2563eb] border border-[#3b82f6] text-white shadow-sm"
                                : "border border-[#222c40] bg-[#0c101a] text-slate-300 hover:border-slate-500 hover:text-white"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      PAGES YOU WANT
                    </span>
                    <div
                      role="group"
                      aria-label="Pages you want"
                      className="mt-2.5 flex flex-wrap gap-2"
                    >
                      {WEBSITE_PAGES.map((page) => {
                        const isHome = page === "Home";
                        const selected =
                          isHome || form.answers.pages.includes(page);
                        return (
                          <button
                            key={page}
                            type="button"
                            aria-pressed={selected}
                            disabled={isHome}
                            onClick={() => togglePage(page)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                              selected
                                ? "bg-[#2563eb] border border-[#3b82f6] text-white shadow-sm"
                                : "border border-[#222c40] bg-[#0c101a] text-slate-300 hover:border-slate-500 hover:text-white"
                            } ${isHome ? "cursor-default" : ""}`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* COLUMN 2 */}
            <div className="space-y-5">
              {/* Card 3: Look & colours */}
              <section className="rounded-2xl border border-[#1e2638] bg-[#121824] p-5 shadow-xl sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-[#10b981] text-xs font-bold text-white">
                    3
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Look & colours
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
                              ? "ring-2 ring-[#3b82f6] bg-[#162035]"
                              : "hover:bg-[#161f31]"
                          }`}
                        >
                          <div
                            className={`flex h-14 w-full flex-col justify-between rounded-lg p-2.5 ${
                              look === "Light"
                                ? "bg-white"
                                : look === "Dark"
                                  ? "bg-[#0c101a] border border-[#232d42]"
                                  : "bg-[#fef3c7]"
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
                                    ? "bg-slate-300"
                                    : look === "Dark"
                                      ? "bg-slate-600"
                                      : "bg-amber-400"
                                }`}
                              />
                              <span
                                className={`block h-1 w-2/3 rounded-sm ${
                                  look === "Light"
                                    ? "bg-slate-300"
                                    : look === "Dark"
                                      ? "bg-slate-600"
                                      : "bg-amber-400"
                                }`}
                              />
                            </div>
                          </div>
                          <span className="mt-2 text-xs font-semibold text-slate-200">
                            {look}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* STYLE */}
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                              selected
                                ? "bg-[#2563eb] border border-[#3b82f6] text-white shadow-sm"
                                : "border border-[#222c40] bg-[#0c101a] text-slate-300 hover:border-slate-500 hover:text-white"
                            }`}
                          >
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* COLOURS */}
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                                ? "border-[#3b82f6] bg-[#162138] ring-1 ring-[#3b82f6]"
                                : "border-[#222c40] bg-[#0c101a] hover:border-slate-500"
                            }`}
                          >
                            <div className="flex h-5 w-full overflow-hidden rounded-md border border-black/30">
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
                            <span className="mt-1.5 block truncate text-[11px] font-medium text-slate-300">
                              {p.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Card 4: How customers reach you (Includes Map Location & Social Links from Image 2!) */}
              <section className="rounded-2xl border border-[#1e2638] bg-[#121824] p-5 shadow-xl sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-[#f59e0b] text-xs font-bold text-white">
                    4
                  </span>
                  <h2 className="text-base font-bold text-white">
                    How customers reach you
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Call button */}
                  <div className="rounded-xl border border-[#20293d] bg-[#0b0e17] p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
                          <Phone className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Call button
                          </p>
                          <p className="text-xs text-slate-400">tel:</p>
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
                        <div className="peer h-6 w-11 rounded-full bg-[#1e273a] peer-checked:bg-[#5b78ff] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                      </label>
                    </div>

                    <div className="mt-2.5 pl-12">
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
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
                          className="rounded border-[#2f3d59] bg-[#121826] text-blue-600 focus:ring-0"
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
                          className="mt-2 w-full rounded-lg border border-[#2a3750] bg-[#121826] px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* WhatsApp button */}
                  <div className="rounded-xl border border-[#20293d] bg-[#0b0e17] p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
                          <MessageCircle className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            WhatsApp button
                          </p>
                          <p className="text-xs text-slate-400">wa.me/</p>
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
                        <div className="peer h-6 w-11 rounded-full bg-[#1e273a] peer-checked:bg-[#5b78ff] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                      </label>
                    </div>

                    <div className="mt-2.5 pl-12">
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
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
                          className="rounded border-[#2f3d59] bg-[#121826] text-blue-600 focus:ring-0"
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
                          className="mt-2 w-full rounded-lg border border-[#2a3750] bg-[#121826] px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Enquiry form */}
                  <div className="rounded-xl border border-[#20293d] bg-[#0b0e17] p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-orange-500/10 text-orange-400">
                          <Mail className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Enquiry form → email
                          </p>
                          <p className="text-xs text-slate-400">uses your email</p>
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
                        <div className="peer h-6 w-11 rounded-full bg-[#1e273a] peer-checked:bg-[#5b78ff] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                      </label>
                    </div>

                    <div className="mt-2.5 pl-12">
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
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
                          className="rounded border-[#2f3d59] bg-[#121826] text-blue-600 focus:ring-0"
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
                          className="mt-2 w-full rounded-lg border border-[#2a3750] bg-[#121826] px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Map location row (from screenshot 2) */}
                  <div className="rounded-xl border border-[#20293d] bg-[#0b0e17] p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-400">
                          <MapPin className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Map location
                          </p>
                          <p className="text-xs text-slate-400">Shows you on a map</p>
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
                        <div className="peer h-6 w-11 rounded-full bg-[#1e273a] peer-checked:bg-[#5b78ff] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  </div>

                  {/* Social links row (from screenshot 2) */}
                  <div className="pt-2">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                                ? "border-[#3b82f6] bg-[#1d273d] text-white shadow-sm"
                                : "border-[#222c40] bg-[#0c101a] text-slate-400 hover:border-slate-500 hover:text-white"
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
              <section className="rounded-2xl border border-[#1e2638] bg-[#121824] p-5 shadow-xl sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-[#3b82f6] text-xs font-bold text-white">
                    5
                  </span>
                  <h2 className="text-base font-bold text-white">Extras</h2>
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
                          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                            selected
                              ? "bg-[#2563eb] border border-[#3b82f6] text-white shadow-sm"
                              : "border border-[#222c40] bg-[#0c101a] text-slate-300 hover:border-slate-500 hover:text-white"
                          }`}
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
                      <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                                selected
                                  ? "bg-[#2563eb] border border-[#3b82f6] text-white shadow-sm"
                                  : "border border-[#222c40] bg-[#0c101a] text-slate-300 hover:border-slate-500"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* TEXT */}
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                                selected
                                  ? "bg-[#2563eb] border border-[#3b82f6] text-white shadow-sm"
                                  : "border border-[#222c40] bg-[#0c101a] text-slate-300 hover:border-slate-500"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* PHOTOS */}
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                                selected
                                  ? "bg-[#2563eb] border border-[#3b82f6] text-white shadow-sm"
                                  : "border border-[#222c40] bg-[#0c101a] text-slate-300 hover:border-slate-500"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* DOMAIN */}
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                                selected
                                  ? "bg-[#2563eb] border border-[#3b82f6] text-white shadow-sm"
                                  : "border border-[#222c40] bg-[#0c101a] text-slate-300 hover:border-slate-500"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* NEEDED */}
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                                selected
                                  ? "bg-[#2563eb] border border-[#3b82f6] text-white shadow-sm"
                                  : "border border-[#222c40] bg-[#0c101a] text-slate-300 hover:border-slate-500"
                              }`}
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
              <section className="rounded-2xl border border-[#1e2638] bg-[#121824] p-5 shadow-xl sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-6 place-items-center rounded-full bg-[#ef4444] text-xs font-bold text-white">
                      6
                    </span>
                    <h2 className="text-base font-bold text-white">
                      Your files
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">one ZIP</span>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Drop zone box matching screenshot */}
                  <div className="flex items-center justify-between rounded-xl border border-dashed border-[#242f44] bg-[#0b0e17] p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
                        <Upload className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Drop your ZIP here
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Logo, photos, videos in one folder
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const linkInput = document.getElementById("filesLink");
                        linkInput?.focus();
                      }}
                      className="rounded-lg bg-white px-3.5 py-1 text-xs font-bold text-slate-900 shadow hover:bg-slate-100 transition-colors"
                    >
                      Choose
                    </button>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Make a ZIP: right-click your folder → Compress (Mac) or Send
                    to → Compressed folder (Windows).
                  </p>

                  <div>
                    <label
                      htmlFor="filesLink"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Or a Drive / WeTransfer link
                    </label>
                    <input
                      id="filesLink"
                      type="url"
                      value={form.filesLink || ""}
                      onChange={(e) => updateField("filesLink", e.target.value)}
                      placeholder="https://"
                      className="mt-1.5 h-10 w-full rounded-xl border border-[#212a3d] bg-[#0b0e17] px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={form.notes || ""}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Websites you like, anything else"
                      className="mt-1.5 w-full resize-none rounded-xl border border-[#212a3d] bg-[#0b0e17] px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>
              </section>

              {/* Card 7: White Submit Card from Screenshot 2! */}
              <section className="rounded-2xl bg-white p-5 text-slate-900 shadow-2xl space-y-4">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-slate-700 leading-snug">
                    I agree that [{brandName}] may use these details and files to
                    build my website.
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-xs text-red-600">{errors.consent}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#617bfb] hover:bg-[#526eef] text-white font-semibold py-3 text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" color="current" /> Submitting...
                    </>
                  ) : (
                    <>Send my answers →</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-0.5">
                  <Lock className="size-3.5 text-slate-400" />
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
