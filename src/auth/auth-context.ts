import { createContext, useContext } from "react";
import type { AuthUser, LoginInput, LoginOtpChallenge } from "../api/auth.ts";

export type AuthContextValue = {
  user: AuthUser | null;
  /** True until the initial session check finishes. */
  loading: boolean;
  /** Resolves to the signed-in user, or to an OTP challenge when an emailed code is still needed. */
  login: (input: LoginInput) => Promise<LoginOutcome>;
  logout: () => Promise<void>;
  /** Store a user returned by a session-creating call (verify email, reset password). */
  setSessionUser: (user: AuthUser) => void;
};

export type LoginOutcome = { user: AuthUser; challenge?: undefined } | { user?: undefined; challenge: LoginOtpChallenge };

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
