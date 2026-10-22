import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatConnects, formatPaise } from "../../api/wallet.ts";
import { PLANS, TPLS } from "./data.ts";
import Icon from "./Icon.tsx";
import { prefersReducedMotion } from "./marketing-context.ts";
import { MediaTile, TemplateFrame, type SitePart } from "./MiniSite.tsx";
import TemplateCard from "./TemplateCard.tsx";
import HeroGalleryBanner from "./HeroGalleryBanner.tsx";
import { cyclePrice, usePublicPricing } from "./use-pricing.ts";



const AI_TEMPLATE = 1;
const AI_PROMPT = "A bold website for a design studio with services, portfolio and a contact page";
const AI_STEPS = [
  "Understanding your business",
  "Choosing a theme and layout",
  "Creating pages and sections",
  "Writing the content",
  "Saving an editable draft",
];
/** Parts of the sample site revealed as each AI step starts */
const AI_REVEAL: SitePart[][] = [["nav"], ["hero"], ["cards", "band"]];
const ALL_PARTS: SitePart[] = ["nav", "hero", "cards", "band"];

interface AiDemoState {
  typed: number;
  /** Step in progress; earlier steps are done */
  current: number;
  finished: boolean;
  generating: boolean;
  shown: SitePart[];
}

const AI_FINAL: AiDemoState = {
  typed: AI_PROMPT.length,
  current: AI_STEPS.length,
  finished: true,
  generating: false,
  shown: ALL_PARTS,
};

function useAiDemo() {
  const [state, setState] = useState(AI_FINAL);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const run = useCallback(() => {
    clear();
    if (prefersReducedMotion()) {
      setState(AI_FINAL);
      return;
    }
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    setState({ typed: 0, current: -1, finished: false, generating: true, shown: [] });
    let t = 0;
    for (let k = 1; k <= AI_PROMPT.length; k++) {
      t += 28;
      at(t, () => setState((s) => ({ ...s, typed: k })));
    }
    t += 400;
    AI_STEPS.forEach((_, i) => {
      at(t, () => setState((s) => ({ ...s, current: i, shown: [...s.shown, ...(AI_REVEAL[i] ?? [])] })));
      t += 900;
    });
    at(t, () => setState((s) => ({ ...s, finished: true, shown: ALL_PARTS })));
    at(t + 700, () => setState((s) => ({ ...s, generating: false })));
  }, []);

  const stepClass = (i: number) => (state.finished || i < state.current ? "done" : i === state.current ? "now" : "");

  return { state, run, stepClass };
}

const SHOWCASE_COLLECTIONS = [
  {
    id: "featured",
    label: "Featured (2026 Flagships)",
    indices: [19, 20, 3], // 2153 (Nexus AI), 2154 (Aura Pay), 2137 (Apex Summit)
  },
  {
    id: "landing",
    label: "Landing Pages",
    indices: [19, 20, 3], // 2153 (Nexus AI · Cyber), 2154 (Aura Pay · Fresh), 2137 (Apex Summit · Coral)
  },
  {
    id: "portfolio",
    label: "Portfolio & Personal",
    indices: [16, 17, 18], // 2150 (Photographer), 2151 (UX Designer), 2152 (Developer Portfolio)
  },
  {
    id: "education",
    label: "Education & Community",
    indices: [21, 22, 23], // 2155 (Tech Academy), 2156 (Design Institute), 2157 (Community Hub)
  },
  {
    id: "business",
    label: "Business & Agency",
    indices: [4, 8, 0], // 2138 (Architecture), 2142 (Marketing Agency), 2134 (Accounting)
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [showcaseTab, setShowcaseTab] = useState("featured");
  const activeCollection = SHOWCASE_COLLECTIONS.find((c) => c.id === showcaseTab) ?? SHOWCASE_COLLECTIONS[0];
  const ai = useAiDemo();
  const { run: runAi } = ai;
  const { pricing } = usePublicPricing();
  const yearly = cyclePrice(pricing, "YEARLY");
  const yearlyPrice = yearly ? `${formatPaise(yearly.paise)} / year` : "See pricing";
  const aiStage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = aiStage.current;
    if (!stage || prefersReducedMotion()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          runAi();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [runAi]);

  function openCategory(event: MouseEvent<HTMLElement>) {
    const button = (event.target as HTMLElement).closest<HTMLElement>("[data-cat]");
    if (button) navigate("/templates", { state: { cat: button.dataset.cat } });
  }

  // Two copies of the track make the marquee loop seamless.
  const marquee = (copy: number) =>
    TPLS.map((t, i) => (
      <Link key={`${copy}-${i}`} className="mq-i" to="/templates" tabIndex={-1} aria-hidden={copy ? "true" : undefined}>
        <TemplateFrame t={i} />
        <span>{t.n}</span>
      </Link>
    ));

  return (
    <div className="view" data-view="home">
      <HeroGalleryBanner />
      <div className="marquee" aria-label="Template previews">
        <div className="mq-track">
          {marquee(0)}
          {marquee(1)}
        </div>
      </div>
      <section>
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow">Everything in one place</div>
            <h2>All the tools to launch a professional website</h2>
            <p className="lead">Design, write, organise and publish without switching apps or hiring a developer.</p>
          </div>
          <div className="bento">
            <Link to="/features" className="bx b-ai">
              <div className="bx-t">
                <span className="tile c4">
                  <Icon name="sparkle" className="ico" />
                </span>
                <h3>AI website builder</h3>
                <p>Describe your business. Get pages, sections and content in minutes.</p>
              </div>
              <div className="prompt">
                <span className="typed" id="typed">
                  A website for a dental clinic with services and a booking form
                </span>
                <b>Generate</b>
              </div>
              <div className="gen-chips">
                <i>Home</i>
                <i>Services</i>
                <i>Team</i>
                <i>Book a visit</i>
                <i>Contact</i>
              </div>
            </Link>
            <Link to="/features" className="bx b-theme">
              <div className="bx-t">
                <span className="tile c3">
                  <Icon name="palette" className="ico" />
                </span>
                <h3>Your brand, everywhere</h3>
                <p>Change colours, fonts and buttons once. Every page updates.</p>
              </div>
              <div className="sw-big">
                <i style={{ background: "#3550E8" }} />
                <i style={{ background: "#F2603F" }} />
                <i style={{ background: "#0FA37F" }} />
                <i style={{ background: "#F5A300" }} />
                <i style={{ background: "#7351F0" }} />
              </div>
              <div className="font-row">
                <b style={{ fontFamily: "'Playfair Display',serif" }}>Aa</b>
                <b style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>Aa</b>
                <b style={{ fontFamily: "'Sora',sans-serif" }}>Aa</b>
                <b style={{ fontFamily: "'Libre Baskerville',serif" }}>Aa</b>
              </div>
            </Link>
            <Link to="/features" className="bx b-dev">
              <div className="bx-t">
                <span className="tile c5">
                  <Icon name="devices" className="ico" />
                </span>
                <h3>Looks right on every screen</h3>
                <p>Preview desktop, tablet and mobile.</p>
              </div>
              <div className="devs">
                <div className="d-desk">
                  <div className="ui-bar">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="d-hero">
                    <b />
                    <i />
                    <u />
                  </div>
                  <div className="d-3">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <div className="d-tab">
                  <div className="d-hero">
                    <b />
                    <i />
                    <u />
                  </div>
                  <div className="d-3 two">
                    <span />
                    <span />
                  </div>
                </div>
                <div className="d-phone">
                  <div className="d-hero">
                    <b />
                    <u />
                  </div>
                  <div className="d-3 one">
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/features" className="bx b-media">
              <div className="bx-t">
                <span className="tile c1">
                  <Icon name="image" className="ico" />
                </span>
                <h3>Media library</h3>
                <p>Images, videos and files in folders.</p>
              </div>
              <div className="mgrid">
                <MediaTile art="office|#3550E8|#ECEFFF|#14213D|#FFFFFF" />
                <MediaTile art="food|#E0A33B|#2C1F18|#F7EBDD|#1E1410" />
                <MediaTile art="clinic|#0E7C9A|#E5F3F7|#0B2D3A|#FFFFFF" />
                <MediaTile art="gallery|#111111|#E6E6E1|#111111|#F4F4F2" />
                <MediaTile art="tools|#0F7B6C|#E6F4F1|#0E2A2A|#FFFFFF" />
                <MediaTile art="agency|#FF5A36|#1C1C22|#F5F5F0|#0F0F12" />
              </div>
            </Link>
            <Link to="/features" className="bx b-dom">
              <div className="bx-t">
                <span className="tile c2">
                  <Icon name="globe" className="ico" />
                </span>
                <h3>Your own domain</h3>
                <p>Start free, connect yours later.</p>
              </div>
              <div className="dom-mini">
                <span>www.yourbusiness.com</span>
                <b className="ui-pill mint">Connected</b>
              </div>
            </Link>
            <Link to="/features" className="bx b-pub">
              <div className="bx-t">
                <span className="tile c0">
                  <Icon name="pencil" className="ico" />
                </span>
                <h3>Drafts first, publish when ready</h3>
                <p>Every change is a draft. Checks catch missing content before you go live.</p>
              </div>
              <div className="timeline">
                <span>
                  <i className="b" />
                  Edit
                </span>
                <em />
                <span>
                  <i className="s" />
                  Preview
                </span>
                <em />
                <span>
                  <i className="m" />
                  Check
                </span>
                <em />
                <span>
                  <i className="g" />
                  Publish
                </span>
              </div>
            </Link>
            <Link to="/features" className="bx b-priv">
              <div className="bx-t">
                <span className="tile cdark">
                  <Icon name="lock" className="ico" />
                </span>
                <h3>Private by default</h3>
                <p>Only your account sees your websites, media and settings.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      <section className="aiband">
        <div className="wrap ai-grid">
          <div className="stack" style={{ gap: "18px" }}>
            <div className="eyebrow dark">AI builder</div>
            <h2>Watch a website build itself</h2>
            <p className="lead">
              Type what your business does. AI picks a template, creates the pages and writes the words. Everything it
              makes stays fully editable in the manual builder.
            </p>
            <div className="ai-steps">
              {AI_STEPS.map((step, i) => (
                <span key={step} className={ai.stepClass(i) || undefined}>
                  {step}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button className="btn p lg" type="button" onClick={ai.run}>
                Run the demo again
              </button>
              <Link to="/signup" className="btn lg ghost">
                Try it on your business
              </Link>
            </div>
          </div>
          <div className="ai-stage" ref={aiStage}>
            <div className="ai-prompt">
              <span className="tile c4 sm">
                <Icon name="sparkle" className="ico" />
              </span>
              <span>{AI_PROMPT.slice(0, ai.state.typed)}</span>
              <i className="caret" />
            </div>
            <TemplateFrame
              t={AI_TEMPLATE}
              label="Sample website being generated"
              generating={ai.state.generating}
              shown={ai.state.shown}
            />
          </div>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow">How it works</div>
            <h2>From sign up to live website in four steps</h2>
          </div>
          <div className="grid g4 steps4">
            <div className="card step">
              <div className="st-vis">
                <span className="sv-field" />
                <span className="sv-field" />
                <span className="sv-btn" />
              </div>
              <span className="n">01</span>
              <h3>Sign up</h3>
              <p>Create your account and verify your email. Your private workspace is ready.</p>
            </div>
            <div className="card step">
              <div className="st-vis two">
                <span className="sv-opt on">
                  <Icon name="layout" className="ico" />
                </span>
                <span className="sv-opt">
                  <Icon name="sparkle" className="ico" />
                </span>
              </div>
              <span className="n">02</span>
              <h3>Create a website</h3>
              <p>Choose a template, or describe your business to the AI builder.</p>
            </div>
            <div className="card step">
              <div className="st-vis">
                <span className="sv-blk" />
                <span className="sv-blk on" />
                <span className="sv-blk" />
              </div>
              <span className="n">03</span>
              <h3>Customize</h3>
              <p>Edit text, images, sections and colours. Ask AI for changes in plain words.</p>
            </div>
            <div className="card step">
              <div className="st-vis pubv">
                <span className="sv-globe">
                  <Icon name="globe" className="ico" />
                </span>
                <span className="ui-pill mint">Live</span>
              </div>
              <span className="n">04</span>
              <h3>Publish</h3>
              <p>Preview every device, then publish to your free sub-domain or your own domain.</p>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="wrap">
          <div className="sec-head">
            <div className="stack" style={{ gap: "10px" }}>
              <div className="eyebrow">For every kind of business</div>
              <h2>Pick your industry, start from a ready layout</h2>
            </div>
          </div>
          <div className="inds" onClick={openCategory}>
            <button type="button" className="ind c2" data-cat="Services">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 4v16M4 12h16" />
              </svg>
              <span>
                Clinics
                <br />
                <small>Dental, physio, salons</small>
              </span>
              <em>View templates →</em>
            </button>
            <button type="button" className="ind c3" data-cat="Food">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 3v8a3 3 0 006 0V3M10 11v10M17 3c-2 2-2 6 0 8v10" />
              </svg>
              <span>
                Restaurants
                <br />
                <small>Cafés, kitchens, bars</small>
              </span>
              <em>View templates →</em>
            </button>
            <button type="button" className="ind c1" data-cat="Agency">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 20l4-12 4 12M5.5 15h5M15 8h5v12h-5z" />
              </svg>
              <span>
                Agencies
                <br />
                <small>Design, marketing, PR</small>
              </span>
              <em>View templates →</em>
            </button>
            <button type="button" className="ind c0" data-cat="Business">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19l5-6 4 3 7-9" />
                <path d="M15 7h5v5" />
              </svg>
              <span>
                Consultants
                <br />
                <small>Finance, legal, coaching</small>
              </span>
              <em>View templates →</em>
            </button>
            <button type="button" className="ind c4" data-cat="Portfolio">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 16l5-5 4 4 3-3 6 6" />
              </svg>
              <span>
                Creatives
                <br />
                <small>Photographers, artists</small>
              </span>
              <em>View templates →</em>
            </button>
            <button type="button" className="ind c5" data-cat="Landing page">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3c4 2 6 6 6 10l-3 3H9l-3-3c0-4 2-8 6-10zM9 16l-2 5M15 16l2 5" />
                <circle cx="12" cy="10" r="2" />
              </svg>
              <span>
                Startups
                <br />
                <small>Launch pages, waitlists</small>
              </span>
              <em>View templates →</em>
            </button>
          </div>
        </div>
      </section>
      <section style={{ paddingTop: "0" }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="stack" style={{ gap: "10px" }}>
              <div className="eyebrow">Templates</div>
              <h2>Start from a professional layout</h2>
            </div>
            <Link to="/templates" className="btn">
              Browse all templates
            </Link>
          </div>
          <div className="home-tpl-tabs" role="tablist" aria-label="Template categories">
            {SHOWCASE_COLLECTIONS.map((col) => (
              <button
                key={col.id}
                type="button"
                role="tab"
                aria-selected={showcaseTab === col.id}
                className={`home-tpl-tab ${showcaseTab === col.id ? "active" : ""}`}
                onClick={() => setShowcaseTab(col.id)}
              >
                {col.label}
              </button>
            ))}
          </div>
          <div className="grid g3">
            {activeCollection.indices.map((index) => (
              <TemplateCard key={`${showcaseTab}-${index}`} index={index} />
            ))}
          </div>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow">Compare</div>
            <h2>Three ways to get a business website</h2>
          </div>
          <div className="cmp cmp3">
            <table>
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">Hire a developer</th>
                  <th scope="col">Code it yourself</th>
                  <th scope="col" className="us">
                    WebBuilder
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Skills you need</td>
                  <td>None</td>
                  <td>HTML, CSS, hosting</td>
                  <td className="us">None</td>
                </tr>
                <tr>
                  <td>Time to first version</td>
                  <td>Weeks</td>
                  <td>Weeks to months</td>
                  <td className="us">Same day</td>
                </tr>
                <tr>
                  <td>Edit it yourself later</td>
                  <td>Usually not</td>
                  <td>Yes, with code</td>
                  <td className="us">Yes, visually</td>
                </tr>
                <tr>
                  <td>AI writes the first draft</td>
                  <td>No</td>
                  <td>No</td>
                  <td className="us">Yes</td>
                </tr>
                <tr>
                  <td>Cost</td>
                  <td>Project fee</td>
                  <td>Your time</td>
                  <td className="us">{yearlyPrice}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section>
        <div className="wrap">
          <div className="price-teaser">
            <div className="stack" style={{ gap: "10px" }}>
              <div className="eyebrow plain" style={{ color: "var(--on-accent)", opacity: ".85" }}>
                Pricing
              </div>
              <h2>Simple hosting plans</h2>
              <p>Pay quarterly or yearly with connects, or ask us for a custom plan.</p>
            </div>
            <div className="pt-plans">
              {PLANS.map((plan) => {
                const price = plan.cycle && cyclePrice(pricing, plan.cycle);
                return (
                  <span key={plan.name} className={plan.featured ? "hot" : undefined}>
                    <b>{plan.name}</b>
                    {price && `${formatConnects(price.connects)} (${formatPaise(price.paise)})`}
                  </span>
                );
              })}
            </div>
            <Link to="/pricing" className="btn lg">
              See pricing
            </Link>
          </div>
        </div>
      </section>
      <section style={{ paddingTop: "0" }}>
        <div className="wrap faq">
          <div className="stack" style={{ gap: "12px" }}>
            <div className="eyebrow">FAQ</div>
            <h2 style={{ fontSize: "34px" }}>Questions, answered</h2>
            <p className="muted">
              More on the <Link to="/pricing">pricing page</Link>, or <Link to="/contact">contact us</Link>.
            </p>
          </div>
          <div>
            <details open>
              <summary>Do I need to know how to code?</summary>
              <p>No. You edit pages, sections and content visually, or describe changes to the AI builder.</p>
            </details>
            <details>
              <summary>Can I edit a website the AI created?</summary>
              <p>Yes. AI websites use the same sections as the manual builder, so everything stays editable.</p>
            </details>
            <details>
              <summary>Can I use my own domain?</summary>
              <p>Yes. Every website starts on a free sub-domain and you can connect your own domain.</p>
            </details>
            <details>
              <summary>Will my website work on phones?</summary>
              <p>
                Yes. Every template adapts to desktop, tablet and mobile, and you can preview each before publishing.
              </p>
            </details>
            <details>
              <summary>Who can see my websites?</summary>
              <p>Only your account. Each client's websites, media and settings are private.</p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
