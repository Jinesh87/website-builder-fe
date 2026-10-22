import { useState, useRef, useLayoutEffect, useEffect, useMemo, type ReactNode, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CATS, STYLES, TPLS } from "./data.ts";
import { templatesApi } from "../../api/websites.ts";
import "./hero-gallery.css";

function ScaledFrame({ children, dataT }: { children: ReactNode; dataT: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.273333);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const updateScale = () => {
      const clientWidth = frame.clientWidth;
      if (clientWidth > 0) {
        setScale(clientWidth / 1200);
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className="tframe" data-t={dataT}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {children}
      </div>
    </div>
  );
}

export default function HeroGalleryBanner() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [templateCount, setTemplateCount] = useState<number>(TPLS.length);

  useEffect(() => {
    let cancelled = false;
    templatesApi
      .list()
      .then((loaded) => {
        if (!cancelled && loaded && loaded.length > 0) {
          setTemplateCount(Math.max(loaded.length, TPLS.length));
        }
      })
      .catch(() => {
        // Fallback to TPLS.length
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const industryCount = useMemo(() => {
    const fromCategories = CATS.filter((cat) => cat !== "All").length;
    const fromTemplates = new Set(TPLS.map((t) => t.c).filter(Boolean)).size;
    return Math.max(fromCategories, fromTemplates);
  }, []);

  const designStyleCount = useMemo(() => {
    const fromStyles = STYLES.filter((s) => s !== "All styles").length;
    const fromTemplates = new Set(TPLS.map((t) => t.style).filter(Boolean)).size;
    return Math.max(fromStyles, fromTemplates);
  }, []);

  const devicePreviewCount = 3;

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("/templates", { state: { query: searchQuery.trim() } });
    } else {
      navigate("/templates");
    }
  };

  const handlePopularClick = (tag: string) => {
    navigate("/templates", { state: { cat: tag === "SaaS" ? "Business" : tag === "Restaurant" ? "Food" : tag === "Dental" ? "Services" : "All", query: tag } });
  };

  return (
    <section className="ghero" aria-label="Template gallery hero">
      <div className="wrap">
        <div className="gcopy">
          <span className="eyebrow">Template gallery</span>
          <h1>
            Build Your Website Free, <span>Pay Only for Hosting</span>
          </h1>
          <p className="lead">
            <b>{templateCount}</b> professionally designed templates for every kind of business. Open any one to see every page on
            desktop, tablet and mobile, then start with it for free.
          </p>

          <form className="search" onSubmit={handleSearchSubmit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <label htmlFor="heroSearch" className="sr">Search templates</label>
            <input
              id="heroSearch"
              className="in"
              type="search"
              placeholder="Search: dental, restaurant, agency, portfolio…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="popular" id="popular">
            <span>Popular:</span>
            {["Restaurant", "Dental", "Yoga", "Photographer", "SaaS"].map((tag) => (
              <button key={tag} type="button" onClick={() => handlePopularClick(tag)}>
                {tag}
              </button>
            ))}
          </div>

          <div className="gstats">
            <div>
              <b>{templateCount}</b>
              <span>templates</span>
            </div>
            <div>
              <b>{industryCount}</b>
              <span>industries</span>
            </div>
            <div>
              <b>{designStyleCount}</b>
              <span>design styles</span>
            </div>
            <div>
              <b>{devicePreviewCount}</b>
              <span>device previews</span>
            </div>
          </div>
        </div>

        <div className="fan" id="fan" aria-hidden="true">
          {/* Halftone Spa */}
          <ScaledFrame dataT="173">
            <div
              className="ts Lsplit Coutline dk"
              style={
                {
                  "--b": "#0F0F12",
                  "--i": "#F5F5F0",
                  "--a": "#FF5A36",
                  "--o": "#0F0F12",
                  "--s": "#1C1C22",
                  "--l": "rgba(255,255,255,.1)",
                  "--l2": "rgba(255,255,255,.35)",
                  "--f": "'Archivo',system-ui,sans-serif",
                  "--hf": "'Archivo',Georgia,serif",
                  "--rad": "0px",
                } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <div className="ts-nav">
                <div className="ts-logo">
                  <i />Halftone Spa
                </div>
                <nav>
                  <span className="on">Home</span>
                  <span>Services</span>
                  <span>Pricing</span>
                  <span>Contact</span>
                </nav>
                <span className="ts-btn">Book a treatment</span>
                <span className="ts-burger" />
              </div>
              <div className="ts-hero" data-s="hero">
                <div className="ts-copy">
                  <span className="ts-eye">Spa and massage</span>
                  <h1>Time to <em>switch off</em></h1>
                  <p>Massages, facials and body treatments in a quiet, private space.</p>
                  <div className="ts-row">
                    <span className="ts-btn">Book a treatment →</span>
                    <span className="ts-btn o">Learn more</span>
                  </div>
                  <div className="ts-trust">
                    <span className="ts-avs">
                      <i style={{ background: "#FF5A36" }} />
                      <i style={{ background: "#F5F5F0" }} />
                      <i style={{ background: "#1C1C22" }} />
                    </span>
                    <span>
                      <b className="ts-stars">★★★★★</b>
                      <br />Loved by local customers
                    </span>
                  </div>
                </div>
                <div className="ts-visual">
                  <div className="ts-art">
                    <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice">
                      <rect width="480" height="360" fill="#1C1C22" />
                      <ellipse cx="200" cy="160" rx="90" ry="110" fill="#0F0F12" stroke="#F5F5F0" strokeWidth="10" />
                      <rect x="190" y="268" width="20" height="60" fill="#F5F5F0" />
                      <rect x="150" y="320" width="100" height="14" rx="7" fill="#F5F5F0" />
                      <path d="M160 120c20-30 60-30 80 0" stroke="#FF5A36" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".7" />
                      <rect x="330" y="150" width="46" height="120" rx="12" fill="#FF5A36" />
                      <rect x="342" y="128" width="22" height="26" rx="4" fill="#F5F5F0" />
                      <circle cx="384" cy="96" r="6" fill="#FF5A36" />
                      <circle cx="300" cy="80" r="4" fill="#FF5A36" />
                    </svg>
                  </div>
                  <div className="ts-chip c1">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" />
                      </svg>
                    </i>
                    <span>Book in 60 seconds<small>Online booking</small></span>
                  </div>
                  <div className="ts-chip c2">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                      </svg>
                    </i>
                    <span>New clients welcome<small>First visit offer</small></span>
                  </div>
                </div>
              </div>
              <div className="ts-logos">
                <span>Trusted by</span>
                <b>Northline</b>
                <b>Kitehouse</b>
                <b>Lumora</b>
                <b>Parallel</b>
                <b>Brightway</b>
              </div>
              <div className="ts-sec" data-s="cards">
                <div className="ts-sh">
                  <span className="ts-eye sm">Treatments</span>
                  <h2>Treatments at Halftone Spa</h2>
                </div>
                <div className="ts-grid">
                  <div className="ts-card">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" />
                      </svg>
                    </i>
                    <b>Massage</b>
                    <span>Relaxing and deep tissue.</span>
                    <a>Learn more →</a>
                  </div>
                  <div className="ts-card">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15" />
                        <path d="M5 19l7-7" />
                      </svg>
                    </i>
                    <b>Facials</b>
                    <span>For every skin type.</span>
                    <a>Learn more →</a>
                  </div>
                  <div className="ts-card">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                      </svg>
                    </i>
                    <b>Spa days</b>
                    <span>Half and full-day packages.</span>
                    <a>Learn more →</a>
                  </div>
                </div>
              </div>
              <div className="ts-quote">
                <b className="q">“</b>
                <div>
                  <p>Working with Halftone Spa was easy from the first message. Clear, friendly and quick to help. We would recommend them to anyone.</p>
                  <span><i style={{ background: "#FF5A36" }} />Sample customer review</span>
                </div>
              </div>
              <div className="ts-band" data-s="band">
                <div>
                  <h3>Gift vouchers available</h3>
                  <p>Book a treatment today. It only takes a minute.</p>
                </div>
                <span className="ts-btn">Book a treatment</span>
              </div>
              <div className="ts-foot">© Halftone Spa · Home · Services · Pricing · Contact</div>
            </div>
          </ScaledFrame>

          {/* Evergreen Marketing */}
          <ScaledFrame dataT="59">
            <div
              className="ts Lrev Coutline"
              style={
                {
                  "--b": "#F4F7F2",
                  "--i": "#1B2A1E",
                  "--a": "#2F6B3F",
                  "--o": "#FFFFFF",
                  "--s": "#E1ECDD",
                  "--l": "rgba(0,0,0,.08)",
                  "--l2": "rgba(0,0,0,.22)",
                  "--f": "'Nunito Sans',system-ui,sans-serif",
                  "--hf": "'Libre Baskerville',Georgia,serif",
                  "--rad": "6px",
                } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <div className="ts-nav">
                <div className="ts-logo">
                  <i />Evergreen Marketing
                </div>
                <nav>
                  <span className="on">Home</span>
                  <span>Services</span>
                  <span>About</span>
                  <span>Blog</span>
                </nav>
                <span className="ts-btn">Get a proposal</span>
                <span className="ts-burger" />
              </div>
              <div className="ts-hero" data-s="hero">
                <div className="ts-copy">
                  <span className="ts-eye">Digital marketing agency</span>
                  <h1>Marketing that pays <em>for itself</em></h1>
                  <p>Search, social and paid campaigns measured by the results they bring.</p>
                  <div className="ts-row">
                    <span className="ts-btn">Get a proposal →</span>
                    <span className="ts-btn o">Learn more</span>
                  </div>
                  <div className="ts-trust">
                    <span className="ts-avs">
                      <i style={{ background: "#2F6B3F" }} />
                      <i style={{ background: "#1B2A1E" }} />
                      <i style={{ background: "#E1ECDD" }} />
                    </span>
                    <span>
                      <b className="ts-stars">★★★★★</b>
                      <br />Loved by local customers
                    </span>
                  </div>
                </div>
                <div className="ts-visual">
                  <div className="ts-art">
                    <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice">
                      <rect width="480" height="360" fill="#E1ECDD" />
                      <rect x="40" y="44" width="400" height="272" rx="16" fill="#F4F7F2" />
                      <rect x="64" y="68" width="90" height="10" rx="5" fill="#1B2A1E" opacity=".8" />
                      <rect x="64" y="90" width="60" height="22" rx="6" fill="#2F6B3F" />
                      <rect x="300" y="68" width="116" height="24" rx="12" fill="#E1ECDD" />
                      <path d="M64 262l50-36 46 14 52-50 46 22 56-58 62-26v134H64z" fill="#2F6B3F" opacity=".28" />
                      <path d="M64 262l50-36 46 14 52-50 46 22 56-58 62-26" stroke="#2F6B3F" strokeWidth="5" fill="none" strokeLinejoin="round" />
                      <circle cx="376" cy="128" r="8" fill="#2F6B3F" />
                      <path d="M64 292h352" stroke="#1B2A1E" strokeOpacity=".15" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="ts-chip c1">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 20l4-1L19 8l-3-3L5 16z" />
                        <path d="M14 6l3 3" />
                      </svg>
                    </i>
                    <span>Projects delivered<small>Sample: 120+</small></span>
                  </div>
                  <div className="ts-chip c2">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                      </svg>
                    </i>
                    <span>New work every month<small>Portfolio updated</small></span>
                  </div>
                </div>
              </div>
              <div className="ts-logos">
                <span>Trusted by</span>
                <b>Northline</b>
                <b>Kitehouse</b>
                <b>Lumora</b>
                <b>Parallel</b>
                <b>Brightway</b>
              </div>
              <div className="ts-sec" data-s="cards">
                <div className="ts-sh">
                  <span className="ts-eye sm">Services</span>
                  <h2>Services at Evergreen Marketing</h2>
                </div>
                <div className="ts-grid">
                  <div className="ts-card">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 20l4-1L19 8l-3-3L5 16z" />
                      </svg>
                    </i>
                    <b>SEO</b>
                    <span>Rank for what customers search.</span>
                    <a>Learn more →</a>
                  </div>
                  <div className="ts-card">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M10 8l6 4-6 4z" />
                      </svg>
                    </i>
                    <b>Paid ads</b>
                    <span>Campaigns tuned every week.</span>
                    <a>Learn more →</a>
                  </div>
                  <div className="ts-card">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
                      </svg>
                    </i>
                    <b>Social media</b>
                    <span>Content and community managed.</span>
                    <a>Learn more →</a>
                  </div>
                </div>
              </div>
              <div className="ts-quote">
                <b className="q">“</b>
                <div>
                  <p>Working with Evergreen Marketing was easy from the first message. Clear, friendly and quick to help. We would recommend them to anyone.</p>
                  <span><i style={{ background: "#2F6B3F" }} />Sample customer review</span>
                </div>
              </div>
              <div className="ts-band" data-s="band">
                <div>
                  <h3>Free strategy call this month</h3>
                  <p>Get a proposal today. It only takes a minute.</p>
                </div>
                <span className="ts-btn">Get a proposal</span>
              </div>
              <div className="ts-foot">© Evergreen Marketing · Home · Services · About · Blog · Contact</div>
            </div>
          </ScaledFrame>

          {/* Meridian Pizza */}
          <ScaledFrame dataT="230">
            <div
              className="ts Lrev Csoft"
              style={
                {
                  "--b": "#FBF7F2",
                  "--i": "#2B2118",
                  "--a": "#A63D10",
                  "--o": "#FFFFFF",
                  "--s": "#F3E6DA",
                  "--l": "rgba(0,0,0,.08)",
                  "--l2": "rgba(0,0,0,.22)",
                  "--f": "'Manrope',system-ui,sans-serif",
                  "--hf": "'Libre Baskerville',Georgia,serif",
                  "--rad": "4px",
                } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <div className="ts-nav">
                <div className="ts-logo">
                  <i />Meridian Pizza
                </div>
                <nav>
                  <span className="on">Home</span>
                  <span>Menu</span>
                  <span>About</span>
                  <span>Contact</span>
                </nav>
                <span className="ts-btn">Order online</span>
                <span className="ts-burger" />
              </div>
              <div className="ts-hero" data-s="hero">
                <div className="ts-copy">
                  <span className="ts-eye">Wood-fired pizza</span>
                  <h1>Pizza from a real <em>wood oven</em></h1>
                  <p>Long-proved dough, Italian flour and toppings we would eat ourselves.</p>
                  <div className="ts-row">
                    <span className="ts-btn">Order online →</span>
                    <span className="ts-btn o">Learn more</span>
                  </div>
                  <div className="ts-trust">
                    <span className="ts-avs">
                      <i style={{ background: "#A63D10" }} />
                      <i style={{ background: "#2B2118" }} />
                      <i style={{ background: "#F3E6DA" }} />
                    </span>
                    <span>
                      <b className="ts-stars">★★★★★</b>
                      <br />Loved by local customers
                    </span>
                  </div>
                </div>
                <div className="ts-visual">
                  <div className="ts-art">
                    <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice">
                      <rect width="480" height="360" fill="#F3E6DA" />
                      <circle cx="230" cy="185" r="138" fill="#3A2A20" />
                      <circle cx="230" cy="185" r="118" fill="#F4EBDD" />
                      <circle cx="230" cy="185" r="92" fill="#EADBC4" />
                      <circle cx="204" cy="164" r="44" fill="#A63D10" />
                      <circle cx="262" cy="206" r="36" fill="#B5462B" />
                      <circle cx="252" cy="148" r="22" fill="#F1E3C8" />
                      <ellipse cx="190" cy="222" rx="24" ry="12" fill="#5C8A3A" transform="rotate(-24 190 222)" />
                      <ellipse cx="282" cy="160" rx="16" ry="8" fill="#5C8A3A" transform="rotate(30 282 160)" />
                      <circle cx="214" cy="150" r="5" fill="#F7EBDD" />
                      <circle cx="196" cy="176" r="4" fill="#F7EBDD" />
                      <rect x="396" y="70" width="14" height="230" rx="7" fill="#C9B79C" />
                      <ellipse cx="403" cy="70" rx="20" ry="30" fill="#C9B79C" />
                      <circle cx="70" cy="300" r="34" fill="#3A2A20" />
                      <circle cx="70" cy="300" r="24" fill="#A63D10" opacity=".8" />
                    </svg>
                  </div>
                  <div className="ts-chip c1">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 8h12v6a6 6 0 01-12 0z" />
                        <path d="M17 10h2a2 2 0 010 4h-2M8 3v2M12 3v2" />
                      </svg>
                    </i>
                    <span>Open today<small>11:00 to 23:00</small></span>
                  </div>
                  <div className="ts-chip c2">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                      </svg>
                    </i>
                    <span>Order online<small>Pickup or delivery</small></span>
                  </div>
                </div>
              </div>
              <div className="ts-logos">
                <span>Trusted by</span>
                <b>Northline</b>
                <b>Kitehouse</b>
                <b>Lumora</b>
                <b>Parallel</b>
                <b>Brightway</b>
              </div>
              <div className="ts-sec" data-s="cards">
                <div className="ts-sh">
                  <span className="ts-eye sm">Our menu</span>
                  <h2>Our menu at Meridian Pizza</h2>
                </div>
                <div className="ts-grid">
                  <div className="ts-card">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 8h12v6a6 6 0 01-12 0z" />
                        <path d="M17 10h2a2 2 0 010 4h-2M8 3v2M12 3v2" />
                      </svg>
                    </i>
                    <b>Classic pizzas</b>
                    <span>Margherita to diavola.</span>
                    <a>Learn more →</a>
                  </div>
                  <div className="ts-card">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                      </svg>
                    </i>
                    <b>Specials</b>
                    <span>New every month.</span>
                    <a>Learn more →</a>
                  </div>
                  <div className="ts-card">
                    <i>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="9" width="18" height="12" rx="1" />
                        <path d="M3 13h18M12 9v12M12 9c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1" />
                      </svg>
                    </i>
                    <b>Desserts</b>
                    <span>Tiramisu and gelato.</span>
                    <a>Learn more →</a>
                  </div>
                </div>
              </div>
              <div className="ts-quote">
                <b className="q">“</b>
                <div>
                  <p>Working with Meridian Pizza was easy from the first message. Clear, friendly and quick to help. We would recommend them to anyone.</p>
                  <span><i style={{ background: "#A63D10" }} />Sample customer review</span>
                </div>
              </div>
              <div className="ts-band" data-s="band">
                <div>
                  <h3>Delivery nearby [confirm]</h3>
                  <p>Order online today. It only takes a minute.</p>
                </div>
                <span className="ts-btn">Order online</span>
              </div>
              <div className="ts-foot">© Meridian Pizza · Home · Menu · About · Contact</div>
            </div>
          </ScaledFrame>

          {/* Floating Badges */}
          <div className="badge2 b1">
            <i style={{ background: "linear-gradient(135deg,#0FA37F,#0A7CC8)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5 9-10" />
              </svg>
            </i>
            <span>
              Mobile-ready
              <small>Every template</small>
            </span>
          </div>

          <div className="badge2 b2">
            <i style={{ background: "linear-gradient(135deg,#E4512F,#F5A300)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
              </svg>
            </i>
            <span>
              Edit with AI
              <small>Or by hand</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
