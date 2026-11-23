import { useEffect, useState } from "react";
import { adminHostingApi } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";

export type ReminderSchedule = { before: number[]; after: number[] };

const sorted = (days: number[]) => [...new Set(days)].sort((a, b) => a - b);
const same = (a: number[], b: number[]) => a.length === b.length && a.every((day, index) => day === b[index]);

/** The days before expiry (renewal reminders) and after it (overdue reminders) that reminder emails go out. */
export function useReminderSchedule() {
  const [saved, setSaved] = useState<ReminderSchedule | null>(null);
  const [draft, setDraft] = useState<ReminderSchedule>({ before: [], after: [] });
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminHostingApi
      .settings()
      .then((settings) => {
        if (cancelled) return;
        const schedule = { before: settings.reminderDaysBefore, after: settings.reminderDaysAfter };
        setSaved(schedule);
        setDraft(schedule);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function add(side: keyof ReminderSchedule, day: number) {
    setDraft((current) => ({ ...current, [side]: sorted([...current[side], day]) }));
  }

  function remove(side: keyof ReminderSchedule, day: number) {
    setDraft((current) => ({ ...current, [side]: current[side].filter((value) => value !== day) }));
  }

  const dirty = saved !== null && !(same(saved.before, draft.before) && same(saved.after, draft.after));

  /** Throws if the request fails. */
  async function save(): Promise<void> {
    if (!dirty) return;
    const settings = await adminHostingApi.updateReminders({ daysBefore: draft.before, daysAfter: draft.after });
    const schedule = { before: settings.reminderDaysBefore, after: settings.reminderDaysAfter };
    setSaved(schedule);
    setDraft(schedule);
  }

  return { draft, add, remove, save, dirty, loadError, ready: saved !== null };
}
