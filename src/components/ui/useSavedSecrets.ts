import { useState } from "react";

/**
 * "Show secret" for settings forms whose saved secrets are never sent with the page. The eye shows what's typed,
 * or fetches the saved secret the first time when the box is empty; hiding puts an untouched saved secret away.
 */
export function useSavedSecrets<F extends string>(fetchSecrets: () => Promise<Record<F, string | null>>) {
  const [shown, setShown] = useState<Partial<Record<F, boolean>>>({});
  const [saved, setSaved] = useState<Record<F, string | null> | null>(null);
  const [revealing, setRevealing] = useState(false);

  /** Throws when the saved secrets can't be fetched, so the caller can show the error. */
  async function toggle(field: F, value: string, setValue: (value: string) => void): Promise<void> {
    if (shown[field]) {
      setShown((current) => ({ ...current, [field]: false }));
      if (saved && value === saved[field]) setValue("");
      return;
    }
    if (!value) {
      let secrets = saved;
      if (!secrets) {
        setRevealing(true);
        try {
          secrets = await fetchSecrets();
          setSaved(secrets);
        } finally {
          setRevealing(false);
        }
      }
      const savedValue = secrets[field];
      if (savedValue) setValue(savedValue);
    }
    setShown((current) => ({ ...current, [field]: true }));
  }

  /** A revealed saved secret that wasn't edited is left out, so saving doesn't re-send it. */
  function changed(field: F, value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed && trimmed !== saved?.[field] ? trimmed : undefined;
  }

  /** After saving or reloading: hide everything and forget the fetched secrets. */
  function reset() {
    setShown({});
    setSaved(null);
  }

  return { isShown: (field: F) => Boolean(shown[field]), revealing, toggle, changed, reset };
}
