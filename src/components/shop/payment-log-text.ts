import type { ShopPaymentLog } from "../../api/shop.ts";

export type PaymentLogText = {
  /** What happened, in the shop owner's words. */
  title: string;
  /** Extra context (reason, what to do), or null. */
  detail: string | null;
  /** Something the owner may need to act on. */
  problem: boolean;
};

const REFUND_REASONS: Record<string, string> = {
  shop_customer_cancel: "customer cancelled",
  shop_customer_return: "customer return",
  shop_merchant_cancel: "cancelled by the store",
  shop_merchant_return_refund: "return refunded by the store",
  shop_stock_unavailable: "out of stock after payment",
};

function sentence(text: string): string {
  const trimmed = text.trim().replace(/\.$/, "");
  return trimmed ? `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}.` : "";
}

/** "Refund processed: customer cancelled." or the older "Refund processed (shop_merchant_cancel)." → the reason. */
function refundReason(message: string | null): string | null {
  if (!message) return null;
  const coded = message.match(/\((shop_[a-z_]+)\)/);
  if (coded) return sentence(REFUND_REASONS[coded[1]] ?? coded[1].replace(/^shop_/, "").replace(/_/g, " "));
  const plain = message.match(/^Refund [a-z]+: (.+)$/i);
  return plain ? sentence(plain[1]) : null;
}

/** Turns a Razorpay log entry into plain language for a shop owner. */
export function describePaymentLog(log: ShopPaymentLog): PaymentLogText {
  const message = log.message ?? "";
  switch (log.kind) {
    case "order_created":
      return log.success
        ? { title: "Customer started checkout", detail: null, problem: false }
        : { title: "Checkout couldn't start", detail: message || null, problem: true };
    case "payment_verified":
      return log.success
        ? { title: "Payment received", detail: null, problem: false }
        : { title: "Payment not completed", detail: message || null, problem: true };
    case "payment_captured":
      return log.success
        ? { title: "Payment captured", detail: null, problem: false }
        : { title: "Payment couldn't be captured", detail: message || null, problem: true };
    case "refund":
      return log.success
        ? { title: "Refund sent to customer", detail: refundReason(message), problem: false }
        : { title: "Refund failed", detail: message.replace(/^Refund failed \(([^)]+)\):\s*/, "") || null, problem: true };
    case "webhook":
      if (message.startsWith("Webhook rejected")) {
        return {
          title: "Razorpay updates are being rejected",
          detail: "Check that the webhook secret in Razorpay settings matches the one in your Razorpay dashboard.",
          problem: true,
        };
      }
      if (message.startsWith("payment.failed")) {
        return { title: "Customer's payment failed", detail: sentence(message.replace(/^payment\.failed:?\s*/, "")) || null, problem: true };
      }
      return { title: "Update from Razorpay", detail: message || null, problem: !log.success };
    default:
      return { title: "Razorpay activity", detail: message || null, problem: !log.success };
  }
}
