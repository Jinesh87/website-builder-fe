import { Lock } from "lucide-react";
import type { BillingCycle, WebsiteHosting } from "../../api/hosting.ts";
import { connectsPriceInPaise, formatConnects, formatPaise } from "../../api/wallet.ts";
import { CYCLE_LABELS, CYCLE_PERIOD } from "./hosting-labels.tsx";

function reason(hosting: WebsiteHosting, isAdmin: boolean): { title: string; body: string } {
  const status = hosting.subscription?.status;
  if (status === "SUSPENDED") {
    return {
      title: "Hosting expired",
      body: isAdmin
        ? "This website went offline because its hosting wasn't renewed. Record a payment to bring it back; nothing in the site changes."
        : "Your website went offline because its hosting wasn't renewed. Renew to bring it back; nothing in your site changes.",
    };
  }
  if (status === "AWAITING_PAYMENT" && hosting.subscription) {
    const plan = CYCLE_LABELS[hosting.subscription.cycle].toLowerCase();
    return {
      title: "Hosting plan ready",
      body: isAdmin
        ? `A ${plan} plan is set up for this website. Record the client's payment to put it live.`
        : `A ${plan} plan is set up for this website. Pay for it to go live.`,
    };
  }
  return {
    title: "Hosting plan needed to go live",
    body: isAdmin
      ? "Every website needs an active hosting plan to be live. Record the client's payment or charge their connects."
      : "Every website needs an active hosting plan to be live on the internet. Your draft is saved, and you can keep editing anytime.",
  };
}

/** Yearly saving against four quarters, in whole percent; 0 when there is none. */
function yearlySaving(hosting: WebsiteHosting): number {
  const quarters = hosting.prices.QUARTERLY.amount * 4;
  const yearly = hosting.prices.YEARLY.amount;
  return quarters > 0 && yearly < quarters ? Math.round((1 - yearly / quarters) * 100) : 0;
}

/** Explains why publishing needs a hosting plan; `compact` drops the price list (e.g. inside the checkout). */
export default function HostingRequiredCard({
  hosting,
  isAdmin,
  compact = false,
}: {
  hosting: WebsiteHosting;
  isAdmin: boolean;
  compact?: boolean;
}) {
  const { title, body } = reason(hosting, isAdmin);
  const saving = yearlySaving(hosting);
  const cycles: BillingCycle[] = ["QUARTERLY", "YEARLY"];

  return (
    <div role="status" className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
          <Lock className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-body">{body}</p>
        </div>
      </div>

      {!compact && (
        <dl className="mt-3 divide-y divide-amber-200/70 rounded-lg border border-amber-200/70 bg-surface text-sm">
          {cycles.map((cycle) => (
            <div key={cycle} className="flex items-center justify-between gap-3 px-3 py-2">
              <dt className="flex items-center gap-2 text-ink">
                {CYCLE_LABELS[cycle]}
                <span className="text-xs text-ink-muted">· {CYCLE_PERIOD[cycle]}</span>
                {cycle === "YEARLY" && saving > 0 && (
                  <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                    Save {saving}%
                  </span>
                )}
              </dt>
              <dd className="text-right font-medium text-ink">
                {formatConnects(hosting.prices[cycle].amount)}
                <span className="ml-1 text-xs font-normal text-ink-muted">
                  ({formatPaise(connectsPriceInPaise(hosting.prices[cycle].amount, hosting.connectsPerRupee))})
                </span>
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
            <dt className="text-ink-muted">{isAdmin ? "Client's connects" : "Your connects"}</dt>
            <dd className="font-medium text-ink">{formatConnects(hosting.balance)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
