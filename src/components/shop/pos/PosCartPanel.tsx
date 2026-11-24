import { useState } from "react";
import { Button } from "@heroui/react";
import { Minus, Plus, ShoppingCart, Trash2, UserRound, X } from "lucide-react";
import { formatInr } from "../shop-format.ts";
import { customerLabel, type PosCustomer } from "./PosCustomerDialog.tsx";
import { rupeesToPaise, type PosCartLine, type PosDiscount, type PosTotals } from "./pos-cart.ts";

type Props = {
  cart: PosCartLine[];
  totals: PosTotals;
  discount: PosDiscount | null;
  customer: PosCustomer;
  onQuantity: (variantId: string, quantity: number) => void;
  onDiscount: (discount: PosDiscount | null) => void;
  onEditCustomer: () => void;
  onClear: () => void;
  onCharge: () => void;
};

/** Right side of the till: the cart, discount, customer and the Charge button. */
export default function PosCartPanel({
  cart,
  totals,
  discount,
  customer,
  onQuantity,
  onDiscount,
  onEditCustomer,
  onClear,
  onCharge,
}: Props) {
  const [discountText, setDiscountText] = useState(() =>
    discount ? (discount.type === "amount" ? String(discount.value / 100) : String(discount.value)) : "",
  );
  const [discountType, setDiscountType] = useState<PosDiscount["type"]>(discount?.type ?? "amount");

  function applyDiscount(text: string, type: PosDiscount["type"]) {
    setDiscountText(text);
    setDiscountType(type);
    if (type === "percent") {
      const value = Number(text.replace(/[%\s]/g, ""));
      onDiscount(text.trim() && Number.isFinite(value) && value > 0 ? { type, value: Math.min(100, value) } : null);
    } else {
      const paise = rupeesToPaise(text);
      onDiscount(paise ? { type, value: paise } : null);
    }
  }

  return (
    <aside className="flex min-h-0 flex-col rounded-xl border border-line bg-surface shadow-xs" aria-label="Cart">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShoppingCart className="size-4" aria-hidden /> Current sale
          {totals.itemCount > 0 && <span className="text-ink-muted">({totals.itemCount})</span>}
        </h2>
        {cart.length > 0 && (
          <button type="button" onClick={onClear} className="text-xs font-medium text-ink-muted hover:text-red-600">
            Clear
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onEditCustomer}
        className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-left text-sm hover:bg-canvas"
      >
        <UserRound className="size-4 shrink-0 text-ink-muted" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-ink">{customerLabel(customer)}</span>
        <span className="text-xs font-medium text-brand">{customer.kind === "walk-in" && !customer.name ? "Add" : "Change"}</span>
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-ink-muted">Tap a product, or scan a barcode, to add it.</p>
        ) : (
          <ul className="divide-y divide-line">
            {cart.map((line) => (
              <li key={line.variantId} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{line.productName}</p>
                    {line.variantName !== "Standard" && <p className="truncate text-xs text-ink-muted">{line.variantName}</p>}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${line.productName}`}
                    onClick={() => onQuantity(line.variantId, 0)}
                    className="rounded p-1 text-ink-muted hover:bg-canvas hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center rounded-lg border border-line-strong">
                    <button
                      type="button"
                      aria-label="One less"
                      onClick={() => onQuantity(line.variantId, line.quantity - 1)}
                      className="grid size-8 place-items-center text-ink hover:bg-canvas"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <input
                      aria-label={`Quantity of ${line.productName}`}
                      inputMode="numeric"
                      value={line.quantity}
                      onChange={(event) => {
                        const quantity = Number(event.target.value.replace(/\D/g, ""));
                        if (quantity > 0) onQuantity(line.variantId, quantity);
                      }}
                      className="h-8 w-10 border-x border-line-strong bg-transparent text-center text-sm text-ink outline-none"
                    />
                    <button
                      type="button"
                      aria-label="One more"
                      disabled={line.quantity >= line.available}
                      onClick={() => onQuantity(line.variantId, line.quantity + 1)}
                      className="grid size-8 place-items-center text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">{formatInr(line.unitPaise * line.quantity)}</p>
                    {line.quantity > 1 && <p className="text-xs text-ink-muted">{formatInr(line.unitPaise)} each</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <label htmlFor="pos-discount" className="text-sm text-ink-body">
            Discount
          </label>
          <div className="ml-auto flex items-center gap-1">
            <div className="flex rounded-md border border-line-strong text-xs" role="group" aria-label="Discount type">
              {(["amount", "percent"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={discountType === type}
                  onClick={() => applyDiscount(discountText, type)}
                  className={`px-2 py-1 font-medium ${discountType === type ? "bg-brand text-white" : "text-ink-muted"}`}
                >
                  {type === "amount" ? "₹" : "%"}
                </button>
              ))}
            </div>
            <input
              id="pos-discount"
              inputMode="decimal"
              value={discountText}
              placeholder="0"
              onChange={(event) => applyDiscount(event.target.value, discountType)}
              className="h-8 w-24 rounded-md border border-line-strong bg-surface px-2 text-right text-sm text-ink outline-none focus:border-brand"
            />
            {discountText && (
              <button type="button" aria-label="Remove discount" onClick={() => applyDiscount("", discountType)} className="p-1 text-ink-muted">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
        {totals.discountError && <p className="mt-1 text-right text-xs text-red-600">{totals.discountError}</p>}

        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between text-ink-body">
            <dt>Subtotal</dt>
            <dd>{formatInr(totals.subtotalPaise)}</dd>
          </div>
          {totals.discountPaise > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Discount</dt>
              <dd>−{formatInr(totals.discountPaise)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-1 text-lg font-semibold text-ink">
            <dt>Total</dt>
            <dd>{formatInr(totals.totalPaise)}</dd>
          </div>
          <p className="text-right text-xs text-ink-muted">Prices include GST</p>
        </dl>

        <Button
          fullWidth
          size="lg"
          className="mt-3"
          isDisabled={cart.length === 0 || Boolean(totals.discountError)}
          onPress={onCharge}
        >
          Charge {formatInr(totals.totalPaise)}
        </Button>
      </div>
    </aside>
  );
}
