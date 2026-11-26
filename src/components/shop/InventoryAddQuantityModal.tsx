import { useRef, useState } from "react";
import { Spinner } from "@heroui/react";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type InventoryItem } from "../../api/shop.ts";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { useInfiniteList, useLoadMoreSentinel } from "../../hooks/use-infinite-list.ts";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextInput from "../ui/TextInput.tsx";
import ShopSearchField from "./ShopSearchField.tsx";

/** Variants fetched per scroll step in the picker. */
const PICKER_PAGE_SIZE = 25;

export function variantLabel(item: InventoryItem): string {
  const options = item.options.length > 0 ? item.options.map((option) => option.value).join(" / ") : item.variantName;
  return `${item.productName} · ${item.categoryName} · ${options}`;
}

/** Searchable variant list that loads more from the server as it scrolls. */
function VariantPicker({
  websiteId,
  selectedId,
  onSelect,
}: {
  websiteId: string;
  selectedId: string;
  onSelect: (item: InventoryItem) => void;
}) {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search.trim(), 250);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLLIElement>(null);
  const list = useInfiniteList<InventoryItem>(`${websiteId}|${query}`, async (page) => {
    const loaded = await shopApi.inventory(websiteId, { search: query, page, pageSize: PICKER_PAGE_SIZE });
    return { items: loaded.items, hasMore: loaded.page * loaded.pageSize < loaded.total };
  });
  useLoadMoreSentinel(sentinel, list.loadMore, list.hasMore && !list.loading, listRef);

  return (
    <>
      <ShopSearchField value={search} onChange={setSearch} label="Search variants" />
      {list.error && <FormAlert status="danger">{list.error}</FormAlert>}
      <div className="overflow-hidden rounded-lg border border-ed-border">
        {list.items === null ? (
          <div className="grid place-items-center py-6">
            <Spinner size="sm" aria-label="Loading variants" />
          </div>
        ) : list.items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-ink-muted">{query ? "No variants match this search." : "No variants available."}</p>
        ) : (
          <div ref={listRef} className="max-h-64 overflow-y-auto">
            <ul className="divide-y divide-line" role="listbox" aria-label="Choose a variant">
              {list.items.map((item) => {
                const active = item.variantId === selectedId;
                return (
                  <li key={item.variantId}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => onSelect(item)}
                      className={`flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                        active ? "bg-ed-bg text-ink" : "bg-surface text-ink hover:bg-canvas"
                      }`}
                    >
                      <span
                        className={`mt-0.5 size-4 shrink-0 rounded-full border ${active ? "border-ink bg-ink" : "border-ed-border bg-surface"}`}
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
              {list.hasMore && (
                <li ref={sentinel} className="px-3 py-2 text-center text-xs text-ink-muted" aria-hidden>
                  Loading more…
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Adds stock to one variant. Opened from a row, the variant is fixed (`variant`); from the header
 * button, the owner searches and picks one.
 */
export default function InventoryAddQuantityModal({
  websiteId,
  variant,
  onClose,
  onSaved,
}: {
  websiteId: string;
  variant?: InventoryItem;
  onClose: () => void;
  onSaved: (item: InventoryItem) => void;
}) {
  const [selected, setSelected] = useState<InventoryItem | null>(variant ?? null);
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const adding = /^\d+$/.test(quantity.trim()) ? Number(quantity.trim()) : null;

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
          {!variant && (
            <VariantPicker
              websiteId={websiteId}
              selectedId={selected?.variantId ?? ""}
              onSelect={(item) => {
                setSelected(item);
                setError(null);
              }}
            />
          )}
          {selected && (
            <p className="text-xs text-ink-muted">
              Selected: <span className="font-medium text-ink">{variantLabel(selected)}</span>
            </p>
          )}
        </div>
        <TextInput label="Quantity to add" name="addQuantity" value={quantity} onChange={setQuantity} placeholder="0" isRequired />
        <TextInput label="Note (optional)" name="addQuantityNote" value={note} onChange={setNote} placeholder="Received from supplier" />
        {selected && adding !== null && adding > 0 && <p className="text-sm text-ink-muted">On hand will be {selected.quantity + adding}.</p>}
        {error && <FormAlert status="danger">{error}</FormAlert>}
      </div>
    </CommonModal>
  );
}
