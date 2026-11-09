import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import {
  hostingApi,
  type BillingCycle,
  type HostingPackage,
  type PlanChoice,
  type WebsiteHosting,
} from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput from "../ui/SelectInput.tsx";
import { CYCLE_LABELS, formatBillingDate } from "./hosting-labels.tsx";
import { defaultPlan } from "../../utils/hosting-pricing.ts";

type Feedback = { status: "success" | "danger"; message: string } | null;

const DAY_MS = 24 * 60 * 60 * 1000;
const CYCLE_OPTIONS = (["QUARTERLY", "YEARLY"] as const).map((value) => ({ value, label: CYCLE_LABELS[value] }));

function packageOptions(packages: HostingPackage[]) {
  // Website hosting already returns offerable packages (no `active` flag on this type).
  return packages
    .filter((pkg) => pkg.isCustom || pkg.prices.QUARTERLY || pkg.prices.YEARLY)
    .map((pkg) => ({ value: pkg.id, label: pkg.name }));
}

/** Length of the current complimentary grant, or the default starter value. */
function freeDaysFromHosting(hosting: WebsiteHosting): string {
  const sub = hosting.subscription;
  if (!sub?.isComplimentary || !sub.currentPeriodStart || !sub.currentPeriodEnd) return "30";
  const days = Math.round(
    (new Date(sub.currentPeriodEnd).getTime() - new Date(sub.currentPeriodStart).getTime()) / DAY_MS,
  );
  if (!Number.isFinite(days) || days < 1) return "30";
  return String(Math.min(366, days));
}

type GrantFreePeriodFormProps = {
  hosting: WebsiteHosting;
  onGranted: (hosting: WebsiteHosting) => void;
  onCancel?: () => void;
};

/** Super Admin: give one website N complimentary days and pick the plan it renews on. */
export default function GrantFreePeriodForm({ hosting, onGranted, onCancel }: GrantFreePeriodFormProps) {
  const listed = useMemo(() => packageOptions(hosting.packages), [hosting.packages]);
  const initial = defaultPlan(hosting);
  const [freeDays, setFreeDays] = useState(() => freeDaysFromHosting(hosting));
  const [packageId, setPackageId] = useState(initial?.packageId ?? listed[0]?.value ?? "");
  const [cycle, setCycle] = useState<BillingCycle>(initial?.cycle ?? "YEARLY");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setFreeDays(freeDaysFromHosting(hosting));
    const next = defaultPlan(hosting);
    setPackageId(next?.packageId ?? listed[0]?.value ?? "");
    setCycle(next?.cycle ?? "YEARLY");
  }, [
    hosting.subscription?.id,
    hosting.subscription?.isComplimentary,
    hosting.subscription?.currentPeriodStart,
    hosting.subscription?.currentPeriodEnd,
    hosting.subscription?.packageId,
    hosting.subscription?.cycle,
    listed,
  ]);

  async function submit() {
    const days = Number(freeDays);
    if (!Number.isInteger(days) || days < 1 || days > 366) {
      setFeedback({ status: "danger", message: "Enter 1 to 366 free days." });
      return;
    }
    if (!packageId) {
      setFeedback({ status: "danger", message: "Choose the plan this website renews on." });
      return;
    }
    const plan: PlanChoice = { packageId, cycle };
    setPending(true);
    setFeedback(null);
    try {
      const updated = await hostingApi.grantFreePeriod(hosting.website.id, { ...plan, freeDays: days });
      onGranted(updated);
      setFreeDays(freeDaysFromHosting(updated));
      const end = updated.subscription?.currentPeriodEnd;
      setFeedback({
        status: "success",
        message: end
          ? `Free period active until ${formatBillingDate(end)}. After that it renews on the chosen plan.`
          : "Free period granted.",
      });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-ink-muted">
        Activates complimentary hosting from today. When free days end unpaid, the site goes offline with no grace — the client
        must renew on the plan below (they can switch plans before then).
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`grant-free-days-${hosting.website.id}`} className="mb-1 block text-sm font-medium text-ink">
            Free days
          </label>
          <div className="flex h-9 w-full items-center rounded-lg border border-ed-border bg-surface shadow-ed-xs focus-within:border-ed-accent focus-within:ring-2 focus-within:ring-ed-accent/15">
            <input
              id={`grant-free-days-${hosting.website.id}`}
              inputMode="numeric"
              value={freeDays}
              disabled={pending}
              onChange={(event) => setFreeDays(event.target.value.replace(/\D/g, "").slice(0, 3))}
              className="w-full min-w-0 bg-transparent px-3 text-sm text-ink focus:outline-none"
            />
            <span className="pr-3 text-xs text-ink-muted" aria-hidden>
              days
            </span>
          </div>
        </div>
        <SelectInput label="Billed" value={cycle} onChange={setCycle} options={CYCLE_OPTIONS} />
      </div>
      <SelectInput label="Then renews on" value={packageId} onChange={setPackageId} options={listed} />
      {listed.length === 0 && (
        <FormAlert status="warning">Price a hosting package in Settings → Hosting first.</FormAlert>
      )}
      {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" onPress={() => void submit()} isPending={pending} isDisabled={!packageId}>
          Grant free period
        </Button>
        {onCancel && (
          <Button size="sm" variant="ghost" onPress={onCancel} isDisabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
