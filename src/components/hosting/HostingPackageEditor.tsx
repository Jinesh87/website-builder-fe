import { useEffect, useState } from "react";
import { Button, Chip } from "@heroui/react";
import { Plus, X } from "lucide-react";
import { adminHostingApi, type AdminHostingPackage, type HostingSettings } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatPaise } from "../../api/wallet.ts";
import { paiseToRupeesInput, rupeesInputToPaise, yearlySavingPercent } from "../../utils/hosting-pricing.ts";
import { ConfirmModal } from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";
import TextInput from "../ui/TextInput.tsx";
import { RupeesInput, SwitchField } from "./hosting-labels.tsx";

const MAX_FEATURES = 20;

type Form = {
  name: string;
  description: string;
  features: string[];
  quarterly: string;
  yearly: string;
  defaultQuarterly: string;
  defaultYearly: string;
  featured: boolean;
  active: boolean;
};

type Feedback = { status: "success" | "danger"; message: string } | null;

function toForm(pkg: AdminHostingPackage): Form {
  return {
    name: pkg.name,
    description: pkg.description,
    features: pkg.features.length ? pkg.features : [""],
    quarterly: pkg.isCustom ? "" : paiseToRupeesInput(pkg.prices.QUARTERLY),
    yearly: pkg.isCustom ? "" : paiseToRupeesInput(pkg.prices.YEARLY),
    defaultQuarterly: paiseToRupeesInput(pkg.defaultPrices.QUARTERLY),
    defaultYearly: paiseToRupeesInput(pkg.defaultPrices.YEARLY),
    featured: pkg.featured,
    active: pkg.active,
  };
}

/** Super Admin: one package's name, prices, features and visibility. */
export default function HostingPackageEditor({ pkg, onSaved }: { pkg: AdminHostingPackage; onSaved: (settings: HostingSettings) => void }) {
  const [form, setForm] = useState<Form>(() => toForm(pkg));
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setForm(toForm(pkg));
  }, [pkg]);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  }

  function setFeature(index: number, value: string) {
    update("features", form.features.map((feature, i) => (i === index ? value : feature)));
  }

  const quarterly = pkg.isCustom ? 0 : rupeesInputToPaise(form.quarterly) ?? 0;
  const yearly = pkg.isCustom ? 0 : rupeesInputToPaise(form.yearly) ?? 0;
  const defaultQuarterly = pkg.isCustom ? rupeesInputToPaise(form.defaultQuarterly) ?? 0 : 0;
  const defaultYearly = pkg.isCustom ? rupeesInputToPaise(form.defaultYearly) ?? 0 : 0;
  const features = form.features.map((feature) => feature.trim()).filter(Boolean);
  const errors = {
    name: form.name.trim() ? undefined : "Enter a name",
    description: form.description.trim() ? undefined : "Enter a short description",
    quarterly: Number.isNaN(quarterly) ? "Enter an amount like 2100 or 2100.50" : undefined,
    yearly: Number.isNaN(yearly) ? "Enter an amount like 7000 or 7000.50" : undefined,
    defaultQuarterly: Number.isNaN(defaultQuarterly) ? "Enter an amount like 7500 or 7500.50" : undefined,
    defaultYearly: Number.isNaN(defaultYearly) ? "Enter an amount like 24000 or 24000.50" : undefined,
  };
  const invalid = Object.values(errors).some(Boolean);
  const pricesChanged = pkg.isCustom
    ? defaultQuarterly !== (pkg.defaultPrices.QUARTERLY ?? 0) || defaultYearly !== (pkg.defaultPrices.YEARLY ?? 0)
    : quarterly !== (pkg.prices.QUARTERLY ?? 0) || yearly !== (pkg.prices.YEARLY ?? 0);
  const changed =
    pricesChanged ||
    form.name.trim() !== pkg.name ||
    form.description.trim() !== pkg.description ||
    form.featured !== pkg.featured ||
    form.active !== pkg.active ||
    features.join("\n") !== pkg.features.join("\n");
  const yearlySaving = yearlySavingPercent({ QUARTERLY: quarterly || null, YEARLY: yearly || null });

  function handleSave() {
    if (invalid) return;
    if (pricesChanged && pkg.plans > 0) {
      setConfirming(true);
      return;
    }
    void save();
  }

  async function save() {
    setSaving(true);
    try {
      onSaved(
        await adminHostingApi.updatePackage(pkg.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          features,
          quarterlyPricePaise: quarterly,
          yearlyPricePaise: yearly,
          ...(pkg.isCustom ? { defaultQuarterlyPaise: defaultQuarterly, defaultYearlyPaise: defaultYearly } : {}),
          featured: form.featured,
          active: form.active,
        }),
      );
      setFeedback({
        status: "success",
        message: !pricesChanged
          ? "Saved."
          : pkg.isCustom
            ? "Saved. The new default applies to websites without their own price; paid plans keep theirs."
            : "Saved. New prices apply from each plan's next payment.",
      });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  return (
    <article className={`rounded-xl border bg-surface p-5 shadow-xs flex flex-col justify-between h-full ${form.featured ? "border-brand ring-1 ring-brand/20" : "border-line"}`}>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">{pkg.name}</h3>
            {pkg.isCustom && <Chip size="sm" variant="soft">Priced per website</Chip>}
            {!pkg.active && <Chip size="sm">Hidden</Chip>}
          </div>
          <span className="text-[11px] text-ink-muted font-medium">
            {pkg.plans} {pkg.plans === 1 ? "website" : "websites"} active
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          <TextInput label="Plan Name" name={`name-${pkg.id}`} value={form.name} onChange={(value) => update("name", value)} error={errors.name} isDisabled={saving} />
          <TextAreaInput
            label="Description"
            name={`description-${pkg.id}`}
            value={form.description}
            onChange={(value) => update("description", value)}
            error={errors.description}
            rows={2}
            isDisabled={saving}
          />

          {pkg.isCustom ? (
            <div className="grid gap-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <RupeesInput
                  id={`default-quarterly-${pkg.id}`}
                  label="Quarterly (3 mo)"
                  value={form.defaultQuarterly}
                  onChange={(value) => update("defaultQuarterly", value)}
                  placeholder="No default"
                  hint={
                    defaultQuarterly > 0
                      ? `~${formatPaise(Math.round(defaultQuarterly / 3))}/mo`
                      : "Optional default"
                  }
                  error={errors.defaultQuarterly}
                  isDisabled={saving}
                />
                <RupeesInput
                  id={`default-yearly-${pkg.id}`}
                  label="Yearly (12 mo)"
                  value={form.defaultYearly}
                  onChange={(value) => update("defaultYearly", value)}
                  placeholder="No default"
                  hint={
                    defaultYearly > 0
                      ? `~${formatPaise(Math.round(defaultYearly / 12))}/mo`
                      : "Optional default"
                  }
                  error={errors.defaultYearly}
                  isDisabled={saving}
                />
              </div>
              <p className="rounded-lg bg-canvas px-2.5 py-1.5 text-[11px] text-ink-muted">
                Per-website customized pricing unless default is set.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <RupeesInput
                id={`quarterly-${pkg.id}`}
                label="Quarterly (3 mo)"
                value={form.quarterly}
                onChange={(value) => update("quarterly", value)}
                placeholder="Not offered"
                hint={quarterly > 0 ? `~${formatPaise(Math.round(quarterly / 3))}/mo` : "Not offered"}
                error={errors.quarterly}
                isDisabled={saving}
              />
              <RupeesInput
                id={`yearly-${pkg.id}`}
                label="Yearly (12 mo)"
                value={form.yearly}
                onChange={(value) => update("yearly", value)}
                placeholder="Not offered"
                hint={
                  yearly > 0
                    ? `~${formatPaise(Math.round(yearly / 12))}/mo${yearlySaving > 0 ? ` (${yearlySaving}% off)` : ""}`
                    : "Not offered"
                }
                error={errors.yearly}
                isDisabled={saving}
              />
            </div>
          )}

          <fieldset className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <legend className="text-xs font-semibold text-ink">Features ({features.length})</legend>
              {form.features.length < MAX_FEATURES && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => update("features", [...form.features, ""])}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline cursor-pointer"
                >
                  <Plus className="size-3" aria-hidden /> Add
                </button>
              )}
            </div>
            <ul className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
              {form.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-1.5">
                  <input
                    aria-label={`Feature ${index + 1}`}
                    value={feature}
                    maxLength={120}
                    disabled={saving}
                    onChange={(event) => setFeature(index, event.target.value)}
                    placeholder="e.g. Free SSL certificate"
                    className="h-8 w-full rounded-lg border border-ed-border bg-surface px-2.5 text-xs text-ink shadow-ed-xs placeholder:text-ink-muted/50 focus:border-ed-accent focus:outline-none focus:ring-1 focus:ring-ed-accent/20"
                  />
                  <button
                    type="button"
                    aria-label={`Remove feature ${index + 1}`}
                    disabled={saving}
                    onClick={() => update("features", form.features.filter((_, i) => i !== index))}
                    className="grid size-7 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink cursor-pointer"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-line flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <SwitchField label="Show on pricing and checkout" isSelected={form.active} onChange={(value) => update("active", value)} isDisabled={saving} />
          <SwitchField label="Highlight as most popular" isSelected={form.featured} onChange={(value) => update("featured", value)} isDisabled={saving} />
        </div>

        {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}

        <Button size="sm" onPress={handleSave} isPending={saving} isDisabled={!changed || invalid} className="w-full">
          Save {pkg.name}
        </Button>
      </div>

      <ConfirmModal
        isOpen={confirming}
        onClose={() => !saving && setConfirming(false)}
        onConfirm={save}
        isPending={saving}
        tone="warning"
        title={pkg.isCustom ? `Change the default ${pkg.name} price?` : `Change ${pkg.name} prices?`}
        confirmLabel={pkg.isCustom ? "Change default" : "Change prices"}
      >
        {pkg.isCustom
          ? `${pkg.plans} ${pkg.plans === 1 ? "website is" : "websites are"} on ${pkg.name}. Paid plans and websites with their own price keep it; the rest pay the new default from their first payment.`
          : `${pkg.plans} ${pkg.plans === 1 ? "website is" : "websites are"} on ${pkg.name}. The new prices apply from each one's next payment; periods already paid don't change.`}
      </ConfirmModal>
    </article>
  );
}
