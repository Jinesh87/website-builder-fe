import { useEffect, useState } from "react";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { Button, Spinner } from "@heroui/react";
import { Search } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type ShopOrder, type ShopReturnFilter, type ShopReturnPage } from "../../api/shop.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { GuestBadge, RefundBadge } from "./ShopOrderBadges.tsx";
import ShopOrderDetail from "./ShopOrderDetail.tsx";
import { formatInr, formatWhen } from "./shop-format.ts";
import { awaitingRefund } from "./shop-order-format.ts";
import { notifyReturnsChanged } from "./use-awaiting-returns.ts";

const FILTERS: { value: ShopReturnFilter; label: string }[] = [
  { value: "all", label: "All returns" },
  { value: "awaiting", label: "Waiting for refund" },
  { value: "in-progress", label: "Refund in progress" },
  { value: "refunded", label: "Refunded" },
];

/** When the customer sent the order back: the first "returned" timeline entry (later ones record the refund). */
function returnedAt(order: ShopOrder): string {
  return order.timeline.find((event) => event.status === "returned")?.createdAt ?? order.updatedAt;
}

function RefundState({ order }: { order: ShopOrder }) {
  if (order.refundStatus === "none") {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
        Waiting for refund
      </span>
    );
  }
  return <RefundBadge status={order.refundStatus} />;
}

/** Returned orders, waiting-for-refund first; the store refunds each one by hand once the item is back. */
export default function ShopReturnsPanel({ websiteId }: { websiteId: string }) {
  const [filter, setFilter] = useState<ShopReturnFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ShopReturnPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const query = useDebouncedValue(search.trim(), 250);
  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    shopApi
      .returns(websiteId, { filter, search: query || undefined, page })
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, filter, query, page, reloadKey]);

  async function refund(order: ShopOrder) {
    setConfirmId(null);
    setRefundingId(order.id);
    setError(null);
    setNotice(null);
    try {
      const next = await shopApi.retryOrderRefund(websiteId, order.id);
      setNotice(
        next.refundStatus === "processed"
          ? `Order #${next.number} refunded (${formatInr(next.totalPaise)}).`
          : `Refund started for order #${next.number}. Razorpay will confirm it shortly.`,
      );
      setReloadKey((value) => value + 1);
      notifyReturnsChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRefundingId(null);
    }
  }

  if (selectedId) {
    return (
      <ShopOrderDetail
        websiteId={websiteId}
        orderId={selectedId}
        onBack={() => setSelectedId(null)}
        onUpdated={() => setReloadKey((value) => value + 1)}
      />
    );
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const counts = data?.counts;
  const summary: { filter: ShopReturnFilter; label: string; value: number; tone: string }[] = counts
    ? [
        { filter: "awaiting", label: "Waiting for refund", value: counts.awaiting, tone: counts.awaiting > 0 ? "border-amber-300 bg-amber-50 text-amber-900" : "border-line text-ink" },
        { filter: "in-progress", label: "Refund in progress", value: counts.inProgress, tone: "border-line text-ink" },
        { filter: "refunded", label: "Refunded", value: counts.refunded, tone: "border-line text-ink" },
      ]
    : [];

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Returns</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Returned orders are not refunded automatically. Check the item, then refund it here. Orders waiting for a refund are listed first.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as ShopReturnFilter)}
            aria-label="Filter returns"
            className="h-9 rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink"
          >
            {FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search returns"
              aria-label="Search returns"
              className="h-9 w-full rounded-lg border border-ed-border bg-surface pl-9 pr-3 text-sm text-ink"
            />
          </div>
        </div>
      </div>

      {summary.length > 0 && (
        <div className="grid gap-3 border-b border-line px-5 py-4 sm:grid-cols-3">
          {summary.map((item) => (
            <button
              key={item.filter}
              type="button"
              onClick={() => setFilter((current) => (current === item.filter ? "all" : item.filter))}
              className={`rounded-lg border px-4 py-3 text-left transition-colors hover:bg-ed-bg/70 ${item.tone} ${filter === item.filter ? "ring-2 ring-brand/40" : ""}`}
              aria-pressed={filter === item.filter}
            >
              <span className="block text-2xl font-semibold tabular-nums">{item.value}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="px-5 pt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {notice && (
        <div className="px-5 pt-4">
          <FormAlert status="success">{notice}</FormAlert>
        </div>
      )}
      {data === null && !error && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading returns" />
        </div>
      )}
      {data?.orders.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">
          {query || filter !== "all" ? "No returns match this filter." : "No returns yet. Orders appear here when a customer returns them."}
        </p>
      )}
      {data && data.orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-medium text-ink-muted">
                <th className="px-5 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">Returned</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Refund</th>
                <th className="px-5 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.orders.map((order) => {
                const awaiting = order.refundStatus === "none" || order.refundStatus === "failed";
                const canRefund = awaitingRefund(order);
                return (
                  <tr
                    key={order.id}
                    tabIndex={0}
                    className={`cursor-pointer transition-colors hover:bg-ed-bg/70 focus-visible:bg-ed-bg/70 focus-visible:outline-none ${awaiting ? "bg-amber-50/40" : ""}`}
                    onClick={() => setSelectedId(order.id)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(order.id);
                      }
                    }}
                  >
                    <td className="px-5 py-3 font-medium text-ink">#{order.number}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-ink">{order.customer.fullName}</p>
                        {order.customer.isGuest && <GuestBadge />}
                      </div>
                      <p className="truncate text-xs text-ink-muted">{order.customer.email}</p>
                    </td>
                    <td className="max-w-[16rem] px-3 py-3 text-xs text-ink-body">
                      <p className="line-clamp-2">{order.returnReason || "—"}</p>
                    </td>
                    <td className="px-3 py-3 text-ink-muted">{formatWhen(returnedAt(order))}</td>
                    <td className="px-3 py-3 tabular-nums text-ink">{formatInr(order.totalPaise)}</td>
                    <td className="px-3 py-3">
                      <RefundState order={order} />
                    </td>
                    <td className="px-5 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                      {canRefund ? (
                        confirmId === order.id ? (
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            <span className="text-xs text-ink">Refund {formatInr(order.totalPaise)}?</span>
                            <Button size="sm" onPress={() => void refund(order)} isDisabled={refundingId !== null}>
                              Yes
                            </Button>
                            <Button size="sm" variant="outline" onPress={() => setConfirmId(null)}>
                              No
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onPress={() => setConfirmId(order.id)} isDisabled={refundingId !== null}>
                            {refundingId === order.id ? "Refunding…" : order.refundStatus === "failed" ? "Retry refund" : "Refund"}
                          </Button>
                        )
                      ) : awaiting ? (
                        <span className="text-xs text-ink-muted">No online payment</span>
                      ) : (
                        <span className="text-xs text-ink-muted">{order.refundedAt ? formatWhen(order.refundedAt) : "—"}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <p className="text-xs text-ink-muted">
            Page {data.page} of {pages} · {data.total} returns
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onPress={() => setPage((current) => Math.max(1, current - 1))} isDisabled={page <= 1}>
              Previous
            </Button>
            <Button size="sm" variant="outline" onPress={() => setPage((current) => current + 1)} isDisabled={page >= pages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
