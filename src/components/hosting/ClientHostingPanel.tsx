import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Spinner } from "@heroui/react";
import { ArrowUpRight, Server } from "lucide-react";
import { Link } from "react-router-dom";
import { adminHostingApi, type ClientHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatConnects, formatPaise } from "../../api/wallet.ts";
import {
  isValidStorageMb,
  storageFromMb,
  storageRangeError,
  storageToMb,
  type StorageUnit,
} from "../../utils/media-storage.ts";
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
  const [overrideDays, setOverrideDays] = useState("");
  const [storageAmount, setStorageAmount] = useState("");
  const [storageUnit, setStorageUnit] = useState<StorageUnit>("GB");
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [savingStorage, setSavingStorage] = useState(false);
  const [policyFeedback, setPolicyFeedback] = useState<string | null>(null);
  const [storageFeedback, setStorageFeedback] = useState<string | null>(null);

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

  useEffect(() => {
    if (!data) return;
    setOverrideDays(data.client.websiteBackupDaysOverride ? String(data.client.websiteBackupDaysOverride) : "");
    if (data.client.mediaStorageMbOverride) {
      const storage = storageFromMb(data.client.mediaStorageMbOverride);
      setStorageAmount(storage.amount);
      setStorageUnit(storage.unit);
    } else {
      setStorageAmount("");
      setStorageUnit("GB");
    }
  }, [data]);

  async function saveBackupPolicy() {
    if (!data) return;
    const value = overrideDays.trim() ? Number(overrideDays) : null;
    if (value !== null && (!Number.isInteger(value) || value < 1 || value > 365)) {
      setPolicyFeedback("Enter 1 to 365 days, or leave empty to use package defaults.");
      return;
    }
    setSavingPolicy(true);
    setPolicyFeedback(null);
    try {
      const updated = await adminHostingApi.updateClientBackupPolicy(clientId, value);
      setData(updated);
      setPolicyFeedback("Backup policy saved.");
    } catch (err) {
      setPolicyFeedback(errorMessage(err));
    } finally {
      setSavingPolicy(false);
    }
  }

  function changeStorageUnit(unit: StorageUnit) {
    if (unit === storageUnit) return;
    const currentMb = storageToMb(storageAmount, storageUnit);
    if (currentMb === null) {
      setStorageUnit(unit);
      return;
    }
    if (unit === "GB") {
      setStorageAmount(String(Math.max(1, Math.round(currentMb / 1024))));
    } else {
      setStorageAmount(String(currentMb));
    }
    setStorageUnit(unit);
    setStorageFeedback(null);
  }

  async function saveStoragePolicy() {
    if (!data) return;
    const trimmed = storageAmount.trim();
    const value = trimmed ? storageToMb(trimmed, storageUnit) : null;
    if (trimmed && !isValidStorageMb(value)) {
      setStorageFeedback(storageRangeError(storageUnit));
      return;
    }
    setSavingStorage(true);
    setStorageFeedback(null);
    try {
      const updated = await adminHostingApi.updateClientStoragePolicy(clientId, value);
      setData(updated);
      setStorageFeedback("Media storage override saved.");
    } catch (err) {
      setStorageFeedback(errorMessage(err));
    } finally {
      setSavingStorage(false);
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

      <div className="space-y-4 border-b border-line px-6 py-4">
        <div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-ink">
              <span className="mb-1 block text-xs text-ink-muted">Company backup override (days)</span>
              <input
                value={overrideDays}
                onChange={(event) => {
                  setOverrideDays(event.target.value.replace(/\D/g, "").slice(0, 3));
                  setPolicyFeedback(null);
                }}
                className="h-9 w-40 rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink shadow-ed-xs focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15"
                placeholder="Use package defaults"
              />
            </label>
            <Button size="sm" variant="outline" onPress={() => void saveBackupPolicy()} isPending={savingPolicy}>
              Save backup policy
            </Button>
            <p className="text-xs text-ink-muted">Empty = use each website package's backup interval.</p>
          </div>
          {policyFeedback && (
            <p className={`mt-2 text-xs ${policyFeedback === "Backup policy saved." ? "text-emerald-700" : "text-rose-700"}`}>
              {policyFeedback}
            </p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <span className="mb-1 block text-xs text-ink-muted">Company media storage override</span>
              <div className="flex items-center gap-2">
                <input
                  value={storageAmount}
                  onChange={(event) => {
                    setStorageAmount(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setStorageFeedback(null);
                  }}
                  className="h-9 w-28 rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink shadow-ed-xs focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15"
                  placeholder={storageUnit === "GB" ? "e.g. 5" : "e.g. 5120"}
                />
                <div className="flex overflow-hidden rounded-lg border border-ed-border" role="group" aria-label="Storage unit">
                  {(["MB", "GB"] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      aria-pressed={storageUnit === unit}
                      onClick={() => changeStorageUnit(unit)}
                      className={`px-3 py-2 text-xs font-semibold transition-colors ${
                        storageUnit === unit
                          ? "bg-brand text-white"
                          : "bg-surface text-ink-muted hover:bg-canvas hover:text-ink"
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline" onPress={() => void saveStoragePolicy()} isPending={savingStorage}>
              Save storage override
            </Button>
            <p className="text-xs text-ink-muted">Empty = use highest active plan quota for this company.</p>
          </div>
          {storageFeedback && (
            <p
              className={`mt-2 text-xs ${
                storageFeedback === "Media storage override saved." ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {storageFeedback}
            </p>
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
