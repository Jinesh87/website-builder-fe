import { ACCOUNT_CSS } from "./account-styles.ts";
import { AUTH_CSS } from "./auth-styles.ts";
import { BLOG_CSS } from "./blog-styles.ts";
import { PREMIUM_HEADER_CSS } from "./header-styles.ts";
import { CONTACT_BUILDER_CSS } from "./contact-builder-styles.ts";
import { HERO_CONTROLS_CSS } from "./hero-controls-styles.ts";
import { CARDS_CSS } from "./cards-styles.ts";
import { SHOP_CSS } from "./shop-styles.ts";
import { VINTAGE_CSS } from "./vintage-styles.ts";

const NOT_CHROME = ":not(.wb-editor-chrome, .wb-editor-chrome *)";

export const SITE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&display=swap');

.wb-site {
  container: wb-site / inline-size;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  background: var(--wb-bg);
  color: var(--wb-text);
  font-family: var(--wb-font-body);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  --wb-border: color-mix(in srgb, var(--wb-text) 12%, transparent);
  --vr-ink: #131210;
  --vr-text: #1D1910;
  --vr-paper: #F2EEE3;
  --vr-cream: #FBEFD5;
  --vr-red: #C4472D;
  --vr-gold: #E6AD4A;
  --vr-orange: #D9592A;
  --vr-teal: #1C6059;
  --vr-plum: #59253C;
  --vr-brown: #291B12;
  --vr-story: #1B1A16;
  --vr-footer: #0C0B09;
  --vr-mono: "JetBrains Mono Variable", "JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --vr-display: "Playfair Display Variable", "Playfair Display", Georgia, serif;
  --vr-serif: var(--wb-font-heading, "Fraunces Variable", Georgia, serif);
  --vr-condensed: "Anton", "Bebas Neue", "Oswald", "Impact", "Arial Black", sans-serif;
}
.wb-vr-eyebrow {
  display: block;
  margin: 0;
  font-family: var(--vr-mono);
  font-size: 9px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--vr-red);
}
.wb-site > main {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
}
.wb-site,
.wb-site * {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--wb-text) 45%, transparent) transparent;
}
.wb-site::-webkit-scrollbar,
.wb-site *::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.wb-site::-webkit-scrollbar-track,
.wb-site *::-webkit-scrollbar-track {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin: 0 !important;
}
.wb-site::-webkit-scrollbar-thumb,
.wb-site *::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--wb-text) 45%, transparent);
  border-radius: 9999px;
  border: 1px solid transparent;
  background-clip: padding-box;
  transition: background-color 0.2s ease;
}
.wb-site::-webkit-scrollbar-thumb:hover,
.wb-site *::-webkit-scrollbar-thumb:hover {
  background-color: color-mix(in srgb, var(--wb-text) 75%, transparent);
}
.wb-site::-webkit-scrollbar-corner,
.wb-site *::-webkit-scrollbar-corner {
  background: transparent !important;
}
/* Reset: :where() keeps these at class-level specificity so component classes below always win.
   .wb-editor-chrome marks builder controls drawn inside the preview; they keep the builder's own styles. */
.wb-site :where(*${NOT_CHROME}, *${NOT_CHROME}::before, *${NOT_CHROME}::after) { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; }
.wb-site :where(img${NOT_CHROME}) { display: block; max-width: 100%; height: auto; }
.wb-site :where(a${NOT_CHROME}) { color: inherit; text-decoration: none; }
.wb-site :where(ul${NOT_CHROME}) { list-style: none; }
.wb-site :where(button${NOT_CHROME}, input${NOT_CHROME}, textarea${NOT_CHROME}) { font: inherit; color: inherit; }
.wb-site h1, .wb-site h2, .wb-site h3 {
  font-family: var(--wb-font-heading);
  line-height: 1.2;
  letter-spacing: -0.01em;
  font-weight: 700;
}
.wb-site h1 { font-size: 48px; }
.wb-site h2 { font-size: 34px; }
.wb-site h3 { font-size: 19px; font-weight: 600; }

.wb-container { width: 100%; max-width: var(--wb-section-max-width, var(--wb-container)); margin: 0 auto; padding: 0 24px; }
.wb-container-full { width: 100%; max-width: 100%; margin: 0; padding: 0; }
.wb-section { padding: var(--wb-section-y) 0; }
.wb-section[id] { scroll-margin-top: 88px; }
.wb-bg-surface { background: var(--wb-surface); }
.wb-bg-primary { background: var(--wb-primary); color: var(--wb-on-primary); }
.wb-bg-primary .wb-muted { color: inherit; opacity: 0.85; }
.wb-muted { color: var(--wb-muted); }
.wb-eyebrow { font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wb-primary); }
.wb-bg-primary .wb-eyebrow { color: inherit; }
.wb-section-head { max-width: 680px; margin: 0 auto 48px; text-align: center; }
.wb-section-head p { margin-top: 12px; font-size: 18px; }

/* Section-level font size customization (applies cleanly per section without breaking layouts) */
.wb-section.wb-font-size-small,
.wb-chrome-bg-default.wb-font-size-small,
header.wb-font-size-small,
footer.wb-font-size-small {
  --wb-font-scale: 0.88;
}
.wb-section.wb-font-size-medium,
.wb-chrome-bg-default.wb-font-size-medium,
header.wb-font-size-medium,
footer.wb-font-size-medium {
  --wb-font-scale: 1.08;
}
.wb-section.wb-font-size-large,
.wb-chrome-bg-default.wb-font-size-large,
header.wb-font-size-large,
footer.wb-font-size-large {
  --wb-font-scale: 1.22;
}
.wb-section.wb-font-size-huge,
.wb-chrome-bg-default.wb-font-size-huge,
header.wb-font-size-huge,
footer.wb-font-size-huge {
  --wb-font-scale: 1.38;
}

/* Headings within section scaling */
.wb-section[class*="wb-font-size-"] h1,
.wb-section[class*="wb-font-size-"] .wb-hero h1,
header[class*="wb-font-size-"] h1,
footer[class*="wb-font-size-"] h1 {
  font-size: calc(clamp(30px, 5vw, 48px) * var(--wb-font-scale, 1));
  line-height: 1.15;
}

.wb-section[class*="wb-font-size-"] h2,
.wb-section[class*="wb-font-size-"] .wb-section-head h2,
header[class*="wb-font-size-"] h2,
footer[class*="wb-font-size-"] h2 {
  font-size: calc(clamp(22px, 3.8vw, 34px) * var(--wb-font-scale, 1));
  line-height: 1.2;
}

.wb-section[class*="wb-font-size-"] h3,
.wb-section[class*="wb-font-size-"] .wb-cardset-title,
.wb-section[class*="wb-font-size-"] .wb-feature-title,
.wb-section[class*="wb-font-size-"] .wb-service-title,
.wb-section[class*="wb-font-size-"] .wb-pricing-title,
header[class*="wb-font-size-"] h3,
footer[class*="wb-font-size-"] h3 {
  font-size: calc(clamp(16px, 2.2vw, 20px) * var(--wb-font-scale, 1));
  line-height: 1.3;
}

.wb-section[class*="wb-font-size-"] p,
.wb-section[class*="wb-font-size-"] .wb-section-head p,
.wb-section[class*="wb-font-size-"] .wb-hero-sub,
.wb-section[class*="wb-font-size-"] .wb-hero-desc,
.wb-section[class*="wb-font-size-"] .wb-cardset-desc,
.wb-section[class*="wb-font-size-"] .wb-cardset-intro,
.wb-section[class*="wb-font-size-"] .wb-testimonial-quote,
.wb-section[class*="wb-font-size-"] .wb-faq-answer,
header[class*="wb-font-size-"] p,
footer[class*="wb-font-size-"] p {
  font-size: calc(clamp(14px, 1.6vw, 17px) * var(--wb-font-scale, 1));
  line-height: 1.55;
}

.wb-section[class*="wb-font-size-"] .wb-eyebrow {
  font-size: calc(13px * var(--wb-font-scale, 1));
}

.wb-section[class*="wb-font-size-"] .wb-btn {
  font-size: calc(15px * var(--wb-font-scale, 1));
}

/* Specific Heading Size Overrides */
.wb-section.wb-heading-size-small h1,
.wb-section.wb-heading-size-small .wb-hero h1 { font-size: clamp(26px, 3.8vw, 36px) !important; }
.wb-section.wb-heading-size-small h2,
.wb-section.wb-heading-size-small .wb-section-head h2 { font-size: clamp(20px, 2.8vw, 26px) !important; }
.wb-section.wb-heading-size-small h3,
.wb-section.wb-heading-size-small .wb-cardset-title { font-size: 16px !important; }

.wb-section.wb-heading-size-medium h1,
.wb-section.wb-heading-size-medium .wb-hero h1 { font-size: clamp(34px, 4.8vw, 48px) !important; }
.wb-section.wb-heading-size-medium h2,
.wb-section.wb-heading-size-medium .wb-section-head h2 { font-size: clamp(24px, 3.5vw, 34px) !important; }
.wb-section.wb-heading-size-medium h3,
.wb-section.wb-heading-size-medium .wb-cardset-title { font-size: 19px !important; }

.wb-section.wb-heading-size-large h1,
.wb-section.wb-heading-size-large .wb-hero h1 { font-size: clamp(42px, 6vw, 58px) !important; }
.wb-section.wb-heading-size-large h2,
.wb-section.wb-heading-size-large .wb-section-head h2 { font-size: clamp(30px, 4.2vw, 42px) !important; }
.wb-section.wb-heading-size-large h3,
.wb-section.wb-heading-size-large .wb-cardset-title { font-size: 23px !important; }

.wb-section.wb-heading-size-huge h1,
.wb-section.wb-heading-size-huge .wb-hero h1 { font-size: clamp(50px, 7.5vw, 72px) !important; }
.wb-section.wb-heading-size-huge h2,
.wb-section.wb-heading-size-huge .wb-section-head h2 { font-size: clamp(36px, 5.2vw, 50px) !important; }
.wb-section.wb-heading-size-huge h3,
.wb-section.wb-heading-size-huge .wb-cardset-title { font-size: 27px !important; }

/* Specific Body Size Overrides */
.wb-section.wb-body-size-small p,
.wb-section.wb-body-size-small .wb-section-head p,
.wb-section.wb-body-size-small .wb-hero-sub,
.wb-section.wb-body-size-small .wb-hero-desc,
.wb-section.wb-body-size-small .wb-cardset-desc,
.wb-section.wb-body-size-small .wb-cardset-intro,
.wb-section.wb-body-size-small li,
.wb-section.wb-body-size-small .wb-testimonial-quote {
  font-size: 13.5px !important;
  line-height: 1.5;
}

.wb-section.wb-body-size-medium p,
.wb-section.wb-body-size-medium .wb-section-head p,
.wb-section.wb-body-size-medium .wb-hero-sub,
.wb-section.wb-body-size-medium .wb-hero-desc,
.wb-section.wb-body-size-medium .wb-cardset-desc,
.wb-section.wb-body-size-medium .wb-cardset-intro,
.wb-section.wb-body-size-medium li,
.wb-section.wb-body-size-medium .wb-testimonial-quote {
  font-size: 15.5px !important;
  line-height: 1.58;
}

.wb-section.wb-body-size-large p,
.wb-section.wb-body-size-large .wb-section-head p,
.wb-section.wb-body-size-large .wb-hero-sub,
.wb-section.wb-body-size-large .wb-hero-desc,
.wb-section.wb-body-size-large .wb-cardset-desc,
.wb-section.wb-body-size-large .wb-cardset-intro,
.wb-section.wb-body-size-large li,
.wb-section.wb-body-size-large .wb-testimonial-quote {
  font-size: 17.5px !important;
  line-height: 1.62;
}

.wb-section.wb-body-size-huge p,
.wb-section.wb-body-size-huge .wb-section-head p,
.wb-section.wb-body-size-huge .wb-hero-sub,
.wb-section.wb-body-size-huge .wb-hero-desc,
.wb-section.wb-body-size-huge .wb-cardset-desc,
.wb-section.wb-body-size-huge .wb-cardset-intro,
.wb-section.wb-body-size-huge li,
.wb-section.wb-body-size-huge .wb-testimonial-quote {
  font-size: 20px !important;
  line-height: 1.68;
}

.wb-testimonial-name { font-weight: 600; font-size: calc(16.5px * var(--wb-font-scale, 1)); color: var(--wb-text); }
.wb-testimonial-role { font-size: calc(14px * var(--wb-font-scale, 1)); color: var(--wb-muted); }

/* Exact pixel and scale size overrides when selected directly */
[style*="--wb-heading-size"] h1,
[style*="--wb-heading-size"] h2,
[style*="--wb-heading-size"] h3,
[style*="--wb-heading-size"] h4,
[style*="--wb-heading-size"] .wb-hero h1,
[style*="--wb-heading-size"] .wb-hero-curved-title,
[style*="--wb-heading-size"] .wb-section-head h2,
[style*="--wb-heading-size"] .wb-cardset-title,
[style*="--wb-heading-size"] .wb-feature-title,
[style*="--wb-heading-size"] .wb-service-title,
[style*="--wb-heading-size"] .wb-pricing-title,
[style*="--wb-heading-size"] .wb-faq-question,
[style*="--wb-heading-size"] .wb-footer-col-title,
[style*="--wb-heading-size"] .wb-footer-cta-card h3,
footer[style*="--wb-heading-size"] h2,
footer[style*="--wb-heading-size"] h3,
footer[style*="--wb-heading-size"] h4,
footer[style*="--wb-heading-size"] .wb-footer-col-title,
header[style*="--wb-heading-size"] h1,
header[style*="--wb-heading-size"] h2,
header[style*="--wb-heading-size"] h3 {
  font-size: var(--wb-heading-size) !important;
}

[style*="--wb-body-size"] p,
[style*="--wb-body-size"] span:not(.wb-badge):not(.wb-btn-icon):not(.wb-hero-curved-badge),
[style*="--wb-body-size"] a:not(.wb-btn),
[style*="--wb-body-size"] li,
[style*="--wb-body-size"] .wb-section-head p,
[style*="--wb-body-size"] .wb-hero-sub,
[style*="--wb-body-size"] .wb-hero-desc,
[style*="--wb-body-size"] .wb-hero-curved-sub,
[style*="--wb-body-size"] .wb-cardset-desc,
[style*="--wb-body-size"] .wb-cardset-intro,
[style*="--wb-body-size"] .wb-testimonial-quote,
[style*="--wb-body-size"] .wb-testimonial-name,
[style*="--wb-body-size"] .wb-testimonial-role,
[style*="--wb-body-size"] .wb-faq-answer,
footer[style*="--wb-body-size"],
footer[style*="--wb-body-size"] p,
footer[style*="--wb-body-size"] span,
footer[style*="--wb-body-size"] a,
footer[style*="--wb-body-size"] li,
footer[style*="--wb-body-size"] .wb-footer-bottom,
footer[style*="--wb-body-size"] .wb-footer-bottom span,
footer[style*="--wb-body-size"] .wb-footer-copyright,
footer[style*="--wb-body-size"] .wb-legal-links a,
header[style*="--wb-body-size"] p,
header[style*="--wb-body-size"] span:not(.wb-badge),
header[style*="--wb-body-size"] a {
  font-size: var(--wb-body-size) !important;
}

/* Scaling overrides for footer and header when --wb-font-scale is active */
footer[style*="--wb-font-scale"],
footer[style*="--wb-font-scale"] .wb-footer-bottom,
footer[style*="--wb-font-scale"] .wb-footer-bottom span,
footer[style*="--wb-font-scale"] .wb-footer-copyright,
footer[style*="--wb-font-scale"] .wb-legal-links a,
footer[style*="--wb-font-scale"] a,
footer[style*="--wb-font-scale"] li,
footer[style*="--wb-font-scale"] p,
footer.wb-has-font-scale,
footer.wb-has-font-scale .wb-footer-bottom,
footer.wb-has-font-scale .wb-footer-bottom span,
footer.wb-has-font-scale .wb-footer-copyright,
footer.wb-has-font-scale .wb-legal-links a,
footer.wb-has-font-scale a,
footer.wb-has-font-scale li,
footer.wb-has-font-scale p {
  font-size: calc(13px * var(--wb-font-scale, 1)) !important;
}

footer[style*="--wb-font-scale"] h3,
footer[style*="--wb-font-scale"] h4,
footer[style*="--wb-font-scale"] .wb-footer-col-title,
footer.wb-has-font-scale h3,
footer.wb-has-font-scale h4,
footer.wb-has-font-scale .wb-footer-col-title {
  font-size: calc(13px * var(--wb-font-scale, 1)) !important;
}

/* Dynamic container width overrides */
.wb-section.wb-width-narrow > .wb-container,
header.wb-width-narrow .wb-container,
footer.wb-width-narrow .wb-container {
  max-width: min(768px, 100%) !important;
}
.wb-section.wb-width-medium > .wb-container,
header.wb-width-medium .wb-container,
footer.wb-width-medium .wb-container {
  max-width: min(1024px, 100%) !important;
}
.wb-section.wb-width-wide > .wb-container,
header.wb-width-wide .wb-container,
footer.wb-width-wide .wb-container {
  max-width: min(1400px, 100%) !important;
}
.wb-section.wb-width-full > .wb-container,
.wb-section.wb-width-full > .wb-container-full,
header.wb-width-full .wb-container,
footer.wb-width-full .wb-container {
  max-width: 100% !important;
  width: 100% !important;
}
.wb-section[style*="--wb-section-max-width"] > .wb-container,
header[style*="--wb-section-max-width"] .wb-container,
footer[style*="--wb-section-max-width"] .wb-container {
  max-width: var(--wb-section-max-width) !important;
}

/* Dynamic heading font-weight */
[style*="--wb-heading-weight"] h1,
[style*="--wb-heading-weight"] h2,
[style*="--wb-heading-weight"] h3,
[style*="--wb-heading-weight"] h4,
[style*="--wb-heading-weight"] h5,
[style*="--wb-heading-weight"] h6,
[style*="--wb-heading-weight"] .wb-hero h1,
[style*="--wb-heading-weight"] .wb-hero-curved-title,
[style*="--wb-heading-weight"] .wb-section-head h2,
[style*="--wb-heading-weight"] .wb-cardset-title,
[style*="--wb-heading-weight"] .wb-feature-title,
[style*="--wb-heading-weight"] .wb-service-title,
[style*="--wb-heading-weight"] .wb-pricing-title,
[style*="--wb-heading-weight"] .wb-faq-question,
[style*="--wb-heading-weight"] .wb-footer-col-title,
[style*="--wb-heading-weight"] .wb-footer-cta-card h3,
[style*="--wb-heading-weight"] .wb-testimonial-name,
header[style*="--wb-heading-weight"] h1,
header[style*="--wb-heading-weight"] h2,
header[style*="--wb-heading-weight"] h3,
footer[style*="--wb-heading-weight"] h2,
footer[style*="--wb-heading-weight"] h3,
footer[style*="--wb-heading-weight"] h4,
footer[style*="--wb-heading-weight"] .wb-footer-col-title {
  font-weight: var(--wb-heading-weight) !important;
}

/* Dynamic body font-weight */
[style*="--wb-body-weight"] p,
[style*="--wb-body-weight"] span:not(.wb-badge):not(.wb-btn-icon),
[style*="--wb-body-weight"] a:not(.wb-btn),
[style*="--wb-body-weight"] li,
[style*="--wb-body-weight"] .wb-section-head p,
[style*="--wb-body-weight"] .wb-hero-sub,
[style*="--wb-body-weight"] .wb-hero-desc,
[style*="--wb-body-weight"] .wb-hero-curved-sub,
[style*="--wb-body-weight"] .wb-cardset-desc,
[style*="--wb-body-weight"] .wb-cardset-intro,
[style*="--wb-body-weight"] .wb-testimonial-quote,
[style*="--wb-body-weight"] .wb-testimonial-role,
[style*="--wb-body-weight"] .wb-faq-answer,
header[style*="--wb-body-weight"] nav a,
header[style*="--wb-body-weight"] span,
footer[style*="--wb-body-weight"],
footer[style*="--wb-body-weight"] p,
footer[style*="--wb-body-weight"] span,
footer[style*="--wb-body-weight"] a,
footer[style*="--wb-body-weight"] li,
footer[style*="--wb-body-weight"] .wb-footer-copyright,
footer[style*="--wb-body-weight"] .wb-legal-links a {
  font-weight: var(--wb-body-weight) !important;
}

/* Dynamic heading italic */
[style*="--wb-heading-font-style"] h1,
[style*="--wb-heading-font-style"] h2,
[style*="--wb-heading-font-style"] h3,
[style*="--wb-heading-font-style"] h4,
[style*="--wb-heading-font-style"] h5,
[style*="--wb-heading-font-style"] h6,
[style*="--wb-heading-font-style"] .wb-hero h1,
[style*="--wb-heading-font-style"] .wb-hero-curved-title,
[style*="--wb-heading-font-style"] .wb-hero-curved-title h1,
[style*="--wb-heading-font-style"] .wb-section-head h2,
[style*="--wb-heading-font-style"] .wb-cardset-title,
[style*="--wb-heading-font-style"] .wb-feature-title,
[style*="--wb-heading-font-style"] .wb-service-title,
[style*="--wb-heading-font-style"] .wb-pricing-title,
[style*="--wb-heading-font-style"] .wb-faq-question,
[style*="--wb-heading-font-style"] .wb-footer-col-title,
[style*="--wb-heading-font-style"] .wb-footer-cta-card h3,
[style*="--wb-heading-font-style"] .wb-testimonial-name,
header[style*="--wb-heading-font-style"] h1,
header[style*="--wb-heading-font-style"] h2,
header[style*="--wb-heading-font-style"] h3,
footer[style*="--wb-heading-font-style"] h2,
footer[style*="--wb-heading-font-style"] h3,
footer[style*="--wb-heading-font-style"] h4,
footer[style*="--wb-heading-font-style"] .wb-footer-col-title,
.wb-heading-italic h1,
.wb-heading-italic h2,
.wb-heading-italic h3,
.wb-heading-italic h4,
.wb-heading-italic .wb-hero h1,
.wb-heading-italic .wb-hero-curved-title h1,
.wb-heading-italic .wb-section-head h2,
.wb-heading-italic .wb-cardset-title,
.wb-heading-italic .wb-feature-title,
.wb-heading-italic .wb-service-title,
.wb-heading-italic .wb-pricing-title {
  font-style: italic !important;
  overflow: visible !important;
}

/* Ensure highlight / gradient spans inside italic headings inherit italic without clipping */
[style*="--wb-heading-font-style"] :is(h1, h2, h3, h4, h5, h6) span,
.wb-heading-italic :is(h1, h2, h3, h4, h5, h6) span {
  font-style: italic !important;
  overflow: visible !important;
}

/* Dynamic body italic: targets body copy, paragraphs, descriptions, and lists (excluding headings and heading spans) */
[style*="--wb-body-font-style"] p,
[style*="--wb-body-font-style"] p span:not(.wb-badge):not(.wb-btn-icon),
[style*="--wb-body-font-style"] a:not(.wb-btn):not(:is(h1, h2, h3, h4, h5, h6) *),
[style*="--wb-body-font-style"] li,
[style*="--wb-body-font-style"] li span,
[style*="--wb-body-font-style"] .wb-section-head p,
[style*="--wb-body-font-style"] .wb-hero-sub,
[style*="--wb-body-font-style"] .wb-hero-sub span,
[style*="--wb-body-font-style"] .wb-hero-desc,
[style*="--wb-body-font-style"] .wb-hero-desc span,
[style*="--wb-body-font-style"] .wb-hero-curved-sub,
[style*="--wb-body-font-style"] .wb-cardset-desc,
[style*="--wb-body-font-style"] .wb-cardset-intro,
[style*="--wb-body-font-style"] .wb-testimonial-quote,
[style*="--wb-body-font-style"] .wb-testimonial-role,
[style*="--wb-body-font-style"] .wb-faq-answer,
header[style*="--wb-body-font-style"] nav a,
header[style*="--wb-body-font-style"] nav span,
footer[style*="--wb-body-font-style"],
footer[style*="--wb-body-font-style"] p,
footer[style*="--wb-body-font-style"] span:not(:is(h1, h2, h3, h4) *),
footer[style*="--wb-body-font-style"] a:not(:is(h1, h2, h3, h4) *),
footer[style*="--wb-body-font-style"] li,
footer[style*="--wb-body-font-style"] .wb-footer-copyright,
footer[style*="--wb-body-font-style"] .wb-legal-links a,
.wb-body-italic p,
.wb-body-italic p span:not(.wb-badge):not(.wb-btn-icon),
.wb-body-italic a:not(.wb-btn):not(:is(h1, h2, h3, h4, h5, h6) *),
.wb-body-italic li,
.wb-body-italic li span {
  font-style: italic !important;
  overflow: visible !important;
}

/* Universal anti-clipping: give italic letters room on the right/left so slanted glyphs are never cut */
[style*="italic"],
.wb-heading-italic,
.wb-body-italic,
em, i {
  overflow: visible !important;
}
:is(h1, h2, h3, h4, h5, h6):has(.wb-text-gradient),
.wb-hero-curved-title,
.wb-hero-curved-title h1,
.wb-hero-copy,
.wb-hero-copy h1 {
  overflow: visible !important;
}

.wb-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 44px; padding: 10px 22px;
  border-radius: var(--wb-radius);
  font-weight: 600; font-size: 15px; line-height: 1.2;
  cursor: pointer; transition: opacity 0.15s ease, background-color 0.15s ease;
  text-decoration: none;
}
.wb-btn-icon-wrapper,
.wb-btn .wb-btn-icon,
.wb-btn .wb-icon-inline,
.wb-btn-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  width: 1.15em !important;
  height: 1.15em !important;
  min-width: 1.15em !important;
  min-height: 1.15em !important;
  max-width: 1.15em !important;
  max-height: 1.15em !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
  vertical-align: middle !important;
}
.wb-btn-icon-wrapper svg,
.wb-btn .wb-btn-icon svg,
.wb-btn .wb-icon-inline svg,
.wb-btn-icon svg {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  stroke-width: 2 !important;
}
.wb-btn-icon-wrapper .wb-icon-custom-img,
.wb-btn .wb-btn-icon .wb-icon-custom-img,
.wb-btn .wb-icon-inline .wb-icon-custom-img,
.wb-btn-icon .wb-icon-custom-img {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain !important;
}
.wb-btn-text {
  display: inline-block;
  white-space: nowrap;
}
.wb-btn:hover { opacity: 0.9; }
.wb-btn-primary { background: var(--wb-primary); color: var(--wb-on-primary); border: 2px solid var(--wb-primary); }
.wb-btn-secondary { background: transparent; color: var(--wb-text); border: 2px solid var(--wb-border); }
.wb-site.wb-buttons-outline .wb-btn-primary { background: transparent; color: var(--wb-primary); }
.wb-bg-primary .wb-btn-primary { background: var(--wb-on-primary); color: var(--wb-primary); border-color: var(--wb-on-primary); }
.wb-bg-primary .wb-btn-secondary { color: inherit; border-color: currentColor; }
.wb-btn[disabled] { opacity: 0.6; cursor: not-allowed; }
.wb-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }

.wb-card { background: var(--wb-bg); border-radius: var(--wb-radius); padding: 28px; color: var(--wb-text); }
.wb-site.wb-cards-border .wb-card { border: 1px solid var(--wb-border); }
.wb-site.wb-cards-shadow .wb-card { box-shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px rgb(0 0 0 / 0.08); }
.wb-site.wb-cards-flat .wb-card { background: var(--wb-surface); }
.wb-site.wb-cards-flat .wb-bg-surface .wb-card { background: var(--wb-bg); }
.wb-card h3 { margin-bottom: 8px; }
.wb-card p { color: var(--wb-muted); }

.wb-grid {
  display: grid; gap: 24px;
  grid-template-columns: repeat(var(--wb-cols, 3), minmax(0, 1fr));
}

.wb-icon {
  display: inline-grid; place-items: center; width: 44px; height: 44px; margin-bottom: 16px;
  border-radius: var(--wb-radius);
  background: color-mix(in srgb, var(--wb-primary) 12%, transparent);
  color: var(--wb-primary);
}
.wb-icon svg { width: 22px; height: 22px; }
.wb-icon .wb-icon-custom-img {
  width: 24px;
  height: 24px;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}
.wb-feature-icon-wrap .wb-icon .wb-icon-custom-img,
.wb-service-icon-wrap .wb-icon .wb-icon-custom-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.wb-marquee-card-icon .wb-icon-custom-img,
.wb-marquee-pill-icon .wb-icon-custom-img,
.wb-marquee-text-icon .wb-icon-custom-img,
.wb-icon-inline,
.wb-icon-inline.wb-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
  color: inherit !important;
  line-height: 1 !important;
}
.wb-icon-inline svg,
.wb-icon-inline.wb-icon svg {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
}
.wb-icon-inline .wb-icon-custom-img {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain !important;
}

/* Header */
.wb-announcement { background: var(--wb-surface); color: var(--wb-text); border-bottom: 1px solid var(--wb-border); text-align: center; font-size: 13px; padding: 8px 24px; font-weight: 500; }
.wb-announcement a { text-decoration: underline; text-underline-offset: 2px; margin-left: 6px; color: var(--wb-primary); }
.wb-header { background: var(--wb-bg); border-bottom: 1px solid var(--wb-border); position: relative; z-index: 40; transition: background 150ms ease, box-shadow 150ms ease; }
.wb-header.wb-pos-static { position: relative; }
.wb-header.wb-pos-sticky, .wb-header.wb-sticky { position: -webkit-sticky; position: sticky; top: 0; z-index: 40; width: 100%; }
.wb-header.wb-pos-fixed, .wb-header.wb-fixed { position: fixed; top: 0; left: 0; right: 0; z-index: 40; width: 100%; }
.wb-header.wb-pos-floating { position: -webkit-sticky; position: sticky; top: 12px; z-index: 40; width: 100%; }
.wb-header.wb-chrome-bg-surface:not(.wb-header-transparent), .wb-footer.wb-chrome-bg-surface { background: var(--wb-surface); }
.wb-header.wb-chrome-bg-primary:not(.wb-header-transparent), .wb-footer.wb-chrome-bg-primary { background: var(--wb-primary); color: var(--wb-on-primary); }
.wb-header.wb-chrome-bg-dark:not(.wb-header-transparent), .wb-footer.wb-chrome-bg-dark { background: var(--wb-text); color: var(--wb-bg); }
.wb-header.wb-header-transparent { position: absolute; top: 0; left: 0; right: 0; background: transparent; border-bottom: 1px solid rgba(255, 255, 255, 0.15); z-index: 40; width: 100%; }
.wb-header.wb-header-floating { background: transparent; border-bottom: none; padding: 8px 16px; }
.wb-header-floating-pill { max-width: 1100px; margin: 0 auto; background: color-mix(in srgb, var(--wb-bg) 90%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid var(--wb-border); border-radius: 9999px; box-shadow: 0 10px 28px -6px rgb(0 0 0 / 0.12); padding: 8px 20px; display: flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 56px; }
.wb-header-inner { display: flex; align-items: center; justify-content: space-between; gap: 28px; min-height: 72px; width: 100%; }
.wb-brand { display: inline-flex; align-items: center; gap: 10px; font-family: var(--wb-font-heading); font-weight: 700; font-size: 20px; text-decoration: none; flex-shrink: 0; white-space: nowrap; }
.wb-brand img { max-height: 38px; width: auto; object-fit: contain; }
.wb-brand-text { font-family: var(--wb-font-heading); font-weight: 700; font-size: 20px; line-height: 1.2; letter-spacing: -0.01em; color: inherit; white-space: nowrap; }
.wb-brand-combo { display: inline-flex; align-items: center; gap: 10px; }
.wb-brand-logo-left { flex-direction: row; }
.wb-brand-logo-right { flex-direction: row; }
.wb-brand-logo-top { flex-direction: column; align-items: center; gap: 4px; text-align: center; }
.wb-brand-logo-top .wb-brand-text { font-size: 13px; font-weight: 600; line-height: 1.15; }
.wb-nav { display: flex; align-items: center; gap: 24px; font-size: 14px; font-weight: 500; white-space: nowrap; flex-wrap: wrap; }
.wb-nav a, .wb-nav span, .wb-dropdown-trigger { white-space: nowrap; }
.wb-nav a { text-decoration: none; transition: color 120ms ease; }
.wb-nav a:hover { color: var(--wb-primary); }
.wb-header-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; flex-shrink: 0; }
.wb-header-cta { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; }
/* Shop customer session: hide marked Login CTAs in the header/nav. */
.wb-site.is-shop-authed [data-wb-hide-when-authed] { display: none !important; }
.wb-header-classical .wb-nav { margin: 0 auto; }
.wb-header-minimalist .wb-header-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.wb-header-minimalist .wb-nav-left { display: flex; align-items: center; gap: 24px; white-space: nowrap; }
.wb-header-minimalist .wb-brand-center { display: flex; justify-content: center; flex-shrink: 0; }
.wb-header-minimalist .wb-actions-right { display: flex; align-items: center; gap: 12px; justify-content: flex-end; flex-shrink: 0; }
.wb-header-comprehensive .wb-nav { margin-left: 8px; }
.wb-dropdown { position: relative; display: inline-flex; align-items: center; }
.wb-dropdown-trigger { display: inline-flex; align-items: center; gap: 4px; background: transparent; border: none; font: inherit; font-size: inherit; font-weight: inherit; color: inherit; cursor: pointer; padding: 6px 0; }
.wb-dropdown-trigger svg { width: 14px; height: 14px; opacity: 0.65; transition: transform 150ms ease; }
.wb-dropdown:hover .wb-dropdown-trigger svg, .wb-dropdown:focus-within .wb-dropdown-trigger svg { transform: rotate(180deg); }
.wb-dropdown-menu { display: none; position: absolute; top: calc(100% + 8px); left: -16px; min-width: 240px; background: var(--wb-bg); border: 1px solid var(--wb-border); border-radius: var(--wb-radius); box-shadow: 0 16px 36px -8px rgb(0 0 0 / 0.16); padding: 8px; z-index: 50; flex-direction: column; gap: 2px; }
.wb-dropdown:hover .wb-dropdown-menu, .wb-dropdown:focus-within .wb-dropdown-menu { display: flex; animation: wbFadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1); }
.wb-dropdown-item { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; border-radius: calc(var(--wb-radius) - 2px); text-decoration: none; transition: background 120ms ease; }
.wb-dropdown-item:hover { background: var(--wb-surface); color: var(--wb-primary); }
.wb-dropdown-item-title { display: flex; align-items: center; justify-content: space-between; font-weight: 600; font-size: 14px; }
.wb-dropdown-desc { font-size: 12px; color: var(--wb-muted); line-height: 1.4; font-weight: normal; }
.wb-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: color-mix(in srgb, var(--wb-primary) 15%, transparent); color: var(--wb-primary); text-transform: uppercase; letter-spacing: 0.04em; }
.wb-header-icon-btn { display: inline-grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--wb-border); background: transparent; color: inherit; position: relative; cursor: pointer; transition: all 120ms ease; text-decoration: none; }
.wb-header-icon-btn:hover { background: var(--wb-surface); color: var(--wb-primary); }
.wb-header-icon-btn svg { width: 17px; height: 17px; }
.wb-cart-badge { position: absolute; top: -3px; right: -3px; background: #ef4444; color: white; font-size: 10px; font-weight: 700; border-radius: 9999px; min-width: 16px; height: 16px; padding: 0 4px; display: grid; place-items: center; line-height: 1; }
.wb-search-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px; border: 1px solid var(--wb-border); background: var(--wb-surface); font-size: 13px; color: var(--wb-muted); cursor: pointer; min-width: 180px; }
.wb-search-pill svg { width: 14px; height: 14px; opacity: 0.6; }
.wb-header-centered .wb-header-inner { flex-direction: column; gap: 12px; padding: 20px 24px 16px; }

/* =========================================================================
   NEW 2026 HEADER DESIGNS (8 Distinct Presets)
   ========================================================================= */

/* 1. Glass Dock Header */
.wb-header-glass-dock {
  background: transparent !important;
  border-bottom: none !important;
  padding: 14px 16px;
  display: flex;
  justify-content: center;
}
.wb-dock-container,
.wb-header-dock-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}
.wb-dock-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px 8px 20px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-bg) 82%, transparent);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px solid color-mix(in srgb, var(--wb-border) 80%, rgba(255,255,255,0.2));
  box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  transition: all 200ms ease;
  min-height: 54px;
}
.wb-dock-bar:hover {
  border-color: color-mix(in srgb, var(--wb-primary) 30%, var(--wb-border));
  box-shadow: 0 20px 42px -10px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
}
.wb-dock-brand,
.wb-header-dock-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.wb-dock-divider {
  width: 1px;
  height: 22px;
  background: var(--wb-border);
  opacity: 0.8;
  flex-shrink: 0;
}
.wb-dock-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}
.wb-dock-nav a {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  color: var(--wb-text);
  transition: all 150ms ease;
}
.wb-dock-nav a:hover {
  background: var(--wb-surface);
  color: var(--wb-primary);
}
.wb-dock-active-beacon {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--wb-primary);
  box-shadow: 0 0 8px var(--wb-primary);
}
.wb-dock-status,
.wb-dock-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 600;
  background: color-mix(in srgb, var(--wb-surface) 90%, transparent);
  border: 1px solid var(--wb-border);
  color: var(--wb-muted);
}
.wb-dock-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 2px rgb(34 197 94 / 0.2);
}
.wb-dock-actions,
.wb-header-dock-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.wb-dock-cmd-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  font-size: 11px;
  font-family: monospace;
  color: var(--wb-muted);
  cursor: pointer;
  transition: all 120ms ease;
}
.wb-dock-cmd-btn:hover {
  color: var(--wb-text);
  border-color: var(--wb-primary);
}

/* 2. Split Stacked Header */
.wb-header-split-stacked {
  border-bottom: 1px solid var(--wb-border);
}
.wb-utility-topbar {
  background: color-mix(in srgb, var(--wb-surface) 60%, var(--wb-bg));
  border-bottom: 1px solid var(--wb-border);
  font-size: 12px;
  padding: 6px 0;
  color: var(--wb-muted);
}
.wb-utility-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.wb-utility-left, .wb-utility-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.wb-utility-tagline {
  font-weight: 500;
}
.wb-utility-links {
  display: flex;
  align-items: center;
  gap: 14px;
}
.wb-utility-links a {
  text-decoration: none;
  color: inherit;
  transition: color 120ms ease;
}
.wb-utility-links a:hover {
  color: var(--wb-primary);
}
.wb-utility-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}
.wb-pulse-dot,
.wb-status-beacon {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgb(34 197 94 / 0.2);
  animation: wbPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.wb-pulse-dot.wb-status-green, .wb-status-beacon.wb-status-green { background: #22c55e; box-shadow: 0 0 0 3px rgb(34 197 94 / 0.2); }
.wb-pulse-dot.wb-status-blue, .wb-status-beacon.wb-status-blue { background: #3b82f6; box-shadow: 0 0 0 3px rgb(59 130 246 / 0.2); }
.wb-pulse-dot.wb-status-orange, .wb-status-beacon.wb-status-orange { background: #f97316; box-shadow: 0 0 0 3px rgb(249 115 22 / 0.2); }
.wb-pulse-dot.wb-status-purple, .wb-status-beacon.wb-status-purple { background: #a855f7; box-shadow: 0 0 0 3px rgb(168 85 247 / 0.2); }
.wb-pulse-dot.wb-status-red, .wb-status-beacon.wb-status-red { background: #ef4444; box-shadow: 0 0 0 3px rgb(239 68 68 / 0.22); }
@keyframes wbPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}
.wb-stacked-main {
  background: var(--wb-bg);
}
.wb-stacked-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  min-height: 68px;
}
.wb-stacked-brand {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}
.wb-stacked-nav {
  display: flex;
  align-items: center;
  gap: 22px;
}
.wb-stacked-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}


/* 4. Mega Menu Grid Header */
.wb-header-mega-menu-grid {
  border-bottom: 1px solid var(--wb-border);
  position: relative;
}
.wb-mega-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 72px;
}
.wb-mega-nav {
  display: flex;
  align-items: center;
  gap: 22px;
}
.wb-mega-nav-item {
  position: relative;
}
.wb-mega-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  cursor: pointer;
  padding: 8px 4px;
}
.wb-mega-trigger-btn svg {
  width: 13px;
  height: 13px;
  opacity: 0.6;
  transition: transform 150ms ease;
}
.wb-mega-nav-item:hover .wb-mega-trigger-btn svg {
  transform: rotate(180deg);
}
.wb-mega-nav-item,
.wb-mega-dropdown {
  position: relative;
}
.wb-mega-panel,
.wb-mega-menu-panel {
  display: none;
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  width: min(840px, 90vw);
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  border-radius: 14px;
  box-shadow: 0 20px 48px -12px rgba(0, 0, 0, 0.2);
  padding: 20px;
  z-index: 60;
}
.wb-mega-nav-item:hover .wb-mega-panel,
.wb-mega-nav-item:focus-within .wb-mega-panel,
.wb-mega-dropdown:hover .wb-mega-menu-panel,
.wb-mega-dropdown:focus-within .wb-mega-menu-panel {
  display: block;
  animation: wbFadeIn 160ms cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-mega-panel-grid,
.wb-mega-grid-inner {
  display: grid;
  grid-template-columns: repeat(2, 1fr) 260px;
  gap: 20px;
}
.wb-mega-item-icon svg,
.wb-mega-item svg {
  width: 18px !important;
  height: 18px !important;
  max-width: 18px !important;
  max-height: 18px !important;
  flex-shrink: 0 !important;
}
.wb-mega-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wb-mega-col-title {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--wb-muted);
  margin-bottom: 4px;
}
.wb-mega-link-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 120ms ease;
}
.wb-mega-link-card:hover {
  background: var(--wb-surface);
}
.wb-mega-link-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--wb-text);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.wb-mega-link-desc {
  font-size: 12px;
  color: var(--wb-muted);
  line-height: 1.35;
}
.wb-mega-featured-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  border-radius: 10px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}
.wb-mega-featured-badge {
  align-self: flex-start;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: 9999px;
  background: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff);
  margin-bottom: 8px;
}
.wb-mega-featured-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--wb-text);
  margin-bottom: 4px;
}
.wb-mega-featured-desc {
  font-size: 12px;
  color: var(--wb-muted);
  line-height: 1.4;
  margin-bottom: 12px;
}
.wb-mega-featured-action {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--wb-primary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.wb-mega-panel-bottom {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--wb-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--wb-muted);
}
.wb-mega-panel-bottom a {
  color: var(--wb-primary);
  text-decoration: none;
  font-weight: 600;
}

/* 5. Side Drawer Header */
.wb-header-side-drawer {
  border-bottom: 1px solid var(--wb-border);
}
.wb-drawer-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 72px;
}
.wb-curtain-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 9999px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--wb-text);
  cursor: pointer;
  transition: all 140ms ease;
}
.wb-curtain-trigger-btn:hover {
  border-color: var(--wb-primary);
  color: var(--wb-primary);
}
.wb-curtain-hamburger {
  display: flex;
  flex-direction: column;
  gap: 3.5px;
  width: 14px;
}
.wb-curtain-hamburger span {
  display: block;
  height: 1.75px;
  background: currentColor;
  border-radius: 2px;
}
.wb-curtain-portal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  justify-content: flex-end;
  overflow: hidden;
}
.wb-curtain-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  animation: wbFadeIn 180ms ease;
}
.wb-curtain-drawer {
  position: relative;
  width: 100%;
  max-width: 440px;
  height: 100%;
  background: var(--wb-bg);
  color: var(--wb-text);
  display: flex;
  flex-direction: column;
  box-shadow: -12px 0 40px rgba(0, 0, 0, 0.25);
  animation: wbCurtainSlide 240ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
  z-index: 10;
}
@keyframes wbCurtainSlide {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.wb-curtain-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--wb-border);
}
.wb-curtain-close-btn {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  color: var(--wb-text);
  cursor: pointer;
  transition: all 120ms ease;
}
.wb-curtain-close-btn:hover {
  background: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff);
}
.wb-curtain-drawer-body {
  flex: 1;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.wb-curtain-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.wb-curtain-nav-item {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--wb-border) 60%, transparent);
  text-decoration: none;
  color: var(--wb-text);
  transition: all 150ms ease;
}
.wb-curtain-nav-item:hover {
  color: var(--wb-primary);
  padding-left: 8px;
}
.wb-curtain-nav-index {
  font-size: 12px;
  font-family: monospace;
  color: var(--wb-muted);
  font-weight: 600;
}
.wb-curtain-nav-text {
  font-family: var(--wb-font-heading);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.wb-curtain-nav-desc {
  margin-left: auto;
  font-size: 12px;
  color: var(--wb-muted);
}
.wb-curtain-drawer-footer {
  padding: 24px 28px;
  border-top: 1px solid var(--wb-border);
  background: var(--wb-surface);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 6. Headline Ticker Header */
.wb-header-headline-ticker {
  border-bottom: 1px solid var(--wb-border);
}
.wb-ticker-bar {
  background: var(--wb-surface);
  border-bottom: 1px solid var(--wb-border);
  padding: 6px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  overflow: hidden;
  font-size: 12px;
}
.wb-ticker-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--wb-primary) 15%, transparent);
  color: var(--wb-primary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 10.5px;
  flex-shrink: 0;
}
.wb-ticker-track {
  flex: 1;
  overflow: hidden;
  position: relative;
  white-space: nowrap;
}
.wb-ticker-content {
  display: inline-block;
  white-space: nowrap;
  animation: wbMarquee 28s linear infinite;
}
.wb-ticker-track:hover .wb-ticker-content {
  animation-play-state: paused;
}
@keyframes wbMarquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.wb-ticker-link {
  font-weight: 500;
  color: var(--wb-text);
  text-decoration: none;
  transition: color 120ms ease;
}
.wb-ticker-link:hover {
  color: var(--wb-primary);
}
.wb-ticker-bar .wb-ticker-track {
  display: block; min-width: 0; animation: none;
}
.wb-ticker-bar .wb-ticker-link {
  color: var(--wb-primary);
  font-weight: 700;
}
.wb-ticker-bar .wb-ticker-link:hover {
  color: var(--wb-text);
}
.wb-ticker-main {
  background: var(--wb-bg);
}
.wb-ticker-main-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 64px;
}


/* Fixed Header Top Spacing Clearance (content never goes behind/overlaps fixed header unless transparent overlay) */
.wb-site:has(.wb-header.wb-pos-fixed:not(.wb-header-transparent)) > main,
.wb-site:has(.wb-header.wb-fixed:not(.wb-header-transparent)) > main,
.wb-header.wb-pos-fixed:not(.wb-header-transparent) ~ main,
.wb-header.wb-fixed:not(.wb-header-transparent) ~ main {
  padding-top: var(--wb-header-height, 72px);
}

/* Editor Canvas In-flow Positioning (enables clean selection, dragging, deleting, and editing) */
.wb-editor-section-wrap {
  width: 100%;
  position: relative;
}
.wb-editor-section-wrap .wb-header {
  position: relative !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  transform: none !important;
  z-index: 1 !important;
}
.wb-editor-section-wrap .wb-header.wb-header-floating {
  padding: 8px 16px;
}

/* Mobile Toggle Button & Full-width Drawer */
.wb-mobile-toggle-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--wb-radius);
  border: 1px solid var(--wb-border);
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: all 150ms ease;
  flex-shrink: 0;
}
.wb-mobile-toggle-btn:hover {
  background: var(--wb-surface);
  color: var(--wb-primary);
}
.wb-mobile-toggle-btn svg { width: 22px; height: 22px; }

.wb-drawer-portal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  overflow: hidden;
  border-radius: inherit;
}
.wb-drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: wbFadeIn 180ms ease;
}
.wb-drawer-panel {
  position: relative;
  width: 100%;
  max-width: 380px;
  height: 100%;
  background: var(--wb-bg);
  color: var(--wb-text);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
  animation: wbSlideIn 220ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
  z-index: 10;
}
@keyframes wbSlideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.wb-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--wb-border);
  min-height: 64px;
  background: var(--wb-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}
.wb-drawer-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--wb-border);
  background: var(--wb-surface);
  color: var(--wb-text);
  cursor: pointer;
  transition: all 150ms ease;
}
.wb-drawer-close-btn:hover {
  background: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff);
  border-color: var(--wb-primary);
}
.wb-drawer-close-btn svg { width: 18px; height: 18px; }
.wb-drawer-body {
  flex: 1 1 auto;
  padding: 24px 20px 36px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}
.wb-drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wb-drawer-item-group {
  display: flex;
  flex-direction: column;
}
.wb-drawer-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  font-size: 16px;
  font-weight: 600;
  color: var(--wb-text);
  border-radius: var(--wb-radius);
  text-decoration: none;
  transition: background 120ms ease, color 120ms ease;
}
.wb-drawer-link:hover {
  background: var(--wb-surface);
  color: var(--wb-primary);
}
.wb-drawer-submenu {
  margin: 4px 0 8px 12px;
  padding-left: 14px;
  border-left: 2px solid var(--wb-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.wb-drawer-sublink {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-radius: calc(var(--wb-radius) - 2px);
  text-decoration: none;
  transition: background 120ms ease;
}
.wb-drawer-sublink:hover {
  background: var(--wb-surface);
  color: var(--wb-primary);
}
.wb-drawer-sublink-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  font-size: 14px;
}
.wb-drawer-sublink-desc {
  font-size: 12px;
  color: var(--wb-muted);
  margin-top: 2px;
}
.wb-drawer-actions {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--wb-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.wb-drawer-actions .wb-btn {
  width: 100%;
  min-height: 44px;
  justify-content: center;
}
@keyframes wbFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

/* Hero Builder Styles */
.wb-hero { position: relative; overflow: hidden; padding: calc(var(--wb-section-y) * 1.1) 0; }
.wb-hero-min-screen { min-height: calc(100vh - 80px); display: flex; align-items: center; }
.wb-hero-min-tall { min-height: 700px; display: flex; align-items: center; }
.wb-hero-min-compact { padding: calc(var(--wb-section-y) * 0.6) 0; }

.wb-hero-copy { display: flex; flex-direction: column; gap: 16px; position: relative; z-index: 2; }
.wb-hero h1 { margin: 0; font-size: 52px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.08; }
.wb-hero-sub { font-size: 19px; line-height: 1.55; max-width: 640px; margin: 0; }
.wb-hero-desc { font-size: 15px; line-height: 1.6; max-width: 580px; margin: 0; }
.wb-hero-badge {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px;
  font-size: 13px; font-weight: 600; width: fit-content;
  background: color-mix(in srgb, var(--wb-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-primary) 25%, transparent);
  color: var(--wb-primary);
}
.wb-text-gradient {
  background: var(--wb-gradient, linear-gradient(135deg, var(--wb-primary), var(--wb-secondary-ink, var(--wb-primary))));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  display: inline-block;
  padding: 0.08em 0.32em 0.16em 0.1em;
  margin: -0.08em -0.28em -0.16em -0.1em;
  vertical-align: baseline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  overflow: visible;
}

/* Hero Action Buttons */
.wb-hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 8px; }
.wb-btn-video-play {
  display: inline-flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600;
  padding: 10px 18px; border-radius: 9999px; background: color-mix(in srgb, var(--wb-text) 6%, transparent);
  border: 1px solid var(--wb-border); color: inherit; cursor: pointer; text-decoration: none; transition: all 0.2s ease;
}
.wb-btn-video-play:hover { background: color-mix(in srgb, var(--wb-text) 12%, transparent); transform: scale(1.02); }
.wb-play-icon-pill,
.wb-btn-video-play .wb-btn-icon-wrapper {
  width: 28px !important; height: 28px !important; min-width: 28px !important; min-height: 28px !important;
  border-radius: 50% !important; background: var(--wb-primary); color: var(--wb-on-primary, #ffffff);
  display: inline-grid !important; place-items: center !important; flex-shrink: 0 !important;
}
.wb-play-icon-pill svg,
.wb-btn-video-play .wb-btn-icon-wrapper svg { width: 14px !important; height: 14px !important; margin: auto !important; }
.wb-btn-video-play .wb-btn-icon-wrapper .wb-icon-custom-img { width: 16px !important; height: 16px !important; }

/* Social Proof Rating & Avatars */
.wb-hero-rating { display: flex; align-items: center; gap: 12px; margin-top: 12px; font-size: 13px; font-weight: 500; }
.wb-avatar-stack { display: flex; align-items: center; }
.wb-avatar-circle {
  width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--wb-bg);
  background: color-mix(in srgb, var(--wb-primary) 20%, #64748b);
  display: inline-grid; place-items: center; font-size: 11px; font-weight: 700; color: #ffffff;
  margin-left: -8px; first-of-type:margin-left-0;
}
.wb-avatar-circle:first-child { margin-left: 0; }
.wb-stars-row { display: flex; gap: 2px; }
.wb-stars-row svg { width: 14px; height: 14px; }

/* Trusted By Logo Strip */
.wb-hero-trusted-by { margin-top: 36px; padding-top: 24px; border-top: 1px solid color-mix(in srgb, var(--wb-border) 60%, transparent); }
.wb-trusted-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--wb-muted); margin-bottom: 12px; }
.wb-trusted-logos { display: flex; flex-wrap: wrap; align-items: center; gap: 24px 36px; }
.wb-trusted-logo-item { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; opacity: 0.6; transition: opacity 0.15s ease; }
.wb-trusted-logo-item:hover { opacity: 1; }

/* Hero Media & Device Mockup */
.wb-hero-media { position: relative; z-index: 1; }
.wb-hero-media img { width: 100%; border-radius: var(--wb-radius); object-fit: cover; }
.wb-hero-media-mockup {
  border-radius: calc(var(--wb-radius) * 1.3); border: 1px solid var(--wb-border);
  background: var(--wb-bg); box-shadow: 0 24px 60px -12px rgb(0 0 0 / 0.18);
  overflow: hidden;
}
.wb-mockup-header {
  height: 34px; background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-surface));
  border-bottom: 1px solid var(--wb-border); display: flex; align-items: center; padding: 0 14px; gap: 6px;
}
.wb-mockup-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.wb-mockup-dot-red { background: #ff5f56; }
.wb-mockup-dot-yellow { background: #ffbd2e; }
.wb-mockup-dot-green { background: #27c93f; }
.wb-hero-media-glow { position: relative; }
.wb-hero-media-glow::before {
  content: ""; position: absolute; inset: -15%; background: radial-gradient(circle, color-mix(in srgb, var(--wb-primary) 35%, transparent) 0%, transparent 70%);
  z-index: -1; filter: blur(32px); border-radius: 50%; opacity: 0.75;
}

/* Hero Playable Video Player & Poster */
.wb-hero-video-wrap {
  width: 100%; border-radius: var(--wb-radius); overflow: hidden; background: #000000;
  box-shadow: 0 20px 48px -10px rgb(0 0 0 / 0.22);
}
.wb-hero-video-element {
  width: 100%; height: auto; max-height: 520px; display: block; border-radius: var(--wb-radius); object-fit: cover;
}
.wb-hero-video-iframe-wrap {
  position: relative; width: 100%; padding-bottom: 56.25%; height: 0;
  overflow: hidden; border-radius: var(--wb-radius); background: #000000;
  box-shadow: 0 20px 48px -10px rgb(0 0 0 / 0.22);
}
.wb-hero-video-iframe {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;
}
.wb-hero-video-poster-wrap {
  position: relative; width: 100%; cursor: pointer; border-radius: var(--wb-radius);
  overflow: hidden; box-shadow: 0 20px 48px -10px rgb(0 0 0 / 0.18);
}
.wb-hero-video-poster {
  width: 100%; display: block; object-fit: cover; transition: transform 0.3s ease;
}
.wb-hero-video-poster-wrap:hover .wb-hero-video-poster {
  transform: scale(1.02);
}
.wb-hero-video-play-btn {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 68px; height: 68px; border-radius: 50%; background: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff); border: 3px solid #ffffff;
  display: grid; place-items: center; cursor: pointer;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.3); transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.wb-hero-video-play-btn svg { width: 26px; height: 26px; fill: currentColor; margin-left: 2px; }
.wb-hero-video-play-btn:hover {
  transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 12px 32px color-mix(in srgb, var(--wb-primary) 50%, black);
}

/* Floating Cards & Mockup Showcase */
.wb-floating-card-wrap {
  position: relative; width: 100%; min-height: 240px;
  display: flex; align-items: center; justify-content: center;
}
.wb-hero-mockup-placeholder {
  width: 100%; min-height: 240px; border-radius: var(--wb-radius); border: 1px solid var(--wb-border);
  background: color-mix(in srgb, var(--wb-surface) 60%, var(--wb-bg));
  box-shadow: 0 20px 48px -12px rgb(0 0 0 / 0.08); padding: 22px;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative; overflow: hidden;
}
.wb-placeholder-glow {
  position: absolute; top: -30px; right: -30px; width: 120px; height: 120px;
  background: radial-gradient(circle, color-mix(in srgb, var(--wb-primary) 30%, transparent) 0%, transparent 70%);
  border-radius: 50%; filter: blur(20px); pointer-events: none;
}
.wb-placeholder-card-header { display: flex; align-items: center; gap: 12px; }
.wb-placeholder-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: color-mix(in srgb, var(--wb-primary) 20%, var(--wb-border));
}
.wb-placeholder-bars { display: flex; flex-direction: column; gap: 6px; }
.wb-placeholder-bar-title {
  width: 110px; height: 12px; border-radius: 6px; background: color-mix(in srgb, var(--wb-text) 15%, transparent);
}
.wb-placeholder-bar-sub {
  width: 70px; height: 8px; border-radius: 4px; background: color-mix(in srgb, var(--wb-muted) 20%, transparent);
}
.wb-placeholder-chart {
  display: flex; align-items: flex-end; gap: 10px; height: 100px; padding-top: 14px;
  border-top: 1px dashed var(--wb-border);
}
.wb-chart-bar {
  flex: 1; border-radius: 6px 6px 2px 2px;
  background: linear-gradient(180deg, var(--wb-primary), color-mix(in srgb, var(--wb-primary) 30%, transparent));
  opacity: 0.85; transition: opacity 0.2s ease;
}
.wb-chart-bar:hover { opacity: 1; }

.wb-floating-icon {
  width: 36px; height: 36px; border-radius: 10px; background: var(--wb-primary); color: var(--wb-on-primary, #ffffff);
  display: grid; place-items: center; font-size: 16px; flex-shrink: 0;
}
.wb-floating-card-text strong { display: block; font-size: 14px; font-weight: 700; }
.wb-floating-card-text span { display: block; font-size: 11px; color: var(--wb-muted); }
@keyframes wbFloat { from { transform: translateY(0); } to { transform: translateY(-8px); } }

/* Hero Layout Variants */
.wb-hero-centered,
.wb-hero-gradient,
.wb-hero-curved-bottom,
.wb-hero-minimal-typography { text-align: center; }
.wb-hero-centered .wb-hero-copy,
.wb-hero-gradient .wb-hero-copy,
.wb-hero-curved-bottom .wb-hero-copy,
.wb-hero-minimal-typography .wb-hero-copy { max-width: 820px; margin: 0 auto; align-items: center; }
.wb-hero-centered .wb-hero-actions,
.wb-hero-gradient .wb-hero-actions,
.wb-hero-curved-bottom .wb-hero-actions,
.wb-hero-minimal-typography .wb-hero-actions { justify-content: center; }
.wb-hero-centered .wb-hero-media,
.wb-hero-gradient .wb-hero-media,
.wb-hero-curved-bottom .wb-hero-media,
.wb-hero-minimal-typography .wb-hero-media { margin-top: 48px; max-width: 1000px; margin-left: auto; margin-right: auto; }
.wb-hero-centered .wb-hero-rating,
.wb-hero-gradient .wb-hero-rating,
.wb-hero-curved-bottom .wb-hero-rating,
.wb-hero-minimal-typography .wb-hero-rating { justify-content: center; }
.wb-hero-centered .wb-trusted-logos,
.wb-hero-gradient .wb-trusted-logos,
.wb-hero-curved-bottom .wb-trusted-logos,
.wb-hero-minimal-typography .wb-trusted-logos { justify-content: center; }

.wb-hero-split .wb-hero-grid, .wb-hero-split-left .wb-hero-grid {
  display: grid; grid-template-columns: 1.1fr 1fr; gap: 56px; align-items: center;
}
.wb-hero-split-left .wb-hero-media { order: -1; }

.wb-hero-asymmetric .wb-hero-grid {
  display: grid; grid-template-columns: 1.3fr 0.9fr; gap: 48px; align-items: center;
}
.wb-hero-asymmetric .wb-hero-media { margin-top: 24px; transform: rotate(1deg); transition: transform 0.3s ease; }
.wb-hero-asymmetric .wb-hero-media:hover { transform: rotate(0deg); }

.wb-hero-floating-cards .wb-hero-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
}
.wb-hero-floating-cards .wb-floating-card-wrap { display: block; padding: 28px 0 28px 28px; }
.wb-hero-floating-cards .wb-floating-card-wrap img {
  aspect-ratio: 4 / 5; max-height: 600px; box-shadow: 0 30px 60px -24px rgb(15 23 42 / 0.35);
}
.wb-hero-floating-cards-list { list-style: none; margin: 0; padding: 0; }
.wb-hero-floating-card {
  position: absolute; display: flex; align-items: center; gap: 12px; padding: 12px 16px;
  max-width: 260px; border-radius: calc(var(--wb-radius) + 4px);
  background: color-mix(in srgb, var(--wb-bg) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-text) 8%, transparent);
  box-shadow: 0 18px 40px -14px rgb(15 23 42 / 0.3);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  color: var(--wb-text); z-index: 2;
  animation: wbHeroCardFloat 6s ease-in-out infinite;
}
.wb-hero-floating-card-1 { top: 10%; left: 0; }
.wb-hero-floating-card-2 { top: 46%; right: -16px; animation-delay: -2s; }
.wb-hero-floating-card-3 { bottom: 4%; left: 8%; animation-delay: -4s; }
.wb-hero-floating-card-icon {
  display: grid; place-items: center; flex-shrink: 0; width: 38px; height: 38px; border-radius: 50%;
  background: color-mix(in srgb, var(--wb-primary) 14%, transparent); color: var(--wb-primary);
}
.wb-hero-floating-card-icon svg { width: 18px; height: 18px; }
.wb-hero-floating-card-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
.wb-hero-floating-card-text strong { font-size: 15px; font-weight: 700; }
.wb-hero-floating-card-text span { font-size: 12.5px; color: var(--wb-muted); }
.wb-hero-floating-card-badge {
  padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700;
  background: var(--wb-primary); color: var(--wb-on-primary, #ffffff);
}
@keyframes wbHeroCardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@media (prefers-reduced-motion: reduce) {
  .wb-hero-floating-card { animation: none; }
}

.wb-hero-soft-card { padding: calc(var(--wb-section-y) * 0.8) 0; }
.wb-hero-card-container {
  background: color-mix(in srgb, var(--wb-surface) 70%, var(--wb-bg));
  border: 1px solid var(--wb-border); border-radius: calc(var(--wb-radius) * 2);
  padding: 64px 48px; box-shadow: 0 20px 48px -12px rgb(0 0 0 / 0.08);
}

.wb-hero-gradient {
  background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--wb-primary) 18%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 100% 100%, color-mix(in srgb, #ec4899 12%, transparent) 0%, transparent 50%),
              var(--wb-bg);
}

.wb-hero-minimal-typography h1 { font-size: 68px; font-weight: 900; letter-spacing: -0.04em; }

/* Hero 3D Curved Carousel Banner Layout */
.wb-hero-curved-carousel {
  text-align: center;
  position: relative;
  overflow: hidden;
  padding: calc(var(--wb-section-y) * 0.9) 0;
}

.wb-hero-curved-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-sizing: border-box;
}

.wb-hero-curved-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 860px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.wb-hero-curved-badge-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
}

.wb-hero-curved-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
  padding: 7px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
  letter-spacing: 0.01em;
  background: color-mix(in srgb, #f59e0b 14%, var(--wb-bg, #ffffff));
  border: 1px solid color-mix(in srgb, #f59e0b 35%, transparent);
  color: #b45309;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  margin: 0 auto;
}

:root.dark .wb-hero-curved-badge,
[data-theme="dark"] .wb-hero-curved-badge {
  background: color-mix(in srgb, #f59e0b 18%, #18181b);
  border-color: color-mix(in srgb, #f59e0b 38%, transparent);
  color: #fde68a;
}

.wb-hero-curved-title {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0 auto;
}

.wb-hero-curved-carousel .wb-hero-curved-title h1,
.wb-hero-curved-carousel h1,
.wb-hero-curved-title h1 {
  font-size: clamp(32px, 5cqi, 62px);
  font-weight: 850;
  letter-spacing: -0.035em;
  line-height: 1.12;
  text-wrap: balance;
  margin: 0 auto !important;
  text-align: center !important;
  max-width: 840px;
  display: block;
}

.wb-hero-curved-carousel .wb-hero-curved-sub,
.wb-hero-curved-carousel p.wb-hero-curved-sub,
.wb-hero-curved-sub {
  font-size: clamp(16px, 1.8cqi, 19px);
  line-height: 1.6;
  max-width: 660px;
  margin: 20px auto 0 auto !important;
  text-align: center !important;
  color: var(--wb-muted);
}

.wb-hero-curved-carousel-track {
  width: 100%;
  margin-top: 32px;
  position: relative;
  overflow: hidden;
}

.wb-hero-curved-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding: 0 24px;
  text-align: center;
  width: 100%;
}

@container wb-site (max-width: 600px) {
  .wb-hero-curved-copy { padding: 0 16px; }
  .wb-hero-curved-badge-wrap { margin-bottom: 18px; }
  .wb-hero-curved-badge { font-size: 12px; padding: 6px 14px; gap: 6px; }
  .wb-hero-curved-carousel .wb-hero-curved-sub { margin-top: 16px !important; }
  .wb-hero-curved-carousel-track { margin-top: 20px; }
  .wb-hero-curved-actions { margin-top: 16px; padding: 0 16px; }
  .wb-hero-curved-actions .wb-btn { flex: 1 1 100%; }
}

/* ==========================================================================
   CAMPAIGN VIDEO BANNER HERO (INTERACTIVE EVENT & FUNDRAISING BANNER)
   ========================================================================== */
.wb-hero-campaign-banner {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 0 !important;
  margin: 0;
}

.wb-campaign-banner-container {
  position: relative;
  width: 100%;
  min-height: 640px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.wb-hero-campaign-banner.wb-hero-min-screen .wb-campaign-banner-container {
  min-height: calc(100vh - 80px);
}
.wb-hero-campaign-banner.wb-hero-min-tall .wb-campaign-banner-container {
  min-height: 820px;
}
.wb-hero-campaign-banner.wb-hero-min-compact .wb-campaign-banner-container {
  min-height: 540px;
}

/* Media background layer */
.wb-campaign-media-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
  background-color: #0f172a;
}

.wb-campaign-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  z-index: 2;
}

.wb-campaign-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  z-index: 1;
}

.wb-campaign-media-layer .wb-hero-bg-iframe-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.wb-campaign-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.wb-campaign-overlay.wb-overlay-dark {
  background: rgba(0, 0, 0, 0.32);
}
.wb-campaign-overlay.wb-overlay-light {
  background: rgba(255, 255, 255, 0.28);
}
.wb-campaign-overlay.wb-overlay-gradient {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.1) 45%, rgba(0, 0, 0, 0.6) 100%);
}

/* Headline & Description Copy */
.wb-campaign-copy-wrap {
  position: relative;
  z-index: 5;
  text-align: left;
  max-width: 1100px;
  margin: 54px auto 26px;
  padding: 0 24px;
  color: #ffffff;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
  width: 100%;
}

.wb-campaign-copy-wrap.wb-align-left {
  text-align: left;
}
.wb-campaign-copy-wrap.wb-align-left .wb-campaign-subheading {
  margin-left: 0;
  margin-right: auto;
}

.wb-campaign-copy-wrap.wb-align-center {
  text-align: center;
}
.wb-campaign-copy-wrap.wb-align-center .wb-campaign-subheading {
  margin-left: auto;
  margin-right: auto;
}

.wb-campaign-eyebrow {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.wb-campaign-heading h1 {
  font-family: var(--wb-font-heading);
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 800;
  line-height: 1.12;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.wb-campaign-subheading {
  font-size: clamp(15px, 2.2vw, 19px);
  margin-top: 14px;
  opacity: 0.95;
  line-height: 1.5;
  max-width: 720px;
}

/* Simple Hero CTA Buttons Design */
.wb-campaign-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 32px;
}

.wb-campaign-actions.wb-align-left {
  justify-content: flex-start;
}

.wb-campaign-actions.wb-align-center {
  justify-content: center;
}

.wb-campaign-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 30px;
  border-radius: 9999px;
  background: #2563eb;
  color: #ffffff !important;
  font-size: 15.5px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 18px rgba(37, 99, 235, 0.42), 0 2px 6px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.wb-campaign-btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.52), 0 4px 10px rgba(0, 0, 0, 0.16);
}

.wb-campaign-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff !important;
  font-size: 15.5px;
  font-weight: 600;
  text-decoration: none;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
}

.wb-campaign-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
}

/* Floating Cards Row */
.wb-campaign-cards-row {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 0 24px 64px;
  max-width: 1100px;
  margin: auto auto 0;
  width: 100%;
}

/* Card 1: Stats Widget */
.wb-campaign-stat-card {
  background: #ffffff;
  color: #18181b;
  border-radius: 20px;
  padding: 22px 28px;
  display: flex;
  align-items: center;
  gap: 32px;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.wb-campaign-stat-col {
  display: flex;
  align-items: center;
  gap: 16px;
}

.wb-campaign-stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #eff6ff;
  color: #2563eb;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.wb-campaign-stat-svg {
  width: 26px;
  height: 26px;
}

.wb-campaign-stat-custom-icon {
  font-size: 24px;
  line-height: 1;
}

.wb-campaign-stat-info {
  display: flex;
  flex-direction: column;
}

.wb-campaign-stat-label {
  font-size: 13.5px;
  font-weight: 600;
  color: #71717a;
  text-transform: capitalize;
}

.wb-campaign-stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #18181b;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Card 2: Campaign Target & Progress Widget */
.wb-campaign-progress-card {
  background: #ffffff;
  color: #18181b;
  border-radius: 20px;
  padding: 22px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: min(100%, 460px);
  flex: 1;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.wb-campaign-progress-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.wb-campaign-raised-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 22px;
  font-weight: 800;
  color: #18181b;
  letter-spacing: -0.02em;
}

.wb-campaign-currency {
  font-size: 19px;
  font-weight: 700;
  color: #2563eb;
}

.wb-campaign-raised-val {
  font-size: 22px;
  font-weight: 800;
}

.wb-campaign-raised-label {
  font-size: 13.5px;
  font-weight: 600;
  color: #71717a;
  margin-left: 4px;
}

.wb-campaign-target-val {
  font-size: 13.5px;
  font-weight: 600;
  color: #71717a;
}

.wb-campaign-progress-track {
  width: 100%;
  height: 12px;
  border-radius: 9999px;
  background: #e2e8f0;
  overflow: hidden;
  position: relative;
}

.wb-campaign-progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 12px rgba(37, 99, 235, 0.4);
}

.wb-campaign-progress-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.wb-campaign-btn-donate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a !important;
  font-size: 14.5px;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid #cbd5e1;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-campaign-btn-donate:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.wb-campaign-btn-register {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 12px;
  background: #2563eb;
  color: #ffffff !important;
  font-size: 14.5px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.32);
}
.wb-campaign-btn-register:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

/* Bottom divider shape */
.wb-campaign-bottom-divider {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
  z-index: 4;
  pointer-events: none;
}
.wb-campaign-bottom-divider svg,
.wb-campaign-bottom-svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* Campaign Banner Responsive */
@container wb-site (max-width: 900px) {
  .wb-campaign-cards-row {
    padding-bottom: 40px;
    gap: 16px;
  }
  .wb-campaign-stat-card {
    width: 100%;
    justify-content: space-around;
  }
  .wb-campaign-progress-card {
    width: 100%;
    min-width: 100%;
  }
}

@container wb-site (max-width: 600px) {
  .wb-campaign-copy-wrap {
    margin: 24px auto 14px;
    padding: 0 16px;
  }
  .wb-campaign-cards-row {
    padding: 0 16px 36px;
  }
  .wb-campaign-stat-card {
    padding: 16px 20px;
    gap: 18px;
  }
  .wb-campaign-stat-icon-wrap {
    width: 40px;
    height: 40px;
  }
  .wb-campaign-stat-svg {
    width: 20px;
    height: 20px;
  }
  .wb-campaign-stat-value {
    font-size: 22px;
  }
  .wb-campaign-progress-card {
    padding: 18px 20px;
  }
  .wb-campaign-progress-actions {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .wb-campaign-ticker-pill {
    padding: 6px 14px;
    font-size: 12px;
  }
}

/* 3D curved video reel (shared by the hero and carousel sections) */
.wb-reel { position: relative; width: 100%; overflow: hidden; user-select: none; -webkit-user-select: none; }
.wb-reel-interactive { cursor: grab; touch-action: pan-y; }
.wb-reel-interactive:active { cursor: grabbing; }
.wb-reel-stage {
  position: relative;
  width: 100%;
  margin: 0 auto;
  perspective: 1200px;
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
}
.wb-reel-card {
  position: absolute;
  left: 0;
  transform-origin: center center;
  will-change: transform;
}
.wb-reel-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 24px;
  background: color-mix(in srgb, var(--wb-text) 10%, transparent);
  box-shadow: 0 20px 38px -12px rgb(15 23 42 / 0.22);
  transition: transform 0.3s ease;
}
.wb-reel-card:hover .wb-reel-card-inner { transform: scale(1.025); }
.wb-site .wb-reel-img {
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  transition: transform 0.7s ease-out;
}
.wb-reel-card:hover .wb-reel-img { transform: scale(1.05); }
.wb-reel-shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(to top, rgb(0 0 0 / 0.62) 0%, rgb(0 0 0 / 0) 46%, rgb(0 0 0 / 0) 72%, rgb(0 0 0 / 0.18) 100%);
}
.wb-reel-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  max-width: calc(100% - 28px);
  padding: 5px 11px;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.88);
  color: #0f172a;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.wb-reel-play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding-left: 3px;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.92);
  color: var(--wb-primary);
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.2);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.wb-reel-card:hover .wb-reel-play { opacity: 1; transform: translate(-50%, -50%) scale(1); }
.wb-reel-meta {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px;
  color: #ffffff;
  text-align: left;
}
.wb-reel-author {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0.02em;
  color: rgb(255 255 255 / 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wb-site .wb-reel-title {
  font-family: var(--wb-font-heading);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 6px rgb(0 0 0 / 0.35);
}
.wb-reel-ring {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.22);
}
.wb-reel-compact .wb-reel-card-inner { border-radius: 18px; }
.wb-reel-compact .wb-reel-badge { top: 10px; left: 10px; max-width: calc(100% - 20px); padding: 4px 9px; font-size: 10px; }
.wb-reel-compact .wb-reel-meta { padding: 12px; }
.wb-reel-compact .wb-reel-author { font-size: 10px; }
.wb-site .wb-reel-compact .wb-reel-title { font-size: 13px; }
.wb-reel-compact .wb-reel-play { width: 40px; height: 40px; }

.wb-reel-modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgb(0 0 0 / 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.wb-reel-modal-panel {
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  border-radius: 16px;
  background: var(--wb-bg);
  color: var(--wb-text);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.4);
}
.wb-reel-modal-head,
.wb-reel-modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
}
.wb-reel-modal-head { border-bottom: 1px solid var(--wb-border); }
.wb-reel-modal-eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--wb-primary);
}
.wb-site .wb-reel-modal-title { font-size: 18px; font-weight: 700; }
.wb-reel-modal-close {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  border: 1px solid var(--wb-border);
  background: var(--wb-surface);
  font-size: 13px;
  cursor: pointer;
}
.wb-reel-modal-media { aspect-ratio: 9 / 14; max-height: 65vh; width: 100%; background: #000000; }
.wb-reel-modal-media video,
.wb-site .wb-reel-modal-media img { width: 100%; height: 100%; max-width: none; object-fit: cover; }
.wb-reel-modal-author { font-size: 14px; font-weight: 500; }
.wb-reel-modal-sub { font-size: 12px; color: var(--wb-muted); }
.wb-reel-modal-done {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* ==========================================================================
   Universal Video Demo Modal Popup
   ========================================================================== */
.wb-video-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(6, 9, 20, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: wbVideoFadeIn 0.22s ease-out;
}

.wb-video-modal-dialog {
  position: relative;
  width: 100%;
  max-width: 1040px;
  border-radius: 18px;
  background: #0b0f1c;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 30px 90px -15px rgba(0, 0, 0, 0.85), 0 0 40px rgba(59, 130, 246, 0.12);
  overflow: hidden;
  animation: wbVideoScaleUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.wb-video-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  background: rgba(18, 24, 43, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.wb-video-modal-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.wb-video-modal-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 9999px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #60a5fa;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.wb-video-modal-badge-icon {
  width: 11px;
  height: 11px;
}

.wb-video-modal-title {
  color: #f8fafc;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wb-video-modal-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.wb-video-modal-close-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
}

.wb-video-modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  transform: scale(1.02);
}

.wb-video-modal-close-btn svg {
  width: 14px;
  height: 14px;
}

.wb-video-modal-esc-hint {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.wb-video-modal-player-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 75vh;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.wb-video-modal-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.wb-video-modal-video-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
}

.wb-video-modal-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000000;
}

.wb-video-modal-loader {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 500;
  z-index: 5;
}

.wb-video-modal-spinner {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: #3b82f6;
  animation: wbVideoSpin 0.75s linear infinite;
}

.wb-video-modal-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
  color: #f87171;
  font-size: 14px;
}

.wb-video-modal-error-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.18s ease;
}

.wb-video-modal-error-btn:hover {
  background: #1d4ed8;
}

@keyframes wbVideoFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes wbVideoScaleUp {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes wbVideoSpin {
  to { transform: rotate(360deg); }
}

/* Full Image / Video Background Overlay & High Contrast Text */
.wb-hero-has-bg-media {
  position: relative; overflow: hidden;
}
.wb-hero-has-bg-media .wb-hero-copy {
  position: relative; z-index: 2;
}

.wb-hero-dark-overlay,
.wb-hero-background-image,
.wb-hero-video-bg {
  position: relative;
}
/* Light text over the media unless the section sets its own text colors. */
.wb-hero-dark-overlay:not(.wb-custom-text),
.wb-hero-background-image:not(.wb-custom-text),
.wb-hero-video-bg:not(.wb-custom-text),
.wb-hero-dark-overlay:not(.wb-custom-text) h1,
.wb-hero-dark-overlay:not(.wb-custom-text) h2,
.wb-hero-dark-overlay:not(.wb-custom-text) h3,
.wb-hero-background-image:not(.wb-custom-text) h1,
.wb-hero-video-bg:not(.wb-custom-text) h1 {
  color: #ffffff !important;
}
.wb-hero-dark-overlay h1,
.wb-hero-dark-overlay h2,
.wb-hero-dark-overlay h3,
.wb-hero-background-image h1,
.wb-hero-video-bg h1 {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
}
.wb-hero-dark-overlay:not(.wb-custom-muted) .wb-hero-sub,
.wb-hero-dark-overlay:not(.wb-custom-muted) .wb-hero-desc,
.wb-hero-dark-overlay:not(.wb-custom-muted) .wb-muted,
.wb-hero-background-image:not(.wb-custom-muted) .wb-muted,
.wb-hero-video-bg:not(.wb-custom-muted) .wb-muted {
  color: #e2e8f0 !important;
}
.wb-hero-dark-overlay .wb-hero-sub,
.wb-hero-dark-overlay .wb-hero-desc,
.wb-hero-dark-overlay .wb-muted,
.wb-hero-background-image .wb-muted,
.wb-hero-video-bg .wb-muted {
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
}
/* Gradient text is transparent, so a text shadow would cover it. */
.wb-hero-dark-overlay .wb-text-gradient,
.wb-hero-background-image .wb-text-gradient,
.wb-hero-video-bg .wb-text-gradient {
  text-shadow: none;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45));
}
.wb-hero-dark-overlay .wb-hero-badge,
.wb-hero-background-image .wb-hero-badge,
.wb-hero-video-bg .wb-hero-badge {
  background: rgba(255, 255, 255, 0.18) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.wb-hero-dark-overlay .wb-btn-secondary,
.wb-hero-background-image .wb-btn-secondary,
.wb-hero-video-bg .wb-btn-secondary {
  background: rgba(255, 255, 255, 0.16) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.35) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.wb-hero-dark-overlay .wb-btn-secondary:hover,
.wb-hero-background-image .wb-btn-secondary:hover,
.wb-hero-video-bg .wb-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.28) !important;
  border-color: rgba(255, 255, 255, 0.6) !important;
}
.wb-hero-dark-overlay .wb-btn-video-play,
.wb-hero-video-bg .wb-btn-video-play {
  color: #ffffff !important;
}
.wb-hero-dark-overlay .wb-play-icon-pill,
.wb-hero-video-bg .wb-play-icon-pill {
  background: #ffffff !important;
  color: #0f172a !important;
}

.wb-hero-bg-media {
  position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden; pointer-events: none;
  background: radial-gradient(ellipse at 50% 30%, #1e293b 0%, #0f172a 60%, #020617 100%);
}
.wb-hero-bg-media img, .wb-hero-bg-media video {
  width: 100%; height: 100%; border: 0;
  object-fit: cover;
  transition: opacity 0.4s ease-out;
  font-size: 0;
  color: transparent;
}
.wb-hero-bg-iframe-container {
  position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none;
}
.wb-hero-bg-iframe {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  height: 56.25vw; /* 16:9 */
  min-height: 100vh;
  min-width: 177.77vh; /* 16:9 */
  transform: translate(-50%, -50%);
  pointer-events: none;
  border: 0;
}
.wb-bg-pos-bottom img, .wb-bg-pos-bottom video {
  object-fit: contain; object-position: bottom center;
}
.wb-bg-pos-cover img, .wb-bg-pos-cover video {
  object-fit: cover; object-position: center;
}
.wb-bg-pos-top img, .wb-bg-pos-top video {
  object-fit: cover; object-position: top center;
}
.wb-bg-pos-center img, .wb-bg-pos-center video {
  object-fit: cover; object-position: center;
}

.wb-hero-overlay {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
}
.wb-overlay-dark { background: #000000; }
.wb-overlay-light { background: #ffffff; }
.wb-overlay-gradient {
  background: linear-gradient(180deg, var(--wb-bg) 0%, color-mix(in srgb, var(--wb-bg) 60%, transparent) 45%, transparent 100%);
}

/* Bottom Anchored Character/Community Illustration (matching Myna UI reference) */
.wb-hero-bottom-illustration {
  min-height: 640px !important;
  padding-top: 56px !important;
  padding-bottom: 340px !important;
  position: relative !important;
  overflow: hidden !important;
}
.wb-hero-bottom-illustration .wb-hero-copy {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}
.wb-hero-bottom-illustration .wb-hero-bg-media {
  position: absolute !important;
  top: auto !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  height: 380px !important;
  z-index: 1 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: flex-end !important;
  pointer-events: none !important;
}
.wb-hero-bottom-illustration .wb-hero-bg-media img {
  width: 100% !important;
  max-width: 1120px !important;
  height: 100% !important;
  object-fit: contain !important;
  object-position: bottom center !important;
}

/* ------------------------------------------- Hero: Vintage Editorial ("Old soul, new stories.") */
.wb-editorial-subbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 40px;
  border-bottom: 1px solid rgba(29, 25, 16, 0.16);
  font-family: var(--vr-mono);
  font-size: 8.5px;
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #4B453C;
}
.wb-editorial-subbar > span { flex: 1; white-space: nowrap; }
.wb-editorial-subbar-center { text-align: center; font-weight: 600; color: var(--vr-text); }
.wb-editorial-subbar > span:last-child { text-align: right; }
@container wb-site (max-width: 768px) {
  .wb-editorial-subbar { height: auto; padding: 10px 0; flex-direction: column; gap: 6px; }
  .wb-editorial-subbar > span, .wb-editorial-subbar > span:last-child { text-align: center; }
}
@media (max-width: 768px) {
  .wb-editorial-subbar { height: auto; padding: 10px 0; flex-direction: column; gap: 6px; }
  .wb-editorial-subbar > span, .wb-editorial-subbar > span:last-child { text-align: center; }
}

.wb-section.wb-hero-vintage-editorial { padding: 0; min-height: 0; background: transparent; }
.wb-hero-vintage-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 428px;
  gap: 40px;
  padding: 45px 0 26px;
}
.wb-hero-vintage-grid.wb-media-left {
  grid-template-columns: 428px minmax(0, 1fr);
}
.wb-hero-vintage-grid.wb-media-left .wb-polaroid-stack {
  order: -1;
}
.wb-vintage-hero-copy { display: flex; flex-direction: column; align-items: flex-start; }
.wb-site .wb-vintage-hero-heading {
  margin: 0;
  font-family: var(--vr-serif);
  font-size: 101px;
  line-height: 1;
  font-weight: 300;
  font-variation-settings: "opsz" 144;
  letter-spacing: -0.01em;
  color: var(--vr-text);
}
.wb-vintage-hero-heading em,
.wb-vintage-italic-accent { font-style: italic; font-weight: 300; color: var(--vr-red); }
.wb-vintage-hero-desc {
  max-width: 430px;
  margin: 20px 0 0;
  font-family: var(--wb-font-body);
  font-size: 16px;
  line-height: 26.5px;
  color: #3A342C;
}
.wb-vintage-hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 24px; }
.wb-vintage-btn-primary,
.wb-vintage-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 21px;
  border-radius: 9999px;
  font-family: var(--wb-font-body);
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}
.wb-vintage-btn-primary { background: var(--vr-text); color: var(--vr-paper); border: 1.5px solid var(--vr-text); }
.wb-vintage-btn-primary:hover { background: #2E2820; color: var(--vr-paper); transform: translateY(-1px); }
.wb-vintage-btn-secondary { background: transparent; color: var(--vr-text); border: 1.5px solid var(--vr-text); }
.wb-vintage-btn-secondary:hover { background: rgba(29, 25, 16, 0.06); color: var(--vr-text); transform: translateY(-1px); }
.wb-vintage-btn-secondary svg { width: 11px; height: 11px; }

.wb-polaroid-stack { position: relative; height: 380px; margin-top: 46px; }
.wb-polaroid-card {
  position: absolute;
  margin: 0;
  padding: 8px 8px 26px;
  background: #FFFFFF;
  box-shadow: 0 14px 28px rgba(29, 25, 16, 0.18), 0 2px 5px rgba(29, 25, 16, 0.1);
  transition: transform 0.3s ease;
}
.wb-polaroid-card.card-top { top: 0; left: 0; width: 278px; z-index: 1; }
.wb-polaroid-card.card-bottom { top: 182px; right: 0; width: 250px; z-index: 2; }
.wb-polaroid-img-wrap { overflow: hidden; background: #231C18; aspect-ratio: 1 / 1.02; }
.wb-polaroid-card.card-bottom .wb-polaroid-img-wrap { aspect-ratio: 7 / 5; }
.wb-polaroid-img-wrap img { display: block; width: 100%; height: 100%; object-fit: cover; }
.wb-polaroid-card.card-top img { filter: sepia(0.65) contrast(1.05) brightness(0.95); }
.wb-polaroid-caption {
  margin-top: 7px;
  font-family: var(--vr-serif);
  font-size: 10px;
  font-style: italic;
  line-height: 1.2;
  color: #3A342C;
}
@container wb-site (max-width: 960px) {
  .wb-hero-vintage-grid { grid-template-columns: 1fr; }
  .wb-site .wb-vintage-hero-heading { font-size: clamp(56px, 13cqi, 101px); }
  .wb-polaroid-stack { width: 100%; max-width: 428px; margin: 0 auto; }
}
@media (max-width: 960px) {
  .wb-hero-vintage-grid { grid-template-columns: 1fr; }
  .wb-hero-vintage-grid.wb-media-left .wb-polaroid-stack { order: 0; }
  .wb-site .wb-vintage-hero-heading { font-size: clamp(56px, 13cqi, 101px); }
  .wb-polaroid-stack { width: 100%; max-width: 428px; margin: 0 auto; }
}

/* --------------------------------------- Hero: Vintage Sunburst (About page) */
.wb-section.wb-hero-sunburst-wrap { padding: 21px 0 0; min-height: 0; background: var(--wb-section-bg, var(--vr-cream)); }
.wb-hero-sunburst-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  align-items: center;
  min-height: 569px;
  padding: 0 95px 0 54px;
  overflow: hidden;
  border-radius: 20px;
  background: #EEB958;
}
.wb-sunburst-rays {
  position: absolute;
  top: 50%;
  left: 57%;
  width: max(2600px, 300%);
  height: max(2600px, 300%);
  transform: translate(-50%, -50%);
  pointer-events: none;
  background: repeating-conic-gradient(from 0deg at center, #F3CB7C 0deg 5deg, transparent 5deg 10deg);
  animation: wbSunburstSpin 35s linear infinite;
  transform-origin: center center;
  will-change: transform;
}
@keyframes wbSunburstSpin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
.wb-sunburst-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: flex-start; }
.wb-sunburst-badge {
  display: inline-flex;
  align-items: center;
  height: 23px;
  padding: 0 12px;
  border-radius: 9999px;
  background: #2C1A11;
  color: var(--vr-cream);
  font-family: var(--wb-font-body);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.wb-site .wb-sunburst-heading {
  margin: 14px 0 0;
  font-family: var(--vr-display);
  font-size: 83px;
  line-height: 80px;
  font-weight: 900;
  letter-spacing: -0.005em;
  color: #22160F;
}
.wb-sunburst-title-white { display: block; color: var(--vr-cream); text-shadow: 3px 3px 0 #22160F; }
.wb-sunburst-desc {
  max-width: 360px;
  margin: 20px 0 0;
  font-family: var(--wb-font-body);
  font-size: 16px;
  line-height: 26px;
  font-weight: 500;
  color: #2C1A11;
}
.wb-sunburst-content .wb-vintage-hero-actions { margin-top: 19px; }
.wb-sunburst-content .wb-vintage-btn-primary { height: 40px; padding: 0 22px; background: #22160F; border-color: #22160F; color: var(--vr-cream); }
.wb-sunburst-portrait-wrap { position: relative; z-index: 1; display: flex; justify-content: flex-end; }
.wb-sunburst-circle-frame {
  position: relative;
  width: 317px;
  height: 317px;
  border-radius: 50%;
  border: 5px solid #1F1A14;
  background: #1F1A14;
  box-shadow: 11px 12px 0 #D35A2E;
  overflow: hidden;
}
.wb-sunburst-circle-frame img { display: block; width: 100%; height: 100%; object-fit: cover; filter: sepia(0.7) contrast(1.05); }
@container wb-site (max-width: 960px) {
  .wb-hero-sunburst-card { grid-template-columns: 1fr; gap: 32px; padding: 48px 24px; }
  .wb-sunburst-rays { left: 50%; }
  .wb-site .wb-sunburst-heading { font-size: clamp(48px, 12cqi, 83px); line-height: 0.96; }
  .wb-sunburst-portrait-wrap { justify-content: center; }
  .wb-sunburst-circle-frame { width: min(317px, 70cqi); height: min(317px, 70cqi); }
}
@media (max-width: 960px) {
  .wb-hero-sunburst-card { grid-template-columns: 1fr; gap: 32px; padding: 48px 24px; }
  .wb-sunburst-rays { left: 50%; }
  .wb-site .wb-sunburst-heading { font-size: clamp(48px, 12cqi, 83px); line-height: 0.96; }
  .wb-sunburst-portrait-wrap { justify-content: center; }
  .wb-sunburst-circle-frame { width: min(317px, 70cqi); height: min(317px, 70cqi); }
}

/* -------------------------------------- Split: studio polaroid (About) */
.wb-section.wb-split-vintage { padding: 70px 0 0; background: var(--wb-section-bg, var(--vr-cream)); }
.wb-split-vintage .wb-split-grid { grid-template-columns: 455px minmax(0, 1fr); gap: 47px; align-items: start; }
.wb-split-polaroid-frame {
  position: relative;
  max-width: 440px;
  margin: 0 auto;
  padding: 10px 10px 32px;
  background: #FFFFFF;
  box-shadow: 0 16px 36px rgba(41, 27, 18, 0.18), 0 2px 6px rgba(41, 27, 18, 0.1);
  transform: rotate(-1.5deg);
}
.wb-split-tape-strip {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%) rotate(1deg);
  z-index: 2;
  padding: 3px 18px;
  background: #E8D5B0;
  color: #291B12;
  font-family: var(--vr-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
.wb-split-polaroid-img-wrap { overflow: hidden; aspect-ratio: 4 / 3; background: #231C18; }
.wb-split-polaroid-img-wrap img { display: block; width: 100%; height: 100%; object-fit: cover; filter: sepia(0.65) contrast(1.05); }
.wb-split-vintage .wb-split-content { padding-top: 10px; }
.wb-split-vintage .wb-split-heading {
  margin: 0;
  font-family: var(--vr-serif);
  font-size: 47px;
  line-height: 52px;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: #22160F;
}
.wb-split-vintage .wb-split-desc {
  margin: 20px 0 0;
  font-family: var(--wb-font-body);
  font-size: 13.5px;
  line-height: 25px;
  color: #403429;
}
@container wb-site (max-width: 900px) {
  .wb-split-vintage .wb-split-grid { grid-template-columns: 1fr; gap: 32px; }
  .wb-split-vintage .wb-split-heading { font-size: 36px; line-height: 40px; }
}
@media (max-width: 900px) {
  .wb-split-vintage .wb-split-grid { grid-template-columns: 1fr; gap: 32px; }
  .wb-split-vintage .wb-split-heading { font-size: 36px; line-height: 40px; }
}


/* ==========================================================================
   Features Section - High-Fidelity Responsive System (Grid, Split, Pastel, Minimal)
   ========================================================================== */
.wb-features-section {
  position: relative;
}

/* Split Screen Feature Layout (matching Image 2) */
.wb-features-split-container {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 64px;
  align-items: center;
}
.wb-features-split-reversed .wb-features-split-container {
  grid-template-columns: 1.15fr 1fr;
}
.wb-features-split-hero {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.wb-features-split-title {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.15;
  margin: 0;
  color: var(--wb-text);
}
.wb-features-split-intro {
  font-size: 17px;
  line-height: 1.65;
  margin: 0;
  color: var(--wb-muted);
}
.wb-features-split-visual {
  margin-top: 12px;
  border-radius: calc(var(--wb-radius) * 1.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.wb-features-split-img {
  width: 100%;
  max-width: 480px;
  height: auto;
  border-radius: calc(var(--wb-radius) * 1.5);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
}
.wb-feature-illustration-wrap {
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: center;
}
.wb-feature-illustration-svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.06));
}
.wb-features-split-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 8px;
}
.wb-features-split-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Feature Cards & Layouts */
.wb-feature-card {
  position: relative;
  border-radius: calc(var(--wb-radius) * 1.25);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
}
.wb-feature-card-stacked {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  gap: 20px;
  padding: 22px 26px;
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  border-radius: 20px;
}
.wb-feature-card-stacked:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
  border-color: color-mix(in srgb, var(--wb-primary) 35%, var(--wb-border));
}
.wb-feature-card-stacked .wb-feature-icon-wrap {
  margin: 2px 0 0 0 !important;
  flex-shrink: 0;
}
.wb-feature-card-stacked .wb-feature-content {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.wb-feature-card-grid {
  display: flex;
  flex-direction: column;
  padding: 24px;
}
.wb-feature-card-grid:hover {
  transform: translateY(-2px);
}

/* Card Alignment */
.wb-feature-card-grid.wb-feature-align-center {
  text-align: center;
  align-items: center;
}
.wb-feature-card-grid.wb-feature-align-center .wb-feature-icon-wrap {
  margin-left: auto;
  margin-right: auto;
}
.wb-feature-card-grid.wb-feature-align-center .wb-feature-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.wb-feature-card-grid.wb-feature-align-center .wb-feature-header-row {
  justify-content: center;
  width: 100%;
}

.wb-feature-card-grid.wb-feature-align-left {
  text-align: left;
  align-items: flex-start;
}
.wb-feature-card-grid.wb-feature-align-left .wb-feature-icon-wrap {
  margin-left: 0;
  margin-right: auto;
}
.wb-feature-card-grid.wb-feature-align-left .wb-feature-content {
  text-align: left;
  width: 100%;
}
.wb-feature-card-grid.wb-feature-align-left .wb-feature-header-row {
  justify-content: flex-start;
}

.wb-feature-card-grid.wb-feature-align-right {
  text-align: right;
  align-items: flex-end;
}
.wb-feature-card-grid.wb-feature-align-right .wb-feature-icon-wrap {
  margin-left: auto;
  margin-right: 0;
}
.wb-feature-card-grid.wb-feature-align-right .wb-feature-content {
  text-align: right;
  width: 100%;
}
.wb-feature-card-grid.wb-feature-align-right .wb-feature-header-row {
  justify-content: flex-end;
}

/* Card Surface Variants */
.wb-feature-card-surface {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}
.wb-feature-card-bordered {
  background: transparent;
  border: 1px solid var(--wb-border);
}
.wb-feature-card-glass {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}
.wb-feature-card-transparent {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 16px 12px;
}
.wb-feature-card-has-custom-bg {
  border-color: color-mix(in srgb, var(--wb-border) 60%, transparent);
}
.wb-feature-card-dark,
.wb-feature-card-dark h3,
.wb-feature-card-dark .wb-feature-title {
  color: #ffffff !important;
}
.wb-feature-card-dark p,
.wb-feature-card-dark .wb-feature-desc,
.wb-feature-card-dark .wb-muted {
  color: #cbd5e1 !important;
}

/* Column Dividers System */
.wb-features-grid.wb-features-grid-divided {
  gap: 0 !important;
  position: relative;
}
.wb-features-grid-divided .wb-feature-card {
  position: relative;
  border-radius: 0;
  padding: 24px 32px;
}
.wb-features-grid-divided .wb-feature-card-transparent {
  padding: 20px 28px;
}
.wb-features-grid-divided {
  --wb-divider-color: var(--wb-feature-divider, rgba(226, 232, 240, 0.8));
}
.wb-section.wb-bg-primary .wb-features-grid-divided,
.wb-section.wb-bg-dark .wb-features-grid-divided,
.wb-features-grid-divided.wb-features-dark {
  --wb-divider-color: var(--wb-feature-divider, rgba(255, 255, 255, 0.22));
}
@media (min-width: 768px) {
  .wb-features-grid-divided.wb-features-divided-inset .wb-feature-card:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 18%;
    bottom: 18%;
    width: 1px;
    background: var(--wb-divider-color);
    pointer-events: none;
  }
  .wb-features-grid-divided.wb-features-divided-full .wb-feature-card:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--wb-divider-color);
    pointer-events: none;
  }
}
@media (max-width: 767px) {
  .wb-features-grid-divided .wb-feature-card {
    padding: 20px 16px;
  }
  .wb-features-grid-divided .wb-feature-card:not(:last-child) {
    border-bottom: 1px solid var(--wb-divider-color, rgba(255, 255, 255, 0.15));
  }
}

/* Ensure text on primary/dark backgrounds is readable and crisp */
.wb-section.wb-bg-primary .wb-feature-card-transparent .wb-feature-title,
.wb-section.wb-bg-dark .wb-feature-card-transparent .wb-feature-title {
  color: #ffffff;
}
.wb-section.wb-bg-primary .wb-feature-card-transparent .wb-feature-desc,
.wb-section.wb-bg-dark .wb-feature-card-transparent .wb-feature-desc {
  color: rgba(255, 255, 255, 0.9);
}

/* Feature Icon Badges - Pixel-Perfect Centering & Alignment */
.wb-feature-icon-wrap {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  line-height: 0 !important;
  box-sizing: border-box;
}
.wb-feature-card:hover .wb-feature-icon-wrap {
  transform: scale(1.06);
}

/* Hard reset for inherited global .wb-icon styling */
.wb-feature-icon-wrap .wb-icon {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
  color: inherit !important;
  line-height: 0 !important;
}

.wb-feature-icon-wrap .wb-icon svg {
  display: block !important;
  margin: auto !important;
  stroke: currentColor;
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.wb-feature-icon-wrap .wb-icon-emoji {
  font-size: 26px;
  line-height: 1;
}

/* 1. Pastel Circular Badge (Image 1 reference) */
.wb-icon-style-pastel-circle {
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  border-radius: 9999px;
  margin-bottom: 20px;
}
.wb-icon-style-pastel-circle .wb-icon svg {
  width: 26px !important;
  height: 26px !important;
}

/* 2. Modern Rounded Squircle Badge (Image 2 reference) */
.wb-icon-style-square-badge {
  width: 52px;
  height: 52px;
  min-width: 52px;
  min-height: 52px;
  border-radius: 14px;
  margin-bottom: 0;
}
.wb-icon-style-square-badge .wb-icon svg {
  width: 24px !important;
  height: 24px !important;
}

/* 3. Minimal Accent Icon (Image 3 reference) */
.wb-icon-style-minimal-accent {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  margin-bottom: 18px;
  background: transparent;
  color: var(--wb-primary);
}
.wb-icon-style-minimal-accent .wb-icon svg {
  width: 32px !important;
  height: 32px !important;
  stroke-width: 2.2px;
}

/* 4. Solid / Gradient Colored Circle */
.wb-icon-style-colored-circle {
  width: 54px;
  height: 54px;
  min-width: 54px;
  min-height: 54px;
  border-radius: 9999px;
  color: #ffffff !important;
  margin-bottom: 18px;
}
.wb-icon-style-colored-circle .wb-icon svg {
  width: 24px !important;
  height: 24px !important;
}

/* Theme colours: follow the site's primary and secondary instead of a fixed palette */
.wb-color-primary.wb-icon-style-pastel-circle { background: color-mix(in srgb, var(--wb-primary) 14%, transparent); color: var(--wb-primary); }
.wb-color-primary.wb-icon-style-square-badge { background: color-mix(in srgb, var(--wb-primary) 8%, transparent); border: 1px solid color-mix(in srgb, var(--wb-primary) 22%, transparent); color: var(--wb-primary); }
.wb-color-primary.wb-icon-style-colored-circle { background: linear-gradient(135deg, color-mix(in srgb, var(--wb-primary) 70%, #ffffff), var(--wb-primary)); color: var(--wb-on-primary) !important; }
.wb-color-primary.wb-icon-style-minimal-accent { color: var(--wb-primary); }

.wb-color-secondary.wb-icon-style-pastel-circle { background: color-mix(in srgb, var(--wb-secondary) 16%, transparent); color: var(--wb-secondary-ink); }
.wb-color-secondary.wb-icon-style-square-badge { background: color-mix(in srgb, var(--wb-secondary) 10%, transparent); border: 1px solid color-mix(in srgb, var(--wb-secondary-ink) 24%, transparent); color: var(--wb-secondary-ink); }
.wb-color-secondary.wb-icon-style-colored-circle { background: linear-gradient(135deg, color-mix(in srgb, var(--wb-secondary) 70%, #ffffff), var(--wb-secondary)); color: var(--wb-on-secondary) !important; }
.wb-color-secondary.wb-icon-style-minimal-accent { color: var(--wb-secondary-ink); }

/* Curated Pastel & Color Palette Badges */
.wb-color-orange.wb-icon-style-pastel-circle { background: #ffedd5; color: #ea580c; }
.wb-color-orange.wb-icon-style-square-badge { background: #fff7ed; border: 1px solid #ffedd5; color: #f97316; }
.wb-color-orange.wb-icon-style-colored-circle { background: linear-gradient(135deg, #fb923c, #ea580c); }

.wb-color-green.wb-icon-style-pastel-circle { background: #dcfce7; color: #16a34a; }
.wb-color-green.wb-icon-style-square-badge { background: #f0fdf4; border: 1px solid #dcfce7; color: #22c55e; }
.wb-color-green.wb-icon-style-colored-circle { background: linear-gradient(135deg, #4ade80, #16a34a); }

.wb-color-yellow.wb-icon-style-pastel-circle { background: #fef9c3; color: #ca8a04; }
.wb-color-yellow.wb-icon-style-square-badge { background: #fefce8; border: 1px solid #fef9c3; color: #eab308; }
.wb-color-yellow.wb-icon-style-colored-circle { background: linear-gradient(135deg, #fde047, #ca8a04); }

.wb-color-cyan.wb-icon-style-pastel-circle { background: #cffafe; color: #0891b2; }
.wb-color-cyan.wb-icon-style-square-badge { background: #ecfeff; border: 1px solid #cffafe; color: #06b6d4; }
.wb-color-cyan.wb-icon-style-colored-circle { background: linear-gradient(135deg, #38bdf8, #0284c7); }

.wb-color-blue.wb-icon-style-pastel-circle { background: #dbeafe; color: #2563eb; }
.wb-color-blue.wb-icon-style-square-badge { background: #eff6ff; border: 1px solid #dbeafe; color: #3b82f6; }
.wb-color-blue.wb-icon-style-colored-circle { background: linear-gradient(135deg, #60a5fa, #2563eb); }

.wb-color-purple.wb-icon-style-pastel-circle { background: #f3e8ff; color: #9333ea; }
.wb-color-purple.wb-icon-style-square-badge { background: #faf5ff; border: 1px solid #f3e8ff; color: #a855f7; }
.wb-color-purple.wb-icon-style-colored-circle { background: linear-gradient(135deg, #c084fc, #9333ea); }

.wb-color-pink.wb-icon-style-pastel-circle { background: #fce7f3; color: #db2777; }
.wb-color-pink.wb-icon-style-square-badge { background: #fdf2f8; border: 1px solid #fce7f3; color: #ec4899; }
.wb-color-pink.wb-icon-style-colored-circle { background: linear-gradient(135deg, #f472b6, #db2777); }

.wb-color-indigo.wb-icon-style-pastel-circle { background: #e0e7ff; color: #4f46e5; }
.wb-color-indigo.wb-icon-style-square-badge { background: #eef2ff; border: 1px solid #e0e7ff; color: #6366f1; }
.wb-color-indigo.wb-icon-style-colored-circle { background: linear-gradient(135deg, #818cf8, #4f46e5); }

.wb-color-red.wb-icon-style-pastel-circle { background: #fee2e2; color: #dc2626; }
.wb-color-red.wb-icon-style-square-badge { background: #fef2f2; border: 1px solid #fee2e2; color: #ef4444; }
.wb-color-red.wb-icon-style-colored-circle { background: linear-gradient(135deg, #f87171, #dc2626); }

.wb-color-gray.wb-icon-style-pastel-circle { background: #f1f5f9; color: #475569; }
.wb-color-gray.wb-icon-style-square-badge { background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; }
.wb-color-gray.wb-icon-style-colored-circle { background: linear-gradient(135deg, #94a3b8, #475569); }
.wb-color-gray.wb-icon-style-minimal-accent { color: #64748b; }

.wb-color-none.wb-icon-style-pastel-circle { background: color-mix(in srgb, var(--wb-text) 8%, transparent); color: var(--wb-text); }
.wb-color-none.wb-icon-style-square-badge { background: transparent; border: 1px solid var(--wb-border); color: var(--wb-text); }
.wb-color-none.wb-icon-style-colored-circle { background: var(--wb-text); color: var(--wb-bg); }
.wb-color-none.wb-icon-style-minimal-accent { color: var(--wb-text); }

/* Typography & Content within card */
.wb-feature-content {
  flex: 1;
  min-width: 0;
}
.wb-feature-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.wb-feature-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--wb-text);
  margin: 0;
  line-height: 1.3;
}
.wb-feature-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 999px;
}
.wb-color-primary .wb-feature-badge { background: color-mix(in srgb, var(--wb-primary) 14%, transparent); color: var(--wb-primary); }
.wb-color-secondary .wb-feature-badge { background: color-mix(in srgb, var(--wb-secondary) 16%, transparent); color: var(--wb-secondary-ink); }
.wb-color-orange .wb-feature-badge { background: #ffedd5; color: #ea580c; }
.wb-color-green .wb-feature-badge { background: #dcfce7; color: #16a34a; }
.wb-color-blue .wb-feature-badge { background: #dbeafe; color: #2563eb; }
.wb-color-yellow .wb-feature-badge { background: #fef9c3; color: #ca8a04; }

.wb-feature-desc {
  font-size: 15px;
  color: var(--wb-muted);
  line-height: 1.6;
  margin: 0;
}
.wb-feature-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--wb-primary);
  margin-top: 12px;
  text-decoration: none;
  transition: gap 0.2s ease;
}
.wb-feature-link:hover {
  gap: 10px;
  text-decoration: underline;
}

/* Feature Bottom Link (matching Image 1 "Learn more >") */
.wb-features-bottom-cta {
  display: flex;
  margin-top: 48px;
}
.wb-features-bottom-cta.wb-align-center {
  justify-content: center;
}
.wb-features-bottom-cta.wb-align-left {
  justify-content: flex-start;
}
.wb-features-bottom-cta.wb-align-right {
  justify-content: flex-end;
}
.wb-features-bottom-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--wb-primary);
  text-decoration: none;
  transition: gap 0.2s ease, opacity 0.2s ease;
}
.wb-features-bottom-link:hover {
  gap: 10px;
  opacity: 0.85;
  text-decoration: underline;
}

/* Video Background Hero Polish */
.wb-hero-video-bg {
  background: radial-gradient(circle at 50% 15%, #1e1b4b 0%, #0f172a 60%, #020617 100%) !important;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.wb-hero-video-bg .wb-hero-copy {
  max-width: 840px;
  margin: 0 auto;
  align-items: center;
  position: relative;
  z-index: 2;
}
.wb-hero-video-bg .wb-hero-actions {
  justify-content: center;
}
.wb-hero-video-bg .wb-hero-media {
  margin-top: 40px;
  max-width: 860px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 2;
}

/* Bottom Shape Divider SVG */
.wb-shape-divider {
  position: absolute; bottom: 0; left: 0; right: 0; width: 100%; overflow: hidden; line-height: 0; z-index: 3;
  color: var(--wb-surface);
}
.wb-shape-divider svg { display: block; width: 100%; height: 50px; }

/* ------------------------------------------- Features: Editorial Process ("From first idea to final cut") */
.wb-section.wb-editorial-process { padding: 76px 0 0; background: transparent; }
.wb-site .wb-process-heading {
  margin: 26px 0 0;
  font-family: var(--vr-serif);
  font-size: 52.5px;
  line-height: 1.1;
  font-weight: 300;
  letter-spacing: -0.025em;
  color: var(--vr-text);
}
.wb-process-heading em { font-style: italic; color: var(--vr-red); }
.wb-process-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 26px; margin-top: 30px; }
.wb-process-col { padding-top: 16px; border-top: 1.5px solid #8D857A; }
.wb-process-num {
  display: block;
  font-family: var(--vr-serif);
  font-size: 30px;
  line-height: 1;
  font-style: italic;
  font-weight: 300;
  color: var(--vr-red);
}
.wb-site .wb-process-title {
  margin: 10px 0 0;
  font-family: var(--vr-serif);
  font-size: 15.5px;
  line-height: 1.3;
  font-weight: 700;
  color: var(--vr-text);
}
.wb-process-desc { margin: 8px 0 0; font-family: var(--wb-font-body); font-size: 11.5px; line-height: 23px; color: #5A5249; }
@container wb-site (max-width: 860px) {
  .wb-process-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 860px) {
  .wb-process-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container wb-site (max-width: 500px) {
  .wb-process-grid { grid-template-columns: 1fr; }
}
@media (max-width: 500px) {
  .wb-process-grid { grid-template-columns: 1fr; }
}

/* ------------------------------------------- Features: Colored Pillars (What drives us - About page) */
.wb-section.wb-colored-pillars-wrap { padding: 80px 0 0; background: var(--wb-section-bg, var(--vr-cream)); }
.wb-site .wb-colored-pillars-title {
  margin: 0;
  font-family: var(--vr-serif);
  font-size: 52px;
  line-height: 1.1;
  font-weight: 300;
  letter-spacing: -0.025em;
  color: #22160F;
  text-align: center;
}
.wb-colored-pillars-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 32px; }
.wb-colored-pillar {
  padding: 32px 28px 40px;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(41, 27, 18, 0.1);
  transition: transform 0.25s ease;
}
.wb-colored-pillar:hover { transform: translateY(-4px); }
.wb-colored-pillar.pillar-mission { background: var(--vr-teal); color: var(--vr-cream); }
.wb-colored-pillar.pillar-vision { background: var(--vr-plum); color: var(--vr-cream); }
.wb-colored-pillar.pillar-values { background: var(--vr-brown); color: var(--vr-cream); }
.wb-colored-pillar-badge {
  display: inline-flex;
  font-family: var(--vr-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--vr-gold);
}
.wb-site .wb-colored-pillar-title {
  margin: 18px 0 0;
  font-family: var(--vr-display);
  font-size: 26px;
  line-height: 1.2;
  font-weight: 700;
  color: inherit;
}
.wb-colored-pillar-desc {
  margin: 14px 0 0;
  font-family: var(--wb-font-body);
  font-size: 13px;
  line-height: 22px;
  opacity: 0.9;
  color: inherit;
}
@container wb-site (max-width: 860px) {
  .wb-colored-pillars-grid { grid-template-columns: 1fr; }
}
@media (max-width: 860px) {
  .wb-colored-pillars-grid { grid-template-columns: 1fr; }
}

/* Services (2026 Enhanced Standard) */
.wb-services-section { position: relative; }
.wb-services-grid { display: grid; gap: 28px; }

/* Backward compatibility aliases */
.wb-service { overflow: hidden; padding: 0; display: flex; flex-direction: column; }
.wb-service img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; }
.wb-service-body { padding: 24px; display: flex; flex-direction: column; flex: 1; }
.wb-service-link { margin-top: auto; padding-top: 14px; font-weight: 600; color: var(--wb-primary); }

/* Aspect Ratio Utilities */
.wb-aspect-16-9 { aspect-ratio: 16 / 9; }
.wb-aspect-16-10 { aspect-ratio: 16 / 10; }
.wb-aspect-4-3 { aspect-ratio: 4 / 3; }
.wb-aspect-1-1 { aspect-ratio: 1 / 1; }
.wb-aspect-21-9 { aspect-ratio: 21 / 9; }
.wb-aspect-auto { aspect-ratio: auto; }

/* Service Card Core */
.wb-service-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: var(--wb-radius);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease;
}

.wb-service-card:hover {
  transform: translateY(-4px);
}

/* Card Styles */
.wb-service-card-surface {
  background: var(--wb-surface);
  border: 1px solid color-mix(in srgb, var(--wb-border) 60%, transparent);
}

.wb-service-card-bordered {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.wb-service-card-bordered:hover {
  border-color: color-mix(in srgb, var(--wb-primary) 60%, var(--wb-border));
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.08);
}

.wb-service-card-flat {
  background: transparent;
  border: 1px solid transparent;
}
.wb-service-card-flat:hover {
  background: var(--wb-surface);
}

.wb-service-card-glass {
  background: color-mix(in srgb, var(--wb-surface) 75%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid color-mix(in srgb, var(--wb-text) 12%, transparent);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.06);
}

.wb-service-card-glow {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  box-shadow: 0 0 0 1px transparent;
}
.wb-service-card-glow:hover {
  box-shadow: 0 0 28px -4px color-mix(in srgb, var(--wb-primary) 28%, transparent), 0 8px 20px -6px rgba(0,0,0,0.06);
  border-color: var(--wb-primary);
}

.wb-service-card-elevated {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
}
.wb-service-card-elevated:hover {
  box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.12), 0 10px 15px -5px rgba(0, 0, 0, 0.06);
}

.wb-service-card-gradient {
  background: linear-gradient(145deg, color-mix(in srgb, var(--wb-surface) 90%, transparent), color-mix(in srgb, var(--wb-bg) 80%, transparent));
  border: 1px solid color-mix(in srgb, var(--wb-primary) 25%, var(--wb-border));
}

/* Featured Service Card Highlight */
.wb-service-card-featured {
  border-color: var(--wb-primary) !important;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--wb-primary) 30%, transparent), 0 12px 30px -8px rgba(0, 0, 0, 0.1) !important;
}

.wb-service-featured-pill {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 9999px;
  background: var(--wb-primary);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--wb-primary) 40%, transparent);
}

.wb-service-sparkle {
  width: 12px;
  height: 12px;
}

/* Service Image Wrap */
.wb-service-image-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: color-mix(in srgb, var(--wb-text) 5%, transparent);
}

.wb-service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.wb-service-card:hover .wb-service-image {
  transform: scale(1.04);
}

.wb-service-floating-price {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(15, 23, 42, 0.85);
  color: #ffffff;
  backdrop-filter: blur(8px);
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.wb-service-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  width: 100%;
}

.wb-service-top-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wb-service-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.wb-service-number {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--wb-primary);
  opacity: 0.9;
}

/* Service Icon - Refined Premium Sizing & Pixel-Perfect Center */
.wb-service-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease;
}

.wb-service-card:hover .wb-service-icon-wrap {
  transform: translateY(-2px) scale(1.04);
}

/* Hard reset for inherited global .wb-icon styling inside service cards */
.wb-service-icon-wrap .wb-icon,
.wb-interactive-icon .wb-icon {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: inherit !important;
  border-radius: inherit !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
}

.wb-service-icon-wrap .wb-icon svg {
  width: 22px !important;
  height: 22px !important;
  stroke: currentColor;
  stroke-width: 2 !important;
}

.wb-service-icon-wrap.wb-icon-style-pastel-circle {
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.04);
}

.wb-service-icon-wrap.wb-icon-style-square-badge {
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.wb-service-icon-wrap.wb-icon-style-colored-circle {
  border-radius: 9999px;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.15);
}
.wb-service-icon-wrap.wb-icon-style-colored-circle .wb-icon svg {
  stroke: #ffffff !important;
}

.wb-service-icon-wrap.wb-icon-style-glow-icon {
  border-radius: 12px;
  background: color-mix(in srgb, var(--wb-primary) 12%, transparent);
  color: var(--wb-primary);
  border: 1px solid color-mix(in srgb, var(--wb-primary) 24%, transparent);
  box-shadow: 0 0 20px -2px color-mix(in srgb, var(--wb-primary) 28%, transparent);
}

.wb-service-icon-wrap.wb-icon-style-minimal-accent {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  width: auto;
  height: auto;
}
.wb-service-icon-wrap.wb-icon-style-minimal-accent .wb-icon svg {
  width: 26px !important;
  height: 26px !important;
}

/* Service Badges - Elegant Pill Style */
.wb-service-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 11px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1.2;
  border: 1px solid transparent;
}

.wb-color-primary .wb-service-badge, .wb-color-primary.wb-service-badge { background: color-mix(in srgb, var(--wb-primary) 8%, transparent); color: var(--wb-primary); border-color: color-mix(in srgb, var(--wb-primary) 20%, transparent); }
.wb-color-secondary .wb-service-badge, .wb-color-secondary.wb-service-badge { background: color-mix(in srgb, var(--wb-secondary) 12%, transparent); color: var(--wb-secondary-ink); border-color: color-mix(in srgb, var(--wb-secondary-ink) 22%, transparent); }
.wb-color-orange .wb-service-badge, .wb-color-orange.wb-service-badge { background: #fff7ed; color: #ea580c; border-color: #ffedd5; }
.wb-color-green .wb-service-badge, .wb-color-green.wb-service-badge { background: #f0fdf4; color: #16a34a; border-color: #dcfce7; }
.wb-color-blue .wb-service-badge, .wb-color-blue.wb-service-badge { background: #eff6ff; color: #2563eb; border-color: #dbeafe; }
.wb-color-yellow .wb-service-badge, .wb-color-yellow.wb-service-badge { background: #fefce8; color: #ca8a04; border-color: #fef9c3; }
.wb-color-cyan .wb-service-badge, .wb-color-cyan.wb-service-badge { background: #ecfeff; color: #0891b2; border-color: #cffafe; }
.wb-color-purple .wb-service-badge, .wb-color-purple.wb-service-badge { background: #faf5ff; color: #9333ea; border-color: #f3e8ff; }
.wb-color-pink .wb-service-badge, .wb-color-pink.wb-service-badge { background: #fdf2f8; color: #db2777; border-color: #fce7f3; }
.wb-color-indigo .wb-service-badge, .wb-color-indigo.wb-service-badge { background: #eef2ff; color: #4f46e5; border-color: #e0e7ff; }
.wb-color-red .wb-service-badge, .wb-color-red.wb-service-badge { background: #fef2f2; color: #dc2626; border-color: #fee2e2; }
.wb-color-gray .wb-service-badge, .wb-color-gray.wb-service-badge { background: #f8fafc; color: #475569; border-color: #e2e8f0; }

.wb-service-price-pill {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--wb-muted);
  background: color-mix(in srgb, var(--wb-text) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-border) 80%, transparent);
  padding: 4px 11px;
  border-radius: 9999px;
  line-height: 1.2;
}

/* Service Titles & Texts */
.wb-service-body {
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.wb-service-title-group {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.wb-service-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--wb-text);
  margin: 0;
  letter-spacing: -0.01em;
}

.wb-service-duration {
  font-size: 12.5px;
  color: var(--wb-muted);
  white-space: nowrap;
  font-weight: 500;
}

.wb-service-desc {
  font-size: 15px;
  line-height: 1.62;
  color: var(--wb-muted);
  margin: 0 0 20px 0;
}

/* Feature Checklist - Clean & Balanced */
.wb-service-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 22px 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.wb-service-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--wb-text);
}

.wb-service-check-icon {
  width: 17px;
  height: 17px;
  color: #16a34a;
  flex-shrink: 0;
  margin-top: 1px;
}

/* Service Actions */
.wb-service-actions {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid color-mix(in srgb, var(--wb-border) 60%, transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.wb-service-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--wb-primary);
  text-decoration: none;
  transition: gap 0.2s ease, opacity 0.2s ease;
}

.wb-service-arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.wb-service-link:hover .wb-service-arrow-icon {
  transform: translateX(4px);
}

.wb-service-secondary-link {
  font-size: 13.5px;
  color: var(--wb-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.15s ease;
}
.wb-service-secondary-link:hover {
  color: var(--wb-text);
}

/* Alignment modifiers */
.wb-service-card.wb-align-center .wb-service-top-bar {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.wb-service-card.wb-align-center .wb-service-top-right {
  justify-content: center;
}
.wb-service-card.wb-align-center .wb-service-title-group {
  align-items: center;
  justify-content: center;
  text-align: center;
}
.wb-service-card.wb-align-center .wb-service-desc {
  text-align: center;
}
.wb-service-card.wb-align-center .wb-service-actions {
  justify-content: center;
}
.wb-service-card.wb-align-center .wb-service-features-list {
  align-items: center;
}

/* Bento Grid */
.wb-services-bento-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
  align-items: stretch;
}
.wb-bento-cell-hero { display: flex; }
.wb-bento-cell-hero .wb-service-card { width: 100%; min-height: 100%; }
.wb-bento-cell-satellites { display: grid; grid-template-columns: 1fr; gap: 20px; }

@container wb-site (max-width: 860px) {
  .wb-services-bento-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 860px) {
  .wb-services-bento-grid { grid-template-columns: minmax(0, 1fr); }
}

/* Split Showcase */
.wb-services-split-container {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 48px;
  align-items: start;
}
.wb-services-split-reversed .wb-services-split-container { grid-template-columns: 1.2fr 1fr; }
.wb-services-split-hero {
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.wb-services-split-title {
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 800;
  line-height: 1.18;
  color: var(--wb-text);
  margin: 0;
}
.wb-services-split-intro { font-size: 17px; line-height: 1.6; color: var(--wb-muted); margin: 0; }
.wb-services-split-tagline { font-size: 14px; font-weight: 600; color: var(--wb-primary); margin: 0; }
.wb-services-split-media {
  margin-top: 12px;
  border-radius: var(--wb-radius);
  overflow: hidden;
  box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--wb-border);
}
.wb-services-split-image { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; display: block; }
.wb-services-split-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
.wb-services-split-list { display: flex; flex-direction: column; gap: 20px; }

@container wb-site (max-width: 900px) {
  .wb-services-split-container,
  .wb-services-split-reversed .wb-services-split-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .wb-services-split-hero { position: static; }
}
@media (max-width: 900px) {
  .wb-services-split-container,
  .wb-services-split-reversed .wb-services-split-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .wb-services-split-hero { position: static; }
}

/* Interactive List */
.wb-services-interactive-wrapper {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 36px;
  align-items: start;
}
.wb-services-interactive-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--wb-border);
}
.wb-services-interactive-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 14px;
  border-bottom: 1px solid var(--wb-border);
  cursor: pointer;
  transition: background 0.18s ease, padding 0.18s ease;
  border-radius: 8px;
}
.wb-services-interactive-row:hover,
.wb-services-interactive-row.wb-row-active {
  background: var(--wb-surface);
  padding-left: 20px;
}
.wb-interactive-left { display: flex; align-items: center; gap: 16px; }
.wb-interactive-number { font-size: 14px; font-weight: 800; color: var(--wb-muted); opacity: 0.7; }
.wb-row-active .wb-interactive-number { color: var(--wb-primary); opacity: 1; }
.wb-interactive-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--wb-text); }
.wb-interactive-title { font-size: 19px; font-weight: 700; color: var(--wb-text); margin: 0; }
.wb-interactive-right { display: flex; align-items: center; gap: 14px; }
.wb-interactive-price { font-size: 14px; font-weight: 600; color: var(--wb-muted); }
.wb-interactive-arrow-btn {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-text) 8%, transparent);
  color: var(--wb-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}
.wb-services-interactive-row:hover .wb-interactive-arrow-btn,
.wb-row-active .wb-interactive-arrow-btn {
  background: var(--wb-primary);
  color: #ffffff;
  transform: translateX(4px);
}
.wb-services-interactive-preview {
  position: sticky;
  top: 100px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  border-radius: var(--wb-radius);
  overflow: hidden;
  box-shadow: 0 16px 36px -12px rgba(0, 0, 0, 0.1);
  transition: opacity 0.25s ease;
}
.wb-interactive-preview-media { width: 100%; aspect-ratio: 16 / 10; overflow: hidden; }
.wb-interactive-preview-img { width: 100%; height: 100%; object-fit: cover; }
.wb-interactive-preview-body { padding: 24px; display: flex; flex-direction: column; gap: 10px; }
.wb-interactive-preview-meta { display: flex; align-items: center; gap: 10px; }
.wb-interactive-preview-title { font-size: 20px; font-weight: 700; color: var(--wb-text); margin: 0; }
.wb-interactive-preview-desc { font-size: 14.5px; line-height: 1.55; color: var(--wb-muted); margin: 0; }

@container wb-site (max-width: 860px) {
  .wb-services-interactive-wrapper { grid-template-columns: 1fr; }
  .wb-services-interactive-preview { display: none; }
}
@media (max-width: 860px) {
  .wb-services-interactive-wrapper { grid-template-columns: 1fr; }
  .wb-services-interactive-preview { display: none; }
}

/* Horizontal Cards */
.wb-services-horizontal-stack { display: flex; flex-direction: column; gap: 24px; }
.wb-service-card-horizontal { display: grid; grid-template-columns: 320px 1fr; align-items: stretch; }
@container wb-site (max-width: 768px) {
  .wb-service-card-horizontal { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .wb-service-card-horizontal { grid-template-columns: 1fr; }
}

/* Minimal Numbered */
.wb-services-numbered-grid { display: grid; gap: 32px; }
.wb-service-numbered-card {
  display: flex;
  flex-direction: column;
  border-top: 2px solid var(--wb-border);
  padding-top: 20px;
  transition: border-color 0.2s ease;
}
.wb-service-numbered-card:hover { border-color: var(--wb-primary); }
.wb-numbered-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.wb-numbered-index {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: color-mix(in srgb, var(--wb-text) 30%, transparent);
}
.wb-service-numbered-card:hover .wb-numbered-index { color: var(--wb-primary); }

/* Bottom CTA Row */
.wb-services-bottom-cta {
  margin-top: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}
.wb-services-bottom-cta.wb-align-center { justify-content: center; }
.wb-services-bottom-cta.wb-align-left { justify-content: flex-start; }
.wb-services-bottom-cta.wb-align-right { justify-content: flex-end; }

/* --------------------------------------- Services: Editorial Specs ("The specs — what we make") */
.wb-section.wb-services-editorial-specs { padding: 40px 0 0; background: transparent; }
.wb-services-editorial-specs .wb-vr-eyebrow { padding-bottom: 22px; border-bottom: 1px solid rgba(29, 25, 16, 0.32); }
.wb-site .wb-specs-heading-title {
  margin: 18px 0 0;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(29, 25, 16, 0.32);
  font-family: var(--vr-serif);
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--vr-text);
  line-height: 1.1;
}
.wb-specs-list { display: flex; flex-direction: column; }
.wb-specs-row {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  height: 84px;
  border-bottom: 1px solid rgba(29, 25, 16, 0.08);
}
.wb-specs-num { font-family: var(--vr-mono); font-size: 8.5px; letter-spacing: 0.1em; color: #6B645A; }
.wb-site .wb-specs-title {
  position: relative;
  margin: 0;
  font-family: var(--vr-serif);
  font-size: 43.5px;
  line-height: 1;
  font-weight: 300;
  letter-spacing: -0.01em;
  color: var(--vr-text);
  transition: transform 0.2s ease;
}
.wb-specs-row:hover .wb-specs-title { transform: translateX(4px); }
.wb-specs-desc { margin: 0; font-family: var(--wb-font-body); font-size: 12px; color: #4B453C; text-align: right; }
@container wb-site (max-width: 768px) {
  .wb-specs-row { grid-template-columns: 36px 1fr; height: auto; padding: 18px 0; }
  .wb-site .wb-specs-title { font-size: 30px; }
  .wb-specs-desc { grid-column: 2; text-align: left; }
}
@media (max-width: 768px) {
  .wb-specs-row { grid-template-columns: 36px 1fr; height: auto; padding: 18px 0; }
  .wb-site .wb-specs-title { font-size: 30px; }
  .wb-specs-desc { grid-column: 2; text-align: left; }
}

/* ---------------- Editorial Specs Grid Mode ("WHAT WE SHOOT") ---------------- */
.wb-section.wb-services-editorial-specs.wb-specs-grid-mode {
  padding: 60px 0 60px;
  background: #0A0A0A;
}
.wb-site .wb-specs-shoot-heading {
  margin: 0 0 52px;
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", "Impact", sans-serif);
  font-size: clamp(44px, 6vw, 72px);
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #FFFFFF;
  text-transform: uppercase;
  line-height: 1;
}
.wb-specs-columns-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 56px;
  row-gap: 52px;
}
.wb-specs-grid-cell {
  display: flex;
  flex-direction: column;
}
.wb-specs-grid-num {
  font-family: var(--vr-mono, monospace);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #E6392F;
  margin-bottom: 8px;
}
.wb-site .wb-specs-grid-title {
  margin: 0 0 10px;
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", "Impact", sans-serif);
  font-size: clamp(22px, 2.5vw, 28px);
  font-weight: 900;
  color: #FFFFFF;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.15;
}
.wb-specs-grid-desc {
  margin: 0;
  font-family: var(--vr-mono, monospace);
  font-size: 13.5px;
  line-height: 1.6;
  color: #C5BFB5;
}
@container wb-site (max-width: 860px) {
  .wb-specs-columns-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 32px; row-gap: 36px; }
}
@container wb-site (max-width: 580px) {
  .wb-specs-columns-grid { grid-template-columns: 1fr; row-gap: 32px; }
}
@media (max-width: 860px) {
  .wb-specs-columns-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 32px; row-gap: 36px; }
}
@media (max-width: 580px) {
  .wb-specs-columns-grid { grid-template-columns: 1fr; row-gap: 32px; }
}

/* ==========================================================================
   Testimonials Section (Modern Multi-Variant Architectural System)
   ========================================================================== */

/* Shared Elements: Rating Stars, Badges & Avatars */
.wb-testimonials-rating-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-text) 5%, var(--wb-surface));
  border: 1px solid var(--wb-border);
  margin-bottom: 24px;
}
.wb-testimonials-rating-stars {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.wb-testimonial-stars {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #f59e0b;
}
.wb-testimonial-star {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.wb-star-filled {
  color: #f59e0b;
}
.wb-star-empty {
  color: color-mix(in srgb, var(--wb-text) 18%, transparent);
}
.wb-testimonials-rating-score {
  font-weight: 700;
  font-size: 14px;
  color: var(--wb-text);
}
.wb-testimonials-rating-divider {
  width: 1px;
  height: 12px;
  background: var(--wb-border);
}
.wb-testimonials-rating-count {
  font-size: 13px;
  color: var(--wb-muted);
  font-weight: 500;
}

/* Verified Badge */
.wb-testimonial-verified {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #10b981;
  background: color-mix(in srgb, #10b981 12%, transparent);
  border: 1px solid color-mix(in srgb, #10b981 22%, transparent);
  padding: 2px 8px;
  border-radius: 9999px;
  letter-spacing: 0.02em;
}
.wb-verified-check {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

/* Highlight Outcome Tag */
.wb-testimonial-highlight {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--wb-primary);
  background: color-mix(in srgb, var(--wb-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-primary) 20%, transparent);
  padding: 3px 10px;
  border-radius: 6px;
}

/* Avatar Components */
.wb-testimonial-avatar {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid color-mix(in srgb, var(--wb-text) 8%, transparent);
  background: color-mix(in srgb, var(--wb-text) 6%, var(--wb-surface));
  display: flex;
  align-items: center;
  justify-content: center;
}
.wb-testimonial-avatar-lg {
  width: 60px;
  height: 60px;
}
.wb-testimonial-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.wb-testimonial-avatar-initials {
  font-size: 15px;
  font-weight: 700;
  color: var(--wb-primary);
  background: color-mix(in srgb, var(--wb-primary) 12%, var(--wb-surface));
  letter-spacing: -0.02em;
}

/* Author Details */
.wb-testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
}
.wb-testimonial-author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.wb-testimonial-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.wb-testimonial-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--wb-text);
  line-height: 1.3;
}
.wb-testimonial-role {
  font-size: 13px;
  color: var(--wb-muted);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Card Shell Styles & Hover Effects */
.wb-testimonial-card {
  border-radius: var(--wb-radius);
  padding: 28px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease;
}
.wb-testimonial-card:hover {
  transform: translateY(-4px);
}
.wb-testimonial-card-default {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}
.wb-testimonial-card-bordered {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
}
.wb-testimonial-card-flat {
  background: transparent;
  border: 1px solid transparent;
}
.wb-testimonial-card-glass {
  background: color-mix(in srgb, var(--wb-surface) 60%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--wb-border);
}
.wb-testimonial-card-elevated {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.08);
}
.wb-testimonial-card-elevated:hover {
  box-shadow: 0 20px 40px -6px rgba(0, 0, 0, 0.12);
}

.wb-testimonial-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.wb-testimonial-quote {
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--wb-text);
  margin: 0;
  flex-grow: 1;
}

/* --------------------------------------------------------------------------
   Variant 1: Cards Grid (Balanced Multi-Column Review Matrix)
   -------------------------------------------------------------------------- */
.wb-testimonials-grid {
  display: grid;
  gap: 24px;
  margin-top: 40px;
}
.wb-testimonials-grid-1 { grid-template-columns: minmax(0, 1fr); max-width: 680px; margin-left: auto; margin-right: auto; }
.wb-testimonials-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.wb-testimonials-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.wb-testimonials-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

@container wb-site (max-width: 1024px) {
  .wb-testimonials-grid-3, .wb-testimonials-grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 1024px) {
  .wb-testimonials-grid-3, .wb-testimonials-grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@container wb-site (max-width: 640px) {
  .wb-testimonials-grid-2, .wb-testimonials-grid-3, .wb-testimonials-grid-4 {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 640px) {
  .wb-testimonials-grid-2, .wb-testimonials-grid-3, .wb-testimonials-grid-4 {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* --------------------------------------------------------------------------
   Variant 2: Carousel Slider (Interactive Smooth Pull-Quote Stage)
   -------------------------------------------------------------------------- */
.wb-testimonials-slider-stage {
  max-width: 880px;
  margin: 40px auto 0 auto;
  position: relative;
}
.wb-testimonials-slider-track {
  position: relative;
  overflow: hidden;
  border-radius: calc(var(--wb-radius) * 1.2);
}
.wb-testimonials-slide-card {
  padding: 48px;
  position: relative;
  overflow: hidden;
}
.wb-testimonials-slide-quote-icon {
  position: absolute;
  top: 24px;
  right: 28px;
  width: 72px;
  height: 72px;
  color: color-mix(in srgb, var(--wb-text) 5%, transparent);
  pointer-events: none;
}
.wb-testimonials-slide-text {
  font-family: var(--wb-font-heading);
  font-size: clamp(20px, 2.5vw, 28px);
  line-height: 1.45;
  font-weight: 500;
  color: var(--wb-text);
  margin: 18px 0 28px 0;
  letter-spacing: -0.015em;
}
.wb-testimonials-slider-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  gap: 16px;
}
.wb-testimonials-dots {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wb-testimonials-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-text) 20%, transparent);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}
.wb-testimonials-dot.active {
  width: 24px;
  background: var(--wb-primary);
}
.wb-testimonials-arrows {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wb-testimonials-arrow-btn {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: 1px solid var(--wb-border);
  background: var(--wb-surface);
  color: var(--wb-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
}
.wb-testimonials-arrow-btn:hover {
  background: var(--wb-bg);
  border-color: var(--wb-primary);
  color: var(--wb-primary);
  transform: scale(1.05);
}
@container wb-site (max-width: 640px) {
  .wb-testimonials-slide-card {
    padding: 32px 24px;
  }
}
@media (max-width: 640px) {
  .wb-testimonials-slide-card {
    padding: 32px 24px;
  }
}

/* --------------------------------------------------------------------------
   Variant 3: Marquee Wall (Infinite Hardware-Accelerated 60fps Ticker)
   -------------------------------------------------------------------------- */
.wb-testimonials-marquee-wrap {
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 30px 0;
  margin-top: 30px;
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
}
.wb-testimonials-marquee-track {
  display: flex;
  gap: 20px;
  width: max-content;
  animation: wb-testi-scroll 45s linear infinite;
  will-change: transform;
}
.wb-testimonials-marquee-track:hover {
  animation-play-state: paused;
}
.wb-testimonials-marquee-item {
  width: 360px;
  flex-shrink: 0;
}
@keyframes wb-testi-scroll {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}

/* --------------------------------------------------------------------------
   Variant 4: Spotlight Featured (Executive Hero Split & Proof Matrix)
   -------------------------------------------------------------------------- */
.wb-testimonials-spotlight-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 32px;
  margin-top: 40px;
  align-items: stretch;
}
.wb-testimonials-hero-card {
  padding: 40px;
  border-radius: var(--wb-radius);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}
.wb-testimonials-hero-quote {
  font-family: var(--wb-font-heading);
  font-size: clamp(22px, 2.2vw, 30px);
  line-height: 1.38;
  font-weight: 600;
  color: var(--wb-text);
  letter-spacing: -0.02em;
  margin: 20px 0 28px 0;
}
.wb-testimonials-side-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: space-between;
}
.wb-testimonials-side-card {
  padding: 24px;
}
@container wb-site (max-width: 900px) {
  .wb-testimonials-spotlight-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 900px) {
  .wb-testimonials-spotlight-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* --------------------------------------------------------------------------
   Variant 5: Minimal Editorial (Swiss Architectural Hairline Minimalism)
   -------------------------------------------------------------------------- */
.wb-testimonials-editorial-frame {
  max-width: 1080px;
  margin: 40px auto 0 auto;
  border-top: 1px solid var(--wb-border);
}
.wb-testimonials-editorial-item {
  padding: 36px 0;
  border-bottom: 1px solid var(--wb-border);
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  align-items: baseline;
  transition: background-color 0.18s ease;
}
.wb-testimonials-editorial-author {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wb-testimonials-editorial-quote {
  font-family: var(--wb-font-heading);
  font-size: clamp(19px, 2vw, 24px);
  line-height: 1.5;
  color: var(--wb-text);
  font-style: italic;
  margin: 0;
}
@container wb-site (max-width: 768px) {
  .wb-testimonials-editorial-item {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 28px 0;
  }
}
@media (max-width: 768px) {
  .wb-testimonials-editorial-item {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 28px 0;
  }
}

/* ==========================================================================
   FAQ Section (Clean Modern & Architectural System)
   ========================================================================== */

/* Shared FAQ Element Styles */
.wb-faq-summary {
  list-style: none;
  cursor: pointer;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  user-select: none;
  font-family: var(--wb-font-heading);
  transition: background-color 0.18s ease;
}
.wb-faq-summary::-webkit-details-marker {
  display: none;
}
.wb-faq-summary-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.wb-faq-question-text {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--wb-text);
}
.wb-faq-meta-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wb-faq-category-pill {
  font-family: var(--wb-font-base);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  color: var(--wb-muted);
}
.wb-faq-badge-pill {
  font-family: var(--wb-font-base);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--wb-text);
  color: var(--wb-bg);
}

/* Micro Indicators */
.wb-faq-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--wb-text);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}
details[open] > summary .wb-faq-chevron {
  transform: rotate(180deg);
}
details[open] > summary .wb-faq-plus {
  transform: rotate(45deg);
}

/* Answer Body */
.wb-faq-answer-body {
  padding: 0 24px 22px 24px;
  animation: wb-fade-in 0.2s ease-out;
}
.wb-faq-answer-body p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--wb-muted);
}

/* Card Surface Styles */
.wb-faq-card-style-default {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}
.wb-faq-card-style-bordered {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
}
.wb-faq-card-style-flat {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--wb-border);
  border-radius: 0 !important;
}
.wb-faq-card-style-glass {
  background: color-mix(in srgb, var(--wb-surface) 60%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid color-mix(in srgb, var(--wb-border) 80%, transparent);
}
.wb-faq-card-style-elevated {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.06);
}

/* Support Card Component */
.wb-faq-support-card {
  max-width: 820px;
  margin: 48px auto 0 auto;
  padding: 24px 28px;
  border-radius: var(--wb-radius);
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.wb-faq-support-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--wb-text);
}
.wb-faq-support-desc {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--wb-muted);
}
.wb-faq-support-action {
  flex-shrink: 0;
}
@container wb-site (max-width: 640px) {
  .wb-faq-support-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
@media (max-width: 640px) {
  .wb-faq-support-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

/* ==========================================================================
   Variant 1: Classic Modern Accordion
   ========================================================================== */
.wb-faq-classic-container {
  max-width: 820px;
  margin: 0 auto;
}
.wb-faq-accordion-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.wb-faq-accordion-item {
  border-radius: var(--wb-radius);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.wb-faq-accordion-item:hover {
  border-color: color-mix(in srgb, var(--wb-text) 30%, var(--wb-border));
}
.wb-faq-accordion-item[open] {
  border-color: color-mix(in srgb, var(--wb-text) 45%, var(--wb-border));
}

/* ==========================================================================
   Variant 2: Two-Column Grid
   ========================================================================== */
.wb-faq-two-cols-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: start;
}
.wb-faq-card-item {
  border-radius: var(--wb-radius);
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.wb-faq-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.08);
}
@container wb-site (max-width: 800px) {
  .wb-faq-two-cols-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 800px) {
  .wb-faq-two-cols-grid {
    grid-template-columns: 1fr;
  }
}

/* ==========================================================================
   Variant 3: Split Sidebar (Sticky Hero + Accordion)
   ========================================================================== */
.wb-faq-split-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 56px;
  align-items: start;
}
.wb-faq-split-sidebar {
  position: relative;
}
.wb-faq-sidebar-sticky {
  position: sticky;
  top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.wb-faq-split-heading {
  font-family: var(--wb-font-heading);
  font-size: 36px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--wb-text);
  margin: 0;
}
.wb-faq-split-intro {
  font-size: 16px;
  line-height: 1.55;
  color: var(--wb-muted);
  margin: 4px 0 0 0;
}
.wb-faq-split-support-box {
  margin-top: 24px;
  padding: 24px;
  border-radius: var(--wb-radius);
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.wb-faq-split-content {
  min-width: 0;
}
@container wb-site (max-width: 900px) {
  .wb-faq-split-layout {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .wb-faq-sidebar-sticky {
    position: static;
  }
}
@media (max-width: 900px) {
  .wb-faq-split-layout {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .wb-faq-sidebar-sticky {
    position: static;
  }
}

/* ==========================================================================
   Variant 4: Minimal Numbered (Swiss Architectural)
   ========================================================================== */
.wb-faq-minimal-container {
  max-width: 880px;
  margin: 0 auto;
  border-top: 1px solid var(--wb-border);
}
.wb-faq-minimal-item {
  border-bottom: 1px solid var(--wb-border);
  transition: background-color 0.18s ease;
}
.wb-faq-minimal-item:hover {
  background: color-mix(in srgb, var(--wb-surface) 35%, transparent);
}
.wb-faq-minimal-summary {
  list-style: none;
  cursor: pointer;
  padding: 24px 8px;
  display: flex;
  align-items: flex-start;
  gap: 24px;
  user-select: none;
}
.wb-faq-minimal-summary::-webkit-details-marker {
  display: none;
}
.wb-faq-minimal-num {
  font-family: var(--wb-font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--wb-muted);
  letter-spacing: 0.04em;
  margin-top: 1px;
}
.wb-faq-minimal-q-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wb-faq-minimal-question {
  font-family: var(--wb-font-heading);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--wb-text);
}
.wb-faq-minimal-answer {
  padding: 0 8px 24px 44px;
  animation: wb-fade-in 0.2s ease-out;
}
.wb-faq-minimal-answer p {
  margin: 0;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--wb-muted);
}

/* ==========================================================================
   Variant 5: Categorized Boxed Cards
   ========================================================================== */
.wb-faq-categorized-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch;
}
.wb-faq-boxed-card {
  display: flex;
  flex-direction: column;
  padding: 28px 24px;
  border-radius: var(--wb-radius);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.wb-faq-boxed-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.08);
}
.wb-faq-boxed-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}
.wb-faq-boxed-question {
  font-family: var(--wb-font-heading);
  font-size: 17.5px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--wb-text);
  margin: 0;
}
.wb-faq-boxed-answer {
  flex: 1;
}
.wb-faq-boxed-answer p {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--wb-muted);
}
@container wb-site (max-width: 960px) {
  .wb-faq-categorized-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 960px) {
  .wb-faq-categorized-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@container wb-site (max-width: 600px) {
  .wb-faq-categorized-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .wb-faq-categorized-grid {
    grid-template-columns: 1fr;
  }
}

/* ==========================================================================
   CTA Section (Modern Executive & Animated Action System)
   ========================================================================== */

@keyframes wb-pulse-dot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 color-mix(in srgb, var(--wb-text) 50%, transparent); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px color-mix(in srgb, var(--wb-text) 0%, transparent); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 color-mix(in srgb, var(--wb-text) 0%, transparent); }
}

/* Eyebrow & Status Dot */
.wb-cta-eyebrow-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.wb-cta-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: var(--wb-primary);
  animation: wb-pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.wb-cta-eyebrow {
  font-family: var(--wb-font-base);
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--wb-muted);
}

/* Action Group */
.wb-cta-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 32px;
  flex-wrap: wrap;
}
.wb-cta-actions.wb-align-center {
  justify-content: center;
}
.wb-cta-actions.wb-align-left {
  justify-content: flex-start;
}
.wb-cta-actions.wb-align-right {
  justify-content: flex-end;
}

/* Trust Badges */
.wb-cta-trust-list {
  list-style: none;
  padding: 0;
  margin: 24px 0 0 0;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.wb-cta-trust-list.wb-align-center {
  justify-content: center;
}
.wb-cta-trust-list.wb-align-left {
  justify-content: flex-start;
}
.wb-cta-trust-list.wb-align-right {
  justify-content: flex-end;
}
.wb-cta-trust-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--wb-muted);
}
.wb-cta-check-icon {
  width: 15px;
  height: 15px;
  color: var(--wb-text);
  flex-shrink: 0;
}

/* Surface Styles */
.wb-cta-card-style-default {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}
.wb-cta-card-style-bordered {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
}
.wb-cta-card-style-flat {
  background: transparent;
  border: none;
}
.wb-cta-card-style-glass {
  background: color-mix(in srgb, var(--wb-surface) 60%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid color-mix(in srgb, var(--wb-border) 80%, transparent);
}
.wb-cta-card-style-elevated {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.09);
}
.wb-cta-card-style-contrast {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}

/* ==========================================================================
   Variant 1: Centered Card Banner
   ========================================================================== */
.wb-cta-variant-centered {
  text-align: center;
}
.wb-cta-variant-centered.wb-align-left,
.wb-cta-variant-centered.wb-align-left .wb-cta-centered-container,
.wb-cta-centered-container.wb-align-left,
.wb-align-left .wb-cta-centered-container {
  text-align: left;
}
.wb-cta-variant-centered.wb-align-left .wb-cta-centered-heading,
.wb-cta-centered-container.wb-align-left .wb-cta-centered-heading,
.wb-align-left .wb-cta-centered-heading {
  text-align: left;
}
.wb-cta-variant-centered.wb-align-left .wb-cta-centered-text,
.wb-cta-centered-container.wb-align-left .wb-cta-centered-text,
.wb-align-left .wb-cta-centered-text {
  text-align: left;
  margin-left: 0;
  margin-right: auto;
}
.wb-cta-variant-centered.wb-align-left .wb-cta-eyebrow-wrap,
.wb-cta-centered-container.wb-align-left .wb-cta-eyebrow-wrap,
.wb-align-left .wb-cta-eyebrow-wrap {
  justify-content: flex-start;
}
.wb-cta-variant-centered.wb-align-left .wb-cta-actions,
.wb-cta-centered-container.wb-align-left .wb-cta-actions,
.wb-align-left .wb-cta-actions {
  justify-content: flex-start;
}
.wb-cta-variant-centered.wb-align-left .wb-cta-trust-list,
.wb-cta-centered-container.wb-align-left .wb-cta-trust-list,
.wb-align-left .wb-cta-trust-list {
  justify-content: flex-start;
}

.wb-cta-variant-centered.wb-align-center,
.wb-cta-variant-centered.wb-align-center .wb-cta-centered-container,
.wb-cta-centered-container.wb-align-center,
.wb-align-center .wb-cta-centered-container {
  text-align: center;
}
.wb-cta-variant-centered.wb-align-center .wb-cta-centered-heading,
.wb-cta-centered-container.wb-align-center .wb-cta-centered-heading,
.wb-align-center .wb-cta-centered-heading {
  text-align: center;
}
.wb-cta-variant-centered.wb-align-center .wb-cta-centered-text,
.wb-cta-centered-container.wb-align-center .wb-cta-centered-text,
.wb-align-center .wb-cta-centered-text {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.wb-cta-variant-centered.wb-align-center .wb-cta-eyebrow-wrap,
.wb-cta-centered-container.wb-align-center .wb-cta-eyebrow-wrap,
.wb-align-center .wb-cta-eyebrow-wrap {
  justify-content: center;
}
.wb-cta-variant-centered.wb-align-center .wb-cta-actions,
.wb-cta-centered-container.wb-align-center .wb-cta-actions,
.wb-align-center .wb-cta-actions {
  justify-content: center;
}
.wb-cta-variant-centered.wb-align-center .wb-cta-trust-list,
.wb-cta-centered-container.wb-align-center .wb-cta-trust-list,
.wb-align-center .wb-cta-trust-list {
  justify-content: center;
}

.wb-cta-variant-centered.wb-align-right,
.wb-cta-variant-centered.wb-align-right .wb-cta-centered-container,
.wb-cta-centered-container.wb-align-right,
.wb-align-right .wb-cta-centered-container {
  text-align: right;
}
.wb-cta-variant-centered.wb-align-right .wb-cta-centered-heading,
.wb-cta-centered-container.wb-align-right .wb-cta-centered-heading,
.wb-align-right .wb-cta-centered-heading {
  text-align: right;
}
.wb-cta-variant-centered.wb-align-right .wb-cta-centered-text,
.wb-cta-centered-container.wb-align-right .wb-cta-centered-text,
.wb-align-right .wb-cta-centered-text {
  text-align: right;
  margin-left: auto;
  margin-right: 0;
}
.wb-cta-variant-centered.wb-align-right .wb-cta-eyebrow-wrap,
.wb-cta-centered-container.wb-align-right .wb-cta-eyebrow-wrap,
.wb-align-right .wb-cta-eyebrow-wrap {
  justify-content: flex-end;
}
.wb-cta-variant-centered.wb-align-right .wb-cta-actions,
.wb-cta-centered-container.wb-align-right .wb-cta-actions,
.wb-align-right .wb-cta-actions {
  justify-content: flex-end;
}
.wb-cta-variant-centered.wb-align-right .wb-cta-trust-list,
.wb-cta-centered-container.wb-align-right .wb-cta-trust-list,
.wb-align-right .wb-cta-trust-list {
  justify-content: flex-end;
}

.wb-cta-centered-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 56px 40px;
  border-radius: var(--wb-radius);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.wb-cta-centered-heading {
  font-family: var(--wb-font-heading);
  font-size: clamp(30px, 4.5vw, 44px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--wb-text);
  margin: 0;
}
.wb-cta-centered-text {
  font-size: 17px;
  line-height: 1.6;
  color: var(--wb-muted);
  max-width: 620px;
  margin: 16px auto 0 auto;
}

/* ==========================================================================
   Variant 2: Split Visual (Proof Metric Highlight)
   ========================================================================== */
.wb-cta-split-card {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 48px;
  align-items: center;
  padding: 48px 44px;
  border-radius: var(--wb-radius);
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s ease;
}
.wb-cta-split-card:hover {
  box-shadow: 0 20px 44px -12px rgba(0, 0, 0, 0.08);
}
.wb-cta-split-heading {
  font-family: var(--wb-font-heading);
  font-size: clamp(28px, 3.8vw, 40px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--wb-text);
  margin: 0;
}
.wb-cta-split-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--wb-muted);
  margin: 14px 0 0 0;
}
.wb-cta-metric-showcase {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  border-radius: var(--wb-radius);
  padding: 32px 28px;
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.06);
}
.wb-cta-metric-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.wb-cta-metric-highlight {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.wb-cta-metric-value {
  font-family: var(--wb-font-heading);
  font-size: 44px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--wb-text);
}
.wb-cta-metric-label {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--wb-muted);
}
.wb-cta-metric-subtext {
  font-size: 13.5px;
  color: var(--wb-muted);
  line-height: 1.5;
  margin: 0;
}
.wb-cta-metric-footer {
  margin-top: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--wb-border);
}
.wb-cta-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--wb-text);
}
.wb-cta-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--wb-text);
}

@container wb-site (max-width: 860px) {
  .wb-cta-split-card {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 32px 24px;
  }
}
@media (max-width: 860px) {
  .wb-cta-split-card {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 32px 24px;
  }
}

/* ==========================================================================
   Variant 3: Floating Box (Ambient Framed Glow)
   ========================================================================== */
.wb-cta-floating-box {
  max-width: 920px;
  margin: 0 auto;
  padding: 60px 48px;
  border-radius: var(--wb-radius);
  position: relative;
  overflow: hidden;
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s ease, border-color 0.24s ease;
}
.wb-cta-floating-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.1);
}
.wb-cta-floating-heading {
  font-family: var(--wb-font-heading);
  font-size: clamp(32px, 4.5vw, 46px);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: var(--wb-text);
  margin: 0;
}
.wb-cta-floating-text {
  font-size: 17px;
  line-height: 1.6;
  color: var(--wb-muted);
  max-width: 640px;
  margin: 16px 0 0 0;
}
.wb-cta-floating-box.wb-align-left { text-align: left; }
.wb-cta-floating-box.wb-align-left .wb-cta-floating-heading { text-align: left; }
.wb-cta-floating-box.wb-align-left .wb-cta-floating-text { text-align: left; margin-left: 0; margin-right: auto; }
.wb-cta-floating-box.wb-align-left .wb-cta-eyebrow-wrap { justify-content: flex-start; }

.wb-cta-floating-box.wb-align-center { text-align: center; }
.wb-cta-floating-box.wb-align-center .wb-cta-floating-heading { text-align: center; }
.wb-cta-floating-box.wb-align-center .wb-cta-floating-text { text-align: center; margin-left: auto; margin-right: auto; }
.wb-cta-floating-box.wb-align-center .wb-cta-eyebrow-wrap { justify-content: center; }

.wb-cta-floating-box.wb-align-right { text-align: right; }
.wb-cta-floating-box.wb-align-right .wb-cta-floating-heading { text-align: right; }
.wb-cta-floating-box.wb-align-right .wb-cta-floating-text { text-align: right; margin-left: auto; margin-right: 0; }
.wb-cta-floating-box.wb-align-right .wb-cta-eyebrow-wrap { justify-content: flex-end; }
@container wb-site (max-width: 640px) {
  .wb-cta-floating-box {
    padding: 36px 24px;
  }
}
@media (max-width: 640px) {
  .wb-cta-floating-box {
    padding: 36px 24px;
  }
}

/* ==========================================================================
   Variant 4: Minimal Editorial (Swiss Architectural Lines)
   ========================================================================== */
.wb-cta-editorial-frame {
  max-width: 1080px;
  margin: 0 auto;
  padding: 48px 0;
  border-top: 1px solid var(--wb-border);
  border-bottom: 1px solid var(--wb-border);
}
.wb-cta-editorial-topline {
  margin-bottom: 16px;
}
.wb-cta-editorial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}
.wb-cta-editorial-heading {
  font-family: var(--wb-font-heading);
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--wb-text);
  margin: 0;
}
.wb-cta-editorial-text {
  font-size: 16.5px;
  line-height: 1.6;
  color: var(--wb-muted);
  margin: 0 0 24px 0;
}
.wb-cta-editorial-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
@container wb-site (max-width: 800px) {
  .wb-cta-editorial-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
@media (max-width: 800px) {
  .wb-cta-editorial-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}

/* ---------------------------------------------- CTA: Vintage Story ("Have a story to tell?") */
.wb-section.wb-cta-vintage-story {
  padding: 76px 0;
  background: var(--wb-section-bg, var(--vr-story));
  color: var(--wb-section-text, var(--vr-paper));
  text-align: center;
}
.wb-site .wb-cta-story-heading {
  margin: 0;
  font-family: var(--vr-serif);
  font-size: 52px;
  line-height: 1.1;
  font-weight: 300;
  letter-spacing: -0.025em;
  color: var(--wb-section-text, var(--vr-paper, #ffffff));
}
.wb-cta-story-heading em { font-style: italic; color: var(--wb-primary, #D0573A); }
.wb-cta-story-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  margin-top: 15px;
  padding: 0 24px;
  border-radius: 9999px;
  background: var(--wb-section-text, var(--vr-paper));
  color: var(--wb-section-bg, var(--vr-text));
  font-family: var(--wb-font-body);
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease, color 0.2s ease;
}
.wb-cta-story-btn:hover {
  background: var(--wb-primary, #FFFFFF);
  color: var(--wb-on-primary, var(--vr-text));
  transform: translateY(-1px);
}

/* ---------------------------------------------- CTA: Vintage Banner */
.wb-section.wb-cta-vintage-banner {
  padding: 60px 0;
  background: var(--wb-section-bg, var(--vr-cream));
  color: var(--wb-section-text, #22160F);
  text-align: center;
}
.wb-site .wb-cta-banner-heading {
  margin: 0;
  font-family: var(--vr-serif);
  font-size: 44px;
  line-height: 1.15;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--wb-section-text, #22160F);
}
.wb-cta-banner-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  margin-top: 18px;
  padding: 0 24px;
  border-radius: 9999px;
  background: var(--wb-section-text, #22160F);
  color: var(--wb-section-bg, var(--vr-cream));
  font-family: var(--wb-font-body);
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease, color 0.2s ease;
}
.wb-cta-banner-btn:hover {
  background: var(--wb-primary, #382419);
  color: var(--wb-on-primary, var(--vr-cream));
  transform: translateY(-1px);
}

/* ---------------- Vintage Banner Roll Camera Mode ("ROLL CAMERA?") ---------------- */
.wb-section.wb-cta-vintage-banner.wb-cta-roll-camera {
  padding: 60px 0 80px;
  background: var(--wb-section-bg, #0A0A0A);
}
.wb-cta-roll-camera .wb-cta-banner-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  border-bottom: 1px solid rgba(255, 255, 255, 0.22);
  background: transparent;
}
.wb-cta-frame-guide {
  position: absolute;
  top: -20px;
  bottom: -20px;
  width: 1px;
  background: rgba(255, 255, 255, 0.35);
  pointer-events: none;
}
.wb-cta-frame-guide.left { left: 0; }
.wb-cta-frame-guide.right { right: 0; }
.wb-site .wb-cta-roll-camera .wb-cta-banner-heading {
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", "Impact", sans-serif);
  font-size: clamp(48px, 8vw, 84px);
  font-weight: 900;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0;
  line-height: 1;
  text-align: left;
}
.wb-cta-roll-camera .wb-cta-banner-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  margin-top: 0;
  padding: 0 32px;
  border-radius: 2px;
  background: #E6392F;
  color: #FFFFFF;
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", "Impact", sans-serif);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
}
.wb-cta-roll-camera .wb-cta-banner-btn:hover {
  background: #FF4D3D;
  color: #FFFFFF;
  transform: scale(1.02);
}
@container wb-site (max-width: 640px) {
  .wb-cta-roll-camera .wb-cta-banner-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: 36px 24px;
  }
}
@media (max-width: 640px) {
  .wb-cta-roll-camera .wb-cta-banner-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: 36px 24px;
  }
}

/* ==========================================================================
   Contact Section (Modern Executive & Interactive Channel System)
   ========================================================================== */

/* Eyebrow & Live Pulse Dot */
.wb-contact-eyebrow-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.wb-contact-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: var(--wb-primary);
  animation: wb-pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  display: inline-block;
}
.wb-contact-eyebrow {
  font-family: var(--wb-font-base);
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--wb-muted);
}
.wb-contact-response-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--wb-text);
}

/* Micro Icons */
.wb-contact-ch-icon {
  width: 18px;
  height: 18px;
  color: var(--wb-text);
}

/* Surface Styles */
.wb-contact-card-style-default {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}
.wb-contact-card-style-bordered {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
}
.wb-contact-card-style-flat {
  background: transparent;
  border: none;
}
.wb-contact-card-style-glass {
  background: color-mix(in srgb, var(--wb-surface) 65%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid color-mix(in srgb, var(--wb-border) 80%, transparent);
}
.wb-contact-card-style-elevated {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.08);
}
.wb-contact-card-style-contrast {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}

/* Interactive Form Engine */
.wb-contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.wb-contact-form-title {
  font-family: var(--wb-font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--wb-text);
  margin: 0 0 4px 0;
}
.wb-contact-services-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wb-contact-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.wb-contact-chip {
  cursor: pointer;
  position: relative;
  user-select: none;
}
.wb-contact-chip input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.wb-contact-chip span {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 9999px;
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  font-size: 13px;
  font-weight: 500;
  color: var(--wb-muted);
  transition: all 0.18s ease;
}
.wb-contact-chip input:checked + span {
  background: var(--wb-text);
  color: var(--wb-bg);
  border-color: var(--wb-text);
  font-weight: 600;
}
.wb-contact-input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.wb-contact-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wb-contact-field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--wb-text);
}
.wb-contact-input,
.wb-contact-textarea {
  width: 100%;
  padding: 12px 16px;
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  border-radius: var(--wb-radius);
  color: var(--wb-text);
  font-family: inherit;
  font-size: 14.5px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.wb-contact-input:focus,
.wb-contact-textarea:focus {
  outline: none;
  border-color: var(--wb-text);
  box-shadow: 0 0 0 1px var(--wb-text);
}
.wb-contact-textarea {
  resize: vertical;
  min-height: 110px;
}
.wb-contact-form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 4px;
}
.wb-contact-submit-btn {
  min-width: 160px;
  justify-content: center;
}
.wb-contact-privacy-note {
  font-size: 12.5px;
  color: var(--wb-muted);
}
.wb-contact-form-status {
  margin: 4px 0 0;
  font-size: 13.5px;
  font-weight: 600;
}
.wb-contact-form-status.is-success { color: #047857; }
.wb-contact-form-status.is-error { color: #b91c1c; }
@container wb-site (max-width: 640px) {
  .wb-contact-input-row {
    grid-template-columns: 1fr;
  }
  .wb-contact-form-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
@media (max-width: 640px) {
  .wb-contact-input-row {
    grid-template-columns: 1fr;
  }
  .wb-contact-form-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ==========================================================================
   Variant 1: Split Form (Modern Asymmetric Split Screen)
   ========================================================================== */
.wb-contact-split-container {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 56px;
  align-items: start;
}
.wb-contact-split-container.wb-contact-solo {
  grid-template-columns: 1fr;
  max-width: 680px;
  margin: 0 auto;
}
.wb-contact-title {
  font-family: var(--wb-font-heading);
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--wb-text);
  margin: 0;
}
.wb-contact-intro {
  font-size: 16.5px;
  line-height: 1.6;
  color: var(--wb-muted);
  margin: 12px 0 0 0;
}
.wb-contact-cards-stack {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.wb-contact-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: var(--wb-radius);
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.wb-contact-info-card:hover {
  transform: translateX(4px);
  border-color: var(--wb-text);
}
.wb-contact-icon-box {
  width: 38px;
  height: 38px;
  border-radius: var(--wb-radius);
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.wb-contact-info-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.wb-contact-info-label {
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--wb-muted);
}
.wb-contact-info-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--wb-text);
  overflow-wrap: anywhere;
}
.wb-contact-form-wrapper {
  padding: 36px 32px;
  border-radius: var(--wb-radius);
}
@container wb-site (max-width: 900px) {
  .wb-contact-split-container {
    grid-template-columns: minmax(0, 1fr);
    gap: 40px;
  }
}
@media (max-width: 900px) {
  .wb-contact-split-container {
    grid-template-columns: minmax(0, 1fr);
    gap: 40px;
  }
}

/* ==========================================================================
   Variant 2: Cards Hub (Multi-Channel Grid)
   ========================================================================== */
.wb-contact-hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 20px;
  margin-top: 36px;
}
.wb-contact-hub-card {
  display: flex;
  flex-direction: column;
  padding: 26px 24px;
  border-radius: var(--wb-radius);
  text-decoration: none;
  min-width: 0;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease;
}
.wb-contact-hub-card:hover {
  transform: translateY(-4px);
  border-color: var(--wb-text);
  box-shadow: 0 14px 30px -10px rgba(0, 0, 0, 0.08);
}
.wb-contact-hub-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: var(--wb-radius);
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--wb-text);
  flex-shrink: 0;
}
.wb-contact-hub-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--wb-muted);
}
.wb-contact-hub-value {
  font-size: clamp(14.5px, 1.15vw, 17px);
  font-weight: 700;
  color: var(--wb-text);
  margin: 6px 0 0 0;
  line-height: 1.35;
  overflow-wrap: anywhere;
  word-break: break-word;
  max-width: 100%;
}
.wb-contact-hub-subtext {
  font-size: 13px;
  color: var(--wb-muted);
  margin-top: 8px;
  line-height: 1.45;
}
.wb-contact-hub-action {
  font-size: 13px;
  font-weight: 600;
  color: var(--wb-text);
  margin-top: auto;
  padding-top: 16px;
}
.wb-contact-hub-form-wrap {
  max-width: 720px;
  margin: 36px auto 0 auto;
  padding: 30px 28px;
  border-radius: var(--wb-radius);
}

/* ==========================================================================
   Variant 3: Minimal Editorial (Swiss Architectural Lines)
   ========================================================================== */
.wb-contact-editorial-frame {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 0;
  border-top: 1px solid var(--wb-border);
}
.wb-contact-editorial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}
.wb-contact-editorial-heading {
  font-family: var(--wb-font-heading);
  font-size: clamp(34px, 4.2vw, 48px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: var(--wb-text);
  margin: 0;
}
.wb-contact-editorial-text {
  font-size: 16.5px;
  line-height: 1.6;
  color: var(--wb-muted);
  margin: 14px 0 0 0;
}
.wb-contact-editorial-details {
  margin-top: 36px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-top: 24px;
  border-top: 1px dashed var(--wb-border);
}
.wb-contact-editorial-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.wb-contact-editorial-item-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--wb-muted);
}
.wb-contact-link {
  font-size: 16px;
  font-weight: 600;
  color: var(--wb-text);
  text-decoration: none;
}
.wb-contact-link:hover {
  text-decoration: underline;
}
.wb-contact-plain-text {
  font-size: 16px;
  color: var(--wb-text);
}
.wb-contact-editorial-form-box {
  padding: 8px 0;
}
@container wb-site (max-width: 860px) {
  .wb-contact-editorial-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
@media (max-width: 860px) {
  .wb-contact-editorial-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

/* ==========================================================================
   Variant 4: Floating Glass (Ambient Glassmorphic Card)
   ========================================================================== */
.wb-contact-glass-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 48px 44px;
  border-radius: var(--wb-radius);
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s ease;
}
.wb-contact-glass-container:hover {
  box-shadow: 0 24px 56px -12px rgba(0, 0, 0, 0.12);
}
.wb-contact-glass-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 48px;
  align-items: start;
}
.wb-contact-glass-heading {
  font-family: var(--wb-font-heading);
  font-size: clamp(30px, 3.8vw, 42px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--wb-text);
  margin: 0;
}
.wb-contact-glass-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--wb-muted);
  margin: 12px 0 0 0;
}
.wb-contact-glass-channels {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.wb-contact-channel-pill {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--wb-radius);
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--wb-text);
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.wb-contact-channel-pill:hover {
  border-color: var(--wb-text);
  transform: translateX(3px);
}
.wb-contact-response-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--wb-muted);
}
.wb-contact-glass-form-box {
  padding-left: 12px;
  border-left: 1px solid var(--wb-border);
}
@container wb-site (max-width: 860px) {
  .wb-contact-glass-grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .wb-contact-glass-form-box {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--wb-border);
    padding-top: 28px;
  }
}
@media (max-width: 860px) {
  .wb-contact-glass-grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .wb-contact-glass-form-box {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--wb-border);
    padding-top: 28px;
  }
}

/* Text */
.wb-text { max-width: 760px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.wb-text h2 { margin-bottom: 20px; }
.wb-text p + p { margin-top: 16px; }
.wb-text p { font-size: 17px; }

.wb-text.wb-text-narrow { max-width: 620px; }
.wb-text.wb-text-standard { max-width: 760px; }
.wb-text.wb-text-wide { max-width: 980px; }
.wb-text.wb-text-full { max-width: 100%; }

.wb-text.wb-align-left,
.wb-align-left .wb-text,
.wb-section.wb-align-left .wb-text {
  text-align: left;
  margin-left: 0;
  margin-right: auto;
}
.wb-text.wb-align-left h2,
.wb-text.wb-align-left p,
.wb-text.wb-align-left .wb-eyebrow,
.wb-align-left .wb-text h2,
.wb-align-left .wb-text p,
.wb-align-left .wb-text .wb-eyebrow {
  text-align: left;
}

.wb-text.wb-align-center,
.wb-align-center .wb-text,
.wb-section.wb-align-center .wb-text {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.wb-text.wb-align-center h2,
.wb-text.wb-align-center p,
.wb-text.wb-align-center .wb-eyebrow,
.wb-align-center .wb-text h2,
.wb-align-center .wb-text p,
.wb-align-center .wb-text .wb-eyebrow {
  text-align: center;
}

.wb-text.wb-align-right,
.wb-align-right .wb-text,
.wb-section.wb-align-right .wb-text {
  text-align: right;
  margin-left: auto;
  margin-right: 0;
}
.wb-text.wb-align-right h2,
.wb-text.wb-align-right p,
.wb-text.wb-align-right .wb-eyebrow,
.wb-align-right .wb-text h2,
.wb-align-right .wb-text p,
.wb-align-right .wb-text .wb-eyebrow {
  text-align: right;
}

.wb-text-columns-2 .wb-text-body {
  column-count: 2;
  column-gap: 48px;
}
@media (max-width: 768px) {
  .wb-text-columns-2 .wb-text-body {
    column-count: 1;
  }
}

.wb-text-lead .wb-text-body p:first-of-type {
  font-size: 22px;
  line-height: 1.6;
  font-weight: 500;
  color: var(--wb-text);
  margin-bottom: 24px;
}

.wb-quote-author {
  margin-top: 20px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--wb-muted, #78716c);
}

.wb-text .wb-actions {
  margin-top: 28px;
  display: flex;
}
.wb-text.wb-align-left .wb-actions {
  justify-content: flex-start;
}
.wb-text.wb-align-center .wb-actions {
  justify-content: center;
}
.wb-text.wb-align-right .wb-actions {
  justify-content: flex-end;
}

/* ------------------------------------------------- Text: Pull Quote (Vintage Reels) */
.wb-section.wb-text-pull-quote {
  padding: 80px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
}
.wb-section.wb-text-pull-quote .wb-container,
.wb-section.wb-text-pull-quote .wb-container-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.wb-text-pull-quote .wb-text { max-width: 620px; margin: 0 auto; text-align: center; }
.wb-text-pull-quote .wb-text p {
  margin: 0;
  font-family: var(--vr-serif);
  font-size: 39px;
  line-height: 47px;
  font-style: italic;
  font-weight: 300;
  letter-spacing: -0.015em;
  color: #241F17;
}

.wb-text-pull-quote.wb-align-left .wb-text,
.wb-text-pull-quote .wb-text.wb-align-left {
  text-align: left;
  margin-left: 0;
  margin-right: auto;
}
.wb-text-pull-quote.wb-align-left .wb-text p,
.wb-text-pull-quote .wb-text.wb-align-left p {
  text-align: left;
}

.wb-text-pull-quote.wb-align-center .wb-text,
.wb-text-pull-quote .wb-text.wb-align-center {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.wb-text-pull-quote.wb-align-center .wb-text p,
.wb-text-pull-quote .wb-text.wb-align-center p {
  text-align: center;
}

.wb-text-pull-quote.wb-align-right .wb-text,
.wb-text-pull-quote .wb-text.wb-align-right {
  text-align: right;
  margin-left: auto;
  margin-right: 0;
}
.wb-text-pull-quote.wb-align-right .wb-text p,
.wb-text-pull-quote .wb-text.wb-align-right p {
  text-align: right;
}

/* Gallery */
.wb-gallery img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--wb-radius); }
.wb-gallery-head { margin-bottom: 32px; text-align: center; }

/* Footer Builder Styles */
.wb-footer { background: var(--wb-footer-bg, var(--wb-surface)); border-top: 1px solid var(--wb-border); padding: 56px 0 32px; font-size: var(--wb-body-size, calc(14px * var(--wb-font-scale, 1))); position: relative; }
.wb-footer-dark { background: var(--wb-footer-bg, #0c0d12) !important; color: var(--wb-footer-text, #f1f5f9) !important; border-top: 1px solid rgba(255, 255, 255, 0.08) !important; }
.wb-footer-dark .wb-muted, .wb-footer-dark p, .wb-footer-dark .wb-footer-contact-block { color: #94a3b8 !important; }
.wb-footer-dark a { color: #cbd5e1; }
.wb-footer-dark a:hover { color: #ffffff !important; }
.wb-footer-dark .wb-footer-bottom { border-top: 1px solid rgba(255, 255, 255, 0.08) !important; }
.wb-footer-dark .wb-social-circle-btn { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.12); color: #f1f5f9; }
.wb-footer-dark .wb-social-circle-btn:hover { background: var(--wb-primary); color: #ffffff; border-color: var(--wb-primary); }
.wb-footer-dark .wb-newsletter-input { background: rgba(255, 255, 255, 0.07); border-color: rgba(255, 255, 255, 0.15); color: #ffffff; }
.wb-footer-dark .wb-newsletter-input::placeholder { color: #64748b; }
.wb-footer-dark .wb-payment-badge { background: rgba(255, 255, 255, 0.95); border-color: rgba(255, 255, 255, 0.2); }

.wb-footer-light { background: var(--wb-footer-bg, #ffffff) !important; color: var(--wb-footer-text, #0f172a) !important; border-top: 1px solid rgba(0, 0, 0, 0.08) !important; }
.wb-footer-light .wb-muted, .wb-footer-light p { color: #64748b !important; }

/* Grid & Column Layouts */
.wb-footer-grid { display: grid; grid-template-columns: 1.3fr repeat(var(--wb-footer-cols, 3), 1fr); gap: 40px; }
.wb-footer-mega-grid { display: grid; grid-template-columns: 1.2fr repeat(var(--wb-footer-cols, 3), 1fr) 1.2fr; gap: 36px; align-items: start; }
.wb-footer-split-grid { display: grid; grid-template-columns: 1.1fr 1.6fr 1.1fr; gap: 36px; align-items: start; }
.wb-footer-newsletter-grid { display: grid; grid-template-columns: 1.1fr 1.4fr 1.3fr; gap: 40px; align-items: start; }

.wb-footer h3, .wb-footer h4, .wb-footer-col-title {
  font-size: var(--wb-heading-size, calc(13px * var(--wb-heading-scale, var(--wb-font-scale, 1)))); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px;
}
.wb-footer ul { list-style: none; padding: 0; margin: 0; }
.wb-footer li + li { margin-top: 10px; }
.wb-footer .wb-footer-nav-row li + li, .wb-footer .wb-legal-links li + li { margin-top: 0; }
.wb-footer a { text-decoration: none; transition: color 0.15s ease, opacity 0.15s ease; }
.wb-footer a:hover { color: var(--wb-primary); }

.wb-footer-about { display: flex; flex-direction: column; gap: 14px; }
.wb-footer-about .wb-brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; display: inline-flex; align-items: center; gap: 8px; }
.wb-footer-about p { margin: 0; font-size: var(--wb-body-size, calc(14px * var(--wb-font-scale, 1))); line-height: 1.6; max-width: 320px; }
.wb-footer-tagline { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.75; }

/* Social Icons */
.wb-social { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.wb-social-circle-btn {
  width: 34px; height: 34px; border-radius: 9999px; display: inline-flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--wb-text) 5%, transparent);
  border: 1px solid var(--wb-border);
  color: var(--wb-text);
  transition: all 0.2s ease;
  flex-shrink: 0;
  text-decoration: none;
}
.wb-social-circle-btn svg { width: 15px; height: 15px; }
.wb-social-circle-btn:hover {
  background: var(--wb-primary);
  border-color: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff);
  transform: translateY(-2px);
}

/* Horizontal Nav Rows */
.wb-footer-nav-row { display: flex; flex-wrap: wrap; gap: 20px 28px; list-style: none; padding: 0; margin: 0; }
.wb-footer-nav-row a { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.wb-footer-nav-row a.wb-active-nav { color: var(--wb-primary); font-weight: 700; }

/* Contact Details Block */
.wb-footer-contact-block { display: flex; flex-direction: column; gap: 8px; font-size: 13px; line-height: 1.5; }
.wb-footer-contact-item { display: flex; align-items: flex-start; gap: 8px; }

/* Newsletter Form */
.wb-newsletter-box { display: flex; flex-direction: column; gap: 12px; }
.wb-newsletter-box h4 { margin-bottom: 2px; }
.wb-newsletter-box p { font-size: 13px; margin: 0; }
.wb-newsletter-form { display: flex; gap: 0; max-width: 360px; width: 100%; }
.wb-newsletter-input {
  flex: 1; height: 40px; padding: 0 14px; font-size: 13px;
  background: var(--wb-bg); border: 1px solid var(--wb-border);
  border-right: none; border-radius: var(--wb-radius) 0 0 var(--wb-radius);
  outline: none; transition: border-color 0.15s ease;
}
.wb-newsletter-input:focus { border-color: var(--wb-primary); }
.wb-newsletter-btn {
  height: 40px; padding: 0 18px; font-size: 13px; font-weight: 600;
  background: var(--wb-primary); color: var(--wb-on-primary, #ffffff);
  border: 1px solid var(--wb-primary); border-radius: 0 var(--wb-radius) var(--wb-radius) 0;
  cursor: pointer; transition: opacity 0.15s ease; white-space: nowrap;
}
.wb-newsletter-btn:hover { opacity: 0.9; }

/* Payment Methods Badges */
.wb-payment-badges { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.wb-payment-badge {
  height: 24px; min-width: 38px; padding: 0 6px; border-radius: 4px;
  background: #ffffff; border: 1px solid #e2e8f0;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); flex-shrink: 0;
}
.wb-pay-text { font-size: 10px; letter-spacing: -0.02em; user-select: none; }
.wb-pay-mc-circles { display: inline-flex; position: relative; width: 20px; height: 12px; align-items: center; }
.wb-pay-mc-red { width: 12px; height: 12px; border-radius: 9999px; background: #eb001b; display: inline-block; }
.wb-pay-mc-yellow { width: 12px; height: 12px; border-radius: 9999px; background: #ff5f00; display: inline-block; margin-left: -5px; opacity: 0.9; }

/* Inline Footer */
.wb-footer-inline-bar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px;
}

/* Centered Footer */
.wb-footer-centered-wrap {
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 20px; max-width: 680px; margin: 0 auto;
}

/* CTA Top Banner on Footer */
.wb-footer-cta-card {
  padding: 40px; margin-bottom: 48px; border-radius: calc(var(--wb-radius) * 1.5);
  background: color-mix(in srgb, var(--wb-primary) 8%, var(--wb-surface));
  border: 1px solid color-mix(in srgb, var(--wb-primary) 20%, var(--wb-border));
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px;
}
.wb-footer-cta-card h3 { font-size: 24px; font-weight: 700; text-transform: none; letter-spacing: -0.02em; margin: 0 0 6px 0; }
.wb-footer-cta-card p { font-size: 15px; margin: 0; }

/* Bottom Bar */
.wb-footer-bottom {
  margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--wb-border);
  display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; font-size: var(--wb-body-size, calc(13px * var(--wb-font-scale, 1)));
}
.wb-footer-bottom-left { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.wb-footer-copyright { font-size: var(--wb-body-size, calc(13px * var(--wb-font-scale, 1))); }
.wb-legal-links { display: flex; flex-wrap: wrap; gap: 14px; list-style: none; padding: 0; margin: 0; }
.wb-legal-links a { font-size: var(--wb-body-size, calc(12px * var(--wb-font-scale, 1))); text-decoration: none; opacity: 0.8; }
.wb-legal-links a:hover { opacity: 1; }

.wb-footer-simple { padding: 28px 0; }
.wb-footer-simple .wb-footer-bottom { margin-top: 0; padding-top: 0; border-top: 0; align-items: center; }

/* ------------------------------------------------ Vintage Editorial Footer Overrides */
.wb-site:has(.wb-header-vintage-editorial) .wb-footer {
  padding: 46px 0 0;
  border-top: 0;
  background: var(--wb-footer-bg, var(--vr-footer, #0C0B09));
  color: var(--wb-footer-text, #D9D3C7);
}
.wb-site:has(.wb-header-vintage-editorial) .wb-footer-grid { grid-template-columns: 1.6fr repeat(var(--wb-footer-cols, 3), 1fr); gap: 28px; min-height: 187px; }
.wb-site:has(.wb-header-vintage-editorial) .wb-footer-about { gap: 0; }
.wb-site:has(.wb-header-vintage-editorial) .wb-footer-about .wb-brand,
.wb-site:has(.wb-header-vintage-editorial) .wb-footer-about .wb-brand-text {
  font-family: var(--vr-serif);
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #F2EEE3;
}
.wb-site:has(.wb-header-vintage-editorial) .wb-footer-tagline {
  display: inline-block;
  margin-top: 3px;
  padding: 1px 4px;
  background: var(--vr-gold, #E6AD4A);
  color: #14100E;
  font-family: var(--vr-mono, monospace);
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.22em;
  border-radius: 1px;
}
.wb-site:has(.wb-header-vintage-editorial) .wb-footer-about p { max-width: 310px; margin-top: 14px; font-size: 11.5px; line-height: 1.75; color: #BDB6A9; }
.wb-site:has(.wb-header-vintage-editorial) .wb-footer h4 {
  margin: 0 0 16px;
  font-family: var(--vr-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.25em;
  color: var(--vr-gold);
}
.wb-site:has(.wb-header-vintage-editorial) .wb-footer li { line-height: 16px; }
.wb-site:has(.wb-header-vintage-editorial) .wb-footer li + li { margin-top: 11px; }
.wb-site:has(.wb-header-vintage-editorial) .wb-footer-grid a { font-size: 12px; line-height: 16px; color: #D9D3C7; }
.wb-site:has(.wb-header-vintage-editorial) .wb-footer a:hover { color: var(--vr-gold); }
.wb-site:has(.wb-header-vintage-editorial) .wb-footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  margin-top: 0;
  padding: 0;
  border-top: 1px solid rgba(242, 238, 227, 0.1);
  font-size: 10.5px;
  color: #8F897E;
}
.wb-site:has(.wb-header-vintage-editorial) .wb-footer-bottom-left { display: contents; }
.wb-site:has(.wb-header-vintage-editorial) .wb-legal-links { display: flex; flex-flow: row nowrap; align-items: center; gap: 0; }
.wb-site:has(.wb-header-vintage-editorial) .wb-footer .wb-legal-links li { margin: 0; }
.wb-site:has(.wb-header-vintage-editorial) .wb-legal-links a { font-size: 10.5px; color: #BDB6A9; }
.wb-site:has(.wb-header-vintage-editorial) .wb-legal-links li + li::before { content: "·"; margin: 0 5px; color: #8F897E; }
@container wb-site (max-width: 860px) {
  .wb-site:has(.wb-header-vintage-editorial) .wb-footer-grid { grid-template-columns: 1fr 1fr; }
  .wb-site:has(.wb-header-vintage-editorial) .wb-footer-bottom { height: auto; padding: 16px 0; flex-direction: column; gap: 8px; }
}
@media (max-width: 860px) {
  .wb-site:has(.wb-header-vintage-editorial) .wb-footer-grid { grid-template-columns: 1fr 1fr; }
  .wb-site:has(.wb-header-vintage-editorial) .wb-footer-bottom { height: auto; padding: 16px 0; flex-direction: column; gap: 8px; }
}

/* Section settings */
.wb-bg-dark { background: var(--wb-text); color: var(--wb-bg); }
.wb-bg-dark .wb-muted { color: inherit; opacity: 0.75; }
.wb-bg-dark .wb-card { background: color-mix(in srgb, var(--wb-bg) 8%, var(--wb-text)); color: inherit; }
.wb-bg-dark .wb-btn-secondary { color: inherit; border-color: currentColor; }
.wb-space-none { padding: 0; }
.wb-space-compact { padding: calc(var(--wb-section-y) * 0.5) 0; }
.wb-space-relaxed { padding: calc(var(--wb-section-y) * 1.4) 0; }
/* Universal Section Alignment */
.wb-align-left .wb-section-head,
.wb-section-head.wb-align-left,
.wb-align-left.wb-cta,
.wb-align-left .wb-gallery-head,
.wb-gallery-head.wb-align-left,
.wb-align-left .wb-media-head,
.wb-media-head.wb-align-left,
.wb-align-left .wb-media figcaption,
.wb-align-left .wb-logos-head,
.wb-logos-head.wb-align-left,
.wb-align-left .wb-hero-copy {
  text-align: left;
  margin-left: 0;
  margin-right: auto;
}
.wb-align-left .wb-actions,
.wb-actions.wb-align-left,
.wb-align-left .wb-logos-row,
.wb-logos-row.wb-align-left,
.wb-align-left .wb-hero-actions,
.wb-align-left .wb-trusted-logos,
.wb-align-left .wb-hero-rating {
  justify-content: flex-start;
}
.wb-align-left .wb-hero:not(.wb-hero-split):not(.wb-hero-split-left):not(.wb-hero-asymmetric):not(.wb-hero-floating-cards) .wb-hero-copy {
  align-items: flex-start;
}
.wb-align-left .wb-stat { text-align: left; }

.wb-align-center .wb-section-head,
.wb-section-head.wb-align-center,
.wb-align-center .wb-gallery-head,
.wb-gallery-head.wb-align-center,
.wb-align-center .wb-media-head,
.wb-media-head.wb-align-center,
.wb-align-center .wb-media figcaption,
.wb-align-center .wb-logos-head,
.wb-logos-head.wb-align-center,
.wb-align-center .wb-hero-copy {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.wb-align-center .wb-actions,
.wb-actions.wb-align-center,
.wb-align-center .wb-logos-row,
.wb-logos-row.wb-align-center,
.wb-align-center .wb-hero-actions,
.wb-align-center .wb-trusted-logos,
.wb-align-center .wb-hero-rating {
  justify-content: center;
}
.wb-align-center .wb-hero:not(.wb-hero-split):not(.wb-hero-split-left):not(.wb-hero-asymmetric):not(.wb-hero-floating-cards) .wb-hero-copy {
  align-items: center;
}
.wb-align-center .wb-stat { text-align: center; }

.wb-align-right .wb-section-head,
.wb-section-head.wb-align-right,
.wb-align-right .wb-gallery-head,
.wb-gallery-head.wb-align-right,
.wb-align-right .wb-media-head,
.wb-media-head.wb-align-right,
.wb-align-right .wb-media figcaption,
.wb-align-right .wb-logos-head,
.wb-logos-head.wb-align-right,
.wb-align-right .wb-hero-copy {
  text-align: right;
  margin-left: auto;
  margin-right: 0;
}
.wb-align-right .wb-actions,
.wb-actions.wb-align-right,
.wb-align-right .wb-logos-row,
.wb-logos-row.wb-align-right,
.wb-align-right .wb-hero-actions,
.wb-align-right .wb-trusted-logos,
.wb-align-right .wb-hero-rating {
  justify-content: flex-end;
}
.wb-align-right .wb-hero:not(.wb-hero-split):not(.wb-hero-split-left):not(.wb-hero-asymmetric):not(.wb-hero-floating-cards) .wb-hero-copy {
  align-items: flex-end;
}
.wb-align-right .wb-stat { text-align: right; }
.wb-empty { padding: 32px; text-align: center; font-size: 14px; color: var(--wb-muted); border: 1px dashed var(--wb-border); border-radius: var(--wb-radius); }
.wb-media-placeholder { background: color-mix(in srgb, var(--wb-text) 6%, transparent); border-radius: var(--wb-radius); min-height: 240px; display: grid; place-items: center; }
.wb-media-placeholder .wb-empty { border: 0; }

/* Logo cloud */
.wb-logos-head { text-align: center; font-size: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 28px; }
.wb-logos-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 24px 48px; }
.wb-logos-row img { max-height: 40px; width: auto; object-fit: contain; }
.wb-logos-gray .wb-logos-row img { filter: grayscale(1); opacity: 0.7; transition: opacity 0.15s ease, filter 0.15s ease; }
.wb-logos-gray .wb-logos-row img:hover { filter: none; opacity: 1; }

/* Split content */
.wb-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.wb-split-left .wb-split-media { order: -1; }
.wb-split-copy h2 { margin: 12px 0 16px; }
.wb-split-copy p + p { margin-top: 12px; }
.wb-split-media img, .wb-split-media .wb-media-placeholder { width: 100%; border-radius: var(--wb-radius); aspect-ratio: 4 / 3; object-fit: cover; }
.wb-split-list, .wb-plan-features { display: grid; gap: 10px; margin-top: 20px; }
.wb-split-list li, .wb-plan-features li { display: flex; align-items: flex-start; gap: 10px; }
.wb-split-list .wb-icon, .wb-plan-features .wb-icon { width: 22px; height: 22px; margin: 2px 0 0; flex-shrink: 0; border-radius: 999px; }
.wb-split-list .wb-icon svg, .wb-plan-features .wb-icon svg { width: 14px; height: 14px; }

/* Statistics */
.wb-stat { display: flex; flex-direction: column-reverse; gap: 6px; text-align: center; padding: 8px; }
.wb-stat dd { font-family: var(--wb-font-heading); font-size: 44px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
.wb-stat dt { font-size: 15px; }
.wb-align-left .wb-stat { text-align: left; }

/* ==========================================================================
   Pricing Section (Modern Executive & Clean Minimal System)
   ========================================================================== */

/* Billing Cycle / Discount Bar */
.wb-pricing-billing-bar {
  display: flex;
  margin-top: -12px;
  margin-bottom: 36px;
}
.wb-pricing-billing-bar.wb-align-center {
  justify-content: center;
}
.wb-pricing-billing-bar.wb-align-left {
  justify-content: flex-start;
}
.wb-pricing-billing-bar.wb-align-right {
  justify-content: flex-end;
}
.wb-pricing-pill-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 9999px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  font-size: 13px;
  font-weight: 500;
  color: var(--wb-muted);
}
.wb-pricing-cycle-label {
  color: var(--wb-text);
  font-weight: 600;
}
.wb-pricing-discount-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  background: var(--wb-text);
  color: var(--wb-bg);
  letter-spacing: 0.02em;
}

/* Base Pricing Typography & Badges */
.wb-pricing-plan-name {
  font-family: var(--wb-font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--wb-text);
  margin: 0;
  line-height: 1.25;
}
.wb-pricing-plan-desc {
  font-size: 14px;
  color: var(--wb-muted);
  line-height: 1.5;
  margin: 6px 0 0;
}
.wb-pricing-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  color: var(--wb-text);
  align-self: flex-start;
}

/* Price block */
.wb-pricing-price-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 16px 0;
}
.wb-pricing-price-group {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.wb-pricing-amount {
  font-family: var(--wb-font-heading);
  font-size: 40px;
  font-weight: 800;
  line-height: 1;
  color: var(--wb-text);
  letter-spacing: -0.03em;
}
.wb-pricing-period {
  font-size: 14px;
  font-weight: 500;
  color: var(--wb-muted);
}
.wb-pricing-orig-price {
  font-size: 14px;
  color: var(--wb-muted);
  text-decoration: line-through;
  opacity: 0.7;
}

/* Features List & Micro SVGs */
.wb-pricing-divider {
  height: 1px;
  background: var(--wb-border);
  margin: 16px 0 20px;
  width: 100%;
}
.wb-pricing-features-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.wb-pricing-features-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--wb-muted);
}
.wb-pricing-features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.wb-pricing-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  line-height: 1.45;
  color: var(--wb-text);
}
.wb-pricing-feature-item.wb-excluded {
  color: var(--wb-muted);
  opacity: 0.65;
  text-decoration: line-through;
}
.wb-pricing-check-icon {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  flex-shrink: 0;
  color: var(--wb-text);
}
.wb-pricing-cross-icon {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  flex-shrink: 0;
  color: var(--wb-muted);
}

/* Action Area */
.wb-pricing-action-wrap {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.wb-pricing-action-wrap .wb-btn {
  width: 100%;
  justify-content: center;
  text-align: center;
}
.wb-pricing-highlight-note {
  font-size: 12px;
  color: var(--wb-muted);
  text-align: center;
  line-height: 1.35;
}

/* Footer note */
.wb-pricing-footer-note {
  margin-top: 40px;
  font-size: 13.5px;
  color: var(--wb-muted);
}
.wb-pricing-footer-note.wb-align-center {
  text-align: center;
}
.wb-pricing-footer-note.wb-align-left {
  text-align: left;
}
.wb-pricing-footer-note.wb-align-right {
  text-align: right;
}

/* Card Styles */
.wb-pricing-card-style-default {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}
.wb-pricing-card-style-bordered {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
}
.wb-pricing-card-style-flat {
  background: transparent;
  border: 1px solid transparent;
}
.wb-pricing-card-style-glass {
  background: color-mix(in srgb, var(--wb-surface) 60%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid color-mix(in srgb, var(--wb-border) 80%, transparent);
}
.wb-pricing-card-style-elevated {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
}
.wb-pricing-card-style-contrast {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}

/* ==========================================================================
   Variant 1: Standard Cards Grid
   ========================================================================== */
.wb-pricing-cards-grid {
  display: grid;
  align-items: stretch;
}
.wb-pricing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 32px 28px;
  border-radius: var(--wb-radius);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease;
}
.wb-pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px -12px rgba(0, 0, 0, 0.09);
}
.wb-pricing-card-featured {
  border-color: var(--wb-text);
  box-shadow: 0 0 0 1px var(--wb-text), 0 20px 40px -12px rgba(0, 0, 0, 0.12);
}
.wb-pricing-featured-tag {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--wb-text);
  color: var(--wb-bg);
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.wb-pricing-card-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ==========================================================================
   Variant 2: Minimal Monochrome (Swiss Architectural)
   ========================================================================== */
.wb-pricing-minimal-grid {
  display: grid;
  align-items: stretch;
}
.wb-pricing-minimal-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  border-top: 2px solid var(--wb-border);
  border-bottom: 1px solid var(--wb-border);
  background: transparent;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.wb-pricing-minimal-card:hover {
  border-top-color: var(--wb-text);
  background: color-mix(in srgb, var(--wb-surface) 40%, transparent);
}
.wb-pricing-minimal-featured {
  border-top-color: var(--wb-text);
  border-top-width: 3px;
  background: color-mix(in srgb, var(--wb-surface) 50%, transparent);
}
.wb-pricing-minimal-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.wb-pricing-minimal-index {
  font-family: var(--wb-font-heading);
  font-size: 15px;
  font-weight: 700;
  color: var(--wb-muted);
  letter-spacing: 0.05em;
}
.wb-pricing-minimal-price-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 20px 0 24px;
  padding-bottom: 20px;
  border-bottom: 1px dashed var(--wb-border);
}
.wb-pricing-minimal-features-wrap {
  flex: 1;
}

/* ==========================================================================
   Variant 3: Spotlight Tier (Asymmetric Spotlight Pro Focus)
   ========================================================================== */
.wb-pricing-spotlight-grid {
  display: grid;
  align-items: stretch;
}
.wb-pricing-spotlight-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 32px 28px;
  border-radius: var(--wb-radius);
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s ease;
}
.wb-pricing-spotlight-featured {
  border-color: var(--wb-text);
  box-shadow: 0 0 0 2px var(--wb-text), 0 24px 48px -12px rgba(0, 0, 0, 0.16);
  z-index: 2;
}
@container wb-site (min-width: 900px) {
  .wb-pricing-spotlight-featured {
    transform: scale(1.03);
  }
  .wb-pricing-spotlight-featured:hover {
    transform: scale(1.04) translateY(-4px);
  }
}
@media (min-width: 900px) {
  .wb-pricing-spotlight-featured {
    transform: scale(1.03);
  }
  .wb-pricing-spotlight-featured:hover {
    transform: scale(1.04) translateY(-4px);
  }
}
.wb-pricing-spotlight-tag {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--wb-text);
  color: var(--wb-bg);
  padding: 4px 16px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

/* ==========================================================================
   Variant 4: Horizontal Rows (Enterprise Consultative Rows)
   ========================================================================== */
.wb-pricing-rows-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.wb-pricing-row-card {
  display: grid;
  grid-template-columns: 280px 1fr 220px;
  gap: 32px;
  align-items: center;
  padding: 28px 32px;
  border-radius: var(--wb-radius);
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.wb-pricing-row-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.08);
}
.wb-pricing-row-featured {
  border-color: var(--wb-text);
  box-shadow: 0 0 0 1px var(--wb-text), 0 16px 32px -8px rgba(0, 0, 0, 0.1);
}
.wb-pricing-row-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.wb-pricing-row-middle {
  border-left: 1px solid var(--wb-border);
  border-right: 1px solid var(--wb-border);
  padding: 0 28px;
}
.wb-pricing-row-features-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 20px;
}
.wb-pricing-row-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wb-pricing-row-right .wb-pricing-price-wrap {
  margin: 0;
}
.wb-pricing-row-right .wb-pricing-action-wrap {
  padding-top: 8px;
}

@container wb-site (max-width: 900px) {
  .wb-pricing-row-card {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 24px;
  }
  .wb-pricing-row-middle {
    border-left: none;
    border-right: none;
    border-top: 1px solid var(--wb-border);
    border-bottom: 1px solid var(--wb-border);
    padding: 16px 0;
  }
  .wb-pricing-row-features-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 900px) {
  .wb-pricing-row-card {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 24px;
  }
  .wb-pricing-row-middle {
    border-left: none;
    border-right: none;
    border-top: 1px solid var(--wb-border);
    border-bottom: 1px solid var(--wb-border);
    padding: 16px 0;
  }
  .wb-pricing-row-features-grid {
    grid-template-columns: 1fr;
  }
}

/* Media */
.wb-media-contained figure { max-width: 880px; margin: 0 auto; }
.wb-media-head { text-align: center; margin-bottom: 32px; }
.wb-media-frame { position: relative; overflow: hidden; border-radius: var(--wb-radius); }
.wb-media-frame img, .wb-media-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; }
.wb-aspect-video { aspect-ratio: 16 / 9; }
.wb-aspect-classic { aspect-ratio: 4 / 3; }
.wb-aspect-square { aspect-ratio: 1 / 1; }
.wb-media figcaption { margin-top: 12px; text-align: center; font-size: 14px; }

/* Team Section - Modern 2026 Design System */
.wb-team { position: relative; }
.wb-team-header-wrapper { display: flex; flex-direction: column; margin-bottom: 40px; }
.wb-team-header-wrapper.wb-align-center { align-items: center; text-align: center; }
.wb-team-header-wrapper.wb-align-left { align-items: flex-start; text-align: left; }
.wb-team-header-wrapper.wb-align-right { align-items: flex-end; text-align: right; }
.wb-team-eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--wb-primary);
  margin-bottom: 8px;
}
.wb-team-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 5px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  background: color-mix(in srgb, var(--wb-primary) 8%, var(--wb-surface));
  border: 1px solid color-mix(in srgb, var(--wb-primary) 22%, transparent);
  color: var(--wb-primary);
}
.wb-team-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: var(--wb-primary);
  animation: wb-team-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes wb-team-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.2); }
}

/* Base Avatar & Media */
.wb-team-avatar-wrapper {
  position: relative;
  overflow: hidden;
  background: color-mix(in srgb, var(--wb-text) 6%, var(--wb-surface));
  width: 100%;
}
.wb-team-avatar-portrait { aspect-ratio: 4 / 4.8; border-radius: calc(var(--wb-radius, 14px) * 0.85); }
.wb-team-avatar-square { aspect-ratio: 1 / 1; border-radius: calc(var(--wb-radius, 14px) * 0.85); }
.wb-team-avatar-circle { aspect-ratio: 1 / 1; border-radius: 9999px; }
.wb-team-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-team-avatar-initials {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, color-mix(in srgb, var(--wb-primary) 18%, var(--wb-surface)), color-mix(in srgb, var(--wb-primary) 6%, var(--wb-surface)));
  color: var(--wb-primary);
  letter-spacing: -0.02em;
}

/* Card Styling Tokens */
.wb-team-card-default {
  background: var(--wb-surface);
  border: 1px solid color-mix(in srgb, var(--wb-text) 9%, transparent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.wb-team-card-bordered {
  background: var(--wb-surface);
  border: 1.5px solid color-mix(in srgb, var(--wb-primary) 28%, transparent);
}
.wb-team-card-elevated {
  background: var(--wb-surface);
  border: 1px solid color-mix(in srgb, var(--wb-text) 7%, transparent);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02);
}
.wb-team-card-flat {
  background: color-mix(in srgb, var(--wb-text) 3.5%, var(--wb-surface));
  border: 1px solid transparent;
}
.wb-team-card-glass {
  background: color-mix(in srgb, var(--wb-surface) 75%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid color-mix(in srgb, var(--wb-text) 12%, transparent);
}
.wb-team-card-contrast {
  background: var(--wb-text);
  color: var(--wb-background);
  border: 1px solid color-mix(in srgb, var(--wb-text) 90%, transparent);
}
.wb-team-card-contrast .wb-team-member-name,
.wb-team-card-contrast .wb-team-leader-name,
.wb-team-card-contrast .wb-team-roster-name {
  color: var(--wb-background);
}
.wb-team-card-contrast .wb-team-member-bio,
.wb-team-card-contrast .wb-team-leader-bio,
.wb-team-card-contrast .wb-team-location {
  color: color-mix(in srgb, var(--wb-background) 75%, transparent);
}

/* Tags & Meta Details */
.wb-team-dep-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-surface) 92%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid color-mix(in srgb, var(--wb-text) 10%, transparent);
  color: var(--wb-text);
}
.wb-team-dep-tag-mini {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-primary) 10%, transparent);
  color: var(--wb-primary);
  width: fit-content;
}
.wb-team-location {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--wb-muted);
}
.wb-team-pin-icon { width: 13px; height: 13px; flex-shrink: 0; opacity: 0.75; }
.wb-team-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.wb-team-tag {
  font-size: 11.5px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--wb-text) 5%, transparent);
  color: var(--wb-muted);
  border: 1px solid color-mix(in srgb, var(--wb-text) 7%, transparent);
}
.wb-team-tag-highlight {
  background: color-mix(in srgb, var(--wb-primary) 8%, transparent);
  color: var(--wb-primary);
  border-color: color-mix(in srgb, var(--wb-primary) 20%, transparent);
}

/* Social Icon Buttons */
.wb-team-socials { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.wb-team-social-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-grid;
  place-items: center;
  color: var(--wb-muted);
  background: color-mix(in srgb, var(--wb-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-text) 8%, transparent);
  transition: all 0.2s ease;
  text-decoration: none;
}
.wb-team-social-btn:hover {
  color: var(--wb-primary);
  background: color-mix(in srgb, var(--wb-primary) 12%, transparent);
  border-color: color-mix(in srgb, var(--wb-primary) 30%, transparent);
  transform: translateY(-2px);
}
.wb-team-social-icon { width: 15px; height: 15px; }

/* Links */
.wb-team-link-btn {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--wb-primary);
  text-decoration: none;
  transition: opacity 0.2s ease;
}
.wb-team-link-btn:hover { opacity: 0.8; text-decoration: underline; }
.wb-team-link-btn-subtle {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--wb-primary);
  text-decoration: none;
}

/* =========================================================================
   VARIANT 1: Grid Cards
   ========================================================================= */
.wb-team-grid { list-style: none; padding: 0; margin: 0; }
.wb-team-card {
  border-radius: var(--wb-radius, 16px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 38px -12px rgba(0, 0, 0, 0.12);
  border-color: color-mix(in srgb, var(--wb-primary) 35%, transparent);
}
.wb-team-card:hover .wb-team-avatar-img {
  transform: scale(1.04);
}
.wb-team-card-media { position: relative; overflow: hidden; }
.wb-team-card-body {
  padding: 22px 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.wb-team-member-meta { display: flex; flex-direction: column; gap: 2px; }
.wb-team-member-name { font-size: 19px; font-weight: 700; line-height: 1.25; margin: 0; }
.wb-team-member-role { font-size: 14px; font-weight: 600; color: var(--wb-primary); margin: 0; }
.wb-team-member-bio { font-size: 14px; line-height: 1.55; color: var(--wb-muted); margin: 0; }
.wb-team-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--wb-text) 8%, transparent);
}

/* =========================================================================
   VARIANT 2: Spotlight Featured
   ========================================================================= */
.wb-team-spotlight-layout { display: flex; flex-direction: column; gap: 36px; }
.wb-team-leader-card {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 36px;
  border-radius: var(--wb-radius, 20px);
  overflow: hidden;
  padding: 32px;
  align-items: center;
  transition: all 0.3s ease;
}
.wb-team-leader-card:hover {
  border-color: color-mix(in srgb, var(--wb-primary) 40%, transparent);
}
.wb-team-leader-media { border-radius: calc(var(--wb-radius, 16px) * 0.85); overflow: hidden; width: 100%; height: 100%; }
.wb-team-leader-content { display: flex; flex-direction: column; gap: 12px; }
.wb-team-leader-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--wb-primary);
}
.wb-team-pulse-indicator {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--wb-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--wb-primary) 25%, transparent);
}
.wb-team-leader-name { font-size: 28px; font-weight: 800; line-height: 1.2; margin: 0; }
.wb-team-leader-role { font-size: 17px; font-weight: 600; color: var(--wb-primary); margin: 0; }
.wb-team-leader-bio { font-size: 15.5px; line-height: 1.65; color: var(--wb-muted); margin: 0; }
.wb-team-leader-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 10px;
  padding-top: 18px;
  border-top: 1px solid color-mix(in srgb, var(--wb-text) 8%, transparent);
}
.wb-team-leader-action { font-size: 14.5px; font-weight: 700; }

.wb-team-roster-section { width: 100%; }
.wb-team-roster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.wb-team-roster-card {
  display: flex;
  gap: 16px;
  padding: 18px;
  border-radius: var(--wb-radius, 14px);
  align-items: flex-start;
  transition: transform 0.25s ease, border-color 0.25s ease;
}
.wb-team-roster-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--wb-primary) 30%, transparent);
}
.wb-team-roster-avatar { width: 72px; height: 72px; flex-shrink: 0; }
.wb-team-roster-info { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 0; }
.wb-team-roster-name { font-size: 16px; font-weight: 700; line-height: 1.25; margin: 0; }
.wb-team-roster-role { font-size: 13.5px; font-weight: 600; color: var(--wb-primary); margin: 0; }
.wb-team-roster-bio {
  font-size: 13px;
  line-height: 1.5;
  color: var(--wb-muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =========================================================================
   VARIANT 3: Minimal Editorial
   ========================================================================= */
.wb-team-editorial-container { width: 100%; }
.wb-team-editorial-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid color-mix(in srgb, var(--wb-text) 12%, transparent);
}
.wb-team-editorial-item {
  display: grid;
  grid-template-columns: 44px 58px 220px 1fr auto;
  gap: 24px;
  align-items: center;
  padding: 20px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--wb-text) 9%, transparent);
  transition: background 0.25s ease, padding 0.25s ease, border-color 0.25s ease;
  border-radius: calc(var(--wb-radius, 12px) * 0.5);
}
.wb-team-editorial-item:hover {
  background: color-mix(in srgb, var(--wb-text) 2.5%, var(--wb-surface));
  padding-left: 18px;
  padding-right: 18px;
  border-color: color-mix(in srgb, var(--wb-primary) 30%, transparent);
}
.wb-team-editorial-index {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--wb-muted);
  letter-spacing: 0.05em;
}
.wb-team-editorial-avatar {
  width: 54px;
  height: 54px;
  filter: grayscale(85%);
  transition: filter 0.3s ease, transform 0.3s ease;
}
.wb-team-editorial-item:hover .wb-team-editorial-avatar {
  filter: grayscale(0%);
  transform: scale(1.06);
}
.wb-team-editorial-col-primary { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.wb-team-editorial-name { font-size: 17.5px; font-weight: 700; margin: 0; }
.wb-team-editorial-role { font-size: 13.5px; font-weight: 600; color: var(--wb-primary); margin: 0; }
.wb-team-editorial-loc { margin-top: 2px; }
.wb-team-editorial-col-bio { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.wb-team-editorial-bio { font-size: 13.5px; line-height: 1.5; color: var(--wb-muted); margin: 0; }
.wb-team-editorial-col-actions { display: flex; align-items: center; gap: 10px; }
.wb-team-editorial-arrow-btn {
  font-size: 13px;
  font-weight: 700;
  color: var(--wb-primary);
  text-decoration: none;
  white-space: nowrap;
}

/* =========================================================================
   VARIANT 4: Glass Overlay (Cinematic Hover Expansion)
   ========================================================================= */
.wb-team-glass-grid { list-style: none; padding: 0; margin: 0; }
.wb-team-glass-card {
  position: relative;
  min-height: 420px;
  border-radius: var(--wb-radius, 18px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-shadow: 0 10px 30px -8px rgba(0, 0, 0, 0.16);
  border: 1px solid color-mix(in srgb, var(--wb-text) 12%, transparent);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-team-glass-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 48px -12px rgba(0, 0, 0, 0.28);
}
.wb-team-glass-bg-wrap { position: absolute; inset: 0; z-index: 1; }
.wb-team-glass-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-team-glass-card:hover .wb-team-glass-img {
  transform: scale(1.08);
}
.wb-team-glass-initials {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(180deg, #1e293b, #0f172a);
  color: #fff;
}
.wb-team-glass-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.35) 50%, rgba(0, 0, 0, 0.88) 100%);
}
.wb-team-glass-top-pill {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 3;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.wb-team-glass-sheet {
  position: relative;
  z-index: 2;
  margin: 12px;
  padding: 16px 18px;
  border-radius: calc(var(--wb-radius, 18px) * 0.72);
  background: rgba(15, 19, 28, 0.78);
  color: #fff;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-team-glass-name { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
.wb-team-glass-role { font-size: 13.5px; font-weight: 500; color: rgba(255, 255, 255, 0.85); margin: 2px 0 0; }
.wb-team-glass-expandable {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wb-team-glass-card:hover .wb-team-glass-expandable {
  max-height: 240px;
  opacity: 1;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}
.wb-team-glass-loc { color: rgba(255, 255, 255, 0.75); }
.wb-team-glass-bio { font-size: 13px; line-height: 1.5; color: rgba(255, 255, 255, 0.85); margin: 0; }
.wb-team-glass-tags .wb-team-tag {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}
.wb-team-glass-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
.wb-team-glass-sheet .wb-team-social-btn {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}
.wb-team-glass-sheet .wb-team-social-btn:hover {
  background: #fff;
  color: #0f172a;
  border-color: #fff;
}
.wb-team-glass-link { font-size: 13px; font-weight: 600; color: #fff; text-decoration: underline; }

/* Responsive adjustments */
@container wb-site (max-width: 900px) {
  .wb-team-leader-card { grid-template-columns: 1fr; gap: 24px; padding: 24px; }
  .wb-team-editorial-item {
    grid-template-columns: 36px 48px 1fr;
    gap: 16px;
  }
  .wb-team-editorial-col-bio,
  .wb-team-editorial-col-actions {
    grid-column: 2 / -1;
  }
}
@container wb-site (max-width: 600px) {
  .wb-team-leader-card { padding: 18px; }
  .wb-team-editorial-item {
    grid-template-columns: 44px 1fr;
    gap: 12px;
  }
  .wb-team-editorial-col-num { display: none; }
  .wb-team-glass-card { min-height: 360px; }
}

/* =========================================================================
   CAROUSEL SECTION
   ========================================================================= */
.wb-carousel { position: relative; overflow: hidden; }
.wb-carousel-container { position: relative; width: 100%; }
.wb-carousel-header-wrapper { display: flex; flex-direction: column; margin-bottom: 32px; }
.wb-carousel-header-wrapper.wb-align-center { align-items: center; text-align: center; }
.wb-carousel-header-wrapper.wb-align-left { align-items: flex-start; text-align: left; }
.wb-carousel-header-wrapper.wb-align-right { align-items: flex-end; text-align: right; }
.wb-carousel-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--wb-primary);
  margin-bottom: 8px;
}
.wb-carousel-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 5px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  background: color-mix(in srgb, var(--wb-primary) 8%, var(--wb-surface));
  border: 1px solid color-mix(in srgb, var(--wb-primary) 22%, transparent);
  color: var(--wb-primary);
}
.wb-carousel-badge-inline {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-primary) 10%, transparent);
  color: var(--wb-primary);
  width: fit-content;
}
.wb-carousel-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: var(--wb-primary);
  animation: wb-carousel-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes wb-carousel-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.2); }
}

/* Multi-Cards Slider Track */
.wb-carousel-cards-wrapper { position: relative; overflow: hidden; }
.wb-carousel-cards-track {
  display: flex;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.wb-carousel-slide-item {
  min-width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
}
.wb-carousel-card {
  border-radius: var(--wb-radius, 18px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.wb-carousel-card-media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: color-mix(in srgb, var(--wb-text) 6%, var(--wb-surface));
}
.wb-carousel-card-img { width: 100%; height: 100%; object-fit: cover; }
.wb-carousel-card-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  backdrop-filter: blur(8px);
}
.wb-carousel-card-body {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.wb-carousel-card-sub { font-size: 14px; font-weight: 600; color: var(--wb-primary); margin: 0; }
.wb-carousel-card-title { font-size: 24px; font-weight: 700; line-height: 1.25; margin: 0; }
.wb-carousel-card-desc { font-size: 15px; line-height: 1.6; color: var(--wb-muted); margin: 0; }
.wb-carousel-card-actions { display: flex; align-items: center; gap: 12px; margin-top: 14px; flex-wrap: wrap; }

/* Carousel Card Styles */
.wb-carousel-card-default {
  background: var(--wb-surface);
  border: 1px solid color-mix(in srgb, var(--wb-text) 9%, transparent);
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
}
.wb-carousel-card-bordered {
  background: var(--wb-surface);
  border: 1.5px solid color-mix(in srgb, var(--wb-primary) 30%, transparent);
}
.wb-carousel-card-elevated {
  background: var(--wb-surface);
  border: 1px solid color-mix(in srgb, var(--wb-text) 7%, transparent);
  box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.1);
}
.wb-carousel-card-flat {
  background: color-mix(in srgb, var(--wb-text) 3.5%, var(--wb-surface));
  border: 1px solid transparent;
}
.wb-carousel-card-glass {
  background: color-mix(in srgb, var(--wb-surface) 75%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid color-mix(in srgb, var(--wb-text) 12%, transparent);
}
.wb-carousel-card-contrast {
  background: var(--wb-text);
  color: var(--wb-background);
}
.wb-carousel-card-contrast .wb-carousel-card-title { color: var(--wb-background); }
.wb-carousel-card-contrast .wb-carousel-card-desc { color: color-mix(in srgb, var(--wb-background) 75%, transparent); }

/* Navigation Controls Bar */
.wb-carousel-controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  gap: 16px;
}
.wb-carousel-dots { display: flex; align-items: center; gap: 8px; }
.wb-carousel-dot {
  height: 8px;
  width: 8px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-text) 22%, transparent);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-carousel-dot.wb-dot-active {
  width: 26px;
  background: var(--wb-primary);
}
.wb-carousel-arrows { display: flex; align-items: center; gap: 8px; }
.wb-carousel-arrow-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  background: var(--wb-surface);
  border: 1px solid color-mix(in srgb, var(--wb-text) 12%, transparent);
  color: var(--wb-text);
  cursor: pointer;
  transition: all 0.2s ease;
}
.wb-carousel-arrow-btn:hover {
  background: var(--wb-text);
  color: var(--wb-background);
  border-color: var(--wb-text);
  transform: scale(1.05);
}
.wb-carousel-nav-icon { width: 18px; height: 18px; }

/* Hero Slider Variant */
.wb-carousel-hero-container {
  position: relative;
  border-radius: var(--wb-radius, 24px);
  overflow: hidden;
  min-height: 540px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #ffffff;
  background-color: #090d16;
  background-image:
    radial-gradient(ellipse 70% 50% at 75% 15%, rgba(99, 102, 241, 0.24) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 20% 85%, rgba(56, 189, 248, 0.18) 0%, transparent 55%),
    linear-gradient(135deg, #090d16 0%, #0f172a 60%, #171c32 100%);
  box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.wb-carousel-hero-slides-viewport {
  position: relative;
  width: 100%;
  min-height: 540px;
  display: flex;
  overflow: hidden;
}

.wb-carousel-hero-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.wb-carousel-hero-slide.wb-hero-slide-active {
  opacity: 1;
  pointer-events: auto;
  z-index: 2;
}

.wb-carousel-hero-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}

.wb-carousel-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  transition: transform 6s cubic-bezier(0.25, 1, 0.5, 1);
}

.wb-hero-slide-active .wb-carousel-hero-img {
  transform: scale(1.06);
}

.wb-carousel-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(9, 13, 22, 0.35) 0%,
    rgba(9, 13, 22, 0.55) 35%,
    rgba(9, 13, 22, 0.92) 80%,
    rgba(9, 13, 22, 0.98) 100%
  );
  pointer-events: none;
}

.wb-carousel-hero-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 40% at 85% 20%, rgba(99, 102, 241, 0.2), transparent 60%);
  pointer-events: none;
}

.wb-carousel-hero-content {
  position: relative;
  z-index: 2;
  padding: clamp(36px, 6vw, 64px) clamp(28px, 5vw, 56px);
  max-width: 860px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wb-hero-slide-active .wb-carousel-hero-badge-pill {
  animation: wb-hero-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.wb-hero-slide-active .wb-carousel-hero-sub {
  animation: wb-hero-fade-up 0.5s 0.08s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.wb-hero-slide-active .wb-carousel-hero-title {
  animation: wb-hero-fade-up 0.6s 0.14s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.wb-hero-slide-active .wb-carousel-hero-desc {
  animation: wb-hero-fade-up 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.wb-hero-slide-active .wb-carousel-hero-actions {
  animation: wb-hero-fade-up 0.6s 0.26s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes wb-hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wb-carousel-hero-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: fit-content;
}

.wb-carousel-hero-sub {
  font-size: 14.5px;
  font-weight: 600;
  color: color-mix(in srgb, #fff 80%, var(--wb-primary));
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
}

.wb-carousel-hero-title {
  font-size: clamp(32px, 4.5vw, 54px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: #ffffff;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.6);
  margin: 0;
}

.wb-carousel-hero-desc {
  font-size: clamp(15.5px, 1.8vw, 17.5px);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.88);
  max-width: 680px;
  margin: 0;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.5);
}

.wb-carousel-hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.wb-carousel-hero-container .wb-btn-primary {
  box-shadow: 0 4px 20px -2px color-mix(in srgb, var(--wb-primary) 50%, transparent);
}
.wb-carousel-hero-container .wb-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px -2px color-mix(in srgb, var(--wb-primary) 65%, transparent);
}

.wb-carousel-hero-container .wb-btn-secondary {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.wb-carousel-hero-container .wb-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.65);
  color: #ffffff;
}

/* Alignment support */
.wb-carousel-hero-container.wb-align-center .wb-carousel-hero-content {
  margin: 0 auto;
  align-items: center;
  text-align: center;
}
.wb-carousel-hero-container.wb-align-center .wb-carousel-hero-actions {
  justify-content: center;
}
.wb-carousel-hero-container.wb-align-right .wb-carousel-hero-content {
  margin-left: auto;
  align-items: flex-end;
  text-align: right;
}
.wb-carousel-hero-container.wb-align-right .wb-carousel-hero-actions {
  justify-content: flex-end;
}

/* Card Style Modifiers */
.wb-carousel-hero-container.wb-carousel-card-bordered {
  border: 1.5px solid color-mix(in srgb, var(--wb-primary) 50%, transparent);
  box-shadow: 0 0 35px -5px color-mix(in srgb, var(--wb-primary) 30%, transparent), 0 20px 50px -15px rgba(0, 0, 0, 0.4);
}
.wb-carousel-hero-container.wb-carousel-card-elevated {
  box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.6);
}
.wb-carousel-hero-container.wb-carousel-card-glass {
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
.wb-carousel-hero-container.wb-carousel-card-flat {
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.wb-carousel-hero-container.wb-carousel-card-contrast {
  background-color: #000;
  box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.15);
}

/* Floating Controls Bar */
.wb-carousel-hero-nav-bar {
  position: absolute;
  bottom: clamp(24px, 4vw, 36px);
  right: clamp(24px, 4vw, 36px);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(10, 15, 26, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 8px 18px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.wb-carousel-hero-counter {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.9);
  padding-right: 6px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.wb-hero-counter-current {
  color: #fff;
}

.wb-hero-counter-sep {
  color: rgba(255, 255, 255, 0.4);
}

.wb-hero-counter-total {
  color: rgba(255, 255, 255, 0.55);
}

.wb-carousel-hero-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wb-carousel-hero-dot {
  background: none;
  border: none;
  padding: 4px 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.wb-hero-dot-bar {
  display: block;
  width: 12px;
  height: 4px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.wb-carousel-hero-dot:hover .wb-hero-dot-bar {
  background: rgba(255, 255, 255, 0.6);
}

.wb-carousel-hero-dot.wb-hero-dot-active .wb-hero-dot-bar {
  width: 26px;
  background: #fff;
}

.wb-carousel-hero-arrows {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wb-carousel-hero-arrow-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.wb-carousel-hero-arrow-btn:hover {
  background: #fff;
  color: #0b0f19;
  border-color: #fff;
  transform: scale(1.08);
}

@container wb-site (max-width: 768px) {
  .wb-carousel-hero-container,
  .wb-carousel-hero-slides-viewport {
    min-height: 480px;
  }
  .wb-carousel-hero-content {
    padding: 32px 20px 84px 20px;
    gap: 12px;
  }
  .wb-carousel-hero-nav-bar {
    bottom: 18px;
    right: 18px;
    padding: 6px 14px;
    gap: 10px;
  }
  .wb-carousel-hero-counter {
    display: none;
  }
}
@media (max-width: 768px) {
  .wb-carousel-hero-container,
  .wb-carousel-hero-slides-viewport {
    min-height: 480px;
  }
  .wb-carousel-hero-content {
    padding: 32px 20px 84px 20px;
    gap: 12px;
  }
  .wb-carousel-hero-nav-bar {
    bottom: 18px;
    right: 18px;
    padding: 6px 14px;
    gap: 10px;
  }
  .wb-carousel-hero-counter {
    display: none;
  }
}

/* Showcase 3D Perspective Variant */
.wb-carousel-showcase-container { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 24px; }
.wb-carousel-showcase-stage {
  perspective: 1200px;
  position: relative;
  min-height: 440px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wb-carousel-showcase-card {
  position: absolute;
  width: min(480px, 85vw);
  border-radius: var(--wb-radius, 20px);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.wb-showcase-center {
  z-index: 3;
  transform: scale(1) translateZ(0);
  opacity: 1;
  box-shadow: 0 24px 52px -12px rgba(0, 0, 0, 0.22);
}
.wb-showcase-left {
  z-index: 2;
  transform: translateX(-48%) scale(0.86) rotateY(8deg);
  opacity: 0.65;
  filter: blur(0.5px);
}
.wb-showcase-right {
  z-index: 2;
  transform: translateX(48%) scale(0.86) rotateY(-8deg);
  opacity: 0.65;
  filter: blur(0.5px);
}
.wb-showcase-hidden {
  z-index: 1;
  opacity: 0;
  pointer-events: none;
  transform: scale(0.7);
}
.wb-carousel-showcase-media { aspect-ratio: 16 / 9; overflow: hidden; }
.wb-carousel-showcase-img { width: 100%; height: 100%; object-fit: cover; }
.wb-carousel-showcase-info { padding: 22px; display: flex; flex-direction: column; gap: 8px; }
.wb-carousel-showcase-title { font-size: 20px; font-weight: 700; margin: 0; }
.wb-carousel-showcase-desc { font-size: 14px; line-height: 1.5; color: var(--wb-muted); margin: 0; }
.wb-carousel-showcase-btn { margin-top: 10px; }
.wb-carousel-showcase-nav { display: flex; align-items: center; gap: 16px; }
.wb-carousel-counter { font-family: ui-monospace, monospace; font-size: 14px; font-weight: 600; color: var(--wb-muted); }

/* Minimal Editorial Slide Deck */
.wb-carousel-editorial-container { width: 100%; }
.wb-carousel-editorial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}
.wb-carousel-editorial-left { display: flex; flex-direction: column; gap: 20px; }
.wb-carousel-editorial-header { display: flex; align-items: center; gap: 14px; }
.wb-carousel-editorial-num { font-family: ui-monospace, monospace; font-size: 15px; font-weight: 700; color: var(--wb-primary); }
.wb-carousel-editorial-tag {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-primary) 10%, transparent);
  color: var(--wb-primary);
}
.wb-carousel-editorial-body { display: flex; flex-direction: column; gap: 12px; }
.wb-carousel-editorial-sub { font-size: 15px; font-weight: 600; color: var(--wb-primary); margin: 0; }
.wb-carousel-editorial-title { font-size: clamp(28px, 4vw, 38px); font-weight: 800; line-height: 1.2; margin: 0; }
.wb-carousel-editorial-desc { font-size: 16px; line-height: 1.65; color: var(--wb-muted); margin: 0; }
.wb-carousel-editorial-actions { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
.wb-carousel-editorial-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; gap: 16px; }
.wb-carousel-editorial-dots { display: flex; align-items: center; gap: 8px; flex: 1; }
.wb-carousel-editorial-tab {
  flex: 1;
  max-width: 60px;
  height: 24px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.wb-tab-line {
  width: 100%;
  height: 3px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--wb-text) 18%, transparent);
  transition: all 0.3s ease;
}
.wb-carousel-editorial-tab.wb-tab-active .wb-tab-line {
  background: var(--wb-primary);
  height: 4px;
}
.wb-carousel-editorial-right { border-radius: var(--wb-radius, 20px); overflow: hidden; aspect-ratio: 4 / 3; }
.wb-carousel-editorial-img { width: 100%; height: 100%; object-fit: cover; }

/* Aspect ratio helper utilities */
.wb-aspect-16-9 { aspect-ratio: 16 / 9; }
.wb-aspect-4-3 { aspect-ratio: 4 / 3; }
.wb-aspect-1-1 { aspect-ratio: 1 / 1; }
.wb-aspect-21-9 { aspect-ratio: 21 / 9; }
.wb-aspect-3-4 { aspect-ratio: 3 / 4; }

/* =========================================================================
   VARIANT 5: IMAGE GALLERY CAROUSEL
   ========================================================================= */
.wb-carousel-gallery-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.wb-carousel-gallery-viewport {
  position: relative;
  width: 100%;
  border-radius: var(--wb-radius, 20px);
  overflow: hidden;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}
.wb-carousel-gallery-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  transform: scale(1.03);
}
.wb-carousel-gallery-slide.wb-gallery-slide-active {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
  z-index: 1;
}
.wb-carousel-gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}
.wb-carousel-gallery-viewport:hover .wb-carousel-gallery-img {
  transform: scale(1.04);
}
.wb-carousel-gallery-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.2) 40%, rgba(0, 0, 0, 0.05) 100%);
  pointer-events: none;
}
.wb-carousel-gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: clamp(20px, 3vw, 32px);
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 680px;
}
.wb-carousel-gallery-caption-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.wb-carousel-gallery-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--wb-primary);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 9999px;
}
.wb-carousel-gallery-counter {
  font-size: 12px;
  font-weight: 700;
  font-family: var(--wb-font-mono, monospace);
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  padding: 3px 9px;
  border-radius: 9999px;
}
.wb-carousel-gallery-title {
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.25;
}
.wb-carousel-gallery-desc {
  font-size: 14.5px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}
.wb-carousel-gallery-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.wb-carousel-gallery-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 4;
  pointer-events: none;
}
.wb-carousel-gallery-arrow-btn {
  pointer-events: auto;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.wb-carousel-gallery-arrow-btn:hover {
  background: var(--wb-primary);
  border-color: var(--wb-primary);
  transform: scale(1.08);
}
.wb-carousel-gallery-dots {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 4;
}
.wb-carousel-gallery-thumbs-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px;
  scrollbar-width: none;
}
.wb-carousel-gallery-thumbs-strip::-webkit-scrollbar { display: none; }
.wb-carousel-thumb-btn {
  flex: 0 0 76px;
  height: 52px;
  border-radius: var(--wb-radius-sm, 10px);
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0;
  background: var(--wb-surface);
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.25s ease;
}
.wb-carousel-thumb-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
.wb-carousel-thumb-btn.wb-thumb-active {
  opacity: 1;
  border-color: var(--wb-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--wb-primary) 30%, transparent);
}
.wb-carousel-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* =========================================================================
   VARIANT 6: IMAGE STRIP CAROUSEL
   ========================================================================= */
.wb-carousel-strip-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.wb-carousel-strip-track-container {
  overflow: hidden;
  width: 100%;
}
.wb-carousel-strip-wrapper {
  --wb-strip-visible: var(--wb-strip-cols, 3);
  --wb-strip-offset: min(var(--wb-strip-index, 0), max(0, var(--wb-strip-count, 1) - var(--wb-strip-visible)));
}
.wb-carousel-strip-track {
  display: flex;
  transform: translateX(calc(var(--wb-strip-offset) * -100% / var(--wb-strip-visible)));
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}
.wb-carousel-strip-item {
  flex: 0 0 calc(100% / var(--wb-strip-visible));
  width: calc(100% / var(--wb-strip-visible));
  min-width: 0;
  padding: 0 8px;
  box-sizing: border-box;
}
.wb-carousel-strip-fits .wb-carousel-strip-controls { display: none; }
@container wb-site (max-width: 900px) {
  .wb-carousel-strip-wrapper { --wb-strip-visible: min(var(--wb-strip-cols, 3), 2); }
  .wb-carousel-strip-fits .wb-carousel-strip-controls { display: flex; }
}
@container wb-site (max-width: 600px) {
  .wb-carousel-strip-wrapper { --wb-strip-visible: 1; }
  .wb-carousel-strip-item { padding: 0 4px; }
}
.wb-carousel-strip-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.wb-carousel-strip-card:hover {
  transform: translateY(-4px);
}
.wb-carousel-strip-media {
  position: relative;
  border-radius: var(--wb-radius, 16px);
  overflow: hidden;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}
.wb-carousel-strip-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.wb-carousel-strip-card:hover .wb-carousel-strip-img {
  transform: scale(1.06);
}
.wb-carousel-strip-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  color: #ffffff;
  padding: 4px 9px;
  border-radius: 9999px;
  z-index: 2;
  max-width: calc(100% - 20px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wb-carousel-strip-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 60%);
  pointer-events: none;
}
.wb-carousel-strip-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.wb-carousel-strip-sub {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--wb-primary);
  margin: 0;
}
.wb-carousel-strip-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--wb-text);
  margin: 0;
  line-height: 1.3;
}
.wb-carousel-strip-desc {
  font-size: 13.5px;
  color: var(--wb-muted);
  margin: 0;
  line-height: 1.5;
}

/* =========================================================================
   VARIANT 7: COVERFLOW 3D IMAGE REEL
   ========================================================================= */
.wb-carousel-coverflow-container {
  position: relative;
  width: 100%;
  perspective: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  overflow: hidden;
  padding: 24px 0;
}
.wb-carousel-coverflow-stage {
  position: relative;
  height: 380px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wb-carousel-coverflow-card {
  position: absolute;
  width: min(480px, 75vw);
  border-radius: var(--wb-radius, 20px);
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.25);
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
}
.wb-carousel-coverflow-card.wb-coverflow-center {
  transform: translate3d(0, 0, 0) scale(1.05);
  z-index: 5;
  opacity: 1;
  border-color: color-mix(in srgb, var(--wb-primary) 50%, var(--wb-border));
}
.wb-carousel-coverflow-card.wb-coverflow-left {
  transform: translate3d(-55%, 0, -100px) rotateY(25deg) scale(0.85);
  z-index: 3;
  opacity: 0.6;
}
.wb-carousel-coverflow-card.wb-coverflow-right {
  transform: translate3d(55%, 0, -100px) rotateY(-25deg) scale(0.85);
  z-index: 3;
  opacity: 0.6;
}
.wb-carousel-coverflow-card.wb-coverflow-hidden {
  transform: translate3d(0, 0, -200px) scale(0.6);
  opacity: 0;
  pointer-events: none;
}
.wb-carousel-coverflow-media {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.wb-carousel-coverflow-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.wb-carousel-coverflow-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--wb-primary);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 9999px;
  z-index: 2;
}
.wb-carousel-coverflow-meta {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.wb-carousel-coverflow-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.wb-carousel-coverflow-sub {
  font-size: 13.5px;
  color: var(--wb-muted);
  margin: 0;
}
.wb-carousel-coverflow-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 6;
}

/* =========================================================================
   MARQUEE SECTION
   ========================================================================= */
.wb-section.wb-marquee {
  position: relative;
  overflow: hidden;
  width: 100% !important;
  max-width: 100% !important;
  padding: 32px 0 !important;
}
.wb-section.wb-marquee > .wb-container,
.wb-section.wb-marquee > .wb-container-full {
  max-width: 100% !important;
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Header if specified */
.wb-marquee-header-wrapper {
  max-width: 1200px;
  width: calc(100% - 48px);
  margin-left: auto;
  margin-right: auto;
  padding: 0 24px;
  margin-bottom: 28px;
}
.wb-marquee-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--wb-primary);
  margin-bottom: 8px;
}

/* Hard reset for inherited global .wb-icon styling inside Marquee */
.wb-marquee .wb-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border-radius: 0 !important;
  color: inherit !important;
  box-shadow: none !important;
}
.wb-marquee .wb-icon svg {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  margin: 0 !important;
}

.wb-marquee-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
  width: 100%;
}
.wb-marquee-track-wrapper {
  display: flex;
  overflow: hidden;
  width: 100%;
  user-select: none;
}
.wb-marquee-track {
  display: flex;
  align-items: center;
  gap: 24px;
  width: max-content;
  will-change: transform;
}
.wb-marquee-item-wrapper {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

@keyframes wb-marquee-scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes wb-marquee-scroll-right {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

.wb-marquee-dir-left .wb-marquee-track {
  animation: wb-marquee-scroll-left var(--wb-marquee-dur, 22s) linear infinite;
}
.wb-marquee-dir-right .wb-marquee-track {
  animation: wb-marquee-scroll-right var(--wb-marquee-dur, 22s) linear infinite;
}

.wb-marquee-speed-slow { --wb-marquee-dur: 42s; }
.wb-marquee-speed-normal { --wb-marquee-dur: 24s; }
.wb-marquee-speed-fast { --wb-marquee-dur: 14s; }

.wb-marquee-pause-hover:hover .wb-marquee-track {
  animation-play-state: paused;
}

/* Edge Masking Fades */
.wb-marquee-fade-left {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: clamp(48px, 10vw, 160px);
  background: linear-gradient(90deg, var(--wb-bg, #ffffff) 0%, transparent 100%);
  pointer-events: none;
  z-index: 5;
}
.wb-marquee-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: clamp(48px, 10vw, 160px);
  background: linear-gradient(270deg, var(--wb-bg, #ffffff) 0%, transparent 100%);
  pointer-events: none;
  z-index: 5;
}

/* Text Ticker Item */
.wb-marquee-text-block {
  display: inline-flex;
  align-items: center;
  gap: 24px;
  white-space: nowrap;
}
.wb-marquee-text-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--wb-primary);
  flex-shrink: 0;
}
.wb-marquee-text { font-weight: 800; color: var(--wb-text); }
.wb-marquee-font-small .wb-marquee-text { font-size: 18px; }
.wb-marquee-font-medium .wb-marquee-text { font-size: 28px; }
.wb-marquee-font-large .wb-marquee-text { font-size: 42px; letter-spacing: -0.02em; }
.wb-marquee-font-huge .wb-marquee-text { font-size: 60px; letter-spacing: -0.03em; }

.wb-marquee-text-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-primary) 12%, transparent);
  color: var(--wb-primary);
  border: 1px solid color-mix(in srgb, var(--wb-primary) 24%, transparent);
  line-height: 1;
}
.wb-marquee-separator-icon {
  width: 16px;
  height: 16px;
  color: var(--wb-primary);
  opacity: 0.8;
  flex-shrink: 0;
}

/* Cards Stream Item */
.wb-marquee-card {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  border-radius: var(--wb-radius, 14px);
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  box-shadow: 0 3px 12px -3px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}
.wb-marquee-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--wb-primary) 40%, var(--wb-border));
  box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.09);
}
.wb-marquee-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--wb-primary) 12%, transparent);
  color: var(--wb-primary);
  flex-shrink: 0;
}
.wb-marquee-card-icon .wb-icon {
  width: 18px !important;
  height: 18px !important;
}
.wb-marquee-card-content { display: flex; flex-direction: column; gap: 3px; }
.wb-marquee-card-badge {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--wb-primary);
  line-height: 1;
}
.wb-marquee-card-title { font-size: 14.5px; font-weight: 700; color: var(--wb-text); margin: 0; line-height: 1.25; }
.wb-marquee-card-sub { font-size: 12px; color: var(--wb-muted); margin: 0; line-height: 1.25; }

/* Pill Badges Item (Pixel-Perfect 2026 Layout) */
.wb-marquee-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 42px;
  padding: 0 18px;
  border-radius: 9999px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  color: var(--wb-text);
  white-space: nowrap;
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  cursor: default;
  flex-shrink: 0;
}
.wb-marquee-pill:hover {
  border-color: color-mix(in srgb, var(--wb-primary) 40%, var(--wb-border));
  background: color-mix(in srgb, var(--wb-primary) 4%, var(--wb-surface));
  transform: translateY(-2px);
  box-shadow: 0 6px 18px -4px rgba(0, 0, 0, 0.08);
}
.wb-marquee-pill-icon {
  width: 17px;
  height: 17px;
  min-width: 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--wb-primary);
  flex-shrink: 0;
  line-height: 1;
  margin: 0;
}
.wb-marquee-pill-text {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1;
  color: var(--wb-text);
  letter-spacing: -0.01em;
}
.wb-marquee-pill-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-primary) 12%, transparent);
  color: var(--wb-primary);
  border: 1px solid color-mix(in srgb, var(--wb-primary) 22%, transparent);
  line-height: 1;
  text-transform: uppercase;
}

@container wb-site (min-width: 901px) {
  .wb-mobile-toggle-btn { display: none !important; }
}

/* Tablet */
@container wb-site (max-width: 900px) {
  .wb-split-grid { grid-template-columns: 1fr; gap: 40px; }
  .wb-split-left .wb-split-media, .wb-hero-split-left .wb-hero-media { order: 0; }
  .wb-stat dd { font-size: 36px; }
  .wb-site h1 { font-size: 38px; }
  .wb-site h2 { font-size: 28px; }
  .wb-grid { grid-template-columns: repeat(var(--wb-cols-tablet, 2), minmax(0, 1fr)); }
  .wb-hero-split .wb-hero-grid, .wb-hero-split-left .wb-hero-grid, .wb-hero-asymmetric .wb-hero-grid, .wb-contact-grid { grid-template-columns: 1fr; gap: 40px; }
  .wb-hero-floating-cards .wb-hero-grid { grid-template-columns: 1fr; gap: 40px; }
  .wb-hero-floating-cards .wb-floating-card-wrap { padding: 0; }
  .wb-hero-floating-cards .wb-floating-card-wrap img { aspect-ratio: 4 / 3; }
  .wb-hero-floating-cards-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
  .wb-hero-floating-card { position: static; animation: none; box-shadow: none; }
  .wb-features-split-container { grid-template-columns: 1fr !important; gap: 40px; }
  .wb-features-split-title { font-size: 32px; }
  .wb-feature-card-stacked { padding: 20px 22px; gap: 16px; }
  .wb-footer-grid { grid-template-columns: repeat(2, 1fr); }
  .wb-footer-mega-grid, .wb-footer-split-grid, .wb-footer-newsletter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
  .wb-footer-mega-grid > .wb-footer-about, .wb-footer-split-grid > .wb-footer-about, .wb-footer-newsletter-grid > .wb-footer-about { grid-column: 1 / -1; }
  
  /* Header Tablet Responsive */
  .wb-nav, .wb-nav-left, .wb-header-cta,
  .wb-dock-nav, .wb-dock-status, .wb-dock-cmd-btn, .wb-utility-topbar,
  .wb-mega-nav,
  .wb-console-nav, .wb-console-status-pill, .wb-console-search-pill { display: none !important; }
  .wb-mobile-toggle-btn { display: inline-flex !important; }
  .wb-header-inner { justify-content: space-between; }
  .wb-header-floating-pill { padding: 6px 16px; min-height: 52px; width: 100%; justify-content: space-between; }
  .wb-dock-bar { width: 100%; justify-content: space-between; padding: 6px 16px; }
}

/* Mobile */
@container wb-site (max-width: 600px) {
  .wb-site h1 { font-size: 32px; }
  .wb-site h2 { font-size: 25px; }
  .wb-section { padding: calc(var(--wb-section-y) * 0.6) 0; }
  .wb-container { padding: 0 16px; }
  .wb-grid { grid-template-columns: repeat(var(--wb-cols-mobile, 1), minmax(0, 1fr)); gap: 16px; }
  .wb-hide-mobile { display: none; }
  .wb-nav, .wb-nav-left, .wb-header-cta,
  .wb-dock-nav, .wb-dock-status, .wb-dock-cmd-btn, .wb-utility-topbar,
  .wb-mega-nav,
  .wb-console-nav, .wb-console-status-pill, .wb-console-search-pill { display: none !important; }
  .wb-mobile-toggle-btn { display: inline-flex !important; }
  .wb-header-centered .wb-header-inner { flex-direction: row; padding: 0 16px; }
  .wb-dock-bar { width: 100%; justify-content: space-between; padding: 6px 14px; }
  .wb-hero-sub, .wb-section-head p, .wb-cta p { font-size: 17px; }
  .wb-section-head { margin-bottom: 32px; }
  .wb-footer-grid { grid-template-columns: 1fr; gap: 28px; }
  .wb-footer-mega-grid, .wb-footer-split-grid, .wb-footer-newsletter-grid { grid-template-columns: minmax(0, 1fr); gap: 28px; }
  .wb-newsletter-form { max-width: none; }
  .wb-footer-cta-card { padding: 24px 20px; margin-bottom: 32px; }
  .wb-actions .wb-btn { flex: 1 1 100%; }
  .wb-member-photo { width: 96px; height: 96px; }
  .wb-service-body { padding: 24px 20px; }
  .wb-contact-form-wrapper { padding: 24px 18px; }

  /* Mobile Full-width Drawer */
  .wb-drawer-panel { width: 100% !important; max-width: 100% !important; border-radius: 0; }
  .wb-drawer-header { padding: 14px 16px; min-height: 58px; }
  .wb-drawer-body { padding: 18px 16px 28px; }
}

/* =========================================================================
   CUSTOM SECTION (AI-composed block layouts)
   ========================================================================= */
.wb-section.wb-custom-wide > .wb-container { max-width: min(1400px, 100%); }
.wb-custom-root { display: flex; flex-direction: column; gap: 32px; }
.wb-custom-align-center .wb-custom-root { align-items: center; text-align: center; }

.wb-cb-stack { display: flex; flex-direction: column; min-width: 0; }
.wb-cb-stack.wb-cb-align-start { align-items: flex-start; }
.wb-cb-stack.wb-cb-align-center { align-items: center; text-align: center; }
.wb-cb-stack.wb-cb-align-end { align-items: flex-end; text-align: right; }
.wb-cb-stack.wb-cb-row { flex-direction: row; flex-wrap: wrap; align-items: center; }
.wb-cb-row.wb-cb-align-start { justify-content: flex-start; }
.wb-cb-row.wb-cb-align-center { justify-content: center; }
.wb-cb-row.wb-cb-align-end { justify-content: flex-end; }
.wb-cb-gap-sm { gap: 8px; }
.wb-cb-gap-md { gap: 16px; }
.wb-cb-gap-lg { gap: 32px; }

.wb-cb-grid { display: grid; width: 100%; grid-template-columns: repeat(var(--wb-cb-cols, 2), minmax(0, 1fr)); }
.wb-cb-valign-start { align-items: start; }
.wb-cb-valign-center { align-items: center; }

.wb-cb-card {
  display: flex; flex-direction: column; gap: 14px; min-width: 0;
  padding: 28px; border-radius: var(--wb-radius);
  background: var(--wb-bg); color: var(--wb-text); border: 1px solid var(--wb-border);
}
.wb-site.wb-cards-shadow .wb-cb-card { box-shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px rgb(0 0 0 / 0.08); }
.wb-cb-card-muted { background: var(--wb-surface); }
.wb-bg-surface .wb-cb-card-muted { background: var(--wb-bg); }
.wb-cb-card-primary { background: var(--wb-primary); color: var(--wb-on-primary); border-color: transparent; }
.wb-cb-card-primary .wb-muted, .wb-cb-card-primary .wb-cb-badge { color: inherit; }
.wb-cb-card-primary .wb-btn-primary { background: var(--wb-on-primary); color: var(--wb-primary); border-color: var(--wb-on-primary); }
.wb-cb-card-glass {
  background: color-mix(in srgb, var(--wb-bg) 55%, transparent);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 12px 32px -12px rgb(0 0 0 / 0.18);
}

.wb-cb-heading { max-width: 22ch; }
.wb-cb-align-center > .wb-cb-heading, .wb-custom-align-center .wb-cb-heading { margin-inline: auto; }
.wb-cb-text { max-width: 65ch; }
.wb-cb-text-sm { font-size: 14px; }
.wb-cb-text-md { font-size: 16px; }
.wb-cb-text-lg { font-size: 19px; }
.wb-cb-badge {
  display: inline-flex; align-items: center; width: fit-content;
  padding: 4px 12px; border-radius: 9999px;
  font-size: 13px; font-weight: 600; line-height: 1.4;
  color: var(--wb-primary); background: color-mix(in srgb, var(--wb-primary) 12%, transparent);
}
.wb-cb-image { width: 100%; border-radius: var(--wb-radius); object-fit: cover; }
.wb-cb-aspect-square { aspect-ratio: 1 / 1; }
.wb-cb-aspect-video { aspect-ratio: 16 / 9; }
.wb-cb-aspect-portrait { aspect-ratio: 3 / 4; }
.wb-cb-icon .wb-icon { margin-bottom: 0; }
.wb-cb-list { display: flex; flex-direction: column; gap: 10px; text-align: left; }
.wb-cb-list li { position: relative; padding-left: 26px; }
.wb-cb-list li::before {
  content: "✓"; position: absolute; left: 0; top: 0;
  font-weight: 700; color: var(--wb-primary);
}
.wb-cb-card-primary .wb-cb-list li::before { color: inherit; }

@container wb-site (max-width: 900px) {
  .wb-cb-grid { grid-template-columns: repeat(var(--wb-cb-cols-tablet, 2), minmax(0, 1fr)); }
}
@container wb-site (max-width: 600px) {
  .wb-cb-grid { grid-template-columns: minmax(0, 1fr); }
  .wb-cb-gap-lg { gap: 24px; }
  .wb-cb-card { padding: 22px; }
  .wb-cb-row > .wb-btn { flex: 1 1 100%; }
}
${AUTH_CSS}
${BLOG_CSS}
${PREMIUM_HEADER_CSS}
${CONTACT_BUILDER_CSS}
${HERO_CONTROLS_CSS}
${CARDS_CSS}
${SHOP_CSS}
${ACCOUNT_CSS}
${VINTAGE_CSS}
.wb-device-scroll {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
.wb-device-scroll::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}
@media (prefers-reduced-motion: reduce) {
  .wb-site *, .wb-site *::before, .wb-site *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
}

/* ---------------- Clapperboard Slate Contact (Vintage Reels ROLL CAMERA) ---------------- */
.wb-section.wb-clapper-contact-wrap {
  padding: 32px 0 72px;
  background: #0B0B0B;
  color: #EDE7DA;
}
.wb-clapper-container {
  display: flex;
  flex-direction: column;
}
.wb-clapper-grid {
  display: grid;
  grid-template-columns: 1.48fr 1fr;
  gap: 28px;
  align-items: flex-start;
  margin-top: 16px;
}
@media (max-width: 960px) {
  .wb-clapper-grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}
@container wb-site (max-width: 960px) {
  .wb-clapper-grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}

/* Clapperboard Slate Card */
.wb-clapper-card {
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
}

/* Zebra Stripes: slanted / at 45 degrees */
.wb-clapper-stripes {
  height: 26px;
  width: 100%;
  background: repeating-linear-gradient(
    -45deg,
    #F4F1EA,
    #F4F1EA 16px,
    #000000 16px,
    #000000 32px
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.wb-clapper-form {
  display: flex;
  flex-direction: column;
}
.wb-clapper-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.wb-clapper-cols-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 600px) {
  .wb-clapper-cols-2 {
    grid-template-columns: 1fr;
  }
}
@container wb-site (max-width: 600px) {
  .wb-clapper-cols-2 {
    grid-template-columns: 1fr;
  }
}
.wb-clapper-field {
  padding: 10px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.wb-clapper-field-border-r {
  border-right: 1px solid rgba(255, 255, 255, 0.12);
}
@media (max-width: 600px) {
  .wb-clapper-field-border-r {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }
}
@container wb-site (max-width: 600px) {
  .wb-clapper-field-border-r {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }
}

.wb-clapper-label {
  font-family: var(--vr-mono, monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #8E8A82;
  text-transform: uppercase;
}
.wb-clapper-input {
  background: transparent;
  border: none;
  outline: none;
  color: #FFFFFF;
  font-family: var(--vr-mono, monospace);
  font-size: 13.5px;
  padding: 0;
  width: 100%;
}
.wb-clapper-input:focus {
  outline: none;
}
.wb-clapper-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.wb-clapper-select {
  appearance: none;
  background: transparent;
  border: none;
  outline: none;
  color: #EDE7DA;
  font-family: var(--vr-mono, monospace);
  font-size: 13.5px;
  padding: 0 20px 0 0;
  width: 100%;
  cursor: pointer;
}
.wb-clapper-select option {
  background: #181818;
  color: #FFFFFF;
}
.wb-clapper-select-arrow {
  position: absolute;
  right: 0;
  pointer-events: none;
  color: #8E8A82;
  font-size: 14px;
}

/* Pills row */
.wb-clapper-pill-row {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.wb-clapper-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.wb-clapper-pill-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #EDE7DA;
  font-family: var(--vr-mono, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.wb-clapper-pill-btn:hover {
  border-color: rgba(255, 255, 255, 0.45);
  color: #FFFFFF;
}
.wb-clapper-pill-btn.active {
  background: rgba(255, 255, 255, 0.12);
  color: #FFFFFF;
  border-color: rgba(255, 255, 255, 0.55);
  font-weight: 700;
}

/* Textarea row */
.wb-clapper-textarea-row {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wb-clapper-textarea {
  background: transparent;
  border: none;
  outline: none;
  color: #FFFFFF;
  font-family: var(--vr-mono, monospace);
  font-size: 13px;
  line-height: 1.55;
  resize: vertical;
  min-height: 110px;
  padding: 0;
  width: 100%;
}
.wb-clapper-textarea::placeholder {
  color: #6E6962;
}
.wb-clapper-textarea:focus {
  outline: none;
}

/* Action bar */
.wb-clapper-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.wb-clapper-scene-tag {
  font-family: var(--vr-mono, monospace);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #8E8A82;
  text-transform: uppercase;
}
.wb-clapper-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 16px;
  border-radius: 2px;
  background: #E8402F;
  color: #FFFFFF;
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", sans-serif);
  font-size: 13.5px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}
.wb-clapper-submit-btn:hover {
  background: #FF4D3D;
  transform: translateY(-1px);
}

/* Success Slate */
.wb-clapper-success {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.wb-clapper-success-icon {
  font-size: 40px;
}
.wb-clapper-success-title {
  margin: 0;
  font-family: var(--vr-condensed, "Anton", "Bebas Neue", sans-serif);
  font-size: 32px;
  font-weight: 900;
  color: #FFFFFF;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.wb-clapper-success-desc {
  max-width: 440px;
  margin: 0;
  font-family: var(--vr-mono, monospace);
  font-size: 13.5px;
  line-height: 1.6;
  color: #BDB6A9;
}
.wb-clapper-reset-btn {
  margin-top: 10px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #FFFFFF;
  font-family: var(--vr-mono, monospace);
  font-size: 11px;
  padding: 8px 18px;
  border-radius: 2px;
  cursor: pointer;
}

/* RIGHT COLUMN: Production Details */
.wb-clapper-details {
  display: flex;
  flex-direction: column;
  padding-top: 0;
}
.wb-clapper-detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 13px 0 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.wb-clapper-detail-item:first-child {
  padding-top: 0;
}
.wb-clapper-detail-last {
  border-bottom: none;
  padding-bottom: 0;
}
.wb-clapper-detail-tag {
  font-family: var(--vr-mono, monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #FF3333;
  text-transform: uppercase;
}
.wb-clapper-detail-val {
  font-family: var(--vr-mono, monospace);
  font-size: 14.5px;
  font-weight: 500;
  color: #EDE7DA;
  text-decoration: none;
}
.wb-clapper-detail-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.15s ease;
}
.wb-clapper-detail-link:hover {
  color: var(--vr-gold, #E6AD4A);
}
.wb-clapper-contact-wrap .wb-vr-rec-text {
  color: #EDE7DA;
}
.wb-clapper-follow-row {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
}
.wb-clapper-follow-item {
  display: inline-flex;
  align-items: center;
}
.wb-clapper-follow-sep {
  color: #EDE7DA;
  user-select: none;
  margin: 0 4px;
}
`;
