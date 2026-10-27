/**
 * Hero alignment and button-shape controls. The attributes and classes these
 * rules target are only rendered when set in the editor, so heroes without
 * them keep their layout defaults.
 *
 * Interpolated into SITE_CSS after the hero layout rules, so it must not
 * contain backticks or template placeholders.
 */
export const HERO_CONTROLS_CSS = `
/* Video banner: right alignment */
.wb-campaign-copy-wrap.wb-align-right { text-align: right; }
.wb-campaign-copy-wrap.wb-align-right .wb-campaign-subheading { margin-left: auto; margin-right: 0; }
.wb-campaign-actions.wb-align-right { justify-content: flex-end; }

/* Per-element alignment */
.wb-hero [data-wb-align="left"] { align-self: flex-start; text-align: left; margin-left: 0; margin-right: auto; }
.wb-hero [data-wb-align="center"] { align-self: center; text-align: center; margin-left: auto; margin-right: auto; }
.wb-hero [data-wb-align="right"] { align-self: flex-end; text-align: right; margin-left: auto; margin-right: 0; }

/* Copy block position in single-column layouts */
.wb-container > .wb-hero-copy[data-wb-content-align="left"],
.wb-hero-copy[data-wb-content-align="left"] { margin-left: 0; margin-right: auto; align-items: flex-start; text-align: left; }
.wb-container > .wb-hero-copy[data-wb-content-align="center"],
.wb-hero-copy[data-wb-content-align="center"] { margin-left: auto; margin-right: auto; align-items: center; text-align: center; }
.wb-container > .wb-hero-copy[data-wb-content-align="right"],
.wb-hero-copy[data-wb-content-align="right"] { margin-left: auto; margin-right: 0; align-items: flex-end; text-align: right; }

/* Button rows */
.wb-hero :is(.wb-hero-actions, .wb-hero-curved-actions, .wb-campaign-actions)[data-wb-align="left"] { justify-content: flex-start; }
.wb-hero :is(.wb-hero-actions, .wb-hero-curved-actions, .wb-campaign-actions)[data-wb-align="center"] { justify-content: center; }
.wb-hero :is(.wb-hero-actions, .wb-hero-curved-actions, .wb-campaign-actions)[data-wb-align="right"] { justify-content: flex-end; }

/* Trusted-by strip keeps its full-width divider line */
.wb-hero .wb-hero-trusted-by[data-wb-align] { align-self: stretch; margin-left: 0; margin-right: 0; }
.wb-hero .wb-hero-trusted-by[data-wb-align="left"] .wb-trusted-logos { justify-content: flex-start; }
.wb-hero .wb-hero-trusted-by[data-wb-align="center"] .wb-trusted-logos { justify-content: center; }
.wb-hero .wb-hero-trusted-by[data-wb-align="right"] .wb-trusted-logos { justify-content: flex-end; }
.wb-hero .wb-hero-trusted-by[data-wb-align="left"] .wb-trusted-label { text-align: left; }
.wb-hero .wb-hero-trusted-by[data-wb-align="center"] .wb-trusted-label { text-align: center; }
.wb-hero .wb-hero-trusted-by[data-wb-align="right"] .wb-trusted-label { text-align: right; }

/* 3D carousel: buttons sit outside the copy column, so keep them on the same column width */
.wb-hero .wb-hero-curved-actions[data-wb-align] { align-self: center; max-width: 860px; margin-left: auto; margin-right: auto; box-sizing: border-box; }
.wb-hero-curved-carousel .wb-hero-curved-title h1[data-wb-align="left"],
.wb-hero-curved-carousel .wb-hero-curved-sub[data-wb-align="left"] { text-align: left !important; margin-left: 0 !important; margin-right: auto !important; }
.wb-hero-curved-carousel .wb-hero-curved-title h1[data-wb-align="right"],
.wb-hero-curved-carousel .wb-hero-curved-sub[data-wb-align="right"] { text-align: right !important; margin-left: auto !important; margin-right: 0 !important; }

/* Video banner: per-element overrides */
.wb-hero .wb-campaign-eyebrow[data-wb-align] { display: block; width: fit-content; max-width: 100%; }
.wb-campaign-copy-wrap .wb-campaign-subheading[data-wb-align="left"] { margin-left: 0; margin-right: auto; }
.wb-campaign-copy-wrap .wb-campaign-subheading[data-wb-align="center"] { margin-left: auto; margin-right: auto; }
.wb-campaign-copy-wrap .wb-campaign-subheading[data-wb-align="right"] { margin-left: auto; margin-right: 0; }

/* Button shape (radius comes from the inline --wb-hero-btn-radius variable) */
.wb-hero.wb-hero-btn-shaped :is(.wb-btn, .wb-btn-video-play, .wb-campaign-btn-primary, .wb-campaign-btn-secondary, .wb-campaign-btn-donate, .wb-campaign-btn-register) {
  border-radius: var(--wb-hero-btn-radius, var(--wb-radius));
}
.wb-hero.wb-hero-btn-oval :is(.wb-btn, .wb-btn-video-play, .wb-campaign-btn-primary, .wb-campaign-btn-secondary, .wb-campaign-btn-donate, .wb-campaign-btn-register) {
  padding-left: 32px; padding-right: 32px;
}
`;
