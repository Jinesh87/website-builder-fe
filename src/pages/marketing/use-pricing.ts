import { useEffect, useState } from "react";
import { pricingApi, type BillingCycle, type HostingPackage, type PublicPricing } from "../../api/hosting.ts";
import { formatPaise } from "../../api/wallet.ts";

export type PricingState = { pricing: PublicPricing | null; failed: boolean };

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

export const CYCLE_UNIT: Record<BillingCycle, string> = { QUARTERLY: "/ 3 months", YEARLY: "/ year" };
export const CYCLE_MONTHS: Record<BillingCycle, number> = { QUARTERLY: 3, YEARLY: 12 };

/** Display-only "starting from" for the custom package; its real price is agreed per website. */
export const CUSTOM_STARTING_PAISE: Record<BillingCycle, number> = { QUARTERLY: 360_000, YEARLY: 1_200_000 };

export function customStartingLabel(cycle: BillingCycle): string {
  return `From ${formatPaise(CUSTOM_STARTING_PAISE[cycle])} ${CYCLE_UNIT[cycle]}`;
}

/** The lowest listed price on a cycle, for "from ₹…" teasers; null when nothing is listed. */
export function lowestPrice(packages: HostingPackage[], cycle: BillingCycle): number | null {
  const prices = packages.map((pkg) => pkg.prices[cycle]).filter((price): price is number => price !== null && price > 0);
  return prices.length ? Math.min(...prices) : null;
}
