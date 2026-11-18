/**
 * Boutique storefront components: boutique header, collection cards, featured
 * product strip, split banner, inline bar and newsletter CTAs, numbered cards
 * and the arched story split. Interpolated into SITE_CSS, so it must not
 * contain backticks or template placeholders.
 */
export const BOUTIQUE_CSS = `
/* ---------- Boutique header ---------- */
.wb-header-boutique .wb-nav { margin: 0 auto; gap: 28px; }
.wb-header-boutique .wb-header-actions { display: flex; align-items: center; gap: 18px; }
.wb-boutique-icons { display: flex; align-items: center; gap: 16px; }
.wb-boutique-icon { display: inline-flex; color: var(--wb-text); transition: color 0.15s ease; }
.wb-boutique-icon:hover { color: var(--wb-primary); }
.wb-boutique-icon svg { width: 19px; height: 19px; }
.wb-header-boutique .wb-header-cta .wb-btn { border-radius: 999px; min-height: 38px; padding: 8px 20px; font-size: 13px; font-weight: 500; }

/* ---------- Collection cards (services) ---------- */
.wb-collection-grid { display: grid; grid-template-columns: repeat(var(--wb-collection-cols, 4), minmax(0, 1fr)); gap: 18px; }
.wb-collection-grid[data-count="1"] { --wb-collection-cols: 1; }
.wb-collection-grid[data-count="2"] { --wb-collection-cols: 2; }
.wb-collection-grid[data-count="3"] { --wb-collection-cols: 3; }
.wb-collection-grid[data-count="4"] { --wb-collection-cols: 4; }
.wb-collection-grid[data-count="5"] { --wb-collection-cols: 5; }
.wb-collection-card { display: flex; flex-direction: column; background: var(--wb-bg); border-radius: 14px; padding: 10px 10px 20px; color: var(--wb-text); text-decoration: none; transition: transform 0.25s ease, box-shadow 0.25s ease; }
.wb-collection-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(60, 40, 30, 0.08); }
.wb-collection-media { position: relative; height: 240px; border-radius: 10px; overflow: hidden; }
.wb-collection-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.wb-collection-media.is-empty { background: color-mix(in srgb, var(--wb-primary) 14%, var(--wb-surface)); }
.wb-collection-media.is-empty[data-tint="1"] { background: color-mix(in srgb, #c9a227 22%, var(--wb-surface)); }
.wb-collection-media.is-empty[data-tint="2"] { background: color-mix(in srgb, #6e7f62 22%, var(--wb-surface)); }
.wb-collection-media.is-empty[data-tint="3"] { background: color-mix(in srgb, var(--wb-text) 10%, var(--wb-surface)); }
.wb-collection-media.is-empty[data-tint="4"] { background: color-mix(in srgb, var(--wb-primary) 8%, var(--wb-surface)); }
.wb-collection-title { font-family: var(--wb-font-heading); font-size: 22px; font-weight: 500; line-height: 1.2; margin: 18px 6px 4px; }
.wb-collection-desc { font-size: 12.5px; line-height: 1.5; color: var(--wb-muted); margin: 0 6px 12px; }
.wb-collection-link { margin: auto 6px 0; font-size: 12.5px; font-weight: 500; color: var(--wb-primary); }
.wb-collection-bottom { display: flex; justify-content: center; margin-top: 36px; }
.wb-collection-bottom .wb-btn { border-radius: 999px; border-width: 1px; border-color: var(--wb-text); font-weight: 500; font-size: 14px; }
.wb-collection-bottom .wb-btn:hover { background: var(--wb-text); color: var(--wb-bg); }

/* ---------- Featured product strip (products) ---------- */
.wb-section.wb-shop-list-section.wb-shop-featured-section { padding-top: var(--wb-section-y); }
.wb-shop-featured-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 32px; }
.wb-shop-featured-head .wb-shop-title { margin-top: 8px; }
.wb-shop-featured-all { color: var(--wb-primary); font-size: 14px; text-decoration: underline; text-underline-offset: 4px; white-space: nowrap; }
.wb-shop-featured-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px 18px; }
.wb-shop-featured-grid[data-columns="3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.wb-shop-featured-grid[data-columns="2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.wb-shop-featured-card { display: flex; flex-direction: column; min-width: 0; }
.wb-shop-featured-link { display: block; color: inherit; text-decoration: none; }
.wb-shop-featured-media { position: relative; height: 310px; border-radius: 12px; overflow: hidden; background: color-mix(in srgb, var(--wb-text) 6%, var(--wb-surface)); }
.wb-shop-featured-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.wb-shop-featured-card:hover .wb-shop-featured-media img { transform: scale(1.03); }
.wb-shop-featured-media.is-empty[data-tint="0"] { background: color-mix(in srgb, var(--wb-primary) 14%, var(--wb-surface)); }
.wb-shop-featured-media.is-empty[data-tint="1"] { background: color-mix(in srgb, #5b6b8c 18%, var(--wb-surface)); }
.wb-shop-featured-media.is-empty[data-tint="2"] { background: color-mix(in srgb, #6e7f62 20%, var(--wb-surface)); }
.wb-shop-featured-badge { position: absolute; top: 12px; left: 12px; background: #fff; color: var(--wb-text); font-size: 10px; font-weight: 500; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 999px; }
.wb-shop-featured-card .wb-shop-name { font-family: var(--wb-font-body); font-size: 14px; font-weight: 500; margin: 14px 0 2px; }
.wb-shop-featured-card .wb-shop-price { display: block; font-size: 13px; color: var(--wb-muted); margin-bottom: 12px; font-weight: 400; }
.wb-shop-featured-card .wb-shop-actions { margin-top: auto; padding: 0; }
.wb-shop-featured-card .wb-shop-action-row { display: flex; gap: 8px; }
.wb-shop-featured-card .wb-shop-btn { flex: 1; border-radius: 999px; padding: 9px 10px; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid var(--wb-text); background: transparent; color: var(--wb-text); }
.wb-shop-featured-card .wb-shop-btn:not([disabled]):hover { background: var(--wb-text); color: var(--wb-bg); }
.wb-shop-featured-card .wb-shop-btn.is-buy { background: var(--wb-primary); border-color: var(--wb-primary); color: var(--wb-on-primary); }
.is-single-button .wb-shop-featured-card .wb-shop-btn,
.wb-shop-featured-choose { width: 100%; min-height: 40px; padding: 10px; letter-spacing: 0.1em; line-height: 1.2; }
.wb-shop-featured-choose { display: flex; align-items: center; justify-content: center; margin-top: auto; border: 1px solid var(--wb-text); border-radius: 999px; background: transparent; color: var(--wb-text); font-size: 12px; font-weight: 500; text-transform: uppercase; text-decoration: none; transition: background-color 0.2s ease, color 0.2s ease; }
.wb-shop-featured-choose:hover { background: var(--wb-text); color: var(--wb-bg); }

/* ---------- Split banner (cta) ---------- */
.wb-cta-banner-split { --wb-cta-panel: var(--wb-secondary); display: grid; grid-template-columns: 1fr 1fr; border-radius: 18px; overflow: hidden; min-height: 380px; }
.wb-cta-banner-text { background: var(--wb-cta-panel); color: #fff; padding: 60px 48px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; text-align: left; }
.wb-cta-banner-text .wb-eyebrow { color: rgba(255, 255, 255, 0.78); font-size: 11px; font-weight: 400; letter-spacing: 0.22em; }
.wb-cta-banner-text h2 { color: #fff; font-size: clamp(34px, 3.6vw, 46px); font-weight: 500; line-height: 1.15; margin: 14px 0 18px; }
.wb-cta-banner-desc { color: rgba(255, 255, 255, 0.86); font-size: 14px; max-width: 400px; margin: 0 0 24px; }
.wb-cta-banner-text .wb-actions { margin: 0; }
.wb-cta-banner-light-btn { background: #fff; color: var(--wb-text); border: 1px solid #fff; border-radius: 999px; font-weight: 500; font-size: 14px; }
.wb-cta-banner-light-btn:hover { background: color-mix(in srgb, #fff 88%, var(--wb-cta-panel)); }
.wb-cta-banner-ghost-btn { background: transparent; color: #fff; border: 1px solid rgba(255, 255, 255, 0.7); border-radius: 999px; font-weight: 500; font-size: 14px; }
.wb-cta-banner-media { position: relative; min-height: 260px; }
.wb-cta-banner-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.wb-cta-banner-media.is-empty { background: color-mix(in srgb, var(--wb-cta-panel) 72%, #fff); }

/* ---------- Inline bar (cta) ---------- */
.wb-cta-inline-card { --wb-cta-accent: var(--wb-primary); display: flex; align-items: center; gap: 24px; background: var(--wb-bg); border: 1px solid var(--wb-border); border-radius: 16px; padding: 30px 40px; text-align: left; }
.wb-cta-inline-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--wb-cta-accent); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.wb-cta-inline-icon .wb-icon { color: #fff; background: none; width: auto; height: auto; }
.wb-cta-inline-copy { flex: 1; min-width: 0; }
.wb-cta-inline-copy h3 { font-size: 28px; font-weight: 500; line-height: 1.2; margin: 0; }
.wb-cta-inline-copy p.wb-muted { font-size: 13px; margin: 4px 0 0; }
.wb-cta-inline-btn { background: var(--wb-cta-accent); color: #fff; border: 1px solid var(--wb-cta-accent); border-radius: 999px; font-weight: 500; font-size: 14px; white-space: nowrap; }
.wb-cta-inline-btn:hover { background: color-mix(in srgb, var(--wb-cta-accent) 82%, #000); }

/* ---------- Newsletter (cta) ---------- */
.wb-cta-newsletter-inner { max-width: 640px; margin: 0 auto; text-align: center; }
.wb-cta-newsletter-inner h2 { font-size: clamp(34px, 3.6vw, 44px); font-weight: 500; margin: 0 0 8px; }
.wb-cta-newsletter-inner > p.wb-muted { margin: 0 0 28px; }
.wb-cta-newsletter-form { display: flex; gap: 10px; justify-content: center; max-width: 560px; margin: 0 auto; }
.wb-cta-newsletter-form .wb-newsletter-input { flex: 1; min-width: 0; padding: 12px 22px; border: 1px solid var(--wb-border); border-radius: 999px; font: inherit; font-size: 14px; background: #fff; color: var(--wb-text); outline: none; }
.wb-cta-newsletter-form .wb-newsletter-input:focus { border-color: var(--wb-primary); }
.wb-cta-newsletter-form .wb-btn { border-radius: 999px; font-weight: 500; font-size: 14px; }
.wb-newsletter-thanks { margin: 0; font-weight: 600; color: var(--wb-primary); }

/* ---------- Numbered cards (features) ---------- */
.wb-numbered-grid { display: grid; grid-template-columns: repeat(var(--wb-cols, 4), minmax(0, 1fr)); gap: 18px; }
.wb-numbered-card { background: var(--wb-bg); border: 1px solid var(--wb-border); border-radius: 14px; padding: 26px 22px 30px; text-align: left; }
.wb-numbered-num { width: 36px; height: 36px; border-radius: 50%; background: var(--wb-surface); display: flex; align-items: center; justify-content: center; font-family: var(--wb-font-heading); font-size: 16px; margin-bottom: 22px; }
.wb-numbered-title { font-size: 23px; font-weight: 500; line-height: 1.2; margin: 0 0 10px; }
.wb-numbered-desc { font-size: 13px; color: var(--wb-muted); margin: 0; }

/* ---------- Arched story split ---------- */
.wb-split-arch .wb-split-grid { align-items: center; gap: 64px; }
.wb-split-arch .wb-split-media { position: relative; width: 85%; height: 480px; justify-self: end; border-radius: 24px 24px 50% 50%; overflow: hidden; }
.wb-split-arch.wb-split-left .wb-split-media { justify-self: start; }
.wb-split-arch .wb-split-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
.wb-split-arch .wb-split-arch-empty { position: absolute; inset: 0; border-radius: 0; background: color-mix(in srgb, var(--wb-primary) 16%, var(--wb-surface)); }
.wb-split-signature { font-family: var(--wb-font-heading); font-style: italic; font-size: 21px; color: var(--wb-primary); margin: 20px 0 22px; }
.wb-split-arch .wb-actions .wb-btn { border-radius: 999px; border-width: 1px; border-color: var(--wb-text); font-weight: 500; font-size: 14px; }
.wb-split-arch .wb-actions .wb-btn:hover { background: var(--wb-text); color: var(--wb-bg); }

@container wb-site (max-width: 1024px) {
  .wb-collection-grid[data-count="4"], .wb-collection-grid[data-count="5"] { --wb-collection-cols: 3; }
  .wb-shop-featured-grid, .wb-shop-featured-grid[data-columns="3"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wb-numbered-grid { grid-template-columns: repeat(var(--wb-cols-tablet, 2), minmax(0, 1fr)); }
}
@container wb-site (max-width: 820px) {
  .wb-header-boutique .wb-header-cta { display: none; }
  .wb-cta-banner-split { grid-template-columns: 1fr; }
  .wb-cta-inline-card { flex-direction: column; text-align: center; padding: 30px 24px; }
  .wb-split-arch .wb-split-media { width: 100%; height: 400px; }
}
@container wb-site (max-width: 560px) {
  .wb-collection-grid[data-count] { --wb-collection-cols: 2; }
  .wb-collection-media { height: 180px; }
  .wb-shop-featured-grid, .wb-shop-featured-grid[data-columns] { gap: 18px 12px; }
  .wb-shop-featured-media { height: 220px; }
  .wb-shop-featured-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .wb-shop-featured-card .wb-shop-action-row { flex-direction: column; }
  .wb-numbered-grid { grid-template-columns: repeat(var(--wb-cols-mobile, 1), minmax(0, 1fr)); }
  .wb-cta-newsletter-form { flex-direction: column; }
  .wb-cta-banner-text { padding: 44px 28px; }
  .wb-boutique-icons { gap: 12px; }
}
`;
