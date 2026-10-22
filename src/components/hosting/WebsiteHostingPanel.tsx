import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { Receipt } from "lucide-react";
import { hostingApi, type PlanChoice, type WebsiteHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatConnects } from "../../api/wallet.ts";
import { defaultPlan } from "../../utils/hosting-pricing.ts";
import FormAlert from "../ui/FormAlert.tsx";
import {
  CYCLE_PERIOD,
  formatBillingDate,
  formatPeriod,
  formatPlanPrice,
  HostingStatusChip,
  METHOD_LABELS,
  PAYER_LABELS,
  paymentAmountLabel,
  planLabel,
  remainingLabel,
  SwitchField,
} from "./hosting-labels.tsx";
import PlanPicker from "./PlanPicker.tsx";
import WebsitePriceEditor from "./WebsitePriceEditor.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-ink">{children}</dd>
    </div>
  );
}

type WebsiteHostingPanelProps = {
  hosting: WebsiteHosting;
  isAdmin: boolean;
  onChange: (hosting: WebsiteHosting) => void;
  /** Opens the payment dialog. */
  onPay: () => void;
};

export default function WebsiteHostingPanel({ hosting, isAdmin, onChange, onPay }: WebsiteHostingPanelProps) {
  const { subscription, payment: options } = hosting;
  const [plan, setPlan] = useState<PlanChoice | null>(() => defaultPlan(hosting));
  const [saving, setSaving] = useState(false);
  const [togglingRenew, setTogglingRenew] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setPlan(defaultPlan({ packages: hosting.packages, subscription }));
  }, [hosting.packages, subscription]);

  const current = hosting.packages.find((pkg) => pkg.id === subscription?.packageId);
  const currentPrice = current && subscription ? current.prices[subscription.cycle] : null;
  const planChanged = plan !== null && (plan.packageId !== subscription?.packageId || plan.cycle !== subscription?.cycle);
  const remaining = subscription && remainingLabel(subscription);

  async function savePlan() {
    if (!plan) return;
    setSaving(true);
    setFeedback(null);
    try {
      onChange(await hostingApi.updatePlan(hosting.website.id, plan));
      setFeedback({
        status: "success",
        message: subscription?.currentPeriodEnd
          ? "Plan saved. It applies from the next payment."
          : "Plan saved. It starts when the first payment is made.",
      });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function toggleAutoRenew(autoRenew: boolean) {
    setTogglingRenew(true);
    setFeedback(null);
    try {
      onChange(await hostingApi.updatePlan(hosting.website.id, { autoRenew }));
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setTogglingRenew(false);
    }
  }

  return (
    <div className="space-y-6">
      {!hosting.enabled && (
        <FormAlert status="warning">
          Hosting billing is off on the platform, so publishing doesn't need a plan yet. Plans and payments set up here still apply.
        </FormAlert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="rounded-xl border border-line bg-surface shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <h2 className="text-sm font-semibold text-ink">Hosting plan</h2>
            <HostingStatusChip subscription={subscription} />
          </div>
          <dl className="divide-y divide-line px-5">
            <Row label="Plan">{subscription ? planLabel(subscription) : "Not chosen"}</Row>
            <Row label="Price">
              {formatPlanPrice(currentPrice)}
              {subscription && currentPrice !== null && currentPrice > 0 && (
                <span className="block text-xs font-normal text-ink-muted">per {CYCLE_PERIOD[subscription.cycle]}</span>
              )}
            </Row>
            <Row label="Current period">
              {subscription?.currentPeriodStart && subscription.currentPeriodEnd
                ? formatPeriod(subscription.currentPeriodStart, subscription.currentPeriodEnd)
                : "—"}
              {remaining && <span className="block text-xs font-normal text-ink-muted">{remaining}</span>}
            </Row>
            {subscription?.status === "GRACE" && subscription.graceEndsAt && (
              <Row label="Goes offline">{formatBillingDate(subscription.graceEndsAt)}</Row>
            )}
            {subscription?.status === "SUSPENDED" && subscription.suspendedAt && (
              <Row label="Offline since">{formatBillingDate(subscription.suspendedAt)}</Row>
            )}
            {options.connects && (
              <Row label={isAdmin ? "Client's connects" : "Your connects"}>{formatConnects(options.balance)}</Row>
            )}
          </dl>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
            {subscription && options.connects ? (
              <SwitchField
                label="Auto-renew from connects"
                isSelected={subscription.autoRenew}
                onChange={toggleAutoRenew}
                isDisabled={togglingRenew}
              />
            ) : (
              <span className="text-xs text-ink-muted">
                {subscription ? "Renew online before the period ends." : "Pick a plan, then pay to activate."}
              </span>
            )}
            <Button size="sm" onPress={onPay} isDisabled={hosting.renewalOpensAt !== null}>
              {isAdmin ? "Record payment" : subscription?.currentPeriodEnd ? "Renew now" : "Pay & activate"}
            </Button>
          </div>
          {hosting.renewalOpensAt && (
            <p className="border-t border-line px-5 py-3 text-xs text-ink-muted">
              Renewal opens on {formatBillingDate(hosting.renewalOpensAt)}.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-line bg-surface shadow-xs">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-sm font-semibold text-ink">{subscription ? "Change plan" : "Set up plan"}</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {subscription?.currentPeriodEnd
                ? "Applies from the next payment. The current period doesn't change."
                : "Saved without charging; the period starts on the first payment."}
            </p>
          </div>
          <div className="flex flex-col gap-4 px-5 py-4">
            <PlanPicker
              packages={hosting.packages}
              value={plan}
              onChange={(next) => {
                setPlan(next);
                setFeedback(null);
              }}
              currentPackageId={subscription?.packageId}
              onEditCustom={isAdmin ? () => document.getElementById(`custom-quarterly-${hosting.website.id}`)?.focus() : undefined}
              customAction={
                isAdmin ? undefined : (
                  <a href="/contact" target="_blank" rel="noreferrer" className="text-xs font-medium text-brand hover:underline">
                    Contact us for a quote
                  </a>
                )
              }
              isDisabled={saving}
            />
            {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
            <div>
              <Button size="sm" variant="outline" onPress={savePlan} isPending={saving} isDisabled={!planChanged}>
                Save plan
              </Button>
            </div>
            {isAdmin && (
              <div className="border-t border-line pt-4">
                <h3 className="text-sm font-semibold text-ink">Custom price for this website</h3>
                <p className="mb-3 mt-0.5 text-xs text-ink-muted">For a deal agreed with the client. Only Super Admins can set it.</p>
                <WebsitePriceEditor hosting={hosting} onSaved={onChange} />
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-line bg-surface shadow-xs">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold text-ink">Payment history</h2>
        </div>
        {hosting.payments.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Receipt className="mx-auto size-6 text-ink-muted" aria-hidden />
            <p className="mt-2 text-sm text-ink-body">No hosting payments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Period</th>
                  <th className="px-5 py-2.5 font-medium">Plan</th>
                  <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-5 py-2.5 font-medium">Paid by</th>
                  <th className="px-5 py-2.5 font-medium">Paid on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {hosting.payments.map((payment) => {
                  const { amount, detail } = paymentAmountLabel(payment);
                  return (
                    <tr key={payment.id}>
                      <td className="whitespace-nowrap px-5 py-2.5 text-ink">{formatPeriod(payment.periodStart, payment.periodEnd)}</td>
                      <td className="px-5 py-2.5 text-ink-body">{planLabel(payment)}</td>
                      <td className="whitespace-nowrap px-5 py-2.5 text-right">
                        <p className="font-semibold text-ink">{amount}</p>
                        {detail && <p className="text-xs text-ink-muted">{detail}</p>}
                      </td>
                      <td className="px-5 py-2.5 text-ink-body">
                        {PAYER_LABELS[payment.paidBy]} · {METHOD_LABELS[payment.method]}
                        {payment.reference && <span className="block text-xs text-ink-muted">Ref {payment.reference}</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-2.5 text-xs text-ink-muted">{formatBillingDate(payment.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
