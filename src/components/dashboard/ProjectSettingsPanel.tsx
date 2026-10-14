import { useState, type FormEvent } from "react";
import { Button } from "@heroui/react";
import { CloudOff, Trash2 } from "lucide-react";
import { ApiError, errorMessage } from "../../api/http.ts";
import { websitesApi, type UpdateWebsiteInput, type WebsiteDetail } from "../../api/websites.ts";
import FormAlert from "../ui/FormAlert.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";
import TextInput from "../ui/TextInput.tsx";

type SettingsForm = {
  name: string;
  businessName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
};

function toForm(website: WebsiteDetail): SettingsForm {
  return {
    name: website.name,
    businessName: website.info.businessName ?? "",
    description: website.info.description ?? "",
    contactEmail: website.info.contactEmail ?? "",
    contactPhone: website.info.contactPhone ?? "",
    address: website.info.address ?? "",
  };
}

type ProjectSettingsPanelProps = {
  website: WebsiteDetail;
  onSaved: (website: WebsiteDetail) => void;
  onDelete: () => void;
  onUnpublish: () => void;
};

export default function ProjectSettingsPanel({ website, onSaved, onDelete, onUnpublish }: ProjectSettingsPanelProps) {
  const [form, setForm] = useState<SettingsForm>(() => toForm(website));
  const [errors, setErrors] = useState<Partial<Record<keyof SettingsForm, string>>>({});
  const [status, setStatus] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const initial = toForm(website);
  const dirty = (Object.keys(form) as (keyof SettingsForm)[]).some((key) => form[key] !== initial[key]);

  function update(key: keyof SettingsForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      setErrors({ name: "Name must be at least 2 characters" });
      return;
    }
    setSaving(true);
    setStatus(null);
    const input: UpdateWebsiteInput = { ...form, name: form.name.trim() };
    try {
      const saved = await websitesApi.update(website.id, input);
      onSaved(saved);
      setForm(toForm(saved));
      setStatus({ tone: "success", message: "Settings saved." });
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      setStatus({ tone: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-surface shadow-xs" noValidate>
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold text-ink">General</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Name and business details used across your website.</p>
        </div>

        <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
          <TextInput label="Website name" name="name" value={form.name} onChange={(value) => update("name", value)} error={errors.name} isRequired />
          <TextInput
            label="Business name"
            name="businessName"
            value={form.businessName}
            onChange={(value) => update("businessName", value)}
            error={errors.businessName}
          />
          <div className="sm:col-span-2">
            <TextInput
              label="Address"
              name="subdomain"
              value={website.subdomain}
              onChange={() => undefined}
              description="The subdomain can't be changed after the website is created."
              isDisabled
            />
          </div>
          <div className="sm:col-span-2">
            <TextAreaInput
              label="Description"
              name="description"
              value={form.description}
              onChange={(value) => update("description", value)}
              error={errors.description}
              placeholder="What this business does, in a sentence or two."
            />
          </div>
          <TextInput
            label="Contact email"
            name="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={(value) => update("contactEmail", value)}
            error={errors.contactEmail}
          />
          <TextInput
            label="Contact phone"
            name="contactPhone"
            type="tel"
            value={form.contactPhone}
            onChange={(value) => update("contactPhone", value)}
            error={errors.contactPhone}
          />
          <div className="sm:col-span-2">
            <TextAreaInput
              label="Business address"
              name="address"
              rows={2}
              value={form.address}
              onChange={(value) => update("address", value)}
              error={errors.address}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas/50 px-6 py-3.5">
          <div className="min-w-0 flex-1">
            {status && <FormAlert status={status.tone}>{status.message}</FormAlert>}
          </div>
          <Button type="submit" size="sm" isPending={saving} isDisabled={!dirty}>
            Save changes
          </Button>
        </div>
      </form>

      {website.status === "PUBLISHED" && (
        <section className="rounded-xl border border-line bg-surface shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <h2 className="text-base font-semibold text-ink">Unpublish website</h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Takes the live site offline on every address. Your draft and deployments are kept.
              </p>
            </div>
            <Button size="sm" variant="outline" onPress={onUnpublish}>
              <CloudOff className="size-4" aria-hidden /> Unpublish
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-ed-danger/30 bg-surface shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-ink">Delete website</h2>
            <p className="mt-0.5 text-sm text-ink-muted">Permanently removes all pages and deployments. This can't be undone.</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onPress={onDelete}
            className="border-ed-danger/40 text-ed-danger hover:bg-ed-danger-soft"
          >
            <Trash2 className="size-4" aria-hidden /> Delete
          </Button>
        </div>
      </section>
    </div>
  );
}
