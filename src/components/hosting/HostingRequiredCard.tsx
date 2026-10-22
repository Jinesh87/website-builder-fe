import { AlertCircle, Check, Server, Sparkles, Sliders, Wallet } from "lucide-react";
import type { BillingCycle, WebsiteHosting } from "../../api/hosting.ts";
import { connectsPriceInPaise, formatConnects, formatPaise } from "../../api/wallet.ts";
import { CYCLE_LABELS } from "./hosting-labels.tsx";

export type SelectedHostingOption = BillingCycle | "CUSTOM";

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
function yearlySaving(hosting: WebsiteHosting): { saving: number; regularConnects: number } {
  const quarters = hosting.prices.QUARTERLY.amount * 4;
  const yearly = hosting.prices.YEARLY.amount;
  const saving = quarters > 0 && yearly < quarters ? Math.round((1 - yearly / quarters) * 100) : 0;
  return { saving, regularConnects: quarters };
}

/** Explains why publishing needs a hosting plan; `compact` drops the price list (e.g. inside the checkout). */
export default function HostingRequiredCard({
  hosting,
  isAdmin,
  compact = false,
  selectedOption,
  onSelect,
}: {
  hosting: WebsiteHosting;
  isAdmin: boolean;
  compact?: boolean;
  selectedOption?: SelectedHostingOption;
  onSelect?: (option: SelectedHostingOption) => void;
}) {
  const { title, body } = reason(hosting, isAdmin);
  const { saving, regularConnects } = yearlySaving(hosting);
  const cycles: BillingCycle[] = ["QUARTERLY", "YEARLY"];
  const status = hosting.subscription?.status;

  const isSuspended = status === "SUSPENDED";
  const isAwaiting = status === "AWAITING_PAYMENT";

  const Icon = isSuspended ? AlertCircle : Server;
  const iconStyle = isSuspended
    ? "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
    : isAwaiting
      ? "bg-brand-soft text-brand ring-1 ring-brand/20"
      : "bg-canvas text-ink ring-1 ring-line-strong/60";

  const badgeStyle = isSuspended
    ? "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
    : isAwaiting
      ? "bg-brand-soft text-brand ring-1 ring-brand/20"
      : "bg-canvas text-ink-muted border border-line";

  const badgeText = isSuspended ? "Offline" : isAwaiting ? "Ready to activate" : "Required";
  const cardBorder = isSuspended ? "border-amber-200/80 bg-amber-50/20" : "border-line bg-surface";

  const activeOption = selectedOption ?? (hosting.subscription?.cycle ?? "QUARTERLY");
  const hasCustomPrice =
    hosting.priceLevels.website.quarterlyPrice !== null || hosting.priceLevels.website.yearlyPrice !== null;

  return (
    <div role="status" className="space-y-3">
      {/* Header status bar */}
      <div className={`flex items-start gap-3 rounded-xl border p-3 shadow-xs ${cardBorder}`}>
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${iconStyle}`}>
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-ink">{title}</p>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeStyle}`}>
              {badgeText}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-body leading-relaxed">{body}</p>
        </div>
      </div>

      {!compact && (
        <>
          {/* Hostinger-style pricing cards (Quarterly, Yearly, and Custom for admin) */}
          <div className={`grid gap-2.5 ${isAdmin ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
            {cycles.map((cycle) => {
              const isConfigured = hosting.subscription?.cycle === cycle;
              const isSelected = activeOption === cycle;
              const price = hosting.prices[cycle];
              const isYearly = cycle === "YEARLY";

              return (
                <div
                  key={cycle}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect?.(cycle)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect?.(cycle);
                    }
                  }}
                  className={`relative flex flex-col justify-between rounded-xl border p-3 text-center transition-all outline-none ${
                    onSelect ? "cursor-pointer" : ""
                  } ${
                    isSelected
                      ? "border-brand bg-brand-soft/10 ring-2 ring-brand/20 shadow-xs"
                      : "border-line bg-surface hover:border-line-strong hover:bg-canvas/30"
                  }`}
                >
                  {/* Top card header */}
                  <div>
                    <h4 className="text-sm font-bold text-ink">{CYCLE_LABELS[cycle]}</h4>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      {isYearly ? "12 months hosting" : "3 months hosting"}
                    </p>

                    {/* Strikethrough & discount badge slot (aligned h-6 across cards) */}
                    <div className="mt-2 flex h-6 items-center justify-center">
                      {isYearly && saving > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                          SAVE {saving}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-canvas px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                          Standard rate
                        </span>
                      )}
                    </div>

                    {/* Big Hero Price (unified text-xl with strikethrough) */}
                    <div className="mt-2">
                      <div className="flex items-baseline justify-center gap-1.5">
                        {isYearly && saving > 0 && (
                          <span className="text-xs font-normal text-ink-muted line-through">
                            {regularConnects}
                          </span>
                        )}
                        <span className="text-xl font-extrabold tracking-tight text-ink">
                          {price.amount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-semibold text-ink-muted">connects</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        ({formatPaise(connectsPriceInPaise(price.amount, hosting.connectsPerRupee))})
                      </p>
                    </div>

                    {/* Benefit / perk line (aligned h-5 across cards) */}
                    <div className="mt-2.5 flex h-5 items-center justify-center text-[11px] font-medium">
                      {isConfigured ? (
                        <span className="inline-flex items-center gap-1 text-brand">
                          <Check className="size-3 stroke-[2.5]" aria-hidden /> Current site plan
                        </span>
                      ) : isYearly && saving > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Sparkles className="size-3" aria-hidden /> Best value
                        </span>
                      ) : (
                        <span className="text-ink-muted">Flexible commitment</span>
                      )}
                    </div>
                  </div>

                  {/* Card bottom: Button pill & renewal footnote */}
                  <div className="mt-3.5 border-t border-line/60 pt-2.5">
                    <div
                      className={`w-full rounded-lg py-1.5 text-center text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-brand text-white shadow-xs"
                          : "border border-line-strong/80 bg-surface text-ink hover:bg-canvas hover:border-line-strong shadow-2xs"
                      }`}
                    >
                      {isSelected ? "Selected Plan" : "Choose Plan"}
                    </div>
                    <p className="mt-1.5 text-[10px] text-ink-muted">
                      {isYearly ? "Renews annually" : "Renews every 3 months"}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Custom option (Admin only) */}
            {isAdmin && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect?.("CUSTOM")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect?.("CUSTOM");
                  }
                }}
                className={`relative flex flex-col justify-between rounded-xl border p-3 text-center transition-all outline-none ${
                  onSelect ? "cursor-pointer" : ""
                } ${
                  activeOption === "CUSTOM"
                    ? "border-brand bg-brand-soft/10 ring-2 ring-brand/20 shadow-xs"
                    : "border-line bg-surface hover:border-line-strong hover:bg-canvas/30"
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold text-ink">Custom</h4>
                  <p className="mt-0.5 text-[11px] text-ink-muted">Admin override</p>

                  <div className="mt-2 flex h-6 items-center justify-center">
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                      Admin only
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-xl font-extrabold tracking-tight text-ink">
                        {hasCustomPrice ? "Custom rate" : "Custom price"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      {hasCustomPrice ? "Custom rate configured" : "Set specific connects"}
                    </p>
                  </div>

                  <div className="mt-2.5 flex h-5 items-center justify-center text-[11px] font-medium text-ink-muted">
                    {activeOption === "CUSTOM" ? (
                      <span className="inline-flex items-center gap-1 text-brand">
                        <Check className="size-3 stroke-[2.5]" aria-hidden /> Override price
                      </span>
                    ) : hasCustomPrice ? (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Check className="size-3 stroke-[2.5]" aria-hidden /> Rate active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-ink-muted">
                        <Sliders className="size-3" aria-hidden /> Custom price
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 border-t border-line/60 pt-2.5">
                  <div
                    className={`w-full rounded-lg py-1.5 text-center text-xs font-semibold transition-all ${
                      activeOption === "CUSTOM"
                        ? "bg-brand text-white shadow-xs"
                        : "border border-line-strong/80 bg-surface text-ink hover:bg-canvas hover:border-line-strong shadow-2xs"
                    }`}
                  >
                    {activeOption === "CUSTOM" ? "Selected Plan" : "Set Custom"}
                  </div>
                  <p className="mt-1.5 text-[10px] text-ink-muted">Website override</p>
                </div>
              </div>
            )}
          </div>

          {/* Connects balance bar */}
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-ink-muted">
              <Wallet className="size-3.5 text-ink-muted" aria-hidden />
              <span>{isAdmin ? "Client's connects" : "Your connects"}</span>
            </div>
            <span className="font-semibold text-ink">{formatConnects(hosting.balance)}</span>
          </div>
        </>
      )}
    </div>
  );
}
