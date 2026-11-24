import { useRef, useState, type ReactNode } from "react";
import { Button, toast } from "@heroui/react";
import { Layers, Plus } from "lucide-react";
import { errorMessage } from "../../../api/http.ts";
import { shopApi, type ShopCategory, type ShopProduct } from "../../../api/shop.ts";
import CommonModal from "../../ui/CommonModal.tsx";
import ConfirmDialog from "../../ui/ConfirmDialog.tsx";
import FormAlert from "../../ui/FormAlert.tsx";
import SelectInput from "../../ui/SelectInput.tsx";
import TextAreaInput from "../../ui/TextAreaInput.tsx";
import TextInput from "../../ui/TextInput.tsx";
import ImageStrip, { type PhotoUpload } from "./ImageStrip.tsx";
import ProductSettings from "./ProductSettings.tsx";
import VariantGroupEditor from "./VariantGroupEditor.tsx";
import {
  MAX_PRODUCT_IMAGES,
  STANDARD_KEY,
  blankOption,
  blankSet,
  hasOptions,
  toInput,
  withoutOptions,
  type ProductDraft,
  type ProductFieldErrors,
  type SetDraft,
} from "./product-draft.ts";

const NO_CATEGORY = "__none";

/**
 * Add / edit product modal. Laid out in the order people think about a
 * product: what it is, what it looks like, what it costs; options and
 * shop rules only when needed.
 */
export default function ProductForm({
  websiteId,
  clientId,
  categories,
  shopReturnDays,
  shopGstPercent,
  shopPriceIncludesGst,
  draft,
  onChange,
  onClose,
  onSaved,
  onDeleted,
}: {
  websiteId: string;
  clientId: string;
  categories: ShopCategory[];
  shopReturnDays: number | null;
  shopGstPercent: number;
  shopPriceIncludesGst: boolean;
  draft: ProductDraft;
  onChange: (draft: ProductDraft) => void;
  onClose: () => void;
  onSaved: (product: ShopProduct, previousCategoryId?: string | null) => void;
  onDeleted: (productId: string, categoryId: string | null) => void;
}) {
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyUploads, setBusyUploads] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [confirm, setConfirm] = useState<"delete" | "clear-options" | null>(null);

  const withOptions = hasOptions(draft);
  const grouped = draft.sets.length > 1;
  const firstSet = draft.sets[0];

  function clearErrors() {
    setError(null);
    setFieldErrors({});
  }

  function showError(message: string, nextFields: ProductFieldErrors = {}) {
    setError(message);
    setFieldErrors(nextFields);
    requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  /** Applies a change to the latest draft (uploads can finish after other edits). */
  function commit(recipe: (current: ProductDraft) => ProductDraft) {
    const next = recipe(draftRef.current);
    draftRef.current = next;
    onChange(next);
    clearErrors();
  }

  function patch(values: Partial<ProductDraft>) {
    commit((current) => ({ ...current, ...values }));
  }

  function updateSet(key: string, change: Partial<SetDraft> | ((current: SetDraft) => Partial<SetDraft>)) {
    commit((current) => ({
      ...current,
      sets: current.sets.map((set) => (set.key === key ? { ...set, ...(typeof change === "function" ? change(set) : change) } : set)),
    }));
  }

  function addOptions() {
    commit((current) => ({
      ...current,
      sets: current.sets.map((set, index) => (index === 0 ? { ...set, options: [blankOption()], skus: {}, barcodes: {} } : set)),
    }));
  }

  function clearOptions() {
    const filled = draft.sets.some((set) => set.options.some((option) => option.values.length > 0));
    if (filled) setConfirm("clear-options");
    else commit(withoutOptions);
  }

  const upload: PhotoUpload = {
    clientId,
    websiteId,
    onError: setError,
    onBusy: (busy) => setBusyUploads((count) => Math.max(0, count + (busy ? 1 : -1))),
  };

  async function save() {
    const parsed = toInput(draft);
    if ("error" in parsed) {
      showError(parsed.error, parsed.fieldErrors ?? {});
      return;
    }
    setSaving(true);
    clearErrors();
    try {
      const product = draft.id ? await shopApi.updateProduct(websiteId, draft.id, parsed.input) : await shopApi.createProduct(websiteId, parsed.input);
      onSaved(product, draft.originalCategoryId);
      toast.success(draft.id ? "Product saved" : "Product created", { description: product.name });
    } catch (err) {
      showError(errorMessage(err));
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
      onDeleted(draft.id, draft.originalCategoryId ?? null);
      toast.success("Product deleted", { description: draft.name.trim() || undefined });
    } catch (err) {
      setConfirm(null);
      showError(errorMessage(err));
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
      subtitle="A name, a photo and a price are all you need. Sizes, colours and shop rules are optional."
      subtitleClassName="whitespace-normal"
      primaryAction={{
        label: busyUploads > 0 ? "Uploading photos…" : draft.id ? "Save product" : "Create product",
        onPress: () => void save(),
        isPending: saving || busyUploads > 0,
        isDisabled: busyUploads > 0,
      }}
      secondaryAction={{ label: "Cancel", onPress: onClose }}
    >
      {error && (
        <div ref={errorRef} className="mb-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}

      <div className="space-y-7">
        <FormSection step={1} title="Product details">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_240px]">
            <TextInput
              label="Product name"
              name="productName"
              value={draft.name}
              onChange={(name) => patch({ name })}
              placeholder="e.g. Solid wood dining table"
              error={fieldErrors.name}
              isRequired
              autoFocus={!draft.id}
            />
            <SelectInput
              label="Category"
              value={draft.categoryId || NO_CATEGORY}
              onChange={(value) => patch({ categoryId: value === NO_CATEGORY ? "" : value })}
              options={[{ value: NO_CATEGORY, label: "No category" }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
            />
            <div className="sm:col-span-2">
              <TextAreaInput
                label="Description (optional)"
                name="productDescription"
                value={draft.description}
                onChange={(description) => patch({ description })}
              />
            </div>
          </div>
        </FormSection>

        <FormSection step={2} title="Photos" description={`The first photo is the cover. Up to ${MAX_PRODUCT_IMAGES} photos.`}>
          <ImageStrip
            images={draft.images}
            onChange={(images) => commit((current) => ({ ...current, images }))}
            upload={upload}
            altText={draft.name}
          />
        </FormSection>

        <FormSection step={3} title="Price and options">
          {!grouped && firstSet && (
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-44">
                <TextInput
                  label="Price (₹)"
                  name={`set-price-${firstSet.key}`}
                  value={firstSet.price}
                  onChange={(price) => updateSet(firstSet.key, { price })}
                  placeholder="0.00"
                  error={fieldErrors.priceBySet?.[firstSet.key]}
                  isRequired
                />
              </div>
              {!withOptions && (
                <div className="w-52">
                  <TextInput
                    label="SKU (optional)"
                    name="productSku"
                    value={firstSet.skus[STANDARD_KEY] ?? ""}
                    onChange={(sku) => updateSet(firstSet.key, (current) => ({ skus: { ...current.skus, [STANDARD_KEY]: sku } }))}
                    placeholder="Your stock code"
                  />
                </div>
              )}
              {!withOptions && (
                // A scanner presses Enter after the code; keep that from submitting the form.
                <div className="w-52" onKeyDownCapture={(event) => event.key === "Enter" && event.preventDefault()}>
                  <TextInput
                    label="Barcode (optional)"
                    name="productBarcode"
                    value={firstSet.barcodes[STANDARD_KEY] ?? ""}
                    onChange={(barcode) =>
                      updateSet(firstSet.key, (current) => ({ barcodes: { ...current.barcodes, [STANDARD_KEY]: barcode } }))
                    }
                    placeholder="Scan or type"
                  />
                </div>
              )}
              {withOptions && <p className="pt-7 text-xs text-ink-muted">Every variant uses this price unless you change it below.</p>}
            </div>
          )}

          {!withOptions ? (
            <button
              type="button"
              onClick={addOptions}
              className="mt-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-line-strong px-4 py-3 text-left hover:bg-canvas/60"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                <Plus className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-medium text-ink">Add options like size or colour</span>
                <span className="block text-xs text-ink-muted">For products that come in different sizes, colours or materials.</span>
              </span>
            </button>
          ) : (
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink">Options</span>
                <button type="button" onClick={clearOptions} className="text-xs font-medium text-ink-muted hover:text-danger">
                  Remove all options
                </button>
              </div>
              <div className="space-y-4">
                {draft.sets.map((set, index) => (
                  <VariantGroupEditor
                    key={set.key}
                    set={set}
                    index={index}
                    isGrouped={grouped}
                    canRemove={grouped}
                    productName={draft.name}
                    upload={upload}
                    priceError={fieldErrors.priceBySet?.[set.key]}
                    onChange={(change) => updateSet(set.key, change)}
                    onRemove={() => commit((current) => ({ ...current, sets: current.sets.filter((item) => item.key !== set.key) }))}
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => commit((current) => ({ ...current, sets: [...current.sets, { ...blankSet(true), price: current.sets[0]?.price ?? "" }] }))}
                >
                  <Layers className="size-3.5" aria-hidden /> Add a separate variant group
                </Button>
                <span className="text-xs text-ink-muted">
                  Only for variants that don't pair with everything above, e.g. a size that only comes in one colour.
                </span>
              </div>
            </div>
          )}

          {!draft.id && (
            <p className="mt-4 text-xs text-ink-muted">
              New products start with 0 in stock. After saving, add stock in the <span className="font-medium text-ink">Inventory</span> tab.
            </p>
          )}
        </FormSection>

        <ProductSettings
          draft={draft}
          onChange={patch}
          fieldErrors={fieldErrors}
          shopGstPercent={shopGstPercent}
          shopPriceIncludesGst={shopPriceIncludesGst}
          shopReturnDays={shopReturnDays}
        />

        {draft.id && (
          <div className="border-t border-line pt-4">
            <Button size="sm" variant="danger-soft" onPress={() => setConfirm("delete")} isDisabled={saving}>
              Delete product
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirm === "delete"}
        title="Delete this product?"
        confirmLabel="Delete product"
        tone="danger"
        isPending={saving}
        onConfirm={remove}
        onCancel={() => setConfirm(null)}
      >
        <p className="text-sm text-ink-body">
          {draft.name.trim() || "This product"} will be removed from your shop. Past orders keep their details.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={confirm === "clear-options"}
        title="Remove all options?"
        confirmLabel="Remove options"
        tone="warning"
        onConfirm={() => {
          commit(withoutOptions);
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      >
        <p className="text-sm text-ink-body">
          The product will have one price. Its options, variant prices, SKUs and option photos will be cleared.
        </p>
      </ConfirmDialog>
    </CommonModal>
  );
}

function FormSection({ step, title, description, children }: { step: number; title: string; description?: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2.5">
        <span className="grid size-5 shrink-0 translate-y-0.5 place-items-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
          {step}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {description && <p className="text-xs text-ink-muted">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
