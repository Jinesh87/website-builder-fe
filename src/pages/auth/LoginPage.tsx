import { useState, type FormEvent } from "react";
import { Button, Checkbox, Label } from "@heroui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { validateEmail } from "../../auth/validation.ts";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TextInput from "../../components/ui/TextInput.tsx";
import AuthSplitLayout from "../../layouts/AuthSplitLayout.tsx";
import type { VerifyEmailState } from "./VerifyEmailPage.tsx";

export default function LoginPage() {
  const { user: currentUser, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = identifier.trim();
    const errors = {
      // Usernames can't contain "@", so anything with one must be a valid email.
      identifier: !trimmed ? "Email or username is required" : trimmed.includes("@") ? validateEmail(trimmed) : undefined,
      password: password ? undefined : "Password is required",
    };
    setFieldErrors(errors);
    setError(null);
    setUnverifiedEmail(null);
    if (errors.identifier || errors.password) return;

    setSubmitting(true);
    try {
      const user = await login({ identifier: trimmed, password, remember });
      if (user.role === "PARTNER") {
        await logout();
        setError(
          "This account is registered as a Partner. Please sign in via the Partner Portal below."
        );
        setSubmitting(false);
        return;
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(trimmed.toLowerCase());
      }
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  async function continueToVerification() {
    if (!unverifiedEmail) return;
    setSendingCode(true);
    let resendAvailableInSeconds: number | undefined;
    try {
      ({ resendAvailableInSeconds } = await authApi.resendVerification(unverifiedEmail));
    } catch (err) {
      // A code sent moments ago is still valid, so a cooldown is fine to continue with.
      if (!(err instanceof ApiError && err.code === "RESEND_COOLDOWN")) {
        setError(errorMessage(err));
        setSendingCode(false);
        return;
      }
      const details = err.details as { retryAfterSeconds?: number } | undefined;
      resendAvailableInSeconds = details?.retryAfterSeconds;
    }
    const state: VerifyEmailState = { email: unverifiedEmail, resendAvailableInSeconds };
    navigate("/verify-email", { state });
  }

  return (
    <AuthSplitLayout
      heading="Welcome back"
      description="Super Admin and clients use the same login. Super Admins go to Clients, and clients go to their dashboard."
    >
      <h2 className="text-2xl font-semibold text-ink">Log in</h2>
      <p className="mt-1 text-sm text-ink-body">
        New here?{" "}
        <Link to="/signup" state={location.state} className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>

      {currentUser && currentUser.role === "PARTNER" && (
        <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-800">
          You are currently signed in as a Partner (<strong>{currentUser.email}</strong>). Please sign in with a Client or Admin account below, or visit the{" "}
          <Link to="/partner/dashboard" className="font-semibold underline">
            Partner Dashboard →
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
        <TextInput
          label="Email or username"
          name="username"
          autoComplete="username"
          placeholder="you@business.com"
          value={identifier}
          onChange={setIdentifier}
          error={fieldErrors.identifier}
          autoFocus
        />
        <TextInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
        />

        <div className="flex items-center justify-between">
          <Checkbox isSelected={remember} onChange={setRemember}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Label className="text-sm text-ink-body">Remember me</Label>
            </Checkbox.Content>
          </Checkbox>
          <Link to="/forgot-password" className="text-sm text-brand hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth isPending={submitting}>
          Log in
        </Button>

        {error && (
          <FormAlert status="danger">
            {error}
            {unverifiedEmail && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                isPending={sendingCode}
                onPress={continueToVerification}
              >
                Enter verification code
              </Button>
            )}
          </FormAlert>
        )}
      </form>

      <div className="mt-6 pt-5 border-t border-line text-center">
        <p className="text-xs text-ink-muted">
          Looking for the Partner Portal?{" "}
          <Link to="/partner/login" className="font-semibold text-brand hover:underline">
            Partner Sign In →
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
