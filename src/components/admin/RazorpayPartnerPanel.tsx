import { useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { Handshake } from "lucide-react";
import { ApiError, errorMessage } from "../../api/http.ts";
import { adminRazorpayPartnerApi, type RazorpayPartnerInput, type RazorpayPartnerSettings } from "../../api/wallet.ts";
import CopyRow from "../ui/CopyRow.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import RevealSecretButton from "../ui/RevealSecretButton.tsx";
import SelectInput from "../ui/SelectInput.tsx";
import TextInput from "../ui/TextInput.tsx";
import { useSavedSecrets } from "../ui/useSavedSecrets.ts";

type Feedback = { status: "success" | "danger"; message: string } | null;
type Form = { clientId: string; clientSecret: string; webhookSecret: string; mode: "test" | "live" };
type Errors = Partial<Record<keyof RazorpayPartnerInput, string>>;
type SecretField = "clientSecret" | "webhookSecret";

const PARTNER_DASHBOARD_URL = "https://dashboard.razorpay.com/app/partners/applications";
const MODE_OPTIONS = [
  { value: "live" as const, label: "Live (production client)" },
  { value: "test" as const, label: "Test (development client)" },
];

/** Super Admin: the Razorpay Technology Partner app shops use for "Connect with Razorpay". */
export default function RazorpayPartnerPanel() {
  const [partner, setPartner] = useState<RazorpayPartnerSettings | null>(null);
  const [form, setForm] = useState<Form>({ clientId: "", clientSecret: "", webhookSecret: "", mode: "live" });
  const [errors, setErrors] = useState<Errors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const secrets = useSavedSecrets<SecretField>(adminRazorpayPartnerApi.revealSecrets);

  function apply(loaded: RazorpayPartnerSettings) {
    setPartner(loaded);
    setForm({ clientId: loaded.clientId ?? "", clientSecret: "", webhookSecret: "", mode: loaded.mode });
    secrets.reset();
  }

  async function toggleSecret(field: SecretField) {
    try {
      await secrets.toggle(field, form[field], (value) => setForm((current) => ({ ...current, [field]: value })));
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    }
  }

  useEffect(() => {
    adminRazorpayPartnerApi
      .get()
      .then(apply)
      .catch((err: unknown) => setLoadError(errorMessage(err)));
  }, []);

  function update<K extends keyof Form>(key: K) {
    return (value: Form[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
      setFeedback(null);
    };
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {
      clientId: form.clientId.trim().length >= 4 ? undefined : "Enter the client ID",
      clientSecret: !partner?.configured && !form.clientSecret.trim() ? "Client secret is required" : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setSaving(true);
    setFeedback(null);
    try {
      apply(
        await adminRazorpayPartnerApi.update({
          clientId: form.clientId.trim(),
          clientSecret: secrets.changed("clientSecret", form.clientSecret),
          webhookSecret: secrets.changed("webhookSecret", form.webhookSecret),
          mode: form.mode,
        }),
      );
      setFeedback({ status: "success", message: "Partner app saved. Shops can now connect with Razorpay." });
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <FormAlert status="danger">{loadError}</FormAlert>;
  if (!partner) {
    return (
      <div className="grid place-items-center py-12">
        <Spinner aria-label="Loading Razorpay partner app" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} noValidate className="max-w-2xl rounded-xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Handshake className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Razorpay partner app</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Lets shop owners connect (or sign up for) their own Razorpay account in one click. Their payments settle to
              their account; no API keys or webhooks to set up.
            </p>
          </div>
        </div>
        {partner.configured ? (
          <Chip color={partner.mode === "live" ? "success" : "accent"}>{partner.mode === "live" ? "Live" : "Test"}</Chip>
        ) : (
          <Chip color="warning">Not set up</Chip>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <CopyRow
          label="OAuth redirect URL"
          value={partner.redirectUri}
          hint="Add this as a redirect URL on the application in the Razorpay Partner Dashboard (Applications → your app)."
          actionHref={PARTNER_DASHBOARD_URL}
          actionLabel="Open Partner Dashboard"
        />
        <CopyRow
          label="Webhook URL"
          value={partner.webhookUrl}
          hint={`On the same application, use Manage Webhook: add this URL, choose a secret, and subscribe to ${partner.webhookEvents.join(", ")}.`}
        />

        <SelectInput label="Client" value={form.mode} onChange={update("mode")} options={MODE_OPTIONS} />
        <TextInput
          label="Client ID"
          name="clientId"
          autoComplete="off"
          description="From the application's credentials. Use the development client with Test, the production client with Live."
          value={form.clientId}
          onChange={update("clientId")}
          error={errors.clientId}
        />
        <div className="relative">
          <TextInput
            label="Client secret"
            name="clientSecret"
            type={secrets.isShown("clientSecret") ? "text" : "password"}
            autoComplete="off"
            placeholder={partner.clientSecretMasked ?? ""}
            description={partner.configured ? "Leave blank to keep the current secret." : undefined}
            value={form.clientSecret}
            onChange={update("clientSecret")}
            error={errors.clientSecret}
          />
          <RevealSecretButton
            shown={secrets.isShown("clientSecret")}
            disabled={secrets.revealing}
            onToggle={() => void toggleSecret("clientSecret")}
          />
        </div>
        <div className="relative">
          <TextInput
            label="Webhook secret"
            name="webhookSecret"
            type={secrets.isShown("webhookSecret") ? "text" : "password"}
            autoComplete="off"
            placeholder={partner.webhookConfigured ? "••••••••" : ""}
            description={
              partner.webhookConfigured
                ? "Leave blank to keep the current secret."
                : "The secret you set on the application's webhook. Without it, payment updates from connected shops are rejected."
            }
            value={form.webhookSecret}
            onChange={update("webhookSecret")}
            error={errors.webhookSecret}
          />
          <RevealSecretButton
            shown={secrets.isShown("webhookSecret")}
            disabled={secrets.revealing}
            onToggle={() => void toggleSecret("webhookSecret")}
          />
        </div>

        {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
        <div>
          <Button type="submit" isPending={saving}>
            Save partner app
          </Button>
        </div>
      </div>
    </form>
  );
}
