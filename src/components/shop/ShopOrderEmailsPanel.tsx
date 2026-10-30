import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Label, Spinner, Switch } from "@heroui/react";
import { ImagePlus, Trash2 } from "lucide-react";
import { ACCEPT_BY_KIND, mediaApi, uploadProblem } from "../../api/media.ts";
import { errorMessage } from "../../api/http.ts";
import {
  shopApi,
  type ShopOrderEmailDesign,
  type ShopOrderEmailLayout,
  type ShopOrderEmailLayoutOption,
  type ShopOrderEmailStatus,
  type ShopOrderEmailTemplate,
} from "../../api/shop.ts";
import { optimizeImageToWebP } from "../../utils/image-optimizer.ts";
import FormAlert from "../ui/FormAlert.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";
import TextInput from "../ui/TextInput.tsx";

const SAMPLE = {
  customerName: "Asha Menon",
  orderNumber: "1042",
  orderTotal: "₹2,499",
  orderDate: "29 Oct 2026",
  shopName: "Your shop",
  failureReason: "Payment could not be completed.",
  items: "Everyday tee (M / Blue) × 2 — ₹1,998\nCanvas tote (Natural) × 1 — ₹501",
};

const PLACEHOLDER_LABELS: Record<string, string> = {
  "{{customerName}}": "Customer name",
  "{{orderNumber}}": "Order number",
  "{{orderTotal}}": "Order total",
  "{{orderDate}}": "Order date",
  "{{shopName}}": "Shop name",
  "{{failureReason}}": "Failure reason",
};

const LAYOUT_SWATCH: Record<ShopOrderEmailLayout, { bar: string; fill: string }> = {
  classic: { bar: "h-1.5 w-full", fill: "bg-[var(--swatch)]" },
  bold: { bar: "h-10 w-full", fill: "bg-[var(--swatch)]" },
  minimal: { bar: "h-1 w-8", fill: "bg-[var(--swatch)]" },
  banner: { bar: "h-2 w-full", fill: "bg-[var(--swatch)]" },
  postcard: { bar: "h-full w-full ring-2 ring-inset", fill: "ring-[var(--swatch)]" },
};

function fill(template: string): string {
  return template
    .replaceAll("{{customerName}}", SAMPLE.customerName)
    .replaceAll("{{orderNumber}}", SAMPLE.orderNumber)
    .replaceAll("{{orderTotal}}", SAMPLE.orderTotal)
    .replaceAll("{{orderDate}}", SAMPLE.orderDate)
    .replaceAll("{{shopName}}", SAMPLE.shopName)
    .replaceAll("{{failureReason}}", SAMPLE.failureReason)
    .replaceAll("{{customerEmail}}", "asha@example.com")
    .replaceAll("{{status}}", "shipped")
    .replaceAll("{{statusLabel}}", "Shipped")
    .replaceAll("{{items}}", SAMPLE.items);
}

function appendToken(value: string, token: string): string {
  if (!value.trim()) return token;
  const needsSpace = !/\s$/.test(value);
  return `${value}${needsSpace ? " " : ""}${token}`;
}

function PreviewCard({
  design,
  heading,
  message,
}: {
  design: ShopOrderEmailDesign;
  heading: string;
  message: string;
}) {
  const accent = design.accentColor || "#194a7a";
  const logo = design.showLogo ? design.logoUrl || design.websiteLogoUrl : null;
  const brand = logo ? (
    <img src={logo} alt="" className="h-8 max-w-[120px] object-contain" />
  ) : (
    <p className="text-sm font-bold" style={{ color: design.layout === "bold" ? "#fff" : accent }}>
      {SAMPLE.shopName}
    </p>
  );

  const orderBox = (
    <div
      className="mt-3 rounded-lg px-3 py-2 text-left text-xs"
      style={
        design.layout === "banner"
          ? { background: accent, color: "#fff" }
          : design.layout === "minimal"
            ? { border: `2px solid ${accent}`, background: "#fff" }
            : { background: "#f6f7f9", border: "1px solid #e8eaef" }
      }
    >
      <p className={design.layout === "banner" ? "text-white/80" : "text-ink-muted"}>
        Order #{SAMPLE.orderNumber} · {SAMPLE.orderDate}
      </p>
      <p className="mt-1 font-semibold">Total {SAMPLE.orderTotal}</p>
      <p className="mt-1 whitespace-pre-line opacity-90">{SAMPLE.items}</p>
    </div>
  );

  if (design.layout === "bold") {
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="px-4 py-3" style={{ background: accent }}>
          {brand}
          <h4 className="mt-2 text-base font-semibold text-white">{heading}</h4>
        </div>
        <div className="px-4 py-4">
          <div className="whitespace-pre-line text-sm leading-relaxed text-ink-body">{message}</div>
          {orderBox}
        </div>
      </div>
    );
  }

  if (design.layout === "minimal") {
    return (
      <div className="rounded-xl bg-surface p-4">
        {brand}
        <h4 className="mt-3 text-base font-semibold text-ink">{heading}</h4>
        <div className="mt-2 h-0.5 w-10 rounded" style={{ background: accent }} />
        <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-body">{message}</div>
        {orderBox}
      </div>
    );
  }

  if (design.layout === "postcard") {
    return (
      <div className="rounded-2xl bg-surface p-4 text-center shadow-sm" style={{ border: `2px solid ${accent}` }}>
        <div className="flex justify-center">{brand}</div>
        <h4 className="mt-3 text-base font-semibold text-ink">{heading}</h4>
        <div className="mt-3 whitespace-pre-line text-left text-sm leading-relaxed text-ink-body">{message}</div>
        {orderBox}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <div className={design.layout === "banner" ? "h-2.5" : "h-1.5"} style={{ background: accent }} />
      <div className="px-4 py-4">
        {brand}
        <h4 className="mt-3 text-base font-semibold text-ink">{heading}</h4>
        <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-body">{message}</div>
        {orderBox}
      </div>
    </div>
  );
}

export default function ShopOrderEmailsPanel({
  websiteId,
  clientId,
}: {
  websiteId: string;
  clientId: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState<ShopOrderEmailTemplate[] | null>(null);
  const [design, setDesign] = useState<ShopOrderEmailDesign | null>(null);
  const [designDraft, setDesignDraft] = useState<ShopOrderEmailDesign | null>(null);
  const [layouts, setLayouts] = useState<ShopOrderEmailLayoutOption[]>([]);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [selected, setSelected] = useState<ShopOrderEmailStatus>("paid");
  const [draft, setDraft] = useState<ShopOrderEmailTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    shopApi
      .orderEmailTemplates(websiteId)
      .then((data) => {
        if (cancelled) return;
        setTemplates(data.templates);
        setDesign(data.design);
        setDesignDraft(data.design);
        setLayouts(data.layouts);
        setPlaceholders(data.placeholders);
        const first = data.templates.find((row) => row.status === "paid") ?? data.templates[0] ?? null;
        setSelected(first?.status ?? "paid");
        setDraft(first);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  useEffect(() => {
    if (!templates) return;
    const next = templates.find((row) => row.status === selected) ?? null;
    setDraft(next);
    setMessage(null);
    setError(null);
  }, [selected, templates]);

  const dirtyCopy = useMemo(() => {
    if (!draft || !templates) return false;
    const original = templates.find((row) => row.status === draft.status);
    if (!original) return false;
    return (
      original.enabled !== draft.enabled ||
      original.subject !== draft.subject ||
      original.heading !== draft.heading ||
      original.message !== draft.message
    );
  }, [draft, templates]);

  const dirtyDesign = useMemo(() => {
    if (!design || !designDraft) return false;
    return (
      design.layout !== designDraft.layout ||
      design.accentColor !== designDraft.accentColor ||
      design.showLogo !== designDraft.showLogo ||
      design.logoMediaId !== designDraft.logoMediaId
    );
  }, [design, designDraft]);

  const preview = useMemo(() => {
    if (!draft) return null;
    return {
      heading: fill(draft.heading),
      message: fill(draft.message),
      subject: fill(draft.subject),
    };
  }, [draft]);

  async function saveDesign() {
    if (!designDraft || savingDesign) return;
    setSavingDesign(true);
    setError(null);
    setMessage(null);
    try {
      const saved = await shopApi.updateOrderEmailDesign(websiteId, {
        layout: designDraft.layout,
        accentColor: designDraft.accentColor,
        showLogo: designDraft.showLogo,
        logoMediaId: designDraft.logoMediaId,
      });
      setDesign(saved);
      setDesignDraft(saved);
      setMessage("Design saved. All order emails use this look.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingDesign(false);
    }
  }

  async function uploadLogo(files: FileList | null) {
    if (!files?.[0] || !designDraft) return;
    const raw = files[0];
    const problem = uploadProblem(raw, "IMAGE");
    if (problem) {
      setError(problem);
      return;
    }
    setUploadingLogo(true);
    setError(null);
    try {
      const { file } = await optimizeImageToWebP(raw, { quality: 0.9, maxWidth: 800, maxHeight: 400 });
      const uploaded = await mediaApi.upload({
        file,
        clientId,
        websiteId,
        altText: "Order email logo",
      });
      setDesignDraft({
        ...designDraft,
        showLogo: true,
        logoMediaId: uploaded.id,
        logoUrl: uploaded.url,
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploadingLogo(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function saveCopy() {
    if (!draft || saving) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const saved = await shopApi.updateOrderEmailTemplate(websiteId, draft.status, {
        enabled: draft.enabled,
        subject: draft.subject,
        heading: draft.heading,
        message: draft.message,
      });
      setTemplates((current) => (current ?? []).map((row) => (row.status === saved.status ? saved : row)));
      setDraft(saved);
      setMessage("Message saved.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function resetCopy() {
    if (!draft || saving) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const restored = await shopApi.resetOrderEmailTemplate(websiteId, draft.status);
      setTemplates((current) => (current ?? []).map((row) => (row.status === restored.status ? restored : row)));
      setDraft(restored);
      setMessage("Restored default wording.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if ((!templates || !designDraft) && !error) {
    return (
      <div className="grid place-items-center rounded-xl border border-line bg-surface py-16">
        <Spinner aria-label="Loading order emails" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-5 py-4">
          <h3 className="text-sm font-semibold text-ink">Email design</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Pick a layout, colour, and optional logo. This look is used for every order status email.
          </p>
        </div>
        {designDraft && (
          <div className="space-y-5 px-5 py-5">
            {error && <FormAlert status="danger">{error}</FormAlert>}
            {message && <FormAlert status="success">{message}</FormAlert>}

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Template</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {layouts.map((layout) => {
                  const active = designDraft.layout === layout.id;
                  const swatch = LAYOUT_SWATCH[layout.id];
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() =>
                        setDesignDraft({
                          ...designDraft,
                          layout: layout.id,
                          accentColor: designDraft.accentColor || layout.defaultAccent,
                        })
                      }
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        active ? "border-ink bg-ed-bg" : "border-line hover:border-ink/30"
                      }`}
                    >
                      <div
                        className="mb-2 h-14 overflow-hidden rounded-lg bg-canvas p-2"
                        style={{ ["--swatch" as string]: designDraft.accentColor || layout.defaultAccent }}
                      >
                        <div className={`${swatch.bar} ${swatch.fill} rounded`} />
                        <div className="mt-2 space-y-1">
                          <div className="h-1.5 w-2/3 rounded bg-ink/20" />
                          <div className="h-1.5 w-full rounded bg-ink/10" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-ink">{layout.label}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{layout.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <label className="grid gap-1 text-sm font-medium text-ink">
                Accent colour
                <span className="flex items-center gap-2">
                  <input
                    type="color"
                    value={designDraft.accentColor}
                    onChange={(event) => setDesignDraft({ ...designDraft, accentColor: event.target.value })}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-ed-border bg-surface p-1"
                    aria-label="Accent colour"
                  />
                  <input
                    value={designDraft.accentColor}
                    onChange={(event) => setDesignDraft({ ...designDraft, accentColor: event.target.value })}
                    className="h-10 w-28 rounded-lg border border-ed-border bg-surface px-2 font-mono text-sm text-ink"
                    aria-label="Accent colour hex"
                  />
                </span>
              </label>

              <Switch
                isSelected={designDraft.showLogo}
                onChange={(showLogo) => setDesignDraft({ ...designDraft, showLogo })}
              >
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Label className="text-sm text-ink">Show logo in emails</Label>
                </Switch.Content>
              </Switch>
            </div>

            {designDraft.showLogo && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-canvas/40 px-3 py-3">
                {(designDraft.logoUrl || designDraft.websiteLogoUrl) && (
                  <img
                    src={designDraft.logoUrl || designDraft.websiteLogoUrl || ""}
                    alt=""
                    className="h-10 max-w-[140px] rounded object-contain bg-surface p-1"
                  />
                )}
                <div className="min-w-0 flex-1 text-xs text-ink-muted">
                  {designDraft.logoUrl
                    ? "Using your custom email logo."
                    : designDraft.websiteLogoUrl
                      ? "Using this website’s logo. Upload a different one if you prefer."
                      : "No website logo yet. Upload one for emails, or add a logo in website settings."}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT_BY_KIND.IMAGE}
                  className="hidden"
                  onChange={(event) => void uploadLogo(event.target.files)}
                />
                <Button size="sm" variant="outline" onPress={() => fileRef.current?.click()} isDisabled={uploadingLogo}>
                  <ImagePlus className="size-3.5" aria-hidden />
                  {uploadingLogo ? "Uploading…" : "Upload logo"}
                </Button>
                {designDraft.logoMediaId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() =>
                      setDesignDraft({
                        ...designDraft,
                        logoMediaId: null,
                        logoUrl: null,
                      })
                    }
                  >
                    <Trash2 className="size-3.5" aria-hidden /> Use website logo
                  </Button>
                )}
              </div>
            )}

            <div className="max-w-lg">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Design preview</p>
              <PreviewCard
                design={designDraft}
                heading={preview?.heading || "Your order is on the way"}
                message={preview?.message || `Hi ${SAMPLE.customerName},\n\nOrder #${SAMPLE.orderNumber} has shipped.`}
              />
            </div>

            <Button size="sm" onPress={() => void saveDesign()} isDisabled={savingDesign || !dirtyDesign}>
              {savingDesign ? "Saving…" : "Save design"}
            </Button>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-5 py-4">
          <h3 className="text-sm font-semibold text-ink">Message by status</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Write the subject, title, and message for each status. The design above wraps this text.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav className="border-b border-line lg:border-b-0 lg:border-r lg:border-line">
            <ul className="flex gap-1 overflow-x-auto p-3 lg:flex-col">
              {(templates ?? []).map((row) => {
                const active = row.status === selected;
                return (
                  <li key={row.status}>
                    <button
                      type="button"
                      onClick={() => setSelected(row.status)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        active ? "bg-ed-bg font-medium text-ink" : "text-ink-muted hover:bg-ed-bg/60 hover:text-ink"
                      }`}
                    >
                      <span className="block">{row.statusLabel}</span>
                      <span className="block text-[11px] text-ink-muted">
                        {row.enabled ? "Sending" : "Off"}
                        {row.isDefault ? " · Default" : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-5 px-5 py-5">
            {draft && designDraft && (
              <>
                <Switch isSelected={draft.enabled} onChange={(enabled) => setDraft({ ...draft, enabled })}>
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Label className="text-sm text-ink">
                      Send this email when an order becomes {draft.statusLabel.toLowerCase()}
                    </Label>
                  </Switch.Content>
                </Switch>

                <TextInput
                  label="Email subject"
                  name="subject"
                  value={draft.subject}
                  onChange={(subject) => setDraft({ ...draft, subject })}
                  description="What customers see in their inbox."
                />
                <TextInput
                  label="Title"
                  name="heading"
                  value={draft.heading}
                  onChange={(heading) => setDraft({ ...draft, heading })}
                  description="Big heading at the top of the email."
                />
                <TextAreaInput
                  label="Message"
                  name="message"
                  value={draft.message}
                  onChange={(message) => setDraft({ ...draft, message })}
                  rows={7}
                  description="Write like a normal message. Leave a blank line between paragraphs."
                />

                <div className="rounded-lg border border-line bg-canvas/40 px-3 py-3">
                  <p className="text-xs font-medium text-ink">Add details into the message</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {placeholders.map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() => setDraft({ ...draft, message: appendToken(draft.message, token) })}
                        className="rounded-full border border-ed-border bg-surface px-2.5 py-1 text-xs text-ink hover:border-ink/30"
                      >
                        {PLACEHOLDER_LABELS[token] ?? token}
                      </button>
                    ))}
                  </div>
                </div>

                {preview && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                      Preview · {preview.subject}
                    </p>
                    <PreviewCard design={designDraft} heading={preview.heading} message={preview.message} />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onPress={() => void saveCopy()} isDisabled={saving || !dirtyCopy}>
                    {saving ? "Saving…" : "Save message"}
                  </Button>
                  <Button size="sm" variant="outline" onPress={() => void resetCopy()} isDisabled={saving}>
                    Restore default
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
