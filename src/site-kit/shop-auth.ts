export type ShopCustomer = {
  id: string;
  websiteId: string;
  email: string;
  fullName: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
};

export type ShopOrderSummary = {
  id: string;
  number: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  totalPaise: number;
  currency: "INR";
  createdAt: string;
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

export type ShopCustomerAccount = {
  customer: ShopCustomer;
  orders: ShopOrderSummary[];
  cartItems: ShopCartItemSummary[];
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

async function shopAuthFetch(
  websiteId: string,
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${apiBase()}/shop/${websiteId}/auth${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
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
  function request(base, path, method, body){
    return fetch(base+path, { method:method, headers:body?{ "Content-Type":"application/json" }:{}, credentials:"include", cache:"no-store", body:body?JSON.stringify(body):undefined })
      .then(function(response){
        if(response.status===204) return { ok:true, status:204, json:{} };
        return response.json().catch(function(){ return {}; }).then(function(json){ return { ok:response.ok, status:response.status, json:json }; });
      });
  }
  function fill(root, account){
    var customer=account.customer||{};
    var orders=account.orders||[];
    var cart=account.cartItems||[];
    setText(root, "fullName", customer.fullName||"");
    setText(root, "email", customer.email||"");
    setText(root, "initials", initials(customer.fullName));
    setText(root, "memberSince", day(customer.createdAt));
    root.querySelectorAll('[data-wb-account-count="orders"]').forEach(function(node){ node.textContent=String(orders.length); });
    var count=0; cart.forEach(function(item){ count+=Number(item.quantity||1); });
    root.querySelectorAll('[data-wb-account-count="cart"]').forEach(function(node){ node.textContent=String(count); });
    root.querySelectorAll('input[name="fullName"]').forEach(function(input){ input.value=customer.fullName||""; });
    root.querySelectorAll('input[name="phone"]').forEach(function(input){ input.value=customer.phone||""; });
    root.querySelectorAll('input[name="email"]').forEach(function(input){ input.value=customer.email||""; });

    var orderList=root.querySelector('[data-wb-account-list="orders"]');
    var orderEmpty=root.querySelector('[data-wb-account-empty="orders"]');
    if(orderList){
      orderList.innerHTML="";
      orders.forEach(function(order){
        var row=el("li","wb-acct-row");
        var main=el("div","wb-acct-row-main");
        main.appendChild(el("strong","","Order #"+String(order.number||order.id||"")));
        main.appendChild(el("span","wb-acct-row-sub",day(order.createdAt)));
        row.appendChild(main);
        row.appendChild(el("span","wb-acct-badge is-"+String(order.status||"pending"),String(order.status||"pending")));
        row.appendChild(el("strong","wb-acct-row-amount",money(order.totalPaise)));
        orderList.appendChild(row);
      });
      orderList.hidden=orders.length===0;
    }
    if(orderEmpty) orderEmpty.hidden=orders.length>0;

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
  }
  function bind(root, base, loginHref){
    if(root.getAttribute("data-wb-account-bound")) return;
    root.setAttribute("data-wb-account-bound","1");
    var tabs=Array.prototype.slice.call(root.querySelectorAll("[data-wb-account-tab]"));
    tabs.forEach(function(tab){
      tab.addEventListener("click", function(){
        var name=tab.getAttribute("data-wb-account-tab");
        tabs.forEach(function(other){
          var on=other===tab;
          other.classList.toggle("is-active", on);
          other.setAttribute("aria-selected", on?"true":"false");
        });
        root.querySelectorAll("[data-wb-account-panel]").forEach(function(panel){
          panel.hidden=panel.getAttribute("data-wb-account-panel")!==name;
        });
      });
    });
    root.querySelectorAll("[data-wb-account-logout]").forEach(function(button){
      button.addEventListener("click", function(){
        request(base, "/logout", "POST").catch(function(){}).then(function(){ window.location.href=siteHref(loginHref); });
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
    root.addEventListener("click", function(event){
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
  document.querySelectorAll("[data-wb-account]").forEach(function(root){
    if(root.getAttribute("data-wb-account-ready")) return;
    root.setAttribute("data-wb-account-ready","1");
    var websiteId=root.getAttribute("data-wb-account");
    var loginHref=root.getAttribute("data-wb-account-login")||"/login";
    var redirect=root.getAttribute("data-wb-account-redirect")==="1";
    root.querySelectorAll("[data-wb-account-login]").forEach(function(link){ if(link.tagName==="A") link.setAttribute("href", siteHref(loginHref)); });
    if(!websiteId){ showState(root, "guest"); return; }
    var base=apiBase()+"/shop/"+websiteId+"/auth";
    request(base, "/account", "GET")
      .then(function(result){
        if(!result.ok) throw new Error("no-session");
        fill(root, result.json||{});
        bind(root, base, loginHref);
        showState(root, "member");
      })
      .catch(function(){
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
  function goState(root, state){
    var box=root.closest("[data-wb-states]")||root.querySelector("[data-wb-states]");
    if(!box) return;
    box.querySelectorAll("[data-wb-state]").forEach(function(node){
      node.hidden=node.getAttribute("data-wb-state")!==state;
    });
  }
  function pendingEmail(root, value){
    if(value!==undefined) root.setAttribute("data-wb-pending-email", value||"");
    return root.getAttribute("data-wb-pending-email")||"";
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
        .then(function(response){ if(response.ok) window.location.replace(successHref(root)); })
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
      var codeInput=form.querySelector('input[name="code"]');
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
        body={ email:(emailInput&&emailInput.value||"").trim().toLowerCase(), password:passwordInput&&passwordInput.value||"", remember:!!(remember&&remember.checked) };
      } else if(view==="forgot"){
        path="/forgot-password";
        body={ email:(emailInput&&emailInput.value||"").trim().toLowerCase() };
      } else if(view==="otp"){
        path="/verify-email";
        body={ email:pendingEmail(root), code:codeInput&&codeInput.value||"" };
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
      var response=await fetch(apiBase()+"/shop/"+id+"/auth/cart", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        credentials:"include",
        cache:"no-store",
        body:JSON.stringify({ variantId:variantId, quantity:qty })
      });
      var json=await response.json().catch(function(){ return {}; });
      if(response.status===401){
        var modal=loginModal(button);
        if(modal) modal.setAttribute("data-variant", loginVariant(button));
        openModal(modal);
        return;
      }
      if(!response.ok){
        showMessage(button, (json.error&&json.error.message)||"Could not add to cart.", "error");
        return;
      }
      if(buy){
        window.location.href=siteHref(accountHref(button));
        return;
      }
      showMessage(button, qty===1?"Added to cart.":("Added "+qty+" to cart."), "ok");
    }catch(_e){
      showMessage(button, "Can't reach the server. Try again.", "error");
    }finally{
      setBusy(button, false);
    }
  }
  document.addEventListener("click", function(event){
    var button=event.target&&event.target.closest&&event.target.closest("[data-wb-cart-action]");
    if(!button) return;
    event.preventDefault();
    if(button.disabled || button.getAttribute("aria-disabled")==="true" || stockOf(button)<=0){
      showMessage(button, "This item is out of stock.", "error");
      return;
    }
    askQuantity(button, button.getAttribute("data-wb-cart-action")==="buy");
  });
})();`;
