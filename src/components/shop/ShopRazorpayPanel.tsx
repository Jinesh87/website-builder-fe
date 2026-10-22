import { useEffect, useState, type FormEvent } from "react";
import { Button, Spinner } from "@heroui/react";
import { Check, Copy, CreditCard, Eye, EyeOff } from "lucide-react";
import { ApiError, errorMessage } from "../../api/http.ts";
import { shopApi, type ShopPaymentConfig, type ShopPaymentInput } from "../../api/shop.ts";
import { PaymentStatusChip } from "../admin/PaymentSettingsPanel.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextInput from "../ui/TextInput.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;
type Errors = Partial<Record<keyof ShopPaymentInput, string>>;
type SecretField = "razorpayKeySecret" | "razorpayWebhookSecret";

const KEY_ID_PATTERN = /^rzp_(test|live)_[A-Za-z0-9]+$/;

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

function CopyRow({ label, value, hint }: { label: string; value: string; hint: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-lg border border-line bg-canvas/60 p-3.5 text-xs text-ink-body">
      <p className="font-semibold text-ink">{label}</p>
      <p className="mt-1">{hint}</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-surface px-2 py-1.5 font-mono text-[11px]">{value}</code>
        <Button size="sm" variant="outline" onPress={() => void copy()}>
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

export default function ShopRazorpayPanel({ websiteId }: { websiteId: string }) {
  const [config, setConfig] = useState<ShopPaymentConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<Required<ShopPaymentInput>>({ razorpayKeyId: "", razorpayKeySecret: "", razorpayWebhookSecret: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [shown, setShown] = useState<Record<SecretField, boolean>>({ razorpayKeySecret: false, razorpayWebhookSecret: false });
  const [savedSecrets, setSavedSecrets] = useState<Record<SecretField, string | null> | null>(null);
  const [revealing, setRevealing] = useState(false);

  function apply(loaded: ShopPaymentConfig) {
    setConfig(loaded);
    setForm({ razorpayKeyId: loaded.razorpayKeyId ?? "", razorpayKeySecret: "", razorpayWebhookSecret: "" });
    setShown({ razorpayKeySecret: false, razorpayWebhookSecret: false });
    setSavedSecrets(null);
  }

  useEffect(() => {
    shopApi
      .paymentConfig(websiteId)
      .then(apply)
      .catch((err: unknown) => setLoadError(errorMessage(err)));
  }, [websiteId]);

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
          secrets = await shopApi.revealPaymentSecrets(websiteId);
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

  function changedSecret(field: SecretField): string | undefined {
    const value = form[field].trim();
    return value && value !== savedSecrets?.[field] ? value : undefined;
  }

  function update(key: keyof ShopPaymentInput) {
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
      apply(
        await shopApi.updatePaymentConfig(websiteId, {
          razorpayKeyId: keyId,
          razorpayKeySecret: changedSecret("razorpayKeySecret"),
          razorpayWebhookSecret: changedSecret("razorpayWebhookSecret"),
        }),
      );
      setFeedback({ status: "success", message: "Razorpay settings saved. The keys were checked with Razorpay." });
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <FormAlert status="danger">{loadError}</FormAlert>;
  if (!config) {
    return (
      <div className="grid place-items-center rounded-xl border border-line bg-surface py-16">
        <Spinner aria-label="Loading Razorpay settings" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} noValidate className="max-w-2xl rounded-xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <CreditCard className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Razorpay</h2>
            <p className="text-xs text-ink-muted">Shop payments settle in this Razorpay account.</p>
          </div>
        </div>
        <PaymentStatusChip config={config} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <CopyRow
          label="Website address for Razorpay"
          value={config.siteUrl}
          hint="Give Razorpay this address when they verify the business. It is this website, and it has to be public."
        />
        <CopyRow
          label="Webhook address"
          value={config.webhookUrl}
          hint="In Razorpay Dashboard → Webhooks, add this URL. It is on this platform, not your website, and that is expected. Subscribe to payment.captured, order.paid, and payment.failed."
        />
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
          <RevealButton shown={shown.razorpayKeySecret} disabled={revealing} onToggle={() => void toggleSecret("razorpayKeySecret")} />
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
                ? "Leave blank to keep the current secret. Use the same secret you set on the webhook above."
                : "The secret you choose when adding the webhook above."
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
        <p className="text-xs text-ink-muted">Secrets are encrypted at rest. Saving checks the key ID and secret with Razorpay.</p>
        {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
        <div>
          <Button type="submit" isPending={saving}>
            Save Razorpay settings
          </Button>
        </div>
      </div>
    </form>
  );
}
