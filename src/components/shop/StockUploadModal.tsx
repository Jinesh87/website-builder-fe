import { useRef, useState } from "react";
import { Button, Checkbox, Label, Spinner } from "@heroui/react";
import { CircleCheck, FileSpreadsheet, Upload } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { shopStockSheetApi, type StockChange, type StockUploadPreview, type StockUploadResult } from "../../api/shop-stock-sheet.ts";
import { CommonModal } from "../ui/AppModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import IssueList from "./ImportIssueList.tsx";
import StockListDownloadButton from "./StockListDownloadButton.tsx";

const ACCEPT = ".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PREVIEW_ROWS = 100;

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function signed(delta: number): string {
  return delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`;
}

function ChangeTable({ changes }: { changes: StockChange[] }) {
  return (
    <div className="max-h-72 overflow-y-auto rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface">
          <tr className="border-b border-line text-left text-xs text-ink-muted">
            <th className="px-3 py-2 font-medium">Product</th>
            <th className="px-3 py-2 text-right font-medium">Now</th>
            <th className="px-3 py-2 text-right font-medium">New</th>
            <th className="px-3 py-2 text-right font-medium">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {changes.slice(0, PREVIEW_ROWS).map((change) => {
            const delta = change.next - change.current;
            return (
              <tr key={change.variantId}>
                <td className="px-3 py-1.5">
                  <p className="text-ink">
                    {change.productName}
                    {change.variantName !== "Standard" && <span className="text-ink-muted"> · {change.variantName}</span>}
                  </p>
                  {change.changedSinceDownload && (
                    <p className="text-xs text-amber-700">
                      Was {change.before} when downloaded; {change.current} now (sold or restocked since)
                    </p>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-ink-muted">{change.current}</td>
                <td className="px-3 py-1.5 text-right font-medium tabular-nums text-ink">{change.next}</td>
                <td className={`px-3 py-1.5 text-right tabular-nums ${delta > 0 ? "text-emerald-700" : "text-danger"}`}>{signed(delta)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {changes.length > PREVIEW_ROWS && <p className="px-3 py-2 text-xs text-ink-muted">…and {changes.length - PREVIEW_ROWS} more</p>}
    </div>
  );
}

/** Upload the edited stock list: see what will change, then update stock. */
export default function StockUploadModal({
  websiteId,
  onClose,
  onUpdated,
}: {
  websiteId: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<StockUploadPreview | null>(null);
  const [result, setResult] = useState<StockUploadResult | null>(null);
  const [includeChanged, setIncludeChanged] = useState(false);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(next: File | undefined) {
    if (!next) return;
    setFile(next);
    setPreview(null);
    setResult(null);
    setIncludeChanged(false);
    setError(null);
    setChecking(true);
    try {
      setPreview(await shopStockSheetApi.preview(websiteId, next));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChecking(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function apply() {
    if (!file) return;
    setSaving(true);
    setError(null);
    try {
      const done = await shopStockSheetApi.apply(websiteId, file, includeChanged);
      setResult(done);
      if (done.updated > 0) onUpdated();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const moved = preview?.changes.filter((change) => change.changedSinceDownload).length ?? 0;
  const toApply = preview ? preview.changes.length - (includeChanged ? 0 : moved) : 0;

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      title="Upload stock list"
      subtitle="Update the stock of many variants at once from the downloaded list."
      icon={<FileSpreadsheet className="size-5" />}
      iconTone="brand"
      size="lg"
      secondaryAction={{ label: result ? "Done" : "Cancel", onPress: onClose }}
      primaryAction={
        result
          ? undefined
          : {
              label: toApply > 0 ? `Update ${plural(toApply, "variant")}` : "Update stock",
              onPress: () => void apply(),
              isPending: saving,
              isDisabled: toApply === 0 || checking,
            }
      }
    >
      <div className="flex flex-col gap-4">
        {result ? (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
            <div className="text-sm text-ink-body">
              <p className="font-medium text-ink">Stock updated for {plural(result.updated, "variant")}</p>
              <p className="mt-0.5">
                {result.skipped > 0 && `${plural(result.skipped, "variant")} that changed since the download were left as they are. `}
                {result.issues.length > 0 && `${plural(result.issues.length, "row")} with problems were skipped. `}
                Changes are in the stock history as “Stock list upload”.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-body">
              <li>Download the stock list. It has every variant with its stock now.</li>
              <li>
                Change the numbers in the yellow <strong>New stock</strong> column: higher to add stock, lower to reduce it, 0 for
                out of stock. Leave the other columns as they are.
              </li>
              <li>Upload the saved file, check the changes, then update. Prices and product details are never changed.</li>
            </ol>

            <div className="flex flex-wrap gap-2">
              <StockListDownloadButton websiteId={websiteId} onError={setError} />
              <Button onPress={() => inputRef.current?.click()} isPending={checking}>
                <Upload className="size-4" aria-hidden /> {file ? "Choose another file" : "Choose the edited file"}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                aria-label="Stock list"
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
                <p className="text-sm text-ink-body">
                  {preview.changes.length === 0
                    ? "No stock numbers were changed in this file."
                    : `${plural(preview.changes.length, "variant")} will change.`}{" "}
                  {preview.unchanged > 0 && `${plural(preview.unchanged, "row")} left as they were.`}
                </p>
                {preview.issues.length > 0 && (
                  <IssueList
                    title={`${plural(preview.issues.length, "row")} will be skipped. Fix them and upload again if you need them.`}
                    issues={preview.issues}
                  />
                )}
                {moved > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                    <p className="text-sm text-ink-body">
                      {plural(moved, "variant")} sold or restocked after you downloaded the list, so your number may be out of
                      date. They're left as they are unless you tick below.
                    </p>
                    <Checkbox className="mt-2" isSelected={includeChanged} onChange={setIncludeChanged}>
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Label className="text-sm text-ink">Update these too, to the number in my file</Label>
                      </Checkbox.Content>
                    </Checkbox>
                  </div>
                )}
                {preview.changes.length > 0 && <ChangeTable changes={preview.changes} />}
              </>
            )}
          </>
        )}
      </div>
    </CommonModal>
  );
}
