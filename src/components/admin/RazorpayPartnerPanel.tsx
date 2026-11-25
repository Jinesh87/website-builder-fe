import { useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { Handshake } from "lucide-react";
import { ApiError, errorMessage } from "../../api/http.ts";
import {
  adminRazorpayPartnerApi,
  type RazorpayPartnerInput,
  type RazorpayPartnerMode,
  type RazorpayPartnerSettings,
} from "../../api/wallet.ts";
import CopyRow from "../ui/CopyRow.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import RevealSecretButton from "../ui/RevealSecretButton.tsx";
import TextInput from "../ui/TextInput.tsx";
import { useSavedSecrets } from "../ui/useSavedSecrets.ts";

type Feedback = { status: "success" | "danger"; message: string } | null;
type ClientForm = { clientId: string; clientSecret: string; webhookSecret: string };
type Errors = Partial<Record<keyof RazorpayPartnerInput, string>>;
type SecretField = "clientSecret" | "webhookSecret";

const PARTNER_DASHBOARD_URL = "https://dashboard.razorpay.com/app/partners/applications";
const MODES: { value: RazorpayPartnerMode; label: string; client: string }[] = [
  { value: "test", label: "Test", client: "development client" },
  { value: "live", label: "Production", client: "production client" },
];
const modeLabel = (mode: RazorpayPartnerMode) => (mode === "live" ? "Production" : "Test");
const emptyForm = (): ClientForm => ({ clientId: "", clientSecret: "", webhookSecret: "" });

/**
 * Super Admin: the Razorpay Technology Partner app shops use for "Connect with Razorpay". Test and
 * Production each keep their own client ID and secrets; the saved mode applies to the whole platform.
 */
export default function RazorpayPartnerPanel() {
  const [partner, setPartner] = useState<RazorpayPartnerSettings | null>(null);
  /** The mode being viewed and edited; saving makes it the platform's mode. */
  const [mode, setMode] = useState<RazorpayPartnerMode>("live");
  const [forms, setForms] = useState<Record<RazorpayPartnerMode, ClientForm>>({ test: emptyForm(), live: emptyForm() });
  const [errors, setErrors] = useState<Errors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const testSecrets = useSavedSecrets<SecretField>(() => adminRazorpayPartnerApi.revealSecrets("test"));
  const liveSecrets = useSavedSecrets<SecretField>(() => adminRazorpayPartnerApi.revealSecrets("live"));
  const secrets = mode === "test" ? testSecrets : liveSecrets;
  const form = forms[mode];

  function apply(loaded: RazorpayPartnerSettings) {
    setPartner(loaded);
    setMode(loaded.mode);
    setForms({
      test: { ...emptyForm(), clientId: loaded.test.clientId ?? "" },
      live: { ...emptyForm(), clientId: loaded.live.clientId ?? "" },
    });
    testSecrets.reset();
    liveSecrets.reset();
  }

  function setField(field: keyof ClientForm, value: string) {
    setForms((current) => ({ ...current, [mode]: { ...current[mode], [field]: value } }));
  }

  async function toggleSecret(field: SecretField) {
    try {
      await secrets.toggle(field, form[field], (value) => setField(field, value));
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

  function update(key: keyof ClientForm) {
    return (value: string) => {
      setField(key, value);
      setErrors((current) => ({ ...current, [key]: undefined }));
      setFeedback(null);
    };
  }

  function chooseMode(next: RazorpayPartnerMode) {
    setMode(next);
    setErrors({});
    setFeedback(null);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {
      clientId: form.clientId.trim().length >= 4 ? undefined : "Enter the client ID",
      clientSecret: !partner?.[mode].configured && !form.clientSecret.trim() ? "Client secret is required" : undefined,
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
          mode,
        }),
      );
      setFeedback({ status: "success", message: `Saved. The platform is in ${modeLabel(mode)} mode; shops connect with the ${mode === "live" ? "production" : "development"} client.` });
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
          <Chip color={partner.mode === "live" ? "success" : "accent"}>Platform: {modeLabel(partner.mode)}</Chip>
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

        <div>
          <p className="text-sm font-medium text-ink">Mode</p>
          <div className="mt-1.5 inline-flex rounded-lg border border-line p-0.5" role="radiogroup" aria-label="Mode">
            {MODES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={mode === option.value}
                onClick={() => chooseMode(option.value)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  mode === option.value ? "bg-ink text-surface" : "text-ink-muted hover:text-ink"
                }`}
              >
                {option.label}
                {partner[option.value].configured ? "" : " · not set"}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">
            Test and Production keep their own values. Saving makes the mode shown here the one new shops connect with.
          </p>
        </div>
        {mode !== partner.mode && (
          <FormAlert status="warning">
            The platform is in {modeLabel(partner.mode)} mode. Saving switches it to {modeLabel(mode)}: shops that connect from
            now on use the {mode === "live" ? "production" : "development"} client. Shops already connected keep working in the
            mode they connected in.
          </FormAlert>
        )}
        <TextInput
          label="Client ID"
          name="clientId"
          autoComplete="off"
          description={`From the ${mode === "live" ? "production" : "development"} client's credentials on the application.`}
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
            placeholder={partner[mode].clientSecretMasked ?? ""}
            description={partner[mode].configured ? "Leave blank to keep the current secret." : undefined}
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
            placeholder={partner[mode].webhookConfigured ? "••••••••" : ""}
            description={
              partner[mode].webhookConfigured
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
            {mode === partner.mode ? `Save ${modeLabel(mode)} client` : `Save and switch to ${modeLabel(mode)}`}
          </Button>
        </div>
      </div>
    </form>
  );
}
