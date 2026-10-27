import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { safeHref } from "../links.ts";
import { SectionShell } from "../primitives.tsx";
import { useStaticRender } from "../render-mode.tsx";
import {
  SHOP_ACCOUNT_SCRIPT,
  shopAuthApi,
  siteHref,
  type ShopAuthError,
  type ShopCustomerAccount,
} from "../shop-auth.ts";
import { formatInr, useShopCatalog } from "../shop-catalog.tsx";
import type { AccountData, AccountVariant, SectionOf } from "../types.ts";

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
  "overview-cards": false,
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
    { id: "o1", number: "1042", status: "paid", totalPaise: 249900, currency: "INR", createdAt: "2026-10-21T10:12:00.000Z" },
    { id: "o2", number: "1038", status: "pending", totalPaise: 89900, currency: "INR", createdAt: "2026-10-04T16:40:00.000Z" },
    { id: "o3", number: "1021", status: "cancelled", totalPaise: 159900, currency: "INR", createdAt: "2026-09-12T08:05:00.000Z" },
  ],
  cartItems: [
    { id: "c1", productId: "p1", productName: "Everyday tee", variantName: "M / Blue", quantity: 2, pricePaise: 99900 },
    { id: "c2", productId: "p2", productName: "Canvas tote", variantName: "Natural", quantity: 1, pricePaise: 59900 },
  ],
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

function StatusBadge({ status }: { status: string }) {
  return <span className={`wb-acct-badge is-${status}`}>{status}</span>;
}

function OrdersPanel({ data, account, shopHref }: { data: AccountData; account: ShopCustomerAccount; shopHref: string }) {
  const empty = data.emptyOrdersText?.trim() || LABELS.emptyOrders;
  return (
    <>
      <ul className="wb-acct-list" data-wb-account-list="orders" hidden={account.orders.length === 0}>
        {account.orders.map((order) => (
          <li key={order.id} className="wb-acct-row">
            <div className="wb-acct-row-main">
              <strong>Order #{order.number}</strong>
              <span className="wb-acct-row-sub">{formatDate(order.createdAt)}</span>
            </div>
            <StatusBadge status={order.status} />
            <strong className="wb-acct-row-amount">{formatInr(order.totalPaise)}</strong>
          </li>
        ))}
      </ul>
      <div className="wb-acct-empty" data-wb-account-empty="orders" hidden={account.orders.length > 0}>
        <p>{empty}</p>
        <a className="wb-acct-link" href={safeHref(shopHref)}>
          Browse the shop
        </a>
      </div>
    </>
  );
}

function CartPanel({ data, account, shopHref }: { data: AccountData; account: ShopCustomerAccount; shopHref: string }) {
  const empty = data.emptyCartText?.trim() || LABELS.emptyCart;
  const total = account.cartItems.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);
  return (
    <>
      <ul className="wb-acct-list" data-wb-account-list="cart" hidden={account.cartItems.length === 0}>
        {account.cartItems.map((item) => (
          <li key={item.id} className="wb-acct-row">
            {item.imageUrl ? <img className="wb-acct-thumb" src={item.imageUrl} alt="" /> : <span className="wb-acct-thumb is-blank" aria-hidden="true" />}
            <div className="wb-acct-row-main">
              <strong>{item.productName}</strong>
              <span className="wb-acct-row-sub">
                {item.variantName ? `${item.variantName} · ` : ""}Qty {item.quantity}
              </span>
            </div>
            <strong className="wb-acct-row-amount">{formatInr(item.pricePaise * item.quantity)}</strong>
          </li>
        ))}
      </ul>
      <div className="wb-acct-cart-total" data-wb-account-cart-total hidden={account.cartItems.length === 0}>
        <span>Subtotal</span>
        <strong data-wb-account-field="cartTotal">{formatInr(total)}</strong>
      </div>
      <div className="wb-acct-empty" data-wb-account-empty="cart" hidden={account.cartItems.length > 0}>
        <p>{empty}</p>
        <a className="wb-acct-link" href={safeHref(shopHref)}>
          Browse the shop
        </a>
      </div>
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
        {message?.text ?? ""}
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
        {message?.text ?? ""}
      </p>
      <div className="wb-acct-actions">
        <button type="submit" className="wb-acct-button" disabled={busy}>
          {busy ? "Saving..." : "Change password"}
        </button>
      </div>
    </form>
  );
}

function Stats({ account }: { account: ShopCustomerAccount }) {
  return (
    <div className="wb-acct-stats">
      <div className="wb-acct-stat">
        <span className="wb-acct-stat-value" data-wb-account-count="orders">
          {account.orders.length}
        </span>
        <span className="wb-acct-stat-label">Orders</span>
      </div>
      <div className="wb-acct-stat">
        <span className="wb-acct-stat-value" data-wb-account-count="cart">
          {account.cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        </span>
        <span className="wb-acct-stat-label">Items in cart</span>
      </div>
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
  const [active, setActive] = useState<Panel>(panels[0] ?? "profile");
  const current = panels.includes(active) ? active : (panels[0] ?? "profile");
  const heading = data.heading?.trim();
  const subheading = data.subheading?.trim();

  async function logout() {
    if (!interactive || !websiteId) return;
    await shopAuthApi.logout(websiteId);
    window.location.href = siteHref(loginHref);
  }

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
          {labelOf(data, panel)}
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
        return <OrdersPanel data={data} account={account} shopHref={shopHref} />;
      case "cart":
        return <CartPanel data={data} account={account} shopHref={shopHref} />;
      case "profile":
        return <ProfilePanel data={data} account={account} websiteId={websiteId} interactive={interactive} />;
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
      {heading && <h2 className="wb-acct-title">{heading}</h2>}
      {subheading && <p className="wb-acct-subtitle">{subheading}</p>}
    </div>
  );

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
      </div>
    );
  }

  if (variant === "overview-cards") {
    return (
      <div className="wb-acct-member">
        <header className="wb-acct-topbar">
          <div>
            {titles}
            <Identity account={account} compact />
          </div>
          {logoutButton}
        </header>
        <Stats account={account} />
        <div className="wb-acct-main wb-acct-grid">{sections}</div>
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

  const classes = ["wb-acct-root", `wb-acct-v-${variant}`, variant === "dark-panel" ? "wb-acct-dark" : ""].filter(Boolean).join(" ");

  if (isStatic) {
    // The published page carries both states; the script shows the right one once the session is known.
    return (
      <SectionShell sectionId={section.id} settings={section.settings} className="wb-account" label={data.heading || "My account"}>
        <div
          className={classes}
          data-wb-account={websiteId ?? ""}
          data-wb-account-login={loginHref}
          data-wb-account-redirect={data.redirectWhenLoggedOut ? "1" : undefined}
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
  return (
    <SectionShell sectionId={section.id} settings={section.settings} className="wb-account" label={data.heading || "My account"}>
      <div className={classes}>
        {preview === "guest" ? (
          <GuestView data={data} loginHref={loginHref} />
        ) : (
          <MemberView data={data} variant={variant} account={SAMPLE} interactive={false} loginHref={loginHref} shopHref={shopHref} />
        )}
      </div>
    </SectionShell>
  );
}
