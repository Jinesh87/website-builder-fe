import { useEffect, useState } from "react";
import { adminEnquiriesApi } from "../api/admin-enquiries.ts";

const POLL_MS = 60_000;
const CHANGED_EVENT = "enquiries:changed";

/** Tells the sidebar badge to refresh after an enquiry is created, updated or deleted. */
export function announceEnquiriesChanged(): void {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

/** Enquiries still marked New; polls while the tab is visible. */
export function useNewEnquiryCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      adminEnquiriesApi
        .summary()
        .then((summary) => !cancelled && setCount(summary.newCount))
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
