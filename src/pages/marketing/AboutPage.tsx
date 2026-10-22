import { Link } from "react-router-dom";
import Icon from "./Icon.tsx";
import { useGalleryTemplates } from "./use-gallery-templates.ts";

export default function AboutPage() {
  const templateCount = useGalleryTemplates().length;

  return (
    <div className="view" data-view="about">
      <div className="page-hero split-hero">
        <div className="wrap">
          <div className="stack" style={{ gap: "16px" }}>
            <div className="eyebrow">About us</div>
            <h1>We help businesses get online without the hassle</h1>
            <p className="lead">
              Bytezora was built to eliminate the complexity and agency costs of going digital. We provide small businesses, agencies, and independent creators with an intuitive visual editor and AI copilot to design, publish, and scale websites effortlessly.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link to="/signup" className="btn p lg">
                Start building
              </Link>
              <Link to="/contact" className="btn lg">
                Get in touch
              </Link>
            </div>
          </div>
          <div className="illus big-ill">
            <svg viewBox="0 0 640 400" role="img" aria-label="Illustration of a small team working at a shared desk">
              <rect width="640" height="400" fill="var(--accent-soft)" />
              <rect x="420" y="40" width="170" height="190" rx="8" fill="var(--surface)" />
              <path d="M505 40v190M420 135h170" stroke="var(--accent-soft)" strokeWidth="8" />
              <rect x="40" y="280" width="560" height="18" rx="5" fill="var(--fg)" />
              <rect x="80" y="298" width="14" height="102" fill="var(--fg)" />
              <rect x="546" y="298" width="14" height="102" fill="var(--fg)" />
              <rect x="150" y="180" width="160" height="100" rx="8" fill="var(--fg)" />
              <rect x="160" y="190" width="140" height="78" rx="4" fill="var(--accent)" />
              <rect x="172" y="204" width="70" height="8" rx="4" fill="var(--surface)" />
              <rect x="172" y="220" width="100" height="6" rx="3" fill="var(--surface)" opacity=".7" />
              <rect x="340" y="200" width="120" height="80" rx="8" fill="var(--fg)" opacity=".85" />
              <rect x="348" y="208" width="104" height="60" rx="4" fill="var(--surface)" />
              <circle cx="230" cy="120" r="34" fill="var(--fg)" opacity=".85" />
              <path d="M180 180c0-34 22-46 50-46s50 12 50 46z" fill="var(--fg)" opacity=".85" />
              <circle cx="400" cy="140" r="30" fill="var(--accent)" />
              <path d="M356 200c0-30 20-42 44-42s44 12 44 42z" fill="var(--accent)" />
              <rect x="70" y="236" width="40" height="44" rx="6" fill="var(--accent)" />
              <ellipse cx="80" cy="214" rx="12" ry="28" fill="#3E8E5A" transform="rotate(-18 80 214)" />
              <ellipse cx="100" cy="212" rx="12" ry="30" fill="#2F7A4B" transform="rotate(16 100 212)" />
            </svg>
          </div>
        </div>
      </div>
      <section>
        <div className="wrap grid g2" style={{ gap: "56px", alignItems: "center" }}>
          <div className="stack">
            <div className="eyebrow plain">Our mission</div>
            <h2 style={{ fontSize: "34px" }}>Build your website free, pay only for hosting</h2>
            <p className="lead">
              Every business deserves a modern, lightning-fast web presence without costly retainers or steep technical curves. Bytezora equips entrepreneurs to create professional, mobile-ready websites in minutes—complete with custom domain mapping, automated SEO, and reliable managed cloud hosting.
            </p>
          </div>
          <div className="facts">
            <div className="fact c0-bg">
              <b>2</b>
              <span>ways to build: by hand or with AI</span>
            </div>
            <div className="fact c1-bg">
              <b>{templateCount}</b>
              <span>starter templates at launch</span>
            </div>
            <div className="fact c2-bg">
              <b>3</b>
              <span>device previews before you publish</span>
            </div>
            <div className="fact c3-bg">
              <b>1</b>
              <span>dashboard for all your websites</span>
            </div>
          </div>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow">Our story</div>
            <h2>How we got here</h2>
          </div>
          <div className="tl">
            <div className="tl-i">
              <span className="tl-dot c0-bg" />
              <b>01</b>
              <h3>The spark</h3>
              <p>Recognizing how small businesses struggle with overpriced agencies and convoluted CMS platforms, our founders in Kerala set out to build a streamlined, zero-friction alternative.</p>
            </div>
            <div className="tl-i">
              <span className="tl-dot c1-bg" />
              <b>02</b>
              <h3>First version</h3>
              <p>Shipped our visual page builder with pre-built component blocks, responsive live previews, and automated SSL hosting for our early business clients.</p>
            </div>
            <div className="tl-i">
              <span className="tl-dot c2-bg" />
              <b>03</b>
              <h3>AI Copilot</h3>
              <p>Introduced AI-driven layout generation and smart content drafting, letting users produce fully styled, tailored websites from simple prompts in seconds.</p>
            </div>
            <div className="tl-i">
              <span className="tl-dot c3-bg" />
              <b>04</b>
              <h3>Growing platform</h3>
              <p>Headquartered in Ernakulam, Kerala, supporting creators and businesses with instant cloud publishing, custom domain routing, and agency multi-site tools.</p>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow">Values</div>
            <h2>What we believe</h2>
          </div>
          <div className="grid g3">
            <div className="card">
              <span className="tile c0">
                <Icon name="bolt" className="ico" />
              </span>
              <h3>Simple first</h3>
              <p>Anyone running a business should be able to build their own website.</p>
            </div>
            <div className="card">
              <span className="tile c1">
                <Icon name="pencil" className="ico" />
              </span>
              <h3>Yours to edit</h3>
              <p>Whether built by hand or by AI, every part of the website stays editable.</p>
            </div>
            <div className="card">
              <span className="tile c2">
                <Icon name="lock" className="ico" />
              </span>
              <h3>Private by default</h3>
              <p>Your websites, media and data are only visible to your account.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
