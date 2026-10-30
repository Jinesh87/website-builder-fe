import { request } from "../../api/http.ts";
import type {
  BusinessType,
  DomainOption,
  FeatureOption,
  LogoOption,
  LookOption,
  NeededOption,
  PaletteOption,
  PhotosOption,
  StyleOption,
  TextOption,
  WebsitePage,
} from "./options.ts";

export type QuestionnaireStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "WEBSITE_CREATED"
  | "DONE"
  | "SPAM";

export type QuestionnaireEmailStatus = "PENDING" | "SENT" | "FAILED" | "SKIPPED";
export type QuestionnaireActivityKind =
  | "NOTE"
  | "STATUS_CHANGED"
  | "EMAIL_SENT"
  | "EMAIL_NOT_SENT";

export type ReachMethod = {
  enabled: boolean;
  differentContact?: string | null;
};

export type QuestionnaireAnswers = {
  businessType: BusinessType;
  pages: WebsitePage[];
  look: LookOption;
  style: StyleOption;
  palette: PaletteOption;
  reach: {
    call: ReachMethod;
    whatsapp: ReachMethod;
    enquiryForm: ReachMethod;
    mapLocation?: ReachMethod;
    socialLinks?: string[];
  };
  features: FeatureOption[];
  logo: LogoOption;
  text: TextOption;
  photos: PhotosOption;
  domain: DomainOption;
  needed: NeededOption;
};

export type SubmitQuestionnaireInput = {
  businessName: string;
  name: string;
  phone: string;
  email: string;
  answers: QuestionnaireAnswers;
  filesLink?: string | null;
  notes?: string | null;
  ref?: string | null;
  website?: string;
  clientId?: string | null;
};

export type Questionnaire = {
  id: string;
  businessName: string;
  name: string;
  phone: string;
  email: string;
  answers: QuestionnaireAnswers;
  filesLink: string | null;
  notes: string | null;
  ref: string | null;
  clientId: string | null;
  clientBusinessName?: string | null;
  websiteId: string | null;
  websiteName?: string | null;
  status: QuestionnaireStatus;
  read: boolean;
  emailStatus: QuestionnaireEmailStatus;
  emailError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QuestionnaireActivity = {
  id: string;
  kind: QuestionnaireActivityKind;
  body: string | null;
  actorName: string | null;
  createdAt: string;
};

export type QuestionnaireDetail = {
  questionnaire: Questionnaire;
  activity: QuestionnaireActivity[];
};

export type QuestionnaireListParams = {
  search?: string;
  status?: QuestionnaireStatus;
  page?: number;
  pageSize?: number;
};

export type QuestionnaireCounts = Record<QuestionnaireStatus | "ALL", number>;

export type QuestionnaireList = {
  items: Questionnaire[];
  total: number;
  page: number;
  pageSize: number;
  counts: QuestionnaireCounts;
};

export type QuestionnaireUpdate = {
  status?: QuestionnaireStatus;
  read?: boolean;
  clientId?: string | null;
  websiteId?: string | null;
};

const PUBLIC_BASE = "/questionnaire";
const ADMIN_BASE = "/admin/questionnaires";

function toQuery(params: QuestionnaireListParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

export const questionnaireApi = {
  submit: (input: SubmitQuestionnaireInput) =>
    request<{ ok: boolean; message: string; id?: string; emailDispatched: boolean }>(
      PUBLIC_BASE,
      { method: "POST", body: input },
    ),

  listMine: () =>
    request<{ items: Questionnaire[] }>(`${PUBLIC_BASE}/mine`).then(
      (data) => data.items,
    ),
};

export const adminQuestionnairesApi = {
  list: (params: QuestionnaireListParams) =>
    request<QuestionnaireList>(`${ADMIN_BASE}${toQuery(params)}`),

  summary: () => request<{ newCount: number }>(`${ADMIN_BASE}/summary`),

  get: (id: string) => request<QuestionnaireDetail>(`${ADMIN_BASE}/${id}`),

  update: (id: string, changes: QuestionnaireUpdate) =>
    request<{ questionnaire: Questionnaire }>(`${ADMIN_BASE}/${id}`, {
      method: "PATCH",
      body: changes,
    }).then((data) => data.questionnaire),

  addNote: (id: string, body: string) =>
    request<{ activity: QuestionnaireActivity }>(`${ADMIN_BASE}/${id}/notes`, {
      method: "POST",
      body: { body },
    }).then((data) => data.activity),

  resendEmail: (id: string) =>
    request<{ questionnaire: Questionnaire }>(`${ADMIN_BASE}/${id}/resend-email`, {
      method: "POST",
    }).then((data) => data.questionnaire),

  remove: (id: string) => request<void>(`${ADMIN_BASE}/${id}`, { method: "DELETE" }),
};

