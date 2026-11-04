import { useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { Check, Gift } from "lucide-react";
import { adminPartnerApi, type PartnerProgramConfig } from "../../api/partner.ts";
import { errorMessage } from "../../api/http.ts";
import FormAlert from "../ui/FormAlert.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

export function ReferralStatusChip({ config }: { config: PartnerProgramConfig | null }) {
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-semibold text-ink flex items-center gap-2">
            <Gift className="size-5 text-brand" />
            Global Referral & Commission Policy
          </h3>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
            Configure platform-wide default commission settings. These rules automatically apply to newly approved partners and any partner configured with &ldquo;Use Global Default&rdquo;. Individual partner custom overrides remain unaffected.
          </p>
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
            <div className="w-36">
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
            Default percentage of payment order amounts credited to newly registered partners.
          </p>
        </div>

        {/* Global Commission Policy */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-ink">
            Default Commission Policy (When does a partner earn?)
          </label>
          <div className="space-y-2">
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                policy === "FIRST_PAYMENT"
                  ? "border-brand bg-brand/5 shadow-xs"
                  : "border-line bg-canvas/40 hover:bg-canvas"
              }`}
            >
              <input
                type="radio"
                name="defaultCommissionPolicy"
                value="FIRST_PAYMENT"
                checked={policy === "FIRST_PAYMENT"}
                onChange={() => setPolicy("FIRST_PAYMENT")}
                className="mt-0.5 text-brand"
              />
              <div>
                <div className="text-xs font-semibold text-ink">First Payment Only (One-Time)</div>
                <div className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                  Partners earn commission only on the referred customer&apos;s initial payment. Subsequent subscription renewals and repeats will not generate commissions.
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                policy === "EVERY_RENEWAL"
                  ? "border-brand bg-brand/5 shadow-xs"
                  : "border-line bg-canvas/40 hover:bg-canvas"
              }`}
            >
              <input
                type="radio"
                name="defaultCommissionPolicy"
                value="EVERY_RENEWAL"
                checked={policy === "EVERY_RENEWAL"}
                onChange={() => setPolicy("EVERY_RENEWAL")}
                className="mt-0.5 text-brand"
              />
              <div>
                <div className="text-xs font-semibold text-ink">Every Subscription Renewal (Recurring)</div>
                <div className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                  Partners earn commission on the initial payment and every recurring subscription renewal as long as their partnership eligibility remains active.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Notice on overrides */}
        <div className="rounded-lg border border-line bg-canvas/60 p-3 text-[11px] text-ink-muted leading-relaxed">
          <strong className="text-ink font-semibold">Note:</strong> Changing these global settings does not overwrite partners who have custom rates or individual policies configured in the Partner Management tab.
        </div>

        <div className="pt-2">
          <Button type="submit" isPending={saving} className="min-w-32">
            Save Settings
          </Button>
        </div>
      </div>
    </form>
  );
}
