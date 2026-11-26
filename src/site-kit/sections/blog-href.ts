/** A post's link: full URLs, mailto/tel and #anchors as given, site paths with a leading slash, "#" when empty. */
export function formatBlogHref(slug?: string): string {
  if (!slug || slug.trim() === "" || slug === "#") return "#";
  const trimmed = slug.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("#")
  ) {
    return trimmed;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
