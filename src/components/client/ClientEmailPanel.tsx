import { useEffect, useState } from "react";
import { Button, Label, Spinner, Switch } from "@heroui/react";
import { Mail } from "lucide-react";
import { clientEmailApi, type ClientEmailConfig, type ClientEmailProvider } from "../../api/client-email.ts";
import { errorMessage } from "../../api/http.ts";
import { useAuth } from "../../auth/auth-context.ts";
import FormAlert from "../ui/FormAlert.tsx";
import TextInput from "../ui/TextInput.tsx";

const PROVIDERS: { id: ClientEmailProvider; label: string; hint: string }[] = [
  { id: "RESEND", label: "Resend", hint: "API key starts with re_" },
  { id: "BREVO", label: "Brevo", hint: "API key starts with xkeysib-" },
];

export default function ClientEmailPanel() {
  const { user } = useAuth();
  const [config, setConfig] = useState<ClientEmailConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [provider, setProvider] = useState<ClientEmailProvider>("RESEND");
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [testTo, setTestTo] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "success" | "danger"; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    clientEmailApi
      .get()
      .then((loaded) => {
        if (cancelled) return;
        setConfig(loaded);
        if (loaded.provider) setProvider(loaded.provider);
        setFromEmail(loaded.fromEmail ?? "");
        setFromName(loaded.fromName ?? "");
        setEnabled(loaded.enabled);
      })
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await clientEmailApi.update({ provider, apiKey, fromEmail, fromName, enabled });
      setConfig(saved);
      setApiKey("");
      setFeedback({ status: "success", message: "Website emails will be sent from this account." });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    setFeedback(null);
    try {
      await clientEmailApi.sendTest(testTo.trim());
      setFeedback({ status: "success", message: `Test email sent to ${testTo.trim()}.` });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setTesting(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Mail className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">Website email</h2>
          <p className="text-xs text-ink-muted">
            Contact-form messages from your published websites are sent through your own Resend or Brevo account.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mt-5">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      {!config && !loadError && (
        <div className="grid place-items-center py-10">
          <Spinner aria-label="Loading email settings" />
        </div>
      )}

      {config && (
        <div className="mt-5 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {PROVIDERS.map((option) => {
              const selected = provider === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setProvider(option.id)}
                  className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-line bg-surface hover:border-ink-muted/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-ink">{option.label}</p>
                  <p className="text-xs text-ink-muted">{option.hint}</p>
                </button>
              );
            })}
          </div>

          <TextInput
            label="API key"
            name="apiKey"
            type="password"
            autoComplete="off"
            placeholder={config.apiKeyMasked ?? (provider === "BREVO" ? "xkeysib-…" : "re_…")}
            description={
              config.configured && config.provider === provider
                ? `Saved key ${config.apiKeyMasked}. Leave blank to keep it.`
                : "The sender address below must be verified in this account."
            }
            value={apiKey}
            onChange={setApiKey}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="From email"
              name="fromEmail"
              type="email"
              placeholder="hello@yourdomain.com"
              value={fromEmail}
              onChange={setFromEmail}
              isRequired
            />
            <TextInput
              label="From name"
              name="fromName"
              placeholder="Your business"
              value={fromName}
              onChange={setFromName}
              isRequired
            />
          </div>

          <Switch isSelected={enabled} onChange={setEnabled}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label className="text-sm text-ink">Send website emails through this account</Label>
            </Switch.Content>
          </Switch>

          {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}

          <div className="flex flex-wrap items-end gap-3">
            <Button isPending={saving} isDisabled={!fromEmail.trim() || !fromName.trim()} onPress={() => void save()}>
              Save email settings
            </Button>
          </div>

          {config.configured && (
            <div className="flex flex-wrap items-end gap-3 border-t border-line pt-5">
              <div className="w-full max-w-sm">
                <TextInput label="Send a test to" name="testTo" type="email" value={testTo} onChange={setTestTo} />
              </div>
              <Button variant="secondary" isPending={testing} isDisabled={!testTo.trim()} onPress={() => void sendTest()}>
                Send test
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
