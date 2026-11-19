/**
 * The "Edit code" panel shows an imported block's CSS without its scope prefix, the way it was
 * written: `.wb-site .wbi-x .card` → `.card`, and the block root itself → `&` (`&.dark`, `& > ul`).
 * The server puts the prefix back (and re-checks everything) when the code is applied.
 */
export function toEditorCss(css: string | undefined, scope: string | undefined): string {
  if (!css) return "";
  if (!scope) return css;
  const root = `.wb-site .${scope}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css
    .replace(new RegExp(`${root}(?![\\w-]) (?![>+~{,])`, "g"), "")
    .replace(new RegExp(`${root}(?![\\w-])`, "g"), "&");
}
