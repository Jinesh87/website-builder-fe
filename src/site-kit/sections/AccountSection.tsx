import { parseRichText } from "../rich-text.tsx";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { safeHref } from "../links.ts";
import { SectionShell } from "../primitives.tsx";
import { useStaticRender } from "../render-mode.tsx";
import {
  SHOP_ACCOUNT_SCRIPT,
  shopAuthApi,
  siteHref,
  type ShopAuthError,
  type ShopCartItemSummary,
  type ShopCustomerAccount,
  type ShopOrderDetail,
  type ShopOrderSummary,
} from "../shop-auth.ts";
import { formatInr, useShopCatalog } from "../shop-catalog.tsx";
import type { AccountData, AccountOrderDetailVariant, AccountSuccessPopupVariant, AccountVariant, SectionOf } from "../types.ts";
import { CheckoutDismissedError, openRazorpayCheckout } from "../../utils/razorpay-checkout.ts";

const FULFILLMENT = [
  { key: "paid", label: "Order received" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;

function fulfillmentIndex(status: string): number {
  const i = FULFILLMENT.findIndex((step) => step.key === status);
  if (i >= 0) return i;
  if (status === "pending") return -1;
  return -1;
}

function eventTime(timeline: { status: string; createdAt: string }[], status: string): string | null {
  const hit = [...timeline].reverse().find((event) => event.status === status);
  return hit?.createdAt ?? null;
}

/**
 * The signed-in customer's page. On the published site a small script asks the shop API who is
 * signed in and shows either the member view (filled with their orders, cart and profile) or the
 * guest prompt. In the editor the owner picks which state to design via `data.preview`, and the
 * member view is filled with sample data so every template can be styled before anyone signs in.
 */

type Panel = "orders" | "cart" | "profile" | "password";

/** Templates that switch between panels; the others stack every panel on one screen. */
const TABBED: Record<AccountVariant, boolean> = {
  "sidebar-tabs": true,
  "top-tabs": true,
  "overview-cards": true,
  "minimal-list": false,
  "dark-panel": true,
};

const SAMPLE: ShopCustomerAccount = {
  customer: {
    id: "sample-customer",
    websiteId: "sample",
    email: "asha@example.com",
    fullName: "Asha Menon",
    phone: "+91 98765 43210",
    emailVerified: true,
    createdAt: "2026-02-14T09:30:00.000Z",
  },
  orders: [
    { id: "o1", number: "1042", status: "shipped", refundStatus: "none", totalPaise: 249900, currency: "INR", createdAt: "2026-10-21T10:12:00.000Z", refundedAt: null },
    { id: "o2", number: "1038", status: "pending", refundStatus: "none", totalPaise: 89900, currency: "INR", createdAt: "2026-10-04T16:40:00.000Z", refundedAt: null },
    { id: "o3", number: "1021", status: "failed", refundStatus: "processed", totalPaise: 159900, currency: "INR", createdAt: "2026-09-12T08:05:00.000Z", refundedAt: "2026-09-12T08:20:00.000Z" },
  ],
  cartItems: [
    { id: "c1", productId: "p1", variantId: "v1", productName: "Everyday tee", variantName: "M / Blue", quantity: 2, pricePaise: 99900 },
    { id: "c2", productId: "p2", variantId: "v2", productName: "Canvas tote", variantName: "Natural", quantity: 1, pricePaise: 59900 },
  ],
};

const SAMPLE_ORDER_DETAIL: ShopOrderDetail = {
  ...SAMPLE.orders[0]!,
  items: [
    { id: "i1", productName: "Everyday tee", variantName: "M / Blue", unitPricePaise: 99900, quantity: 2, lineTotalPaise: 199800 },
    { id: "i2", productName: "Canvas tote", variantName: "Natural", unitPricePaise: 50100, quantity: 1, lineTotalPaise: 50100 },
  ],
  timeline: [
    { id: "t1", status: "paid", actorType: "SYSTEM", note: "Payment received", createdAt: "2026-10-21T10:12:00.000Z" },
    { id: "t2", status: "processing", actorType: "CLIENT", note: "Packed at warehouse", createdAt: "2026-10-22T09:00:00.000Z" },
    { id: "t3", status: "shipped", actorType: "CLIENT", note: "Handed to courier", createdAt: "2026-10-23T14:30:00.000Z" },
  ],
  failureReason: null,
  cancelReason: null,
  paidAt: "2026-10-21T10:12:00.000Z",
  updatedAt: "2026-10-23T14:30:00.000Z",
};

const LABELS = {
  orders: "Orders",
  cart: "Cart",
  profile: "Profile",
  password: "Password",
  logout: "Log out",
  save: "Save changes",
  emptyOrders: "You haven't placed any orders yet.",
  emptyCart: "Your cart is empty.",
  guestHeading: "Sign in to see your account",
  guestText: "Your orders, cart and profile details are only shown to signed-in customers.",
  guestButton: "Log in",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function panelsOf(data: AccountData): Panel[] {
  return (
    [
      data.showOrders !== false ? "orders" : null,
      data.showCart !== false ? "cart" : null,
      data.showProfile !== false ? "profile" : null,
      data.showPassword !== false ? "password" : null,
    ] as Array<Panel | null>
  ).filter((panel): panel is Panel => panel !== null);
}

function labelOf(data: AccountData, panel: Panel): string {
  switch (panel) {
    case "orders":
      return data.ordersLabel?.trim() || LABELS.orders;
    case "cart":
      return data.cartLabel?.trim() || LABELS.cart;
    case "profile":
      return data.profileLabel?.trim() || LABELS.profile;
    case "password":
      return data.passwordLabel?.trim() || LABELS.password;
  }
}

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) return String((error as ShopAuthError).message);
  return "Something went wrong. Please try again.";
}

/* ------------------------------------------------------------------ pieces */

function Avatar({ name }: { name: string }) {
  return (
    <span className="wb-acct-avatar" aria-hidden="true" data-wb-account-field="initials">
      {initials(name)}
    </span>
  );
}

function Identity({ account, compact }: { account: ShopCustomerAccount; compact?: boolean }) {
  return (
    <div className={`wb-acct-identity${compact ? " is-compact" : ""}`}>
      <Avatar name={account.customer.fullName} />
      <div className="wb-acct-identity-text">
        <strong className="wb-acct-name" data-wb-account-field="fullName">
          {account.customer.fullName}
        </strong>
        <span className="wb-acct-email" data-wb-account-field="email">
          {account.customer.email}
        </span>
      </div>
    </div>
  );
}

function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function refundLabel(status: string): string | null {
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

function StatusBadge({ status }: { status: string }) {
  return <span className={`wb-acct-badge is-${status}`}>{statusLabel(status)}</span>;
}

function RefundBadge({ status }: { status: string }) {
  const label = refundLabel(status);
  if (!label) return null;
  return <span className={`wb-acct-badge is-refund-${status}`}>{label}</span>;
}

function OrderTimeline({
  order,
  variant,
}: {
  order: Pick<ShopOrderDetail, "status" | "timeline">;
  variant: AccountOrderDetailVariant;
}) {
  const current = fulfillmentIndex(order.status);
  if (variant === "steps") {
    return (
      <div className="wb-acct-steps" data-wb-order-timeline="steps">
        {FULFILLMENT.map((step, index) => (
          <div
            key={step.key}
            className={`wb-acct-step${index < current ? " is-done" : ""}${index === current ? " is-current" : ""}`}
          >
            {step.label}
          </div>
        ))}
      </div>
    );
  }
  return (
    <ol className={`wb-acct-timeline${variant === "compact" ? " wb-acct-order-compact" : ""}`} data-wb-order-timeline={variant}>
      {FULFILLMENT.map((step, index) => {
        const when = eventTime(order.timeline, step.key);
        const note = [...order.timeline].reverse().find((event) => event.status === step.key)?.note;
        return (
          <li
            key={step.key}
            className={`wb-acct-timeline-step${index < current ? " is-done" : ""}${index === current ? " is-current" : ""}`}
          >
            <span className="wb-acct-timeline-dot" aria-hidden="true" />
            <div>
              <span className="wb-acct-timeline-label">{step.label}</span>
              {when && <span className="wb-acct-timeline-time">{formatDate(when)}</span>}
              {note && <span className="wb-acct-timeline-note">{note}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetailView({
  order,
  variant,
  onClose,
  onCancelled,
  websiteId,
}: {
  order: ShopOrderDetail;
  variant: AccountOrderDetailVariant;
  onClose: () => void;
  onCancelled?: (order: ShopOrderDetail) => void;
  websiteId?: string;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [reason, setReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);

  async function submitCancel(event: FormEvent) {
    event.preventDefault();
    if (!websiteId || !order.canCancel || cancelling) return;
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setCancelError("Please share a short reason.");
      return;
    }
    setCancelling(true);
    setCancelError(null);
    try {
      const next = await shopAuthApi.cancelOrder(websiteId, order.id, trimmed);
      setCancelNotice(next.failureReason || "Order cancelled.");
      onCancelled?.(next);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Could not cancel this order.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="wb-acct-order-modal" data-wb-account-order-modal>
      <button type="button" className="wb-acct-order-backdrop" aria-label="Close order" onClick={onClose} />
      <div className={`wb-acct-order-dialog is-${variant}`} role="dialog" aria-modal="true" aria-label={`Order #${order.number}`}>
        <div className="wb-acct-order-head">
          <div>
            <h3 className="wb-acct-success-title">Order #{order.number}</h3>
            <p className="wb-acct-success-text">Placed {formatDate(order.createdAt)}</p>
          </div>
          <button type="button" className="wb-acct-order-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {cancelNotice && <p className="wb-acct-form-msg is-ok">{cancelNotice}</p>}
        <div className="wb-acct-badges">
          <StatusBadge status={order.status} />
          <RefundBadge status={order.refundStatus} />
        </div>
        <div className="wb-acct-order-items">
          {order.items.map((item) => (
            <div key={item.id} className="wb-acct-order-item">
              <div>
                <strong>{item.productName}</strong>
                <span>
                  {" "}
                  · {item.variantName} · Qty {item.quantity}
                </span>
              </div>
              <strong>{formatInr(item.lineTotalPaise)}</strong>
            </div>
          ))}
        </div>
        <p className="wb-acct-success-meta">
          <strong>Total {formatInr(order.totalPaise)}</strong>
        </p>
        {order.canCancel && websiteId && (
          <div className="wb-acct-cancel">
            {!showCancelForm ? (
              <button type="button" className="wb-acct-cancel-open" onClick={() => setShowCancelForm(true)}>
                Cancel this order
              </button>
            ) : (
              <form className="wb-acct-cancel-form" onSubmit={(event) => void submitCancel(event)}>
                <p className="wb-acct-cancel-title">Cancel order</p>
                <label className="wb-acct-cancel-label">
                  Reason
                  <textarea
                    name="reason"
                    rows={2}
                    maxLength={500}
                    required
                    placeholder="e.g. Ordered by mistake"
                    className="wb-acct-cancel-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </label>
                <p className="wb-acct-cancel-hint">Paid orders are refunded automatically.</p>
                {cancelError && <p className="wb-acct-form-msg is-error">{cancelError}</p>}
                <div className="wb-acct-cancel-actions">
                  <button
                    type="button"
                    className="wb-acct-cancel-keep"
                    onClick={() => {
                      setShowCancelForm(false);
                      setCancelError(null);
                    }}
                  >
                    Keep order
                  </button>
                  <button type="submit" className="wb-acct-cancel-confirm" disabled={cancelling}>
                    {cancelling ? "Cancelling…" : "Confirm"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        {order.cancelReason && !order.canCancel && (
          <p className="wb-acct-cancel-reason-view">
            <strong>Cancel reason:</strong> {order.cancelReason}
          </p>
        )}
        {!showCancelForm && (
          <div className="wb-acct-order-tracking">
            <h4 className="wb-acct-panel-title" style={{ marginTop: 18 }}>
              Tracking
            </h4>
            <OrderTimeline order={order} variant={variant} />
          </div>
        )}
      </div>
    </div>
  );
}

function SuccessPopup({
  order,
  data,
  onClose,
  onView,
}: {
  order: ShopOrderSummary;
  data: AccountData;
  onClose: () => void;
  onView: () => void;
}) {
  const variant: AccountSuccessPopupVariant = data.successPopupVariant ?? "celebration";
  return (
    <div className="wb-acct-success-modal" data-wb-account-success-modal>
      <button type="button" className="wb-acct-success-backdrop" aria-label="Close" onClick={onClose} />
      <div className={`wb-acct-success-dialog is-${variant}`} role="dialog" aria-modal="true" aria-label="Order confirmed">
        <p className="wb-acct-success-kicker">Payment successful</p>
        <h3 className="wb-acct-success-title">{data.successHeading?.trim() || "Order confirmed"}</h3>
        <p className="wb-acct-success-text">{data.successText?.trim() || "Thanks for your purchase. We'll update you as it moves along."}</p>
        <div className="wb-acct-success-meta">
          <strong>Order #{order.number}</strong>
          <span>{formatInr(order.totalPaise)}</span>
        </div>
        <div className="wb-acct-success-actions">
          <button type="button" className="wb-acct-button is-pay" onClick={onView}>
            {data.successButtonLabel?.trim() || "View order"}
          </button>
          <button type="button" className="wb-acct-button" onClick={onClose} style={{ background: "transparent", color: "inherit", border: "1px solid var(--wb-border)" }}>
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel({
  data,
  account,
  shopHref,
  websiteId,
  interactive,
  openOrderId,
  onOpenOrder,
}: {
  data: AccountData;
  account: ShopCustomerAccount;
  shopHref: string;
  websiteId?: string;
  interactive: boolean;
  openOrderId?: string | null;
  onOpenOrder?: (orderId: string | null) => void;
}) {
  const empty = data.emptyOrdersText?.trim() || LABELS.emptyOrders;
  const detailVariant: AccountOrderDetailVariant = data.orderDetailVariant ?? "timeline";
  const [detail, setDetail] = useState<ShopOrderDetail | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!openOrderId || !websiteId || !interactive) return;
    let cancelled = false;
    setLoadingId(openOrderId);
    shopAuthApi
      .getOrder(websiteId, openOrderId)
      .then((order) => {
        if (!cancelled) setDetail(order);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [openOrderId, websiteId, interactive]);

  async function openOrder(orderId: string) {
    onOpenOrder?.(orderId);
    if (!interactive || !websiteId) {
      const summary = account.orders.find((order) => order.id === orderId);
      if (summary) {
        setDetail({
          ...summary,
          items: [],
          timeline: [{ id: "1", status: summary.status, actorType: "SYSTEM", note: null, createdAt: summary.createdAt }],
          failureReason: null,
          cancelReason: null,
          paidAt: null,
          updatedAt: summary.createdAt,
        });
      }
      return;
    }
    setLoadingId(orderId);
    try {
      setDetail(await shopAuthApi.getOrder(websiteId, orderId));
    } catch {
      setDetail(null);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <ul className="wb-acct-list" data-wb-account-list="orders" hidden={account.orders.length === 0}>
        {account.orders.map((order) => (
          <li
            key={order.id}
            className="wb-acct-row is-clickable"
            data-wb-order-id={order.id}
            onClick={() => void openOrder(order.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                void openOrder(order.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="wb-acct-row-main">
              <strong>Order #{order.number}</strong>
              <span className="wb-acct-row-sub">{formatDate(order.createdAt)}</span>
            </div>
            <div className="wb-acct-badges">
              <StatusBadge status={order.status} />
              <RefundBadge status={order.refundStatus} />
              {order.canCancel && interactive && websiteId && (
                <button
                  type="button"
                  className="wb-acct-row-cancel"
                  onClick={(event) => {
                    event.stopPropagation();
                    void openOrder(order.id);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
            <strong className="wb-acct-row-amount">{formatInr(order.totalPaise)}</strong>
          </li>
        ))}
      </ul>
      {loadingId && <p className="wb-acct-message">Loading order…</p>}
      <div className="wb-acct-empty" data-wb-account-empty="orders" hidden={account.orders.length > 0}>
        <p>{empty}</p>
        <a className="wb-acct-link" href={safeHref(shopHref)}>
          Browse the shop
        </a>
      </div>
      {detail && (
        <OrderDetailView
          order={detail}
          variant={detailVariant}
          websiteId={interactive ? websiteId : undefined}
          onClose={() => {
            setDetail(null);
            onOpenOrder?.(null);
          }}
          onCancelled={(next) => {
            setDetail(next);
            onOpenOrder?.(next.id);
          }}
        />
      )}
    </>
  );
}

function CartPanel({
  data,
  account,
  shopHref,
  websiteId,
  interactive,
  onCartChange,
  onPaid,
}: {
  data: AccountData;
  account: ShopCustomerAccount;
  shopHref: string;
  websiteId?: string;
  interactive: boolean;
  onCartChange?: (items: ShopCustomerAccount["cartItems"]) => void;
  onPaid?: (order: ShopOrderSummary) => void;
}) {
  const empty = data.emptyCartText?.trim() || LABELS.emptyCart;
  const [items, setItems] = useState(account.cartItems);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payMessage, setPayMessage] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<ShopCartItemSummary | null>(null);
  const [removeQty, setRemoveQty] = useState(1);

  useEffect(() => {
    setItems(account.cartItems);
  }, [account.cartItems]);

  useEffect(() => {
    if (!pendingRemove) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingRemove(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [pendingRemove]);

  const total = items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);
  const maxRemove = pendingRemove?.quantity ?? 1;

  async function applyRemoval(itemId: string, currentQty: number, qtyToRemove: number) {
    if (!interactive || !websiteId || busyId) return;
    const removeCount = Math.max(1, Math.min(currentQty, Math.floor(qtyToRemove)));
    setBusyId(itemId);
    setError(null);
    setPendingRemove(null);
    try {
      const next =
        removeCount >= currentQty
          ? await shopAuthApi.removeCartItem(websiteId, itemId)
          : await shopAuthApi.updateCartItem(websiteId, itemId, currentQty - removeCount);
      setItems(next);
      onCartChange?.(next);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function payNow() {
    if (!interactive || !websiteId || paying || items.length === 0) return;
    setPaying(true);
    setError(null);
    setPayMessage(null);
    try {
      const checkout = await shopAuthApi.startCheckout(websiteId);
      const confirmation = await openRazorpayCheckout(
        {
          orderId: checkout.razorpayOrderId,
          keyId: checkout.keyId,
          amountPaise: checkout.amountPaise,
          currency: checkout.currency,
          businessName: checkout.businessName,
          prefill: checkout.prefill,
        },
        `Order #${checkout.orderNumber}`,
      );
      const order = await shopAuthApi.confirmCheckout(websiteId, confirmation);
      setItems([]);
      onCartChange?.([]);
      setPayMessage("Payment successful. Your order is confirmed.");
      onPaid?.(order);
    } catch (err) {
      if (err instanceof CheckoutDismissedError) {
        setPayMessage("Payment cancelled.");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setPaying(false);
    }
  }

  function requestRemove(item: ShopCartItemSummary) {
    if (!interactive || busyId) return;
    if (item.quantity <= 1) {
      void applyRemoval(item.id, item.quantity, 1);
      return;
    }
    setRemoveQty(1);
    setPendingRemove(item);
  }

  const removeModal =
    pendingRemove && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={(node) => {
              const theme = document.querySelector(".wb-site")?.getAttribute("style");
              if (node && theme) node.setAttribute("style", theme);
            }}
            className="wb-cart-qty-modal is-open"
            data-wb-cart-qty-modal=""
          >
            <button type="button" className="wb-cart-login-backdrop" aria-label="Close remove prompt" onClick={() => setPendingRemove(null)} />
            <div className="wb-cart-login-dialog is-qty" role="dialog" aria-modal="true" aria-label="Remove from cart">
              <button type="button" className="wb-cart-login-close" aria-label="Close remove prompt" onClick={() => setPendingRemove(null)}>
                ×
              </button>
              <p className="wb-cart-login-kicker">Remove from cart</p>
              <p className="wb-cart-login-title">{pendingRemove.productName}</p>
              <p className="wb-cart-login-text">
                {pendingRemove.variantName ? `${pendingRemove.variantName}. ` : ""}
                How many should we remove?
              </p>
              <div className="wb-cart-qty-panel">
                <div className="wb-cart-qty-row">
                  <button
                    type="button"
                    className="wb-cart-qty-step"
                    aria-label="Decrease quantity"
                    disabled={removeQty <= 1}
                    onClick={() => setRemoveQty((value) => Math.max(1, value - 1))}
                  >
                    −
                  </button>
                  <input
                    className="wb-cart-qty-input"
                    type="number"
                    min={1}
                    max={maxRemove}
                    value={removeQty}
                    aria-label="Quantity to remove"
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (!Number.isFinite(next)) return;
                      setRemoveQty(Math.max(1, Math.min(maxRemove, Math.floor(next))));
                    }}
                  />
                  <button
                    type="button"
                    className="wb-cart-qty-step"
                    aria-label="Increase quantity"
                    disabled={removeQty >= maxRemove}
                    onClick={() => setRemoveQty((value) => Math.min(maxRemove, value + 1))}
                  >
                    +
                  </button>
                </div>
                <span className="wb-cart-qty-stock">{maxRemove} in cart</span>
              </div>
              <div className="wb-cart-login-actions is-stacked">
                <button
                  type="button"
                  className="wb-shop-btn is-buy"
                  onClick={() => void applyRemoval(pendingRemove.id, pendingRemove.quantity, removeQty)}
                >
                  {removeQty >= maxRemove ? "Remove all" : `Remove ${removeQty}`}
                </button>
                <button type="button" className="wb-shop-btn is-cart" onClick={() => setPendingRemove(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <ul className="wb-acct-list" data-wb-account-list="cart" hidden={items.length === 0}>
        {items.map((item) => (
          <li key={item.id} className="wb-acct-row" data-wb-cart-item={item.id}>
            {item.imageUrl ? <img className="wb-acct-thumb" src={item.imageUrl} alt="" /> : <span className="wb-acct-thumb is-blank" aria-hidden="true" />}
            <div className="wb-acct-row-main">
              <strong>{item.productName}</strong>
              <span className="wb-acct-row-sub">
                {item.variantName ? `${item.variantName} · ` : ""}Qty {item.quantity}
              </span>
            </div>
            <strong className="wb-acct-row-amount">{formatInr(item.pricePaise * item.quantity)}</strong>
            <button
              type="button"
              className="wb-acct-cart-remove"
              data-wb-cart-remove={item.id}
              data-wb-cart-qty={item.quantity}
              disabled={busyId === item.id}
              onClick={interactive ? () => requestRemove(item) : undefined}
            >
              {busyId === item.id ? "Removing…" : "Remove"}
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="wb-acct-message is-error">{error}</p>}
      <div className="wb-acct-cart-total" data-wb-account-cart-total hidden={items.length === 0}>
        <span>Subtotal</span>
        <strong data-wb-account-field="cartTotal">{formatInr(total)}</strong>
      </div>
      <div className="wb-acct-checkout" data-wb-account-checkout hidden={items.length === 0}>
        <button
          type="button"
          className="wb-acct-button is-pay"
          data-wb-account-pay
          disabled={paying || (interactive && !websiteId)}
          onClick={interactive ? () => void payNow() : undefined}
        >
          {paying ? "Opening payment…" : "Pay now"}
        </button>
        <p
          className={`wb-acct-message${payMessage && /cancel|fail|could not|couldn't/i.test(payMessage) ? " is-error" : payMessage ? " is-ok" : ""}`}
          data-wb-account-pay-message
          hidden={!payMessage}
        >
          {payMessage}
        </p>
      </div>
      <div className="wb-acct-empty" data-wb-account-empty="cart" hidden={items.length > 0}>
        <p>{empty}</p>
        <a className="wb-acct-link" href={safeHref(shopHref)}>
          Browse the shop
        </a>
      </div>
      {removeModal}
    </>
  );
}

function ProfilePanel({
  data,
  account,
  websiteId,
  interactive,
}: {
  data: AccountData;
  account: ShopCustomerAccount;
  websiteId?: string;
  interactive: boolean;
}) {
  const [fullName, setFullName] = useState(account.customer.fullName);
  const [phone, setPhone] = useState(account.customer.phone ?? "");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFullName(account.customer.fullName);
    setPhone(account.customer.phone ?? "");
  }, [account.customer.fullName, account.customer.phone]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!interactive || !websiteId) return;
    setBusy(true);
    setMessage(null);
    try {
      await shopAuthApi.updateProfile(websiteId, { fullName: fullName.trim(), phone: phone.trim() });
      setMessage({ text: "Profile updated.", ok: true });
    } catch (error) {
      setMessage({ text: errorMessage(error), ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="wb-acct-form" data-wb-account-profile onSubmit={submit}>
      <label className="wb-acct-label">
        Full name
        <input className="wb-acct-input" name="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name" />
      </label>
      <label className="wb-acct-label">
        Email
        <input className="wb-acct-input" name="email" value={account.customer.email} readOnly data-wb-account-field-input="email" />
      </label>
      <label className="wb-acct-label">
        Phone
        <input className="wb-acct-input" name="phone" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
      </label>
      <p className={`wb-acct-message${message ? (message.ok ? " is-ok" : " is-error") : ""}`} role="status" data-wb-account-message hidden={!message}>
        {parseRichText(message?.text ?? "")}
      </p>
      <div className="wb-acct-actions">
        <button type="submit" className="wb-acct-button" disabled={busy}>
          {busy ? "Saving..." : data.saveLabel?.trim() || LABELS.save}
        </button>
      </div>
    </form>
  );
}

function PasswordPanel({ websiteId, interactive }: { websiteId?: string; interactive: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!interactive || !websiteId) return;
    if (next !== confirm) {
      setMessage({ text: "The new passwords don't match.", ok: false });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await shopAuthApi.changePassword(websiteId, { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage({ text: "Password changed.", ok: true });
    } catch (error) {
      setMessage({ text: errorMessage(error), ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="wb-acct-form" data-wb-account-password onSubmit={submit}>
      <label className="wb-acct-label">
        Current password
        <input className="wb-acct-input" type="password" name="currentPassword" value={current} onChange={(event) => setCurrent(event.target.value)} required autoComplete="current-password" />
      </label>
      <div className="wb-acct-form-row">
        <label className="wb-acct-label">
          New password
          <input className="wb-acct-input" type="password" name="newPassword" value={next} onChange={(event) => setNext(event.target.value)} required minLength={8} autoComplete="new-password" />
        </label>
        <label className="wb-acct-label">
          Confirm new password
          <input className="wb-acct-input" type="password" name="confirmPassword" value={confirm} onChange={(event) => setConfirm(event.target.value)} required minLength={8} autoComplete="new-password" />
        </label>
      </div>
      <p className={`wb-acct-message${message ? (message.ok ? " is-ok" : " is-error") : ""}`} role="status" data-wb-account-message hidden={!message}>
        {parseRichText(message?.text ?? "")}
      </p>
      <div className="wb-acct-actions">
        <button type="submit" className="wb-acct-button" disabled={busy}>
          {busy ? "Saving..." : "Change password"}
        </button>
      </div>
    </form>
  );
}

function Stats({
  account,
  active,
  onSelect,
}: {
  account: ShopCustomerAccount;
  active?: Panel;
  onSelect?: (panel: Panel) => void;
}) {
  const cartCount = account.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const orderStat = (
    <>
      <span className="wb-acct-stat-value" data-wb-account-count="orders">
        {account.orders.length}
      </span>
      <span className="wb-acct-stat-label">Orders</span>
    </>
  );
  const cartStat = (
    <>
      <span className="wb-acct-stat-value" data-wb-account-count="cart">
        {cartCount}
      </span>
      <span className="wb-acct-stat-label">Items in cart</span>
    </>
  );
  return (
    <div className="wb-acct-stats">
      {onSelect ? (
        <button
          type="button"
          className={`wb-acct-stat is-action${active === "orders" ? " is-active" : ""}`}
          data-wb-account-stat="orders"
          aria-pressed={active === "orders"}
          onClick={() => onSelect("orders")}
        >
          {orderStat}
        </button>
      ) : (
        <div className="wb-acct-stat">{orderStat}</div>
      )}
      {onSelect ? (
        <button
          type="button"
          className={`wb-acct-stat is-action${active === "cart" ? " is-active" : ""}`}
          data-wb-account-stat="cart"
          aria-pressed={active === "cart"}
          onClick={() => onSelect("cart")}
        >
          {cartStat}
        </button>
      ) : (
        <div className="wb-acct-stat">{cartStat}</div>
      )}
      <div className="wb-acct-stat">
        <span className="wb-acct-stat-value" data-wb-account-field="memberSince">
          {formatDate(account.customer.createdAt)}
        </span>
        <span className="wb-acct-stat-label">Member since</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ views */

type MemberProps = {
  data: AccountData;
  variant: AccountVariant;
  account: ShopCustomerAccount;
  websiteId?: string;
  interactive: boolean;
  loginHref: string;
  shopHref: string;
};

function MemberView({ data, variant, account, websiteId, interactive, loginHref, shopHref }: MemberProps) {
  const panels = panelsOf(data);
  const tabbed = TABBED[variant];
  const [active, setActive] = useState<Panel>(() => {
    if (typeof window === "undefined") return panels[0] ?? "profile";
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = (params.get("panel") || window.location.hash.replace(/^#/, "") || "").trim() as Panel;
      if (panels.includes(fromUrl)) return fromUrl;
    } catch {
      /* ignore */
    }
    return panels[0] ?? "profile";
  });
  const [cartItems, setCartItems] = useState(account.cartItems);
  const [orders, setOrders] = useState(account.orders);
  const [successOrder, setSuccessOrder] = useState<ShopOrderSummary | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const current = panels.includes(active) ? active : (panels[0] ?? "profile");
  const heading = data.heading?.trim();
  const subheading = data.subheading?.trim();
  const liveAccount = { ...account, cartItems, orders };

  useEffect(() => {
    setCartItems(account.cartItems);
    setOrders(account.orders);
  }, [account.cartItems, account.orders]);

  async function logout() {
    if (!interactive || !websiteId) return;
    await shopAuthApi.logout(websiteId);
    window.location.href = siteHref(loginHref);
  }

  async function refreshAfterPay(order: ShopOrderSummary) {
    setSuccessOrder(order);
    if (!interactive || !websiteId) return;
    try {
      const next = await shopAuthApi.account(websiteId);
      setCartItems(next.cartItems);
      setOrders(next.orders);
    } catch {
      /* keep local cart clear */
    }
  }

  const cartCount = liveAccount.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const tabs = tabbed && panels.length > 1 && (
    <nav className="wb-acct-tabs" role="tablist" aria-label="Account sections">
      {panels.map((panel) => (
        <button
          key={panel}
          type="button"
          role="tab"
          className={`wb-acct-tab${current === panel ? " is-active" : ""}`}
          aria-selected={current === panel}
          data-wb-account-tab={panel}
          onClick={() => setActive(panel)}
        >
          <span>{labelOf(data, panel)}</span>
          {panel === "orders" && (
            <span className="wb-acct-tab-count" data-wb-account-count="orders">
              {liveAccount.orders.length}
            </span>
          )}
          {panel === "cart" && (
            <span className="wb-acct-tab-count" data-wb-account-count="cart">
              {cartCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );

  const logoutButton = (
    <button type="button" className="wb-acct-logout" data-wb-account-logout onClick={logout}>
      {data.logoutLabel?.trim() || LABELS.logout}
    </button>
  );

  const panelBody = (panel: Panel): ReactNode => {
    switch (panel) {
      case "orders":
        return (
          <OrdersPanel
            data={data}
            account={liveAccount}
            shopHref={shopHref}
            websiteId={websiteId}
            interactive={interactive}
            openOrderId={openOrderId}
            onOpenOrder={setOpenOrderId}
          />
        );
      case "cart":
        return (
          <CartPanel
            data={data}
            account={liveAccount}
            shopHref={shopHref}
            websiteId={websiteId}
            interactive={interactive}
            onCartChange={setCartItems}
            onPaid={(order) => void refreshAfterPay(order)}
          />
        );
      case "profile":
        return <ProfilePanel data={data} account={liveAccount} websiteId={websiteId} interactive={interactive} />;
      case "password":
        return <PasswordPanel websiteId={websiteId} interactive={interactive} />;
    }
  };

  const sections = panels.map((panel) => (
    <section
      key={panel}
      className={`wb-acct-panel wb-acct-panel-${panel}`}
      data-wb-account-panel={panel}
      hidden={tabbed && current !== panel}
      aria-label={labelOf(data, panel)}
    >
      <h3 className="wb-acct-panel-title">{labelOf(data, panel)}</h3>
      {panelBody(panel)}
    </section>
  ));

  const titles = (heading || subheading) && (
    <div className="wb-acct-heading">
      {heading && <h2 className="wb-acct-title">{parseRichText(heading)}</h2>}
      {subheading && <p className="wb-acct-subtitle">{parseRichText(subheading)}</p>}
    </div>
  );

  const successModal = successOrder ? (
    <SuccessPopup
      order={successOrder}
      data={data}
      onClose={() => setSuccessOrder(null)}
      onView={() => {
        const id = successOrder.id;
        setSuccessOrder(null);
        if (panels.includes("orders")) setActive("orders");
        setOpenOrderId(id);
      }}
    />
  ) : null;

  if (variant === "sidebar-tabs" || variant === "dark-panel") {
    return (
      <div className="wb-acct-member">
        {titles}
        <div className="wb-acct-layout">
          <aside className="wb-acct-side">
            <Identity account={account} />
            {tabs}
            {logoutButton}
          </aside>
          <div className="wb-acct-main">{sections}</div>
        </div>
        {successModal}
      </div>
    );
  }

  if (variant === "top-tabs") {
    return (
      <div className="wb-acct-member">
        {titles}
        <header className="wb-acct-topbar">
          <Identity account={account} compact />
          {logoutButton}
        </header>
        {tabs}
        <div className="wb-acct-main">{sections}</div>
        {successModal}
      </div>
    );
  }

  if (variant === "overview-cards") {
    const openPanel = (panel: Panel) => {
      if (panels.includes(panel)) setActive(panel);
    };
    return (
      <div className="wb-acct-member">
        <header className="wb-acct-topbar">
          <div>
            {titles}
            <Identity account={account} compact />
          </div>
          {logoutButton}
        </header>
        <Stats account={liveAccount} active={current} onSelect={openPanel} />
        {tabs}
        <div className="wb-acct-main wb-acct-workspace">{sections}</div>
        {successModal}
      </div>
    );
  }

  // minimal-list
  return (
    <div className="wb-acct-member">
      <header className="wb-acct-topbar">
        <div>
          {titles}
          <Identity account={account} compact />
        </div>
        {logoutButton}
      </header>
      <div className="wb-acct-main">{sections}</div>
      {successModal}
    </div>
  );
}

function GuestView({ data, loginHref }: { data: AccountData; loginHref: string }) {
  return (
    <div className="wb-acct-guest">
      <span className="wb-acct-guest-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M7 11V8a5 5 0 0 1 10 0v3" />
        </svg>
      </span>
      <h2 className="wb-acct-title">{data.guestHeading?.trim() || LABELS.guestHeading}</h2>
      <p className="wb-acct-subtitle">{data.guestText?.trim() || LABELS.guestText}</p>
      <a className="wb-acct-button" href={safeHref(loginHref)} data-wb-account-login>
        {data.guestButtonLabel?.trim() || LABELS.guestButton}
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ section */

export default function AccountSection({ section }: { section: SectionOf<"account"> }) {
  const data = section.data;
  const catalog = useShopCatalog();
  const isStatic = useStaticRender();
  const websiteId = catalog?.live ? catalog.websiteId : undefined;
  const variant: AccountVariant = data.variant in TABBED ? data.variant : "sidebar-tabs";
  const loginHref = data.loginHref?.trim() || catalog?.authHref || "/login";
  const shopHref = data.shopHref?.trim() || "/shop";
  const preview = data.preview ?? "member";

  const showEditorOverlay = !isStatic && (preview === "success" || preview === "order-detail");
  const classes = [
    "wb-acct-root",
    `wb-acct-v-${variant}`,
    variant === "dark-panel" ? "wb-acct-dark" : "",
    showEditorOverlay ? "is-editor-preview" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (isStatic) {
    // The published page carries both states; the script shows the right one once the session is known.
    return (
      <SectionShell sectionId={section.id} settings={section.settings} className="wb-account" label={data.heading || "My account"}>
        <div
          className={classes}
          data-wb-account={websiteId ?? ""}
          data-wb-account-login={loginHref}
          data-wb-account-redirect={data.redirectWhenLoggedOut ? "1" : undefined}
          data-wb-success-variant={data.successPopupVariant ?? "celebration"}
          data-wb-order-detail-variant={data.orderDetailVariant ?? "timeline"}
          data-wb-success-heading={data.successHeading?.trim() || "Order confirmed"}
          data-wb-success-text={data.successText?.trim() || "Thanks for your purchase. We'll update you as it moves along."}
          data-wb-success-button={data.successButtonLabel?.trim() || "View order"}
        >
          <div className="wb-acct-state" data-wb-account-state="loading">
            <div className="wb-acct-loading" aria-busy="true">
              <span className="wb-acct-spinner" aria-hidden="true" />
            </div>
          </div>
          <div className="wb-acct-state" data-wb-account-state="guest" hidden>
            <GuestView data={data} loginHref={loginHref} />
          </div>
          <div className="wb-acct-state" data-wb-account-state="member" hidden>
            <MemberView
              data={data}
              variant={variant}
              account={{ customer: { ...SAMPLE.customer, fullName: "", email: "", phone: "" }, orders: [], cartItems: [] }}
              websiteId={websiteId}
              interactive={false}
              loginHref={loginHref}
              shopHref={shopHref}
            />
          </div>
          {websiteId && <script dangerouslySetInnerHTML={{ __html: SHOP_ACCOUNT_SCRIPT }} />}
        </div>
      </SectionShell>
    );
  }

  // Editor canvas: the owner designs the state they picked, with sample data for the member view.
  const editorPreview =
    preview === "guest" ? (
      <GuestView data={data} loginHref={loginHref} />
    ) : (
      <>
        <MemberView data={data} variant={variant} account={SAMPLE} interactive={false} loginHref={loginHref} shopHref={shopHref} />
        {preview === "success" && (
          <SuccessPopup order={SAMPLE.orders[0]!} data={data} onClose={() => undefined} onView={() => undefined} />
        )}
        {preview === "order-detail" && (
          <OrderDetailView
            order={SAMPLE_ORDER_DETAIL}
            variant={data.orderDetailVariant ?? "timeline"}
            onClose={() => undefined}
          />
        )}
      </>
    );

  return (
    <SectionShell sectionId={section.id} settings={section.settings} className="wb-account" label={data.heading || "My account"}>
      <div className={classes}>{editorPreview}</div>
    </SectionShell>
  );
}
