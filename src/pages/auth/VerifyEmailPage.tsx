import { useState } from "react";
import { Button, InputOTP, REGEXP_ONLY_DIGITS } from "@heroui/react";
import { Check, Mail } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { authApi, type AuthUser } from "../../api/auth.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { homeForRole } from "../../auth/home-for-role.ts";
import FormAlert from "../../components/ui/FormAlert.tsx";
import { formatCountdown, useCountdown } from "../../hooks/use-countdown.ts";
import AuthCardLayout from "../../layouts/AuthCardLayout.tsx";

export type VerifyEmailState = {
  email: string;
  resendAvailableInSeconds?: number;
  /** In-app path to continue to once verified, e.g. creating a site from a chosen template. */
  from?: string;
};

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  const state = useLocation().state as VerifyEmailState | null;
  if (!state?.email) return <Navigate to="/login" replace />;
  return (
    <VerifyEmailForm email={state.email} initialCooldown={state.resendAvailableInSeconds ?? 0} from={state.from} />
  );
}

function VerifyEmailForm({ email, initialCooldown, from }: { email: string; initialCooldown: number; from?: string }) {
  const navigate = useNavigate();
  const { setSessionUser } = useAuth();
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useCountdown(initialCooldown);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<AuthUser | null>(null);

  async function verify(value: string) {
    if (value.length !== CODE_LENGTH || verifying) return;
    setVerifying(true);
    setError(null);
    setNotice(null);
    try {
      const { user } = await authApi.verifyEmail(email, value);
      setSessionUser(user);
      setVerifiedUser(user);
    } catch (err) {
      if (err instanceof ApiError && err.code === "ALREADY_VERIFIED") {
        navigate("/login", { replace: true, state: from ? { from } : undefined });
        return;
      }
      setError(errorMessage(err));
      setCode("");
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      const result = await authApi.resendVerification(email);
      setCooldown(result.resendAvailableInSeconds);
      setNotice("A new code is on its way. Codes expire after 10 minutes.");
    } catch (err) {
      if (err instanceof ApiError && err.code === "RESEND_COOLDOWN") {
        const details = err.details as { retryAfterSeconds?: number } | undefined;
        setCooldown(details?.retryAfterSeconds ?? 0);
      }
      setError(errorMessage(err));
    } finally {
      setResending(false);
    }
  }

  if (verifiedUser) {
    return (
      <AuthCardLayout>
        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <Check className="size-6" aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-semibold text-ink">Email verified</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-body">
            {from
              ? "Your account and workspace are ready. Continue to set up your website from the template you chose."
              : "Your account and workspace are ready. Create your first website from the dashboard."}
          </p>
          <Button fullWidth className="mt-6" onPress={() => navigate(from ?? homeForRole(verifiedUser), { replace: true })}>
            {from ? "Continue" : "Go to dashboard"}
          </Button>
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout>
      <form
        className="text-center"
        onSubmit={(event) => {
          event.preventDefault();
          void verify(code);
        }}
      >
        <Mail className="mx-auto size-8 text-brand" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold text-ink">Verify your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-body">
          We sent a 6-digit code to <strong className="font-semibold text-ink">{email}</strong>. Enter it below.
        </p>

        <div className="mt-6 flex justify-center">
          <InputOTP
            maxLength={CODE_LENGTH}
            pattern={REGEXP_ONLY_DIGITS}
            value={code}
            onChange={setCode}
            onComplete={(value: string) => void verify(value)}
            isInvalid={Boolean(error)}
            isDisabled={verifying}
            aria-label="Verification code"
            autoFocus
          >
            <InputOTP.Group>
              {Array.from({ length: CODE_LENGTH }, (_, index) => (
                <InputOTP.Slot key={index} index={index} />
              ))}
            </InputOTP.Group>
          </InputOTP>
        </div>

        <Button type="submit" fullWidth className="mt-6" isPending={verifying} isDisabled={code.length !== CODE_LENGTH}>
          Verify
        </Button>

        <div className="mt-4 space-y-3 text-left">
          {error && <FormAlert status="danger">{error}</FormAlert>}
          {notice && <FormAlert status="success">{notice}</FormAlert>}
        </div>

        <p className="mt-4 text-xs text-ink-muted">
          Didn't get it?{" "}
          <button
            type="button"
            className="font-medium text-brand hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
            disabled={cooldown > 0 || resending}
            onClick={resend}
          >
            Resend code
          </button>
          {cooldown > 0 && <> (available in {formatCountdown(cooldown)})</>}
          {" · "}
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Change email
          </Link>
        </p>
      </form>
    </AuthCardLayout>
  );
}
