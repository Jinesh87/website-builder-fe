import { useState } from "react";

const STORAGE_KEY = "wb.sidebar.collapsed";

function readCollapsed(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/** Sidebar sections the user folded away, remembered in this browser. */
export function useCollapsedNav() {
  const [collapsed, setCollapsed] = useState<string[]>(readCollapsed);

  function toggle(label: string) {
    setCollapsed((current) => {
      const next = current.includes(label) ? current.filter((item) => item !== label) : [...current, label];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage blocked: the choice just lasts until reload.
      }
      return next;
    });
  }

  return { isCollapsed: (label: string) => collapsed.includes(label), toggle };
}
