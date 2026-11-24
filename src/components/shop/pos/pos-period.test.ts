import { describe, expect, it } from "vitest";
import { daysBetween, periodFromParams, periodLabel, periodRange, shiftPeriod } from "./pos-period.ts";

describe("periodRange", () => {
  it("covers the day, Monday-to-Sunday week, calendar month and year", () => {
    expect(periodRange("day", "2026-11-24")).toEqual({ from: "2026-11-24", to: "2026-11-24" });
    expect(periodRange("week", "2026-11-24")).toEqual({ from: "2026-11-23", to: "2026-11-29" });
    expect(periodRange("week", "2026-11-29")).toEqual({ from: "2026-11-23", to: "2026-11-29" });
    expect(periodRange("month", "2026-02-10")).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(periodRange("month", "2028-02-10")).toEqual({ from: "2028-02-01", to: "2028-02-29" });
    expect(periodRange("year", "2026-11-24")).toEqual({ from: "2026-01-01", to: "2026-12-31" });
  });
});

describe("shiftPeriod", () => {
  it("steps whole periods, and custom ranges by their length", () => {
    expect(shiftPeriod("week", periodRange("week", "2026-11-24"), -1)).toEqual({ from: "2026-11-16", to: "2026-11-22" });
    expect(shiftPeriod("month", periodRange("month", "2026-01-31"), -1)).toEqual({ from: "2025-12-01", to: "2025-12-31" });
    expect(shiftPeriod("month", periodRange("month", "2026-01-31"), 1)).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(shiftPeriod("year", periodRange("year", "2026-05-01"), 1)).toEqual({ from: "2027-01-01", to: "2027-12-31" });
    expect(shiftPeriod("range", { from: "2026-11-01", to: "2026-11-10" }, 1)).toEqual({ from: "2026-11-11", to: "2026-11-20" });
    expect(daysBetween("2026-11-01", "2026-11-10")).toBe(10);
  });
});

describe("periodLabel", () => {
  const today = "2026-11-24";
  it("names the period plainly", () => {
    expect(periodLabel("day", periodRange("day", today), today)).toBe("Today");
    expect(periodLabel("week", periodRange("week", today), today)).toBe("This week · 23 Nov – 29 Nov 2026");
    expect(periodLabel("month", periodRange("month", today), today)).toBe("November 2026");
    expect(periodLabel("year", periodRange("year", today), today)).toBe("2026");
    expect(periodLabel("range", { from: "2025-12-20", to: "2026-01-05" }, today)).toBe("20 Dec 2025 – 5 Jan 2026");
  });
});

describe("periodFromParams", () => {
  it("falls back to today and rejects bad ranges", () => {
    const today = "2026-11-24";
    expect(periodFromParams(new URLSearchParams(""), today)).toEqual({ period: "day", range: { from: today, to: today } });
    expect(periodFromParams(new URLSearchParams("period=month&date=2026-10-05"), today).range).toEqual({
      from: "2026-10-01",
      to: "2026-10-31",
    });
    expect(periodFromParams(new URLSearchParams("period=range&from=2026-11-10&to=2026-11-01"), today).range).toEqual({
      from: "2026-11-01",
      to: "2026-11-30",
    });
  });
});
