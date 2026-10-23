import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { BillingCycle, HostingPackage } from "../../api/hosting.ts";
import { formatPaise } from "../../api/wallet.ts";
import { bestYearlySaving, yearlySavingPercent } from "../../utils/hosting-pricing.ts";
import Icon from "./Icon.tsx";
import Tabs from "./Tabs.tsx";
import { CUSTOM_STARTING_PAISE, CYCLE_MONTHS, CYCLE_UNIT, customStartingLabel, usePublicPricing } from "./use-pricing.ts";

const CYCLE_NAMES: Record<BillingCycle, string> = { QUARTERLY: "quarterly", YEARLY: "yearly" };

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

/** Every feature any package lists, in first-seen order, for the comparison table. */
function allFeatures(packages: HostingPackage[]): string[] {
  return [...new Set(packages.flatMap((pkg) => pkg.features))];
}

function PlanCard({ plan, cycle, onStart }: { plan: HostingPackage; cycle: BillingCycle; onStart: (plan: HostingPackage) => void }) {
  const price = plan.prices[cycle];
  const saving = cycle === "YEARLY" ? yearlySavingPercent(plan.prices) : 0;
  const badge = saving > 0 ? `Save ${saving}%` : plan.featured ? "Most popular" : null;

  return (
    <div className={plan.featured ? "card plan feat" : "card plan"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <h3 style={{ fontSize: "20px" }}>{plan.name}</h3>
        {badge && <span className="badge">{badge}</span>}
      </div>
      <p>{plan.description}</p>
      {plan.isCustom ? (
        <>
          <div className="price">
            <span className="muted">Starting from</span>
            <b>{formatPaise(CUSTOM_STARTING_PAISE[cycle])}</b>
            <span className="muted">{CYCLE_UNIT[cycle]}</span>
          </div>
          <p className="hint">The final price depends on your project. We'll send you a quote.</p>
          <Link to="/contact" className="btn lg block">
            Request a custom quote
          </Link>
        </>
      ) : (
        <>
          <div className="price">
            <b>{price ? formatPaise(price) : "—"}</b>
            {price && <span className="muted">{CYCLE_UNIT[cycle]}</span>}
          </div>
          <p className="hint">
            {price
              ? `About ${formatPaise(Math.round(price / CYCLE_MONTHS[cycle]))} a month, billed ${CYCLE_NAMES[cycle]}.`
              : `Not offered with ${CYCLE_NAMES[cycle]} billing.`}
          </p>
          <button
            className={plan.featured ? "btn p lg block" : "btn lg block"}
            type="button"
            disabled={!price}
            onClick={() => onStart(plan)}
          >
            Get started
          </button>
        </>
      )}
      {plan.features.length > 0 && (
        <ul>
          {plan.features.map((feature) => (
            <li key={feature} className="tick">
              <Tick />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { pricing, failed } = usePublicPricing();
  const [cycle, setCycle] = useState<BillingCycle>("YEARLY");
  const packages = pricing?.packages ?? [];
  const saving = bestYearlySaving(packages);
  const features = allFeatures(packages);

  function start(plan: HostingPackage) {
    navigate("/signup", {
      state: {
        notice: `Plan selected: ${plan.name}, billed ${CYCLE_NAMES[cycle]}. You choose hosting for each website when you publish it.`,
      },
    });
  }

  return (
    <div className="view" data-view="pricing">
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Pricing</div>
          <h1>Simple, transparent pricing</h1>
          <p className="lead">
            Hosting for each website, billed quarterly or yearly in rupees. Need something made for you? Ask us for a custom plan.
          </p>
        </div>
      </div>
      <section>
        <div className="wrap stack" style={{ gap: "28px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Tabs
              label="Billing period"
              value={cycle}
              onChange={setCycle}
              items={[
                { key: "QUARTERLY", label: "Quarterly" },
                {
                  key: "YEARLY",
                  label: (
                    <>
                      Yearly
                      {saving > 0 && <span className="badge">Save up to {saving}%</span>}
                    </>
                  ),
                },
              ]}
            />
          </div>

          {failed ? (
            <p className="hint" style={{ textAlign: "center" }}>
              We couldn't load prices right now. Please refresh, or <Link to="/contact">contact us</Link> for a quote.
            </p>
          ) : !pricing ? (
            <div className="grid g3" aria-busy="true">
              {[0, 1, 2].map((index) => (
                <div key={index} className="card plan" style={{ minHeight: "320px" }}>
                  <p className="hint">Loading current prices…</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid g3">
              {packages.map((plan) => (
                <PlanCard key={plan.id} plan={plan} cycle={cycle} onStart={start} />
              ))}
            </div>
          )}

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
            Prices are per website, in Indian rupees. AI builder usage is paid separately with connects.
          </p>
        </div>
      </section>
      {packages.length > 0 && (
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
                    {packages.map((plan) => (
                      <th key={plan.id} scope="col" className={plan.featured ? "us" : undefined}>
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Price ({CYCLE_NAMES[cycle]})</td>
                    {packages.map((plan) => {
                      const price = plan.prices[cycle];
                      return (
                        <td key={plan.id} className={plan.featured ? "us" : undefined}>
                          {plan.isCustom ? customStartingLabel(cycle) : price ? `${formatPaise(price)} ${CYCLE_UNIT[cycle]}` : "–"}
                        </td>
                      );
                    })}
                  </tr>
                  {features.map((feature) => (
                    <tr key={feature}>
                      <td>{feature}</td>
                      {packages.map((plan) => (
                        <td key={plan.id} className={plan.featured ? "us" : undefined}>
                          {plan.features.includes(feature) ? <b className="y">✓</b> : <b className="n">–</b>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
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
              <summary>How do I pay for hosting?</summary>
              <p>
                Online through Razorpay, by card, UPI or net banking, when you publish a website.
                {pricing?.allowConnectsPayment && " You can also pay from your connects balance if you prefer."}
              </p>
            </details>
            <details>
              <summary>What are connects?</summary>
              <p>Connects are credits for the AI builder. You top them up in rupees and spend them as you use AI features.</p>
            </details>
            <details>
              <summary>Can I switch plans or billing period?</summary>
              <p>Yes. Change the plan or billing period for a website at any time. The change applies from your next payment.</p>
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
