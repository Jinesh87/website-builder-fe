import { useState, type FormEvent } from "react";
import { Button, Checkbox, Label } from "@heroui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError, errorMessage } from "../../api/http.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { validateEmail } from "../../auth/validation.ts";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TextInput from "../../components/ui/TextInput.tsx";
import AuthSplitLayout from "../../layouts/AuthSplitLayout.tsx";

export default function PartnerLoginPage() {
  const { user: currentUser, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = identifier.trim();
    const errors = {
      identifier: !trimmed
        ? "Email or username is required"
        : trimmed.includes("@")
          ? validateEmail(trimmed)
          : undefined,
      password: password ? undefined : "Password is required",
    };
    setFieldErrors(errors);
    setError(null);
    if (errors.identifier || errors.password) return;

    setSubmitting(true);
    try {
      const user = await login({ identifier: trimmed, password, remember });
      if (user.role !== "PARTNER") {
        await logout();
        setError(
          "This account is registered as a Client, not an approved Partner. If your application was submitted recently, please wait for admin approval. Otherwise, please sign in via the client portal."
        );
        setSubmitting(false);
        return;
      }
      navigate("/partner/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setError("Your account password has not been set yet. Please check your partner approval email for your activation link.");
      } else {
        setError(errorMessage(err));
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      heading="Welcome back"
      description="Access your dedicated partner dashboard to manage your referral link, track live conversions, and view commissions."
    >
      <h2 className="text-2xl font-semibold text-ink">Partner login</h2>
      <p className="mt-1 text-sm text-ink-body">
        New here?{" "}
        <Link to="/partner" state={location.state} className="font-medium text-brand hover:underline">
          Apply to become a partner
        </Link>
      </p>

      {currentUser && currentUser.role !== "PARTNER" && (
        <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-800">
          You are currently signed in as <strong>{currentUser.email}</strong> ({currentUser.role.toLowerCase()}). Please sign in with an approved Partner account below.
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
          </FormAlert>
        )}
      </form>

      <div className="mt-6 pt-5 border-t border-line text-center">
        <p className="text-xs text-ink-muted">
          Client or Super Admin?{" "}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Sign in to main portal →
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
