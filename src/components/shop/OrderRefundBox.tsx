import { useState } from "react";
import { Button } from "@heroui/react";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type ShopOrder } from "../../api/shop.ts";
import { formatInr } from "./shop-format.ts";
import { notifyReturnsChanged } from "./use-awaiting-returns.ts";

function refundResultMessage(order: ShopOrder): string {
  if (order.refundStatus === "processed") return "Refund processed.";
  if (order.refundStatus === "pending") return "Refund started. Waiting for Razorpay to confirm.";
  return "Refund updated.";
}

/**
 * "Waiting for refund" / "Refund failed" box on a returned or cancelled order, with a confirmed Refund button.
 * Show it only when `awaitingRefund(order)` is true.
 */
export default function OrderRefundBox({
  websiteId,
  order,
  disabled,
  onRefunded,
  onError,
}: {
  websiteId: string;
  order: ShopOrder;
  disabled?: boolean;
  onRefunded: (order: ShopOrder, message: string) => void;
  onError: (message: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const failed = order.refundStatus === "failed";
  const amount = formatInr(order.totalPaise);

  async function refund() {
    setConfirming(false);
    setRefunding(true);
    try {
      const next = await shopApi.retryOrderRefund(websiteId, order.id);
      onRefunded(next, refundResultMessage(next));
      notifyReturnsChanged();
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setRefunding(false);
    }
  }

  const explanation = failed
    ? "Razorpay could not refund this order. Try again; the customer is not charged again."
    : order.status === "cancelled"
      ? "This paid order was cancelled without a refund. Refund the customer here."
      : "The customer returned this order. Refund it once you have checked the returned item.";

  return (
    <div className={`rounded-lg border px-4 py-3 ${failed ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}>
      <p className={`text-sm font-medium ${failed ? "text-rose-900" : "text-amber-900"}`}>
        {failed ? "Refund failed" : "Waiting for refund"}
      </p>
      <p className={`mt-1 text-xs ${failed ? "text-rose-800" : "text-amber-800"}`}>
        {explanation}
        {order.returnReason ? ` Reason: “${order.returnReason}”` : ""}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {confirming ? (
          <>
            <span className="text-xs font-medium text-ink">Refund {amount} to the customer?</span>
            <Button size="sm" onPress={() => void refund()} isDisabled={refunding || disabled}>
              Yes, refund
            </Button>
            <Button size="sm" variant="outline" onPress={() => setConfirming(false)} isDisabled={refunding}>
              Not yet
            </Button>
          </>
        ) : (
          <Button size="sm" onPress={() => setConfirming(true)} isDisabled={refunding || disabled}>
            {refunding ? "Refunding…" : failed ? "Retry refund" : `Refund ${amount}`}
          </Button>
        )}
      </div>
    </div>
  );
}
