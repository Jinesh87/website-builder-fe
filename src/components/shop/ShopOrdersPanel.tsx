import { useEffect, useState } from "react";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { Button, Spinner } from "@heroui/react";
import { Search } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type ShopOrderPage, type ShopOrderStatus } from "../../api/shop.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { GuestBadge, RefundBadge, StatusBadge } from "./ShopOrderBadges.tsx";
import ShopOrderDetail from "./ShopOrderDetail.tsx";
import { formatInr, formatWhen } from "./shop-format.ts";
import { STATUS_OPTIONS } from "./shop-order-format.ts";


export default function ShopOrdersPanel({ websiteId }: { websiteId: string }) {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search.trim(), 250);
  const [statusFilter, setStatusFilter] = useState<ShopOrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ShopOrderPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  useEffect(() => {
    let cancelled = false;
    shopApi
      .orders(websiteId, {
        search: query || undefined,
        status: statusFilter || undefined,
        page,
      })
      .then((next) => {
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, query, statusFilter, page, reloadKey]);

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

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Orders</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Customer purchases. Open a row to update fulfillment status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ShopOrderStatus | "")}
            aria-label="Filter by status"
            className="h-9 rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders"
              aria-label="Search orders"
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
          <Spinner aria-label="Loading orders" />
        </div>
      )}
      {data?.orders.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">
          {query || statusFilter ? "No orders match this filter." : "No orders yet. They appear here after a customer pays."}
        </p>
      )}
      {data && data.orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-medium text-ink-muted">
                <th className="px-5 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Coupon</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-5 py-2 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.orders.map((order) => (
                <tr
                  key={order.id}
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-ed-bg/70 focus-visible:bg-ed-bg/70 focus-visible:outline-none"
                  onClick={() => setSelectedId(order.id)}
                  onKeyDown={(event) => {
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
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={order.status} />
                      <RefundBadge status={order.refundStatus} />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {order.couponCode ? (
                      <span className="font-mono text-xs text-ink">{order.couponCode}</span>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-ink">
                    <div>{formatInr(order.totalPaise)}</div>
                    {order.discountPaise != null && order.discountPaise > 0 && (
                      <div className="text-xs text-emerald-700">−{formatInr(order.discountPaise)}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{formatWhen(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <p className="text-xs text-ink-muted">
            Page {data.page} of {pages} · {data.total} orders
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
