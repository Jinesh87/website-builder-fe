/**
 * Vintage Reels design system (template 2143).
 * Every rule hangs off a vintage-only class, so other templates are unaffected.
 */
import type { FontKey } from "./fonts.ts";
import type { Section } from "./types.ts";

/** Fonts this stylesheet sets directly, so published pages must load them besides the theme fonts. */
export const VINTAGE_FONTS: readonly FontKey[] = ["playfair-display", "jetbrains-mono"];

const VINTAGE_VARIANTS = new Set([
  "vintage-editorial",
  "vintage-sunburst",
  "editorial-specs",
  "film-vault",
  "editorial-process",
  "colored-pillars",
  "polaroid-grid",
  "pull-quote",
  "vintage-journal",
  "vintage-story",
  "vintage-banner",
]);

export function usesVintageStyles(section: Section): boolean {
  const data = section.data as { variant?: unknown; imageStyle?: unknown };
  return (typeof data.variant === "string" && VINTAGE_VARIANTS.has(data.variant)) || data.imageStyle === "polaroid";
}

/** Device previews narrow the `wb-site` container, not the viewport, so each breakpoint needs both queries. */
function below(width: number, rules: string): string {
  return `@container wb-site (max-width: ${width}px) {${rules}}\n@media (max-width: ${width}px) {${rules}}`;
}

export const VINTAGE_CSS = `
.wb-site {
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

/* ---------------------------------------------------------------- Header */
.wb-header.wb-header-vintage-editorial {
  background: var(--vr-ink);
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
.wb-header-vintage-editorial .wb-nav a:hover { color: var(--vr-gold); }
.wb-header-vintage-editorial .wb-nav [data-wb-current] a { color: #FFFFFF; font-weight: 600; }
.wb-header-vintage-editorial .wb-nav [data-wb-current]::after {
  content: "";
  position: absolute;
  left: -8px;
  right: -8px;
  bottom: 14px;
  height: 2px;
  background: var(--vr-gold);
}
.wb-header-vintage-editorial .wb-header-cta .wb-btn {
  min-height: 36px;
  height: 36px;
  padding: 0 20px;
  border: 0;
  border-radius: 2px;
  background: var(--vr-gold);
  color: var(--vr-text);
  box-shadow: none;
  font-family: var(--wb-font-body);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.wb-header-vintage-editorial .wb-header-cta .wb-btn:hover { background: #F0BC5F; color: var(--vr-text); transform: none; }
${below(960, `
  .wb-header-vintage-editorial .wb-nav { position: static; transform: none; }
`)}

/* Issue strip under the header (Home hero) */
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
${below(768, `
  .wb-editorial-subbar { height: auto; padding: 10px 0; flex-direction: column; gap: 6px; }
  .wb-editorial-subbar > span, .wb-editorial-subbar > span:last-child { text-align: center; }
`)}

/* ------------------------------------------- Hero: "Old soul, new stories." */
.wb-section.wb-hero-vintage-editorial { padding: 0; min-height: 0; background: transparent; }
.wb-hero-vintage-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 428px;
  gap: 40px;
  padding: 45px 0 26px;
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
.wb-polaroid-card.card-top img { filter: sepia(0.75) contrast(1.05) brightness(0.95); }
.wb-polaroid-caption {
  margin-top: 7px;
  font-family: var(--vr-serif);
  font-size: 10px;
  font-style: italic;
  line-height: 1.2;
  color: #3A342C;
}
${below(960, `
  .wb-hero-vintage-grid { grid-template-columns: 1fr; }
  .wb-site .wb-vintage-hero-heading { font-size: clamp(56px, 13cqi, 101px); }
  .wb-polaroid-stack { width: 100%; max-width: 428px; margin: 0 auto; }
`)}

/* --------------------------------------- Services: "The specs" list */
.wb-section.wb-services-editorial-specs { padding: 40px 0 0; background: transparent; }
.wb-services-editorial-specs .wb-vr-eyebrow { padding-bottom: 22px; border-bottom: 1px solid rgba(29, 25, 16, 0.32); }
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
.wb-specs-stamp::after {
  content: attr(data-text);
  position: absolute;
  left: 9px;
  top: 9px;
  white-space: nowrap;
  color: var(--vr-red);
  opacity: 0.9;
  mix-blend-mode: multiply;
  pointer-events: none;
}
.wb-specs-desc { margin: 0; font-family: var(--wb-font-body); font-size: 12px; color: #4B453C; text-align: right; }
${below(768, `
  .wb-specs-row { grid-template-columns: 36px 1fr; height: auto; padding: 18px 0; }
  .wb-site .wb-specs-title { font-size: 30px; }
  .wb-specs-desc { grid-column: 2; text-align: left; }
`)}

/* ---------------------------------------------- Cards: film contact sheet */
.wb-section.wb-film-vault-wrap { padding: 80px 0 0; background: transparent; }
.wb-film-vault-box { margin-top: 22px; padding: 12px; background: #1D1A15; border-radius: 2px; }
.wb-film-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.wb-film-card { position: relative; overflow: hidden; aspect-ratio: 1 / 1; margin: 0; background: #000; }
.wb-film-card img { display: block; width: 100%; height: 100%; object-fit: cover; filter: sepia(0.3) saturate(0.85) brightness(0.85) contrast(1.05); transition: transform 0.4s ease; }
.wb-film-card:hover img { transform: scale(1.04); }
.wb-film-card::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.5) 100%);
}
.wb-film-frame-no {
  position: absolute;
  top: 9px;
  left: 10px;
  z-index: 2;
  font-family: var(--vr-mono);
  font-size: 7.5px;
  color: rgba(242, 238, 227, 0.85);
}
.wb-film-card:first-child::before {
  content: "";
  position: absolute;
  top: 11px;
  left: 30px;
  right: 10px;
  height: 3px;
  z-index: 2;
  background: repeating-linear-gradient(90deg, rgba(242, 238, 227, 0.8) 0 4px, transparent 4px 11px);
}
.wb-film-tape {
  position: absolute;
  left: 11px;
  bottom: 10px;
  z-index: 2;
  font-family: var(--vr-serif);
  font-size: 12px;
  font-style: italic;
  color: #F2EEE3;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
${below(900, `.wb-film-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }`)}

/* ------------------------------------------- Features: process columns */
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
${below(860, `.wb-process-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }`)}
${below(500, `.wb-process-grid { grid-template-columns: 1fr; }`)}

/* ------------------------------------------------- Text: pull quote */
.wb-section.wb-text-pull-quote { padding: 70px 0 0; background: transparent; }
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

/* ------------------------------------------------- Blog: journal cards */
.wb-section.wb-blog-vintage-journal { padding: 87px 0 80px; background: transparent; }
.wb-vr-journal-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 25px; margin-top: 22px; }
.wb-vr-journal-card { display: block; color: inherit; text-decoration: none; }
.wb-vr-journal-media { position: relative; overflow: hidden; aspect-ratio: 3 / 2; background: #1D1A15; }
.wb-vr-journal-media img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.wb-vr-journal-card:hover .wb-vr-journal-media img { transform: scale(1.04); }
.wb-vr-journal-card:first-child .wb-vr-journal-media::before {
  content: "";
  position: absolute;
  top: 6px;
  left: 6px;
  right: 6px;
  height: 3px;
  z-index: 1;
  background: repeating-linear-gradient(90deg, rgba(242, 238, 227, 0.8) 0 4px, transparent 4px 10px);
}
.wb-vr-journal-meta { display: block; margin-top: 9px; font-family: var(--vr-mono); font-size: 8.5px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--vr-red); }
.wb-site .wb-vr-journal-title {
  margin: 12px 0 0;
  font-family: var(--vr-serif);
  font-size: 21px;
  line-height: 24.5px;
  font-weight: 380;
  letter-spacing: -0.01em;
  color: var(--vr-text);
}
.wb-vr-journal-card:hover .wb-vr-journal-title { color: var(--vr-red); }
${below(860, `.wb-vr-journal-grid { grid-template-columns: 1fr; }`)}

/* ---------------------------------------------- CTA: "Have a story" */
.wb-section.wb-cta-vintage-story { padding: 76px 0; background: var(--vr-story); color: var(--vr-paper); text-align: center; }
.wb-site .wb-cta-story-heading {
  margin: 0;
  font-family: var(--vr-serif);
  font-size: 52px;
  line-height: 1.1;
  font-weight: 300;
  letter-spacing: -0.025em;
  color: var(--vr-paper);
}
.wb-cta-story-heading em { font-style: italic; color: #D0573A; }
.wb-cta-story-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  margin-top: 15px;
  padding: 0 24px;
  border-radius: 9999px;
  background: var(--vr-paper);
  color: var(--vr-text);
  font-family: var(--wb-font-body);
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}
.wb-cta-story-btn:hover { background: #FFFFFF; color: var(--vr-text); transform: translateY(-1px); }

/* --------------------------------------- Hero: sunburst (About page) */
.wb-section.wb-hero-sunburst-wrap { padding: 21px 0 0; min-height: 0; background: var(--vr-cream); }
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
  inset: 0;
  pointer-events: none;
  background: repeating-conic-gradient(from 0deg at 57% 50%, #F3CB7C 0deg 5deg, transparent 5deg 10deg);
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
${below(960, `
  .wb-hero-sunburst-card { grid-template-columns: 1fr; gap: 32px; padding: 48px 24px; }
  .wb-site .wb-sunburst-heading { font-size: clamp(48px, 12cqi, 83px); line-height: 0.96; }
  .wb-sunburst-portrait-wrap { justify-content: center; }
  .wb-sunburst-circle-frame { width: min(317px, 70cqi); height: min(317px, 70cqi); }
`)}

/* -------------------------------------- Split: studio polaroid (About) */
.wb-section.wb-split-vintage { padding: 70px 0 0; background: var(--vr-cream); }
.wb-split-vintage .wb-split-grid { grid-template-columns: 455px minmax(0, 1fr); gap: 47px; align-items: start; }
.wb-split-vintage .wb-split-copy { padding-top: 39px; text-align: left; }
.wb-split-vintage .wb-split-copy h2 {
  margin: 0;
  font-family: var(--vr-display);
  font-size: 59px;
  line-height: 61px;
  font-weight: 900;
  letter-spacing: -0.005em;
  color: #1F1610;
}
.wb-split-vintage .wb-split-copy p { max-width: 500px; margin: 22px 0 0; font-family: var(--wb-font-body); font-size: 15px; line-height: 25px; color: #5B4A3F; }
.wb-split-vintage .wb-split-copy p + p { margin-top: 12px; }
.wb-split-polaroid {
  position: relative;
  padding: 10px 10px 40px;
  background: #FFFDF8;
  box-shadow: 8px 9px 0 var(--vr-teal);
  transform: rotate(-2deg);
}
.wb-split-vintage .wb-split-media .wb-split-polaroid img { display: block; width: 100%; aspect-ratio: 4 / 3; border-radius: 0; object-fit: cover; filter: sepia(0.55) brightness(0.85) contrast(1.05); }
.wb-polaroid-tape-label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 9px;
  text-align: center;
  font-family: var(--vr-display);
  font-size: 16.5px;
  font-weight: 800;
  color: #1F1610;
}
${below(900, `
  .wb-split-vintage .wb-split-grid { grid-template-columns: 1fr; }
  .wb-split-vintage .wb-split-copy { padding-top: 16px; }
  .wb-split-vintage .wb-split-copy h2 { font-size: clamp(38px, 10cqi, 59px); line-height: 1.05; }
`)}

/* ----------------------------------- Features: "What drives us" pillars */
.wb-section.wb-colored-pillars-wrap { padding: 74px 0 73px; background: var(--vr-cream); }
.wb-site .wb-colored-pillars-title {
  margin: 0;
  font-family: var(--vr-display);
  font-size: 59.5px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.005em;
  color: #1F1610;
}
.wb-pillars-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 22px; }
.wb-pillar-card { min-height: 208px; padding: 30px 26px; border-radius: 14px; color: var(--vr-cream); transition: transform 0.25s ease; }
.wb-pillar-card:hover { transform: translateY(-3px); }
.wb-pillar-card.pillar-mission { background: #D95F31; }
.wb-pillar-card.pillar-vision { background: var(--vr-teal); }
.wb-pillar-card.pillar-values { background: var(--vr-plum); }
.wb-pillar-badge { display: block; font-family: var(--wb-font-body); font-size: 8px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.85; }
.wb-site .wb-pillar-heading { margin: 4px 0 0; font-family: var(--vr-display); font-size: 26.5px; line-height: 1.15; font-weight: 900; color: var(--vr-cream); }
.wb-pillar-text { margin: 5px 0 0; font-family: var(--wb-font-body); font-size: 13.5px; line-height: 23px; font-weight: 500; }
${below(860, `.wb-pillars-grid { grid-template-columns: 1fr; }`)}

/* ----------------------------------- Cards: polaroid band ("Why choose us") */
.wb-section.wb-polaroids-section { position: relative; padding: 95px 0 63px; background: var(--vr-brown); color: var(--vr-cream); }
.wb-scalloped-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 9px;
  background: radial-gradient(circle at 9px 0, var(--vr-cream) 8.5px, transparent 9px) 0 0 / 18px 9px repeat-x;
}
.wb-site .wb-polaroids-heading { margin: 0; font-family: var(--vr-display); font-size: 59.5px; line-height: 1; font-weight: 900; letter-spacing: -0.005em; color: var(--vr-cream); }
.wb-polaroids-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 19px; }
.wb-polaroid-grid-card { padding: 9px 9px 14px; background: #F5EACF; box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35); transition: transform 0.3s ease; }
.wb-polaroid-grid-card:nth-child(4n + 1) { transform: rotate(-1.5deg); }
.wb-polaroid-grid-card:nth-child(4n + 2) { transform: rotate(1deg); }
.wb-polaroid-grid-card:nth-child(4n + 3) { transform: rotate(-0.8deg); }
.wb-polaroid-grid-card:nth-child(4n + 4) { transform: rotate(1.4deg); }
.wb-polaroid-grid-card:hover { transform: translateY(-4px) rotate(0deg); }
.wb-polaroid-grid-img-wrap { position: relative; overflow: hidden; aspect-ratio: 3 / 3.88; background: #14100E; }
.wb-polaroid-grid-img-wrap img { display: block; width: 100%; height: 100%; object-fit: cover; }
.wb-polaroid-grid-card:nth-child(4n + 2) .wb-polaroid-grid-img-wrap::before {
  content: "";
  position: absolute;
  top: 6px;
  left: 6px;
  right: 6px;
  height: 3px;
  z-index: 1;
  background: repeating-linear-gradient(90deg, rgba(242, 238, 227, 0.8) 0 4px, transparent 4px 10px);
}
.wb-site .wb-polaroid-grid-title { margin: 12px 0 0; font-family: var(--vr-display); font-size: 20px; line-height: 1.2; font-weight: 900; color: #1F1610; }
.wb-polaroid-grid-desc { margin: 5px 0 0; font-family: var(--wb-font-body); font-size: 11.5px; line-height: 1.55; color: #4A3B30; }
${below(900, `.wb-polaroids-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }`)}
${below(500, `.wb-polaroids-grid { grid-template-columns: 1fr; }`)}

/* --------------------------------- CTA: "Let's make something timeless" */
.wb-section.wb-cta-vintage-banner { padding: 76px 0 69px; background: var(--vr-cream); }
.wb-cta-banner-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 227px;
  padding: 0 54px;
  border-radius: 20px;
  background: var(--vr-orange);
  color: var(--vr-cream);
}
.wb-site .wb-cta-banner-heading { margin: 0; font-family: var(--vr-display); font-size: 59.5px; line-height: 1.1; font-weight: 900; letter-spacing: -0.005em; color: var(--vr-cream); }
.wb-cta-banner-btn {
  display: inline-flex;
  align-items: center;
  height: 39px;
  margin-top: 18px;
  padding: 0 22px;
  border-radius: 9999px;
  background: #22160F;
  color: var(--vr-cream);
  font-family: var(--wb-font-body);
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease;
}
.wb-cta-banner-btn:hover { color: var(--vr-cream); transform: translateY(-1px); }
${below(640, `
  .wb-cta-banner-card { padding: 40px 24px; }
  .wb-site .wb-cta-banner-heading { font-size: 38px; }
`)}

/* ---------------------------------------------------------------- Footer */
.wb-site:has(.wb-header-vintage-editorial) .wb-footer {
  padding: 46px 0 0;
  border-top: 0;
  background: var(--vr-footer);
  color: #D9D3C7;
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
  margin-top: 3px;
  font-family: var(--vr-mono);
  font-size: 6.5px;
  font-weight: 600;
  letter-spacing: 0.32em;
  opacity: 1;
  color: var(--vr-gold);
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
${below(860, `
  .wb-site:has(.wb-header-vintage-editorial) .wb-footer-grid { grid-template-columns: 1fr 1fr; }
  .wb-site:has(.wb-header-vintage-editorial) .wb-footer-bottom { height: auto; padding: 16px 0; flex-direction: column; gap: 8px; }
`)}
`;
