import SelectInput from "../../ui/SelectInput.tsx";
import ImageStrip, { type PhotoUpload } from "./ImageStrip.tsx";
import { setPhotosBy, valueKey, type SetDraft, type SetPatch } from "./product-draft.ts";

const MAIN_PHOTOS = "__main";

/** "Photos change with" picker, and a photo slot for each value of the chosen option (e.g. each colour). */
export default function OptionPhotos({
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
  const named = set.options.filter((option) => option.name.trim() && option.values.length > 0);
  if (named.length === 0) return null;

  // The chosen option, plus any option from an older product that already has photos, so none are hidden.
  const shown = set.options.filter((option) => option.values.length > 0 && (option.key === set.photosBy || Object.keys(option.images).length > 0));

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-ink">Photos change with</span>
        <SelectInput
          ariaLabel="Photos change with"
          className="w-56"
          value={set.photosBy ?? MAIN_PHOTOS}
          onChange={(value) => onChange((current) => setPhotosBy(current, value === MAIN_PHOTOS ? null : value))}
          options={[{ value: MAIN_PHOTOS, label: "Nothing — use main photos" }, ...named.map((option) => ({ value: option.key, label: option.name.trim() }))]}
        />
      </div>

      {shown.length > 0 && (
        <div className="mt-3 space-y-3">
          {shown.map((option) => (
            <div key={option.key} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {option.values.map((value) => (
                <div key={value} className="rounded-lg border border-line bg-surface p-2.5">
                  <ImageStrip
                    compact
                    label={value}
                    images={option.images[valueKey(value)] ?? []}
                    onChange={(images) =>
                      onChange((current) => ({
                        options: current.options.map((item) =>
                          item.key === option.key ? { ...item, images: { ...item.images, [valueKey(value)]: images } } : item,
                        ),
                      }))
                    }
                    upload={upload}
                    altText={productName ? `${productName} ${value}` : value}
                  />
                </div>
              ))}
            </div>
          ))}
          <p className="text-xs text-ink-muted">A variant with no photos here uses the main photos.</p>
        </div>
      )}
    </div>
  );
}
