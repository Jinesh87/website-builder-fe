import { useState } from "react";
import { Button } from "@heroui/react";
import { Trash2, X } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { formatBytes, mediaApi, type MediaBulkDeleteResult, type MediaFile } from "../../api/media.ts";
import ConfirmDialog from "../ui/ConfirmDialog.tsx";
import FormAlert from "../ui/FormAlert.tsx";

/** The server deletes at most this many per request. */
const CHUNK = 100;

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

async function deleteAll(ids: string[]): Promise<MediaBulkDeleteResult> {
  const total: MediaBulkDeleteResult = { deleted: 0, freedBytes: 0, kept: [] };
  for (let start = 0; start < ids.length; start += CHUNK) {
    const part = await mediaApi.removeMany(ids.slice(start, start + CHUNK));
    total.deleted += part.deleted;
    total.freedBytes += part.freedBytes;
    total.kept.push(...part.kept);
  }
  return total;
}

/** Bar for selecting files and deleting them together; files still in use are always kept. */
export default function MediaBulkActions({
  selected,
  unusedOnScreen,
  onSelect,
  onClear,
  onDeleted,
}: {
  selected: MediaFile[];
  /** Files shown now that nothing uses, for "Select all not used". */
  unusedOnScreen: MediaFile[];
  onSelect: (files: MediaFile[]) => void;
  onClear: () => void;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<MediaBulkDeleteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inUse = selected.filter((file) => file.inUse === true).length;
  const bytes = selected.reduce((sum, file) => sum + file.sizeBytes, 0);
  const unselectedUnused = unusedOnScreen.filter((file) => !selected.some((chosen) => chosen.id === file.id));

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      const done = await deleteAll(selected.map((file) => file.id));
      setResult(done);
      onDeleted();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (selected.length === 0 && unusedOnScreen.length === 0 && !result && !error) return null;

  return (
    <div className="flex flex-col gap-2">
      {(selected.length > 0 || unselectedUnused.length > 0) && (
        <div
          className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            selected.length > 0 ? "border-brand/40 bg-brand-soft/40" : "border-line bg-surface"
          }`}
        >
          {selected.length > 0 ? (
            <span className="font-medium text-ink">
              {plural(selected.length, "file")} selected <span className="font-normal text-ink-muted">· {formatBytes(bytes)}</span>
            </span>
          ) : (
            <span className="text-ink-muted">
              {plural(unusedOnScreen.length, "file")} shown here {unusedOnScreen.length === 1 ? "isn't" : "aren't"} used anywhere.
            </span>
          )}
          {unselectedUnused.length > 0 && (
            <Button size="sm" variant="outline" onPress={() => onSelect([...selected, ...unselectedUnused])}>
              Select all not used ({unselectedUnused.length})
            </Button>
          )}
          {selected.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="ghost" onPress={onClear}>
                <X className="size-4" aria-hidden /> Clear
              </Button>
              <Button size="sm" variant="danger" onPress={() => setConfirming(true)}>
                <Trash2 className="size-4" aria-hidden /> Delete {plural(selected.length, "file")}
              </Button>
            </div>
          )}
        </div>
      )}

      {error && <FormAlert status="danger">{error}</FormAlert>}
      {result && (
        <FormAlert status={result.kept.length > 0 ? "warning" : "success"}>
          Deleted {plural(result.deleted, "file")}
          {result.freedBytes > 0 ? `, freeing ${formatBytes(result.freedBytes)}` : ""}.
          {result.kept.length > 0 &&
            ` Kept ${plural(result.kept.length, "file")} still in use: ${result.kept
              .slice(0, 5)
              .map((file) => file.fileName)
              .join(", ")}${result.kept.length > 5 ? ` and ${result.kept.length - 5} more` : ""}.`}{" "}
          <button type="button" className="underline" onClick={() => setResult(null)}>
            Dismiss
          </button>
        </FormAlert>
      )}

      <ConfirmDialog
        isOpen={confirming}
        title={`Delete ${plural(selected.length, "file")}?`}
        confirmLabel={`Delete ${plural(selected.length, "file")}`}
        tone="danger"
        isPending={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setConfirming(false)}
      >
        {inUse > 0
          ? `${plural(inUse, "selected file")} ${inUse === 1 ? "is" : "are"} still used on a page, site, template or saved section and will be kept. The others are deleted for good.`
          : "They're deleted for good and can't be brought back. Files still in use are always kept."}
      </ConfirmDialog>
    </div>
  );
}
