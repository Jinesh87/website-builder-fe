import { POS_METHOD_LABEL, type PosDailySummary, type PosPaymentMethod } from "../../../api/shop-pos.ts";
import { formatInr } from "../shop-format.ts";

const METHODS: PosPaymentMethod[] = ["cash", "upi", "card", "razorpay_qr"];

/** Today in India, YYYY-MM-DD (POS days follow IST, like the server). */
export function todayIst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-muted">{note}</p>
    </div>
  );
}

/** A day's POS totals: headline figures and the split by payment method. */
export default function PosSummaryCards({ summary }: { summary: PosDailySummary }) {
  const average = summary.salesCount > 0 ? Math.round(summary.totalPaise / summary.salesCount) : 0;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <Stat label="Sales" value={formatInr(summary.totalPaise)} note={`${summary.salesCount} completed`} />
        <Stat label="Average sale" value={formatInr(average)} note="Per completed sale" />
        <Stat label="Cash in drawer (POS)" value={formatInr(summary.cashPaise)} note="Before any cash refunds" />
        <Stat
          label="Discounts given"
          value={formatInr(summary.discountPaise)}
          note={`${summary.cancelledCount} cancelled · ${summary.returnedCount} returned${
            summary.returnedPaise > 0 ? ` (${formatInr(summary.returnedPaise)})` : ""
          }`}
        />
      </div>
      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold text-ink">By payment method</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-muted">
              <th className="py-1 font-medium">Payment</th>
              <th className="py-1 text-right font-medium">Sales</th>
              <th className="py-1 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {METHODS.map((method) => (
              <tr key={method}>
                <td className="py-2 text-ink">{POS_METHOD_LABEL[method]}</td>
                <td className="py-2 text-right text-ink-body">{summary.byMethod[method].count}</td>
                <td className="py-2 text-right font-medium text-ink">{formatInr(summary.byMethod[method].totalPaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
