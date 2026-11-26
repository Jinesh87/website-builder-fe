/**
 * Blog "Inset cards" layout (BlogData.variant = "inset-cards"): tinted cards with an inset cover photo,
 * accent category label, bold title, excerpt and a "Read article →" link. Colours follow the theme;
 * the Style tab's card colours (--wb-card-bg / --wb-card-text) override the card fill and text.
 */
export const BLOG_INSET_CSS = `
.wb-blog-inset {
  width: 100%;
}

.wb-blog-inset-header {
  max-width: 760px;
  margin: 0 0 36px;
}
.wb-blog-inset-header.wb-align-center { margin-left: auto; margin-right: auto; text-align: center; }
.wb-blog-inset-header.wb-align-right { margin-left: auto; text-align: right; }

.wb-blog-inset-eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--wb-secondary-ink, var(--wb-primary));
}

.wb-blog-inset-heading {
  margin: 0 0 12px;
  font-family: var(--wb-font-heading);
  font-size: clamp(30px, 4.4vw, 44px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--wb-text);
}

.wb-blog-inset-subtitle {
  margin: 0;
  font-size: 17px;
  line-height: 1.6;
  color: var(--wb-muted);
}

.wb-blog-inset-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
}
.wb-blog-inset-header.wb-align-center .wb-blog-inset-filters { justify-content: center; }
.wb-blog-inset-header.wb-align-right .wb-blog-inset-filters { justify-content: flex-end; }

.wb-blog-inset-filter {
  padding: 7px 16px;
  border: 1px solid var(--wb-border);
  border-radius: 999px;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--wb-text);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.wb-blog-inset-filter:hover { border-color: var(--wb-text); }
.wb-blog-inset-filter.active {
  background: var(--wb-text);
  border-color: var(--wb-text);
  color: var(--wb-bg);
}

.wb-blog-inset-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.wb-blog-inset-grid.cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }

.wb-blog-inset-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid var(--wb-border);
  border-radius: calc(var(--wb-radius, 12px) + 4px);
  background: var(--wb-card-bg, color-mix(in srgb, var(--wb-text) 4%, var(--wb-bg)));
  box-shadow: 0 1px 2px color-mix(in srgb, var(--wb-text) 6%, transparent);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.wb-blog-inset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -14px color-mix(in srgb, var(--wb-text) 30%, transparent);
}

.wb-blog-inset-media {
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--wb-radius, 8px);
  background: color-mix(in srgb, var(--wb-text) 12%, var(--wb-bg));
}
.wb-blog-inset-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.wb-blog-inset-card:hover .wb-blog-inset-img { transform: scale(1.03); }
.wb-blog-inset-placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: color-mix(in srgb, var(--wb-text) 35%, transparent);
}
.wb-blog-inset-placeholder svg { width: 28px; height: 28px; }

.wb-blog-inset-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-top: 22px;
  text-align: left;
}

.wb-blog-inset-category {
  margin-bottom: 10px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--wb-secondary-ink, var(--wb-primary));
}

.wb-blog-inset-title {
  margin: 0 0 12px;
  font-family: var(--wb-font-heading);
  font-size: 21px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--wb-card-text, var(--wb-text));
}
.wb-blog-inset-title a { color: inherit; text-decoration: none; }
.wb-blog-inset-title a:hover { color: var(--wb-primary); }

.wb-blog-inset-excerpt {
  flex: 1;
  margin: 0 0 18px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--wb-card-muted, var(--wb-muted));
}

.wb-blog-inset-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--wb-card-text, var(--wb-text));
  text-decoration: none;
}
.wb-blog-inset-link svg { width: 16px; height: 16px; transition: transform 0.15s ease; }
.wb-blog-inset-link:hover { color: var(--wb-primary); }
.wb-blog-inset-link:hover svg { transform: translateX(3px); }

@container wb-site (max-width: 960px) {
  .wb-blog-inset-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container wb-site (max-width: 620px) {
  .wb-blog-inset-grid,
  .wb-blog-inset-grid.cols-2 { grid-template-columns: 1fr; }
  .wb-blog-inset-card { padding: 18px; }
}
`;
