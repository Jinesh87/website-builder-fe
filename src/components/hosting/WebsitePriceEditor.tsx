import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { hostingApi, type BillingCycle, type UpdatePlanInput, type WebsiteHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatPaise } from "../../api/wallet.ts";
import { defaultPlan, paiseToRupeesInput, rupeesInputToPaise } from "../../utils/hosting-pricing.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { CYCLE_PERIOD, RupeesInput } from "./hosting-labels.tsx";

type WebsitePriceEditorProps = {
  hosting: WebsiteHosting;
  /** Receives the website's hosting reloaded after the change. */
  onSaved: (hosting: WebsiteHosting) => void;
  onCancel?: () => void;
  /** The cycle the admin is looking at; the plan moves to it when the new price offers it. */
  preferredCycle?: BillingCycle;
  autoFocus?: boolean;
};

/**
 * Super Admin: this website's price on the custom package, starting from the package's default. A cycle left at
 * (or cleared to) the default keeps following it; saving puts the website on the custom package. Applies from the
 * next payment.
 */
export default function WebsitePriceEditor({ hosting, onSaved, onCancel, preferredCycle, autoFocus }: WebsitePriceEditorProps) {
  const { subscription, website } = hosting;
  const custom = hosting.packages.find((pkg) => pkg.isCustom);
  const listed = defaultPlan({ packages: hosting.packages.filter((pkg) => !pkg.isCustom), subscription: null });
  const stored = { quarterly: subscription?.customQuarterlyPaise ?? null, yearly: subscription?.customYearlyPaise ?? null };
  const defaults = { quarterly: custom?.defaultPrices.QUARTERLY ?? null, yearly: custom?.defaultPrices.YEARLY ?? null };
  const effective = { quarterly: stored.quarterly ?? defaults.quarterly, yearly: stored.yearly ?? defaults.yearly };

  const [quarterly, setQuarterly] = useState(paiseToRupeesInput(effective.quarterly));
  const [yearly, setYearly] = useState(paiseToRupeesInput(effective.yearly));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuarterly(paiseToRupeesInput(effective.quarterly));
    setYearly(paiseToRupeesInput(effective.yearly));
    setError(null);
  }, [effective.quarterly, effective.yearly]);

  const typed = { quarterly: rupeesInputToPaise(quarterly), yearly: rupeesInputToPaise(yearly) };
  const invalid = Number.isNaN(typed.quarterly) || Number.isNaN(typed.yearly);
  /** What this website stores: null where it follows the default, unless it already had its own price there. */
  const next = {
    quarterly: typed.quarterly === defaults.quarterly && stored.quarterly === null ? null : typed.quarterly,
    yearly: typed.yearly === defaults.yearly && stored.yearly === null ? null : typed.yearly,
  };
  const resolved = { quarterly: next.quarterly ?? defaults.quarterly, yearly: next.yearly ?? defaults.yearly };
  const unpriced = resolved.quarterly === null && resolved.yearly === null;
  const changed = next.quarterly !== stored.quarterly || next.yearly !== stored.yearly;
  const hasOwn = stored.quarterly !== null || stored.yearly !== null;
  const hasDefault = defaults.quarterly !== null || defaults.yearly !== null;

  /** Keeps the wanted cycle when the new price offers it, else the cycle that has a price. */
  function customCycle(): BillingCycle {
    const current = preferredCycle ?? subscription?.cycle ?? "YEARLY";
    if ((current === "QUARTERLY" ? resolved.quarterly : resolved.yearly) !== null) return current;
    return resolved.quarterly !== null ? "QUARTERLY" : "YEARLY";
  }

  async function update(input: UpdatePlanInput) {
    setSaving(true);
    setError(null);
    try {
      onSaved(await hostingApi.updatePlan(website.id, input));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const save = () =>
    update({ customQuarterlyPaise: next.quarterly, customYearlyPaise: next.yearly, packageId: custom!.id, cycle: customCycle() });
  /** With a default, the website stays on the custom package at the default; without one, it moves to a listed package. */
  const reset = () =>
    update(
      hasDefault
        ? { customQuarterlyPaise: null, customYearlyPaise: null }
        : { customQuarterlyPaise: null, customYearlyPaise: null, ...(listed ? { packageId: listed.packageId, cycle: listed.cycle } : {}) },
    );

  if (!custom) {
    return (
      <FormAlert status="warning">
        The Custom package is hidden. Show it in Settings → Hosting to agree a price for a website.
      </FormAlert>
    );
  }

  const defaultHint = (paise: number | null, cycle: BillingCycle) =>
    paise === null ? "No default · empty = not offered" : `Default ${formatPaise(paise)} per ${CYCLE_PERIOD[cycle]}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <RupeesInput
          id={`custom-quarterly-${website.id}`}
          label="Quarterly (3 months)"
          value={quarterly}
          onChange={setQuarterly}
          placeholder={defaults.quarterly === null ? "Not offered" : paiseToRupeesInput(defaults.quarterly)}
          hint={defaultHint(defaults.quarterly, "QUARTERLY")}
          error={Number.isNaN(typed.quarterly) ? "Enter an amount like 7500 or 7500.50" : undefined}
          isDisabled={saving}
          autoFocus={autoFocus && preferredCycle !== "YEARLY"}
        />
        <RupeesInput
          id={`custom-yearly-${website.id}`}
          label="Yearly (12 months)"
          value={yearly}
          onChange={setYearly}
          placeholder={defaults.yearly === null ? "Not offered" : paiseToRupeesInput(defaults.yearly)}
          hint={defaultHint(defaults.yearly, "YEARLY")}
          error={Number.isNaN(typed.yearly) ? "Enter an amount like 24000 or 24000.50" : undefined}
          isDisabled={saving}
          autoFocus={autoFocus && preferredCycle === "YEARLY"}
        />
      </div>
      <p className="text-xs text-ink-muted">
        Only this website, on the {custom.name} package. Clear a field to use the default; 0 = free. Applies from the next payment.
      </p>

      {error && <FormAlert status="danger">{error}</FormAlert>}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onPress={() => void save()} isPending={saving} isDisabled={!changed || invalid || unpriced}>
          Save price
        </Button>
        {hasOwn && (
          <Button size="sm" variant="ghost" isDisabled={saving || (!hasDefault && !listed)} onPress={() => void reset()}>
            {hasDefault ? "Use default price" : "Remove custom price"}
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
