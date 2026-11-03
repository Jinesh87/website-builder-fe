import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import {
  shopApi,
  type InventoryItem,
  type InventoryLogPage,
  type ProductReturnedOrders,
} from "../../api/shop.ts";
import { formatPaise } from "../../api/wallet.ts";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextInput from "../ui/TextInput.tsx";

function useDebounced(value: string): string {
  const [debounced, setDebounced] = useState(value.trim());
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
}

function SearchField({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return (
    <div className="relative min-w-[220px] max-w-sm flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        aria-label={label}
        className="h-9 w-full rounded-lg border border-ed-border bg-surface pl-9 pr-3 text-sm text-ink"
      />
    </div>
  );
}

const VARIANT_BATCH_SIZE = 12;

function variantLabel(item: InventoryItem): string {
  const options =
    item.options.length > 0 ? item.options.map((option) => option.value).join(" / ") : item.variantName;
  return `${item.productName} · ${item.categoryName} · ${options}`;
}

function variantSearchText(item: InventoryItem): string {
  return `${item.productName} ${item.categoryName} ${item.variantName} ${item.options
    .map((option) => `${option.name} ${option.value}`)
    .join(" ")}`.toLowerCase();
}

function AddQuantityModal({
  websiteId,
  items,
  initialVariantId,
  onClose,
  onSaved,
}: {
  websiteId: string;
  items: InventoryItem[];
  initialVariantId: string;
  onClose: () => void;
  onSaved: (item: InventoryItem) => void;
}) {
  const [variantId, setVariantId] = useState(initialVariantId);
  const [variantSearch, setVariantSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(VARIANT_BATCH_SIZE);
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLLIElement>(null);
  const selected = items.find((item) => item.variantId === variantId) ?? null;
  const adding = /^\d+$/.test(quantity.trim()) ? Number(quantity.trim()) : null;
  const variantQuery = useDebounced(variantSearch).toLowerCase();
  const filteredVariants = items.filter((item) => variantSearchText(item).includes(variantQuery));
  const visibleVariants = filteredVariants.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVariants.length;

  useEffect(() => {
    setVisibleCount(VARIANT_BATCH_SIZE);
  }, [variantQuery]);

  useEffect(() => {
    if (!initialVariantId) return;
    const index = filteredVariants.findIndex((item) => item.variantId === initialVariantId);
    if (index >= 0) setVisibleCount(Math.max(VARIANT_BATCH_SIZE, index + 1));
    // Only align the first open to the preselected variant.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount/initial selection only
  }, [initialVariantId]);

  useEffect(() => {
    const root = listRef.current;
    const sentinel = loadMoreRef.current;
    if (!root || !sentinel || !hasMore) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((count) => Math.min(filteredVariants.length, count + VARIANT_BATCH_SIZE));
        }
      },
      { root, rootMargin: "40px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredVariants.length, hasMore, visibleCount]);

  async function save() {
    if (!selected) {
      setError("Choose a variant");
      return;
    }
    if (adding === null || adding < 1) {
      setError("Enter how many to add");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      onSaved(await shopApi.addInventory(websiteId, selected.variantId, adding, note.trim() || undefined));
      onClose();
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
      size="md"
      title="Add quantity"
      subtitle={selected ? `${selected.quantity} on hand now` : "Choose a variant and how many to add."}
      subtitleClassName="whitespace-normal"
      primaryAction={{ label: "Add quantity", onPress: save, isPending: saving }}
      secondaryAction={{ label: "Cancel", onPress: onClose }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="block text-sm font-medium text-ink">Variant</span>
          <SearchField value={variantSearch} onChange={setVariantSearch} label="Search variants" />
          <div className="overflow-hidden rounded-lg border border-ed-border">
            {visibleVariants.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-muted">
                {variantQuery ? "No variants match this search." : "No variants available."}
              </p>
            ) : (
              <div ref={listRef} className="max-h-64 overflow-y-auto">
                <ul className="divide-y divide-line" role="listbox" aria-label="Choose a variant">
                  {visibleVariants.map((item) => {
                    const active = item.variantId === variantId;
                    return (
                      <li key={item.variantId}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => {
                            setVariantId(item.variantId);
                            setError(null);
                          }}
                          className={`flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                            active ? "bg-ed-bg text-ink" : "bg-surface text-ink hover:bg-canvas"
                          }`}
                        >
                          <span
                            className={`mt-0.5 size-4 shrink-0 rounded-full border ${
                              active ? "border-ink bg-ink" : "border-ed-border bg-surface"
                            }`}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{variantLabel(item)}</span>
                            <span className="block text-xs text-ink-muted">{item.quantity} on hand</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {hasMore && (
                    <li ref={loadMoreRef} className="px-3 py-2 text-center text-xs text-ink-muted" aria-hidden>
                      Loading more…
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          {selected && (
            <p className="text-xs text-ink-muted">
              Selected: <span className="font-medium text-ink">{variantLabel(selected)}</span>
            </p>
          )}
        </div>
        <TextInput
          label="Quantity to add"
          name="addQuantity"
          value={quantity}
          onChange={setQuantity}
          placeholder="0"
          isRequired
        />
        <TextInput label="Note (optional)" name="addQuantityNote" value={note} onChange={setNote} placeholder="Received from supplier" />
        {selected && adding !== null && adding > 0 && (
          <p className="text-sm text-ink-muted">
            On hand will be {selected.quantity + adding}.
          </p>
        )}
        {error && <FormAlert status="danger">{error}</FormAlert>}
      </div>
    </CommonModal>
  );
}

export function ShopInventoryPanel({ websiteId }: { websiteId: string }) {
  const [search, setSearch] = useState("");
  const query = useDebounced(search).toLowerCase();
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null);
  const [returnsProduct, setReturnsProduct] = useState<{ id: string; name: string } | null>(null);
  const visible =
    items?.filter((item) =>
      `${item.productName} ${item.categoryName} ${item.variantName} ${item.options.map((option) => `${option.name} ${option.value}`).join(" ")}`
        .toLowerCase()
        .includes(query),
    ) ?? null;
  const optionNames = optionColumns(items ?? []);

  useEffect(() => {
    let cancelled = false;
    shopApi
      .inventory(websiteId)
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  if (returnsProduct) {
    return (
      <ShopProductReturnsPanel
        websiteId={websiteId}
        productId={returnsProduct.id}
        productName={returnsProduct.name}
        onBack={() => setReturnsProduct(null)}
      />
    );
  }

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Inventory</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Each variant has its own quantity. Returned orders are listed separately and are not added back to on-hand stock.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchField value={search} onChange={setSearch} label="Search inventory" />
          <Button size="sm" onPress={() => setAddingVariantId("")} isDisabled={!items || items.length === 0}>
            <Plus className="size-4" aria-hidden /> Add quantity
          </Button>
        </div>
      </div>
      {error && (
        <div className="px-5 pt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {items === null && !error && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading inventory" />
        </div>
      )}
      {visible?.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">
          {query ? "No variants match this search." : "No products yet. Add one in Products, then add quantity here."}
        </p>
      )}
      {visible && visible.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-medium text-ink-muted">
                <th className="px-5 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Category</th>
                {optionNames.map((name) => (
                  <th key={name} className="px-3 py-2 font-medium">{name}</th>
                ))}
                <th className="px-3 py-2 font-medium">On hand</th>
                <th className="px-3 py-2 font-medium">Returned orders</th>
                <th className="px-5 py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((item) => (
                <tr key={item.variantId}>
                  <td className="px-5 py-3">
                    <p className="truncate font-medium text-ink">{item.productName}</p>
                    <p className="truncate text-xs text-ink-muted">{formatPaise(item.pricePaise)}</p>
                  </td>
                  <td className="px-3 py-3 text-ink">{item.categoryName}</td>
                  {optionNames.map((name) => (
                    <td key={name} className="px-3 py-3 text-ink">{optionValue(item, name)}</td>
                  ))}
                  <td className="px-3 py-3 text-ink">{item.quantity}</td>
                  <td className="px-3 py-3 text-ink">
                    {item.returnedOrderCount > 0 ? (
                      <button
                        type="button"
                        className="font-medium text-ink underline underline-offset-2 hover:text-ink-muted"
                        onClick={() => setReturnsProduct({ id: item.productId, name: item.productName })}
                      >
                        {item.returnedOrderCount}
                      </button>
                    ) : (
                      <span className="text-ink-muted">0</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button size="sm" variant="outline" onPress={() => setAddingVariantId(item.variantId)}>
                      Add
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {addingVariantId !== null && items && (
        <AddQuantityModal
          websiteId={websiteId}
          items={items}
          initialVariantId={addingVariantId}
          onClose={() => setAddingVariantId(null)}
          onSaved={(saved) => setItems((current) => current?.map((row) => (row.variantId === saved.variantId ? saved : row)) ?? current)}
        />
      )}
    </section>
  );
}

function ShopProductReturnsPanel({
  websiteId,
  productId,
  productName,
  onBack,
}: {
  websiteId: string;
  productId: string;
  productName: string;
  onBack: () => void;
}) {
  const [data, setData] = useState<ProductReturnedOrders | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    shopApi
      .productReturns(websiteId, productId)
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, productId]);

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
          >
            <ChevronLeft className="size-4" aria-hidden /> Inventory
          </button>
          <h3 className="text-sm font-semibold text-ink">Returned orders · {data?.productName ?? productName}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Customer returns for this product. These units are not added back to on-hand stock.</p>
        </div>
      </div>
      {error && (
        <div className="px-5 pt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {!data && !error && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading returned orders" />
        </div>
      )}
      {data && data.orders.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">No returned orders for this product yet.</p>
      )}
      {data && data.orders.length > 0 && (
        <ul className="divide-y divide-line">
          {data.orders.map((order) => (
            <li key={order.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Order #{order.number}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Returned {formatWhen(order.returnedAt)} · {order.customerName} · {order.customerEmail}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink">{formatPaise(order.totalPaise)}</p>
                  <p className="mt-0.5 text-xs capitalize text-ink-muted">
                    {order.refundStatus === "none" ? "No refund" : `Refund ${order.refundStatus}`}
                  </p>
                </div>
              </div>
              {order.returnReason && (
                <p className="mt-2 text-sm text-ink-body">
                  <span className="font-medium text-ink">Reason:</span> {order.returnReason}
                </p>
              )}
              <ul className="mt-3 space-y-1.5">
                {order.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-ink">
                      {item.productName}
                      <span className="text-ink-muted">
                        {" "}
                        · {item.variantName} · Qty {item.quantity}
                      </span>
                    </span>
                    <span className="text-ink">{formatPaise(item.lineTotalPaise)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function optionColumns(items: InventoryItem[]): string[] {
  const names = new Map<string, string>();
  for (const item of items) {
    for (const option of item.options) {
      const key = option.name.toLowerCase();
      if (!names.has(key)) names.set(key, option.name);
    }
  }
  return [...names.values()];
}

function optionValue(item: InventoryItem, name: string): string {
  return item.options.find((option) => option.name.toLowerCase() === name.toLowerCase())?.value ?? "—";
}

function formatWhen(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function ShopInventoryLogPanel({ websiteId }: { websiteId: string }) {
  const [search, setSearch] = useState("");
  const query = useDebounced(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InventoryLogPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    shopApi
      .inventoryLog(websiteId, query, page)
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, query, page]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Inventory log</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Every quantity change, including stock cleared when a variant is removed.</p>
        </div>
        <SearchField value={search} onChange={setSearch} label="Search the log" />
      </div>
      {error && (
        <div className="px-5 pt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {data === null && !error && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading inventory log" />
        </div>
      )}
      {data?.movements.length === 0 && <p className="px-5 py-10 text-center text-sm text-ink-muted">No stock changes yet.</p>}
      {data && data.movements.length > 0 && (
        <ul className="divide-y divide-line">
          {data.movements.map((movement) => (
            <li key={movement.id} className="grid gap-1 px-5 py-3 sm:grid-cols-[11rem_minmax(0,1fr)_5rem_5rem] sm:items-center sm:gap-3">
              <p className="text-xs text-ink-muted">{formatWhen(movement.createdAt)}</p>
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">
                  {movement.productName}
                  <span className="text-ink-muted"> · {movement.variantName}</span>
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {movement.note || (movement.delta > 0 ? "Stock added" : "Stock removed")}
                  {movement.actorName ? ` · ${movement.actorName}` : ""}
                </p>
              </div>
              <p className={`text-sm font-medium ${movement.delta < 0 ? "text-danger" : "text-ink"}`}>
                {movement.delta > 0 ? `+${movement.delta}` : movement.delta}
              </p>
              <p className="text-sm text-ink">{movement.quantityAfter} on hand</p>
            </li>
          ))}
        </ul>
      )}
      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <p className="text-xs text-ink-muted">
            Page {data.page} of {pages}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onPress={() => setPage((current) => Math.max(1, current - 1))} isDisabled={page <= 1}>
              Previous
            </Button>
            <Button size="sm" variant="outline" onPress={() => setPage((current) => current + 1)} isDisabled={page >= pages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
