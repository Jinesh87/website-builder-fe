import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import TextInput from "../../ui/TextInput.tsx";
import type { PhotoUpload } from "./ImageStrip.tsx";
import OptionPhotos from "./OptionPhotos.tsx";
import OptionRow from "./OptionRow.tsx";
import VariantTable from "./VariantTable.tsx";
import { blankOption, type OptionDraft, type SetDraft, type SetPatch } from "./product-draft.ts";

const MAX_OPTIONS = 4;

/** One variant group: its options, the photos that change with them, and the resulting variants. */
export default function VariantGroupEditor({
  set,
  index,
  isGrouped,
  canRemove,
  productName,
  upload,
  priceError,
  onChange,
  onRemove,
}: {
  set: SetDraft;
  index: number;
  /** The product has more than one group, so this one shows its own heading and price. */
  isGrouped: boolean;
  canRemove: boolean;
  productName: string;
  upload: PhotoUpload;
  priceError?: string;
  onChange: (patch: SetPatch) => void;
  onRemove: () => void;
}) {
  const listedOptions = set.options.filter((option) => option.listOnShop && option.values.length > 0);

  function updateOption(key: string, patch: Partial<OptionDraft>) {
    onChange((current) => ({ options: current.options.map((option) => (option.key === key ? { ...option, ...patch } : option)) }));
  }

  function removeOption(key: string) {
    onChange((current) => ({
      options: current.options.filter((option) => option.key !== key),
      photosBy: current.photosBy === key ? null : current.photosBy,
    }));
  }

  return (
    <section className={isGrouped ? "rounded-xl border border-line p-4" : ""}>
      {isGrouped && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <h4 className="w-full text-sm font-semibold text-ink">Variant group {index + 1}</h4>
            <div className="w-44">
              <TextInput
                label="Price (₹)"
                name={`set-price-${set.key}`}
                value={set.price}
                onChange={(price) => onChange({ price })}
                placeholder="0.00"
                error={priceError}
                isRequired
              />
            </div>
          </div>
          {canRemove && (
            <button type="button" onClick={onRemove} className="text-xs font-medium text-ink-muted hover:text-danger">
              Remove group
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {set.options.map((option, optionIndex) => (
          <OptionRow
            key={option.key}
            option={option}
            index={optionIndex}
            productName={productName}
            listedOptions={listedOptions}
            onChange={(patch) => updateOption(option.key, patch)}
            onRemove={() => removeOption(option.key)}
          />
        ))}
        {set.options.length < MAX_OPTIONS && (
          <Button size="sm" variant="outline" onPress={() => onChange((current) => ({ options: [...current.options, blankOption()] }))}>
            <Plus className="size-3.5" aria-hidden /> {set.options.length === 0 ? "Add an option" : "Add another option"}
          </Button>
        )}
      </div>

      <OptionPhotos set={set} productName={productName} upload={upload} onChange={onChange} />
      <VariantTable set={set} productName={productName} upload={upload} onChange={onChange} />
    </section>
  );
}
