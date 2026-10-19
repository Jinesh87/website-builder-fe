import { useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { DollarSign, RotateCcw } from "lucide-react";
import { adminAiApi, type AiModelPrice, type AiModelPriceInput } from "../../api/admin-ai.ts";
import { adminClientsApi } from "../../api/admin-clients.ts";
import { errorMessage } from "../../api/http.ts";
import FormAlert from "../ui/FormAlert.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;
type Draft = Record<string, { input: string; output: string }>;
type DraftErrors = Record<string, { input?: string; output?: string }>;

const USD_PATTERN = /^\d{1,6}(\.\d{1,4})?$/;

function toDraft(prices: AiModelPrice[]): Draft {
  return Object.fromEntries(
    prices.map((price) => [price.id, { input: String(price.inputPerMillion), output: String(price.outputPerMillion) }]),
  );
}

function priceError(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Required";
  return USD_PATTERN.test(trimmed) ? undefined : "Up to 4 decimals";
}

function PriceInput({
  label,
  value,
  error,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div
                    className={`flex h-9 w-28 items-center rounded-lg border bg-surface shadow-ed-xs focus-within:ring-2 ${
          error ? "border-ed-danger focus-within:ring-ed-danger/15" : "border-ed-border focus-within:border-ed-accent focus-within:ring-ed-accent/15"
        }`}
      >
        <span className="pl-2.5 text-sm text-ink-muted" aria-hidden>
          $
        </span>
        <input
          aria-label={label}
          aria-invalid={Boolean(error)}
          inputMode="decimal"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ""))}
          className="w-full min-w-0 bg-transparent px-1.5 text-right text-sm text-ink focus:outline-none"
        />
      </div>
      {error && <p className="mt-1 text-xs text-ed-danger">{error}</p>}
    </div>
  );
}

type AiModelPricingPanelProps = {
  onSaved?: () => void;
  /** When set, these prices apply only to this company and fall back to the platform prices. */
  clientId?: string;
};

/** USD price per 1M tokens. Without `clientId`, these are the platform prices. */
export default function AiModelPricingPanel({ onSaved, clientId }: AiModelPricingPanelProps) {
  const [prices, setPrices] = useState<AiModelPrice[] | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [errors, setErrors] = useState<DraftErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function apply(loaded: AiModelPrice[]) {
    setPrices(loaded);
    setDraft(toDraft(loaded));
    setErrors({});
  }

  useEffect(() => {
    const load = clientId ? adminClientsApi.aiPrices(clientId) : adminAiApi.pricing();
    load.then(apply).catch((err: unknown) => setLoadError(errorMessage(err)));
  }, [clientId]);

  function update(modelId: string, side: "input" | "output", value: string) {
    setDraft((current) => ({ ...current, [modelId]: { ...current[modelId], [side]: value } }));
    setErrors((current) => ({ ...current, [modelId]: { ...current[modelId], [side]: undefined } }));
    setFeedback(null);
  }

  function resetToDefault(price: AiModelPrice) {
    setDraft((current) => ({
      ...current,
      [price.id]: { input: String(price.defaultInputPerMillion), output: String(price.defaultOutputPerMillion) },
    }));
    setErrors((current) => ({ ...current, [price.id]: {} }));
    setFeedback(null);
  }

  const changed = (prices ?? []).filter((price) => {
    const row = draft[price.id];
    return row && (Number(row.input) !== price.inputPerMillion || Number(row.output) !== price.outputPerMillion);
  });

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prices) return;
    const nextErrors: DraftErrors = Object.fromEntries(
      prices.map((price) => [price.id, { input: priceError(draft[price.id].input), output: priceError(draft[price.id].output) }]),
    );
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.values(nextErrors).some((row) => row.input || row.output)) return;

    setSaving(true);
    try {
      const input: AiModelPriceInput[] = prices.map((price) => ({
        modelId: price.id,
        inputPerMillion: Number(draft[price.id].input),
        outputPerMillion: Number(draft[price.id].output),
      }));
      const saved = clientId ? await adminClientsApi.updateAiPrices(clientId, input) : await adminAiApi.updatePricing(input);
      apply(saved);
      setFeedback({ status: "success", message: "Model prices saved." });
      onSaved?.();
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} noValidate className="rounded-xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <DollarSign className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">{clientId ? "Company model prices" : "Model prices"}</h2>
          <p className="text-xs text-ink-muted">
            {clientId
              ? "US dollars per 1 million tokens for this company. A model left at the platform price follows the platform price."
              : "US dollars per 1 million tokens. Used for AI cost estimates across the platform."}
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mt-5">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      {!prices && !loadError && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading model prices" />
        </div>
      )}

      {prices && (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs text-ink-muted">
                <tr>
                  <th className="py-2 pr-4 font-medium">Model</th>
                  <th className="px-2 py-2 font-medium">Input / 1M</th>
                  <th className="px-2 py-2 font-medium">Output / 1M</th>
                  <th className="py-2 pl-2" aria-label="Reset" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {prices.map((price) => {
                  const row = draft[price.id];
                  const isDefault =
                    Number(row.input) === price.defaultInputPerMillion && Number(row.output) === price.defaultOutputPerMillion;
                  return (
                    <tr key={price.id} className="align-top">
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-ink">{price.label}</span>
                          {price.kind === "image" && <Chip size="sm">Image</Chip>}
                          {!isDefault && (
                            <Chip size="sm" color="accent">
                              Custom
                            </Chip>
                          )}
                        </div>
                        <p className="mt-0.5 font-mono text-xs text-ink-muted">{price.id}</p>
                        {!isDefault && (
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {clientId ? "Platform price" : "List price"} ${price.defaultInputPerMillion} / ${price.defaultOutputPerMillion}
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <PriceInput
                          label={`${price.label} input price`}
                          value={row.input}
                          error={errors[price.id]?.input}
                          disabled={saving}
                          onChange={(value) => update(price.id, "input", value)}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <PriceInput
                          label={`${price.label} output price`}
                          value={row.output}
                          error={errors[price.id]?.output}
                          disabled={saving}
                          onChange={(value) => update(price.id, "output", value)}
                        />
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          aria-label={`Reset ${price.label} to ${clientId ? "platform" : "list"} price`}
                          isDisabled={saving || isDefault}
                          onPress={() => resetToDefault(price)}
                        >
                          <RotateCcw className="size-4" aria-hidden />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {feedback && (
            <div className="mt-4">
              <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <Button type="submit" isPending={saving} isDisabled={changed.length === 0}>
              Save prices
            </Button>
            {changed.length > 0 && (
              <span className="text-xs text-ink-muted">
                {changed.length} {changed.length === 1 ? "model" : "models"} changed
              </span>
            )}
          </div>
        </>
      )}
    </form>
  );
}
