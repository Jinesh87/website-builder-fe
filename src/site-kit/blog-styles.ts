/**
 * Stylesheet for Blog Cards Grid & 10 Modern Blog Detail Page Layouts.
 * Scoped under `.wb-site` to integrate seamlessly with the theme engine.
 */
export const BLOG_CSS = `
/* ==========================================================================
   BLOG CARDS & GRID SECTION (THE KINDSIGHT BLOG STYLE & BEYOND)
   ========================================================================== */
.wb-blog-section {
  padding: var(--wb-section-y, 60px) 0;
  width: 100%;
}

.wb-blog-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 40px;
}

.wb-blog-eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--wb-primary);
  margin-bottom: 8px;
}

.wb-blog-title {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--wb-text);
  line-height: 1.15;
  margin-bottom: 14px;
}

.wb-blog-subtitle {
  font-size: 18px;
  color: var(--wb-muted);
  line-height: 1.6;
}

/* Category Filter Tabs */
.wb-blog-filters {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 28px 0 44px;
}

.wb-blog-filter-btn {
  padding: 7px 18px;
  border-radius: 9999px;
  font-size: 13.5px;
  font-weight: 500;
  border: 1px solid var(--wb-border);
  background: var(--wb-surface, #ffffff);
  color: var(--wb-muted);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.wb-blog-filter-btn:hover {
  color: var(--wb-text);
  border-color: var(--wb-text);
}

.wb-blog-filter-btn.active {
  background: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff);
  border-color: var(--wb-primary);
  font-weight: 600;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--wb-primary) 30%, transparent);
}

/* Responsive Cards Grid */
.wb-blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  width: 100%;
}

.wb-blog-grid.cols-2 {
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
}

/* Blog Card */
.wb-blog-card {
  display: flex;
  flex-direction: column;
  background: var(--wb-surface, #ffffff);
  border: 1px solid var(--wb-border);
  border-radius: var(--wb-radius, 14px);
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
  position: relative;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.wb-blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px -8px color-mix(in srgb, var(--wb-text) 8%, transparent);
  border-color: color-mix(in srgb, var(--wb-primary) 40%, var(--wb-border));
}

.wb-blog-card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: color-mix(in srgb, var(--wb-text) 5%, transparent);
}

.wb-blog-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.wb-blog-card:hover .wb-blog-card-img {
  transform: scale(1.05);
}

.wb-blog-card-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  color: #18181b;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.wb-blog-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 22px 20px 20px;
}

.wb-blog-card-category {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--wb-primary);
  margin-bottom: 8px;
}

.wb-blog-card-title {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--wb-text);
  margin-bottom: 10px;
  letter-spacing: -0.01em;
  transition: color 0.15s ease;
}

.wb-blog-card:hover .wb-blog-card-title {
  color: var(--wb-primary);
}

.wb-blog-card-excerpt {
  font-size: 14px;
  color: var(--wb-muted);
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wb-blog-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--wb-border) 60%, transparent);
  font-size: 12.5px;
  color: var(--wb-muted);
}

.wb-blog-card-author-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wb-blog-card-author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  object-fit: cover;
}

.wb-blog-card-read-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--wb-primary);
  transition: transform 0.15s ease;
}

.wb-blog-card:hover .wb-blog-card-read-more {
  transform: translateX(3px);
}

/* Newsletter Card within Grid */
.wb-blog-newsletter-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: color-mix(in srgb, var(--wb-primary) 6%, var(--wb-surface));
  border: 1px dashed color-mix(in srgb, var(--wb-primary) 35%, transparent);
  border-radius: var(--wb-radius, 14px);
  padding: 32px 28px;
  text-align: center;
}

.wb-blog-newsletter-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--wb-text);
  margin-bottom: 10px;
  line-height: 1.25;
}

.wb-blog-newsletter-desc {
  font-size: 14px;
  color: var(--wb-muted);
  line-height: 1.55;
  margin-bottom: 20px;
}

.wb-blog-newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wb-blog-newsletter-input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border-radius: var(--wb-radius, 8px);
  border: 1px solid var(--wb-border);
  background: var(--wb-bg, #ffffff);
  color: var(--wb-text);
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.15s ease;
}

.wb-blog-newsletter-input:focus {
  border-color: var(--wb-primary);
}

.wb-blog-newsletter-btn {
  height: 42px;
  border-radius: var(--wb-radius, 8px);
  background: var(--wb-primary);
  color: var(--wb-on-primary, #ffffff);
  font-size: 13.5px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.wb-blog-newsletter-btn:hover {
  opacity: 0.92;
}

/* ==========================================================================
   BLOG DETAIL BASE STYLES & COMMON PRIMITIVES
   ========================================================================== */
.wb-blog-detail {
  width: 100%;
  color: var(--wb-text);
  line-height: 1.75;
  font-size: 17px;
}

/* Category Tag Pill */
.wb-blog-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: color-mix(in srgb, var(--wb-primary) 12%, transparent);
  color: var(--wb-primary);
}

/* Meta Byline Row */
.wb-blog-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 13.5px;
  color: var(--wb-muted);
}

.wb-blog-meta-item {
  display: flex;
  flex-direction: column;
}

.wb-blog-meta-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--wb-muted);
  opacity: 0.75;
  margin-bottom: 2px;
}

.wb-blog-meta-val {
  font-weight: 600;
  color: var(--wb-text);
}

/* Sticky Social Share Dock */
.wb-blog-share-dock {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wb-blog-share-btn {
  width: 38px;
  height: 38px;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: var(--wb-surface, #ffffff);
  border: 1px solid var(--wb-border);
  color: var(--wb-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.wb-blog-share-btn:hover {
  color: var(--wb-primary);
  border-color: var(--wb-primary);
  transform: translateY(-2px);
}

/* Article Prose Typography */
.wb-blog-prose {
  font-size: 17px;
  line-height: 1.8;
  color: color-mix(in srgb, var(--wb-text) 90%, transparent);
}

.wb-blog-prose p {
  margin-bottom: 1.5em;
}

.wb-blog-prose h2 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--wb-text);
  margin-top: 2em;
  margin-bottom: 0.75em;
  line-height: 1.3;
}

.wb-blog-prose h3 {
  font-size: 21px;
  font-weight: 600;
  color: var(--wb-text);
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.35;
}

.wb-blog-blockquote {
  border-left: 3px solid var(--wb-primary);
  padding: 14px 20px;
  margin: 2em 0;
  font-style: italic;
  font-size: 19px;
  line-height: 1.6;
  color: var(--wb-text);
  background: color-mix(in srgb, var(--wb-primary) 5%, transparent);
  border-radius: 0 var(--wb-radius, 8px) var(--wb-radius, 8px) 0;
}

.wb-blog-callout {
  padding: 20px 24px;
  margin: 2em 0;
  border-radius: var(--wb-radius, 12px);
  background: color-mix(in srgb, var(--wb-primary) 7%, var(--wb-surface));
  border: 1px solid color-mix(in srgb, var(--wb-primary) 20%, transparent);
}

.wb-blog-callout-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--wb-primary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Tags Row */
.wb-blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2.5em;
  padding-top: 1.5em;
  border-top: 1px solid var(--wb-border);
}

.wb-blog-tag {
  font-size: 12.5px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--wb-text) 5%, transparent);
  color: var(--wb-muted);
  border: 1px solid var(--wb-border);
}

/* Author Bio Card */
.wb-blog-author-box {
  display: flex;
  gap: 18px;
  padding: 24px;
  border-radius: var(--wb-radius, 14px);
  background: var(--wb-surface, #ffffff);
  border: 1px solid var(--wb-border);
  margin-top: 3em;
  align-items: center;
}

.wb-blog-author-box-avatar {
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  object-fit: cover;
  flex-shrink: 0;
}

.wb-blog-author-box-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--wb-text);
  margin-bottom: 3px;
}

.wb-blog-author-box-role {
  font-size: 13px;
  color: var(--wb-primary);
  font-weight: 600;
  margin-bottom: 6px;
}

.wb-blog-author-box-bio {
  font-size: 13.5px;
  color: var(--wb-muted);
  line-height: 1.5;
}

/* ==========================================================================
   LAYOUT DESIGN 1: MINIMALIST EDITORIAL (ARKITECT STYLE)
   ========================================================================== */
.wb-blog-minimalist-editorial {
  padding: 48px 0 80px;
}

.wb-blog-minimalist-header {
  max-width: 840px;
  margin: 0 auto 36px;
  text-align: center;
}

.wb-blog-minimalist-title {
  font-size: clamp(34px, 5vw, 54px);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.18;
  margin: 18px 0 14px;
  color: var(--wb-text);
}

.wb-blog-minimalist-deck {
  font-size: 19px;
  color: var(--wb-muted);
  line-height: 1.6;
  margin-bottom: 28px;
}

.wb-blog-minimalist-meta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 36px;
  border-top: 1px solid var(--wb-border);
  border-bottom: 1px solid var(--wb-border);
  padding: 12px 32px;
}

.wb-blog-minimalist-hero-img-wrap {
  max-width: 1040px;
  margin: 0 auto 52px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 48px -12px rgba(0, 0, 0, 0.12);
}

.wb-blog-minimalist-hero-img {
  width: 100%;
  max-height: 580px;
  object-fit: cover;
}

.wb-blog-minimalist-body-wrap {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 48px;
}

@container wb-site (max-width: 768px) {
  .wb-blog-minimalist-body-wrap {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .wb-blog-share-dock {
    flex-direction: row;
    justify-content: center;
  }
}
@media (max-width: 768px) {
  .wb-blog-minimalist-body-wrap {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .wb-blog-share-dock {
    flex-direction: row;
    justify-content: center;
  }
}

/* ==========================================================================
   LAYOUT DESIGN 2: SPLIT HERO HEADER
   ========================================================================== */
.wb-blog-split-hero {
  padding: 40px 0 80px;
}

.wb-blog-split-banner {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 48px;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto 56px;
}

.wb-blog-split-title {
  font-size: clamp(32px, 4.5vw, 48px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 16px 0;
  color: var(--wb-text);
}

.wb-blog-split-deck {
  font-size: 18px;
  color: var(--wb-muted);
  line-height: 1.6;
  margin-bottom: 24px;
}

.wb-blog-split-author-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid var(--wb-border);
}

.wb-blog-split-author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  object-fit: cover;
}

.wb-blog-split-img-frame {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--wb-border);
}

.wb-blog-split-img {
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.wb-blog-split-body {
  max-width: 780px;
  margin: 0 auto;
}

@container wb-site (max-width: 860px) {
  .wb-blog-split-banner {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
@media (max-width: 860px) {
  .wb-blog-split-banner {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

/* ==========================================================================
   LAYOUT DESIGN 3: IMMERSIVE DARK FULL-BLEED HERO
   ========================================================================== */
.wb-blog-immersive-dark {
  padding: 0 0 80px;
}

.wb-blog-immersive-hero {
  position: relative;
  background: #09090b;
  color: #f4f4f5;
  padding: 96px 24px 72px;
  overflow: hidden;
  margin-bottom: 56px;
}

.wb-blog-immersive-hero-bg {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  object-fit: cover;
  width: 100%;
  height: 100%;
  filter: blur(16px);
  transform: scale(1.1);
}

.wb-blog-immersive-hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(9, 9, 11, 0.6) 0%, rgba(9, 9, 11, 0.95) 100%);
}

.wb-blog-immersive-hero-content {
  position: relative;
  max-width: 860px;
  margin: 0 auto;
  text-align: center;
}

.wb-blog-immersive-title {
  font-size: clamp(34px, 5.5vw, 56px);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.16;
  margin: 18px 0 16px;
  color: #ffffff;
}

.wb-blog-immersive-deck {
  font-size: 20px;
  color: #a1a1aa;
  line-height: 1.6;
  margin-bottom: 32px;
}

.wb-blog-immersive-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  padding: 8px 20px;
  border-radius: 9999px;
  font-size: 13px;
  color: #e4e4e7;
}

.wb-blog-immersive-featured-wrap {
  max-width: 960px;
  margin: 0 auto 48px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 50px -12px rgba(0, 0, 0, 0.25);
}

.wb-blog-immersive-featured-img {
  width: 100%;
  max-height: 520px;
  object-fit: cover;
}

.wb-blog-immersive-body {
  max-width: 760px;
  margin: 0 auto;
}

/* ==========================================================================
   LAYOUT DESIGN 4: MAGAZINE / GAZETTE CLASSIC
   ========================================================================== */
.wb-blog-magazine-classic {
  padding: 48px 0 80px;
}

.wb-blog-magazine-kicker {
  text-align: center;
  font-family: serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--wb-primary);
  margin-bottom: 12px;
}

.wb-blog-magazine-title {
  font-family: serif;
  font-size: clamp(36px, 5vw, 58px);
  font-weight: 700;
  text-align: center;
  line-height: 1.15;
  max-width: 900px;
  margin: 0 auto 16px;
  color: var(--wb-text);
  letter-spacing: -0.01em;
}

.wb-blog-magazine-deck {
  text-align: center;
  font-size: 19px;
  font-style: italic;
  color: var(--wb-muted);
  max-width: 740px;
  margin: 0 auto 28px;
}

.wb-blog-magazine-rule {
  width: 100%;
  max-width: 960px;
  height: 2px;
  background: var(--wb-text);
  margin: 0 auto 36px;
  position: relative;
}

.wb-blog-magazine-rule::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 4px;
  height: 1px;
  background: var(--wb-border);
}

.wb-blog-magazine-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 48px;
  max-width: 1060px;
  margin: 0 auto;
}

.wb-blog-magazine-sidebar {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.wb-blog-magazine-author-card {
  border: 1px solid var(--wb-border);
  padding: 20px;
  border-radius: var(--wb-radius, 8px);
  background: var(--wb-surface, #ffffff);
}

.wb-blog-magazine-main {
  min-width: 0;
}

@container wb-site (max-width: 820px) {
  .wb-blog-magazine-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
@media (max-width: 820px) {
  .wb-blog-magazine-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

/* ==========================================================================
   LAYOUT DESIGN 5: NEWSLETTER / SUBSTACK TECH STYLE
   ========================================================================== */
.wb-blog-newsletter-tech {
  padding: 48px 0 80px;
}

.wb-blog-tech-container {
  max-width: 760px;
  margin: 0 auto;
}

.wb-blog-tech-title {
  font-size: clamp(32px, 4.8vw, 48px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 12px;
  color: var(--wb-text);
}

.wb-blog-tech-deck {
  font-size: 19px;
  color: var(--wb-muted);
  line-height: 1.55;
  margin-bottom: 24px;
}

.wb-blog-tech-author-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid var(--wb-border);
  border-bottom: 1px solid var(--wb-border);
  margin-bottom: 36px;
}

.wb-blog-tech-author-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wb-blog-tech-avatar {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  object-fit: cover;
}

.wb-blog-tech-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--wb-text);
}

.wb-blog-tech-meta {
  font-size: 13px;
  color: var(--wb-muted);
}

.wb-blog-tech-img-wrap {
  margin-bottom: 36px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--wb-border);
}

.wb-blog-tech-img {
  width: 100%;
  max-height: 440px;
  object-fit: cover;
}

.wb-blog-tech-caption {
  font-size: 12.5px;
  font-style: italic;
  text-align: center;
  color: var(--wb-muted);
  margin-top: 8px;
}

/* ==========================================================================
   LAYOUT DESIGN 6: FLOATING OVERLAPPING CARD
   ========================================================================== */
.wb-blog-floating-card {
  padding: 0 0 80px;
}

.wb-blog-floating-hero {
  width: 100%;
  height: 440px;
  position: relative;
  overflow: hidden;
  background: #18181b;
}

.wb-blog-floating-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.88;
}

.wb-blog-floating-card-box {
  max-width: 860px;
  margin: -120px auto 48px;
  position: relative;
  z-index: 10;
  background: var(--wb-surface, #ffffff);
  border: 1px solid var(--wb-border);
  border-radius: 20px;
  padding: 40px 48px;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.wb-blog-floating-title {
  font-size: clamp(30px, 4.5vw, 46px);
  font-weight: 800;
  line-height: 1.2;
  margin: 16px 0 14px;
  color: var(--wb-text);
  letter-spacing: -0.02em;
}

.wb-blog-floating-body {
  max-width: 760px;
  margin: 0 auto;
}

@container wb-site (max-width: 640px) {
  .wb-blog-floating-card-box {
    margin: -60px 16px 36px;
    padding: 24px 20px;
  }
}
@media (max-width: 640px) {
  .wb-blog-floating-card-box {
    margin: -60px 16px 36px;
    padding: 24px 20px;
  }
}

/* ==========================================================================
   LAYOUT DESIGN 7: STICKY SIDEBAR (TOC + BIO)
   ========================================================================== */
.wb-blog-sticky-sidebar {
  padding: 48px 0 80px;
}

.wb-blog-sticky-header {
  max-width: 1060px;
  margin: 0 auto 36px;
}

.wb-blog-sticky-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 52px;
  max-width: 1060px;
  margin: 0 auto;
}

.wb-blog-sticky-side {
  position: sticky;
  top: 96px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.wb-blog-toc-widget {
  padding: 20px;
  border-radius: var(--wb-radius, 12px);
  background: color-mix(in srgb, var(--wb-text) 3%, var(--wb-surface));
  border: 1px solid var(--wb-border);
}

.wb-blog-toc-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--wb-muted);
  margin-bottom: 12px;
}

.wb-blog-toc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.wb-blog-toc-item {
  color: var(--wb-text);
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease;
}

.wb-blog-toc-item:hover {
  color: var(--wb-primary);
}

@container wb-site (max-width: 860px) {
  .wb-blog-sticky-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .wb-blog-sticky-side {
    position: static;
  }
}
@media (max-width: 860px) {
  .wb-blog-sticky-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .wb-blog-sticky-side {
    position: static;
  }
}

/* ==========================================================================
   LAYOUT DESIGN 8: SWISS BRUTALIST (HIGH CONTRAST BORDERS)
   ========================================================================== */
.wb-blog-swiss-brutalist {
  padding: 48px 0 80px;
}

.wb-blog-swiss-frame {
  max-width: 920px;
  margin: 0 auto;
  border: 2px solid var(--wb-text);
  background: var(--wb-surface, #ffffff);
}

.wb-blog-swiss-top {
  padding: 36px 36px 28px;
  border-bottom: 2px solid var(--wb-text);
}

.wb-blog-swiss-title {
  font-size: clamp(34px, 5vw, 52px);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 14px 0;
  color: var(--wb-text);
}

.wb-blog-swiss-table-meta {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 2px solid var(--wb-text);
}

.wb-blog-swiss-cell {
  padding: 12px 16px;
  border-right: 1px solid var(--wb-text);
}

.wb-blog-swiss-cell:last-child {
  border-right: none;
}

.wb-blog-swiss-cell-lbl {
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--wb-muted);
}

.wb-blog-swiss-cell-val {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--wb-text);
}

.wb-blog-swiss-img-wrap {
  border-bottom: 2px solid var(--wb-text);
}

.wb-blog-swiss-img {
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  border-radius: 0;
}

.wb-blog-swiss-body {
  padding: 40px 36px;
}

@container wb-site (max-width: 640px) {
  .wb-blog-swiss-table-meta {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 640px) {
  .wb-blog-swiss-table-meta {
    grid-template-columns: 1fr 1fr;
  }
}

/* ==========================================================================
   LAYOUT DESIGN 9: CINEMATIC VISUAL STORY / PHOTO ESSAY
   ========================================================================== */
.wb-blog-visual-story {
  padding: 32px 0 80px;
}

.wb-blog-visual-hero {
  position: relative;
  width: 100%;
  max-width: 1140px;
  margin: 0 auto 48px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 24px 60px -15px rgba(0, 0, 0, 0.2);
}

.wb-blog-visual-hero-img {
  width: 100%;
  aspect-ratio: 21 / 9;
  object-fit: cover;
  min-height: 360px;
}

.wb-blog-visual-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40px 48px;
  color: #ffffff;
}

.wb-blog-visual-title {
  font-size: clamp(32px, 4.5vw, 50px);
  font-weight: 800;
  line-height: 1.2;
  margin: 12px 0;
  color: #ffffff;
}

.wb-blog-visual-body {
  max-width: 780px;
  margin: 0 auto;
}

.wb-blog-visual-quote-breakout {
  margin: 3em -40px;
  padding: 36px 40px;
  background: color-mix(in srgb, var(--wb-primary) 8%, var(--wb-surface));
  border-radius: 16px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--wb-text);
}

@container wb-site (max-width: 768px) {
  .wb-blog-visual-hero-overlay {
    padding: 24px 20px;
  }
  .wb-blog-visual-quote-breakout {
    margin: 2em 0;
    padding: 24px;
    font-size: 19px;
  }
}
@media (max-width: 768px) {
  .wb-blog-visual-hero-overlay {
    padding: 24px 20px;
  }
  .wb-blog-visual-quote-breakout {
    margin: 2em 0;
    padding: 24px;
    font-size: 19px;
  }
}

/* ==========================================================================
   LAYOUT DESIGN 10: CREATIVE GLASSMORPHISM DECK
   ========================================================================== */
.wb-blog-glassmorphism-deck {
  padding: 56px 0 96px;
  position: relative;
  background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--wb-primary) 12%, transparent) 0%, transparent 60%);
}

.wb-blog-glass-card {
  max-width: 880px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 24px 60px -12px color-mix(in srgb, var(--wb-text) 10%, transparent);
  border-radius: 28px;
  padding: 48px 52px;
}

.wb-blog-glass-title {
  font-size: clamp(34px, 5vw, 52px);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.18;
  margin: 18px 0 14px;
  color: var(--wb-text);
}

.wb-blog-glass-featured-img {
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  border-radius: 18px;
  margin: 28px 0 36px;
  box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.1);
}

@container wb-site (max-width: 640px) {
  .wb-blog-glass-card {
    padding: 28px 20px;
    border-radius: 18px;
  }
}
@media (max-width: 640px) {
  .wb-blog-glass-card {
    padding: 28px 20px;
    border-radius: 18px;
  }
}
`;
