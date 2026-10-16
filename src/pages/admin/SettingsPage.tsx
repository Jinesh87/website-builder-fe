import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Chip, Label, Spinner, Switch } from "@heroui/react";
import { Check, CreditCard, Eye, EyeOff, Mail, Send, Sliders } from "lucide-react";
import AiSparklesIcon from "../../components/icons/AiSparklesIcon.tsx";
import { adminAiApi, type AiConfig, type AiConfigInput } from "../../api/admin-ai.ts";
import AiModelPicker from "../../components/ai/AiModelPicker.tsx";
import { adminEmailApi, type EmailConfig, type EmailConfigInput } from "../../api/admin-email.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { validateEmail } from "../../auth/validation.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TextInput from "../../components/ui/TextInput.tsx";
import PaymentSettingsPanel, { PaymentStatusChip } from "../../components/admin/PaymentSettingsPanel.tsx";
import type { PaymentConfig } from "../../api/wallet.ts";

type Feedback = { status: "success" | "danger"; message: string } | null;
type SettingsTab = "email" | "ai" | "payments";
type EmailConfigErrors = Partial<Record<keyof EmailConfigInput, string>>;
type AiConfigErrors = Partial<Record<keyof AiConfigInput, string>>;

/** A saved model that is no longer in the catalog leaves the picker empty so the admin picks a new one. */
function catalogModel(config: AiConfig): string {
  return config.models.some((option) => option.id === config.model) ? config.model : "";
}

function toEmailForm(config: EmailConfig): EmailConfigInput {
  return {
    resendApiKey: "",
    fromEmail: config.fromEmail ?? "",
    fromName: config.fromName ?? "",
    enabled: config.configured ? config.enabled : true,
  };
}

function EmailStatusChip({ config }: { config: EmailConfig }) {
  if (!config.configured) return <Chip color="warning">Not configured</Chip>;
  return config.enabled ? <Chip color="success">Enabled</Chip> : <Chip>Disabled</Chip>;
}

function AiStatusChip({ config }: { config: AiConfig }) {
  if (!config.configured) return <Chip color="warning">Key Missing</Chip>;
  return <Chip color="success">Active: {config.model}</Chip>;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: SettingsTab = tabParam === "ai" || tabParam === "payments" ? tabParam : "email";
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  // EMAIL CONFIG STATE
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [emailLoadError, setEmailLoadError] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState<EmailConfigInput>({
    resendApiKey: "",
    fromEmail: "",
    fromName: "",
    enabled: true,
  });
  const [emailErrors, setEmailErrors] = useState<EmailConfigErrors>({});
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaveFeedback, setEmailSaveFeedback] = useState<Feedback>(null);

  const [testTo, setTestTo] = useState(user?.email ?? "");
  const [testError, setTestError] = useState<string | undefined>();
  const [testing, setTesting] = useState(false);
  const [testFeedback, setTestFeedback] = useState<Feedback>(null);

  // AI CONFIG STATE
  const [aiConfig, setAiConfig] = useState<AiConfig | null>(null);
  const [aiLoadError, setAiLoadError] = useState<string | null>(null);
  const [aiForm, setAiForm] = useState<AiConfigInput>({
    openaiApiKey: "",
    model: "gpt-4o-mini",
  });
  const [showAiKey, setShowAiKey] = useState(false);
  const [aiErrors, setAiErrors] = useState<AiConfigErrors>({});
  const [aiSaving, setAiSaving] = useState(false);
  const [aiSaveFeedback, setAiSaveFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let cancelled = false;

    // Load email config
    adminEmailApi
      .get()
      .then((loaded) => {
        if (cancelled) return;
        setEmailConfig(loaded);
        setEmailForm(toEmailForm(loaded));
      })
      .catch((err: unknown) => !cancelled && setEmailLoadError(errorMessage(err)));

    // Load AI config
    adminAiApi
      .get()
      .then((loaded) => {
        if (cancelled) return;
        setAiConfig(loaded);
        setAiForm({ openaiApiKey: "", model: catalogModel(loaded) });
      })
      .catch((err: unknown) => !cancelled && setAiLoadError(errorMessage(err)));

    return () => {
      cancelled = true;
    };
  }, []);

  function setTab(tab: SettingsTab) {
    setSearchParams({ tab });
  }

  // EMAIL HANDLERS
  function updateEmail<K extends keyof EmailConfigInput>(key: K) {
    return (value: EmailConfigInput[K]) => setEmailForm((current) => ({ ...current, [key]: value }));
  }

  async function handleEmailSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: EmailConfigErrors = {
      resendApiKey:
        !emailConfig?.configured && !emailForm.resendApiKey.trim()
          ? "Resend API key is required"
          : undefined,
      fromEmail: validateEmail(emailForm.fromEmail),
      fromName: emailForm.fromName.trim() ? undefined : "From name is required",
    };
    setEmailErrors(nextErrors);
    setEmailSaveFeedback(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    setEmailSaving(true);
    try {
      const saved = await adminEmailApi.update({
        resendApiKey: emailForm.resendApiKey.trim(),
        fromEmail: emailForm.fromEmail.trim(),
        fromName: emailForm.fromName.trim(),
        enabled: emailForm.enabled,
      });
      setEmailConfig(saved);
      setEmailForm(toEmailForm(saved));
      setEmailSaveFeedback({ status: "success", message: "Email settings saved successfully." });
    } catch (err) {
      if (err instanceof ApiError) setEmailErrors(err.fieldErrors());
      setEmailSaveFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleTestEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateEmail(testTo);
    setTestError(validationError);
    setTestFeedback(null);
    if (validationError) return;

    setTesting(true);
    try {
      await adminEmailApi.sendTest(testTo.trim());
      setTestFeedback({ status: "success", message: `Test email sent to ${testTo.trim()}.` });
    } catch (err) {
      setTestFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setTesting(false);
    }
  }

  // AI HANDLERS
  async function handleAiSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const finalModel = aiForm.model;

    const nextErrors: AiConfigErrors = {
      openaiApiKey:
        !aiConfig?.configured && !aiForm.openaiApiKey?.trim()
          ? "OpenAI API key is required"
          : undefined,
      model: finalModel ? undefined : "Please select an OpenAI model",
    };
    setAiErrors(nextErrors);
    setAiSaveFeedback(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    setAiSaving(true);
    try {
      const saved = await adminAiApi.update({
        openaiApiKey: aiForm.openaiApiKey?.trim() || undefined,
        model: finalModel,
      });
      setAiConfig(saved);
      setAiForm({ openaiApiKey: "", model: catalogModel(saved) });
      setAiSaveFeedback({ status: "success", message: "AI settings saved successfully." });
    } catch (err) {
      if (err instanceof ApiError) setAiErrors(err.fieldErrors());
      setAiSaveFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setAiSaving(false);
    }
  }

  return (
    <div className="px-6 py-8 sm:px-8 max-w-5xl">
      <PageHeader
        title="Settings"
        description="Manage system communications, the AI Copilot generation engine and payments."
        actions={
          activeTab === "email" ? (
            emailConfig && <EmailStatusChip config={emailConfig} />
          ) : activeTab === "ai" ? (
            aiConfig && <AiStatusChip config={aiConfig} />
          ) : (
            paymentConfig && <PaymentStatusChip config={paymentConfig} />
          )
        }
      />

      {/* Tabs Bar */}
      <div className="mt-6 flex items-center gap-2 border-b border-line pb-px">
        <button
          type="button"
          onClick={() => setTab("email")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 -mb-px ${
            activeTab === "email"
              ? "border-primary text-ink bg-surface shadow-xs font-semibold"
              : "border-transparent text-ink-muted hover:text-ink hover:bg-surface/50"
          }`}
        >
          <Mail className="size-4" />
          <span>Email Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("ai")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 -mb-px ${
            activeTab === "ai"
              ? "border-primary text-ink bg-surface shadow-xs font-semibold"
              : "border-transparent text-ink-muted hover:text-ink hover:bg-surface/50"
          }`}
        >
          <AiSparklesIcon className="size-4" variant="glossy" />
          <span>AI Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("payments")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 -mb-px ${
            activeTab === "payments"
              ? "border-primary text-ink bg-surface shadow-xs font-semibold"
              : "border-transparent text-ink-muted hover:text-ink hover:bg-surface/50"
          }`}
        >
          <CreditCard className="size-4" />
          <span>Payments</span>
        </button>
      </div>

      {activeTab === "payments" && (
        <div className="mt-8">
          <PaymentSettingsPanel onLoaded={setPaymentConfig} />
        </div>
      )}

      {/* EMAIL TAB CONTENT */}
      {activeTab === "email" && (
        <div className="mt-8">
          {emailLoadError && (
            <div className="mb-6 max-w-2xl">
              <FormAlert status="danger">{emailLoadError}</FormAlert>
            </div>
          )}

          {!emailConfig && !emailLoadError && (
            <div className="grid place-items-center py-20">
              <Spinner aria-label="Loading email settings" />
            </div>
          )}

          {emailConfig && (
            <div className="grid max-w-2xl gap-6">
              <form
                onSubmit={handleEmailSave}
                noValidate
                className="rounded-xl border border-line bg-surface p-6 shadow-xs"
              >
                <h2 className="text-base font-semibold text-ink">Resend Configuration</h2>
                <p className="mt-1 text-sm text-ink-body">
                  The API key is encrypted at rest using AES-256-GCM and never displayed in plain text.
                </p>

                <div className="mt-5 flex flex-col gap-4">
                  <TextInput
                    label="Resend API key"
                    name="resendApiKey"
                    type="password"
                    autoComplete="off"
                    placeholder={emailConfig.resendApiKeyMasked ?? "re_..."}
                    description={
                      emailConfig.configured
                        ? "Leave blank to keep the current key."
                        : "Create one at resend.com → API Keys."
                    }
                    value={emailForm.resendApiKey}
                    onChange={updateEmail("resendApiKey")}
                    error={emailErrors.resendApiKey}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label="From email"
                      name="fromEmail"
                      type="email"
                      placeholder="no-reply@yourdomain.com"
                      description="Must use a domain verified in Resend."
                      value={emailForm.fromEmail}
                      onChange={updateEmail("fromEmail")}
                      error={emailErrors.fromEmail}
                    />
                    <TextInput
                      label="From name"
                      name="fromName"
                      placeholder="WebBuilder"
                      value={emailForm.fromName}
                      onChange={updateEmail("fromName")}
                      error={emailErrors.fromName}
                    />
                  </div>

                  <Switch isSelected={emailForm.enabled} onChange={updateEmail("enabled")}>
                    <Switch.Content>
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                      <Label className="text-sm text-ink">Send platform emails</Label>
                    </Switch.Content>
                  </Switch>

                  {emailSaveFeedback && (
                    <FormAlert status={emailSaveFeedback.status}>
                      {emailSaveFeedback.message}
                    </FormAlert>
                  )}

                  <div>
                    <Button type="submit" isPending={emailSaving}>
                      Save settings
                    </Button>
                  </div>
                </div>
              </form>

              <form
                onSubmit={handleTestEmail}
                noValidate
                className="rounded-xl border border-line bg-surface p-6 shadow-xs"
              >
                <h2 className="text-base font-semibold text-ink">Send a test email</h2>
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
                      isDisabled={!emailConfig.configured}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="sm:mt-6"
                    isPending={testing}
                    isDisabled={!emailConfig.configured}
                  >
                    <Send className="size-4" aria-hidden /> Send test
                  </Button>
                </div>
                {!emailConfig.configured && (
                  <p className="mt-3 text-xs text-ink-muted">Save a Resend API key first.</p>
                )}
                {testFeedback && (
                  <div className="mt-4">
                    <FormAlert status={testFeedback.status}>{testFeedback.message}</FormAlert>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      )}

      {/* AI TAB CONTENT */}
      {activeTab === "ai" && (
        <div className="mt-8">
          {aiLoadError && (
            <div className="mb-6 max-w-2xl">
              <FormAlert status="danger">{aiLoadError}</FormAlert>
            </div>
          )}

          {!aiConfig && !aiLoadError && (
            <div className="grid place-items-center py-20">
              <Spinner aria-label="Loading AI settings" />
            </div>
          )}

          {aiConfig && (
            <div className="grid max-w-2xl gap-6">
              <form
                onSubmit={handleAiSave}
                noValidate
                className="rounded-xl border border-line bg-surface p-6 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <AiSparklesIcon className="size-5" variant="glossy" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-ink">OpenAI Configuration</h2>
                    <p className="text-xs text-ink-muted">
                      Paste your OpenAI key and select your preferred model tier.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-5">
                  {/* API Key Input */}
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <TextInput
                        label="OpenAI API Key"
                        name="openaiApiKey"
                        type={showAiKey ? "text" : "password"}
                        autoComplete="off"
                        placeholder={aiConfig.openaiApiKeyMasked ?? "sk-proj-..."}
                        description={
                          aiConfig.configured
                            ? `Currently Active Key: ${aiConfig.openaiApiKeyMasked} (Leave blank to keep existing key)`
                            : "Copy & paste your OpenAI secret key starting with sk-... from platform.openai.com"
                        }
                        value={aiForm.openaiApiKey ?? ""}
                        onChange={(val) => setAiForm((prev) => ({ ...prev, openaiApiKey: val }))}
                        error={aiErrors.openaiApiKey}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAiKey(!showAiKey)}
                        className="absolute right-3 top-8.5 text-ink-muted hover:text-ink transition-colors cursor-pointer"
                        title={showAiKey ? "Hide key" : "Show key"}
                      >
                        {showAiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Default Model Selection */}
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink flex items-center gap-1.5">
                      <Sliders className="size-3.5 text-cyan-500" />
                      Platform default model
                    </span>
                    <p className="text-xs text-ink-muted">
                      Used by every client who hasn't picked their own model under Account settings. Clients can choose
                      any model below; costs differ per model because of token prices and reasoning tokens.
                    </p>

                    <AiModelPicker
                      models={aiConfig.models}
                      value={aiForm.model || null}
                      onChange={(model) => setAiForm((prev) => ({ ...prev, model }))}
                    />
                    {aiErrors.model && <p className="text-xs text-danger">{aiErrors.model}</p>}
                  </div>

                  {/* Security Note */}
                  <div className="rounded-lg border border-line bg-surface-muted/30 p-3.5 text-xs text-ink-body flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      Your key is securely encrypted at rest using AES-256-GCM. All AI requests use this key, whichever model the client has chosen.
                    </span>
                  </div>

                  {aiSaveFeedback && (
                    <FormAlert status={aiSaveFeedback.status}>
                      {aiSaveFeedback.message}
                    </FormAlert>
                  )}

                  <div>
                    <Button type="submit" isPending={aiSaving}>
                      Save AI Settings
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
