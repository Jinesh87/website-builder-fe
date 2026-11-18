import { useEffect, useState } from "react";
import { shopApi } from "../../api/shop.ts";

/** Fired after the store refunds a return, so the Returns tab badge updates straight away. */
export const RETURNS_CHANGED_EVENT = "shop:returns-changed";

export function notifyReturnsChanged(): void {
  window.dispatchEvent(new Event(RETURNS_CHANGED_EVENT));
}

/** Returns waiting for the store's refund; reloads when `refreshKey` changes or a refund is made. */
export function useAwaitingReturnsCount(websiteId: string, enabled: boolean, refreshKey: unknown): number {
  const [count, setCount] = useState(0);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const onChange = () => setBump((value) => value + 1);
    window.addEventListener(RETURNS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(RETURNS_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }
    let cancelled = false;
    shopApi
      .returnsSummary(websiteId)
      .then((counts) => {
        if (!cancelled) setCount(counts.awaiting);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, enabled, refreshKey, bump]);

  return count;
}
