import { useEffect, useState, type ReactNode } from "react";
import { Button, SearchField, Spinner } from "@heroui/react";
import { ArrowDownLeft, ArrowUpRight, CircleAlert, CreditCard, Landmark, Receipt, Scale, Wallet } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import AiSparklesIcon from "../../components/icons/AiSparklesIcon.tsx";
import { errorMessage } from "../../api/http.ts";
import {
  adminWalletApi,
  formatPaise,
  type AdminPaymentsResponse,
  type AdminTransactionsResponse,
  type PaymentStatus,
  type WalletTransaction,
} from "../../api/wallet.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../../components/ui/SelectInput.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";

const PAGE_SIZE = 25;
const currentYear = new Date().getFullYear();

type Tab = "transactions" | "payments";

const MONTH_OPTIONS: SelectOption<string>[] = [
  { value: "", label: "All months" },
  ...Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: new Date(2000, index, 1).toLocaleString("en-IN", { month: "long" }),
  })),
];

const YEAR_OPTIONS: SelectOption<string>[] = [
  { value: "", label: "All time" },
  ...[currentYear, currentYear - 1, currentYear - 2].map((year) => ({ value: String(year), label: String(year) })),
];

const SOURCE_OPTIONS: SelectOption<"" | WalletTransaction["source"]>[] = [
  { value: "", label: "All sources" },
  { value: "TOPUP", label: "Top-ups" },
  { value: "AI_USAGE", label: "AI usage" },
  { value: "ADJUSTMENT", label: "Adjustments" },
];

const TYPE_OPTIONS: SelectOption<"" | WalletTransaction["type"]>[] = [
  { value: "", label: "Credits and debits" },
  { value: "CREDIT", label: "Credits only" },
  { value: "DEBIT", label: "Debits only" },
];

const STATUS_OPTIONS: SelectOption<"" | PaymentStatus>[] = [
  { value: "", label: "All statuses" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "CREATED", label: "Not completed" },
];

const SOURCE_LABELS: Record<WalletTransaction["source"], string> = {
  TOPUP: "Top-up",
  AI_USAGE: "AI usage",
  ADJUSTMENT: "Adjustment",
};

const STATUS_STYLES: Record<PaymentStatus, { label: string; className: string }> = {
  PAID: { label: "Paid", className: "bg-emerald-500/10 text-emerald-700" },
  FAILED: { label: "Failed", className: "bg-rose-500/10 text-rose-700" },
  CREATED: { label: "Not completed", className: "bg-amber-500/10 text-amber-700" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function StatCard({ label, value, hint, icon, tone }: { label: string; value: string; hint: string; icon: ReactNode; tone: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted">{label}</span>
        <span className={`grid size-8 place-items-center rounded-lg ${tone}`}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </div>
  );
}

function ClientCell({ client, user }: { client: { id: string; businessName: string }; user: { fullName: string; email: string } | null }) {
  return (
    <td className="px-5 py-3">
      <Link to={`/admin/clients/${client.id}`} className="font-medium text-ink hover:text-brand">
        {client.businessName}
      </Link>
      <p className="text-xs text-ink-muted">{user ? `${user.fullName} · ${user.email}` : "System"}</p>
    </td>
  );
}

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "payments" ? "payments" : "transactions";

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [source, setSource] = useState<"" | WalletTransaction["source"]>("");
  const [type, setType] = useState<"" | WalletTransaction["type"]>("");
  const [status, setStatus] = useState<"" | PaymentStatus>("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [transactions, setTransactions] = useState<AdminTransactionsResponse | null>(null);
  const [payments, setPayments] = useState<AdminPaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const common = {
      search: debouncedSearch || undefined,
      month: year && month ? Number(month) : ("" as const),
      year: year ? Number(year) : ("" as const),
      page,
      pageSize: PAGE_SIZE,
    };
    const request =
      tab === "transactions"
        ? adminWalletApi.transactions({ ...common, source, type }).then((data) => !cancelled && setTransactions(data))
        : adminWalletApi.payments({ ...common, status }).then((data) => !cancelled && setPayments(data));
    request
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab, debouncedSearch, month, year, source, type, status, page]);

  function resetPageAnd<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function switchTab(next: Tab) {
    setSearchParams(next === "transactions" ? {} : { tab: next });
    setPage(1);
  }

  const data = tab === "transactions" ? transactions : payments;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 -mb-px cursor-pointer ${
      active ? "border-primary text-ink bg-surface shadow-xs font-semibold" : "border-transparent text-ink-muted hover:text-ink hover:bg-surface/50"
    }`;

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader title="Transactions" description="Wallet top-ups, AI usage charges and Razorpay payments across all clients." />

      <div className="mt-6 flex items-center gap-2 border-b border-line pb-px">
        <button type="button" onClick={() => switchTab("transactions")} className={tabClass(tab === "transactions")}>
          <Wallet className="size-4" aria-hidden />
          Wallet transactions
        </button>
        <button type="button" onClick={() => switchTab("payments")} className={tabClass(tab === "payments")}>
          <CreditCard className="size-4" aria-hidden />
          Razorpay payments
        </button>
      </div>

      {tab === "transactions" && transactions && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Top-ups"
            value={formatPaise(transactions.summary.topupsPaise)}
            hint={`${transactions.summary.topupCount} ${transactions.summary.topupCount === 1 ? "top-up" : "top-ups"} in this period`}
            icon={<ArrowDownLeft className="size-4" aria-hidden />}
            tone="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="AI usage charged"
            value={formatPaise(transactions.summary.aiUsagePaise)}
            hint="Deducted from wallets in this period"
            icon={<AiSparklesIcon className="size-4" variant="glossy" />}
            tone="bg-brand-soft text-brand"
          />
          <StatCard
            label="Adjustments"
            value={formatPaise(transactions.summary.adjustmentsPaise)}
            hint="Net manual credits minus debits"
            icon={<Scale className="size-4" aria-hidden />}
            tone="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Balance held"
            value={formatPaise(transactions.summary.heldBalancePaise)}
            hint={`Across ${transactions.summary.fundedWallets} funded ${transactions.summary.fundedWallets === 1 ? "wallet" : "wallets"}, right now`}
            icon={<Landmark className="size-4" aria-hidden />}
            tone="bg-indigo-50 text-indigo-600"
          />
        </div>
      )}

      {tab === "payments" && payments && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Collected"
            value={formatPaise(payments.summary.paidPaise)}
            hint={`${payments.summary.paidCount} successful ${payments.summary.paidCount === 1 ? "payment" : "payments"}`}
            icon={<CreditCard className="size-4" aria-hidden />}
            tone="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Failed"
            value={String(payments.summary.failedCount)}
            hint="Declined or errored at Razorpay"
            icon={<CircleAlert className="size-4" aria-hidden />}
            tone="bg-rose-50 text-rose-600"
          />
          <StatCard
            label="Not completed"
            value={String(payments.summary.pendingCount)}
            hint="Checkout opened but not paid"
            icon={<Receipt className="size-4" aria-hidden />}
            tone="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Success rate"
            value={(() => {
              const attempts = payments.summary.paidCount + payments.summary.failedCount + payments.summary.pendingCount;
              return attempts ? `${Math.round((payments.summary.paidCount / attempts) * 100)}%` : "—";
            })()}
            hint="Paid out of all checkouts"
            icon={<ArrowUpRight className="size-4" aria-hidden />}
            tone="bg-indigo-50 text-indigo-600"
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchField aria-label="Search clients" value={search} onChange={resetPageAnd(setSearch)} className="w-full max-w-xs">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search client, name or email" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <SelectInput ariaLabel="Year" value={year} onChange={resetPageAnd(setYear)} options={YEAR_OPTIONS} />
        {year && <SelectInput ariaLabel="Month" value={month} onChange={resetPageAnd(setMonth)} options={MONTH_OPTIONS} />}
        {tab === "transactions" ? (
          <>
            <SelectInput ariaLabel="Source" value={source} onChange={resetPageAnd(setSource)} options={SOURCE_OPTIONS} />
            <SelectInput ariaLabel="Direction" value={type} onChange={resetPageAnd(setType)} options={TYPE_OPTIONS} />
          </>
        ) : (
          <SelectInput ariaLabel="Status" value={status} onChange={resetPageAnd(setStatus)} options={STATUS_OPTIONS} />
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
              <Receipt className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">
              {tab === "transactions" ? "No wallet transactions" : "No Razorpay payments"}
            </h2>
            <p className="mt-1 text-sm text-ink-body">Nothing matches these filters yet.</p>
          </div>
        ) : tab === "transactions" && transactions ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 text-right font-medium">Balance after</th>
                  <th className="px-5 py-3 font-medium">Razorpay payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transactions.items.map((item) => {
                  const credit = item.type === "CREDIT";
                  return (
                    <tr key={item.id} className="hover:bg-canvas/40">
                      <ClientCell client={item.client} user={item.user} />
                      <td className="px-5 py-3 text-ink">{item.description}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-canvas px-2 py-0.5 text-xs font-medium text-ink-body">{SOURCE_LABELS[item.source]}</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-ink-body">{formatDate(item.createdAt)}</td>
                      <td className={`whitespace-nowrap px-5 py-3 text-right font-semibold ${credit ? "text-emerald-600" : "text-rose-600"}`}>
                        {credit ? "+" : "−"}
                        {formatPaise(item.amountPaise)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-ink-body">{formatPaise(item.balanceAfterPaise)}</td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-muted">{item.razorpayPaymentId ?? "—"}</td>
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
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Started</th>
                    <th className="px-5 py-3 font-medium">Paid</th>
                    <th className="px-5 py-3 font-medium">Razorpay order / payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {payments.items.map((item) => (
                    <tr key={item.id} className="hover:bg-canvas/40">
                      <ClientCell client={item.client} user={item.user} />
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status].className}`}>
                          {STATUS_STYLES[item.status].label}
                        </span>
                        {item.failureReason && <p className="mt-1 max-w-64 text-xs text-ink-muted">{item.failureReason}</p>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-ink">
                        {formatPaise(item.amountPaise, item.currency)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-ink-body">{formatDate(item.createdAt)}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-ink-body">{item.paidAt ? formatDate(item.paidAt) : "—"}</td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-muted">
                        <p>{item.razorpayOrderId}</p>
                        {item.razorpayPaymentId && <p>{item.razorpayPaymentId}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </section>

      {data && data.total > data.pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-body">
          <span>
            Page {data.page} of {totalPages} · {data.total} {tab === "transactions" ? "transactions" : "payments"}
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
