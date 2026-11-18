import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ShopPaymentLog } from "../../api/shop.ts";
import { describePaymentLog } from "./payment-log-text.ts";
import { formatInr, formatWhen } from "./shop-format.ts";

/** Plain-language Razorpay activity for shop owners: what happened, to which order, for how much. */
export default function PaymentLogOwnerTable({
  logs,
  onOpenOrder,
}: {
  logs: ShopPaymentLog[];
  onOpenOrder: (orderId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs font-medium text-ink-muted">
            <th className="px-5 py-2 font-medium">When</th>
            <th className="px-3 py-2 font-medium">What happened</th>
            <th className="px-3 py-2 font-medium">Order</th>
            <th className="px-5 py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {logs.map((log) => {
            const text = describePaymentLog(log);
            const Icon = text.problem ? AlertCircle : CheckCircle2;
            return (
              <tr key={log.id} className={text.problem ? "bg-rose-50/40" : ""}>
                <td className="whitespace-nowrap px-5 py-3 align-top text-ink-muted">{formatWhen(log.createdAt)}</td>
                <td className="px-3 py-3 align-top">
                  <div className="flex items-start gap-2">
                    <Icon className={`mt-0.5 size-4 shrink-0 ${text.problem ? "text-rose-600" : "text-emerald-600"}`} aria-hidden />
                    <div>
                      <p className={`font-medium ${text.problem ? "text-rose-900" : "text-ink"}`}>{text.title}</p>
                      {text.detail && <p className="mt-0.5 text-xs text-ink-muted">{text.detail}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 align-top">
                  {log.orderId && log.orderNumber ? (
                    <button type="button" className="font-medium text-brand hover:underline" onClick={() => onOpenOrder(log.orderId!)}>
                      #{log.orderNumber}
                    </button>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right align-top tabular-nums text-ink">
                  {log.amountPaise != null ? formatInr(log.amountPaise) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
