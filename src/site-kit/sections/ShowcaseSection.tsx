import { useState, type CSSProperties, type ReactNode } from "react";
import { gridStyle, parseRichText, SectionShell, SiteImage, SiteLink } from "../primitives.tsx";
import { StaticStates, useStaticRender } from "../render-mode.tsx";
import {
  aspectRatioCss,
  categoryName,
  groupShowcaseProducts,
  productsIn,
  resolveShowcaseDisplay,
  showcaseCategoryDesign,
  showcaseDesign,
  showcaseImageAspect,
  showcaseMode,
  visibleProducts,
  type ShowcaseDisplay,
} from "../showcase-layout.ts";
import type {
  LinkRef,
  SectionOf,
  ShowcaseCategory,
  ShowcaseCategoryDesign,
  ShowcaseData,
  ShowcaseProduct,
  ShowcaseProductDesign,
} from "../types.ts";

type Ctx = {
  data: ShowcaseData;
  design: ShowcaseProductDesign;
  display: ShowcaseDisplay;
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="wb-showcase-arrow" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

function ProductName({ product, link }: { product: ShowcaseProduct; link?: LinkRef }) {
  const name = parseRichText(product.name);
  return (
    <h3 className="wb-showcase-name">
      {link ? <SiteLink link={link} className="wb-showcase-name-link">{name}</SiteLink> : name}
    </h3>
  );
}

function ProductCard({ product, ctx }: { product: ShowcaseProduct; ctx: Ctx }) {
  const { display, design, data } = ctx;
  const link = product.link?.href ? product.link : data.defaultLink?.href ? data.defaultLink : undefined;
  const category = display.category ? categoryName(data, product.categoryId) : undefined;
  const badge = display.badge && product.badge ? product.badge : undefined;
  const hasImage = display.image && Boolean(product.image?.url);
  // Price-list thumbnails are too small to carry a badge, so it moves next to the name.
  const floatBadge = hasImage && design !== "catalogue";
  const price = display.price && product.price ? <span className="wb-showcase-price">{product.price}</span> : null;
  // The catalogue design reads like a price list: the price sits on the name line.
  const priceInline = design === "catalogue";
  const summaryClamp = display.summaryLines > 0;
  const button = display.button && link ? (
    <SiteLink link={link} className="wb-showcase-btn">
      <span>{link.label}</span>
      <ArrowIcon />
    </SiteLink>
  ) : null;

  return (
    <article className={`wb-showcase-card${hasImage ? "" : " wb-showcase-card-noimg"}`}>
      {hasImage && (
        <div className="wb-showcase-media">
          <SiteImage image={product.image!} className="wb-showcase-img" contextText={product.name} />
          {badge && floatBadge && <span className="wb-showcase-badge wb-showcase-badge-floating">{badge}</span>}
        </div>
      )}
      <div className="wb-showcase-body">
        {(category || (badge && !floatBadge)) && (
          <div className="wb-showcase-meta">
            {category && <span className="wb-showcase-cat-label">{category}</span>}
            {badge && !floatBadge && <span className="wb-showcase-badge">{badge}</span>}
          </div>
        )}
        {(display.name || (priceInline && price)) && (
          <div className="wb-showcase-line">
            {display.name && <ProductName product={product} link={display.button ? undefined : link} />}
            {priceInline && price && (
              <>
                <span className="wb-showcase-leader" aria-hidden="true" />
                {price}
              </>
            )}
          </div>
        )}
        {display.summary && product.summary && (
          <p
            className={`wb-showcase-summary${summaryClamp ? " wb-showcase-clamp" : ""}`}
            style={summaryClamp ? ({ "--wb-showcase-lines": display.summaryLines } as CSSProperties) : undefined}
          >
            {parseRichText(product.summary)}
          </p>
        )}
        {((!priceInline && price) || button) && (
          <div className="wb-showcase-foot">
            {!priceInline && price}
            {button}
          </div>
        )}
      </div>
    </article>
  );
}

function ProductGrid({ products, ctx }: { products: ShowcaseProduct[]; ctx: Ctx }) {
  const { data } = ctx;
  return (
    <div className="wb-grid wb-showcase-grid" style={gridStyle(data.columns, data.mobileColumns, data.tabletColumns)}>
      {products.map((product) => (
        <div key={product.id} className="wb-showcase-cell">
          <ProductCard product={product} ctx={ctx} />
        </div>
      ))}
    </div>
  );
}

function CategoryCard({
  category,
  count,
  design,
  display,
}: {
  category: ShowcaseCategory;
  count: number;
  design: ShowcaseCategoryDesign;
  display: ShowcaseDisplay;
}) {
  const hasImage = display.image && Boolean(category.image?.url);
  const description = display.categoryDescription && design !== "pills" ? category.description : undefined;
  const content: ReactNode = (
    <>
      {hasImage && (
        <span className="wb-showcase-cat-media">
          <SiteImage image={category.image!} className="wb-showcase-img" contextText={category.name} />
        </span>
      )}
      <span className="wb-showcase-cat-body">
        <span className="wb-showcase-cat-name">{parseRichText(category.name)}</span>
        {description && <span className="wb-showcase-cat-desc">{parseRichText(description)}</span>}
        {display.count && (
          <span className="wb-showcase-cat-count">
            {count} {count === 1 ? "product" : "products"}
          </span>
        )}
      </span>
      {category.link?.href && design === "cards" && <ArrowIcon />}
    </>
  );
  const className = `wb-showcase-cat${hasImage ? "" : " wb-showcase-cat-noimg"}`;
  return category.link?.href ? (
    <SiteLink link={category.link} className={className}>
      {content}
    </SiteLink>
  ) : (
    <div className={className}>{content}</div>
  );
}

function Categories({ data, display }: { data: ShowcaseData; display: ShowcaseDisplay }) {
  const design = showcaseCategoryDesign(data);
  const cards = data.categories.map((category) => (
    <div key={category.id} className="wb-showcase-cell">
      <CategoryCard category={category} count={productsIn(data, category.id).length} design={design} display={display} />
    </div>
  ));
  if (design === "pills") return <div className="wb-showcase-pills">{cards}</div>;
  return (
    <div className="wb-grid wb-showcase-grid" style={gridStyle(data.columns, data.mobileColumns, data.tabletColumns)}>
      {cards}
    </div>
  );
}

function GroupHead({ category, label, display }: { category: ShowcaseCategory | null; label: string; display: ShowcaseDisplay }) {
  const description = display.categoryDescription ? category?.description : undefined;
  return (
    <div className="wb-showcase-group-head">
      <h3 className="wb-showcase-group-title">{parseRichText(category?.name ?? label)}</h3>
      {description && <p className="wb-showcase-group-desc">{parseRichText(description)}</p>}
    </div>
  );
}

type Tab = { key: string; label: string; products: ShowcaseProduct[] };

function showcaseTabs(data: ShowcaseData): Tab[] {
  const groups = groupShowcaseProducts(data);
  const other = data.otherLabel?.trim() || "Other";
  return [
    { key: "all", label: data.allLabel?.trim() || "All", products: data.products },
    ...groups.map((group, index) => ({
      key: `c${index}`,
      label: group.category?.name ?? other,
      products: group.products,
    })),
  ];
}

function TabBar({ tabs, active, onSelect }: { tabs: Tab[]; active: string; onSelect?: (key: string) => void }) {
  return (
    <div className="wb-showcase-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === active}
          className={`wb-showcase-tab${tab.key === active ? " wb-showcase-tab-active" : ""}`}
          data-wb-go={onSelect ? undefined : tab.key}
          onClick={onSelect ? () => onSelect(tab.key) : undefined}
        >
          {parseRichText(tab.label)}
        </button>
      ))}
    </div>
  );
}

function TabbedProducts({ ctx }: { ctx: Ctx }) {
  const isStatic = useStaticRender();
  const tabs = showcaseTabs(ctx.data);
  const [active, setActive] = useState("all");
  const render = (key: string) => (
    <>
      <TabBar tabs={tabs} active={key} onSelect={isStatic ? undefined : setActive} />
      <ProductGrid products={(tabs.find((tab) => tab.key === key) ?? tabs[0]!).products} ctx={ctx} />
    </>
  );
  // A category removed in the editor may leave a stale tab selected.
  const current = tabs.some((tab) => tab.key === active) ? active : "all";
  return isStatic ? (
    <StaticStates states={tabs.map((tab) => tab.key)} initial="all" render={render} />
  ) : (
    render(current)
  );
}

function Body({ data, ctx }: { data: ShowcaseData; ctx: Ctx }) {
  const mode = showcaseMode(data);
  if (mode === "categories") {
    if (data.categories.length === 0) return <Empty data={data} what="categories" />;
    return <Categories data={data} display={ctx.display} />;
  }
  if (data.products.length === 0) return <Empty data={data} what="products" />;
  if (mode === "tabs") return <TabbedProducts ctx={ctx} />;
  if (mode === "grouped") {
    const other = data.otherLabel?.trim() || "Other";
    return (
      <div className="wb-showcase-groups">
        {groupShowcaseProducts(data).map((group) => (
          <div key={group.category?.id ?? "other"} className="wb-showcase-group">
            <GroupHead category={group.category} label={other} display={ctx.display} />
            <ProductGrid products={group.products} ctx={ctx} />
          </div>
        ))}
      </div>
    );
  }
  return <ProductGrid products={visibleProducts(data)} ctx={ctx} />;
}

function Empty({ data, what }: { data: ShowcaseData; what: "products" | "categories" }) {
  return <p className="wb-showcase-empty">{data.emptyMessage?.trim() || `No ${what} yet.`}</p>;
}

export default function ShowcaseSection({ section }: { section: SectionOf<"showcase"> }) {
  const { data, settings } = section;
  const design = showcaseDesign(data);
  const mode = showcaseMode(data);
  const ctx: Ctx = { data, design, display: resolveShowcaseDisplay(data) };
  const headAlign = data.headerAlign ?? "center";
  const classes = [
    "wb-showcase",
    mode === "categories" ? `wb-showcase-cats-${showcaseCategoryDesign(data)}` : `wb-showcase-d-${design}`,
    data.imageFit === "contain" && "wb-showcase-fit-contain",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <SectionShell
      sectionId={section.id}
      settings={settings}
      className={classes}
      label={data.heading}
      style={{ "--wb-showcase-ar": aspectRatioCss(showcaseImageAspect(data)) } as CSSProperties}
    >
      {(data.eyebrow || data.heading || data.intro) && (
        <div className={`wb-showcase-head wb-showcase-head-${headAlign}`}>
          {data.eyebrow && <p className="wb-eyebrow">{parseRichText(data.eyebrow)}</p>}
          {data.heading && <h2>{parseRichText(data.heading)}</h2>}
          {data.intro && <p className="wb-muted wb-showcase-intro">{parseRichText(data.intro)}</p>}
        </div>
      )}
      <Body data={data} ctx={ctx} />
    </SectionShell>
  );
}
