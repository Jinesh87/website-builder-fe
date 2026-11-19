import { describe, expect, it } from "vitest";
import { parseFontSize } from "./font-size.ts";

describe("parseFontSize", () => {
  it("adds px to bare numbers and normalises units", () => {
    expect(parseFontSize("22")).toBe("22px");
    expect(parseFontSize(" 17.5 px ")).toBe("17.5px");
    expect(parseFontSize("1.4REM")).toBe("1.4rem");
    expect(parseFontSize("5vw")).toBe("5vw");
  });
  it("rejects anything that isn't a plain size", () => {
    for (const bad of ["", "0", "-4px", "abc", "12pt", "calc(1px)", "12px; color:red"]) expect(parseFontSize(bad)).toBeNull();
  });
});
