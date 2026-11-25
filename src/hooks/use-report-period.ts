import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { todayIst } from "../components/shop/pos/PosSummaryCards.tsx";
import { periodFromParams, type DayRange, type PosPeriod } from "../components/shop/pos/pos-period.ts";

/**
 * The report period (and website) kept in the page's URL, for the sales report pages:
 * `?website=&period=&date=` or `?period=range&from=&to=`. Today (IST) is the default day.
 */
export function useReportPeriod({ onChange }: { onChange?: () => void } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = todayIst();
  const { period, range } = useMemo(() => periodFromParams(searchParams, today), [searchParams, today]);

  function setParams(next: { website?: string; period?: PosPeriod; range?: DayRange }) {
    const params = new URLSearchParams(searchParams);
    if (next.website) params.set("website", next.website);
    if (next.period && next.range) {
      for (const key of ["period", "date", "from", "to"]) params.delete(key);
      if (next.period !== "day") params.set("period", next.period);
      if (next.period === "range") {
        params.set("from", next.range.from);
        params.set("to", next.range.to);
      } else if (next.range.from !== today) {
        params.set("date", next.range.from);
      }
    }
    setSearchParams(params, { replace: true });
    onChange?.();
  }

  return { today, period, range, setParams };
}
