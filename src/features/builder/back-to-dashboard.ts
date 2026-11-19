import type { BackLink, BackLinkState } from "../../hooks/use-back-link.ts";

/**
 * Router state for the website dashboard opened from the editor (e.g. after publishing): when the
 * editor was opened from that dashboard, its original state comes back; otherwise the dashboard
 * points back to wherever the editor was opened from.
 */
export function dashboardState(back: BackLink, websiteId: string): unknown {
  if (back.to.split("?")[0] === `/websites/${websiteId}`) return back.state;
  return { back } satisfies BackLinkState;
}
