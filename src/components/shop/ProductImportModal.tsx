import { useRef, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { CircleCheck, Download, FileSpreadsheet, Upload } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import {
  productImportTemplate,
  shopImportApi,
  type ImportIssue,
  type ProductImportResult,
  type ProductImportSummary,
} from "../../api/shop-import.ts";
import { downloadBlob } from "../../utils/download.ts";
import { CommonModal } from "../ui/AppModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";

const ACCEPT = ".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PREVIEW_ITEMS = 50;

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function IssueList({ issues, title }: { issues: ImportIssue[]; title: string }) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/5 p-3">
      <p className="text-sm font-medium text-danger">{title}</p>
      <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto text-sm text-ink-body">
        {issues.map((issue, index) => (
          <li key={index}>
            {issue.line !== null && <span className="font-medium text-ink">Row {issue.line}: </span>}
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryTiles({ summary }: { summary: ProductImportSummary }) {
  const tiles = [
    { label: "New products", value: summary.createProducts, note: plural(summary.createVariants, "variant") },
    { label: "Products updated", value: summary.updateProducts, note: `${plural(summary.updateVariants, "variant")} matched by SKU` },
    { label: "New categories", value: summary.newCategories.length, note: summary.newCategories.slice(0, 3).join(", ") || "—" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-lg border border-line p-3">
          <p className="text-xs text-ink-muted">{tile.label}</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-ink">{tile.value}</p>
          <p className="truncate text-xs text-ink-muted" title={tile.note}>
            {tile.note}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Upload a CSV or Excel sheet of products: check it, see what will change, then import. */
export default function ProductImportModal({
  websiteId,
  onClose,
  onImported,
}: {
  websiteId: string;
  onClose: () => void;
  onImported: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ProductImportSummary | null>(null);
  const [result, setResult] = useState<ProductImportResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(next: File | undefined) {
    if (!next) return;
    setFile(next);
    setPreview(null);
    setResult(null);
    setError(null);
    setChecking(true);
    try {
      setPreview(await shopImportApi.preview(websiteId, next));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChecking(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function runImport() {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const done = await shopImportApi.apply(websiteId, file);
      if (done.applied) {
        setResult(done);
        onImported();
      } else setPreview(done);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setImporting(false);
    }
  }

  const ready = preview && preview.issues.length === 0 && preview.items.length > 0;

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      title="Import products"
      subtitle="Add or update many products at once from a CSV or Excel sheet."
      icon={<FileSpreadsheet className="size-5" />}
      iconTone="brand"
      size="lg"
      secondaryAction={{ label: result ? "Done" : "Cancel", onPress: onClose }}
      primaryAction={
        result
          ? undefined
          : {
              label: preview ? `Import ${plural(preview.createProducts + preview.updateProducts, "product")}` : "Import",
              onPress: () => void runImport(),
              isPending: importing,
              isDisabled: !ready || checking,
            }
      }
    >
      <div className="flex flex-col gap-4">
        {result ? (
          <>
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
              <div className="text-sm text-ink-body">
                <p className="font-medium text-ink">Import finished</p>
                <p className="mt-0.5">
                  {plural(result.created, "product")} created, {plural(result.updated, "product")} updated. Stock changes are
                  listed in the stock history as “Bulk import”.
                </p>
              </div>
            </div>
            {result.failures.length > 0 && <IssueList title="Some products couldn't be saved" issues={result.failures} />}
          </>
        ) : (
          <>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-body">
              <li>
                Download the template and fill in one row per variant. Rows with the same product name become one product, and
                its sizes, colours and other options go in the Option columns.
              </li>
              <li>
                To update products you already have, fill in each variant's <strong>SKU</strong>. Its price, base price, barcode
                and stock are updated, and blank cells are left as they are.
              </li>
              <li>Upload the file, check the summary, then import. Add photos afterwards in each product.</li>
            </ol>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onPress={() => downloadBlob(productImportTemplate(), "product-import-template.csv")}>
                <Download className="size-4" aria-hidden /> Download template
              </Button>
              <Button onPress={() => inputRef.current?.click()} isPending={checking}>
                <Upload className="size-4" aria-hidden /> {file ? "Choose another file" : "Choose CSV or Excel file"}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                aria-label="Product sheet"
                onChange={(event) => void choose(event.target.files?.[0])}
              />
            </div>

            {file && <p className="text-xs text-ink-muted">File: {file.name}</p>}
            {error && <FormAlert status="danger">{error}</FormAlert>}
            {checking && (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Spinner size="sm" aria-label="Checking file" /> Checking the file…
              </div>
            )}

            {preview && (
              <>
                <SummaryTiles summary={preview} />
                {preview.issues.length > 0 && (
                  <IssueList
                    title={`Fix ${plural(preview.issues.length, "problem")} in the file and upload it again. Nothing has been imported.`}
                    issues={preview.issues}
                  />
                )}
                {preview.items.length > 0 && (
                  <div className="max-h-64 overflow-y-auto rounded-lg border border-line">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-surface">
                        <tr className="border-b border-line text-left text-xs text-ink-muted">
                          <th className="px-3 py-2 font-medium">Product</th>
                          <th className="px-3 py-2 font-medium">Action</th>
                          <th className="px-3 py-2 text-right font-medium">Variants</th>
                          <th className="px-3 py-2 text-right font-medium">Rows</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {preview.items.slice(0, PREVIEW_ITEMS).map((item) => (
                          <tr key={`${item.action}-${item.name}-${item.lines[0]}`}>
                            <td className="px-3 py-1.5 text-ink">{item.name}</td>
                            <td className="px-3 py-1.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  item.action === "create" ? "bg-emerald-500/10 text-emerald-700" : "bg-sky-500/10 text-sky-700"
                                }`}
                              >
                                {item.action === "create" ? "New" : "Update"}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums text-ink-body">{item.variants}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums text-ink-muted">
                              {item.lines.length > 1 ? `${item.lines[0]}–${item.lines[item.lines.length - 1]}` : item.lines[0]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preview.items.length > PREVIEW_ITEMS && (
                      <p className="px-3 py-2 text-xs text-ink-muted">…and {preview.items.length - PREVIEW_ITEMS} more</p>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </CommonModal>
  );
}
