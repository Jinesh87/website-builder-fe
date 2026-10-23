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
  featured: boolean;
  active: boolean;
};

type Feedback = { status: "success" | "danger"; message: string } | null;

function toForm(pkg: AdminHostingPackage): Form {
  return {
    name: pkg.name,
    description: pkg.description,
    features: pkg.features.length ? pkg.features : [""],
    quarterly: paiseToRupeesInput(pkg.prices.QUARTERLY),
    yearly: paiseToRupeesInput(pkg.prices.YEARLY),
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
  const features = form.features.map((feature) => feature.trim()).filter(Boolean);
  const errors = {
    name: form.name.trim() ? undefined : "Enter a name",
    description: form.description.trim() ? undefined : "Enter a short description",
    quarterly: Number.isNaN(quarterly) ? "Enter an amount like 2100 or 2100.50" : undefined,
    yearly: Number.isNaN(yearly) ? "Enter an amount like 7000 or 7000.50" : undefined,
  };
  const invalid = Object.values(errors).some(Boolean);
  const pricesChanged = quarterly !== (pkg.prices.QUARTERLY ?? 0) || yearly !== (pkg.prices.YEARLY ?? 0);
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
          featured: form.featured,
          active: form.active,
        }),
      );
      setFeedback({ status: "success", message: pricesChanged ? "Saved. New prices apply from each plan's next payment." : "Saved." });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  return (
    <article className={`rounded-xl border bg-surface p-5 shadow-xs ${form.featured ? "border-brand/40" : "border-line"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">{pkg.name}</h3>
          {pkg.isCustom && <Chip size="sm" variant="soft">Contact us</Chip>}
          {!pkg.active && <Chip size="sm">Hidden</Chip>}
        </div>
        <span className="text-xs text-ink-muted">
          {pkg.plans} {pkg.plans === 1 ? "website" : "websites"} on this package
        </span>
      </div>

      <div className="mt-4 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Name" name={`name-${pkg.id}`} value={form.name} onChange={(value) => update("name", value)} error={errors.name} isDisabled={saving} />
          <TextAreaInput
            label="Description"
            name={`description-${pkg.id}`}
            value={form.description}
            onChange={(value) => update("description", value)}
            error={errors.description}
            rows={2}
            isDisabled={saving}
          />
        </div>

        {pkg.isCustom ? (
          <p className="rounded-lg bg-canvas px-3 py-2 text-xs text-ink-muted">
            No list price: visitors see a fixed "starting from" price and contact you. Agree a price per website from its Hosting tab.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <RupeesInput
              id={`quarterly-${pkg.id}`}
              label="Quarterly price (3 months)"
              value={form.quarterly}
              onChange={(value) => update("quarterly", value)}
              placeholder="Not offered"
              hint={quarterly > 0 ? `About ${formatPaise(Math.round(quarterly / 3))} a month` : "Empty = not offered quarterly"}
              error={errors.quarterly}
              isDisabled={saving}
            />
            <RupeesInput
              id={`yearly-${pkg.id}`}
              label="Yearly price (12 months)"
              value={form.yearly}
              onChange={(value) => update("yearly", value)}
              placeholder="Not offered"
              hint={
                yearly > 0
                  ? `About ${formatPaise(Math.round(yearly / 12))} a month${yearlySaving > 0 ? ` · saves ${yearlySaving}% vs quarterly` : ""}`
                  : "Empty = not offered yearly"
              }
              error={errors.yearly}
              isDisabled={saving}
            />
          </div>
        )}

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">Features</legend>
          <ul className="flex flex-col gap-2">
            {form.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <input
                  aria-label={`Feature ${index + 1}`}
                  value={feature}
                  maxLength={120}
                  disabled={saving}
                  onChange={(event) => setFeature(index, event.target.value)}
                  placeholder="e.g. Free SSL certificate"
                  className="h-9 w-full rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink shadow-ed-xs placeholder:text-ink-muted/50 focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15"
                />
                <button
                  type="button"
                  aria-label={`Remove feature ${index + 1}`}
                  disabled={saving}
                  onClick={() => update("features", form.features.filter((_, i) => i !== index))}
                  className="grid size-8 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          {form.features.length < MAX_FEATURES && (
            <button
              type="button"
              disabled={saving}
              onClick={() => update("features", [...form.features, ""])}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              <Plus className="size-3.5" aria-hidden /> Add feature
            </button>
          )}
        </fieldset>

        <div className="flex flex-wrap gap-6">
          <SwitchField label="Show on pricing page and checkout" isSelected={form.active} onChange={(value) => update("active", value)} isDisabled={saving} />
          <SwitchField label="Highlight as most popular" isSelected={form.featured} onChange={(value) => update("featured", value)} isDisabled={saving} />
        </div>

        {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}

        <div>
          <Button size="sm" onPress={handleSave} isPending={saving} isDisabled={!changed || invalid}>
            Save {pkg.name}
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirming}
        onClose={() => !saving && setConfirming(false)}
        onConfirm={save}
        isPending={saving}
        tone="warning"
        title={`Change ${pkg.name} prices?`}
        confirmLabel="Change prices"
      >
        {pkg.plans} {pkg.plans === 1 ? "website is" : "websites are"} on {pkg.name}. The new prices apply from each one's next payment;
        periods already paid don't change.
      </ConfirmModal>
    </article>
  );
}
