import { useEffect, useState } from "react";
import { pricingApi, type BillingCycle, type PublicPricing } from "../../api/hosting.ts";

export type PricingState = { pricing: PublicPricing | null; failed: boolean };
export type CyclePrice = { connects: number; paise: number };

export function usePublicPricing(): PricingState {
  const [state, setState] = useState<PricingState>({ pricing: null, failed: false });

  useEffect(() => {
    let cancelled = false;
    pricingApi.get().then(
      (pricing) => {
        if (!cancelled) setState({ pricing, failed: false });
      },
      () => {
        if (!cancelled) setState({ pricing: null, failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/** Null when the price isn't set yet (0), so the page can ask visitors to contact sales instead. */
export function cyclePrice(pricing: PublicPricing | null, cycle: BillingCycle): CyclePrice | null {
  if (!pricing) return null;
  const price =
    cycle === "YEARLY"
      ? { connects: pricing.yearlyConnects, paise: pricing.yearlyPaise }
      : { connects: pricing.quarterlyConnects, paise: pricing.quarterlyPaise };
  return price.connects > 0 ? price : null;
}

/** Whole-percent saving of yearly over four quarters; 0 when there is no saving. */
export function yearlySavingPercent(pricing: PublicPricing | null): number {
  const quarterly = cyclePrice(pricing, "QUARTERLY");
  const yearly = cyclePrice(pricing, "YEARLY");
  if (!quarterly || !yearly) return 0;
  return Math.max(0, Math.round((1 - yearly.connects / (quarterly.connects * 4)) * 100));
}
