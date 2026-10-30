/** Customized contact form fields and the "custom" contact layout. */
export const CONTACT_BUILDER_CSS = `
.wb-contact-fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.wb-contact-field-full { grid-column: 1 / -1; }
.wb-contact-field-half { grid-column: span 1; }
.wb-contact-choice-group {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}
.wb-contact-field-label-legend {
  padding: 0;
  margin-bottom: 8px;
}
.wb-contact-required { color: var(--wb-primary); }
.wb-contact-chip input:focus-visible + span {
  outline: 2px solid var(--wb-primary);
  outline-offset: 2px;
}
.wb-contact-hp {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.wb-clapper-pill-btn { position: relative; display: inline-flex; align-items: center; }
.wb-clapper-pill-input {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 1px;
  height: 1px;
  margin: 0;
  opacity: 0;
  pointer-events: none;
}
.wb-clapper-pill-btn:has(.wb-clapper-pill-input:checked) {
  background: rgba(255, 255, 255, 0.12);
  color: #FFFFFF;
  border-color: rgba(255, 255, 255, 0.55);
  font-weight: 700;
}
.wb-clapper-pill-btn:has(.wb-clapper-pill-input:focus-visible) {
  outline: 2px solid #E8402F;
  outline-offset: 2px;
}
.wb-clapper-form[hidden],
.wb-clapper-success[hidden],
.wb-clapper-status[hidden] { display: none !important; }
.wb-clapper-status {
  margin: 0;
  padding: 10px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  font-family: var(--vr-mono, monospace);
  font-size: 12px;
  line-height: 1.5;
  color: #FF6B5B;
}
.wb-clapper-form .wb-clapper-submit-btn:disabled { opacity: 0.6; cursor: wait; transform: none; }
@container wb-site (max-width: 640px) {
  .wb-contact-fields-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 640px) {
  .wb-contact-fields-grid { grid-template-columns: minmax(0, 1fr); }
}

.wb-cl-grid {
  display: grid;
  grid-template-columns: var(--wb-cl-cols, minmax(0, 1fr));
}
.wb-cl-gap-sm { gap: 16px; }
.wb-cl-gap-md { gap: 28px; }
.wb-cl-gap-lg { gap: 48px; }
.wb-cl-align-start { align-items: start; }
.wb-cl-align-center { align-items: center; }
.wb-cl-align-stretch { align-items: stretch; }
.wb-cl-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.wb-cl-box {
  padding: 24px;
  border-radius: var(--wb-radius);
}
.wb-cl-col.wb-cl-box { padding: 32px 28px; }
.wb-cl-col .wb-contact-eyebrow-wrap { margin-bottom: 0; }
.wb-cl-heading {
  font-family: var(--wb-font-heading);
  color: var(--wb-text);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.wb-cl-heading-2 { font-size: clamp(28px, 3.4vw, 38px); font-weight: 800; }
.wb-cl-heading-3 { font-size: 22px; font-weight: 700; }
.wb-cl-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--wb-muted);
  white-space: pre-line;
}
.wb-cl-pre { white-space: pre-line; }
.wb-cl-info .wb-contact-icon-box .wb-icon {
  display: grid;
  width: auto;
  height: auto;
  margin: 0;
  background: transparent;
  color: var(--wb-text);
}
.wb-cl-info .wb-contact-icon-box .wb-icon svg { width: 18px; height: 18px; }
.wb-cl-info-plain {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
}
.wb-cl-map {
  width: 100%;
  overflow: hidden;
  border-radius: var(--wb-radius);
  border: 1px solid var(--wb-border);
  background: var(--wb-surface);
}
.wb-cl-map iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
.wb-cl-map-sm { height: 220px; }
.wb-cl-map-md { height: 320px; }
.wb-cl-map-lg { height: 440px; }
.wb-cl-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--wb-radius);
}
.wb-cl-divider {
  width: 100%;
  margin: 4px 0;
  border: 0;
  border-top: 1px solid var(--wb-border);
}
.wb-cl-button { display: flex; }
@container wb-site (max-width: 900px) {
  .wb-cl-grid { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .wb-cl-mobile-reverse { display: flex; flex-direction: column-reverse; align-items: stretch; }
  .wb-cl-col.wb-cl-box { padding: 24px 18px; }
}
@media (max-width: 900px) {
  .wb-cl-grid { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .wb-cl-mobile-reverse { display: flex; flex-direction: column-reverse; align-items: stretch; }
  .wb-cl-col.wb-cl-box { padding: 24px 18px; }
}
`;
