/**
 * Styles for the phone-first header designs (contact top bar, call now, contact stacked,
 * centered phone) in src/site-kit/layout/ContactHeader.tsx. Interpolated into SITE_CSS,
 * so it must not contain backticks or template placeholders.
 */
export const CONTACT_HEADER_CSS = `
.wb-ch-icon { width: 15px; height: 15px; flex-shrink: 0; }
.wb-ch-inline { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 22px; min-width: 0; }
.wb-ch-item { display: inline-flex; align-items: center; gap: 7px; color: inherit; text-decoration: none; white-space: nowrap; }
a.wb-ch-item:hover { opacity: 0.8; }
.wb-ch-utility { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 18px; margin-left: auto; }
.wb-ch-utility a { color: inherit; text-decoration: none; opacity: 0.85; }
.wb-ch-utility a:hover { opacity: 1; text-decoration: underline; }

/* Tap-to-call button (phones and tablets) */
.wb-ch-call-btn {
  display: none; align-items: center; justify-content: center; width: 42px; height: 42px; flex-shrink: 0;
  border-radius: 9999px; background: var(--wb-primary); color: var(--wb-on-primary); text-decoration: none;
}
.wb-ch-call-btn .wb-ch-icon { width: 18px; height: 18px; }
.wb-ch-mobile-only { display: none; }

/* Phone block: round icon + label + number */
.wb-ch-phone-block { display: inline-flex; align-items: center; gap: 10px; color: inherit; text-decoration: none; white-space: nowrap; }
.wb-ch-phone-icon {
  display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; flex-shrink: 0;
  border-radius: 9999px; background: color-mix(in srgb, var(--wb-primary) 12%, transparent); color: var(--wb-primary);
}
.wb-ch-phone-icon .wb-ch-icon { width: 18px; height: 18px; }
.wb-ch-phone-text { display: flex; flex-direction: column; line-height: 1.2; }
.wb-ch-phone-label { font-size: 12px; opacity: 0.7; }
.wb-ch-phone-number { font-family: var(--wb-font-heading); font-size: 17px; font-weight: 700; }
.wb-ch-phone-block:hover .wb-ch-phone-number { color: var(--wb-primary); }
.wb-ch-phone-compact .wb-ch-phone-icon { width: 34px; height: 34px; }
.wb-ch-phone-compact .wb-ch-phone-number { font-size: 15px; }

/* Contact top bar */
.wb-header-contact-topbar .wb-ch-topbar { background: var(--wb-primary); color: var(--wb-on-primary); font-size: 13px; }
.wb-ch-topbar-inner { display: flex; align-items: center; justify-content: space-between; gap: 8px 24px; min-height: 38px; padding-top: 6px; padding-bottom: 6px; flex-wrap: wrap; }

/* Call now */
.wb-header-call-now .wb-header-actions { gap: 20px; }

/* Contact stacked: logo + info cards, then a coloured nav bar */
.wb-ch-stacked-top { display: flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 84px; padding-top: 12px; padding-bottom: 12px; }
.wb-ch-cards { display: flex; align-items: center; flex-wrap: wrap; justify-content: flex-end; gap: 14px 32px; }
.wb-ch-card { display: flex; align-items: center; gap: 10px; min-width: 0; }
.wb-ch-card-icon {
  display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; flex-shrink: 0;
  border-radius: var(--wb-radius); border: 1px solid var(--wb-border); color: var(--wb-primary);
}
.wb-ch-card-text { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
.wb-ch-card-label { font-size: 12px; opacity: 0.65; }
.wb-ch-card-value { font-size: 14px; font-weight: 600; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wb-ch-card-value a { color: inherit; text-decoration: none; }
.wb-ch-card-value a:hover { color: var(--wb-primary); }
.wb-ch-navbar { background: var(--wb-primary); color: var(--wb-on-primary); }
.wb-ch-navbar-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 52px; }
.wb-ch-navbar .wb-nav a:hover, .wb-ch-navbar .wb-dropdown-trigger:hover { color: inherit; opacity: 0.8; }
.wb-ch-navbar .wb-btn-primary { background: var(--wb-on-primary); color: var(--wb-primary); border-color: var(--wb-on-primary); }
.wb-ch-navbar .wb-btn-secondary { color: inherit; border-color: currentColor; background: transparent; }
.wb-nav-align-center .wb-ch-navbar .wb-nav { margin: 0 auto; }
.wb-nav-align-right .wb-ch-navbar .wb-nav { margin-left: auto; }

/* Centered phone: phone | logo | buttons, nav underneath */
.wb-ch-centered-top { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px; min-height: 80px; }
.wb-ch-centered-side { display: flex; align-items: center; gap: 12px; min-width: 0; }
.wb-ch-centered-end { justify-content: flex-end; }
.wb-ch-centered-brand { display: flex; justify-content: center; }
.wb-ch-centered-nav { border-top: 1px solid var(--wb-border); }
.wb-ch-centered-nav .wb-nav { justify-content: center; min-height: 50px; }
.wb-nav-align-left .wb-ch-centered-nav .wb-nav { justify-content: flex-start; }
.wb-nav-align-right .wb-ch-centered-nav .wb-nav { justify-content: flex-end; }

@container wb-site (max-width: 900px) {
  .wb-ch-call-btn { display: inline-flex; }
  .wb-ch-desktop-only { display: none; }
  .wb-ch-mobile-only { display: flex; }
  .wb-header-contact-topbar .wb-ch-item:not(.wb-ch-item-phone), .wb-header-contact-topbar .wb-ch-utility { display: none; }
  .wb-ch-topbar-inner { justify-content: center; min-height: 34px; }
  .wb-ch-cards, .wb-ch-navbar, .wb-ch-centered-nav { display: none; }
  .wb-ch-stacked-top { min-height: 68px; }
  .wb-ch-centered-top { grid-template-columns: auto 1fr; min-height: 68px; }
  .wb-ch-centered-top > .wb-ch-centered-side:first-child { display: none; }
  .wb-ch-centered-brand { justify-content: flex-start; }
}

/* Contact lines at the bottom of the mobile menu */
.wb-ch-drawer { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--wb-border); font-size: 14px; }
.wb-ch-drawer .wb-ch-inline { flex-direction: column; align-items: flex-start; gap: 12px; }
.wb-ch-drawer .wb-ch-item-phone { font-weight: 600; color: var(--wb-primary); }
`;
