import type { ShopPaymentLog, ShopPaymentLogKind } from "../../api/shop.ts";
import { formatInr, formatWhen } from "./shop-format.ts";

const KIND_LABELS: Record<ShopPaymentLogKind, string> = {
  order_created: "Checkout started",
  payment_verified: "Payment check",
  payment_captured: "Payment captured",
  refund: "Refund",
  webhook: "Webhook",
};

function ResultBadge({ success }: { success: boolean }) {
  return success ? (
    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">
      Success
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800 ring-1 ring-inset ring-rose-200">
      Failed
    </span>
  );
}

/** Every Razorpay call and webhook with ids and raw messages, for troubleshooting with support. */
export default function PaymentLogTechnicalTable({
  logs,
  onOpenOrder,
}: {
  logs: ShopPaymentLog[];
  onOpenOrder: (orderId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs font-medium text-ink-muted">
            <th className="px-5 py-2 font-medium">When</th>
            <th className="px-3 py-2 font-medium">Event</th>
            <th className="px-3 py-2 font-medium">Result</th>
            <th className="px-3 py-2 font-medium">Order</th>
            <th className="px-3 py-2 font-medium">Amount</th>
            <th className="px-3 py-2 font-medium">Razorpay id</th>
            <th className="px-5 py-2 font-medium">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {logs.map((log) => (
            <tr key={log.id} className={log.success ? "" : "bg-rose-50/40"}>
              <td className="whitespace-nowrap px-5 py-3 text-ink-muted">{formatWhen(log.createdAt)}</td>
              <td className="px-3 py-3 text-ink">{KIND_LABELS[log.kind] ?? log.kind}</td>
              <td className="px-3 py-3">
                <ResultBadge success={log.success} />
              </td>
              <td className="px-3 py-3">
                {log.orderId && log.orderNumber ? (
                  <button
                    type="button"
                    className="font-medium text-brand hover:underline"
                    onClick={() => onOpenOrder(log.orderId!)}
                  >
                    #{log.orderNumber}
                  </button>
                ) : (
                  <span className="text-ink-muted">—</span>
                )}
              </td>
              <td className="px-3 py-3 tabular-nums text-ink">{log.amountPaise != null ? formatInr(log.amountPaise) : "—"}</td>
              <td className="px-3 py-3 font-mono text-xs text-ink-muted">{log.razorpayRef || "—"}</td>
              <td className="max-w-[22rem] px-5 py-3 text-xs text-ink-body">{log.message || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
