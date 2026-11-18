import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { Search } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type ShopPaymentLogCategory, type ShopPaymentLogPage } from "../../api/shop.ts";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import FormAlert from "../ui/FormAlert.tsx";
import PaymentLogOwnerTable from "./PaymentLogOwnerTable.tsx";
import PaymentLogTechnicalTable from "./PaymentLogTechnicalTable.tsx";
import ShopOrderDetail from "./ShopOrderDetail.tsx";

const CATEGORIES: { value: ShopPaymentLogCategory | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "payments", label: "Payments" },
  { value: "refunds", label: "Refunds" },
  { value: "problems", label: "Problems" },
];

/** Payments and refunds that went through Razorpay, in plain language; technical details on request. */
export default function ShopPaymentLogsPanel({ websiteId }: { websiteId: string }) {
  const [category, setCategory] = useState<ShopPaymentLogCategory | "">("");
  const [technical, setTechnical] = useState(false);
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search.trim(), 250);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ShopPaymentLogPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [category, technical, query]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    shopApi
      .paymentLogs(websiteId, {
        view: technical ? "technical" : "owner",
        category: category || undefined,
        search: query || undefined,
        page,
      })
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, category, technical, query, page, reloadKey]);

  if (selectedOrderId) {
    return (
      <ShopOrderDetail
        websiteId={websiteId}
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
        onUpdated={() => setReloadKey((value) => value + 1)}
      />
    );
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const Table = technical ? PaymentLogTechnicalTable : PaymentLogOwnerTable;

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Payment activity</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Payments and refunds that went through Razorpay. Anything that needs your attention is marked in red.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Show" className="inline-flex rounded-lg border border-ed-border p-0.5">
            {CATEGORIES.map((option) => (
              <button
                key={option.value || "all"}
                type="button"
                aria-pressed={category === option.value}
                onClick={() => setCategory(option.value)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  category === option.value ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order #"
              aria-label="Search by order number"
              className="h-9 w-full rounded-lg border border-ed-border bg-surface pl-9 pr-3 text-sm text-ink"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="px-5 pt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {data === null && !error && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading payment activity" />
        </div>
      )}
      {data?.logs.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">
          {category === "problems"
            ? "No problems. Payments and refunds are going through."
            : category || query
              ? "Nothing matches this filter."
              : "No payments yet. Activity appears here when customers pay."}
        </p>
      )}
      {data && data.logs.length > 0 && <Table logs={data.logs} onOpenOrder={setSelectedOrderId} />}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
          <input type="checkbox" checked={technical} onChange={(event) => setTechnical(event.target.checked)} />
          Show technical details (Razorpay ids and every webhook), for troubleshooting with support
        </label>
        {data && data.total > data.pageSize && (
          <div className="flex items-center gap-3">
            <p className="text-xs text-ink-muted">
              Page {data.page} of {pages}
            </p>
            <Button size="sm" variant="outline" onPress={() => setPage((current) => Math.max(1, current - 1))} isDisabled={page <= 1}>
              Previous
            </Button>
            <Button size="sm" variant="outline" onPress={() => setPage((current) => current + 1)} isDisabled={page >= pages}>
              Next
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
