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
  const { login } = useAuth();
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
      // On success the guest-only route guard redirects to the right home screen.
      await login({ identifier: trimmed, password, remember });
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
    </AuthSplitLayout>
  );
}
