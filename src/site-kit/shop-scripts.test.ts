import { describe, expect, it } from "vitest";
import * as shopAuth from "./shop-auth.ts";

// The runtime scripts are JS inside template strings; an escaping slip only shows up as a syntax error in the browser.
const scripts: [string, string][] = Object.entries(shopAuth as Record<string, unknown>).flatMap(([name, value]) =>
  name.endsWith("_SCRIPT") && typeof value === "string" ? [[name, value] as [string, string]] : [],
);

describe("shop runtime scripts", () => {
  it.each(scripts)("%s is valid JavaScript", (_name, source) => {
    expect(() => new Function(source)).not.toThrow();
  });
});
