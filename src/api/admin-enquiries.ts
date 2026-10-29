import { request } from "./http.ts";

export type EnquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "SPAM";
export type EnquiryEmailStatus = "PENDING" | "SENT" | "FAILED" | "SKIPPED";
export type EnquiryActivityKind = "NOTE" | "REPLY_SENT" | "STATUS_CHANGED" | "EMAIL_SENT" | "EMAIL_NOT_SENT";

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: EnquiryStatus;
  /** False until a Super Admin opens it. */
  read: boolean;
  emailStatus: EnquiryEmailStatus;
  emailError: string | null;
  createdAt: string;
};

export type EnquiryActivity = {
  id: string;
  kind: EnquiryActivityKind;
  body: string | null;
  actorName: string | null;
  createdAt: string;
};

export type EnquiryDetail = {
  enquiry: Enquiry;
  /** Newest first. */
  activity: EnquiryActivity[];
};

export type EnquiryListParams = {
  search?: string;
  /** Omit for every enquiry except spam. */
  status?: EnquiryStatus;
  page?: number;
  pageSize?: number;
};

/** ALL excludes spam. */
export type EnquiryCounts = Record<EnquiryStatus | "ALL", number>;

export type EnquiryList = {
  items: Enquiry[];
  total: number;
  page: number;
  pageSize: number;
  counts: EnquiryCounts;
};

export type EnquiryUpdate = { status?: EnquiryStatus; read?: boolean };

export type EnquiryReply = { subject: string; message: string };

const BASE = "/admin/enquiries";

function toQuery(params: EnquiryListParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

type EnquiryResponse = { enquiry: Enquiry };

export const adminEnquiriesApi = {
  list: (params: EnquiryListParams) => request<EnquiryList>(`${BASE}${toQuery(params)}`),

  summary: () => request<{ newCount: number }>(`${BASE}/summary`),

  get: (id: string) => request<EnquiryDetail>(`${BASE}/${id}`),

  update: (id: string, changes: EnquiryUpdate) =>
    request<EnquiryResponse>(`${BASE}/${id}`, { method: "PATCH", body: changes }).then((data) => data.enquiry),

  addNote: (id: string, body: string) =>
    request<{ activity: EnquiryActivity }>(`${BASE}/${id}/notes`, { method: "POST", body: { body } }).then(
      (data) => data.activity,
    ),

  /** Emails the customer from the platform address; a New enquiry moves to In progress. */
  reply: (id: string, reply: EnquiryReply) =>
    request<EnquiryResponse>(`${BASE}/${id}/reply`, { method: "POST", body: reply }).then((data) => data.enquiry),

  resendEmail: (id: string) =>
    request<EnquiryResponse>(`${BASE}/${id}/resend-email`, { method: "POST" }).then((data) => data.enquiry),

  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: "DELETE" }),
};
