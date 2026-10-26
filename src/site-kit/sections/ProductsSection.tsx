import { useMemo, useState } from "react";
import { parseRichText, SectionShell } from "../primitives.tsx";
import { formatInr, listingSelection, productHref, shopListings, SHOP_LIST_SCRIPT, useShopCatalog } from "../shop-catalog.tsx";
import { useStaticRender } from "../render-mode.tsx";
import type { ProductsData, SectionOf, ShopCatalogProduct } from "../types.ts";

type SortMode = "featured" | "price-low" | "price-high" | "name";

/** Named categories kept visible before the rest sit behind More. */
const CATEGORY_PREVIEW = 5;

const SAMPLES: ShopCatalogProduct[] = [
  {
    id: "sample-1",
    name: "Everyday tee",
    slug: "everyday-tee",
    description: "Soft cotton tee.",
    categoryName: "Tops",
    images: [],
    variants: [
      { id: "s1", name: "S / Black", pricePaise: 89900, quantity: 12, images: [], options: [{ name: "Size", value: "S" }, { name: "Colour", value: "Black" }] },
      { id: "s2", name: "M / Black", pricePaise: 89900, quantity: 8, images: [], options: [{ name: "Size", value: "M" }, { name: "Colour", value: "Black" }] },
    ],
  },
  {
    id: "sample-2",
    name: "Canvas tote",
    slug: "canvas-tote",
    description: "A roomy everyday bag.",
    categoryName: "Bags",
    images: [],
    variants: [{ id: "s3", name: "Natural", pricePaise: 129900, quantity: 4, images: [], options: [] }],
  },
  {
    id: "sample-3",
    name: "Ceramic mug",
    slug: "ceramic-mug",
    description: "Stoneware mug.",
    categoryName: "Home",
    images: [],
    variants: [{ id: "s4", name: "White", pricePaise: 64900, quantity: 20, images: [], options: [] }],
  },
];

function haystack(product: ShopCatalogProduct, label: string): string {
  return [product.name, label, product.categoryName, product.description ?? "", ...product.variants.map((variant) => variant.name)].join(" ").toLowerCase();
}

function listingImage(product: ShopCatalogProduct, variants: ShopCatalogProduct["variants"]): { url: string; alt: string } | null {
  return variants.find((variant) => variant.images[0])?.images[0] ?? product.images[0] ?? null;
}

function listingPrice(listing: { variants: ShopCatalogProduct["variants"] }): number {
  return listing.variants[0]?.pricePaise ?? 0;
}

export default function ProductsSection({ section }: { section: SectionOf<"products"> }) {
  const data = section.data as ProductsData;
  const catalog = useShopCatalog();
  const stat = useStaticRender();
  const live = catalog?.live === true;
  const products = live ? catalog.products : SAMPLES;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>("featured");
  const listings = useMemo(() => products.flatMap((product) => shopListings(product)), [products]);
  const categories = useMemo(() => ["All", ...new Set(products.map((product) => product.categoryName).filter(Boolean))], [products]);
  const extraCategoryCount = Math.max(0, categories.length - 1 - CATEGORY_PREVIEW);
  const visible = useMemo(() => {
    if (stat) return listings;
    const needle = query.trim().toLowerCase();
    const filtered = listings.filter((listing) => {
      if (category !== "All" && listing.product.categoryName !== category) return false;
      return !needle || haystack(listing.product, listing.label).includes(needle);
    });
    if (sort === "price-low") return [...filtered].sort((a, b) => (a.variants[0]?.pricePaise ?? 0) - (b.variants[0]?.pricePaise ?? 0));
    if (sort === "price-high") return [...filtered].sort((a, b) => (b.variants[0]?.pricePaise ?? 0) - (a.variants[0]?.pricePaise ?? 0));
    if (sort === "name") return [...filtered].sort((a, b) => a.product.name.localeCompare(b.product.name));
    return filtered;
  }, [listings, query, category, sort, stat]);

  const heading = (
    <div className="wb-shop-head">
      {data.eyebrow && <span className="wb-shop-eyebrow">{parseRichText(data.eyebrow)}</span>}
      {data.title && <h2 className="wb-shop-title">{parseRichText(data.title)}</h2>}
      {data.subtitle && <p className="wb-shop-subtitle">{parseRichText(data.subtitle)}</p>}
    </div>
  );

  const tools =
    (data.showSearch !== false || data.showCategoryFilter !== false || data.showSort !== false) && products.length > 0 ? (
      <div className="wb-shop-tools">
        {data.showSearch !== false && (
          <label className="wb-shop-search-wrap">
            <span className="wb-shop-tool-label">Search</span>
            <input
              className="wb-shop-search"
              type="search"
              placeholder="Search products"
              aria-label="Search products"
              data-wb-shop-search=""
              value={stat ? undefined : query}
              onChange={stat ? undefined : (event) => setQuery(event.target.value)}
            />
          </label>
        )}
        {data.showCategoryFilter !== false && categories.length > 1 && (
          <div className="wb-shop-filter-group">
            <span className="wb-shop-tool-label">Categories</span>
            <div className={`wb-shop-filters${!stat && categoriesOpen ? " is-expanded" : ""}`} role="tablist" aria-label="Product categories">
              {categories.map((name, index) => (
                <button
                  key={name}
                  type="button"
                  className={`wb-shop-filter${(stat ? name === "All" : category === name) ? " is-active" : ""}${index > CATEGORY_PREVIEW ? " is-extra" : ""}`}
                  aria-pressed={stat ? name === "All" : category === name}
                  data-wb-shop-filter={name}
                  onClick={stat ? undefined : () => setCategory(name)}
                >
                  {name}
                </button>
              ))}
              {extraCategoryCount > 0 && (
                <button
                  type="button"
                  className="wb-shop-more"
                  data-wb-shop-more=""
                  data-more={`More (${extraCategoryCount})`}
                  data-less="Less"
                  aria-expanded={stat ? undefined : categoriesOpen}
                  onClick={stat ? undefined : () => setCategoriesOpen((open) => !open)}
                >
                  {stat || !categoriesOpen ? `More (${extraCategoryCount})` : "Less"}
                </button>
              )}
            </div>
          </div>
        )}
        {data.showSort !== false && (
          <label className="wb-shop-sort-wrap">
            <span className="wb-shop-tool-label">Sort by</span>
            <select
              className="wb-shop-sort"
              aria-label="Sort products"
              data-wb-shop-sort=""
              value={stat ? "featured" : sort}
              onChange={stat ? undefined : (event) => setSort(event.target.value as SortMode)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        )}
      </div>
    ) : null;

  const grid =
    products.length === 0 ? (
      <p className="wb-shop-empty">{data.emptyMessage || "No products yet."}</p>
    ) : (
      <div className="wb-shop-results">
        <div className="wb-shop-result-bar">
          <span data-wb-shop-count="">{visible.length} {visible.length === 1 ? "product" : "products"}</span>
        </div>
        <div className={`wb-shop-grid${data.layout === "grid-2" ? " is-2" : ""}`}>
          {visible.map((listing, index) => {
            const image = listingImage(listing.product, listing.variants);
            const href = productHref(data.detailBase, listing.product.slug, listingSelection(listing));
            const price = listingPrice(listing);
            const attrs = {
              "data-wb-product": "",
              "data-category": listing.product.categoryName,
              "data-search": haystack(listing.product, listing.label),
              "data-name": listing.product.name,
              "data-price": price,
              "data-order": index,
            };

            if (data.design === "editorial") {
              return (
                <a key={listing.key} className="wb-shop-card wb-shop-card-editorial" href={href} {...attrs}>
                  <div className="wb-shop-media">
                    {image ? <img src={image.url} alt={image.alt || listing.product.name} /> : <span className="wb-shop-fallback">{listing.product.name.slice(0, 1)}</span>}
                  </div>
                  <div className="wb-shop-body">
                    <h3 className="wb-shop-name">{listing.product.name}</h3>
                    <p className="wb-shop-variant">{listing.label || listing.product.categoryName}</p>
                    <span className="wb-shop-price">{formatInr(price)}</span>
                  </div>
                </a>
              );
            }

            if (data.design === "showcase") {
              return (
                <a key={listing.key} className="wb-shop-card wb-shop-card-showcase" href={href} {...attrs}>
                  <div className="wb-shop-media">
                    {image ? <img src={image.url} alt={image.alt || listing.product.name} /> : <span className="wb-shop-fallback">{listing.product.name.slice(0, 1)}</span>}
                  </div>
                  <div className="wb-shop-body">
                    <span className="wb-shop-category">{listing.product.categoryName}</span>
                    <h3 className="wb-shop-name">{listing.product.name}</h3>
                    {listing.label && <p className="wb-shop-variant">{listing.label}</p>}
                    <span className="wb-shop-price">{formatInr(price)}</span>
                  </div>
                </a>
              );
            }

            return (
              <a key={listing.key} className="wb-shop-card" href={href} {...attrs}>
                <div className="wb-shop-media">
                  {image ? <img src={image.url} alt={image.alt || listing.product.name} /> : <span className="wb-shop-fallback">{listing.product.name.slice(0, 1)}</span>}
                </div>
                <div className="wb-shop-body">
                  <span className="wb-shop-category">{listing.product.categoryName}</span>
                  <h3 className="wb-shop-name">{listing.product.name}</h3>
                  {listing.label && <p className="wb-shop-variant">{listing.label}</p>}
                  <span className="wb-shop-price">{listing.variants[0] ? formatInr(price) : ""}</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    );

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      fullWidth
      className={data.design === "editorial" ? "wb-shop-bleed" : undefined}
    >
      <div className={`wb-shop wb-shop-list is-${data.design || "classic-grid"}`} data-wb-shop="">
        {data.design === "editorial" ? (
          <div className="wb-shop-catalog-shell">
            <aside className="wb-shop-sidebar">{heading}{tools}</aside>
            {grid}
          </div>
        ) : (
          <>{heading}{tools}{grid}</>
        )}
        <p className="wb-shop-empty" data-wb-shop-none="" hidden>No products match that search.</p>
        {!live && !stat && <p className="wb-shop-note">Sample products. The published page lists this website’s shop.</p>}
        {stat && <script dangerouslySetInnerHTML={{ __html: SHOP_LIST_SCRIPT }} />}
      </div>
    </SectionShell>
  );
}
