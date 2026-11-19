/** Preset sizes offered in the imported-block style panel. */
export const FONT_SIZE_PRESETS = [12, 14, 15, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64].map((n) => `${n}px`);

const SIZE = /^(\d{1,4}(?:\.\d{1,3})?)\s*(px|rem|em|%|vw|vh)?$/i;

/**
 * A typed custom font size as CSS ("22" → "22px", "1.4REM" → "1.4rem"), or null when it isn't
 * a plain size. Zero is rejected so the text can't vanish by accident.
 */
export function parseFontSize(input: string): string | null {
  const match = input.trim().match(SIZE);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!(amount > 0)) return null;
  return `${amount}${(match[2] || "px").toLowerCase()}`;
}
