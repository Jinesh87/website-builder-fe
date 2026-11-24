import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SelectInput from "../../ui/SelectInput.tsx";
import {
  MAX_RANGE_DAYS,
  PERIODS,
  daysBetween,
  isDay,
  periodLabel,
  periodRange,
  shiftPeriod,
  type DayRange,
  type PosPeriod,
} from "./pos-period.ts";

const INPUT = "h-9 rounded-md border border-line-strong bg-surface px-2 text-sm text-ink";

/** Picks the POS report period: a day, week, month, year or custom range, with previous/next steps. */
export default function PosPeriodBar({
  period,
  range,
  today,
  onChange,
}: {
  period: PosPeriod;
  range: DayRange;
  today: string;
  onChange: (period: PosPeriod, range: DayRange) => void;
}) {
  const [draft, setDraft] = useState(range);
  useEffect(() => setDraft({ from: range.from, to: range.to }), [range.from, range.to]);

  const atLatest = range.to >= today;
  const thisPeriod = period === "range" ? null : periodRange(period, today);
  const isCurrent = thisPeriod?.from === range.from;
  const step = PERIODS.find((item) => item.value === period)!.label.toLowerCase();

  function choosePeriod(next: PosPeriod) {
    if (next === "range") onChange(next, { from: range.from, to: range.to > today ? today : range.to });
    // Keep looking at the same stretch of time, starting from the latest day that has passed.
    else onChange(next, periodRange(next, range.to > today ? today : range.to));
  }

  const draftError =
    isDay(draft.from) && isDay(draft.to)
      ? draft.from > draft.to
        ? "The start date must be on or before the end date."
        : daysBetween(draft.from, draft.to) > MAX_RANGE_DAYS
          ? `Pick a range of up to ${MAX_RANGE_DAYS} days.`
          : null
      : null;

  function editDraft(next: DayRange) {
    setDraft(next);
    if (isDay(next.from) && isDay(next.to) && next.from <= next.to && daysBetween(next.from, next.to) <= MAX_RANGE_DAYS) {
      onChange("range", next);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <SelectInput
          ariaLabel="Report period"
          className="w-36"
          value={period}
          onChange={choosePeriod}
          options={PERIODS.map((item) => ({
            value: item.value,
            label: item.label,
          }))}
        />
        <Button
          size="sm"
          variant="outline"
          isIconOnly
          aria-label={`Previous ${step}`}
          onPress={() => onChange(period, shiftPeriod(period, range, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        {period === "range" ? (
          <>
            <input
              type="date"
              aria-label="From"
              value={draft.from}
              max={today}
              onChange={(event) => editDraft({ ...draft, from: event.target.value })}
              className={INPUT}
            />
            <span className="text-sm text-ink-muted">to</span>
            <input
              type="date"
              aria-label="To"
              value={draft.to}
              max={today}
              onChange={(event) => editDraft({ ...draft, to: event.target.value })}
              className={INPUT}
            />
          </>
        ) : period === "day" ? (
          <input
            type="date"
            aria-label="Day"
            value={range.from}
            max={today}
            onChange={(event) => isDay(event.target.value) && onChange("day", periodRange("day", event.target.value))}
            className={INPUT}
          />
        ) : null}
        <Button
          size="sm"
          variant="outline"
          isIconOnly
          aria-label={`Next ${step}`}
          isDisabled={atLatest}
          onPress={() => onChange(period, shiftPeriod(period, range, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
        {thisPeriod && !isCurrent && (
          <Button size="sm" variant="ghost" onPress={() => onChange(period, thisPeriod)}>
            {period === "day" ? "Today" : `This ${step}`}
          </Button>
        )}
        <span className="ml-2 text-sm font-medium text-ink">{periodLabel(period, range, today)}</span>
      </div>
      {draftError && period === "range" && <p className="mt-2 text-xs text-red-600">{draftError}</p>}
    </div>
  );
}
