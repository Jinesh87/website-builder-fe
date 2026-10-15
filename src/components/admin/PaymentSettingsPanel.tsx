import { useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { Check, Copy, CreditCard, Eye, EyeOff } from "lucide-react";
import { ApiError, errorMessage } from "../../api/http.ts";
import { adminPaymentsApi, type PaymentConfig, type PaymentConfigInput } from "../../api/wallet.ts";
import { env } from "../../config/env.ts";
import FormAlert from "../ui/FormAlert.tsx";
import TextInput from "../ui/TextInput.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;
type Errors = Partial<Record<keyof PaymentConfigInput, string>>;

const WEBHOOK_URL = `${env.apiUrl.replace(/\/$/, "")}/payments/razorpay/webhook`;
const KEY_ID_PATTERN = /^rzp_(test|live)_[A-Za-z0-9]+$/;

export function PaymentStatusChip({ config }: { config: PaymentConfig }) {
  if (!config.configured) return <Chip color="warning">Not configured</Chip>;
  return <Chip color={config.mode === "live" ? "success" : "accent"}>{config.mode === "live" ? "Live mode" : "Test mode"}</Chip>;
}

type SecretField = "razorpayKeySecret" | "razorpayWebhookSecret";

function RevealButton({ shown, disabled, onToggle }: { shown: boolean; disabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="absolute right-3 top-8.5 cursor-pointer text-ink-muted transition-colors hover:text-ink disabled:cursor-wait disabled:opacity-50"
      title={shown ? "Hide secret" : "Show secret"}
      aria-label={shown ? "Hide secret" : "Show secret"}
    >
      {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}

export default function PaymentSettingsPanel({ onLoaded }: { onLoaded?: (config: PaymentConfig) => void }) {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<Required<PaymentConfigInput>>({ razorpayKeyId: "", razorpayKeySecret: "", razorpayWebhookSecret: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState<Record<SecretField, boolean>>({ razorpayKeySecret: false, razorpayWebhookSecret: false });
  /** Saved secrets, fetched the first time the admin clicks the eye. */
  const [savedSecrets, setSavedSecrets] = useState<Record<SecretField, string | null> | null>(null);
  const [revealing, setRevealing] = useState(false);

  function apply(loaded: PaymentConfig) {
    setConfig(loaded);
    setForm({ razorpayKeyId: loaded.razorpayKeyId ?? "", razorpayKeySecret: "", razorpayWebhookSecret: "" });
    setShown({ razorpayKeySecret: false, razorpayWebhookSecret: false });
    setSavedSecrets(null);
    onLoaded?.(loaded);
  }

  /** Shows what's typed, or the saved secret when the box is empty; hiding puts an untouched saved secret away again. */
  async function toggleSecret(field: SecretField) {
    if (shown[field]) {
      setShown((current) => ({ ...current, [field]: false }));
      if (savedSecrets && form[field] === savedSecrets[field]) setForm((current) => ({ ...current, [field]: "" }));
      return;
    }
    if (!form[field]) {
      let secrets = savedSecrets;
      if (!secrets) {
        setRevealing(true);
        try {
          secrets = await adminPaymentsApi.revealSecrets();
          setSavedSecrets(secrets);
        } catch (err) {
          setFeedback({ status: "danger", message: errorMessage(err) });
          return;
        } finally {
          setRevealing(false);
        }
      }
      const value = secrets[field];
      if (value) setForm((current) => ({ ...current, [field]: value }));
    }
    setShown((current) => ({ ...current, [field]: true }));
  }

  /** A revealed saved secret that wasn't edited is left out, so saving doesn't re-send it. */
  function changedSecret(field: SecretField): string | undefined {
    const value = form[field].trim();
    return value && value !== savedSecrets?.[field] ? value : undefined;
  }

  useEffect(() => {
    adminPaymentsApi
      .get()
      .then(apply)
      .catch((err: unknown) => setLoadError(errorMessage(err)));
  }, []);

  function update(key: keyof PaymentConfigInput) {
    return (value: string) => setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyId = form.razorpayKeyId.trim();
    const nextErrors: Errors = {
      razorpayKeyId: KEY_ID_PATTERN.test(keyId) ? undefined : 'Key ID starts with "rzp_test_" or "rzp_live_"',
      razorpayKeySecret: !config?.configured && !form.razorpayKeySecret.trim() ? "Key secret is required" : undefined,
    };
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      const saved = await adminPaymentsApi.update({
        razorpayKeyId: keyId,
        razorpayKeySecret: changedSecret("razorpayKeySecret"),
        razorpayWebhookSecret: changedSecret("razorpayWebhookSecret"),
      });
      apply(saved);
      setFeedback({ status: "success", message: "Razorpay settings saved. The keys were checked with Razorpay." });
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function copyWebhookUrl() {
    await navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loadError) {
    return (
      <div className="max-w-2xl">
        <FormAlert status="danger">{loadError}</FormAlert>
      </div>
    );
  }
  if (!config) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner aria-label="Loading payment settings" />
      </div>
    );
  }

  return (
    <div className="grid max-w-2xl gap-6">
      <form onSubmit={handleSave} noValidate className="rounded-xl border border-line bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <CreditCard className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Razorpay</h2>
            <p className="text-xs text-ink-muted">Clients buy connects through Razorpay Checkout.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <TextInput
            label="Key ID"
            name="razorpayKeyId"
            autoComplete="off"
            placeholder="rzp_test_..."
            description="Razorpay Dashboard → Account & Settings → API Keys. Use rzp_test_ keys while testing."
            value={form.razorpayKeyId}
            onChange={update("razorpayKeyId")}
            error={errors.razorpayKeyId}
          />
          <div className="relative">
            <TextInput
              label="Key secret"
              name="razorpayKeySecret"
              type={shown.razorpayKeySecret ? "text" : "password"}
              autoComplete="off"
              placeholder={config.razorpayKeySecretMasked ?? ""}
              description={config.configured ? "Leave blank to keep the current secret." : "Shown once when you generate the key."}
              value={form.razorpayKeySecret}
              onChange={update("razorpayKeySecret")}
              error={errors.razorpayKeySecret}
            />
            <RevealButton
              shown={shown.razorpayKeySecret}
              disabled={revealing}
              onToggle={() => void toggleSecret("razorpayKeySecret")}
            />
          </div>
          <div className="relative">
            <TextInput
              label="Webhook secret"
              name="razorpayWebhookSecret"
              type={shown.razorpayWebhookSecret ? "text" : "password"}
              autoComplete="off"
              placeholder={config.webhookConfigured ? "••••••••" : ""}
              description={
                config.webhookConfigured
                  ? "Leave blank to keep the current secret."
                  : "The secret you choose when adding the webhook below. Recommended: it adds connects even if the client closes the page mid-payment."
              }
              value={form.razorpayWebhookSecret}
              onChange={update("razorpayWebhookSecret")}
              error={errors.razorpayWebhookSecret}
            />
            <RevealButton
              shown={shown.razorpayWebhookSecret}
              disabled={revealing}
              onToggle={() => void toggleSecret("razorpayWebhookSecret")}
            />
          </div>

          <div className="rounded-lg border border-line bg-canvas/60 p-3.5 text-xs text-ink-body">
            <p className="font-semibold text-ink">Webhook</p>
            <p className="mt-1">
              In Razorpay Dashboard → Webhooks, add this URL with the events <span className="font-mono">payment.captured</span>,{" "}
              <span className="font-mono">order.paid</span> and <span className="font-mono">payment.failed</span>:
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-surface px-2 py-1.5 font-mono text-[11px]">
                {WEBHOOK_URL}
              </code>
              <Button size="sm" variant="outline" onPress={() => void copyWebhookUrl()}>
                {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-2 text-ink-muted">Razorpay must be able to reach this URL, so it only works once the API is public.</p>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-line p-3.5 text-xs text-ink-body">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
            <span>Secrets are encrypted at rest with AES-256-GCM. Only a super admin can reveal them, with the eye button.</span>
          </div>

          {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}

          <div>
            <Button type="submit" isPending={saving}>
              Save payment settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
