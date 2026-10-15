import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CATS, TPLS } from "./data.ts";
import Icon from "./Icon.tsx";
import { TemplateFrame } from "./MiniSite.tsx";
import TemplateCard from "./TemplateCard.tsx";

export default function TemplatesPage() {
  const location = useLocation();
  const [cat, setCat] = useState<string>((location.state as { cat?: string } | null)?.cat ?? "All");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const list = TPLS.flatMap((t, index) =>
    (cat === "All" || t.c === cat) && (!q || [t.n, t.c, t.pages, t.biz].join(" ").toLowerCase().includes(q))
      ? [index]
      : [],
  );

  return (
    <div className="view" data-view="templates">
      <div className="page-hero split-hero">
        <div className="wrap">
          <div className="stack" style={{ gap: "16px" }}>
            <div className="eyebrow">Templates</div>
            <h1>Start from a template you like</h1>
            <p className="lead">
              Professional layouts for clinics, restaurants, agencies, consultants and more. Every template is fully
              editable after you sign up.
            </p>
            <div className="pills">
              <span className="pill mint">Mobile-ready</span>
              <span className="pill sky">Change any colour or font</span>
              <span className="pill coral">Add or remove sections</span>
            </div>
          </div>
          <div className="tcollage">
            <TemplateFrame t={1} />
            <TemplateFrame t={6} />
            <TemplateFrame t={7} />
          </div>
        </div>
      </div>
      <section>
        <div className="wrap stack" style={{ gap: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div className="chips" role="group" aria-label="Filter templates by category">
              {CATS.map((c) => (
                <button key={c} className="chip" type="button" aria-pressed={c === cat} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="fld" style={{ width: "min(280px,100%)" }}>
              <label htmlFor="tplSearch" className="sr">
                Search templates
              </label>
              <input
                id="tplSearch"
                className="in"
                type="search"
                placeholder="Search templates"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <p className="hint" aria-live="polite">
            {list.length} {list.length === 1 ? "template" : "templates"}
          </p>
          <div className="grid g3">
            {list.length ? (
              list.map((index) => <TemplateCard key={index} index={index} />)
            ) : (
              <div className="empty" style={{ gridColumn: "1/-1" }}>
                No templates match "{q}". Try another word or{" "}
                <button
                  className="link"
                  type="button"
                  style={{
                    border: 0,
                    background: "none",
                    color: "var(--accent)",
                    font: "inherit",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setCat("All");
                    setQuery("");
                  }}
                >
                  clear the filters
                </button>
                .
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow">How templates work</div>
            <h2>A starting point, not a straitjacket</h2>
          </div>
          <div className="grid g3">
            <div className="card">
              <span className="tile c0">
                <Icon name="layout" className="ico" />
              </span>
              <h3>Pick a template</h3>
              <p>Choose a layout made for your kind of business. Preview it on desktop and mobile first.</p>
            </div>
            <div className="card">
              <span className="tile c3">
                <Icon name="palette" className="ico" />
              </span>
              <h3>Make it yours</h3>
              <p>Add your logo, colours, fonts, photos and words. Add or remove sections and pages.</p>
            </div>
            <div className="card">
              <span className="tile c2">
                <Icon name="globe" className="ico" />
              </span>
              <h3>Publish</h3>
              <p>Go live on a free sub-domain or your own domain, then keep editing whenever you like.</p>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="wrap">
          <div className="ai-cta">
            <span className="tile c4">
              <Icon name="sparkle" className="ico" />
            </span>
            <div className="stack" style={{ gap: "6px" }}>
              <h2>Can't find the right one?</h2>
              <p>Describe your business and let AI build a website for you instead.</p>
            </div>
            <Link to="/features" className="btn p lg">
              See the AI builder
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
