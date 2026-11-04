import { useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { Check, Gift } from "lucide-react";
import { adminPartnerApi, type PartnerProgramConfig } from "../../api/partner.ts";
import { errorMessage } from "../../api/http.ts";
import FormAlert from "../ui/FormAlert.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

export function ReferralStatusChip({ config }: { config: Partial<PartnerProgramConfig> | null }) {
  if (!config) return null;
  return (
    <Chip color="accent">
      Default: {config.defaultCommissionRate}% •{" "}
      {config.defaultCommissionPolicy === "EVERY_RENEWAL" ? "Recurring" : "First payment only"}
    </Chip>
  );
}

export default function ReferralSettingsPanel({
  onLoaded,
}: {
  onLoaded?: (config: PartnerProgramConfig) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [rate, setRate] = useState<string>("15");
  const [policy, setPolicy] = useState<"FIRST_PAYMENT" | "EVERY_RENEWAL">("FIRST_PAYMENT");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let cancelled = false;
    adminPartnerApi
      .getProgramConfig()
      .then((res) => {
        if (cancelled) return;
        setRate(String(res.defaultCommissionRate ?? 15));
        setPolicy(res.defaultCommissionPolicy ?? "FIRST_PAYMENT");
        onLoaded?.(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [onLoaded]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const numericRate = parseFloat(rate);
    if (isNaN(numericRate) || numericRate < 1 || numericRate > 100) {
      setFeedback({
        status: "danger",
        message: "Default commission rate must be between 1% and 100%.",
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await adminPartnerApi.updateProgramConfig({
        defaultCommissionRate: numericRate,
        defaultCommissionPolicy: policy,
      });
      setRate(String(updated.defaultCommissionRate));
      setPolicy(updated.defaultCommissionPolicy);
      onLoaded?.(updated);
      setFeedback({
        status: "success",
        message: "Global referral and commission settings updated successfully.",
      });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" aria-label="Loading referral settings..." />
      </div>
    );
  }

  if (loadError) {
    return <FormAlert status="danger">{loadError}</FormAlert>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left Column: Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 xl:col-span-8 space-y-6">
        <div className="rounded-xl border border-line bg-surface p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                <Gift className="size-5 text-brand" />
                Global Referral & Commission Policy
              </h3>
              <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                Configure platform-wide default commission settings applied to newly approved partners.
              </p>
            </div>
            <ReferralStatusChip config={{ defaultCommissionRate: parseFloat(rate) || 15, defaultCommissionPolicy: policy }} />
          </div>

          {feedback && (
            <FormAlert status={feedback.status}>
              {feedback.status === "success" && <Check className="size-4 shrink-0 inline mr-1 text-emerald-600" />}
              {feedback.message}
            </FormAlert>
          )}

          {/* Default Commission Rate */}
          <div className="space-y-2">
            <label htmlFor="default-commission-rate" className="block text-xs font-semibold text-ink">
              Default Commission Rate (% per customer transaction)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-40">
                <input
                  id="default-commission-rate"
                  name="defaultCommissionRate"
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="15"
                  required
                  className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                />
              </div>
              <span className="text-xs text-ink-muted font-bold">%</span>
            </div>
            <p className="text-[11px] text-ink-muted leading-normal">
              Default percentage credited to partners without custom overrides.
            </p>
          </div>

          {/* Global Commission Policy */}
          <div className="space-y-2" style={{ colorScheme: "light" }}>
            <label className="block text-xs font-semibold text-ink">
              Commission Frequency & Payout Policy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  policy === "FIRST_PAYMENT"
                    ? "border-brand bg-brand/5 shadow-xs"
                    : "border-line bg-canvas/40 hover:bg-canvas"
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  <input
                    type="radio"
                    name="defaultCommissionPolicy"
                    value="FIRST_PAYMENT"
                    checked={policy === "FIRST_PAYMENT"}
                    onChange={() => setPolicy("FIRST_PAYMENT")}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      policy === "FIRST_PAYMENT"
                        ? "border-brand bg-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {policy === "FIRST_PAYMENT" && (
                      <span className="size-2 rounded-full bg-brand" />
                    )}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink">First Payment Only</div>
                  <div className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                    Earns on initial payment only. Renewals will not generate commissions.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  policy === "EVERY_RENEWAL"
                    ? "border-brand bg-brand/5 shadow-xs"
                    : "border-line bg-canvas/40 hover:bg-canvas"
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  <input
                    type="radio"
                    name="defaultCommissionPolicy"
                    value="EVERY_RENEWAL"
                    checked={policy === "EVERY_RENEWAL"}
                    onChange={() => setPolicy("EVERY_RENEWAL")}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      policy === "EVERY_RENEWAL"
                        ? "border-brand bg-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {policy === "EVERY_RENEWAL" && (
                      <span className="size-2 rounded-full bg-brand" />
                    )}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink">Every Renewal (Recurring)</div>
                  <div className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                    Earns on initial purchase and every subscription renewal.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" isPending={saving} className="min-w-32">
              Save Settings
            </Button>
          </div>
        </div>
      </form>

      {/* Right Column: Policy Architecture Guide */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
        <div className="rounded-xl border border-line bg-surface p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Commission System Architecture
          </h3>
          <ul className="space-y-2.5 text-xs text-ink-body">
            <li className="flex items-start gap-2">
              <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Global Defaults:</strong> Applied to newly approved partners unless customized.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Custom Overrides:</strong> Individual partner rates can be tailored in Partner Management.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Automated Attribution:</strong> Partner links use persistent 90-day cookie tracking.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-xs space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Quick Access</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Need to manage partner accounts, approve payouts, or adjust individual commissions?
          </p>
          <a
            href="/admin/partners"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
          >
            Open Partner Management →
          </a>
        </div>
      </div>
    </div>
  );
}
