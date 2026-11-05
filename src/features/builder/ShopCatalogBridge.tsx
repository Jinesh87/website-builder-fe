import { useEffect, useState, type ReactNode } from "react";
import { shopApi, type ShopProduct } from "../../api/shop.ts";
import { ShopCatalogProvider } from "../../site-kit/shop-catalog.tsx";
import type { ShopCancelUntilStatus, ShopCatalogProduct } from "../../site-kit/index.ts";
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

function payableUnitPaise(pricePaise: number, gstPercent: number, priceIncludesGst: boolean): number {
  const percent = Math.max(0, Math.min(100, Math.floor(gstPercent || 0)));
  if (percent <= 0 || priceIncludesGst) return pricePaise;
  return Math.round(pricePaise * (1 + percent / 100));
}

function toCatalogProduct(
  product: ShopProduct,
  shop: { shopReturnDays?: number | null; shopGstPercent?: number; shopPriceIncludesGst?: boolean },
): ShopCatalogProduct {
  const shopReturnDays = shop.shopReturnDays;
  const returnDays =
    !shopReturnDays || shopReturnDays < 1 || product.returnsEnabled === false
      ? null
      : product.returnDays ?? shopReturnDays;
  const gstPercent = product.gstPercent ?? shop.shopGstPercent ?? 0;
  const priceIncludesGst = (product.priceIncludesGst ?? shop.shopPriceIncludesGst) !== false;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryName: product.categoryName,
    gstPercent,
    priceIncludesGst,
    returnDays,
    images: (product.images ?? []).map(({ url, alt }) => ({ url, alt })),
    variants: product.variants.map((variant) => {
      const own = (variant.images ?? []).map(({ url, alt }) => ({ url, alt }));
      return {
        id: variant.id,
        name: variant.name,
        pricePaise: payableUnitPaise(variant.pricePaise, gstPercent, priceIncludesGst),
        quantity: variant.quantity,
        images: own.length > 0 ? own : sharedValuePhotos(product, variant.name),
        options: variantOptions(product, variant.name),
      };
    }),
  };
}

type ShopWebsite = {
  id: string;
  shopEnabled: boolean;
  shopFeatureEnabled: boolean;
  shopCancelUntilStatus?: ShopCancelUntilStatus | null;
  shopReturnDays?: number | null;
  shopReturnGuidelines?: string[];
  shopGstPercent?: number;
  shopPriceIncludesGst?: boolean;
};

/** Loads a website’s shop catalogue for editor canvas and draft preview. */
export function WebsiteShopCatalogProvider({
  website,
  productSlug,
  selection,
  children,
}: {
  website: ShopWebsite | null | undefined;
  productSlug?: string;
  selection?: Record<string, string>;
  children: ReactNode;
}) {
  const [products, setProducts] = useState<ShopCatalogProduct[] | null>(null);

  useEffect(() => {
    if (!website?.shopFeatureEnabled || !website.shopEnabled) {
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
        if (!cancel) setProducts(loaded.map((product) => toCatalogProduct(product, website)));
      })
      .catch(() => {
        if (!cancel) setProducts([]);
      });
    return () => {
      cancel = true;
    };
  }, [website?.id, website?.shopEnabled, website?.shopFeatureEnabled, website?.shopReturnDays]);

  const catalog =
    website?.shopFeatureEnabled && website.shopEnabled && products
      ? {
          websiteId: website.id,
          authHref: "/login",
          accountHref: "/account",
          cancelUntilStatus: website.shopCancelUntilStatus,
          returnGuidelines: website.shopReturnGuidelines ?? [],
          products,
          productSlug,
          selection,
          live: true as const,
        }
      : null;

  return <ShopCatalogProvider value={catalog}>{children}</ShopCatalogProvider>;
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
  return (
    <WebsiteShopCatalogProvider website={website} productSlug={productSlug} selection={selection}>
      {children}
    </WebsiteShopCatalogProvider>
  );
}
