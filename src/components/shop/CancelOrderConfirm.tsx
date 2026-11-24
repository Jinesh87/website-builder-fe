import { Button } from "@heroui/react";
import type { ShopOrder } from "../../api/shop.ts";
import { formatInr } from "./shop-format.ts";

/** Asks before the store cancels an order: says what gets refunded and restocked. */
export default function CancelOrderConfirm({
  order,
  refunds,
  saving,
  onConfirm,
  onKeep,
}: {
  order: ShopOrder;
  /** The cancel will refund the customer's online payment. */
  refunds: boolean;
  saving: boolean;
  onConfirm: () => void;
  onKeep: () => void;
}) {
  const amount = formatInr(order.totalPaise);
  const pos = order.channel === "pos";
  const noun = pos ? "sale" : "order";
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
      <p className="text-sm font-medium text-rose-900">
        Cancel {noun} #{order.number}?
      </p>
      <CancelOrderPoints order={order} refunds={refunds} className="mt-1 text-xs text-rose-800" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onPress={onConfirm} isDisabled={saving}>
          {refunds ? `Cancel and refund ${amount}` : `Cancel ${noun}`}
        </Button>
        <Button size="sm" variant="outline" onPress={onKeep} isDisabled={saving}>
          Keep {noun}
        </Button>
      </div>
    </div>
  );
}

/** What cancelling does: refund, restock, email. Shared by the inline confirm and the POS cancel modal. */
export function CancelOrderPoints({ order, refunds, className = "" }: { order: ShopOrder; refunds: boolean; className?: string }) {
  const amount = formatInr(order.totalPaise);
  const pos = order.channel === "pos";
  return (
    <ul className={`list-disc space-y-0.5 pl-5 ${className}`}>
      {refunds && <li>{amount} will be refunded to the customer through Razorpay.</li>}
      {pos && !refunds && <li>Give the customer their {amount} back by hand (cash, UPI or card).</li>}
      {order.stockDeductedAt && <li>The {pos ? "sold" : "ordered"} items go back into stock.</li>}
      {!pos && <li>The customer is emailed that the order was cancelled.</li>}
    </ul>
  );
}
