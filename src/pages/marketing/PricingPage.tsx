import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PLANS } from "./data.ts";
import Icon from "./Icon.tsx";
import Tabs from "./Tabs.tsx";

export default function PricingPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"m" | "y">("m");

  return (
    <div className="view" data-view="pricing">
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Pricing</div>
          <h1>Simple plans for every business</h1>
          <p className="lead">
            Start with one website and grow to many. [Short pricing message.] Plans and prices are placeholders until
            they are confirmed.
          </p>
          <Tabs
            label="Billing period"
            style={{ marginTop: "8px" }}
            value={billing}
            onChange={setBilling}
            items={[
              { key: "m", label: "Monthly" },
              {
                key: "y",
                label: (
                  <>
                    Yearly{" "}
                    <span className="badge" style={{ marginLeft: "6px" }}>
                      Save [x]%
                    </span>
                  </>
                ),
              },
            ]}
          />
        </div>
      </div>
      <section>
        <div className="wrap stack" style={{ gap: "28px" }}>
          <div className="grid g3" style={{ alignItems: "start" }}>
            {PLANS.map(([name, description, features, featured]) => (
              <div key={name} className={featured ? "card plan feat" : "card plan"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "20px" }}>{name}</h3>
                  {featured && <span className="badge">Most popular</span>}
                </div>
                <p>{description}</p>
                <div className="price">
                  <b>[Price]</b>
                  <span className="muted">{billing === "y" ? "/ year" : "/ month"}</span>
                </div>
                <p className="hint">
                  {billing === "y"
                    ? "Billed once a year. [Yearly saving to confirm.]"
                    : "Billed monthly. Cancel any time."}
                </p>
                <button
                  className={featured ? "btn p lg block" : "btn lg block"}
                  type="button"
                  onClick={() =>
                    navigate("/signup", {
                      state: { notice: `Plan selected: ${name}. Billing is set up after you verify your email.` },
                    })
                  }
                >
                  Get started
                </button>
                <ul>
                  {features.map((feature) => (
                    <li key={feature} className="tick">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="incl">
            <span className="incl-t">Every plan includes</span>
            <span className="incl-i">
              <span className="tile sm c4">
                <Icon name="sparkle" className="ico" />
              </span>
              AI builder
            </span>
            <span className="incl-i">
              <span className="tile sm c0">
                <Icon name="layout" className="ico" />
              </span>
              Manual builder
            </span>
            <span className="incl-i">
              <span className="tile sm c5">
                <Icon name="devices" className="ico" />
              </span>
              Mobile-ready
            </span>
            <span className="incl-i">
              <span className="tile sm c1">
                <Icon name="image" className="ico" />
              </span>
              Media library
            </span>
            <span className="incl-i">
              <span className="tile sm c3">
                <Icon name="pencil" className="ico" />
              </span>
              Drafts and preview
            </span>
            <span className="incl-i">
              <span className="tile sm c2">
                <Icon name="lock" className="ico" />
              </span>
              Private workspace
            </span>
          </div>
          <p className="hint" style={{ textAlign: "center" }}>
            AI credits and e-commerce are planned for Phase 2 and are not part of these plans.
          </p>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow">Compare plans</div>
            <h2>What's in each plan</h2>
          </div>
          <div className="cmp">
            <table>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Starter</th>
                  <th scope="col" className="us">
                    Business
                  </th>
                  <th scope="col">Agency</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Websites</td>
                  <td>1</td>
                  <td className="us">[n]</td>
                  <td>[n]</td>
                </tr>
                <tr>
                  <td>Manual and AI builder</td>
                  <td>
                    <b className="y">✓</b>
                  </td>
                  <td className="us">
                    <b className="y">✓</b>
                  </td>
                  <td>
                    <b className="y">✓</b>
                  </td>
                </tr>
                <tr>
                  <td>All templates</td>
                  <td>
                    <b className="y">✓</b>
                  </td>
                  <td className="us">
                    <b className="y">✓</b>
                  </td>
                  <td>
                    <b className="y">✓</b>
                  </td>
                </tr>
                <tr>
                  <td>Free sub-domain</td>
                  <td>
                    <b className="y">✓</b>
                  </td>
                  <td className="us">
                    <b className="y">✓</b>
                  </td>
                  <td>
                    <b className="y">✓</b>
                  </td>
                </tr>
                <tr>
                  <td>Connect your own domain</td>
                  <td>
                    <b className="n">–</b>
                  </td>
                  <td className="us">
                    <b className="y">✓</b>
                  </td>
                  <td>
                    <b className="y">✓</b>
                  </td>
                </tr>
                <tr>
                  <td>Reusable sections</td>
                  <td>
                    <b className="n">–</b>
                  </td>
                  <td className="us">
                    <b className="y">✓</b>
                  </td>
                  <td>
                    <b className="y">✓</b>
                  </td>
                </tr>
                <tr>
                  <td>Media storage</td>
                  <td>[Storage]</td>
                  <td className="us">[Storage]</td>
                  <td>[Storage]</td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td>Email</td>
                  <td className="us">Email</td>
                  <td>Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section>
        <div className="wrap faq">
          <div className="stack" style={{ gap: "10px" }}>
            <div className="eyebrow">FAQ</div>
            <h2 style={{ fontSize: "34px" }}>Pricing questions</h2>
            <p className="muted">
              Can't find an answer? <Link to="/contact">Contact us</Link>.
            </p>
          </div>
          <div>
            <details open>
              <summary>Can I change plans later?</summary>
              <p>[Answer to be confirmed with plan rules.]</p>
            </details>
            <details>
              <summary>What happens to my website if I cancel?</summary>
              <p>[Answer to be confirmed.]</p>
            </details>
            <details>
              <summary>Can I use my own domain on every plan?</summary>
              <p>Business and Agency plans connect your own domain. Starter uses a free sub-domain. [Confirm.]</p>
            </details>
            <details>
              <summary>Is there a free trial?</summary>
              <p>[Answer to be confirmed.]</p>
            </details>
          </div>
        </div>
      </section>
      <section style={{ paddingTop: "0" }}>
        <div className="wrap">
          <div className="ai-cta sky">
            <span className="tile c5">
              <Icon name="users" className="ico" />
            </span>
            <div className="stack" style={{ gap: "6px" }}>
              <h2>Managing many client websites?</h2>
              <p>Talk to us about the Agency plan and volume pricing.</p>
            </div>
            <Link to="/contact" className="btn p lg">
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
