import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, Chip, Spinner } from "@heroui/react";
import { CalendarClock, History, Package, Server } from "lucide-react";
import { adminHostingApi, type BillingCycle, type HostingPriceChange, type HostingSettings } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatPaise } from "../../api/wallet.ts";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput from "../ui/SelectInput.tsx";
import { CYCLE_LABELS, formatBillingDate, SwitchField } from "./hosting-labels.tsx";
import HostingPackageEditor from "./HostingPackageEditor.tsx";

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;
type Form = { enabled: boolean; allowConnectsPayment: boolean; reminderDays: string; graceDays: string };
type FormErrors = Partial<Record<keyof Form, string>>;

const SCOPE_LABELS: Record<HostingPriceChange["scope"], string> = {
  GLOBAL: "Global",
  CLIENT: "Client",
  WEBSITE: "Website",
  PACKAGE: "Package",
};
const CYCLE_OPTIONS = (["QUARTERLY", "YEARLY"] as const).map((value) => ({ value, label: CYCLE_LABELS[value] }));

function toForm(settings: HostingSettings): Form {
  return {
    enabled: settings.enabled,
    allowConnectsPayment: settings.allowConnectsPayment,
    reminderDays: String(settings.reminderDays),
    graceDays: String(settings.graceDays),
  };
}

function validate(form: Form): FormErrors {
  const days = (value: string) => (/^\d{1,2}$/.test(value) && Number(value) <= 60 ? undefined : "Enter 0 to 60 days");
  return { reminderDays: days(form.reminderDays), graceDays: days(form.graceDays) };
}

/** Package prices of 0 aren't offered; a website price of 0 is free. Older changes are in connects. */
function priceChange(change: HostingPriceChange, before: number | null, after: number | null): string {
  const show = (value: number | null) => {
    if (value === null) return "—";
    if (change.unit === "CONNECTS") return `${value.toLocaleString("en-IN")} connects`;
    if (value === 0) return change.scope === "PACKAGE" ? "Not offered" : "Free";
    return formatPaise(value);
  };
  return before === after ? show(after) : `${show(before)} → ${show(after)}`;
}

/** Hosting packages and billing rules; a website's custom price is set on its own Hosting tab. */
export default function HostingSettingsPanel({ onLoaded }: { onLoaded?: (settings: HostingSettings) => void }) {
  const [settings, setSettings] = useState<HostingSettings | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [freeDays, setFreeDays] = useState("30");
  const [backfillPackageId, setBackfillPackageId] = useState("");
  const [backfillCycle, setBackfillCycle] = useState<BillingCycle>("YEARLY");
  const [backfilling, setBackfilling] = useState(false);
  const [backfillFeedback, setBackfillFeedback] = useState<Feedback>(null);

  function apply(loaded: HostingSettings) {
    setSettings(loaded);
    setForm(toForm(loaded));
  }

  useEffect(() => {
    adminHostingApi
      .settings()
      .then(apply)
      .catch((err: unknown) => setLoadError(errorMessage(err)));
  }, []);

  useEffect(() => {
    if (settings) onLoaded?.(settings);
  }, [settings, onLoaded]);

  const listed = settings?.packages.filter((pkg) => !pkg.isCustom && (pkg.prices.QUARTERLY || pkg.prices.YEARLY)) ?? [];
  const firstListedId = listed[0]?.id;
  useEffect(() => {
    if (!backfillPackageId && firstListedId) setBackfillPackageId(firstListedId);
  }, [backfillPackageId, firstListedId]);

  function update<K extends keyof Form>(key: K) {
    return (value: Form[K]) => {
      setForm((current) => current && { ...current, [key]: value });
      setErrors((current) => ({ ...current, [key]: undefined }));
      setFeedback(null);
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.values(nextErrors).some(Boolean)) return;
    setSaving(true);
    try {
      apply(
        await adminHostingApi.updateSettings({
          enabled: form.enabled,
          allowConnectsPayment: form.allowConnectsPayment,
          reminderDays: Number(form.reminderDays),
          graceDays: Number(form.graceDays),
        }),
      );
      setFeedback({ status: "success", message: "Hosting settings saved." });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleBackfill() {
    const days = Number(freeDays);
    if (!(days >= 1 && days <= 366)) {
      setBackfillFeedback({ status: "danger", message: "Enter 1 to 366 free days." });
      return;
    }
    setBackfilling(true);
    setBackfillFeedback(null);
    try {
      const { created } = await adminHostingApi.backfill({ freeDays: days, packageId: backfillPackageId, cycle: backfillCycle });
      setBackfillFeedback({
        status: "success",
        message: `${created} ${created === 1 ? "website got" : "websites got"} a free ${days}-day plan.`,
      });
      apply(await adminHostingApi.settings());
    } catch (err) {
      setBackfillFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setBackfilling(false);
    }
  }

  if (loadError) return <FormAlert status="danger">{loadError}</FormAlert>;
  if (!settings || !form) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner aria-label="Loading hosting settings" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* 1. Hosting Packages Section */}
      <section className="rounded-xl border border-line bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Package className="size-5" aria-hidden />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-ink">Hosting packages</h2>
            <p className="text-xs text-ink-muted">
              Displayed on public pricing pages and domain-connect checkout. Configured in real-time.
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {settings.packages.map((pkg) => (
            <HostingPackageEditor key={pkg.id} pkg={pkg} onSaved={apply} />
          ))}
        </div>
      </section>

      {/* 2. Billing Rules & Existing Live Websites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Billing Rules Form */}
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-7 xl:col-span-7 rounded-xl border border-line bg-surface p-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Server className="size-5" aria-hidden />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink">Billing rules</h2>
              <p className="text-xs text-ink-muted">Clients pay online through Razorpay. Connects stay for AI unless allowed below.</p>
            </div>
            {settings.enabled ? <Chip color="success">Billing on</Chip> : <Chip>Billing off</Chip>}
          </div>

          {!settings.razorpayConfigured && (
            <div className="mt-5">
              <FormAlert status="warning">
                Razorpay isn't set up, so clients can't pay hosting online.{" "}
                <Link to="/admin/settings?tab=payments" className="font-medium underline">
                  Add the keys in Payments
                </Link>
                .
              </FormAlert>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <DaysInput
                id="hosting-reminder"
                label="Reminder before expiry"
                value={form.reminderDays}
                onChange={update("reminderDays")}
                hint="Email & notification alert. 0 = disabled."
                error={errors.reminderDays}
                isDisabled={saving}
              />
              <DaysInput
                id="hosting-grace"
                label="Grace period after expiry"
                value={form.graceDays}
                onChange={update("graceDays")}
                hint="After paid plans only. Free periods skip grace. Override per website on Hosting."
                error={errors.graceDays}
                isDisabled={saving}
              />
            </div>

            <div>
              <SwitchField label="Require a paid hosting plan for custom domains" isSelected={form.enabled} onChange={update("enabled")} isDisabled={saving} />
              <p className="mt-1 text-xs text-ink-muted">
                When on, connecting a custom domain needs a plan. Publishing on the free address stays free. Unpaid sites still go offline after the grace period.
              </p>
            </div>

            <div>
              <SwitchField
                label="Let clients pay hosting with connects"
                isSelected={form.allowConnectsPayment}
                onChange={update("allowConnectsPayment")}
                isDisabled={saving}
              />
              <p className="mt-1 text-xs text-ink-muted">
                Optional, next to online payment, at {settings.connectsPerRupee} connects per ₹1.
              </p>
            </div>

            {form.enabled && !settings.enabled && settings.liveSitesWithoutPlan > 0 && (
              <FormAlert status="warning">
                {settings.liveSitesWithoutPlan} live {settings.liveSitesWithoutPlan === 1 ? "website has" : "websites have"} no
                plan yet. Give them a free period before enforcing.
              </FormAlert>
            )}

            {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}

            <div className="pt-2">
              <Button type="submit" isPending={saving}>
                Save billing rules
              </Button>
            </div>
          </div>
        </form>

        {/* Existing Live Websites Provisioning */}
        <section className="lg:col-span-5 xl:col-span-5 rounded-xl border border-line bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <CalendarClock className="size-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">Active Sites Status</h2>
              <p className="text-xs text-ink-muted">
                {settings.liveSitesWithoutPlan === 0
                  ? "Every published website has a valid hosting plan."
                  : `${settings.liveSitesWithoutPlan} published ${settings.liveSitesWithoutPlan === 1 ? "website has" : "websites have"} no hosting plan. Grant one site from the client's websites page, or all here.`}
              </p>
            </div>
          </div>

          {settings.liveSitesWithoutPlan > 0 &&
            (listed.length === 0 ? (
              <div className="mt-3">
                <FormAlert status="warning">Price a package first, so these websites can renew after the free days.</FormAlert>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <DaysInput id="hosting-free-days" label="Free days" value={freeDays} onChange={setFreeDays} isDisabled={backfilling} />
                  <SelectInput label="Billed" value={backfillCycle} onChange={setBackfillCycle} options={CYCLE_OPTIONS} />
                </div>
                <SelectInput
                  label="Then renews on"
                  value={backfillPackageId}
                  onChange={setBackfillPackageId}
                  options={listed.map((pkg) => ({ value: pkg.id, label: pkg.name }))}
                />
                <Button variant="outline" onPress={handleBackfill} isPending={backfilling} isDisabled={!backfillPackageId} className="w-full mt-1">
                  Grant free period to {settings.liveSitesWithoutPlan} {settings.liveSitesWithoutPlan === 1 ? "site" : "sites"}
                </Button>
              </div>
            ))}

          {backfillFeedback && (
            <div className="mt-3">
              <FormAlert status={backfillFeedback.status}>{backfillFeedback.message}</FormAlert>
            </div>
          )}

          <div className="rounded-lg border border-line bg-canvas p-3.5 text-xs text-ink-muted space-y-2">
            <p className="font-semibold text-ink">Subscription Lifecycle</p>
            <p>Unpaid expired websites keep all their page data and drafts safely intact while offline, ready to instantly re-activate upon payment.</p>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-line bg-surface shadow-xs">
        <div className="flex items-center gap-2 border-b border-line px-6 py-4">
          <History className="size-4 text-ink-muted" aria-hidden />
          <h2 className="text-sm font-semibold text-ink">Recent price changes</h2>
        </div>
        {settings.recentPriceChanges.length === 0 ? (
          <p className="px-6 py-6 text-sm text-ink-muted">No price changes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th className="px-6 py-2.5 font-medium">Level</th>
                  <th className="px-6 py-2.5 font-medium">Quarterly</th>
                  <th className="px-6 py-2.5 font-medium">Yearly</th>
                  <th className="px-6 py-2.5 font-medium">By</th>
                  <th className="px-6 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {settings.recentPriceChanges.map((change) => (
                  <tr key={change.id}>
                    <td className="px-6 py-2.5">
                      <span className="text-ink">{change.label}</span>
                      <span className="ml-2 rounded-full bg-canvas px-2 py-0.5 text-xs text-ink-body">{SCOPE_LABELS[change.scope]}</span>
                    </td>
                    <td className="px-6 py-2.5 text-ink-body">{priceChange(change, change.oldQuarterlyPrice, change.newQuarterlyPrice)}</td>
                    <td className="px-6 py-2.5 text-ink-body">{priceChange(change, change.oldYearlyPrice, change.newYearlyPrice)}</td>
                    <td className="px-6 py-2.5 text-ink-body">{change.changedBy ?? "—"}</td>
                    <td className="whitespace-nowrap px-6 py-2.5 text-xs text-ink-muted">{formatBillingDate(change.createdAt)}</td>
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

function DaysInput({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  isDisabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  isDisabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={`flex h-9 w-36 items-center rounded-lg border bg-surface shadow-ed-xs focus-within:ring-2 ${
          error ? "border-ed-danger" : "border-ed-border focus-within:border-ed-accent focus-within:ring-ed-accent/15"
        }`}
      >
        <input
          id={id}
          inputMode="numeric"
          value={value}
          disabled={isDisabled}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 3))}
          className="w-full min-w-0 bg-transparent px-3 text-sm text-ink focus:outline-none"
        />
        <span className="pr-3 text-xs text-ink-muted" aria-hidden>
          days
        </span>
      </div>
      {error ? <p className="mt-1 text-xs text-ed-danger">{error}</p> : hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
