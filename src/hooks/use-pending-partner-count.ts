import { useEffect, useState } from "react";
import { adminPartnerApi } from "../api/partner.ts";

const POLL_MS = 60_000;
const CHANGED_EVENT = "partners:changed";

/** Tells the sidebar badge to refresh after a partner application is submitted, approved, rejected, or modified. */
export function announcePartnersChanged(): void {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

/** Partner applications still in PENDING status; polls while the tab is visible. */
export function usePendingPartnerCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      adminPartnerApi
        .list({ pageSize: 1 })
        .then((res) => !cancelled && setCount(res.counts?.PENDING ?? 0))
        .catch(() => undefined);
    };

    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    window.addEventListener(CHANGED_EVENT, load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener(CHANGED_EVENT, load);
    };
  }, []);

  return count;
}

