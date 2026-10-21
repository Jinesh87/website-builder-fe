import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ArrowUpRight, Server } from "lucide-react";
import { Link } from "react-router-dom";
import { adminHostingApi, type ClientHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatConnects, formatPaise } from "../../api/wallet.ts";
import FormAlert from "../ui/FormAlert.tsx";
import {
  ConnectsInput,
  CYCLE_LABELS,
  formatBillingDate,
  formatPeriod,
  HostingStatusChip,
  METHOD_LABELS,
  PAYER_LABELS,
  parseConnects,
  PRICE_SOURCE_LABELS,
  remainingLabel,
} from "./hosting-labels.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

/** Super Admin view of one client's hosting: their prices, every website's plan and dates, and payments. */
export default function ClientHostingPanel({ clientId }: { clientId: string }) {
  const [data, setData] = useState<ClientHosting | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quarterly, setQuarterly] = useState("");
  const [yearly, setYearly] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function apply(loaded: ClientHosting) {
    setData(loaded);
    setQuarterly(loaded.clientPrices.quarterlyPrice?.toString() ?? "");
    setYearly(loaded.clientPrices.yearlyPrice?.toString() ?? "");
  }

  useEffect(() => {
    let cancelled = false;
    adminHostingApi
      .client(clientId)
      .then((loaded) => !cancelled && apply(loaded))
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  async function savePrices(next: { quarterlyPrice: number | null; yearlyPrice: number | null }) {
    setSaving(true);
    setFeedback(null);
    try {
      apply(await adminHostingApi.updateClientPrices(clientId, next));
      setFeedback({ status: "success", message: "Client prices saved. They apply from each website's next payment." });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <FormAlert status="danger">{loadError}</FormAlert>;
  if (!data) {
    return (
      <div className="grid place-items-center rounded-xl border border-line bg-surface py-12">
        <Spinner aria-label="Loading hosting" />
      </div>
    );
  }

  const changed =
    parseConnects(quarterly) !== data.clientPrices.quarterlyPrice || parseConnects(yearly) !== data.clientPrices.yearlyPrice;
  const hasOwnPrices = data.clientPrices.quarterlyPrice !== null || data.clientPrices.yearlyPrice !== null;

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
              {formatConnects(data.balance)} in wallet · {data.totals.payments} {data.totals.payments === 1 ? "payment" : "payments"},{" "}
              {formatConnects(data.totals.connects)}
              {data.totals.collectedPaise > 0 && ` · ${formatPaise(data.totals.collectedPaise)} collected offline`}
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-line px-6 py-5">
        <h3 className="text-sm font-semibold text-ink">Client prices</h3>
        <p className="mt-0.5 text-xs text-ink-muted">For all of this client's websites. A website's own price still wins; empty = global price.</p>
        <div className="mt-4 grid max-w-xl gap-4 sm:grid-cols-2">
          <ConnectsInput
            id="client-quarterly-price"
            label="Quarterly"
            value={quarterly}
            onChange={setQuarterly}
            placeholder={`Global: ${data.globalPrices.quarterlyPrice}`}
            isDisabled={saving}
          />
          <ConnectsInput
            id="client-yearly-price"
            label="Yearly"
            value={yearly}
            onChange={setYearly}
            placeholder={`Global: ${data.globalPrices.yearlyPrice}`}
            isDisabled={saving}
          />
        </div>
        {feedback && (
          <div className="mt-4 max-w-xl">
            <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            isPending={saving}
            isDisabled={!changed}
            onPress={() => savePrices({ quarterlyPrice: parseConnects(quarterly), yearlyPrice: parseConnects(yearly) })}
          >
            Save client prices
          </Button>
          {hasOwnPrices && (
            <Button size="sm" variant="ghost" isDisabled={saving} onPress={() => savePrices({ quarterlyPrice: null, yearlyPrice: null })}>
              Reset to global
            </Button>
          )}
        </div>
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
                const price = website.prices[subscription?.cycle ?? "QUARTERLY"];
                const remaining = subscription && remainingLabel(subscription);
                return (
                  <tr key={website.id} className="hover:bg-canvas/40">
                    <td className="px-6 py-3">
                      <p className="font-medium text-ink">{website.name}</p>
                      <p className="font-mono text-xs text-ink-muted">{website.subdomain}</p>
                    </td>
                    <td className="px-6 py-3 text-ink-body">{subscription ? CYCLE_LABELS[subscription.cycle] : "—"}</td>
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
                      <p className="font-semibold text-ink">{price.amount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-ink-muted">{PRICE_SOURCE_LABELS[price.source]}</p>
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
                  <th className="px-6 py-2.5 text-right font-medium">Connects</th>
                  <th className="px-6 py-2.5 font-medium">Paid by</th>
                  <th className="px-6 py-2.5 font-medium">Paid on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-2.5 text-ink">{payment.websiteName}</td>
                    <td className="whitespace-nowrap px-6 py-2.5 text-ink-body">
                      {formatPeriod(payment.periodStart, payment.periodEnd)}
                      <span className="block text-xs text-ink-muted">{CYCLE_LABELS[payment.cycle]}</span>
                    </td>
                    <td className="px-6 py-2.5 text-right font-semibold text-ink">{payment.amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-2.5 text-ink-body">
                      {PAYER_LABELS[payment.paidBy]} · {METHOD_LABELS[payment.method]}
                      {payment.collectedPaise !== null && ` · ${formatPaise(payment.collectedPaise)}`}
                      {payment.reference && <span className="block text-xs text-ink-muted">Ref {payment.reference}</span>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-2.5 text-xs text-ink-muted">{formatBillingDate(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
