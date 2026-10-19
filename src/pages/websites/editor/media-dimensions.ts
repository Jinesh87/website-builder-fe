/**
 * Recommended upload sizes for each image/video slot, shown as a badge on the field.
 * Each is about 2× the largest size the slot is displayed at, so media stays sharp on retina screens,
 * with the aspect ratio the site-kit CSS crops it to.
 */

/** "1920 × 1080 px (16:9)" for a "16:9" aspect at 1920 px wide; anything unparseable gives just the width. */
export function sizeForAspect(aspect: string, width: number): string {
  const [ratioWidth, ratioHeight] = aspect.split(":").map(Number);
  if (!ratioWidth || !ratioHeight) return `${width} px wide`;
  return `${width} × ${Math.round((width * ratioHeight) / ratioWidth)} px (${aspect})`;
}

export const MEDIA_SIZE = {
  /** Edge-to-edge hero backgrounds, banners and background videos. */
  fullBleed: sizeForAspect("16:9", 1920),
  heroBelowCta: sizeForAspect("16:9", 2000),
  heroSplit: sizeForAspect("4:3", 1200),
  heroFloatingCard: sizeForAspect("4:5", 1000),
  /** Portrait cards of the 3D curved carousels (rendered at 240 × 350). */
  reelCard: "720 × 1050 px (portrait)",
  /** Shown up to 480 px wide at its natural height. */
  featuresMockup: sizeForAspect("4:3", 960),
  servicesShowcase: sizeForAspect("16:10", 1600),
  galleryImage: sizeForAspect("4:3", 1200),
  splitImage: sizeForAspect("4:3", 1200),
  /** Logo strips show logos 40 px tall. */
  logo: "240 × 80 px",
  avatar: sizeForAspect("1:1", 200),
  teamPortrait: "800 × 960 px (portrait)",
  blogCover: sizeForAspect("16:10", 1200),
  blogArticleCover: sizeForAspect("21:9", 2100),
  authPanel: sizeForAspect("4:3", 1600),
} as const;

export const MEDIA_HINT = {
  fullBleedVideo: "MP4 or WebM in 1080p, up to 50 MB. Keep background loops short (10–30 s); they play muted.",
  avatar: "Square photo with the face centred; shown as a circle.",
  logo: "Transparent PNG, SVG or WebP. Logos are scaled to the same height.",
  cropped: "Cropped to fit the chosen design, so keep the main subject centred.",
} as const;

/** Card-sized images (services, carousel cards) whose aspect the user picks. */
export function cardImageSize(aspect: string | undefined): string {
  return aspect && aspect !== "auto" ? sizeForAspect(aspect, 1200) : "1200 px wide (any ratio)";
}

/** Large images whose aspect the user picks (media section, image carousels). */
export function wideImageSize(aspect: string | undefined): string {
  return sizeForAspect(aspect ?? "16:9", aspect === "1:1" || aspect === "3:4" ? 1200 : 1920);
}

/** Hero foreground image: its size depends on where the layout places it. */
export function heroImageSize(variant: string | undefined, position: string | undefined): string {
  if (variant === "floating-cards") return MEDIA_SIZE.heroFloatingCard;
  if (position === "background") return MEDIA_SIZE.fullBleed;
  if (position === "left" || position === "right") return MEDIA_SIZE.heroSplit;
  return MEDIA_SIZE.heroBelowCta;
}

/** Custom-section image blocks use named aspects. */
const BLOCK_ASPECT: Record<string, string> = { square: "1:1", video: "16:9", portrait: "3:4" };

export function blockImageSize(aspect: string | undefined): string {
  const ratio = aspect ? BLOCK_ASPECT[aspect] : undefined;
  return ratio ? sizeForAspect(ratio, ratio === "16:9" ? 1600 : 1200) : "1600 px wide (any ratio)";
}
