import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type ShopOrder, type ShopOrderStatus } from "../../api/shop.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { GuestBadge, RefundBadge, StatusBadge } from "./ShopOrderBadges.tsx";
import CancelOrderConfirm from "./CancelOrderConfirm.tsx";
import OrderRefundBox from "./OrderRefundBox.tsx";
import { formatInr, formatWhen } from "./shop-format.ts";
import { awaitingRefund, statusLabel } from "./shop-order-format.ts";

const UPDATE_STATUSES: ShopOrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "failed",
  "cancelled",
  "returned",
];

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

export default function ShopOrderDetail({
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
  const [refundMessage, setRefundMessage] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setOrder(null);
    setError(null);
    setRefundMessage(null);
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

  // Cancelling from here refunds a paid order and restocks it, so it asks first.
  const cancelNeedsConfirm =
    !!order && status === "cancelled" && order.status !== "cancelled" && order.status !== "returned";
  const cancelRefunds =
    !!order && !!order.razorpayPaymentId && (order.refundStatus === "none" || order.refundStatus === "failed");

  function applyRefund(next: ShopOrder, message: string) {
    setOrder(next);
    setStatus(next.status);
    setRefundMessage(message);
    onUpdated(next);
  }

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
        <Button size="sm" variant="outline" onPress={onBack}>
          <ArrowLeft className="size-4" aria-hidden /> Back
        </Button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-ink">{order ? `Order #${order.number}` : "Order"}</h3>
            {order?.customer.isGuest && <GuestBadge />}
          </div>
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
            <Button
              size="sm"
              onPress={() => (cancelNeedsConfirm ? setConfirmCancel(true) : void saveStatus())}
              isDisabled={saving || status === order.status || confirmCancel}
            >
              {saving ? "Saving…" : "Update status"}
            </Button>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={order.status} />
              <RefundBadge status={order.refundStatus} />
            </div>
          </div>

          {confirmCancel && cancelNeedsConfirm && (
            <CancelOrderConfirm
              order={order}
              refunds={cancelRefunds}
              saving={saving}
              onConfirm={() => {
                setConfirmCancel(false);
                void saveStatus();
              }}
              onKeep={() => setConfirmCancel(false)}
            />
          )}

          {awaitingRefund(order) && (
            <OrderRefundBox
              websiteId={websiteId}
              order={order}
              disabled={saving}
              onRefunded={applyRefund}
              onError={setError}
            />
          )}
          {refundMessage && <FormAlert status="success">{refundMessage}</FormAlert>}

          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-ink-muted">Customer</dt>
              <dd className="flex flex-wrap items-center gap-2 text-sm text-ink">
                <span>{order.customer.fullName}</span>
                {order.customer.isGuest && <GuestBadge />}
              </dd>
              <dd className="text-xs text-ink-muted">{order.customer.email}</dd>
              {order.customer.phone && <dd className="text-xs text-ink-muted">{order.customer.phone}</dd>}
            </div>
            {order.shippingAddress && (
              <div>
                <dt className="text-xs font-medium text-ink-muted">Delivery address</dt>
                <dd className="text-sm text-ink">{order.shippingAddress.fullName}</dd>
                <dd className="text-xs text-ink-muted">{order.shippingAddress.phone}</dd>
                <dd className="text-xs text-ink-muted">
                  {[order.shippingAddress.line1, order.shippingAddress.line2].filter(Boolean).join(", ")}
                </dd>
                <dd className="text-xs text-ink-muted">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </dd>
                <dd className="text-xs text-ink-muted">{order.shippingAddress.country}</dd>
              </div>
            )}
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
              {order.discountPaise != null && order.discountPaise > 0 ? (
                <div className="mt-0.5 space-y-1 text-sm">
                  <div className="flex justify-between gap-4 text-ink-muted">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatInr(order.listAmountPaise ?? order.totalPaise + order.discountPaise)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-emerald-700">
                    <span>Coupon {order.couponCode || ""}</span>
                    <span className="tabular-nums">−{formatInr(order.discountPaise)}</span>
                  </div>
                  <div className="flex justify-between gap-4 font-semibold text-ink">
                    <span>Paid</span>
                    <span className="tabular-nums">{formatInr(order.totalPaise)}</span>
                  </div>
                </div>
              ) : (
                <dd className="text-sm font-semibold text-ink">{formatInr(order.totalPaise)}</dd>
              )}
              {order.couponCode && !(order.discountPaise != null && order.discountPaise > 0) && (
                <dd className="mt-1 text-xs text-ink-muted">Coupon {order.couponCode}</dd>
              )}
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-muted">Payment</dt>
              <dd className="truncate text-xs text-ink-muted">{order.razorpayPaymentId || "—"}</dd>
              <dt className="mt-2 text-xs font-medium text-ink-muted">Refund</dt>
              <dd className="truncate text-xs text-ink-muted">{order.razorpayRefundId || "—"}</dd>
              {order.failureReason && <dd className="mt-1 text-xs text-rose-700">{order.failureReason}</dd>}
            </div>
            {order.cancelReason && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-ink-muted">Customer cancel reason</dt>
                <dd className="mt-0.5 text-sm text-ink">{order.cancelReason}</dd>
              </div>
            )}
            {order.returnReason && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-ink-muted">Customer return reason</dt>
                <dd className="mt-0.5 text-sm text-ink">{order.returnReason}</dd>
              </div>
            )}
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
