import { useEffect, useRef } from "react";

/** Scanners send keys a few ms apart; people type far slower. */
const MAX_KEY_GAP_MS = 50;
/** Shorter bursts are more likely stray fast typing than a barcode. */
const MIN_CODE_LENGTH = 4;

/**
 * Collects keystrokes into a scan: printable keys that arrive quickly after each other, ended by
 * Enter. Returns the code on Enter when it looks like a scan, otherwise null.
 */
export function createScanBuffer(maxGapMs = MAX_KEY_GAP_MS, minLength = MIN_CODE_LENGTH) {
  let chars = "";
  let lastAt = 0;
  return {
    feed(key: string, at: number): string | null {
      const quick = at - lastAt <= maxGapMs;
      lastAt = at;
      if (key === "Enter") {
        const code = quick && chars.length >= minLength ? chars : null;
        chars = "";
        return code;
      }
      if (key.length !== 1) return null;
      chars = quick ? chars + key : key;
      return null;
    },
  };
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Hears a barcode scanner anywhere on the page (not just in the search box) while `enabled`.
 * Fields keep their own input: a scan typed into a text field is left to that field.
 */
export function useBarcodeScanner(onScan: (code: string) => void, enabled: boolean): void {
  const handler = useRef(onScan);
  handler.current = onScan;

  useEffect(() => {
    if (!enabled) return;
    const buffer = createScanBuffer();
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      const code = buffer.feed(event.key, event.timeStamp);
      if (code) {
        event.preventDefault();
        handler.current(code);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
