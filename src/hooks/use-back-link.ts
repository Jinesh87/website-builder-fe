import { useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * Where a page's "← back" link goes, handed over in router state by the page that linked to it.
 * `state` is that page's own router state, so going back restores its back link too.
 */
export type BackLink = { to: string; label: string; state?: unknown };
export type BackLinkState = { back: BackLink };

function readBackLink(state: unknown): BackLink | null {
  const back = (state as Partial<BackLinkState> | null)?.back;
  return back && typeof back.to === "string" && back.to.startsWith("/") && typeof back.label === "string" ? back : null;
}

/** Router state for links leaving the current page, so the target's back link returns here (with its query). */
export function useBackLinkState(label: string): BackLinkState {
  const { pathname, search, state } = useLocation();
  return useMemo(() => ({ back: { to: `${pathname}${search}`, label, state } }), [pathname, search, label, state]);
}

/** The back link the previous page handed over, if any. */
export function useHandedBackLink(): BackLink | null {
  return readBackLink(useLocation().state);
}

/** The back link the previous page handed over, or `fallback` when the page was opened directly. */
export function useBackLink(fallback: BackLink): BackLink {
  return useHandedBackLink() ?? fallback;
}
