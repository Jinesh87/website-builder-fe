import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { combinations } from "../product-variants.ts";
import ImageStrip, { type PhotoUpload } from "./ImageStrip.tsx";
import { variantKey, type SetDraft, type SetPatch } from "./product-draft.ts";

const COLUMNS = "sm:grid-cols-[minmax(0,1fr)_112px_144px_40px]";
const CELL_INPUT = "h-8 w-full rounded-lg border border-ed-border bg-surface px-2 text-sm text-ink";

/** One row per variant (e.g. Red / S) with its own price, SKU and, when needed, its own photos. */
export default function VariantTable({
  set,
  productName,
  upload,
  onChange,
}: {
  set: SetDraft;
  productName: string;
  upload: PhotoUpload;
  onChange: (patch: SetPatch) => void;
}) {
  const [photoRow, setPhotoRow] = useState<string | null>(null);
  const combos = combinations(set.options);
  if (combos.length === 0) return null;

  // With one option a variant is just a value, which "Photos change with" already covers.
  const rowPhotos = set.options.filter((option) => option.values.length > 0).length > 1 || Object.keys(set.images).length > 0;
  const basePrice = set.price.trim();

  function setRowPhotos(key: string, images: SetDraft["images"][string]) {
    onChange((current) => {
      const next = { ...current.images };
      if (images.length > 0) next[key] = images;
      else delete next[key];
      return { images: next };
    });
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-ink">
          {combos.length} {combos.length === 1 ? "variant" : "variants"}
        </span>
        <span className="text-xs text-ink-muted">Leave a price blank to use {basePrice ? `₹${basePrice}` : "the main price"}.</span>
      </div>
      <div className="mt-2 overflow-hidden rounded-lg border border-line">
        <div className={`hidden gap-2 border-b border-line bg-canvas/60 px-3 py-2 text-xs font-medium text-ink-muted sm:grid ${COLUMNS}`}>
          <span>Variant</span>
          <span>Price (₹)</span>
          <span>SKU (optional)</span>
          <span className="sr-only">Photos</span>
        </div>
        <ul className="max-h-96 divide-y divide-line overflow-y-auto">
          {combos.map((values) => {
            const key = variantKey(values);
            const label = values.join(" / ");
            const photos = set.images[key] ?? [];
            const open = rowPhotos && photoRow === key;
            return (
              <li key={key} className="px-3 py-2">
                <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 ${COLUMNS}`}>
                  <span className="col-span-2 truncate text-sm text-ink sm:col-span-1">{label}</span>
                  <input
                    value={set.overrides[key] ?? ""}
                    onChange={(event) => onChange((current) => ({ overrides: { ...current.overrides, [key]: event.target.value } }))}
                    placeholder={basePrice || "0.00"}
                    aria-label={`Price for ${label}`}
                    inputMode="decimal"
                    className={CELL_INPUT}
                  />
                  <input
                    value={set.skus[key] ?? ""}
                    onChange={(event) => onChange((current) => ({ skus: { ...current.skus, [key]: event.target.value } }))}
                    placeholder="SKU"
                    aria-label={`SKU for ${label}`}
                    maxLength={64}
                    className={CELL_INPUT}
                  />
                  {rowPhotos ? (
                    <button
                      type="button"
                      onClick={() => setPhotoRow(open ? null : key)}
                      aria-label={`Photos for ${label} only`}
                      aria-expanded={open}
                      title="Photos for this variant only"
                      className={`relative grid size-8 place-items-center rounded-lg hover:bg-canvas ${photos.length ? "text-brand" : "text-ink-muted hover:text-ink"}`}
                    >
                      <ImagePlus className="size-4" aria-hidden />
                      {photos.length > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-brand text-[10px] text-white">
                          {photos.length}
                        </span>
                      )}
                    </button>
                  ) : (
                    <span aria-hidden />
                  )}
                </div>
                {open && (
                  <div className="mt-2 rounded-lg bg-canvas/50 p-2.5">
                    <ImageStrip
                      compact
                      label={`Photos for ${label} only`}
                      images={photos}
                      onChange={(images) => setRowPhotos(key, images)}
                      upload={upload}
                      altText={productName ? `${productName} ${label}` : label}
                      hint="Only needed when this exact variant looks different."
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
