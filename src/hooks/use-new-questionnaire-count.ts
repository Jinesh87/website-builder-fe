import { useEffect, useState } from "react";
import { adminQuestionnairesApi } from "../features/questionnaire/api.ts";

const POLL_MS = 60_000;
const CHANGED_EVENT = "questionnaires:changed";

/** Tells the sidebar badge to refresh after a questionnaire is created, updated or deleted. */
export function announceQuestionnairesChanged(): void {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

/** Questionnaires still marked New; polls while the tab is visible. */
export function useNewQuestionnaireCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      adminQuestionnairesApi
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

