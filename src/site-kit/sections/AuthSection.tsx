import { toPlainText } from "../rich-text-core.ts";
import { parseRichText } from "../rich-text.tsx";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { safeHref } from "../links.ts";
import { SectionShell, SiteImage, SocialIcon } from "../primitives.tsx";
import { StaticStates, useStaticRender } from "../render-mode.tsx";
import { fullNameFromForm, SHOP_AUTH_SCRIPT, shopAuthApi, siteHref, type ShopAuthError } from "../shop-auth.ts";
import { useShopCatalog } from "../shop-catalog.tsx";
import { contrastText } from "../theme.ts";
import type {
  AuthData,
  AuthField,
  AuthSocialLink,
  AuthSocialProvider,
  AuthVariant,
  AuthView,
  SectionOf,
} from "../types.ts";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const PROVIDER_LABELS: Record<AuthSocialProvider, string> = {
  google: "Google",
  apple: "Apple",
  github: "GitHub",
  facebook: "Facebook",
  x: "X",
  linkedin: "LinkedIn",
  microsoft: "Microsoft",
};

/* ------------------------------------------------------------------ icons */

function Svg({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const FIELD_ICONS: Partial<Record<AuthField["type"], ReactNode>> = {
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  password: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </>
  ),
  "confirm-password": (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  text: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0112 0v1" />
    </>
  ),
  tel: (
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
  ),
  date: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  number: <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />,
};

function EyeIcon({ open }: { open: boolean }) {
  return (
    <Svg>
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <path d="M1 1l22 22" />
        </>
      )}
    </Svg>
  );
}

function ArrowLeftIcon() {
  return (
    <Svg className="wb-auth-inline-icon">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function CheckBadgeIcon() {
  return (
    <Svg className="wb-auth-success-icon">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </Svg>
  );
}

function ProviderIcon({ provider }: { provider: AuthSocialProvider }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 01-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0012 24z" />
        <path fill="#FBBC05" d="M5.29 14.28a7.2 7.2 0 010-4.56v-3.1H1.28a12 12 0 000 10.76l4.01-3.1z" />
        <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0012 0 12 12 0 001.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
      </svg>
    );
  }
  if (provider === "apple") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.37 12.62c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.4-3.66zM14.1 5.88c.63-.77 1.06-1.83.94-2.88-.91.04-2.01.61-2.66 1.37-.58.67-1.1 1.76-.96 2.79 1.01.08 2.05-.52 2.68-1.28z" />
      </svg>
    );
  }
  if (provider === "microsoft") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
        <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
        <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
        <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
      </svg>
    );
  }
  return <SocialIcon platform={provider} />;
}

/* ------------------------------------------------------------- flow state */

type DoneState = "forgot" | "complete" | null;

type AuthFlow = {
  view: AuthView;
  done: DoneState;
  error: string | null;
  busy: boolean;
  goTo: (view: AuthView) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  restart: () => void;
  resend?: () => void;
};

function isViewEnabled(data: AuthData, view: AuthView): boolean {
  if (view === "login" || view === "reset") return true;
  if (view === "otp") return Boolean(data.otp?.enabled);
  return Boolean(data[view]?.enabled);
}

function initialView(data: AuthData, websiteId?: string): AuthView {
  if (websiteId && typeof window !== "undefined") {
    const token = new URLSearchParams(window.location.search).get("reset");
    if (token) return "reset";
  }
  const wanted = data.defaultView ?? "login";
  return isViewEnabled(data, wanted) ? wanted : "login";
}

function otpRequiredAfter(data: AuthData, view: AuthView): boolean {
  if (!data.otp?.enabled) return false;
  if (view === "login") return Boolean(data.otp.requireOnLogin);
  if (view === "register") return Boolean(data.otp.requireOnRegister);
  if (view === "forgot") return Boolean(data.otp.requireOnForgot);
  return false;
}

function passwordsMismatch(form: HTMLFormElement): boolean {
  const password = form.querySelector<HTMLInputElement>("input[data-auth-type='password']");
  const confirms = form.querySelectorAll<HTMLInputElement>("input[data-auth-type='confirm-password']");
  if (!password) return false;
  return Array.from(confirms).some((input) => input.value !== password.value);
}

/** Where a signed-in customer goes: the section's own success link when it is a page, else the site's account page. */
function accountPageHref(data: AuthData, fallback?: string): string {
  const own = data.successLink?.href?.trim();
  if (own && own.startsWith("/") && !own.startsWith("//") && own !== "/") return own;
  return fallback || "/account";
}

function authErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) return String((error as ShopAuthError).message);
  return "Something went wrong. Please try again.";
}


function useAuthFlow(data: AuthData, websiteId?: string, accountHref = "/account"): AuthFlow {
  const shopLive = Boolean(websiteId);
  const [view, setView] = useState<AuthView>(() => initialView(data, websiteId));
  const [done, setDone] = useState<DoneState>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [otpFrom, setOtpFrom] = useState<AuthView | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resetToken, setResetToken] = useState(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("reset") ?? "" : "",
  );
  const start = initialView(data, websiteId);

  useEffect(() => {
    setView(start);
    setDone(null);
    setError(null);
    setOtpFrom(null);
  }, [start]);

  const activeView = view === "reset" || view === "otp" || isViewEnabled(data, view) ? view : "login";

  function goTo(next: AuthView) {
    setView(next === "reset" || next === "otp" || isViewEnabled(data, next) ? next : "login");
    setDone(null);
    setError(null);
  }

  async function submitShop(form: HTMLFormElement) {
    if (!websiteId) return;
    const email =
      form.querySelector<HTMLInputElement>('input[name="email"], input[type="email"]')?.value.trim().toLowerCase() ?? "";
    const password =
      form.querySelector<HTMLInputElement>('input[name="password"], input[data-auth-type="password"]')?.value ?? "";
    const rememberInput = form.querySelector<HTMLInputElement>('input[name="remember"]');
    const remember = rememberInput ? rememberInput.checked : true;
    const code = form.querySelector<HTMLInputElement>('input[name="code"]')?.value.trim() ?? "";

    setBusy(true);
    setError(null);
    try {
      if (activeView === "register") {
        if (passwordsMismatch(form)) {
          setError("Passwords don't match.");
          return;
        }
        await shopAuthApi.signup(websiteId, { email, password, fullName: fullNameFromForm(form) });
        setPendingEmail(email);
        setOtpFrom("register");
        setView("otp");
        return;
      }
      if (activeView === "login") {
        await shopAuthApi.login(websiteId, { email, password, remember });
        window.location.href = siteHref(accountHref);
        return;
      }
      if (activeView === "forgot") {
        await shopAuthApi.forgotPassword(websiteId, email);
        setDone("forgot");
        return;
      }
      if (activeView === "otp") {
        await shopAuthApi.verifyEmail(websiteId, pendingEmail || email, code);
        window.location.href = siteHref(accountHref);
        return;
      }
      if (activeView === "reset") {
        if (passwordsMismatch(form)) {
          setError("Passwords don't match.");
          return;
        }
        await shopAuthApi.resetPassword(websiteId, resetToken, password);
        setResetToken("");
        window.location.href = siteHref(accountHref);
      }
    } catch (err) {
      const shopErr = err as ShopAuthError;
      if (shopErr.code === "EMAIL_NOT_VERIFIED") {
        setPendingEmail(email);
        setOtpFrom("login");
        setView("otp");
        return;
      }
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (shopLive) {
      void submitShop(form);
      return;
    }
    if (activeView === "register" && passwordsMismatch(form)) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);

    if (activeView === "otp") {
      setDone(otpFrom === "forgot" ? "forgot" : "complete");
      return;
    }
    if (otpRequiredAfter(data, activeView)) {
      setOtpFrom(activeView);
      setView("otp");
      return;
    }
    setDone(activeView === "forgot" ? "forgot" : "complete");
  }

  function restart() {
    setOtpFrom(null);
    goTo("login");
  }

  async function resend() {
    if (!websiteId || !pendingEmail) return;
    try {
      await shopAuthApi.resendVerification(websiteId, pendingEmail);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  }

  return { view: activeView, done, error, busy, goTo, submit, restart, resend: shopLive ? resend : undefined };
}

/** A fixed view for the static export; the export runtime switches views instead of React state. */
function staticFlow(view: AuthView): AuthFlow {
  const noop = () => {};
  return { view, done: null, error: null, busy: false, goTo: noop, submit: (event) => event.preventDefault(), restart: noop };
}

const STATIC_VIEWS: AuthView[] = ["login", "register", "forgot", "otp", "reset"];

/* ---------------------------------------------------------- form building */

function FieldControl({ field, data, isNewAccount }: { field: AuthField; data: AuthData; isNewAccount: boolean }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = field.type === "password" || field.type === "confirm-password";
  const icon = data.showFieldIcons ? FIELD_ICONS[field.type] : undefined;
  const showLabels = data.showLabels ?? true;
  const widthClass = field.width === "half" ? "wb-auth-field-half" : "wb-auth-field-full";

  if (field.type === "checkbox") {
    return (
      <label className={`wb-auth-field wb-auth-check ${widthClass}`}>
        <input type="checkbox" name={field.name} required={field.required} />
        <span>{field.label}</span>
      </label>
    );
  }

  const inputType = isPassword ? (visible ? "text" : "password") : field.type;
  const autoComplete =
    field.type === "email"
      ? "email"
      : field.type === "password"
        ? isNewAccount
          ? "new-password"
          : "current-password"
        : field.type === "confirm-password"
          ? "new-password"
          : field.type === "tel"
            ? "tel"
            : undefined;

  return (
    <div className={`wb-auth-field ${widthClass}`}>
      <label htmlFor={id} className={showLabels ? "wb-auth-label" : "wb-auth-sr-only"}>
        {field.label}
        {field.required && showLabels ? <span className="wb-auth-required" aria-hidden="true"> *</span> : null}
      </label>
      <div className={`wb-auth-control${icon ? " wb-auth-has-icon" : ""}${isPassword && data.showPasswordToggle !== false ? " wb-auth-has-toggle" : ""}`}>
        {icon && <Svg className="wb-auth-field-icon">{icon}</Svg>}
        {field.type === "select" ? (
          <select id={id} name={field.name} required={field.required} defaultValue="" className="wb-auth-input">
            <option value="" disabled>
              {field.placeholder || `Select ${field.label.toLowerCase()}`}
            </option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            name={field.name}
            type={inputType}
            data-auth-type={field.type}
            placeholder={field.placeholder}
            required={field.required}
            autoComplete={autoComplete}
            className="wb-auth-input"
          />
        )}
        {isPassword && data.showPasswordToggle !== false && (
          <button
            type="button"
            className="wb-auth-toggle"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            <EyeIcon open={visible} />
          </button>
        )}
      </div>
    </div>
  );
}

function OtpInput({ length }: { length: number }) {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setDigits(Array.from({ length }, () => ""));
  }, [length]);

  function setDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((d, i) => (i === index ? digit : d)));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    setDigits(Array.from({ length }, (_, i) => pasted[i] ?? ""));
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div className="wb-auth-otp" role="group" aria-label="Verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          className="wb-auth-otp-cell"
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          required
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1}`}
          value={digit}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={onPaste}
        />
      ))}
      <input type="hidden" name="code" value={digits.join("")} />
    </div>
  );
}

function ResendTimer({ seconds, label, onResend }: { seconds: number; label: string; onResend?: () => void }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) return;
    const timer = setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  return (
    <p className="wb-auth-resend">
      Didn't get it?{" "}
      <button
        type="button"
        className="wb-auth-link"
        data-wb-shop-auth-resend=""
        disabled={left > 0}
        onClick={() => {
          setLeft(seconds);
          onResend?.();
        }}
      >
        {left > 0 ? `${label} in ${left}s` : label}
      </button>
    </p>
  );
}

function SocialRow({ data }: { data: AuthData }) {
  const style = data.social.style ?? "icons";
  return (
    <div className={`wb-auth-social wb-auth-social-${style}`}>
      {data.social.providers.map((link: AuthSocialLink) => {
        const name = PROVIDER_LABELS[link.provider] ?? link.provider;
        const content = (
          <>
            <span className="wb-auth-social-icon">
              <ProviderIcon provider={link.provider} />
            </span>
            {style === "full" && <span>Continue with {name}</span>}
          </>
        );
        const label = `Continue with ${name}`;
        return !link.href || link.href === "#" ? (
          <button key={link.provider} type="button" className="wb-auth-social-btn" aria-label={label}>
            {content}
          </button>
        ) : (
          <a key={link.provider} href={safeHref(link.href)} className="wb-auth-social-btn" aria-label={label}>
            {content}
          </a>
        );
      })}
    </div>
  );
}

function Divider({ label }: { label?: string }) {
  return (
    <div className="wb-auth-divider" role="separator">
      {label && <span>{label}</span>}
    </div>
  );
}

function AuthBrand({ data, className = "" }: { data: AuthData; className?: string }) {
  if (!data.brandName && !data.logo?.url) return null;
  return (
    <div className={`wb-auth-brand ${className}`}>
      {data.logo?.url ? (
        <SiteImage image={data.logo} className="wb-auth-logo" />
      ) : (
        <span className="wb-auth-mark" aria-hidden="true">
          {data.brandName?.trim().charAt(0).toUpperCase()}
        </span>
      )}
      {data.brandName && <span className="wb-auth-brand-name">{data.brandName}</span>}
    </div>
  );
}

type AuthFormProps = {
  data: AuthData;
  flow: AuthFlow;
  /** Login/register switch links are replaced by tabs in some layouts. */
  hideSwitch?: boolean;
};

const RESET_FIELDS: AuthField[] = [
  { name: "password", label: "New password", type: "password", placeholder: "Enter a strong password", required: true, width: "full" },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "confirm-password",
    placeholder: "Re-enter your password",
    required: true,
    width: "full",
  },
];

function viewContent(data: AuthData, view: AuthView) {
  if (view === "register") return data.register;
  if (view === "forgot") return data.forgot;
  if (view === "otp") return data.otp;
  if (view === "reset") {
    return {
      heading: "Choose a new password",
      subheading: "Enter a new password for your account.",
      fields: RESET_FIELDS,
      submitLabel: "Update password",
    };
  }
  return data.login;
}

function AuthForm({ data, flow, hideSwitch, shopLive }: AuthFormProps & { shopLive?: boolean }) {
  const { view, done, error, busy, goTo, submit, restart, resend } = flow;
  const content = viewContent(data, view);
  const socialEnabled =
    !shopLive &&
    data.social.enabled &&
    data.social.providers.length > 0 &&
    (view === "login" || (view === "register" && data.social.showOnRegister !== false));
  const socialTop = data.social.position === "top";
  const animationKey = `${view}-${done ?? "form"}`;

  if (done) {
    const forgot = done === "forgot";
    return (
      <div key={animationKey} className="wb-auth-view wb-auth-success" role="status" aria-live="polite">
        <CheckBadgeIcon />
        <h2 className="wb-auth-title">{forgot ? data.forgot.successHeading || "Check your inbox" : data.successHeading || "You're all set"}</h2>
        {(forgot ? data.forgot.successText : data.successText) && (
          <p className="wb-auth-subtitle">{forgot ? data.forgot.successText : data.successText}</p>
        )}
        <div className="wb-auth-success-actions">
          {!forgot && data.successLink && (
            <a href={safeHref(data.successLink.href)} className="wb-auth-submit">
              {data.successLink.label}
            </a>
          )}
          <button type="button" className="wb-auth-link wb-auth-back" onClick={restart}>
            <ArrowLeftIcon /> {data.forgot.backLabel || "Back to log in"}
          </button>
        </div>
      </div>
    );
  }

  const fields = view === "otp" ? [] : (content as { fields: AuthField[] }).fields;

  return (
    <div key={animationKey} className="wb-auth-view">
      <header className="wb-auth-head">
        <h2 className="wb-auth-title">{parseRichText(content.heading)}</h2>
        {content.subheading && <p className="wb-auth-subtitle">{parseRichText(content.subheading)}</p>}
      </header>

      {socialEnabled && socialTop && (
        <>
          <SocialRow data={data} />
          <Divider label={data.social.label} />
        </>
      )}

      <form className="wb-auth-form" onSubmit={submit} aria-label={toPlainText(content.heading)}>
        {view === "otp" ? (
          <OtpInput length={data.otp.length} />
        ) : (
          <div className="wb-auth-fields">
            {fields.map((field, index) => (
              <FieldControl
                key={`${view}-${field.name}-${index}`}
                field={field}
                data={data}
                isNewAccount={view === "register" || view === "reset"}
              />
            ))}
          </div>
        )}

        {view === "login" && (data.login.showRemember || data.forgot.enabled) && (
          <div className="wb-auth-row">
            {data.login.showRemember ? (
              <label className="wb-auth-check">
                <input type="checkbox" name="remember" defaultChecked />
                <span>{data.login.rememberLabel || "Remember me"}</span>
              </label>
            ) : (
              <span />
            )}
            {data.forgot.enabled && (
              <button type="button" className="wb-auth-link" onClick={() => goTo("forgot")} data-wb-go="forgot">
                {data.login.forgotLabel || "Forgot password?"}
              </button>
            )}
          </div>
        )}

        {view === "register" && data.register.showTerms && (
          <label className="wb-auth-check wb-auth-terms">
            <input type="checkbox" name="terms" required />
            <span>
              {data.register.termsText || "I accept the"}{" "}
              {data.register.termsLink && (
                <a href={safeHref(data.register.termsLink.href)} className="wb-auth-link">
                  {data.register.termsLink.label}
                </a>
              )}
            </span>
          </label>
        )}

        {error && (
          <p className="wb-auth-error" role="alert" data-wb-shop-auth-error="">
            {error}
          </p>
        )}

        <button type="submit" className="wb-auth-submit" disabled={busy}>
          {busy ? "Please wait…" : content.submitLabel}
        </button>

        {view === "otp" && data.otp.resendLabel && (
          <ResendTimer seconds={data.otp.resendSeconds ?? 30} label={data.otp.resendLabel} onResend={resend} />
        )}
      </form>

      {socialEnabled && !socialTop && (
        <>
          <Divider label={data.social.label} />
          <SocialRow data={data} />
        </>
      )}

      {view === "login" && !hideSwitch && data.register.enabled && (
        <p className="wb-auth-switch">
          {data.login.switchPrompt}{" "}
          <button type="button" className="wb-auth-link" onClick={() => goTo("register")} data-wb-go="register">
            {data.login.switchLabel || "Sign up"}
          </button>
        </p>
      )}
      {view === "register" && !hideSwitch && (
        <p className="wb-auth-switch">
          {data.register.switchPrompt}{" "}
          <button type="button" className="wb-auth-link" onClick={() => goTo("login")} data-wb-go="login">
            {data.register.switchLabel || "Log in"}
          </button>
        </p>
      )}
      {(view === "forgot" || view === "otp" || view === "reset") && (
        <p className="wb-auth-switch">
          <button type="button" className="wb-auth-link wb-auth-back" onClick={() => goTo("login")} data-wb-go="login">
            <ArrowLeftIcon /> {data.forgot.backLabel || "Back to log in"}
          </button>
        </p>
      )}

      {data.footerNote && <p className="wb-auth-note">{data.footerNote}</p>}
    </div>
  );
}

function AuthTabs({ data, flow }: { data: AuthData; flow: AuthFlow }) {
  if (!data.register.enabled || flow.done || (flow.view !== "login" && flow.view !== "register")) return null;
  const tabs: { view: AuthView; label: string }[] = [
    { view: "login", label: data.login.submitLabel },
    { view: "register", label: data.register.submitLabel },
  ];
  return (
    <div className="wb-auth-tabs" role="tablist" aria-label="Account">
      {tabs.map((tab) => (
        <button
          key={tab.view}
          type="button"
          role="tab"
          aria-selected={flow.view === tab.view}
          className="wb-auth-tab"
          onClick={() => flow.goTo(tab.view)}
          data-wb-go={tab.view}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- layouts */

function panelCopy(data: AuthData, view: AuthView) {
  const panel = data.panel ?? {};
  const registerOpen = view === "register";
  return {
    heading: (registerOpen && panel.registerHeading) || panel.heading,
    text: (registerOpen && panel.registerText) || panel.text,
  };
}

/** The view the brand panel's button should open next. */
function panelSwitch(data: AuthData, view: AuthView): { view: AuthView; label: string } | null {
  if (view === "register") return { view: "login", label: data.register.switchLabel || "Log in" };
  if (view === "login") return data.register.enabled ? { view: "register", label: data.login.switchLabel || "Sign up" } : null;
  return { view: "login", label: data.forgot.backLabel || "Back to log in" };
}

function Highlights({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="wb-auth-highlights">
      {items.map((item, index) => (
        <li key={index}>
          <Svg className="wb-auth-inline-icon">
            <path d="M20 6L9 17l-5-5" />
          </Svg>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Testimonial({ data }: { data: AuthData }) {
  const testimonial = data.panel?.testimonial;
  if (!testimonial?.quote) return null;
  return (
    <figure className="wb-auth-quote">
      <blockquote>“{parseRichText(testimonial.quote)}”</blockquote>
      <figcaption>
        {testimonial.avatar?.url ? (
          <SiteImage image={testimonial.avatar} className="wb-auth-avatar" />
        ) : (
          <span className="wb-auth-avatar wb-auth-avatar-fallback" aria-hidden="true">
            {testimonial.name.charAt(0)}
          </span>
        )}
        <span>
          <strong>{testimonial.name}</strong>
          {testimonial.role && <small>{testimonial.role}</small>}
        </span>
      </figcaption>
    </figure>
  );
}

function Blobs({ count = 3 }: { count?: number }) {
  return (
    <div className="wb-auth-blobs" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

type LayoutProps = { data: AuthData; flow: AuthFlow; form: ReactNode };

function DiagonalSplit({ data, flow, form }: LayoutProps) {
  const copy = panelCopy(data, flow.view);
  const next = panelSwitch(data, flow.view);
  return (
    <div className="wb-auth-diagonal">
      <aside className="wb-auth-panel">
        <AuthBrand data={data} />
        <div key={flow.view} className="wb-auth-panel-body">
          {copy.heading && <h2 className="wb-auth-panel-title">{parseRichText(copy.heading)}</h2>}
          {copy.text && <p>{parseRichText(copy.text)}</p>}
          {next && (
            <button type="button" className="wb-auth-ghost-btn" onClick={() => flow.goTo(next.view)} data-wb-go={next.view}>
              {next.label}
            </button>
          )}
        </div>
      </aside>
      <div className="wb-auth-main">
        <div className="wb-auth-form-box">{form}</div>
      </div>
    </div>
  );
}

function GradientSpotlight({ data, form }: LayoutProps) {
  const panel = data.panel ?? {};
  return (
    <div className="wb-auth-spotlight">
      <Blobs />
      <div className="wb-auth-spotlight-inner">
        <div className="wb-auth-spotlight-copy">
          <AuthBrand data={data} />
          {panel.eyebrow && <p className="wb-auth-eyebrow">{parseRichText(panel.eyebrow)}</p>}
          {panel.heading && <h2 className="wb-auth-display">{parseRichText(panel.heading)}</h2>}
          {panel.text && <p className="wb-auth-lead">{parseRichText(panel.text)}</p>}
          <Highlights items={panel.highlights} />
        </div>
        <div className="wb-auth-card wb-auth-card-float">{form}</div>
      </div>
    </div>
  );
}

function IllustrationFrame({ data, form }: LayoutProps) {
  const panel = data.panel ?? {};
  return (
    <div className="wb-auth-frame-outer">
      <div className="wb-auth-frame">
        <div className="wb-auth-frame-media">
          {panel.image?.url ? (
            <SiteImage image={panel.image} className="wb-auth-cover" />
          ) : (
            <div className="wb-auth-frame-art" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}
          {(panel.heading || panel.text) && (
            <div className="wb-auth-frame-caption">
              {panel.heading && <h2 className="wb-auth-panel-title">{parseRichText(panel.heading)}</h2>}
              {panel.text && <p>{parseRichText(panel.text)}</p>}
            </div>
          )}
        </div>
        <div className="wb-auth-frame-form">
          <AuthBrand data={data} />
          {form}
        </div>
      </div>
    </div>
  );
}

function GlassAurora({ data, form }: LayoutProps) {
  return (
    <div className="wb-auth-aurora wb-auth-dark">
      <Blobs count={4} />
      <div className="wb-auth-glass">
        <AuthBrand data={data} className="wb-auth-brand-center" />
        {form}
      </div>
    </div>
  );
}

function DarkWave({ data, form }: LayoutProps) {
  return (
    <div className="wb-auth-wave wb-auth-dark">
      <div className="wb-auth-wave-content">
        <AuthBrand data={data} className="wb-auth-brand-center" />
        {form}
      </div>
      <svg className="wb-auth-waves" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
        <path className="wb-auth-wave-a" d="M0 192l60 10.7C120 213 240 235 360 218.7 480 203 600 149 720 154.7 840 160 960 224 1080 234.7 1200 245 1320 203 1380 181.3L1440 160v160H0z" />
        <path className="wb-auth-wave-b" d="M0 256l80-21.3C160 213 320 171 480 176s320 59 480 69.3c160 10.7 320-21.3 400-37.3l80-16v128H0z" />
        <path className="wb-auth-wave-c" d="M0 288l120-10.7C240 267 480 245 720 250.7 960 256 1200 288 1320 304l120 16H0z" />
      </svg>
    </div>
  );
}

function ProductShowcase({ data, form }: LayoutProps) {
  const panel = data.panel ?? {};
  return (
    <div className="wb-auth-showcase">
      <div className="wb-auth-main">
        <div className="wb-auth-form-box">
          <AuthBrand data={data} />
          {form}
        </div>
      </div>
      <aside className="wb-auth-showcase-panel">
        <div className="wb-auth-rings" aria-hidden="true">
          <span />
          <span />
        </div>
        {panel.image?.url && (
          <div className="wb-auth-device">
            <SiteImage image={panel.image} className="wb-auth-cover" />
          </div>
        )}
        {panel.heading && <h2 className="wb-auth-panel-title">{parseRichText(panel.heading)}</h2>}
        {panel.text && <p>{parseRichText(panel.text)}</p>}
        <div className="wb-auth-dots" aria-hidden="true">
          <span className="is-active" />
          <span />
          <span />
        </div>
      </aside>
    </div>
  );
}

const EDITORIAL_STEP: Record<AuthView, string> = { login: "01", register: "02", forgot: "03", otp: "04", reset: "05" };

function MinimalEditorial({ data, flow, form }: LayoutProps) {
  const panel = data.panel ?? {};
  return (
    <div className="wb-auth-editorial">
      <div className="wb-auth-editorial-top">
        <AuthBrand data={data} />
        <span className="wb-auth-editorial-step">
          {EDITORIAL_STEP[flow.view]} / {parseRichText(viewContent(data, flow.view).heading)}
        </span>
      </div>
      <div className="wb-auth-editorial-grid">
        <div className="wb-auth-editorial-copy">
          {panel.eyebrow && <p className="wb-auth-eyebrow">{parseRichText(panel.eyebrow)}</p>}
          {panel.heading && <h2 className="wb-auth-display">{parseRichText(panel.heading)}</h2>}
          {panel.text && <p className="wb-auth-lead">{parseRichText(panel.text)}</p>}
        </div>
        <div className="wb-auth-editorial-form">{form}</div>
      </div>
    </div>
  );
}

function BentoGrid({ data, form }: LayoutProps) {
  const panel = data.panel ?? {};
  return (
    <div className="wb-auth-bento">
      <div className="wb-auth-tile wb-auth-tile-form">
        <AuthBrand data={data} />
        {form}
      </div>
      {(panel.heading || panel.text) && (
        <div className="wb-auth-tile wb-auth-tile-hero">
          <Blobs count={2} />
          {panel.heading && <h2 className="wb-auth-display">{parseRichText(panel.heading)}</h2>}
          {panel.text && <p>{parseRichText(panel.text)}</p>}
        </div>
      )}
      {panel.image?.url && (
        <div className="wb-auth-tile wb-auth-tile-image">
          <SiteImage image={panel.image} className="wb-auth-cover" />
        </div>
      )}
      {panel.stats?.map((stat, index) => (
        <div key={index} className="wb-auth-tile wb-auth-tile-stat">
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
      {panel.testimonial?.quote && (
        <div className="wb-auth-tile wb-auth-tile-quote">
          <Testimonial data={data} />
        </div>
      )}
    </div>
  );
}

function FullbleedSheet({ data, form }: LayoutProps) {
  const panel = data.panel ?? {};
  return (
    <div className="wb-auth-bleed">
      {panel.image?.url ? (
        <SiteImage image={panel.image} className="wb-auth-bleed-img" />
      ) : (
        <Blobs count={3} />
      )}
      <div className="wb-auth-bleed-shade" aria-hidden="true" />
      <div className="wb-auth-bleed-caption">
        <AuthBrand data={data} />
        <Testimonial data={data} />
      </div>
      <div className="wb-auth-sheet">{form}</div>
    </div>
  );
}

function TabbedCompact({ data, flow, form }: LayoutProps) {
  const panel = data.panel ?? {};
  return (
    <div className="wb-auth-tabbed">
      <div className="wb-auth-grid-bg" aria-hidden="true" />
      <div className="wb-auth-tabbed-head">
        <AuthBrand data={data} className="wb-auth-brand-stack" />
        {panel.heading && <h2 className="wb-auth-display wb-auth-gradient-text">{parseRichText(panel.heading)}</h2>}
        {panel.text && <p className="wb-auth-lead">{parseRichText(panel.text)}</p>}
      </div>
      <div className="wb-auth-card wb-auth-tabbed-card">
        <AuthTabs data={data} flow={flow} />
        {form}
      </div>
    </div>
  );
}

const LAYOUTS: Record<AuthVariant, (props: LayoutProps) => ReactNode> = {
  "diagonal-split": DiagonalSplit,
  "gradient-spotlight": GradientSpotlight,
  "illustration-frame": IllustrationFrame,
  "glass-aurora": GlassAurora,
  "dark-wave": DarkWave,
  "product-showcase": ProductShowcase,
  "minimal-editorial": MinimalEditorial,
  "bento-grid": BentoGrid,
  "fullbleed-sheet": FullbleedSheet,
  "tabbed-compact": TabbedCompact,
};

/** Design colors become CSS variables; anything that isn't a plain hex value is ignored. */
function colorVars(data: AuthData): CSSProperties {
  const colors = data.colors ?? {};
  const vars: Record<string, string> = {};
  if (colors.accent && HEX_COLOR.test(colors.accent)) {
    vars["--wb-auth-accent"] = colors.accent;
    vars["--wb-auth-on-accent"] = contrastText(colors.accent);
  }
  if (colors.panel && HEX_COLOR.test(colors.panel)) {
    vars["--wb-auth-panel"] = colors.panel;
    vars["--wb-auth-panel-text"] = contrastText(colors.panel);
  }
  if (colors.panelText && HEX_COLOR.test(colors.panelText)) vars["--wb-auth-panel-text"] = colors.panelText;
  if (colors.card && HEX_COLOR.test(colors.card)) vars["--wb-auth-card"] = colors.card;
  return vars as CSSProperties;
}

export default function AuthSection({ section }: { section: SectionOf<"auth"> }) {
  const { data } = section;
  const catalog = useShopCatalog();
  const websiteId = catalog?.live ? catalog.websiteId : undefined;
  const shopLive = Boolean(websiteId);
  const accountHref = accountPageHref(data, catalog?.accountHref);
  const flow = useAuthFlow(data, websiteId, accountHref);
  const isStatic = useStaticRender();
  const variant: AuthVariant = data.variant in LAYOUTS ? data.variant : "diagonal-split";
  const Layout = LAYOUTS[variant];
  const tabbed = variant === "tabbed-compact" && data.register.enabled;
  const staticViews = shopLive
    ? STATIC_VIEWS.filter((view) => view === "reset" || isViewEnabled(data, view))
    : STATIC_VIEWS.filter((view) => view !== "otp" && view !== "reset" && isViewEnabled(data, view));

  const classes = [
    "wb-auth-root",
    `wb-auth-v-${variant}`,
    `wb-auth-input-${data.inputStyle ?? "outline"}`,
    `wb-auth-btn-${data.buttonShape ?? "rounded"}`,
    `wb-auth-h-${data.headingSize ?? "md"}`,
    `wb-auth-anim-${data.animation ?? "fade"}`,
    `wb-auth-form-${data.formPosition ?? "right"}`,
    data.minHeight === "auto" ? "" : "wb-auth-screen",
    data.backgroundMotion === false ? "" : "wb-auth-motion",
  ]
    .filter(Boolean)
    .join(" ");

  const renderLayout = (layoutFlow: AuthFlow) => (
    <Layout
      data={data}
      flow={layoutFlow}
      form={<AuthForm data={data} flow={layoutFlow} hideSwitch={tabbed} shopLive={shopLive} />}
    />
  );

  // Published pages redirect signed-in shoppers via SHOP_AUTH_SCRIPT. Do not
  // navigate here in the editor — that would leave the builder entirely.

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      fullWidth
      className="wb-auth"
      label={viewContent(data, flow.view).heading || "Sign in"}
    >
      <div
        className={classes}
        style={colorVars(data)}
        {...(websiteId ? { "data-wb-shop-auth": websiteId, "data-wb-shop-success-href": accountHref } : {})}
      >
        {isStatic ? (
          <StaticStates
            states={staticViews}
            initial={staticViews.includes(flow.view) ? flow.view : "login"}
            render={(view) => renderLayout(staticFlow(view))}
          />
        ) : (
          renderLayout(flow)
        )}
        {isStatic && shopLive && <script dangerouslySetInnerHTML={{ __html: SHOP_AUTH_SCRIPT }} />}
      </div>
    </SectionShell>
  );
}
