import { Spinner } from "@heroui/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "../api/auth.ts";
import { useAuth } from "./auth-context.ts";
import { homeForRole } from "./home-for-role.ts";

function FullPageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas">
      <Spinner size="lg" aria-label="Loading" />
    </div>
  );
}

export type RedirectState = { from?: string };

export function RequireAuth({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!user) {
    const isPartnerRoute = location.pathname.startsWith("/partner");
    const loginTarget = isPartnerRoute ? "/partner/login" : "/login";
    const state: RedirectState = { from: `${location.pathname}${location.search}` };
    return <Navigate to={loginTarget} replace state={state} />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to={homeForRole(user)} replace />;
  return <Outlet />;
}

/**
 * Login/signup screens. Once a user is signed in (including right after logging in here)
 * they continue to the page they originally asked for, or their role's home screen.
 */
export function GuestOnly() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  if (user) {
    if (location.pathname === "/partner/login") {
      if (user.role === "PARTNER") {
        return <Navigate to="/partner/dashboard" replace />;
      }
      // If a non-partner (e.g. CLIENT) visits /partner/login, allow them to view the page
      // so they can log in with a partner account instead of being bounced to /dashboard.
      return <Outlet />;
    }
    if (location.pathname === "/login") {
      if (user.role === "PARTNER") {
        // If a partner visits /login, allow them to view the page so LoginPage can show
        // the validation rejection message or partner notice instead of bouncing them.
        return <Outlet />;
      }
    }
    const from = (location.state as RedirectState | null)?.from;
    return <Navigate to={from ?? homeForRole(user)} replace />;
  }
  return <Outlet />;
}
