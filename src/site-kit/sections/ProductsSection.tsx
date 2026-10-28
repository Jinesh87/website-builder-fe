import { useMemo, useState } from "react";
import { parseRichText, SectionShell } from "../primitives.tsx";
import ShopCartActions from "../ShopCartActions.tsx";
import { formatInr, listingSelection, productHref, shopListings, SHOP_LIST_SCRIPT, useShopCatalog } from "../shop-catalog.tsx";
import { SHOP_CART_SCRIPT } from "../shop-auth.ts";
import { useStaticRender } from "../render-mode.tsx";
import type { ProductsData, SectionOf, ShopCatalogProduct } from "../types.ts";

type SortMode = "featured" | "price-low" | "price-high" | "name";

/** Named categories kept visible before the rest sit behind More. */
const CATEGORY_PREVIEW = 5;
const PAGE_SIZES = [8, 12, 24, 48];
const DEFAULT_PAGE_SIZE = 12;

type ShopListState = {
  search: string;
  category: string;
  sort: SortMode;
  page: number;
  pageSize: number;
  total: number;
  categories: string[];
};

function listHref(list: ShopListState, patch: Partial<Pick<ShopListState, "search" | "category" | "sort" | "page" | "pageSize">>): string {
  const next = { ...list, ...patch };
  const params = new URLSearchParams();
  if (next.search) params.set("q", next.search);
  if (next.category && next.category !== "All") params.set("cat", next.category);
  if (next.sort !== "featured") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  if (next.pageSize !== DEFAULT_PAGE_SIZE) params.set("per", String(next.pageSize));
  const text = params.toString();
  return text ? `?${text}` : "?";
}

function pageNumbers(page: number, pages: number): number[] {
  const width = 7;
  const start = Math.max(1, Math.min(page - 3, pages - width + 1));
  const end = Math.min(pages, start + width - 1);
  const from = Math.max(1, end - width + 1);
  return Array.from({ length: end - from + 1 }, (_, index) => from + index);
}

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
  const websiteId = live ? catalog?.websiteId : undefined;
  const authHref = catalog?.authHref || "/login";
  const accountHref = catalog?.accountHref || "/account";
  const loginPromptVariant = data.cartLoginPromptVariant || "soft-card";
  const interactive = !stat && !!websiteId;
  const serverList = live ? catalog?.list : undefined;
  const products = live ? catalog.products : SAMPLES;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>("featured");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const listings = useMemo(() => products.flatMap((product) => shopListings(product)), [products]);
  const categories = useMemo(
    () => (serverList ? ["All", ...serverList.categories] : ["All", ...new Set(products.map((product) => product.categoryName).filter(Boolean))]),
    [products, serverList],
  );
  const extraCategoryCount = Math.max(0, categories.length - 1 - CATEGORY_PREVIEW);
  const visible = useMemo(() => {
    if (serverList) return listings;
    const needle = query.trim().toLowerCase();
    const filtered = listings.filter((listing) => {
      if (category !== "All" && listing.product.categoryName !== category) return false;
      return !needle || haystack(listing.product, listing.label).includes(needle);
    });
    if (sort === "price-low") return [...filtered].sort((a, b) => (a.variants[0]?.pricePaise ?? 0) - (b.variants[0]?.pricePaise ?? 0));
    if (sort === "price-high") return [...filtered].sort((a, b) => (b.variants[0]?.pricePaise ?? 0) - (a.variants[0]?.pricePaise ?? 0));
    if (sort === "name") return [...filtered].sort((a, b) => a.product.name.localeCompare(b.product.name));
    return filtered;
  }, [listings, query, category, sort, serverList]);
  const total = serverList ? serverList.total : visible.length;
  const currentSize = serverList ? serverList.pageSize : pageSize;
  const pageCount = Math.max(1, Math.ceil(total / currentSize));
  const currentPage = serverList ? serverList.page : Math.min(page, pageCount);
  const pageListings = serverList ? listings : visible.slice((currentPage - 1) * currentSize, currentPage * currentSize);
  const activeCategory = serverList ? serverList.category : category;
  const activeSort = serverList ? serverList.sort : sort;
  const from = total === 0 ? 0 : (currentPage - 1) * currentSize + 1;
  const to = total === 0 ? 0 : Math.min(total, from + pageListings.length - 1);

  const heading = (
    <div className="wb-shop-head">
      {data.eyebrow && <span className="wb-shop-eyebrow">{parseRichText(data.eyebrow)}</span>}
      {data.title && <h2 className="wb-shop-title">{parseRichText(data.title)}</h2>}
      {data.subtitle && <p className="wb-shop-subtitle">{parseRichText(data.subtitle)}</p>}
    </div>
  );

  const hasCatalog = serverList ? serverList.categories.length > 0 || serverList.total > 0 || serverList.search !== "" : products.length > 0;
  const toolBody = (
    <>
      {data.showSearch !== false && (
        <label className="wb-shop-search-wrap">
          <span className="wb-shop-tool-label">Search</span>
          <span className="wb-shop-search-row">
            <input
              className="wb-shop-search"
              type="search"
              name={serverList ? "q" : undefined}
              placeholder="Search products"
              aria-label="Search products"
              data-wb-shop-search=""
              defaultValue={serverList ? serverList.search : undefined}
              value={serverList ? undefined : query}
              onChange={serverList ? undefined : (event) => { setQuery(event.target.value); setPage(1); }}
            />
            {serverList && <button className="wb-shop-search-go" type="submit">Search</button>}
          </span>
        </label>
      )}
      {data.showCategoryFilter !== false && categories.length > 1 && (
        <div className="wb-shop-filter-group">
          <span className="wb-shop-tool-label">Categories</span>
          <div className={`wb-shop-filters${!serverList && categoriesOpen ? " is-expanded" : ""}`} role="tablist" aria-label="Product categories">
            {categories.map((name, index) => {
              const active = activeCategory === name;
              const className = `wb-shop-filter${active ? " is-active" : ""}${index > CATEGORY_PREVIEW ? " is-extra" : ""}`;
              return serverList ? (
                <a
                  key={name}
                  className={className}
                  href={listHref(serverList, { category: name, page: 1 })}
                  aria-current={active ? "true" : undefined}
                  data-wb-shop-filter={name}
                >
                  {name}
                </a>
              ) : (
                <button
                  key={name}
                  type="button"
                  className={className}
                  aria-pressed={active}
                  data-wb-shop-filter={name}
                  onClick={() => { setCategory(name); setPage(1); }}
                >
                  {name}
                </button>
              );
            })}
            {extraCategoryCount > 0 && (
              <button
                type="button"
                className="wb-shop-more"
                data-wb-shop-more=""
                data-more={`More (${extraCategoryCount})`}
                data-less="Less"
                aria-expanded={serverList ? undefined : categoriesOpen}
                onClick={serverList ? undefined : () => setCategoriesOpen((open) => !open)}
              >
                {serverList || !categoriesOpen ? `More (${extraCategoryCount})` : "Less"}
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
            name={serverList ? "sort" : undefined}
            data-wb-shop-sort=""
            defaultValue={serverList ? serverList.sort : undefined}
            value={serverList ? undefined : activeSort}
            onChange={serverList ? undefined : (event) => { setSort(event.target.value as SortMode); setPage(1); }}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>
      )}
    </>
  );
  const tools = !hasCatalog ? null : serverList ? (
    <form className="wb-shop-tools" method="get" action="" data-wb-shop-form="">
      {toolBody}
      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="cat" value={serverList.category === "All" ? "" : serverList.category} />
    </form>
  ) : (
    <div className="wb-shop-tools">{toolBody}</div>
  );

  const pageLinks = pageNumbers(currentPage, pageCount);
  const grid = !hasCatalog ? (
    <p className="wb-shop-empty">{data.emptyMessage || "No products yet."}</p>
  ) : (
      <div className="wb-shop-results">
        {pageListings.length === 0 ? (
          <p className="wb-shop-empty">No products match that search.</p>
        ) : (
        <div className={`wb-shop-grid${data.layout === "grid-2" ? " is-2" : ""}`}>
          {pageListings.map((listing, index) => {
            const image = listingImage(listing.product, listing.variants);
            const href = productHref(data.detailBase, listing.product.slug, listingSelection(listing));
            const price = listingPrice(listing);
            const variant = listing.variants.find((item) => item.quantity > 0) ?? listing.variants[0];
            const cart = (
              <ShopCartActions
                variantId={variant?.id}
                websiteId={websiteId}
                authHref={authHref}
                accountHref={accountHref}
                outOfStock={!variant || variant.quantity <= 0}
                stockMax={variant?.quantity ?? 0}
                interactive={interactive}
                compact
                loginPromptVariant={loginPromptVariant}
              />
            );
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
                <article key={listing.key} className="wb-shop-card wb-shop-card-editorial" {...attrs}>
                  <a className="wb-shop-card-link" href={href}>
                    <div className="wb-shop-media">
                      {image ? <img src={image.url} alt={image.alt || listing.product.name} /> : <span className="wb-shop-fallback">{listing.product.name.slice(0, 1)}</span>}
                    </div>
                    <div className="wb-shop-body">
                      <h3 className="wb-shop-name">{listing.product.name}</h3>
                      <p className="wb-shop-variant">{listing.label || listing.product.categoryName}</p>
                      <span className="wb-shop-price">{formatInr(price)}</span>
                    </div>
                  </a>
                  {cart}
                </article>
              );
            }

            if (data.design === "showcase") {
              return (
                <article key={listing.key} className="wb-shop-card wb-shop-card-showcase" {...attrs}>
                  <a className="wb-shop-card-link" href={href}>
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
                  {cart}
                </article>
              );
            }

            return (
              <article key={listing.key} className="wb-shop-card" {...attrs}>
                <a className="wb-shop-card-link" href={href}>
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
                {cart}
              </article>
            );
          })}
        </div>
        )}
        <nav className="wb-shop-pager" aria-label="Product pages">
          <span className="wb-shop-result-count" data-wb-shop-count="">{total === 0 ? "0 products" : `Showing ${from}–${to} of ${total}`}</span>
          <label className="wb-shop-per-wrap">
            <span className="wb-shop-tool-label">Per page</span>
            <select
              className="wb-shop-per"
              aria-label="Products per page"
              name={serverList ? "per" : undefined}
              data-wb-shop-per=""
              defaultValue={serverList ? String(serverList.pageSize) : undefined}
              value={serverList ? undefined : String(pageSize)}
              onChange={serverList ? undefined : (event) => { setPageSize(Number(event.target.value)); setPage(1); }}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
          {total > 0 && (
            <div className="wb-shop-pages">
              {serverList ? (
                <a className="wb-shop-page" href={currentPage > 1 ? listHref(serverList, { page: currentPage - 1 }) : undefined} aria-disabled={currentPage <= 1 || undefined}>Previous</a>
              ) : (
                <button type="button" className="wb-shop-page" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
              )}
              {pageLinks.map((number) => serverList ? (
                <a key={number} className={`wb-shop-page${number === currentPage ? " is-active" : ""}`} href={listHref(serverList, { page: number })} aria-current={number === currentPage ? "page" : undefined}>{number}</a>
              ) : (
                <button key={number} type="button" className={`wb-shop-page${number === currentPage ? " is-active" : ""}`} onClick={() => setPage(number)}>{number}</button>
              ))}
              {serverList ? (
                <a className="wb-shop-page" href={currentPage < pageCount ? listHref(serverList, { page: currentPage + 1 }) : undefined} aria-disabled={currentPage >= pageCount || undefined}>Next</a>
              ) : (
                <button type="button" className="wb-shop-page" disabled={currentPage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button>
              )}
            </div>
          )}
        </nav>
      </div>
  );

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      fullWidth
      className={data.design === "editorial" ? "wb-shop-bleed" : undefined}
    >
      <div
        className={`wb-shop wb-shop-list is-${data.design || "classic-grid"}`}
        data-wb-shop=""
        data-wb-shop-paged={serverList ? "" : undefined}
        data-wb-shop-website={websiteId || undefined}
        data-wb-shop-auth-href={authHref}
        data-wb-shop-account-href={accountHref}
        data-wb-cart-login-variant={loginPromptVariant}
      >
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
        {stat && websiteId && <script dangerouslySetInnerHTML={{ __html: SHOP_CART_SCRIPT }} />}
      </div>
    </SectionShell>
  );
}
