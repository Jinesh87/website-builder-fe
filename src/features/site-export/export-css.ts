/**
 * CSS the exported sites need on top of SITE_CSS: a page reset, and the few
 * Tailwind utilities the site-kit uses. In the app those utilities come from
 * the app's Tailwind build, in a layer, so unlayered site rules still win;
 * keeping them in a layer here preserves that.
 */
export const EXPORT_BASE_CSS = `html, body { margin: 0; min-height: 100%; }
body { display: flex; flex-direction: column; min-height: 100vh; }

@layer utilities {
  .flex { display: flex; }
  .inline-flex { display: inline-flex; }
  .flex-col { flex-direction: column; }
  .flex-wrap { flex-wrap: wrap; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .shrink-0 { flex-shrink: 0; }
  .whitespace-nowrap { white-space: nowrap; }
  .gap-1\\.5 { gap: 0.375rem; }
  .gap-4 { gap: 1rem; }
  .gap-5 { gap: 1.25rem; }
  .gap-x-4 { column-gap: 1rem; }
  .gap-y-1 { row-gap: 0.25rem; }
  .ml-1\\.5 { margin-left: 0.375rem; }
  .ml-3 { margin-left: 0.75rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-6 { margin-top: 1.5rem; }
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .text-center { text-align: center; }
  .font-semibold { font-weight: 600; }
  .font-bold { font-weight: 700; }
  .text-emerald-500 { color: #10b981; }
  .text-\\[\\#003087\\] { color: #003087; }
  .text-\\[\\#006fcf\\] { color: #006fcf; }
  .text-\\[\\#f26522\\] { color: #f26522; }
  @media (min-width: 40rem) {
    .sm\\:flex-row { flex-direction: row; }
  }
}
`;

/** Only the static export renders hidden states (menus, slides, views) into the markup. */
export const STATIC_STATE_CSS = `.wb-states, .wb-state { display: contents; }
.wb-site [hidden] { display: none !important; }
`;
