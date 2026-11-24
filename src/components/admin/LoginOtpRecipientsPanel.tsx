import { useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { Lock, Trash2 } from "lucide-react";
import { adminLoginOtpApi, type LoginOtpRecipient, type LoginOtpSettings } from "../../api/admin-login-otp.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { validateEmail } from "../../auth/validation.ts";
import ConfirmDialog from "../ui/ConfirmDialog.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextInput from "../ui/TextInput.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

/** Super Admin: every email listed here also receives the Super Admin login code, so the login can be shared. */
export default function LoginOtpRecipientsPanel() {
  const [settings, setSettings] = useState<LoginOtpSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; label?: string }>({});
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingRemove, setPendingRemove] = useState<LoginOtpRecipient | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminLoginOtpApi
      .get()
      .then((loaded) => !cancelled && setSettings(loaded))
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = { email: validateEmail(email) };
    setFieldErrors(errors);
    setFeedback(null);
    if (errors.email) return;

    setAdding(true);
    try {
      const recipient = await adminLoginOtpApi.add({ email: email.trim(), label: label.trim() });
      setSettings((current) => current && { ...current, recipients: [...current.recipients, recipient] });
      setEmail("");
      setLabel("");
      setFeedback({ status: "success", message: `${recipient.email} will now receive the login code.` });
    } catch (err) {
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors());
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setAdding(false);
    }
  }

  async function confirmRemove() {
    if (!pendingRemove) return;
    setRemoving(true);
    try {
      await adminLoginOtpApi.remove(pendingRemove.id);
      setSettings(
        (current) => current && { ...current, recipients: current.recipients.filter((r) => r.id !== pendingRemove.id) },
      );
      setFeedback({ status: "success", message: `${pendingRemove.email} removed.` });
      setPendingRemove(null);
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setRemoving(false);
    }
  }

  if (loadError) return <FormAlert status="danger">{loadError}</FormAlert>;
  if (!settings) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner aria-label="Loading login security settings" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl rounded-xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h2 className="text-base font-semibold text-ink">Super Admin login codes</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            After the password, a 6-digit code is emailed to every address below. Anyone with one of these inboxes can
            complete the Super Admin login. Clients and partners get the code on their own email only.
          </p>
        </div>
        {settings.otpEnabled ? <Chip color="success">Codes on</Chip> : <Chip color="warning">Codes off</Chip>}
      </div>

      {!settings.otpEnabled && (
        <div className="mt-4">
          <FormAlert status="warning">
            Login codes are turned off on this server (LOGIN_OTP_ENABLED). The list is saved and used once they're on.
          </FormAlert>
        </div>
      )}

      <ul className="mt-5 divide-y divide-line rounded-lg border border-line">
        {settings.accountEmail && (
          <li className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{settings.accountEmail}</p>
              <p className="text-xs text-ink-muted">Account email · always receives the code</p>
            </div>
            <Lock className="size-4 shrink-0 text-ink-muted" aria-label="Can't be removed" />
          </li>
        )}
        {settings.recipients.map((recipient) => (
          <li key={recipient.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{recipient.email}</p>
              {recipient.label && <p className="text-xs text-ink-muted">{recipient.label}</p>}
            </div>
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              aria-label={`Remove ${recipient.email}`}
              onPress={() => setPendingRemove(recipient)}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} noValidate className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
        <TextInput
          label="Email"
          name="otpRecipientEmail"
          type="email"
          placeholder="teammate@business.com"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
        />
        <TextInput
          label="Label (optional)"
          name="otpRecipientLabel"
          placeholder="e.g. Operations team"
          value={label}
          onChange={setLabel}
          error={fieldErrors.label}
        />
        <Button type="submit" className="sm:mt-6" isPending={adding}>
          Add email
        </Button>
      </form>

      {feedback && (
        <div className="mt-4">
          <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
        </div>
      )}

      <ConfirmDialog
        isOpen={pendingRemove !== null}
        title="Remove this email?"
        subtitle={pendingRemove?.email}
        confirmLabel="Remove"
        tone="danger"
        isPending={removing}
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      >
        It will stop receiving Super Admin login codes straight away.
      </ConfirmDialog>
    </div>
  );
}
