import type { AiModelPrice, AiModelPriceInput } from "./admin-ai.ts";
import type { UserStatus } from "./auth.ts";
import { request } from "./http.ts";

export type ClientSource = "SELF_SIGNUP" | "ADMIN_CREATED";

export type ClientOwner = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  emailVerified: boolean;
  lastSignedInAt: string | null;
};

export type Client = {
  id: string;
  businessName: string;
  address: string | null;
  source: ClientSource;
  createdAt: string;
  updatedAt: string;
  owner: ClientOwner | null;
};

export type ClientListParams = {
  search?: string;
  source?: ClientSource;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
};

export type ClientList = {
  items: Client[];
  total: number;
  page: number;
  pageSize: number;
};

export type ClientDetailsInput = {
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
};

type ClientResponse = { client: Client };

const BASE = "/admin/clients";

function toQuery(params: ClientListParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

export const adminClientsApi = {
  list: (params: ClientListParams) => request<ClientList>(`${BASE}${toQuery(params)}`),

  get: (id: string) => request<ClientResponse>(`${BASE}/${id}`).then((data) => data.client),

  create: (input: ClientDetailsInput & { sendInvite: boolean }) =>
    request<{ client: Client; inviteSent: boolean | null }>(BASE, { method: "POST", body: input }),

  update: (id: string, input: ClientDetailsInput) =>
    request<ClientResponse>(`${BASE}/${id}`, { method: "PATCH", body: input }).then((data) => data.client),

  suspend: (id: string) =>
    request<ClientResponse>(`${BASE}/${id}/suspend`, { method: "POST" }).then((data) => data.client),

  reactivate: (id: string) =>
    request<ClientResponse>(`${BASE}/${id}/reactivate`, { method: "POST" }).then((data) => data.client),

  resendEmail: (id: string) =>
    request<{ emailSent: boolean }>(`${BASE}/${id}/resend-email`, { method: "POST" }),

  aiPrices: (id: string) => request<{ prices: AiModelPrice[] }>(`${BASE}/${id}/ai-prices`).then((data) => data.prices),

  updateAiPrices: (id: string, prices: AiModelPriceInput[]) =>
    request<{ prices: AiModelPrice[] }>(`${BASE}/${id}/ai-prices`, { method: "PUT", body: { prices } }).then((data) => data.prices),
};
