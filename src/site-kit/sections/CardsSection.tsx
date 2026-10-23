import type { ReactNode } from "react";
import {
  CARDS_VARIANT_DEFAULTS,
  cardColorVars,
  cardsAspectRatios,
  cardsCornerRadius,
  clampDescriptionLines,
  resolveCardsButton,
  resolveCardsVariant,
  type CssVars,
  type ResolvedCardsButton,
} from "../cards-layout.ts";
import { gridStyle, parseRichText, SectionShell, SiteIcon, SiteImage, SiteLink } from "../primitives.tsx";
import type {
  CardItem,
  CardsButtonVariant,
  CardsData,
  CardsVariant,
  LinkRef,
  SectionOf,
} from "../types.ts";

function ArrowIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

type Display = {
  images: boolean;
  icons: boolean;
  badges: boolean;
  tags: boolean;
  description: boolean;
  prices: boolean;
  numbers: boolean;
  clampLines: number;
  clickable: boolean;
};

type CardContext = {
  variant: CardsVariant;
  display: Display;
  button: ResolvedCardsButton;
};

function CardButton({
  link,
  variant,
  button,
  stretch,
}: {
  link: LinkRef;
  variant: CardsButtonVariant;
  button: ResolvedCardsButton;
  stretch?: boolean;
}) {
  const className = [
    "wb-cardset-btn",
    `wb-cardset-btn-${variant}`,
    `wb-cardset-btn-${button.size}`,
    button.shape === "oval" && "wb-cardset-btn-oval",
    stretch && "wb-cardset-stretch",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <SiteLink link={link} className={className}>
      <span className="wb-cardset-btn-label">{link.label}</span>
      {button.showArrow && <ArrowIcon className="wb-cardset-btn-arrow" />}
    </SiteLink>
  );
}

function CardActions({ item, ctx }: { item: CardItem; ctx: CardContext }) {
  if (!item.link && !item.secondaryLink) return null;
  return (
    <div className={`wb-cardset-actions${ctx.button.fullWidth ? " wb-cardset-actions-block" : ""}`}>
      {item.link && (
        <CardButton link={item.link} variant={ctx.button.variant} button={ctx.button} stretch={ctx.display.clickable} />
      )}
      {item.secondaryLink && (
        <CardButton link={item.secondaryLink} variant={ctx.button.secondaryVariant} button={ctx.button} />
      )}
    </div>
  );
}

function CardBadge({ item, ctx, floating }: { item: CardItem; ctx: CardContext; floating?: boolean }) {
  if (!ctx.display.badges || !item.badge) return null;
  return <span className={`wb-cardset-badge${floating ? " wb-cardset-badge-floating" : ""}`}>{item.badge}</span>;
}

function CardMedia({ item, ctx, children }: { item: CardItem; ctx: CardContext; children?: ReactNode }) {
  if (!ctx.display.images || !item.image?.url) return null;
  return (
    <div className="wb-cardset-media">
      <SiteImage image={item.image} className="wb-cardset-img" contextText={item.title} />
      {children}
    </div>
  );
}

function CardMarker({ item, index, ctx }: { item: CardItem; index: number; ctx: CardContext }) {
  const showIcon = ctx.display.icons && Boolean(item.icon);
  if (!showIcon && !ctx.display.numbers) return null;
  return (
    <div className="wb-cardset-marker">
      {ctx.display.numbers && <span className="wb-cardset-number">{String(index + 1).padStart(2, "0")}</span>}
      {showIcon && item.icon && <SiteIcon name={item.icon} />}
    </div>
  );
}

function CardText({ item, ctx }: { item: CardItem; ctx: CardContext }) {
  const { display } = ctx;
  const hasTags = display.tags && item.tags && item.tags.length > 0;
  return (
    <>
      <div className="wb-cardset-titles">
        <h3 className="wb-cardset-title">{parseRichText(item.title)}</h3>
        {item.subtitle && <p className="wb-cardset-subtitle">{parseRichText(item.subtitle)}</p>}
      </div>
      {display.description && item.description && (
        <p className={`wb-cardset-desc${display.clampLines > 0 ? " wb-cardset-desc-clamped" : ""}`}>
          {parseRichText(item.description)}
        </p>
      )}
      {hasTags && (
        <ul className="wb-cardset-tags" aria-label="Tags">
          {item.tags!.map((tag, tagIndex) => (
            <li key={`${tag}-${tagIndex}`} className="wb-cardset-tag">
              {tag}
            </li>
          ))}
        </ul>
      )}
      {display.prices && item.price && <p className="wb-cardset-price">{item.price}</p>}
    </>
  );
}

function CardView({ item, index, ctx }: { item: CardItem; index: number; ctx: CardContext }) {
  const hasImage = ctx.display.images && Boolean(item.image?.url);
  const cardClass = [
    "wb-cardset-card",
    item.featured && "wb-cardset-featured",
    !hasImage && "wb-cardset-no-image",
  ]
    .filter(Boolean)
    .join(" ");
  const style = cardColorVars(item);

  switch (ctx.variant) {
    case "image-overlay":
      return (
        <article className={`${cardClass} wb-cardset-surface`} style={style}>
          <div className="wb-cardset-media wb-cardset-overlay-media">
            {hasImage && item.image && (
              <SiteImage image={item.image} className="wb-cardset-img" contextText={item.title} />
            )}
          </div>
          <div className="wb-cardset-overlay-content">
            <CardBadge item={item} ctx={ctx} />
            <CardText item={item} ctx={ctx} />
            <CardActions item={item} ctx={ctx} />
          </div>
        </article>
      );

    case "horizontal-split":
      return (
        <article className={`${cardClass} wb-cardset-surface`} style={style}>
          <CardMedia item={item} ctx={ctx}>
            <CardBadge item={item} ctx={ctx} floating />
          </CardMedia>
          <div className="wb-cardset-body">
            {!hasImage && <CardBadge item={item} ctx={ctx} />}
            <CardMarker item={item} index={index} ctx={ctx} />
            <CardText item={item} ctx={ctx} />
            <CardActions item={item} ctx={ctx} />
          </div>
        </article>
      );

    case "minimal-accent":
      return (
        <article className={`${cardClass} wb-cardset-surface`} style={style}>
          <div className="wb-cardset-body">
            <div className="wb-cardset-top">
              <CardMarker item={item} index={index} ctx={ctx} />
              <CardBadge item={item} ctx={ctx} />
            </div>
            <CardText item={item} ctx={ctx} />
            <CardActions item={item} ctx={ctx} />
          </div>
        </article>
      );

    case "floating-panel":
      return (
        <article className={cardClass} style={style}>
          <CardMedia item={item} ctx={ctx}>
            <CardBadge item={item} ctx={ctx} floating />
          </CardMedia>
          <div className="wb-cardset-panel wb-cardset-surface">
            {!hasImage && <CardBadge item={item} ctx={ctx} />}
            <CardMarker item={item} index={index} ctx={ctx} />
            <CardText item={item} ctx={ctx} />
            <CardActions item={item} ctx={ctx} />
          </div>
        </article>
      );

    case "product-classic":
      return (
        <article className={`${cardClass} wb-cardset-surface`} style={style}>
          <CardMedia item={item} ctx={ctx}>
            <CardBadge item={item} ctx={ctx} floating />
          </CardMedia>
          <div className="wb-cardset-body">
            {!hasImage && <CardBadge item={item} ctx={ctx} />}
            <CardMarker item={item} index={index} ctx={ctx} />
            <CardText item={item} ctx={ctx} />
          </div>
          {(item.link || item.secondaryLink) && (
            <div className="wb-cardset-footer">
              <CardActions item={item} ctx={ctx} />
            </div>
          )}
        </article>
      );
  }
}

function CardsHeader({ data, layout }: { data: CardsData; layout: NonNullable<CardsData["headerLayout"]> }) {
  if (!data.eyebrow && !data.heading && !data.intro && !data.headerLink) return null;
  return (
    <div className={`wb-cardset-head wb-cardset-head-${layout}`}>
      <div className="wb-cardset-head-copy">
        {data.eyebrow && <p className="wb-eyebrow">{parseRichText(data.eyebrow)}</p>}
        {data.heading && <h2 className="wb-cardset-heading">{parseRichText(data.heading)}</h2>}
        {data.intro && <p className="wb-muted wb-cardset-intro">{parseRichText(data.intro)}</p>}
      </div>
      {data.headerLink && (
        <SiteLink link={data.headerLink} className="wb-cardset-head-link">
          <span>{data.headerLink.label}</span>
          <ArrowIcon className="wb-cardset-head-arrow" />
        </SiteLink>
      )}
    </div>
  );
}

export default function CardsSection({ section }: { section: SectionOf<"cards"> }) {
  const { data, settings } = section;
  const variant = resolveCardsVariant(data.variant);
  const defaults = CARDS_VARIANT_DEFAULTS[variant];
  const button = resolveCardsButton(variant, data.button);
  const aspect = cardsAspectRatios(data.imageAspect ?? defaults.aspect);
  const cardRadius = cardsCornerRadius(data.cardCorners, data.cardRadius);
  const clampLines = clampDescriptionLines(data.descriptionLines, defaults.descriptionLines);
  const headerLayout = data.headerLayout ?? (settings.align === "left" ? "left" : "center");
  const mobileScroll = data.mobileLayout === "scroll";
  const items = data.items ?? [];

  const ctx: CardContext = {
    variant,
    button,
    display: {
      images: data.showImages !== false && variant !== "minimal-accent",
      icons: data.showIcons !== false,
      badges: data.showBadges !== false,
      tags: data.showTags !== false,
      description: data.showDescription !== false,
      prices: data.showPrices !== false,
      numbers: data.showNumbers === true,
      clampLines,
      clickable: data.clickableCards === true,
    },
  };

  const vars: CssVars = {};
  if (aspect.ratio) vars["--wb-cardset-ar"] = aspect.ratio;
  if (aspect.wide) vars["--wb-cardset-ar-wide"] = aspect.wide;
  if (cardRadius) vars["--wb-cardset-radius"] = cardRadius;
  if (button.radius) vars["--wb-cardset-btn-radius"] = button.radius;
  if (clampLines > 0) vars["--wb-cardset-lines"] = clampLines;

  const className = [
    "wb-cardset",
    `wb-cardset-v-${variant}`,
    `wb-cardset-style-${data.cardStyle ?? (variant === "minimal-accent" ? "flat" : "bordered")}`,
    `wb-cardset-hover-${data.hoverEffect ?? defaults.hover}`,
    `wb-cardset-gap-${data.gap ?? "md"}`,
    `wb-cardset-content-${data.contentAlign ?? "left"}`,
    data.imageFit === "contain" && "wb-cardset-fit-contain",
    variant === "horizontal-split" && data.imagePosition === "right" && "wb-cardset-media-right",
    ctx.display.clickable && "wb-cardset-clickable",
    mobileScroll && "wb-cardset-mobile-scroll",
  ]
    .filter(Boolean)
    .join(" ");

  const canSpan = variant === "floating-panel" && data.columns >= 3;

  return (
    <SectionShell
      sectionId={section.id}
      settings={settings}
      className={className}
      label={data.heading || "Cards"}
      style={vars}
    >
      <CardsHeader data={data} layout={headerLayout} />

      <ul
        className="wb-cardset-grid"
        style={gridStyle(data.columns, data.mobileColumns, data.tabletColumns)}
        {...(mobileScroll ? { tabIndex: 0, "aria-label": data.heading || "Cards" } : {})}
      >
        {items.map((item, index) => (
          <li
            key={index}
            className={`wb-cardset-cell${canSpan && item.featured ? " wb-cardset-span" : ""}`}
          >
            <CardView item={item} index={index} ctx={ctx} />
          </li>
        ))}
      </ul>

      {data.bottomCta && (
        <div className="wb-cardset-bottom">
          <SiteLink link={data.bottomCta} className="wb-btn wb-btn-primary" />
        </div>
      )}
    </SectionShell>
  );
}
