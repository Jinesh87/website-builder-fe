import { request } from "./http.ts";

export type EmailConfig = {
  configured: boolean;
  resendApiKeyMasked: string | null;
  fromEmail: string | null;
  fromName: string | null;
  enabled: boolean;
  contactSalesEmail?: string | null;
  questionnaireSalesEmail?: string | null;
  partnerSalesEmail?: string | null;
  updatedAt: string | null;
};

export type EmailConfigInput = {
  /** Leave empty to keep the stored key. */
  resendApiKey: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
  contactSalesEmail?: string;
  questionnaireSalesEmail?: string;
  partnerSalesEmail?: string;
};

type ConfigResponse = { config: EmailConfig };

const BASE = "/admin/settings/email";

export const adminEmailApi = {
  get: () => request<ConfigResponse>(BASE).then((data) => data.config),

  update: (input: EmailConfigInput) =>
    request<ConfigResponse>(BASE, { method: "PUT", body: input }).then((data) => data.config),

  sendTest: (to: string) => request<void>(`${BASE}/test`, { method: "POST", body: { to } }),
};
