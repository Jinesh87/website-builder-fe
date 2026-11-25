import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { errorMessage } from "../../../api/http.ts";
import { shopApi, type ShopOrder, type ShopOrderPage } from "../../../api/shop.ts";
import { POS_METHOD_LABEL } from "../../../api/shop-pos.ts";
import type { DayRange } from "../pos/pos-period.ts";
import FormAlert from "../../ui/FormAlert.tsx";
import { OnlineBadge, PosBadge, RefundBadge, StatusBadge } from "../ShopOrderBadges.tsx";
import { formatInr, formatWhen } from "../shop-format.ts";

type ChannelFilter = "" | ShopOrder["channel"];

const FILTERS: { value: ChannelFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "online", label: "Online" },
  { value: "pos", label: "POS" },
];

/** Every order in the period from both channels, filterable by channel; a row opens the order. */
export default function SalesOrdersList({
  websiteId,
  range,
  reloadKey,
  onOpen,
}: {
  websiteId: string;
  range: DayRange;
  reloadKey: number;
  onOpen: (orderId: string) => void;
}) {
  const [channel, setChannel] = useState<ChannelFilter>("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ShopOrderPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { from, to } = range;

  useEffect(() => {
    setPage(1);
  }, [websiteId, from, to, channel]);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    shopApi
      .orders(websiteId, { channel: channel || undefined, from, to, page })
      .then((loaded) => !cancelled && setData(loaded))
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [websiteId, from, to, channel, page, reloadKey]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-ink">Orders</h2>
          {data && <span className="text-xs text-ink-muted">{data.total} in this period</span>}
        </div>
        <div className="inline-flex rounded-lg border border-line p-0.5" role="group" aria-label="Filter by channel">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              aria-pressed={channel === filter.value}
              onClick={() => setChannel(filter.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                channel === filter.value ? "bg-ink text-surface" : "text-ink-muted hover:text-ink"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div className="px-5 pt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {!data && !error && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading orders" />
        </div>
      )}
      {data?.orders.length === 0 && <p className="px-5 py-12 text-center text-sm text-ink-muted">No orders in this period.</p>}
      {data && data.orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-ink-muted">
                <th className="px-5 py-2.5 font-medium">Order</th>
                <th className="px-3 py-2.5 font-medium">Channel</th>
                <th className="px-3 py-2.5 font-medium">Customer</th>
                <th className="px-3 py-2.5 font-medium">Payment</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 text-right font-medium">Total</th>
                <th className="px-5 py-2.5 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.orders.map((order) => (
                <tr
                  key={order.id}
                  tabIndex={0}
                  onClick={() => onOpen(order.id)}
                  onKeyDown={(event) => event.key === "Enter" && onOpen(order.id)}
                  className="cursor-pointer hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <td className="px-5 py-3 font-medium text-ink">#{order.number}</td>
                  <td className="px-3 py-3">{order.channel === "pos" ? <PosBadge /> : <OnlineBadge />}</td>
                  <td className="max-w-48 px-3 py-3">
                    <p className="truncate text-ink">{order.customer.fullName}</p>
                    <p className="truncate text-xs text-ink-muted">{order.customer.email ?? order.customer.phone ?? ""}</p>
                  </td>
                  <td className="px-3 py-3 text-ink-body">
                    {order.channel === "pos"
                      ? order.pos?.paymentMethod
                        ? POS_METHOD_LABEL[order.pos.paymentMethod]
                        : "—"
                      : order.paidAt
                        ? "Online checkout"
                        : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge status={order.status} />
                      <RefundBadge status={order.refundStatus} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="font-medium tabular-nums text-ink">{formatInr(order.totalPaise)}</div>
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
      {data && pages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
          <span className="text-ink-muted">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" isDisabled={page <= 1} onPress={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" isDisabled={page >= pages} onPress={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
