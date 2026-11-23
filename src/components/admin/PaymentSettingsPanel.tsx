import { useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { Check, Copy, CreditCard } from "lucide-react";
import { ApiError, errorMessage } from "../../api/http.ts";
import { adminPaymentsApi, type PaymentConfig, type PaymentConfigInput } from "../../api/wallet.ts";
import { env } from "../../config/env.ts";
import FormAlert from "../ui/FormAlert.tsx";
import RevealSecretButton from "../ui/RevealSecretButton.tsx";
import TextInput from "../ui/TextInput.tsx";
import { useSavedSecrets } from "../ui/useSavedSecrets.ts";

type Feedback = { status: "success" | "danger"; message: string } | null;
type Errors = Partial<Record<keyof PaymentConfigInput, string>>;

const WEBHOOK_URL = `${env.apiUrl.replace(/\/$/, "")}/payments/razorpay/webhook`;
const KEY_ID_PATTERN = /^rzp_(test|live)_[A-Za-z0-9]+$/;

export function PaymentStatusChip({ config }: { config: PaymentConfig }) {
  if (!config.configured) return <Chip color="warning">Not configured</Chip>;
  return <Chip color={config.mode === "live" ? "success" : "accent"}>{config.mode === "live" ? "Live mode" : "Test mode"}</Chip>;
}

type SecretField = "razorpayKeySecret" | "razorpayWebhookSecret";

export default function PaymentSettingsPanel({ onLoaded }: { onLoaded?: (config: PaymentConfig) => void }) {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<Required<PaymentConfigInput>>({ razorpayKeyId: "", razorpayKeySecret: "", razorpayWebhookSecret: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const secrets = useSavedSecrets<SecretField>(adminPaymentsApi.revealSecrets);
  const [copied, setCopied] = useState(false);

  function apply(loaded: PaymentConfig) {
    setConfig(loaded);
    setForm({ razorpayKeyId: loaded.razorpayKeyId ?? "", razorpayKeySecret: "", razorpayWebhookSecret: "" });
    secrets.reset();
    onLoaded?.(loaded);
  }

  async function toggleSecret(field: SecretField) {
    try {
      await secrets.toggle(field, form[field], (value) => setForm((current) => ({ ...current, [field]: value })));
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    }
  }


  function changedSecret(field: SecretField): string | undefined {
    return secrets.changed(field, form[field]);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left Column: Razorpay Credentials Form */}
      <form onSubmit={handleSave} noValidate className="lg:col-span-7 xl:col-span-8 rounded-xl border border-line bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <CreditCard className="size-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">Razorpay Gateway</h2>
              <p className="text-xs text-ink-muted">Clients buy connects and pay hosting subscriptions via Razorpay Checkout.</p>
            </div>
          </div>
          <PaymentStatusChip config={config} />
        </div>

        <div className="mt-5 flex flex-col gap-4">
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
              type={secrets.isShown("razorpayKeySecret") ? "text" : "password"}
              autoComplete="off"
              placeholder={config.razorpayKeySecretMasked ?? ""}
              description={config.configured ? "Leave blank to keep the current secret." : "Shown once when you generate the key."}
              value={form.razorpayKeySecret}
              onChange={update("razorpayKeySecret")}
              error={errors.razorpayKeySecret}
            />
            <RevealSecretButton
              shown={secrets.isShown("razorpayKeySecret")}
              disabled={secrets.revealing}
              onToggle={() => void toggleSecret("razorpayKeySecret")}
            />
          </div>
          <div className="relative">
            <TextInput
              label="Webhook secret"
              name="razorpayWebhookSecret"
              type={secrets.isShown("razorpayWebhookSecret") ? "text" : "password"}
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
            <RevealSecretButton
              shown={secrets.isShown("razorpayWebhookSecret")}
              disabled={secrets.revealing}
              onToggle={() => void toggleSecret("razorpayWebhookSecret")}
            />
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-muted/20 p-3.5 text-xs text-ink-body">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
            <span>Secrets are encrypted at rest with AES-256-GCM. Only a super admin can reveal them, with the eye button.</span>
          </div>

          {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}

          <div className="pt-2">
            <Button type="submit" isPending={saving}>
              Save payment settings
            </Button>
          </div>
        </div>
      </form>

      {/* Right Column: Webhook Integration & Guides */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
        <div className="rounded-xl border border-line bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Webhook Integration</h3>
            {config.webhookConfigured ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Check className="size-3" /> Configured
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Secret pending
              </span>
            )}
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            In Razorpay Dashboard → <strong>Account & Settings → Webhooks</strong>, add this URL with the specified events to ensure automatic order fulfillment:
          </p>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-ink">Webhook Endpoint URL</span>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-[11px] text-ink select-all">
                {WEBHOOK_URL}
              </code>
              <Button size="sm" variant="outline" onPress={() => void copyWebhookUrl()} className="shrink-0">
                {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-[10px] text-ink-muted">Razorpay must be able to reach this URL, so it only works once the API is public.</p>
          </div>

          <div className="border-t border-line pt-3 space-y-2">
            <span className="text-xs font-semibold text-ink">Required Webhook Events</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] text-ink-body font-medium">
                payment.captured
              </span>
              <span className="rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] text-ink-body font-medium">
                order.paid
              </span>
              <span className="rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] text-ink-body font-medium">
                payment.failed
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Integration Modes</h3>
          <div className="space-y-2.5 text-xs text-ink-body">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-ink shrink-0">Test Mode:</span>
              <span className="text-ink-muted">Use <code className="font-mono text-ink">rzp_test_...</code> keys for sandbox testing without real charges.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-ink shrink-0">Live Mode:</span>
              <span className="text-ink-muted">Use <code className="font-mono text-ink">rzp_live_...</code> keys to accept real customer transactions across UPI, cards, and Netbanking.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
