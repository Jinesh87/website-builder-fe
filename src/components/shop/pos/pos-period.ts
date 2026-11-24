/** Report periods for POS sales: calendar arithmetic on IST YYYY-MM-DD days (no time zone involved). */

export type PosPeriod = "day" | "week" | "month" | "year" | "range";

export type DayRange = { from: string; to: string };

export const PERIODS: { value: PosPeriod; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "range", label: "Date range" },
];

/** Longest range the server reports on, in days. */
export const MAX_RANGE_DAYS = 366;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDay(value: string | null | undefined): value is string {
  return !!value && DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function utc(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** YYYY-MM-DD shifted by whole days. */
export function shiftDay(date: string, days: number): string {
  const next = utc(date);
  next.setUTCDate(next.getUTCDate() + days);
  return iso(next);
}

/** Days from `from` to `to`, counting both. */
export function daysBetween(from: string, to: string): number {
  return Math.round((utc(to).getTime() - utc(from).getTime()) / 86_400_000) + 1;
}

/** The days a period covers around `anchor`. Weeks start on Monday. */
export function periodRange(period: Exclude<PosPeriod, "range">, anchor: string): DayRange {
  const [year, month] = anchor.split("-");
  switch (period) {
    case "day":
      return { from: anchor, to: anchor };
    case "week": {
      const weekday = (utc(anchor).getUTCDay() + 6) % 7; // Monday = 0
      const from = shiftDay(anchor, -weekday);
      return { from, to: shiftDay(from, 6) };
    }
    case "month": {
      const last = new Date(Date.UTC(Number(year), Number(month), 0));
      return { from: `${year}-${month}-01`, to: iso(last) };
    }
    case "year":
      return { from: `${year}-01-01`, to: `${year}-12-31` };
  }
}

/** The same period one step earlier (-1) or later (+1); a custom range moves by its own length. */
export function shiftPeriod(period: PosPeriod, range: DayRange, step: -1 | 1): DayRange {
  switch (period) {
    case "day":
      return periodRange("day", shiftDay(range.from, step));
    case "week":
      return periodRange("week", shiftDay(range.from, 7 * step));
    case "month": {
      const date = utc(range.from);
      date.setUTCMonth(date.getUTCMonth() + step);
      return periodRange("month", iso(date));
    }
    case "year":
      return periodRange("year", `${Number(range.from.slice(0, 4)) + step}-01-01`);
    case "range": {
      const length = daysBetween(range.from, range.to);
      return { from: shiftDay(range.from, length * step), to: shiftDay(range.to, length * step) };
    }
  }
}

function format(date: string, options: Intl.DateTimeFormatOptions): string {
  return utc(date).toLocaleDateString("en-IN", { ...options, timeZone: "UTC" });
}

/** "Today", "This week · 23 – 29 Nov 2026", "November 2026", "2026", "1 Nov – 24 Nov 2026". */
export function periodLabel(period: PosPeriod, range: DayRange, today: string): string {
  const span = () => {
    const sameYear = range.from.slice(0, 4) === range.to.slice(0, 4);
    const start = format(range.from, sameYear ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" });
    return `${start} – ${format(range.to, { day: "numeric", month: "short", year: "numeric" })}`;
  };
  switch (period) {
    case "day":
      if (range.from === today) return "Today";
      if (range.from === shiftDay(today, -1)) return "Yesterday";
      return format(range.from, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    case "week": {
      const current = periodRange("week", today).from;
      const prefix = range.from === current ? "This week · " : range.from === shiftDay(current, -7) ? "Last week · " : "";
      return `${prefix}${span()}`;
    }
    case "month":
      return format(range.from, { month: "long", year: "numeric" });
    case "year":
      return range.from.slice(0, 4);
    case "range":
      return range.from === range.to ? format(range.from, { day: "numeric", month: "short", year: "numeric" }) : span();
  }
}

/** Reads the period from the page's URL, falling back to today. */
export function periodFromParams(params: URLSearchParams, today: string): { period: PosPeriod; range: DayRange } {
  const raw = params.get("period");
  const period: PosPeriod = PERIODS.some((item) => item.value === raw) ? (raw as PosPeriod) : "day";
  if (period === "range") {
    const from = params.get("from");
    const to = params.get("to");
    if (isDay(from) && isDay(to) && from <= to && daysBetween(from, to) <= MAX_RANGE_DAYS) return { period, range: { from, to } };
    return { period, range: periodRange("month", today) };
  }
  const date = params.get("date");
  return { period, range: periodRange(period, isDay(date) ? date : today) };
}
