import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { hostingApi, type WebsiteHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import FormAlert from "../ui/FormAlert.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

type WebsiteGracePeriodFormProps = {
  hosting: WebsiteHosting;
  onSaved: (hosting: WebsiteHosting) => void;
};

/** Super Admin: per-website grace after unpaid expiry; blank = platform default. */
export default function WebsiteGracePeriodForm({ hosting, onSaved }: WebsiteGracePeriodFormProps) {
  const override = hosting.subscription?.graceDaysOverride;
  const [value, setValue] = useState(override === null || override === undefined ? "" : String(override));
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setValue(override === null || override === undefined ? "" : String(override));
  }, [hosting.subscription?.id, override]);

  const effective =
    value === ""
      ? hosting.graceDays
      : Number.isInteger(Number(value))
        ? Number(value)
        : hosting.graceDays;
  const unchanged =
    (value === "" && (override === null || override === undefined)) ||
    (value !== "" && Number(value) === override);

  async function save() {
    if (!hosting.subscription) {
      setFeedback({ status: "danger", message: "Set up a hosting plan for this website first." });
      return;
    }
    if (value !== "") {
      const days = Number(value);
      if (!Number.isInteger(days) || days < 0 || days > 60) {
        setFeedback({ status: "danger", message: "Enter 0 to 60 days, or leave blank for the platform default." });
        return;
      }
    }
    setPending(true);
    setFeedback(null);
    try {
      const updated = await hostingApi.updatePlan(hosting.website.id, {
        graceDaysOverride: value === "" ? null : Number(value),
      });
      onSaved(updated);
      setFeedback({
        status: "success",
        message:
          value === ""
            ? `Using the platform default (${hosting.graceDays} ${hosting.graceDays === 1 ? "day" : "days"}).`
            : `Grace period for this website set to ${value} ${value === "1" ? "day" : "days"}.`,
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
        After a paid period ends unpaid, the site stays live for this many days before going offline. Free periods skip grace
        and go offline when they end. Leave blank to use the platform default ({hosting.graceDays}{" "}
        {hosting.graceDays === 1 ? "day" : "days"}).
      </p>
      <div>
        <label htmlFor={`website-grace-days-${hosting.website.id}`} className="mb-1 block text-sm font-medium text-ink">
          Grace period after expiry
        </label>
        <div className="flex h-9 w-36 items-center rounded-lg border border-ed-border bg-surface shadow-ed-xs focus-within:border-ed-accent focus-within:ring-2 focus-within:ring-ed-accent/15">
          <input
            id={`website-grace-days-${hosting.website.id}`}
            inputMode="numeric"
            value={value}
            disabled={pending || !hosting.subscription}
            placeholder={String(hosting.graceDays)}
            onChange={(event) => setValue(event.target.value.replace(/\D/g, "").slice(0, 2))}
            className="w-full min-w-0 bg-transparent px-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none"
          />
          <span className="pr-3 text-xs text-ink-muted" aria-hidden>
            days
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          Applies as {effective} {effective === 1 ? "day" : "days"}
          {value === "" ? " (platform default)" : " for this website"}.
        </p>
      </div>
      {!hosting.subscription && (
        <FormAlert status="warning">Grant a free period or choose a plan first, then set grace here.</FormAlert>
      )}
      {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
      <div>
        <Button
          size="sm"
          variant="outline"
          onPress={() => void save()}
          isPending={pending}
          isDisabled={!hosting.subscription || unchanged}
        >
          Save grace period
        </Button>
      </div>
    </div>
  );
}
