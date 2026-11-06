import type { CSSProperties } from "react";
import {
  BUTTON_RADIUS_DEFAULT,
  BUTTON_SHAPE_RADIUS,
  buttonShapeRadius,
  clampButtonRadius,
  isButtonShape,
} from "./button-shape.ts";
import {
  HERO_ALIGNS,
  type HeroAlign,
  type HeroAlignElement,
  type HeroData,
  type HeroVariant,
  type LinkRef,
  type SectionSettings,
} from "./types.ts";

type HeroMediaPlacement = NonNullable<HeroData["imagePosition"]>;

const SIDE_BY_SIDE_HERO_VARIANTS: readonly HeroVariant[] = [
  "split",
  "split-left",
  "asymmetric",
  "floating-cards",
];

const BACKGROUND_HERO_VARIANTS: readonly HeroVariant[] = ["background-image", "video-bg"];

/** Layouts that keep their own media treatment whatever placement is saved. */
const PLACEMENT_LOCKED_HERO_VARIANTS: readonly HeroVariant[] = [
  "soft-card",
  "curved-carousel",
  "campaign-banner",
  "vintage-editorial",
  "vintage-sunburst",
];

/** The hero variant whose layout matches a media placement, keeping the current variant when it already fits. */
export function heroVariantForPlacement(
  variant: HeroVariant,
  placement: HeroMediaPlacement,
): HeroVariant {
  if (PLACEMENT_LOCKED_HERO_VARIANTS.includes(variant)) return variant;
  const sideBySide = SIDE_BY_SIDE_HERO_VARIANTS.includes(variant);
  switch (placement) {
    case "left":
      return sideBySide && variant !== "split" ? variant : "split-left";
    case "right":
      return sideBySide && variant !== "split-left" ? variant : "split";
    case "background":
      return BACKGROUND_HERO_VARIANTS.includes(variant) ? variant : "background-image";
    case "bottom":
    case "card":
      return sideBySide || BACKGROUND_HERO_VARIANTS.includes(variant) ? "centered" : variant;
  }
}

/** The media placement that matches a newly picked hero variant, so the variant is not overridden by a stale placement. */
export function heroPlacementForVariant(
  variant: HeroVariant,
  placement: HeroData["imagePosition"],
): HeroData["imagePosition"] {
  if (PLACEMENT_LOCKED_HERO_VARIANTS.includes(variant)) return placement;
  if (variant === "split-left") return "left";
  if (SIDE_BY_SIDE_HERO_VARIANTS.includes(variant)) {
    return placement === "left" || placement === "right" ? placement : "right";
  }
  if (BACKGROUND_HERO_VARIANTS.includes(variant)) return "background";
  return placement && placement !== "card" ? "bottom" : placement;
}

/** The variant a hero renders with, so heroes saved with a mismatched variant and placement still lay out correctly. */
export function heroLayoutVariant(data: HeroData): HeroVariant {
  return data.imagePosition
    ? heroVariantForPlacement(data.variant, data.imagePosition)
    : data.variant;
}

const DEFAULT_DEMO_VIDEO_URL = "https://media.w3.org/2010/05/bunny/trailer.mp4";

export type HeroCtas = { primary?: LinkRef; secondary?: LinkRef; video?: LinkRef };

/**
 * The hero's action buttons. Only the three CTA fields the inspector toggles are
 * read, so turning a button off always removes it. Legacy `buttons` arrays fill
 * empty slots for sections the editor has not migrated yet.
 */
export function heroCtas(data: HeroData): HeroCtas {
  const primary = data.primaryCta ?? data.buttons?.[0];
  const secondary = data.secondaryCta ?? data.buttons?.[1];
  const tertiary = data.tertiaryCta;
  if (!tertiary) return { primary, secondary };
  if (tertiary.actionType === "link" || tertiary.actionType === "download") {
    return { primary, secondary, video: tertiary };
  }
  const hrefIsVideo = tertiary.href && tertiary.href !== "#" && tertiary.href !== "#demo";
  return {
    primary,
    secondary,
    video: {
      ...tertiary,
      actionType: "video",
      videoUrl: tertiary.videoUrl || (hrefIsVideo ? tertiary.href : DEFAULT_DEMO_VIDEO_URL),
    },
  };
}

/** Moves a legacy `buttons` array into the primary and secondary CTA fields the inspector edits. */
export function liftLegacyHeroButtons(data: HeroData): HeroData {
  if (!data.buttons) return data;
  const { buttons, ...rest } = data;
  const primaryCta = data.primaryCta ?? buttons[0];
  const secondaryCta = data.secondaryCta ?? buttons[1];
  return {
    ...rest,
    ...(primaryCta ? { primaryCta } : {}),
    ...(secondaryCta ? { secondaryCta } : {}),
  };
}

export type VintagePolaroid = NonNullable<HeroData["vintagePolaroids"]>[number];

/** The vintage editorial hero always shows two photos; heroes without both fall back to `image` and `secondaryImage`. */
export function vintageHeroPolaroids(data: HeroData): [VintagePolaroid, VintagePolaroid] {
  const saved = data.vintagePolaroids;
  if (saved && saved.length >= 2) return [saved[0]!, saved[1]!];
  return [
    {
      image: data.image ?? {
        url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
        alt: "Photographer with vintage camera",
      },
      caption: "Up for views, press 12",
      rotation: -3,
    },
    {
      image: data.secondaryImage ?? {
        url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
        alt: "Golden Hour Espresso Bar",
      },
      caption: "Golden Hour Espresso Bar",
      rotation: 4,
    },
  ];
}

export { clampButtonRadius };

export function isHeroAlign(value: unknown): value is HeroAlign {
  return typeof value === "string" && (HERO_ALIGNS as readonly string[]).includes(value);
}

export const isHeroButtonShape = isButtonShape;

/**
 * Alignment applied to every hero element. `undefined` keeps the layout's own
 * default, so heroes saved before these controls existed render unchanged.
 */
export function heroBaseAlign(data: HeroData, settings: SectionSettings): HeroAlign | undefined {
  const all = data.alignment?.all;
  if (isHeroAlign(all)) return all;
  if (isHeroAlign(data.contentAlign)) return data.contentAlign;
  if (isHeroAlign(settings.align)) return settings.align;

  // Layout default when no explicit alignment was set
  if (
    data.variant === "centered" ||
    data.variant === "gradient" ||
    data.variant === "curved-bottom" ||
    data.variant === "curved-carousel" ||
    data.variant === "minimal-typography"
  ) {
    return "center";
  }

  return undefined;
}

export function heroElementAlign(
  data: HeroData,
  element: HeroAlignElement,
  base: HeroAlign | undefined,
): HeroAlign | undefined {
  const own = data.alignment?.[element];
  return isHeroAlign(own) ? own : base;
}

/** Spread onto an element; renders nothing when no alignment is set. */
export function alignAttr(align: HeroAlign | undefined): { "data-wb-align"?: HeroAlign } {
  return align ? { "data-wb-align": align } : {};
}

export const HERO_BUTTON_RADIUS = BUTTON_SHAPE_RADIUS;

export const HERO_BUTTON_RADIUS_DEFAULT = BUTTON_RADIUS_DEFAULT;

export const heroButtonRadius = buttonShapeRadius;

type ButtonShapeProps = {
  className: string;
  style?: CSSProperties & Record<`--${string}`, string>;
};

export function heroButtonShapeProps(data: HeroData): ButtonShapeProps {
  const radius = heroButtonRadius(data.buttonShape, data.buttonRadius);
  if (!radius) return { className: "" };
  return {
    className: `wb-hero-btn-shaped wb-hero-btn-${data.buttonShape}`,
    style: { "--wb-hero-btn-radius": radius },
  };
}
