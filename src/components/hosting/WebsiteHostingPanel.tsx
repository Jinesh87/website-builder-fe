import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { Receipt } from "lucide-react";
import { hostingApi, type HostingAutopay, type PlanChoice, type WebsiteHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatConnects, formatPaise, isAutopayLive } from "../../api/wallet.ts";
import { defaultPlan } from "../../utils/hosting-pricing.ts";
import { CheckoutDismissedError, openRazorpaySubscriptionCheckout } from "../../utils/razorpay-checkout.ts";
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

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;

/** One line on what autopay does next. */
function autopayDetail(autopay: HostingAutopay): string {
  const amount = `${formatPaise(autopay.amountPaise)} per ${CYCLE_PERIOD[autopay.cycle]}`;
  switch (autopay.status) {
    case "PENDING":
      return "The last charge failed. Razorpay is retrying it.";
    case "HALTED":
      return "Stopped after failed payments. Turn it off and on again to use another card or UPI ID, or renew now.";
    case "PAUSED":
      return "Paused at Razorpay, so nothing is charged.";
    default: {
      const next = autopay.nextChargeAt ?? autopay.startAt;
      return next ? `Next charge ${formatBillingDate(next)} · ${amount}` : amount;
    }
  }
}

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
  const { subscription, autopay, payment: options } = hosting;
  const [plan, setPlan] = useState<PlanChoice | null>(() => defaultPlan(hosting));
  const [saving, setSaving] = useState(false);
  const [togglingRenew, setTogglingRenew] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [renewFeedback, setRenewFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setPlan(defaultPlan({ packages: hosting.packages, subscription }));
  }, [hosting.packages, subscription]);

  const current = hosting.packages.find((pkg) => pkg.id === subscription?.packageId);
  const currentPrice = current && subscription ? current.prices[subscription.cycle] : null;
  const planChanged = plan !== null && (plan.packageId !== subscription?.packageId || plan.cycle !== subscription?.cycle);
  const remaining = subscription && remainingLabel(subscription);
  // Only the client can approve a mandate; an admin can still turn one off.
  const canUseAutopay = Boolean(subscription) && (autopay !== null || (!isAdmin && options.razorpay && (currentPrice ?? 0) > 0));
  const autopayRenews =
    !isAdmin && subscription?.status === "ACTIVE" && (autopay?.status === "AUTHENTICATED" || autopay?.status === "ACTIVE");
  const renewalNote = !subscription
    ? "Pick a plan, then pay to activate."
    : autopay && isAutopayLive(autopay.status)
      ? "Renews by autopay."
      : subscription.autoRenew && options.connects
        ? "Renews from connects."
        : "Renew online before the period ends.";

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
    setRenewFeedback(null);
    try {
      onChange(await hostingApi.updatePlan(hosting.website.id, { autoRenew }));
    } catch (err) {
      setRenewFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setTogglingRenew(false);
    }
  }

  async function turnAutopayOn() {
    const checkout = await hostingApi.setupAutopay(hosting.website.id);
    const confirmation = await openRazorpaySubscriptionCheckout(checkout);
    const updated = await hostingApi.confirmAutopay(hosting.website.id, confirmation);
    onChange(updated);
    const paidNow = updated.payments[0]?.id !== hosting.payments[0]?.id;
    setRenewFeedback({
      status: "success",
      message: checkout.startsAt
        ? `Autopay is on. ${formatPaise(checkout.amountPaise)} is charged on ${formatBillingDate(checkout.startsAt)}.`
        : paidNow
          ? "Autopay is on and this period is paid."
          : "Autopay is on. The first payment is processing; hosting updates as soon as it lands.",
    });
  }

  async function toggleAutopay(on: boolean) {
    setTogglingRenew(true);
    setRenewFeedback(null);
    try {
      if (on) {
        await turnAutopayOn();
      } else {
        const updated = await hostingApi.cancelAutopay(hosting.website.id);
        onChange(updated);
        const paidUntil = updated.subscription?.status === "ACTIVE" ? updated.subscription.currentPeriodEnd : null;
        setRenewFeedback({
          status: "success",
          message: paidUntil ? `Autopay is off. Hosting stays paid until ${formatBillingDate(paidUntil)}.` : "Autopay is off.",
        });
      }
    } catch (err) {
      setRenewFeedback(
        err instanceof CheckoutDismissedError
          ? { status: "warning", message: "Autopay wasn't turned on. No money was taken." }
          : { status: "danger", message: err instanceof Error && err.constructor === Error ? err.message : errorMessage(err) },
      );
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
          {subscription && (canUseAutopay || options.connects) && (
            <div className="flex flex-col gap-3 border-t border-line px-5 py-4">
              {canUseAutopay && (
                <div>
                  <SwitchField
                    label="Autopay with card or UPI"
                    isSelected={autopay !== null}
                    onChange={toggleAutopay}
                    isDisabled={togglingRenew || (isAdmin && autopay === null)}
                  />
                  <p className={`mt-1 text-xs ${autopay && !isAutopayLive(autopay.status) ? "text-ed-danger" : "text-ink-muted"}`}>
                    {autopay
                      ? autopayDetail(autopay)
                      : subscription.status === "ACTIVE" && subscription.currentPeriodEnd
                        ? `Charged automatically when the period ends on ${formatBillingDate(subscription.currentPeriodEnd)}.`
                        : "Pays this period now, then renews automatically."}
                  </p>
                </div>
              )}
              {options.connects && (
                <SwitchField
                  label="Auto-renew from connects"
                  isSelected={subscription.autoRenew}
                  onChange={toggleAutoRenew}
                  isDisabled={togglingRenew || autopay !== null}
                />
              )}
              {renewFeedback && <FormAlert status={renewFeedback.status}>{renewFeedback.message}</FormAlert>}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
            <span className="text-xs text-ink-muted">{renewalNote}</span>
            <Button size="sm" onPress={onPay} isDisabled={hosting.renewalOpensAt !== null || autopayRenews}>
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
                <p className="mb-3 mt-0.5 text-xs text-ink-muted">
                  Starts from the default Custom price; change it for a deal agreed with the client. Only Super Admins can set it.
                </p>
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
