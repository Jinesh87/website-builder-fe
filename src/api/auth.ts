import { request } from "./http.ts";

export type UserRole = "SUPER_ADMIN" | "CLIENT" | "PARTNER";
export type UserStatus = "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";

export type AuthUser = {
  id: string;
  email: string | null;
  username: string | null;
  fullName: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  client: { id: string; businessName: string; shopFeatureEnabled?: boolean } | null;
  createdAt: string;
};

type SessionResponse = { user: AuthUser };

export type VerificationDispatch = {
  email: string;
  emailSent: boolean;
  resendAvailableInSeconds: number;
};

export type SignupInput = {
  fullName: string;
  businessName: string;
  email: string;
  password: string;
  phone?: string;
  referralCode?: string;
  acceptTerms: boolean;
};

export type LoginInput = {
  /** Email or username. */
  identifier: string;
  password: string;
  remember: boolean;
};

/** Login answered with "check your email" instead of a session. */
export type LoginOtpChallenge = {
  otpRequired: true;
  challengeId: string;
  /** Masked inboxes the code was sent to. */
  sentTo: string[];
  expiresInMinutes: number;
  resendAvailableInSeconds: number;
};

export type LoginResponse = SessionResponse | LoginOtpChallenge;

export type ChangePasswordInput = {
  newPassword: string;
};

export const authApi = {
  signup: (input: SignupInput) =>
    request<VerificationDispatch>("/auth/signup", { method: "POST", body: input }),

  verifyEmail: (email: string, code: string) =>
    request<SessionResponse>("/auth/verify-email", { method: "POST", body: { email, code } }),

  resendVerification: (email: string) =>
    request<VerificationDispatch>("/auth/resend-verification", { method: "POST", body: { email } }),

  login: (input: LoginInput) => request<LoginResponse>("/auth/login", { method: "POST", body: input }),

  verifyLoginOtp: (challengeId: string, code: string) =>
    request<SessionResponse>("/auth/login/verify-otp", { method: "POST", body: { challengeId, code } }),

  resendLoginOtp: (challengeId: string) =>
    request<LoginOtpChallenge>("/auth/login/resend-otp", { method: "POST", body: { challengeId } }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  me: () => request<SessionResponse>("/auth/me"),

  forgotPassword: (email: string) =>
    request<void>("/auth/forgot-password", { method: "POST", body: { email } }),

  previewPasswordReset: (token: string) =>
    request<{ email: string; isInvite: boolean }>(`/auth/reset-password?token=${encodeURIComponent(token)}`),

  resetPassword: (token: string, password: string) =>
    request<SessionResponse>("/auth/reset-password", { method: "POST", body: { token, password } }),

  changePassword: (input: ChangePasswordInput) =>
    request<SessionResponse>("/auth/change-password", { method: "POST", body: input }),

  /** An empty string clears the phone number. */
  updatePhone: (phone: string) =>
    request<SessionResponse>("/auth/me", { method: "PATCH", body: { phone } }).then((data) => data.user),

  /** Emails a code to the new address; the email only changes after `confirmEmailChange`. */
  requestEmailChange: (email: string) =>
    request<VerificationDispatch>("/auth/me/email", { method: "POST", body: { email } }),

  confirmEmailChange: (code: string) =>
    request<SessionResponse>("/auth/me/email/verify", { method: "POST", body: { code } }).then((data) => data.user),

  removeEmail: () => request<SessionResponse>("/auth/me/email", { method: "DELETE" }).then((data) => data.user),
};
