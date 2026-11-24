import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, type AuthUser, type LoginInput } from "../api/auth.ts";
import { setSessionExpiredHandler } from "../api/http.ts";
import { AuthContext, type AuthContextValue, type LoginOutcome } from "./auth-context.ts";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then(({ user: me }) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput): Promise<LoginOutcome> => {
    const result = await authApi.login(input);
    if ("otpRequired" in result) return { challenge: result };
    setUser(result.user);
    return { user: result.user };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout, setSessionUser: setUser }),
    [user, loading, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
