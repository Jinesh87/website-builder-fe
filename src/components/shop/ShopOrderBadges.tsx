import type { ShopOrderStatus, ShopRefundStatus } from "../../api/shop.ts";
import { refundClass, refundLabel, statusClass, statusLabel } from "./shop-order-format.ts";

export function StatusBadge({ status }: { status: ShopOrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

export function RefundBadge({ status }: { status: ShopRefundStatus }) {
  const label = refundLabel(status);
  if (!label) return null;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${refundClass(status)}`}>
      {label}
    </span>
  );
}

export function GuestBadge() {
  return (
    <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800 ring-1 ring-inset ring-sky-200">
      Guest
    </span>
  );
}

/** Marks an order rung up at the in-store till. */
export function PosBadge() {
  return (
    <span className="inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800 ring-1 ring-inset ring-violet-200">
      POS
    </span>
  );
}

/** Marks an order placed on the online store. */
export function OnlineBadge() {
  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">
      Online
    </span>
  );
}
