import type { ShopOrder, ShopOrderStatus, ShopRefundStatus } from "../../api/shop.ts";

export const STATUS_OPTIONS: { value: ShopOrderStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

export function statusLabel(status: ShopOrderStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function refundLabel(status: ShopRefundStatus): string | null {
  switch (status) {
    case "pending":
      return "Refund pending";
    case "processed":
      return "Refunded";
    case "failed":
      return "Refund failed";
    default:
      return null;
  }
}

export function statusClass(status: ShopOrderStatus): string {
  switch (status) {
    case "paid":
    case "delivered":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "processing":
    case "shipped":
      return "bg-sky-50 text-sky-800 ring-sky-200";
    case "pending":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "failed":
    case "cancelled":
      return "bg-rose-50 text-rose-800 ring-rose-200";
    default:
      return "bg-ed-bg text-ink-muted ring-ed-border";
  }
}

export function refundClass(status: ShopRefundStatus): string {
  switch (status) {
    case "processed":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "failed":
      return "bg-rose-50 text-rose-800 ring-rose-200";
    default:
      return "bg-ed-bg text-ink-muted ring-ed-border";
  }
}

/** Returned or cancelled orders with an online payment that the store hasn't refunded yet (or whose refund failed). */
export function awaitingRefund(order: Pick<ShopOrder, "status" | "refundStatus" | "razorpayPaymentId">): boolean {
  return (
    (order.status === "returned" || order.status === "cancelled") &&
    (order.refundStatus === "none" || order.refundStatus === "failed") &&
    !!order.razorpayPaymentId
  );
}
