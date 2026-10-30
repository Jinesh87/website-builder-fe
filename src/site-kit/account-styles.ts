/**
 * Styles for the customer account section templates (sidebar-tabs, top-tabs, overview-cards,
 * minimal-list, dark-panel). Interpolated into SITE_CSS, so no backticks or template placeholders.
 */
export const ACCOUNT_CSS = `
/* =========================================================================
   ACCOUNT SECTION · shared tokens
   ========================================================================= */
.wb-acct-root {
  --wb-acct-accent: var(--wb-primary);
  --wb-acct-on-accent: var(--wb-on-primary);
  --wb-acct-card: var(--wb-bg);
  --wb-acct-soft: color-mix(in srgb, var(--wb-text) 4%, transparent);
  --wb-acct-field-r: max(min(var(--wb-radius), 12px), 4px);
  --wb-acct-card-r: calc(var(--wb-radius) + 10px);
  --wb-acct-ring: color-mix(in srgb, var(--wb-acct-accent) 18%, transparent);
  position: relative; width: 100%; color: var(--wb-text);
}
.wb-acct-state[hidden], .wb-acct-panel[hidden], .wb-acct-list[hidden], .wb-acct-empty[hidden],
.wb-acct-message[hidden], .wb-acct-cart-total[hidden], .wb-acct-checkout[hidden] { display: none !important; }

.wb-acct-loading { display: grid; place-items: center; min-height: 240px; }
.wb-acct-spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 3px solid color-mix(in srgb, var(--wb-acct-accent) 20%, transparent);
  border-top-color: var(--wb-acct-accent); animation: wb-acct-spin 0.8s linear infinite;
}
@keyframes wb-acct-spin { to { transform: rotate(360deg); } }

.wb-acct-heading { margin-bottom: 24px; }
.wb-acct-title { margin: 0; font-family: var(--wb-font-heading); font-size: clamp(1.6rem, 2.6vw, 2.2rem); line-height: 1.15; letter-spacing: -0.02em; }
.wb-acct-subtitle { margin: 8px 0 0; color: var(--wb-muted); max-width: 62ch; }

.wb-acct-identity { display: flex; align-items: center; gap: 14px; min-width: 0; }
.wb-acct-identity-text { display: grid; gap: 2px; min-width: 0; }
.wb-acct-name { font-weight: 700; font-size: 1.05rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wb-acct-email { font-size: 0.86rem; color: var(--wb-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wb-acct-avatar {
  flex: none; display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%;
  background: color-mix(in srgb, var(--wb-acct-accent) 16%, transparent); color: var(--wb-acct-accent);
  font-family: var(--wb-font-heading); font-weight: 800; font-size: 1.05rem; letter-spacing: 0.02em;
}
.wb-acct-identity.is-compact .wb-acct-avatar { width: 44px; height: 44px; font-size: 0.95rem; }

.wb-acct-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.wb-acct-tab {
  appearance: none; border: 1px solid transparent; background: transparent; color: var(--wb-muted);
  font: inherit; font-weight: 600; font-size: 0.92rem; padding: 0.6rem 0.95rem; border-radius: var(--wb-acct-field-r);
  cursor: pointer; text-align: left; transition: background 0.15s, color 0.15s;
  display: inline-flex; align-items: center; gap: 8px;
}
.wb-acct-tab:hover { color: var(--wb-text); background: var(--wb-acct-soft); }
.wb-acct-tab.is-active { background: var(--wb-acct-accent); color: var(--wb-acct-on-accent); }
.wb-acct-tab-count {
  display: inline-flex; align-items: center; justify-content: center; min-width: 1.4rem; height: 1.4rem;
  padding: 0 0.4rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; line-height: 1;
  background: color-mix(in srgb, var(--wb-text) 10%, transparent); color: inherit;
}
.wb-acct-tab.is-active .wb-acct-tab-count {
  background: color-mix(in srgb, var(--wb-acct-on-accent) 22%, transparent);
}

.wb-acct-logout {
  appearance: none; border: 1px solid var(--wb-border); background: transparent; color: var(--wb-text);
  font: inherit; font-weight: 600; font-size: 0.88rem; padding: 0.55rem 0.95rem; border-radius: var(--wb-acct-field-r); cursor: pointer;
}
.wb-acct-logout:hover { background: var(--wb-acct-soft); }

.wb-acct-panel { display: grid; gap: 16px; }
.wb-acct-panel-title { margin: 0; font-family: var(--wb-font-heading); font-size: 1.15rem; letter-spacing: -0.01em; }

.wb-acct-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.wb-acct-row {
  display: flex; align-items: center; gap: 14px; padding: 12px 14px;
  border: 1px solid var(--wb-border); border-radius: var(--wb-acct-field-r); background: var(--wb-acct-card);
}
.wb-acct-row-main { display: grid; gap: 2px; min-width: 0; flex: 1; }
.wb-acct-row-main strong { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wb-acct-row-sub { font-size: 0.82rem; color: var(--wb-muted); }
.wb-acct-row-amount { flex: none; font-variant-numeric: tabular-nums; }
.wb-acct-thumb { flex: none; width: 48px; height: 48px; border-radius: 10px; object-fit: cover; background: var(--wb-acct-soft); }
.wb-acct-thumb.is-blank { display: block; }
.wb-acct-badge {
  flex: none; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.05em; text-transform: uppercase; background: var(--wb-acct-soft); color: var(--wb-muted);
}
.wb-acct-badges { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; flex: none; }
.wb-acct-badge.is-paid, .wb-acct-badge.is-delivered { background: color-mix(in srgb, #16a34a 14%, transparent); color: #15803d; }
.wb-acct-badge.is-pending { background: color-mix(in srgb, #f59e0b 16%, transparent); color: #b45309; }
.wb-acct-badge.is-processing, .wb-acct-badge.is-shipped { background: color-mix(in srgb, #0284c7 14%, transparent); color: #0369a1; }
.wb-acct-badge.is-failed, .wb-acct-badge.is-cancelled { background: color-mix(in srgb, #dc2626 12%, transparent); color: #b91c1c; }
.wb-acct-badge.is-refund-pending { background: color-mix(in srgb, #f59e0b 16%, transparent); color: #b45309; }
.wb-acct-badge.is-refund-processed { background: color-mix(in srgb, #16a34a 14%, transparent); color: #15803d; }
.wb-acct-badge.is-refund-failed { background: color-mix(in srgb, #dc2626 12%, transparent); color: #b91c1c; }
.wb-acct-cart-total {
  display: flex; justify-content: space-between; align-items: center; padding: 10px 14px 0;
  border-top: 1px solid var(--wb-border); font-size: 0.95rem;
}
.wb-acct-checkout {
  display: grid; gap: 10px; margin-top: 14px;
}
.wb-acct-checkout[hidden] { display: none !important; }
.wb-acct-button.is-pay {
  width: 100%; justify-content: center; background: var(--wb-acct-accent); color: var(--wb-acct-on-accent);
  border: 0; cursor: pointer;
}
.wb-acct-button.is-pay:hover:not(:disabled) { filter: brightness(0.96); }
.wb-acct-button.is-pay:disabled { opacity: 0.6; cursor: not-allowed; }
.wb-acct-cart-remove {
  flex: none; margin: 0; padding: 0.4rem 0.7rem; border-radius: 8px;
  border: 1px solid color-mix(in srgb, #b91c1c 35%, var(--wb-border));
  background: transparent; color: #b91c1c; font: inherit; font-size: 0.78rem; font-weight: 700; cursor: pointer;
}
.wb-acct-cart-remove:hover:not(:disabled) { background: color-mix(in srgb, #dc2626 8%, transparent); }
.wb-acct-cart-remove:disabled { opacity: 0.55; cursor: not-allowed; }
.wb-acct-row:has(.wb-acct-cart-remove) { align-items: center; gap: 10px; }
.wb-acct-empty {
  display: grid; gap: 10px; justify-items: start; padding: 22px; border: 1px dashed var(--wb-border);
  border-radius: var(--wb-acct-field-r); color: var(--wb-muted);
}
.wb-acct-empty p { margin: 0; }
.wb-acct-link { color: var(--wb-acct-accent); font-weight: 600; text-decoration: none; }
.wb-acct-link:hover { text-decoration: underline; }

.wb-acct-form { display: grid; gap: 14px; }
.wb-acct-form-row { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
.wb-acct-label { display: grid; gap: 6px; font-size: 0.84rem; font-weight: 600; color: var(--wb-muted); }
.wb-acct-input {
  width: 100%; border: 1px solid var(--wb-border); background: var(--wb-acct-card); color: var(--wb-text);
  border-radius: var(--wb-acct-field-r); padding: 0.7rem 0.9rem; font: inherit; font-size: 0.95rem; font-weight: 400;
}
.wb-acct-input:focus { outline: none; border-color: var(--wb-acct-accent); box-shadow: 0 0 0 4px var(--wb-acct-ring); }
.wb-acct-input[readonly] { color: var(--wb-muted); background: var(--wb-acct-soft); }
.wb-acct-message { margin: 0; padding: 10px 14px; border-radius: var(--wb-acct-field-r); font-size: 0.88rem; font-weight: 600; }
.wb-acct-message.is-ok { color: #15803d; background: color-mix(in srgb, #16a34a 10%, transparent); }
.wb-acct-message.is-error { color: #b91c1c; background: color-mix(in srgb, #dc2626 9%, transparent); }
.wb-acct-actions { display: flex; gap: 10px; }
.wb-acct-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 1.2rem;
  border: 0; border-radius: var(--wb-acct-field-r); background: var(--wb-acct-accent); color: var(--wb-acct-on-accent);
  font: inherit; font-weight: 700; font-size: 0.95rem; cursor: pointer; text-decoration: none;
  box-shadow: 0 10px 24px -14px color-mix(in srgb, var(--wb-acct-accent) 80%, transparent);
}
.wb-acct-button:hover { filter: brightness(1.06); }
.wb-acct-button:disabled { opacity: 0.65; cursor: default; }

.wb-acct-stats { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); margin: 22px 0; }
.wb-acct-stat {
  display: grid; gap: 4px; padding: 18px 20px; border-radius: var(--wb-acct-card-r);
  background: var(--wb-acct-card); border: 1px solid var(--wb-border); text-align: left; color: inherit;
}
.wb-acct-stat.is-action {
  appearance: none; font: inherit; cursor: pointer; width: 100%;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.wb-acct-stat.is-action:hover {
  border-color: color-mix(in srgb, var(--wb-acct-accent) 45%, var(--wb-border));
  background: color-mix(in srgb, var(--wb-acct-accent) 5%, var(--wb-acct-card));
}
.wb-acct-stat.is-action.is-active {
  border-color: color-mix(in srgb, var(--wb-acct-accent) 55%, var(--wb-border));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wb-acct-accent) 35%, transparent);
  background: color-mix(in srgb, var(--wb-acct-accent) 8%, var(--wb-acct-card));
}
.wb-acct-stat-value { font-family: var(--wb-font-heading); font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; }
.wb-acct-stat-label { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--wb-muted); }

/* Guest prompt */
.wb-acct-guest {
  max-width: 520px; margin: 0 auto; padding: 44px 32px; text-align: center; display: grid; gap: 14px; justify-items: center;
  background: var(--wb-acct-card); border: 1px solid var(--wb-border); border-radius: var(--wb-acct-card-r);
}
.wb-acct-guest-icon {
  display: grid; place-items: center; width: 56px; height: 56px; border-radius: 16px;
  background: color-mix(in srgb, var(--wb-acct-accent) 14%, transparent); color: var(--wb-acct-accent);
}
.wb-acct-guest-icon svg { width: 26px; height: 26px; }
.wb-acct-guest .wb-acct-subtitle { margin: 0; }
.wb-acct-guest .wb-acct-button { margin-top: 6px; }

/* =========================================================================
   sidebar-tabs
   ========================================================================= */
.wb-acct-v-sidebar-tabs .wb-acct-layout { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 24px; align-items: start; }
.wb-acct-v-sidebar-tabs .wb-acct-side {
  display: grid; gap: 18px; padding: 22px; border-radius: var(--wb-acct-card-r);
  background: var(--wb-acct-card); border: 1px solid var(--wb-border); position: sticky; top: 24px;
}
.wb-acct-v-sidebar-tabs .wb-acct-identity { flex-direction: column; align-items: flex-start; }
.wb-acct-v-sidebar-tabs .wb-acct-avatar { width: 60px; height: 60px; font-size: 1.2rem; }
.wb-acct-v-sidebar-tabs .wb-acct-tabs { flex-direction: column; gap: 4px; }
.wb-acct-v-sidebar-tabs .wb-acct-tab { width: 100%; }
.wb-acct-v-sidebar-tabs .wb-acct-logout { width: 100%; }
.wb-acct-v-sidebar-tabs .wb-acct-main {
  padding: 26px; border-radius: var(--wb-acct-card-r); background: var(--wb-acct-card); border: 1px solid var(--wb-border); min-height: 320px;
}

/* =========================================================================
   top-tabs
   ========================================================================= */
.wb-acct-v-top-tabs .wb-acct-member { max-width: 880px; margin: 0 auto; }
.wb-acct-v-top-tabs .wb-acct-topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.wb-acct-v-top-tabs .wb-acct-tabs {
  margin: 22px 0 20px; padding: 5px; gap: 4px; border-radius: 999px; background: var(--wb-acct-soft); width: fit-content; max-width: 100%;
}
.wb-acct-v-top-tabs .wb-acct-tab { border-radius: 999px; padding: 0.5rem 1.05rem; }
.wb-acct-v-top-tabs .wb-acct-main {
  padding: 26px; border-radius: var(--wb-acct-card-r); background: var(--wb-acct-card); border: 1px solid var(--wb-border);
}

/* =========================================================================
   overview-cards — stats + tabs, one full-width workspace (scales with data)
   ========================================================================= */
.wb-acct-v-overview-cards .wb-acct-member { display: grid; gap: 0; max-width: 1080px; margin: 0 auto; }
.wb-acct-v-overview-cards .wb-acct-topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.wb-acct-v-overview-cards .wb-acct-heading { margin-bottom: 14px; }
.wb-acct-v-overview-cards .wb-acct-stats { margin: 18px 0 8px; }
.wb-acct-v-overview-cards .wb-acct-tabs {
  margin: 4px 0 16px; padding: 5px; gap: 4px; border-radius: 14px; background: var(--wb-acct-soft); width: fit-content; max-width: 100%;
}
.wb-acct-v-overview-cards .wb-acct-tab { border-radius: 10px; padding: 0.55rem 0.95rem; }
.wb-acct-v-overview-cards .wb-acct-workspace {
  min-width: 0; padding: 22px 24px; border-radius: var(--wb-acct-card-r);
  background: var(--wb-acct-card); border: 1px solid var(--wb-border);
  box-shadow: 0 18px 40px -32px color-mix(in srgb, var(--wb-text) 40%, transparent);
}
.wb-acct-v-overview-cards .wb-acct-panel { gap: 14px; }
.wb-acct-v-overview-cards .wb-acct-panel-title { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
.wb-acct-v-overview-cards .wb-acct-panel-title::before {
  content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--wb-acct-accent);
}
.wb-acct-v-overview-cards .wb-acct-list {
  gap: 0; max-height: min(52vh, 520px); overflow: auto; -webkit-overflow-scrolling: touch;
  border: 1px solid var(--wb-border); border-radius: var(--wb-acct-field-r); background: color-mix(in srgb, var(--wb-text) 2%, var(--wb-acct-card));
}
.wb-acct-v-overview-cards .wb-acct-row {
  border: 0; border-bottom: 1px solid color-mix(in srgb, var(--wb-border) 85%, transparent);
  border-radius: 0; padding: 10px 12px; background: transparent; gap: 12px;
}
.wb-acct-v-overview-cards .wb-acct-row:last-child { border-bottom: 0; }
.wb-acct-v-overview-cards .wb-acct-thumb { width: 40px; height: 40px; border-radius: 8px; }
.wb-acct-v-overview-cards .wb-acct-row-sub { font-size: 0.78rem; }
.wb-acct-v-overview-cards .wb-acct-cart-total {
  margin-top: 4px; padding: 12px 4px 0; position: sticky; bottom: 0;
  background: linear-gradient(180deg, transparent, var(--wb-acct-card) 28%);
}
.wb-acct-v-overview-cards .wb-acct-cart-remove { padding: 0.35rem 0.6rem; font-size: 0.74rem; }
.wb-acct-v-overview-cards .wb-acct-form-row { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

/* =========================================================================
   minimal-list
   ========================================================================= */
.wb-acct-v-minimal-list .wb-acct-member { max-width: 720px; margin: 0 auto; }
.wb-acct-v-minimal-list .wb-acct-topbar {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding-bottom: 22px;
  border-bottom: 1px solid var(--wb-border);
}
.wb-acct-v-minimal-list .wb-acct-heading { margin-bottom: 14px; }
.wb-acct-v-minimal-list .wb-acct-title { font-size: clamp(2rem, 3.4vw, 2.8rem); }
.wb-acct-v-minimal-list .wb-acct-avatar { border-radius: 12px; }
.wb-acct-v-minimal-list .wb-acct-main { display: grid; }
.wb-acct-v-minimal-list .wb-acct-panel { padding: 28px 0; border-bottom: 1px solid var(--wb-border); }
.wb-acct-v-minimal-list .wb-acct-panel:last-child { border-bottom: 0; }
.wb-acct-v-minimal-list .wb-acct-panel-title { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--wb-muted); font-family: var(--wb-font-body); }
.wb-acct-v-minimal-list .wb-acct-row { border: 0; border-radius: 0; padding: 12px 0; border-bottom: 1px solid var(--wb-border); background: transparent; }
.wb-acct-v-minimal-list .wb-acct-list { gap: 0; }
.wb-acct-v-minimal-list .wb-acct-row:last-child { border-bottom: 0; }
.wb-acct-v-minimal-list .wb-acct-logout { border: 0; padding: 0; text-decoration: underline; text-underline-offset: 4px; color: var(--wb-muted); }
.wb-acct-v-minimal-list .wb-acct-logout:hover { background: transparent; color: var(--wb-text); }
.wb-acct-v-minimal-list .wb-acct-button { border-radius: 0; }
.wb-acct-v-minimal-list .wb-acct-input { border-radius: 0; border-width: 0 0 1px; padding-left: 0; padding-right: 0; background: transparent; }
.wb-acct-v-minimal-list .wb-acct-input:focus { box-shadow: none; }
.wb-acct-v-minimal-list .wb-acct-empty { border-left: 0; border-right: 0; border-top: 0; border-radius: 0; padding-left: 0; }

/* =========================================================================
   dark-panel
   ========================================================================= */
.wb-acct-dark {
  --wb-acct-panel: color-mix(in srgb, var(--wb-acct-accent) 12%, #0b0d17);
  --wb-text: #f8fafc;
  --wb-muted: rgba(248, 250, 252, 0.62);
  --wb-border: rgba(248, 250, 252, 0.12);
  --wb-acct-card: rgba(255, 255, 255, 0.05);
  --wb-acct-soft: rgba(255, 255, 255, 0.07);
  color: var(--wb-text); color-scheme: dark;
}
.wb-acct-v-dark-panel .wb-acct-member {
  position: relative; overflow: hidden; padding: 32px; border-radius: calc(var(--wb-acct-card-r) + 6px);
  background:
    radial-gradient(900px 400px at 100% -10%, color-mix(in srgb, var(--wb-acct-accent) 38%, transparent), transparent 60%),
    radial-gradient(600px 300px at -10% 110%, color-mix(in srgb, var(--wb-acct-accent) 22%, transparent), transparent 60%),
    var(--wb-acct-panel);
  box-shadow: 0 40px 80px -50px rgba(0, 0, 0, 0.8);
}
.wb-acct-v-dark-panel .wb-acct-layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 28px; align-items: start; }
.wb-acct-v-dark-panel .wb-acct-side { display: grid; gap: 18px; }
.wb-acct-v-dark-panel .wb-acct-identity { flex-direction: column; align-items: flex-start; }
.wb-acct-v-dark-panel .wb-acct-avatar { width: 64px; height: 64px; border-radius: 18px; background: var(--wb-acct-accent); color: var(--wb-acct-on-accent); font-size: 1.25rem; }
.wb-acct-v-dark-panel .wb-acct-tabs { flex-direction: column; gap: 4px; }
.wb-acct-v-dark-panel .wb-acct-tab { color: var(--wb-muted); }
.wb-acct-v-dark-panel .wb-acct-tab:hover { color: var(--wb-text); }
.wb-acct-v-dark-panel .wb-acct-tab.is-active { background: rgba(255, 255, 255, 0.1); color: var(--wb-text); box-shadow: inset 3px 0 0 var(--wb-acct-accent); }
.wb-acct-v-dark-panel .wb-acct-main {
  padding: 26px; border-radius: var(--wb-acct-card-r); background: rgba(255, 255, 255, 0.04); border: 1px solid var(--wb-border);
  backdrop-filter: blur(12px); min-height: 320px;
}
.wb-acct-v-dark-panel .wb-acct-row { background: rgba(255, 255, 255, 0.04); }
.wb-acct-v-dark-panel .wb-acct-input { background: rgba(0, 0, 0, 0.25); }
.wb-acct-v-dark-panel .wb-acct-badge.is-paid, .wb-acct-v-dark-panel .wb-acct-badge.is-delivered { color: #86efac; }
.wb-acct-v-dark-panel .wb-acct-badge.is-pending { color: #fcd34d; }
.wb-acct-v-dark-panel .wb-acct-badge.is-processing, .wb-acct-v-dark-panel .wb-acct-badge.is-shipped { color: #7dd3fc; }
.wb-acct-v-dark-panel .wb-acct-badge.is-failed, .wb-acct-v-dark-panel .wb-acct-badge.is-cancelled { color: #fca5a5; }
.wb-acct-v-dark-panel .wb-acct-badge.is-refund-pending { color: #fcd34d; }
.wb-acct-v-dark-panel .wb-acct-badge.is-refund-processed { color: #86efac; }
.wb-acct-v-dark-panel .wb-acct-badge.is-refund-failed { color: #fca5a5; }
.wb-acct-v-dark-panel .wb-acct-message.is-ok { color: #86efac; }
.wb-acct-v-dark-panel .wb-acct-message.is-error { color: #fca5a5; }
.wb-acct-v-dark-panel .wb-acct-guest { background: rgba(255, 255, 255, 0.05); }

/* =========================================================================
   responsive (container: .wb-site)
   ========================================================================= */
@container wb-site (max-width: 760px) {
  .wb-acct-v-sidebar-tabs .wb-acct-layout, .wb-acct-v-dark-panel .wb-acct-layout { grid-template-columns: 1fr; }
  .wb-acct-v-sidebar-tabs .wb-acct-side { position: static; }
  .wb-acct-v-sidebar-tabs .wb-acct-tabs, .wb-acct-v-dark-panel .wb-acct-tabs { flex-direction: row; }
  .wb-acct-v-sidebar-tabs .wb-acct-tab, .wb-acct-v-dark-panel .wb-acct-tab { width: auto; }
  .wb-acct-v-sidebar-tabs .wb-acct-identity, .wb-acct-v-dark-panel .wb-acct-identity { flex-direction: row; align-items: center; }
  .wb-acct-v-dark-panel .wb-acct-member { padding: 20px; }
  .wb-acct-v-sidebar-tabs .wb-acct-main, .wb-acct-v-top-tabs .wb-acct-main, .wb-acct-v-dark-panel .wb-acct-main,
  .wb-acct-v-overview-cards .wb-acct-workspace { padding: 18px; }
  .wb-acct-v-overview-cards .wb-acct-tabs { width: 100%; }
  .wb-acct-v-overview-cards .wb-acct-list { max-height: min(60vh, 420px); }
  .wb-acct-row { flex-wrap: wrap; gap: 10px; }
  .wb-acct-row .wb-acct-badges { order: 3; flex: 1 1 auto; }
  .wb-acct-row-amount { margin-left: auto; }
  .wb-acct-v-overview-cards .wb-acct-row-amount { width: auto; margin-left: auto; }
}

/* =========================================================================
   success popup + order detail / timeline
   ========================================================================= */
.wb-acct-row.is-clickable { cursor: pointer; }
.wb-acct-row.is-clickable:hover { background: color-mix(in srgb, var(--wb-acct-accent) 6%, transparent); }
.wb-acct-success-modal, .wb-acct-order-modal {
  /* Re-declare tokens: these modals mount on body, outside .wb-acct-root / .wb-site. */
  --wb-acct-accent: var(--wb-primary, #194a7a);
  --wb-acct-on-accent: var(--wb-on-primary, #ffffff);
  --wb-acct-card: var(--wb-bg, #ffffff);
  --wb-acct-soft: color-mix(in srgb, var(--wb-text, #1a1d23) 6%, var(--wb-bg, #ffffff));
  --wb-acct-field-r: max(min(var(--wb-radius, 8px), 12px), 4px);
  --wb-acct-card-r: calc(var(--wb-radius, 8px) + 10px);
  --wb-border: color-mix(in srgb, var(--wb-text, #1a1d23) 12%, transparent);
  position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center;
  padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  box-sizing: border-box; overflow: auto; color: var(--wb-text, #1a1d23);
}
/* Editor canvas: keep the popup inside the section, not over the whole builder UI. */
.wb-acct-root.is-editor-preview { position: relative; min-height: 560px; }
.wb-acct-root.is-editor-preview .wb-acct-success-modal,
.wb-acct-root.is-editor-preview .wb-acct-order-modal {
  position: absolute; z-index: 5;
}
.wb-acct-success-modal[hidden], .wb-acct-order-modal[hidden] { display: none !important; }
.wb-acct-success-backdrop, .wb-acct-order-backdrop {
  position: absolute; inset: 0; border: 0; padding: 0; margin: 0; cursor: pointer;
  background: rgba(11, 18, 32, 0.72);
}
.wb-acct-success-dialog, .wb-acct-order-dialog {
  position: relative; z-index: 1; width: min(440px, 100%); max-height: min(88vh, 720px); overflow: auto;
  box-sizing: border-box; padding: 28px 24px; border-radius: calc(var(--wb-acct-card-r) + 4px);
  /* Solid fallback first — modal is on body and must never be see-through. */
  background-color: #ffffff !important;
  background-color: var(--wb-bg, #ffffff) !important;
  color: var(--wb-text, #1a1d23);
  border: 1px solid var(--wb-border);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.34);
  isolation: isolate;
}
.wb-acct-order-dialog { width: min(560px, 100%); }
.wb-acct-success-dialog.is-celebration {
  text-align: center;
  background-image:
    radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--wb-acct-accent) 18%, transparent), transparent 45%),
    radial-gradient(circle at 90% 10%, color-mix(in srgb, #f59e0b 14%, transparent), transparent 40%);
  background-color: var(--wb-bg, #ffffff) !important;
}
.wb-acct-success-dialog.is-receipt { border-radius: 4px; border-style: dashed; }
.wb-acct-success-kicker { margin: 0 0 8px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wb-muted); }
.wb-acct-success-title { margin: 0; font-family: var(--wb-font-heading); font-size: 1.55rem; line-height: 1.2; }
.wb-acct-success-text { margin: 10px 0 0; color: var(--wb-muted); }
.wb-acct-success-meta { margin: 18px 0 0; padding: 12px 14px; border-radius: var(--wb-acct-field-r); background: var(--wb-acct-soft); display: grid; gap: 4px; color: var(--wb-text); }
.wb-acct-order-dialog .wb-acct-panel-title { color: var(--wb-text); }
.wb-acct-order-dialog .wb-acct-order-item { color: var(--wb-text); }
.wb-acct-order-dialog .wb-acct-timeline-label { color: var(--wb-text); }
.wb-acct-success-actions { display: grid; gap: 8px; margin-top: 20px; }
.wb-acct-order-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 18px; }
.wb-acct-order-close {
  flex: none; border: 0; background: transparent; font: inherit; font-size: 1.4rem; line-height: 1; cursor: pointer; color: var(--wb-muted);
}
.wb-acct-order-items { display: grid; gap: 8px; margin: 16px 0; }
.wb-acct-order-item { display: flex; justify-content: space-between; gap: 12px; font-size: 0.92rem; }
.wb-acct-order-item span { color: var(--wb-muted); }
.wb-acct-timeline { display: grid; gap: 0; margin: 8px 0 0; padding: 0; list-style: none; }
.wb-acct-timeline-step {
  display: grid; grid-template-columns: 18px 1fr; gap: 12px; position: relative; padding: 0 0 18px;
}
.wb-acct-timeline-step:last-child { padding-bottom: 0; }
.wb-acct-timeline-dot {
  width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--wb-border);
  background: var(--wb-acct-card); margin-top: 2px; z-index: 1;
}
.wb-acct-timeline-step.is-done .wb-acct-timeline-dot {
  background: var(--wb-acct-accent); border-color: var(--wb-acct-accent);
}
.wb-acct-timeline-step.is-current .wb-acct-timeline-dot {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--wb-acct-accent) 22%, transparent);
  border-color: var(--wb-acct-accent);
}
.wb-acct-timeline-step::before {
  content: ""; position: absolute; left: 8px; top: 20px; bottom: 0; width: 2px;
  background: color-mix(in srgb, var(--wb-border) 90%, transparent);
}
.wb-acct-timeline-step:last-child::before { display: none; }
.wb-acct-timeline-step.is-done::before { background: color-mix(in srgb, var(--wb-acct-accent) 55%, transparent); }
.wb-acct-timeline-label { font-weight: 700; font-size: 0.92rem; }
.wb-acct-timeline-time { display: block; margin-top: 2px; font-size: 0.78rem; color: var(--wb-muted); }
.wb-acct-timeline-note { display: block; margin-top: 4px; font-size: 0.8rem; color: var(--wb-muted); }
.wb-acct-steps {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 12px 0 0;
}
.wb-acct-step {
  text-align: center; padding: 10px 6px; border-radius: var(--wb-acct-field-r);
  border: 1px solid var(--wb-border); font-size: 0.72rem; font-weight: 700; color: var(--wb-muted);
}
.wb-acct-step.is-done, .wb-acct-step.is-current {
  border-color: color-mix(in srgb, var(--wb-acct-accent) 45%, var(--wb-border));
  color: var(--wb-acct-accent); background: color-mix(in srgb, var(--wb-acct-accent) 8%, transparent);
}
.wb-acct-order-compact .wb-acct-timeline-step { grid-template-columns: 1fr; padding-bottom: 12px; border-bottom: 1px solid var(--wb-border); }
.wb-acct-order-compact .wb-acct-timeline-step::before, .wb-acct-order-compact .wb-acct-timeline-dot { display: none; }
.wb-acct-row-cancel {
  appearance: none; margin: 0; border: 0; background: transparent; color: #b91c1c;
  font: inherit; font-size: 0.78rem; font-weight: 600; padding: 0.15rem 0.2rem; cursor: pointer;
  line-height: 1.2; text-decoration: underline; text-underline-offset: 2px;
}
.wb-acct-row-cancel:hover { color: #991b1b; }
.wb-acct-cancel { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--wb-border); }
.wb-acct-cancel-open {
  appearance: none; margin: 0; padding: 0; border: 0; background: transparent;
  color: #b91c1c; font: inherit; font-size: 0.88rem; font-weight: 600; cursor: pointer;
  text-decoration: underline; text-underline-offset: 3px;
}
.wb-acct-cancel-open:hover { color: #991b1b; }
.wb-acct-cancel-open[hidden] { display: none !important; }
.wb-acct-cancel-form {
  display: grid; gap: 10px; margin: 0; padding: 12px 14px;
  border: 1px solid var(--wb-border); border-radius: var(--wb-acct-field-r);
  background: var(--wb-acct-soft, color-mix(in srgb, var(--wb-text) 3%, transparent));
}
.wb-acct-cancel-form[hidden] { display: none !important; }
.wb-acct-order-tracking[hidden] { display: none !important; }
.wb-acct-cancel-title { margin: 0; font-size: 0.92rem; font-weight: 700; color: var(--wb-text); }
.wb-acct-cancel-label { display: grid; gap: 6px; font-size: 0.8rem; font-weight: 600; color: var(--wb-muted); }
.wb-acct-cancel-reason {
  width: 100%; box-sizing: border-box; min-height: 64px; max-height: 140px; resize: vertical;
  padding: 9px 11px; border-radius: calc(var(--wb-acct-field-r) - 2px); border: 1px solid var(--wb-border);
  background: var(--wb-acct-card, var(--wb-bg)); color: var(--wb-text); font: inherit; font-size: 0.9rem; font-weight: 400;
}
.wb-acct-cancel-hint { margin: 0; font-size: 0.76rem; color: var(--wb-muted); font-weight: 400; }
.wb-acct-cancel-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; margin-top: 2px; }
.wb-acct-cancel-keep, .wb-acct-cancel-confirm {
  appearance: none; margin: 0; font: inherit; font-size: 0.84rem; font-weight: 600;
  padding: 0.55rem 0.95rem; border-radius: 8px; cursor: pointer; line-height: 1.2;
}
.wb-acct-cancel-keep {
  border: 1px solid var(--wb-border); background: transparent; color: var(--wb-text);
}
.wb-acct-cancel-keep:hover { background: color-mix(in srgb, var(--wb-text) 4%, transparent); }
.wb-acct-cancel-confirm { border: 0; background: #b91c1c; color: #fff; }
.wb-acct-cancel-confirm:hover { filter: brightness(0.95); }
.wb-acct-cancel-confirm:disabled, .wb-acct-cancel-keep:disabled { opacity: 0.6; cursor: not-allowed; }
.wb-acct-cancel-reason-view { margin: 14px 0 0; font-size: 0.88rem; color: var(--wb-muted); }
.wb-acct-form-msg { margin: 0; font-size: 0.82rem; }
.wb-acct-form-msg.is-error { color: #b91c1c; }
.wb-acct-form-msg.is-ok { color: #15803d; }
@media (max-width: 640px) {
  .wb-acct-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`;
