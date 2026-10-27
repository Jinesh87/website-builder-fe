export type ShopCustomer = {
  id: string;
  websiteId: string;
  email: string;
  fullName: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
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
};

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
          window.location.href="/";
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
