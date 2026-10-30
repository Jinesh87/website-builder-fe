/**
 * Content fields that accept inline formatting. Every renderer of these keys
 * must go through `parseRichText` (or `toPlainText` for attributes); the
 * rich-text coverage test renders all templates to enforce it.
 */
export const RICH_TEXT_KEYS: ReadonlySet<string> = new Set([
  "heading",
  "subheading",
  "title",
  "subtitle",
  "description",
  "intro",
  "eyebrow",
  "text",
  "body",
  "quote",
  "answer",
  "question",
  "caption",
  "tagline",
  "excerpt",
  "paragraphs",
  "bullets",
  "subtext",
]);
