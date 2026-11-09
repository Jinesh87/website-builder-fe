import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Check, Plus, RotateCcw, X } from "lucide-react";
import { hostingApi, type WebsiteHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import FormAlert from "../ui/FormAlert.tsx";

const MAX_FEATURES = 20;

type WebsiteFeaturesEditorProps = {
  hosting: WebsiteHosting;
  onSaved: (hosting: WebsiteHosting) => void;
};

/** Super Admin: this website's feature list on the custom package; reset follows the package default. */
export default function WebsiteFeaturesEditor({ hosting, onSaved }: WebsiteFeaturesEditorProps) {
  const custom = hosting.packages.find((pkg) => pkg.isCustom);
  const stored = hosting.subscription?.customFeatures ?? null;
  const defaults = custom?.defaultFeatures ?? custom?.features ?? [];

  const [features, setFeatures] = useState<string[]>(() => (stored ?? defaults).slice());
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "success" | "danger"; message: string } | null>(null);
  const draftRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFeatures((hosting.subscription?.customFeatures ?? custom?.defaultFeatures ?? custom?.features ?? []).slice());
    setDraft("");
    setFeedback(null);
  }, [hosting.subscription?.id, hosting.subscription?.customFeatures, custom?.id, custom?.defaultFeatures, custom?.features]);

  const unchanged =
    stored === null
      ? features.join("\n") === defaults.join("\n")
      : features.join("\n") === stored.join("\n");
  const hasOwn = stored !== null;
  const canAdd = draft.trim().length > 0 && features.length < MAX_FEATURES;

  function addDraft() {
    const value = draft.trim();
    if (!value || features.length >= MAX_FEATURES) return;
    if (features.some((feature) => feature.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    setFeatures((prev) => [...prev, value]);
    setDraft("");
    draftRef.current?.focus();
  }

  async function save(next: string[] | null) {
    if (!custom) return;
    if (!hosting.subscription) {
      setFeedback({ status: "danger", message: "Set up a hosting plan for this website first." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await hostingApi.updatePlan(hosting.website.id, { customFeatures: next });
      onSaved(updated);
      setFeedback({
        status: "success",
        message: next === null ? "Using the Custom package default features." : "Custom features saved for this website.",
      });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  if (!custom) {
    return (
      <FormAlert status="warning">
        The Custom package is hidden. Show it in Settings → Hosting to set features per website.
      </FormAlert>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border border-line bg-canvas/40">
        {features.length === 0 ? (
          <p className="px-3.5 py-6 text-center text-xs text-ink-muted">No features yet. Add what this custom plan includes.</p>
        ) : (
          <ul className="divide-y divide-line">
            {features.map((feature, index) => (
              <li key={`${feature}-${index}`} className="group flex items-start gap-2.5 px-3 py-2.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-700">
                  <Check className="size-3" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-sm leading-snug text-ink">{feature}</span>
                <button
                  type="button"
                  aria-label={`Remove ${feature}`}
                  disabled={saving}
                  onClick={() => setFeatures((prev) => prev.filter((_, i) => i !== index))}
                  className="grid size-7 shrink-0 place-items-center rounded-md text-ink-muted opacity-0 transition-opacity hover:bg-surface hover:text-ink group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-line bg-surface p-2">
          <div className="flex items-center gap-1.5">
            <input
              ref={draftRef}
              value={draft}
              maxLength={120}
              disabled={saving || features.length >= MAX_FEATURES}
              placeholder={features.length >= MAX_FEATURES ? "Maximum features reached" : "Add a feature…"}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addDraft();
                }
              }}
              className="h-9 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-ed-border focus:bg-canvas focus:outline-none focus:ring-1 focus:ring-ed-accent/20"
            />
            <Button size="sm" variant="ghost" onPress={addDraft} isDisabled={!canAdd || saving} aria-label="Add feature">
              <Plus className="size-4" aria-hidden />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-muted">
          {hasOwn ? (
            <span className="font-medium text-brand">Custom list · {features.length}/{MAX_FEATURES}</span>
          ) : (
            <span>
              Package default · {features.length}/{MAX_FEATURES}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {hasOwn && (
            <Button size="sm" variant="ghost" onPress={() => void save(null)} isDisabled={saving}>
              <RotateCcw className="size-3.5" aria-hidden />
              Use default
            </Button>
          )}
          <Button size="sm" variant="outline" onPress={() => void save(features)} isPending={saving} isDisabled={unchanged}>
            Save features
          </Button>
        </div>
      </div>

      {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
    </div>
  );
}
