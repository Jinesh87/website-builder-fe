import { useState, type ReactNode } from "react";
import { Label, Switch } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { formatPaise } from "../../../api/wallet.ts";
import { payablePaise } from "../product-variants.ts";
import { rupeesToPaise, type ProductDraft, type ProductFieldErrors } from "./product-draft.ts";

/** Visibility, GST and returns, folded away behind a one-line summary. */
export default function ProductSettings({
  draft,
  onChange,
  fieldErrors,
  shopGstPercent,
  shopPriceIncludesGst,
  shopReturnDays,
}: {
  draft: ProductDraft;
  onChange: (patch: Partial<ProductDraft>) => void;
  fieldErrors: ProductFieldErrors;
  shopGstPercent: number;
  shopPriceIncludesGst: boolean;
  shopReturnDays: number | null;
}) {
  const hasError = Boolean(fieldErrors.gstPercent || fieldErrors.returnDays);
  const [open, setOpen] = useState(false);
  const expanded = open || hasError;

  const gstPercent = draft.gstOverride ? Number(draft.gstPercent) || 0 : shopGstPercent;
  const includesGst = draft.gstOverride ? draft.priceIncludesGst : shopPriceIncludesGst;
  const gstSummary = `GST ${gstPercent}%${gstPercent > 0 ? (includesGst ? " incl." : " extra") : ""}${draft.gstOverride ? "" : " (shop default)"}`;
  const returnSummary = !shopReturnDays || !draft.returnsEnabled ? "No returns" : `Returns ${draft.returnDays.trim() || shopReturnDays} days`;
  const summary = [draft.listed ? "Visible in shop" : "Hidden from shop", gstSummary, returnSummary].join(" · ");

  const sample = rupeesToPaise(draft.sets[0]?.price ?? "");
  const example =
    sample !== null && Number.isInteger(gstPercent) && gstPercent > 0
      ? `For a price of ${formatPaise(sample)} the customer pays ${formatPaise(payablePaise(sample, gstPercent, includesGst))}${
          includesGst ? " (GST included)" : ` (+${gstPercent}% GST)`
        }.`
      : null;

  return (
    <section className="rounded-xl border border-line">
      <button
        type="button"
        onClick={() => setOpen(!expanded)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold text-ink">More settings</span>
          <span className="mt-0.5 block text-xs text-ink-muted">{summary}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 text-ink-muted transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {expanded && (
        <div className="divide-y divide-line border-t border-line">
          <SettingRow
            title="Show this product in the shop"
            description="Turn off to keep it in your catalogue without customers seeing it."
            isSelected={draft.listed}
            onChange={(listed) => onChange({ listed })}
          />

          <SettingRow
            title="Use a custom GST rate"
            description={`Off: uses the shop default of ${shopGstPercent}%, ${shopPriceIncludesGst ? "included in the price" : "added on top of the price"}.`}
            isSelected={draft.gstOverride}
            onChange={(gstOverride) =>
              onChange({
                gstOverride,
                gstPercent: gstOverride ? draft.gstPercent || String(shopGstPercent) : draft.gstPercent,
                priceIncludesGst: gstOverride ? draft.priceIncludesGst : shopPriceIncludesGst,
              })
            }
          >
            {draft.gstOverride && (
              <div className="mt-3 flex flex-wrap items-start gap-4">
                <NumberField
                  label="GST %"
                  value={draft.gstPercent}
                  min={0}
                  max={100}
                  error={fieldErrors.gstPercent}
                  onChange={(gstPercentValue) => onChange({ gstPercent: gstPercentValue })}
                />
                <fieldset className="text-sm">
                  <legend className="mb-1 font-medium text-ink">The prices I enter</legend>
                  <div className="flex gap-4 pt-1.5">
                    <Radio checked={draft.priceIncludesGst} onSelect={() => onChange({ priceIncludesGst: true })} label="include GST" />
                    <Radio checked={!draft.priceIncludesGst} onSelect={() => onChange({ priceIncludesGst: false })} label="don't include GST" />
                  </div>
                </fieldset>
              </div>
            )}
            {example && <p className="mt-2 text-xs text-ink-muted">{example}</p>}
          </SettingRow>

          <SettingRow
            title="Allow returns"
            description={
              shopReturnDays
                ? `Customers can return this product within the return window.`
                : "Returns are off for the whole shop. Turn them on in Shop settings first."
            }
            isSelected={Boolean(shopReturnDays) && draft.returnsEnabled}
            isDisabled={!shopReturnDays}
            onChange={(returnsEnabled) => onChange({ returnsEnabled })}
          >
            {shopReturnDays && draft.returnsEnabled && (
              <div className="mt-3">
                <NumberField
                  label="Return window (days)"
                  value={draft.returnDays}
                  min={1}
                  max={365}
                  placeholder={`Shop default: ${shopReturnDays}`}
                  error={fieldErrors.returnDays}
                  onChange={(returnDays) => onChange({ returnDays })}
                />
              </div>
            )}
          </SettingRow>
        </div>
      )}
    </section>
  );
}

function SettingRow({
  title,
  description,
  isSelected,
  isDisabled,
  onChange,
  children,
}: {
  title: string;
  description: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onChange: (value: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <Switch isSelected={isSelected} isDisabled={isDisabled} onChange={onChange} className="w-full">
        <Switch.Content className="flex w-full items-start justify-between gap-4">
          <Label className="block">
            <span className="block text-sm font-medium text-ink">{title}</span>
            <span className="mt-0.5 block text-xs font-normal text-ink-muted">{description}</span>
          </Label>
          <Switch.Control className="mt-0.5 shrink-0">
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
      </Switch>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  placeholder,
  error,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid w-44 gap-1 text-sm font-medium text-ink">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={1}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`h-9 rounded-lg border bg-surface px-3 text-sm font-normal text-ink placeholder:text-ink-muted ${
          error ? "border-danger" : "border-ed-border"
        }`}
      />
      {error && <span className="text-xs font-normal text-danger">{error}</span>}
    </label>
  );
}

function Radio({ checked, onSelect, label }: { checked: boolean; onSelect: () => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-sm text-ink">
      <input type="radio" checked={checked} onChange={onSelect} className="accent-brand" />
      {label}
    </label>
  );
}
