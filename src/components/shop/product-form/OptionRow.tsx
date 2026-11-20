import { Checkbox, Label } from "@heroui/react";
import { Trash2 } from "lucide-react";
import TextInput from "../../ui/TextInput.tsx";
import ValueChips from "./ValueChips.tsx";
import type { OptionDraft } from "./product-draft.ts";

/** Placeholder examples for the first, second, … option. */
const EXAMPLES = [
  { name: "Colour", values: "Red, Blue, Green" },
  { name: "Size", values: "S, M, L" },
  { name: "Material", values: "Cotton, Linen" },
  { name: "Style", values: "Classic, Modern" },
];

/** One option (e.g. Colour: Red, Blue) with the choice to list each value as its own shop product. */
export default function OptionRow({
  option,
  index,
  productName,
  listedOptions,
  onChange,
  onRemove,
}: {
  option: OptionDraft;
  index: number;
  productName: string;
  /** Options in this group that are split into separate shop products. */
  listedOptions: OptionDraft[];
  onChange: (patch: Partial<OptionDraft>) => void;
  onRemove: () => void;
}) {
  const example = EXAMPLES[index] ?? EXAMPLES[0]!;
  const noun = (option.name.trim() || "value").toLowerCase();

  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="grid gap-2 sm:grid-cols-[176px_minmax(0,1fr)_auto] sm:items-start">
        <TextInput
          label="Option name"
          name={`option-${option.key}`}
          value={option.name}
          onChange={(name) => onChange({ name })}
          placeholder={`e.g. ${example.name}`}
        />
        <ValueChips
          label="Values"
          values={option.values}
          onChange={(values) => onChange({ values })}
          placeholder={`e.g. ${example.values} — press Enter after each`}
        />
        <div className="sm:pt-6">
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove option ${option.name || index + 1}`}
            className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {option.values.length > 1 && (
        <>
          <Checkbox className="mt-2" isSelected={option.listOnShop} onChange={(listOnShop) => onChange({ listOnShop })}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Label className="text-xs font-medium text-ink">List each {noun} as a separate product on the shop page</Label>
            </Checkbox.Content>
          </Checkbox>
          <p className="mt-1 ps-6 text-xs text-ink-muted">{listingHint(option, noun, productName, listedOptions)}</p>
        </>
      )}
    </div>
  );
}

/** Spells out what the shop page will show for this option's listing choice. */
function listingHint(option: OptionDraft, noun: string, productName: string, listedOptions: OptionDraft[]): string {
  if (!option.listOnShop) {
    return `Off: the shop page shows this as one product, and customers choose the ${noun} after opening it.`;
  }
  if (listedOptions.length > 1) {
    const count = listedOptions.reduce((total, item) => total * item.values.length, 1);
    const names = listedOptions.map((item) => item.name.trim().toLowerCase() || "value").join(" and ");
    return `Your shop page will show ${count} products, one for each ${names} combination.`;
  }
  const name = productName.trim() || "Product";
  const examples = option.values.slice(0, 3).map((value) => `${name} – ${value}`);
  return `Your shop page will show ${option.values.length} products: ${examples.join(", ")}${option.values.length > 3 ? ", …" : ""}.`;
}
