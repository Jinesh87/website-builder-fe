/**
 * Gallery filter tabs and the "reveal" card style (dark overlay + centred title on hover,
 * slow photo zoom). Touch screens have no hover, so they show the title on a soft gradient.
 *
 * Interpolated into SITE_CSS, so it must not contain backticks or template placeholders.
 */
export const GALLERY_CSS = `
/* Photo shape and corners (live pages have no Tailwind utilities). */
.wb-gallery .wb-gallery-a-4x3 { aspect-ratio: 4 / 3; }
.wb-gallery .wb-gallery-a-1x1 { aspect-ratio: 1 / 1; }
.wb-gallery .wb-gallery-a-16x9 { aspect-ratio: 16 / 9; }
.wb-gallery .wb-gallery-a-3x4 { aspect-ratio: 3 / 4; }
.wb-gallery .wb-gallery-a-auto { aspect-ratio: auto; height: auto; }
.wb-gallery .wb-gallery-r-default { border-radius: var(--wb-radius); }
.wb-gallery .wb-gallery-r-soft { border-radius: 6px; }
.wb-gallery .wb-gallery-r-pill { border-radius: 24px; }
.wb-gallery .wb-gallery-r-sharp { border-radius: 0; }
.wb-gallery .wb-gallery-image-wrap img { display: block; }
.wb-gallery-overlay-layer {
  position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 16px; color: #fff;
  background: linear-gradient(to top, rgb(0 0 0 / 0.85), rgb(0 0 0 / 0.4) 50%, transparent);
}
.wb-gallery-overlay-layer span, .wb-gallery-overlay-layer p { color: #fff; }

.wb-gallery .wb-gallery-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 32px; }
.wb-gallery.wb-align-left .wb-gallery-tabs { justify-content: flex-start; }
.wb-gallery.wb-align-right .wb-gallery-tabs { justify-content: flex-end; }
.wb-gallery .wb-gallery-tab {
  padding: 7px 18px; border-radius: var(--wb-radius, 8px); border: 1px solid var(--wb-border);
  background: transparent; color: inherit; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.wb-gallery .wb-gallery-tab:hover { border-color: var(--wb-primary); color: var(--wb-primary); }
.wb-gallery .wb-gallery-tab.wb-gallery-tab-active { background: var(--wb-primary); border-color: var(--wb-primary); color: var(--wb-on-primary); }

.wb-gallery-reveal { box-shadow: 0 1px 2px rgb(0 0 0 / 0.06); transition: box-shadow 0.3s ease; }
.wb-gallery-reveal:hover, .wb-gallery-reveal:focus-within { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.12), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
.wb-gallery .wb-gallery-reveal img { transition: transform 0.7s ease; }
.wb-gallery-reveal:hover img, .wb-gallery-reveal:focus-within img { transform: scale(1.1); }
.wb-gallery-reveal-layer {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; padding: 16px; text-align: center; color: #fff; background: rgb(0 0 0 / 0.6);
  opacity: 0; transition: opacity 0.3s ease;
}
.wb-gallery-reveal:hover .wb-gallery-reveal-layer, .wb-gallery-reveal:focus-within .wb-gallery-reveal-layer { opacity: 1; }
.wb-gallery-reveal-title { font-weight: 700; font-size: 18px; line-height: 1.3; color: #fff; }
.wb-gallery-reveal-desc {
  font-size: 13px; line-height: 1.45; color: rgb(255 255 255 / 0.85); max-width: 32ch;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden;
}
@media (hover: none) {
  .wb-gallery-reveal-layer { opacity: 1; justify-content: flex-end; background: linear-gradient(to top, rgb(0 0 0 / 0.7), transparent 60%); }
  .wb-gallery-reveal-desc { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .wb-gallery .wb-gallery-reveal img, .wb-gallery-reveal-layer { transition: none; }
  .wb-gallery-reveal:hover img { transform: none; }
}
`;
