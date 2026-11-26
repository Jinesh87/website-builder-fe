import { useEffect, useState } from "react";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { Button, Spinner } from "@heroui/react";
import { ChevronLeft, Plus, Upload } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import {
  shopApi,
  type InventoryItem,
  type InventoryLogPage,
  type InventoryPage,
  type ProductReturnedOrders,
} from "../../api/shop.ts";
import { formatPaise } from "../../api/wallet.ts";
import { formatWhen } from "./shop-format.ts";
import FormAlert from "../ui/FormAlert.tsx";
import TablePagination from "../ui/TablePagination.tsx";
import InventoryAddQuantityModal from "./InventoryAddQuantityModal.tsx";
import ShopSearchField from "./ShopSearchField.tsx";
import StockListDownloadButton from "./StockListDownloadButton.tsx";
import StockUploadModal from "./StockUploadModal.tsx";


export function ShopInventoryPanel({ websiteId }: { websiteId: string }) {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search.trim(), 250);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [data, setData] = useState<InventoryPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<{ variant?: InventoryItem } | null>(null);
  const [returnsProduct, setReturnsProduct] = useState<{ id: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  // Bumped after a stock list upload so the page reloads.
  const [reloadKey, setReloadKey] = useState(0);
  const items = data?.items ?? null;
  const optionNames = optionColumns(items ?? []);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    shopApi
      .inventory(websiteId, { search: query, page, pageSize })
      .then((next) => {
        if (cancelled) return;
        setData(next);
        if (next.page !== page) setPage(next.page);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, query, page, pageSize, reloadKey]);

  function saved(item: InventoryItem) {
    setData((current) => (current ? { ...current, items: current.items.map((row) => (row.variantId === item.variantId ? item : row)) } : current));
  }

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
          <ShopSearchField value={search} onChange={setSearch} label="Search inventory" />
          <StockListDownloadButton websiteId={websiteId} onError={setError} size="sm" />
          <Button size="sm" variant="outline" onPress={() => setUploading(true)} isDisabled={!data || (data.total === 0 && !query)}>
            <Upload className="size-4" aria-hidden /> Upload stock list
          </Button>
          <Button size="sm" onPress={() => setAdding({})} isDisabled={!data || (data.total === 0 && !query)}>
            <Plus className="size-4" aria-hidden /> Add quantity
          </Button>
        </div>
      </div>
      {error && (
        <div className="px-5 pt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {data === null && !error && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading inventory" />
        </div>
      )}
      {items?.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">
          {query ? "No variants match this search." : "No products yet. Add one in Products, then add quantity here."}
        </p>
      )}
      {items && items.length > 0 && (
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
              {items.map((item) => (
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
                    <Button size="sm" variant="outline" onPress={() => setAdding({ variant: item })}>
                      Add
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && data.total > 0 && (
        <div className="border-t border-line px-5 py-3">
          <TablePagination
            page={data.page}
            pageSize={pageSize}
            total={data.total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="variants"
          />
        </div>
      )}
      {adding && (
        <InventoryAddQuantityModal websiteId={websiteId} variant={adding.variant} onClose={() => setAdding(null)} onSaved={saved} />
      )}
      {uploading && (
        <StockUploadModal websiteId={websiteId} onClose={() => setUploading(false)} onUpdated={() => setReloadKey((key) => key + 1)} />
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


export function ShopInventoryLogPanel({ websiteId }: { websiteId: string }) {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search.trim(), 250);
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
        <ShopSearchField value={search} onChange={setSearch} label="Search the log" />
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
