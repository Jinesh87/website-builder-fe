import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  Heart,
  Check,
  Copy,
  Lock,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { CAT_LABEL, findTemplateById, type Template } from "../marketing/data.ts";
import { useMarketing } from "../marketing/marketing-context.ts";
import { ART } from "../marketing/art.tsx";
import { ApiError, errorMessage } from "../../api/http.ts";
import { templatesApi, type TemplatePreview } from "../../api/websites.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { PreviewFrame, type Device } from "../../components/websites/DevicePreview.tsx";
import { SitePage } from "../../site-kit/index.ts";
import { getTemplateKey, getTemplateSite } from "../../site-kit/templates/index.ts";
import { isLightColor } from "../../utils/colors.ts";
import { Spinner } from "@heroui/react";
import "../marketing/templates-gallery.css";

interface FullTemplateSiteProps {
  template: Template;
  selectedPage: string;
  onSelectPage: (page: string) => void;
  mobile: boolean;
  onCtaClick: () => void;
}

function FullTemplateSite({
  template: t,
  selectedPage,
  onSelectPage,
  mobile,
  onCtaClick,
}: FullTemplateSiteProps) {
  const dark = !/^#F/i.test(t.b);
  const line = dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)";
  const line2 = dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.25)";
  const vars = {
    "--b": t.b,
    "--i": t.i,
    "--a": t.a,
    "--o": t.o,
    "--s": t.s,
    "--l": line,
    "--l2": line2,
    "--f": `${t.f},system-ui,sans-serif`,
    "--hf": `${t.hf},Georgia,serif`,
    "--rad": t.rad,
  } as CSSProperties;

  const pages = useMemo(() => t.pages.split(", "), [t.pages]);
  const pageNorm = (selectedPage || "Home").toLowerCase().trim();
  const [formSent, setFormSent] = useState(false);

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 3000);
  };

  return (
    <div className={`tpl-site ${mobile ? "mobile" : ""}`} style={vars}>
      {/* Site Header Navigation */}
      <header className="tpl-site-nav">
        <div className="tpl-site-logo">
          <i style={{ background: t.a }} />
          <span>{t.biz}</span>
        </div>
        <nav className="tpl-site-links" aria-label="Template navigation">
          {pages.map((p) => {
            const active = p.toLowerCase().trim() === pageNorm;
            return (
              <button
                key={p}
                type="button"
                className={`tpl-site-link ${active ? "active" : ""}`}
                onClick={() => onSelectPage(p)}
              >
                {p}
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          className="tpl-site-btn"
          style={{ background: t.a, color: t.o, borderRadius: t.rad }}
          onClick={onCtaClick}
        >
          {t.cta}
        </button>
      </header>

      {/* Page Body based on selected page */}
      {pageNorm === "about" ? (
        <>
          {/* About Page Hero */}
          <section className="tpl-site-hero">
            <div className="tpl-site-copy">
              <span className="tpl-site-eye">About {t.biz}</span>
              <h1>Dedicated to excellence and personalized service</h1>
              <p>
                Founded with a passion for quality and craft. We combine deep industry knowledge with modern
                methods to deliver exceptional experiences for every client.
              </p>
              <div className="tpl-site-row">
                <button
                  type="button"
                  className="tpl-site-btn"
                  style={{ background: t.a, color: t.o, borderRadius: t.rad }}
                  onClick={onCtaClick}
                >
                  {t.cta}
                </button>
                <button
                  type="button"
                  className="tpl-site-btn outline"
                  style={{ borderRadius: t.rad }}
                  onClick={() => onSelectPage("Contact")}
                >
                  Contact our team
                </button>
              </div>
            </div>
            <div className="tpl-site-art">
              <svg viewBox="0 0 480 360">{ART[t.art] ? ART[t.art](t.a, t.s, t.i, t.b) : null}</svg>
            </div>
          </section>

          {/* Values Section */}
          <section className="tpl-site-sec">
            <h2>Our Core Principles</h2>
            <div className="tpl-site-grid">
              <div className="tpl-site-card">
                <i style={{ background: t.a }} />
                <b>Uncompromising Quality</b>
                <span>We hold ourselves to rigorous standards in every detail of our work.</span>
              </div>
              <div className="tpl-site-card">
                <i style={{ background: t.a }} />
                <b>Client-Centric Care</b>
                <span>Your satisfaction is our primary metric of success, start to finish.</span>
              </div>
              <div className="tpl-site-card">
                <i style={{ background: t.a }} />
                <b>Transparent Communication</b>
                <span>Clear timelines, honest guidance, and direct support every step of the way.</span>
              </div>
            </div>
          </section>
        </>
      ) : pageNorm === "contact" ? (
        <>
          {/* Contact Page Hero */}
          <section className="tpl-site-hero">
            <div className="tpl-site-copy">
              <span className="tpl-site-eye">Get in touch</span>
              <h1>We’re here to help you get started</h1>
              <p>
                Have questions or ready to book? Send us a message below and our friendly team will reply
                promptly.
              </p>
            </div>
            <div className="tpl-site-art">
              <svg viewBox="0 0 480 360">{ART[t.art] ? ART[t.art](t.a, t.s, t.i, t.b) : null}</svg>
            </div>
          </section>

          {/* Contact Form & Information */}
          <section className="tpl-site-sec">
            <div className="tpl-contact-form">
              <form onSubmit={handleContactSubmit} className="tpl-form-card">
                <h3 style={{ margin: 0, fontSize: "20px", fontFamily: "var(--hf)", color: "var(--i)" }}>
                  Send a message
                </h3>
                {formSent && (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#10B981",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle2 style={{ width: 16, height: 16 }} />
                    Message sent! (Preview demonstration)
                  </div>
                )}
                <div className="tpl-form-group">
                  <label htmlFor="pname">Your Name</label>
                  <input id="pname" type="text" className="tpl-form-input" placeholder="e.g. Alex Morgan" required />
                </div>
                <div className="tpl-form-group">
                  <label htmlFor="pemail">Email Address</label>
                  <input id="pemail" type="email" className="tpl-form-input" placeholder="alex@example.com" required />
                </div>
                <div className="tpl-form-group">
                  <label htmlFor="pmessage">Message</label>
                  <textarea id="pmessage" className="tpl-form-textarea" placeholder="How can we assist you today?" required />
                </div>
                <button
                  type="submit"
                  className="tpl-site-btn"
                  style={{ background: t.a, color: t.o, borderRadius: t.rad, marginTop: "8px" }}
                >
                  Send message
                </button>
              </form>

              <div className="tpl-info-cards">
                <div className="tpl-info-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: t.a, marginBottom: "4px" }}>
                    <Clock style={{ width: 18, height: 18 }} />
                    <strong>Business Hours</strong>
                  </div>
                  <span>Monday – Friday: 8:00 AM – 6:00 PM</span>
                  <span>Saturday: 9:00 AM – 2:00 PM</span>
                </div>
                <div className="tpl-info-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: t.a, marginBottom: "4px" }}>
                    <Phone style={{ width: 18, height: 18 }} />
                    <strong>Direct Line</strong>
                  </div>
                  <span>+1 (555) 019-2834</span>
                </div>
                <div className="tpl-info-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: t.a, marginBottom: "4px" }}>
                    <Mail style={{ width: 18, height: 18 }} />
                    <strong>Email Inquiries</strong>
                  </div>
                  <span>hello@{t.biz.toLowerCase().replace(/[^a-z0-9]/g, "")}.com</span>
                </div>
                <div className="tpl-info-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: t.a, marginBottom: "4px" }}>
                    <MapPin style={{ width: 18, height: 18 }} />
                    <strong>Studio Location</strong>
                  </div>
                  <span>140 Market Street, Suite 400</span>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : pageNorm !== "home" ? (
        <>
          {/* Services / Menu / Portfolio Page Hero */}
          <section className="tpl-site-hero">
            <div className="tpl-site-copy">
              <span className="tpl-site-eye">{selectedPage}</span>
              <h1>Tailored offerings crafted for your highest standards</h1>
              <p>
                Explore our full spectrum of specialized solutions. Each offering is delivered with attention to detail
                and guaranteed excellence.
              </p>
              <div className="tpl-site-row">
                <button
                  type="button"
                  className="tpl-site-btn"
                  style={{ background: t.a, color: t.o, borderRadius: t.rad }}
                  onClick={onCtaClick}
                >
                  {t.cta}
                </button>
              </div>
            </div>
            <div className="tpl-site-art">
              <svg viewBox="0 0 480 360">{ART[t.art] ? ART[t.art](t.a, t.s, t.i, t.b) : null}</svg>
            </div>
          </section>

          {/* Offerings Grid */}
          <section className="tpl-site-sec">
            <h2>Featured {selectedPage}</h2>
            <div className="tpl-site-grid">
              {t.cards.map(([title, text]) => (
                <div className="tpl-site-card" key={title}>
                  <i style={{ background: t.a }} />
                  <b>{title}</b>
                  <span>{text}</span>
                  <span
                    style={{
                      marginTop: "12px",
                      display: "inline-block",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: t.a,
                    }}
                  >
                    Learn more →
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Home Page Hero */}
          <section className="tpl-site-hero">
            <div className="tpl-site-copy">
              <span className="tpl-site-eye">{t.eye}</span>
              <h1>{t.h}</h1>
              <p>{t.p}</p>
              <div className="tpl-site-row">
                <button
                  type="button"
                  className="tpl-site-btn"
                  style={{ background: t.a, color: t.o, borderRadius: t.rad }}
                  onClick={onCtaClick}
                >
                  {t.cta}
                </button>
                <button
                  type="button"
                  className="tpl-site-btn outline"
                  style={{ borderRadius: t.rad }}
                  onClick={() => onSelectPage(pages[1] || "About")}
                >
                  Learn more
                </button>
              </div>
            </div>
            <div className="tpl-site-art">
              <svg viewBox="0 0 480 360">{ART[t.art] ? ART[t.art](t.a, t.s, t.i, t.b) : null}</svg>
            </div>
          </section>

          {/* Trust strip */}
          <div className="tpl-site-trust">
            <div className="tpl-site-trust-wrap">
              <span className="tpl-site-trust-item">
                <CheckCircle2 style={{ width: 16, height: 16, color: t.a }} /> Certified Specialists
              </span>
              <span className="tpl-site-trust-item">
                <CheckCircle2 style={{ width: 16, height: 16, color: t.a }} /> 100% Satisfaction Guarantee
              </span>
              <span className="tpl-site-trust-item">
                <CheckCircle2 style={{ width: 16, height: 16, color: t.a }} /> Fast & Reliable Turnaround
              </span>
              <span className="tpl-site-trust-item">
                <CheckCircle2 style={{ width: 16, height: 16, color: t.a }} /> 4.9/5 Rating from 500+ Clients
              </span>
            </div>
          </div>

          {/* Main Showcase Section */}
          <section className="tpl-site-sec">
            <h2>{t.sec}</h2>
            <div className="tpl-site-grid">
              {t.cards.map(([title, text]) => (
                <div className="tpl-site-card" key={title}>
                  <i style={{ background: t.a }} />
                  <b>{title}</b>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Callout Banner */}
      <section className="tpl-site-band">
        <h3>{t.band}</h3>
        <button
          type="button"
          className="tpl-site-btn"
          style={{ background: t.o, color: t.a, borderRadius: t.rad }}
          onClick={onCtaClick}
        >
          {t.cta}
        </button>
      </section>

      {/* Full Footer */}
      <footer className="tpl-site-foot">
        <div className="tpl-site-foot-wrap">
          <div>
            <strong>{t.biz}</strong> · © {new Date().getFullYear()} All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {pages.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onSelectPage(p)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: "13.5px",
                  padding: 0,
                  opacity: 0.85,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function MarketingDetailView({ template, index }: { template: Template; index: number }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shortlist, toggleShortlist, toast } = useMarketing();
  const [device, setDevice] = useState<Device>("desktop");
  const site = useMemo(() => getTemplateSite(template.id), [template.id]);
  const pages = useMemo(
    () => (site ? site.pages.map((page) => page.name) : template.pages.split(", ")),
    [site, template.pages],
  );
  const [selectedPage, setSelectedPage] = useState(pages[0] || "Home");
  const [copied, setCopied] = useState(false);
  const isShortlisted = shortlist.includes(index);
  const canvasRef = useRef<HTMLElement>(null);
  const sitePage = site?.pages.find((page) => page.name === selectedPage) ?? site?.pages[0];

  useEffect(() => {
    canvasRef.current?.scrollTo({ top: 0 });
  }, [selectedPage]);

  const handleSiteLinkClick = (href: string) => {
    const target = site?.pages.find((page) => page.slug === href);
    if (target) setSelectedPage(target.name);
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => {
          setCopied(true);
          toast(`Copied public URL: ${url}`);
          setTimeout(() => setCopied(false), 2000);
        },
        () => toast(`Public URL: ${url}`),
      );
    } else {
      toast(`Public URL: ${url}`);
    }
  };

  const handleUseTemplate = () => {
    const createPath = `/websites/new?templateKey=${encodeURIComponent(getTemplateKey(template.id) ?? template.id)}`;
    if (user) {
      navigate(createPath);
    } else {
      navigate("/signup", {
        state: {
          notice: `Starting with template "${template.n}" (ID: ${template.id}). Sign up to build your website.`,
          from: createPath,
        },
      });
    }
  };

  return (
    <div className="tpl-full-viewport">
      {/* Top Preview Control Header Bar */}
      <header className="tpl-full-header">
        {/* Left Side: Back & Template identity */}
        <div className="tpl-full-header-left">
          <Link to="/templates" className="tpl-full-back-btn" title="Back to All Templates">
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span>All templates</span>
          </Link>

          <div className="tpl-full-meta">
            <span className="tpl-full-title">{template.n}</span>
            <span className="tpl-full-badge-id">ID: {template.id}</span>
            <span
              className="tpl-full-chip tpl-full-chip-md"
              style={{
                fontSize: "12px",
                padding: "2px 8px",
                borderRadius: "6px",
                background: "#1E2438",
                color: "#A2A9C4",
                fontWeight: 500,
              }}
            >
              {template.style}
            </span>
            <span
              className="tpl-full-chip tpl-full-chip-lg"
              style={{
                fontSize: "12px",
                padding: "2px 8px",
                borderRadius: "6px",
                background: "#161A2B",
                color: "#8C93AE",
              }}
            >
              {CAT_LABEL[template.c] ?? template.c}
            </span>
          </div>
        </div>

        {/* Center: Simulated Address Bar with Lock and Copy */}
        <div className="tpl-full-header-center hidden md:flex">
          <div className="tpl-full-url-bar">
            <Lock className="lock" />
            <div className="tpl-full-url-text">
              https://yourbrand.com/templates/<b>{template.id}</b>
              {selectedPage.toLowerCase() !== "home" && (
                <span>/{selectedPage.toLowerCase().replace(/ /g, "-")}</span>
              )}
            </div>
            <button
              type="button"
              className="tpl-full-copy-btn"
              onClick={handleCopyUrl}
              title="Copy dedicated public URL"
            >
              {copied ? (
                <Check style={{ width: 14, height: 14, color: "#10B981" }} />
              ) : (
                <Copy style={{ width: 14, height: 14 }} />
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Page Switcher, Device Switcher, Shortlist, Share & Use Template */}
        <div className="tpl-full-header-right">
          {/* Page Switcher */}
          {pages.length > 1 && (
            <div className="tpl-full-pages hidden xl:flex" role="tablist" aria-label="Template pages">
              {pages.map((p) => {
                const active = p === selectedPage;
                return (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedPage(p)}
                    className={`tpl-full-page-btn ${active ? "active" : ""}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          )}

          {/* Device Switcher */}
          <div className="tpl-full-devices" role="group" aria-label="Device viewport">
            <button
              type="button"
              className={`tpl-full-dev-btn ${device === "desktop" ? "active" : ""}`}
              onClick={() => setDevice("desktop")}
              title="Desktop preview (100% width)"
            >
              <Monitor />
            </button>
            <button
              type="button"
              className={`tpl-full-dev-btn ${device === "tablet" ? "active" : ""}`}
              onClick={() => setDevice("tablet")}
              title="Tablet preview (768px)"
            >
              <Tablet />
            </button>
            <button
              type="button"
              className={`tpl-full-dev-btn ${device === "mobile" ? "active" : ""}`}
              onClick={() => setDevice("mobile")}
              title="Mobile preview (390px)"
            >
              <Smartphone />
            </button>
          </div>

          {/* Shortlist Heart Button */}
          <button
            type="button"
            className={`tpl-full-icon-btn ${isShortlisted ? "active" : ""}`}
            onClick={() => toggleShortlist(index)}
            aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
            aria-pressed={isShortlisted}
            title={isShortlisted ? "In shortlist" : "Add to shortlist"}
          >
            <Heart style={{ width: 16, height: 16, fill: isShortlisted ? "currentColor" : "none" }} />
          </button>

          {/* Share Button */}
          <button
            type="button"
            className="tpl-full-icon-btn hidden sm:grid"
            onClick={handleCopyUrl}
            title="Share dedicated public URL"
          >
            <Share2 style={{ width: 16, height: 16 }} />
          </button>

          {/* Primary CTA: Use this template */}
          <button
            type="button"
            className="tpl-full-cta-btn"
            onClick={handleUseTemplate}
            title="Use this template to build your site"
          >
            <span>Use this template</span>
            <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </header>

      {/* Main Full-Page Preview Viewport Canvas */}
      {(() => {
        const bg = site?.theme?.colors?.background || "#ffffff";
        const isSiteLight = isLightColor(bg);
        const scrollThumbColor = isSiteLight ? "rgba(24, 24, 27, 0.45)" : "rgba(255, 255, 255, 0.45)";
        const scrollThumbHoverColor = isSiteLight ? "rgba(24, 24, 27, 0.75)" : "rgba(255, 255, 255, 0.75)";
        return (
          <main
            ref={canvasRef}
            className={`tpl-full-canvas ${device}`}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: `${scrollThumbColor} transparent`,
              ["--scrollbar-thumb" as any]: scrollThumbColor,
              ["--scrollbar-thumb-hover" as any]: scrollThumbHoverColor,
            }}
          >
            {site && sitePage ? (
              <PreviewFrame device={device} onLinkClick={handleSiteLinkClick}>
                <SitePage site={site} page={sitePage} />
              </PreviewFrame>
            ) : (
              <PreviewFrame device={device}>
                <FullTemplateSite
                  template={template}
                  selectedPage={selectedPage}
                  onSelectPage={setSelectedPage}
                  mobile={device === "mobile"}
                  onCtaClick={handleUseTemplate}
                />
              </PreviewFrame>
            )}
          </main>
        );
      })()}
    </div>
  );
}

export default function TemplateDetailPage() {
  const { templateKey = "" } = useParams();

  // First, check if this is one of our 24 marketing templates!
  const marketingMatch = useMemo(() => {
    return findTemplateById(templateKey);
  }, [templateKey]);

  if (marketingMatch) {
    return <MarketingDetailView template={marketingMatch.template} index={marketingMatch.index} />;
  }

  // Fallback: If not in marketing catalog, check if it's an API-backed template
  return <LegacyApiTemplateDetail templateKey={templateKey} />;
}

function LegacyApiTemplateDetail({ templateKey }: { templateKey: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [error, setError] = useState<{ notFound: boolean; message: string } | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [pageSlug, setPageSlug] = useState("/");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPreview(null);
    setError(null);
    setPageSlug("/");
    templatesApi
      .preview(templateKey)
      .then((loaded) => !cancelled && setPreview(loaded))
      .catch((err: unknown) => {
        if (!cancelled) {
          setError({
            notFound: err instanceof ApiError && err.status === 404,
            message: errorMessage(err),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [templateKey]);

  const pages = useMemo(() => preview?.site.pages ?? [], [preview]);
  const page = pages.find((candidate) => candidate.slug === pageSlug) ?? pages[0];

  function handleLinkClick(href: string) {
    const target = pages.find((candidate) => candidate.slug === href);
    if (target) setPageSlug(target.slug);
  }

  const handleCopyUrl = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleUseTemplate = () => {
    const createPath = `/websites/new?templateKey=${encodeURIComponent(templateKey)}`;
    if (user) {
      navigate(createPath);
    } else {
      navigate("/signup", {
        state: {
          notice: `Starting with template "${preview?.template.name ?? templateKey}". Sign up to continue.`,
          from: createPath,
        },
      });
    }
  };

  if (error) {
    return (
      <div className="tpl-full-viewport" style={{ display: "grid", placeItems: "center" }}>
        <div style={{ maxWidth: "420px", textAlign: "center", padding: "32px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
            {error.notFound ? "Template not found" : "Couldn't load template"}
          </h1>
          <p style={{ color: "#8C93AE", fontSize: "14px", marginBottom: "24px" }}>
            {error.notFound ? `No template matches "${templateKey}".` : error.message}
          </p>
          <Link to="/templates" className="tpl-full-back-btn">
            <ArrowLeft style={{ width: 14, height: 14 }} /> All templates
          </Link>
        </div>
      </div>
    );
  }

  if (!preview || !page) {
    return (
      <div className="tpl-full-viewport" style={{ display: "grid", placeItems: "center" }}>
        <Spinner size="lg" aria-label="Loading template" />
      </div>
    );
  }

  const { template } = preview;

  return (
    <div className="tpl-full-viewport">
      <header className="tpl-full-header">
        <div className="tpl-full-header-left">
          <Link to="/templates" className="tpl-full-back-btn">
            <ArrowLeft style={{ width: 14, height: 14 }} /> All templates
          </Link>
          <div className="tpl-full-meta">
            <span className="tpl-full-title">{template.name}</span>
            <span className="tpl-full-badge-id">{template.category}</span>
          </div>
        </div>

        <div className="tpl-full-header-center hidden md:flex">
          <div className="tpl-full-url-bar">
            <Lock className="lock" />
            <div className="tpl-full-url-text">
              https://yourbrand.com/templates/<b>{templateKey}</b>
              {page.slug !== "/" && <span>{page.slug}</span>}
            </div>
            <button type="button" className="tpl-full-copy-btn" onClick={handleCopyUrl} title="Copy URL">
              {copied ? <Check style={{ width: 14, height: 14, color: "#10B981" }} /> : <Copy style={{ width: 14, height: 14 }} />}
            </button>
          </div>
        </div>

        <div className="tpl-full-header-right">
          {pages.length > 1 && (
            <div className="tpl-full-pages hidden xl:flex">
              {pages.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setPageSlug(candidate.slug)}
                  className={`tpl-full-page-btn ${candidate.slug === page.slug ? "active" : ""}`}
                >
                  {candidate.name}
                </button>
              ))}
            </div>
          )}

          <div className="tpl-full-devices">
            <button
              type="button"
              className={`tpl-full-dev-btn ${device === "desktop" ? "active" : ""}`}
              onClick={() => setDevice("desktop")}
            >
              <Monitor />
            </button>
            <button
              type="button"
              className={`tpl-full-dev-btn ${device === "tablet" ? "active" : ""}`}
              onClick={() => setDevice("tablet")}
            >
              <Tablet />
            </button>
            <button
              type="button"
              className={`tpl-full-dev-btn ${device === "mobile" ? "active" : ""}`}
              onClick={() => setDevice("mobile")}
            >
              <Smartphone />
            </button>
          </div>

          <button type="button" className="tpl-full-cta-btn" onClick={handleUseTemplate}>
            <span>Use this template</span>
            <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </header>

      {(() => {
        const bg = preview?.site?.theme?.colors?.background || "#ffffff";
        const isSiteLight = isLightColor(bg);
        const scrollThumbColor = isSiteLight ? "rgba(24, 24, 27, 0.45)" : "rgba(255, 255, 255, 0.45)";
        const scrollThumbHoverColor = isSiteLight ? "rgba(24, 24, 27, 0.75)" : "rgba(255, 255, 255, 0.75)";
        return (
          <main
            className={`tpl-full-canvas ${device}`}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: `${scrollThumbColor} transparent`,
              ["--scrollbar-thumb" as any]: scrollThumbColor,
              ["--scrollbar-thumb-hover" as any]: scrollThumbHoverColor,
            }}
          >
            <PreviewFrame device={device} onLinkClick={handleLinkClick}>
              <SitePage site={preview.site} page={page} />
            </PreviewFrame>
          </main>
        );
      })()}
    </div>
  );
}
