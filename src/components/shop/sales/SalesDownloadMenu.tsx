import { useState, type Key } from "react";
import { Dropdown, Label, Spinner } from "@heroui/react";
import { ChevronDown, Download } from "lucide-react";
import { errorMessage } from "../../../api/http.ts";
import { shopSalesApi, type SalesExportFormat } from "../../../api/shop-sales.ts";
import type { DayRange } from "../pos/pos-period.ts";
import { downloadBlob } from "../../../utils/download.ts";

const FORMATS: { id: SalesExportFormat; label: string; hint: string }[] = [
  { id: "pdf", label: "PDF report", hint: "Printable A4 summary and orders" },
  { id: "csv", label: "CSV spreadsheet", hint: "Opens in Excel or Google Sheets" },
];

/** Downloads the sales summary and orders for the period as a PDF or CSV. */
export default function SalesDownloadMenu({
  websiteId,
  range,
  onError,
}: {
  websiteId: string;
  range: DayRange;
  onError: (message: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function download(format: SalesExportFormat) {
    setBusy(true);
    onError(null);
    try {
      const { from, to } = range;
      const name = from === to ? `sales-${from}.${format}` : `sales-${from}-to-${to}.${format}`;
      downloadBlob(await shopSalesApi.export(websiteId, range, format), name);
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dropdown>
      <Dropdown.Trigger
        isDisabled={busy}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:bg-canvas disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? <Spinner size="sm" aria-label="Preparing download" /> : <Download className="size-4" aria-hidden />}
        Download
        <ChevronDown className="size-4 text-ink-muted" aria-hidden />
      </Dropdown.Trigger>
      <Dropdown.Popover className="min-w-60 rounded-lg border border-ed-border bg-surface p-1 shadow-ed-pop z-(--z-ed-popover)">
        <Dropdown.Menu onAction={(key: Key) => void download(key as SalesExportFormat)} className="flex flex-col gap-0.5 outline-none">
          {FORMATS.map((format) => (
            <Dropdown.Item
              key={format.id}
              id={format.id}
              textValue={format.label}
              className="flex w-full cursor-pointer flex-col items-start rounded-md px-2.5 py-1.5 outline-none transition-colors select-none hover:bg-canvas"
            >
              <Label className="cursor-pointer text-sm font-medium text-ink">{format.label}</Label>
              <span className="text-xs text-ink-muted">{format.hint}</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
