import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { Info } from "lucide-react";
import { clientAiSettingsApi, type ClientAiSettings } from "../../api/ai-models.ts";
import { errorMessage } from "../../api/http.ts";
import AiModelPicker from "../../components/ai/AiModelPicker.tsx";
import AiSparklesIcon from "../../components/icons/AiSparklesIcon.tsx";
import PageHeader from "../../components/app/PageHeader.tsx";
import ClientEmailPanel from "../../components/client/ClientEmailPanel.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

export default function AccountSettingsPage() {
  const [settings, setSettings] = useState<ClientAiSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** null = follow the platform default. */
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let cancelled = false;
    clientAiSettingsApi
      .get()
      .then((loaded) => {
        if (cancelled) return;
        setSettings(loaded);
        setSelected(loaded.model);
      })
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(model: string | null) {
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await clientAiSettingsApi.update(model);
      setSettings(saved);
      setSelected(saved.model);
      setFeedback({ status: "success", message: `AI requests will now use ${saved.effectiveModel}.` });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  const defaultModel = settings?.models.find((model) => model.id === settings.defaultModel);
  const usingDefault = selected === null;
  const dirty = settings !== null && selected !== settings.model;

  return (
    <div className="px-6 py-8 sm:px-8 max-w-5xl">
      <PageHeader
        title="Account settings"
        description="Choose how the AI assistant works, and how your websites send email."
      />

      {loadError && (
        <div className="mt-6 max-w-2xl">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      {!settings && !loadError && (
        <div className="grid place-items-center py-20">
          <Spinner aria-label="Loading AI settings" />
        </div>
      )}

      {settings && (
        <section className="mt-8 rounded-xl border border-line bg-surface p-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <AiSparklesIcon className="size-5" variant="glossy" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">AI model</h2>
              <p className="text-xs text-ink-muted">
                Used for AI website building and the AI assistant in the editor. Currently using{" "}
                <span className="font-mono font-medium text-ink">{settings.effectiveModel}</span>.
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-ink-body">
            <Info className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold text-ink">Cost is different for each model.</p>
              <p>
                AI usage is charged per token (small pieces of text sent to and written by the AI). Smarter models charge
                more per token, and reasoning models also spend extra "thinking" tokens on every request, so the same
                edit can cost many times more. The ≈× figure is an estimate of the cost of a typical request compared
                with the cheapest model.
              </p>
            </div>
          </div>

          {!settings.configured && (
            <div className="mt-4">
              <FormAlert status="warning">
                The AI assistant isn't set up on this platform yet. Your choice will apply once it is.
              </FormAlert>
            </div>
          )}

          <button
            type="button"
            aria-pressed={usingDefault}
            onClick={() => setSelected(null)}
            className={`mt-5 flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer ${
              usingDefault
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-line bg-surface hover:border-ink-muted/40"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-ink">Platform default</p>
              <p className="text-xs text-ink-body">
                Use the model chosen by the platform administrator
                {defaultModel ? ` (${defaultModel.label})` : ` (${settings.defaultModel})`}.
              </p>
            </div>
            <span
              className={`size-4 shrink-0 rounded-full border-2 ${usingDefault ? "border-primary bg-primary" : "border-line"}`}
              aria-hidden
            />
          </button>

          <div className="mt-3">
            <AiModelPicker models={settings.models} value={selected} onChange={setSelected} />
          </div>

          {feedback && (
            <div className="mt-5">
              <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <Button isPending={saving} isDisabled={!dirty} onPress={() => void save(selected)}>
              Save AI model
            </Button>
            {dirty && (
              <Button variant="ghost" isDisabled={saving} onPress={() => setSelected(settings.model)}>
                Discard
              </Button>
            )}
          </div>
        </section>
      )}

      <ClientEmailPanel />
    </div>
  );
}
