import { useState } from "react";
import { Button, InputOTP, REGEXP_ONLY_DIGITS } from "@heroui/react";
import { ShieldCheck } from "lucide-react";
import { authApi, type AuthUser, type LoginOtpChallenge } from "../../api/auth.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { formatCountdown, useCountdown } from "../../hooks/use-countdown.ts";
import FormAlert from "../ui/FormAlert.tsx";

const CODE_LENGTH = 6;

/** Login errors that mean this pending login is gone and the password must be entered again. */
const RESTART_CODES = new Set(["LOGIN_CHALLENGE_EXPIRED", "CODE_EXPIRED", "CODE_ATTEMPTS_EXCEEDED", "LOGIN_LOCKED"]);

type Props = {
  challenge: LoginOtpChallenge;
  /** Called with the signed-in user once the code is accepted (the session cookies are already set). */
  onVerified: (user: AuthUser) => void | Promise<void>;
  /** Back to the password form, optionally with an error to show there. */
  onBack: (error?: string) => void;
};

/** Second login step: the 6-digit code emailed after a correct password. */
export default function LoginOtpStep({ challenge: initial, onVerified, onBack }: Props) {
  const [challenge, setChallenge] = useState(initial);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useCountdown(initial.resendAvailableInSeconds);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  async function verify(value: string) {
    if (value.length !== CODE_LENGTH || verifying) return;
    setVerifying(true);
    setError(null);
    setNotice(null);
    try {
      const { user } = await authApi.verifyLoginOtp(challenge.challengeId, value);
      await onVerified(user);
    } catch (err) {
      if (err instanceof ApiError && RESTART_CODES.has(err.code)) {
        onBack(err.message);
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
      const next = await authApi.resendLoginOtp(challenge.challengeId);
      setChallenge(next);
      setCooldown(next.resendAvailableInSeconds);
      setCode("");
      setNotice(`A new code is on its way. It expires in ${next.expiresInMinutes} minutes.`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "LOGIN_CHALLENGE_EXPIRED") {
        onBack(err.message);
        return;
      }
      if (err instanceof ApiError && err.code === "RESEND_COOLDOWN") {
        const details = err.details as { retryAfterSeconds?: number } | undefined;
        setCooldown(details?.retryAfterSeconds ?? 0);
      }
      setError(errorMessage(err));
    } finally {
      setResending(false);
    }
  }

  const recipients = challenge.sentTo;

  return (
    <form
      className="mt-7 text-center"
      onSubmit={(event) => {
        event.preventDefault();
        void verify(code);
      }}
    >
      <ShieldCheck className="mx-auto size-8 text-brand" aria-hidden />
      <h3 className="mt-3 text-lg font-semibold text-ink">Enter your login code</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-body">
        We sent a 6-digit code to{" "}
        {recipients.length === 1 ? (
          <strong className="font-semibold text-ink">{recipients[0]}</strong>
        ) : (
          <>{recipients.length} inboxes</>
        )}
        . It expires in {challenge.expiresInMinutes} minutes.
      </p>
      {recipients.length > 1 && (
        <p className="mt-1 text-xs text-ink-muted">{recipients.join(", ")}</p>
      )}

      <div className="mt-6 flex justify-center">
        <InputOTP
          maxLength={CODE_LENGTH}
          pattern={REGEXP_ONLY_DIGITS}
          value={code}
          onChange={setCode}
          onComplete={(value: string) => void verify(value)}
          isInvalid={Boolean(error)}
          isDisabled={verifying}
          aria-label="Login code"
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
        Verify and log in
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
        <button type="button" className="font-medium text-brand hover:underline" onClick={() => onBack()}>
          Use a different account
        </button>
      </p>
    </form>
  );
}
