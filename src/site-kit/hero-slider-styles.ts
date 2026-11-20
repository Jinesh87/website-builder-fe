/**
 * Background image slider for the hero (HeroBackgroundSlider): each slide's photo fades in over the
 * dark media backdrop with a slow zoom; arrows sit at the sides and dots at the bottom centre.
 *
 * Interpolated into SITE_CSS, so it must not contain backticks or template placeholders.
 */
export const HERO_SLIDER_CSS = `
.wb-hero-slide-bg img { animation: wbHeroSlideIn 0.9s ease both, wbHeroSlideZoom 7s ease-out both; }
@keyframes wbHeroSlideIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes wbHeroSlideZoom { from { transform: scale(1.06); } to { transform: scale(1); } }

.wb-hero-slider-arrow {
  position: absolute; top: 50%; z-index: 3; transform: translateY(-50%);
  display: grid; place-items: center; width: 44px; height: 44px; padding: 0;
  border: 1px solid rgb(255 255 255 / 0.25); border-radius: 9999px;
  background: rgb(0 0 0 / 0.25); color: #fff; cursor: pointer;
  opacity: 0; transition: opacity 0.25s ease, background-color 0.2s ease;
}
.wb-hero-slider-prev { left: clamp(12px, 2vw, 28px); }
.wb-hero-slider-next { right: clamp(12px, 2vw, 28px); }
.wb-hero:hover .wb-hero-slider-arrow, .wb-hero-slider-arrow:focus-visible { opacity: 1; }
.wb-hero-slider-arrow:hover { background: rgb(0 0 0 / 0.45); }

.wb-hero-slider-dots {
  position: absolute; left: 50%; bottom: clamp(16px, 3vw, 32px); z-index: 3; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
}
.wb-hero-slider-dot {
  width: 8px; height: 8px; padding: 0; border: 0; border-radius: 9999px; cursor: pointer;
  background: rgb(255 255 255 / 0.5); transition: width 0.3s ease, background-color 0.3s ease;
}
.wb-hero-slider-dot:hover { background: rgb(255 255 255 / 0.8); }
.wb-hero-slider-dot.wb-hero-slider-dot-active { width: 28px; background: #fff; }

@media (hover: none) {
  .wb-hero-slider-arrow { opacity: 1; width: 38px; height: 38px; }
}
@media (prefers-reduced-motion: reduce) {
  .wb-hero-slide-bg img { animation: none; }
}
`;
