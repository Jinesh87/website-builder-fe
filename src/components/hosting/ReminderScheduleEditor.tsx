import { useState } from "react";
import { Button } from "@heroui/react";
import { CalendarClock, Plus, X } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { useReminderSchedule, type ReminderSchedule } from "./useReminderSchedule.ts";

const MAX_DAYS = 90;
const MAX_ENTRIES = 10;

type Side = keyof ReminderSchedule;

/** Card with editable lists of reminder days before and after the hosting expiry date, saved on its own. */
export default function ReminderScheduleEditor() {
  const schedule = useReminderSchedule();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "success" | "danger"; message: string } | null>(null);
  const isDisabled = saving || !schedule.ready;

  async function save() {
    setSaving(true);
    setFeedback(null);
    try {
      await schedule.save();
      setFeedback({ status: "success", message: "Reminder schedule saved." });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  function change(fn: (side: Side, day: number) => void) {
    return (side: Side, day: number) => {
      fn(side, day);
      setFeedback(null);
    };
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5 border-b border-line pb-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <CalendarClock className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">Reminder schedule</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            One email per entry. Before expiry sends the Renewal reminder; after expiry sends the Overdue reminder.
          </p>
        </div>
      </div>

      {schedule.loadError ? (
        <div className="mt-5">
          <FormAlert status="danger">{schedule.loadError}</FormAlert>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-5">
          <DaysList
            side="before"
            label="Days before expiry"
            days={schedule.draft.before}
            onAdd={change(schedule.add)}
            onRemove={change(schedule.remove)}
            isDisabled={isDisabled}
          />
          <DaysList
            side="after"
            label="Days after expiry"
            days={schedule.draft.after}
            onAdd={change(schedule.add)}
            onRemove={change(schedule.remove)}
            isDisabled={isDisabled}
          />

          {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}

          <div>
            <Button onPress={() => void save()} isPending={saving} isDisabled={!schedule.dirty}>
              Save schedule
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function DaysList({
  side,
  label,
  days,
  onAdd,
  onRemove,
  isDisabled,
}: {
  side: Side;
  label: string;
  days: number[];
  onAdd: (side: Side, day: number) => void;
  onRemove: (side: Side, day: number) => void;
  isDisabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const id = `reminder-days-${side}`;

  function add() {
    const day = Number(value);
    if (!/^\d+$/.test(value) || day < 1 || day > MAX_DAYS) return setError(`Enter 1 to ${MAX_DAYS} days`);
    if (days.includes(day)) return setError("Already in the list");
    if (days.length >= MAX_ENTRIES) return setError(`Up to ${MAX_ENTRIES} reminders`);
    onAdd(side, day);
    setValue("");
    setError(null);
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {days.length === 0 && <span className="text-sm text-ink-muted">None</span>}
        {days.map((day) => (
          <span
            key={day}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface-muted px-3 text-sm text-ink"
          >
            {day} {day === 1 ? "day" : "days"}
            <button
              type="button"
              aria-label={`Remove ${day} days ${side} expiry`}
              disabled={isDisabled}
              onClick={() => onRemove(side, day)}
              className="text-ink-muted hover:text-ink disabled:opacity-50"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ))}
        <span className="inline-flex h-9 items-center rounded-lg border border-ed-border bg-surface shadow-ed-xs focus-within:border-ed-accent focus-within:ring-2 focus-within:ring-ed-accent/15">
          <input
            id={id}
            inputMode="numeric"
            placeholder="Add days"
            value={value}
            disabled={isDisabled}
            onChange={(event) => {
              setValue(event.target.value.replace(/\D/g, "").slice(0, 2));
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                add();
              }
            }}
            className="w-20 bg-transparent px-3 text-sm text-ink focus:outline-none"
          />
          <button
            type="button"
            aria-label={`Add reminder ${side} expiry`}
            disabled={isDisabled || !value}
            onClick={add}
            className="grid size-9 place-items-center text-ink-muted hover:text-ink disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </span>
      </div>
      {error && <p className="mt-1 text-xs text-ed-danger">{error}</p>}
    </div>
  );
}
