/**
 * Normalizes any hex color input into a valid uppercase hex code (#RRGGBB).
 * Automatically heals common user errors such as:
 * - Extra leading zeroes, e.g. "#00F172A" -> "#0F172A"
 * - Missing hash, e.g. "0F172A" -> "#0F172A"
 * - Multiple hashes, e.g. "##FFFFFF" -> "#FFFFFF"
 * - 3-digit shorthand, e.g. "#FFF" -> "#FFFFFF"
 * - Pasted strings with extra characters, e.g. "#0F172AFF" -> "#0F172A"
 */
export function normalizeHexColor(input?: string | null): string | undefined {
  if (!input) return undefined;
  let str = input.trim().toLowerCase();
  if (!str) return undefined;

  // Preserve CSS functional colors or keywords if provided
  if (/^(rgb|hsl)a?\(|^transparent$|^currentcolor$/i.test(str)) {
    return str;
  }

  // Remove all leading '#' characters
  str = str.replace(/^#+/, "");

  // Strip any non-hex characters
  str = str.replace(/[^0-9a-f]/gi, "");
  if (!str) return undefined;

  // 1. Common typo: user typed an extra 0 or double-zero after # (e.g. "00f172a", 7 chars)
  if (str.length === 7) {
    if (str.startsWith("00")) {
      str = str.slice(1); // "00f172a" -> "0f172a"
    } else {
      str = str.slice(0, 6);
    }
  } else if (str.length === 3) {
    // 3 digits shorthand #RGB -> #RRGGBB
    str = str.split("").map((c) => c + c).join("");
  } else if (str.length === 4) {
    // 4 digits #RGBA -> #RRGGBB
    str = str.slice(0, 3).split("").map((c) => c + c).join("");
  } else if (str.length > 7) {
    if (str.startsWith("00") && str.length === 8) {
      str = str.slice(2);
    } else {
      str = str.slice(0, 6);
    }
  } else if (str.length === 5) {
    str = str.slice(0, 3).split("").map((c) => c + c).join("");
  }

  // If we have a valid 6-hex code
  if (/^[0-9a-f]{6}$/i.test(str)) {
    return `#${str.toUpperCase()}`;
  }

  return undefined;
}

/**
 * Returns true if a color has high perceived luminance (bright/light background).
 */
export function isLightColor(colorStr?: string | null): boolean {
  const hex = normalizeHexColor(colorStr);
  if (!hex || hex.length < 7) return false;
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
