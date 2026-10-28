import type { ReactNode } from "react";
import FilmVaultReel from "./FilmVaultReel.tsx";
import {
  CARDS_VARIANT_DEFAULTS,
  cardColorVars,
  cardsAspectRatios,
  cardsCornerRadius,
  clampDescriptionLines,
  resolveCardsButton,
  resolveCardsIcon,
  resolveCardsVariant,
  type CssVars,
  type ResolvedCardsButton,
  type ResolvedCardsIcon,
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="4 11 8.5 15.5 16 6" />
    </svg>
  );
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  );
}

function resolveCardChecklist(item: CardItem): { text: string; icon?: string }[] {
  if (Array.isArray(item.checklist) && item.checklist.length > 0) {
    return item.checklist.map((c) => (typeof c === "string" ? { text: c } : c));
  }
  if (item.description && item.description.trim()) {
    const lines = item.description
      .split("\n")
      .map((l) => l.trim().replace(/^[-*•]\s*/, ""))
      .filter(Boolean);
    if (lines.length > 1) {
      return lines.map((text) => ({ text }));
    }
  }
  return [];
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
  icon: ResolvedCardsIcon;
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

function getCardIcon(item: CardItem, ctx: CardContext) {
  if (item.iconImage?.url) return { icon: undefined, iconImage: item.iconImage };
  if (item.icon && item.icon.trim()) return { icon: item.icon.trim(), iconImage: undefined };
  if (ctx.icon.defaultIcon && ctx.icon.defaultIcon.trim()) {
    return { icon: ctx.icon.defaultIcon.trim(), iconImage: undefined };
  }
  return { icon: undefined, iconImage: undefined };
}

function CardIconBadge({
  item,
  index,
  ctx,
  className = "",
}: {
  item: CardItem;
  index: number;
  ctx: CardContext;
  className?: string;
}) {
  if (!ctx.display.icons && !ctx.display.numbers) return null;
  const { icon, iconImage } = getCardIcon(item, ctx);
  const showIcon = ctx.display.icons && Boolean(icon || iconImage?.url);
  if (!showIcon && !ctx.display.numbers) return null;

  const badgeClass = [
    "wb-cardset-icon-badge",
    `wb-cardset-icon-v-${ctx.icon.variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={badgeClass}>
      {ctx.display.numbers && !showIcon && (
        <span className="wb-cardset-number">{String(index + 1).padStart(2, "0")}</span>
      )}
      {showIcon && <SiteIcon inline name={icon} image={iconImage} />}
    </div>
  );
}

function CardMarker({ item, index, ctx }: { item: CardItem; index: number; ctx: CardContext }) {
  if (!ctx.display.icons && !ctx.display.numbers) return null;
  const { icon, iconImage } = getCardIcon(item, ctx);
  const showIcon = ctx.display.icons && Boolean(icon || iconImage?.url);
  if (!showIcon && !ctx.display.numbers) return null;

  return (
    <div className={`wb-cardset-marker wb-cardset-marker-align-${ctx.icon.align}`}>
      {ctx.display.numbers && <span className="wb-cardset-number">{String(index + 1).padStart(2, "0")}</span>}
      {showIcon && <CardIconBadge item={item} index={index} ctx={ctx} />}
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
  const { icon, iconImage } = getCardIcon(item, ctx);
  const hasIcon = ctx.display.icons && Boolean(icon || iconImage?.url);
  const hasMarker = hasIcon || ctx.display.numbers;
  const isSeamIcon = ctx.icon.placement === "float-seam" && hasMarker;
  const isTopIcon = ctx.icon.placement === "float-top" && hasMarker;
  const isInlineIcon = !isSeamIcon && !isTopIcon && hasMarker;

  const cardClass = [
    "wb-cardset-card",
    item.featured && "wb-cardset-featured",
    !hasImage && "wb-cardset-no-image",
    isSeamIcon && hasImage && "wb-cardset-has-seam-icon",
  ]
    .filter(Boolean)
    .join(" ");
  const style = cardColorVars(item);

  switch (ctx.variant) {
    case "dos-donts": {
      const checklist = resolveCardChecklist(item);
      const isNegative =
        item.icon === "x" ||
        item.icon === "cross" ||
        /don'?t|avoid|cons|never/i.test(item.title) ||
        item.accentColor === "#ef4444" ||
        item.accentColor === "#dc2626";
      const defaultAccent = isNegative ? "#ef4444" : "#16a34a";
      const cardAccent = item.accentColor || defaultAccent;
      const customStyle = {
        ...style,
        "--wb-cardset-accent": cardAccent,
      } as CssVars;

      return (
        <article className={`${cardClass} wb-cardset-dos-donts-card wb-cardset-surface`} style={customStyle}>
          <div className="wb-cardset-dos-donts-top-bar" />
          <div className="wb-cardset-dos-donts-header">
            <div className={`wb-cardset-dos-donts-badge ${isNegative ? "wb-cardset-is-negative" : "wb-cardset-is-positive"}`}>
              {isNegative ? (
                <CrossIcon className="wb-cardset-dos-donts-badge-icon" />
              ) : (
                <CheckIcon className="wb-cardset-dos-donts-badge-icon" />
              )}
            </div>
            <h3 className="wb-cardset-dos-donts-title">{parseRichText(item.title)}</h3>
          </div>
          <div className="wb-cardset-dos-donts-divider" />
          <div className="wb-cardset-dos-donts-body">
            {item.description && checklist.length === 0 && (
              <p className="wb-cardset-desc">{parseRichText(item.description)}</p>
            )}
            {checklist.length > 0 && (
              <ul className="wb-cardset-checklist" aria-label={item.title}>
                {checklist.map((checkItem, checkIdx) => {
                  const itemIsCross =
                    checkItem.icon === "cross" ||
                    checkItem.icon === "x" ||
                    (checkItem.icon === undefined && isNegative);
                  return (
                    <li key={checkIdx} className="wb-cardset-checklist-item">
                      <span
                        className={`wb-cardset-checklist-icon-wrap ${itemIsCross ? "wb-cardset-is-negative" : "wb-cardset-is-positive"}`}
                        aria-hidden="true"
                      >
                        {itemIsCross ? (
                          <CrossIcon className="wb-cardset-checklist-icon" />
                        ) : (
                          <CheckIcon className="wb-cardset-checklist-icon" />
                        )}
                      </span>
                      <span className="wb-cardset-checklist-text">
                        {parseRichText(checkItem.text)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <CardActions item={item} ctx={ctx} />
          </div>
        </article>
      );
    }

    case "image-overlay":
      return (
        <article className={`${cardClass} wb-cardset-surface`} style={style}>
          <div className="wb-cardset-media wb-cardset-overlay-media">
            {hasImage && item.image && (
              <SiteImage image={item.image} className="wb-cardset-img" contextText={item.title} />
            )}
            {isTopIcon && (
              <div className={`wb-cardset-icon-float-top wb-cardset-icon-align-${ctx.icon.align}`}>
                <CardIconBadge item={item} index={index} ctx={ctx} />
              </div>
            )}
          </div>
          <div className="wb-cardset-overlay-content">
            <CardBadge item={item} ctx={ctx} />
            {(isInlineIcon || isSeamIcon) && <CardMarker item={item} index={index} ctx={ctx} />}
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
            {isTopIcon && (
              <div className={`wb-cardset-icon-float-top wb-cardset-icon-align-${ctx.icon.align}`}>
                <CardIconBadge item={item} index={index} ctx={ctx} />
              </div>
            )}
          </CardMedia>
          <div className="wb-cardset-body">
            {!hasImage && <CardBadge item={item} ctx={ctx} />}
            {(isInlineIcon || isSeamIcon || !hasImage) && <CardMarker item={item} index={index} ctx={ctx} />}
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
            {isTopIcon && (
              <div className={`wb-cardset-icon-float-top wb-cardset-icon-align-${ctx.icon.align}`}>
                <CardIconBadge item={item} index={index} ctx={ctx} />
              </div>
            )}
          </CardMedia>
          <div className="wb-cardset-panel wb-cardset-surface">
            {!hasImage && <CardBadge item={item} ctx={ctx} />}
            {isSeamIcon && hasImage && (
              <div className={`wb-cardset-panel-seam-icon wb-cardset-icon-align-${ctx.icon.align}`}>
                <CardIconBadge item={item} index={index} ctx={ctx} />
              </div>
            )}
            {(isInlineIcon || (isSeamIcon && !hasImage) || (isTopIcon && !hasImage)) && (
              <CardMarker item={item} index={index} ctx={ctx} />
            )}
            <CardText item={item} ctx={ctx} />
            <CardActions item={item} ctx={ctx} />
          </div>
        </article>
      );

    case "floating-icon":
      return (
        <article className={`${cardClass} wb-cardset-surface`} style={style}>
          <CardMedia item={item} ctx={ctx}>
            <CardBadge item={item} ctx={ctx} floating />
            {isTopIcon && (
              <div className={`wb-cardset-icon-float-top wb-cardset-icon-align-${ctx.icon.align}`}>
                <CardIconBadge item={item} index={index} ctx={ctx} />
              </div>
            )}
          </CardMedia>
          {isSeamIcon && hasImage && (
            <div className={`wb-cardset-seam-icon-row wb-cardset-icon-align-${ctx.icon.align}`}>
              <CardIconBadge item={item} index={index} ctx={ctx} />
            </div>
          )}
          <div className="wb-cardset-body">
            {!hasImage && <CardBadge item={item} ctx={ctx} />}
            {(isInlineIcon || (isSeamIcon && !hasImage) || (isTopIcon && !hasImage)) && (
              <CardMarker item={item} index={index} ctx={ctx} />
            )}
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
            {isTopIcon && (
              <div className={`wb-cardset-icon-float-top wb-cardset-icon-align-${ctx.icon.align}`}>
                <CardIconBadge item={item} index={index} ctx={ctx} />
              </div>
            )}
          </CardMedia>
          {isSeamIcon && hasImage && (
            <div className={`wb-cardset-seam-icon-row wb-cardset-icon-align-${ctx.icon.align}`}>
              <CardIconBadge item={item} index={index} ctx={ctx} />
            </div>
          )}
          <div className="wb-cardset-body">
            {!hasImage && <CardBadge item={item} ctx={ctx} />}
            {(isInlineIcon || (isSeamIcon && !hasImage) || (isTopIcon && !hasImage)) && (
              <CardMarker item={item} index={index} ctx={ctx} />
            )}
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
  const headerLayout = data.headerLayout ?? (settings.align === "right" ? "right" : settings.align === "left" ? "left" : "center");
  const mobileScroll = data.mobileLayout === "scroll";
  const items = data.items ?? [];

  if (data.variant === "film-vault") {
    return <FilmVaultReel sectionId={section.id} settings={settings} data={data} />;
  }

  if (data.variant === "polaroid-grid") {
    return (
      <SectionShell
        sectionId={section.id}
        settings={settings}
        className="wb-polaroids-section"
        label={data.heading || "Why choose us"}
        fullWidth
      >
        <div className="wb-scalloped-top" aria-hidden="true" />
        <div className="wb-container">
          {data.heading && (
            <h2 className="wb-polaroids-heading">{parseRichText(data.heading)}</h2>
          )}
          <div className="wb-polaroids-grid">
            {items.map((item, index) => (
              <div key={index} className="wb-polaroid-grid-card">
                {item.image && (
                  <div className="wb-polaroid-grid-img-wrap">
                    <SiteImage image={item.image} />
                  </div>
                )}
                <h3 className="wb-polaroid-grid-title">{item.title}</h3>
                {item.description && (
                  <p className="wb-polaroid-grid-desc">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    );
  }

  const icon = resolveCardsIcon(data);

  const ctx: CardContext = {
    variant,
    button,
    icon,
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
  if (icon.boxSize) vars["--wb-cardset-icon-size"] = `${icon.boxSize}px`;
  if (icon.svgSize) vars["--wb-cardset-icon-svg-size"] = `${icon.svgSize}px`;
  if (icon.radius) vars["--wb-cardset-icon-radius"] = icon.radius;
  if (icon.bgColor) vars["--wb-cardset-icon-bg"] = icon.bgColor;
  if (icon.color) vars["--wb-cardset-icon-color"] = icon.color;
  if (icon.offsetY !== 0) vars["--wb-cardset-icon-offset-y"] = `${icon.offsetY}px`;

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
