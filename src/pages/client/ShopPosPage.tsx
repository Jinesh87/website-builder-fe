import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Label, Spinner } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { BarChart3, RefreshCw, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { errorMessage } from "../../api/http.ts";
import type { ShopOrder } from "../../api/shop.ts";
import { shopPosApi, type PosCatalog } from "../../api/shop-pos.ts";
import PosCartPanel from "../../components/shop/pos/PosCartPanel.tsx";
import PosCatalogGrid from "../../components/shop/pos/PosCatalogGrid.tsx";
import PosCustomerDialog, { WALK_IN, type PosCustomer } from "../../components/shop/pos/PosCustomerDialog.tsx";
import PosPaymentDialog from "../../components/shop/pos/PosPaymentDialog.tsx";
import PosSaleCompleteDialog from "../../components/shop/pos/PosSaleCompleteDialog.tsx";
import { addToCart, cartTotals, setQuantity, type PosCartLine, type PosDiscount } from "../../components/shop/pos/pos-cart.ts";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput from "../../components/ui/SelectInput.tsx";
import { useShopWebsites } from "../../hooks/use-shop-websites.ts";

const AUTO_PRINT_KEY = "pos:auto-print";

type Dialog = "customer" | "payment" | null;

/** In-store till: sell the shop's products at the counter, sharing stock and orders with the online shop. */
export default function ShopPosPage() {
  const { websites, error: listError, selectedId, selectWebsite } = useShopWebsites({ posOnly: true });
  const [catalog, setCatalog] = useState<PosCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [cart, setCart] = useState<PosCartLine[]>([]);
  const [discount, setDiscount] = useState<PosDiscount | null>(null);
  const [customer, setCustomer] = useState<PosCustomer>(WALK_IN);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [completed, setCompleted] = useState<ShopOrder | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [autoPrint, setAutoPrint] = useState(() => localStorage.getItem(AUTO_PRINT_KEY) === "1");
  // Remounts the cart panel so its discount field clears with the sale.
  const [saleKey, setSaleKey] = useState(0);

  const loadCatalog = useCallback(async (websiteId: string) => {
    setCatalogError(null);
    try {
      const loaded = await shopPosApi.catalog(websiteId);
      setCatalog(loaded);
      // Keep the cart in line with the fresh stock figures.
      const available = new Map(loaded.products.flatMap((product) => product.variants.map((v) => [v.id, v.available] as const)));
      setCart((current) =>
        current
          .filter((line) => (available.get(line.variantId) ?? 0) > 0)
          .map((line) => {
            const left = available.get(line.variantId) ?? 0;
            return { ...line, available: left, quantity: Math.min(line.quantity, left) };
          }),
      );
    } catch (err) {
      setCatalogError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setCatalog(null);
    setCart([]);
    void loadCatalog(selectedId);
  }, [selectedId, loadCatalog]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const totals = useMemo(() => cartTotals(cart, discount), [cart, discount]);
  const inCart = useMemo(() => new Map(cart.map((line) => [line.variantId, line.quantity])), [cart]);

  function newSale() {
    setCompleted(null);
    setCart([]);
    setDiscount(null);
    setCustomer(WALK_IN);
    setSaleKey((key) => key + 1);
    if (selectedId) void loadCatalog(selectedId);
  }

  function toggleAutoPrint(on: boolean) {
    setAutoPrint(on);
    localStorage.setItem(AUTO_PRINT_KEY, on ? "1" : "0");
  }

  const picker = websites && websites.length > 1 && selectedId && (
    <SelectInput
      ariaLabel="Website"
      className="w-56"
      value={selectedId}
      onChange={selectWebsite}
      options={websites.map((item) => ({ value: item.id, label: item.name }))}
    />
  );

  return (
    <div className="flex flex-col px-4 py-5 sm:px-6 lg:h-full">
      <header className="flex flex-wrap items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand">
          <Store className="size-5" aria-hidden />
        </span>
        <div className="mr-auto">
          <h1 className="text-lg font-semibold text-ink">Point of sale</h1>
          <p className="text-xs text-ink-muted">In-store sales use the same stock and orders as your online shop.</p>
        </div>
        {picker}
        <Checkbox isSelected={autoPrint} onChange={toggleAutoPrint}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label className="text-sm text-ink-body">Print receipt after each sale</Label>
          </Checkbox.Content>
        </Checkbox>
        {selectedId && (
          <>
            <Button size="sm" variant="outline" onPress={() => void loadCatalog(selectedId)} aria-label="Refresh stock">
              <RefreshCw className="size-4" aria-hidden />
            </Button>
            <Link to={`/shop/pos/sales?website=${selectedId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <BarChart3 className="size-4" aria-hidden /> Today's sales
            </Link>
          </>
        )}
      </header>

      {(listError || catalogError) && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status="danger">
            {listError ?? catalogError}
            {catalogError && (
              <>
                {" "}
                <Link to={`/shop?website=${selectedId}&section=settings`} className="font-medium underline">
                  Open shop settings
                </Link>
              </>
            )}
          </FormAlert>
        </div>
      )}

      {websites?.length === 0 && (
        <p className="mt-10 text-center text-sm text-ink-muted">
          None of your shops has POS turned on. Turn it on in{" "}
          <Link to="/shop?section=settings" className="font-medium text-brand hover:underline">
            Shop → Settings
          </Link>
          .
        </p>
      )}

      {((!websites && !listError) || (selectedId && !catalog && !catalogError)) && (
        <div className="grid flex-1 place-items-center py-20">
          <Spinner aria-label="Loading products" />
        </div>
      )}

      {catalog && selectedId && (
        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <PosCatalogGrid
            catalog={catalog}
            inCart={inCart}
            onAdd={(product, variant) => setCart((current) => addToCart(current, product, variant))}
            onNotice={setNotice}
            scannerEnabled={dialog === null && completed === null}
          />
          <div className="flex min-h-0 flex-col lg:w-[380px] lg:shrink-0">
            <PosCartPanel
              key={saleKey}
              cart={cart}
              totals={totals}
              discount={discount}
              customer={customer}
              onQuantity={(variantId, quantity) => setCart((current) => setQuantity(current, variantId, quantity))}
              onDiscount={setDiscount}
              onEditCustomer={() => setDialog("customer")}
              onClear={() => {
                setCart([]);
                setDiscount(null);
                setSaleKey((key) => key + 1);
              }}
              onCharge={() => setDialog("payment")}
            />
          </div>
        </div>
      )}

      {notice && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-4 py-2 text-sm text-white shadow-lg">
          {notice}
        </div>
      )}

      {selectedId && dialog === "customer" && (
        <PosCustomerDialog websiteId={selectedId} value={customer} onChange={setCustomer} onClose={() => setDialog(null)} />
      )}
      {selectedId && catalog && dialog === "payment" && (
        <PosPaymentDialog
          websiteId={selectedId}
          cart={cart}
          discount={discount}
          totalPaise={totals.totalPaise}
          customer={customer}
          razorpayQr={catalog.razorpayQr}
          onComplete={(order) => {
            setDialog(null);
            setCompleted(order);
          }}
          onStale={() => void loadCatalog(selectedId)}
          onClose={() => setDialog(null)}
        />
      )}
      {selectedId && completed && (
        <PosSaleCompleteDialog websiteId={selectedId} order={completed} autoPrint={autoPrint} onNewSale={newSale} />
      )}
    </div>
  );
}
