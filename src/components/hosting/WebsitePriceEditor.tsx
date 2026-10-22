import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { hostingApi, type BillingCycle, type WebsiteHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { defaultPlan, paiseToRupeesInput, rupeesInputToPaise } from "../../utils/hosting-pricing.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { RupeesInput } from "./hosting-labels.tsx";

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
 * Super Admin: the price agreed for this website on the custom package. Saving puts the website on the custom
 * package; removing it moves the website back to a listed package. Applies from the next payment.
 */
export default function WebsitePriceEditor({ hosting, onSaved, onCancel, preferredCycle, autoFocus }: WebsitePriceEditorProps) {
  const { subscription, website } = hosting;
  const custom = hosting.packages.find((pkg) => pkg.isCustom);
  const listed = defaultPlan({ packages: hosting.packages.filter((pkg) => !pkg.isCustom), subscription: null });
  const stored = { quarterly: subscription?.customQuarterlyPaise ?? null, yearly: subscription?.customYearlyPaise ?? null };

  const [quarterly, setQuarterly] = useState(paiseToRupeesInput(stored.quarterly));
  const [yearly, setYearly] = useState(paiseToRupeesInput(stored.yearly));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuarterly(paiseToRupeesInput(stored.quarterly));
    setYearly(paiseToRupeesInput(stored.yearly));
    setError(null);
  }, [stored.quarterly, stored.yearly]);

  const next = { quarterly: rupeesInputToPaise(quarterly), yearly: rupeesInputToPaise(yearly) };
  const invalid = Number.isNaN(next.quarterly) || Number.isNaN(next.yearly);
  const empty = next.quarterly === null && next.yearly === null;
  const changed = next.quarterly !== stored.quarterly || next.yearly !== stored.yearly;
  const hasOwn = stored.quarterly !== null || stored.yearly !== null;

  /** Keeps the wanted cycle when the custom price offers it, else the cycle that has a price. */
  function customCycle(): BillingCycle {
    const current = preferredCycle ?? subscription?.cycle ?? "YEARLY";
    if ((current === "QUARTERLY" ? next.quarterly : next.yearly) !== null) return current;
    return next.quarterly !== null ? "QUARTERLY" : "YEARLY";
  }

  async function save(remove: boolean) {
    setSaving(true);
    setError(null);
    try {
      onSaved(
        await hostingApi.updatePlan(
          website.id,
          remove
            ? { customQuarterlyPaise: null, customYearlyPaise: null, ...(listed ? { packageId: listed.packageId, cycle: listed.cycle } : {}) }
            : { customQuarterlyPaise: next.quarterly, customYearlyPaise: next.yearly, packageId: custom!.id, cycle: customCycle() },
        ),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!custom) {
    return (
      <FormAlert status="warning">
        The Custom package is hidden. Show it in Settings → Hosting to agree a price for a website.
      </FormAlert>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <RupeesInput
          id={`custom-quarterly-${website.id}`}
          label="Quarterly (3 months)"
          value={quarterly}
          onChange={setQuarterly}
          placeholder="Not offered"
          error={Number.isNaN(next.quarterly) ? "Enter an amount like 2100 or 2100.50" : undefined}
          isDisabled={saving}
          autoFocus={autoFocus && preferredCycle !== "YEARLY"}
        />
        <RupeesInput
          id={`custom-yearly-${website.id}`}
          label="Yearly (12 months)"
          value={yearly}
          onChange={setYearly}
          placeholder="Not offered"
          error={Number.isNaN(next.yearly) ? "Enter an amount like 7000 or 7000.50" : undefined}
          isDisabled={saving}
          autoFocus={autoFocus && preferredCycle === "YEARLY"}
        />
      </div>
      <p className="text-xs text-ink-muted">
        Only this website, on the {custom.name} package. Leave a cycle empty to not offer it; 0 = free. Applies from the next payment.
      </p>

      {error && <FormAlert status="danger">{error}</FormAlert>}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onPress={() => void save(false)} isPending={saving} isDisabled={!changed || invalid || empty}>
          Save price
        </Button>
        {hasOwn && (
          <Button size="sm" variant="ghost" isDisabled={saving || !listed} onPress={() => void save(true)}>
            Remove custom price
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
