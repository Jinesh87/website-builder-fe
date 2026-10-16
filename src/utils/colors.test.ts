import { describe, expect, it } from "vitest";
import { isLightColor, normalizeHexColor } from "./colors.ts";

describe("normalizeHexColor", () => {
  it("fixes the user's 7-character typo '#00F172A' to '#0F172A'", () => {
    expect(normalizeHexColor("#00F172A")).toBe("#0F172A");
    expect(normalizeHexColor("#00f172a")).toBe("#0F172A");
    expect(normalizeHexColor("00f172a")).toBe("#0F172A");
  });

  it("handles standard 6-digit hex codes", () => {
    expect(normalizeHexColor("#0F172A")).toBe("#0F172A");
    expect(normalizeHexColor("#ffffff")).toBe("#FFFFFF");
    expect(normalizeHexColor("6366f1")).toBe("#6366F1");
  });

  it("handles double or multiple hashes", () => {
    expect(normalizeHexColor("##0F172A")).toBe("#0F172A");
    expect(normalizeHexColor("###FFFFFF")).toBe("#FFFFFF");
  });

  it("expands 3-digit hex shorthand", () => {
    expect(normalizeHexColor("#fff")).toBe("#FFFFFF");
    expect(normalizeHexColor("000")).toBe("#000000");
    expect(normalizeHexColor("#123")).toBe("#112233");
  });

  it("trims 7 or 8 character hex gracefully", () => {
    expect(normalizeHexColor("#FFFFFF99")).toBe("#FFFFFF");
    expect(normalizeHexColor("#1234567")).toBe("#123456");
  });

  it("returns undefined for empty or invalid inputs", () => {
    expect(normalizeHexColor("")).toBeUndefined();
    expect(normalizeHexColor(null)).toBeUndefined();
    expect(normalizeHexColor("not-a-color")).toBeUndefined();
  });
});

describe("isLightColor", () => {
  it("correctly identifies light and dark colors", () => {
    expect(isLightColor("#FFFFFF")).toBe(true);
    expect(isLightColor("#F8FAFC")).toBe(true);
    expect(isLightColor("#0F172A")).toBe(false);
    expect(isLightColor("#000000")).toBe(false);
    expect(isLightColor("#00F172A")).toBe(false); // correctly normalized to #0F172A (dark)
  });
});
