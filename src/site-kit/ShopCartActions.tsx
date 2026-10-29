import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { accountPanelHref, shopAuthApi, siteHref, type ShopAuthError } from "./shop-auth.ts";

type Props = {
  variantId?: string;
  websiteId?: string;
  authHref?: string;
  accountHref?: string;
  outOfStock?: boolean;
  /** Units available for this variant; used to cap the quantity picker. */
  stockMax?: number;
  /** Editor / preview: handle clicks in React. Published pages use the static cart script. */
  interactive?: boolean;
  compact?: boolean;
  loginPromptVariant?: "soft-card" | "minimal" | "glass" | "split";
};

type PendingAction = "add" | "buy";

function themeStyle(from: HTMLElement | null): string | undefined {
  return from?.closest(".wb-site")?.getAttribute("style") || undefined;
}

export default function ShopCartActions({
  variantId,
  websiteId,
  authHref = "/login",
  accountHref = "/account",
  outOfStock = false,
  stockMax = 0,
  interactive = false,
  compact = false,
  loginPromptVariant = "soft-card",
}: Props) {
  const [busy, setBusy] = useState<"add" | "buy" | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text?: string } | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [quantity, setQuantity] = useState(1);
  const disabled = outOfStock || stockMax <= 0 || !variantId || busy !== null;
  const maxQty = Math.max(0, Math.min(99, Math.floor(stockMax)));
  const loginUrl = siteHref(authHref);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLoginPopup && !pendingAction) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShowLoginPopup(false);
      setPendingAction(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showLoginPopup, pendingAction]);

  const openQuantity = (action: PendingAction) => {
    if (!interactive) return;
    if (!variantId || outOfStock || maxQty <= 0) {
      setMessage({ kind: "error", text: "This item is out of stock." });
      return;
    }
    setMessage(null);
    setQuantity(1);
    setPendingAction(action);
  };

  const confirmAdd = async () => {
    if (!interactive || !pendingAction) return;
    if (!websiteId) {
      setMessage({ kind: "error", text: "Shop is not connected yet." });
      setPendingAction(null);
      return;
    }
    if (!variantId || outOfStock || maxQty <= 0) {
      setMessage({ kind: "error", text: "This item is out of stock." });
      setPendingAction(null);
      return;
    }
    const qty = Math.max(1, Math.min(maxQty, Math.floor(quantity) || 1));
    const action = pendingAction;
    setBusy(action);
    setPendingAction(null);
    setShowLoginPopup(false);
    try {
      await shopAuthApi.addToCart(websiteId, { variantId, quantity: qty });
      if (action === "buy") {
        window.location.href = siteHref(accountPanelHref(accountHref, "cart"));
        return;
      }
      setMessage({ kind: "ok", text: qty === 1 ? "Added to cart." : `Added ${qty} to cart.` });
    } catch (error) {
      const err = error as ShopAuthError;
      if (err?.status === 401 || err?.code === "UNAUTHORIZED") {
        setShowLoginPopup(true);
      } else {
        setMessage({ kind: "error", text: err?.message || "Could not add to cart." });
      }
    } finally {
      setBusy(null);
    }
  };

  const applyTheme = (node: HTMLDivElement | null) => {
    const themeVars = themeStyle(actionsRef.current);
    if (node && themeVars) node.setAttribute("style", themeVars);
  };

  const loginModal =
    showLoginPopup && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={applyTheme}
            className="wb-cart-login-modal is-open"
            data-wb-cart-login-modal=""
            data-variant={loginPromptVariant}
          >
            <button
              type="button"
              className="wb-cart-login-backdrop"
              aria-label="Close login prompt"
              onClick={() => setShowLoginPopup(false)}
            />
            <div className="wb-cart-login-dialog" role="dialog" aria-modal="true" aria-label="Login required">
              <button type="button" className="wb-cart-login-close" aria-label="Close login prompt" onClick={() => setShowLoginPopup(false)}>
                ×
              </button>
              <p className="wb-cart-login-title">Login required</p>
              <p className="wb-cart-login-text">Please log in to add products to your cart.</p>
              <div className="wb-cart-login-actions">
                <button type="button" className="wb-shop-btn is-cart" onClick={() => setShowLoginPopup(false)}>
                  Not now
                </button>
                <a className="wb-shop-btn is-buy" href={loginUrl}>
                  Login
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  const qtyModal =
    pendingAction && typeof document !== "undefined"
      ? createPortal(
          <div ref={applyTheme} className="wb-cart-qty-modal is-open" data-wb-cart-qty-modal="">
            <button
              type="button"
              className="wb-cart-login-backdrop"
              aria-label="Close quantity prompt"
              onClick={() => setPendingAction(null)}
            />
            <div className="wb-cart-login-dialog is-qty" role="dialog" aria-modal="true" aria-label="Choose quantity">
              <button type="button" className="wb-cart-login-close" aria-label="Close quantity prompt" onClick={() => setPendingAction(null)}>
                ×
              </button>
              <p className="wb-cart-login-kicker">{pendingAction === "buy" ? "Buy now" : "Add to cart"}</p>
              <p className="wb-cart-login-title">Choose quantity</p>
              <p className="wb-cart-login-text">Select how many units to {pendingAction === "buy" ? "buy" : "add"}.</p>
              <div className="wb-cart-qty-panel">
                <div className="wb-cart-qty-row">
                  <button
                    type="button"
                    className="wb-cart-qty-step"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  >
                    −
                  </button>
                  <input
                    className="wb-cart-qty-input"
                    type="number"
                    min={1}
                    max={maxQty}
                    value={quantity}
                    aria-label="Quantity"
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (!Number.isFinite(next)) return;
                      setQuantity(Math.max(1, Math.min(maxQty, Math.floor(next))));
                    }}
                  />
                  <button
                    type="button"
                    className="wb-cart-qty-step"
                    aria-label="Increase quantity"
                    disabled={quantity >= maxQty}
                    onClick={() => setQuantity((value) => Math.min(maxQty, value + 1))}
                  >
                    +
                  </button>
                </div>
                <span className="wb-cart-qty-stock">{maxQty} in stock</span>
              </div>
              <div className="wb-cart-login-actions is-stacked">
                <button type="button" className="wb-shop-btn is-buy" onClick={() => void confirmAdd()}>
                  {pendingAction === "buy" ? `Buy ${quantity}` : `Add ${quantity} to cart`}
                </button>
                <button type="button" className="wb-shop-btn is-cart" onClick={() => setPendingAction(null)}>
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
      <div ref={actionsRef} className={`wb-shop-actions${compact ? " is-compact" : ""}`}>
        <div className="wb-shop-action-row">
          <button
            type="button"
            className="wb-shop-btn is-cart"
            data-wb-cart-action="add"
            data-wb-variant-id={variantId || undefined}
            data-wb-stock={String(maxQty)}
            disabled={disabled}
            aria-disabled={!variantId || outOfStock || maxQty <= 0 || undefined}
            onClick={interactive ? () => openQuantity("add") : undefined}
          >
            {busy === "add" ? "Adding…" : "Cart"}
          </button>
          <button
            type="button"
            className="wb-shop-btn is-buy"
            data-wb-cart-action="buy"
            data-wb-variant-id={variantId || undefined}
            data-wb-stock={String(maxQty)}
            disabled={disabled}
            aria-disabled={!variantId || outOfStock || maxQty <= 0 || undefined}
            onClick={interactive ? () => openQuantity("buy") : undefined}
          >
            {busy === "buy" ? "Buying…" : "Buy"}
          </button>
        </div>
        <p
          className={`wb-shop-cart-msg${message ? ` is-${message.kind}` : ""}`}
          data-wb-cart-msg=""
          hidden={!message}
        >
          {message?.text}
        </p>
      </div>
      {loginModal}
      {qtyModal}
    </>
  );
}
