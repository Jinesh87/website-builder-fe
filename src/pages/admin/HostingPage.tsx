import { useEffect, useState } from "react";
import { Button, SearchField, Spinner } from "@heroui/react";
import { AlarmClock, CircleCheck, CloudOff, Coins, CreditCard, Download, Hourglass, IndianRupee, ListChecks, Receipt, Server } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  adminHostingApi,
  type HostingPayer,
  type HostingPaymentMethod,
  type HostingStatus,
  type PaymentList,
  type SubscriptionList,
} from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatConnects, formatPaise } from "../../api/wallet.ts";
import StatCard from "../../components/admin/StatCard.tsx";
import PageHeader from "../../components/app/PageHeader.tsx";
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
} from "../../components/hosting/hosting-labels.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../../components/ui/SelectInput.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { datedFilename, downloadBlob } from "../../utils/download.ts";

const PAGE_SIZE = 25;
/** Matches the server's "Due soon" summary window. */
const DUE_SOON_DAYS = 7;

type Tab = "plans" | "payments";
/** "due" = ending within the due-soon window. */
type PlanFilter = "" | HostingStatus | "due";

const PLAN_FILTER_OPTIONS: SelectOption<PlanFilter>[] = [
  { value: "", label: "All plans" },
  { value: "due", label: "Due soon" },
  { value: "ACTIVE", label: "Active" },
  { value: "GRACE", label: "In grace" },
  { value: "SUSPENDED", label: "Offline · unpaid" },
  { value: "AWAITING_PAYMENT", label: "Awaiting payment" },
];

const METHOD_OPTIONS: SelectOption<"" | HostingPaymentMethod>[] = [
  { value: "", label: "All methods" },
  ...(Object.keys(METHOD_LABELS) as HostingPaymentMethod[]).map((value) => ({ value, label: METHOD_LABELS[value] })),
];

const PAYER_OPTIONS: SelectOption<"" | HostingPayer>[] = [
  { value: "", label: "Anyone" },
  ...(Object.keys(PAYER_LABELS) as HostingPayer[]).map((value) => ({ value, label: PAYER_LABELS[value] })),
];

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-ink-muted">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink shadow-ed-xs focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15"
      />
    </label>
  );
}

export default function HostingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "payments" ? "payments" : "plans";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [planFilter, setPlanFilter] = useState<PlanFilter>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [method, setMethod] = useState<"" | HostingPaymentMethod>("");
  const [paidBy, setPaidBy] = useState<"" | HostingPayer>("");
  const [page, setPage] = useState(1);

  const [plans, setPlans] = useState<SubscriptionList | null>(null);
  const [payments, setPayments] = useState<PaymentList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const paymentFilters = { search: debouncedSearch || undefined, from, to, method, paidBy };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const load =
      tab === "plans"
        ? adminHostingApi
            .subscriptions({
              search: debouncedSearch || undefined,
              status: planFilter === "due" ? "" : planFilter,
              dueWithinDays: planFilter === "due" ? DUE_SOON_DAYS : "",
              page,
              pageSize: PAGE_SIZE,
            })
            .then((data) => !cancelled && setPlans(data))
        : adminHostingApi
            .payments({ search: debouncedSearch || undefined, from, to, method, paidBy, page, pageSize: PAGE_SIZE })
            .then((data) => !cancelled && setPayments(data));
    load
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab, debouncedSearch, planFilter, from, to, method, paidBy, page]);

  function resetPageAnd<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function switchTab(next: Tab) {
    setSearchParams(next === "plans" ? {} : { tab: next });
    setPage(1);
  }

  async function exportCsv() {
    setExporting(true);
    try {
      downloadBlob(await adminHostingApi.paymentsCsv(paymentFilters), datedFilename("hosting-payments", "csv"));
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  const data = tab === "plans" ? plans : payments;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 -mb-px cursor-pointer ${
      active ? "border-primary text-ink bg-surface shadow-xs font-semibold" : "border-transparent text-ink-muted hover:text-ink hover:bg-surface/50"
    }`;
  const filterTo = (filter: PlanFilter) => () => resetPageAnd(setPlanFilter)(planFilter === filter ? "" : filter);

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="Hosting"
        description="Every website's hosting plan, and the payments collected for it."
        actions={
          <Link to="/admin/settings?tab=hosting" className="text-sm text-brand hover:underline">
            Packages & rules
          </Link>
        }
      />

      <div className="mt-6 flex items-center gap-2 border-b border-line pb-px">
        <button type="button" onClick={() => switchTab("plans")} className={tabClass(tab === "plans")}>
          <ListChecks className="size-4" aria-hidden />
          Plans
        </button>
        <button type="button" onClick={() => switchTab("payments")} className={tabClass(tab === "payments")}>
          <Receipt className="size-4" aria-hidden />
          Payments report
        </button>
      </div>

      {tab === "plans" && plans && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Active"
            value={String(plans.summary.active)}
            hint="Paid and live"
            icon={<CircleCheck className="size-4" aria-hidden />}
            tone="bg-emerald-50 text-emerald-600"
            onPress={filterTo("ACTIVE")}
            active={planFilter === "ACTIVE"}
          />
          <StatCard
            label="Due soon"
            value={String(plans.summary.dueSoon)}
            hint={`Ending within ${plans.summary.dueSoonDays} days`}
            icon={<AlarmClock className="size-4" aria-hidden />}
            tone="bg-amber-50 text-amber-600"
            onPress={filterTo("due")}
            active={planFilter === "due"}
          />
          <StatCard
            label="In grace"
            value={String(plans.summary.grace)}
            hint="Expired, still live"
            icon={<Hourglass className="size-4" aria-hidden />}
            tone="bg-orange-50 text-orange-600"
            onPress={filterTo("GRACE")}
            active={planFilter === "GRACE"}
          />
          <StatCard
            label="Offline · unpaid"
            value={String(plans.summary.suspended)}
            hint="Taken offline after grace"
            icon={<CloudOff className="size-4" aria-hidden />}
            tone="bg-rose-50 text-rose-600"
            onPress={filterTo("SUSPENDED")}
            active={planFilter === "SUSPENDED"}
          />
          <StatCard
            label="Awaiting payment"
            value={String(plans.summary.awaitingPayment)}
            hint="Plan set, not paid yet"
            icon={<Server className="size-4" aria-hidden />}
            tone="bg-indigo-50 text-indigo-600"
            onPress={filterTo("AWAITING_PAYMENT")}
            active={planFilter === "AWAITING_PAYMENT"}
          />
        </div>
      )}

      {tab === "payments" && payments && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Hosting revenue"
            value={formatPaise(payments.summary.amountPaise)}
            hint={`${payments.summary.payments} ${payments.summary.payments === 1 ? "period" : "periods"} paid with these filters`}
            icon={<Receipt className="size-4" aria-hidden />}
            tone="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Paid online"
            value={formatPaise(payments.summary.onlinePaise)}
            hint="Through Razorpay"
            icon={<CreditCard className="size-4" aria-hidden />}
            tone="bg-brand-soft text-brand"
          />
          <StatCard
            label="Collected offline"
            value={formatPaise(payments.summary.collectedPaise)}
            hint="Cash, UPI and bank transfers recorded by admins"
            icon={<IndianRupee className="size-4" aria-hidden />}
            tone="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Paid with connects"
            value={formatPaise(payments.summary.connectsPaise)}
            hint={formatConnects(payments.summary.connects)}
            icon={<Coins className="size-4" aria-hidden />}
            tone="bg-amber-50 text-amber-600"
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <SearchField aria-label="Search" value={search} onChange={resetPageAnd(setSearch)} className="w-full max-w-xs">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={tab === "plans" ? "Search website or client" : "Search website, client or reference"} />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        {tab === "plans" ? (
          <SelectInput ariaLabel="Plan status" value={planFilter} onChange={resetPageAnd(setPlanFilter)} options={PLAN_FILTER_OPTIONS} />
        ) : (
          <>
            <DateInput label="From" value={from} onChange={resetPageAnd(setFrom)} />
            <DateInput label="To" value={to} onChange={resetPageAnd(setTo)} />
            <SelectInput ariaLabel="Method" value={method} onChange={resetPageAnd(setMethod)} options={METHOD_OPTIONS} />
            <SelectInput ariaLabel="Paid by" value={paidBy} onChange={resetPageAnd(setPaidBy)} options={PAYER_OPTIONS} />
            <Button variant="outline" onPress={exportCsv} isPending={exporting} className="ml-auto">
              <Download className="size-4" aria-hidden /> Export CSV
            </Button>
          </>
        )}
        {loading && data && <Spinner size="sm" aria-label="Updating" />}
      </div>

      {loadError && (
        <div className="mt-4">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
        {!data ? (
          <div className="grid place-items-center py-16">{loading && <Spinner aria-label="Loading" />}</div>
        ) : data.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas text-ink-muted">
              <Server className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">{tab === "plans" ? "No hosting plans" : "No hosting payments"}</h2>
            <p className="mt-1 text-sm text-ink-body">Nothing matches these filters yet.</p>
          </div>
        ) : tab === "plans" && plans ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Website</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Period</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {plans.items.map(({ subscription, website, client, price }) => {
                  const remaining = remainingLabel(subscription);
                  return (
                    <tr key={subscription.id} className="hover:bg-canvas/40">
                      <td className="px-5 py-3">
                        <Link to={`/websites/${website.id}?tab=hosting`} className="font-medium text-ink hover:text-brand">
                          {website.name}
                        </Link>
                        <p className="font-mono text-xs text-ink-muted">{website.subdomain}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Link to={`/admin/clients/${client.id}`} className="text-ink-body hover:text-brand">
                          {client.businessName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-ink-body">
                        {planLabel(subscription)}
                        {subscription.autoRenew && <span className="block text-xs text-ink-muted">Auto-renew on</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-ink-body">
                        {subscription.currentPeriodStart && subscription.currentPeriodEnd
                          ? formatPeriod(subscription.currentPeriodStart, subscription.currentPeriodEnd)
                          : "—"}
                        {remaining && <span className="block text-xs text-ink-muted">{remaining}</span>}
                      </td>
                      <td className="px-5 py-3">
                        <HostingStatusChip subscription={subscription} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        <p className="font-semibold text-ink">{formatPlanPrice(price)}</p>
                        {subscription.isCustomPackage && <p className="text-xs text-brand">Custom price</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          payments && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Website</th>
                    <th className="px-5 py-3 font-medium">Period</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Paid by</th>
                    <th className="px-5 py-3 font-medium">Paid on</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {payments.items.map((payment) => {
                    const { amount, detail } = paymentAmountLabel(payment);
                    return (
                      <tr key={payment.id} className="hover:bg-canvas/40">
                        <td className="px-5 py-3">
                          {payment.websiteId ? (
                            <Link to={`/websites/${payment.websiteId}?tab=hosting`} className="font-medium text-ink hover:text-brand">
                              {payment.websiteName}
                            </Link>
                          ) : (
                            <span className="font-medium text-ink">{payment.websiteName}</span>
                          )}
                          <Link to={`/admin/clients/${payment.client.id}`} className="block text-xs text-ink-muted hover:text-brand">
                            {payment.client.businessName}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-ink-body">
                          {formatPeriod(payment.periodStart, payment.periodEnd)}
                          <span className="block text-xs text-ink-muted">{planLabel(payment)}</span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right">
                          <p className="font-semibold text-ink">{amount}</p>
                          {detail && <p className="text-xs text-ink-muted">{detail}</p>}
                        </td>
                        <td className="px-5 py-3 text-ink-body">
                          {PAYER_LABELS[payment.paidBy]} · {METHOD_LABELS[payment.method]}
                          {(payment.reference || payment.recordedBy) && (
                            <span className="block text-xs text-ink-muted">
                              {[payment.reference && `Ref ${payment.reference}`, payment.recordedBy?.fullName].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-ink-body">{formatBillingDate(payment.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </section>

      {data && data.total > data.pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-body">
          <span>
            Page {data.page} of {totalPages} · {data.total} {tab === "plans" ? "plans" : "payments"}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" isDisabled={page <= 1 || loading} onPress={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" isDisabled={page >= totalPages || loading} onPress={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
