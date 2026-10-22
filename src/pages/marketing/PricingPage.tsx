import { Link, useNavigate } from "react-router-dom";
import type { BillingCycle } from "../../api/hosting.ts";
import { formatConnects, formatPaise } from "../../api/wallet.ts";
import { PLANS } from "./data.ts";
import Icon from "./Icon.tsx";
import {
  cyclePrice,
  quarterlyPremiumPercent,
  usePublicPricing,
  yearlySavingPercent,
  type CyclePrice,
} from "./use-pricing.ts";

const CYCLE_UNIT: Record<BillingCycle, string> = { QUARTERLY: "/ 3 months", YEARLY: "/ year" };

function Tick() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

function priceCell(price: CyclePrice | null): string {
  return price ? `${formatConnects(price.connects)} (${formatPaise(price.paise)})` : "–";
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { pricing, failed } = usePublicPricing();
  const loading = !pricing && !failed;
  const saving = yearlySavingPercent(pricing);
  const premium = quarterlyPremiumPercent(pricing);
  const quarterly = cyclePrice(pricing, "QUARTERLY");
  const yearly = cyclePrice(pricing, "YEARLY");

  return (
    <div className="view" data-view="pricing">
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Pricing</div>
          <h1>Simple, transparent pricing</h1>
          <p className="lead">
            Pay for hosting with connects, quarterly or yearly. Need something made for you? Ask us for a custom plan.
          </p>
        </div>
      </div>
      <section>
        <div className="wrap stack" style={{ gap: "28px" }}>
          <div className="grid g3" style={{ alignItems: "start" }} aria-busy={loading}>
            {PLANS.map((plan) => {
              const price = plan.cycle && cyclePrice(pricing, plan.cycle);
              const badge =
                plan.cycle === "YEARLY" && saving > 0
                  ? `Save ${saving}%`
                  : plan.cycle === "QUARTERLY" && premium > 0
                    ? `+${premium}% vs yearly`
                    : plan.featured
                      ? "Most popular"
                      : null;
              return (
                <div key={plan.name} className={plan.featured ? "card plan feat" : "card plan"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "20px" }}>{plan.name}</h3>
                    {badge && <span className="badge">{badge}</span>}
                  </div>
                  <p>{plan.description}</p>
                  {plan.cycle && (
                    <>
                      <div className="price">
                        <b>{price ? price.connects.toLocaleString("en-IN") : loading ? "…" : "Contact us"}</b>
                        {price && <span className="muted">connects {CYCLE_UNIT[plan.cycle]}</span>}
                      </div>
                      <p className="hint">
                        {price
                          ? `= ${formatPaise(price.paise)} ${CYCLE_UNIT[plan.cycle]}`
                          : loading
                            ? "Loading current prices."
                            : "Prices are being finalised. Contact us for details."}
                      </p>
                    </>
                  )}
                  {plan.cycle ? (
                    <button
                      className={plan.featured ? "btn p lg block" : "btn lg block"}
                      type="button"
                      onClick={() =>
                        navigate("/signup", {
                          state: {
                            notice: `Plan selected: ${plan.name}. Hosting is set up after you verify your email.`,
                          },
                        })
                      }
                    >
                      Get started
                    </button>
                  ) : (
                    <Link to="/contact" className="btn lg block">
                      Request a custom quote
                    </Link>
                  )}
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature} className="tick">
                        <Tick />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
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
            Prices are per website. AI builder usage is paid separately from your connects balance.
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
                  <th scope="col">Quarterly</th>
                  <th scope="col" className="us">
                    Yearly
                  </th>
                  <th scope="col">Custom</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Price</td>
                  <td>{priceCell(quarterly)}</td>
                  <td className="us">{priceCell(yearly)}</td>
                  <td>–</td>
                </tr>
                <tr>
                  <td>Billed</td>
                  <td>Every 3 months</td>
                  <td className="us">Once a year</td>
                  <td>–</td>
                </tr>
                <tr>
                  <td>Unlimited templates</td>
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
                  <td>Custom-designed template</td>
                  <td>
                    <b className="n">–</b>
                  </td>
                  <td className="us">
                    <b className="n">–</b>
                  </td>
                  <td>
                    <b className="y">✓</b>
                  </td>
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
              <summary>What are connects?</summary>
              <p>
                Connects are your account credits. You top them up online in rupees and pay for hosting from your
                balance.
              </p>
            </details>
            <details>
              <summary>Can I switch between quarterly and yearly?</summary>
              <p>Yes. Change the billing period for a website at any time. The new period applies from your next payment.</p>
            </details>
            <details>
              <summary>What happens if I don't renew on time?</summary>
              <p>
                {!pricing
                  ? "We remind you before your plan ends. "
                  : pricing.reminderDays > 0
                    ? `We remind you ${pricing.reminderDays} ${pricing.reminderDays === 1 ? "day" : "days"} before your plan ends. `
                    : ""}
                {pricing
                  ? `After it ends, your website stays live for ${pricing.graceDays} more ${pricing.graceDays === 1 ? "day" : "days"}, then goes offline. `
                  : "After it ends, your website stays live for a short grace period, then goes offline. "}
                Your draft is kept, so you can renew and publish again.
              </p>
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
              <h2>Need a custom-designed website?</h2>
              <p>Tell us what you need and we'll get back to you.</p>
            </div>
            <Link to="/contact" className="btn p lg">
              Request a custom quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
