import { describe, expect, it } from "vitest";
import { toEditorCss } from "./imported-code.ts";

describe("toEditorCss", () => {
  const scope = "wbi-abc123";

  it("drops the scope prefix from descendant selectors", () => {
    expect(toEditorCss(".wb-site .wbi-abc123 .card h2{color:red}", scope)).toBe(".card h2{color:red}");
  });

  it("shows the block root as &", () => {
    expect(toEditorCss(".wb-site .wbi-abc123{padding:0}\n.wb-site .wbi-abc123.dark, .wb-site .wbi-abc123 > ul{x:y}", scope)).toBe(
      "&{padding:0}\n&.dark, & > ul{x:y}",
    );
  });

  it("leaves other scopes and container queries alone", () => {
    const css = "@container wb-site (max-width: 600px){.wb-site .wbi-abc1234 .x{a:b}}";
    expect(toEditorCss(css, scope)).toBe(css);
  });
});
