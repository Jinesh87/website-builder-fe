import { describe, it, expect, vi } from "vitest";
import { lazyWithRetry } from "./lazy-with-retry.ts";

describe("lazyWithRetry", () => {
  it("resolves the component when the factory succeeds immediately", async () => {
    const MockComponent = () => null;
    const factory = vi.fn().mockResolvedValue({ default: MockComponent });

    const LazyComp = lazyWithRetry(factory);
    expect(typeof LazyComp.preload).toBe("function");

    const result = await LazyComp.preload();
    expect(result.default).toBe(MockComponent);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("retries on transient failure and resolves when subsequent attempt succeeds", async () => {
    const MockComponent = () => null;
    const factory = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network glitch"))
      .mockResolvedValueOnce({ default: MockComponent });

    const LazyComp = lazyWithRetry(factory, { retries: 2, interval: 10 });
    const result = await LazyComp.preload();

    expect(result.default).toBe(MockComponent);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it("caches the resolved promise so preload is idempotent", async () => {
    const MockComponent = () => null;
    const factory = vi.fn().mockResolvedValue({ default: MockComponent });

    const LazyComp = lazyWithRetry(factory);
    const p1 = LazyComp.preload();
    const p2 = LazyComp.preload();

    expect(p1).toBe(p2);
    await expect(p1).resolves.toEqual({ default: MockComponent });
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
