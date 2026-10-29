/**
 * Cards section. Each grid cell is an inline-size container, so card internals
 * adapt to the card's own width (any column count), while the grid itself
 * follows the site container like every other section.
 *
 * Interpolated into SITE_CSS, so it must not contain backticks or template placeholders.
 */
export const CARDS_CSS = `
.wb-cardset {
  --wb-cardset-gap: 24px;
  --wb-cardset-on-media: #ffffff;
}
.wb-cardset.wb-cardset-gap-sm { --wb-cardset-gap: 16px; }
.wb-cardset.wb-cardset-gap-lg { --wb-cardset-gap: 32px; }

/* Header */
.wb-cardset .wb-cardset-head { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
.wb-cardset .wb-cardset-head-copy { display: flex; flex-direction: column; gap: 10px; max-width: 720px; }
.wb-cardset .wb-cardset-head-center { align-items: center; text-align: center; }
.wb-cardset .wb-cardset-head-center .wb-cardset-head-copy { align-items: center; margin-inline: auto; }
.wb-cardset .wb-cardset-head-left { align-items: flex-start; text-align: left; }
.wb-cardset .wb-cardset-head-right { align-items: flex-end; text-align: right; }
.wb-cardset .wb-cardset-head-right .wb-cardset-head-copy { align-items: flex-end; margin-inline-start: auto; margin-inline-end: 0; }
.wb-cardset .wb-cardset-head-split { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 24px; text-align: left; }
.wb-cardset .wb-cardset-intro { font-size: 17px; }
.wb-cardset .wb-cardset-head-link {
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
  font-size: 14px; font-weight: 600; color: var(--wb-primary);
  white-space: nowrap; text-underline-offset: 3px;
}
.wb-cardset .wb-cardset-head-link:hover { text-decoration: underline; }
.wb-cardset .wb-cardset-head-arrow { width: 16px; height: 16px; transition: transform 0.2s ease; }
.wb-cardset .wb-cardset-head-link:hover .wb-cardset-head-arrow { transform: translateX(3px); }
.wb-cardset.wb-bg-primary .wb-cardset-head-link,
.wb-cardset.wb-bg-dark .wb-cardset-head-link { color: inherit; }

/* Grid */
.wb-cardset .wb-cardset-grid {
  display: grid; gap: var(--wb-cardset-gap); align-items: stretch;
  grid-template-columns: repeat(var(--wb-cols, 3), minmax(0, 1fr));
}
.wb-cardset .wb-cardset-cell { container: wb-cardset-card / inline-size; display: flex; min-width: 0; }
.wb-cardset .wb-cardset-cell > .wb-cardset-card { flex: 1 1 auto; min-width: 0; }
.wb-cardset .wb-cardset-bottom { display: flex; justify-content: center; margin-top: 40px; }
.wb-cardset .wb-cardset-bottom .wb-btn { border-radius: var(--wb-cardset-btn-radius, var(--wb-radius)); }

/* Card shell */
.wb-cardset .wb-cardset-card {
  --wb-cardset-accent: var(--wb-primary);
  position: relative; display: flex; flex-direction: column; min-width: 0;
  color: var(--wb-text);
  border-radius: var(--wb-cardset-radius, var(--wb-radius));
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
}
.wb-cardset .wb-cardset-surface {
  background: var(--wb-cardset-card-bg, var(--wb-bg));
  color: var(--wb-text);
  border-radius: var(--wb-cardset-radius, var(--wb-radius));
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
}
.wb-cardset.wb-cardset-style-bordered .wb-cardset-surface { border: 1px solid var(--wb-border); }
.wb-cardset.wb-cardset-style-shadow .wb-cardset-surface { box-shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px rgb(0 0 0 / 0.08); }
.wb-cardset.wb-cardset-style-flat .wb-cardset-surface { background: var(--wb-cardset-card-bg, var(--wb-surface)); }
.wb-cardset.wb-cardset-style-flat.wb-bg-surface .wb-cardset-surface { background: var(--wb-cardset-card-bg, var(--wb-bg)); }
.wb-cardset.wb-cardset-style-glass .wb-cardset-surface {
  background: var(--wb-cardset-card-bg, color-mix(in srgb, var(--wb-bg) 72%, transparent));
  -webkit-backdrop-filter: blur(16px) saturate(140%); backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid color-mix(in srgb, var(--wb-text) 10%, transparent);
  box-shadow: 0 10px 30px -12px rgb(0 0 0 / 0.18);
}
.wb-cardset.wb-cardset-style-elevated .wb-cardset-surface {
  border: 1px solid color-mix(in srgb, var(--wb-border) 70%, transparent);
  box-shadow: 0 14px 34px -10px rgb(0 0 0 / 0.16), 0 4px 10px -6px rgb(0 0 0 / 0.08);
}
.wb-cardset .wb-cardset-featured .wb-cardset-surface,
.wb-cardset .wb-cardset-featured.wb-cardset-surface {
  box-shadow: 0 0 0 2px var(--wb-cardset-accent), 0 14px 34px -14px color-mix(in srgb, var(--wb-cardset-accent) 45%, transparent);
}

/* Media */
.wb-cardset .wb-cardset-media {
  position: relative; overflow: hidden; flex-shrink: 0;
  aspect-ratio: var(--wb-cardset-ar, auto);
  background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-bg));
}
.wb-cardset .wb-cardset-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-cardset.wb-cardset-fit-contain .wb-cardset-img { object-fit: contain; padding: 12px; }
.wb-cardset .wb-cardset-badge {
  display: inline-flex; align-items: center; width: fit-content; max-width: 100%;
  padding: 4px 10px; border-radius: 9999px;
  font-size: 12px; font-weight: 600; line-height: 1.3; letter-spacing: 0.01em;
  color: var(--wb-cardset-accent);
  background: color-mix(in srgb, var(--wb-cardset-accent) 12%, transparent);
}
.wb-cardset .wb-cardset-badge-floating {
  position: absolute; top: 12px; left: 12px; z-index: 2;
  color: var(--wb-on-primary); background: var(--wb-cardset-accent);
  box-shadow: 0 4px 12px -4px rgb(0 0 0 / 0.3);
}

/* Text */
.wb-cardset .wb-cardset-body { display: flex; flex-direction: column; gap: 12px; flex: 1 1 auto; min-width: 0; padding: clamp(16px, 7cqi, 24px); }
.wb-cardset .wb-cardset-titles { display: flex; flex-direction: column; gap: 4px; }
.wb-cardset .wb-cardset-title { font-size: clamp(17px, 6cqi, 21px); font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; }
.wb-cardset .wb-cardset-subtitle { font-size: 13px; font-weight: 500; color: var(--wb-muted); }
.wb-cardset .wb-cardset-desc { font-size: 15px; line-height: 1.6; color: var(--wb-muted); overflow-wrap: anywhere; }
.wb-cardset .wb-cardset-desc-clamped {
  display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;
  -webkit-line-clamp: var(--wb-cardset-lines, 3); line-clamp: var(--wb-cardset-lines, 3);
}
.wb-cardset .wb-cardset-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.wb-cardset .wb-cardset-tag {
  padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; line-height: 1.4;
  color: color-mix(in srgb, var(--wb-cardset-accent) 80%, var(--wb-text));
  background: color-mix(in srgb, var(--wb-cardset-accent) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-cardset-accent) 22%, transparent);
}
.wb-cardset .wb-cardset-price { font-size: 18px; font-weight: 700; color: var(--wb-text); }

/* Card Marker & Floating Icon Badge */
.wb-cardset .wb-cardset-marker { display: flex; align-items: center; gap: 12px; }
.wb-cardset .wb-cardset-marker-align-left { justify-content: flex-start; }
.wb-cardset .wb-cardset-marker-align-center { justify-content: center; }
.wb-cardset .wb-cardset-marker-align-right { justify-content: flex-end; }
.wb-cardset .wb-cardset-marker .wb-icon {
  margin: 0;
}

/* Floating Seam Row (Icon badge overlapping image bottom and content top) */
.wb-cardset .wb-cardset-seam-icon-row {
  position: relative;
  z-index: 3;
  display: flex;
  height: 0;
  padding-inline: clamp(16px, 7cqi, 24px);
  pointer-events: none;
}
.wb-cardset .wb-cardset-seam-icon-row > * {
  pointer-events: auto;
  transform: translateY(-50%) translateY(var(--wb-cardset-icon-offset-y, 0px));
}
.wb-cardset .wb-cardset-seam-icon-row.wb-cardset-icon-align-left {
  justify-content: flex-start;
}
.wb-cardset .wb-cardset-seam-icon-row.wb-cardset-icon-align-center {
  justify-content: center;
}
.wb-cardset .wb-cardset-seam-icon-row.wb-cardset-icon-align-right {
  justify-content: flex-end;
}

/* Buffer top padding of body when seam icon is present with image */
.wb-cardset .wb-cardset-has-seam-icon .wb-cardset-body {
  padding-top: calc(clamp(16px, 7cqi, 24px) + (var(--wb-cardset-icon-size, 44px) * 0.5) + 8px);
}
.wb-cardset .wb-cardset-has-seam-icon .wb-cardset-panel {
  padding-top: calc(clamp(16px, 7cqi, 22px) + (var(--wb-cardset-icon-size, 44px) * 0.5) + 8px);
}

/* Floating Top on Media */
.wb-cardset .wb-cardset-media .wb-cardset-icon-float-top {
  position: absolute;
  top: 12px;
  z-index: 2;
  display: flex;
}
.wb-cardset .wb-cardset-media .wb-cardset-icon-float-top.wb-cardset-icon-align-left {
  left: 12px;
}
.wb-cardset .wb-cardset-media .wb-cardset-icon-float-top.wb-cardset-icon-align-center {
  left: 50%;
  transform: translateX(-50%);
}
.wb-cardset .wb-cardset-media .wb-cardset-icon-float-top.wb-cardset-icon-align-right {
  right: 12px;
}

/* Icon Badge */
.wb-cardset .wb-cardset-icon-badge {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--wb-cardset-icon-size, 44px);
  height: var(--wb-cardset-icon-size, 44px);
  border-radius: var(--wb-cardset-icon-radius, 10px);
  box-sizing: border-box;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
}
.wb-cardset .wb-cardset-icon-badge :is(.wb-icon, .wb-icon-inline) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: var(--wb-cardset-icon-svg-size, 22px) !important;
  height: var(--wb-cardset-icon-svg-size, 22px) !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: inherit !important;
}
.wb-cardset .wb-cardset-icon-badge svg {
  width: var(--wb-cardset-icon-svg-size, 22px) !important;
  height: var(--wb-cardset-icon-svg-size, 22px) !important;
  stroke-width: 2;
  color: inherit !important;
}
.wb-cardset .wb-cardset-icon-badge .wb-icon-custom-img {
  width: var(--wb-cardset-icon-svg-size, 22px);
  height: var(--wb-cardset-icon-svg-size, 22px);
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Badge variants */
.wb-cardset .wb-cardset-icon-badge.wb-cardset-icon-v-filled {
  background: var(--wb-cardset-item-icon-bg, var(--wb-cardset-icon-bg, var(--wb-cardset-accent)));
  color: var(--wb-cardset-item-icon-color, var(--wb-cardset-icon-color, #ffffff));
  box-shadow: 0 4px 14px -3px rgb(0 0 0 / 0.25);
}
.wb-cardset .wb-cardset-icon-badge.wb-cardset-icon-v-soft {
  background: var(--wb-cardset-item-icon-bg, var(--wb-cardset-icon-bg, color-mix(in srgb, var(--wb-cardset-accent) 14%, transparent)));
  color: var(--wb-cardset-item-icon-color, var(--wb-cardset-icon-color, var(--wb-cardset-accent)));
}
.wb-cardset .wb-cardset-icon-badge.wb-cardset-icon-v-outline {
  background: transparent;
  border: 1.5px solid var(--wb-cardset-item-icon-bg, var(--wb-cardset-icon-bg, var(--wb-cardset-accent)));
  color: var(--wb-cardset-item-icon-color, var(--wb-cardset-icon-color, var(--wb-cardset-accent)));
}
.wb-cardset .wb-cardset-icon-badge.wb-cardset-icon-v-surface {
  background: var(--wb-cardset-item-icon-bg, var(--wb-cardset-icon-bg, var(--wb-cardset-card-bg, var(--wb-bg))));
  color: var(--wb-cardset-item-icon-color, var(--wb-cardset-icon-color, var(--wb-cardset-accent)));
  border: 1px solid var(--wb-border);
  box-shadow: 0 4px 14px -2px rgb(0 0 0 / 0.12);
}

.wb-cardset-hover-lift .wb-cardset-card:hover :is(.wb-cardset-seam-icon-row, .wb-cardset-panel-seam-icon) > *,
.wb-cardset-hover-zoom .wb-cardset-card:hover :is(.wb-cardset-seam-icon-row, .wb-cardset-panel-seam-icon) > * {
  transform: translateY(-50%) translateY(calc(var(--wb-cardset-icon-offset-y, 0px) - 3px));
  box-shadow: 0 8px 20px -4px rgb(0 0 0 / 0.35);
}

.wb-cardset .wb-cardset-number { font-family: var(--wb-font-heading); font-size: 14px; font-weight: 700; letter-spacing: 0.06em; color: var(--wb-cardset-accent); }
.wb-cardset.wb-cardset-content-center .wb-cardset-body,
.wb-cardset.wb-cardset-content-center .wb-cardset-panel,
.wb-cardset.wb-cardset-content-center .wb-cardset-overlay-content { text-align: center; align-items: center; }
.wb-cardset.wb-cardset-content-center :is(.wb-cardset-tags, .wb-cardset-actions, .wb-cardset-marker, .wb-cardset-top) { justify-content: center; }

/* Buttons */
.wb-cardset .wb-cardset-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: auto; padding-top: 4px; }
.wb-cardset .wb-cardset-actions-block > .wb-cardset-btn:not(.wb-cardset-btn-link) { flex: 1 1 0; }
.wb-cardset .wb-cardset-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 40px; max-width: 100%; padding: 0 18px;
  border: 1.5px solid transparent; border-radius: var(--wb-cardset-btn-radius, var(--wb-radius));
  font-size: 14px; font-weight: 600; line-height: 1.2; text-align: center;
  cursor: pointer; transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.wb-cardset .wb-cardset-btn-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wb-cardset .wb-cardset-btn-sm { min-height: 34px; padding: 0 14px; font-size: 13px; }
.wb-cardset .wb-cardset-btn-lg { min-height: 48px; padding: 0 24px; font-size: 15px; }
.wb-cardset .wb-cardset-btn-oval { padding-inline: 28px; }
.wb-cardset .wb-cardset-btn-arrow { width: 16px; height: 16px; flex-shrink: 0; transition: transform 0.2s ease; }
.wb-cardset .wb-cardset-btn:focus-visible,
.wb-cardset .wb-cardset-head-link:focus-visible { outline: 2px solid var(--wb-cardset-accent, var(--wb-primary)); outline-offset: 2px; }

.wb-cardset .wb-cardset-btn-filled { background: var(--wb-cardset-accent); border-color: var(--wb-cardset-accent); color: var(--wb-on-primary); }
.wb-cardset .wb-cardset-btn-outline { background: transparent; border-color: color-mix(in srgb, var(--wb-text) 24%, transparent); color: var(--wb-text); }
.wb-cardset .wb-cardset-btn-soft { background: color-mix(in srgb, var(--wb-cardset-accent) 12%, transparent); color: var(--wb-cardset-accent); }
.wb-cardset .wb-cardset-btn-ghost { background: transparent; color: var(--wb-cardset-accent); }
.wb-cardset .wb-cardset-btn-link { min-height: 0; padding: 2px 0; border: 0; border-radius: 0; background: none; color: var(--wb-cardset-accent); text-underline-offset: 3px; }

/* Footer row (product design) */
.wb-cardset .wb-cardset-footer { padding: 14px clamp(16px, 7cqi, 24px) clamp(16px, 7cqi, 20px); border-top: 1px solid var(--wb-border); }
.wb-cardset .wb-cardset-footer .wb-cardset-actions { margin-top: 0; padding-top: 0; }

/* 1. Product classic */
.wb-cardset-v-product-classic .wb-cardset-body { gap: 10px; }

/* 2. Image overlay */
.wb-cardset-v-image-overlay .wb-cardset-card { display: grid; isolation: isolate; background: var(--wb-cardset-card-bg, #0f172a); color: var(--wb-cardset-on-media); }
.wb-cardset-v-image-overlay .wb-cardset-overlay-media { grid-area: 1 / 1; align-self: stretch; min-height: 340px; aspect-ratio: var(--wb-cardset-ar, auto); background: var(--wb-cardset-card-bg, linear-gradient(160deg, var(--wb-cardset-accent), #0f172a)); }
.wb-cardset-v-image-overlay .wb-cardset-overlay-media .wb-cardset-img { position: absolute; inset: 0; }
.wb-cardset-v-image-overlay .wb-cardset-overlay-media::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgb(2 6 23 / 0) 25%, rgb(2 6 23 / 0.55) 55%, rgb(2 6 23 / 0.9) 100%);
}
.wb-cardset-v-image-overlay .wb-cardset-overlay-content {
  grid-area: 1 / 1; align-self: end; z-index: 1;
  display: flex; flex-direction: column; gap: 10px; padding: clamp(18px, 7cqi, 28px);
}
.wb-cardset-v-image-overlay .wb-cardset-title,
.wb-cardset-v-image-overlay .wb-cardset-price { color: var(--wb-cardset-on-media); }
.wb-cardset-v-image-overlay :is(.wb-cardset-desc, .wb-cardset-subtitle) { color: rgb(255 255 255 / 0.82); }
.wb-cardset-v-image-overlay .wb-cardset-badge { color: var(--wb-cardset-on-media); background: rgb(255 255 255 / 0.18); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.wb-cardset-v-image-overlay .wb-cardset-tag { color: var(--wb-cardset-on-media); background: rgb(255 255 255 / 0.12); border-color: rgb(255 255 255 / 0.28); }
.wb-cardset-v-image-overlay .wb-cardset-btn-outline { color: var(--wb-cardset-on-media); border-color: rgb(255 255 255 / 0.6); }
.wb-cardset-v-image-overlay .wb-cardset-btn-soft { color: var(--wb-cardset-on-media); background: rgb(255 255 255 / 0.18); }
.wb-cardset-v-image-overlay :is(.wb-cardset-btn-ghost, .wb-cardset-btn-link) { color: var(--wb-cardset-on-media); }
.wb-cardset-v-image-overlay .wb-cardset-actions { margin-top: 4px; }

/* 3. Horizontal split */
.wb-cardset-v-horizontal-split .wb-cardset-card { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 3fr); }
.wb-cardset-v-horizontal-split.wb-cardset-media-right .wb-cardset-card { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
.wb-cardset-v-horizontal-split.wb-cardset-media-right .wb-cardset-media { order: 2; }
.wb-cardset-v-horizontal-split .wb-cardset-card.wb-cardset-no-image { grid-template-columns: minmax(0, 1fr); }
.wb-cardset-v-horizontal-split .wb-cardset-media { aspect-ratio: auto; min-height: 220px; height: 100%; }
.wb-cardset-v-horizontal-split .wb-cardset-media .wb-cardset-img { position: absolute; inset: 0; }
.wb-cardset-v-horizontal-split .wb-cardset-body { justify-content: center; }

/* 4. Minimal accent */
.wb-cardset-v-minimal-accent .wb-cardset-card::before {
  content: ""; position: absolute; top: 0; left: 0; z-index: 1;
  width: 56px; height: 4px; border-radius: 0 0 4px 0;
  background: var(--wb-cardset-accent);
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-cardset-v-minimal-accent.wb-cardset-content-center .wb-cardset-card::before { left: 50%; transform: translateX(-50%); border-radius: 0 0 4px 4px; }
.wb-cardset-v-minimal-accent .wb-cardset-body { gap: 14px; padding: clamp(20px, 8cqi, 32px); }
.wb-cardset-v-minimal-accent .wb-cardset-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.wb-cardset-v-minimal-accent .wb-cardset-top:empty { display: none; }
.wb-cardset-v-minimal-accent .wb-cardset-number { font-size: 28px; line-height: 1; letter-spacing: -0.02em; }

/* 5. Floating panel */
.wb-cardset-v-floating-panel .wb-cardset-card { padding-bottom: 4px; }
.wb-cardset-v-floating-panel .wb-cardset-media { border-radius: var(--wb-cardset-radius, var(--wb-radius)); }
.wb-cardset-v-floating-panel .wb-cardset-panel {
  position: relative;
  z-index: 1; flex: 1 1 auto;
  display: flex; flex-direction: column; gap: 10px;
  margin: -56px clamp(10px, 5cqi, 18px) 0;
  padding: clamp(16px, 7cqi, 22px);
  border-radius: calc(var(--wb-cardset-radius, var(--wb-radius)) * 0.75);
  box-shadow: 0 18px 40px -18px rgb(0 0 0 / 0.28);
}
.wb-cardset-v-floating-panel .wb-cardset-panel-seam-icon {
  position: absolute;
  top: 0;
  left: clamp(16px, 7cqi, 22px);
  right: clamp(16px, 7cqi, 22px);
  display: flex;
  height: 0;
  pointer-events: none;
  z-index: 3;
}
.wb-cardset-v-floating-panel .wb-cardset-panel-seam-icon > * {
  pointer-events: auto;
  transform: translateY(-50%) translateY(var(--wb-cardset-icon-offset-y, 0px));
}
.wb-cardset-v-floating-panel .wb-cardset-panel-seam-icon.wb-cardset-icon-align-left {
  justify-content: flex-start;
}
.wb-cardset-v-floating-panel .wb-cardset-panel-seam-icon.wb-cardset-icon-align-center {
  justify-content: center;
}
.wb-cardset-v-floating-panel .wb-cardset-panel-seam-icon.wb-cardset-icon-align-right {
  justify-content: flex-end;
}
.wb-cardset-v-floating-panel .wb-cardset-no-image .wb-cardset-panel { margin: 0; }
.wb-cardset-v-floating-panel .wb-cardset-span { grid-column: span 2; }
.wb-cardset-v-floating-panel .wb-cardset-span .wb-cardset-media { aspect-ratio: var(--wb-cardset-ar-wide, auto); }

/* 6. Floating icon badge */
.wb-cardset-v-floating-icon .wb-cardset-body {
  gap: 12px;
  padding: clamp(18px, 7cqi, 26px);
}

/* 7. Do's & Don'ts */
.wb-cardset .wb-cardset-dos-donts-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--wb-cardset-card-bg, var(--wb-bg));
  border-radius: var(--wb-cardset-radius, 16px);
  border: 1px solid var(--wb-border);
  box-shadow: 0 4px 20px -4px rgb(0 0 0 / 0.06), 0 2px 6px -2px rgb(0 0 0 / 0.04);
}
.wb-cardset .wb-cardset-dos-donts-top-bar {
  height: 4px;
  width: 100%;
  background: var(--wb-cardset-accent, #16a34a);
  flex-shrink: 0;
}
.wb-cardset .wb-cardset-dos-donts-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 28px 18px 28px;
}
.wb-cardset .wb-cardset-dos-donts-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.wb-cardset .wb-cardset-dos-donts-badge.wb-cardset-is-positive {
  background: color-mix(in srgb, #16a34a 12%, transparent);
  color: #16a34a;
}
.wb-cardset .wb-cardset-dos-donts-badge.wb-cardset-is-negative {
  background: color-mix(in srgb, #ef4444 12%, transparent);
  color: #ef4444;
}
.wb-cardset .wb-cardset-dos-donts-badge-icon {
  width: 19px;
  height: 19px;
}
.wb-cardset .wb-cardset-dos-donts-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--wb-cardset-accent, var(--wb-text));
}
.wb-cardset .wb-cardset-dos-donts-divider {
  height: 1px;
  width: 100%;
  background-color: color-mix(in srgb, var(--wb-border) 80%, transparent);
}
.wb-cardset .wb-cardset-dos-donts-body {
  padding: 24px 28px 28px 28px;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 16px;
}
.wb-cardset .wb-cardset-checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.wb-cardset .wb-cardset-checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--wb-text) 88%, transparent);
}
.wb-cardset .wb-cardset-checklist-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  flex-shrink: 0;
}
.wb-cardset .wb-cardset-checklist-icon-wrap.wb-cardset-is-positive {
  color: #16a34a;
}
.wb-cardset .wb-cardset-checklist-icon-wrap.wb-cardset-is-negative {
  color: #ef4444;
}
.wb-cardset .wb-cardset-checklist-icon {
  width: 16px;
  height: 16px;
}
.wb-cardset .wb-cardset-checklist-text {
  flex: 1 1 auto;
}

/* Whole-card link */
.wb-cardset.wb-cardset-clickable .wb-cardset-stretch::after { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: inherit; }
.wb-cardset.wb-cardset-clickable .wb-cardset-card { cursor: pointer; }
.wb-cardset.wb-cardset-clickable .wb-cardset-actions > :not(.wb-cardset-stretch) { position: relative; z-index: 2; }
.wb-cardset.wb-cardset-clickable .wb-cardset-card:has(.wb-cardset-stretch:focus-visible) { outline: 2px solid var(--wb-cardset-accent); outline-offset: 3px; }
.wb-cardset.wb-cardset-clickable .wb-cardset-stretch:focus-visible { outline: none; }

/* Hover effects: pointer devices only, mirrored on keyboard focus */
@media (hover: hover) and (pointer: fine) {
  .wb-cardset .wb-cardset-btn-filled:hover { background: color-mix(in srgb, var(--wb-cardset-accent) 86%, #000); border-color: color-mix(in srgb, var(--wb-cardset-accent) 86%, #000); }
  .wb-cardset .wb-cardset-btn-outline:hover { border-color: var(--wb-cardset-accent); color: var(--wb-cardset-accent); }
  .wb-cardset .wb-cardset-btn-soft:hover { background: color-mix(in srgb, var(--wb-cardset-accent) 20%, transparent); }
  .wb-cardset .wb-cardset-btn-ghost:hover { background: color-mix(in srgb, var(--wb-cardset-accent) 9%, transparent); }
  .wb-cardset .wb-cardset-btn-link:hover { text-decoration: underline; }
  .wb-cardset .wb-cardset-btn:hover .wb-cardset-btn-arrow { transform: translateX(3px); }
  .wb-cardset-v-image-overlay .wb-cardset-btn-outline:hover { color: var(--wb-cardset-on-media); border-color: var(--wb-cardset-on-media); background: rgb(255 255 255 / 0.12); }
  .wb-cardset-v-image-overlay .wb-cardset-btn-soft:hover { background: rgb(255 255 255 / 0.28); }
  .wb-cardset-v-image-overlay .wb-cardset-btn-ghost:hover { background: rgb(255 255 255 / 0.12); }
  .wb-cardset-v-minimal-accent .wb-cardset-card:hover::before { width: 100%; }
}
@media (hover: hover) and (pointer: fine) {
  .wb-cardset.wb-cardset-hover-lift .wb-cardset-card:hover { transform: translateY(-4px); }
  .wb-cardset.wb-cardset-hover-lift .wb-cardset-card:hover .wb-cardset-surface,
  .wb-cardset.wb-cardset-hover-lift .wb-cardset-card.wb-cardset-surface:hover { box-shadow: 0 20px 40px -16px rgb(0 0 0 / 0.24); }
  .wb-cardset.wb-cardset-hover-zoom .wb-cardset-card:hover .wb-cardset-img { transform: scale(1.06); }
  .wb-cardset.wb-cardset-hover-glow .wb-cardset-card:hover .wb-cardset-surface,
  .wb-cardset.wb-cardset-hover-glow .wb-cardset-card.wb-cardset-surface:hover {
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--wb-cardset-accent) 55%, transparent), 0 16px 40px -12px color-mix(in srgb, var(--wb-cardset-accent) 40%, transparent);
  }
}
.wb-cardset.wb-cardset-hover-lift .wb-cardset-card:focus-within { transform: translateY(-4px); }
.wb-cardset.wb-cardset-hover-zoom .wb-cardset-card:focus-within .wb-cardset-img { transform: scale(1.06); }

/* Touch: comfortable tap targets */
@media (pointer: coarse) {
  .wb-cardset .wb-cardset-btn:not(.wb-cardset-btn-link) { min-height: 44px; }
  .wb-cardset .wb-cardset-btn-link { min-height: 44px; }
}

/* Card-width adaptations (any column count) */
@container wb-cardset-card (max-width: 520px) {
  .wb-cardset-v-horizontal-split .wb-cardset-card,
  .wb-cardset-v-horizontal-split.wb-cardset-media-right .wb-cardset-card { grid-template-columns: minmax(0, 1fr); }
  .wb-cardset-v-horizontal-split.wb-cardset-media-right .wb-cardset-media { order: 0; }
  .wb-cardset-v-horizontal-split .wb-cardset-media { height: auto; min-height: 0; aspect-ratio: var(--wb-cardset-ar, 16 / 9); }
}
@container wb-cardset-card (max-width: 240px) {
  .wb-cardset .wb-cardset-actions { flex-direction: column; align-items: stretch; }
  .wb-cardset .wb-cardset-btn { width: 100%; padding-inline: 12px; }
  .wb-cardset .wb-cardset-desc { font-size: 14px; }
  .wb-cardset-v-image-overlay .wb-cardset-overlay-media { min-height: 280px; }
  .wb-cardset-v-floating-panel .wb-cardset-panel { margin-top: -32px; }
}

/* Tablet */
@container wb-site (max-width: 900px) {
  .wb-cardset .wb-cardset-grid { grid-template-columns: repeat(var(--wb-cols-tablet, 2), minmax(0, 1fr)); }
  .wb-cardset-v-floating-panel .wb-cardset-span { grid-column: 1 / -1; }
  .wb-cardset .wb-cardset-head { margin-bottom: 32px; }
}

/* Mobile */
@container wb-site (max-width: 600px) {
  .wb-cardset .wb-cardset-grid { grid-template-columns: repeat(var(--wb-cols-mobile, 1), minmax(0, 1fr)); gap: min(var(--wb-cardset-gap), 16px); }
  .wb-cardset .wb-cardset-head { margin-bottom: 24px; }
  .wb-cardset .wb-cardset-head-split { flex-direction: column; align-items: flex-start; gap: 12px; }
  .wb-cardset .wb-cardset-intro { font-size: 16px; }
  .wb-cardset .wb-cardset-bottom { margin-top: 28px; }
  .wb-cardset .wb-cardset-bottom .wb-btn { width: 100%; }

  .wb-cardset.wb-cardset-mobile-scroll .wb-cardset-grid {
    display: flex; gap: 14px;
    overflow-x: auto; overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory; scroll-padding-inline: 16px;
    margin-inline: -16px; padding: 4px 16px 14px;
    scrollbar-width: none;
  }
  .wb-cardset.wb-cardset-mobile-scroll .wb-cardset-grid::-webkit-scrollbar { display: none; }
  .wb-cardset.wb-cardset-mobile-scroll .wb-cardset-cell { flex: 0 0 min(82%, 340px); scroll-snap-align: start; }
  .wb-cardset.wb-cardset-mobile-scroll .wb-cardset-grid:focus-visible { outline: 2px solid var(--wb-primary); outline-offset: -2px; }
}

/* ---------------- Film Vault (Vintage Reels Recent Work / Portfolio Showcase) ---------------- */
.wb-section.wb-film-vault-wrap {
  padding: 40px 0 20px;
  background: #0A0A0A;
  color: #EDE7DA;
}
.wb-film-vault-container {
  display: flex;
  flex-direction: column;
}
.wb-vr-work-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.wb-vr-work-meta-left {
  font-family: var(--vr-mono, monospace);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #8E8A82;
  text-transform: uppercase;
}
.wb-vr-work-rec {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.wb-vr-rec-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #FF3333;
  box-shadow: 0 0 10px #FF3333;
  animation: wbRecPulse 1.5s infinite ease-in-out;
}
@keyframes wbRecPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}
.wb-vr-rec-text {
  font-family: var(--vr-mono, monospace);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #FF3333;
  text-transform: uppercase;
}
.wb-vr-work-title {
  display: flex;
  flex-direction: column;
  line-height: 0.81;
  margin: 0 0 20px;
}
.wb-vr-work-solid {
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", "Impact", sans-serif);
  font-size: clamp(68px, 12.5vw, 146px);
  font-weight: 900;
  color: #F3F1EA;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
.wb-vr-work-outline {
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", "Impact", sans-serif);
  font-size: clamp(68px, 12.5vw, 146px);
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.95);
  letter-spacing: 0.01em;
  text-transform: uppercase;
  margin-top: 0;
}
.wb-vr-work-subrow {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
}
.wb-vr-work-desc {
  max-width: 400px;
  font-family: var(--vr-mono, monospace);
  font-size: 13px;
  line-height: 1.6;
  color: #A8A29E;
  margin: 0;
}
.wb-vr-timecode {
  font-family: var(--vr-mono, monospace);
  font-size: clamp(30px, 4.2vw, 42px);
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #FF3333;
  text-shadow: 0 0 16px rgba(255, 51, 51, 0.45);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.wb-vr-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}
.wb-vr-filter-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #D9D3C7;
  font-family: var(--vr-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 7px 16px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.wb-vr-filter-btn:hover {
  border-color: #FFFFFF;
  color: #FFFFFF;
}
.wb-vr-filter-btn.wb-vr-filter-active {
  background: #FFFFFF;
  color: #0A0A0A;
  border-color: #FFFFFF;
  font-weight: 700;
}
.wb-filmstrip-outer {
  position: relative;
  background: #000000;
  padding: 18px 0;
  margin: 0 0 20px;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.wb-sprockets-strip {
  display: flex;
  gap: 16px;
  padding: 0 16px;
  overflow: hidden;
  user-select: none;
  pointer-events: none;
}
.wb-sprockets-top {
  margin-bottom: 12px;
}
.wb-sprockets-bottom {
  margin-top: 12px;
}
.wb-sprocket-hole {
  width: 14px;
  height: 16px;
  border-radius: 3px;
  background: #222222;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.14);
  flex-shrink: 0;
}
.wb-film-reel-track {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  padding: 0 20px;
}
.wb-film-reel-track::-webkit-scrollbar {
  display: none;
}
.wb-film-strip-card {
  position: relative;
  width: 380px;
  height: 240px;
  flex-shrink: 0;
  background: #000000;
  overflow: hidden;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.wb-film-strip-card:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.85);
}
.wb-film-card-image-wrap {
  position: absolute;
  inset: 0;
}
.wb-film-strip-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: sepia(0.18) contrast(1.05) saturate(0.95);
  transition: transform 0.5s ease;
}
.wb-film-strip-card:hover .wb-film-strip-img {
  transform: scale(1.05);
}
.wb-film-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, transparent 45%, rgba(0, 0, 0, 0.8) 100%);
}
.wb-film-tag-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #EDE7DA;
  font-family: var(--vr-mono, monospace);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 2px;
}
.wb-film-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  border: 1.5px solid rgba(255, 255, 255, 0.65);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
}
.wb-film-play-btn svg {
  width: 22px;
  height: 22px;
  margin-left: 2px;
}
.wb-film-strip-card:hover .wb-film-play-btn {
  background: #E6392F;
  border-color: #E6392F;
  transform: translate(-50%, -50%) scale(1.12);
  box-shadow: 0 0 20px rgba(230, 57, 47, 0.7);
}
.wb-film-title-label {
  position: absolute;
  bottom: 14px;
  left: 16px;
  z-index: 2;
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", "Impact", sans-serif);
  font-size: 24px;
  font-weight: 900;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
}
.wb-film-controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 36px;
}
.wb-film-counter {
  font-family: var(--vr-mono, monospace);
  font-size: 11px;
  font-weight: 700;
  color: #8E8A82;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.wb-film-arrows {
  display: flex;
  gap: 8px;
}
.wb-film-arrow-btn {
  width: 40px;
  height: 40px;
  background: #121212;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
}
.wb-film-arrow-btn:hover {
  background: #242424;
  border-color: #FFFFFF;
}

/* Modal preview */
.wb-film-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.wb-film-modal-content {
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  max-width: 840px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95);
  animation: wbFilmModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes wbFilmModalIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.wb-film-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.wb-film-modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.wb-film-modal-badge {
  font-family: var(--vr-mono, monospace);
  font-size: 10px;
  background: #E6392F;
  color: #FFFFFF;
  padding: 3px 8px;
  border-radius: 2px;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.wb-film-modal-title {
  margin: 0;
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", sans-serif);
  font-size: 22px;
  color: #FFFFFF;
  letter-spacing: 0.02em;
}
.wb-film-modal-close {
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}
.wb-film-modal-player {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
}
.wb-film-modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.1) brightness(0.9);
}
.wb-film-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.18) 0px, rgba(0, 0, 0, 0.18) 1px, transparent 1px, transparent 3px);
}
.wb-film-player-hud {
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  font-family: var(--vr-mono, monospace);
  font-size: 12px;
  color: #FF3333;
  text-shadow: 0 0 6px rgba(255, 51, 51, 0.8);
  font-weight: 700;
}
.wb-film-modal-desc {
  padding: 0;
  margin: 0;
  font-family: var(--vr-mono, monospace);
  font-size: 13px;
  line-height: 1.6;
  color: #C5BFB5;
  flex: 1 1 240px;
}
.wb-film-modal-video-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
}
.wb-film-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  gap: 16px;
  flex-wrap: wrap;
}
.wb-film-modal-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #E6392F;
  color: #FFFFFF !important;
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", sans-serif);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 2px;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
  flex-shrink: 0;
}
.wb-film-modal-cta:hover {
  background: #FF4D3D;
  transform: translateY(-1px);
}

/* ---------------- Polaroid Grid (Vintage Reels Why Choose Us / Featured Frames) ---------------- */
.wb-section.wb-polaroids-section { padding: 80px 0 86px; background: #151310; color: #FAF5EE; }
.wb-scalloped-top {
  display: block;
  height: 14px;
  margin-top: -80px;
  margin-bottom: 66px;
  background-image: radial-gradient(circle at 10px 0, transparent 9px, #151310 9.5px);
  background-size: 20px 14px;
  background-repeat: repeat-x;
}
.wb-site .wb-polaroids-heading {
  margin: 0;
  font-family: var(--vr-serif, Georgia, serif);
  font-size: 52px;
  line-height: 1.1;
  font-weight: 300;
  letter-spacing: -0.025em;
  color: #FAF5EE;
  text-align: center;
}
.wb-polaroids-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; margin-top: 32px; }
.wb-polaroid-grid-card {
  margin: 0;
  padding: 10px 10px 18px;
  background: #FFFFFF;
  color: #1D1910;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s ease;
}
.wb-polaroid-grid-card:hover { transform: translateY(-4px); }
.wb-polaroid-grid-img-wrap { overflow: hidden; aspect-ratio: 1 / 1; background: #231C18; }
.wb-polaroid-grid-img-wrap img { display: block; width: 100%; height: 100%; object-fit: cover; }
.wb-site .wb-polaroid-grid-title {
  margin: 10px 0 0;
  font-family: var(--vr-serif, Georgia, serif);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  color: #1D1910;
}
.wb-polaroid-grid-desc { margin: 6px 0 0; font-family: var(--wb-font-body); font-size: 11px; line-height: 16px; color: #554D42; }
@container wb-site (max-width: 900px) {
  .wb-polaroids-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .wb-polaroids-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container wb-site (max-width: 500px) {
  .wb-polaroids-grid { grid-template-columns: 1fr; }
}
@media (max-width: 500px) {
  .wb-polaroids-grid { grid-template-columns: 1fr; }
}
`;
