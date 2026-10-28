/**
 * Styles for the auth (login / register / forgot / OTP) section designs.
 * Interpolated into SITE_CSS, so it must not contain backticks or template
 * placeholders. Breakpoints use the `wb-site` container like the rest of the kit.
 */
export const AUTH_CSS = `
/* =========================================================================
   AUTH SECTION · shared tokens
   ========================================================================= */
.wb-auth.wb-space-none { padding: 0; }
.wb-auth-root {
  --wb-auth-accent: var(--wb-primary);
  --wb-auth-on-accent: var(--wb-on-primary);
  --wb-auth-panel: var(--wb-auth-accent);
  --wb-auth-panel-text: var(--wb-auth-on-accent);
  --wb-auth-card: var(--wb-bg);
  --wb-auth-field-r: max(min(var(--wb-radius), 12px), 4px);
  --wb-auth-card-r: calc(var(--wb-radius) + 12px);
  --wb-auth-ring: color-mix(in srgb, var(--wb-auth-accent) 18%, transparent);
  position: relative;
  width: 100%;
  overflow: hidden;
  color: var(--wb-text);
}
.wb-auth-screen > * { min-height: var(--wb-auth-screen-h, clamp(620px, 100vh, 1000px)); }
.wb-auth-dark {
  --wb-text: var(--wb-auth-panel-text);
  --wb-muted: color-mix(in srgb, var(--wb-auth-panel-text) 64%, transparent);
  --wb-border: color-mix(in srgb, var(--wb-auth-panel-text) 16%, transparent);
  --wb-auth-card: color-mix(in srgb, var(--wb-auth-panel-text) 6%, transparent);
  background: var(--wb-auth-panel);
  color: var(--wb-auth-panel-text);
  color-scheme: dark;
}
.wb-auth-root.wb-auth-v-glass-aurora,
.wb-auth-root.wb-auth-v-dark-wave {
  --wb-auth-panel: color-mix(in srgb, var(--wb-auth-accent) 14%, #060714);
  --wb-auth-panel-text: #f8fafc;
}

/* Brand */
.wb-auth-brand {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--wb-font-heading); font-weight: 800; font-size: 20px;
  letter-spacing: -0.02em; color: inherit;
}
.wb-auth-brand-center { display: flex; justify-content: center; margin-bottom: 28px; }
.wb-auth-brand-stack { display: flex; flex-direction: column; gap: 12px; margin-bottom: 22px; }
.wb-auth-logo { height: 36px; width: auto; max-width: 160px; object-fit: contain; }
.wb-auth-mark {
  display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px;
  background: var(--wb-auth-accent); color: var(--wb-auth-on-accent);
  font-size: 17px; font-weight: 800; line-height: 1;
  box-shadow: 0 8px 20px -10px color-mix(in srgb, var(--wb-auth-accent) 80%, transparent);
}
.wb-auth-brand-stack .wb-auth-mark { width: 52px; height: 52px; border-radius: 16px; font-size: 22px; }
.wb-auth-panel .wb-auth-mark,
.wb-auth-spotlight-copy .wb-auth-mark,
.wb-auth-bleed-caption .wb-auth-mark {
  background: color-mix(in srgb, currentColor 16%, transparent); color: inherit;
  border: 1px solid color-mix(in srgb, currentColor 30%, transparent); box-shadow: none;
}

/* Typography */
.wb-auth-root .wb-auth-title {
  font-family: var(--wb-font-heading); font-weight: 700; line-height: 1.15;
  letter-spacing: -0.02em; font-size: 26px; color: inherit;
}
.wb-auth-h-sm .wb-auth-title { font-size: 22px; }
.wb-auth-h-lg .wb-auth-title { font-size: 32px; }
.wb-auth-root .wb-auth-display {
  font-family: var(--wb-font-heading); font-weight: 800; line-height: 1.05;
  letter-spacing: -0.035em; font-size: 44px; color: inherit;
}
.wb-auth-h-sm .wb-auth-display { font-size: 34px; }
.wb-auth-h-lg .wb-auth-display { font-size: 56px; }
.wb-auth-root .wb-auth-panel-title {
  font-family: var(--wb-font-heading); font-weight: 700; font-size: 28px;
  line-height: 1.2; letter-spacing: -0.02em; color: inherit;
}
.wb-auth-subtitle { margin-top: 8px; color: var(--wb-muted); font-size: 15px; line-height: 1.55; }
.wb-auth-eyebrow { font-size: 12.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.8; margin-bottom: 14px; }
.wb-auth-lead { margin-top: 16px; font-size: 18px; line-height: 1.6; opacity: 0.86; max-width: 480px; }
.wb-auth-sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.wb-auth-inline-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* Form */
.wb-auth-view { width: 100%; }
.wb-auth-head { margin-bottom: 24px; }
.wb-auth-form { display: flex; flex-direction: column; gap: 18px; }
.wb-auth-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 12px; }
.wb-auth-field { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.wb-auth-field-full { grid-column: 1 / -1; }
.wb-auth-label { font-size: 13.5px; font-weight: 600; color: var(--wb-text); }
.wb-auth-required { color: var(--wb-auth-accent); }
.wb-auth-control { position: relative; }
.wb-auth-input {
  width: 100%; height: 48px; padding: 0 14px;
  border: 1px solid var(--wb-border); border-radius: var(--wb-auth-field-r);
  background: var(--wb-auth-card); color: inherit; font-size: 15px; outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}
.wb-auth-input::placeholder { color: var(--wb-muted); opacity: 0.8; }
.wb-auth-input:hover { border-color: color-mix(in srgb, var(--wb-text) 28%, transparent); }
.wb-auth-input:focus { border-color: var(--wb-auth-accent); box-shadow: 0 0 0 4px var(--wb-auth-ring); }
select.wb-auth-input { appearance: none; -webkit-appearance: none; padding-right: 40px; cursor: pointer; }
.wb-auth-control:has(select)::after {
  content: ""; position: absolute; right: 16px; top: 50%; width: 8px; height: 8px;
  border-right: 2px solid var(--wb-muted); border-bottom: 2px solid var(--wb-muted);
  transform: translateY(-70%) rotate(45deg); pointer-events: none;
}
.wb-auth-field-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  width: 18px; height: 18px; color: var(--wb-muted); pointer-events: none;
}
.wb-auth-has-icon .wb-auth-input { padding-left: 44px; }
.wb-auth-has-toggle .wb-auth-input { padding-right: 46px; }
.wb-auth-toggle {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  display: grid; place-items: center; width: 36px; height: 36px; border-radius: 8px;
  background: transparent; color: var(--wb-muted); cursor: pointer; transition: color 0.15s ease, background-color 0.15s ease;
}
.wb-auth-toggle:hover { color: var(--wb-text); background: color-mix(in srgb, var(--wb-text) 6%, transparent); }
.wb-auth-toggle svg { width: 18px; height: 18px; }

.wb-auth-input-filled .wb-auth-input { background: color-mix(in srgb, var(--wb-text) 5%, transparent); border-color: transparent; }
.wb-auth-input-filled .wb-auth-input:focus { background: var(--wb-auth-card); border-color: var(--wb-auth-accent); }
.wb-auth-input-underline .wb-auth-input { border-width: 0 0 1.5px; border-radius: 0; padding-left: 0; background: transparent; }
.wb-auth-input-underline .wb-auth-input:focus { box-shadow: 0 1.5px 0 0 var(--wb-auth-accent); }
.wb-auth-input-underline .wb-auth-has-icon .wb-auth-input { padding-left: 30px; }
.wb-auth-input-underline .wb-auth-field-icon { left: 0; }
.wb-auth-input-underline .wb-auth-toggle { right: 0; }
.wb-auth-input-pill .wb-auth-input { border-radius: 999px; padding: 0 22px; }
.wb-auth-input-pill .wb-auth-has-icon .wb-auth-input { padding-left: 48px; }
.wb-auth-input-pill .wb-auth-field-icon { left: 20px; }
.wb-auth-input-pill .wb-auth-has-toggle .wb-auth-input { padding-right: 50px; }
.wb-auth-input-pill .wb-auth-toggle { right: 8px; border-radius: 999px; }

.wb-auth-check { display: inline-flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--wb-muted); cursor: pointer; line-height: 1.45; }
.wb-auth-check input { width: 18px; height: 18px; margin-top: 1px; flex-shrink: 0; accent-color: var(--wb-auth-accent); cursor: pointer; }
.wb-auth-field.wb-auth-check { flex-direction: row; }
.wb-auth-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.wb-auth-link {
  display: inline-flex; align-items: center; gap: 6px; padding: 0; background: none;
  color: var(--wb-auth-accent); font-size: inherit; font-weight: 600; cursor: pointer;
}
.wb-auth-link:hover { text-decoration: underline; text-underline-offset: 3px; }
.wb-auth-link:disabled { color: var(--wb-muted); cursor: default; text-decoration: none; }
.wb-auth-dark .wb-auth-link, .wb-auth-spotlight .wb-auth-card .wb-auth-link { color: color-mix(in srgb, var(--wb-auth-accent) 70%, var(--wb-text)); }
.wb-auth-root :is(button, a):focus-visible { outline: 2px solid var(--wb-auth-accent); outline-offset: 3px; }

.wb-auth-submit {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; min-height: 50px; padding: 12px 22px;
  border-radius: var(--wb-auth-field-r); background: var(--wb-auth-accent); color: var(--wb-auth-on-accent);
  font-size: 15px; font-weight: 700; letter-spacing: 0.01em; cursor: pointer;
  box-shadow: 0 12px 28px -14px color-mix(in srgb, var(--wb-auth-accent) 85%, transparent);
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.wb-auth-submit:hover { transform: translateY(-1px); filter: brightness(1.06); box-shadow: 0 18px 34px -14px color-mix(in srgb, var(--wb-auth-accent) 90%, transparent); }
.wb-auth-submit:active { transform: translateY(0) scale(0.99); }
.wb-site.wb-buttons-outline .wb-auth-submit { background: transparent; color: var(--wb-auth-accent); border: 2px solid var(--wb-auth-accent); box-shadow: none; }

.wb-auth-btn-pill :is(.wb-auth-submit, .wb-auth-social-btn, .wb-auth-ghost-btn, .wb-auth-tabs, .wb-auth-tab) { border-radius: 999px; }
.wb-auth-btn-square :is(.wb-auth-submit, .wb-auth-social-btn, .wb-auth-ghost-btn, .wb-auth-tabs, .wb-auth-tab) { border-radius: 0; }

.wb-auth-divider { display: flex; align-items: center; gap: 14px; margin: 22px 0; color: var(--wb-muted); font-size: 12.5px; font-weight: 500; }
.wb-auth-divider::before, .wb-auth-divider::after { content: ""; flex: 1; height: 1px; background: var(--wb-border); }
.wb-auth-social { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.wb-auth-social-btn {
  flex: 1 1 0; display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  min-height: 46px; padding: 10px 14px; border: 1px solid var(--wb-border); border-radius: var(--wb-auth-field-r);
  background: var(--wb-auth-card); color: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease, background-color 0.15s ease;
}
.wb-auth-social-btn:hover { border-color: color-mix(in srgb, var(--wb-text) 30%, transparent); transform: translateY(-1px); }
.wb-auth-social-icons .wb-auth-social-btn { max-width: 104px; }
.wb-auth-social-full { flex-direction: column; }
.wb-auth-social-full .wb-auth-social-btn { width: 100%; }
.wb-auth-social-icon { display: inline-grid; place-items: center; width: 20px; height: 20px; }
.wb-auth-social-icon svg { width: 19px; height: 19px; display: block; }

.wb-auth-switch { margin-top: 24px; text-align: center; font-size: 14px; color: var(--wb-muted); }
.wb-auth-note { margin-top: 20px; text-align: center; font-size: 12px; color: var(--wb-muted); opacity: 0.85; }
.wb-auth-error {
  padding: 10px 14px; border-radius: var(--wb-auth-field-r); font-size: 13.5px; font-weight: 600;
  color: #dc2626; background: color-mix(in srgb, #dc2626 9%, transparent);
}
.wb-auth-otp { display: flex; justify-content: center; gap: 10px; }
.wb-auth-otp-cell {
  width: 52px; height: 60px; text-align: center; font-size: 24px; font-weight: 700;
  border: 1.5px solid var(--wb-border); border-radius: var(--wb-auth-field-r);
  background: var(--wb-auth-card); color: inherit; caret-color: var(--wb-auth-accent); outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}
.wb-auth-otp-cell:focus { border-color: var(--wb-auth-accent); box-shadow: 0 0 0 4px var(--wb-auth-ring); transform: translateY(-2px); }
.wb-auth-resend { text-align: center; font-size: 14px; color: var(--wb-muted); }

.wb-auth-success { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: 12px 0; }
.wb-auth-success-icon {
  width: 68px; height: 68px; padding: 16px; margin-bottom: 8px; border-radius: 50%;
  color: var(--wb-auth-accent); background: color-mix(in srgb, var(--wb-auth-accent) 12%, transparent);
}
.wb-auth-success-actions { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; margin-top: 16px; }

.wb-auth-ghost-btn {
  display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 10px 44px; margin-top: 30px;
  border: 1.5px solid currentColor; border-radius: var(--wb-auth-field-r); background: transparent; color: inherit;
  font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.wb-auth-ghost-btn:hover { background: var(--wb-auth-panel-text); color: var(--wb-auth-panel); }

.wb-auth-card { background: var(--wb-auth-card); color: var(--wb-text); border-radius: var(--wb-auth-card-r); padding: 40px; }
.wb-auth-card-float { box-shadow: 0 40px 90px -30px rgb(0 0 0 / 0.45); }
.wb-auth-cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

.wb-auth-highlights { display: grid; gap: 14px; margin-top: 30px; }
.wb-auth-highlights li { display: flex; align-items: center; gap: 12px; font-weight: 500; }
.wb-auth-highlights svg { width: 24px; height: 24px; padding: 4px; border-radius: 50%; background: color-mix(in srgb, currentColor 16%, transparent); }

.wb-auth-quote blockquote { font-size: 17px; line-height: 1.55; font-weight: 500; }
.wb-auth-quote figcaption { display: flex; align-items: center; gap: 12px; margin-top: 18px; font-size: 14px; }
.wb-auth-quote small { display: block; font-size: 13px; opacity: 0.7; }
.wb-auth-avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.wb-auth-avatar-fallback { display: grid; place-items: center; background: var(--wb-auth-accent); color: var(--wb-auth-on-accent); font-weight: 700; }

.wb-auth-blobs { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
.wb-auth-blobs span { position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.55; }
.wb-auth-blobs span:nth-child(1) { width: 440px; height: 440px; top: -140px; left: -100px; background: var(--wb-auth-accent); }
.wb-auth-blobs span:nth-child(2) { width: 380px; height: 380px; bottom: -160px; right: -80px; background: var(--wb-secondary); animation-delay: -4s; }
.wb-auth-blobs span:nth-child(3) { width: 300px; height: 300px; top: 35%; left: 50%; background: color-mix(in srgb, var(--wb-auth-accent) 40%, #22d3ee); animation-delay: -8s; }
.wb-auth-blobs span:nth-child(4) { width: 260px; height: 260px; top: 10%; right: 18%; background: color-mix(in srgb, var(--wb-auth-accent) 40%, #ec4899); animation-delay: -11s; }

/* Animations */
@keyframes wbAuthFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes wbAuthUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes wbAuthSide { from { opacity: 0; transform: translateX(22px); } to { opacity: 1; transform: none; } }
@keyframes wbAuthScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: none; } }
@keyframes wbAuthBlur { from { opacity: 0; filter: blur(10px); } to { opacity: 1; filter: none; } }
@keyframes wbAuthDrift { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(40px, -30px) scale(1.08); } 66% { transform: translate(-30px, 20px) scale(0.95); } }
@keyframes wbAuthBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(10px); } }
@keyframes wbAuthKen { from { transform: scale(1); } to { transform: scale(1.08); } }
.wb-auth-anim-fade :is(.wb-auth-view, .wb-auth-panel-body) { animation: wbAuthFade 0.5s ease both; }
.wb-auth-anim-slide-up :is(.wb-auth-view, .wb-auth-panel-body) { animation: wbAuthUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
.wb-auth-anim-slide-side :is(.wb-auth-view, .wb-auth-panel-body) { animation: wbAuthSide 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
.wb-auth-anim-scale :is(.wb-auth-view, .wb-auth-panel-body) { animation: wbAuthScale 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
.wb-auth-anim-blur :is(.wb-auth-view, .wb-auth-panel-body) { animation: wbAuthBlur 0.6s ease both; }
.wb-auth-anim-slide-up .wb-auth-fields > * { animation: wbAuthUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
.wb-auth-anim-slide-up .wb-auth-fields > :nth-child(2) { animation-delay: 0.04s; }
.wb-auth-anim-slide-up .wb-auth-fields > :nth-child(3) { animation-delay: 0.08s; }
.wb-auth-anim-slide-up .wb-auth-fields > :nth-child(4) { animation-delay: 0.12s; }
.wb-auth-anim-slide-up .wb-auth-fields > :nth-child(n+5) { animation-delay: 0.16s; }
.wb-auth-motion .wb-auth-blobs span { animation: wbAuthDrift 18s ease-in-out infinite; }

/* =========================================================================
   1. Diagonal split
   ========================================================================= */
.wb-auth-diagonal { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); background: var(--wb-auth-card); }
.wb-auth-diagonal .wb-auth-panel {
  position: relative; display: flex; flex-direction: column; padding: 36px 44px;
  background: var(--wb-auth-panel); color: var(--wb-auth-panel-text);
  clip-path: polygon(0 0, 100% 0, 80% 100%, 0 100%);
}
.wb-auth-panel-body { margin: auto; max-width: 360px; padding-right: 14%; text-align: center; }
.wb-auth-panel-body p { margin-top: 14px; font-size: 15px; line-height: 1.6; opacity: 0.88; }
.wb-auth-form-left .wb-auth-diagonal .wb-auth-panel { order: 2; clip-path: polygon(0 0, 100% 0, 100% 100%, 20% 100%); }
.wb-auth-form-left .wb-auth-diagonal .wb-auth-panel-body { padding-right: 0; padding-left: 14%; }
.wb-auth-main { display: flex; align-items: center; justify-content: center; padding: 48px 32px; }
.wb-auth-form-box { width: 100%; max-width: 440px; }
.wb-auth-form-box > .wb-auth-brand { margin-bottom: 36px; }

/* 2. Gradient spotlight */
.wb-auth-spotlight {
  position: relative; display: flex; align-items: center; padding: 72px 24px; overflow: hidden;
  background: linear-gradient(135deg, var(--wb-auth-panel), color-mix(in srgb, var(--wb-auth-panel) 62%, #000));
  color: var(--wb-auth-panel-text);
}
.wb-auth-spotlight .wb-auth-blobs span { opacity: 0.35; }
.wb-auth-spotlight-inner {
  position: relative; z-index: 1; width: 100%; max-width: var(--wb-container); margin: 0 auto;
  display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 460px); gap: 72px; align-items: center;
}
.wb-auth-spotlight-copy .wb-auth-brand { margin-bottom: 48px; }
.wb-auth-form-left .wb-auth-spotlight-copy { order: 2; }
.wb-auth-form-left .wb-auth-spotlight-inner { grid-template-columns: minmax(0, 460px) minmax(0, 1.1fr); }

/* 3. Illustration frame */
.wb-auth-frame-outer { display: flex; align-items: center; justify-content: center; padding: 56px 24px; }
.wb-auth-frame {
  width: 100%; max-width: 1120px; min-height: 620px; padding: 12px;
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  background: var(--wb-auth-card); border: 1px solid var(--wb-border); border-radius: calc(var(--wb-auth-card-r) + 6px);
  box-shadow: 0 34px 80px -40px rgb(15 23 42 / 0.4);
}
.wb-auth-frame-media {
  position: relative; overflow: hidden; min-height: 280px; border-radius: var(--wb-auth-card-r);
  background: linear-gradient(160deg, color-mix(in srgb, var(--wb-auth-accent) 16%, var(--wb-bg)), color-mix(in srgb, var(--wb-auth-accent) 34%, var(--wb-bg)));
}
.wb-auth-frame-art span { position: absolute; border-radius: 28px; background: color-mix(in srgb, var(--wb-auth-accent) 55%, transparent); }
.wb-auth-frame-art span:nth-child(1) { width: 46%; height: 34%; top: 16%; left: 14%; transform: rotate(-8deg); }
.wb-auth-frame-art span:nth-child(2) { width: 38%; height: 38%; top: 34%; right: 12%; border-radius: 50%; background: color-mix(in srgb, var(--wb-secondary) 55%, transparent); }
.wb-auth-frame-art span:nth-child(3) { width: 30%; height: 12%; bottom: 22%; left: 20%; border-radius: 999px; }
.wb-auth-frame-caption {
  position: absolute; left: 18px; right: 18px; bottom: 18px; padding: 22px 24px; border-radius: calc(var(--wb-auth-card-r) - 4px);
  color: #fff; background: color-mix(in srgb, #0b1020 52%, transparent);
  backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgb(255 255 255 / 0.16);
}
.wb-auth-frame-caption .wb-auth-panel-title { font-size: 22px; }
.wb-auth-frame-caption p { margin-top: 6px; font-size: 14.5px; opacity: 0.85; }
.wb-auth-frame-form { display: flex; flex-direction: column; justify-content: center; padding: 40px clamp(24px, 5cqi, 64px); }
.wb-auth-frame-form > .wb-auth-brand { margin-bottom: 36px; }
.wb-auth-form-left .wb-auth-frame-media { order: 2; }

/* 4. Glass aurora */
.wb-auth-aurora { position: relative; display: flex; align-items: center; justify-content: center; padding: 80px 20px; overflow: hidden; }
.wb-auth-aurora .wb-auth-blobs span { opacity: 0.75; filter: blur(90px); }
.wb-auth-glass {
  position: relative; z-index: 1; width: 100%; max-width: 440px; padding: 44px 40px;
  border-radius: calc(var(--wb-auth-card-r) + 6px);
  background: color-mix(in srgb, var(--wb-auth-panel-text) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-auth-panel-text) 16%, transparent);
  backdrop-filter: blur(26px) saturate(170%); -webkit-backdrop-filter: blur(26px) saturate(170%);
  box-shadow: 0 40px 90px -30px rgb(0 0 0 / 0.65), inset 0 1px 0 rgb(255 255 255 / 0.14);
}
.wb-auth-v-glass-aurora .wb-auth-head,
.wb-auth-v-dark-wave .wb-auth-head,
.wb-auth-v-tabbed-compact .wb-auth-head { text-align: center; }

/* 5. Dark wave */
.wb-auth-wave {
  position: relative; display: flex; align-items: center; justify-content: center; padding: 80px 20px 180px; overflow: hidden;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--wb-auth-accent) 22%, var(--wb-auth-panel)), var(--wb-auth-panel) 70%);
}
.wb-auth-wave-content { position: relative; z-index: 1; width: 100%; max-width: 400px; }
.wb-auth-waves { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 220px; z-index: 0; overflow: visible; }
.wb-auth-wave-a { fill: color-mix(in srgb, var(--wb-auth-accent) 16%, transparent); }
.wb-auth-wave-b { fill: color-mix(in srgb, var(--wb-auth-accent) 28%, transparent); }
.wb-auth-wave-c { fill: color-mix(in srgb, var(--wb-auth-accent) 48%, transparent); }
.wb-auth-motion .wb-auth-wave-a { animation: wbAuthBob 9s ease-in-out infinite; }
.wb-auth-motion .wb-auth-wave-b { animation: wbAuthBob 7s ease-in-out infinite reverse; }
.wb-auth-motion .wb-auth-wave-c { animation: wbAuthBob 11s ease-in-out infinite; }

/* 6. Product showcase */
.wb-auth-showcase { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); padding: 16px; background: var(--wb-auth-card); }
.wb-auth-form-right .wb-auth-showcase-panel { order: -1; }
.wb-auth-showcase-panel {
  position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 48px 40px; text-align: center; border-radius: calc(var(--wb-auth-card-r) + 4px);
  background: linear-gradient(160deg, var(--wb-auth-panel), color-mix(in srgb, var(--wb-auth-panel) 70%, #000));
  color: var(--wb-auth-panel-text);
}
.wb-auth-showcase-panel > p { max-width: 380px; opacity: 0.85; }
.wb-auth-rings span { position: absolute; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--wb-auth-panel-text) 18%, transparent); }
.wb-auth-rings span:nth-child(1) { width: 560px; height: 560px; top: -200px; right: -200px; }
.wb-auth-rings span:nth-child(2) { width: 360px; height: 360px; bottom: -140px; left: -120px; }
.wb-auth-device {
  position: relative; width: 100%; max-width: 460px; aspect-ratio: 16 / 10; margin-bottom: 18px; overflow: hidden;
  border-radius: 16px; border: 6px solid color-mix(in srgb, var(--wb-auth-panel-text) 20%, transparent);
  box-shadow: 0 34px 70px -24px rgb(0 0 0 / 0.55);
}
.wb-auth-dots { display: flex; gap: 6px; margin-top: 10px; }
.wb-auth-dots span { width: 8px; height: 8px; border-radius: 999px; background: currentColor; opacity: 0.35; }
.wb-auth-dots span.is-active { width: 24px; opacity: 1; }

/* 7. Minimal editorial */
.wb-auth-editorial { display: flex; flex-direction: column; padding: 32px clamp(24px, 6cqi, 80px); background: var(--wb-auth-card); }
.wb-auth-editorial-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-bottom: 22px; border-bottom: 1px solid currentColor; }
.wb-auth-editorial-step { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; }
.wb-auth-editorial-grid {
  flex: 1; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 420px);
  gap: clamp(40px, 8cqi, 140px); align-items: center; padding: 72px 0;
}
.wb-auth-root .wb-auth-editorial .wb-auth-display { font-size: clamp(44px, 7cqi, 84px); font-weight: 600; line-height: 0.98; letter-spacing: -0.045em; }
.wb-auth-editorial .wb-auth-lead { opacity: 1; color: var(--wb-muted); }
.wb-auth-editorial .wb-auth-eyebrow { opacity: 1; color: var(--wb-muted); }
.wb-auth-editorial .wb-auth-submit { box-shadow: none; text-transform: uppercase; letter-spacing: 0.14em; font-size: 13px; }
.wb-auth-editorial .wb-auth-mark { box-shadow: none; }
.wb-auth-form-left .wb-auth-editorial-copy { order: 2; }
.wb-auth-form-left .wb-auth-editorial-grid { grid-template-columns: minmax(0, 420px) minmax(0, 1.25fr); }

/* 8. Bento grid */
.wb-auth-bento {
  display: grid; gap: 16px; width: 100%; max-width: 1200px; margin: 0 auto; padding: 48px 24px;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 1fr); grid-auto-rows: minmax(130px, auto); grid-auto-flow: dense;
}
.wb-auth-form-right .wb-auth-bento { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.15fr); }
.wb-auth-tile {
  position: relative; overflow: hidden; padding: 28px; border-radius: var(--wb-auth-card-r);
  background: var(--wb-auth-card); border: 1px solid var(--wb-border);
}
.wb-auth-tile-form { grid-row: span 4; display: flex; flex-direction: column; justify-content: center; padding: 40px; }
.wb-auth-tile-form > .wb-auth-brand { margin-bottom: 32px; }
.wb-auth-form-right .wb-auth-tile-form { grid-column: 3; }
.wb-auth-tile-hero {
  grid-column: span 2; min-height: 180px; display: flex; flex-direction: column; justify-content: flex-end; border: 0;
  background: linear-gradient(135deg, var(--wb-auth-panel), color-mix(in srgb, var(--wb-auth-panel) 60%, #000)); color: var(--wb-auth-panel-text);
}
.wb-auth-tile-hero .wb-auth-blobs span { opacity: 0.4; }
.wb-auth-tile-hero > :not(.wb-auth-blobs) { position: relative; z-index: 1; }
.wb-auth-root .wb-auth-tile-hero .wb-auth-display { font-size: 36px; }
.wb-auth-tile-hero p { margin-top: 10px; opacity: 0.85; }
.wb-auth-tile-image { grid-row: span 2; min-height: 240px; padding: 0; }
.wb-auth-tile-stat { display: flex; flex-direction: column; justify-content: flex-end; gap: 4px; }
.wb-auth-tile-stat strong { font-family: var(--wb-font-heading); font-size: 40px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: var(--wb-auth-accent); }
.wb-auth-tile-stat span { font-size: 14px; color: var(--wb-muted); }
.wb-auth-tile-quote { grid-column: span 2; display: flex; align-items: center; }

/* 9. Full-bleed sheet */
.wb-auth-bleed { position: relative; display: flex; align-items: stretch; justify-content: flex-end; overflow: hidden; background: var(--wb-auth-panel); }
.wb-auth-bleed-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.wb-auth-motion .wb-auth-bleed-img { animation: wbAuthKen 26s ease-in-out infinite alternate; }
.wb-auth-bleed-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgb(0 0 0 / 0.6), rgb(0 0 0 / 0.2) 55%, rgb(0 0 0 / 0.05)); }
.wb-auth-bleed-caption {
  position: absolute; z-index: 1; top: 40px; bottom: 48px; left: clamp(24px, 5cqi, 72px); max-width: 460px;
  display: flex; flex-direction: column; justify-content: space-between; color: #fff;
}
.wb-auth-bleed-caption .wb-auth-quote blockquote { font-family: var(--wb-font-heading); font-size: 28px; line-height: 1.3; letter-spacing: -0.01em; }
.wb-auth-sheet {
  position: relative; z-index: 2; width: 100%; max-width: 480px; margin: 16px; padding: 56px 48px;
  display: flex; flex-direction: column; justify-content: center;
  background: var(--wb-auth-card); border-radius: calc(var(--wb-auth-card-r) + 4px);
  box-shadow: -30px 0 90px -20px rgb(0 0 0 / 0.4);
}
.wb-auth-form-left .wb-auth-bleed { justify-content: flex-start; }
.wb-auth-form-left .wb-auth-bleed-caption { left: auto; right: clamp(24px, 5cqi, 72px); text-align: right; align-items: flex-end; }
.wb-auth-form-left .wb-auth-bleed-shade { transform: scaleX(-1); }

/* 10. Tabbed compact */
.wb-auth-tabbed { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 72px 20px; overflow: hidden; }
.wb-auth-grid-bg {
  position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(color-mix(in srgb, var(--wb-text) 16%, transparent) 1px, transparent 1px);
  background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 80%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 80%);
}
.wb-auth-tabbed-head { position: relative; max-width: 580px; margin-bottom: 34px; text-align: center; }
.wb-auth-tabbed-head .wb-auth-lead { margin-left: auto; margin-right: auto; color: var(--wb-muted); opacity: 1; }
.wb-auth-gradient-text {
  background: linear-gradient(120deg, var(--wb-text) 15%, var(--wb-auth-accent) 60%, var(--wb-secondary));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.wb-auth-root .wb-auth-gradient-text { color: transparent; }
.wb-auth-tabbed-card { position: relative; width: 100%; max-width: 440px; border: 1px solid var(--wb-border); box-shadow: 0 30px 70px -35px rgb(15 23 42 / 0.4); }
.wb-auth-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; margin-bottom: 28px; border-radius: calc(var(--wb-auth-field-r) + 4px); background: color-mix(in srgb, var(--wb-text) 6%, transparent); }
.wb-auth-tab { min-height: 40px; border-radius: var(--wb-auth-field-r); background: transparent; color: var(--wb-muted); font-size: 14px; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease; }
.wb-auth-tab[aria-selected="true"] { background: var(--wb-auth-card); color: var(--wb-text); box-shadow: 0 1px 3px rgb(0 0 0 / 0.12), 0 4px 12px -6px rgb(0 0 0 / 0.12); }

/* Responsive */
@container wb-site (max-width: 900px) {
  .wb-auth-screen > * { min-height: 0; }
  .wb-auth-diagonal, .wb-auth-showcase, .wb-auth-frame { grid-template-columns: minmax(0, 1fr); }
  .wb-auth-diagonal .wb-auth-panel,
  .wb-auth-form-left .wb-auth-diagonal .wb-auth-panel { order: 0; padding: 28px 24px 64px; clip-path: polygon(0 0, 100% 0, 100% 82%, 0 100%); }
  .wb-auth-panel-body,
  .wb-auth-form-left .wb-auth-diagonal .wb-auth-panel-body { padding: 0; margin-top: 28px; }
  .wb-auth-ghost-btn { margin-top: 20px; }
  .wb-auth-spotlight-inner,
  .wb-auth-form-left .wb-auth-spotlight-inner { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .wb-auth-form-left .wb-auth-spotlight-copy { order: 0; }
  .wb-auth-spotlight-copy .wb-auth-brand { margin-bottom: 28px; }
  .wb-auth-frame { min-height: 0; }
  .wb-auth-frame-media { min-height: 240px; }
  .wb-auth-form-left .wb-auth-frame-media { order: 0; }
  .wb-auth-showcase-panel, .wb-auth-form-right .wb-auth-showcase-panel { order: 2; padding: 36px 24px; }
  .wb-auth-editorial-grid,
  .wb-auth-form-left .wb-auth-editorial-grid { grid-template-columns: minmax(0, 1fr); padding: 48px 0; gap: 40px; }
  .wb-auth-form-left .wb-auth-editorial-copy { order: 0; }
  .wb-auth-bento, .wb-auth-form-right .wb-auth-bento { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wb-auth-tile-form, .wb-auth-form-right .wb-auth-tile-form { grid-column: 1 / -1; grid-row: auto; }
  .wb-auth-tile-image { grid-row: span 1; min-height: 200px; }
  .wb-auth-bleed, .wb-auth-form-left .wb-auth-bleed { flex-direction: column; justify-content: flex-end; align-items: center; padding-top: 120px; }
  .wb-auth-bleed-caption, .wb-auth-form-left .wb-auth-bleed-caption { left: 24px; right: 24px; top: 32px; bottom: auto; text-align: left; align-items: flex-start; }
  .wb-auth-bleed-caption .wb-auth-quote { display: none; }
  .wb-auth-sheet { max-width: 560px; width: calc(100% - 32px); }
}
@container wb-site (max-width: 600px) {
  .wb-auth-fields { grid-template-columns: minmax(0, 1fr); }
  .wb-auth-field-half { grid-column: 1 / -1; }
  .wb-auth-main { padding: 36px 20px; }
  .wb-auth-card, .wb-auth-glass { padding: 30px 22px; }
  .wb-auth-sheet { padding: 36px 22px; margin: 12px; width: calc(100% - 24px); }
  .wb-auth-frame-outer { padding: 24px 12px; }
  .wb-auth-frame-form { padding: 28px 16px; }
  .wb-auth-tile-form { padding: 28px 20px; }
  .wb-auth-spotlight, .wb-auth-aurora, .wb-auth-tabbed { padding: 48px 16px; }
  .wb-auth-wave { padding: 56px 16px 150px; }
  .wb-auth-bento, .wb-auth-form-right .wb-auth-bento { grid-template-columns: minmax(0, 1fr); padding: 24px 12px; }
  .wb-auth-tile-hero, .wb-auth-tile-quote { grid-column: auto; }
  .wb-auth-root .wb-auth-display { font-size: 34px; }
  .wb-auth-root .wb-auth-title { font-size: 24px; }
  .wb-auth-otp { gap: 8px; }
  .wb-auth-otp-cell { width: 44px; height: 52px; font-size: 20px; }
  .wb-auth-social-icons .wb-auth-social-btn { max-width: none; }
  .wb-auth-editorial-step { display: none; }
}
`;
