import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { TPLS } from "./data.ts";
import { MarketingContext, type MarketingContextValue } from "./marketing-context.ts";
import { MiniSite, TemplateFrame } from "./MiniSite.tsx";
import Tabs from "./Tabs.tsx";
import "./marketing.css";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Manrope:wght@400;700;800&family=Archivo:wght@400;700;800&family=Nunito+Sans:wght@400;700;800&family=Libre+Baskerville:wght@400;700&family=Sora:wght@400;600;700&family=Playfair+Display:wght@500;700&display=swap";

if (!document.querySelector(`link[href="${FONTS_HREF}"]`)) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = FONTS_HREF;
  document.head.append(link);
}

const NAV = [
  ["/features", "Features"],
  ["/templates", "Templates"],
  ["/pricing", "Pricing"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

const NO_CTA = ["/contact", "/legal"];
const SITE_TITLE = "Website Builder";

export function MarketingHeader() {
  const { pathname } = useLocation();
  // The drawer stays open only on the page it was opened on.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <header className="top">
      <div className="wrap">
        <Link to="/" className="brand" aria-label="[Your Brand] home">
          <span className="mark">
            <span />
          </span>
          [Your Brand]
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="acts">
          <Link to="/login" className="login">
            Log in
          </Link>
          <Link to="/signup" className="btn p">
            Sign up free
          </Link>
        </div>
        <button
          className="burger"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="drawer"
          onClick={() => setOpenOn(open ? null : pathname)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
      </div>
      <div className="drawer" id="drawer" hidden={!open}>
        <nav aria-label="Mobile">
          <NavLink to="/" end>
            Home
          </NavLink>
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="d-acts">
          <Link to="/signup" className="btn p lg">
            Sign up free
          </Link>
          <Link to="/login" className="btn lg">
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="cols4">
          <div className="col" style={{ maxWidth: "320px" }}>
            <Link to="/" className="brand" style={{ color: "#FFFFFF" }}>
              <span className="mark">
                <span />
              </span>
              [Your Brand]
            </Link>
            <p style={{ fontSize: "14px" }}>Build and publish your business website by hand or with AI.</p>
          </div>
          <div className="col">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/templates">Templates</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/signup">Sign up</Link>
          </div>
          <div className="col">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Log in</Link>
          </div>
          <div className="col">
            <h4>Legal</h4>
            <Link to="/legal?doc=terms">Terms of Service</Link>
            <Link to="/legal?doc=privacy">Privacy Policy</Link>
          </div>
        </div>
        <div className="base">
          <span>© [Year] [Company name]. All rights reserved.</span>
          <span>[Social links]</span>
        </div>
      </div>
    </footer>
  );
}

function TemplatePreviewModal({
  index,
  onClose,
  onUse,
}: {
  index: number;
  onClose: () => void;
  onUse: (index: number) => void;
}) {
  const [device, setDevice] = useState<"d" | "m">("d");
  const closeRef = useRef<HTMLButtonElement>(null);
  const t = TPLS[index];

  useEffect(() => {
    const lastFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tplModalTitle"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dlg" style={{ width: "min(1000px,100%)" }}>
        <div className="dh">
          <h2 id="tplModalTitle" style={{ fontSize: "20px" }}>
            {t.n} template
          </h2>
          <button ref={closeRef} className="x" type="button" aria-label="Close preview" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="db">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Tabs
              label="Preview size"
              value={device}
              onChange={setDevice}
              items={[
                { key: "d", label: "Desktop" },
                { key: "m", label: "Mobile" },
              ]}
            />
            <span className="hint">Sample content. You replace it with your own.</span>
          </div>
          <div>
            {device === "d" ? (
              <TemplateFrame t={index} />
            ) : (
              <div className="phone">
                <MiniSite t={t} mobile />
              </div>
            )}
          </div>
          <p className="muted">
            {t.c}. Pages: {t.pages}. Shown with sample content for "{t.biz}". Colours, fonts, sections and pages can all
            be changed after you sign up.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button className="btn" type="button" onClick={onClose}>
              Close
            </button>
            <button className="btn p" type="button" onClick={() => onUse(index)}>
              Use this template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketingLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const page = pathname.slice(1);
    document.title = page ? `${page.charAt(0).toUpperCase()}${page.slice(1)} · ${SITE_TITLE}` : SITE_TITLE;
  }, [pathname]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const closePreview = useCallback(() => setPreview(null), []);

  const context = useMemo<MarketingContextValue>(
    () => ({
      toast(message) {
        setToastMessage(message);
        window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToastMessage(null), 2800);
      },
      previewTemplate: setPreview,
      startWithTemplate(index) {
        setPreview(null);
        navigate("/signup", {
          state: { notice: `Starting with the "${TPLS[index].n}" template. You can change it later.` },
        });
      },
    }),
    [navigate],
  );

  return (
    <MarketingContext.Provider value={context}>
      <div className="mk">
        <MarketingHeader />
        <main id="app">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
        {!NO_CTA.includes(pathname) && (
          <div className="cta" id="cta">
            <div className="wrap">
              <div className="stack" style={{ gap: "6px" }}>
                <h2>Ready to build your website?</h2>
                <p style={{ opacity: ".85" }}>Create your account and reach your dashboard in a few minutes.</p>
              </div>
              <Link to="/signup" className="btn lg">
                Sign up free
              </Link>
            </div>
          </div>
        )}
        <MarketingFooter />
        {preview !== null && (
          <TemplatePreviewModal index={preview} onClose={closePreview} onUse={context.startWithTemplate} />
        )}
        <div className="toast" hidden={!toastMessage} role="status" aria-live="polite">
          {toastMessage}
        </div>
      </div>
    </MarketingContext.Provider>
  );
}
