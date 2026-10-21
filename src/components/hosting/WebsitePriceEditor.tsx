import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { adminHostingApi, hostingApi, type BillingCycle, type WebsiteHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { connectsPriceInPaise, formatPaise } from "../../api/wallet.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { ConnectsInput, parseConnects } from "./hosting-labels.tsx";

type WebsitePriceEditorProps = {
  hosting: WebsiteHosting;
  /** Receives the website's hosting reloaded after the change, with prices resolved again. */
  onSaved: (hosting: WebsiteHosting) => void;
  onCancel?: () => void;
  /** Cycle for the plan created when the website has none yet. */
  cycle?: BillingCycle;
};

type Prices = { quarterlyPrice: number | null; yearlyPrice: number | null };
type PriceScope = "WEBSITE" | "GLOBAL";

function toText(prices: Prices) {
  return { quarterly: prices.quarterlyPrice?.toString() ?? "", yearly: prices.yearlyPrice?.toString() ?? "" };
}

/**
 * Super Admin: sets this website's own price, or the global default. A website price left empty
 * inherits (client price, then global); the global default always has a value.
 */
export default function WebsitePriceEditor({ hosting, onSaved, onCancel, cycle = "QUARTERLY" }: WebsitePriceEditorProps) {
  const { priceLevels, connectsPerRupee, website } = hosting;
  const [scope, setScope] = useState<PriceScope>("WEBSITE");
  const [values, setValues] = useState(() => toText(priceLevels.website));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stored: Prices = scope === "WEBSITE" ? priceLevels.website : priceLevels.global;

  useEffect(() => {
    setValues(toText(stored));
    setError(null);
    // Re-seed only when the level or its saved prices change.
  }, [scope, stored.quarterlyPrice, stored.yearlyPrice]);

  const next: Prices = { quarterlyPrice: parseConnects(values.quarterly), yearlyPrice: parseConnects(values.yearly) };
  const changed = next.quarterlyPrice !== stored.quarterlyPrice || next.yearlyPrice !== stored.yearlyPrice;
  const canInherit = scope !== "GLOBAL";
  const missingGlobal = scope === "GLOBAL" && (next.quarterlyPrice === null || next.yearlyPrice === null);
  const hasOwn = canInherit && (stored.quarterlyPrice !== null || stored.yearlyPrice !== null);

  /** What an empty field falls back to at this level. */
  function fallback(target: BillingCycle): { amount: number; label: string } {
    const key = target === "QUARTERLY" ? "quarterlyPrice" : "yearlyPrice";
    if (scope === "WEBSITE" && priceLevels.client[key] !== null) return { amount: priceLevels.client[key]!, label: "client price" };
    return { amount: priceLevels.global[key], label: "global default" };
  }

  async function save(prices: Prices) {
    setSaving(true);
    setError(null);
    try {
      if (scope === "WEBSITE") {
        onSaved(await hostingApi.updatePlan(website.id, { ...prices, ...(hosting.subscription ? {} : { cycle }) }));
        return;
      }
      const settings = await adminHostingApi.settings();
      await adminHostingApi.updateSettings({
        enabled: settings.enabled,
        reminderDays: settings.reminderDays,
        graceDays: settings.graceDays,
        quarterlyPrice: prices.quarterlyPrice ?? 0,
        yearlyPrice: prices.yearlyPrice ?? 0,
      });
      onSaved(await hostingApi.get(website.id));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const field = (target: BillingCycle) => {
    const key = target === "QUARTERLY" ? "quarterly" : "yearly";
    const own = parseConnects(values[key]);
    const inherit = fallback(target);
    return (
      <ConnectsInput
        id={`price-${target.toLowerCase()}-${website.id}`}
        label={target === "QUARTERLY" ? "Quarterly (3 months)" : "Yearly (12 months)"}
        value={values[key]}
        onChange={(value) => setValues((current) => ({ ...current, [key]: value }))}
        placeholder={canInherit ? `Inherit · ${inherit.amount.toLocaleString("en-IN")}` : "Required"}
        hint={
          own !== null
            ? own === 0
              ? "Free"
              : `= ${formatPaise(connectsPriceInPaise(own, connectsPerRupee))}`
            : canInherit
              ? `Uses ${inherit.label}: ${inherit.amount.toLocaleString("en-IN")}`
              : undefined
        }
        isDisabled={saving}
      />
    );
  };

  const scopes: { id: PriceScope; label: string }[] = [
    { id: "WEBSITE", label: "This website" },
    { id: "GLOBAL", label: "Global default" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Apply price to" className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-surface p-1">
        {scopes.map((option) => {
          const selected = option.id === scope;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setScope(option.id)}
              disabled={saving}
              className={`truncate rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                selected ? "bg-ink text-white shadow-xs" : "text-ink-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {field("QUARTERLY")}
        {field("YEARLY")}
      </div>

      <p className="text-xs text-ink-muted">
        {scope === "WEBSITE" ? "Only this website. Empty uses the default price. 0 = free." : "The default for every website without its own price."}{" "}
        Applies from the next payment.
      </p>

      {error && <FormAlert status="danger">{error}</FormAlert>}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onPress={() => void save(next)} isPending={saving} isDisabled={!changed || missingGlobal}>
          {scope === "GLOBAL" ? "Save global default" : "Save price"}
        </Button>
        {hasOwn && (
          <Button size="sm" variant="ghost" isDisabled={saving} onPress={() => void save({ quarterlyPrice: null, yearlyPrice: null })}>
            Reset to default
          </Button>
        )}
        {onCancel && (
          <Button size="sm" variant="ghost" isDisabled={saving} onPress={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
