import { useRef, useState, type KeyboardEvent } from "react";
import { Spinner } from "@heroui/react";
import { ImageOff, ScanBarcode, Search } from "lucide-react";
import { shopPosApi, type PosCatalog, type PosCatalogProduct, type PosCatalogVariant } from "../../../api/shop-pos.ts";
import { useLoadMoreSentinel } from "../../../hooks/use-infinite-list.ts";
import CommonModal from "../../ui/AppModal.tsx";
import { formatInr } from "../shop-format.ts";
import { useBarcodeScanner } from "./barcode-scanner.ts";

type Props = {
  websiteId: string;
  /** Products loaded so far for the current search and category; null while page 1 loads. */
  products: PosCatalogProduct[] | null;
  categories: PosCatalog["categories"];
  search: string;
  onSearch: (search: string) => void;
  categoryId: string | null;
  onCategory: (categoryId: string | null) => void;
  /** More pages to load as the cashier scrolls. */
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  /** Units of each variant already in the cart, so stock shown is what's left to sell. */
  inCart: Map<string, number>;
  onAdd: (product: PosCatalogProduct, variant: PosCatalogVariant) => void;
  /** Feedback for scans that don't match or are sold out. */
  onNotice: (message: string) => void;
  /** Off while a dialog is open, so a scan can't add items behind it. */
  scannerEnabled: boolean;
};

function stockLeft(variant: PosCatalogVariant, inCart: Map<string, number>): number {
  return variant.available - (inCart.get(variant.id) ?? 0);
}

function priceRange(product: PosCatalogProduct): string {
  const prices = product.variants.map((variant) => variant.unitPaise);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? formatInr(low) : `${formatInr(low)} – ${formatInr(high)}`;
}

/** Left side of the till: search or scan, filter by category, tap a product to add it. Scrolling loads more. */
export default function PosCatalogGrid({
  websiteId,
  products,
  categories,
  search,
  onSearch,
  categoryId,
  onCategory,
  hasMore,
  loadingMore,
  onLoadMore,
  inCart,
  onAdd,
  onNotice,
  scannerEnabled,
}: Props) {
  const [choosing, setChoosing] = useState<PosCatalogProduct | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const visible = products ?? [];
  useLoadMoreSentinel(sentinel, onLoadMore, hasMore && !loadingMore);

  function add(product: PosCatalogProduct, variant: PosCatalogVariant) {
    if (stockLeft(variant, inCart) <= 0) {
      onNotice(`${product.name}${product.variants.length > 1 ? ` (${variant.name})` : ""} is out of stock.`);
      return;
    }
    onAdd(product, variant);
  }

  function pick(product: PosCatalogProduct) {
    if (product.variants.length === 1) add(product, product.variants[0]);
    else setChoosing(product);
  }

  /** Adds the item with this barcode (or SKU), looked up across the whole shop; true when one matched. */
  async function addByCode(code: string): Promise<boolean> {
    if (!code.trim()) return false;
    try {
      const { product, variantId } = await shopPosApi.byCode(websiteId, code);
      const variant = product.variants.find((item) => item.id === variantId);
      if (variant) add(product, variant);
      return Boolean(variant);
    } catch {
      return false;
    }
  }

  // Scans anywhere on the page, e.g. after tapping a cart button moved the cursor out of the search box.
  useBarcodeScanner((code) => {
    void addByCode(code).then((found) => {
      if (!found) onNotice(`No product with barcode ${code}. Add it to the product under Shop → Products.`);
    });
  }, scannerEnabled && !choosing);

  /** A scanner in the search box types the barcode and presses Enter. */
  async function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const typed = search.trim();
    if (await addByCode(typed)) {
      onSearch("");
    } else if (visible.length === 1) {
      pick(visible[0]);
    } else if (typed) {
      onNotice(`No product with barcode or SKU "${typed}".`);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <label className="relative block">
        <span className="sr-only">Search products or scan a barcode</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          onKeyDown={(event) => void handleKeyDown(event)}
          placeholder="Search products, or scan a barcode"
          className="h-11 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-10 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          autoFocus
        />
        <ScanBarcode className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
      </label>

      {categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Category">
          {[{ id: null, name: "All" }, ...categories].map((category) => {
            const active = categoryId === category.id;
            return (
              <button
                key={category.id ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => onCategory(category.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
                  active ? "bg-brand text-white ring-brand" : "bg-surface text-ink-body ring-line-strong hover:bg-canvas"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pb-4">
        {products === null ? (
          <div className="grid place-items-center py-16">
            <Spinner aria-label="Loading products" />
          </div>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-muted">
            {search.trim() || categoryId ? "No products match." : "This shop has no products yet. Add them under Shop → Products."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => {
              const left = product.variants.reduce((sum, variant) => sum + Math.max(0, stockLeft(variant, inCart)), 0);
              const soldOut = left <= 0;
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => pick(product)}
                    className={`flex h-full w-full flex-col overflow-hidden rounded-xl border bg-surface text-left shadow-xs transition hover:border-brand hover:shadow-sm focus-visible:outline-2 focus-visible:outline-brand ${
                      soldOut ? "border-line opacity-60" : "border-line"
                    }`}
                  >
                    <div className="aspect-[4/3] w-full bg-canvas">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
                      ) : (
                        <div className="grid size-full place-items-center text-ink-muted">
                          <ImageOff className="size-6" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <span className="line-clamp-2 text-sm font-medium text-ink">{product.name}</span>
                      <span className="text-sm font-semibold text-ink">{priceRange(product)}</span>
                      <span className={`text-xs ${soldOut ? "font-medium text-red-600" : left <= 3 ? "text-amber-700" : "text-ink-muted"}`}>
                        {soldOut ? "Out of stock" : `${left} in stock`}
                        {product.variants.length > 1 && ` · ${product.variants.length} options`}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {hasMore && (
          <div ref={sentinel} className="grid place-items-center py-6">
            {loadingMore && <Spinner size="sm" aria-label="Loading more products" />}
          </div>
        )}
      </div>

      {choosing && (
        <CommonModal
          isOpen
          onClose={() => setChoosing(null)}
          title={choosing.name}
          subtitle="Choose an option"
          size="sm"
          disableFooter
        >
          <ul className="flex flex-col gap-2">
            {choosing.variants.map((variant) => {
              const left = stockLeft(variant, inCart);
              return (
                <li key={variant.id}>
                  <button
                    type="button"
                    disabled={left <= 0}
                    onClick={() => {
                      add(choosing, variant);
                      setChoosing(null);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-line px-4 py-3 text-left text-sm transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {variant.imageUrl ? (
                        <img src={variant.imageUrl} alt="" className="size-10 shrink-0 rounded-md object-cover" loading="lazy" />
                      ) : (
                        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-canvas text-ink-muted">
                          <ImageOff className="size-4" aria-hidden />
                        </span>
                      )}
                      <span className="truncate font-medium text-ink">{variant.name}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-semibold text-ink">{formatInr(variant.unitPaise)}</span>
                      <span className={`block text-xs ${left <= 0 ? "text-red-600" : "text-ink-muted"}`}>
                        {left <= 0 ? "Out of stock" : `${left} left`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </CommonModal>
      )}
    </div>
  );
}
