/** Renamed template keys, so old "use template" links still preselect the template. Mirrors the backend list. */
const TEMPLATE_KEY_ALIASES: Record<string, string> = {
  "minsaree-boutique": "premium-boutique",
};

export function resolveTemplateKey(key: string): string {
  return Object.hasOwn(TEMPLATE_KEY_ALIASES, key) ? TEMPLATE_KEY_ALIASES[key]! : key;
}
