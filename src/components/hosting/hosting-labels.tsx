import { Chip, Label, Switch } from "@heroui/react";
import type {
  BillingCycle,
  HostingPayer,
  HostingPayment,
  HostingPaymentMethod,
  HostingSubscription,
  WebsiteHosting,
} from "../../api/hosting.ts";
import { formatConnects, formatPaise } from "../../api/wallet.ts";

export const CYCLE_LABELS: Record<BillingCycle, string> = { QUARTERLY: "Quarterly", YEARLY: "Yearly" };
export const CYCLE_PERIOD: Record<BillingCycle, string> = { QUARTERLY: "3 months", YEARLY: "1 year" };

export const METHOD_LABELS: Record<HostingPaymentMethod, string> = {
  RAZORPAY: "Online",
  WALLET: "Connects",
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank transfer",
};

export const PAYER_LABELS: Record<HostingPayer, string> = {
  CLIENT: "Client",
  ADMIN: "Admin",
  SYSTEM: "Auto-renewal",
};

/** "Standard · Yearly"; just the cycle for plans and payments from before packages. */
export function planLabel(plan: { packageName: string | null; cycle: BillingCycle }): string {
  return plan.packageName ? `${plan.packageName} · ${CYCLE_LABELS[plan.cycle]}` : CYCLE_LABELS[plan.cycle];
}

/** A plan's price per period: "₹2,100", "Free", or "Not set" when it can't be paid yet. */
export function formatPlanPrice(paise: number | null): string {
  if (paise === null) return "Not set";
  return paise === 0 ? "Free" : formatPaise(paise);
}

/** What a payment cost, and in connects when it was paid from the wallet. */
export function paymentAmountLabel(payment: Pick<HostingPayment, "amountPaise" | "connects">): { amount: string; detail: string | null } {
  return {
    amount: formatPlanPrice(payment.amountPaise),
    detail: payment.connects ? formatConnects(payment.connects) : null,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Billing dates are shown in India time, matching the server and the emails. */
const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export function formatBillingDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}

export function formatPeriod(start: string, end: string): string {
  return `${formatBillingDate(start)} – ${formatBillingDate(end)}`;
}

/** Whole days from now until `iso`; negative once it has passed. */
export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS);
}

/** Same rule as the server's publish check: billing on and no paid (or grace) plan. */
export function hostingBlocksPublish(hosting: WebsiteHosting | null): boolean {
  if (!hosting?.enabled) return false;
  const status = hosting.subscription?.status;
  return status !== "ACTIVE" && status !== "GRACE";
}

/** "12 days left", "Ends today", "Ended 2 days ago". */
export function remainingLabel(subscription: HostingSubscription): string | null {
  const until = subscription.status === "GRACE" ? subscription.graceEndsAt : subscription.currentPeriodEnd;
  if (!until || subscription.status === "SUSPENDED" || subscription.status === "AWAITING_PAYMENT") return null;
  const days = daysUntil(until);
  if (subscription.status === "GRACE") return days <= 0 ? "Going offline" : `Offline in ${days} ${days === 1 ? "day" : "days"}`;
  if (days < 0) return "Renewing";
  if (days === 0) return "Ends today";
  return `${days} ${days === 1 ? "day" : "days"} left`;
}

export function HostingStatusChip({ subscription }: { subscription: HostingSubscription | null }) {
  if (!subscription) return <Chip size="sm" variant="soft">No plan</Chip>;
  switch (subscription.status) {
    case "ACTIVE":
      return (
        <Chip size="sm" color="success">
          Active
        </Chip>
      );
    case "GRACE":
      return (
        <Chip size="sm" color="warning">
          Expired · grace
        </Chip>
      );
    case "SUSPENDED":
      return (
        <Chip size="sm" color="danger">
          Offline · unpaid
        </Chip>
      );
    case "AWAITING_PAYMENT":
      return (
        <Chip size="sm" color="accent" variant="soft">
          Awaiting payment
        </Chip>
      );
  }
}

export function SwitchField({
  label,
  isSelected,
  onChange,
  isDisabled,
}: {
  label: string;
  isSelected: boolean;
  onChange: (value: boolean) => void;
  isDisabled?: boolean;
}) {
  return (
    <Switch isSelected={isSelected} onChange={onChange} isDisabled={isDisabled}>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Label className="text-sm text-ink">{label}</Label>
      </Switch.Content>
    </Switch>
  );
}

/** Rupee amount field styled like the other settings inputs; empty means "not set". */
export function RupeesInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  isDisabled,
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  isDisabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={`flex h-9 items-center rounded-lg border bg-surface shadow-ed-xs focus-within:ring-2 ${
          error
            ? "border-ed-danger focus-within:ring-ed-danger/15"
            : "border-ed-border focus-within:border-ed-accent focus-within:ring-ed-accent/15"
        }`}
      >
        <span className="pl-3 text-sm text-ink-muted" aria-hidden>
          ₹
        </span>
        <input
          id={id}
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          disabled={isDisabled}
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value.replace(/[^\d.,]/g, "").slice(0, 12))}
          className="w-full min-w-0 bg-transparent px-2 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none disabled:cursor-not-allowed"
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-ed-danger">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
}