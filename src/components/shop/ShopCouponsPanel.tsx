import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Calendar,
  Collection,
  ComboBox,
  DateField,
  DatePicker,
  Description,
  EmptyState,
  Input,
  Label,
  ListBox,
  ListBoxLoadMoreItem,
  Spinner,
  type Key,
} from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import { parseDate, today } from "@internationalized/date";
import { ArrowLeft, Calendar as CalendarIcon, Plus, SquarePen, TicketPercent } from "lucide-react";
import {
  shopApi,
  type CreateShopCouponInput,
  type ShopCoupon,
  type ShopCouponDiscountType,
  type ShopCouponRedemption,
  type ShopProduct,
  type ShopVariant,
  type UpdateShopCouponInput,
} from "../../api/shop.ts";
import { errorMessage } from "../../api/http.ts";
import { formatPaise } from "../../api/wallet.ts";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { paiseToRupeesInput, rupeesInputToPaise } from "../../utils/hosting-pricing.ts";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput from "../ui/SelectInput.tsx";
import TextInput from "../ui/TextInput.tsx";

const PRODUCT_PAGE_SIZE = 20;
const VARIANT_BATCH_SIZE = 20;
const ALL_VARIANTS_KEY = "__all__";

type VariantListItem = { id: string; name: string };

const IST = "Asia/Kolkata";
const TYPE_OPTIONS: { value: ShopCouponDiscountType; label: string }[] = [
  { value: "PERCENT", label: "Percent off" },
  { value: "FIXED_PAISE", label: "Fixed ₹ off" },
];
const SCOPE_OPTIONS: { value: "cart" | "product"; label: string }[] = [
  { value: "cart", label: "Whole cart" },
  { value: "product", label: "Specific product" },
];

type FormState = {
  code: string;
  discountType: ShopCouponDiscountType;
  discountValue: string;
  scope: "cart" | "product";
  productId: string;
  variantId: string;
  expiresAt: string;
  maxUses: string;
};

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;

function expiryToIso(dateOnly: string): string {
  return `${dateOnly}T23:59:59.999+05:30`;
}

function isoToDateOnly(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function parseExpiryDate(dateOnly: string): DateValue | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;
  try {
    return parseDate(dateOnly);
  } catch {
    return null;
  }
}

function emptyForm(): FormState {
  return {
    code: "",
    discountType: "PERCENT",
    discountValue: "10",
    scope: "cart",
    productId: "",
    variantId: "",
    expiresAt: "",
    maxUses: "",
  };
}

function formFromCoupon(coupon: ShopCoupon): FormState {
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue:
      coupon.discountType === "PERCENT"
        ? String(coupon.discountValue)
        : paiseToRupeesInput(coupon.discountValue),
    scope: coupon.scope,
    productId: coupon.productId ?? "",
    variantId: coupon.variantId ?? "",
    expiresAt: coupon.expiresAt ? isoToDateOnly(coupon.expiresAt) : "",
    maxUses: coupon.maxUses !== null ? String(coupon.maxUses) : "",
  };
}

function formatDiscount(coupon: ShopCoupon): string {
  if (coupon.discountType === "PERCENT") return `${coupon.discountValue}% off`;
  return `${formatPaise(coupon.discountValue)} off`;
}

function formatExpiryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: IST });
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function CouponDetail({
  websiteId,
  coupon,
  onBack,
  onUpdated,
}: {
  websiteId: string;
  coupon: ShopCoupon;
  onBack: () => void;
  onUpdated: (coupon: ShopCoupon) => void;
}) {
  const [redemptions, setRedemptions] = useState<ShopCouponRedemption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRedemptions(null);
    setError(null);
    shopApi
      .couponRedemptions(websiteId, coupon.id)
      .then((rows) => {
        if (!cancelled) setRedemptions(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, coupon.id]);

  async function toggleActive() {
    if (toggling) return;
    setToggling(true);
    setFeedback(null);
    try {
      const updated = await shopApi.updateCoupon(websiteId, coupon.id, { active: !coupon.active });
      onUpdated(updated);
      setFeedback({
        status: "success",
        message: updated.active ? "Coupon activated." : "Coupon deactivated.",
      });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="outline" onPress={onBack}>
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-mono text-base font-semibold text-ink">{coupon.code}</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                coupon.active ? "bg-emerald-50 text-emerald-700" : "bg-canvas text-ink-muted"
              }`}
            >
              {coupon.active ? "Active" : "Off"}
            </span>
          </div>
          <p className="text-sm text-ink-muted">
            {formatDiscount(coupon)} · {coupon.usedCount}
            {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""} uses · Expires{" "}
            {coupon.expiresAt ? formatExpiryDate(coupon.expiresAt) : "never"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onPress={() => setEditOpen(true)}>
            <SquarePen className="size-3.5" aria-hidden />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onPress={() => void toggleActive()} isDisabled={toggling}>
            {coupon.active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
      {error && <FormAlert status="danger">{error}</FormAlert>}

      <dl className="grid gap-3 rounded-xl border border-line bg-surface px-5 py-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium text-ink-muted">Applies to</dt>
          <dd className="text-sm text-ink">
            {coupon.scope === "cart"
              ? "Whole cart"
              : [coupon.productName, coupon.variantName].filter(Boolean).join(" · ") || "Product"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink-muted">Discount</dt>
          <dd className="text-sm text-ink">{formatDiscount(coupon)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-ink-muted">Uses</dt>
          <dd className="text-sm text-ink">
            {coupon.usedCount}
            {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : " (unlimited)"}
          </dd>
        </div>
      </dl>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="border-b border-line px-5 py-3">
          <h3 className="text-sm font-semibold text-ink">Orders that used this coupon</h3>
          <p className="text-xs text-ink-muted">
            {redemptions?.length ?? 0} {(redemptions?.length ?? 0) === 1 ? "order" : "orders"}
          </p>
        </div>
        {redemptions === null && !error && (
          <div className="grid place-items-center py-12">
            <Spinner aria-label="Loading coupon usage" />
          </div>
        )}
        {redemptions && redemptions.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No usage yet</p>
            <p className="mt-1 text-sm text-ink-muted">Orders appear here after a shopper pays with this code.</p>
          </div>
        )}
        {redemptions && redemptions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">When</th>
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">List</th>
                  <th className="px-4 py-2.5 text-right font-medium">Discount</th>
                  <th className="px-4 py-2.5 text-right font-medium">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {redemptions.map((row) => (
                  <tr key={row.id} className="hover:bg-canvas/40">
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-body">{formatWhen(row.createdAt)}</td>
                    <td className="px-4 py-2.5 font-medium text-ink">#{row.order.number}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-ink">{row.customer.fullName}</p>
                      <p className="text-xs text-ink-muted">{row.customer.email}</p>
                    </td>
                    <td className="px-4 py-2.5 capitalize text-ink-body">{row.order.status}</td>
                    <td className="px-4 py-2.5 text-right text-ink-body">{formatPaise(row.listAmountPaise)}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-700">−{formatPaise(row.discountPaise)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-ink">
                      {formatPaise(row.finalAmountPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ShopCouponFormModal
        isOpen={editOpen}
        mode="edit"
        websiteId={websiteId}
        coupon={coupon}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => {
          onUpdated(updated);
          setEditOpen(false);
          setFeedback({ status: "success", message: `Coupon ${updated.code} updated.` });
        }}
      />
    </div>
  );
}

export default function ShopCouponsPanel({ websiteId }: { websiteId: string }) {
  const [coupons, setCoupons] = useState<ShopCoupon[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listFeedback, setListFeedback] = useState<Feedback>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ShopCoupon | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function reload() {
    return shopApi
      .coupons(websiteId)
      .then((nextCoupons) => {
        setCoupons(nextCoupons);
        setLoadError(null);
      })
      .catch((err: unknown) => setLoadError(errorMessage(err)));
  }

  useEffect(() => {
    void reload();
  }, [websiteId]);

  async function toggleActive(coupon: ShopCoupon) {
    setListFeedback(null);
    try {
      const updated = await shopApi.updateCoupon(websiteId, coupon.id, { active: !coupon.active });
      setCoupons((current) => current?.map((row) => (row.id === updated.id ? updated : row)) ?? null);
    } catch (err) {
      setListFeedback({ status: "danger", message: errorMessage(err) });
    }
  }

  if (loadError) return <FormAlert status="danger">{loadError}</FormAlert>;
  if (!coupons) {
    return (
      <div className="grid place-items-center py-12">
        <Spinner aria-label="Loading coupons" />
      </div>
    );
  }

  const selected = selectedId ? coupons.find((row) => row.id === selectedId) ?? null : null;
  if (selected) {
    return (
      <CouponDetail
        websiteId={websiteId}
        coupon={selected}
        onBack={() => setSelectedId(null)}
        onUpdated={(updated) => {
          setCoupons((current) => current?.map((row) => (row.id === updated.id ? updated : row)) ?? null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Coupons</h2>
          <p className="text-sm text-ink-muted">Create cart-wide codes or codes that only discount a product.</p>
        </div>
        <Button onPress={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Create coupon
        </Button>
      </div>

      {listFeedback && <FormAlert status={listFeedback.status}>{listFeedback.message}</FormAlert>}

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        {coupons.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <TicketPercent className="mx-auto size-8 text-ink-muted" aria-hidden />
            <p className="mt-3 text-base font-semibold text-ink">No coupons yet</p>
            <p className="mt-1 text-sm text-ink-muted">Shoppers can apply a code at checkout.</p>
            <Button className="mt-4" onPress={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Create coupon
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Code</th>
                  <th className="px-4 py-2.5 font-medium">Discount</th>
                  <th className="px-4 py-2.5 font-medium">Applies to</th>
                  <th className="px-4 py-2.5 font-medium">Uses</th>
                  <th className="px-4 py-2.5 font-medium">Expires</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    tabIndex={0}
                    className="cursor-pointer transition-colors hover:bg-canvas/40 focus-visible:bg-canvas/40 focus-visible:outline-none"
                    onClick={() => setSelectedId(coupon.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(coupon.id);
                      }
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-ink">{coupon.code}</td>
                    <td className="px-4 py-3 text-ink-body">{formatDiscount(coupon)}</td>
                    <td className="px-4 py-3 text-ink-body">
                      {coupon.scope === "cart"
                        ? "Whole cart"
                        : [coupon.productName, coupon.variantName].filter(Boolean).join(" · ") || "Product"}
                    </td>
                    <td className="px-4 py-3 text-ink-body">
                      {coupon.usedCount}
                      {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-ink-body">
                      {coupon.expiresAt ? formatExpiryDate(coupon.expiresAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          coupon.active ? "bg-emerald-50 text-emerald-700" : "bg-canvas text-ink-muted"
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          void toggleActive(coupon);
                        }}
                      >
                        {coupon.active ? "Active" : "Off"}
                      </button>
                    </td>
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <Button size="sm" variant="outline" onPress={() => setEditing(coupon)}>
                        <SquarePen className="size-3.5" aria-hidden />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ShopCouponFormModal
        isOpen={createOpen || Boolean(editing)}
        mode={editing ? "edit" : "create"}
        websiteId={websiteId}
        coupon={editing}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        onSaved={(saved) => {
          setCoupons((current) => {
            if (!current) return [saved];
            const exists = current.some((row) => row.id === saved.id);
            return exists
              ? current.map((row) => (row.id === saved.id ? saved : row))
              : [saved, ...current];
          });
          setCreateOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

function ShopCouponFormModal({
  isOpen,
  mode,
  websiteId,
  coupon,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  mode: "create" | "edit";
  websiteId: string;
  coupon?: ShopCoupon | null;
  onClose: () => void;
  onSaved: (coupon: ShopCoupon) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm(coupon ? formFromCoupon(coupon) : emptyForm());
    setFeedback(null);
    setSelectedProduct(null);
    if (!coupon?.productId) return;
    const productId = coupon.productId;
    const search = coupon.productName?.trim() || undefined;
    void shopApi
      .products(websiteId, { search, page: 1, pageSize: PRODUCT_PAGE_SIZE })
      .then((page) => {
        const found = page.products.find((product) => product.id === productId) ?? null;
        setSelectedProduct(found);
      })
      .catch(() => setSelectedProduct(null));
  }, [isOpen, coupon, websiteId]);

  const todayIst = today(IST);
  const minExpiry = (() => {
    const current = parseExpiryDate(form.expiresAt);
    if (current && current.compare(todayIst) < 0) return current;
    return todayIst;
  })();

  async function handleSave() {
    setFeedback(null);
    let discountValue: number;
    if (form.discountType === "PERCENT") {
      const value = Number(form.discountValue);
      if (!Number.isInteger(value) || value < 1 || value > 100) {
        setFeedback({ status: "danger", message: "Percent must be a whole number from 1 to 100." });
        return;
      }
      discountValue = value;
    } else {
      const paise = rupeesInputToPaise(form.discountValue);
      if (paise === null || Number.isNaN(paise) || paise < 1) {
        setFeedback({ status: "danger", message: "Enter a rupee amount greater than 0." });
        return;
      }
      discountValue = paise;
    }

    let maxUses: number | null = null;
    if (form.maxUses.trim()) {
      const value = Number(form.maxUses);
      if (!Number.isInteger(value) || value < 1) {
        setFeedback({
          status: "danger",
          message: "Max uses must be a whole number ≥ 1, or blank for unlimited.",
        });
        return;
      }
      maxUses = value;
    }

    if (form.scope === "product" && !form.productId) {
      setFeedback({ status: "danger", message: "Choose which product this coupon applies to." });
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        const input: CreateShopCouponInput = {
          code: form.code.trim().toUpperCase(),
          discountType: form.discountType,
          discountValue,
          productId: form.scope === "product" ? form.productId : null,
          variantId: form.scope === "product" && form.variantId ? form.variantId : null,
          expiresAt: form.expiresAt ? expiryToIso(form.expiresAt) : null,
          maxUses,
        };
        onSaved(await shopApi.createCoupon(websiteId, input));
      } else if (coupon) {
        const input: UpdateShopCouponInput = {
          discountType: form.discountType,
          discountValue,
          productId: form.scope === "product" ? form.productId : null,
          variantId: form.scope === "product" && form.variantId ? form.variantId : null,
          expiresAt: form.expiresAt ? expiryToIso(form.expiresAt) : null,
          maxUses,
        };
        onSaved(await shopApi.updateCoupon(websiteId, coupon.id, input));
      }
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      headerDetails={{
        icon: <TicketPercent className="size-4.5" />,
        title: mode === "create" ? "Create coupon" : "Edit coupon",
        description:
          mode === "create"
            ? "Shoppers apply this at checkout. Each shopper can use a code once."
            : "Update discount, scope, expiry, or usage limit. The code cannot be changed.",
      }}
      iconTone="brand"
      size="md"
      primaryAction={{
        label: mode === "create" ? "Create coupon" : "Save changes",
        onPress: () => void handleSave(),
        isPending: saving,
        isDisabled: saving,
      }}
      secondaryAction={{ label: "Cancel", onPress: onClose, isDisabled: saving }}
    >
      <div className="flex flex-col gap-4">
        {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
        <TextInput
          label="Code"
          name="shop-coupon-code"
          value={form.code}
          onChange={(code) => setForm((current) => ({ ...current, code: code.toUpperCase() }))}
          placeholder="SAVE20"
          isDisabled={saving || mode === "edit"}
          isRequired
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Type"
            value={form.discountType}
            onChange={(discountType) =>
              setForm((current) => ({
                ...current,
                discountType,
                discountValue: discountType === "PERCENT" ? "10" : "100",
              }))
            }
            options={TYPE_OPTIONS}
          />
          <TextInput
            label={form.discountType === "PERCENT" ? "Percent" : "Rupees off"}
            name="shop-coupon-value"
            value={form.discountValue}
            onChange={(discountValue) => setForm((current) => ({ ...current, discountValue }))}
            placeholder={form.discountType === "PERCENT" ? "10" : "100"}
            isDisabled={saving}
            isRequired
          />
        </div>

        <SelectInput
          label="Applies to"
          value={form.scope}
          onChange={(scope) =>
            setForm((current) => ({
              ...current,
              scope,
              productId: scope === "cart" ? "" : current.productId,
              variantId: scope === "cart" ? "" : current.variantId,
            }))
          }
          options={SCOPE_OPTIONS}
        />

        {form.scope === "product" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <ShopProductComboBox
              websiteId={websiteId}
              productId={form.productId}
              productLabel={selectedProduct?.name ?? coupon?.productName ?? null}
              isDisabled={saving}
              onSelect={(product) => {
                setSelectedProduct(product);
                setForm((current) => ({
                  ...current,
                  productId: product?.id ?? "",
                  variantId: "",
                }));
              }}
            />
            <ShopVariantComboBox
              variants={selectedProduct?.variants ?? []}
              variantId={form.variantId}
              variantLabel={
                selectedProduct?.variants.find((variant) => variant.id === form.variantId)?.name ??
                coupon?.variantName ??
                null
              }
              isDisabled={saving || !form.productId}
              onSelect={(variantId) => setForm((current) => ({ ...current, variantId }))}
            />
          </div>
        )}

        <DatePicker
          className="w-full text-ink"
          name="shop-coupon-expires"
          granularity="day"
          value={parseExpiryDate(form.expiresAt)}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              expiresAt: value ? value.toString() : "",
            }))
          }
          minValue={minExpiry}
          isDisabled={saving}
        >
          <Label className="mb-1 block text-sm font-medium text-ink">Expires (optional)</Label>
          <DateField.Group
            fullWidth
            className="h-9 rounded-lg border border-ed-border bg-surface text-sm text-ink shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong focus-within:border-ed-accent focus-within:ring-2 focus-within:ring-ed-accent/15"
          >
            <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger className="text-ink-muted hover:text-ink">
                <DatePicker.TriggerIndicator className="text-ink-muted">
                  <CalendarIcon className="size-4" />
                </DatePicker.TriggerIndicator>
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <Description className="mt-1 block text-xs text-ink-muted">
            Valid through the end of this day (IST). Leave empty for no expiry.
          </Description>
          <DatePicker.Popover
            placement="top"
            className="z-(--z-ed-popover) border border-ed-border bg-surface text-ink shadow-ed-pop"
          >
            <Calendar aria-label="Coupon expiry date" className="text-ink">
              <Calendar.Header>
                <Calendar.YearPickerTrigger className="text-ink">
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell className="text-ink-muted">{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>{(date) => <Calendar.Cell date={date} className="text-ink" />}</Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => <Calendar.YearPickerCell year={year} className="text-ink" />}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
          </DatePicker.Popover>
        </DatePicker>

        <TextInput
          label="Max uses (optional)"
          name="shop-coupon-max"
          value={form.maxUses}
          onChange={(maxUses) => setForm((current) => ({ ...current, maxUses }))}
          placeholder="Unlimited"
          isDisabled={saving}
          description="Each shopper can still only use a code once."
        />
      </div>
    </CommonModal>
  );
}

function ShopVariantComboBox({
  variants,
  variantId,
  variantLabel,
  isDisabled,
  onSelect,
}: {
  variants: ShopVariant[];
  variantId: string;
  variantLabel?: string | null;
  isDisabled?: boolean;
  onSelect: (variantId: string) => void;
}) {
  const selectedKey = variantId || ALL_VARIANTS_KEY;
  const selectedLabel = variantId ? (variantLabel ?? "Variant") : "All variants";
  const [filterText, setFilterText] = useState(selectedLabel);
  const debouncedSearch = useDebouncedValue(filterText.trim().toLowerCase(), 200);
  const [visibleCount, setVisibleCount] = useState(VARIANT_BATCH_SIZE);

  useEffect(() => {
    setFilterText(selectedLabel);
  }, [selectedKey, selectedLabel]);

  const filtered = useMemo(() => {
    const all: VariantListItem[] = [
      { id: ALL_VARIANTS_KEY, name: "All variants" },
      ...variants.map((variant) => ({ id: variant.id, name: variant.name })),
    ];
    if (!debouncedSearch) return all;
    // Keep "All variants" visible when the query matches it; otherwise filter product variants.
    return all.filter((item) => {
      if (item.id === ALL_VARIANTS_KEY) return "all variants".includes(debouncedSearch);
      return item.name.toLowerCase().includes(debouncedSearch);
    });
  }, [variants, debouncedSearch]);

  useEffect(() => {
    setVisibleCount(VARIANT_BATCH_SIZE);
  }, [debouncedSearch, variants]);

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <ComboBox
      className="w-full text-ink"
      fullWidth
      allowsEmptyCollection
      isDisabled={isDisabled}
      selectedKey={selectedKey}
      inputValue={filterText}
      onInputChange={setFilterText}
      defaultFilter={() => true}
      onSelectionChange={(key: Key | null) => {
        if (key == null || String(key) === ALL_VARIANTS_KEY) {
          onSelect("");
          setFilterText("All variants");
          return;
        }
        const id = String(key);
        const match = variants.find((variant) => variant.id === id);
        onSelect(id);
        if (match) setFilterText(match.name);
      }}
    >
      <Label className="mb-1 block text-sm font-medium text-ink">Variant (optional)</Label>
      <ComboBox.InputGroup className="h-9 rounded-lg border border-ed-border bg-surface text-sm text-ink shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong focus-within:border-ed-accent focus-within:ring-2 focus-within:ring-ed-accent/15 data-disabled:bg-canvas data-disabled:text-ink-muted">
        <Input placeholder="Search variants…" className="min-w-0 flex-1 bg-transparent px-3 outline-none" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover className="z-(--z-ed-popover) max-h-72 overflow-hidden rounded-lg border border-ed-border bg-surface text-ink shadow-ed-pop">
        <ListBox
          className="max-h-72 overflow-y-auto overscroll-contain p-1 outline-none"
          renderEmptyState={() => (
            <EmptyState className="px-3 py-4 text-center text-sm text-ink-muted">
              {variants.length === 0 ? "Choose a product first." : "No variants match this search."}
            </EmptyState>
          )}
        >
          <Collection items={visibleItems}>
            {(item) => (
              <ListBox.Item
                id={item.id}
                textValue={item.name}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-ink outline-none data-[selected=true]:bg-ed-accent-soft data-[selected=true]:font-medium data-[selected=true]:text-ed-accent data-[focused=true]:bg-canvas"
              >
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </Collection>
          {hasMore && (
            <ListBoxLoadMoreItem
              isLoading={false}
              onLoadMore={() =>
                setVisibleCount((count) => Math.min(filtered.length, count + VARIANT_BATCH_SIZE))
              }
            >
              <div className="py-2 text-center text-xs text-ink-muted">Scroll for more</div>
            </ListBoxLoadMoreItem>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

function ShopProductComboBox({
  websiteId,
  productId,
  productLabel,
  isDisabled,
  onSelect,
}: {
  websiteId: string;
  productId: string;
  productLabel?: string | null;
  isDisabled?: boolean;
  onSelect: (product: ShopProduct | null) => void;
}) {
  const [filterText, setFilterText] = useState(productLabel ?? "");
  const debouncedSearch = useDebouncedValue(filterText.trim(), 300);
  const [items, setItems] = useState<ShopProduct[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    setFilterText(productLabel ?? "");
  }, [productId, productLabel]);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setPage(1);
    void shopApi
      .products(websiteId, {
        search: debouncedSearch || undefined,
        page: 1,
        pageSize: PRODUCT_PAGE_SIZE,
      })
      .then((result) => {
        if (id !== requestId.current) return;
        setItems(result.products);
        setTotal(result.total);
      })
      .catch(() => {
        if (id !== requestId.current) return;
        setItems([]);
        setTotal(0);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [websiteId, debouncedSearch]);

  const hasMore = items.length < total;
  const listItems = useMemo(() => {
    if (!productId || !productLabel) return items;
    if (items.some((product) => product.id === productId)) return items;
    return [
      {
        id: productId,
        name: productLabel,
        variants: [],
      } as unknown as ShopProduct,
      ...items,
    ];
  }, [items, productId, productLabel]);

  async function loadMore() {
    if (!hasMore || loading || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const result = await shopApi.products(websiteId, {
        search: debouncedSearch || undefined,
        page: nextPage,
        pageSize: PRODUCT_PAGE_SIZE,
      });
      setItems((current) => {
        const seen = new Set(current.map((product) => product.id));
        return [...current, ...result.products.filter((product) => !seen.has(product.id))];
      });
      setTotal(result.total);
      setPage(nextPage);
    } catch {
      /* keep current page */
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <ComboBox
      className="w-full text-ink"
      fullWidth
      allowsEmptyCollection
      isDisabled={isDisabled}
      selectedKey={productId || null}
      inputValue={filterText}
      onInputChange={setFilterText}
      defaultFilter={() => true}
      onSelectionChange={(key: Key | null) => {
        if (key == null) {
          onSelect(null);
          return;
        }
        const id = String(key);
        const product = items.find((row) => row.id === id) ?? null;
        onSelect(product);
        if (product) setFilterText(product.name);
      }}
    >
      <Label className="mb-1 block text-sm font-medium text-ink">
        Product
        <span className="ms-0.5 text-danger" aria-hidden>
          *
        </span>
      </Label>
      <ComboBox.InputGroup className="h-9 rounded-lg border border-ed-border bg-surface text-sm text-ink shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong focus-within:border-ed-accent focus-within:ring-2 focus-within:ring-ed-accent/15">
        <Input placeholder="Search products…" className="min-w-0 flex-1 bg-transparent px-3 outline-none" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover className="z-(--z-ed-popover) max-h-72 overflow-hidden rounded-lg border border-ed-border bg-surface text-ink shadow-ed-pop">
        <ListBox
          className="max-h-72 overflow-y-auto overscroll-contain p-1 outline-none"
          renderEmptyState={() => (
            <EmptyState className="px-3 py-4 text-center text-sm text-ink-muted">
              {loading ? "Searching…" : "No products match this search."}
            </EmptyState>
          )}
        >
          <Collection items={listItems}>
            {(product) => (
              <ListBox.Item
                id={product.id}
                textValue={product.name}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-ink outline-none data-[selected=true]:bg-ed-accent-soft data-[selected=true]:font-medium data-[selected=true]:text-ed-accent data-[focused=true]:bg-canvas"
              >
                {product.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </Collection>
          {(hasMore || loadingMore) && (
            <ListBoxLoadMoreItem isLoading={loadingMore || loading} onLoadMore={() => void loadMore()}>
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-ink-muted">
                {(loadingMore || loading) && <Spinner size="sm" />}
                <span>{loadingMore || loading ? "Loading more…" : "Scroll for more"}</span>
              </div>
            </ListBoxLoadMoreItem>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
