export const SHOP_CSS = `
.wb-shop { display: flex; flex-direction: column; gap: 28px; }
.wb-shop-head { display: flex; flex-direction: column; gap: 8px; max-width: 720px; }
.wb-shop-eyebrow {
  font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wb-primary);
}
.wb-shop-title { margin: 0; font-family: var(--wb-font-heading); font-size: clamp(1.8rem, 3vw, 2.5rem); line-height: 1.15; letter-spacing: -0.02em; }
.wb-shop-subtitle { margin: 0; color: var(--wb-muted); max-width: 62ch; }
.wb-shop-tools { display: flex; flex-direction: column; gap: 12px; }
.wb-shop-tool-label {
  display: block; margin-bottom: 6px; font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.07em; text-transform: uppercase; color: var(--wb-muted);
}
.wb-shop-search-wrap { display: block; }
.wb-shop-search-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.wb-shop-search {
  width: min(100%, 420px); border: 1px solid var(--wb-border); background: var(--wb-bg); color: var(--wb-text);
  border-radius: 999px; padding: 0.7rem 1rem; font: inherit;
}
.wb-shop-search-go {
  height: 42px; padding: 0 16px; border: 0; border-radius: 999px; background: var(--wb-text); color: var(--wb-bg);
  font: inherit; font-size: 0.9rem; cursor: pointer;
}
.wb-shop-sort-wrap { display: block; }
.wb-shop-sort, .wb-shop-per {
  min-width: 190px; border: 1px solid var(--wb-border); background: var(--wb-bg); color: var(--wb-text);
  border-radius: 10px; padding: 0.65rem 2rem 0.65rem 0.8rem; font: inherit;
}
.wb-shop-per { min-width: 88px; }
.wb-shop-per-wrap { display: flex; align-items: center; gap: 8px; }
.wb-shop-per-wrap .wb-shop-tool-label { margin: 0; }
.wb-shop-result-bar { display: flex; justify-content: flex-end; margin-bottom: 10px; font-size: 0.82rem; color: var(--wb-muted); }
.wb-shop-pager { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 22px; }
.wb-shop-result-count { margin-right: auto; font-size: 0.82rem; color: var(--wb-muted); }
.wb-shop-pages { display: flex; flex-wrap: wrap; gap: 6px; }
.wb-shop-page {
  min-width: 36px; height: 36px; padding: 0 12px; border: 1px solid var(--wb-border); border-radius: 8px;
  background: var(--wb-bg); color: var(--wb-text); display: inline-flex; align-items: center; justify-content: center;
  text-decoration: none; font: inherit; font-size: 0.88rem; cursor: pointer;
}
.wb-shop-page.is-active { background: var(--wb-text); color: var(--wb-bg); border-color: var(--wb-text); }
.wb-shop-page[aria-disabled="true"], .wb-shop-page:disabled { opacity: 0.4; pointer-events: none; cursor: default; }
.wb-shop-search:focus { outline: 2px solid color-mix(in srgb, var(--wb-primary) 40%, transparent); outline-offset: 1px; }
.wb-shop-filters { display: flex; flex-wrap: wrap; gap: 8px; }
.wb-shop-filter {
  border: 1px solid var(--wb-border); background: transparent; color: var(--wb-text); text-decoration: none;
  border-radius: 999px; padding: 0.35rem 0.85rem; font: inherit; font-size: 0.875rem; cursor: pointer;
}
.wb-shop-filter.is-active { background: var(--wb-text); color: var(--wb-bg); border-color: var(--wb-text); }
.wb-shop-filters:not(.is-expanded) .wb-shop-filter.is-extra:not(.is-active) { display: none; }
.wb-shop-more {
  align-self: flex-start; border: 0; background: transparent; color: var(--wb-primary);
  padding: 0.35rem 0.15rem; font: inherit; font-size: 0.82rem; font-weight: 700; cursor: pointer;
}
.wb-shop-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.wb-shop-grid.is-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.wb-shop-card {
  display: flex; flex-direction: column; min-width: 0; overflow: hidden;
  border: 1px solid var(--wb-border); border-radius: 16px; background: var(--wb-surface, var(--wb-bg));
  color: inherit;
}
.wb-shop-card:hover { border-color: color-mix(in srgb, var(--wb-text) 28%, transparent); }
.wb-shop-card-link {
  display: flex; flex-direction: column; min-width: 0; flex: 1;
  color: inherit; text-decoration: none;
}
.wb-shop-media { aspect-ratio: 1; background: color-mix(in srgb, var(--wb-text) 6%, transparent); overflow: hidden; }
.wb-shop-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wb-shop-fallback {
  width: 100%; height: 100%; display: grid; place-items: center;
  font-family: var(--wb-font-heading); font-size: 2rem; color: var(--wb-muted);
}
.wb-shop-body { display: flex; flex-direction: column; gap: 4px; padding: 14px 16px 12px; }
.wb-shop-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.wb-shop-link { font-size: 0.78rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wb-muted); }
.wb-shop-category { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--wb-primary); }
.wb-shop-name { margin: 0; font-size: 1.05rem; line-height: 1.3; }
.wb-shop-variant { margin: 0; color: var(--wb-muted); }
.wb-shop-price { font-weight: 700; }
.wb-shop-actions { display: flex; flex-direction: column; gap: 6px; padding: 0 14px 14px; }
.wb-shop-actions.is-compact { padding-top: 0; }
.wb-shop-action-row { display: flex; gap: 8px; }
.wb-shop-btn {
  flex: 1; margin: 0; padding: 0.55rem 0.7rem; border-radius: 10px; border: 1px solid var(--wb-border);
  font: inherit; font-size: 0.82rem; font-weight: 700; cursor: pointer; line-height: 1.2;
  transition: background .15s ease, border-color .15s ease, color .15s ease, opacity .15s ease;
}
.wb-shop-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.wb-shop-btn.is-cart {
  background: transparent; color: var(--wb-text);
  border-color: color-mix(in srgb, var(--wb-text) 22%, transparent);
}
.wb-shop-btn.is-cart:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--wb-text) 40%, transparent);
  background: color-mix(in srgb, var(--wb-text) 4%, transparent);
}
.wb-shop-btn.is-buy {
  background: var(--wb-primary); color: var(--wb-on-primary, #fff); border-color: transparent;
}
.wb-shop-btn.is-buy:hover:not(:disabled) {
  filter: brightness(1.05);
}
.wb-shop-cart-msg {
  margin: 0; font-size: 0.78rem; line-height: 1.4; color: var(--wb-muted);
}
.wb-shop-cart-msg.is-ok { color: #15803d; }
.wb-shop-cart-msg.is-error { color: #b91c1c; }
.wb-shop-cart-msg.is-login { color: var(--wb-text); }
.wb-shop-cart-msg a { color: var(--wb-primary); font-weight: 700; }
.wb-cart-login-modal, .wb-cart-qty-modal {
  position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center;
  padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  box-sizing: border-box; overflow: auto; -webkit-overflow-scrolling: touch;
}
.wb-cart-login-modal[hidden], .wb-cart-qty-modal[hidden] { display: none; }
.wb-shop-actions .wb-cart-login-modal,
.wb-shop-actions .wb-cart-qty-modal { display: none; }
.wb-cart-qty-panel {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  margin: 4px 0 2px; padding: 14px 12px; border-radius: 14px; width: 100%; box-sizing: border-box;
  background: color-mix(in srgb, var(--wb-text) 4%, var(--wb-bg));
  border: 1px solid color-mix(in srgb, var(--wb-text) 8%, transparent);
}
.wb-cart-qty-row {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; max-width: 220px;
}
.wb-cart-qty-step {
  flex: none; width: 42px; height: 42px; margin: 0; border-radius: 12px; border: 1px solid var(--wb-border);
  background: var(--wb-bg); color: var(--wb-text); font: inherit; font-size: 1.25rem; font-weight: 700; cursor: pointer;
  touch-action: manipulation;
}
.wb-cart-qty-step:hover:not(:disabled) { border-color: color-mix(in srgb, var(--wb-text) 35%, transparent); }
.wb-cart-qty-step:disabled { opacity: 0.4; cursor: not-allowed; }
.wb-cart-qty-input {
  flex: 1 1 auto; min-width: 0; width: 78px; max-width: 96px; height: 48px;
  border: 1px solid color-mix(in srgb, var(--wb-text) 18%, transparent); border-radius: 12px;
  text-align: center; font: inherit; font-size: 1.35rem; font-weight: 750; color: var(--wb-text); background: var(--wb-bg);
  box-sizing: border-box;
}
.wb-cart-qty-input:focus { outline: 2px solid color-mix(in srgb, var(--wb-primary) 35%, transparent); outline-offset: 1px; }
.wb-cart-qty-stock {
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wb-muted);
}
.wb-cart-login-backdrop {
  position: absolute; inset: 0; margin: 0; border: 0;
  background: color-mix(in srgb, #000 55%, transparent); cursor: pointer;
}
.wb-cart-login-dialog {
  position: relative; z-index: 1; width: min(100%, 360px); max-width: 100%;
  max-height: min(88vh, 640px); overflow: auto; box-sizing: border-box;
  display: flex; flex-direction: column; gap: 10px;
  padding: 18px 16px 14px;
  border: 1px solid color-mix(in srgb, var(--wb-text) 12%, transparent);
  border-radius: 12px;
  background: var(--wb-bg);
  box-shadow: 0 18px 36px color-mix(in srgb, #000 30%, transparent);
}
.wb-cart-login-dialog.is-qty {
  width: min(100%, 400px); gap: 12px; padding: 22px 20px 18px; border-radius: 18px;
  box-shadow: 0 24px 48px color-mix(in srgb, #000 34%, transparent);
}
.wb-cart-login-close {
  position: absolute; top: 10px; right: 10px;
  width: 36px; height: 36px; border: 0; border-radius: 999px;
  background: color-mix(in srgb, var(--wb-text) 8%, transparent);
  color: var(--wb-text); cursor: pointer; font-size: 1.1rem; line-height: 1;
  touch-action: manipulation;
}
.wb-cart-login-kicker {
  margin: 0; padding-right: 36px; font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--wb-primary);
}
.wb-cart-login-title { margin: 0; padding-right: 36px; font-size: 1rem; font-weight: 700; overflow-wrap: anywhere; }
.wb-cart-login-dialog.is-qty .wb-cart-login-title { font-size: 1.25rem; letter-spacing: -0.02em; }
.wb-cart-login-text { margin: 0; color: var(--wb-muted); line-height: 1.4; font-size: 0.9rem; overflow-wrap: anywhere; }
.wb-cart-login-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
.wb-cart-login-actions.is-stacked { flex-direction: column; flex-wrap: nowrap; gap: 8px; margin-top: 8px; }
.wb-cart-login-actions .wb-shop-btn {
  text-decoration: none; display: inline-flex; justify-content: center; align-items: center;
  padding: 0.52rem 0.72rem; font-size: 0.8rem; border-radius: 8px; min-height: 42px;
  box-sizing: border-box; touch-action: manipulation;
}
.wb-cart-login-actions.is-stacked .wb-shop-btn {
  width: 100%; padding: 0.78rem 1rem; font-size: 0.92rem; border-radius: 12px; min-height: 48px;
}
.wb-cart-login-modal[data-variant="minimal"] .wb-cart-login-dialog {
  width: min(100%, 380px); border-radius: 10px; box-shadow: 0 14px 34px color-mix(in srgb, #000 30%, transparent);
}
.wb-cart-login-modal[data-variant="minimal"] .wb-cart-login-title { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.06em; }
.wb-cart-login-modal[data-variant="minimal"] .wb-cart-login-actions .wb-shop-btn { border-radius: 8px; }
.wb-cart-login-modal[data-variant="glass"] .wb-cart-login-dialog {
  border-color: color-mix(in srgb, #fff 30%, transparent);
  background: color-mix(in srgb, var(--wb-bg) 72%, transparent);
  backdrop-filter: blur(10px);
}
.wb-cart-login-modal[data-variant="split"] .wb-cart-login-dialog {
  width: min(100%, 520px);
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  column-gap: 16px;
  align-items: center;
}
.wb-cart-login-modal[data-variant="split"] .wb-cart-login-dialog::before {
  content: "Cart";
  display: grid;
  place-items: center;
  align-self: stretch;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--wb-on-primary, #fff);
  background: linear-gradient(150deg, var(--wb-primary), color-mix(in srgb, var(--wb-primary) 45%, #000));
}
.wb-cart-login-modal[data-variant="split"] .wb-cart-login-close { right: 12px; top: 12px; }
.wb-cart-login-modal[data-variant="split"] .wb-cart-login-title,
.wb-cart-login-modal[data-variant="split"] .wb-cart-login-text,
.wb-cart-login-modal[data-variant="split"] .wb-cart-login-actions {
  grid-column: 2;
}
/* Modals render on body, so use viewport media — not .wb-site container queries. */
@media (max-width: 640px) {
  .wb-cart-login-modal, .wb-cart-qty-modal {
    place-items: end center;
    padding: 0;
  }
  .wb-cart-login-dialog,
  .wb-cart-login-dialog.is-qty,
  .wb-cart-login-modal[data-variant="minimal"] .wb-cart-login-dialog,
  .wb-cart-login-modal[data-variant="split"] .wb-cart-login-dialog {
    width: 100%; max-width: 100%; max-height: min(92vh, 720px);
    margin: 0; border-radius: 18px 18px 0 0; border-left: 0; border-right: 0; border-bottom: 0;
    padding: 20px 16px calc(16px + env(safe-area-inset-bottom));
  }
  .wb-cart-login-dialog.is-qty { padding-top: 22px; }
  .wb-cart-login-modal[data-variant="split"] .wb-cart-login-dialog {
    display: flex; flex-direction: column; gap: 10px;
  }
  .wb-cart-login-modal[data-variant="split"] .wb-cart-login-dialog::before {
    min-height: 64px; border-radius: 12px; font-size: 1.1rem;
  }
  .wb-cart-login-modal[data-variant="split"] .wb-cart-login-title,
  .wb-cart-login-modal[data-variant="split"] .wb-cart-login-text,
  .wb-cart-login-modal[data-variant="split"] .wb-cart-login-actions,
  .wb-cart-login-modal[data-variant="split"] .wb-cart-login-kicker {
    grid-column: auto;
  }
  .wb-cart-login-actions:not(.is-stacked) { flex-direction: column; }
  .wb-cart-login-actions:not(.is-stacked) .wb-shop-btn { width: 100%; }
  .wb-cart-qty-step { width: 46px; height: 46px; }
  .wb-cart-qty-input { height: 52px; font-size: 1.4rem; }
}
@media (max-width: 380px) {
  .wb-cart-login-dialog.is-qty .wb-cart-login-title { font-size: 1.1rem; }
  .wb-cart-login-actions.is-stacked .wb-shop-btn { font-size: 0.88rem; padding: 0.7rem 0.85rem; }
}
.wb-shop-empty { margin: 0; color: var(--wb-muted); }
.wb-shop-note { margin: 0; font-size: 0.8rem; color: var(--wb-muted); }
.wb-shop-detail { gap: 22px; }
.wb-product { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: clamp(28px, 4vw, 56px); align-items: start; }
.wb-product-back {
  display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
  color: var(--wb-muted); font-size: 0.88rem; font-weight: 600; text-decoration: none;
}
.wb-product-back::before { content: "\\2190"; }
.wb-product-back:hover { color: var(--wb-text); }
.wb-product-gallery { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.wb-product-hero {
  position: relative; aspect-ratio: 1; border-radius: 18px; overflow: hidden; padding: 8%;
  background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-bg)); touch-action: pan-y; cursor: grab;
}
.wb-product-nav {
  position: absolute; top: 50%; z-index: 2; display: grid; place-items: center;
  width: 40px; height: 40px; margin: 0; padding: 0; border: 0; border-radius: 50%;
  transform: translateY(-50%); cursor: pointer; color: var(--wb-text);
  background: color-mix(in srgb, var(--wb-bg) 90%, transparent);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--wb-text) 16%, transparent);
}
.wb-product-nav[hidden] { display: none; }
.wb-product-nav svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.wb-product-nav.is-prev { left: 12px; }
.wb-product-nav.is-next { right: 12px; }
.wb-product-nav:hover { background: var(--wb-bg); }
.wb-product-hero img, .wb-product-thumb img { width: 100%; height: 100%; object-fit: contain; display: block; }
.wb-product-thumbs { display: flex; flex-wrap: wrap; gap: 10px; }
.wb-product-thumbs[hidden] { display: none; }
.wb-product-thumb {
  width: 76px; height: 76px; border-radius: 12px; overflow: hidden; padding: 8px; cursor: pointer;
  border: 1px solid transparent; background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-bg));
  transition: border-color .15s ease;
}
.wb-product-thumb:hover { border-color: color-mix(in srgb, var(--wb-text) 25%, transparent); }
.wb-product-thumb.is-active { border-color: var(--wb-text); }
.wb-product-heading { display: flex; flex-direction: column; gap: 8px; }
.wb-product-heading .wb-shop-title { font-size: clamp(1.9rem, 3vw, 2.6rem); }
.wb-product-copy { display: flex; flex-direction: column; gap: 22px; min-width: 0; }
.wb-product-buy { display: flex; flex-direction: column; align-items: stretch; gap: 14px; }
.wb-product-buy-meta { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 14px; }
.wb-product-buy .wb-shop-actions { padding: 0; }
.wb-product-buy .wb-shop-btn { padding: 0.75rem 1rem; font-size: 0.92rem; border-radius: 12px; }
.wb-product-options { display: flex; flex-direction: column; gap: 18px; }
.wb-product-desc { margin: 0; color: var(--wb-muted); line-height: 1.7; white-space: pre-wrap; }
.wb-product-details { display: flex; flex-direction: column; gap: 10px; }
.wb-product-details-title {
  margin: 0; font-family: var(--wb-font-body); font-size: 0.75rem !important; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--wb-text);
}
.wb-product-price { margin: 0; font-size: 1.6rem; font-weight: 700; letter-spacing: -0.02em; }
.wb-product-stock {
  display: inline-flex; align-items: center; gap: 6px; margin: 0; font-size: 0.85rem; font-weight: 600; color: #15803d;
}
.wb-product-stock::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.wb-product-stock.is-out { color: #b91c1c; }
.wb-option { display: flex; flex-direction: column; gap: 10px; }
.wb-option-name { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wb-muted); }
.wb-option-values { display: flex; flex-wrap: wrap; gap: 8px; }
.wb-option-value {
  border: 1px solid color-mix(in srgb, var(--wb-text) 16%, transparent); background: var(--wb-bg); color: inherit;
  border-radius: 10px; min-width: 3rem; padding: 0.55rem 1rem; font: inherit; font-size: 0.92rem; cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
}
.wb-option-value:hover { border-color: var(--wb-text); }
.wb-option-value.is-active { background: var(--wb-text); color: var(--wb-bg); border-color: var(--wb-text); }
.wb-option-value.is-out:not(.is-active) { color: var(--wb-muted); text-decoration: line-through; }

/* Product list templates */
.wb-shop-list.is-classic-grid .wb-shop-grid,
.wb-shop-list.is-classic-grid .wb-shop-grid.is-2 {
  grid-template-columns: repeat(auto-fill, minmax(180px, 220px));
  justify-content: flex-start;
  gap: 16px;
}
.wb-shop-list.is-classic-grid .wb-shop-card {
  border-radius: 14px;
  box-shadow: 0 10px 24px color-mix(in srgb, var(--wb-text) 7%, transparent);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.wb-shop-list.is-classic-grid .wb-shop-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 30px color-mix(in srgb, var(--wb-text) 10%, transparent);
}
.wb-shop-list.is-classic-grid .wb-shop-card .wb-shop-media { aspect-ratio: 1 / 0.92; }
.wb-shop-list.is-classic-grid .wb-shop-card .wb-shop-body { gap: 6px; padding: 15px 16px 12px; }
.wb-shop-list.is-classic-grid .wb-shop-card .wb-shop-name { font-size: 1.06rem; }
.wb-shop-list.is-classic-grid .wb-shop-card .wb-shop-actions { border-top: 1px solid color-mix(in srgb, var(--wb-text) 8%, transparent); padding-top: 10px; }

.wb-shop-list { width: 100%; padding-inline: clamp(16px, 2vw, 28px); }
.wb-section.wb-shop-bleed { padding: 0; flex: 1 1 auto; display: flex; flex-direction: column; min-height: calc(100vh - 72px); }
.wb-section.wb-shop-bleed > .wb-container-full { flex: 1 1 auto; display: flex; flex-direction: column; min-height: inherit; }
.wb-shop-list.is-editorial {
  flex: 1 1 auto; gap: 0; max-width: none; width: 100%; padding: 0;
  min-height: calc(100vh - 72px);
}
.wb-shop-list.is-editorial .wb-shop-catalog-shell {
  display: grid; grid-template-columns: 260px minmax(0, 1fr); width: 100%; min-height: inherit; flex: 1 1 auto; align-items: start;
}
.wb-shop-list.is-editorial .wb-shop-sidebar {
  position: sticky; top: 72px; left: 0; height: calc(100vh - 72px); max-height: calc(100vh - 72px); z-index: 30;
  overflow: auto; padding: 28px 20px 32px;
  border: 0; border-right: 1px solid var(--wb-border); border-radius: 0;
  background: var(--wb-bg); box-shadow: none;
}
.wb-shop-list.is-editorial .wb-shop-results {
  min-height: calc(100vh - 72px); padding: 22px 28px 48px;
  background: color-mix(in srgb, var(--wb-text) 4%, var(--wb-bg));
}
.wb-shop-list.is-editorial .wb-shop-head { max-width: none; margin-bottom: 22px; gap: 6px; }
.wb-shop-list.is-editorial .wb-shop-title { font-size: 1.35rem; font-weight: 650; line-height: 1.15; letter-spacing: -0.03em; }
.wb-shop-list.is-editorial .wb-shop-subtitle { font-size: 0.84rem; line-height: 1.5; }
.wb-shop-list.is-editorial .wb-shop-tools { gap: 18px; }
.wb-shop-list.is-editorial .wb-shop-search { width: 100%; border-radius: 8px; padding: 0.55rem 0.75rem; }
.wb-shop-list.is-editorial .wb-shop-filters { flex-direction: column; align-items: stretch; gap: 2px; }
.wb-shop-list.is-editorial .wb-shop-filter {
  border: 0; border-radius: 8px; padding: 0.45rem 0.65rem; text-align: left; font-size: 0.9rem;
}
.wb-shop-list.is-editorial .wb-shop-filter.is-active { background: var(--wb-text); color: var(--wb-bg); }
.wb-shop-list.is-editorial .wb-shop-more { padding: 0.45rem 0.65rem; }
.wb-shop-list.is-editorial .wb-shop-sort { width: 100%; border-radius: 8px; }
.wb-shop-list.is-editorial .wb-shop-result-bar {
  justify-content: flex-start; margin: 0 0 16px; padding-bottom: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--wb-text) 10%, transparent);
  font-size: 0.8rem; letter-spacing: 0.04em; text-transform: uppercase;
}
.wb-shop-list.is-editorial .wb-shop-grid,
.wb-shop-list.is-editorial .wb-shop-grid.is-2 {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px;
}
.wb-shop-list.is-editorial .wb-shop-card-editorial {
  border-radius: 12px;
  border-color: color-mix(in srgb, var(--wb-text) 10%, transparent);
  background: var(--wb-bg);
  box-shadow: 0 8px 18px color-mix(in srgb, var(--wb-text) 6%, transparent);
  transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease;
}
.wb-shop-list.is-editorial .wb-shop-card-editorial:hover {
  border-color: color-mix(in srgb, var(--wb-text) 35%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 16px 24px color-mix(in srgb, var(--wb-text) 10%, transparent);
}
.wb-shop-list.is-editorial .wb-shop-card-editorial .wb-shop-media { aspect-ratio: 1; }
.wb-shop-list.is-editorial .wb-shop-card-editorial .wb-shop-body { gap: 2px; padding: 10px 12px 8px; }
.wb-shop-list.is-editorial .wb-shop-card-editorial .wb-shop-actions { padding: 0 10px 10px; }
.wb-shop-list.is-editorial .wb-shop-card-editorial .wb-shop-btn { padding: 0.45rem 0.5rem; font-size: 0.75rem; border-radius: 8px; }
.wb-shop-list.is-editorial .wb-shop-card-editorial .wb-shop-name { font-size: 0.92rem; font-weight: 650; }
.wb-shop-list.is-editorial .wb-shop-card-editorial .wb-shop-variant { font-size: 0.78rem; }
.wb-shop-list.is-editorial .wb-shop-card-editorial .wb-shop-price { font-size: 0.9rem; margin-top: 4px; }

.wb-shop-list.is-compact { gap: 20px; }
.wb-shop-list.is-compact .wb-shop-head { display: grid; grid-template-columns: 1fr 1fr; align-items: end; max-width: none; }
.wb-shop-list.is-compact .wb-shop-subtitle { justify-self: end; text-align: right; }
.wb-shop-list.is-compact .wb-shop-grid,
.wb-shop-list.is-compact .wb-shop-grid.is-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.wb-shop-list.is-compact .wb-shop-card {
  display: grid; grid-template-columns: 148px minmax(0, 1fr); grid-template-rows: 1fr auto; min-height: 148px; border-radius: 12px;
  box-shadow: 0 12px 26px color-mix(in srgb, var(--wb-text) 8%, transparent);
}
.wb-shop-list.is-compact .wb-shop-card-link { display: contents; }
.wb-shop-list.is-compact .wb-shop-media { grid-row: 1 / -1; aspect-ratio: auto; height: 100%; min-height: 148px; background: color-mix(in srgb, var(--wb-text) 8%, transparent); }
.wb-shop-list.is-compact .wb-shop-body { justify-content: center; gap: 5px; padding: 14px 16px 8px; }
.wb-shop-list.is-compact .wb-shop-actions { grid-column: 2; padding: 0 16px 14px; }
.wb-shop-list.is-compact .wb-shop-name { font-size: 1rem; }
.wb-shop-list.is-compact .wb-shop-category { font-size: 0.65rem; }

.wb-shop-list.is-showcase { max-width: none; }
.wb-shop-list.is-classic-grid .wb-shop-grid,
.wb-shop-list.is-classic-grid .wb-shop-grid.is-2 { grid-template-columns: repeat(auto-fill, minmax(180px, 220px)); }
.wb-shop-list.is-showcase .wb-shop-head { max-width: 980px; }
.wb-shop-list.is-showcase .wb-shop-title { font-size: clamp(2.4rem, 5vw, 4rem); line-height: 1.05; }
.wb-shop-list.is-showcase .wb-shop-tools {
  display: grid; grid-template-columns: minmax(230px, 1fr) minmax(0, 1.5fr) auto;
  align-items: end; gap: 14px; padding: 18px; border: 1px solid var(--wb-border);
  border-radius: 16px; background: var(--wb-surface, var(--wb-bg)); box-shadow: 0 16px 36px color-mix(in srgb, var(--wb-text) 8%, transparent);
}
.wb-shop-list.is-showcase .wb-shop-search { width: 100%; border-radius: 10px; }
.wb-shop-list.is-showcase .wb-shop-filters { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px; }
.wb-shop-list.is-showcase .wb-shop-grid,
.wb-shop-list.is-showcase .wb-shop-grid.is-2 { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 22px; }
.wb-shop-list.is-showcase .wb-shop-card-showcase {
  display: flex;
  flex-direction: column;
  border: 1px solid color-mix(in srgb, var(--wb-text) 10%, transparent);
  border-radius: 18px;
  background: var(--wb-bg);
  overflow: hidden;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.wb-shop-list.is-showcase .wb-shop-card-showcase:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--wb-text) 18%, transparent);
  box-shadow: 0 16px 36px color-mix(in srgb, var(--wb-text) 12%, transparent);
}
.wb-shop-list.is-showcase .wb-shop-card-showcase .wb-shop-media {
  aspect-ratio: 1.02;
  padding: 13%;
  background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-bg));
}
.wb-shop-list.is-showcase .wb-shop-card-showcase .wb-shop-media img {
  object-fit: contain;
  transition: transform .3s ease;
}
.wb-shop-list.is-showcase .wb-shop-card-showcase:hover .wb-shop-media img { transform: scale(1.05); }
.wb-shop-list.is-showcase .wb-shop-card-showcase .wb-shop-body {
  gap: 3px;
  padding: 16px 17px 9px;
  border-top: 1px solid color-mix(in srgb, var(--wb-text) 7%, transparent);
}
.wb-shop-list.is-showcase .wb-shop-card-showcase .wb-shop-actions { padding: 0 17px 16px; }
.wb-shop-list.is-showcase .wb-shop-card-showcase .wb-shop-category { font-size: 0.68rem; color: var(--wb-muted); }
.wb-shop-list.is-showcase .wb-shop-card-showcase .wb-shop-variant { font-size: 0.85rem; color: var(--wb-muted); }
.wb-shop-list.is-showcase .wb-shop-card-showcase .wb-shop-name {
  font-family: var(--wb-font-heading);
  font-size: 1.02rem;
  font-weight: 650;
}
.wb-shop-list.is-showcase .wb-shop-card-showcase .wb-shop-price {
  margin-top: 8px;
  font-size: 1rem;
  color: var(--wb-text);
}

/* Product detail templates */
/* Split: gallery left, sticky purchase column right */
.wb-shop-detail.is-split .wb-product-copy { position: sticky; top: 96px; }
.wb-shop-detail.is-split .wb-product-buy,
.wb-shop-detail.is-split .wb-product-options,
.wb-shop-detail.is-split .wb-product-details { padding-top: 20px; border-top: 1px solid color-mix(in srgb, var(--wb-text) 10%, transparent); }

/* Thumbnail rail: thumbs | large photo | purchase card */
.wb-shop-detail.is-gallery-focus .wb-product { grid-template-columns: minmax(0, 1fr) 360px; gap: 32px; }
.wb-shop-detail.is-gallery-focus .wb-product-gallery { display: grid; grid-template-columns: 84px minmax(0, 1fr); align-items: start; gap: 16px; }
.wb-shop-detail.is-gallery-focus .wb-product-gallery:has(.wb-product-thumbs[hidden]) { grid-template-columns: minmax(0, 1fr); }
.wb-shop-detail.is-gallery-focus .wb-product-hero { grid-column: -2; grid-row: 1; aspect-ratio: 4 / 3; padding: 6%; border-radius: 22px; }
.wb-shop-detail.is-gallery-focus .wb-product-thumbs { grid-column: 1; grid-row: 1; flex-direction: column; flex-wrap: nowrap; }
.wb-shop-detail.is-gallery-focus .wb-product-thumb { width: 84px; height: 84px; }
.wb-shop-detail.is-gallery-focus .wb-product-panel {
  position: sticky; top: 96px; display: flex; flex-direction: column; gap: 22px; padding: 28px;
  border: 1px solid color-mix(in srgb, var(--wb-text) 10%, transparent); border-radius: 22px;
  background: var(--wb-bg); box-shadow: 0 18px 40px color-mix(in srgb, var(--wb-text) 8%, transparent);
}
.wb-shop-detail.is-gallery-focus .wb-product-panel .wb-shop-title { font-size: 1.75rem; }
.wb-shop-detail.is-gallery-focus .wb-product-panel .wb-product-buy {
  padding: 14px 16px; border-radius: 14px;
  background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-bg));
}
.wb-shop-detail.is-gallery-focus .wb-product-panel .wb-product-buy-meta { justify-content: space-between; width: 100%; }
.wb-shop-detail.is-gallery-focus .wb-product-details {
  grid-column: 1 / -1; max-width: 760px; padding-top: 28px;
  border-top: 1px solid color-mix(in srgb, var(--wb-text) 10%, transparent);
}

/* Centered showcase: centred title, wide photo, options and description in cards */
.wb-shop-detail.is-editorial .wb-product-back { align-self: center; }
.wb-shop-detail.is-editorial .wb-product { display: flex; flex-direction: column; align-items: stretch; gap: 32px; }
.wb-shop-detail.is-editorial .wb-product-intro { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
.wb-shop-detail.is-editorial .wb-product-heading { align-items: center; }
.wb-shop-detail.is-editorial .wb-product-heading .wb-shop-title { font-size: clamp(2.6rem, 6vw, 4.8rem); line-height: 1; letter-spacing: -0.04em; }
.wb-shop-detail.is-editorial .wb-product-buy { align-items: center; }
.wb-shop-detail.is-editorial .wb-product-buy-meta { justify-content: center; }
.wb-shop-detail.is-editorial .wb-product-buy .wb-shop-actions { width: min(100%, 360px); }
.wb-shop-detail.is-editorial .wb-product-gallery { align-items: center; }
.wb-shop-detail.is-editorial .wb-product-hero { width: 100%; aspect-ratio: 16 / 8; padding: 4%; border-radius: 28px; }
.wb-shop-detail.is-editorial .wb-product-thumbs { justify-content: center; }
.wb-shop-detail.is-editorial .wb-product-thumb { border-radius: 50%; width: 64px; height: 64px; }
.wb-shop-detail.is-editorial .wb-product-band { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.wb-shop-detail.is-editorial .wb-product-band-card {
  display: flex; flex-direction: column; gap: 14px; padding: 28px; border-radius: 22px;
  background: color-mix(in srgb, var(--wb-text) 4%, var(--wb-bg));
}
.wb-shop-detail.is-editorial .wb-option-value { border-radius: 999px; }

/* Quick view: one compact card */
.wb-shop-detail.is-compact { max-width: 940px; margin-inline: auto; width: 100%; }
.wb-shop-detail.is-compact .wb-product {
  grid-template-columns: 340px minmax(0, 1fr); gap: 0; overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--wb-text) 10%, transparent); border-radius: 22px;
  background: var(--wb-bg); box-shadow: 0 22px 50px color-mix(in srgb, var(--wb-text) 9%, transparent);
}
.wb-shop-detail.is-compact .wb-product-gallery { height: 100%; padding: 22px; background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-bg)); }
.wb-shop-detail.is-compact .wb-product-hero { padding: 6%; background: transparent; }
.wb-shop-detail.is-compact .wb-product-thumbs { justify-content: center; gap: 8px; }
.wb-shop-detail.is-compact .wb-product-thumb { width: 52px; height: 52px; padding: 5px; background: var(--wb-bg); }
.wb-shop-detail.is-compact .wb-product-copy { gap: 16px; padding: 30px 32px; }
.wb-shop-detail.is-compact .wb-product-heading .wb-shop-title { font-size: 1.6rem; }
.wb-shop-detail.is-compact .wb-product-desc {
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; font-size: 0.92rem;
}
.wb-shop-detail.is-compact .wb-product-buy {
  padding: 12px 16px; border-radius: 12px;
  background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-bg));
}
.wb-shop-detail.is-compact .wb-product-buy-meta { justify-content: space-between; align-items: center; width: 100%; }
.wb-shop-detail.is-compact .wb-product-price { font-size: 1.35rem; }
.wb-shop-detail.is-compact .wb-product-options { gap: 12px; }
.wb-shop-detail.is-compact .wb-option { display: grid; grid-template-columns: 80px minmax(0, 1fr); align-items: center; gap: 12px; }
.wb-shop-detail.is-compact .wb-option-value { min-width: 2.4rem; padding: 0.35rem 0.75rem; font-size: 0.85rem; border-radius: 8px; }

/* Photo-led layouts: arrows are just the chevron, and dots sit on the photo. */
.wb-shop-detail.is-split .wb-product-nav,
.wb-shop-detail.is-editorial .wb-product-nav,
.wb-shop-detail.is-compact .wb-product-nav {
  background: transparent;
  box-shadow: none;
  filter: drop-shadow(0 1px 1px color-mix(in srgb, var(--wb-bg) 70%, transparent));
}
.wb-shop-detail.is-split .wb-product-nav:hover,
.wb-shop-detail.is-editorial .wb-product-nav:hover,
.wb-shop-detail.is-compact .wb-product-nav:hover {
  background: color-mix(in srgb, var(--wb-bg) 40%, transparent);
}
.wb-shop-detail.is-gallery-focus .wb-product-nav {
  background: transparent;
  box-shadow: none;
}
.wb-shop-detail.is-gallery-focus .wb-product-nav:hover { background: color-mix(in srgb, var(--wb-bg) 50%, transparent); }
.wb-shop-detail.is-split .wb-product-gallery,
.wb-shop-detail.is-editorial .wb-product-gallery,
.wb-shop-detail.is-compact .wb-product-gallery { position: relative; }
.wb-shop-detail.is-split .wb-product-thumbs,
.wb-shop-detail.is-editorial .wb-product-thumbs,
.wb-shop-detail.is-compact .wb-product-thumbs {
  position: absolute; left: 0; right: 0; bottom: 12px; z-index: 2;
  justify-content: center; flex-wrap: nowrap; gap: 6px; margin: 0;
}
.wb-shop-detail.is-split .wb-product-thumb,
.wb-shop-detail.is-editorial .wb-product-thumb,
.wb-shop-detail.is-compact .wb-product-thumb {
  width: 7px; height: 7px; min-width: 0; padding: 0; border: 0; border-radius: 999px;
  background: color-mix(in srgb, var(--wb-text) 30%, transparent);
}
.wb-shop-detail.is-split .wb-product-thumb img,
.wb-shop-detail.is-editorial .wb-product-thumb img,
.wb-shop-detail.is-compact .wb-product-thumb img { display: none; }
.wb-shop-detail.is-split .wb-product-thumb.is-active,
.wb-shop-detail.is-editorial .wb-product-thumb.is-active,
.wb-shop-detail.is-compact .wb-product-thumb.is-active {
  width: 18px; background: var(--wb-text); border-color: transparent;
}
@container wb-site (max-width: 800px) {
  .wb-shop-grid, .wb-shop-grid.is-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wb-section.wb-shop-bleed, .wb-shop-list.is-editorial, .wb-shop-list.is-editorial .wb-shop-results { min-height: 0; }
  .wb-shop-list.is-editorial .wb-shop-sidebar {
    position: relative; top: auto; left: auto; bottom: auto; width: auto; height: auto;
    border-right: 0; border-bottom: 1px solid var(--wb-border);
  }
  .wb-shop-list.is-editorial .wb-shop-results { margin-left: 0; padding: 16px; }
  .wb-shop-list.is-editorial .wb-shop-grid,
  .wb-shop-list.is-editorial .wb-shop-grid.is-2,
  .wb-shop-list.is-classic-grid .wb-shop-grid,
  .wb-shop-list.is-classic-grid .wb-shop-grid.is-2 { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .wb-shop-list.is-editorial .wb-shop-filters { flex-direction: row; }
  .wb-shop-list.is-showcase .wb-shop-tools { grid-template-columns: 1fr 1fr; }
  .wb-shop-list.is-showcase .wb-shop-filter-group { grid-column: 1 / -1; grid-row: 2; }
  .wb-shop-list.is-compact .wb-shop-grid, .wb-shop-list.is-compact .wb-shop-grid.is-2 { grid-template-columns: 1fr; }
  .wb-product,
  .wb-shop-detail.is-gallery-focus .wb-product,
  .wb-shop-detail.is-compact .wb-product { grid-template-columns: minmax(0, 1fr); }
  .wb-shop-detail.is-split .wb-product-copy,
  .wb-shop-detail.is-gallery-focus .wb-product-panel { position: static; }
  .wb-shop-detail.is-gallery-focus .wb-product-gallery { display: flex; }
  .wb-shop-detail.is-gallery-focus .wb-product-thumbs { flex-direction: row; flex-wrap: wrap; }
  .wb-shop-detail.is-gallery-focus .wb-product-thumb { width: 64px; height: 64px; }
  .wb-shop-detail.is-editorial .wb-product-hero { aspect-ratio: 4 / 3; }
  .wb-shop-detail.is-compact .wb-product-copy { padding: 22px; }
}
@container wb-site (max-width: 520px) {
  .wb-shop-grid, .wb-shop-grid.is-2 { grid-template-columns: 1fr; }
  .wb-shop-list.is-editorial .wb-shop-grid, .wb-shop-list.is-editorial .wb-shop-grid.is-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wb-shop-list.is-compact .wb-shop-head { display: flex; align-items: flex-start; }
  .wb-shop-list.is-showcase .wb-shop-tools { grid-template-columns: 1fr; }
  .wb-shop-list.is-showcase .wb-shop-filter-group { grid-column: auto; grid-row: auto; }
  .wb-shop-list.is-compact .wb-shop-subtitle { text-align: left; }
  .wb-shop-list.is-compact .wb-shop-grid, .wb-shop-list.is-compact .wb-shop-grid.is-2 { grid-template-columns: 1fr; }
  .wb-shop-detail.is-compact .wb-option { grid-template-columns: minmax(0, 1fr); gap: 8px; }
}
`;
