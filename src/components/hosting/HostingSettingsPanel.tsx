import { useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Label, Spinner, Switch } from "@heroui/react";
import { CalendarClock, History, Server } from "lucide-react";
import { adminHostingApi, type BillingCycle, type HostingPriceChange, type HostingSettings } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { connectsPriceInPaise, formatPaise } from "../../api/wallet.ts";
import { ConfirmModal } from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput from "../ui/SelectInput.tsx";
import { ConnectsInput, CYCLE_LABELS, formatBillingDate } from "./hosting-labels.tsx";

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;
type Form = { enabled: boolean; quarterlyPrice: string; yearlyPrice: string; reminderDays: string; graceDays: string };
type FormErrors = Partial<Record<keyof Form, string>>;

const SCOPE_LABELS: Record<HostingPriceChange["scope"], string> = { GLOBAL: "Global", CLIENT: "Client", WEBSITE: "Website" };
const CYCLE_OPTIONS = (["QUARTERLY", "YEARLY"] as const).map((value) => ({ value, label: CYCLE_LABELS[value] }));

function toForm(settings: HostingSettings): Form {
  return {
    enabled: settings.enabled,
    quarterlyPrice: String(settings.quarterlyPrice || ""),
    yearlyPrice: String(settings.yearlyPrice || ""),
    reminderDays: String(settings.reminderDays),
    graceDays: String(settings.graceDays),
  };
}

function validate(form: Form): FormErrors {
  const days = (value: string) => (/^\d{1,2}$/.test(value) && Number(value) <= 60 ? undefined : "Enter 0 to 60 days");
  const price = (value: string) =>
    form.enabled && !(Number(value) > 0) ? "Required to turn billing on" : undefined;
  return {
    quarterlyPrice: price(form.quarterlyPrice),
    yearlyPrice: price(form.yearlyPrice),
    reminderDays: days(form.reminderDays),
    graceDays: days(form.graceDays),
  };
}

function priceChange(before: number | null, after: number | null): string {
  const show = (value: number | null) => (value === null ? "default" : value.toLocaleString("en-IN"));
  return before === after ? show(after) : `${show(before)} → ${show(after)}`;
}

/** Global hosting prices and billing rules; client and website prices are set on their own pages. */
export default function HostingSettingsPanel({ onLoaded }: { onLoaded?: (settings: HostingSettings) => void }) {
  const [settings, setSettings] = useState<HostingSettings | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [freeDays, setFreeDays] = useState("30");
  const [backfillCycle, setBackfillCycle] = useState<BillingCycle>("QUARTERLY");
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

  function update<K extends keyof Form>(key: K) {
    return (value: Form[K]) => {
      setForm((current) => current && { ...current, [key]: value });
      setErrors((current) => ({ ...current, [key]: undefined }));
      setFeedback(null);
    };
  }

  const pricesChanged =
    settings !== null &&
    form !== null &&
    (Number(form.quarterlyPrice || 0) !== settings.quarterlyPrice || Number(form.yearlyPrice || 0) !== settings.yearlyPrice);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.values(nextErrors).some(Boolean)) return;
    if (pricesChanged && settings && settings.plansOnGlobalPrice > 0) {
      setConfirming(true);
      return;
    }
    void save();
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      apply(
        await adminHostingApi.updateSettings({
          enabled: form.enabled,
          quarterlyPrice: Number(form.quarterlyPrice || 0),
          yearlyPrice: Number(form.yearlyPrice || 0),
          reminderDays: Number(form.reminderDays),
          graceDays: Number(form.graceDays),
        }),
      );
      setFeedback({ status: "success", message: "Hosting settings saved. New prices apply from each plan's next payment." });
      setConfirming(false);
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
      setConfirming(false);
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
      const { created } = await adminHostingApi.backfill({ freeDays: days, cycle: backfillCycle });
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

  const rupees = (value: string) =>
    Number(value) > 0 ? `= ${formatPaise(connectsPriceInPaise(Number(value), settings.connectsPerRupee))}` : undefined;

  return (
    <div className="grid max-w-3xl gap-6">
      <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-line bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Server className="size-5" aria-hidden />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-ink">Hosting plans</h2>
            <p className="text-xs text-ink-muted">
              Paid from the client's connects, per website. Client and website prices override these on their own pages.
            </p>
          </div>
          {settings.enabled ? <Chip color="success">Billing on</Chip> : <Chip>Billing off</Chip>}
        </div>

        <div className="mt-6 flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <ConnectsInput
              id="hosting-quarterly"
              label="Quarterly price (3 months)"
              value={form.quarterlyPrice}
              onChange={update("quarterlyPrice")}
              hint={rupees(form.quarterlyPrice)}
              error={errors.quarterlyPrice}
              isDisabled={saving}
            />
            <ConnectsInput
              id="hosting-yearly"
              label="Yearly price (12 months)"
              value={form.yearlyPrice}
              onChange={update("yearlyPrice")}
              hint={rupees(form.yearlyPrice)}
              error={errors.yearlyPrice}
              isDisabled={saving}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DaysInput
              id="hosting-reminder"
              label="Reminder before expiry"
              value={form.reminderDays}
              onChange={update("reminderDays")}
              hint="Email and notification to the client and admins. 0 = no reminder."
              error={errors.reminderDays}
              isDisabled={saving}
            />
            <DaysInput
              id="hosting-grace"
              label="Grace period after expiry"
              value={form.graceDays}
              onChange={update("graceDays")}
              hint="The site stays live this long unpaid, then goes offline (draft kept)."
              error={errors.graceDays}
              isDisabled={saving}
            />
          </div>

          <Switch isSelected={form.enabled} onChange={update("enabled")} isDisabled={saving}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label className="text-sm text-ink">Require a paid hosting plan to publish</Label>
            </Switch.Content>
          </Switch>
          <p className="-mt-3 text-xs text-ink-muted">
            When on, publishing needs a plan, plans renew from connects, and unpaid sites go offline after the grace period.
          </p>

          {form.enabled && !settings.enabled && settings.liveSitesWithoutPlan > 0 && (
            <FormAlert status="warning">
              {settings.liveSitesWithoutPlan} live {settings.liveSitesWithoutPlan === 1 ? "website has" : "websites have"} no
              plan yet. They stay online but can't be republished until they get one. Give them a free period below first.
            </FormAlert>
          )}

          {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}

          <div>
            <Button type="submit" isPending={saving}>
              Save hosting settings
            </Button>
          </div>
        </div>
      </form>

      <section className="rounded-xl border border-line bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <CalendarClock className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Existing live websites</h2>
            <p className="text-xs text-ink-muted">
              {settings.liveSitesWithoutPlan === 0
                ? "Every published website has a hosting plan."
                : `${settings.liveSitesWithoutPlan} published ${settings.liveSitesWithoutPlan === 1 ? "website has" : "websites have"} no hosting plan.`}
            </p>
          </div>
        </div>
        {settings.liveSitesWithoutPlan > 0 && (
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div>
              <DaysInput id="hosting-free-days" label="Free days" value={freeDays} onChange={setFreeDays} isDisabled={backfilling} />
            </div>
            <SelectInput label="Then renews" value={backfillCycle} onChange={setBackfillCycle} options={CYCLE_OPTIONS} className="w-40" />
            <Button variant="outline" onPress={handleBackfill} isPending={backfilling}>
              Give free plan to {settings.liveSitesWithoutPlan}
            </Button>
          </div>
        )}
        {backfillFeedback && (
          <div className="mt-4">
            <FormAlert status={backfillFeedback.status}>{backfillFeedback.message}</FormAlert>
          </div>
        )}
      </section>

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
                    <td className="px-6 py-2.5 text-ink-body">{priceChange(change.oldQuarterlyPrice, change.newQuarterlyPrice)}</td>
                    <td className="px-6 py-2.5 text-ink-body">{priceChange(change.oldYearlyPrice, change.newYearlyPrice)}</td>
                    <td className="px-6 py-2.5 text-ink-body">{change.changedBy ?? "—"}</td>
                    <td className="whitespace-nowrap px-6 py-2.5 text-xs text-ink-muted">{formatBillingDate(change.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={confirming}
        onClose={() => !saving && setConfirming(false)}
        onConfirm={save}
        isPending={saving}
        tone="warning"
        title="Change the global price?"
        confirmLabel="Change price"
      >
        {settings.plansOnGlobalPrice} {settings.plansOnGlobalPrice === 1 ? "plan uses" : "plans use"} the global price. The new
        price applies from each one's next payment; periods already paid don't change.
      </ConfirmModal>
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
