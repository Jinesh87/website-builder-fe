import { useState, type FormEvent } from "react";
import { Button } from "@heroui/react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth.ts";
import { errorMessage } from "../../api/http.ts";
import { validateEmail } from "../../auth/validation.ts";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TextInput from "../../components/ui/TextInput.tsx";
import AuthCardLayout from "../../layouts/AuthCardLayout.tsx";

function BackToLogin() {
  return (
    <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
      <ArrowLeft className="size-4" aria-hidden /> Back to log in
    </Link>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function requestLink(address: string): Promise<boolean> {
    setSubmitting(true);
    setError(null);
    try {
      await authApi.forgotPassword(address);
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateEmail(email);
    setFieldError(validationError);
    if (validationError) return;
    const address = email.trim();
    if (await requestLink(address)) setSentTo(address);
  }

  if (sentTo) {
    return (
      <AuthCardLayout>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">Step 2</p>
        <h1 className="mt-2 text-xl font-semibold text-ink">Check your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-body">
          If an account exists for <strong className="font-semibold text-ink">{sentTo}</strong>, a reset link is on
          its way. The link expires in 1 hour.
        </p>
        <div className="mt-5 grid h-24 place-items-center rounded-lg bg-canvas text-brand">
          <MailCheck className="size-9" aria-hidden />
        </div>
        <Button
          fullWidth
          variant="outline"
          className="mt-5"
          isPending={submitting}
          onPress={async () => setResent(await requestLink(sentTo))}
        >
          Resend link
        </Button>
        <div className="mt-4 space-y-3">
          {resent && !error && <FormAlert status="success">We've sent another link.</FormAlert>}
          {error && <FormAlert status="danger">{error}</FormAlert>}
        </div>
        <div className="mt-5">
          <BackToLogin />
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">Step 1</p>
      <h1 className="mt-2 text-xl font-semibold text-ink">Forgot your password?</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-body">
        Enter your email. We will send a link to set a new password.
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        Log in with a username? Ask your administrator to reset your password.
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
        <TextInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@business.com"
          value={email}
          onChange={setEmail}
          error={fieldError}
          autoFocus
        />
        <Button type="submit" fullWidth isPending={submitting}>
          Send reset link
        </Button>
        {error && <FormAlert status="danger">{error}</FormAlert>}
        <BackToLogin />
      </form>
    </AuthCardLayout>
  );
}
