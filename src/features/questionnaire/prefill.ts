import type { QuestionnaireAnswers, SubmitQuestionnaireInput } from "./api.ts";

export const DRAFT_STORAGE_KEY = "website_questionnaire_draft_v1";

export const DEFAULT_ANSWERS: QuestionnaireAnswers = {
  businessType: "Restaurant / Café",
  pages: ["Home", "Contact"],
  look: "Light",
  style: "Modern",
  palette: "Ocean",
  reach: {
    call: { enabled: true, differentContact: null },
    whatsapp: { enabled: true, differentContact: null },
    enquiryForm: { enabled: true, differentContact: null },
    mapLocation: { enabled: false, differentContact: null },
    socialLinks: [],
  },
  features: [],
  logo: "I have one",
  text: "I'll send it",
  photos: "My own",
  domain: "I have one",
  needed: "ASAP",
};

export const INITIAL_FORM_STATE: SubmitQuestionnaireInput = {
  businessName: "",
  name: "",
  phone: "",
  email: "",
  answers: DEFAULT_ANSWERS,
  filesLink: "",
  notes: "",
  ref: "",
  website: "", // Honeypot
};

export function loadSavedDraft(): Partial<SubmitQuestionnaireInput> | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraft(data: SubmitQuestionnaireInput): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota or disabled localStorage
  }
}

export function clearSavedDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Calculates progress percentage (0 - 100) based on filled essential fields.
 */
export function calculateProgress(form: SubmitQuestionnaireInput): number {
  const checks = [
    Boolean(form.businessName.trim()),
    Boolean(form.name.trim()),
    Boolean(form.phone.trim()),
    Boolean(form.email.trim() && form.email.includes("@")),
    Boolean(form.answers.businessType),
    Boolean(form.answers.pages && form.answers.pages.length > 0),
    Boolean(form.answers.look),
    Boolean(form.answers.style),
    Boolean(form.answers.palette),
    Boolean(
      form.answers.reach.call.enabled ||
        form.answers.reach.whatsapp.enabled ||
        form.answers.reach.enquiryForm.enabled,
    ),
    Boolean(form.answers.logo),
    Boolean(form.answers.text),
    Boolean(form.answers.photos),
    Boolean(form.answers.domain),
    Boolean(form.answers.needed),
  ];

  const filledCount = checks.filter(Boolean).length;
  return Math.round((filledCount / checks.length) * 100);
}

