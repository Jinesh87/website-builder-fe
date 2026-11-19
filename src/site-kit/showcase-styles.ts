/**
 * Product showcase section. Each grid cell is an inline-size container so cards
 * adapt to their own width; the grid follows the site container like `.wb-grid`.
 * Product designs use `.wb-showcase-d-*`, category designs `.wb-showcase-cats-*`.
 *
 * Interpolated into SITE_CSS, so it must not contain backticks or template placeholders.
 */
export const SHOWCASE_CSS = `
.wb-showcase { --wb-showcase-gap: 24px; --wb-showcase-radius: var(--wb-radius); }

/* Header */
.wb-showcase .wb-showcase-head { display: flex; flex-direction: column; gap: 10px; max-width: 720px; margin: 0 auto 40px; }
.wb-showcase .wb-showcase-head-center { align-items: center; text-align: center; }
.wb-showcase .wb-showcase-head-left { align-items: flex-start; text-align: left; margin-left: 0; }
.wb-showcase .wb-showcase-intro { font-size: 17px; }
.wb-showcase .wb-showcase-empty { text-align: center; color: var(--wb-muted); padding: 32px 0; }

/* Grid */
.wb-showcase .wb-showcase-grid { gap: var(--wb-showcase-gap); align-items: stretch; text-align: left; }
.wb-showcase .wb-showcase-cell { container: wb-showcase-card / inline-size; display: flex; min-width: 0; }
.wb-showcase .wb-showcase-cell > * { flex: 1 1 auto; min-width: 0; }

/* Tabs */
.wb-showcase .wb-showcase-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 32px; }
.wb-showcase .wb-showcase-tab {
  padding: 8px 18px; border-radius: 9999px; border: 1px solid var(--wb-border);
  background: transparent; color: inherit; font: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.wb-showcase .wb-showcase-tab:hover { border-color: var(--wb-primary); color: var(--wb-primary); }
.wb-showcase .wb-showcase-tab.wb-showcase-tab-active { background: var(--wb-primary); border-color: var(--wb-primary); color: var(--wb-on-primary); }

/* Groups */
.wb-showcase .wb-showcase-groups { display: flex; flex-direction: column; gap: 56px; text-align: left; }
.wb-showcase .wb-showcase-group-head { display: flex; flex-direction: column; gap: 6px; padding-bottom: 14px; margin-bottom: 24px; border-bottom: 1px solid var(--wb-border); }
.wb-showcase .wb-showcase-group-title { font-size: 24px; font-weight: 700; line-height: 1.25; }
.wb-showcase .wb-showcase-group-desc { color: var(--wb-muted); font-size: 15px; max-width: 720px; }

/* Product card: shared parts */
.wb-showcase .wb-showcase-card {
  position: relative; display: flex; flex-direction: column; min-width: 0; height: 100%;
  color: var(--wb-text); border-radius: var(--wb-showcase-radius);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
}
.wb-showcase .wb-showcase-media {
  position: relative; overflow: hidden; flex-shrink: 0; aspect-ratio: var(--wb-showcase-ar, 4 / 3);
  background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-bg));
}
.wb-showcase .wb-showcase-img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.wb-showcase.wb-showcase-fit-contain .wb-showcase-media .wb-showcase-img { object-fit: contain; padding: 12px; }
.wb-showcase .wb-showcase-card:hover .wb-showcase-img,
.wb-showcase .wb-showcase-cat:hover .wb-showcase-img { transform: scale(1.05); }
.wb-showcase .wb-showcase-body { display: flex; flex-direction: column; gap: 8px; flex: 1 1 auto; min-width: 0; padding: clamp(14px, 7cqi, 22px); }
.wb-showcase .wb-showcase-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.wb-showcase .wb-showcase-cat-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wb-primary); }
.wb-showcase .wb-showcase-badge {
  display: inline-flex; align-items: center; width: fit-content; padding: 3px 10px; border-radius: 9999px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em; line-height: 1.4;
  color: var(--wb-primary); background: color-mix(in srgb, var(--wb-primary) 12%, transparent);
}
.wb-showcase .wb-showcase-badge-floating {
  position: absolute; top: 12px; left: 12px; z-index: 2;
  color: var(--wb-on-primary); background: var(--wb-primary); box-shadow: 0 4px 12px -4px rgb(0 0 0 / 0.3);
}
.wb-showcase .wb-showcase-line { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.wb-showcase .wb-showcase-name { font-size: clamp(16px, 6cqi, 19px); font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; margin: 0; }
.wb-showcase .wb-showcase-name-link { color: inherit; text-decoration: none; }
.wb-showcase .wb-showcase-name-link::after { content: ""; position: absolute; inset: 0; z-index: 1; }
.wb-showcase .wb-showcase-summary { font-size: 14.5px; line-height: 1.6; color: var(--wb-muted); overflow-wrap: anywhere; margin: 0; }
.wb-showcase .wb-showcase-clamp {
  display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;
  -webkit-line-clamp: var(--wb-showcase-lines, 3); line-clamp: var(--wb-showcase-lines, 3);
}
.wb-showcase .wb-showcase-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 8px; }
.wb-showcase .wb-showcase-price { font-size: 17px; font-weight: 700; color: var(--wb-text); white-space: nowrap; }
.wb-showcase .wb-showcase-btn {
  position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 600; color: var(--wb-primary); text-decoration: none;
}
.wb-showcase .wb-showcase-btn:hover { text-decoration: underline; text-underline-offset: 3px; }
.wb-showcase .wb-showcase-arrow { width: 16px; height: 16px; flex-shrink: 0; transition: transform 0.2s ease; }
.wb-showcase .wb-showcase-btn:hover .wb-showcase-arrow,
.wb-showcase .wb-showcase-cat:hover .wb-showcase-arrow { transform: translateX(3px); }

/* Design: classic */
.wb-showcase.wb-showcase-d-classic .wb-showcase-card { background: var(--wb-bg); border: 1px solid var(--wb-border); overflow: hidden; }
.wb-showcase.wb-showcase-d-classic .wb-showcase-card:hover { transform: translateY(-4px); box-shadow: 0 16px 34px -14px rgb(0 0 0 / 0.22); }
.wb-showcase.wb-showcase-d-classic .wb-showcase-foot { border-top: 1px solid var(--wb-border); padding-top: 14px; margin-top: auto; }

/* Design: minimal */
.wb-showcase.wb-showcase-d-minimal .wb-showcase-media { border-radius: var(--wb-showcase-radius); }
.wb-showcase.wb-showcase-d-minimal .wb-showcase-body { padding: 16px 2px 0; gap: 6px; }
.wb-showcase.wb-showcase-d-minimal .wb-showcase-price { font-weight: 600; color: var(--wb-muted); font-size: 15px; }

/* Design: overlay (text over the photo) */
.wb-showcase.wb-showcase-d-overlay .wb-showcase-card { overflow: hidden; background: var(--wb-text); color: #fff; }
.wb-showcase.wb-showcase-d-overlay .wb-showcase-card .wb-showcase-media { position: absolute; inset: 0; aspect-ratio: auto; }
.wb-showcase.wb-showcase-d-overlay .wb-showcase-card:not(.wb-showcase-card-noimg) { aspect-ratio: var(--wb-showcase-ar, 4 / 3); min-height: 260px; }
.wb-showcase.wb-showcase-d-overlay .wb-showcase-card:not(.wb-showcase-card-noimg) .wb-showcase-media::after {
  content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgb(0 0 0 / 0.82), rgb(0 0 0 / 0.25) 55%, transparent);
}
.wb-showcase.wb-showcase-d-overlay .wb-showcase-body { position: relative; z-index: 1; justify-content: flex-end; padding: clamp(16px, 7cqi, 26px); }
.wb-showcase.wb-showcase-d-overlay .wb-showcase-card-noimg { background: var(--wb-primary); color: var(--wb-on-primary); min-height: 220px; }
.wb-showcase.wb-showcase-d-overlay .wb-showcase-summary,
.wb-showcase.wb-showcase-d-overlay .wb-showcase-price,
.wb-showcase.wb-showcase-d-overlay .wb-showcase-btn,
.wb-showcase.wb-showcase-d-overlay .wb-showcase-cat-label { color: inherit; }
.wb-showcase.wb-showcase-d-overlay .wb-showcase-summary { opacity: 0.85; }
.wb-showcase.wb-showcase-d-overlay .wb-showcase-foot { margin-top: 4px; }
.wb-showcase.wb-showcase-d-overlay .wb-showcase-body .wb-showcase-badge { background: rgb(255 255 255 / 0.18); color: inherit; }
.wb-showcase.wb-showcase-d-overlay .wb-showcase-name { font-size: clamp(18px, 7cqi, 24px); }

/* Design: horizontal (photo beside the text) */
.wb-showcase.wb-showcase-d-horizontal .wb-showcase-card { flex-direction: row; background: var(--wb-bg); border: 1px solid var(--wb-border); overflow: hidden; }
.wb-showcase.wb-showcase-d-horizontal .wb-showcase-media { width: 40%; aspect-ratio: auto; min-height: 180px; }
.wb-showcase.wb-showcase-d-horizontal .wb-showcase-media .wb-showcase-img { position: absolute; inset: 0; }
.wb-showcase.wb-showcase-d-horizontal .wb-showcase-body { justify-content: center; padding: clamp(16px, 5cqi, 28px); }
.wb-showcase.wb-showcase-d-horizontal .wb-showcase-card:hover { box-shadow: 0 16px 34px -16px rgb(0 0 0 / 0.22); }
@container wb-showcase-card (max-width: 420px) {
  .wb-showcase.wb-showcase-d-horizontal .wb-showcase-card { flex-direction: column; }
  .wb-showcase.wb-showcase-d-horizontal .wb-showcase-media { width: 100%; aspect-ratio: var(--wb-showcase-ar, 4 / 3); min-height: 0; }
  .wb-showcase.wb-showcase-d-horizontal .wb-showcase-media .wb-showcase-img { position: static; }
}

/* Design: spotlight (centered, product on a tinted stage) */
.wb-showcase.wb-showcase-d-spotlight .wb-showcase-card { text-align: center; align-items: stretch; }
.wb-showcase.wb-showcase-d-spotlight .wb-showcase-media {
  border-radius: calc(var(--wb-showcase-radius) * 1.5);
  background: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--wb-primary) 10%, var(--wb-bg)), color-mix(in srgb, var(--wb-primary) 4%, var(--wb-surface)));
}
.wb-showcase.wb-showcase-d-spotlight .wb-showcase-body { align-items: center; padding: 18px 8px 4px; }
.wb-showcase.wb-showcase-d-spotlight .wb-showcase-line { justify-content: center; }
.wb-showcase.wb-showcase-d-spotlight .wb-showcase-meta { justify-content: center; }
.wb-showcase.wb-showcase-d-spotlight .wb-showcase-foot { flex-direction: column; justify-content: center; gap: 12px; }
.wb-showcase.wb-showcase-d-spotlight .wb-showcase-price {
  padding: 4px 14px; border-radius: 9999px; font-size: 15px;
  background: color-mix(in srgb, var(--wb-primary) 12%, transparent); color: var(--wb-primary);
}

/* Design: catalogue (price-list rows with a small photo) */
.wb-showcase.wb-showcase-d-catalogue .wb-showcase-grid { row-gap: 8px; column-gap: 40px; }
.wb-showcase.wb-showcase-d-catalogue .wb-showcase-card {
  flex-direction: row; align-items: flex-start; gap: 16px; padding: 14px 0;
  border-bottom: 1px dashed var(--wb-border); border-radius: 0;
}
.wb-showcase.wb-showcase-d-catalogue .wb-showcase-media { width: 76px; aspect-ratio: 1 / 1; border-radius: var(--wb-showcase-radius); }
.wb-showcase.wb-showcase-d-catalogue .wb-showcase-body { padding: 0; gap: 4px; }
.wb-showcase.wb-showcase-d-catalogue .wb-showcase-name { font-size: 17px; }
.wb-showcase.wb-showcase-d-catalogue .wb-showcase-leader { flex: 1 1 24px; min-width: 24px; border-bottom: 2px dotted color-mix(in srgb, var(--wb-text) 25%, transparent); transform: translateY(-4px); }
.wb-showcase.wb-showcase-d-catalogue .wb-showcase-price { color: var(--wb-primary); font-size: 16px; }
.wb-showcase.wb-showcase-d-catalogue .wb-showcase-summary { font-size: 14px; }
.wb-showcase.wb-showcase-d-catalogue .wb-showcase-foot { padding-top: 2px; }
.wb-showcase.wb-showcase-d-catalogue .wb-showcase-badge-floating { top: 4px; left: 4px; padding: 2px 6px; font-size: 9px; }

/* Category cards: shared parts */
.wb-showcase .wb-showcase-cat { position: relative; display: flex; flex-direction: column; min-width: 0; height: 100%; color: var(--wb-text); text-decoration: none; border-radius: var(--wb-showcase-radius); }
.wb-showcase .wb-showcase-cat-media { position: relative; display: block; overflow: hidden; aspect-ratio: var(--wb-showcase-ar, 4 / 3); background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-bg)); }
.wb-showcase .wb-showcase-cat-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.wb-showcase .wb-showcase-cat-name { font-size: clamp(16px, 7cqi, 20px); font-weight: 650; line-height: 1.3; overflow-wrap: anywhere; }
.wb-showcase .wb-showcase-cat-desc { font-size: 14px; line-height: 1.55; color: var(--wb-muted); }
.wb-showcase .wb-showcase-cat-count { font-size: 13px; font-weight: 500; color: var(--wb-muted); }

/* Category design: tiles (name over the photo) */
.wb-showcase.wb-showcase-cats-tiles .wb-showcase-cat { overflow: hidden; color: #fff; background: var(--wb-primary); }
.wb-showcase.wb-showcase-cats-tiles .wb-showcase-cat-media { height: 100%; }
.wb-showcase.wb-showcase-cats-tiles .wb-showcase-cat-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgb(0 0 0 / 0.75), transparent 60%); }
.wb-showcase.wb-showcase-cats-tiles .wb-showcase-cat-body { position: absolute; inset: auto 0 0 0; z-index: 1; padding: clamp(14px, 7cqi, 24px); }
.wb-showcase.wb-showcase-cats-tiles .wb-showcase-cat-noimg { min-height: 180px; color: var(--wb-on-primary); }
.wb-showcase.wb-showcase-cats-tiles .wb-showcase-cat-desc,
.wb-showcase.wb-showcase-cats-tiles .wb-showcase-cat-count { color: inherit; opacity: 0.85; }
.wb-showcase.wb-showcase-cats-tiles .wb-showcase-cat-name { font-size: clamp(18px, 8cqi, 24px); }

/* Category design: cards */
.wb-showcase.wb-showcase-cats-cards .wb-showcase-cat { overflow: hidden; background: var(--wb-bg); border: 1px solid var(--wb-border); transition: transform 0.25s ease, box-shadow 0.25s ease; }
.wb-showcase.wb-showcase-cats-cards .wb-showcase-cat:hover { transform: translateY(-4px); box-shadow: 0 16px 34px -14px rgb(0 0 0 / 0.22); }
.wb-showcase.wb-showcase-cats-cards .wb-showcase-cat-body { flex: 1 1 auto; padding: clamp(14px, 7cqi, 22px); }
.wb-showcase.wb-showcase-cats-cards .wb-showcase-cat:has(> .wb-showcase-arrow) .wb-showcase-cat-body { padding-right: 48px; }
.wb-showcase.wb-showcase-cats-cards .wb-showcase-cat > .wb-showcase-arrow { position: absolute; right: 18px; bottom: 20px; color: var(--wb-primary); width: 20px; height: 20px; }

/* Category design: circles */
.wb-showcase.wb-showcase-cats-circles .wb-showcase-cat { align-items: center; text-align: center; gap: 14px; }
.wb-showcase.wb-showcase-cats-circles .wb-showcase-cat-media {
  width: min(100%, 200px); aspect-ratio: 1 / 1; border-radius: 9999px;
  box-shadow: 0 0 0 4px var(--wb-bg), 0 0 0 6px color-mix(in srgb, var(--wb-primary) 25%, transparent);
  transition: box-shadow 0.25s ease;
}
.wb-showcase.wb-showcase-cats-circles .wb-showcase-cat:hover .wb-showcase-cat-media { box-shadow: 0 0 0 4px var(--wb-bg), 0 0 0 6px var(--wb-primary); }
.wb-showcase.wb-showcase-cats-circles .wb-showcase-cat-body { align-items: center; }

/* Category design: pills */
.wb-showcase .wb-showcase-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.wb-showcase.wb-showcase-cats-pills .wb-showcase-cell { container: none; display: block; }
.wb-showcase.wb-showcase-cats-pills .wb-showcase-cat {
  flex-direction: row; align-items: center; gap: 10px; padding: 6px 18px 6px 6px; border-radius: 9999px;
  border: 1px solid var(--wb-border); background: var(--wb-bg); transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.wb-showcase.wb-showcase-cats-pills .wb-showcase-cat-noimg { padding-left: 18px; }
.wb-showcase.wb-showcase-cats-pills .wb-showcase-cat:hover { border-color: var(--wb-primary); box-shadow: 0 6px 16px -10px rgb(0 0 0 / 0.3); }
.wb-showcase.wb-showcase-cats-pills .wb-showcase-cat-media { width: 40px; height: 40px; aspect-ratio: 1 / 1; border-radius: 9999px; }
.wb-showcase.wb-showcase-cats-pills .wb-showcase-cat-body { flex-direction: row; align-items: baseline; gap: 8px; }
.wb-showcase.wb-showcase-cats-pills .wb-showcase-cat-name { font-size: 15px; font-weight: 600; }
.wb-showcase.wb-showcase-cats-pills .wb-showcase-cat-count { font-size: 12px; }

/* Dark / primary section backgrounds */
.wb-showcase.wb-bg-dark .wb-showcase-card,
.wb-showcase.wb-bg-primary .wb-showcase-card,
.wb-showcase.wb-bg-dark .wb-showcase-price,
.wb-showcase.wb-bg-primary .wb-showcase-price,
.wb-showcase.wb-bg-dark:not(.wb-showcase-cats-tiles) .wb-showcase-cat,
.wb-showcase.wb-bg-primary:not(.wb-showcase-cats-tiles) .wb-showcase-cat { color: inherit; }
.wb-showcase.wb-bg-primary .wb-showcase-btn,
.wb-showcase.wb-bg-primary .wb-showcase-cat-label { color: inherit; }
.wb-showcase.wb-bg-dark .wb-showcase-summary,
.wb-showcase.wb-bg-primary .wb-showcase-summary,
.wb-showcase.wb-bg-dark .wb-showcase-cat-desc,
.wb-showcase.wb-bg-dark .wb-showcase-cat-count { color: inherit; opacity: 0.75; }
.wb-showcase.wb-bg-primary.wb-showcase-d-classic .wb-showcase-card,
.wb-showcase.wb-bg-primary.wb-showcase-d-horizontal .wb-showcase-card,
.wb-showcase.wb-bg-primary.wb-showcase-cats-cards .wb-showcase-cat,
.wb-showcase.wb-bg-primary.wb-showcase-cats-pills .wb-showcase-cat { background: rgb(255 255 255 / 0.08); border-color: rgb(255 255 255 / 0.2); }
.wb-showcase.wb-bg-dark.wb-showcase-cats-pills .wb-showcase-cat { background: rgb(255 255 255 / 0.05); border-color: rgb(255 255 255 / 0.12); }
.wb-showcase.wb-bg-dark.wb-showcase-d-classic .wb-showcase-card,
.wb-showcase.wb-bg-dark.wb-showcase-d-horizontal .wb-showcase-card,
.wb-showcase.wb-bg-dark.wb-showcase-cats-cards .wb-showcase-cat { background: rgb(255 255 255 / 0.05); border-color: rgb(255 255 255 / 0.12); }

@container wb-site (max-width: 600px) {
  .wb-showcase .wb-showcase-head { margin-bottom: 28px; }
  .wb-showcase .wb-showcase-tabs { flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto; scrollbar-width: none; margin-inline: -16px; padding-inline: 16px; }
  .wb-showcase .wb-showcase-tab { flex-shrink: 0; }
  .wb-showcase .wb-showcase-groups { gap: 40px; }
  .wb-showcase.wb-showcase-d-catalogue .wb-showcase-grid { column-gap: 0; }
}
`;
