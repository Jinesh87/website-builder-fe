import type { BillingCycle, CyclePrices, HostingPackage, PlanChoice, WebsiteHosting } from "../api/hosting.ts";

export const CYCLES: BillingCycle[] = ["QUARTERLY", "YEARLY"];

/** Whole-percent saving of a year over four quarters; 0 when there is none. */
export function yearlySavingPercent(prices: CyclePrices): number {
  const { QUARTERLY: quarterly, YEARLY: yearly } = prices;
  if (!quarterly || !yearly) return 0;
  return Math.max(0, Math.round((1 - yearly / (quarterly * 4)) * 100));
}

/** The best yearly saving across listed packages, for the cycle switch badge; a custom deal isn't a list price. */
export function bestYearlySaving(packages: HostingPackage[]): number {
  return packages.reduce((best, pkg) => (pkg.isCustom ? best : Math.max(best, yearlySavingPercent(pkg.prices))), 0);
}

/** Same rounding as the server: up, allowing for the half paisa a connects price rounds away. */
export function connectsForPaise(paise: number, connectsPerRupee: number): number {
  return Math.max(0, Math.ceil(((paise - 0.5) * connectsPerRupee) / 100));
}

/** Paise as an editable rupee amount: 210000 → "2100", 3333 → "33.33". */
export function paiseToRupeesInput(paise: number | null): string {
  if (paise === null) return "";
  return paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2);
}

/** A rupee amount typed by an admin, in paise; null when empty, NaN when invalid. */
export function rupeesInputToPaise(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (trimmed === "") return null;
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(trimmed)) return Number.NaN;
  const [whole, fraction = ""] = trimmed.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

/**
 * The plan to preselect: the website's own package and cycle when it can still be paid, else the featured
 * package (or the first payable one) on its yearly cycle when available.
 */
export function defaultPlan(hosting: Pick<WebsiteHosting, "packages" | "subscription">): PlanChoice | null {
  const { packages, subscription } = hosting;
  const payable = (pkg: HostingPackage, cycle: BillingCycle) => pkg.prices[cycle] !== null;
  const current = packages.find((pkg) => pkg.id === subscription?.packageId);
  if (current && subscription && payable(current, subscription.cycle)) return { packageId: current.id, cycle: subscription.cycle };

  const candidates = packages.filter((pkg) => CYCLES.some((cycle) => payable(pkg, cycle)));
  const pick = candidates.find((pkg) => pkg.featured) ?? candidates[0];
  if (!pick) return null;
  const preferred: BillingCycle = subscription?.cycle ?? "YEARLY";
  return { packageId: pick.id, cycle: payable(pick, preferred) ? preferred : CYCLES.find((cycle) => payable(pick, cycle))! };
}
