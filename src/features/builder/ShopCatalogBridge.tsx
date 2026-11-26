import { useEffect, useState, type ReactNode } from "react";
import { shopApi, type ShopCoupon, type ShopProduct } from "../../api/shop.ts";
import { ShopCatalogProvider } from "../../site-kit/shop-catalog.tsx";
import type { ShopCancelUntilStatus, ShopCatalogCoupon, ShopCatalogProduct } from "../../site-kit/index.ts";
import { payablePaise, sharedValuePhotos, variantOptions } from "../../components/shop/product-variants.ts";
import { useEditor } from "./editor-context.ts";

function toCatalogCoupon(coupon: ShopCoupon): ShopCatalogCoupon {
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    scope: coupon.scope,
    variantId: coupon.variantId,
    variantName: coupon.variantName,
    expiresAt: coupon.expiresAt,
  };
}

function isPublicCoupon(coupon: ShopCoupon): boolean {
  if (!coupon.active) return false;
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now()) return false;
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return false;
  return true;
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
        pricePaise: payablePaise(variant.pricePaise, gstPercent, priceIncludesGst),
        quantity: variant.quantity,
        images: own.length > 0 ? own : sharedValuePhotos(product, variant.name).map(({ url, alt }) => ({ url, alt })),
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
  const [coupons, setCoupons] = useState<ShopCoupon[]>([]);

  useEffect(() => {
    if (!website?.shopFeatureEnabled || !website.shopEnabled) {
      setProducts(null);
      setCoupons([]);
      return;
    }
    let cancel = false;
    // The canvas only ever shows a strip or one page of cards, so the first 100 products are enough;
    // big shops would otherwise download their whole catalogue every time the editor opens.
    const pageSize = 50;
    shopApi
      .products(website.id, { page: 1, pageSize })
      .then(async (first) => {
        const loaded = [...first.products];
        if (first.total > pageSize) loaded.push(...(await shopApi.products(website.id, { page: 2, pageSize })).products);
        if (!cancel) setProducts(loaded.map((product) => toCatalogProduct(product, website)));
      })
      .catch(() => {
        if (!cancel) setProducts([]);
      });
    shopApi
      .coupons(website.id)
      .then((rows) => {
        if (!cancel) setCoupons(rows.filter(isPublicCoupon));
      })
      .catch(() => {
        if (!cancel) setCoupons([]);
      });
    return () => {
      cancel = true;
    };
  }, [website?.id, website?.shopEnabled, website?.shopFeatureEnabled, website?.shopReturnDays]);

  // Match ProductDetailSection: with no slug, the canvas previews products[0].
  const previewProduct =
    (productSlug ? products?.find((product) => product.slug === productSlug) : undefined) ??
    products?.[0];
  const detailCoupons: ShopCatalogCoupon[] = previewProduct
    ? coupons
        .filter((coupon) => coupon.scope === "cart" || coupon.productId === previewProduct.id)
        .map(toCatalogCoupon)
    : coupons.filter((coupon) => coupon.scope === "cart").map(toCatalogCoupon);

  const catalog =
    website?.shopFeatureEnabled && website.shopEnabled && products
      ? {
          websiteId: website.id,
          authHref: "/login",
          accountHref: "/account",
          cancelUntilStatus: website.shopCancelUntilStatus,
          returnGuidelines: website.shopReturnGuidelines ?? [],
          coupons: detailCoupons,
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
