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
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
      <p className="text-sm font-medium text-rose-900">Cancel order #{order.number}?</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-rose-800">
        {refunds && <li>{amount} will be refunded to the customer through Razorpay.</li>}
        {order.stockDeductedAt && <li>The ordered items go back into stock.</li>}
        <li>The customer is emailed that the order was cancelled.</li>
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onPress={onConfirm} isDisabled={saving}>
          {refunds ? `Cancel and refund ${amount}` : "Cancel order"}
        </Button>
        <Button size="sm" variant="outline" onPress={onKeep} isDisabled={saving}>
          Keep order
        </Button>
      </div>
    </div>
  );
}
