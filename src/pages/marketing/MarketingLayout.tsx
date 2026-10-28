import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { TPLS } from "./data.ts";
import { MarketingContext, type MarketingContextValue } from "./marketing-context.ts";
import { MiniSite, TemplateFrame } from "./MiniSite.tsx";
import Tabs from "./Tabs.tsx";
import { Mail, Phone } from "lucide-react";
import { env } from "../../config/env.ts";
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

const NO_CTA = ["/contact", "/legal", "/templates"];
const SITE_TITLE = "Website Builder";

export function MarketingHeader({
  shortlist = [],
  onOpenShortlist,
}: {
  shortlist?: number[];
  onOpenShortlist?: () => void;
}) {
  const { pathname } = useLocation();
  // The drawer stays open only on the page it was opened on.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const isTemplates = pathname === "/templates";

  return (
    <header className="top">
      <div className="wrap">
        <Link to="/" className="brand" aria-label={`${env.appName} home`}>
          <img
            className="brand-logo"
            src="/bytezora-webbuilder-logo.png"
            alt={env.appName}
            width={280}
            height={72}
          />
          {isTemplates && <span className="brand-badge">Templates</span>}
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="acts">
          {isTemplates ? (
            <>
              <button
                className="btn sl-btn"
                type="button"
                onClick={onOpenShortlist}
                aria-label="View shortlist"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 16, height: 16 }}
                >
                  <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" />
                </svg>
                Shortlist
                {shortlist.length > 0 && <span className="sl-badge">{shortlist.length}</span>}
              </button>
              <Link to="/signup" className="btn p">
                Start free
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="login">
                Log in
              </Link>
              <Link to="/signup" className="btn p">
                Sign up free
              </Link>
            </>
          )}
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

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-1.64-1.64 1.64 1.64 0 0 0 1.64 1.64m1.39 9.74V9.93H5.07v8.57z" />
    </svg>
  );
}

function GmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="wrap">
        <div className="cols5">
          <div className="col" style={{ maxWidth: "300px" }}>
            <Link to="/" className="brand" aria-label={`${env.appName} home`}>
              <img
                className="brand-logo foot-logo"
                src="/bytezora-webbuilder-logo-white-text.png"
                alt={env.appName}
                width={400}
                height={104}
              />
            </Link>
            <p style={{ fontSize: "14px" }}>Build and publish your business website by hand or with AI.</p>
            <a
              href="mailto:Support@bytezoracoders.com"
              className="foot-email-badge"
              title="Send an email to Support"
            >
              <Mail style={{ width: "14px", height: "14px" }} aria-hidden="true" />
              <span>Support@bytezoracoders.com</span>
            </a>
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
          <div className="col contact-col">
            <h4>Contact Us</h4>
            <div className="foot-contact-block">
              <span className="foot-contact-title">India Headquarters</span>
              <p className="foot-contact-address">
                Ground Floor, 287/A, Ernakulam,<br />
                Kerala – 682315
              </p>
              <a href="tel:+919995070483" className="foot-contact-link">
                <Phone style={{ width: "13px", height: "13px" }} aria-hidden="true" />
                <span>+91 (999) 50-70483</span>
              </a>
              <a href="mailto:Support@bytezoracoders.com" className="foot-contact-link">
                <Mail style={{ width: "13px", height: "13px" }} aria-hidden="true" />
                <span>Support@bytezoracoders.com</span>
              </a>
            </div>
          </div>
        </div>
        <div className="base">
          <div className="base-left">
            <span>© {currentYear} Bytezora. All rights reserved.</span>
          </div>
          <div className="base-center">
            <span>
              Powered by{" "}
              <a
                href="https://bytezoracoders.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="brand-link"
                title="Visit bytezoracoders.com"
              >
                bytezoracoders.com
              </a>
            </span>
          </div>
          <div className="foot-socials" aria-label="Social media links">
            <a
              href="https://in.linkedin.com/company/bytezora"
              target="_blank"
              rel="noopener noreferrer"
              className="foot-social-link linkedin"
              aria-label="LinkedIn"
              title="Connect on LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <a
              href="mailto:Support@bytezoracoders.com"
              className="foot-social-link gmail"
              aria-label="Gmail / Email Support"
              title="Email Support (Support@bytezoracoders.com)"
            >
              <GmailIcon />
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="foot-social-link facebook"
              aria-label="Facebook"
              title="Follow on Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="foot-social-link instagram"
              aria-label="Instagram"
              title="Follow on Instagram"
            >
              <InstagramIcon />
            </a>
          </div>
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

function ShortlistModal({
  shortlist,
  onClose,
  onRemove,
  onUse,
}: {
  shortlist: number[];
  onClose: () => void;
  onRemove: (index: number) => void;
  onUse: (index: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

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
      aria-labelledby="shortlistModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dlg"
        style={{
          width: "min(560px, 100%)",
          background: "#151928",
          color: "#E9ECF7",
          border: "1px solid #272C3C",
          borderRadius: "18px",
        }}
      >
        <div className="dh" style={{ borderBottom: "1px solid #272C3C", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 id="shortlistModalTitle" style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#F8FAFC" }}>
            Your shortlist ({shortlist.length})
          </h2>
          <button
            ref={closeRef}
            className="x"
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{ background: "none", border: 0, color: "#8C93AE", fontSize: "20px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
        <div className="db" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {shortlist.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 16px", color: "#8C93AE" }}>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#F1F4F9", margin: "0 0 6px 0" }}>Your shortlist is empty</p>
              <p style={{ fontSize: "14px", margin: 0 }}>
                Click the heart icon on any template card to save it to your shortlist.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "55vh", overflowY: "auto" }}>
              {shortlist.map((index) => {
                const item = TPLS[index];
                if (!item) return null;
                return (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr auto",
                      gap: "14px",
                      alignItems: "center",
                      border: "1px solid #272C3C",
                      borderRadius: "12px",
                      padding: "10px",
                      background: "#1A1F33",
                    }}
                  >
                    <div style={{ width: "100px", aspectRatio: "4/3", borderRadius: "8px", overflow: "hidden" }}>
                      <TemplateFrame t={index} />
                    </div>
                    <div>
                      <b style={{ display: "block", fontSize: "15px", color: "#F8FAFC", marginBottom: "4px" }}>
                        {item.n}
                      </b>
                      <span style={{ fontSize: "13px", color: "#8C93AE" }}>
                        {item.c} · {item.style}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        className="btn p sm"
                        type="button"
                        onClick={() => {
                          onClose();
                          onUse(index);
                        }}
                      >
                        Use
                      </button>
                      <button
                        type="button"
                        aria-label="Remove from shortlist"
                        onClick={() => onRemove(index)}
                        style={{
                          background: "none",
                          border: "1px solid #272C3C",
                          borderRadius: "8px",
                          color: "#8C93AE",
                          width: "32px",
                          height: "32px",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MarketingLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<number | null>(null);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const [shortlist, setShortlist] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("tplShortlist") || "[]").filter(
        (i: number) => typeof i === "number" && i >= 0 && i < TPLS.length,
      );
    } catch {
      return [];
    }
  });

  const toggleShortlist = useCallback((index: number) => {
    const t = TPLS[index];
    if (!t) return;
    setShortlist((prev) => {
      const exists = prev.includes(index);
      const next = exists ? prev.filter((i) => i !== index) : [...prev, index];
      try {
        localStorage.setItem("tplShortlist", JSON.stringify(next));
      } catch {}
      setToastMessage(exists ? `Removed ${t.n} from shortlist` : `Added ${t.n} to shortlist`);
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToastMessage(null), 2800);
      return next;
    });
  }, []);

  const openShortlist = useCallback(() => setShowShortlistModal(true), []);

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
        const t = TPLS[index];
        if (t?.id) {
          navigate(`/templates/${t.id}`);
        } else {
          navigate("/templates");
        }
      },
      shortlist,
      toggleShortlist,
      openShortlist,
    }),
    [navigate, shortlist, toggleShortlist, openShortlist],
  );

  const isPreviewMode = pathname.startsWith("/templates/") && pathname !== "/templates";

  if (isPreviewMode) {
    return (
      <MarketingContext.Provider value={context}>
        <div className="mk-preview-mode" style={{ minHeight: "100vh", background: "#0B0E1B" }}>
          <main id="app" style={{ minHeight: "100vh", padding: 0 }}>
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </main>
          <div className="toast" hidden={!toastMessage} role="status" aria-live="polite">
            {toastMessage}
          </div>
        </div>
      </MarketingContext.Provider>
    );
  }

  return (
    <MarketingContext.Provider value={context}>
      <div className="mk">
        <MarketingHeader shortlist={shortlist} onOpenShortlist={openShortlist} />
        <main id="app">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
        {!NO_CTA.includes(pathname) && (
          <div className="cta" id="cta">
            <div className="wrap">
              <div className="stack" style={{ gap: "6px" }}>
                <h2>Build Your Website Free, Pay Only for Hosting</h2>
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
        {showShortlistModal && (
          <ShortlistModal
            shortlist={shortlist}
            onClose={() => setShowShortlistModal(false)}
            onRemove={toggleShortlist}
            onUse={context.startWithTemplate}
          />
        )}
        <div className="toast" hidden={!toastMessage} role="status" aria-live="polite">
          {toastMessage}
        </div>
      </div>
    </MarketingContext.Provider>
  );
}
