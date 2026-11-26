import { useContext, useEffect, useState } from "react";
import { shopApi, type ShopProduct } from "../../../api/shop.ts";
import { EditorContext } from "../../../features/builder/editor-context.ts";
import { useDebouncedValue } from "../../../hooks/use-debounced-value.ts";
import type { ProductsFeaturedPick } from "../../../site-kit/index.ts";
import { ItemList, TextField } from "./fields.tsx";

const MAX_PICKS = 12;
/** Matches shown under the search box. */
const RESULT_COUNT = 20;

type ProductName = Pick<ShopProduct, "id" | "name" | "listed">;

function productLabel(product: ProductName): string {
  return product.listed ? product.name : `${product.name} (hidden from shop)`;
}

/**
 * Names of the products already chosen, looked up by id (not the whole catalogue). Undefined for an
 * id still loading; null for one that no longer exists.
 */
function useChosenProducts(websiteId: string | undefined, ids: string[]) {
  const [names, setNames] = useState<Map<string, ProductName | null>>(new Map());
  const missing = ids.filter((id) => id && !names.has(id));
  const key = missing.join(",");

  useEffect(() => {
    if (!websiteId || !key) return;
    let cancel = false;
    const wanted = key.split(",");
    shopApi
      .products(websiteId, { ids: wanted, pageSize: 50 })
      .then((page) => {
        if (cancel) return;
        setNames((current) => {
          const next = new Map(current);
          for (const id of wanted) next.set(id, null);
          for (const product of page.products) next.set(product.id, product);
          return next;
        });
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [websiteId, key]);

  const remember = (product: ProductName) => setNames((current) => new Map(current).set(product.id, product));
  return { names, remember };
}

/** Search box that finds products by name, SKU or barcode as you type, and shows the chosen one. */
function ProductSearch({
  websiteId,
  chosenId,
  chosen,
  onChoose,
}: {
  websiteId: string;
  /** The card's product id; empty when none is chosen yet. */
  chosenId: string;
  /** Its name once looked up: undefined while loading, null when it no longer exists. */
  chosen: ProductName | null | undefined;
  onChoose: (product: ProductName) => void;
}) {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search.trim(), 250);
  const [results, setResults] = useState<ShopProduct[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }
    let cancel = false;
    setError(false);
    shopApi
      .products(websiteId, { search: query, pageSize: RESULT_COUNT })
      .then((page) => !cancel && setResults(page.products))
      .catch(() => !cancel && setError(true));
    return () => {
      cancel = true;
    };
  }, [websiteId, query]);

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-ed-xs text-ed-text">
        Product:{" "}
        <span className="font-medium">
          {!chosenId ? "None" : chosen ? productLabel(chosen) : chosen === null ? "Removed product" : "Loading…"}
        </span>
      </p>
      <TextField
        label={chosen ? "Change product" : "Find a product"}
        value={search}
        onChange={setSearch}
        placeholder="Type a name, SKU or barcode"
      />
      {error && <p className="text-ed-2xs text-ed-danger">Couldn't search products. Try again.</p>}
      {results && results.length === 0 && <p className="text-ed-2xs text-ed-muted">No products match “{query}”.</p>}
      {results && results.length > 0 && (
        <ul className="max-h-56 overflow-y-auto rounded-ed border border-ed-border" role="listbox" aria-label="Matching products">
          {results.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                role="option"
                aria-selected={chosen?.id === product.id}
                onClick={() => {
                  onChoose(product);
                  setSearch("");
                }}
                className="block w-full truncate px-2.5 py-1.5 text-left text-ed-xs text-ed-text hover:bg-ed-bg"
              >
                {productLabel(product)}
              </button>
            </li>
          ))}
        </ul>
      )}
      {results && results.length === RESULT_COUNT && (
        <p className="text-ed-2xs text-ed-muted">Showing the first {RESULT_COUNT} matches. Type more of the name to narrow it down.</p>
      )}
    </div>
  );
}

/** Lets the featured product strip show a chosen product on each card. */
export function FeaturedProductPicks({
  picks,
  onChange,
}: {
  picks: ProductsFeaturedPick[];
  onChange: (picks: ProductsFeaturedPick[] | undefined) => void;
}) {
  const website = useContext(EditorContext)?.website;
  const shopOn = Boolean(website?.shopFeatureEnabled && website.shopEnabled);
  const { names, remember } = useChosenProducts(shopOn ? website?.id : undefined, picks.map((pick) => pick.productId));

  if (!shopOn || !website) {
    return (
      <p className="text-ed-2xs text-ed-muted leading-normal">
        Turn on the shop for this website to choose which product appears on each card. Until then the strip shows the
        first products automatically.
      </p>
    );
  }

  const titleOf = (productId: string) => {
    if (!productId) return "No product chosen";
    const product = names.get(productId);
    return product ? product.name : product === null ? "Removed product" : "Loading…";
  };

  return (
    <>
      <ItemList<ProductsFeaturedPick>
        label="Cards"
        items={picks}
        max={MAX_PICKS}
        onChange={(next) => onChange(next.length > 0 ? next : undefined)}
        create={() => ({ productId: "" })}
        itemTitle={(pick, index) => `${index + 1}. ${titleOf(pick.productId)}`}
        addLabel="Add card"
        renderItem={(pick, update) => (
          <>
            <ProductSearch
              websiteId={website.id}
              chosenId={pick.productId}
              chosen={names.get(pick.productId)}
              onChoose={(product) => {
                remember(product);
                update({ ...pick, productId: product.id });
              }}
            />
            <TextField
              label="Badge (optional)"
              value={pick.badge ?? ""}
              onChange={(badge) => update({ ...pick, badge: badge || undefined })}
              maxLength={16}
              placeholder="NEW"
            />
          </>
        )}
      />
      <p className="text-ed-2xs text-ed-muted leading-normal">
        {picks.length > 0
          ? "Cards appear in this order; drag to reorder. Hidden or deleted products are skipped on the live site."
          : "No cards yet, so the strip shows the first products automatically. Add a card to choose each product."}
      </p>
    </>
  );
}
