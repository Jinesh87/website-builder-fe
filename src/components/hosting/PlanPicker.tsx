import type { ReactNode } from "react";
import { Check, Pencil } from "lucide-react";
import type { BillingCycle, HostingPackage, PlanChoice } from "../../api/hosting.ts";
import { formatPaise } from "../../api/wallet.ts";
import { bestYearlySaving, CYCLES, yearlySavingPercent } from "../../utils/hosting-pricing.ts";
import { CYCLE_LABELS, CYCLE_PERIOD } from "./hosting-labels.tsx";

type PlanPickerProps = {
  packages: HostingPackage[];
  value: PlanChoice | null;
  onChange: (plan: PlanChoice) => void;
  /** Marks the website's current package. */
  currentPackageId?: string | null;
  /** Client: shown on the custom card while it has neither a default nor an own price, e.g. "Contact us". */
  customAction?: ReactNode;
  /** Super Admin: the custom card can always be chosen and shows a button to set or adjust this website's price. */
  onEditCustom?: () => void;
  isDisabled?: boolean;
};

/** Cycle switch over Starter / Dedicated / Custom cards, priced for one website. */
export default function PlanPicker({
  packages,
  value,
  onChange,
  currentPackageId,
  customAction,
  onEditCustom,
  isDisabled,
}: PlanPickerProps) {
  const cycle: BillingCycle = value?.cycle ?? "YEARLY";
  const saving = bestYearlySaving(packages);
  const selectable = (pkg: HostingPackage, target: BillingCycle) => pkg.prices[target] !== null || (pkg.isCustom && Boolean(onEditCustom));

  function chooseCycle(next: BillingCycle) {
    if (next === cycle && value) return;
    const keep = packages.find((pkg) => pkg.id === value?.packageId && selectable(pkg, next));
    const fallback = keep ?? packages.find((pkg) => pkg.featured && pkg.prices[next] !== null) ?? packages.find((pkg) => pkg.prices[next] !== null);
    if (fallback) onChange({ packageId: fallback.id, cycle: next });
  }

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Billing period" className="mx-auto inline-flex rounded-lg border border-line bg-canvas p-1">
        {CYCLES.map((option) => {
          const selected = option === cycle;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={isDisabled}
              onClick={() => chooseCycle(option)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                selected ? "bg-surface text-ink shadow-xs" : "text-ink-muted hover:text-ink"
              }`}
            >
              {CYCLE_LABELS[option]}
              {option === "YEARLY" && saving > 0 && (
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Save {saving}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="radiogroup" aria-label="Hosting package" className={`grid gap-2.5 ${packages.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {packages.map((pkg) => {
          const price = pkg.prices[cycle];
          const canChoose = selectable(pkg, cycle) && !isDisabled;
          const selected = selectable(pkg, cycle) && value?.packageId === pkg.id && value.cycle === cycle;
          const editable = pkg.isCustom && onEditCustom;
          const ownPrice = pkg.isCustom && price !== null && price !== pkg.defaultPrices[cycle];
          const pkgSaving = cycle === "YEARLY" && !pkg.isCustom ? yearlySavingPercent(pkg.prices) : 0;
          const tag = pkg.id === currentPackageId ? "Current" : pkg.featured ? "Popular" : pkgSaving > 0 ? `Save ${pkgSaving}%` : null;
          const choose = () => canChoose && onChange({ packageId: pkg.id, cycle });
          return (
            <div
              key={pkg.id}
              role="radio"
              aria-checked={selected}
              aria-disabled={!canChoose}
              tabIndex={canChoose ? 0 : -1}
              onClick={choose}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  choose();
                }
              }}
              className={`flex flex-col rounded-xl border p-3.5 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-brand/30 ${
                selected
                  ? "border-brand bg-brand-soft/30 ring-2 ring-brand/20"
                  : canChoose
                    ? "cursor-pointer border-line bg-surface hover:border-line-strong"
                    : "border-dashed border-line bg-canvas/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{pkg.name}</span>
                {selected ? (
                  <Check className="size-4 text-brand" aria-hidden />
                ) : (
                  tag && (
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">{tag}</span>
                  )
                )}
              </div>
              <p className="mt-2 text-xl font-bold tracking-tight text-ink">
                {price === null ? (pkg.isCustom ? (editable ? "Not set" : "Custom") : "—") : price === 0 ? "Free" : formatPaise(price)}
              </p>
              <p className="text-xs text-ink-muted">
                {price === null
                  ? pkg.isCustom
                    ? editable
                      ? `No ${CYCLE_LABELS[cycle].toLowerCase()} price for this site`
                      : "Priced for your project"
                    : `Not offered ${CYCLE_LABELS[cycle].toLowerCase()}`
                  : `per ${CYCLE_PERIOD[cycle]}${ownPrice ? " · this site only" : ""}`}
              </p>
              {pkg.features.length > 0 && (
                <ul className="mt-2.5 flex flex-col gap-1 border-t border-line/60 pt-2.5 text-xs text-ink-body">
                  {pkg.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex gap-1.5">
                      <Check className="mt-0.5 size-3 shrink-0 text-emerald-600" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
              {editable ? (
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange({ packageId: pkg.id, cycle });
                    onEditCustom();
                  }}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-line-strong/80 bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Pencil className="size-3.5" aria-hidden />
                  {price === null ? "Set price" : "Adjust price"}
                </button>
              ) : (
                pkg.isCustom && price === null && customAction && <div className="mt-3">{customAction}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
