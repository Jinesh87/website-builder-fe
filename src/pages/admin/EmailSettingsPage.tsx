import { useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Label, Spinner, Switch } from "@heroui/react";
import { Send } from "lucide-react";
import {
  adminEmailApi,
  type EmailConfig,
  type EmailConfigInput,
} from "../../api/admin-email.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { validateEmail } from "../../auth/validation.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TextInput from "../../components/ui/TextInput.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;
type ConfigErrors = Partial<Record<keyof EmailConfigInput, string>>;

function toForm(config: EmailConfig): EmailConfigInput {
  return {
    resendApiKey: "",
    fromEmail: config.fromEmail ?? "",
    fromName: config.fromName ?? "",
    enabled: config.configured ? config.enabled : true,
    contactSalesEmail: config.contactSalesEmail ?? "",
    questionnaireSalesEmail: config.questionnaireSalesEmail ?? "",
    partnerSalesEmail: config.partnerSalesEmail ?? "",
  };
}

function StatusChip({ config }: { config: EmailConfig }) {
  if (!config.configured) return <Chip color="warning">Not configured</Chip>;
  return config.enabled ? (
    <Chip color="success">Enabled</Chip>
  ) : (
    <Chip>Disabled</Chip>
  );
}

export default function EmailSettingsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<EmailConfigInput>({
    resendApiKey: "",
    fromEmail: "",
    fromName: "",
    enabled: true,
    contactSalesEmail: "",
    questionnaireSalesEmail: "",
    partnerSalesEmail: "",
  });
  const [errors, setErrors] = useState<ConfigErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<Feedback>(null);

  const [testTo, setTestTo] = useState(user?.email ?? "");
  const [testError, setTestError] = useState<string | undefined>();
  const [testing, setTesting] = useState(false);
  const [testFeedback, setTestFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let cancelled = false;
    adminEmailApi
      .get()
      .then((loaded) => {
        if (cancelled) return;
        setConfig(loaded);
        setForm(toForm(loaded));
      })
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof EmailConfigInput>(key: K) {
    return (value: EmailConfigInput[K]) =>
      setForm((current) => ({ ...current, [key]: value }));
  }

  function validateOptionalEmail(val?: string) {
    if (!val || !val.trim()) return undefined;
    return validateEmail(val.trim());
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ConfigErrors = {
      resendApiKey:
        !config?.configured && !form.resendApiKey.trim()
          ? "Resend API key is required"
          : undefined,
      fromEmail: validateEmail(form.fromEmail),
      fromName: form.fromName.trim() ? undefined : "From name is required",
      contactSalesEmail: validateOptionalEmail(form.contactSalesEmail),
      questionnaireSalesEmail: validateOptionalEmail(
        form.questionnaireSalesEmail,
      ),
      partnerSalesEmail: validateOptionalEmail(form.partnerSalesEmail),
    };
    setErrors(nextErrors);
    setSaveFeedback(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      const saved = await adminEmailApi.update({
        resendApiKey: form.resendApiKey.trim(),
        fromEmail: form.fromEmail.trim(),
        fromName: form.fromName.trim(),
        enabled: form.enabled,
        contactSalesEmail: form.contactSalesEmail?.trim() || "",
        questionnaireSalesEmail: form.questionnaireSalesEmail?.trim() || "",
        partnerSalesEmail: form.partnerSalesEmail?.trim() || "",
      });
      setConfig(saved);
      setForm(toForm(saved));
      setSaveFeedback({ status: "success", message: "Email settings saved." });
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      setSaveFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateEmail(testTo);
    setTestError(validationError);
    setTestFeedback(null);
    if (validationError) return;

    setTesting(true);
    try {
      await adminEmailApi.sendTest(testTo.trim());
      setTestFeedback({
        status: "success",
        message: `Test email sent to ${testTo.trim()}.`,
      });
    } catch (err) {
      setTestFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="Email settings"
        description="Resend delivers verification codes, password resets and other platform emails."
        actions={config && <StatusChip config={config} />}
      />

      {loadError && (
        <div className="mt-6 max-w-2xl">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      {!config && !loadError && (
        <div className="grid place-items-center py-20">
          <Spinner aria-label="Loading email settings" />
        </div>
      )}

      {config && (
        <div className="mt-8 grid max-w-2xl gap-6">
          <form
            onSubmit={handleSave}
            noValidate
            className="rounded-xl border border-line bg-surface p-6"
          >
            <h2 className="text-base font-semibold text-ink">
              Resend configuration
            </h2>
            <p className="mt-1 text-sm text-ink-body">
              The API key is encrypted at rest and never shown again after
              saving.
            </p>

            <div className="mt-5 flex flex-col gap-4">
              <TextInput
                label="Resend API key"
                name="resendApiKey"
                type="password"
                autoComplete="off"
                placeholder={config.resendApiKeyMasked ?? "re_..."}
                description={
                  config.configured
                    ? "Leave blank to keep the current key."
                    : "Create one at resend.com → API Keys."
                }
                value={form.resendApiKey}
                onChange={update("resendApiKey")}
                error={errors.resendApiKey}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="From email"
                  name="fromEmail"
                  type="email"
                  placeholder="no-reply@yourdomain.com"
                  description="Must use a domain verified in Resend."
                  value={form.fromEmail}
                  onChange={update("fromEmail")}
                  error={errors.fromEmail}
                />
                <TextInput
                  label="From name"
                  name="fromName"
                  placeholder="WebBuilder"
                  value={form.fromName}
                  onChange={update("fromName")}
                  error={errors.fromName}
                />
              </div>

              <Switch isSelected={form.enabled} onChange={update("enabled")}>
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Label className="text-sm text-ink">
                    Send platform emails
                  </Label>
                </Switch.Content>
              </Switch>

              <div className="border-t border-line pt-5">
                <h3 className="text-sm font-semibold text-ink">
                  Notification & Sales Inboxes
                </h3>
                <p className="mt-1 text-xs text-ink-body">
                  Configure where submission notifications and leads are sent.
                  Leave blank to use the default inbox
                  (support@bytezoracoders.com).
                </p>

                <div className="mt-4 flex flex-col gap-4">
                  <TextInput
                    label="Contact form sales email"
                    name="contactSalesEmail"
                    type="email"
                    placeholder="support@bytezoracoders.com"
                    description="Receives inquiries submitted through the contact page."
                    value={form.contactSalesEmail ?? ""}
                    onChange={update("contactSalesEmail")}
                    error={errors.contactSalesEmail}
                  />

                  <TextInput
                    label="Website questionnaire sales email"
                    name="questionnaireSalesEmail"
                    type="email"
                    placeholder="support@bytezoracoders.com"
                    description="Receives client website project questionnaires."
                    value={form.questionnaireSalesEmail ?? ""}
                    onChange={update("questionnaireSalesEmail")}
                    error={errors.questionnaireSalesEmail}
                  />

                  <TextInput
                    label="Partner application sales email"
                    name="partnerSalesEmail"
                    type="email"
                    placeholder="support@bytezoracoders.com"
                    description="Receives partner & agency applications."
                    value={form.partnerSalesEmail ?? ""}
                    onChange={update("partnerSalesEmail")}
                    error={errors.partnerSalesEmail}
                  />
                </div>
              </div>

              {saveFeedback && (
                <FormAlert status={saveFeedback.status}>
                  {saveFeedback.message}
                </FormAlert>
              )}

              <div>
                <Button type="submit" isPending={saving}>
                  Save settings
                </Button>
              </div>
            </div>
          </form>

          <form
            onSubmit={handleTest}
            noValidate
            className="rounded-xl border border-line bg-surface p-6"
          >
            <h2 className="text-base font-semibold text-ink">
              Send a test email
            </h2>
            <p className="mt-1 text-sm text-ink-body">
              Uses the saved settings, even while sending is turned off.
            </p>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex-1">
                <TextInput
                  label="Send to"
                  name="testTo"
                  type="email"
                  value={testTo}
                  onChange={setTestTo}
                  error={testError}
                  isDisabled={!config.configured}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="sm:mt-6"
                isPending={testing}
                isDisabled={!config.configured}
              >
                <Send className="size-4" aria-hidden /> Send test
              </Button>
            </div>
            {!config.configured && (
              <p className="mt-3 text-xs text-ink-muted">
                Save a Resend API key first.
              </p>
            )}
            {testFeedback && (
              <div className="mt-4">
                <FormAlert status={testFeedback.status}>
                  {testFeedback.message}
                </FormAlert>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
