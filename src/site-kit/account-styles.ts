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
.wb-acct-message[hidden], .wb-acct-cart-total[hidden] { display: none !important; }

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
}
.wb-acct-tab:hover { color: var(--wb-text); background: var(--wb-acct-soft); }
.wb-acct-tab.is-active { background: var(--wb-acct-accent); color: var(--wb-acct-on-accent); }

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
.wb-acct-badge.is-paid { background: color-mix(in srgb, #16a34a 14%, transparent); color: #15803d; }
.wb-acct-badge.is-pending { background: color-mix(in srgb, #f59e0b 16%, transparent); color: #b45309; }
.wb-acct-badge.is-failed, .wb-acct-badge.is-cancelled { background: color-mix(in srgb, #dc2626 12%, transparent); color: #b91c1c; }
.wb-acct-cart-total {
  display: flex; justify-content: space-between; align-items: center; padding: 10px 14px 0;
  border-top: 1px solid var(--wb-border); font-size: 0.95rem;
}
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
  background: var(--wb-acct-card); border: 1px solid var(--wb-border);
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
   overview-cards
   ========================================================================= */
.wb-acct-v-overview-cards .wb-acct-topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.wb-acct-v-overview-cards .wb-acct-heading { margin-bottom: 14px; }
.wb-acct-v-overview-cards .wb-acct-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); align-items: start; }
.wb-acct-v-overview-cards .wb-acct-panel {
  padding: 22px; border-radius: var(--wb-acct-card-r); background: var(--wb-acct-card); border: 1px solid var(--wb-border);
  box-shadow: 0 18px 40px -32px color-mix(in srgb, var(--wb-text) 40%, transparent);
}
.wb-acct-v-overview-cards .wb-acct-panel-title { display: flex; align-items: center; gap: 10px; }
.wb-acct-v-overview-cards .wb-acct-panel-title::before {
  content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--wb-acct-accent);
}

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
.wb-acct-v-dark-panel .wb-acct-badge.is-paid { color: #86efac; }
.wb-acct-v-dark-panel .wb-acct-badge.is-pending { color: #fcd34d; }
.wb-acct-v-dark-panel .wb-acct-badge.is-failed, .wb-acct-v-dark-panel .wb-acct-badge.is-cancelled { color: #fca5a5; }
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
  .wb-acct-v-overview-cards .wb-acct-panel { padding: 18px; }
  .wb-acct-row { flex-wrap: wrap; }
  .wb-acct-row-amount { width: 100%; text-align: right; }
}
`;
