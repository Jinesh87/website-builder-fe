import { useEffect, useState } from "react";
import { parseRichText, SectionShell } from "../primitives.tsx";
import ShopCartActions from "../ShopCartActions.tsx";
import { coverImage, formatInr, shopCancelPolicyText, SHOP_DETAIL_SCRIPT, useShopCatalog } from "../shop-catalog.tsx";
import { SHOP_CART_SCRIPT } from "../shop-auth.ts";
import { useStaticRender } from "../render-mode.tsx";
import type { ProductDetailData, SectionOf, ShopCatalogProduct, ShopCatalogVariant } from "../types.ts";

const SAMPLE: ShopCatalogProduct = {
  id: "sample-detail",
  name: "Everyday tee",
  slug: "everyday-tee",
  description: "A soft cotton tee. Pick a size and a colour.",
  categoryName: "Tops",
  images: [],
  variants: [
    {
      id: "s1",
      name: "S / Black",
      pricePaise: 89900,
      quantity: 12,
      images: [],
      options: [
        { name: "Size", value: "S" },
        { name: "Colour", value: "Black" },
      ],
    },
    {
      id: "s2",
      name: "M / Blue",
      pricePaise: 99900,
      quantity: 0,
      images: [],
      options: [
        { name: "Size", value: "M" },
        { name: "Colour", value: "Blue" },
      ],
    },
  ],
};

type Choice = { name: string; value: string };

function choicesFor(variant: ShopCatalogVariant, variants: ShopCatalogProduct["variants"]): Choice[] {
  if (variant.options.length > 0) return variant.options;
  if (variants.length > 1) return [{ name: "Option", value: variant.name }];
  return [];
}

function optionGroups(variants: ShopCatalogProduct["variants"]): { name: string; values: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const variant of variants) {
    for (const option of choicesFor(variant, variants)) {
      const values = groups.get(option.name) ?? [];
      if (!values.includes(option.value)) values.push(option.value);
      groups.set(option.name, values);
    }
  }
  return [...groups.entries()].map(([name, values]) => ({ name, values }));
}

function matches(variant: ShopCatalogVariant, variants: ShopCatalogProduct["variants"], pick: Record<string, string>): boolean {
  const options = choicesFor(variant, variants);
  const keys = Object.keys(pick);
  return options.length === keys.length && options.every((option) => pick[option.name] === option.value);
}

function pickVariant(variants: ShopCatalogProduct["variants"], selected: ShopCatalogVariant, name: string, value: string): ShopCatalogVariant {
  const current = Object.fromEntries(choicesFor(selected, variants).map((option) => [option.name, option.value]));
  const next = { ...current, [name]: value };
  return (
    variants.find((variant) => matches(variant, variants, next)) ??
    variants.find((variant) => choicesFor(variant, variants).some((option) => option.name === name && option.value === value)) ??
    selected
  );
}

function variantForSelection(product: ShopCatalogProduct, selection: Record<string, string> | undefined): ShopCatalogVariant | undefined {
  const entries = Object.entries(selection ?? {}).filter(([, value]) => value.trim());
  if (entries.length === 0) return product.variants[0];
  return (
    product.variants.find((variant) =>
      entries.every(([name, value]) =>
        variant.options.some((option) => option.name.toLowerCase() === name.toLowerCase() && option.value.toLowerCase() === value.toLowerCase()),
      ),
    ) ?? product.variants[0]
  );
}

function comboOut(variants: ShopCatalogProduct["variants"], selected: ShopCatalogVariant, name: string, value: string): boolean {
  const current = Object.fromEntries(choicesFor(selected, variants).map((option) => [option.name, option.value]));
  const exact = variants.find((variant) => matches(variant, variants, { ...current, [name]: value }));
  return !!exact && exact.quantity <= 0;
}

export default function ProductDetailSection({ section }: { section: SectionOf<"product_detail"> }) {
  const data = section.data as ProductDetailData;
  const catalog = useShopCatalog();
  const stat = useStaticRender();
  const live = catalog?.live === true;
  const websiteId = live ? catalog?.websiteId : undefined;
  const authHref = catalog?.authHref || "/login";
  const accountHref = catalog?.accountHref || "/account";
  const interactive = !stat && !!websiteId;
  const product = live
    ? catalog.products.find((item) => item.slug === catalog.productSlug) ?? (catalog.productSlug ? undefined : catalog.products[0])
    : SAMPLE;
  const preferredId = product ? (variantForSelection(product, catalog?.selection)?.id ?? "") : "";
  const [variantId, setVariantId] = useState(preferredId);
  const [imageIndex, setImageIndex] = useState(0);
  const selectionKey = JSON.stringify(catalog?.selection ?? {});
  const showStock = data.showStock !== false;
  const showDescription = data.showDescription !== false;
  const showCancellationPolicy = data.showCancellationPolicy !== false;
  const cancelPolicy =
    showCancellationPolicy
      ? shopCancelPolicyText(catalog?.cancelUntilStatus ?? (!live ? "paid" : null))
      : null;
  const selected = product?.variants.find((variant) => variant.id === variantId) ?? product?.variants[0];
  const groups = product ? optionGroups(product.variants) : [];
  const photos = selected && selected.images.length > 0 ? selected.images : (product?.images ?? []);
  const hero = photos[imageIndex] ?? photos[0] ?? (product ? coverImage(product) : null);

  useEffect(() => {
    setVariantId(preferredId);
    setImageIndex(0);
  }, [product?.id, selectionKey, preferredId]);

  const payload = product
    ? product.variants.map((variant) => {
        const gallery = variant.images.length > 0 ? variant.images : product.images;
        return {
          id: variant.id,
          price: formatInr(variant.pricePaise),
          stock: variant.quantity > 0 ? `${variant.quantity} in stock` : "Out of stock",
          stockQty: variant.quantity,
          out: variant.quantity <= 0,
          image: gallery[0]?.url ?? "",
          alt: gallery[0]?.alt || product.name,
          images: gallery.map((photo) => ({ url: photo.url, alt: photo.alt || product.name })),
          options: Object.fromEntries(choicesFor(variant, product.variants).map((option) => [option.name, option.value])),
        };
      })
    : [];

  const design = data.design || "split";

  const renderProduct = (product: ShopCatalogProduct, selected: ShopCatalogVariant) => {
    const hasDescription = showDescription && !!product.description;
    const stepPhoto = (delta: number) => {
      if (photos.length < 2) return;
      setImageIndex((index) => (index + delta + photos.length) % photos.length);
    };
    const gallery = (
      <div className="wb-product-gallery">
        <div
          className="wb-product-hero"
          data-wb-stage=""
          onPointerDown={stat ? undefined : (event) => {
            if ((event.target as HTMLElement).closest("[data-wb-photo]")) return;
            event.currentTarget.dataset.swipeX = String(event.clientX);
          }}
          onPointerUp={stat ? undefined : (event) => {
            const start = Number(event.currentTarget.dataset.swipeX);
            delete event.currentTarget.dataset.swipeX;
            if (!Number.isFinite(start) || photos.length < 2) return;
            const distance = event.clientX - start;
            if (Math.abs(distance) < 40) return;
            stepPhoto(distance < 0 ? 1 : -1);
          }}
        >
          {hero ? <img data-wb-hero="" src={hero.url} alt={hero.alt || product.name} /> : <span className="wb-shop-fallback">{product.name.slice(0, 1)}</span>}
          <button type="button" className="wb-product-nav is-prev" data-wb-photo="prev" aria-label="Previous photo" hidden={photos.length < 2} onClick={stat ? undefined : () => stepPhoto(-1)}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4 L6 10 L12 16" /></svg>
          </button>
          <button type="button" className="wb-product-nav is-next" data-wb-photo="next" aria-label="Next photo" hidden={photos.length < 2} onClick={stat ? undefined : () => stepPhoto(1)}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4 L14 10 L8 16" /></svg>
          </button>
        </div>
        <div className="wb-product-thumbs" data-wb-thumbs="" hidden={photos.length < 2}>
          {photos.map((photo, index) => (
            <button
              key={`${photo.url}-${index}`}
              type="button"
              className={`wb-product-thumb${index === imageIndex ? " is-active" : ""}`}
              data-wb-thumb=""
              data-src={photo.url}
              data-alt={photo.alt || product.name}
              aria-pressed={index === imageIndex}
              onClick={stat ? undefined : () => setImageIndex(index)}
              aria-label={`Photo ${index + 1}`}
            >
              <img src={photo.url} alt="" />
            </button>
          ))}
        </div>
      </div>
    );
    const heading = (
      <header className="wb-product-heading">
        <span className="wb-shop-category">{product.categoryName}</span>
        <h2 className="wb-shop-title">{parseRichText(product.name)}</h2>
      </header>
    );
    const buy = (
      <div className="wb-product-buy">
        <div className="wb-product-buy-meta">
          <p className="wb-product-price" data-wb-price="">{formatInr(selected.pricePaise)}</p>
          {showStock && (
            <p className={`wb-product-stock${selected.quantity > 0 ? "" : " is-out"}`} data-wb-stock="">
              {selected.quantity > 0 ? `${selected.quantity} in stock` : "Out of stock"}
            </p>
          )}
        </div>
        <ShopCartActions
          variantId={selected.id}
          websiteId={websiteId}
          authHref={authHref}
          accountHref={accountHref}
          outOfStock={selected.quantity <= 0}
          stockMax={selected.quantity}
          interactive={interactive}
          loginPromptVariant={design === "editorial" ? "minimal" : design === "compact" ? "glass" : design === "gallery-focus" ? "split" : "soft-card"}
        />
      </div>
    );
    const options =
      groups.length > 0 ? (
        <div className="wb-product-options">
          {groups.map((group) => (
            <div key={group.name} className="wb-option">
              <span className="wb-option-name">{group.name}</span>
              <div className="wb-option-values">
                {group.values.map((value) => {
                  const active = choicesFor(selected, product.variants).some((option) => option.name === group.name && option.value === value);
                  const out = comboOut(product.variants, selected, group.name, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`wb-option-value${active ? " is-active" : ""}${out ? " is-out" : ""}`}
                      aria-pressed={active}
                      data-wb-option={group.name}
                      data-wb-value={value}
                      onClick={stat ? undefined : () => { setVariantId(pickVariant(product.variants, selected, group.name, value).id); setImageIndex(0); }}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null;
    const description = hasDescription ? <p className="wb-product-desc">{product.description}</p> : null;
    const policy = cancelPolicy ? (
      <aside className="wb-product-policy" aria-label="Cancellation policy">
        <p className="wb-product-policy-label">Cancellation</p>
        <p className="wb-product-policy-text">{cancelPolicy}</p>
      </aside>
    ) : null;
    const detailsBody = (
      <>
        {description}
        {policy}
      </>
    );
    const hasDetails = hasDescription || !!cancelPolicy;

    let layout;
    if (design === "gallery-focus") {
      layout = (
        <>
          <div className="wb-product-stage">{gallery}</div>
          <aside className="wb-product-panel">
            {heading}
            {buy}
            {options}
          </aside>
          {hasDetails && (
            <section className="wb-product-details">
              <h3 className="wb-product-details-title">Details</h3>
              {detailsBody}
            </section>
          )}
        </>
      );
    } else if (design === "editorial") {
      layout = (
        <>
          <div className="wb-product-intro">
            {heading}
            {buy}
          </div>
          {gallery}
          <div className="wb-product-band">
            {options && <div className="wb-product-band-card">{options}</div>}
            {hasDetails && (
              <div className="wb-product-band-card">
                <h3 className="wb-product-details-title">About this product</h3>
                {detailsBody}
              </div>
            )}
          </div>
        </>
      );
    } else if (design === "compact") {
      layout = (
        <>
          {gallery}
          <div className="wb-product-copy">
            {heading}
            {description}
            {policy}
            {buy}
            {options}
          </div>
        </>
      );
    } else {
      layout = (
        <>
          {gallery}
          <div className="wb-product-copy">
            {heading}
            {buy}
            {options}
            {hasDetails && (
              <div className="wb-product-details">
                <h3 className="wb-product-details-title">Description</h3>
                {detailsBody}
              </div>
            )}
          </div>
        </>
      );
    }

    return (
      <article
        className="wb-product"
        data-wb-detail=""
        data-wb-shop-website={websiteId || undefined}
        data-wb-shop-auth-href={authHref}
        data-wb-shop-account-href={accountHref}
        data-wb-cart-login-variant={design === "editorial" ? "minimal" : design === "compact" ? "glass" : design === "gallery-focus" ? "split" : "soft-card"}
      >
        {layout}
        {stat && <script type="application/json" data-wb-variants="" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }} />}
        {stat && <script dangerouslySetInnerHTML={{ __html: SHOP_DETAIL_SCRIPT }} />}
        {stat && websiteId && <script dangerouslySetInnerHTML={{ __html: SHOP_CART_SCRIPT }} />}
      </article>
    );
  };

  return (
    <SectionShell sectionId={section.id} settings={section.settings}>
      <div className={`wb-shop wb-shop-detail is-${design}`}>
        <a className="wb-product-back" href={data.backHref || "/shop"}>{data.backLabel || "All products"}</a>
        {!product || !selected ? <p className="wb-shop-empty">This product is not in the shop.</p> : renderProduct(product, selected)}
        {!live && !stat && <p className="wb-shop-note">Sample product. The published page shows the product from the link.</p>}
      </div>
    </SectionShell>
  );
}
