import { useEffect, useRef, useState } from "react";
import { Button, Label, Spinner, Switch } from "@heroui/react";
import { ChevronLeft, ImagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ACCEPT_BY_KIND, mediaApi, uploadProblem } from "../../api/media.ts";
import { shopApi, type ShopCategory, type ShopImage, type ShopProduct, type ShopProductInput, type ShopVariant } from "../../api/shop.ts";
import { errorMessage } from "../../api/http.ts";
import { formatPaise } from "../../api/wallet.ts";
import { websitesApi, type WebsiteDetail } from "../../api/websites.ts";
import ShopCustomersPanel from "./ShopCustomersPanel.tsx";
import { ShopInventoryLogPanel, ShopInventoryPanel } from "./ShopInventoryPanel.tsx";
import ShopRazorpayPanel from "./ShopRazorpayPanel.tsx";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";
import TextInput from "../ui/TextInput.tsx";
import { optimizeImageToWebP } from "../../utils/image-optimizer.ts";

type OptionDraft = { key: string; name: string; values: string[]; listOnShop: boolean; images: Record<string, ShopImage[]> };
type SetDraft = {
  key: string;
  price: string;
  options: OptionDraft[];
  /** Combination key → rupee price, only when it differs from the set price. */
  overrides: Record<string, string>;
  /** Combination key → photos for that variant. */
  images: Record<string, ShopImage[]>;
  showPrices: boolean;
};
type ProductDraft = {
  id?: string;
  originalCategoryId?: string;
  name: string;
  description: string;
  categoryId: string;
  sets: SetDraft[];
  images: ShopImage[];
};

function blankOption(): OptionDraft {
  return { key: crypto.randomUUID(), name: "", values: [], listOnShop: false, images: {} };
}

function blankSet(): SetDraft {
  return { key: crypto.randomUUID(), price: "", options: [blankOption()], overrides: {}, images: {}, showPrices: false };
}

function blankProduct(categoryId = ""): ProductDraft {
  return { name: "", description: "", categoryId, sets: [blankSet()], images: [] };
}

function variantKey(values: string[]): string {
  return values.map((value) => value.trim().toLowerCase()).join("\u001f");
}

function combinations(options: OptionDraft[]): string[][] {
  const filled = options.filter((option) => option.values.length > 0);
  if (filled.length === 0) return [];
  return filled.reduce<string[][]>(
    (sets, option) => sets.flatMap((prefix) => option.values.map((value) => [...prefix, value])),
    [[]],
  );
}

function rupeesToPaise(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole = "0", frac = ""] = trimmed.split(".");
  const paise = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (!Number.isSafeInteger(paise) || paise > 1_000_000_000) return null;
  return paise;
}

function paiseToRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

function variantOptions(product: ShopProduct, variantName: string): { name: string; value: string }[] {
  for (const set of product.optionSets ?? []) {
    if (set.options.length === 0) continue;
    const combos = set.options.reduce<string[][]>(
      (sets, option) => sets.flatMap((prefix) => option.values.map((value) => [...prefix, value])),
      [[]],
    );
    for (const values of combos) {
      if (values.join(" / ") === variantName) {
        return set.options.map((option, index) => ({ name: option.name, value: values[index] ?? "" }));
      }
    }
  }
  return [];
}

function sharedValuePhotos(product: ShopProduct, variantName: string): ShopImage[] {
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
      const photos = (option?.images?.find((group) => group.value.toLowerCase() === value.toLowerCase())?.images ?? []).flatMap((image) =>
        image.url ? [{ mediaId: image.mediaId, url: image.url, alt: image.alt }] : [],
      );
      if (photos.length > 0) return photos;
    }
  }
  return [];
}

function variantPhotos(product: ShopProduct, variant: ShopVariant): ShopImage[] {
  if (variant.images?.length) return variant.images;
  const shared = sharedValuePhotos(product, variant.name);
  return shared.length > 0 ? shared : (product.images ?? []);
}

function coverUrl(product: ShopProduct): string | null {
  return product.images?.[0]?.url ?? product.variants.find((variant) => (variant.images?.length ?? 0) > 0)?.images[0]?.url ?? null;
}

function priceLabel(product: ShopProduct): string {
  const prices = product.variants.map((variant) => variant.pricePaise);
  if (prices.length === 0) return "No price";
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? formatPaise(low) : `${formatPaise(low)} – ${formatPaise(high)}`;
}

function toInput(draft: ProductDraft): { input: ShopProductInput } | { error: string } {
  if (!draft.categoryId) return { error: "Choose a category" };
  if (!draft.name.trim()) return { error: "Enter a product name" };
  const seen = new Set<string>();
  const optionSets = [];
  for (const set of draft.sets) {
    const pricePaise = rupeesToPaise(set.price);
    if (pricePaise === null) return { error: "Enter a price for each combination" };
    const options = set.options.filter((option) => option.name.trim() || option.values.length > 0);
    for (const option of options) {
      if (!option.name.trim()) return { error: "Name each option, such as Size or Colour" };
      if (option.values.length === 0) return { error: `Add at least one ${option.name.trim()}` };
    }
    const combos = options.length === 0 ? [[]] : combinations(options);
    if (combos.length === 0) return { error: "Add option values, or remove the empty option" };
    const overrides = [];
    const imageGroups = [];
    for (const values of combos) {
      const key = variantKey(values);
      const label = values.length > 0 ? values.join(" / ") : "Standard";
      if (seen.has(key)) return { error: `${label} is already included in another combination` };
      seen.add(key);
      const custom = set.overrides[key];
      if (custom !== undefined) {
        const customPaise = rupeesToPaise(custom);
        if (customPaise === null) return { error: `Enter a valid price for ${label}` };
        if (customPaise !== pricePaise) overrides.push({ key, pricePaise: customPaise });
      }
      const photos = set.images[key] ?? [];
      if (photos.length > 0) {
        imageGroups.push({ key, images: photos.map((image) => ({ mediaId: image.mediaId, alt: image.alt })) });
      }
    }
    optionSets.push({
      pricePaise,
      options: options.map((option) => {
        const images = option.values.flatMap((value) => {
          const photos = option.images[value.trim().toLowerCase()] ?? [];
          if (photos.length === 0) return [];
          return [{ value: value.trim(), images: photos.map((image) => ({ mediaId: image.mediaId, alt: image.alt })) }];
        });
        return {
          name: option.name.trim(),
          values: option.values,
          ...(option.listOnShop ? { listOnShop: true } : {}),
          ...(images.length > 0 ? { images } : {}),
        };
      }),
      ...(overrides.length > 0 ? { overrides } : {}),
      ...(imageGroups.length > 0 ? { images: imageGroups } : {}),
    });
  }
  return {
    input: {
      name: draft.name.trim(),
      description: draft.description.trim(),
      categoryId: draft.categoryId,
      optionSets,
      images: draft.images.map((image) => ({ mediaId: image.mediaId, alt: image.alt })),
    },
  };
}

function setsFromProduct(product: ShopProduct): SetDraft[] {
  if ((product.optionSets ?? []).length > 0) {
    return product.optionSets.map((set) => ({
      key: crypto.randomUUID(),
      price: paiseToRupees(set.pricePaise),
      options:
        set.options.length > 0
          ? set.options.map((option) => ({
              key: crypto.randomUUID(),
              name: option.name,
              values: [...option.values],
              listOnShop: option.listOnShop === true,
              images: Object.fromEntries(
                (option.images ?? []).flatMap((group) => {
                  const photos = group.images.flatMap((image) => (image.url ? [{ mediaId: image.mediaId, url: image.url, alt: image.alt }] : []));
                  return photos.length > 0 ? [[group.value.trim().toLowerCase(), photos] as const] : [];
                }),
              ),
            }))
          : [],
      overrides: Object.fromEntries((set.overrides ?? []).map((override) => [override.key, paiseToRupees(override.pricePaise)])),
      images: Object.fromEntries((set.images ?? []).map((group) => [group.key, group.images])),
      showPrices: (set.overrides ?? []).length > 0,
    }));
  }
  return [blankSet()];
}

type ShopSection = "category" | "settings" | "products" | "customers" | "inventory" | "inventory-log" | "razorpay";

const SHOP_SECTIONS: { id: ShopSection; label: string }[] = [
  { id: "category", label: "Category" },
  { id: "settings", label: "Shop settings" },
  { id: "products", label: "Products" },
  { id: "customers", label: "Customers" },
  { id: "inventory", label: "Inventory" },
  { id: "inventory-log", label: "Inventory log" },
  { id: "razorpay", label: "Razorpay" },
];

function optionSummary(product: ShopProduct): string {
  const names = [...new Set(product.optionSets.flatMap((set) => set.options.map((option) => option.name)))];
  const count = `${product.variants.length} ${product.variants.length === 1 ? "variant" : "variants"}`;
  return names.length > 0 ? `${names.join(", ")} · ${count}` : count;
}

export default function ShopPanel({
  website,
  onChange,
}: {
  website: WebsiteDetail;
  onChange: (website: WebsiteDetail) => void;
}) {
  const [section, setSection] = useState<ShopSection>(website.shopEnabled ? "products" : "settings");
  const [turning, setTurning] = useState(false);
  const [turnError, setTurnError] = useState<string | null>(null);

  async function setShopEnabled(shopEnabled: boolean) {
    setTurning(true);
    setTurnError(null);
    try {
      onChange(await websitesApi.update(website.id, { shopEnabled }));
    } catch (err) {
      setTurnError(errorMessage(err));
    } finally {
      setTurning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Shop" className="flex gap-1 overflow-x-auto border-b border-line">
        {SHOP_SECTIONS.map(({ id, label }) => {
          const active = section === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSection(id)}
              className={`relative -mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors ${
                active ? "border-ink font-medium text-ink" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {section === "settings" && (
        <section className="rounded-xl border border-line bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-base font-semibold text-ink">Shop settings</h2>
              <p className="mt-1 text-sm text-ink-body">
                {website.shopEnabled
                  ? "Products and categories stay saved if you turn the shop off. Turn it back on to keep editing them."
                  : "Turn the shop on for this website, then add categories and products."}
              </p>
            </div>
            <Switch isSelected={website.shopEnabled} onChange={setShopEnabled} isDisabled={turning}>
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Label className="text-sm text-ink">{website.shopEnabled ? "Shop on" : "Shop off"}</Label>
              </Switch.Content>
            </Switch>
          </div>
          {turnError && (
            <div className="mt-4">
              <FormAlert status="danger">{turnError}</FormAlert>
            </div>
          )}
        </section>
      )}

      {section === "razorpay" && <ShopRazorpayPanel websiteId={website.id} />}

      {(section === "category" ||
        section === "products" ||
        section === "customers" ||
        section === "inventory" ||
        section === "inventory-log") &&
        !website.shopEnabled && (
        <section className="rounded-xl border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm text-ink-body">Turn the shop on in Shop settings before managing categories, products, customers, or stock.</p>
          <Button size="sm" variant="outline" className="mt-4" onPress={() => setSection("settings")}>
            Open shop settings
          </Button>
        </section>
      )}

      {section === "customers" && website.shopEnabled && <ShopCustomersPanel websiteId={website.id} />}
      {section === "inventory" && website.shopEnabled && <ShopInventoryPanel websiteId={website.id} />}
      {section === "inventory-log" && website.shopEnabled && <ShopInventoryLogPanel websiteId={website.id} />}

      {(section === "category" || section === "products") && website.shopEnabled && (
        <ShopCatalog websiteId={website.id} clientId={website.clientId} section={section} />
      )}
    </div>
  );
}

function ShopCatalog({
  websiteId,
  clientId,
  section,
}: {
  websiteId: string;
  clientId: string;
  section: "category" | "products";
}) {
  const [categories, setCategories] = useState<ShopCategory[] | null>(null);
  const [products, setProducts] = useState<ShopProduct[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [viewing, setViewing] = useState<ShopProduct | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    shopApi
      .categories(websiteId)
      .then((loaded) => {
        if (!cancelled) setCategories(loaded);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    shopApi
      .products(websiteId, { search: query || undefined, categoryId: categoryId || undefined, page, pageSize })
      .then((loaded) => {
        if (!cancelled) {
          setProducts(loaded.products);
          setTotal(loaded.total);
          if (loaded.page !== page) setPage(loaded.page);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, query, categoryId, page, pageSize]);

  async function addCategory() {
    const name = categoryName.trim();
    if (!name) {
      setCategoryError("Enter a category name");
      return;
    }
    setSavingCategory(true);
    setCategoryError(null);
    try {
      const created = await shopApi.createCategory(websiteId, name);
      setCategories((current) => [...(current ?? []), created].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryName("");
    } catch (err) {
      setCategoryError(errorMessage(err));
    } finally {
      setSavingCategory(false);
    }
  }

  async function removeCategory(category: ShopCategory) {
    setCategoryError(null);
    try {
      await shopApi.deleteCategory(websiteId, category.id);
      setCategories((current) => (current ?? []).filter((item) => item.id !== category.id));
      if (categoryId === category.id) setCategoryId("");
      if (draft?.categoryId === category.id) setDraft((current) => (current ? { ...current, categoryId: "" } : current));
    } catch (err) {
      setCategoryError(errorMessage(err));
    }
  }

  function openProduct(product?: ShopProduct) {
    if (!product) {
      setDraft(blankProduct(categoryId || categories?.[0]?.id || ""));
      return;
    }
    setDraft({
      id: product.id,
      originalCategoryId: product.categoryId,
      name: product.name,
      description: product.description ?? "",
      categoryId: product.categoryId,
      sets: setsFromProduct(product),
      images: product.images ?? [],
    });
  }

  if (loadError && !categories) return <FormAlert status="danger">{loadError}</FormAlert>;
  if (!categories) {
    return (
      <div className="grid place-items-center rounded-xl border border-line bg-surface py-16">
        <Spinner aria-label="Loading shop" />
      </div>
    );
  }

  return (
    <div>
      {section === "category" && (
      <section className="rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-semibold text-ink">Categories</h3>
        <p className="mt-1 text-xs text-ink-muted">Products are filed under one category.</p>
        <div className="mt-4 flex max-w-md gap-2">
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void addCategory();
              }
            }}
            placeholder="New category"
            aria-label="New category"
            className="h-9 min-w-0 flex-1 rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink"
          />
          <Button size="sm" variant="outline" onPress={addCategory} isPending={savingCategory} aria-label="Add category">
            <Plus className="size-4" aria-hidden />
          </Button>
        </div>
        {categoryError && <p className="mt-2 text-xs text-ed-danger">{categoryError}</p>}
        <ul className="mt-4 space-y-1">
          {categories.length === 0 && <li className="text-sm text-ink-muted">No categories yet.</li>}
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-canvas">
              <span className="min-w-0 truncate text-sm text-ink">
                {category.name}
                <span className="ml-1 text-ink-muted">({category.productCount})</span>
              </span>
              <button
                type="button"
                onClick={() => void removeCategory(category)}
                aria-label={`Delete ${category.name}`}
                className="grid size-7 shrink-0 place-items-center rounded text-ink-muted hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </section>
      )}

      {section === "products" && (
      <section className="rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Products</h3>
            <p className="mt-0.5 text-xs text-ink-muted">Search by name, description, or variant.</p>
          </div>
          <Button size="sm" onPress={() => openProduct()} isDisabled={categories.length === 0}>
            <Plus className="size-4" aria-hidden /> Add product
          </Button>
        </div>

        {viewing ? (
          <ProductVariants product={viewing} onBack={() => setViewing(null)} onEdit={() => openProduct(viewing)} />
        ) : (
        <>
        <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="h-9 w-full rounded-lg border border-ed-border bg-surface pl-9 pr-3 text-sm text-ink"
            />
          </div>
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
            className="h-9 rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loadError && (
          <div className="px-5 pt-4">
            <FormAlert status="danger">{loadError}</FormAlert>
          </div>
        )}

        <div className="divide-y divide-line">
          {products === null && (
            <div className="grid place-items-center py-12">
              <Spinner aria-label="Loading products" />
            </div>
          )}
          {products?.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              {query || categoryId ? "No products match this search." : "No products yet."}
            </p>
          )}
          {products?.map((product) => {
            const cover = coverUrl(product);
            return (
            <div key={product.id} className="flex w-full items-center gap-2 px-3 py-1 hover:bg-canvas">
              <button
                type="button"
                onClick={() => setViewing(product)}
                className="flex min-w-0 flex-1 items-center justify-between gap-4 px-2 py-2 text-left"
              >
                {cover ? (
                  <img src={cover} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-md bg-canvas text-ink-muted">
                    <ImagePlus className="size-4" aria-hidden />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink-muted">
                    {product.categoryName} · {optionSummary(product)}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-ink">{priceLabel(product)}</span>
              </button>
              <button
                type="button"
                onClick={() => openProduct(product)}
                aria-label={`Edit ${product.name}`}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-surface hover:text-ink"
              >
                <Pencil className="size-3.5" aria-hidden />
              </button>
            </div>
            );
          })}
        </div>
        {products && (
          <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3">
            {total > 0 && (
              <p className="mr-auto text-xs text-ink-muted">
                Showing {(page - 1) * pageSize + 1}–{Math.min(total, (page - 1) * pageSize + products.length)} of {total}
              </p>
            )}
            <select
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              aria-label="Products per page"
              className="h-9 rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onPress={() => setPage((current) => Math.max(1, current - 1))} isDisabled={page <= 1 || total === 0}>
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onPress={() => setPage((current) => current + 1)}
                isDisabled={total === 0 || page >= Math.max(1, Math.ceil(total / pageSize))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        </>
        )}

        {draft && (
          <ProductForm
            websiteId={websiteId}
            clientId={clientId}
            categories={categories}
            draft={draft}
            onChange={setDraft}
            onClose={() => setDraft(null)}
            onSaved={(product, previousCategoryId) => {
              setDraft(null);
              setViewing((current) => (current?.id === product.id ? product : current));
              setCategories((current) =>
                (current ?? []).map((category) => {
                  if (category.id === product.categoryId && category.id !== previousCategoryId) {
                    return { ...category, productCount: category.productCount + 1 };
                  }
                  if (previousCategoryId && category.id === previousCategoryId && category.id !== product.categoryId) {
                    return { ...category, productCount: Math.max(0, category.productCount - 1) };
                  }
                  if (!previousCategoryId && category.id === product.categoryId) {
                    return { ...category, productCount: category.productCount + 1 };
                  }
                  return category;
                }),
              );
              setProducts((current) => {
                const list = current ?? [];
                const next = list.some((item) => item.id === product.id)
                  ? list.map((item) => (item.id === product.id ? product : item))
                  : [...list, product];
                return next
                  .filter((item) => !categoryId || item.categoryId === categoryId)
                  .filter((item) => !query || matchesQuery(item, query))
                  .sort((a, b) => a.name.localeCompare(b.name));
              });
            }}
            onDeleted={(productId, previousCategoryId) => {
              setDraft(null);
              setViewing((current) => (current?.id === productId ? null : current));
              setProducts((current) => (current ?? []).filter((item) => item.id !== productId));
              setCategories((current) =>
                (current ?? []).map((category) =>
                  category.id === previousCategoryId
                    ? { ...category, productCount: Math.max(0, category.productCount - 1) }
                    : category,
                ),
              );
            }}
          />
        )}
      </section>
      )}
    </div>
  );
}

function ProductVariants({ product, onBack, onEdit }: { product: ShopProduct; onBack: () => void; onEdit: () => void }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
          <ChevronLeft className="size-4" aria-hidden /> Products
        </button>
        <Button size="sm" variant="outline" onPress={onEdit}>
          <Pencil className="size-3.5" aria-hidden /> Edit
        </Button>
      </div>
      <div className="px-5 py-4">
        <h3 className="text-base font-semibold text-ink">{product.name}</h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          {product.categoryName} · {priceLabel(product)}
        </p>
        {product.description && <p className="mt-2 max-w-2xl text-sm text-ink-body">{product.description}</p>}
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {product.variants.map((variant) => {
          const options = variantOptions(product, variant.name);
          const photos = variantPhotos(product, variant);
          return (
            <li key={variant.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
              {photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {photos.map((image) => (
                    <img
                      key={image.mediaId}
                      src={image.url}
                      alt={image.alt || variant.name}
                      className="size-24 shrink-0 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">
                  {options.length > 0 ? options.map((option) => option.value).join(" / ") : variant.name}
                </p>
                {options.length > 0 && (
                  <p className="mt-0.5 text-xs text-ink-muted">{options.map((option) => `${option.name}: ${option.value}`).join(" · ")}</p>
                )}
                <p className="mt-1 text-sm text-ink">
                  {formatPaise(variant.pricePaise)}
                  <span className="text-ink-muted"> · {variant.quantity} on hand</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function matchesQuery(product: ShopProduct, query: string): boolean {
  const needle = query.toLowerCase();
  const haystack = [product.name, product.description ?? "", product.categoryName, ...product.variants.flatMap((variant) => [variant.name, variant.sku ?? ""])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

const MAX_PRODUCT_IMAGES = 8;

function ProductForm({
  websiteId,
  clientId,
  categories,
  draft,
  onChange,
  onClose,
  onSaved,
  onDeleted,
}: {
  websiteId: string;
  clientId: string;
  categories: ShopCategory[];
  draft: ProductDraft;
  onChange: (draft: ProductDraft) => void;
  onClose: () => void;
  onSaved: (product: ShopProduct, previousCategoryId?: string) => void;
  onDeleted: (productId: string, categoryId: string) => void;
}) {
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const [saving, setSaving] = useState(false);
  const [busyUploads, setBusyUploads] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function commit(recipe: (current: ProductDraft) => ProductDraft) {
    const next = recipe(draftRef.current);
    draftRef.current = next;
    onChange(next);
  }

  function updateSet(key: string, patch: Partial<SetDraft> | ((current: SetDraft) => Partial<SetDraft>)) {
    commit((current) => ({
      ...current,
      sets: current.sets.map((set) => {
        if (set.key !== key) return set;
        return { ...set, ...(typeof patch === "function" ? patch(set) : patch) };
      }),
    }));
  }

  function trackUpload(busy: boolean) {
    setBusyUploads((count) => Math.max(0, count + (busy ? 1 : -1)));
  }

  async function save() {
    const parsed = toInput(draft);
    if ("error" in parsed) {
      setError(parsed.error);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const product = draft.id
        ? await shopApi.updateProduct(websiteId, draft.id, parsed.input)
        : await shopApi.createProduct(websiteId, parsed.input);
      onSaved(product, draft.originalCategoryId);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!draft.id) return;
    setSaving(true);
    setError(null);
    try {
      await shopApi.deleteProduct(websiteId, draft.id);
      onDeleted(draft.id, draft.categoryId);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      size="full"
      title={draft.id ? "Edit product" : "Add product"}
      subtitle="Options in one combination are paired together. Add another combination when a size or colour does not match the rest."
      subtitleClassName="whitespace-normal"
      primaryAction={{ label: draft.id ? "Save product" : "Create product", onPress: save, isPending: saving || busyUploads > 0, isDisabled: busyUploads > 0 }}
      secondaryAction={{ label: "Cancel", onPress: onClose }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Product name" name="productName" value={draft.name} onChange={(name) => onChange({ ...draft, name })} isRequired />
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Category</span>
          <select
            value={draft.categoryId}
            onChange={(event) => onChange({ ...draft, categoryId: event.target.value })}
            aria-label="Product category"
            className="h-9 w-full rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink"
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <TextAreaInput
            label="Description (optional)"
            name="productDescription"
            value={draft.description}
            onChange={(description) => onChange({ ...draft, description })}
          />
        </div>
        <div className="sm:col-span-2">
          <ImageStrip
            label="Shared photos"
            hint="Used when a value, such as a colour, has no photos of its own."
            images={draft.images}
            onChange={(images) => commit((current) => ({ ...current, images }))}
            clientId={clientId}
            websiteId={websiteId}
            altText={draft.name}
            onError={setError}
            onBusy={trackUpload}
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {draft.sets.map((set, index) => (
          <OptionSetCard
            key={set.key}
            index={index}
            set={set}
            canRemove={draft.sets.length > 1}
            clientId={clientId}
            websiteId={websiteId}
            altText={draft.name}
            onError={setError}
            onBusy={trackUpload}
            onChange={(patch) => updateSet(set.key, patch)}
            onRemove={() => commit((current) => ({ ...current, sets: current.sets.filter((item) => item.key !== set.key) }))}
          />
        ))}
        <Button size="sm" variant="outline" onPress={() => onChange({ ...draft, sets: [...draft.sets, blankSet()] })}>
          <Plus className="size-3.5" aria-hidden /> Add a different combination
        </Button>
      </div>

      {error && (
        <div className="mt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}

      {draft.id && (
        <div className="mt-6 border-t border-line pt-4">
          <Button size="sm" variant="danger" onPress={remove} isDisabled={saving}>
            Delete product
          </Button>
        </div>
      )}
    </CommonModal>
  );
}

function OptionSetCard({
  index,
  set,
  canRemove,
  clientId,
  websiteId,
  altText,
  onError,
  onBusy,
  onChange,
  onRemove,
}: {
  index: number;
  set: SetDraft;
  canRemove: boolean;
  clientId: string;
  websiteId: string;
  altText: string;
  onError: (message: string) => void;
  onBusy: (busy: boolean) => void;
  onChange: (patch: Partial<SetDraft> | ((current: SetDraft) => Partial<SetDraft>)) => void;
  onRemove: () => void;
}) {
  const combos = set.options.some((option) => option.values.length > 0) ? combinations(set.options) : [];
  const preview = combos.slice(0, 6).map((values) => values.join(" / "));
  const counts = set.options.filter((option) => option.values.length > 0).map((option) => option.values.length);

  function updateOption(key: string, patch: Partial<OptionDraft>) {
    onChange({ options: set.options.map((option) => (option.key === key ? { ...option, ...patch } : option)) });
  }

  return (
    <section className="rounded-xl border border-line bg-canvas/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-ink">Combination {index + 1}</h4>
          <p className="mt-0.5 text-xs text-ink-muted">Every value is paired with every value of the other options.</p>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-xs font-medium text-ink-muted hover:text-danger">
            Remove
          </button>
        )}
      </div>

      <div className="mt-4 max-w-xs">
        <TextInput
          label="Price for this combination (₹)"
          name={`set-price-${set.key}`}
          value={set.price}
          onChange={(price) => onChange({ price })}
          placeholder="0.00"
          isRequired
        />
      </div>

      <div className="mt-4 space-y-3">
        {set.options.map((option) => (
          <div key={option.key} className="rounded-lg border border-line/80 p-3">
            <div className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-start">
              <TextInput
                label="Option"
                name={`option-${option.key}`}
                value={option.name}
                onChange={(name) => updateOption(option.key, { name })}
                placeholder="Size, colour…"
              />
              <ValueChips values={option.values} onChange={(values) => updateOption(option.key, { values })} />
              <div className="sm:pt-6">
                <button
                  type="button"
                  onClick={() => onChange({ options: set.options.filter((item) => item.key !== option.key) })}
                  aria-label="Remove option"
                  className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <Switch isSelected={option.listOnShop} onChange={(listOnShop) => updateOption(option.key, { listOnShop })} className="mt-3">
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Label className="text-sm text-ink">List on the shop page</Label>
              </Switch.Content>
            </Switch>
            <p className="mt-1 text-xs text-ink-muted">
              Each value becomes its own card. Turn this on for colour to list blue and red separately, and for size as well to list every size and colour.
            </p>
            {option.values.length > 0 && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-ink-muted">Upload once for a value. Every variant with that value uses the same photos.</p>
                {option.values.map((value) => (
                  <ImageStrip
                    key={value}
                    compact
                    label={value}
                    images={option.images[value.trim().toLowerCase()] ?? []}
                    onChange={(images) => updateOption(option.key, { images: { ...option.images, [value.trim().toLowerCase()]: images } })}
                    clientId={clientId}
                    websiteId={websiteId}
                    altText={altText ? `${altText} ${value}` : value}
                    onError={onError}
                    onBusy={onBusy}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        <Button size="sm" variant="outline" onPress={() => onChange({ options: [...set.options, blankOption()] })} isDisabled={set.options.length >= 4}>
          <Plus className="size-3.5" aria-hidden /> Add option
        </Button>
      </div>

      {combos.length > 0 && (
        <p className="mt-3 text-xs text-ink-muted">
          {counts.length > 1 ? `${counts.join(" × ")} = ` : ""}
          {combos.length} {combos.length === 1 ? "variant" : "variants"}
          {preview.length > 0 ? `: ${preview.join(", ")}` : ""}
          {combos.length > preview.length ? `, +${combos.length - preview.length} more` : ""}
        </p>
      )}

      {combos.length > 1 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onChange({ showPrices: !set.showPrices })}
            className="text-xs font-medium text-brand hover:underline"
          >
            {set.showPrices ? "Hide individual prices" : "Set a different price for some"}
          </button>
        </div>
      )}

      {combos.length > 0 && (
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
          {combos.map((values) => {
            const key = variantKey(values);
            const label = values.join(" / ");
            return (
              <li key={key} className="rounded-lg border border-line bg-surface p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-ink">{label}</span>
                  {set.showPrices && (
                    <input
                      value={set.overrides[key] ?? set.price}
                      onChange={(event) => onChange({ overrides: { ...set.overrides, [key]: event.target.value } })}
                      aria-label={`Price for ${label}`}
                      className="h-8 w-28 rounded-lg border border-ed-border bg-surface px-2 text-sm text-ink"
                    />
                  )}
                </div>
                <div className="mt-2">
                  {key in set.images ? (
                    <>
                      <p className="mb-1 text-xs text-ink-muted">Photos for this combination only</p>
                      <ImageStrip
                        compact
                        images={set.images[key] ?? []}
                        onChange={(images) => onChange((current) => ({ images: { ...current.images, [key]: images } }))}
                        clientId={clientId}
                        websiteId={websiteId}
                        altText={altText ? `${altText} ${label}` : label}
                        onError={onError}
                        onBusy={onBusy}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onChange((current) => {
                            const images = { ...current.images };
                            delete images[key];
                            return { images };
                          })
                        }
                        className="mt-1 text-xs font-medium text-ink-muted hover:text-ink"
                      >
                        Use the shared photos
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChange((current) => ({ images: { ...current.images, [key]: [] } }))}
                      className="text-xs font-medium text-ink-muted hover:text-ink"
                    >
                      Different photos for this combination
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ImageStrip({
  images,
  onChange,
  clientId,
  websiteId,
  altText,
  onError,
  onBusy,
  label,
  hint,
  compact = false,
}: {
  images: ShopImage[];
  onChange: (images: ShopImage[]) => void;
  clientId: string;
  websiteId: string;
  altText: string;
  onError: (message: string) => void;
  onBusy: (busy: boolean) => void;
  label?: string;
  hint?: string;
  compact?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const [uploading, setUploading] = useState(false);
  const thumb = compact ? "size-14" : "size-20";

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = MAX_PRODUCT_IMAGES - imagesRef.current.length;
    if (room <= 0) {
      onError("You can add at most 8 photos.");
      return;
    }
    setUploading(true);
    onBusy(true);
    const added: ShopImage[] = [];
    try {
      for (const rawFile of Array.from(files).slice(0, room)) {
        const problem = uploadProblem(rawFile, "IMAGE");
        if (problem) {
          onError(problem);
          continue;
        }
        const { file } = await optimizeImageToWebP(rawFile, { quality: 0.88, maxWidth: 1600, maxHeight: 1600 });
        const uploaded = await mediaApi.upload({
          file,
          clientId,
          websiteId,
          altText: altText.trim() || rawFile.name,
        });
        added.push({ mediaId: uploaded.id, url: uploaded.url, alt: uploaded.altText ?? "" });
      }
      if (added.length > 0) {
        const next = [...imagesRef.current, ...added].slice(0, MAX_PRODUCT_IMAGES);
        imagesRef.current = next;
        onChange(next);
      }
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setUploading(false);
      onBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink">{label}</span>
          <span className="text-xs text-ink-muted">{images.length} / {MAX_PRODUCT_IMAGES}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {images.map((image) => (
          <div key={image.mediaId} className={`relative ${thumb} overflow-hidden rounded-lg border border-line`}>
            <img src={image.url} alt={image.alt} className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((item) => item.mediaId !== image.mediaId))}
              aria-label="Remove image"
              className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white"
            >
              <Trash2 className="size-3" aria-hidden />
            </button>
          </div>
        ))}
        {images.length < MAX_PRODUCT_IMAGES && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label={label ? `Add ${label.toLowerCase()}` : "Add photos"}
            className={`grid ${thumb} place-items-center rounded-lg border border-dashed border-ed-border text-ink-muted hover:border-ed-border-strong hover:text-ink disabled:opacity-50`}
          >
            {uploading ? <Spinner size="sm" aria-label="Uploading images" /> : <ImagePlus className={compact ? "size-4" : "size-5"} aria-hidden />}
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT_BY_KIND.IMAGE}
        multiple
        className="sr-only"
        onChange={(event) => void uploadImages(event.target.files)}
      />
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

function ValueChips({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) {
  const [text, setText] = useState("");

  function add(raw: string) {
    const next = raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    const merged = [...values];
    for (const value of next) {
      if (!merged.some((item) => item.toLowerCase() === value.toLowerCase())) merged.push(value);
    }
    onChange(merged);
    setText("");
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-ink">Values</span>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-ed-border bg-surface px-2 py-1.5">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(values.filter((item) => item !== value))}
            className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-xs text-ink hover:text-danger"
            aria-label={`Remove ${value}`}
          >
            {value}
            <span aria-hidden>×</span>
          </button>
        ))}
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add(text);
            } else if (event.key === "Backspace" && !text && values.length > 0) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => add(text)}
          placeholder={values.length === 0 ? "Type a value and press Enter" : "Add"}
          aria-label="Option values"
          className="h-7 min-w-32 flex-1 bg-transparent text-sm text-ink outline-none"
        />
      </div>
    </div>
  );
}
