import { useState, type FormEvent } from "react";
import { Button, InputOTP, REGEXP_ONLY_DIGITS } from "@heroui/react";
import { Mail } from "lucide-react";
import { authApi, type AuthUser } from "../../api/auth.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { validateEmail } from "../../auth/validation.ts";
import { formatCountdown, useCountdown } from "../../hooks/use-countdown.ts";
import FormAlert from "../ui/FormAlert.tsx";
import TextInput from "../ui/TextInput.tsx";

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;

const CODE_LENGTH = 6;
const PHONE_PATTERN = /^\+?[0-9 ()-]{7,20}$/;

/** Server error codes that belong to the email field rather than the whole form. */
const EMAIL_FIELD_ERRORS = new Set(["EMAIL_TAKEN", "EMAIL_UNCHANGED", "EMAIL_REQUIRED"]);

export default function ContactDetailsSection() {
  const { user, setSessionUser } = useAuth();
  if (!user) return null;

  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Mail className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">Contact details</h2>
          <p className="text-xs text-ink-muted">
            {user.username
              ? `You log in with the username @${user.username}. Adding an email lets you reset your password yourself.`
              : "Your email is also your login."}
          </p>
        </div>
      </div>

      <div className="mt-5 flex max-w-md flex-col gap-6">
        <EmailForm user={user} onSaved={setSessionUser} />
        <PhoneForm user={user} onSaved={setSessionUser} />
      </div>
    </section>
  );
}

function PhoneForm({ user, onSaved }: { user: AuthUser; onSaved: (user: AuthUser) => void }) {
  const [phone, setPhone] = useState(user.phone ?? "");
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const dirty = phone.trim() !== (user.phone ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = phone.trim();
    const validationError = value && !PHONE_PATTERN.test(value) ? "Enter a valid phone number" : undefined;
    setError(validationError);
    setFeedback(null);
    if (validationError) return;

    setSaving(true);
    try {
      const updated = await authApi.updatePhone(value);
      onSaved(updated);
      setPhone(updated.phone ?? "");
      setFeedback({ status: "success", message: value ? "Phone number saved." : "Phone number removed." });
    } catch (err) {
      if (err instanceof ApiError) setError(err.fieldErrors().phone);
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <TextInput
        label="Phone (optional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+91"
        value={phone}
        onChange={setPhone}
        error={error}
      />
      {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
      <div>
        <Button type="submit" variant="outline" size="sm" isPending={saving} isDisabled={!dirty}>
          Save phone
        </Button>
      </div>
    </form>
  );
}

function EmailForm({ user, onSaved }: { user: AuthUser; onSaved: (user: AuthUser) => void }) {
  const [email, setEmail] = useState(user.email ?? "");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useCountdown(0);
  const [error, setError] = useState<string | undefined>();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState<"send" | "verify" | "remove" | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const dirty = email.trim().toLowerCase() !== (user.email ?? "");
  const canRemove = Boolean(user.username && user.email);

  function handleError(err: unknown) {
    if (err instanceof ApiError) {
      if (EMAIL_FIELD_ERRORS.has(err.code)) setError(err.message);
      if (err.code === "RESEND_COOLDOWN") {
        const details = err.details as { retryAfterSeconds?: number } | undefined;
        setCooldown(details?.retryAfterSeconds ?? 0);
      }
    }
    setFeedback({ status: "danger", message: errorMessage(err) });
  }

  async function sendCode(address: string): Promise<boolean> {
    setBusy("send");
    setError(undefined);
    setFeedback(null);
    try {
      const result = await authApi.requestEmailChange(address);
      setCooldown(result.resendAvailableInSeconds);
      if (!result.emailSent) {
        setFeedback({ status: "danger", message: "The code couldn't be sent. Please try again in a moment." });
        return false;
      }
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    const validationError = validateEmail(address);
    setError(validationError);
    if (validationError) return;
    if (await sendCode(address)) {
      setPendingEmail(address);
      setCode("");
    }
  }

  async function verify(value: string) {
    if (value.length !== CODE_LENGTH || busy) return;
    setBusy("verify");
    setFeedback(null);
    try {
      const updated = await authApi.confirmEmailChange(value);
      onSaved(updated);
      setEmail(updated.email ?? "");
      setPendingEmail(null);
      setFeedback({ status: "success", message: "Email verified and saved." });
    } catch (err) {
      handleError(err);
      setCode("");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("remove");
    setFeedback(null);
    try {
      const updated = await authApi.removeEmail();
      onSaved(updated);
      setEmail("");
      setFeedback({ status: "success", message: "Email removed." });
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(null);
      setConfirmingRemove(false);
    }
  }

  function cancelChange() {
    setPendingEmail(null);
    setCode("");
    setEmail(user.email ?? "");
    setFeedback(null);
  }

  if (pendingEmail) {
    return (
      <form
        noValidate
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void verify(code);
        }}
      >
        <p className="text-sm text-ink-body">
          We sent a 6-digit code to <strong className="font-semibold text-ink">{pendingEmail}</strong>. Enter it to
          confirm this email.
        </p>
        <InputOTP
          maxLength={CODE_LENGTH}
          pattern={REGEXP_ONLY_DIGITS}
          value={code}
          onChange={setCode}
          onComplete={(value: string) => void verify(value)}
          isInvalid={feedback?.status === "danger"}
          isDisabled={busy === "verify"}
          aria-label="Email verification code"
          autoFocus
        >
          <InputOTP.Group>
            {Array.from({ length: CODE_LENGTH }, (_, index) => (
              <InputOTP.Slot key={index} index={index} />
            ))}
          </InputOTP.Group>
        </InputOTP>
        {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" isPending={busy === "verify"} isDisabled={code.length !== CODE_LENGTH}>
            Verify
          </Button>
          <Button variant="ghost" size="sm" isDisabled={busy !== null} onPress={cancelChange}>
            Use a different email
          </Button>
        </div>
        <p className="text-xs text-ink-muted">
          Didn't get it?{" "}
          <button
            type="button"
            className="font-medium text-brand hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
            disabled={cooldown > 0 || busy !== null}
            onClick={async () => {
              if (await sendCode(pendingEmail)) {
                setFeedback({ status: "success", message: "A new code is on its way. Codes expire after 10 minutes." });
              }
            }}
          >
            Resend code
          </button>
          {cooldown > 0 && <> (available in {formatCountdown(cooldown)})</>}
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSend} noValidate className="flex flex-col gap-3">
      <TextInput
        label={user.username ? "Email (optional)" : "Email (login)"}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@business.com"
        value={email}
        onChange={setEmail}
        error={error}
        isRequired={!user.username}
        description={
          user.email
            ? user.emailVerified
              ? "Verified. A new address must be confirmed with a code."
              : "Not verified yet. Changing it requires a code sent to the new address."
            : "We'll send a code to confirm it before saving."
        }
      />
      {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="outline" size="sm" isPending={busy === "send"} isDisabled={!dirty || cooldown > 0}>
          {cooldown > 0 && dirty ? `Send code (${formatCountdown(cooldown)})` : "Send code"}
        </Button>
        {canRemove &&
          (confirmingRemove ? (
            <>
              <Button variant="ghost" size="sm" isDisabled={busy === "remove"} onPress={() => setConfirmingRemove(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" isPending={busy === "remove"} onPress={remove}>
                Confirm remove
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" isDisabled={busy !== null} onPress={() => setConfirmingRemove(true)}>
              Remove email
            </Button>
          ))}
      </div>
    </form>
  );
}
