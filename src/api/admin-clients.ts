import type { UserStatus } from "./auth.ts";
import { request } from "./http.ts";

export type ClientSource = "SELF_SIGNUP" | "ADMIN_CREATED";

export type ClientOwner = {
  id: string;
  fullName: string;
  email: string | null;
  /** Set only for clients whose login was created by a Super Admin. */
  username: string | null;
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
  /** Optional for clients that log in with a username. */
  email: string;
  phone: string;
  address: string;
  /** Only sent for clients that log in with a username. */
  username?: string;
};

export type CreateClientInput = Omit<ClientDetailsInput, "username"> & {
  username: string;
  password: string;
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

  create: (input: CreateClientInput) =>
    request<ClientResponse>(BASE, { method: "POST", body: input }).then((data) => data.client),

  update: (id: string, input: ClientDetailsInput) =>
    request<ClientResponse>(`${BASE}/${id}`, { method: "PATCH", body: input }).then((data) => data.client),

  suspend: (id: string) =>
    request<ClientResponse>(`${BASE}/${id}/suspend`, { method: "POST" }).then((data) => data.client),

  reactivate: (id: string) =>
    request<ClientResponse>(`${BASE}/${id}/reactivate`, { method: "POST" }).then((data) => data.client),

  setPassword: (id: string, password: string) =>
    request<ClientResponse>(`${BASE}/${id}/password`, { method: "POST", body: { password } }).then((data) => data.client),

  resendEmail: (id: string) =>
    request<{ emailSent: boolean }>(`${BASE}/${id}/resend-email`, { method: "POST" }),
};
