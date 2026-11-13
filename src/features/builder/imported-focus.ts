/**
 * "Click a text/button/image on the canvas → jump to its field in the inspector" for imported
 * HTML blocks. The canvas reports the clicked part; the inspector form (which may mount a moment
 * later, after Puck selects the block) reads the latest report for its section.
 */
export type ImportedFocus = { sectionId: string; key: string; at: number };

let latest: ImportedFocus | null = null;
const listeners = new Set<(focus: ImportedFocus) => void>();

export function reportImportedFocus(sectionId: string, key: string): void {
  latest = { sectionId, key, at: Date.now() };
  for (const listener of listeners) listener(latest);
}

/** The latest report for `sectionId` if it happened within the last 2 seconds. */
export function recentImportedFocus(sectionId: string): ImportedFocus | null {
  return latest && latest.sectionId === sectionId && Date.now() - latest.at < 2000 ? latest : null;
}

export function onImportedFocus(listener: (focus: ImportedFocus) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
