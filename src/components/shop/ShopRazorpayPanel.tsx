import { useEffect, useState, type FormEvent } from "react";
import { Button, Spinner } from "@heroui/react";
import { CreditCard } from "lucide-react";
import { ApiError, errorMessage } from "../../api/http.ts";
import { shopApi, type ShopPaymentConfig, type ShopPaymentInput } from "../../api/shop.ts";
import { PaymentStatusChip } from "../admin/PaymentSettingsPanel.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import RevealSecretButton from "../ui/RevealSecretButton.tsx";
import CopyRow from "../ui/CopyRow.tsx";
import TextInput from "../ui/TextInput.tsx";
import { useSavedSecrets } from "../ui/useSavedSecrets.ts";
import ShopRazorpayConnect from "./ShopRazorpayConnect.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;
type Errors = Partial<Record<keyof ShopPaymentInput, string>>;
type SecretField = "razorpayKeySecret" | "razorpayWebhookSecret";

const KEY_ID_PATTERN = /^rzp_(test|live)_[A-Za-z0-9]+$/;

const RAZORPAY_WEBHOOKS_URL = "https://dashboard.razorpay.com/app/website-app-settings/webhooks";

export default function ShopRazorpayPanel({ websiteId }: { websiteId: string }) {
  const [config, setConfig] = useState<ShopPaymentConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<Required<ShopPaymentInput>>({ razorpayKeyId: "", razorpayKeySecret: "", razorpayWebhookSecret: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const secrets = useSavedSecrets<SecretField>(() => shopApi.revealPaymentSecrets(websiteId));
  /** API keys are the fallback once "Connect with Razorpay" is offered. */
  const [showKeys, setShowKeys] = useState(false);

  function apply(loaded: ShopPaymentConfig) {
    setConfig(loaded);
    setForm({ razorpayKeyId: loaded.razorpayKeyId ?? "", razorpayKeySecret: "", razorpayWebhookSecret: "" });
    secrets.reset();
  }

  useEffect(() => {
    shopApi
      .paymentConfig(websiteId)
      .then(apply)
      .catch((err: unknown) => setLoadError(errorMessage(err)));
  }, [websiteId]);

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

  // One Razorpay setup at a time: while connected, API keys can't be used (disconnect first).
  const connected = Boolean(config.connection);
  const offersConnect = config.connectAvailable && !connected;
  const keysOpen = !connected && (!offersConnect || showKeys || Boolean(config.razorpayKeyId));

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <ShopRazorpayConnect websiteId={websiteId} config={config} onChange={apply} />
      {offersConnect && (
        <button
          type="button"
          onClick={() => setShowKeys((current) => !current)}
          className="self-start text-sm font-medium text-brand underline-offset-2 hover:underline"
        >
          {keysOpen ? "Hide API key setup" : "Use Razorpay API keys instead"}
        </button>
      )}
      {keysOpen && (
        <form onSubmit={handleSave} noValidate className="rounded-xl border border-line bg-surface p-6">
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
              hint="Give Razorpay this address when they verify the business. A connected custom domain is used when there is one. Otherwise this is the live site address, and it has to be public."
            />
            <CopyRow
              label="Webhook address"
              value={config.webhookUrl}
              hint={
                <>
                  Open{" "}
                  <a
                    href={RAZORPAY_WEBHOOKS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand underline-offset-2 hover:underline"
                  >
                    Razorpay → Webhooks
                  </a>
                  , add this URL, then subscribe to payment.captured, order.paid, payment.failed, refund.created,
                  refund.processed, and refund.failed. It is on this platform, not your website, and that is expected.
                </>
              }
              actionHref={RAZORPAY_WEBHOOKS_URL}
              actionLabel="Open Razorpay"
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
                type={secrets.isShown("razorpayKeySecret") ? "text" : "password"}
                autoComplete="off"
                placeholder={config.razorpayKeySecretMasked ?? ""}
                description={config.configured ? "Leave blank to keep the current secret." : "Shown once when you generate the key."}
                value={form.razorpayKeySecret}
                onChange={update("razorpayKeySecret")}
                error={errors.razorpayKeySecret}
              />
              <RevealSecretButton shown={secrets.isShown("razorpayKeySecret")} disabled={secrets.revealing} onToggle={() => void toggleSecret("razorpayKeySecret")} />
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
                    ? "Leave blank to keep the current secret. Use the same secret you set on the webhook above."
                    : "The secret you choose when adding the webhook above."
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
            <p className="text-xs text-ink-muted">Secrets are encrypted at rest. Saving checks the key ID and secret with Razorpay.</p>
            {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
            <div>
              <Button type="submit" isPending={saving}>
                Save Razorpay settings
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
