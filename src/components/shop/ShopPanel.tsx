import { useEffect, useState } from "react";
import { Button, Label, Spinner, Switch } from "@heroui/react";
import { ChevronLeft, ImagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { shopApi, type ShopCategory, type ShopProduct } from "../../api/shop.ts";
import { errorMessage } from "../../api/http.ts";
import { formatPaise } from "../../api/wallet.ts";
import { websitesApi, type WebsiteDetail } from "../../api/websites.ts";
import ShopCouponsPanel from "./ShopCouponsPanel.tsx";
import ShopCustomersPanel from "./ShopCustomersPanel.tsx";
import ShopInvoiceTemplatePanel from "./ShopInvoiceTemplatePanel.tsx";
import { ShopInventoryLogPanel, ShopInventoryPanel } from "./ShopInventoryPanel.tsx";
import ShopOrderEmailsPanel from "./ShopOrderEmailsPanel.tsx";
import ShopPaymentLogsPanel from "./ShopPaymentLogsPanel.tsx";
import { useAwaitingReturnsCount } from "./use-awaiting-returns.ts";
import ShopReturnsPanel from "./ShopReturnsPanel.tsx";
import ShopOrdersPanel from "./ShopOrdersPanel.tsx";
import PosSettingsCard from "./pos/PosSettingsCard.tsx";
import ShopRazorpayPanel from "./ShopRazorpayPanel.tsx";
import ProductForm from "./product-form/ProductForm.tsx";
import { blankProduct, draftFromProduct, type ProductDraft } from "./product-form/product-draft.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { variantOptions, variantPhotos } from "./product-variants.ts";

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

type ShopSection =
  | "category"
  | "settings"
  | "products"
  | "customers"
  | "orders"
  | "returns"
  | "invoice-template"
  | "order-emails"
  | "inventory"
  | "inventory-log"
  | "coupons"
  | "razorpay"
  | "razorpay-logs";

const SHOP_SECTIONS: { id: ShopSection; label: string }[] = [
  { id: "category", label: "Category" },
  { id: "settings", label: "Shop settings" },
  { id: "products", label: "Products" },
  { id: "customers", label: "Customers" },
  { id: "orders", label: "Orders" },
  { id: "returns", label: "Returns" },
  { id: "coupons", label: "Coupons" },
  { id: "invoice-template", label: "Invoice template" },
  { id: "order-emails", label: "Order emails" },
  { id: "inventory", label: "Inventory" },
  { id: "inventory-log", label: "Inventory log" },
  { id: "razorpay", label: "Razorpay" },
  { id: "razorpay-logs", label: "Razorpay logs" },
];

/** Returns and Razorpay logs are built but not shown yet; set to true to show them. */
const SHOW_RETURNS_AND_PAYMENT_LOGS = false;
const HIDDEN_SHOP_SECTIONS = new Set<ShopSection>(SHOW_RETURNS_AND_PAYMENT_LOGS ? [] : ["returns", "razorpay-logs"]);
const VISIBLE_SHOP_SECTIONS = SHOP_SECTIONS.filter((section) => !HIDDEN_SHOP_SECTIONS.has(section.id));

const SHOP_SECTION_IDS = new Set<string>(VISIBLE_SHOP_SECTIONS.map((section) => section.id));

function defaultShopSection(shopEnabled: boolean): ShopSection {
  return shopEnabled ? "products" : "settings";
}

/** Sections that work before the shop is switched on; the rest open Shop settings until then. */
const SECTIONS_WITHOUT_SHOP = new Set<string>(["settings", "razorpay"]);

function parseShopSection(raw: string | null, shopEnabled: boolean): ShopSection {
  if (raw && SHOP_SECTION_IDS.has(raw) && (shopEnabled || SECTIONS_WITHOUT_SHOP.has(raw))) return raw as ShopSection;
  return defaultShopSection(shopEnabled);
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const section = parseShopSection(searchParams.get("section"), website.shopEnabled);

  function setSection(next: ShopSection) {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        params.set("tab", "shop");
        params.set("section", next);
        return params;
      },
      { replace: true },
    );
  }

  const [turning, setTurning] = useState(false);
  const [turnError, setTurnError] = useState<string | null>(null);
  const [savingCancelPolicy, setSavingCancelPolicy] = useState(false);
  const [cancelPolicyError, setCancelPolicyError] = useState<string | null>(null);
  const [cancelPolicyMessage, setCancelPolicyMessage] = useState<string | null>(null);
  const [cancelUntilDraft, setCancelUntilDraft] = useState<"" | "paid" | "processing" | "shipped">(
    website.shopCancelUntilStatus ?? "",
  );
  const [savingReturnPolicy, setSavingReturnPolicy] = useState(false);
  const [returnPolicyError, setReturnPolicyError] = useState<string | null>(null);
  const [returnPolicyMessage, setReturnPolicyMessage] = useState<string | null>(null);
  const [returnsEnabledDraft, setReturnsEnabledDraft] = useState(website.shopReturnDays != null);
  const [returnDaysDraft, setReturnDaysDraft] = useState(String(website.shopReturnDays ?? 7));
  const [returnGuidelinesDraft, setReturnGuidelinesDraft] = useState<string[]>(
    website.shopReturnGuidelines.length > 0 ? website.shopReturnGuidelines : [""],
  );
  const [savingGstPolicy, setSavingGstPolicy] = useState(false);
  const [gstPolicyError, setGstPolicyError] = useState<string | null>(null);
  const [gstPolicyMessage, setGstPolicyMessage] = useState<string | null>(null);
  const [gstPercentDraft, setGstPercentDraft] = useState(String(website.shopGstPercent ?? 0));
  const [priceIncludesGstDraft, setPriceIncludesGstDraft] = useState(website.shopPriceIncludesGst !== false);

  useEffect(() => {
    setCancelUntilDraft(website.shopCancelUntilStatus ?? "");
  }, [website.shopCancelUntilStatus]);

  useEffect(() => {
    setReturnsEnabledDraft(website.shopReturnDays != null);
    setReturnDaysDraft(String(website.shopReturnDays ?? 7));
    setReturnGuidelinesDraft(website.shopReturnGuidelines.length > 0 ? website.shopReturnGuidelines : [""]);
  }, [website.shopReturnDays, website.shopReturnGuidelines]);

  useEffect(() => {
    setGstPercentDraft(String(website.shopGstPercent ?? 0));
    setPriceIncludesGstDraft(website.shopPriceIncludesGst !== false);
  }, [website.shopGstPercent, website.shopPriceIncludesGst]);

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

  async function saveCancelPolicy() {
    setSavingCancelPolicy(true);
    setCancelPolicyError(null);
    setCancelPolicyMessage(null);
    try {
      onChange(
        await websitesApi.update(website.id, {
          shopCancelUntilStatus: cancelUntilDraft === "" ? null : cancelUntilDraft,
        }),
      );
      setCancelPolicyMessage("Cancellation policy saved.");
    } catch (err) {
      setCancelPolicyError(errorMessage(err));
    } finally {
      setSavingCancelPolicy(false);
    }
  }

  const cancelPolicyDirty = (website.shopCancelUntilStatus ?? "") !== cancelUntilDraft;

  async function saveReturnPolicy() {
    const days = Number(returnDaysDraft);
    if (returnsEnabledDraft && (!Number.isInteger(days) || days < 1 || days > 365)) {
      setReturnPolicyError("Enter a return window between 1 and 365 days.");
      return;
    }
    setSavingReturnPolicy(true);
    setReturnPolicyError(null);
    setReturnPolicyMessage(null);
    try {
      onChange(
        await websitesApi.update(website.id, {
          shopReturnDays: returnsEnabledDraft ? days : null,
          shopReturnGuidelines: returnGuidelinesDraft.map((line) => line.trim()).filter(Boolean),
        }),
      );
      setReturnPolicyMessage("Return policy saved.");
    } catch (err) {
      setReturnPolicyError(errorMessage(err));
    } finally {
      setSavingReturnPolicy(false);
    }
  }

  const cleanedGuidelines = returnGuidelinesDraft.map((line) => line.trim()).filter(Boolean);
  const savedGuidelines = website.shopReturnGuidelines;
  const returnPolicyDirty =
    returnsEnabledDraft !== (website.shopReturnDays != null) ||
    (returnsEnabledDraft && Number(returnDaysDraft) !== (website.shopReturnDays ?? 7)) ||
    cleanedGuidelines.join("\n") !== savedGuidelines.join("\n");

  async function saveGstPolicy() {
    const percent = Number(gstPercentDraft);
    if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
      setGstPolicyError("GST percent must be a whole number from 0 to 100.");
      return;
    }
    setSavingGstPolicy(true);
    setGstPolicyError(null);
    setGstPolicyMessage(null);
    try {
      onChange(
        await websitesApi.update(website.id, {
          shopGstPercent: percent,
          shopPriceIncludesGst: priceIncludesGstDraft,
        }),
      );
      setGstPolicyMessage("GST settings saved.");
    } catch (err) {
      setGstPolicyError(errorMessage(err));
    } finally {
      setSavingGstPolicy(false);
    }
  }

  const gstPolicyDirty =
    Number(gstPercentDraft) !== (website.shopGstPercent ?? 0) ||
    priceIncludesGstDraft !== (website.shopPriceIncludesGst !== false);

  const awaitingReturns = useAwaitingReturnsCount(website.id, website.shopEnabled && SHOW_RETURNS_AND_PAYMENT_LOGS, section);

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Shop" className="flex gap-1 overflow-x-auto border-b border-line">
        {VISIBLE_SHOP_SECTIONS.map(({ id, label }) => {
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
              {id === "returns" && awaitingReturns > 0 && (
                <span
                  className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold leading-5 text-white"
                  aria-label={`${awaitingReturns} waiting for refund`}
                >
                  {awaitingReturns}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {section === "settings" && (
        <div className="space-y-4">
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

          {website.shopEnabled && (
            <section className="rounded-xl border border-line bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <h2 className="text-base font-semibold text-ink">Guest checkout</h2>
                  <p className="mt-1 text-sm text-ink-body">
                    Let shoppers add to cart and pay without creating an account. They get an order email with a
                    tracking link and can download their invoice from that page.
                  </p>
                </div>
                <Switch
                  isSelected={website.shopAllowGuestCheckout}
                  onChange={(shopAllowGuestCheckout) => {
                    void (async () => {
                      try {
                        onChange(await websitesApi.update(website.id, { shopAllowGuestCheckout }));
                      } catch (err) {
                        setTurnError(errorMessage(err));
                      }
                    })();
                  }}
                  isDisabled={turning}
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Label className="text-sm text-ink">
                      {website.shopAllowGuestCheckout ? "Guest checkout on" : "Guest checkout off"}
                    </Label>
                  </Switch.Content>
                </Switch>
              </div>
            </section>
          )}

          {website.shopEnabled && <PosSettingsCard website={website} onChange={onChange} />}

          {website.shopEnabled && (
            <section className="rounded-xl border border-line bg-surface p-6">
              <div className="max-w-2xl">
                <h2 className="text-base font-semibold text-ink">Order cancellation</h2>
                <p className="mt-1 text-sm text-ink-body">
                  Choose how far along an order can be before shoppers may cancel it themselves. Cancelled paid
                  orders are refunded automatically, and stock is put back.
                </p>
              </div>
              <div className="mt-5 max-w-md space-y-4">
                <label className="grid gap-1 text-sm font-medium text-ink">
                  Customers can cancel up to
                  <select
                    value={cancelUntilDraft}
                    onChange={(event) =>
                      setCancelUntilDraft(event.target.value as "" | "paid" | "processing" | "shipped")
                    }
                    className="h-10 rounded-lg border border-ed-border bg-surface px-3 text-sm font-normal text-ink"
                  >
                    <option value="">Customers cannot cancel</option>
                    <option value="paid">Paid (before processing)</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                  </select>
                </label>
                <p className="text-xs text-ink-muted">
                  {cancelUntilDraft === ""
                    ? "Only you can cancel orders from the Orders tab."
                    : cancelUntilDraft === "paid"
                      ? "Shoppers can cancel while the order is pending payment or paid."
                      : cancelUntilDraft === "processing"
                        ? "Shoppers can cancel until you mark the order as shipped."
                        : "Shoppers can cancel until the order is marked delivered."}
                </p>
                {cancelPolicyError && <FormAlert status="danger">{cancelPolicyError}</FormAlert>}
                {cancelPolicyMessage && <FormAlert status="success">{cancelPolicyMessage}</FormAlert>}
                <Button
                  size="sm"
                  onPress={() => void saveCancelPolicy()}
                  isDisabled={savingCancelPolicy || !cancelPolicyDirty}
                >
                  {savingCancelPolicy ? "Saving…" : "Save policy"}
                </Button>
              </div>
            </section>
          )}

          {website.shopEnabled && (
            <section className="rounded-xl border border-line bg-surface p-6">
              <div className="max-w-2xl">
                <h2 className="text-base font-semibold text-ink">Return policy</h2>
                <p className="mt-1 text-sm text-ink-body">
                  Set the default return window and guideline points for this shop. You can turn returns off or
                  change the days on individual products.
                </p>
              </div>
              <div className="mt-5 max-w-xl space-y-4">
                <Switch isSelected={returnsEnabledDraft} onChange={setReturnsEnabledDraft}>
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Label className="text-sm text-ink">{returnsEnabledDraft ? "Returns on" : "Returns off"}</Label>
                  </Switch.Content>
                </Switch>
                {returnsEnabledDraft && (
                  <>
                    <label className="grid gap-1 text-sm font-medium text-ink">
                      Default return window (days)
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={returnDaysDraft}
                        onChange={(event) => setReturnDaysDraft(event.target.value)}
                        className="h-10 rounded-lg border border-ed-border bg-surface px-3 text-sm font-normal text-ink"
                      />
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-ink">Guideline points</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => setReturnGuidelinesDraft((current) => [...current, ""])}
                          isDisabled={returnGuidelinesDraft.length >= 12}
                        >
                          Add point
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {returnGuidelinesDraft.map((line, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={line}
                              maxLength={240}
                              placeholder="e.g. Item must be unused and in original packaging"
                              onChange={(event) =>
                                setReturnGuidelinesDraft((current) =>
                                  current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                                )
                              }
                              className="h-10 min-w-0 flex-1 rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onPress={() =>
                                setReturnGuidelinesDraft((current) =>
                                  current.length <= 1 ? [""] : current.filter((_, itemIndex) => itemIndex !== index),
                                )
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {returnPolicyError && <FormAlert status="danger">{returnPolicyError}</FormAlert>}
                {returnPolicyMessage && <FormAlert status="success">{returnPolicyMessage}</FormAlert>}
                <Button
                  size="sm"
                  onPress={() => void saveReturnPolicy()}
                  isDisabled={savingReturnPolicy || !returnPolicyDirty}
                >
                  {savingReturnPolicy ? "Saving…" : "Save return policy"}
                </Button>
              </div>
            </section>
          )}

          {website.shopEnabled && (
            <section className="rounded-xl border border-line bg-surface p-6">
              <div className="max-w-2xl">
                <h2 className="text-base font-semibold text-ink">GST defaults</h2>
                <p className="mt-1 text-sm text-ink-body">
                  Default tax settings for this shop. Individual products can override them.
                </p>
              </div>
              <div className="mt-5 max-w-xl space-y-4">
                <Switch isSelected={priceIncludesGstDraft} onChange={setPriceIncludesGstDraft}>
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Label className="text-sm text-ink">
                      {priceIncludesGstDraft ? "Price includes GST" : "Price + GST"}
                    </Label>
                  </Switch.Content>
                </Switch>
                <p className="text-xs text-ink-muted">
                  {priceIncludesGstDraft
                    ? "Entered product prices already include GST. Customers pay the price you set."
                    : "GST is added on top of entered product prices at checkout."}
                </p>
                <label className="grid gap-1 text-sm font-medium text-ink">
                  Default GST percent
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={gstPercentDraft}
                    onChange={(event) => setGstPercentDraft(event.target.value)}
                    className="h-10 rounded-lg border border-ed-border bg-surface px-3 text-sm font-normal text-ink"
                  />
                </label>
                {gstPolicyError && <FormAlert status="danger">{gstPolicyError}</FormAlert>}
                {gstPolicyMessage && <FormAlert status="success">{gstPolicyMessage}</FormAlert>}
                <Button
                  size="sm"
                  onPress={() => void saveGstPolicy()}
                  isDisabled={savingGstPolicy || !gstPolicyDirty}
                >
                  {savingGstPolicy ? "Saving…" : "Save GST settings"}
                </Button>
              </div>
            </section>
          )}
        </div>
      )}

      {section === "razorpay" && <ShopRazorpayPanel websiteId={website.id} />}
      {section === "razorpay-logs" && website.shopEnabled && <ShopPaymentLogsPanel websiteId={website.id} />}

      {(section === "category" ||
        section === "products" ||
        section === "customers" ||
        section === "orders" ||
        section === "returns" ||
        section === "coupons" ||
        section === "invoice-template" ||
        section === "order-emails" ||
        section === "inventory" ||
        section === "inventory-log" ||
        section === "razorpay-logs") &&
        !website.shopEnabled && (
        <section className="rounded-xl border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm text-ink-body">Turn the shop on in Shop settings before managing categories, products, customers, orders, coupons, or stock.</p>
          <Button size="sm" variant="outline" className="mt-4" onPress={() => setSection("settings")}>
            Open shop settings
          </Button>
        </section>
      )}

      {section === "customers" && website.shopEnabled && <ShopCustomersPanel websiteId={website.id} />}
      {section === "orders" && website.shopEnabled && <ShopOrdersPanel websiteId={website.id} />}
      {section === "returns" && website.shopEnabled && <ShopReturnsPanel websiteId={website.id} />}
      {section === "coupons" && website.shopEnabled && <ShopCouponsPanel websiteId={website.id} />}
      {section === "invoice-template" && website.shopEnabled && (
        <ShopInvoiceTemplatePanel
          websiteId={website.id}
          clientId={website.clientId}
          websiteName={website.name}
          businessName={website.info.businessName}
          businessAddress={website.info.address}
        />
      )}
      {section === "order-emails" && website.shopEnabled && (
        <ShopOrderEmailsPanel websiteId={website.id} clientId={website.clientId} />
      )}
      {section === "inventory" && website.shopEnabled && <ShopInventoryPanel websiteId={website.id} />}
      {section === "inventory-log" && website.shopEnabled && <ShopInventoryLogPanel websiteId={website.id} />}

      {(section === "category" || section === "products") && website.shopEnabled && (
        <ShopCatalog
          websiteId={website.id}
          clientId={website.clientId}
          section={section}
          shopReturnDays={website.shopReturnDays}
          shopGstPercent={website.shopGstPercent ?? 0}
          shopPriceIncludesGst={website.shopPriceIncludesGst !== false}
        />
      )}
    </div>
  );
}

function ShopCatalog({
  websiteId,
  clientId,
  section,
  shopReturnDays,
  shopGstPercent,
  shopPriceIncludesGst,
}: {
  websiteId: string;
  clientId: string;
  section: "category" | "products";
  shopReturnDays: number | null;
  shopGstPercent: number;
  shopPriceIncludesGst: boolean;
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
    setDraft(product ? draftFromProduct(product, shopGstPercent, shopPriceIncludesGst) : blankProduct(categoryId || ""));
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
        <p className="mt-1 text-xs text-ink-muted">Optional — products can also be created without a category.</p>
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
          <Button size="sm" onPress={() => openProduct()}>
            <Plus className="size-4" aria-hidden /> Add product
          </Button>
        </div>

        {viewing ? (
          <ProductVariants
            product={viewing}
            shopReturnDays={shopReturnDays}
            onBack={() => setViewing(null)}
            onEdit={() => openProduct(viewing)}
          />
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
                    {[product.categoryName, optionSummary(product)].filter(Boolean).join(" · ")}
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
            shopReturnDays={shopReturnDays}
            shopGstPercent={shopGstPercent}
            shopPriceIncludesGst={shopPriceIncludesGst}
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

function ProductVariants({
  product,
  shopReturnDays,
  onBack,
  onEdit,
}: {
  product: ShopProduct;
  shopReturnDays: number | null;
  onBack: () => void;
  onEdit: () => void;
}) {
  const returnsOff = !shopReturnDays || product.returnsEnabled === false;
  const effectiveDays = returnsOff ? null : product.returnDays ?? shopReturnDays;
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
          {[product.categoryName, priceLabel(product)].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          {returnsOff
            ? "Returns off"
            : `Returns within ${effectiveDays} day${effectiveDays === 1 ? "" : "s"}${product.returnDays == null ? " (shop default)" : ""}`}
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
                  {variant.sku ? <span className="text-ink-muted"> · SKU {variant.sku}</span> : null}
                  {variant.barcode ? <span className="text-ink-muted"> · Barcode {variant.barcode}</span> : null}
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
  const haystack = [product.name, product.description ?? "", product.categoryName, ...product.variants.flatMap((variant) => [variant.name, variant.sku ?? "", variant.barcode ?? ""])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}
