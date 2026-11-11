export type ShopCustomer = {
  id: string;
  websiteId: string;
  email: string;
  fullName: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
};

export type ShopOrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "failed"
  | "cancelled"
  | "returned";

export type ShopRefundStatus = "none" | "pending" | "processed" | "failed";

export type ShopOrderSummary = {
  id: string;
  number: string;
  status: ShopOrderStatus;
  refundStatus: ShopRefundStatus;
  totalPaise: number;
  currency: "INR";
  createdAt: string;
  refundedAt: string | null;
  canCancel?: boolean;
  canReturn?: boolean;
  returnUntil?: string | null;
  canDownloadInvoice?: boolean;
};

export type ShopOrderTimelineEvent = {
  id: string;
  status: string;
  actorType: string;
  note: string | null;
  createdAt: string;
};

export type ShopOrderShippingAddress = {
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type ShopOrderDetail = ShopOrderSummary & {
  items: {
    id: string;
    productName: string;
    variantName: string;
    unitPricePaise: number;
    quantity: number;
    lineTotalPaise: number;
  }[];
  timeline: ShopOrderTimelineEvent[];
  failureReason: string | null;
  cancelReason: string | null;
  returnReason: string | null;
  shippingAddress?: ShopOrderShippingAddress | null;
  paidAt: string | null;
  /** True when payment was captured and an invoice can be downloaded. */
  canDownloadInvoice?: boolean;
  updatedAt: string;
};

export type ShopCheckoutSession = {
  orderId: string;
  orderNumber: string;
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
  businessName: string;
  prefill: { name: string; email?: string; contact?: string };
};

export type ShopCartItemSummary = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  pricePaise: number;
  imageUrl?: string;
};

export type ShopWishlistItemSummary = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  productSlug: string;
  categoryName: string;
  pricePaise: number;
  imageUrl?: string;
  addedAt: string;
};

export type ShopCustomerAddress = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  email?: string | null;
  updatedAt: string;
};

export type ShopCustomerAddressInput = {
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
  email?: string;
};

export type ShopCustomerAccount = {
  customer: ShopCustomer;
  orders: ShopOrderSummary[];
  cartItems: ShopCartItemSummary[];
  wishlistItems: ShopWishlistItemSummary[];
  addresses: ShopCustomerAddress[];
  cancelUntilStatus?: "paid" | "processing" | "shipped" | null;
};

export type ShopAuthError = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

function apiBase(): string {
  if (typeof window === "undefined") return "/api";
  // Live pages are served by the API host; the editor may call the API origin directly.
  const meta = document.querySelector('meta[name="wb-api"]');
  const content = meta?.getAttribute("content")?.trim();
  if (content) return content.replace(/\/$/, "");
  return "/api";
}

/** Auth endpoints that must never trigger a refresh-and-retry loop. */
const SKIP_SHOP_REFRESH = new Set([
  "/guest/cart",
  "/guest/checkout",
  "/guest/checkout/confirm",
  "/login",
  "/signup",
  "/verify-email",
  "/resend-verification",
  "/refresh",
  "/logout",
  "/forgot-password",
  "/reset-password",
]);

const shopRefreshInFlight = new Map<string, Promise<boolean>>();
let shopLastRefreshAt = 0;

async function refreshShopSession(websiteId: string): Promise<boolean> {
  const existing = shopRefreshInFlight.get(websiteId);
  if (existing) return existing;
  const pending = fetch(`${apiBase()}/shop/${websiteId}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  })
    .then((response) => {
      if (response.ok) shopLastRefreshAt = Date.now();
      return response.ok;
    })
    .catch(() => false)
    .finally(() => {
      shopRefreshInFlight.delete(websiteId);
    });
  shopRefreshInFlight.set(websiteId, pending);
  return pending;
}

async function shopAuthFetch(
  websiteId: string,
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const send = () =>
    fetch(`${apiBase()}/shop/${websiteId}/auth${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });

  const startedAt = Date.now();
  let response = await send();
  if (response.status === 401 && !SKIP_SHOP_REFRESH.has(path.split("?")[0] ?? path)) {
    if (shopLastRefreshAt < startedAt) {
      const refreshed = await refreshShopSession(websiteId);
      if (refreshed) response = await send();
    } else {
      response = await send();
    }
  }
  if (response.status === 204) return { ok: response.ok, status: response.status, body: null };
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

function asError(status: number, body: unknown): ShopAuthError {
  const error = (body as { error?: { code?: string; message?: string; details?: unknown } })?.error;
  return {
    status,
    code: error?.code ?? "UNKNOWN_ERROR",
    message: error?.message ?? `Request failed (${status})`,
    details: error?.details,
  };
}

export const shopAuthApi = {
  signup: async (websiteId: string, input: { email: string; password: string; fullName: string; phone?: string }) => {
    const result = await shopAuthFetch(websiteId, "/signup", { method: "POST", body: JSON.stringify(input) });
    if (!result.ok) throw asError(result.status, result.body);
    return result.body as { email: string; emailSent: boolean; resendAvailableInSeconds: number };
  },

  verifyEmail: async (websiteId: string, email: string, code: string) => {
    const result = await shopAuthFetch(websiteId, "/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { customer: ShopCustomer }).customer;
  },

  resendVerification: async (websiteId: string, email: string) => {
    const result = await shopAuthFetch(websiteId, "/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return result.body as { email: string; emailSent: boolean; resendAvailableInSeconds: number };
  },

  login: async (websiteId: string, input: { email: string; password: string; remember?: boolean }) => {
    const result = await shopAuthFetch(websiteId, "/login", { method: "POST", body: JSON.stringify(input) });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { customer: ShopCustomer }).customer;
  },

  logout: async (websiteId: string) => {
    await shopAuthFetch(websiteId, "/logout", { method: "POST" });
  },

  me: async (websiteId: string) => {
    const result = await shopAuthFetch(websiteId, "/me");
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { customer: ShopCustomer }).customer;
  },

  account: async (websiteId: string) => {
    const result = await shopAuthFetch(websiteId, "/account");
    if (!result.ok) throw asError(result.status, result.body);
    return result.body as ShopCustomerAccount;
  },

  updateProfile: async (websiteId: string, input: { fullName?: string; phone?: string }) => {
    const result = await shopAuthFetch(websiteId, "/profile", { method: "PATCH", body: JSON.stringify(input) });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { customer: ShopCustomer }).customer;
  },

  listAddresses: async (websiteId: string) => {
    const result = await shopAuthFetch(websiteId, "/addresses");
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { addresses: ShopCustomerAddress[] }).addresses;
  },

  createAddress: async (websiteId: string, input: ShopCustomerAddressInput) => {
    const result = await shopAuthFetch(websiteId, "/addresses", { method: "POST", body: JSON.stringify(input) });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { addresses: ShopCustomerAddress[] }).addresses;
  },

  updateAddress: async (websiteId: string, addressId: string, input: ShopCustomerAddressInput) => {
    const result = await shopAuthFetch(websiteId, `/addresses/${addressId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { addresses: ShopCustomerAddress[] }).addresses;
  },

  deleteAddress: async (websiteId: string, addressId: string) => {
    const result = await shopAuthFetch(websiteId, `/addresses/${addressId}`, { method: "DELETE" });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { addresses: ShopCustomerAddress[] }).addresses;
  },

  changePassword: async (websiteId: string, input: { currentPassword: string; newPassword: string }) => {
    const result = await shopAuthFetch(websiteId, "/change-password", { method: "POST", body: JSON.stringify(input) });
    if (!result.ok) throw asError(result.status, result.body);
  },

  forgotPassword: async (websiteId: string, email: string) => {
    const result = await shopAuthFetch(websiteId, "/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!result.ok) throw asError(result.status, result.body);
  },

  resetPassword: async (websiteId: string, token: string, password: string) => {
    const result = await shopAuthFetch(websiteId, "/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { customer: ShopCustomer }).customer;
  },

  listCart: async (websiteId: string) => {
    const result = await shopAuthFetch(websiteId, "/cart");
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { cartItems: ShopCartItemSummary[] }).cartItems;
  },

  addToCart: async (websiteId: string, input: { variantId: string; quantity?: number }) => {
    const result = await shopAuthFetch(websiteId, "/cart", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { cartItems: ShopCartItemSummary[] }).cartItems;
  },

  listGuestCart: async (websiteId: string) => {
    const result = await shopAuthFetch(websiteId, "/guest/cart");
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { cartItems: ShopCartItemSummary[] }).cartItems;
  },

  addGuestCart: async (websiteId: string, input: { variantId: string; quantity?: number }) => {
    const result = await shopAuthFetch(websiteId, "/guest/cart", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { cartItems: ShopCartItemSummary[] }).cartItems;
  },

  updateGuestCartItem: async (websiteId: string, itemId: string, quantity: number) => {
    const result = await shopAuthFetch(websiteId, `/guest/cart/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { cartItems: ShopCartItemSummary[] }).cartItems;
  },

  removeGuestCartItem: async (websiteId: string, itemId: string) => {
    const result = await shopAuthFetch(websiteId, `/guest/cart/${itemId}`, { method: "DELETE" });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { cartItems: ShopCartItemSummary[] }).cartItems;
  },

  startGuestCheckout: async (
    websiteId: string,
    input: {
      email: string;
      fullName: string;
      phone?: string;
      address: ShopCustomerAddressInput;
    },
  ) => {
    const result = await shopAuthFetch(websiteId, "/guest/checkout", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (
      result.body as {
        checkout: ShopCheckoutSession & { trackToken?: string; trackUrl?: string };
      }
    ).checkout;
  },

  confirmGuestCheckout: async (
    websiteId: string,
    input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
  ) => {
    const result = await shopAuthFetch(websiteId, "/guest/checkout/confirm", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (
      result.body as { order: ShopOrderSummary & { trackToken?: string | null; trackUrl?: string | null } }
    ).order;
  },

  trackOrder: async (websiteId: string, token: string) => {
    const result = await shopAuthFetch(websiteId, `/track/${encodeURIComponent(token)}`);
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { order: ShopOrderDetail & { trackUrl?: string } }).order;
  },

  updateCartItem: async (websiteId: string, itemId: string, quantity: number) => {
    const result = await shopAuthFetch(websiteId, `/cart/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { cartItems: ShopCartItemSummary[] }).cartItems;
  },

  removeCartItem: async (websiteId: string, itemId: string) => {
    const result = await shopAuthFetch(websiteId, `/cart/${itemId}`, { method: "DELETE" });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { cartItems: ShopCartItemSummary[] }).cartItems;
  },

  listWishlist: async (websiteId: string) => {
    const result = await shopAuthFetch(websiteId, "/wishlist");
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { wishlistItems: ShopWishlistItemSummary[] }).wishlistItems;
  },

  addToWishlist: async (websiteId: string, variantId: string) => {
    const result = await shopAuthFetch(websiteId, "/wishlist", {
      method: "POST",
      body: JSON.stringify({ variantId }),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { wishlistItems: ShopWishlistItemSummary[] }).wishlistItems;
  },

  removeFromWishlist: async (websiteId: string, variantId: string) => {
    const result = await shopAuthFetch(websiteId, `/wishlist/${variantId}`, { method: "DELETE" });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { wishlistItems: ShopWishlistItemSummary[] }).wishlistItems;
  },

  startCheckout: async (websiteId: string, input: { addressId: string }) => {
    const result = await shopAuthFetch(websiteId, "/checkout", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { checkout: ShopCheckoutSession }).checkout;
  },

  confirmCheckout: async (
    websiteId: string,
    input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
  ) => {
    const result = await shopAuthFetch(websiteId, "/checkout/confirm", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { order: ShopOrderSummary }).order;
  },

  getOrder: async (websiteId: string, orderId: string) => {
    const result = await shopAuthFetch(websiteId, `/orders/${orderId}`);
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { order: ShopOrderDetail }).order;
  },

  /** Opens in a new tab; uses the shop session cookie on a top-level navigation. */
  orderInvoiceHref: (websiteId: string, orderId: string) =>
    `${apiBase()}/shop/${websiteId}/auth/orders/${orderId}/invoice`,

  cancelOrder: async (websiteId: string, orderId: string, reason: string) => {
    const result = await shopAuthFetch(websiteId, `/orders/${orderId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { order: ShopOrderDetail }).order;
  },

  returnOrder: async (websiteId: string, orderId: string, reason: string) => {
    const result = await shopAuthFetch(websiteId, `/orders/${orderId}/return`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    if (!result.ok) throw asError(result.status, result.body);
    return (result.body as { order: ShopOrderDetail }).order;
  },
};

/** A site path as the browser should open it: on the local preview sites live under /live/<subdomain>. */
export function siteHref(href: string): string {
  const raw = (href || "/").trim();
  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(raw)) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (typeof window === "undefined" || path.startsWith("/live/")) return path;
  const match = (window.location.pathname || "/").match(/^\/live\/([^/]+)/);
  return match ? `/live/${match[1]}${path === "/" ? "" : path}` : path;
}

/** Account page URL that opens a specific panel (e.g. cart). */
export function accountPanelHref(
  accountHref: string,
  panel: "orders" | "cart" | "wishlist" | "profile" | "addresses" | "password",
): string {
  const raw = (accountHref || "/account").trim() || "/account";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) {
    try {
      const url = new URL(raw);
      url.searchParams.set("panel", panel);
      return url.toString();
    } catch {
      /* fall through */
    }
  }
  const [pathAndQuery, hash = ""] = raw.split("#");
  const qIndex = pathAndQuery.indexOf("?");
  const path = qIndex >= 0 ? pathAndQuery.slice(0, qIndex) : pathAndQuery;
  const query = qIndex >= 0 ? pathAndQuery.slice(qIndex + 1) : "";
  const params = new URLSearchParams(query);
  params.set("panel", panel);
  const text = params.toString();
  return `${path || "/account"}?${text}${hash ? `#${hash}` : ""}`;
}

export function fullNameFromForm(form: HTMLFormElement): string {
  const full = form.querySelector<HTMLInputElement>('input[name="fullName"]')?.value?.trim();
  if (full) return full;
  const first = form.querySelector<HTMLInputElement>('input[name="firstName"]')?.value?.trim() ?? "";
  const last = form.querySelector<HTMLInputElement>('input[name="lastName"]')?.value?.trim() ?? "";
  const joined = `${first} ${last}`.trim();
  if (joined) return joined;
  const email = form.querySelector<HTMLInputElement>('input[name="email"], input[type="email"]')?.value?.trim() ?? "";
  return email.split("@")[0] || "Customer";
}

/**
 * Plain script for the account section on the published page: asks who is signed in, then shows
 * the member view filled with their data (or the guest prompt), and wires tabs, forms and logout.
 */
export const SHOP_ACCOUNT_SCRIPT = `(function(){
  function apiBase(){
    var meta=document.querySelector('meta[name="wb-api"]');
    var content=meta&&meta.getAttribute("content");
    return content?String(content).replace(/\\/$/,""):"/api";
  }
  function siteHref(href){
    var raw=(href||"/").trim();
    if(/^(https?:\\/\\/|mailto:|tel:|#)/i.test(raw)) return raw;
    var path=raw.charAt(0)==="/"?raw:"/"+raw;
    if(path.indexOf("/live/")===0) return path;
    var match=(window.location.pathname||"/").match(/^\\/live\\/([^/]+)/);
    return match?"/live/"+match[1]+(path==="/"?"":path):path;
  }
  function money(paise){
    try{ return new Intl.NumberFormat("en-IN",{ style:"currency", currency:"INR" }).format(Number(paise||0)/100); }
    catch(_e){ return "Rs "+(Number(paise||0)/100).toFixed(2); }
  }
  function day(iso){
    var d=new Date(iso||"");
    if(isNaN(d.getTime())) return "";
    try{ return d.toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"numeric" }); }catch(_e){ return ""; }
  }
  function initials(name){
    var parts=String(name||"").trim().split(/\\s+/).filter(Boolean);
    return (((parts[0]||"").charAt(0))+((parts[1]||"").charAt(0))).toUpperCase()||"?";
  }
  function el(tag, className, text){
    var node=document.createElement(tag);
    if(className) node.className=className;
    if(text!==undefined) node.textContent=text;
    return node;
  }
  function setText(root, field, value){
    root.querySelectorAll('[data-wb-account-field="'+field+'"]').forEach(function(node){ node.textContent=value; });
  }
  function showState(root, state){
    root.querySelectorAll("[data-wb-account-state]").forEach(function(node){
      node.hidden=node.getAttribute("data-wb-account-state")!==state;
    });
  }
  function message(form, text, ok){
    var node=form.querySelector("[data-wb-account-message]");
    if(!node) return;
    node.hidden=!text;
    node.textContent=text||"";
    node.classList.toggle("is-ok", !!ok);
    node.classList.toggle("is-error", !!text&&!ok);
  }
  var refreshInFlight=null;
  var lastRefreshAt=0;
  var skipRefresh={ "/login":1, "/signup":1, "/verify-email":1, "/resend-verification":1, "/refresh":1, "/logout":1, "/forgot-password":1, "/reset-password":1 };
  function refreshSession(base){
    if(refreshInFlight) return refreshInFlight;
    refreshInFlight=fetch(base+"/refresh", { method:"POST", credentials:"include", cache:"no-store" })
      .then(function(response){ if(response.ok) lastRefreshAt=Date.now(); return response.ok; })
      .catch(function(){ return false; })
      .finally(function(){ refreshInFlight=null; });
    return refreshInFlight;
  }
  function parseResponse(response){
    if(response.status===204) return { ok:true, status:204, json:{} };
    return response.json().catch(function(){ return {}; }).then(function(json){ return { ok:response.ok, status:response.status, json:json }; });
  }
  function request(base, path, method, body){
    var startedAt=Date.now();
    function once(){
      return fetch(base+path, { method:method, headers:body?{ "Content-Type":"application/json" }:{}, credentials:"include", cache:"no-store", body:body?JSON.stringify(body):undefined }).then(parseResponse);
    }
    return once().then(function(result){
      if(result.status!==401 || skipRefresh[path]) return result;
      if(lastRefreshAt>=startedAt) return once();
      return refreshSession(base).then(function(ok){ return ok?once():result; });
    });
  }
  function addressLine(address){
    return [address.line1, address.line2, (address.city||"")+", "+(address.state||"")+" "+(address.postalCode||""), address.country]
      .filter(function(part){ return part && String(part).trim(); })
      .join(", ");
  }
  var addressCache=[];
  var addressCustomer={};
  var wishlistCache=[];
  function fillAddresses(root, addresses, customer){
    addressCache=addresses||[];
    addressCustomer=customer||{};
    var list=root.querySelector('[data-wb-account-list="addresses"]');
    var empty=root.querySelector('[data-wb-account-empty="addresses"]');
    var form=root.querySelector("[data-wb-account-address-form]");
    if(list){
      list.innerHTML="";
      (addresses||[]).forEach(function(address){
        var row=el("li","wb-acct-row wb-acct-address-row");
        row.setAttribute("data-wb-address-id", String(address.id||""));
        var main=el("div","wb-acct-row-main");
        var title=el("strong","", String(address.label||"Address"));
        if(address.isDefault){
          var badge=el("span","wb-acct-badge is-default","Default");
          title.appendChild(document.createTextNode(" "));
          title.appendChild(badge);
        }
        main.appendChild(title);
        main.appendChild(el("span","wb-acct-row-sub", String(address.fullName||"")+" · "+String(address.phone||"")));
        main.appendChild(el("span","wb-acct-row-sub", addressLine(address)));
        row.appendChild(main);
        var actions=el("div","wb-acct-address-actions");
        var edit=el("button","wb-acct-linkish","Edit");
        edit.type="button";
        edit.setAttribute("data-wb-address-edit", String(address.id||""));
        var remove=el("button","wb-acct-cart-remove","Remove");
        remove.type="button";
        remove.setAttribute("data-wb-address-delete", String(address.id||""));
        actions.appendChild(edit);
        actions.appendChild(remove);
        row.appendChild(actions);
        list.appendChild(row);
      });
      list.hidden=(addresses||[]).length===0;
    }
    if(empty) empty.hidden=(addresses||[]).length>0;
    root.querySelectorAll("[data-wb-address-add]").forEach(function(btn){ btn.hidden=false; });
    fillCheckoutAddresses(root, addresses||[]);
    if(form){
      form.hidden=true;
      form.removeAttribute("data-wb-editing-id");
      var idField=form.querySelector("[data-wb-address-id-field]");
      if(idField) idField.value="";
      form.reset();
      var nameInput=form.querySelector('input[name="fullName"]');
      var phoneInput=form.querySelector('input[name="phone"]');
      if(nameInput && customer) nameInput.value=customer.fullName||"";
      if(phoneInput && customer) phoneInput.value=customer.phone||"";
      var countryInput=form.querySelector('input[name="country"]');
      if(countryInput && !countryInput.value) countryInput.value="IN";
      var defaultInput=form.querySelector('input[name="isDefault"]');
      if(defaultInput) defaultInput.checked=(addresses||[]).length===0;
    }
  }
  function fill(root, account){
    var customer=account.customer||{};
    var orders=account.orders||[];
    var cart=account.cartItems||[];
    var wishlist=account.wishlistItems||[];
    var addresses=account.addresses||[];
    setText(root, "fullName", customer.fullName||"");
    setText(root, "email", customer.email||"");
    setText(root, "initials", initials(customer.fullName));
    setText(root, "memberSince", day(customer.createdAt));
    root.querySelectorAll('[data-wb-account-count="orders"]').forEach(function(node){ node.textContent=String(orders.length); });
    var count=0; cart.forEach(function(item){ count+=Number(item.quantity||1); });
    root.querySelectorAll('[data-wb-account-count="cart"]').forEach(function(node){ node.textContent=String(count); });
    root.querySelectorAll('[data-wb-account-count="wishlist"]').forEach(function(node){ node.textContent=String(wishlist.length); });
    root.querySelectorAll('[data-wb-account-profile] input[name="fullName"]').forEach(function(input){ input.value=customer.fullName||""; });
    root.querySelectorAll('[data-wb-account-profile] input[name="phone"]').forEach(function(input){ input.value=customer.phone||""; });
    root.querySelectorAll('input[name="email"]').forEach(function(input){ input.value=customer.email||""; });
    fillAddresses(root, addresses, customer);

    var orderList=root.querySelector('[data-wb-account-list="orders"]');
    var orderEmpty=root.querySelector('[data-wb-account-empty="orders"]');
    if(orderList){
      orderList.innerHTML="";
      orders.forEach(function(order){
        var row=el("li","wb-acct-row is-clickable");
        row.setAttribute("data-wb-order-id", String(order.id||""));
        row.setAttribute("role","button");
        row.tabIndex=0;
        var main=el("div","wb-acct-row-main");
        main.appendChild(el("strong","","Order #"+String(order.number||order.id||"")));
        main.appendChild(el("span","wb-acct-row-sub",day(order.createdAt)));
        row.appendChild(main);
        var status=String(order.status||"pending");
        var statusText=status.charAt(0).toUpperCase()+status.slice(1);
        var badges=el("div","wb-acct-badges");
        badges.appendChild(el("span","wb-acct-badge is-"+status,statusText));
        var refund=String(order.refundStatus||"none");
        if(refund==="pending") badges.appendChild(el("span","wb-acct-badge is-refund-pending","Refund pending"));
        else if(refund==="processed") badges.appendChild(el("span","wb-acct-badge is-refund-processed","Refunded"));
        else if(refund==="failed") badges.appendChild(el("span","wb-acct-badge is-refund-failed","Refund failed"));
        if(order.canCancel){
          var cancelBtn=el("button","wb-acct-row-cancel","Cancel");
          cancelBtn.setAttribute("type","button");
          cancelBtn.setAttribute("data-wb-order-cancel", String(order.id||""));
          badges.appendChild(cancelBtn);
        }
        if(order.canReturn){
          var returnBtn=el("button","wb-acct-row-return","Return");
          returnBtn.setAttribute("type","button");
          returnBtn.setAttribute("data-wb-order-return", String(order.id||""));
          badges.appendChild(returnBtn);
        }
        if(order.canDownloadInvoice){
          var invoiceBtn=el("button","wb-acct-row-invoice","Invoice");
          invoiceBtn.setAttribute("type","button");
          invoiceBtn.setAttribute("data-wb-order-invoice", String(order.id||""));
          badges.appendChild(invoiceBtn);
        }
        row.appendChild(badges);
        row.appendChild(el("strong","wb-acct-row-amount",money(order.totalPaise)));
        orderList.appendChild(row);
      });
      orderList.hidden=orders.length===0;
    }
    if(orderEmpty) orderEmpty.hidden=orders.length>0;

    wishlistCache=wishlist;
    var wishlistList=root.querySelector('[data-wb-account-list="wishlist"]');
    var wishlistEmpty=root.querySelector('[data-wb-account-empty="wishlist"]');
    var wishlistToolbar=root.querySelector("[data-wb-wishlist-toolbar]");
    if(wishlistToolbar) wishlistToolbar.hidden=wishlist.length===0;
    if(wishlistList){
      wishlistList.innerHTML="";
      wishlist.forEach(function(item){
        var row=el("li","wb-acct-row");
        if(item.imageUrl){
          var img=document.createElement("img");
          img.className="wb-acct-thumb"; img.alt=""; img.src=item.imageUrl;
          row.appendChild(img);
        } else {
          row.appendChild(el("span","wb-acct-thumb is-blank"));
        }
        var main=el("div","wb-acct-row-main");
        main.appendChild(el("strong","",String(item.productName||"Item")));
        var subParts=[item.variantName, item.categoryName].filter(Boolean);
        main.appendChild(el("span","wb-acct-row-sub", subParts.length?subParts.join(" · "):"Product"));
        row.appendChild(main);
        row.appendChild(el("strong","wb-acct-row-amount",money(item.pricePaise)));
        var actions=el("div","wb-acct-address-actions");
        var add=el("button","wb-acct-cart-add","Add to cart");
        add.type="button";
        add.setAttribute("data-wb-wishlist-add", String(item.variantId||""));
        var remove=el("button","wb-acct-cart-remove","Remove");
        remove.type="button";
        remove.setAttribute("data-wb-wishlist-remove", String(item.variantId||""));
        actions.appendChild(add);
        actions.appendChild(remove);
        row.appendChild(actions);
        wishlistList.appendChild(row);
      });
      wishlistList.hidden=wishlist.length===0;
    }
    if(wishlistEmpty) wishlistEmpty.hidden=wishlist.length>0;

    var cartList=root.querySelector('[data-wb-account-list="cart"]');
    var cartEmpty=root.querySelector('[data-wb-account-empty="cart"]');
    var cartTotal=root.querySelector("[data-wb-account-cart-total]");
    var total=0;
    if(cartList){
      cartList.innerHTML="";
      cart.forEach(function(item){
        var qty=Number(item.quantity||1);
        var line=Number(item.pricePaise||0)*qty;
        total+=line;
        var row=el("li","wb-acct-row");
        if(item.imageUrl){
          var img=document.createElement("img");
          img.className="wb-acct-thumb"; img.alt=""; img.src=item.imageUrl;
          row.appendChild(img);
        } else {
          row.appendChild(el("span","wb-acct-thumb is-blank"));
        }
        row.setAttribute("data-wb-cart-item", String(item.id||""));
        var main=el("div","wb-acct-row-main");
        main.appendChild(el("strong","",String(item.productName||"Item")));
        main.appendChild(el("span","wb-acct-row-sub",(item.variantName?String(item.variantName)+" · ":"")+"Qty "+qty));
        row.appendChild(main);
        row.appendChild(el("strong","wb-acct-row-amount",money(line)));
        var remove=el("button","wb-acct-cart-remove","Remove");
        remove.type="button";
        remove.setAttribute("data-wb-cart-remove", String(item.id||""));
        remove.setAttribute("data-wb-cart-qty", String(qty));
        remove.setAttribute("data-wb-cart-name", String(item.productName||"Item"));
        remove.setAttribute("data-wb-cart-variant", String(item.variantName||""));
        row.appendChild(remove);
        cartList.appendChild(row);
      });
      cartList.hidden=cart.length===0;
    }
    if(cartTotal) cartTotal.hidden=cart.length===0;
    setText(root, "cartTotal", money(total));
    if(cartEmpty) cartEmpty.hidden=cart.length>0;
    root.querySelectorAll("[data-wb-account-checkout]").forEach(function(node){ node.hidden=cart.length===0; });
    fillCheckoutAddresses(root, addressCache);
  }
  function ensureCheckoutAddressShell(root){
    var checkout=root.querySelector("[data-wb-account-checkout]");
    if(!checkout) return null;
    var shell=checkout.querySelector("[data-wb-account-checkout-address]");
    if(shell) return shell;
    shell=el("div","wb-acct-checkout-address");
    shell.setAttribute("data-wb-account-checkout-address","");
    shell.appendChild(el("p","wb-acct-checkout-label","Delivery address"));
    var empty=el("div","wb-acct-checkout-empty");
    empty.setAttribute("data-wb-account-checkout-no-address","");
    empty.appendChild(el("p","","Add a delivery address before you pay."));
    var addBtn=el("button","wb-acct-linkish","Add address");
    addBtn.type="button";
    addBtn.setAttribute("data-wb-account-go-addresses","");
    empty.appendChild(addBtn);
    shell.appendChild(empty);
    var list=el("ul","wb-acct-checkout-address-list");
    list.setAttribute("data-wb-account-checkout-address-list","");
    shell.appendChild(list);
    var manage=el("button","wb-acct-linkish","Manage addresses");
    manage.type="button";
    manage.setAttribute("data-wb-account-go-addresses","");
    shell.appendChild(manage);
    var pay=checkout.querySelector("[data-wb-account-pay]");
    if(pay) checkout.insertBefore(shell, pay);
    else checkout.insertBefore(shell, checkout.firstChild);
    return shell;
  }
  function fillCheckoutAddresses(root, addresses){
    var shell=ensureCheckoutAddressShell(root);
    var list=root.querySelector("[data-wb-account-checkout-address-list]");
    // Older SSR only rendered the empty state; create the list node so we can fill it.
    if(!list && shell){
      list=el("ul","wb-acct-checkout-address-list");
      list.setAttribute("data-wb-account-checkout-address-list","");
      var emptyNode=shell.querySelector("[data-wb-account-checkout-no-address]");
      if(emptyNode&&emptyNode.nextSibling) shell.insertBefore(list, emptyNode.nextSibling);
      else shell.appendChild(list);
    }
    var empty=root.querySelector("[data-wb-account-checkout-no-address]");
    if(!empty && shell){
      empty=el("div","wb-acct-checkout-empty");
      empty.setAttribute("data-wb-account-checkout-no-address","");
      empty.appendChild(el("p","","Add a delivery address before you pay."));
      var addBtn=el("button","wb-acct-linkish","Add address");
      addBtn.type="button";
      addBtn.setAttribute("data-wb-account-go-addresses","");
      empty.appendChild(addBtn);
      var label=shell.querySelector(".wb-acct-checkout-label");
      if(label&&label.nextSibling) shell.insertBefore(empty, label.nextSibling);
      else shell.insertBefore(empty, shell.firstChild);
    }
    var selected=(root.querySelector('input[name="checkoutAddress"]:checked')||{}).value||"";
    if(list){
      list.innerHTML="";
      var preferred="";
      (addresses||[]).forEach(function(address){
        var id=String(address.id||"");
        if(!preferred) preferred=id;
        if(address.isDefault) preferred=id;
      });
      if(!selected || !(addresses||[]).some(function(address){ return String(address.id)===selected; })) selected=preferred;
      (addresses||[]).forEach(function(address){
        var id=String(address.id||"");
        var item=el("li");
        var label=el("label","wb-acct-checkout-option"+(id===selected?" is-selected":""));
        var input=document.createElement("input");
        input.type="radio";
        input.name="checkoutAddress";
        input.value=id;
        input.setAttribute("data-wb-checkout-address", id);
        if(id===selected) input.checked=true;
        input.addEventListener("change", function(){
          list.querySelectorAll(".wb-acct-checkout-option").forEach(function(node){ node.classList.remove("is-selected"); });
          label.classList.add("is-selected");
          syncCheckoutPay(root);
        });
        var body=el("span","wb-acct-checkout-option-body");
        var title=el("strong","", String(address.label||"Address"));
        if(address.isDefault){
          var badge=el("span","wb-acct-badge is-default","Default");
          title.appendChild(document.createTextNode(" "));
          title.appendChild(badge);
        }
        body.appendChild(title);
        body.appendChild(el("span","", String(address.fullName||"")+" · "+String(address.phone||"")));
        body.appendChild(el("span","", addressLine(address)));
        label.appendChild(input);
        label.appendChild(body);
        item.appendChild(label);
        list.appendChild(item);
      });
      if((addresses||[]).length===0) list.setAttribute("hidden","");
      else list.removeAttribute("hidden");
    }
    if(empty){
      if((addresses||[]).length>0) empty.setAttribute("hidden","");
      else empty.removeAttribute("hidden");
    }
    root.querySelectorAll("[data-wb-account-checkout-address] > [data-wb-account-go-addresses]").forEach(function(btn){
      if((btn.textContent||"").indexOf("Manage")>=0){
        if((addresses||[]).length===0) btn.setAttribute("hidden","");
        else btn.removeAttribute("hidden");
      }
    });
    syncCheckoutPay(root);
  }
  function selectedCheckoutAddressId(root){
    var checked=root.querySelector('input[name="checkoutAddress"]:checked');
    return checked?String(checked.value||""):"";
  }
  function syncCheckoutPay(root){
    var cartEmpty=!(root.querySelector('[data-wb-account-list="cart"] li'));
    var hasAddress=!!selectedCheckoutAddressId(root);
    root.querySelectorAll("[data-wb-account-pay]").forEach(function(btn){
      btn.disabled=cartEmpty || !hasAddress;
      if(!btn.getAttribute("data-wb-pay-label")) btn.setAttribute("data-wb-pay-label", btn.textContent||"Pay now");
      if(!root.getAttribute("data-wb-paying")) btn.textContent=btn.getAttribute("data-wb-pay-label")||"Pay now";
    });
  }
  function preferredPanel(root){
    try{
      var params=new URLSearchParams(window.location.search||"");
      var name=(params.get("panel")||(window.location.hash||"").replace(/^#/,"")||"").trim();
      if(!name) return null;
      var tab=root.querySelector('[data-wb-account-tab="'+name+'"]');
      return tab?name:null;
    }catch(_e){ return null; }
  }
  function syncPanelUrl(name){
    try{
      if(!name) return;
      var url=new URL(window.location.href);
      if(url.searchParams.get("panel")===name) return;
      url.searchParams.set("panel", name);
      window.history.replaceState({}, "", url.pathname+url.search+url.hash);
    }catch(_e){}
  }
  function activatePanel(root, tabs, name, opts){
    if(!name) return;
    tabs.forEach(function(other){
      var on=other.getAttribute("data-wb-account-tab")===name;
      other.classList.toggle("is-active", on);
      other.setAttribute("aria-selected", on?"true":"false");
    });
    root.querySelectorAll("[data-wb-account-stat]").forEach(function(stat){
      var on=stat.getAttribute("data-wb-account-stat")===name;
      stat.classList.toggle("is-active", on);
      if(stat.hasAttribute("aria-pressed")) stat.setAttribute("aria-pressed", on?"true":"false");
    });
    root.querySelectorAll("[data-wb-account-panel]").forEach(function(panel){
      panel.hidden=panel.getAttribute("data-wb-account-panel")!==name;
    });
    if(!(opts&&opts.skipUrl)) syncPanelUrl(name);
  }
  function bind(root, base, loginHref, logoutHref){
    if(root.getAttribute("data-wb-account-bound")) return;
    root.setAttribute("data-wb-account-bound","1");
    var tabs=Array.prototype.slice.call(root.querySelectorAll("[data-wb-account-tab]"));
    tabs.forEach(function(tab){
      tab.addEventListener("click", function(){
        var name=tab.getAttribute("data-wb-account-tab");
        activatePanel(root, tabs, name);
      });
    });
    root.querySelectorAll("[data-wb-account-stat]").forEach(function(stat){
      stat.addEventListener("click", function(){
        var name=stat.getAttribute("data-wb-account-stat");
        if(!name) return;
        if(root.querySelector('[data-wb-account-tab="'+name+'"], [data-wb-account-panel="'+name+'"]')){
          activatePanel(root, tabs, name);
        }
      });
    });
    var initial=preferredPanel(root);
    if(initial) activatePanel(root, tabs, initial, { skipUrl:true });
    window.addEventListener("popstate", function(){
      var next=preferredPanel(root);
      if(next) activatePanel(root, tabs, next, { skipUrl:true });
    });
    root.querySelectorAll("[data-wb-account-logout]").forEach(function(button){
      button.addEventListener("click", function(){
        request(base, "/logout", "POST").catch(function(){}).then(function(){ window.location.href=siteHref(logoutHref); });
      });
    });
    function refreshAccount(){
      return request(base, "/account", "GET").then(function(refresh){
        if(refresh.ok) fill(root, refresh.json||{});
      });
    }
    function removeQtyModal(){
      var modal=document.querySelector("body > [data-wb-cart-remove-modal]");
      if(modal) return modal;
      modal=document.createElement("div");
      var site=root.closest(".wb-site");
      if(site&&site.getAttribute("style")) modal.setAttribute("style", site.getAttribute("style"));
      modal.className="wb-cart-qty-modal";
      modal.setAttribute("data-wb-cart-remove-modal","");
      modal.hidden=true;
      modal.innerHTML=
        '<button type="button" class="wb-cart-login-backdrop" aria-label="Close remove prompt"></button>'+
        '<div class="wb-cart-login-dialog is-qty" role="dialog" aria-modal="true" aria-label="Remove from cart">'+
          '<button type="button" class="wb-cart-login-close" aria-label="Close remove prompt">×</button>'+
          '<p class="wb-cart-login-kicker">Remove from cart</p>'+
          '<p class="wb-cart-login-title" data-wb-remove-title>Item</p>'+
          '<p class="wb-cart-login-text" data-wb-remove-text>How many should we remove?</p>'+
          '<div class="wb-cart-qty-panel">'+
            '<div class="wb-cart-qty-row">'+
              '<button type="button" class="wb-cart-qty-step" data-wb-qty-dec aria-label="Decrease quantity">−</button>'+
              '<input class="wb-cart-qty-input" type="number" min="1" value="1" data-wb-qty-input aria-label="Quantity to remove" />'+
              '<button type="button" class="wb-cart-qty-step" data-wb-qty-inc aria-label="Increase quantity">+</button>'+
            "</div>"+
            '<span class="wb-cart-qty-stock" data-wb-remove-stock></span>'+
          "</div>"+
          '<div class="wb-cart-login-actions is-stacked">'+
            '<button type="button" class="wb-shop-btn is-buy" data-wb-qty-confirm>Remove</button>'+
            '<button type="button" class="wb-shop-btn is-cart" data-wb-qty-cancel>Cancel</button>'+
          "</div>"+
        "</div>";
      modal.querySelectorAll(".wb-cart-login-backdrop,.wb-cart-login-close,[data-wb-qty-cancel]").forEach(function(btn){
        btn.addEventListener("click", function(){
          modal.classList.remove("is-open");
          modal.hidden=true;
        });
      });
      document.body.appendChild(modal);
      return modal;
    }
    function applyCartRemoval(itemId, currentQty, removeCount, button){
      var qty=Math.max(1, Math.min(currentQty, Math.floor(removeCount)||1));
      button.disabled=true;
      button.textContent="Removing…";
      var action=qty>=currentQty
        ? request(base, "/cart/"+itemId, "DELETE")
        : request(base, "/cart/"+itemId, "PATCH", { quantity: currentQty-qty });
      action.then(function(result){
        if(!result.ok){
          button.disabled=false;
          button.textContent="Remove";
          return;
        }
        return refreshAccount().catch(function(){
          button.disabled=false;
          button.textContent="Remove";
        });
      }).catch(function(){
        button.disabled=false;
        button.textContent="Remove";
      });
    }
    function setWishlistBusy(on){
      root.querySelectorAll("[data-wb-wishlist-add], [data-wb-wishlist-remove], [data-wb-wishlist-add-all]").forEach(function(node){
        node.disabled=!!on;
      });
    }
    function addWishlistVariant(variantId){
      return request(base, "/cart", "POST", { variantId:variantId, quantity:1 });
    }
    root.addEventListener("click", function(event){
      var wishAddAll=event.target&&event.target.closest&&event.target.closest("[data-wb-wishlist-add-all]");
      if(wishAddAll && root.contains(wishAddAll)){
        event.preventDefault();
        if(wishAddAll.disabled || !wishlistCache.length) return;
        setWishlistBusy(true);
        wishAddAll.textContent="Adding…";
        var chain=Promise.resolve();
        wishlistCache.forEach(function(item){
          var variantId=String(item.variantId||"");
          if(!variantId) return;
          chain=chain.then(function(){
            return addWishlistVariant(variantId).catch(function(){});
          });
        });
        chain.then(function(){
          return refreshAccount();
        }).finally(function(){
          setWishlistBusy(false);
          wishAddAll.textContent="Add all to cart";
        });
        return;
      }
      var wishAdd=event.target&&event.target.closest&&event.target.closest("[data-wb-wishlist-add]");
      if(wishAdd && root.contains(wishAdd)){
        event.preventDefault();
        var addVariantId=wishAdd.getAttribute("data-wb-wishlist-add")||"";
        if(!addVariantId || wishAdd.disabled) return;
        setWishlistBusy(true);
        wishAdd.textContent="Adding…";
        addWishlistVariant(addVariantId).then(function(result){
          if(!result.ok){
            setWishlistBusy(false);
            wishAdd.textContent="Add to cart";
            return;
          }
          return refreshAccount().finally(function(){
            setWishlistBusy(false);
            wishAdd.textContent="Add to cart";
          });
        }).catch(function(){
          setWishlistBusy(false);
          wishAdd.textContent="Add to cart";
        });
        return;
      }
      var wishRemove=event.target&&event.target.closest&&event.target.closest("[data-wb-wishlist-remove]");
      if(wishRemove && root.contains(wishRemove)){
        event.preventDefault();
        var variantId=wishRemove.getAttribute("data-wb-wishlist-remove")||"";
        if(!variantId || wishRemove.disabled) return;
        setWishlistBusy(true);
        wishRemove.textContent="Removing…";
        request(base, "/wishlist/"+variantId, "DELETE").then(function(result){
          if(!result.ok){
            setWishlistBusy(false);
            wishRemove.textContent="Remove";
            return;
          }
          return refreshAccount().finally(function(){
            setWishlistBusy(false);
            wishRemove.textContent="Remove";
          });
        }).catch(function(){
          setWishlistBusy(false);
          wishRemove.textContent="Remove";
        });
        return;
      }
      var button=event.target&&event.target.closest&&event.target.closest("[data-wb-cart-remove]");
      if(!button || !root.contains(button)) return;
      event.preventDefault();
      var itemId=button.getAttribute("data-wb-cart-remove")||"";
      var currentQty=Math.max(1, Math.floor(Number(button.getAttribute("data-wb-cart-qty")||1)));
      if(!itemId || button.disabled) return;
      if(currentQty<=1){
        applyCartRemoval(itemId, currentQty, 1, button);
        return;
      }
      var modal=removeQtyModal();
      var input=modal.querySelector("[data-wb-qty-input]");
      var title=modal.querySelector("[data-wb-remove-title]");
      var text=modal.querySelector("[data-wb-remove-text]");
      var stock=modal.querySelector("[data-wb-remove-stock]");
      var confirm=modal.querySelector("[data-wb-qty-confirm]");
      var dec=modal.querySelector("[data-wb-qty-dec]");
      var inc=modal.querySelector("[data-wb-qty-inc]");
      var variant=button.getAttribute("data-wb-cart-variant")||"";
      if(title) title.textContent=button.getAttribute("data-wb-cart-name")||"Item";
      if(text) text.textContent=(variant?variant+". ":"")+"How many should we remove?";
      if(stock) stock.textContent=currentQty+" in cart";
      if(input){ input.min="1"; input.max=String(currentQty); input.value="1"; }
      function clamp(){
        if(!input) return 1;
        var value=Math.max(1, Math.min(currentQty, Math.floor(Number(input.value)||1)));
        input.value=String(value);
        if(dec) dec.disabled=value<=1;
        if(inc) inc.disabled=value>=currentQty;
        if(confirm) confirm.textContent=value>=currentQty?"Remove all":("Remove "+value);
        return value;
      }
      clamp();
      if(dec) dec.onclick=function(){ if(input) input.value=String(Math.max(1, Number(input.value)-1)); clamp(); };
      if(inc) inc.onclick=function(){ if(input) input.value=String(Math.min(currentQty, Number(input.value)+1)); clamp(); };
      if(input) input.oninput=clamp;
      if(confirm) confirm.onclick=function(){
        var qty=clamp();
        modal.classList.remove("is-open");
        modal.hidden=true;
        applyCartRemoval(itemId, currentQty, qty, button);
      };
      modal.hidden=false;
      modal.classList.add("is-open");
    });
    function payMessage(text, ok){
      root.querySelectorAll("[data-wb-account-pay-message]").forEach(function(node){
        node.textContent=text||"";
        node.hidden=!text;
        node.classList.toggle("is-ok", !!ok);
        node.classList.toggle("is-error", !ok && !!text);
      });
    }
    function loadRazorpay(){
      if(window.Razorpay) return Promise.resolve();
      if(window.__wbRazorpayLoading) return window.__wbRazorpayLoading;
      window.__wbRazorpayLoading=new Promise(function(resolve, reject){
        var script=document.createElement("script");
        script.src="https://checkout.razorpay.com/v1/checkout.js";
        script.async=true;
        script.onload=function(){ resolve(); };
        script.onerror=function(){ window.__wbRazorpayLoading=null; script.remove(); reject(new Error("Couldn't load Razorpay.")); };
        document.body.appendChild(script);
      });
      return window.__wbRazorpayLoading;
    }
    function openRazorpay(checkout){
      return loadRazorpay().then(function(){
        return new Promise(function(resolve, reject){
          if(!window.Razorpay){ reject(new Error("Couldn't load Razorpay.")); return; }
          var lastFailure=null;
          var instance=new window.Razorpay({
            key: checkout.keyId,
            order_id: checkout.razorpayOrderId,
            amount: checkout.amountPaise,
            currency: checkout.currency,
            name: checkout.businessName,
            description: "Order #"+String(checkout.orderNumber||""),
            prefill: checkout.prefill||{},
            theme: { color: "#4f46e5" },
            handler: function(response){
              resolve({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
            },
            modal: { ondismiss: function(){ reject(lastFailure?new Error(lastFailure):new Error("Payment cancelled.")); } }
          });
          instance.on("payment.failed", function(response){
            lastFailure=(response&&response.error&&response.error.description)||"The payment failed. Please try again.";
          });
          instance.open();
        });
      });
    }
    function setPayBusy(busy){
      root.querySelectorAll("[data-wb-account-pay]").forEach(function(btn){
        btn.disabled=!!busy;
        if(!btn.getAttribute("data-wb-pay-label")) btn.setAttribute("data-wb-pay-label", btn.textContent||"Pay now");
        btn.textContent=busy?"Opening payment…":(btn.getAttribute("data-wb-pay-label")||"Pay now");
      });
    }
    function payNow(){
      if(root.getAttribute("data-wb-paying")) return;
      var addressId=selectedCheckoutAddressId(root);
      if(!addressId){
        payMessage("Choose a delivery address before paying.", false);
        return;
      }
      root.setAttribute("data-wb-paying","1");
      setPayBusy(true);
      payMessage("", true);
      request(base, "/checkout", "POST", { addressId: addressId }).then(function(result){
        if(!result.ok){
          setPayBusy(false);
          root.removeAttribute("data-wb-paying");
          payMessage((result.json&&result.json.error&&result.json.error.message)||"Could not start checkout.", false);
          return;
        }
        var checkout=(result.json&&result.json.checkout)||{};
        return openRazorpay(checkout).then(function(confirmation){
          return request(base, "/checkout/confirm", "POST", confirmation).then(function(confirmResult){
            setPayBusy(false);
            root.removeAttribute("data-wb-paying");
            if(!confirmResult.ok){
              payMessage((confirmResult.json&&confirmResult.json.error&&confirmResult.json.error.message)||"Payment received but order confirmation failed. Refresh in a moment.", false);
              return;
            }
            payMessage("Payment successful. Your order is confirmed.", true);
            var paidOrder=(confirmResult.json&&confirmResult.json.order)||{};
            return refreshAccount().then(function(){
              showSuccessModal(root, base, paidOrder);
            });
          });
        }).catch(function(err){
          setPayBusy(false);
          root.removeAttribute("data-wb-paying");
          payMessage((err&&err.message)||"Payment cancelled.", false);
        });
      }).catch(function(){
        setPayBusy(false);
        root.removeAttribute("data-wb-paying");
        payMessage("Can't reach the server. Try again.", false);
      });
    }
    root.querySelectorAll("[data-wb-account-pay]").forEach(function(button){
      button.addEventListener("click", function(event){
        event.preventDefault();
        payNow();
      });
    });
    root.addEventListener("click", function(event){
      var button=event.target&&event.target.closest&&event.target.closest("[data-wb-account-go-addresses]");
      if(!button || !root.contains(button)) return;
      event.preventDefault();
      if(tabs.length){
        activatePanel(root, tabs, "addresses");
        return;
      }
      var stat=root.querySelector('[data-wb-account-stat="addresses"]');
      if(stat) stat.click();
    });
    function trackingSteps(status){
      var steps=[
        { key:"paid", label:"Order received" },
        { key:"processing", label:"Processing" },
        { key:"shipped", label:"Shipped" },
        { key:"delivered", label:"Delivered" }
      ];
      if(status==="returned") steps.push({ key:"returned", label:"Returned" });
      if(status==="cancelled") steps.push({ key:"cancelled", label:"Cancelled" });
      if(status==="failed") steps.push({ key:"failed", label:"Failed" });
      return steps;
    }
    function maxFulfillmentReached(timeline){
      var keys=["paid","processing","shipped","delivered"];
      var max=-1;
      (timeline||[]).forEach(function(event){
        var index=keys.indexOf(String(event.status||""));
        if(index>max) max=index;
      });
      return max;
    }
    function timelineHit(timeline, key){
      for(var i=(timeline||[]).length-1;i>=0;i--){ if(timeline[i].status===key) return timeline[i]; }
      return null;
    }
    function trackingStepClass(index, step, status, timeline){
      var steps=trackingSteps(status);
      var statusIndex=-1;
      for(var i=0;i<steps.length;i++){ if(steps[i].key===status){ statusIndex=i; break; } }
      var reached=maxFulfillmentReached(timeline);
      var current=statusIndex>=0?statusIndex:Math.max(reached,-1);
      var terminal=status==="returned"||status==="cancelled"||status==="failed";
      var done=terminal
        ? (index<current && (index<=reached || !!timelineHit(timeline, step.key)))
        : index<current;
      var isCurrent=index===current && current>=0;
      return (done?" is-done":"")+(isCurrent?" is-current":"");
    }
    function timelineHtml(order, variant){
      var status=String(order.status||"pending");
      var steps=trackingSteps(status);
      var timeline=order.timeline||[];
      if(variant==="steps"){
        return '<div class="wb-acct-steps">'+steps.map(function(step, index){
          return '<div class="wb-acct-step'+trackingStepClass(index, step, status, timeline)+'">'+step.label+"</div>";
        }).join("")+"</div>";
      }
      return '<ol class="wb-acct-timeline'+(variant==="compact"?" wb-acct-order-compact":"")+'">'+steps.map(function(step, index){
        var hit=timelineHit(timeline, step.key);
        return '<li class="wb-acct-timeline-step'+trackingStepClass(index, step, status, timeline)+'"><span class="wb-acct-timeline-dot" aria-hidden="true"></span><div>'+
          '<span class="wb-acct-timeline-label">'+step.label+"</span>"+
          (hit&&hit.createdAt?'<span class="wb-acct-timeline-time">'+day(hit.createdAt)+"</span>":"")+
          (hit&&hit.note?'<span class="wb-acct-timeline-note">'+String(hit.note)+"</span>":"")+
          "</div></li>";
      }).join("")+"</ol>";
    }
    function themeModal(modal, fromRoot){
      var site=(fromRoot&&fromRoot.closest&&fromRoot.closest(".wb-site"))||document.querySelector(".wb-site");
      var styleText=site&&site.getAttribute("style");
      if(styleText) modal.setAttribute("style", styleText);
      var cs=site?window.getComputedStyle(site):null;
      var bg=(cs&&cs.getPropertyValue("--wb-bg").trim())||"#ffffff";
      var fg=(cs&&cs.getPropertyValue("--wb-text").trim())||"#1a1d23";
      var dialog=modal.querySelector(".wb-acct-order-dialog, .wb-acct-success-dialog");
      if(dialog){
        dialog.style.setProperty("background-color", bg, "important");
        dialog.style.setProperty("color", fg, "important");
      }
    }
    function openOrderDetail(orderId, opts){
      if(!orderId) return;
      var startCancel=!!(opts&&opts.startCancel);
      var startReturn=!!(opts&&opts.startReturn);
      request(base, "/orders/"+orderId, "GET").then(function(result){
        if(!result.ok) return;
        var order=(result.json&&result.json.order)||{};
        var variant=root.getAttribute("data-wb-order-detail-variant")||"timeline";
        var existing=document.querySelector("body > [data-wb-account-order-modal]");
        if(existing) existing.remove();
        var modal=document.createElement("div");
        modal.className="wb-acct-order-modal";
        modal.setAttribute("data-wb-account-order-modal","");
        var items=(order.items||[]).map(function(item){
          return '<div class="wb-acct-order-item"><div><strong>'+String(item.productName||"Item")+"</strong><span> · "+String(item.variantName||"")+" · Qty "+String(item.quantity||1)+'</span></div><strong>'+money(item.lineTotalPaise)+"</strong></div>";
        }).join("");
        var status=String(order.status||"pending");
        var badgesHtml='<div class="wb-acct-badges"><span class="wb-acct-badge is-'+status+'">'+status+"</span>";
        var refund=String(order.refundStatus||"none");
        if(refund==="pending") badgesHtml+='<span class="wb-acct-badge is-refund-pending">Refund pending</span>';
        else if(refund==="processed") badgesHtml+='<span class="wb-acct-badge is-refund-processed">Refunded</span>';
        else if(refund==="failed") badgesHtml+='<span class="wb-acct-badge is-refund-failed">Refund failed</span>';
        badgesHtml+="</div>";
        var invoiceBlock="";
        if(order.canDownloadInvoice || order.paidAt){
          invoiceBlock='<div class="wb-acct-invoice-actions"><a class="wb-acct-invoice-download" href="'+base+"/orders/"+encodeURIComponent(String(order.id||""))+'/invoice" target="_blank" rel="noreferrer">Download invoice</a></div>';
        }
        var cancelBlock="";
        if(order.canCancel){
          cancelBlock=
            '<div class="wb-acct-cancel" data-wb-cancel-box>'+
              '<button type="button" class="wb-acct-cancel-open" data-wb-cancel-open'+(startCancel?" hidden":"")+'>Cancel this order</button>'+
              '<form class="wb-acct-cancel-form" data-wb-cancel-form'+(startCancel?"":" hidden")+'>'+
                '<p class="wb-acct-cancel-title">Cancel order</p>'+
                '<label class="wb-acct-cancel-label">Reason'+
                  '<textarea name="reason" rows="2" maxlength="500" required placeholder="e.g. Ordered by mistake" class="wb-acct-cancel-reason"></textarea>'+
                "</label>"+
                '<p class="wb-acct-cancel-hint">Paid orders are refunded automatically.</p>'+
                '<p class="wb-acct-form-msg" data-wb-cancel-msg hidden></p>'+
                '<div class="wb-acct-cancel-actions">'+
                  '<button type="button" class="wb-acct-cancel-keep" data-wb-cancel-back>Keep order</button>'+
                  '<button type="submit" class="wb-acct-cancel-confirm" data-wb-cancel-submit>Confirm</button>'+
                "</div>"+
              "</form>"+
            "</div>";
        } else if(order.cancelReason){
          cancelBlock='<p class="wb-acct-cancel-reason-view"><strong>Cancel reason:</strong> '+String(order.cancelReason)+"</p>";
        }
        var returnUntilHint="";
        if(order.returnUntil){
          try{ returnUntilHint="Return by "+day(order.returnUntil)+". "; }catch(_e){}
        }
        var returnBlock="";
        if(order.canReturn){
          returnBlock=
            '<div class="wb-acct-return" data-wb-return-box>'+
              '<button type="button" class="wb-acct-return-open" data-wb-return-open'+(startReturn?" hidden":"")+'>Return this order</button>'+
              '<form class="wb-acct-return-form" data-wb-return-form'+(startReturn?"":" hidden")+'>'+
                '<p class="wb-acct-return-title">Return order</p>'+
                '<label class="wb-acct-return-label">Reason'+
                  '<textarea name="reason" rows="2" maxlength="500" required placeholder="e.g. Wrong size / damaged" class="wb-acct-return-reason"></textarea>'+
                "</label>"+
                '<p class="wb-acct-return-hint">'+returnUntilHint+"Paid orders are refunded automatically.</p>"+
                '<p class="wb-acct-form-msg" data-wb-return-msg hidden></p>'+
                '<div class="wb-acct-return-actions">'+
                  '<button type="button" class="wb-acct-return-keep" data-wb-return-back>Keep order</button>'+
                  '<button type="submit" class="wb-acct-return-confirm" data-wb-return-submit>Confirm return</button>'+
                "</div>"+
              "</form>"+
            "</div>";
        } else if(order.returnReason){
          returnBlock='<p class="wb-acct-return-reason-view"><strong>Return reason:</strong> '+String(order.returnReason)+"</p>";
        }
        modal.innerHTML=
          '<button type="button" class="wb-acct-order-backdrop" aria-label="Close order"></button>'+
          '<div class="wb-acct-order-dialog is-'+variant+'" role="dialog" aria-modal="true">'+
            '<div class="wb-acct-order-head"><div><h3 class="wb-acct-success-title">Order #'+String(order.number||"")+'</h3>'+
            '<p class="wb-acct-success-text">Placed '+day(order.createdAt)+"</p></div>"+
            '<button type="button" class="wb-acct-order-close" aria-label="Close">×</button></div>'+
            badgesHtml+
            invoiceBlock+
            '<div class="wb-acct-order-items">'+items+"</div>"+
            '<p class="wb-acct-success-meta"><strong>Total '+money(order.totalPaise)+"</strong></p>"+
            cancelBlock+
            returnBlock+
            '<div class="wb-acct-order-tracking" data-wb-order-tracking'+(startCancel||startReturn?" hidden":"")+'>'+
              '<h4 class="wb-acct-panel-title" style="margin-top:18px">Tracking</h4>'+
              timelineHtml(order, variant)+
            "</div>"+
          "</div>";
        themeModal(modal, root);
        function close(){ modal.remove(); }
        modal.querySelectorAll(".wb-acct-order-backdrop,.wb-acct-order-close").forEach(function(btn){ btn.addEventListener("click", close); });
        var openBtn=modal.querySelector("[data-wb-cancel-open]");
        var form=modal.querySelector("[data-wb-cancel-form]");
        var backBtn=modal.querySelector("[data-wb-cancel-back]");
        var msgEl=modal.querySelector("[data-wb-cancel-msg]");
        var returnOpenBtn=modal.querySelector("[data-wb-return-open]");
        var returnForm=modal.querySelector("[data-wb-return-form]");
        var returnBackBtn=modal.querySelector("[data-wb-return-back]");
        var returnMsgEl=modal.querySelector("[data-wb-return-msg]");
        var tracking=modal.querySelector("[data-wb-order-tracking]");
        if(openBtn&&form){
          openBtn.addEventListener("click", function(){
            openBtn.hidden=true;
            form.hidden=false;
            if(returnOpenBtn) returnOpenBtn.hidden=true;
            if(returnForm) returnForm.hidden=true;
            if(tracking) tracking.hidden=true;
            var area=form.querySelector("textarea");
            if(area) area.focus();
          });
          if(startCancel){
            var area=form.querySelector("textarea");
            if(area) setTimeout(function(){ area.focus(); }, 40);
          }
        }
        if(backBtn&&form&&openBtn){
          backBtn.addEventListener("click", function(){
            form.hidden=true;
            openBtn.hidden=false;
            if(returnOpenBtn) returnOpenBtn.hidden=false;
            if(tracking) tracking.hidden=false;
            if(msgEl){ msgEl.hidden=true; msgEl.textContent=""; }
          });
        }
        if(returnOpenBtn&&returnForm){
          returnOpenBtn.addEventListener("click", function(){
            returnOpenBtn.hidden=true;
            returnForm.hidden=false;
            if(openBtn) openBtn.hidden=true;
            if(form) form.hidden=true;
            if(tracking) tracking.hidden=true;
            var area=returnForm.querySelector("textarea");
            if(area) area.focus();
          });
          if(startReturn){
            var returnArea=returnForm.querySelector("textarea");
            if(returnArea) setTimeout(function(){ returnArea.focus(); }, 40);
          }
        }
        if(returnBackBtn&&returnForm&&returnOpenBtn){
          returnBackBtn.addEventListener("click", function(){
            returnForm.hidden=true;
            returnOpenBtn.hidden=false;
            if(openBtn) openBtn.hidden=false;
            if(tracking) tracking.hidden=false;
            if(returnMsgEl){ returnMsgEl.hidden=true; returnMsgEl.textContent=""; }
          });
        }
        if(form){
          form.addEventListener("submit", function(event){
            event.preventDefault();
            var reason=((form.querySelector('textarea[name="reason"]')||{}).value||"").trim();
            if(reason.length<3){
              if(msgEl){ msgEl.hidden=false; msgEl.textContent="Please share a short reason."; msgEl.className="wb-acct-form-msg is-error"; }
              return;
            }
            var submit=form.querySelector("[data-wb-cancel-submit]");
            if(submit) submit.disabled=true;
            if(msgEl){ msgEl.hidden=true; msgEl.textContent=""; }
            request(base, "/orders/"+orderId+"/cancel", "POST", { reason:reason }).then(function(cancelResult){
              if(submit) submit.disabled=false;
              if(!cancelResult.ok){
                if(msgEl){
                  msgEl.hidden=false;
                  msgEl.className="wb-acct-form-msg is-error";
                  msgEl.textContent=(cancelResult.json&&cancelResult.json.error&&cancelResult.json.error.message)||"Could not cancel this order.";
                }
                return;
              }
              var cancelled=(cancelResult.json&&cancelResult.json.order)||{};
              var notice=cancelled.failureReason||"Order cancelled.";
              refreshAccount().then(function(){
                close();
                openOrderDetail(orderId);
                setTimeout(function(){
                  var next=document.querySelector("body > [data-wb-account-order-modal] .wb-acct-order-dialog");
                  if(!next) return;
                  var flash=document.createElement("p");
                  flash.className="wb-acct-form-msg is-ok";
                  flash.textContent=notice;
                  var head=next.querySelector(".wb-acct-order-head");
                  if(head&&head.nextSibling) next.insertBefore(flash, head.nextSibling);
                  else next.appendChild(flash);
                }, 120);
              });
            }).catch(function(){
              if(submit) submit.disabled=false;
              if(msgEl){ msgEl.hidden=false; msgEl.className="wb-acct-form-msg is-error"; msgEl.textContent="Can't reach the server. Try again."; }
            });
          });
        }
        if(returnForm){
          returnForm.addEventListener("submit", function(event){
            event.preventDefault();
            var reason=((returnForm.querySelector('textarea[name="reason"]')||{}).value||"").trim();
            if(reason.length<3){
              if(returnMsgEl){ returnMsgEl.hidden=false; returnMsgEl.textContent="Please share a short reason."; returnMsgEl.className="wb-acct-form-msg is-error"; }
              return;
            }
            var submit=returnForm.querySelector("[data-wb-return-submit]");
            if(submit) submit.disabled=true;
            if(returnMsgEl){ returnMsgEl.hidden=true; returnMsgEl.textContent=""; }
            request(base, "/orders/"+orderId+"/return", "POST", { reason:reason }).then(function(returnResult){
              if(submit) submit.disabled=false;
              if(!returnResult.ok){
                if(returnMsgEl){
                  returnMsgEl.hidden=false;
                  returnMsgEl.className="wb-acct-form-msg is-error";
                  returnMsgEl.textContent=(returnResult.json&&returnResult.json.error&&returnResult.json.error.message)||"Could not return this order.";
                }
                return;
              }
              var returned=(returnResult.json&&returnResult.json.order)||{};
              var notice=returned.failureReason||"Return accepted.";
              refreshAccount().then(function(){
                close();
                openOrderDetail(orderId);
                setTimeout(function(){
                  var next=document.querySelector("body > [data-wb-account-order-modal] .wb-acct-order-dialog");
                  if(!next) return;
                  var flash=document.createElement("p");
                  flash.className="wb-acct-form-msg is-ok";
                  flash.textContent=notice;
                  var head=next.querySelector(".wb-acct-order-head");
                  if(head&&head.nextSibling) next.insertBefore(flash, head.nextSibling);
                  else next.appendChild(flash);
                }, 120);
              });
            }).catch(function(){
              if(submit) submit.disabled=false;
              if(returnMsgEl){ returnMsgEl.hidden=false; returnMsgEl.className="wb-acct-form-msg is-error"; returnMsgEl.textContent="Can't reach the server. Try again."; }
            });
          });
        }
        document.body.appendChild(modal);
      });
    }
    function openInvoice(orderId){
      if(!orderId) return;
      request(base, "/orders/"+orderId, "GET").then(function(result){
        if(!result.ok){ alert("Could not open invoice right now."); return; }
        var order=(result.json&&result.json.order)||{};
        if(!(order.canDownloadInvoice || order.paidAt)){
          alert("Invoice is available after payment.");
          return;
        }
        window.open(base+"/orders/"+encodeURIComponent(String(orderId))+"/invoice", "_blank", "noopener,noreferrer");
      }).catch(function(){
        alert("Could not open invoice right now.");
      });
    }
    function showSuccessModal(rootNode, apiBase, order){
      var existing=document.querySelector("body > [data-wb-account-success-modal]");
      if(existing) existing.remove();
      var variant=rootNode.getAttribute("data-wb-success-variant")||"celebration";
      var heading=rootNode.getAttribute("data-wb-success-heading")||"Order confirmed";
      var text=rootNode.getAttribute("data-wb-success-text")||"Thanks for your purchase. We'll update you as it moves along.";
      var button=rootNode.getAttribute("data-wb-success-button")||"View order";
      var trackHref=order.trackUrl||(order.trackToken?("/?wbOrderTrack="+encodeURIComponent(String(order.trackToken))):"");
      var modal=document.createElement("div");
      modal.className="wb-acct-success-modal";
      modal.setAttribute("data-wb-account-success-modal","");
      modal.innerHTML=
        '<button type="button" class="wb-acct-success-backdrop" aria-label="Close"></button>'+
        '<div class="wb-acct-success-dialog is-'+variant+'" role="dialog" aria-modal="true">'+
          '<p class="wb-acct-success-kicker">Payment successful</p>'+
          '<h3 class="wb-acct-success-title">'+heading+"</h3>"+
          '<p class="wb-acct-success-text">'+text+"</p>"+
          '<div class="wb-acct-success-meta"><strong>Order #'+String(order.number||"")+"</strong><span>"+money(order.totalPaise)+"</span></div>"+
          '<div class="wb-acct-success-actions">'+
            '<button type="button" class="wb-acct-button is-pay" data-wb-success-view>'+button+"</button>"+
            (trackHref?'<a class="wb-acct-button" data-wb-success-track href="'+trackHref+'" style="text-decoration:none;text-align:center">Track order</a>':"")+
            '<button type="button" class="wb-acct-button" data-wb-success-close style="background:transparent;color:inherit;border:1px solid var(--wb-border)">Continue shopping</button>'+
          "</div></div>";
      themeModal(modal, rootNode);
      function close(){ modal.remove(); }
      modal.querySelectorAll(".wb-acct-success-backdrop,[data-wb-success-close]").forEach(function(btn){ btn.addEventListener("click", close); });
      var view=modal.querySelector("[data-wb-success-view]");
      if(view) view.addEventListener("click", function(){
        close();
        activatePanel(rootNode, tabs, "orders");
        openOrderDetail(String(order.id||""));
      });
      document.body.appendChild(modal);
    }
    root.addEventListener("click", function(event){
      var cancelBtn=event.target&&event.target.closest&&event.target.closest("[data-wb-order-cancel]");
      if(cancelBtn && root.contains(cancelBtn)){
        event.preventDefault();
        event.stopPropagation();
        openOrderDetail(cancelBtn.getAttribute("data-wb-order-cancel")||"", { startCancel:true });
        return;
      }
      var returnBtn=event.target&&event.target.closest&&event.target.closest("[data-wb-order-return]");
      if(returnBtn && root.contains(returnBtn)){
        event.preventDefault();
        event.stopPropagation();
        openOrderDetail(returnBtn.getAttribute("data-wb-order-return")||"", { startReturn:true });
        return;
      }
      var invoiceBtn=event.target&&event.target.closest&&event.target.closest("[data-wb-order-invoice]");
      if(invoiceBtn && root.contains(invoiceBtn)){
        event.preventDefault();
        event.stopPropagation();
        openInvoice(invoiceBtn.getAttribute("data-wb-order-invoice")||"");
        return;
      }
      var row=event.target&&event.target.closest&&event.target.closest("[data-wb-order-id]");
      if(!row || !root.contains(row)) return;
      event.preventDefault();
      openOrderDetail(row.getAttribute("data-wb-order-id")||"");
    });
    try{
      var params=new URLSearchParams(window.location.search||"");
      if(params.get("checkout")==="1"){
        setTimeout(function(){ payNow(); }, 400);
      }
    }catch(_e){}
    var profile=root.querySelector("[data-wb-account-profile]");
    if(profile){
      profile.addEventListener("submit", function(event){
        event.preventDefault();
        var button=profile.querySelector("button[type=submit]");
        if(button) button.disabled=true;
        message(profile, "", true);
        var fullName=(profile.querySelector('input[name="fullName"]')||{}).value||"";
        var phone=(profile.querySelector('input[name="phone"]')||{}).value||"";
        request(base, "/profile", "PATCH", { fullName:fullName.trim(), phone:phone.trim() })
          .then(function(result){
            if(button) button.disabled=false;
            if(!result.ok){ message(profile, (result.json&&result.json.error&&result.json.error.message)||"Could not save your profile.", false); return; }
            message(profile, "Profile updated.", true);
            var customer=result.json&&result.json.customer;
            if(customer){ setText(root, "fullName", customer.fullName||""); setText(root, "initials", initials(customer.fullName)); }
          })
          .catch(function(){ if(button) button.disabled=false; message(profile, "Can't reach the server. Try again.", false); });
      });
    }
    var addressesRoot=root.querySelector("[data-wb-account-addresses]");
    var addressForm=root.querySelector("[data-wb-account-address-form]");
    function readAddressForm(form){
      return {
        label:((form.querySelector('input[name="label"]')||{}).value||"").trim(),
        fullName:((form.querySelector('input[name="fullName"]')||{}).value||"").trim(),
        phone:((form.querySelector('input[name="phone"]')||{}).value||"").trim(),
        line1:((form.querySelector('input[name="line1"]')||{}).value||"").trim(),
        line2:((form.querySelector('input[name="line2"]')||{}).value||"").trim(),
        city:((form.querySelector('input[name="city"]')||{}).value||"").trim(),
        state:((form.querySelector('input[name="state"]')||{}).value||"").trim(),
        postalCode:((form.querySelector('input[name="postalCode"]')||{}).value||"").trim(),
        country:(((form.querySelector('input[name="country"]')||{}).value||"IN").trim()||"IN").toUpperCase(),
        isDefault:!!(form.querySelector('input[name="isDefault"]')||{}).checked
      };
    }
    function openAddressForm(address){
      if(!addressForm) return;
      addressForm.hidden=false;
      root.querySelectorAll("[data-wb-address-add]").forEach(function(btn){ btn.hidden=true; });
      var idField=addressForm.querySelector("[data-wb-address-id-field]");
      if(address){
        addressForm.setAttribute("data-wb-editing-id", String(address.id||""));
        if(idField) idField.value=String(address.id||"");
        (addressForm.querySelector('input[name="label"]')||{}).value=address.label||"";
        (addressForm.querySelector('input[name="fullName"]')||{}).value=address.fullName||"";
        (addressForm.querySelector('input[name="phone"]')||{}).value=address.phone||"";
        (addressForm.querySelector('input[name="line1"]')||{}).value=address.line1||"";
        (addressForm.querySelector('input[name="line2"]')||{}).value=address.line2||"";
        (addressForm.querySelector('input[name="city"]')||{}).value=address.city||"";
        (addressForm.querySelector('input[name="state"]')||{}).value=address.state||"";
        (addressForm.querySelector('input[name="postalCode"]')||{}).value=address.postalCode||"";
        (addressForm.querySelector('input[name="country"]')||{}).value=address.country||"IN";
        var def=addressForm.querySelector('input[name="isDefault"]');
        if(def) def.checked=!!address.isDefault;
      } else {
        addressForm.removeAttribute("data-wb-editing-id");
        if(idField) idField.value="";
        addressForm.reset();
        (addressForm.querySelector('input[name="fullName"]')||{}).value=addressCustomer.fullName||"";
        (addressForm.querySelector('input[name="phone"]')||{}).value=addressCustomer.phone||"";
        (addressForm.querySelector('input[name="country"]')||{}).value="IN";
        var defNew=addressForm.querySelector('input[name="isDefault"]');
        if(defNew) defNew.checked=addressCache.length===0;
      }
      if(addressesRoot) message(addressesRoot, "", true);
    }
    root.querySelectorAll("[data-wb-address-add]").forEach(function(btn){
      btn.addEventListener("click", function(){ openAddressForm(null); });
    });
    root.addEventListener("click", function(event){
      var editBtn=event.target&&event.target.closest&&event.target.closest("[data-wb-address-edit]");
      if(editBtn && root.contains(editBtn)){
        event.preventDefault();
        var editId=editBtn.getAttribute("data-wb-address-edit")||"";
        var found=null;
        addressCache.forEach(function(item){ if(String(item.id)===editId) found=item; });
        if(found) openAddressForm(found);
        return;
      }
      var deleteBtn=event.target&&event.target.closest&&event.target.closest("[data-wb-address-delete]");
      if(deleteBtn && root.contains(deleteBtn)){
        event.preventDefault();
        var deleteId=deleteBtn.getAttribute("data-wb-address-delete")||"";
        if(!deleteId) return;
        deleteBtn.disabled=true;
        request(base, "/addresses/"+deleteId, "DELETE")
          .then(function(result){
            deleteBtn.disabled=false;
            if(!result.ok){
              if(addressesRoot) message(addressesRoot, (result.json&&result.json.error&&result.json.error.message)||"Could not remove this address.", false);
              return;
            }
            fillAddresses(root, (result.json&&result.json.addresses)||[], addressCustomer);
            if(addressesRoot) message(addressesRoot, "Address removed.", true);
          })
          .catch(function(){
            deleteBtn.disabled=false;
            if(addressesRoot) message(addressesRoot, "Can't reach the server. Try again.", false);
          });
        return;
      }
      var cancelBtn=event.target&&event.target.closest&&event.target.closest("[data-wb-address-cancel]");
      if(cancelBtn && root.contains(cancelBtn)){
        event.preventDefault();
        if(addressForm){
          addressForm.hidden=true;
          addressForm.removeAttribute("data-wb-editing-id");
        }
        root.querySelectorAll("[data-wb-address-add]").forEach(function(btn){ btn.hidden=false; });
      }
    });
    if(addressForm){
      addressForm.addEventListener("submit", function(event){
        event.preventDefault();
        var button=addressForm.querySelector("button[type=submit]");
        if(button) button.disabled=true;
        if(addressesRoot) message(addressesRoot, "", true);
        var payload=readAddressForm(addressForm);
        var editingId=addressForm.getAttribute("data-wb-editing-id")||"";
        var path=editingId?"/addresses/"+editingId:"/addresses";
        var method=editingId?"PATCH":"POST";
        request(base, path, method, payload)
          .then(function(result){
            if(button) button.disabled=false;
            if(!result.ok){
              if(addressesRoot) message(addressesRoot, (result.json&&result.json.error&&result.json.error.message)||"Could not save this address.", false);
              return;
            }
            fillAddresses(root, (result.json&&result.json.addresses)||[], addressCustomer);
            if(addressesRoot) message(addressesRoot, editingId?"Address updated.":"Address saved.", true);
          })
          .catch(function(){
            if(button) button.disabled=false;
            if(addressesRoot) message(addressesRoot, "Can't reach the server. Try again.", false);
          });
      });
    }
    var password=root.querySelector("[data-wb-account-password]");
    if(password){
      password.addEventListener("submit", function(event){
        event.preventDefault();
        var current=(password.querySelector('input[name="currentPassword"]')||{}).value||"";
        var next=(password.querySelector('input[name="newPassword"]')||{}).value||"";
        var confirm=(password.querySelector('input[name="confirmPassword"]')||{}).value||"";
        if(next!==confirm){ message(password, "The new passwords don't match.", false); return; }
        var button=password.querySelector("button[type=submit]");
        if(button) button.disabled=true;
        message(password, "", true);
        request(base, "/change-password", "POST", { currentPassword:current, newPassword:next })
          .then(function(result){
            if(button) button.disabled=false;
            if(!result.ok){ message(password, (result.json&&result.json.error&&result.json.error.message)||"Could not change your password.", false); return; }
            password.reset();
            message(password, "Password changed.", true);
          })
          .catch(function(){ if(button) button.disabled=false; message(password, "Can't reach the server. Try again.", false); });
      });
    }
  }
  function bindGuestCheckout(root, websiteId, loginHref){
    if(root.getAttribute("data-wb-account-bound")) return;
    root.setAttribute("data-wb-account-bound","1");
    root.setAttribute("data-wb-guest-session","1");
    var base=apiBase()+"/shop/"+websiteId+"/auth";
    var tabs=Array.prototype.slice.call(root.querySelectorAll("[data-wb-account-tab]"));
    var guestAddress=null;
    var guestWishlist=[];
    var guestAddresses=[];
    var cartItemCount=0;
    setText(root, "fullName", "Guest");
    setText(root, "email", "Checkout without an account");
    setText(root, "initials", "G");
    setText(root, "memberSince", "—");
    root.querySelectorAll("[data-wb-account-logout]").forEach(function(btn){ btn.hidden=true; });
    root.querySelectorAll("[data-wb-account-login]").forEach(function(link){
      if(link.tagName==="A") link.setAttribute("href", siteHref(loginHref));
    });
    root.querySelectorAll("[data-wb-account-address-form]").forEach(function(form){ form.hidden=true; });
    function applyGuestAddress(addr){
      guestAddress=addr||null;
      setText(root, "fullName", (guestAddress&&guestAddress.fullName)||"Guest");
      setText(root, "email", (guestAddress&&guestAddress.email)||"Checkout without an account");
      setText(root, "initials", initials((guestAddress&&guestAddress.fullName)||"Guest"));
    }
    function syncGuestPay(){
      root.querySelectorAll("[data-wb-account-pay]").forEach(function(btn){
        btn.disabled=cartItemCount===0 || !guestAddress || !!root.getAttribute("data-wb-paying");
        if(!btn.getAttribute("data-wb-pay-label")) btn.setAttribute("data-wb-pay-label", btn.textContent||"Pay now");
        if(!root.getAttribute("data-wb-paying")) btn.textContent=btn.getAttribute("data-wb-pay-label")||"Pay now";
      });
    }
    function renderGuestAddressShell(){
      var shell=ensureCheckoutAddressShell(root);
      if(!shell) return;
      if(!guestAddress){
        shell.innerHTML=
          '<p class="wb-acct-checkout-label">Delivery address</p>'+
          '<div class="wb-acct-checkout-empty" data-wb-account-checkout-no-address="">'+
            "<p>Add a delivery address before you pay.</p>"+
            '<button type="button" class="wb-acct-linkish" data-wb-guest-add-address="">Add address</button>'+
          "</div>";
        syncGuestPay();
        return;
      }
      var lines=[guestAddress.line1, guestAddress.line2, [guestAddress.city, guestAddress.state, guestAddress.postalCode].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
      shell.innerHTML=
        '<p class="wb-acct-checkout-label">Delivery address</p>'+
        '<ul class="wb-acct-checkout-address-list" data-wb-account-checkout-address-list="">'+
          "<li>"+
            '<label class="wb-acct-checkout-option is-selected">'+
              '<input type="radio" name="checkoutAddress" value="guest" checked data-wb-checkout-address="guest" />'+
              '<span class="wb-acct-checkout-option-body">'+
                "<strong>Delivery</strong>"+
                "<span>"+String(guestAddress.fullName||"")+" · "+String(guestAddress.phone||"")+"</span>"+
                "<span>"+String(guestAddress.email||"")+"</span>"+
                "<span>"+lines+"</span>"+
              "</span>"+
            "</label>"+
          "</li>"+
        "</ul>"+
        '<button type="button" class="wb-acct-linkish" data-wb-guest-add-address="">Change address</button>';
      syncGuestPay();
    }
    function openGuestAddressModal(){
      var existing=document.querySelector("body > [data-wb-guest-address-modal]");
      if(existing) existing.remove();
      function esc(value){ return String(value||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }
      var modal=document.createElement("div");
      modal.className="wb-guest-address-modal";
      modal.setAttribute("data-wb-guest-address-modal","");
      var site=root.closest(".wb-site");
      if(site&&site.getAttribute("style")) modal.setAttribute("style", site.getAttribute("style"));
      var a=guestAddress||{};
      var editing=!!guestAddress;
      modal.innerHTML=
        '<button type="button" class="wb-guest-address-backdrop" aria-label="Close address form"></button>'+
        '<div class="wb-guest-address-dialog" role="dialog" aria-modal="true" aria-labelledby="wb-guest-address-title">'+
          '<div class="wb-guest-address-head">'+
            '<div class="wb-guest-address-copy">'+
              '<p class="wb-guest-address-kicker">Checkout</p>'+
              '<h3 class="wb-guest-address-title" id="wb-guest-address-title">'+(editing?"Edit address":"Add address")+"</h3>"+
            "</div>"+
            '<button type="button" class="wb-guest-address-close" aria-label="Close">×</button>'+
          "</div>"+
          '<div class="wb-guest-address-body">'+
            '<form id="wb-guest-address-form" data-wb-guest-address-form class="wb-guest-address-form">'+
              '<label class="wb-guest-address-label">Full name<input class="wb-guest-address-input" required name="fullName" autocomplete="name" value="'+esc(a.fullName)+'" /></label>'+
              '<label class="wb-guest-address-label">Email for invoice<input class="wb-guest-address-input" required type="email" name="email" autocomplete="email" value="'+esc(a.email)+'" /></label>'+
              '<label class="wb-guest-address-label">Phone<input class="wb-guest-address-input" required name="phone" autocomplete="tel" value="'+esc(a.phone)+'" /></label>'+
              '<label class="wb-guest-address-label">Address line 1<input class="wb-guest-address-input" required name="line1" autocomplete="address-line1" value="'+esc(a.line1)+'" /></label>'+
              '<label class="wb-guest-address-label">Address line 2 <span style="font-weight:500;opacity:.75">(optional)</span><input class="wb-guest-address-input" name="line2" autocomplete="address-line2" value="'+esc(a.line2)+'" /></label>'+
              '<div class="wb-guest-address-row">'+
                '<label class="wb-guest-address-label">City<input class="wb-guest-address-input" required name="city" autocomplete="address-level2" value="'+esc(a.city)+'" /></label>'+
                '<label class="wb-guest-address-label">State<input class="wb-guest-address-input" required name="state" autocomplete="address-level1" value="'+esc(a.state)+'" /></label>'+
              "</div>"+
              '<label class="wb-guest-address-label">PIN / postal code<input class="wb-guest-address-input" required name="postalCode" autocomplete="postal-code" value="'+esc(a.postalCode)+'" /></label>'+
              '<p class="wb-guest-address-error" data-wb-guest-address-error hidden></p>'+
            "</form>"+
          "</div>"+
          '<div class="wb-guest-address-actions">'+
            '<button type="submit" form="wb-guest-address-form" class="wb-acct-button is-pay">Save address</button>'+
            '<button type="button" class="wb-acct-button is-ghost" data-wb-guest-address-cancel>Cancel</button>'+
          "</div>"+
        "</div>";
      function close(){ modal.remove(); }
      var form=modal.querySelector("[data-wb-guest-address-form]");
      modal.querySelectorAll(".wb-guest-address-backdrop,.wb-guest-address-close,[data-wb-guest-address-cancel]").forEach(function(btn){
        btn.addEventListener("click", close);
      });
      var errorBox=modal.querySelector("[data-wb-guest-address-error]");
      form.addEventListener("submit", function(event){
        event.preventDefault();
        if(typeof form.reportValidity==="function" && !form.reportValidity()) return;
        var data=new FormData(form);
        var payload={
          email:String(data.get("email")||"").trim(),
          fullName:String(data.get("fullName")||"").trim(),
          phone:String(data.get("phone")||"").trim(),
          line1:String(data.get("line1")||"").trim(),
          line2:String(data.get("line2")||"").trim(),
          city:String(data.get("city")||"").trim(),
          state:String(data.get("state")||"").trim(),
          postalCode:String(data.get("postalCode")||"").trim(),
          country:"IN"
        };
        if(!payload.email || !payload.fullName || !payload.phone || !payload.line1 || !payload.city || !payload.state || !payload.postalCode){
          errorBox.hidden=false;
          errorBox.textContent="Please fill in all required fields.";
          return;
        }
        errorBox.hidden=true;
        var saveBtn=modal.querySelector('button[type="submit"]');
        if(saveBtn) saveBtn.disabled=true;
        request(base, "/guest/addresses", "POST", payload).then(function(result){
          if(saveBtn) saveBtn.disabled=false;
          if(!result.ok){
            errorBox.hidden=false;
            errorBox.textContent=(result.json&&result.json.error&&result.json.error.message)||"Could not save address.";
            return;
          }
          guestAddresses=(result.json&&result.json.addresses)||[];
          applyGuestAddress(guestAddresses[0]||null);
          close();
          refreshGuestAccount();
          payMessage("", true);
        }).catch(function(){
          if(saveBtn) saveBtn.disabled=false;
          errorBox.hidden=false;
          errorBox.textContent="Can't reach the server. Try again.";
        });
      });
      var cs=site?window.getComputedStyle(site):null;
      var bg=(cs&&cs.getPropertyValue("--wb-bg").trim())||"#ffffff";
      var fg=(cs&&cs.getPropertyValue("--wb-text").trim())||"#1a1d23";
      var dialog=modal.querySelector(".wb-guest-address-dialog");
      if(dialog){
        dialog.style.setProperty("background-color", bg, "important");
        dialog.style.setProperty("color", fg, "important");
      }
      document.body.appendChild(modal);
      var first=form.querySelector("input");
      if(first) setTimeout(function(){ first.focus(); }, 0);
    }
    function refreshGuestAccount(){
      return Promise.all([
        request(base, "/guest/cart", "GET"),
        request(base, "/guest/wishlist", "GET"),
        request(base, "/guest/addresses", "GET")
      ]).then(function(results){
        var cartResult=results[0];
        var wishResult=results[1];
        var addressResult=results[2];
        guestWishlist=(wishResult.ok&&wishResult.json&&wishResult.json.wishlistItems)||[];
        guestAddresses=(addressResult.ok&&addressResult.json&&addressResult.json.addresses)||[];
        applyGuestAddress(guestAddresses[0]||null);
        var customer={
          fullName:(guestAddress&&guestAddress.fullName)||"Guest",
          email:(guestAddress&&guestAddress.email)||"",
          phone:(guestAddress&&guestAddress.phone)||null
        };
        var items=(cartResult.ok&&cartResult.json&&cartResult.json.cartItems)||[];
        cartItemCount=items.length;
        fill(root, { customer:customer, orders:[], cartItems:items, wishlistItems:guestWishlist, addresses:guestAddresses });
        renderGuestAddressShell();
        return items;
      });
    }
    function refreshGuestCart(){ return refreshGuestAccount(); }
    function guestPayNow(){
      if(root.getAttribute("data-wb-paying")) return;
      if(!guestAddress){
        payMessage("Add a delivery address before paying.", false);
        return;
      }
      if(cartItemCount===0){
        payMessage("Your cart is empty.", false);
        return;
      }
      var payload={
        email:guestAddress.email,
        fullName:guestAddress.fullName,
        phone:guestAddress.phone,
        address:{
          fullName:guestAddress.fullName,
          phone:guestAddress.phone,
          line1:guestAddress.line1,
          line2:guestAddress.line2||"",
          city:guestAddress.city,
          state:guestAddress.state,
          postalCode:guestAddress.postalCode,
          country:guestAddress.country||"IN"
        }
      };
      root.setAttribute("data-wb-paying","1");
      setPayBusy(true);
      payMessage("", true);
      request(base, "/guest/checkout", "POST", payload).then(function(result){
        if(!result.ok){
          setPayBusy(false);
          root.removeAttribute("data-wb-paying");
          payMessage((result.json&&result.json.error&&result.json.error.message)||"Could not start checkout.", false);
          return;
        }
        var checkout=(result.json&&result.json.checkout)||{};
        var trackUrl=checkout.trackUrl||"";
        return openRazorpay(checkout).then(function(confirmation){
          return request(base, "/guest/checkout/confirm", "POST", confirmation).then(function(confirmResult){
            setPayBusy(false);
            root.removeAttribute("data-wb-paying");
            if(!confirmResult.ok){
              payMessage((confirmResult.json&&confirmResult.json.error&&confirmResult.json.error.message)||"Payment received but order confirmation failed. Refresh in a moment.", false);
              return;
            }
            var paidOrder=(confirmResult.json&&confirmResult.json.order)||{};
            if(paidOrder.trackUrl||trackUrl){
              paidOrder.trackUrl=paidOrder.trackUrl||trackUrl;
              paidOrder.trackToken=paidOrder.trackToken||checkout.trackToken;
            }
            payMessage("Payment successful. Your order is confirmed.", true);
            return refreshGuestCart().then(function(){
              showSuccessModal(root, base, paidOrder);
            });
          });
        }).catch(function(err){
          setPayBusy(false);
          root.removeAttribute("data-wb-paying");
          payMessage((err&&err.message)||"Payment cancelled.", false);
        });
      }).catch(function(){
        setPayBusy(false);
        root.removeAttribute("data-wb-paying");
        payMessage("Can't reach the server. Try again.", false);
      });
    }
    function setPayBusy(busy){
      if(busy) root.setAttribute("data-wb-paying","1");
      else root.removeAttribute("data-wb-paying");
      root.querySelectorAll("[data-wb-account-pay]").forEach(function(btn){
        if(!btn.getAttribute("data-wb-pay-label")) btn.setAttribute("data-wb-pay-label", btn.textContent||"Pay now");
        btn.textContent=busy?"Opening payment…":(btn.getAttribute("data-wb-pay-label")||"Pay now");
      });
      syncGuestPay();
    }
    function payMessage(text, ok){
      var el=root.querySelector("[data-wb-account-pay-message]");
      if(!el) return;
      el.hidden=!text;
      el.textContent=text||"";
      el.classList.toggle("is-error", !!text && !ok);
      el.classList.toggle("is-ok", !!text && !!ok);
    }
    function openRazorpay(checkout){
      function load(){
        if(window.Razorpay) return Promise.resolve();
        return new Promise(function(resolve,reject){
          var script=document.createElement("script");
          script.src="https://checkout.razorpay.com/v1/checkout.js";
          script.onload=function(){ resolve(); };
          script.onerror=function(){ reject(new Error("Could not load Razorpay")); };
          document.head.appendChild(script);
        });
      }
      return load().then(function(){
        return new Promise(function(resolve,reject){
          var lastFailure="";
          var instance=new window.Razorpay({
            key: checkout.keyId,
            amount: checkout.amountPaise,
            currency: checkout.currency||"INR",
            name: checkout.businessName||"Shop",
            description: "Order #"+String(checkout.orderNumber||""),
            order_id: checkout.razorpayOrderId,
            prefill: checkout.prefill||{},
            handler: function(response){
              resolve({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
            },
            modal: { ondismiss: function(){ reject(lastFailure?new Error(lastFailure):new Error("Payment cancelled.")); } }
          });
          instance.on("payment.failed", function(response){
            lastFailure=(response&&response.error&&response.error.description)||"The payment failed. Please try again.";
          });
          instance.open();
        });
      });
    }
    function showSuccessModal(rootNode, apiBaseUnused, order){
      var existing=document.querySelector("body > [data-wb-account-success-modal]");
      if(existing) existing.remove();
      var heading=rootNode.getAttribute("data-wb-success-heading")||"Order confirmed";
      var text=rootNode.getAttribute("data-wb-success-text")||"Thanks for your purchase. We'll update you as it moves along.";
      var trackHref=order.trackUrl||(order.trackToken?siteHref("/?wbOrderTrack="+encodeURIComponent(String(order.trackToken))):"");
      var modal=document.createElement("div");
      modal.className="wb-acct-success-modal";
      modal.setAttribute("data-wb-account-success-modal","");
      modal.innerHTML=
        '<button type="button" class="wb-acct-success-backdrop" aria-label="Close"></button>'+
        '<div class="wb-acct-success-dialog is-celebration" role="dialog" aria-modal="true">'+
          '<p class="wb-acct-success-kicker">Payment successful</p>'+
          '<h3 class="wb-acct-success-title">'+heading+"</h3>"+
          '<p class="wb-acct-success-text">'+text+"</p>"+
          '<div class="wb-acct-success-meta"><strong>Order #'+String(order.number||"")+"</strong><span>"+money(order.totalPaise)+"</span></div>"+
          '<div class="wb-acct-success-actions">'+
            (trackHref?'<a class="wb-acct-button is-pay" href="'+trackHref+'" style="text-decoration:none;text-align:center">Track order</a>':"")+
            '<button type="button" class="wb-acct-button" data-wb-success-close style="background:transparent;color:inherit;border:1px solid var(--wb-border)">Continue shopping</button>'+
          "</div></div>";
      function close(){ modal.remove(); }
      modal.querySelectorAll(".wb-acct-success-backdrop,[data-wb-success-close]").forEach(function(btn){ btn.addEventListener("click", close); });
      document.body.appendChild(modal);
    }
    tabs.forEach(function(tab){
      tab.addEventListener("click", function(){
        var name=tab.getAttribute("data-wb-account-tab");
        if(name==="cart" || name==="wishlist" || name==="addresses"){
          activatePanel(root, tabs, name);
          if(name==="wishlist" || name==="addresses") refreshGuestCart();
          return;
        }
        window.location.href=siteHref(loginHref);
      });
    });
    function setGuestWishlistBusy(on){
      root.querySelectorAll("[data-wb-wishlist-add], [data-wb-wishlist-remove], [data-wb-wishlist-add-all]").forEach(function(node){
        node.disabled=!!on;
      });
    }
    function addGuestWishlistVariant(variantId){
      return request(base, "/guest/cart", "POST", { variantId:variantId, quantity:1 });
    }
    root.addEventListener("click", function(event){
      var goAddresses=event.target&&event.target.closest&&event.target.closest("[data-wb-account-go-addresses]");
      if(goAddresses && root.contains(goAddresses)){
        event.preventDefault();
        activatePanel(root, tabs, "addresses");
        refreshGuestCart();
        return;
      }
      var addAddress=event.target&&event.target.closest&&event.target.closest("[data-wb-guest-add-address], [data-wb-address-add]");
      if(addAddress && root.contains(addAddress)){
        event.preventDefault();
        openGuestAddressModal();
        return;
      }
      var editAddress=event.target&&event.target.closest&&event.target.closest("[data-wb-address-edit]");
      if(editAddress && root.contains(editAddress)){
        event.preventDefault();
        openGuestAddressModal();
        return;
      }
      var deleteAddress=event.target&&event.target.closest&&event.target.closest("[data-wb-address-delete]");
      if(deleteAddress && root.contains(deleteAddress)){
        event.preventDefault();
        var deleteId=deleteAddress.getAttribute("data-wb-address-delete")||(guestAddress&&guestAddress.id)||"";
        if(!deleteId || deleteAddress.disabled) return;
        deleteAddress.disabled=true;
        request(base, "/guest/addresses/"+deleteId, "DELETE").then(function(result){
          deleteAddress.disabled=false;
          if(!result.ok) return;
          guestAddresses=(result.json&&result.json.addresses)||[];
          applyGuestAddress(guestAddresses[0]||null);
          return refreshGuestAccount();
        }).catch(function(){ deleteAddress.disabled=false; });
        return;
      }
      var wishAddAll=event.target&&event.target.closest&&event.target.closest("[data-wb-wishlist-add-all]");
      if(wishAddAll && root.contains(wishAddAll)){
        event.preventDefault();
        if(wishAddAll.disabled || !guestWishlist.length) return;
        setGuestWishlistBusy(true);
        wishAddAll.textContent="Adding…";
        var chain=Promise.resolve();
        guestWishlist.forEach(function(item){
          var variantId=String(item.variantId||"");
          if(!variantId) return;
          chain=chain.then(function(){ return addGuestWishlistVariant(variantId).catch(function(){}); });
        });
        chain.then(function(){ return refreshGuestAccount(); }).finally(function(){
          setGuestWishlistBusy(false);
          wishAddAll.textContent="Add all to cart";
        });
        return;
      }
      var wishAdd=event.target&&event.target.closest&&event.target.closest("[data-wb-wishlist-add]");
      if(wishAdd && root.contains(wishAdd)){
        event.preventDefault();
        var addVariantId=wishAdd.getAttribute("data-wb-wishlist-add")||"";
        if(!addVariantId || wishAdd.disabled) return;
        setGuestWishlistBusy(true);
        wishAdd.textContent="Adding…";
        addGuestWishlistVariant(addVariantId).then(function(result){
          if(!result.ok){
            setGuestWishlistBusy(false);
            wishAdd.textContent="Add to cart";
            return;
          }
          return refreshGuestAccount().finally(function(){
            setGuestWishlistBusy(false);
            wishAdd.textContent="Add to cart";
          });
        }).catch(function(){
          setGuestWishlistBusy(false);
          wishAdd.textContent="Add to cart";
        });
        return;
      }
      var wishRemove=event.target&&event.target.closest&&event.target.closest("[data-wb-wishlist-remove]");
      if(wishRemove && root.contains(wishRemove)){
        event.preventDefault();
        var removeVariantId=wishRemove.getAttribute("data-wb-wishlist-remove")||"";
        if(!removeVariantId || wishRemove.disabled) return;
        setGuestWishlistBusy(true);
        wishRemove.textContent="Removing…";
        request(base, "/guest/wishlist/"+removeVariantId, "DELETE").then(function(result){
          if(!result.ok){
            setGuestWishlistBusy(false);
            wishRemove.textContent="Remove";
            return;
          }
          return refreshGuestAccount().finally(function(){
            setGuestWishlistBusy(false);
            wishRemove.textContent="Remove";
          });
        }).catch(function(){
          setGuestWishlistBusy(false);
          wishRemove.textContent="Remove";
        });
        return;
      }
      var removeBtn=event.target&&event.target.closest&&event.target.closest("[data-wb-cart-remove]");
      if(removeBtn && root.contains(removeBtn)){
        event.preventDefault();
        var itemId=removeBtn.getAttribute("data-wb-cart-remove")||"";
        if(!itemId||removeBtn.disabled) return;
        removeBtn.disabled=true;
        removeBtn.textContent="Removing…";
        request(base, "/guest/cart/"+itemId, "DELETE").then(function(result){
          if(!result.ok){
            removeBtn.disabled=false;
            removeBtn.textContent="Remove";
            return;
          }
          return refreshGuestCart();
        }).catch(function(){
          removeBtn.disabled=false;
          removeBtn.textContent="Remove";
        });
        return;
      }
      var payBtn=event.target&&event.target.closest&&event.target.closest("[data-wb-account-pay]");
      if(payBtn && root.contains(payBtn)){
        event.preventDefault();
        guestPayNow();
      }
    });
    refreshGuestCart().then(function(){
      showState(root, "member");
      var fromUrl=preferredPanel(root);
      var panel=fromUrl||"cart";
      if(panel!=="cart" && panel!=="wishlist" && panel!=="addresses") panel="cart";
      activatePanel(root, tabs, panel, { skipUrl: fromUrl===panel });
    }).catch(function(){
      showState(root, "guest");
    });
  }
  document.querySelectorAll("[data-wb-account]").forEach(function(root){
    if(root.getAttribute("data-wb-account-ready")) return;
    root.setAttribute("data-wb-account-ready","1");
    var websiteId=root.getAttribute("data-wb-account");
    var loginHref=root.getAttribute("data-wb-account-login")||"/login";
    var logoutHref=root.getAttribute("data-wb-account-logout")||loginHref;
    var redirect=root.getAttribute("data-wb-account-redirect")==="1";
    var guestCheckout=root.getAttribute("data-wb-shop-guest")==="1";
    root.querySelectorAll("[data-wb-account-login]").forEach(function(link){ if(link.tagName==="A") link.setAttribute("href", siteHref(loginHref)); });
    if(!websiteId){ showState(root, "guest"); return; }
    var base=apiBase()+"/shop/"+websiteId+"/auth";
    request(base, "/account", "GET")
      .then(function(result){
        if(!result.ok) throw new Error("no-session");
        fill(root, result.json||{});
        bind(root, base, loginHref, logoutHref);
        showState(root, "member");
      })
      .catch(function(){
        if(guestCheckout){
          bindGuestCheckout(root, websiteId, loginHref);
          return;
        }
        if(redirect){ window.location.replace(siteHref(loginHref)); return; }
        showState(root, "guest");
      });
  });
})();`;

/** Plain script so register / login / forgot / verify work on the published static page. */
export const SHOP_AUTH_SCRIPT = `(function(){
  function apiBase(){
    var meta=document.querySelector('meta[name="wb-api"]');
    var content=meta&&meta.getAttribute("content");
    return content?String(content).replace(/\\/$/,""):"/api";
  }
  function readName(form){
    var full=form.querySelector('input[name="fullName"]');
    if(full&&full.value.trim()) return full.value.trim();
    var first=form.querySelector('input[name="firstName"]');
    var last=form.querySelector('input[name="lastName"]');
    var joined=((first&&first.value)||"")+" "+((last&&last.value)||"");
    joined=joined.trim();
    if(joined) return joined;
    var email=form.querySelector('input[name="email"], input[type="email"]');
    var value=email&&email.value?email.value.trim():"";
    return value.split("@")[0]||"Customer";
  }
  function showError(root, message){
    var el=root.querySelector("[data-wb-shop-auth-error]");
    if(!el){
      el=document.createElement("p");
      el.className="wb-auth-error";
      el.setAttribute("role","alert");
      el.setAttribute("data-wb-shop-auth-error","");
      var form=root.querySelector("form.wb-auth-form");
      if(form) form.insertBefore(el, form.querySelector(".wb-auth-submit"));
    }
    el.hidden=!message;
    el.textContent=message||"";
  }
  function focusOtp(root){
    var panel=root.querySelector('[data-wb-state="otp"]');
    if(!panel||panel.hidden) return;
    var first=panel.querySelector(".wb-auth-otp-cell");
    if(!first) return;
    setTimeout(function(){
      first.focus();
      try{ first.select(); }catch(_e){}
    }, 0);
  }
  function goState(root, state){
    var box=root.closest("[data-wb-states]")||root.querySelector("[data-wb-states]");
    if(!box) return;
    box.querySelectorAll("[data-wb-state]").forEach(function(node){
      node.hidden=node.getAttribute("data-wb-state")!==state;
    });
    if(state==="otp") focusOtp(root);
  }
  function pendingEmail(root, value){
    if(value!==undefined) root.setAttribute("data-wb-pending-email", value||"");
    return root.getAttribute("data-wb-pending-email")||"";
  }
  /** Digits live in .wb-auth-otp-cell; the hidden name=code field is only kept in sync for forms. */
  function readOtpCode(form){
    var cells=form.querySelectorAll(".wb-auth-otp-cell");
    if(cells.length){
      var code="";
      for(var i=0;i<cells.length;i++){
        code+=String(cells[i].value||"").replace(/\\D/g,"").slice(-1);
      }
      return code;
    }
    var hidden=form.querySelector('input[name="code"]');
    return hidden&&hidden.value?String(hidden.value).trim():"";
  }
  function syncOtpHidden(form){
    var hidden=form.querySelector('input[name="code"]');
    if(hidden) hidden.value=readOtpCode(form);
  }
  function wireOtp(root){
    root.querySelectorAll(".wb-auth-otp").forEach(function(group){
      if(group.getAttribute("data-wb-otp-ready")) return;
      group.setAttribute("data-wb-otp-ready","1");
      var cells=Array.prototype.slice.call(group.querySelectorAll(".wb-auth-otp-cell"));
      if(!cells.length) return;
      var form=group.closest("form");
      cells.forEach(function(cell, index){
        cell.removeAttribute("value");
        cell.addEventListener("focus", function(){ try{ cell.select(); }catch(_e){} });
        // keydown is more reliable than input+maxLength=1 for advancing boxes
        cell.addEventListener("keydown", function(event){
          if(event.ctrlKey||event.metaKey||event.altKey) return;
          if(event.key>="0"&&event.key<="9"){
            event.preventDefault();
            cell.value=event.key;
            if(form) syncOtpHidden(form);
            if(index<cells.length-1) cells[index+1].focus();
            return;
          }
          if(event.key==="Backspace"){
            event.preventDefault();
            if(cell.value){
              cell.value="";
              if(form) syncOtpHidden(form);
            } else if(index>0){
              cells[index-1].value="";
              if(form) syncOtpHidden(form);
              cells[index-1].focus();
            }
            return;
          }
          if(event.key==="Delete"){
            event.preventDefault();
            cell.value="";
            if(form) syncOtpHidden(form);
            return;
          }
          if(event.key==="ArrowLeft"&&index>0){ event.preventDefault(); cells[index-1].focus(); }
          if(event.key==="ArrowRight"&&index<cells.length-1){ event.preventDefault(); cells[index+1].focus(); }
        });
        // Mobile SMS autofill / IME may fill without a digit keydown
        cell.addEventListener("input", function(){
          var raw=String(cell.value||"").replace(/\\D/g,"");
          if(raw.length>1){
            for(var i=0;i<cells.length;i++) cells[i].value=raw.charAt(i)||"";
            cells[Math.min(raw.length, cells.length)-1].focus();
            if(form) syncOtpHidden(form);
            return;
          }
          var digit=raw.slice(-1);
          cell.value=digit;
          if(digit&&index<cells.length-1) cells[index+1].focus();
          if(form) syncOtpHidden(form);
        });
        cell.addEventListener("paste", function(event){
          var pasted=(event.clipboardData&&event.clipboardData.getData("text")||"").replace(/\\D/g,"").slice(0, cells.length);
          if(!pasted) return;
          event.preventDefault();
          for(var i=0;i<cells.length;i++) cells[i].value=pasted.charAt(i)||"";
          cells[Math.min(pasted.length, cells.length)-1].focus();
          if(form) syncOtpHidden(form);
        });
      });
    });
  }
  function successHref(root){
    var raw=(root.getAttribute("data-wb-shop-success-href")||"/account").trim();
    if(!raw || raw==="/") raw="/account";
    if(/^https?:\\/\\//i.test(raw) || raw.startsWith("#")) return raw;
    if(!raw.startsWith("/")) raw="/"+raw;
    if(raw.startsWith("/live/")) return raw;
    var path=window.location.pathname||"/";
    var match=path.match(/^\\/live\\/([^/]+)/);
    if(match) return "/live/"+match[1]+raw;
    return raw;
  }
  document.querySelectorAll("[data-wb-shop-auth]").forEach(function(root){
    if(root.getAttribute("data-wb-shop-auth-ready")) return;
    root.setAttribute("data-wb-shop-auth-ready","1");
    var websiteId=root.getAttribute("data-wb-shop-auth");
    if(!websiteId) return;
    var base=apiBase()+"/shop/"+websiteId+"/auth";
    wireOtp(root);
    var params=new URLSearchParams(window.location.search);
    var resetToken=params.get("reset");
    if(resetToken){
      goState(root, "reset");
      root.setAttribute("data-wb-reset-token", resetToken);
    }
    // A customer who is already signed in belongs on the account page, not the login form.
    var here=(window.location.pathname||"/").replace(/\\/+$/,"")||"/";
    var there=successHref(root).replace(/\\/+$/,"")||"/";
    if(!resetToken && here!==there){
      fetch(base+"/me", { credentials:"include", cache:"no-store" })
        .then(function(response){
          if(response.ok){ window.location.replace(successHref(root)); return null; }
          if(response.status!==401) return null;
          return fetch(base+"/refresh", { method:"POST", credentials:"include", cache:"no-store" })
            .then(function(refresh){ if(refresh.ok) return fetch(base+"/me", { credentials:"include", cache:"no-store" }); })
            .then(function(retry){ if(retry&&retry.ok) window.location.replace(successHref(root)); });
        })
        .catch(function(){});
    }
    root.addEventListener("submit", function(event){
      var form=event.target;
      if(!(form instanceof HTMLFormElement) || !form.classList.contains("wb-auth-form")) return;
      event.preventDefault();
      event.stopPropagation();
      var panel=form.closest("[data-wb-state]");
      var view=panel?panel.getAttribute("data-wb-state"):"login";
      showError(form.parentElement||root, "");
      var emailInput=form.querySelector('input[name="email"], input[type="email"]');
      var passwordInput=form.querySelector('input[name="password"], input[data-auth-type="password"]');
      var remember=form.querySelector('input[name="remember"]');
      var body=null;
      var path="";
      var method="POST";
      if(view==="register"){
        path="/signup";
        body={ email:(emailInput&&emailInput.value||"").trim().toLowerCase(), password:passwordInput&&passwordInput.value||"", fullName:readName(form) };
        pendingEmail(root, body.email);
      } else if(view==="login"){
        path="/login";
        body={ email:(emailInput&&emailInput.value||"").trim().toLowerCase(), password:passwordInput&&passwordInput.value||"", remember:!remember||remember.checked };
      } else if(view==="forgot"){
        path="/forgot-password";
        body={ email:(emailInput&&emailInput.value||"").trim().toLowerCase() };
      } else if(view==="otp"){
        path="/verify-email";
        syncOtpHidden(form);
        body={ email:pendingEmail(root), code:readOtpCode(form) };
      } else if(view==="reset"){
        path="/reset-password";
        body={ token:root.getAttribute("data-wb-reset-token")||"", password:passwordInput&&passwordInput.value||"" };
      } else {
        return;
      }
      var button=form.querySelector(".wb-auth-submit");
      if(button) button.disabled=true;
      fetch(base+path, { method:method, headers:{ "Content-Type":"application/json" }, credentials:"include", body:JSON.stringify(body) })
        .then(function(response){
          return response.json().catch(function(){ return {}; }).then(function(json){
            return { ok:response.ok, status:response.status, json:json };
          });
        })
        .then(function(result){
          if(button) button.disabled=false;
          if(view==="register" && result.ok){
            goState(root, "otp");
            return;
          }
          if(view==="forgot" && (result.ok || result.status===204)){
            goState(root, "login");
            showError(form.parentElement||root, "");
            alert("If an account exists for that email, a reset link is on its way.");
            return;
          }
          if(!result.ok){
            var message=result.json&&result.json.error&&result.json.error.message||"Something went wrong.";
            if(result.json&&result.json.error&&result.json.error.code==="EMAIL_NOT_VERIFIED"){
              pendingEmail(root, body.email);
              goState(root, "otp");
              return;
            }
            showError(form.parentElement||root, message);
            return;
          }
          window.location.href=successHref(root);
        })
        .catch(function(){
          if(button) button.disabled=false;
          showError(form.parentElement||root, "Can't reach the server. Try again.");
        });
    }, true);
    root.querySelectorAll("[data-wb-shop-auth-resend]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var email=pendingEmail(root);
        if(!email) return;
        fetch(base+"/resend-verification", { method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include", body:JSON.stringify({ email:email }) }).catch(function(){});
      });
    });
  });
})();`;

/**
 * Plain script for Cart / Buy on published product list and detail pages.
 * Guests are asked to log in; signed-in shoppers add the variant to their cart.
 */
export const SHOP_CART_SCRIPT = `(function(){
  if(window.__wbShopCartReady) return;
  window.__wbShopCartReady=1;
  function apiBase(){
    var meta=document.querySelector('meta[name="wb-api"]');
    var content=meta&&meta.getAttribute("content");
    return content?String(content).replace(/\\/$/,""):"/api";
  }
  function siteHref(href){
    var raw=(href||"/").trim();
    if(/^(https?:\\/\\/|mailto:|tel:|#)/i.test(raw)) return raw;
    var path=raw.charAt(0)==="/"?raw:"/"+raw;
    if(path.indexOf("/live/")===0) return path;
    var match=(window.location.pathname||"/").match(/^\\/live\\/([^/]+)/);
    return match?"/live/"+match[1]+(path==="/"?"":path):path;
  }
  function shopRoot(node){
    return node.closest("[data-wb-shop-website],[data-wb-detail],[data-wb-shop]")||document.body;
  }
  function websiteId(node){
    var root=shopRoot(node);
    return root.getAttribute("data-wb-shop-website")||"";
  }
  function authHref(node){
    var root=shopRoot(node);
    return root.getAttribute("data-wb-shop-auth-href")||"/login";
  }
  function accountHref(node){
    var root=shopRoot(node);
    return root.getAttribute("data-wb-shop-account-href")||"/account";
  }
  function guestCheckoutEnabled(node){
    var root=shopRoot(node);
    return root.getAttribute("data-wb-shop-guest")==="1";
  }
  function accountPanelHref(href, panel){
    var raw=(href||"/account").trim()||"/account";
    if(/^(https?:\\/\\/|mailto:|tel:)/i.test(raw)){
      try{ var url=new URL(raw); url.searchParams.set("panel", panel); return url.toString(); }catch(_e){}
    }
    var parts=raw.split("#");
    var pathAndQuery=parts[0]||"/account";
    var hash=parts[1]||"";
    var q=pathAndQuery.indexOf("?");
    var path=q>=0?pathAndQuery.slice(0,q):pathAndQuery;
    var query=q>=0?pathAndQuery.slice(q+1):"";
    var params=new URLSearchParams(query);
    params.set("panel", panel);
    return (path||"/account")+"?"+params.toString()+(hash?"#"+hash:"");
  }
  function setCartLink(root, count, opts){
    var link=root.querySelector("[data-wb-shop-cart-link]");
    if(!link) return;
    link.hidden=false;
    var badge=link.querySelector("[data-wb-shop-cart-count]");
    if(!badge) return;
    var total=Math.max(0, Math.floor(Number(count)||0));
    badge.textContent=String(total);
    badge.hidden=total<=0;
    var accountHrefAttr=link.getAttribute("data-wb-shop-cart-account");
    // data-* hrefs are site-root paths from SSR; prefix /live/<subdomain> in local preview.
    if(accountHrefAttr) link.setAttribute("href", siteHref(accountHrefAttr));
  }
  var refreshInFlight={};
  var lastRefreshAt={};
  function refreshSession(id){
    if(refreshInFlight[id]) return refreshInFlight[id];
    refreshInFlight[id]=fetch(apiBase()+"/shop/"+id+"/auth/refresh", { method:"POST", credentials:"include", cache:"no-store" })
      .then(function(response){ if(response.ok) lastRefreshAt[id]=Date.now(); return response.ok; })
      .catch(function(){ return false; })
      .finally(function(){ delete refreshInFlight[id]; });
    return refreshInFlight[id];
  }
  function shopFetch(id, path, init){
    var startedAt=Date.now();
    var url=apiBase()+"/shop/"+id+"/auth"+path;
    function once(){ return fetch(url, Object.assign({ credentials:"include", cache:"no-store" }, init||{})); }
    return once().then(function(response){
      if(response.status!==401 || path==="/refresh" || path==="/login") return response;
      if((lastRefreshAt[id]||0)>=startedAt) return once();
      return refreshSession(id).then(function(ok){ return ok?once():response; });
    });
  }
  function refreshCartLinks(){
    document.querySelectorAll("[data-wb-shop][data-wb-shop-website]").forEach(function(root){
      var id=root.getAttribute("data-wb-shop-website");
      var link=root.querySelector("[data-wb-shop-cart-link]");
      if(!id||!link) return;
      var guest=root.getAttribute("data-wb-shop-guest")==="1";
      shopFetch(id, "/cart", { method:"GET" })
        .then(function(response){
          if(response.ok) return response.json().then(function(json){ return { json:json, guest:false }; }).catch(function(){ return null; });
          if(response.status===401 && guest){
            return shopFetch(id, "/guest/cart", { method:"GET" }).then(function(guestResponse){
              if(!guestResponse.ok){ link.hidden=true; return null; }
              return guestResponse.json().then(function(json){ return { json:json, guest:true }; }).catch(function(){ return null; });
            });
          }
          link.hidden=true;
          return null;
        })
        .then(function(result){
          if(!result||!result.json) return;
          var total=0;
          (result.json.cartItems||[]).forEach(function(item){ total+=Number(item.quantity||1); });
          setCartLink(root, total, { guest: !!result.guest });
        })
        .catch(function(){ link.hidden=true; });
    });
  }
  function loginVariant(node){
    var root=shopRoot(node);
    return root.getAttribute("data-wb-cart-login-variant")||"soft-card";
  }
  function messageBox(node){
    var scope=node.closest("[data-wb-product],[data-wb-detail],.wb-shop-actions")||node.parentElement;
    return scope&&scope.querySelector("[data-wb-cart-msg]");
  }
  function showMessage(node, text, kind){
    var box=messageBox(node);
    if(!box) return;
    box.hidden=!text;
    box.textContent=text||"";
    box.classList.toggle("is-error", kind==="error");
    box.classList.toggle("is-ok", kind==="ok");
  }
  function setWishlistButton(button, on){
    button.classList.toggle("is-active", !!on);
    button.setAttribute("aria-pressed", on?"true":"false");
    button.setAttribute("aria-label", on?"Remove from wishlist":"Add to wishlist");
    button.innerHTML='<span class="wb-wish-heart" aria-hidden="true">'+(on?"♥":"♡")+"</span>";
  }
  function closeModal(modal){
    if(!modal) return;
    modal.classList.remove("is-open");
    modal.hidden=true;
  }
  function openModal(modal){
    if(!modal) return;
    modal.hidden=false;
    modal.classList.add("is-open");
  }
  function loginModal(node){
    document.querySelectorAll(".wb-shop-actions [data-wb-cart-login-modal]").forEach(function(stale){ stale.remove(); });
    var modal=document.querySelector("body > [data-wb-cart-login-modal]");
    if(modal) return modal;
    modal=document.createElement("div");
    var site=node.closest(".wb-site");
    if(site&&site.getAttribute("style")) modal.setAttribute("style", site.getAttribute("style"));
    modal.className="wb-cart-login-modal";
    modal.setAttribute("data-wb-cart-login-modal","");
    modal.setAttribute("data-variant", loginVariant(node));
    modal.hidden=true;
    modal.innerHTML=
      '<button type="button" class="wb-cart-login-backdrop" aria-label="Close login prompt"></button>'+
      '<div class="wb-cart-login-dialog" role="dialog" aria-modal="true" aria-label="Login required">'+
        '<button type="button" class="wb-cart-login-close" aria-label="Close login prompt">×</button>'+
        '<p class="wb-cart-login-title">Login required</p>'+
        '<p class="wb-cart-login-text">Please log in to add products to your cart.</p>'+
        '<div class="wb-cart-login-actions">'+
          '<button type="button" class="wb-shop-btn is-cart">Not now</button>'+
          '<a class="wb-shop-btn is-buy">Login</a>'+
        "</div>"+
      "</div>";
    var loginLink=modal.querySelector(".wb-cart-login-actions .wb-shop-btn.is-buy");
    if(loginLink) loginLink.setAttribute("href", siteHref(authHref(node)));
    modal.querySelectorAll(".wb-cart-login-backdrop,.wb-cart-login-close,.wb-cart-login-actions .wb-shop-btn.is-cart").forEach(function(btn){
      btn.addEventListener("click", function(){ closeModal(modal); });
    });
    document.body.appendChild(modal);
    if(!window.__wbCartLoginEscBound){
      window.__wbCartLoginEscBound=true;
      window.addEventListener("keydown", function(event){
        if(event.key!=="Escape") return;
        document.querySelectorAll("[data-wb-cart-login-modal].is-open").forEach(function(open){ closeModal(open); });
      });
    }
    return modal;
  }
  function setBusy(button, busy){
    button.disabled=!!busy;
    button.classList.toggle("is-busy", !!busy);
  }
  var wishlistBySite={};
  function guestShopEnabled(id){
    return !!document.querySelector(
      '.wb-site[data-wb-shop-website="'+id+'"][data-wb-shop-guest="1"], [data-wb-shop-website="'+id+'"][data-wb-shop-guest="1"], [data-wb-detail][data-wb-shop-website="'+id+'"][data-wb-shop-guest="1"], [data-wb-account="'+id+'"][data-wb-shop-guest="1"]'
    );
  }
  function applyWishlistMap(id, items){
    var next={};
    (items||[]).forEach(function(item){
      var variantId=String(item.variantId||"");
      if(variantId) next[variantId]=1;
    });
    wishlistBySite[id]=next;
    document.querySelectorAll('[data-wb-shop-website="'+id+'"], [data-wb-detail][data-wb-shop-website]').forEach(function(root){
      applyWishlist(root, id);
    });
  }
  function applyWishlist(root, id){
    var wished=wishlistBySite[id]||{};
    root.querySelectorAll("[data-wb-wishlist-toggle]").forEach(function(button){
      var variantId=button.getAttribute("data-wb-variant-id")||"";
      setWishlistButton(button, !!wished[variantId]);
    });
  }
  function refreshGuestWishlist(id){
    return shopFetch(id, "/guest/wishlist", { method:"GET" })
      .then(function(response){
        if(!response.ok) return null;
        return response.json().catch(function(){ return {}; });
      })
      .then(function(json){
        if(!json) return;
        applyWishlistMap(id, json.wishlistItems||[]);
      });
  }
  function refreshWishlist(id){
    if(!id) return Promise.resolve();
    return shopFetch(id, "/wishlist", { method:"GET" })
      .then(function(response){
        if(response.ok) return response.json().catch(function(){ return {}; });
        if(response.status===401 && guestShopEnabled(id)) return refreshGuestWishlist(id).then(function(){ return null; });
        return null;
      })
      .then(function(json){
        if(!json) return;
        applyWishlistMap(id, json.wishlistItems||[]);
      });
  }
  function stockOf(button){
    var stock=Number(button.getAttribute("data-wb-stock")||0);
    return Number.isFinite(stock)?Math.max(0, Math.floor(stock)):0;
  }
  function qtyModal(node){
    document.querySelectorAll(".wb-shop-actions [data-wb-cart-qty-modal]").forEach(function(stale){ stale.remove(); });
    var modal=document.querySelector("body > [data-wb-cart-qty-modal]");
    if(modal) return modal;
    modal=document.createElement("div");
    var site=node.closest(".wb-site");
    if(site&&site.getAttribute("style")) modal.setAttribute("style", site.getAttribute("style"));
    modal.className="wb-cart-qty-modal";
    modal.setAttribute("data-wb-cart-qty-modal","");
    modal.hidden=true;
    modal.innerHTML=
      '<button type="button" class="wb-cart-login-backdrop" aria-label="Close quantity prompt"></button>'+
      '<div class="wb-cart-login-dialog is-qty" role="dialog" aria-modal="true" aria-label="Choose quantity">'+
        '<button type="button" class="wb-cart-login-close" aria-label="Close quantity prompt">×</button>'+
        '<p class="wb-cart-login-kicker" data-wb-qty-title>Add to cart</p>'+
        '<p class="wb-cart-login-title">Choose quantity</p>'+
        '<p class="wb-cart-login-text" data-wb-qty-text>Select how many units to add.</p>'+
        '<div class="wb-cart-qty-panel">'+
          '<div class="wb-cart-qty-row">'+
            '<button type="button" class="wb-cart-qty-step" data-wb-qty-dec aria-label="Decrease quantity">−</button>'+
            '<input class="wb-cart-qty-input" type="number" min="1" value="1" data-wb-qty-input aria-label="Quantity" />'+
            '<button type="button" class="wb-cart-qty-step" data-wb-qty-inc aria-label="Increase quantity">+</button>'+
          "</div>"+
          '<span class="wb-cart-qty-stock" data-wb-qty-stock></span>'+
        "</div>"+
        '<div class="wb-cart-login-actions is-stacked">'+
          '<button type="button" class="wb-shop-btn is-buy" data-wb-qty-confirm>Add to cart</button>'+
          '<button type="button" class="wb-shop-btn is-cart" data-wb-qty-cancel>Cancel</button>'+
        "</div>"+
      "</div>";
    modal.querySelectorAll(".wb-cart-login-backdrop,.wb-cart-login-close,[data-wb-qty-cancel]").forEach(function(btn){
      btn.addEventListener("click", function(){ closeModal(modal); });
    });
    document.body.appendChild(modal);
    if(!window.__wbCartQtyEscBound){
      window.__wbCartQtyEscBound=true;
      window.addEventListener("keydown", function(event){
        if(event.key!=="Escape") return;
        document.querySelectorAll("[data-wb-cart-qty-modal].is-open").forEach(function(open){ closeModal(open); });
      });
    }
    return modal;
  }
  function askQuantity(button, buy){
    var max=stockOf(button);
    if(max<=0 || button.disabled || button.getAttribute("aria-disabled")==="true"){
      showMessage(button, "This item is out of stock.", "error");
      return;
    }
    var modal=qtyModal(button);
    if(!modal) return;
    var input=modal.querySelector("[data-wb-qty-input]");
    var title=modal.querySelector("[data-wb-qty-title]");
    var text=modal.querySelector("[data-wb-qty-text]");
    var confirm=modal.querySelector("[data-wb-qty-confirm]");
    var dec=modal.querySelector("[data-wb-qty-dec]");
    var inc=modal.querySelector("[data-wb-qty-inc]");
    var stockLabel=modal.querySelector("[data-wb-qty-stock]");
    if(title) title.textContent=buy?"Buy now":"Add to cart";
    if(text) text.textContent=buy?"Select how many units to buy.":"Select how many units to add.";
    if(stockLabel) stockLabel.textContent=max+" in stock";
    if(confirm) confirm.textContent=buy?"Buy 1":"Add 1 to cart";
    if(input){
      input.min="1";
      input.max=String(max);
      input.value="1";
    }
    function clamp(){
      if(!input) return 1;
      var value=Math.floor(Number(input.value)||1);
      value=Math.max(1, Math.min(max, value));
      input.value=String(value);
      if(dec) dec.disabled=value<=1;
      if(inc) inc.disabled=value>=max;
      if(confirm) confirm.textContent=buy?("Buy "+value):("Add "+value+" to cart");
      return value;
    }
    clamp();
    if(dec) dec.onclick=function(){ if(input) input.value=String(Math.max(1, Number(input.value)-1)); clamp(); };
    if(inc) inc.onclick=function(){ if(input) input.value=String(Math.min(max, Number(input.value)+1)); clamp(); };
    if(input) input.oninput=clamp;
    if(confirm) confirm.onclick=function(){
      var qty=clamp();
      closeModal(modal);
      addToCart(button, buy, qty);
    };
    openModal(modal);
  }
  async function addToCart(button, buy, quantity){
    var id=websiteId(button);
    var variantId=button.getAttribute("data-wb-variant-id")||"";
    var max=stockOf(button);
    var qty=Math.max(1, Math.min(max||1, Math.floor(Number(quantity)||1)));
    if(!id||!variantId){
      showMessage(button, "Shop is not connected yet.", "error");
      return;
    }
    if(max<=0 || button.disabled || button.getAttribute("aria-disabled")==="true"){
      showMessage(button, "This item is out of stock.", "error");
      return;
    }
    setBusy(button, true);
    showMessage(button, "", "");
    try{
      var response=await shopFetch(id, "/cart", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ variantId:variantId, quantity:qty })
      });
      var json=await response.json().catch(function(){ return {}; });
      if(response.status===401){
        if(guestCheckoutEnabled(button)){
          response=await shopFetch(id, "/guest/cart", {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ variantId:variantId, quantity:qty })
          });
          json=await response.json().catch(function(){ return {}; });
          if(!response.ok){
            showMessage(button, (json.error&&json.error.message)||"Could not add to cart.", "error");
            return;
          }
        } else {
          var modal=loginModal(button);
          if(modal) modal.setAttribute("data-variant", loginVariant(button));
          openModal(modal);
          return;
        }
      } else if(!response.ok){
        showMessage(button, (json.error&&json.error.message)||"Could not add to cart.", "error");
        return;
      }
      if(buy){
        var cartUrl=accountPanelHref(accountHref(button), "cart");
        try{
          var buyUrl=new URL(cartUrl, window.location.origin);
          buyUrl.searchParams.set("checkout","1");
          window.location.href=/^(https?:)/i.test(cartUrl)?buyUrl.toString():siteHref(buyUrl.pathname+buyUrl.search+buyUrl.hash);
        }catch(_e){
          window.location.href=siteHref(cartUrl+(cartUrl.indexOf("?")>=0?"&":"?")+"checkout=1");
        }
        return;
      }
      showMessage(button, qty===1?"Added to cart.":("Added "+qty+" to cart."), "ok");
      var root=shopRoot(button);
      var link=root.querySelector("[data-wb-shop-cart-link]");
      if(link){
        var badge=link.querySelector("[data-wb-shop-cart-count]");
        var current=badge&&!badge.hidden?Number(badge.textContent||0):0;
        setCartLink(root, current+qty);
      } else {
        refreshCartLinks();
      }
    }catch(_e){
      showMessage(button, "Can't reach the server. Try again.", "error");
    }finally{
      setBusy(button, false);
    }
  }
  document.addEventListener("click", function(event){
    var wish=event.target&&event.target.closest&&event.target.closest("[data-wb-wishlist-toggle]");
    if(wish){
      event.preventDefault();
      event.stopPropagation();
      var wishWebsiteId=websiteId(wish);
      var variantId=wish.getAttribute("data-wb-variant-id")||"";
      if(!wishWebsiteId || !variantId){
        showMessage(wish, "Shop is not connected yet.", "error");
        return;
      }
      if(wish.disabled) return;
      var active=wish.classList.contains("is-active");
      setBusy(wish, true);
      showMessage(wish, "", "");
      var path=active?"/wishlist/"+encodeURIComponent(variantId):"/wishlist";
      var init=active
        ? { method:"DELETE" }
        : { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ variantId:variantId }) };
      shopFetch(wishWebsiteId, path, init).then(function(response){
        return response.json().catch(function(){ return {}; }).then(function(json){
          if(response.status===401){
            if(guestCheckoutEnabled(wish) || guestShopEnabled(wishWebsiteId)){
              var guestPath=active
                ? "/guest/wishlist/"+encodeURIComponent(variantId)
                : "/guest/wishlist";
              var guestInit=active
                ? { method:"DELETE" }
                : { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ variantId:variantId }) };
              return shopFetch(wishWebsiteId, guestPath, guestInit).then(function(guestResponse){
                return guestResponse.json().catch(function(){ return {}; }).then(function(guestJson){
                  if(!guestResponse.ok){
                    showMessage(wish, (guestJson.error&&guestJson.error.message)||"Could not update wishlist.", "error");
                    return;
                  }
                  applyWishlistMap(wishWebsiteId, guestJson.wishlistItems||[]);
                  showMessage(wish, active?"Removed from wishlist.":"Saved to wishlist.", "ok");
                });
              });
            }
            var modal=loginModal(wish);
            if(modal) modal.setAttribute("data-variant", loginVariant(wish));
            openModal(modal);
            return;
          }
          if(!response.ok){
            showMessage(wish, (json.error&&json.error.message)||"Could not update wishlist.", "error");
            return;
          }
          applyWishlistMap(wishWebsiteId, json.wishlistItems||[]);
          showMessage(wish, active?"Removed from wishlist.":"Saved to wishlist.", "ok");
        });
      }).catch(function(){
        showMessage(wish, "Can't reach the server. Try again.", "error");
      }).finally(function(){
        setBusy(wish, false);
      });
      return;
    }
    var button=event.target&&event.target.closest&&event.target.closest("[data-wb-cart-action]");
    if(!button) return;
    event.preventDefault();
    if(button.disabled || button.getAttribute("aria-disabled")==="true" || stockOf(button)<=0){
      showMessage(button, "This item is out of stock.", "error");
      return;
    }
    askQuantity(button, button.getAttribute("data-wb-cart-action")==="buy");
  });
  document.querySelectorAll("[data-wb-wishlist-toggle]").forEach(function(button){ setWishlistButton(button, false); });
  refreshCartLinks();
  document.querySelectorAll("[data-wb-shop-website]").forEach(function(root){
    var id=root.getAttribute("data-wb-shop-website");
    if(id) refreshWishlist(id);
  });
})();`;

/** Hides header Login CTAs on published pages once a shop customer session is active. */
export const SHOP_NAV_AUTH_SCRIPT = `(function(){
  if(window.__wbShopNavAuthReady) return;
  window.__wbShopNavAuthReady=1;
  function apiBase(){
    var meta=document.querySelector('meta[name="wb-api"]');
    var content=meta&&meta.getAttribute("content");
    return content?String(content).replace(/\\/$/,""):"/api";
  }
  function siteRoot(){ return document.querySelector(".wb-site"); }
  function websiteId(){
    var root=siteRoot();
    return (root&&root.getAttribute("data-wb-shop-website"))||"";
  }
  function apply(authed){
    var root=siteRoot();
    if(root) root.classList.toggle("is-shop-authed", !!authed);
  }
  var id=websiteId();
  if(!id || !document.querySelector("[data-wb-hide-when-authed]")) return;
  var base=apiBase()+"/shop/"+id+"/auth";
  function check(){
    return fetch(base+"/me", { credentials:"include", cache:"no-store" }).then(function(response){
      if(response.ok){ apply(true); return true; }
      if(response.status!==401){ apply(false); return false; }
      return fetch(base+"/refresh", { method:"POST", credentials:"include", cache:"no-store" })
        .then(function(refresh){
          if(!refresh.ok){ apply(false); return false; }
          return fetch(base+"/me", { credentials:"include", cache:"no-store" })
            .then(function(retry){ apply(!!retry.ok); return retry.ok; });
        })
        .catch(function(){ apply(false); return false; });
    }).catch(function(){ apply(false); return false; });
  }
  check();
})();`;

/** Guest checkout modal opened with ?wbGuestCheckout=1 */
export const SHOP_GUEST_CHECKOUT_SCRIPT = `(function(){
  if(window.__wbShopGuestCheckoutReady) return;
  window.__wbShopGuestCheckoutReady=1;
  function apiBase(){
    var meta=document.querySelector('meta[name="wb-api"]');
    var content=meta&&meta.getAttribute("content");
    return content?String(content).replace(/\\/$/,""):"/api";
  }
  function params(){ try{ return new URLSearchParams(window.location.search||""); }catch(_e){ return new URLSearchParams(); } }
  if(params().get("wbGuestCheckout")!=="1") return;
  var root=document.querySelector("[data-wb-shop-website][data-wb-shop-guest='1']");
  var websiteId=root&&root.getAttribute("data-wb-shop-website");
  if(!websiteId) return;
  function money(paise){
    try{ return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format((Number(paise)||0)/100); }
    catch(_e){ return "₹"+((Number(paise)||0)/100).toFixed(2); }
  }
  function loadRazorpay(){
    if(window.Razorpay) return Promise.resolve();
    return new Promise(function(resolve,reject){
      var script=document.createElement("script");
      script.src="https://checkout.razorpay.com/v1/checkout.js";
      script.onload=function(){ resolve(); };
      script.onerror=function(){ reject(new Error("Could not load Razorpay")); };
      document.head.appendChild(script);
    });
  }
  var modal=document.createElement("div");
  modal.className="wb-cart-login-modal is-open";
  modal.setAttribute("data-wb-guest-checkout-modal","");
  modal.innerHTML=
    '<button type="button" class="wb-cart-login-backdrop" aria-label="Close checkout"></button>'+
    '<div class="wb-cart-login-dialog" role="dialog" aria-modal="true" aria-label="Guest checkout" style="max-width:420px;text-align:left">'+
      '<button type="button" class="wb-cart-login-close" aria-label="Close checkout">×</button>'+
      '<p class="wb-cart-login-title">Checkout</p>'+
      '<p class="wb-cart-login-text" data-wb-guest-summary>Loading your cart…</p>'+
      '<form data-wb-guest-form class="wb-guest-checkout-form" style="display:grid;gap:8px;margin-top:12px">'+
        '<input required name="fullName" placeholder="Full name" style="height:36px;padding:0 10px;border:1px solid #ddd;border-radius:8px" />'+
        '<input required type="email" name="email" placeholder="Email for invoice" style="height:36px;padding:0 10px;border:1px solid #ddd;border-radius:8px" />'+
        '<input required name="phone" placeholder="Phone" style="height:36px;padding:0 10px;border:1px solid #ddd;border-radius:8px" />'+
        '<input required name="line1" placeholder="Address line 1" style="height:36px;padding:0 10px;border:1px solid #ddd;border-radius:8px" />'+
        '<input name="line2" placeholder="Address line 2 (optional)" style="height:36px;padding:0 10px;border:1px solid #ddd;border-radius:8px" />'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+
          '<input required name="city" placeholder="City" style="height:36px;padding:0 10px;border:1px solid #ddd;border-radius:8px" />'+
          '<input required name="state" placeholder="State" style="height:36px;padding:0 10px;border:1px solid #ddd;border-radius:8px" />'+
        "</div>"+
        '<input required name="postalCode" placeholder="PIN / postal code" style="height:36px;padding:0 10px;border:1px solid #ddd;border-radius:8px" />'+
        '<p data-wb-guest-error style="color:#b91c1c;font-size:13px;margin:0;display:none"></p>'+
        '<button type="submit" class="wb-shop-btn is-buy" data-wb-guest-pay>Pay now</button>'+
      "</form>"+
      '<div data-wb-guest-success hidden style="margin-top:12px">'+
        '<p class="wb-cart-login-title">Order placed</p>'+
        '<p class="wb-cart-login-text" data-wb-guest-success-text></p>'+
        '<a class="wb-shop-btn is-buy" data-wb-guest-track href="#">Track order</a>'+
      "</div>"+
    "</div>";
  document.body.appendChild(modal);
  function close(){
    modal.remove();
    try{
      var url=new URL(window.location.href);
      url.searchParams.delete("wbGuestCheckout");
      window.history.replaceState({}, "", url.pathname+url.search+url.hash);
    }catch(_e){}
  }
  modal.querySelectorAll(".wb-cart-login-backdrop,.wb-cart-login-close").forEach(function(btn){
    btn.addEventListener("click", close);
  });
  var summary=modal.querySelector("[data-wb-guest-summary]");
  var form=modal.querySelector("[data-wb-guest-form]");
  var errorBox=modal.querySelector("[data-wb-guest-error]");
  var payBtn=modal.querySelector("[data-wb-guest-pay]");
  fetch(apiBase()+"/shop/"+websiteId+"/auth/guest/cart",{credentials:"include",cache:"no-store"})
    .then(function(response){ return response.json().then(function(json){ return { ok:response.ok, json:json }; }); })
    .then(function(result){
      if(!result.ok){ summary.textContent=(result.json.error&&result.json.error.message)||"Could not load cart."; return; }
      var items=result.json.cartItems||[];
      if(!items.length){ summary.textContent="Your cart is empty."; form.hidden=true; return; }
      var total=0;
      var lines=items.map(function(item){
        total+=Number(item.pricePaise||0)*Number(item.quantity||1);
        return item.productName+" × "+item.quantity+" — "+money(Number(item.pricePaise||0)*Number(item.quantity||1));
      });
      summary.innerHTML=lines.map(function(line){ return "<div>"+line+"</div>"; }).join("")+"<strong style='display:block;margin-top:8px'>Total "+money(total)+"</strong>";
    })
    .catch(function(){ summary.textContent="Can't reach the server."; });
  form.addEventListener("submit", function(event){
    event.preventDefault();
    errorBox.style.display="none";
    payBtn.disabled=true;
    payBtn.textContent="Starting payment…";
    var data=new FormData(form);
    var payload={
      email:String(data.get("email")||"").trim(),
      fullName:String(data.get("fullName")||"").trim(),
      phone:String(data.get("phone")||"").trim(),
      address:{
        fullName:String(data.get("fullName")||"").trim(),
        phone:String(data.get("phone")||"").trim(),
        line1:String(data.get("line1")||"").trim(),
        line2:String(data.get("line2")||"").trim(),
        city:String(data.get("city")||"").trim(),
        state:String(data.get("state")||"").trim(),
        postalCode:String(data.get("postalCode")||"").trim(),
        country:"IN"
      }
    };
    fetch(apiBase()+"/shop/"+websiteId+"/auth/guest/checkout",{
      method:"POST",
      credentials:"include",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify(payload)
    }).then(function(response){
      return response.json().then(function(json){ return { ok:response.ok, json:json }; });
    }).then(function(result){
      if(!result.ok){
        errorBox.textContent=(result.json.error&&result.json.error.message)||"Checkout failed.";
        errorBox.style.display="block";
        payBtn.disabled=false;
        payBtn.textContent="Pay now";
        return;
      }
      var checkout=result.json.checkout||{};
      var trackUrl=checkout.trackUrl||"";
      return loadRazorpay().then(function(){
        return new Promise(function(resolve,reject){
          var rzp=new window.Razorpay({
            key:checkout.keyId,
            amount:checkout.amountPaise,
            currency:checkout.currency||"INR",
            name:checkout.businessName||"Shop",
            order_id:checkout.razorpayOrderId,
            prefill:checkout.prefill||{},
            handler:function(response){
              fetch(apiBase()+"/shop/"+websiteId+"/auth/guest/checkout/confirm",{
                method:"POST",
                credentials:"include",
                headers:{ "Content-Type":"application/json" },
                body:JSON.stringify({
                  razorpayOrderId:response.razorpay_order_id,
                  razorpayPaymentId:response.razorpay_payment_id,
                  razorpaySignature:response.razorpay_signature
                })
              }).then(function(confirmResponse){
                return confirmResponse.json().then(function(json){ return { ok:confirmResponse.ok, json:json }; });
              }).then(function(confirmResult){
                if(!confirmResult.ok){
                  reject(new Error((confirmResult.json.error&&confirmResult.json.error.message)||"Payment confirmation failed"));
                  return;
                }
                resolve({ order:confirmResult.json.order, trackUrl: (confirmResult.json.order&&confirmResult.json.order.trackUrl)||trackUrl });
              }).catch(reject);
            },
            modal:{ ondismiss:function(){ reject(new Error("Payment cancelled")); } }
          });
          rzp.open();
        });
      }).then(function(done){
        form.hidden=true;
        var success=modal.querySelector("[data-wb-guest-success]");
        var successText=modal.querySelector("[data-wb-guest-success-text]");
        var track=modal.querySelector("[data-wb-guest-track]");
        success.hidden=false;
        successText.textContent="Order #"+(done.order&&done.order.number?done.order.number:"")+" is confirmed. We emailed your invoice and tracking link.";
        if(done.trackUrl){ track.href=done.trackUrl; track.hidden=false; }
        else { track.hidden=true; }
      }).catch(function(err){
        errorBox.textContent=err&&err.message?err.message:"Payment failed.";
        errorBox.style.display="block";
        payBtn.disabled=false;
        payBtn.textContent="Pay now";
      });
    }).catch(function(){
      errorBox.textContent="Can't reach the server.";
      errorBox.style.display="block";
      payBtn.disabled=false;
      payBtn.textContent="Pay now";
    });
  });
})();`;

/** Public order tracking overlay opened with ?wbOrderTrack=TOKEN */
export const SHOP_TRACK_SCRIPT = `(function(){
  if(window.__wbShopTrackReady) return;
  window.__wbShopTrackReady=1;
  function apiBase(){
    var meta=document.querySelector('meta[name="wb-api"]');
    var content=meta&&meta.getAttribute("content");
    return content?String(content).replace(/\\/$/,""):"/api";
  }
  function params(){ try{ return new URLSearchParams(window.location.search||""); }catch(_e){ return new URLSearchParams(); } }
  function esc(value){
    return String(value==null?"":value)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  var token=params().get("wbOrderTrack");
  if(!token) return;
  var root=document.querySelector("[data-wb-shop-website]");
  var websiteId=root&&root.getAttribute("data-wb-shop-website");
  if(!websiteId) return;
  function money(paise){
    try{ return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format((Number(paise)||0)/100); }
    catch(_e){ return "₹"+((Number(paise)||0)/100).toFixed(2); }
  }
  var modal=document.createElement("div");
  modal.className="wb-order-track-modal";
  modal.setAttribute("data-wb-order-track-modal","");
  var site=document.querySelector(".wb-site");
  if(site&&site.getAttribute("style")) modal.setAttribute("style", site.getAttribute("style"));
  modal.innerHTML=
    '<button type="button" class="wb-order-track-backdrop" aria-label="Close order tracking"></button>'+
    '<div class="wb-order-track-dialog" role="dialog" aria-modal="true" aria-labelledby="wb-order-track-title">'+
      '<div class="wb-order-track-head">'+
        '<div class="wb-order-track-copy">'+
          '<p class="wb-order-track-kicker">Order tracking</p>'+
          '<h3 class="wb-order-track-title" id="wb-order-track-title">Order status</h3>'+
        "</div>"+
        '<button type="button" class="wb-order-track-close" aria-label="Close">×</button>'+
      "</div>"+
      '<div class="wb-order-track-body" data-wb-track-body>'+
        '<p class="wb-order-track-loading">Loading your order…</p>'+
      "</div>"+
      '<div class="wb-order-track-actions">'+
        '<a class="wb-acct-button is-pay" data-wb-track-invoice href="#" hidden>Download invoice</a>'+
        '<button type="button" class="wb-acct-button is-ghost" data-wb-track-close>Close</button>'+
      "</div>"+
    "</div>";
  var cs=site?window.getComputedStyle(site):null;
  var bg=(cs&&cs.getPropertyValue("--wb-bg").trim())||"#ffffff";
  var fg=(cs&&cs.getPropertyValue("--wb-text").trim())||"#1a1d23";
  var dialog=modal.querySelector(".wb-order-track-dialog");
  if(dialog){
    dialog.style.setProperty("background-color", bg, "important");
    dialog.style.setProperty("color", fg, "important");
  }
  document.body.appendChild(modal);
  function close(){
    modal.remove();
    try{
      var url=new URL(window.location.href);
      url.searchParams.delete("wbOrderTrack");
      window.history.replaceState({}, "", url.pathname+url.search+url.hash);
    }catch(_e){}
  }
  modal.querySelectorAll(".wb-order-track-backdrop,.wb-order-track-close,[data-wb-track-close]").forEach(function(btn){
    btn.addEventListener("click", close);
  });
  var body=modal.querySelector("[data-wb-track-body]");
  var invoice=modal.querySelector("[data-wb-track-invoice]");
  fetch(apiBase()+"/shop/"+websiteId+"/auth/track/"+encodeURIComponent(token),{credentials:"include",cache:"no-store"})
    .then(function(response){ return response.json().then(function(json){ return { ok:response.ok, json:json }; }); })
    .then(function(result){
      if(!result.ok){
        body.innerHTML='<p class="wb-order-track-error">'+esc((result.json.error&&result.json.error.message)||"Order not found.")+"</p>";
        return;
      }
      var order=result.json.order||{};
      var status=String(order.status||"pending");
      var statusClass=status.replace(/[^a-z0-9-]/gi,"").toLowerCase();
      var items=(order.items||[]).map(function(item){
        return '<li class="wb-order-track-item">'+
          '<div class="wb-order-track-item-main">'+
            "<strong>"+esc(item.productName||"Item")+"</strong>"+
            "<span>"+esc(item.variantName||"")+(item.variantName?" · ":"")+"Qty "+esc(item.quantity)+"</span>"+
          "</div>"+
          '<div class="wb-order-track-item-price">'+esc(money(item.lineTotalPaise))+"</div>"+
        "</li>";
      }).join("");
      body.innerHTML=
        '<div class="wb-order-track-summary">'+
          '<p class="wb-order-track-row"><span>Order</span><strong>#'+esc(order.number||"")+"</strong></p>"+
          '<p class="wb-order-track-row"><span>Status</span><strong><span class="wb-order-track-badge is-'+esc(statusClass)+'">'+esc(status)+"</span></strong></p>"+
          '<p class="wb-order-track-row"><span>Total</span><strong>'+esc(money(order.totalPaise))+"</strong></p>"+
        "</div>"+
        (items?'<ul class="wb-order-track-items">'+items+"</ul>":"");
      if(order.canDownloadInvoice){
        invoice.hidden=false;
        invoice.href=apiBase()+"/shop/"+websiteId+"/auth/track/"+encodeURIComponent(token)+"/invoice?format=pdf";
      }
    })
    .catch(function(){
      body.innerHTML='<p class="wb-order-track-error">Can\\'t reach the server.</p>';
    });
})();`;
