import { useEffect, useState, type FormEvent } from "react";
import { Button, Spinner } from "@heroui/react";
import { ShieldAlert, Sparkles } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/auth.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { homeForRole } from "../../auth/home-for-role.ts";
import { PASSWORD_HINT, validatePassword } from "../../auth/validation.ts";
import BrandLogo from "../../components/BrandLogo.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";

type LinkState =
  | { status: "checking" }
  | { status: "valid"; email: string; isInvite: boolean }
  | { status: "invalid"; message: string };

export default function PartnerSetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { setSessionUser } = useAuth();

  const [link, setLink] = useState<LinkState>({ status: "checking" });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setLink({
        status: "invalid",
        message: "No activation token found in the link. Please check your partner approval email.",
      });
      return;
    }

    authApi
      .previewPasswordReset(token)
      .then(({ email, isInvite }) => {
        if (!cancelled) setLink({ status: "valid", email, isInvite });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError && err.status === 400
            ? "This partner activation link is invalid or has expired."
            : errorMessage(err);
        setLink({ status: "invalid", message });
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = {
      password: validatePassword(password),
      confirm: password === confirm ? undefined : "Passwords do not match",
    };
    setErrors(nextErrors);
    setError(null);
    if (nextErrors.password || nextErrors.confirm) return;

    setSubmitting(true);
    try {
      const { user } = await authApi.resetPassword(token, password);
      setSessionUser(user);
      navigate(homeForRole(user) || "/partner/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  if (link.status === "checking") {
    return (
      <div className="min-h-screen bg-canvas dark:bg-[#0B0F19] text-ink dark:text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <BrandLogo />
          <div className="flex items-center gap-2 text-ink-muted dark:text-slate-400 text-sm mt-4">
            <Spinner size="sm" aria-label="Validating activation link" />
            <span>Validating partner activation link...</span>
          </div>
        </div>
      </div>
    );
  }

  if (link.status === "invalid") {
    return (
      <div className="min-h-screen bg-canvas dark:bg-[#0B0F19] text-ink dark:text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface dark:bg-[#121826] border border-line dark:border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <BrandLogo />
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand bg-brand-soft dark:text-blue-400 dark:bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 font-semibold">
              Partner Portal
            </span>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-sm mb-6">
            <ShieldAlert className="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <p className="leading-relaxed">{link.message}</p>
          </div>

          <p className="text-xs text-ink-muted dark:text-slate-400 mb-6 leading-relaxed">
            If your application was approved, you can request a new password link or contact the partnership team for assistance.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/forgot-password"
              className="w-full text-center py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-sm transition-colors shadow-sm"
            >
              Request New Link
            </Link>
            <Link
              to="/partner/login"
              className="w-full text-center py-2.5 px-4 rounded-xl border border-line dark:border-slate-800 hover:bg-canvas dark:hover:bg-slate-800/50 text-ink dark:text-slate-300 text-sm font-medium transition-colors"
            >
              Back to Partner Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-[#0B0F19] text-ink dark:text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <BrandLogo />
          <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1.5 font-semibold">
            <Sparkles className="size-3" />
            Approved Partner
          </span>
        </div>

        <div className="bg-surface dark:bg-[#121826] border border-line dark:border-slate-800 rounded-2xl p-7 sm:p-8 shadow-xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-ink dark:text-white tracking-tight">Set your password</h1>
            <p className="mt-1.5 text-sm text-ink-muted dark:text-slate-400 leading-relaxed">
              Your partner application is approved. Choose a secure password to activate your account and access your dashboard.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-canvas dark:bg-slate-900/80 border border-line dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-ink-muted dark:text-slate-400 font-medium">Partner Account</span>
            <span className="text-xs font-semibold text-brand dark:text-blue-400 font-mono">{link.email}</span>
          </div>

          {error && <FormAlert status="danger">{error}</FormAlert>}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface dark:bg-slate-900 border border-line dark:border-slate-800 text-ink dark:text-white text-sm placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:border-brand dark:focus:border-blue-500 focus:ring-1 focus:ring-brand dark:focus:ring-blue-500 transition-colors shadow-xs"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{errors.password}</p>
              )}
              <p className="mt-1 text-[11px] text-ink-muted dark:text-slate-500">{PASSWORD_HINT}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface dark:bg-slate-900 border border-line dark:border-slate-800 text-ink dark:text-white text-sm placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:border-brand dark:focus:border-blue-500 focus:ring-1 focus:ring-brand dark:focus:ring-blue-500 transition-colors shadow-xs"
              />
              {errors.confirm && (
                <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{errors.confirm}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                isPending={submitting}
                className="bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-xl shadow-md text-sm cursor-pointer"
              >
                Set Password & Access Dashboard
              </Button>
            </div>
          </form>

          <div className="pt-2 text-center border-t border-line dark:border-slate-800/80">
            <Link
              to="/partner/login"
              className="text-xs text-ink-muted dark:text-slate-400 hover:text-ink dark:hover:text-white transition-colors"
            >
              Already set your password? <span className="text-brand dark:text-blue-400 font-semibold underline">Log in here</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
