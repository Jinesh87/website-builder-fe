import { useEffect, useState, type ReactNode } from "react";
import { Button, Label, Switch } from "@heroui/react";
import { Receipt } from "lucide-react";
import { hostingApi, type BillingCycle, type WebsiteHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatConnects, formatPaise } from "../../api/wallet.ts";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput from "../ui/SelectInput.tsx";
import {
  ConnectsInput,
  CYCLE_LABELS,
  formatBillingDate,
  formatConnectsPrice,
  formatPeriod,
  HostingStatusChip,
  METHOD_LABELS,
  PAYER_LABELS,
  parseConnects,
  PRICE_SOURCE_LABELS,
  remainingLabel,
} from "./hosting-labels.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

const CYCLE_OPTIONS = (["QUARTERLY", "YEARLY"] as const).map((value) => ({ value, label: CYCLE_LABELS[value] }));

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
  const { subscription } = hosting;
  const [cycle, setCycle] = useState<BillingCycle>(subscription?.cycle ?? "QUARTERLY");
  const [quarterly, setQuarterly] = useState("");
  const [yearly, setYearly] = useState("");
  const [saving, setSaving] = useState(false);
  const [togglingRenew, setTogglingRenew] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setCycle(subscription?.cycle ?? "QUARTERLY");
    setQuarterly(subscription?.quarterlyPrice?.toString() ?? "");
    setYearly(subscription?.yearlyPrice?.toString() ?? "");
  }, [subscription]);

  const planChanged =
    !subscription ||
    cycle !== subscription.cycle ||
    (isAdmin && (parseConnects(quarterly) !== subscription.quarterlyPrice || parseConnects(yearly) !== subscription.yearlyPrice));

  async function savePlan() {
    setSaving(true);
    setFeedback(null);
    try {
      onChange(
        await hostingApi.updatePlan(hosting.website.id, {
          cycle,
          ...(isAdmin ? { quarterlyPrice: parseConnects(quarterly), yearlyPrice: parseConnects(yearly) } : {}),
        }),
      );
      setFeedback({
        status: "success",
        message: subscription?.currentPeriodEnd
          ? "Plan saved. Changes apply from the next payment."
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

  const currentPrice = hosting.prices[subscription?.cycle ?? cycle];
  const remaining = subscription && remainingLabel(subscription);
  const inheritedFor = (target: BillingCycle) => {
    const inherited = hosting.inheritedPrices[target];
    return `Inherits ${inherited.source === "CLIENT" ? "client" : "global"} price: ${inherited.amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      {!hosting.enabled && (
        <FormAlert status="warning">
          Hosting billing is off on the platform, so publishing doesn't need a plan yet. Plans and payments set up here still apply.
        </FormAlert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <h2 className="text-sm font-semibold text-ink">Hosting plan</h2>
            <HostingStatusChip subscription={subscription} />
          </div>
          <dl className="divide-y divide-line px-5">
            <Row label="Plan">{subscription ? CYCLE_LABELS[subscription.cycle] : "Not chosen"}</Row>
            <Row label="Price">
              {formatConnectsPrice(currentPrice.amount, hosting.connectsPerRupee)}
              <span className="block text-xs font-normal text-ink-muted">{PRICE_SOURCE_LABELS[currentPrice.source]}</span>
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
            <Row label={isAdmin ? "Client's connects" : "Your connects"}>{formatConnects(hosting.balance)}</Row>
          </dl>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
            {subscription ? (
              <Switch isSelected={subscription.autoRenew} onChange={toggleAutoRenew} isDisabled={togglingRenew}>
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Label className="text-sm text-ink">Auto-renew from connects</Label>
                </Switch.Content>
              </Switch>
            ) : (
              <span className="text-xs text-ink-muted">Pick a plan below, then pay to activate.</span>
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
            <SelectInput label="Billing cycle" value={cycle} onChange={setCycle} options={CYCLE_OPTIONS} />
            {isAdmin && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ConnectsInput
                  id="website-quarterly-price"
                  label="Website quarterly price"
                  value={quarterly}
                  onChange={setQuarterly}
                  placeholder={`Inherit · ${hosting.inheritedPrices.QUARTERLY.amount.toLocaleString("en-IN")}`}
                  hint={inheritedFor("QUARTERLY")}
                  isDisabled={saving}
                />
                <ConnectsInput
                  id="website-yearly-price"
                  label="Website yearly price"
                  value={yearly}
                  onChange={setYearly}
                  placeholder={`Inherit · ${hosting.inheritedPrices.YEARLY.amount.toLocaleString("en-IN")}`}
                  hint={inheritedFor("YEARLY")}
                  isDisabled={saving}
                />
              </div>
            )}
            {isAdmin && <p className="-mt-2 text-xs text-ink-muted">Leave empty to use the client's or the global price. 0 = free.</p>}
            {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onPress={savePlan} isPending={saving} isDisabled={!planChanged}>
                Save plan
              </Button>
              {isAdmin && (quarterly || yearly) && (
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={saving}
                  onPress={() => {
                    setQuarterly("");
                    setYearly("");
                  }}
                >
                  Reset to inherited prices
                </Button>
              )}
            </div>
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
                  <th className="px-5 py-2.5 text-right font-medium">Connects</th>
                  <th className="px-5 py-2.5 font-medium">Paid by</th>
                  <th className="px-5 py-2.5 font-medium">Paid on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {hosting.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="whitespace-nowrap px-5 py-2.5 text-ink">{formatPeriod(payment.periodStart, payment.periodEnd)}</td>
                    <td className="px-5 py-2.5 text-ink-body">{CYCLE_LABELS[payment.cycle]}</td>
                    <td className="px-5 py-2.5 text-right font-semibold text-ink">{payment.amount.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-2.5 text-ink-body">
                      {PAYER_LABELS[payment.paidBy]} · {METHOD_LABELS[payment.method]}
                      {payment.collectedPaise !== null && ` · ${formatPaise(payment.collectedPaise)}`}
                      {payment.reference && <span className="block text-xs text-ink-muted">Ref {payment.reference}</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-xs text-ink-muted">{formatBillingDate(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
