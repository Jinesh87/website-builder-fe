import { POS_METHOD_LABEL } from "../../../api/shop-pos.ts";
import type { SalesChannelTotals, SalesSummary } from "../../../api/shop-sales.ts";
import StatCard from "../StatCard.tsx";
import { formatInr } from "../shop-format.ts";

/** Channel colours, shared with the split bar and the orders list. */
export const CHANNEL_DOT = { online: "bg-emerald-500", pos: "bg-violet-500" } as const;

const PAYMENT_ROWS = [
  { key: "online", label: "Online checkout" },
  { key: "cash", label: `${POS_METHOD_LABEL.cash} (POS)` },
  { key: "upi", label: `${POS_METHOD_LABEL.upi} (POS)` },
  { key: "card", label: `${POS_METHOD_LABEL.card} (POS)` },
  { key: "razorpay_qr", label: `${POS_METHOD_LABEL.razorpay_qr} (POS)` },
] as const;

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function share(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/** How total revenue splits between the online store and the till. */
function ChannelSplit({ summary }: { summary: SalesSummary }) {
  const online = share(summary.online.revenuePaise, summary.total.revenuePaise);
  if (summary.total.revenuePaise === 0) return null;
  return (
    <div className="mt-3">
      <div className="flex h-2 overflow-hidden rounded-full bg-line" role="img" aria-label={`Online ${online}%, POS ${100 - online}%`}>
        <div className={CHANNEL_DOT.online} style={{ width: `${online}%` }} />
        <div className={CHANNEL_DOT.pos} style={{ width: `${100 - online}%` }} />
      </div>
      <p className="mt-1.5 flex justify-between text-xs text-ink-muted">
        <span>Online {online}%</span>
        <span>POS {100 - online}%</span>
      </p>
    </div>
  );
}

const COMPARE_ROWS: { label: string; value: (totals: SalesChannelTotals) => string }[] = [
  { label: "Orders", value: (t) => String(t.ordersCount) },
  { label: "Revenue", value: (t) => formatInr(t.revenuePaise) },
  { label: "Average order", value: (t) => formatInr(t.averagePaise) },
  { label: "Items sold", value: (t) => String(t.itemsSold) },
  { label: "Discounts", value: (t) => formatInr(t.discountPaise) },
  { label: "Cancelled", value: (t) => String(t.cancelledCount) },
  { label: "Returned", value: (t) => (t.returnedCount > 0 ? `${t.returnedCount} (${formatInr(t.returnedPaise)})` : "0") },
];

/** Sales across the online store and the POS till: headline cards, a channel comparison and the split by payment. */
export default function SalesSummaryCards({ summary }: { summary: SalesSummary }) {
  const { total, online, pos, fulfilment, byPayment, refunds } = summary;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total sales" value={formatInr(total.revenuePaise)} note={`${plural(total.ordersCount, "order")} across both channels`}>
          <ChannelSplit summary={summary} />
        </StatCard>
        <StatCard
          label="Online store"
          accent={CHANNEL_DOT.online}
          value={formatInr(online.revenuePaise)}
          note={`${plural(online.ordersCount, "order")} · avg ${formatInr(online.averagePaise)}`}
        />
        <StatCard
          label="POS (in-store)"
          accent={CHANNEL_DOT.pos}
          value={formatInr(pos.revenuePaise)}
          note={`${plural(pos.ordersCount, "sale")} · avg ${formatInr(pos.averagePaise)}`}
        />
        <StatCard label="Average order value" value={formatInr(total.averagePaise)} note="Per completed order, both channels" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Items sold" value={String(total.itemsSold)} note={`${online.itemsSold} online · ${pos.itemsSold} in store`} />
        <StatCard label="Discounts given" value={formatInr(total.discountPaise)} note="Coupons online, discounts at the till" />
        <StatCard
          label="Online orders to fulfil"
          value={String(fulfilment.toFulfil)}
          note={`${fulfilment.shipped} shipped · ${fulfilment.delivered} delivered`}
        />
        <StatCard
          label="Cancelled & returned"
          value={String(total.cancelledCount + total.returnedCount)}
          note={`${total.cancelledCount} cancelled · ${total.returnedCount} returned${
            refunds.count > 0 ? ` · ${formatInr(refunds.totalPaise)} refunded` : ""
          }`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-3">
          <h2 className="text-sm font-semibold text-ink">Online vs POS</h2>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-muted">
                  <th className="py-1 font-medium">
                    <span className="sr-only">Figure</span>
                  </th>
                  <th className="py-1 text-right font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${CHANNEL_DOT.online}`} aria-hidden /> Online
                    </span>
                  </th>
                  <th className="py-1 text-right font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${CHANNEL_DOT.pos}`} aria-hidden /> POS
                    </span>
                  </th>
                  <th className="py-1 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td className="py-2 text-ink">{row.label}</td>
                    <td className="py-2 text-right tabular-nums text-ink-body">{row.value(online)}</td>
                    <td className="py-2 text-right tabular-nums text-ink-body">{row.value(pos)}</td>
                    <td className="py-2 text-right font-medium tabular-nums text-ink">{row.value(total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">By payment method</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-muted">
                <th className="py-1 font-medium">Payment</th>
                <th className="py-1 text-right font-medium">Orders</th>
                <th className="py-1 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PAYMENT_ROWS.map((row) => (
                <tr key={row.key}>
                  <td className="py-2 text-ink">{row.label}</td>
                  <td className="py-2 text-right tabular-nums text-ink-body">{byPayment[row.key].count}</td>
                  <td className="py-2 text-right font-medium tabular-nums text-ink">{formatInr(byPayment[row.key].totalPaise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
