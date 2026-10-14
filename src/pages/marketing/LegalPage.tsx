import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DOCS, type DocKey } from "./data.ts";
import Icon from "./Icon.tsx";
import { prefersReducedMotion } from "./marketing-context.ts";
import Tabs from "./Tabs.tsx";

export default function LegalPage() {
  const [params, setParams] = useSearchParams();
  const doc: DocKey = params.get("doc") === "privacy" ? "privacy" : "terms";
  const [active, setActive] = useState({ doc, index: 0 });
  const activeIndex = active.doc === doc ? active.index : 0;
  const d = DOCS[doc];

  return (
    <div className="view" data-view="legal">
      <div className="page-hero" style={{ textAlign: "left" }}>
        <div className="wrap" style={{ alignItems: "flex-start", textAlign: "left" }}>
          <div className="eyebrow">Legal</div>
          <h1>{d.t}</h1>
          <p className="hint">Last updated: [date]</p>
          <Tabs
            label="Legal document"
            value={doc}
            onChange={(key) => setParams({ doc: key }, { replace: true })}
            items={[
              { key: "terms", label: "Terms of Service" },
              { key: "privacy", label: "Privacy Policy" },
            ]}
          />
        </div>
      </div>
      <section>
        <div className="wrap legal">
          <nav className="toc" aria-label="On this page">
            <span className="eyebrow" style={{ padding: "0 12px 8px" }}>
              On this page
            </span>
            {d.s.map((title, i) => (
              <a
                key={title}
                href={`#${doc}-${i}`}
                className={i === activeIndex ? "on" : ""}
                onClick={(event) => {
                  event.preventDefault();
                  setActive({ doc, index: i });
                  document
                    .getElementById(`${doc}-${i}`)
                    ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
                }}
              >
                {i + 1}. {title}
              </a>
            ))}
          </nav>
          <div className="stack" style={{ gap: "24px", minWidth: "0" }}>
            <div className="inshort">
              <b>In short</b>
              <ul className="ticks">
                <li>
                  <Icon name="check" className="tk" />
                  <span>You own the content you put on your websites.</span>
                </li>
                <li>
                  <Icon name="check" className="tk" />
                  <span>We only use your data to run the service. [Confirm with your lawyer.]</span>
                </li>
                <li>
                  <Icon name="check" className="tk" />
                  <span>You can close your account at any time.</span>
                </li>
              </ul>
              <span className="hint">Summary only. The full text below applies.</span>
            </div>
            <article>
              {d.s.map((title, i) => (
                <div key={title}>
                  <h2 id={`${doc}-${i}`}>
                    {i + 1}. {title}
                  </h2>
                  <p>[Legal text to be provided by your lawyer. This block holds the full text for "{title}".]</p>
                </div>
              ))}
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
