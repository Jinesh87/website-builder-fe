import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { ArrowUpRight, Server } from "lucide-react";
import { Link } from "react-router-dom";
import { adminHostingApi, type ClientHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatConnects, formatPaise } from "../../api/wallet.ts";
import FormAlert from "../ui/FormAlert.tsx";
import {
  formatBillingDate,
  formatPeriod,
  formatPlanPrice,
  HostingStatusChip,
  METHOD_LABELS,
  PAYER_LABELS,
  paymentAmountLabel,
  planLabel,
  remainingLabel,
} from "./hosting-labels.tsx";

/** Super Admin view of one client's hosting: every website's plan, dates and price, and payments. */
export default function ClientHostingPanel({ clientId }: { clientId: string }) {
  const [data, setData] = useState<ClientHosting | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminHostingApi
      .client(clientId)
      .then((loaded) => !cancelled && setData(loaded))
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (loadError) return <FormAlert status="danger">{loadError}</FormAlert>;
  if (!data) {
    return (
      <div className="grid place-items-center rounded-xl border border-line bg-surface py-12">
        <Spinner aria-label="Loading hosting" />
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Server className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Hosting · {data.websites.length} {data.websites.length === 1 ? "website" : "websites"}</h2>
            <p className="text-xs text-ink-muted">
              {data.totals.payments} {data.totals.payments === 1 ? "payment" : "payments"}, {formatPaise(data.totals.amountPaise)}
              {data.totals.collectedPaise > 0 && ` (${formatPaise(data.totals.collectedPaise)} collected offline)`} ·{" "}
              {formatConnects(data.balance)} in wallet
            </p>
          </div>
        </div>
        <p className="text-xs text-ink-muted">Custom prices are set per website, on its Hosting tab.</p>
      </div>

      {data.websites.length === 0 ? (
        <p className="px-6 py-8 text-sm text-ink-muted">This client has no websites yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
              <tr>
                <th className="px-6 py-2.5 font-medium">Website</th>
                <th className="px-6 py-2.5 font-medium">Plan</th>
                <th className="px-6 py-2.5 font-medium">Period</th>
                <th className="px-6 py-2.5 font-medium">Status</th>
                <th className="px-6 py-2.5 text-right font-medium">Price</th>
                <th className="px-6 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.websites.map((website) => {
                const subscription = website.subscription;
                const remaining = subscription && remainingLabel(subscription);
                return (
                  <tr key={website.id} className="hover:bg-canvas/40">
                    <td className="px-6 py-3">
                      <p className="font-medium text-ink">{website.name}</p>
                      <p className="font-mono text-xs text-ink-muted">{website.subdomain}</p>
                    </td>
                    <td className="px-6 py-3 text-ink-body">{subscription ? planLabel(subscription) : "—"}</td>
                    <td className="whitespace-nowrap px-6 py-3 text-ink-body">
                      {subscription?.currentPeriodStart && subscription.currentPeriodEnd
                        ? formatPeriod(subscription.currentPeriodStart, subscription.currentPeriodEnd)
                        : "—"}
                      {remaining && <span className="block text-xs text-ink-muted">{remaining}</span>}
                    </td>
                    <td className="px-6 py-3">
                      <HostingStatusChip subscription={subscription} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-right">
                      <p className="font-semibold text-ink">{subscription ? formatPlanPrice(website.price) : "—"}</p>
                      {subscription?.isCustomPackage && <p className="text-xs text-brand">Custom price</p>}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/websites/${website.id}?tab=hosting`}
                        className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                      >
                        Manage <ArrowUpRight className="size-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data.payments.length > 0 && (
        <div className="border-t border-line">
          <h3 className="px-6 pt-5 text-sm font-semibold text-ink">Payment history</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th className="px-6 py-2.5 font-medium">Website</th>
                  <th className="px-6 py-2.5 font-medium">Period</th>
                  <th className="px-6 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-6 py-2.5 font-medium">Paid by</th>
                  <th className="px-6 py-2.5 font-medium">Paid on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.payments.map((payment) => {
                  const { amount, detail } = paymentAmountLabel(payment);
                  return (
                    <tr key={payment.id}>
                      <td className="px-6 py-2.5 text-ink">{payment.websiteName}</td>
                      <td className="whitespace-nowrap px-6 py-2.5 text-ink-body">
                        {formatPeriod(payment.periodStart, payment.periodEnd)}
                        <span className="block text-xs text-ink-muted">{planLabel(payment)}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-2.5 text-right">
                        <p className="font-semibold text-ink">{amount}</p>
                        {detail && <p className="text-xs text-ink-muted">{detail}</p>}
                      </td>
                      <td className="px-6 py-2.5 text-ink-body">
                        {PAYER_LABELS[payment.paidBy]} · {METHOD_LABELS[payment.method]}
                        {payment.reference && <span className="block text-xs text-ink-muted">Ref {payment.reference}</span>}
                      </td>
                      <td className="whitespace-nowrap px-6 py-2.5 text-xs text-ink-muted">{formatBillingDate(payment.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
