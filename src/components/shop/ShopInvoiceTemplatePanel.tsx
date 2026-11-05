import { useEffect, useRef, useState } from "react";
import { Button, Label, Spinner, Switch } from "@heroui/react";
import { ImagePlus, Trash2 } from "lucide-react";
import { ACCEPT_BY_KIND, mediaApi, uploadProblem } from "../../api/media.ts";
import { errorMessage } from "../../api/http.ts";
import {
  shopApi,
  type ShopInvoiceDesign,
  type ShopInvoiceLayout,
  type ShopInvoiceLayoutOption,
} from "../../api/shop.ts";
import { optimizeImageToWebP } from "../../utils/image-optimizer.ts";
import FormAlert from "../ui/FormAlert.tsx";

const SAMPLE_ITEMS = [
  { name: "Everyday tee (M / Blue)", qty: 2, taxable: "Rs 1,693", gstPercent: "18%", gst: "Rs 305", amount: "Rs 1,998" },
  { name: "Canvas tote (Natural)", qty: 1, taxable: "Rs 425", gstPercent: "18%", gst: "Rs 76", amount: "Rs 501" },
] as const;

function PreviewTotals({ compact }: { compact?: boolean }) {
  return (
    <div className={`ml-auto text-right ${compact ? "mt-1.5 max-w-[140px] text-[9px]" : "mt-3 max-w-[220px] text-sm"}`}>
      <div className="flex justify-between gap-4 text-ink-muted">
        <span>Taxable value</span>
        <span>Rs 2,118</span>
      </div>
      <div className="mt-0.5 flex justify-between gap-4 text-ink-muted">
        <span>GST (18%)</span>
        <span>Rs 381</span>
      </div>
      <div className={`flex justify-between gap-4 border-t border-line font-semibold text-ink ${compact ? "mt-1 pt-1" : "mt-2 pt-2"}`}>
        <span>Grand total</span>
        <span>Rs 2,499</span>
      </div>
    </div>
  );
}

type PreviewProps = {
  design: ShopInvoiceDesign;
  companyName: string;
  companyAddress: string;
  compact?: boolean;
};

function LogoMark({
  design,
  companyName,
  compact,
}: {
  design: ShopInvoiceDesign;
  companyName: string;
  compact?: boolean;
}) {
  const logo = design.showLogo ? design.logoUrl || design.websiteLogoUrl : null;
  const size = compact ? "h-6 max-w-[72px]" : "h-10 max-w-[140px]";
  if (logo) return <img src={logo} alt="" className={`${size} object-contain`} />;
  return (
    <span className={`font-semibold text-ink ${compact ? "text-[10px]" : "text-lg"}`}>
      {companyName}
    </span>
  );
}

/** Classic: bordered table with taxable / GST / amount columns. */
function ClassicInvoice({ design, companyName, companyAddress, compact }: PreviewProps) {
  return (
    <div className={`border border-line bg-white text-ink ${compact ? "rounded-lg p-2" : "rounded-2xl p-5"}`}>
      <div className={`flex items-start justify-between gap-2 ${compact ? "mb-2" : "mb-4"}`}>
        <div>
          <p className={`font-semibold ${compact ? "text-xs" : "text-lg"}`}>INVOICE</p>
          <p className={`text-ink-muted ${compact ? "text-[9px]" : "text-xs"}`}>#INV-1042 · 4 Nov 2026</p>
        </div>
        <LogoMark design={design} companyName={companyName} compact={compact} />
      </div>
      {!compact && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">From</p>
            <p className="mt-0.5 text-sm font-medium">{companyName}</p>
            <p className="text-xs text-ink-muted">{companyAddress}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Bill to</p>
            <p className="mt-0.5 text-sm font-medium">Asha Menon</p>
            <p className="text-xs text-ink-muted">Bengaluru, Karnataka</p>
          </div>
        </div>
      )}
      <table className={`w-full border-collapse ${compact ? "text-[8px]" : "text-sm"}`}>
        <thead>
          <tr className="bg-canvas">
            <th className={`border border-line text-left font-semibold ${compact ? "px-1 py-0.5" : "px-2 py-1.5"}`}>Item</th>
            <th className={`border border-line text-center font-semibold ${compact ? "px-1 py-0.5" : "px-2 py-1.5"}`}>Qty</th>
            {!compact && <th className="border border-line px-2 py-1.5 text-right font-semibold">Taxable</th>}
            {!compact && <th className="border border-line px-2 py-1.5 text-center font-semibold">GST %</th>}
            {!compact && <th className="border border-line px-2 py-1.5 text-right font-semibold">GST</th>}
            <th className={`border border-line text-right font-semibold ${compact ? "px-1 py-0.5" : "px-2 py-1.5"}`}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {(compact ? SAMPLE_ITEMS.slice(0, 1) : SAMPLE_ITEMS).map((item) => (
            <tr key={item.name}>
              <td className={`border border-line ${compact ? "px-1 py-0.5" : "px-2 py-1.5"}`}>{compact ? "Everyday tee" : item.name}</td>
              <td className={`border border-line text-center ${compact ? "px-1 py-0.5" : "px-2 py-1.5"}`}>{item.qty}</td>
              {!compact && <td className="border border-line px-2 py-1.5 text-right">{item.taxable}</td>}
              {!compact && <td className="border border-line px-2 py-1.5 text-center">{item.gstPercent}</td>}
              {!compact && <td className="border border-line px-2 py-1.5 text-right">{item.gst}</td>}
              <td className={`border border-line text-right ${compact ? "px-1 py-0.5" : "px-2 py-1.5"}`}>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PreviewTotals compact={compact} />
    </div>
  );
}

/** Minimal: open layout, hairline separators, no cell borders. */
function MinimalInvoice({ design, companyName, companyAddress, compact }: PreviewProps) {
  return (
    <div className={`bg-white text-ink ${compact ? "rounded-lg border border-dashed border-line p-2" : "rounded-2xl border border-dashed border-line p-5"}`}>
      <div className={`flex items-end justify-between ${compact ? "mb-2" : "mb-5"}`}>
        <LogoMark design={design} companyName={companyName} compact={compact} />
        <div className="text-right">
          <p className={`font-medium ${compact ? "text-[10px]" : "text-sm"}`}>INV-1042</p>
          <p className={`text-ink-muted ${compact ? "text-[8px]" : "text-xs"}`}>4 Nov 2026</p>
        </div>
      </div>
      {!compact && (
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium">{companyName}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{companyAddress}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-ink-muted">Bill to</p>
            <p className="text-sm font-medium">Asha Menon</p>
            <p className="text-xs text-ink-muted">Bengaluru, Karnataka</p>
          </div>
        </div>
      )}
      <table className={`w-full ${compact ? "text-[8px]" : "text-sm"}`}>
        <thead>
          <tr className="border-b border-ink/20 text-ink-muted">
            <th className={`pb-1 text-left font-normal ${compact ? "" : "pb-2"}`}>Description</th>
            <th className={`pb-1 text-center font-normal ${compact ? "" : "pb-2"}`}>Qty</th>
            {!compact && <th className="pb-2 text-right font-normal">Taxable</th>}
            {!compact && <th className="pb-2 text-center font-normal">GST %</th>}
            {!compact && <th className="pb-2 text-right font-normal">GST</th>}
            <th className={`pb-1 text-right font-normal ${compact ? "" : "pb-2"}`}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {(compact ? SAMPLE_ITEMS.slice(0, 1) : SAMPLE_ITEMS).map((item) => (
            <tr key={item.name} className="border-b border-line/70">
              <td className={compact ? "py-0.5" : "py-2"}>{compact ? "Everyday tee" : item.name}</td>
              <td className={`text-center ${compact ? "py-0.5" : "py-2"}`}>{item.qty}</td>
              {!compact && <td className="py-2 text-right">{item.taxable}</td>}
              {!compact && <td className="py-2 text-center">{item.gstPercent}</td>}
              {!compact && <td className="py-2 text-right">{item.gst}</td>}
              <td className={`text-right ${compact ? "py-0.5" : "py-2"}`}>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PreviewTotals compact={compact} />
    </div>
  );
}

/** Bold: dark band header + solid filled table header row. */
function BoldInvoice({ design, companyName, companyAddress, compact }: PreviewProps) {
  return (
    <div className={`overflow-hidden border border-ink bg-white text-ink ${compact ? "rounded-lg" : "rounded-2xl"}`}>
      <div className={`flex items-center justify-between bg-ink text-white ${compact ? "px-2 py-1.5" : "px-5 py-4"}`}>
        <div>
          <p className={`font-semibold tracking-wide ${compact ? "text-[10px]" : "text-base"}`}>INVOICE</p>
          <p className={`text-white/70 ${compact ? "text-[8px]" : "text-xs"}`}>#INV-1042</p>
        </div>
        <div className="rounded bg-white px-1.5 py-0.5">
          <LogoMark design={design} companyName={companyName} compact={compact} />
        </div>
      </div>
      {!compact && (
        <div className="grid gap-3 border-b border-line px-5 py-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase text-ink-muted">Company</p>
            <p className="text-sm font-medium">{companyName}</p>
            <p className="text-xs text-ink-muted">{companyAddress}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-ink-muted">Customer</p>
            <p className="text-sm font-medium">Asha Menon</p>
            <p className="text-xs text-ink-muted">Bengaluru, Karnataka</p>
          </div>
        </div>
      )}
      <div className={compact ? "p-1.5" : "p-4"}>
        <table className={`w-full ${compact ? "text-[8px]" : "text-sm"}`}>
          <thead>
            <tr className="bg-ink text-white">
              <th className={`text-left font-semibold ${compact ? "px-1 py-0.5" : "px-3 py-2"}`}>Item</th>
              <th className={`text-center font-semibold ${compact ? "px-1 py-0.5" : "px-3 py-2"}`}>Qty</th>
              {!compact && <th className="px-3 py-2 text-right font-semibold">Taxable</th>}
              {!compact && <th className="px-3 py-2 text-center font-semibold">GST %</th>}
              {!compact && <th className="px-3 py-2 text-right font-semibold">GST</th>}
              <th className={`text-right font-semibold ${compact ? "px-1 py-0.5" : "px-3 py-2"}`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(compact ? SAMPLE_ITEMS.slice(0, 1) : SAMPLE_ITEMS).map((item, index) => (
              <tr key={item.name} className={index % 2 === 0 ? "bg-canvas/60" : "bg-white"}>
                <td className={compact ? "px-1 py-0.5" : "px-3 py-2"}>{compact ? "Everyday tee" : item.name}</td>
                <td className={`text-center ${compact ? "px-1 py-0.5" : "px-3 py-2"}`}>{item.qty}</td>
                {!compact && <td className="px-3 py-2 text-right">{item.taxable}</td>}
                {!compact && <td className="px-3 py-2 text-center">{item.gstPercent}</td>}
                {!compact && <td className="px-3 py-2 text-right">{item.gst}</td>}
                <td className={`text-right font-medium ${compact ? "px-1 py-0.5" : "px-3 py-2"}`}>{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PreviewTotals compact={compact} />
      </div>
    </div>
  );
}

/** Modern: accent bar + card blocks + table with tinted header. */
function ModernInvoice({ design, companyName, companyAddress, compact }: PreviewProps) {
  return (
    <div className={`overflow-hidden bg-canvas text-ink shadow-sm ring-1 ring-line ${compact ? "rounded-lg" : "rounded-2xl"}`}>
      <div className={`bg-brand ${compact ? "h-1" : "h-2"}`} />
      <div className={compact ? "p-2" : "p-5"}>
        <div className={`flex items-start justify-between gap-2 ${compact ? "mb-2" : "mb-4"}`}>
          <div>
            <p className={`font-semibold text-brand ${compact ? "text-[10px]" : "text-sm"}`}>Tax invoice</p>
            <p className={`font-semibold ${compact ? "text-xs" : "text-lg"}`}>INV-1042</p>
            <p className={`text-ink-muted ${compact ? "text-[8px]" : "text-xs"}`}>Issued 4 Nov 2026</p>
          </div>
          <LogoMark design={design} companyName={companyName} compact={compact} />
        </div>
        {!compact && (
          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-surface px-3 py-2 ring-1 ring-line">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Sold by</p>
              <p className="mt-0.5 text-sm font-medium">{companyName}</p>
              <p className="text-xs text-ink-muted">{companyAddress}</p>
            </div>
            <div className="rounded-xl bg-surface px-3 py-2 ring-1 ring-line">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Bill to</p>
              <p className="mt-0.5 text-sm font-medium">Asha Menon</p>
              <p className="text-xs text-ink-muted">Bengaluru, Karnataka</p>
            </div>
          </div>
        )}
        <div className={`overflow-hidden rounded-xl bg-surface ring-1 ring-line ${compact ? "" : ""}`}>
          <table className={`w-full ${compact ? "text-[8px]" : "text-sm"}`}>
            <thead>
              <tr className="bg-brand/10 text-ink">
                <th className={`text-left font-semibold ${compact ? "px-1 py-0.5" : "px-3 py-2"}`}>Product</th>
                <th className={`text-center font-semibold ${compact ? "px-1 py-0.5" : "px-3 py-2"}`}>Qty</th>
                {!compact && <th className="px-3 py-2 text-right font-semibold">Taxable</th>}
                {!compact && <th className="px-3 py-2 text-center font-semibold">GST %</th>}
                {!compact && <th className="px-3 py-2 text-right font-semibold">GST</th>}
                <th className={`text-right font-semibold ${compact ? "px-1 py-0.5" : "px-3 py-2"}`}>Line total</th>
              </tr>
            </thead>
            <tbody>
              {(compact ? SAMPLE_ITEMS.slice(0, 1) : SAMPLE_ITEMS).map((item) => (
                <tr key={item.name} className="border-t border-line">
                  <td className={compact ? "px-1 py-0.5" : "px-3 py-2"}>{compact ? "Everyday tee" : item.name}</td>
                  <td className={`text-center ${compact ? "px-1 py-0.5" : "px-3 py-2"}`}>{item.qty}</td>
                  {!compact && <td className="px-3 py-2 text-right">{item.taxable}</td>}
                  {!compact && <td className="px-3 py-2 text-center">{item.gstPercent}</td>}
                  {!compact && <td className="px-3 py-2 text-right">{item.gst}</td>}
                  <td className={`text-right ${compact ? "px-1 py-0.5" : "px-3 py-2"}`}>{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`flex justify-end ${compact ? "mt-1.5" : "mt-3"}`}>
          <div className={`rounded-lg bg-surface ring-1 ring-line ${compact ? "px-2 py-1" : "px-3 py-2"}`}>
            <PreviewTotals compact={compact} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoicePreviewByLayout(props: PreviewProps) {
  switch (props.design.layout) {
    case "minimal":
      return <MinimalInvoice {...props} />;
    case "bold":
      return <BoldInvoice {...props} />;
    case "modern":
      return <ModernInvoice {...props} />;
    case "classic":
    default:
      return <ClassicInvoice {...props} />;
  }
}

const LAYOUT_HINT: Record<ShopInvoiceLayout, string> = {
  classic: "Bordered table · Taxable / GST % / Amount",
  minimal: "Open rows · Taxable / GST / Grand total",
  bold: "Dark header · GST columns",
  modern: "Accent bar · GST breakdown card",
};

export default function ShopInvoiceTemplatePanel({
  websiteId,
  clientId,
  websiteName,
  businessName,
  businessAddress,
}: {
  websiteId: string;
  clientId: string;
  websiteName: string;
  businessName?: string | null;
  businessAddress?: string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [design, setDesign] = useState<ShopInvoiceDesign | null>(null);
  const [draft, setDraft] = useState<ShopInvoiceDesign | null>(null);
  const [layouts, setLayouts] = useState<ShopInvoiceLayoutOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    shopApi
      .invoiceTemplate(websiteId)
      .then((data) => {
        if (cancelled) return;
        setDesign(data.design);
        setDraft(data.design);
        setLayouts(data.layouts);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  const dirty =
    !!design &&
    !!draft &&
    (design.layout !== draft.layout || design.showLogo !== draft.showLogo || design.logoMediaId !== draft.logoMediaId);
  const companyName = businessName?.trim() || websiteName.trim() || "Your company";
  const companyAddress = businessAddress?.trim() || "Add company address in Website settings";

  async function save() {
    if (!draft || saving) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const saved = await shopApi.updateInvoiceTemplate(websiteId, {
        layout: draft.layout,
        showLogo: draft.showLogo,
        logoMediaId: draft.logoMediaId,
      });
      setDesign(saved);
      setDraft(saved);
      setMessage("Invoice template saved.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(files: FileList | null) {
    if (!files?.[0] || !draft) return;
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
        altText: "Invoice logo",
      });
      setDraft({
        ...draft,
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

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <h3 className="text-sm font-semibold text-ink">Invoice template</h3>
        <p className="mt-0.5 text-xs text-ink-muted">Choose one of four invoice styles and set an optional custom logo.</p>
      </div>
      {!draft && !error && (
        <div className="grid place-items-center py-16">
          <Spinner aria-label="Loading invoice template" />
        </div>
      )}
      {error && (
        <div className="px-5 py-5">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {draft && (
        <div className="space-y-5 px-5 py-5">
          {message && <FormAlert status="success">{message}</FormAlert>}

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Template</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {layouts.map((layout) => {
                const active = draft.layout === layout.id;
                return (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, layout: layout.id })}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      active ? "border-ink bg-ed-bg" : "border-line hover:border-ink/30"
                    }`}
                  >
                    <InvoicePreviewByLayout
                      design={{ ...draft, layout: layout.id }}
                      companyName={companyName}
                      companyAddress={companyAddress}
                      compact
                    />
                    <p className="mt-2 text-sm font-medium text-ink">{layout.label}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{LAYOUT_HINT[layout.id]}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Template preview</p>
            <InvoicePreviewByLayout design={draft} companyName={companyName} companyAddress={companyAddress} />
          </div>

          <Switch isSelected={draft.showLogo} onChange={(showLogo) => setDraft({ ...draft, showLogo })}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label className="text-sm text-ink">Show logo on invoice</Label>
            </Switch.Content>
          </Switch>

          {draft.showLogo && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-canvas/40 px-3 py-3">
              {(draft.logoUrl || draft.websiteLogoUrl) && (
                <img
                  src={draft.logoUrl || draft.websiteLogoUrl || ""}
                  alt=""
                  className="h-10 max-w-[140px] rounded object-contain bg-surface p-1"
                />
              )}
              <div className="min-w-0 flex-1 text-xs text-ink-muted">
                {draft.logoUrl
                  ? "Using your custom invoice logo."
                  : draft.websiteLogoUrl
                    ? "Using this website’s logo. Upload a different one if needed."
                    : "No website logo yet. Upload one for invoices, or add it in website settings."}
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
              {draft.logoMediaId && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() =>
                    setDraft({
                      ...draft,
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

          <Button size="sm" onPress={() => void save()} isDisabled={saving || !dirty}>
            {saving ? "Saving…" : "Save invoice template"}
          </Button>
        </div>
      )}
    </section>
  );
}
