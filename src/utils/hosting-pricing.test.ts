import { describe, expect, it } from "vitest";
import type { HostingPackage, HostingSubscription } from "../api/hosting.ts";
import { bestYearlySaving, connectsForPaise, defaultPlan, paiseToRupeesInput, rupeesInputToPaise, yearlySavingPercent } from "./hosting-pricing.ts";

function pkg(id: string, prices: HostingPackage["prices"], extra: Partial<HostingPackage> = {}): HostingPackage {
  return {
    id,
    slug: id,
    name: id,
    description: "",
    features: [],
    featured: false,
    isCustom: false,
    prices,
    startingFrom: { QUARTERLY: null, YEARLY: null },
    ...extra,
  };
}

describe("yearlySavingPercent", () => {
  it("compares a year with four quarters", () => {
    expect(yearlySavingPercent({ QUARTERLY: 210_000, YEARLY: 700_000 })).toBe(17);
    expect(yearlySavingPercent({ QUARTERLY: 210_000, YEARLY: 900_000 })).toBe(0);
    expect(yearlySavingPercent({ QUARTERLY: null, YEARLY: 700_000 })).toBe(0);
  });
});

describe("bestYearlySaving", () => {
  it("ignores a website's custom deal", () => {
    const basic = pkg("basic", { QUARTERLY: 210_000, YEARLY: 700_000 });
    const standard = pkg("standard", { QUARTERLY: 270_000, YEARLY: 900_000 });
    const custom = pkg("custom", { QUARTERLY: 3_333, YEARLY: 6_667 }, { isCustom: true });
    expect(bestYearlySaving([basic, standard, custom])).toBe(17);
  });
});

describe("connectsForPaise", () => {
  it("matches the server's rounding", () => {
    expect(connectsForPaise(210_000, 3)).toBe(6_300);
    expect(connectsForPaise(1_667, 3)).toBe(50);
    expect(connectsForPaise(0, 3)).toBe(0);
  });
});

describe("rupee inputs", () => {
  it("round-trips paise", () => {
    expect(paiseToRupeesInput(210_000)).toBe("2100");
    expect(paiseToRupeesInput(3_333)).toBe("33.33");
    expect(paiseToRupeesInput(null)).toBe("");
    expect(rupeesInputToPaise("2100")).toBe(210_000);
    expect(rupeesInputToPaise("2,100.5")).toBe(210_050);
    expect(rupeesInputToPaise("33.33")).toBe(3_333);
    expect(rupeesInputToPaise(" ")).toBeNull();
  });

  it("rejects malformed amounts", () => {
    expect(rupeesInputToPaise("12.345")).toBeNaN();
    expect(rupeesInputToPaise("-5")).toBeNaN();
    expect(rupeesInputToPaise("abc")).toBeNaN();
  });
});

describe("defaultPlan", () => {
  const basic = pkg("basic", { QUARTERLY: 210_000, YEARLY: 700_000 });
  const standard = pkg("standard", { QUARTERLY: 300_000, YEARLY: null }, { featured: true });
  const custom = pkg("custom", { QUARTERLY: null, YEARLY: null }, { isCustom: true });

  it("keeps the website's own payable plan", () => {
    const subscription = { packageId: "basic", cycle: "QUARTERLY" } as HostingSubscription;
    expect(defaultPlan({ packages: [basic, standard, custom], subscription })).toEqual({ packageId: "basic", cycle: "QUARTERLY" });
  });

  it("falls back to the featured package, on a cycle it can be paid for", () => {
    expect(defaultPlan({ packages: [basic, standard, custom], subscription: null })).toEqual({
      packageId: "standard",
      cycle: "QUARTERLY",
    });
  });

  it("returns null when nothing can be paid", () => {
    expect(defaultPlan({ packages: [custom], subscription: null })).toBeNull();
  });
});
