import { useEffect, useState, type ReactNode } from "react";
import { shopApi, type ShopProduct } from "../../api/shop.ts";
import { ShopCatalogProvider } from "../../site-kit/shop-catalog.tsx";
import type { ShopCatalogProduct } from "../../site-kit/index.ts";
import { useEditor } from "./editor-context.ts";

function variantOptions(product: ShopProduct, variantName: string): { name: string; value: string }[] {
  for (const set of product.optionSets ?? []) {
    if (set.options.length === 0) continue;
    const combos = set.options.reduce<string[][]>(
      (sets, option) => sets.flatMap((prefix) => option.values.map((value) => [...prefix, value])),
      [[]],
    );
    for (const values of combos) {
      if (values.join(" / ") === variantName) {
        return set.options.map((option, index) => ({
          name: option.name,
          value: values[index] ?? "",
          ...(option.listOnShop ? { list: true } : {}),
        }));
      }
    }
  }
  return [];
}

function sharedValuePhotos(product: ShopProduct, variantName: string): { url: string; alt: string }[] {
  for (const set of product.optionSets ?? []) {
    if (set.options.length === 0) continue;
    const combos = set.options.reduce<string[][]>(
      (sets, option) => sets.flatMap((prefix) => option.values.map((value) => [...prefix, value])),
      [[]],
    );
    const values = combos.find((combo) => combo.join(" / ") === variantName);
    if (!values) continue;
    for (let index = set.options.length - 1; index >= 0; index -= 1) {
      const option = set.options[index];
      const value = values[index] ?? "";
      const photos = option?.images?.find((group) => group.value.toLowerCase() === value.toLowerCase())?.images ?? [];
      const ready = photos.flatMap((image) => (image.url ? [{ url: image.url, alt: image.alt }] : []));
      if (ready.length > 0) return ready;
    }
  }
  return [];
}

function toCatalogProduct(product: ShopProduct): ShopCatalogProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryName: product.categoryName,
    images: (product.images ?? []).map(({ url, alt }) => ({ url, alt })),
    variants: product.variants.map((variant) => {
      const own = (variant.images ?? []).map(({ url, alt }) => ({ url, alt }));
      return {
        id: variant.id,
        name: variant.name,
        pricePaise: variant.pricePaise,
        quantity: variant.quantity,
        images: own.length > 0 ? own : sharedValuePhotos(product, variant.name),
        options: variantOptions(product, variant.name),
      };
    }),
  };
}

/** Loads this website’s shop so product sections on the canvas show the real catalogue. */
export default function ShopCatalogBridge({
  productSlug,
  selection,
  children,
}: {
  productSlug?: string;
  selection?: Record<string, string>;
  children: ReactNode;
}) {
  const { website } = useEditor();
  const [products, setProducts] = useState<ShopCatalogProduct[] | null>(null);

  useEffect(() => {
    if (!website.shopFeatureEnabled || !website.shopEnabled) {
      setProducts(null);
      return;
    }
    let cancel = false;
    const pageSize = 50;
    shopApi
      .products(website.id, { page: 1, pageSize })
      .then(async (first) => {
        const loaded = [...first.products];
        const pages = Math.ceil(first.total / pageSize);
        for (let page = 2; page <= pages; page += 1) {
          const next = await shopApi.products(website.id, { page, pageSize });
          loaded.push(...next.products);
        }
        if (!cancel) setProducts(loaded.map(toCatalogProduct));
      })
      .catch(() => {
        if (!cancel) setProducts(null);
      });
    return () => {
      cancel = true;
    };
  }, [website.id, website.shopEnabled, website.shopFeatureEnabled]);

  const catalog = products
    ? { websiteId: website.id, authHref: "/login", products, productSlug, selection, live: true as const }
    : null;
  return <ShopCatalogProvider value={catalog}>{children}</ShopCatalogProvider>;
}
