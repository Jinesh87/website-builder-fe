import { useContext, useEffect, useState } from "react";
import { shopApi, type ShopProduct } from "../../../api/shop.ts";
import { EditorContext } from "../../../features/builder/editor-context.ts";
import type { ProductsFeaturedPick } from "../../../site-kit/index.ts";
import { ItemList, SelectField, TextField } from "./fields.tsx";

const MAX_PICKS = 12;
const PAGE_SIZE = 50;

/** Every product of this website's shop, for the picker; null while loading or when the shop is off. */
function useShopProducts(): { products: ShopProduct[] | null; shopOn: boolean } {
  const website = useContext(EditorContext)?.website;
  const shopOn = Boolean(website?.shopFeatureEnabled && website.shopEnabled);
  const websiteId = website?.id;
  const [products, setProducts] = useState<ShopProduct[] | null>(null);

  useEffect(() => {
    if (!shopOn || !websiteId) {
      setProducts(null);
      return;
    }
    let cancel = false;
    (async () => {
      const first = await shopApi.products(websiteId, { page: 1, pageSize: PAGE_SIZE });
      const loaded = [...first.products];
      for (let page = 2; page <= Math.ceil(first.total / PAGE_SIZE); page += 1) {
        loaded.push(...(await shopApi.products(websiteId, { page, pageSize: PAGE_SIZE })).products);
      }
      if (!cancel) setProducts(loaded);
    })().catch(() => {
      if (!cancel) setProducts([]);
    });
    return () => {
      cancel = true;
    };
  }, [shopOn, websiteId]);

  return { products, shopOn };
}

/** Lets the featured product strip show a chosen product on each card. */
export function FeaturedProductPicks({
  picks,
  onChange,
}: {
  picks: ProductsFeaturedPick[];
  onChange: (picks: ProductsFeaturedPick[] | undefined) => void;
}) {
  const { products, shopOn } = useShopProducts();

  if (!shopOn) {
    return (
      <p className="text-ed-2xs text-ed-muted leading-normal">
        Turn on the shop for this website to choose which product appears on each card. Until then the strip shows the
        first products automatically.
      </p>
    );
  }
  if (!products) return <p className="text-ed-2xs text-ed-muted">Loading products…</p>;
  if (products.length === 0) {
    return <p className="text-ed-2xs text-ed-muted">Add products in the shop panel, then choose them here.</p>;
  }

  const nameOf = (id: string) => products.find((product) => product.id === id)?.name;
  const options = [
    { value: "", label: "Choose a product…" },
    ...products.map((product) => ({
      value: product.id,
      label: product.listed ? product.name : `${product.name} (hidden from shop)`,
    })),
  ];

  return (
    <>
      <ItemList<ProductsFeaturedPick>
        label="Cards"
        items={picks}
        max={MAX_PICKS}
        onChange={(next) => onChange(next.length > 0 ? next : undefined)}
        create={() => ({ productId: "" })}
        itemTitle={(pick, index) => `${index + 1}. ${nameOf(pick.productId) ?? (pick.productId ? "Removed product" : "No product chosen")}`}
        addLabel="Add card"
        renderItem={(pick, update) => (
          <>
            <SelectField
              label="Product"
              value={nameOf(pick.productId) ? pick.productId : ""}
              options={options}
              onChange={(productId) => update({ ...pick, productId })}
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
