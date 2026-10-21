import { request } from "./http.ts";

export type ClientEmailProvider = "RESEND" | "BREVO";

export type ClientEmailConfig = {
  configured: boolean;
  provider: ClientEmailProvider | null;
  apiKeyMasked: string | null;
  fromEmail: string | null;
  fromName: string | null;
  enabled: boolean;
  updatedAt: string | null;
};

export type ClientEmailInput = {
  provider: ClientEmailProvider;
  /** Leave empty to keep the stored key. */
  apiKey: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
};

const BASE = "/account/email";

export const clientEmailApi = {
  get: () => request<{ config: ClientEmailConfig }>(BASE).then((data) => data.config),

  update: (input: ClientEmailInput) =>
    request<{ config: ClientEmailConfig }>(BASE, { method: "PUT", body: input }).then((data) => data.config),

  sendTest: (to: string) => request<void>(`${BASE}/test`, { method: "POST", body: { to } }),
};
