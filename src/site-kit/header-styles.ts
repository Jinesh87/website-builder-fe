/**
 * Styles for the premium header designs (glass dock, split stacked, command bar,
 * mega menu grid, side drawer, headline ticker, luxury editorial, clean transparent).
 * Interpolated into SITE_CSS, so it must not contain backticks or template
 * placeholders. Breakpoints use the `wb-site` container like the rest of the kit.
 */
export const PREMIUM_HEADER_CSS = `
@keyframes wbPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.82); }
}
@keyframes wbMarquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes wbCurtainSlide {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Shared building blocks */
.wb-nav-item { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex-shrink: 0; }
.wb-dropdown-menu::before { content: ""; position: absolute; left: 0; right: 0; top: -10px; height: 10px; }
.wb-announcement-link { display: inline-flex; align-items: center; gap: 4px; }
.wb-announcement-link svg { flex-shrink: 0; }

.wb-status-beacon {
  display: inline-block; width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  background: #22c55e; box-shadow: 0 0 0 3px rgb(34 197 94 / 0.2);
  animation: wbPulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.wb-status-beacon.wb-status-blue { background: #3b82f6; box-shadow: 0 0 0 3px rgb(59 130 246 / 0.2); }
.wb-status-beacon.wb-status-orange { background: #f97316; box-shadow: 0 0 0 3px rgb(249 115 22 / 0.2); }
.wb-status-beacon.wb-status-purple { background: #a855f7; box-shadow: 0 0 0 3px rgb(168 85 247 / 0.2); }
.wb-status-beacon.wb-status-red { background: #ef4444; box-shadow: 0 0 0 3px rgb(239 68 68 / 0.22); }

.wb-header.wb-hd {
  background: color-mix(in srgb, var(--wb-bg) 90%, transparent);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  border-bottom: 1px solid var(--wb-border);
}
.wb-hd-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-left: auto; }
.wb-hd .wb-header-cta { gap: 10px; }
.wb-hd .wb-btn {
  min-height: 40px; padding: 8px 18px; font-size: 14px; border-width: 1px; white-space: nowrap; letter-spacing: -0.005em;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, opacity 150ms ease;
}
.wb-hd .wb-btn:hover { opacity: 1; }
.wb-hd .wb-btn-primary { box-shadow: 0 1px 2px rgb(0 0 0 / 0.08), inset 0 1px 0 rgb(255 255 255 / 0.14); }
.wb-hd .wb-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px -8px color-mix(in srgb, var(--wb-primary) 70%, transparent); }
.wb-hd .wb-btn-secondary { background: var(--wb-bg); }
.wb-hd .wb-btn-secondary:hover { border-color: color-mix(in srgb, var(--wb-text) 30%, transparent); }
.wb-hd .wb-mobile-toggle-btn { width: 40px; height: 40px; border-radius: 9999px; background: var(--wb-bg); }
.wb-hd .wb-mobile-toggle-btn svg { width: 20px; height: 20px; }

.wb-hd-nav { display: flex; align-items: center; gap: 2px; min-width: 0; font-size: 14px; font-weight: 500; white-space: nowrap; }
.wb-hd-nav .wb-nav-item,
.wb-hd-nav .wb-dropdown-trigger {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 9999px;
  color: color-mix(in srgb, var(--wb-text) 72%, transparent);
  transition: color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
}
.wb-hd-nav .wb-nav-item:hover,
.wb-hd-nav .wb-dropdown-trigger:hover,
.wb-hd-nav .wb-dropdown:focus-within > .wb-dropdown-trigger,
.wb-hd-nav .wb-mega-dropdown:hover > .wb-dropdown-trigger,
.wb-hd-nav .wb-mega-dropdown:focus-within > .wb-dropdown-trigger {
  color: var(--wb-text);
  background: color-mix(in srgb, var(--wb-text) 6%, transparent);
}
.wb-hd .wb-dropdown-menu {
  left: 0; min-width: 260px; padding: 6px; border: 0; border-radius: 14px;
  box-shadow: 0 0 0 1px var(--wb-border), 0 24px 48px -16px rgb(0 0 0 / 0.24);
  white-space: normal;
}
.wb-hd .wb-dropdown-item { padding: 10px 12px; border-radius: 10px; }
.wb-hd .wb-dropdown-item:hover { background: color-mix(in srgb, var(--wb-text) 5%, transparent); color: var(--wb-text); }

.wb-hd-chip {
  display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 9999px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.02em; white-space: nowrap;
  color: var(--wb-primary);
  background: color-mix(in srgb, var(--wb-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-primary) 22%, transparent);
}
.wb-hd-icon-btn {
  display: inline-grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; border-radius: 9999px;
  border: 1px solid var(--wb-border); background: var(--wb-bg); color: var(--wb-text); cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
}
.wb-hd-icon-btn:hover { border-color: color-mix(in srgb, var(--wb-text) 28%, transparent); background: color-mix(in srgb, var(--wb-text) 4%, var(--wb-bg)); }
.wb-hd-icon-btn svg { width: 17px; height: 17px; }

.wb-hd-search {
  display: inline-flex; align-items: center; gap: 10px; height: 40px; min-width: 0; padding: 0 8px 0 14px;
  border-radius: 9999px; border: 1px solid var(--wb-border);
  background: color-mix(in srgb, var(--wb-text) 3%, var(--wb-bg));
  color: var(--wb-muted); font: inherit; font-size: 13px; cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
}
.wb-hd-search:hover {
  border-color: color-mix(in srgb, var(--wb-primary) 45%, var(--wb-border));
  background: var(--wb-bg);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--wb-primary) 10%, transparent);
}
.wb-hd-search > svg { width: 16px; height: 16px; flex-shrink: 0; }
.wb-hd-search-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
.wb-kbd {
  display: inline-flex; align-items: center; justify-content: center; gap: 2px; height: 22px; min-width: 22px; padding: 0 6px;
  border-radius: 6px; border: 1px solid var(--wb-border); background: var(--wb-bg);
  box-shadow: 0 1px 0 var(--wb-border); color: var(--wb-muted);
  font-family: inherit; font-size: 11px; font-weight: 600; line-height: 1; flex-shrink: 0;
}
.wb-kbd svg { width: 11px; height: 11px; }

/* Glass dock */
.wb-header.wb-header-glass-dock {
  background: transparent; border-bottom: 0; padding: 14px 16px;
  backdrop-filter: none; -webkit-backdrop-filter: none;
}
.wb-dock {
  max-width: min(1180px, 100%); margin: 0 auto; display: flex; align-items: center; gap: 16px; min-height: 60px;
  padding: 8px 8px 8px 22px; border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-bg) 80%, transparent);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid color-mix(in srgb, var(--wb-text) 10%, transparent);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.35), 0 18px 40px -18px rgb(0 0 0 / 0.28), 0 2px 6px -2px rgb(0 0 0 / 0.06);
}
.wb-dock-brand { display: flex; align-items: center; gap: 12px; flex-shrink: 0; min-width: 0; }
.wb-dock-badge {
  display: inline-flex; align-items: center; gap: 7px; height: 26px; padding: 0 10px; border-radius: 9999px;
  font-size: 11.5px; font-weight: 600; color: var(--wb-text); white-space: nowrap;
  background: color-mix(in srgb, var(--wb-text) 5%, transparent); border: 1px solid var(--wb-border);
}
.wb-dock-nav {
  margin: 0 auto; padding: 4px; border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-text) 6%, transparent);
}
.wb-dock-nav .wb-nav-item, .wb-dock-nav .wb-dropdown-trigger { padding: 7px 14px; font-size: 13.5px; }
.wb-dock-nav .wb-nav-item:hover,
.wb-dock-nav .wb-dropdown-trigger:hover,
.wb-dock-nav .wb-dropdown:focus-within > .wb-dropdown-trigger {
  background: var(--wb-bg);
  box-shadow: 0 0 0 1px var(--wb-border), 0 1px 3px rgb(0 0 0 / 0.08);
}
.wb-dock .wb-btn { border-radius: 9999px; }
.wb-dock-search { width: 210px; }

/* Split stacked */
.wb-stacked-top { background: var(--wb-text); color: color-mix(in srgb, var(--wb-bg) 76%, transparent); font-size: 12.5px; }
.wb-stacked-top-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 38px; }
.wb-stacked-status { display: inline-flex; align-items: center; gap: 9px; min-width: 0; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wb-stacked-utility { display: flex; align-items: center; gap: 22px; flex-shrink: 0; }
.wb-stacked-utility-link { color: inherit; white-space: nowrap; transition: color 150ms ease; }
.wb-stacked-utility-link:hover { color: var(--wb-bg); }
.wb-stacked-currency {
  padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; color: var(--wb-bg);
  border: 1px solid color-mix(in srgb, var(--wb-bg) 24%, transparent);
}
.wb-stacked-main { display: flex; align-items: center; gap: 28px; min-height: 72px; }
.wb-stacked-brand { display: flex; align-items: center; gap: 14px; flex-shrink: 0; min-width: 0; }
.wb-stacked-tagline {
  max-width: 240px; padding-left: 14px; border-left: 1px solid var(--wb-border);
  font-size: 12.5px; color: var(--wb-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.wb-stacked-nav { margin: 0 auto; }


/* Mega menu grid */
.wb-mega-bar { position: relative; display: flex; align-items: center; gap: 24px; min-height: 72px; }
.wb-mega-nav { margin: 0 auto; }
.wb-mega-dropdown { position: static; display: inline-flex; }
.wb-mega-trigger svg { width: 14px; height: 14px; opacity: 0.6; transition: transform 200ms ease; }
.wb-mega-dropdown:hover .wb-mega-trigger svg, .wb-mega-dropdown:focus-within .wb-mega-trigger svg { transform: rotate(180deg); }
.wb-mega-panel {
  position: absolute; top: 100%; left: 16px; right: 16px; z-index: 60; padding-top: 10px;
  visibility: hidden; opacity: 0; transform: translateY(-6px); pointer-events: none;
  transition: opacity 180ms ease, transform 180ms ease, visibility 0s linear 180ms;
}
.wb-mega-dropdown:hover .wb-mega-panel, .wb-mega-dropdown:focus-within .wb-mega-panel {
  visibility: visible; opacity: 1; transform: none; pointer-events: auto; transition-delay: 0s;
}
.wb-mega-card {
  display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; padding: 20px; border-radius: 18px;
  background: var(--wb-bg); border: 1px solid var(--wb-border); white-space: normal;
  box-shadow: 0 32px 64px -24px rgb(0 0 0 / 0.28), 0 8px 20px -8px rgb(0 0 0 / 0.08);
}
.wb-mega-card-featured { grid-template-columns: minmax(0, 1fr) 300px; }
.wb-mega-heading { display: flex; flex-direction: column; gap: 4px; padding: 4px 12px 14px; margin-bottom: 8px; border-bottom: 1px solid var(--wb-border); }
.wb-mega-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--wb-muted); }
.wb-mega-intro { margin: 0; font-size: 13.5px; color: var(--wb-text); }
.wb-mega-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; }
.wb-mega-card:not(.wb-mega-card-featured) .wb-mega-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.wb-mega-item { display: flex; align-items: flex-start; gap: 14px; padding: 12px; border-radius: 12px; color: var(--wb-text); transition: background-color 150ms ease; }
.wb-mega-item:hover { background: color-mix(in srgb, var(--wb-text) 4%, transparent); }
.wb-mega-item-icon {
  display: grid; place-items: center; width: 38px; height: 38px; flex-shrink: 0; border-radius: 10px;
  color: var(--wb-primary);
  background: color-mix(in srgb, var(--wb-primary) 9%, var(--wb-bg));
  border: 1px solid color-mix(in srgb, var(--wb-primary) 16%, transparent);
  transition: background-color 150ms ease, color 150ms ease;
}
.wb-mega-item:hover .wb-mega-item-icon { background: var(--wb-primary); color: var(--wb-on-primary); }
.wb-mega-item-icon svg { width: 18px; height: 18px; }
.wb-mega-item-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.wb-mega-item-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
.wb-mega-item-desc { font-size: 12.5px; line-height: 1.45; color: var(--wb-muted); }
.wb-mega-feature {
  position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 10px; padding: 22px; border-radius: 14px;
  color: var(--wb-on-primary);
  background:
    radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--wb-on-primary) 18%, transparent), transparent 55%),
    linear-gradient(160deg, var(--wb-primary), color-mix(in srgb, var(--wb-primary) 70%, #000));
}
.wb-mega-feature-badge {
  align-self: flex-start; padding: 3px 10px; border-radius: 9999px;
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  background: color-mix(in srgb, var(--wb-on-primary) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-on-primary) 26%, transparent);
}
.wb-mega-feature-title { font-family: var(--wb-font-heading); font-size: 18px; font-weight: 700; line-height: 1.25; letter-spacing: -0.01em; }
.wb-mega-feature-desc { margin: 0; font-size: 13px; line-height: 1.5; opacity: 0.86; }
.wb-mega-feature-link { margin-top: auto; padding-top: 6px; display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; }
.wb-mega-feature-link svg { transition: transform 150ms ease; }
.wb-mega-feature-link:hover svg { transform: translateX(3px); }

/* Side drawer */
.wb-side-bar { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 20px; min-height: 76px; }
.wb-side-brand { grid-column: 1; display: flex; align-items: center; min-width: 0; }
.wb-side-tagline {
  grid-column: 2; display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px; border-radius: 9999px;
  border: 1px solid var(--wb-border); font-size: 11.5px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--wb-muted); white-space: nowrap;
}
.wb-side-tagline-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--wb-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--wb-primary) 18%, transparent); }
.wb-side-actions { grid-column: 3; justify-self: end; display: flex; align-items: center; gap: 10px; }
.wb-side-cta { display: inline-flex; }
.wb-side-trigger {
  display: inline-flex; align-items: center; gap: 12px; height: 42px; padding: 0 5px 0 18px; border-radius: 9999px;
  border: 1px solid var(--wb-border); background: var(--wb-bg); color: var(--wb-text);
  font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.wb-side-trigger:hover { border-color: color-mix(in srgb, var(--wb-text) 30%, transparent); box-shadow: 0 8px 20px -12px rgb(0 0 0 / 0.35); }
.wb-side-trigger-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: var(--wb-text); color: var(--wb-bg); }
.wb-side-trigger-icon svg { width: 16px; height: 16px; }

/* Curtain menu (side drawer + luxury editorial) */
.wb-curtain-portal { position: fixed; inset: 0; z-index: 10000; display: flex; justify-content: flex-end; }
.wb-curtain-backdrop {
  position: absolute; inset: 0; background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: wbFadeIn 200ms ease;
}
.wb-curtain-panel {
  position: relative; z-index: 1; display: flex; flex-direction: column; width: min(480px, 100%); height: 100%;
  background: var(--wb-bg); color: var(--wb-text);
  box-shadow: -24px 0 60px -20px rgb(0 0 0 / 0.35);
  animation: wbCurtainSlide 320ms cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-curtain-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 28px; border-bottom: 1px solid var(--wb-border); }
.wb-curtain-close-btn {
  display: grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; border-radius: 50%;
  border: 1px solid var(--wb-border); background: var(--wb-bg); color: var(--wb-text); cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, transform 250ms ease;
}
.wb-curtain-close-btn:hover { background: var(--wb-text); color: var(--wb-bg); transform: rotate(90deg); }
.wb-curtain-close-btn svg { width: 18px; height: 18px; }
.wb-curtain-body { flex: 1; overflow-y: auto; padding: 12px 28px 28px; }
.wb-curtain-nav { display: flex; flex-direction: column; }
.wb-curtain-link {
  display: grid; grid-template-columns: 36px minmax(0, 1fr) auto; align-items: center; gap: 16px;
  padding: 18px 0; border-bottom: 1px solid var(--wb-border); color: var(--wb-text); transition: color 200ms ease;
}
.wb-curtain-link-num { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; font-variant-numeric: tabular-nums; color: var(--wb-muted); }
.wb-curtain-link-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.wb-curtain-link-text {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--wb-font-heading); font-size: 26px; font-weight: 600; line-height: 1.15; letter-spacing: -0.02em;
  transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-curtain-link-desc { font-size: 13px; color: var(--wb-muted); }
.wb-curtain-link-arrow { width: 18px; height: 18px; color: var(--wb-muted); opacity: 0; transform: translateX(-6px); transition: opacity 200ms ease, transform 200ms ease, color 200ms ease; }
.wb-curtain-link:hover { color: var(--wb-primary); }
.wb-curtain-link:hover .wb-curtain-link-text { transform: translateX(6px); }
.wb-curtain-link:hover .wb-curtain-link-arrow { opacity: 1; transform: none; color: var(--wb-primary); }
.wb-curtain-footer {
  display: flex; flex-direction: column; gap: 18px; padding: 24px 28px 28px; border-top: 1px solid var(--wb-border);
  background: color-mix(in srgb, var(--wb-text) 3%, var(--wb-bg));
}
.wb-curtain-meta { display: flex; flex-direction: column; gap: 4px; }
.wb-curtain-meta-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--wb-muted); }
.wb-curtain-email { font-size: 15px; font-weight: 600; color: var(--wb-text); overflow-wrap: anywhere; transition: color 150ms ease; }
.wb-curtain-email:hover { color: var(--wb-primary); }
.wb-curtain-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.wb-curtain-actions .wb-btn { width: 100%; }

/* Headline ticker */
.wb-ticker { background: var(--wb-text); color: var(--wb-bg); font-size: 13px; }
.wb-ticker-inner { display: flex; align-items: center; gap: 16px; min-height: 40px; }
.wb-ticker-label {
  display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; padding: 4px 10px 4px 8px; border-radius: 6px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  background: color-mix(in srgb, var(--wb-bg) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-bg) 16%, transparent);
}
.wb-ticker-viewport {
  flex: 1; min-width: 0; overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}
.wb-ticker-track { display: flex; width: max-content; animation: wbMarquee var(--wb-ticker-duration, 32s) linear infinite; }
.wb-ticker-viewport:hover .wb-ticker-track { animation-play-state: paused; }
.wb-ticker-group { display: flex; align-items: center; justify-content: space-around; flex-shrink: 0; min-width: 100cqw; }
.wb-ticker-item {
  display: inline-flex; align-items: center; gap: 16px; padding-right: 16px; white-space: nowrap; font-weight: 500;
  color: color-mix(in srgb, var(--wb-bg) 88%, transparent);
}
.wb-ticker-sep { width: 4px; height: 4px; border-radius: 50%; background: var(--wb-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--wb-primary) 28%, transparent); }
.wb-ticker-link { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; font-size: 12.5px; font-weight: 600; color: var(--wb-bg); white-space: nowrap; }
.wb-ticker-link svg { transition: transform 150ms ease; }
.wb-ticker-link:hover svg { transform: translateX(3px); }
.wb-ticker-bar { display: flex; align-items: center; gap: 28px; min-height: 70px; }
.wb-ticker-nav { margin: 0 auto; }


/* Clean transparent */
.wb-header.wb-hd.wb-header-clean-transparent {
  background: transparent; border-bottom: 1px solid transparent;
  backdrop-filter: none; -webkit-backdrop-filter: none;
  transition: background-color 200ms ease, border-color 200ms ease;
}
.wb-header.wb-header-clean-transparent.wb-pos-static { position: absolute; top: 0; left: 0; right: 0; }
.wb-header.wb-hd.wb-header-clean-transparent:is(.wb-pos-sticky, .wb-pos-fixed, .wb-pos-floating) {
  background: color-mix(in srgb, var(--wb-bg) 72%, transparent);
  border-bottom-color: color-mix(in srgb, var(--wb-text) 8%, transparent);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
}
.wb-clean { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 24px; min-height: 80px; }
.wb-clean > .wb-brand { justify-self: start; }
.wb-clean-nav { justify-self: center; }
.wb-clean-nav .wb-nav-item, .wb-clean-nav .wb-dropdown-trigger { padding: 8px 14px; font-size: 14.5px; }
.wb-clean-actions { justify-self: end; margin-left: 0; }
.wb-header-clean-transparent .wb-btn { border-radius: 9999px; padding: 8px 20px; }
.wb-header-clean-transparent .wb-btn-secondary { background: transparent; border-color: transparent; }
.wb-header-clean-transparent .wb-btn-secondary:hover { border-color: var(--wb-border); }
.wb-header-clean-transparent .wb-mobile-toggle-btn { background: transparent; }

/* Mobile drawer extras */
.wb-drawer-utility { display: flex; flex-wrap: wrap; gap: 8px 18px; padding-top: 16px; border-top: 1px solid var(--wb-border); font-size: 13px; }
.wb-drawer-utility-link { color: var(--wb-muted); transition: color 150ms ease; }
.wb-drawer-utility-link:hover { color: var(--wb-primary); }

/* Responsive */
@container wb-site (max-width: 1240px) {
  .wb-stacked-tagline { display: none; }
}
@container wb-site (max-width: 1180px) {
  .wb-dock-search { width: 40px; padding: 0; justify-content: center; }
  .wb-dock-search .wb-hd-search-label, .wb-dock-search .wb-kbd { display: none; }
}
@container wb-site (max-width: 1060px) {
  .wb-hd .wb-header-cta .wb-btn-secondary, .wb-side-tagline { display: none; }
}
@container wb-site (max-width: 900px) {
  .wb-hd-nav, .wb-stacked-top, .wb-dock-badge { display: none; }
  .wb-dock { min-height: 56px; padding: 6px 6px 6px 18px; }
  .wb-stacked-main, .wb-mega-bar, .wb-ticker-bar { min-height: 64px; gap: 12px; }
  .wb-side-bar { grid-template-columns: minmax(0, 1fr) auto; min-height: 68px; }
  .wb-side-actions { grid-column: 2; }
  .wb-clean { grid-template-columns: minmax(0, 1fr) auto; min-height: 68px; }
}
@container wb-site (max-width: 600px) {
  .wb-side-cta, .wb-side-trigger-label, .wb-ticker-link { display: none; }
  .wb-side-trigger { padding: 0 4px; gap: 0; }
  .wb-header.wb-header-glass-dock { padding: 10px 12px; }
  .wb-ticker-inner { gap: 12px; }
  .wb-curtain-header, .wb-curtain-body, .wb-curtain-footer { padding-left: 20px; padding-right: 20px; }
  .wb-curtain-link { gap: 12px; padding: 16px 0; }
  .wb-curtain-link-text { font-size: 22px; }
}

/* ---------------- Vintage Editorial Header (Vintage Reels) ---------------- */
.wb-header.wb-header-vintage-editorial {
  background: var(--vr-ink, #131210);
  color: #EDE7DA;
  border-bottom: 0;
}
.wb-header-vintage-editorial .wb-header-inner {
  position: relative;
  min-height: 60px;
  gap: 24px;
}
.wb-header-vintage-editorial .wb-brand img { max-height: 46px; }
.wb-header-vintage-editorial .wb-nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  gap: 26px;
  font-family: var(--wb-font-body);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.wb-header-vintage-editorial .wb-nav > span { position: relative; }
.wb-header-vintage-editorial .wb-nav a { color: #EDE7DA; padding: 21px 0; }
.wb-header-vintage-editorial .wb-nav a:hover { color: var(--vr-gold, #E6AD4A); }
.wb-header-vintage-editorial .wb-nav [data-wb-current] a { color: #FFFFFF; font-weight: 600; }
.wb-header-vintage-editorial .wb-nav [data-wb-current]::after {
  content: "";
  position: absolute;
  left: -8px;
  right: -8px;
  bottom: 14px;
  height: 2px;
  background: var(--vr-gold, #E6AD4A);
}
.wb-header-vintage-editorial .wb-header-cta .wb-btn {
  min-height: 36px;
  height: 36px;
  padding: 0 20px;
  border: 0;
  border-radius: 2px;
  background: var(--vr-gold, #E6AD4A);
  color: var(--vr-text, #1D1910);
  box-shadow: none;
  font-family: var(--wb-font-body);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.wb-header-vintage-editorial .wb-header-cta .wb-btn:hover { background: #F0BC5F; color: var(--vr-text, #1D1910); transform: none; }
@container wb-site (max-width: 960px) {
  .wb-header-vintage-editorial .wb-nav { position: static; transform: none; }
}
@media (max-width: 960px) {
  .wb-header-vintage-editorial .wb-nav { position: static; transform: none; }
}
`;
