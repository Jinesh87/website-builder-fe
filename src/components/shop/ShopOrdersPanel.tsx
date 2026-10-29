import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ArrowLeft, Search } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type ShopOrder, type ShopOrderPage, type ShopOrderStatus, type ShopRefundStatus } from "../../api/shop.ts";
import FormAlert from "../ui/FormAlert.tsx";

const STATUS_OPTIONS: { value: ShopOrderStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const UPDATE_STATUSES: ShopOrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "failed",
  "cancelled",
];

function useDebounced(value: string): string {
  const [debounced, setDebounced] = useState(value.trim());
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
}

function formatWhen(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: paise % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

function statusLabel(status: ShopOrderStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function refundLabel(status: ShopRefundStatus): string | null {
  switch (status) {
    case "pending":
      return "Refund pending";
    case "processed":
      return "Refunded";
    case "failed":
      return "Refund failed";
    default:
      return null;
  }
}

function statusClass(status: ShopOrderStatus): string {
  switch (status) {
    case "paid":
    case "delivered":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "processing":
    case "shipped":
      return "bg-sky-50 text-sky-800 ring-sky-200";
    case "pending":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "failed":
    case "cancelled":
      return "bg-rose-50 text-rose-800 ring-rose-200";
    default:
      return "bg-ed-bg text-ink-muted ring-ed-border";
  }
}

function refundClass(status: ShopRefundStatus): string {
  switch (status) {
    case "processed":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "failed":
      return "bg-rose-50 text-rose-800 ring-rose-200";
    default:
      return "bg-ed-bg text-ink-muted ring-ed-border";
  }
}

function StatusBadge({ status }: { status: ShopOrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

function RefundBadge({ status }: { status: ShopRefundStatus }) {
  const label = refundLabel(status);
  if (!label) return null;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${refundClass(status)}`}>
      {label}
    </span>
  );
}

const FULFILLMENT_STEPS: { key: ShopOrderStatus; label: string }[] = [
  { key: "paid", label: "Order received" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function fulfillmentIndex(status: ShopOrderStatus): number {
  return FULFILLMENT_STEPS.findIndex((step) => step.key === status);
}

function OrderTimeline({ order }: { order: ShopOrder }) {
  const current = fulfillmentIndex(order.status);
  const events = order.timeline ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FULFILLMENT_STEPS.map((step, index) => {
          const done = current >= 0 && index < current;
          const active = index === current;
          return (
            <div
              key={step.key}
              className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold ${
                done || active
                  ? "border-sky-200 bg-sky-50 text-sky-800"
                  : "border-line bg-surface text-ink-muted"
              }`}
            >
              {step.label}
            </div>
          );
        })}
      </div>
      <ol className="space-y-0 border-l border-line pl-4">
        {events.length === 0 ? (
          <li className="text-sm text-ink-muted">No status history yet.</li>
        ) : (
          events.map((event) => (
            <li key={event.id} className="relative pb-4 last:pb-0">
              <span
                className="absolute -left-[1.15rem] top-1.5 size-2.5 rounded-full bg-sky-500 ring-4 ring-surface"
                aria-hidden
              />
              <p className="text-sm font-medium text-ink">{statusLabel(event.status as ShopOrderStatus)}</p>
              <p className="text-xs text-ink-muted">{formatWhen(event.createdAt)}</p>
              {event.note && <p className="mt-0.5 text-xs text-ink-muted">{event.note}</p>}
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-muted/80">{event.actorType}</p>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

function OrderDetail({
  websiteId,
  orderId,
  onBack,
  onUpdated,
}: {
  websiteId: string;
  orderId: string;
  onBack: () => void;
  onUpdated: (order: ShopOrder) => void;
}) {
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ShopOrderStatus>("pending");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setOrder(null);
    setError(null);
    shopApi
      .order(websiteId, orderId)
      .then((next) => {
        if (!cancelled) {
          setOrder(next);
          setStatus(next.status);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, orderId]);

  async function saveStatus() {
    if (!order || saving || status === order.status) return;
    setSaving(true);
    setError(null);
    try {
      const next = await shopApi.updateOrderStatus(websiteId, order.id, status);
      setOrder(next);
      setStatus(next.status);
      onUpdated(next);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
        <Button size="sm" variant="outline" onPress={onBack}>
          <ArrowLeft className="size-4" aria-hidden /> Back
        </Button>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{order ? `Order #${order.number}` : "Order"}</h3>
          <p className="truncate text-xs text-ink-muted">{order?.customer.email || "Order details"}</p>
        </div>
      </div>
      {error && (
        <div className="px-5 pt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {!order && !error && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading order" />
        </div>
      )}
      {order && (
        <div className="space-y-6 px-5 py-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-xs font-medium text-ink-muted">
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as ShopOrderStatus)}
                className="h-9 min-w-[10rem] rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink"
              >
                {UPDATE_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {statusLabel(value)}
                  </option>
                ))}
              </select>
            </label>
            <Button size="sm" onPress={() => void saveStatus()} isDisabled={saving || status === order.status}>
              {saving ? "Saving…" : "Update status"}
            </Button>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={order.status} />
              <RefundBadge status={order.refundStatus} />
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-ink-muted">Customer</dt>
              <dd className="text-sm text-ink">{order.customer.fullName}</dd>
              <dd className="text-xs text-ink-muted">{order.customer.email}</dd>
              {order.customer.phone && <dd className="text-xs text-ink-muted">{order.customer.phone}</dd>}
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-muted">Placed</dt>
              <dd className="text-sm text-ink">{formatWhen(order.createdAt)}</dd>
              <dt className="mt-2 text-xs font-medium text-ink-muted">Paid</dt>
              <dd className="text-sm text-ink">{formatWhen(order.paidAt)}</dd>
              <dt className="mt-2 text-xs font-medium text-ink-muted">Refund landed</dt>
              <dd className="text-sm text-ink">{formatWhen(order.refundedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-muted">Total</dt>
              <dd className="text-sm font-semibold text-ink">{formatInr(order.totalPaise)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-muted">Payment</dt>
              <dd className="truncate text-xs text-ink-muted">{order.razorpayPaymentId || "—"}</dd>
              <dt className="mt-2 text-xs font-medium text-ink-muted">Refund</dt>
              <dd className="truncate text-xs text-ink-muted">{order.razorpayRefundId || "—"}</dd>
              {order.failureReason && <dd className="mt-1 text-xs text-rose-700">{order.failureReason}</dd>}
            </div>
          </dl>

          <div>
            <h4 className="text-xs font-medium text-ink-muted">Items</h4>
            <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{item.productName}</p>
                    <p className="text-xs text-ink-muted">
                      {item.variantName} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium tabular-nums text-ink">{formatInr(item.lineTotalPaise)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium text-ink-muted">Fulfillment timeline</h4>
            <div className="mt-2 rounded-lg border border-line px-4 py-4">
              <OrderTimeline order={order} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function ShopOrdersPanel({ websiteId }: { websiteId: string }) {
  const [search, setSearch] = useState("");
  const query = useDebounced(search);
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
      <OrderDetail
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
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-medium text-ink-muted">
                <th className="px-5 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Status</th>
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
                    <p className="truncate text-ink">{order.customer.fullName}</p>
                    <p className="truncate text-xs text-ink-muted">{order.customer.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={order.status} />
                      <RefundBadge status={order.refundStatus} />
                    </div>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-ink">{formatInr(order.totalPaise)}</td>
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
