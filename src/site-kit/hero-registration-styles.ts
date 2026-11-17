/**
 * Registration-form hero: headline, key-fact tiles and a checklist beside a
 * sign-up card. The copy column follows the section's text colour so it reads on
 * any background preset; the card keeps its own light palette so the form stays
 * legible on dark sections too.
 */
export const HERO_REGISTRATION_CSS = `
.wb-hero-registration-form .wb-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 480px);
  gap: 56px;
  align-items: start;
}
.wb-hero-registration-form .wb-hero-copy { gap: 22px; padding-top: 8px; min-width: 0; width: 100%; }
.wb-hero-reg-kicker {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--wb-hero-reg-accent, color-mix(in srgb, var(--wb-primary) 70%, currentColor));
}
.wb-hero-registration-form .wb-hero-badge {
  background: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff);
  border: 0;
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.wb-hero-registration-form h1 {
  font-size: clamp(34px, 4.6cqi, 56px);
  line-height: 1.08;
  letter-spacing: -0.03em;
}
.wb-hero-registration-form h1 .wb-text-gradient { display: block; }
/* Without custom gradient colours the highlighted words use a solid accent that reads on dark and light sections. */
.wb-hero-reg-solid-highlight h1 .wb-text-gradient {
  background: none;
  -webkit-text-fill-color: currentColor;
  color: var(--wb-hero-reg-accent, color-mix(in srgb, var(--wb-primary) 70%, currentColor));
}
.wb-hero-registration-form .wb-hero-sub { font-size: 18px; line-height: 1.7; max-width: 560px; }

.wb-hero-reg-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  align-self: stretch;
  max-width: 580px;
  margin: 0;
}
.wb-hero-reg-fact {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: 16px;
  background: color-mix(in srgb, currentColor 6%, transparent);
  border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  min-width: 0;
}
.wb-hero-reg-fact dt { font-size: 12.5px; font-weight: 600; opacity: 0.7; }
.wb-hero-reg-fact dd { margin: 0; font-size: 17px; font-weight: 700; overflow-wrap: anywhere; }
.wb-hero-reg-fact dd.is-highlight {
  font-size: 20px;
  font-weight: 800;
  color: var(--wb-hero-reg-accent, color-mix(in srgb, var(--wb-primary) 70%, currentColor));
}

.wb-hero-reg-checklist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.wb-hero-reg-checklist li { display: flex; align-items: flex-start; gap: 12px; font-size: 15.5px; line-height: 1.5; }
.wb-hero-reg-checklist svg {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--wb-hero-reg-accent, color-mix(in srgb, var(--wb-primary) 70%, currentColor));
}

.wb-hero-reg-card {
  --wb-bg: #f7f9fb;
  --wb-text: #0f1f33;
  --wb-muted: #5b6b7d;
  --wb-border: rgba(15, 31, 51, 0.14);
  position: relative;
  z-index: 2;
  background: #ffffff;
  color: var(--wb-text);
  border-radius: max(var(--wb-radius, 12px), 20px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  min-width: 0;
}
.wb-hero-reg-card-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 20px 28px;
  background: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff);
}
.wb-hero-reg-card-head strong { font-family: var(--wb-font-heading); font-size: 20px; font-weight: 800; line-height: 1.3; }
.wb-hero-reg-card-head span { font-size: 13.5px; opacity: 0.85; }
.wb-hero-reg-card-body { padding: 26px 28px 28px; }
.wb-hero-reg-card .wb-contact-form { gap: 18px; }
.wb-hero-reg-card .wb-contact-input { min-height: 48px; }
.wb-hero-reg-card .wb-contact-input:focus,
.wb-hero-reg-card .wb-contact-textarea:focus {
  border-color: var(--wb-primary);
  box-shadow: 0 0 0 1px var(--wb-primary);
}
.wb-hero-reg-card .wb-contact-chip span { background: #ffffff; color: var(--wb-text); padding: 9px 15px; }
.wb-hero-reg-card .wb-contact-chip input:checked + span {
  background: var(--wb-primary);
  border-color: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff);
}
.wb-hero-reg-card .wb-contact-form-footer { flex-direction: column; align-items: stretch; gap: 10px; }
.wb-hero-reg-card .wb-contact-submit-btn { width: 100%; min-height: 54px; font-size: 16px; }
.wb-hero-reg-card .wb-contact-submit-btn:where(:not(:disabled)) {
  background: var(--wb-hero-reg-submit, var(--wb-primary));
  border-color: var(--wb-hero-reg-submit, var(--wb-primary));
  color: #ffffff;
}
.wb-hero-reg-card .wb-contact-choice-group:has(.wb-contact-chip:only-child) legend {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
/* A single-option checkbox (e.g. consent) reads as a plain checkbox with its sentence, not a chip. */
.wb-hero-reg-card .wb-contact-chip:only-child { display: flex; align-items: flex-start; gap: 10px; }
.wb-hero-reg-card .wb-contact-chip:only-child input {
  position: static;
  opacity: 1;
  width: 20px;
  height: 20px;
  margin: 0;
  flex: 0 0 auto;
  accent-color: var(--wb-primary);
}
.wb-hero-reg-card .wb-contact-chip:only-child span,
.wb-hero-reg-card .wb-contact-chip:only-child input:checked + span {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: none;
  color: #3a4a5c;
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.5;
}
.wb-hero-reg-card .wb-contact-privacy-note { text-align: center; }
.wb-hero-reg-card .wb-contact-privacy-note:empty { display: none; }

@container wb-site (max-width: 900px) {
  .wb-hero-registration-form .wb-hero-grid { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .wb-hero-reg-card { max-width: 560px; width: 100%; }
}
@container wb-site (max-width: 480px) {
  .wb-hero-reg-card-head,
  .wb-hero-reg-card-body { padding-left: 20px; padding-right: 20px; }
}
`;
