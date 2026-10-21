import { Chip } from "@heroui/react";
import type {
  BillingCycle,
  HostingPayer,
  HostingPaymentMethod,
  HostingSubscription,
  PriceSource,
  WebsiteHosting,
} from "../../api/hosting.ts";
import { connectsPriceInPaise, formatPaise } from "../../api/wallet.ts";

export const CYCLE_LABELS: Record<BillingCycle, string> = { QUARTERLY: "Quarterly", YEARLY: "Yearly" };
export const CYCLE_PERIOD: Record<BillingCycle, string> = { QUARTERLY: "3 months", YEARLY: "1 year" };

export const METHOD_LABELS: Record<HostingPaymentMethod, string> = {
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

export const PRICE_SOURCE_LABELS: Record<PriceSource, string> = {
  WEBSITE: "Custom · website",
  CLIENT: "Custom · client",
  GLOBAL: "Global default",
};

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

export function formatConnectsPrice(connects: number, connectsPerRupee: number): string {
  return `${connects.toLocaleString("en-IN")} connects (${formatPaise(connectsPriceInPaise(connects, connectsPerRupee))})`;
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

/** Whole-connects field styled like the other settings inputs; empty means "not set". */
export function ConnectsInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  isDisabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  isDisabled?: boolean;
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
        <input
          id={id}
          inputMode="numeric"
          value={value}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 8))}
          className="w-full min-w-0 bg-transparent px-3 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none disabled:cursor-not-allowed"
        />
        <span className="pr-3 text-xs text-ink-muted" aria-hidden>
          connects
        </span>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-ed-danger">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
}

/** Text from a ConnectsInput: null when empty. */
export function parseConnects(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}
