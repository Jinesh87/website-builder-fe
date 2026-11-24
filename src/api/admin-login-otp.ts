import { request } from "./http.ts";

export type LoginOtpRecipient = {
  id: string;
  email: string;
  label: string | null;
  createdAt: string;
};

export type LoginOtpSettings = {
  /** The Super Admin account's own email; it always receives the code. */
  accountEmail: string | null;
  recipients: LoginOtpRecipient[];
  /** Whether the server currently asks for login codes (LOGIN_OTP_ENABLED). */
  otpEnabled: boolean;
};

const BASE = "/admin/settings/login-otp";

export const adminLoginOtpApi = {
  get: () => request<LoginOtpSettings>(BASE),

  add: (input: { email: string; label?: string }) =>
    request<{ recipient: LoginOtpRecipient }>(`${BASE}/recipients`, { method: "POST", body: input }).then(
      (data) => data.recipient,
    ),

  remove: (id: string) => request<void>(`${BASE}/recipients/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
