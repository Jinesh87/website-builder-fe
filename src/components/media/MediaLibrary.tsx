import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { Button, SearchField, Spinner } from "@heroui/react";
import { AlertCircle, CheckCircle2, FileText, Film, Folder, FolderPlus, Images, Pencil, Trash2, Upload, X } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import {
  ACCEPT_ANY,
  ACCEPT_BY_KIND,
  formatBytes,
  kindOfFile,
  mediaApi,
  uploadProblem,
  type MediaFile,
  type MediaFolder,
  type MediaKind,
  type StorageUsage,
} from "../../api/media.ts";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import SaveNameDialog from "../../pages/websites/editor/SaveNameDialog.tsx";
import ConfirmDialog from "../ui/ConfirmDialog.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../ui/SelectInput.tsx";
import { optimizeImageToWebP } from "../../utils/image-optimizer.ts";
import MediaDeleteDialog from "./MediaDeleteDialog.tsx";
import ImageUploadDialog from "./ImageUploadDialog.tsx";
import MediaDetailsDialog from "./MediaDetailsDialog.tsx";

const PAGE_SIZE = 24;

const KIND_OPTIONS: SelectOption<MediaKind | "">[] = [
  { value: "", label: "All types" },
  { value: "IMAGE", label: "Images" },
  { value: "VIDEO", label: "Videos" },
  { value: "DOCUMENT", label: "Documents" },
];

type UploadItem = { key: string; name: string; status: "uploading" | "done" | "error"; message?: string };
type FolderDialog = { mode: "create" } | { mode: "rename"; folder: MediaFolder };

type MediaLibraryProps = {
  /** Workspace to show. Clients pass nothing (the server uses theirs); Super Admin passes a client or nothing to browse all. */
  clientId?: string;
  /** Super Admin must pick a client before uploading or managing folders. */
  requiresClient?: boolean;
  /** Uploads are tagged with this website. */
  websiteId?: string;
  /** Picker mode: clicking a file picks it instead of opening its details. */
  onPick?: (file: MediaFile) => void;
  /** Restricts the list and uploads to one kind (e.g. images for an image field). */
  onlyKind?: MediaKind;
};

export default function MediaLibrary({ clientId, requiresClient = false, websiteId, onPick, onlyKind }: MediaLibraryProps) {
  const canManage = !requiresClient || Boolean(clientId);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<MediaKind | "">(onlyKind ?? "");
  const [folderFilter, setFolderFilter] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MediaFile | null>(null);
  const [folderDialog, setFolderDialog] = useState<FolderDialog | null>(null);
  const [pendingFolderDelete, setPendingFolderDelete] = useState<MediaFolder | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await mediaApi.list({
          clientId,
          kind: kind || undefined,
          folderId: folderFilter || undefined,
          search: debouncedSearch,
          page: nextPage,
          pageSize: PAGE_SIZE,
        });
        setFiles((current) => (nextPage === 1 ? result.files : [...current, ...result.files]));
        setTotal(result.total);
        setUsage(result.usage);
        setPage(nextPage);
      } catch (err) {
        setLoadError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [clientId, kind, folderFilter, debouncedSearch],
  );

  const loadFolders = useCallback(async () => {
    if (!canManage) {
      setFolders([]);
      return;
    }
    try {
      setFolders(await mediaApi.folders(clientId));
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }, [canManage, clientId]);

  useEffect(() => {
    void load(1);
  }, [load]);

  useEffect(() => {
    setFolderFilter("");
    void loadFolders();
  }, [loadFolders]);

  const uploadFolderId = folderFilter && folderFilter !== "none" ? folderFilter : undefined;

  async function uploadFiles(list: FileList | File[]) {
    if (!canManage) return;
    const chosen = [...list];
    const [single] = chosen;
    // Animated GIFs can't be used as a source for AI variations, so they upload directly.
    if (chosen.length === 1 && kindOfFile(single) === "IMAGE" && single.type !== "image/gif" && !uploadProblem(single, onlyKind)) {
      setPendingImage(single);
      return;
    }
    const items: UploadItem[] = chosen.map((file) => ({ key: crypto.randomUUID(), name: file.name, status: "uploading" }));
    setUploads((current) => [...items, ...current.filter((item) => item.status === "uploading")]);

    let added = 0;
    for (const [index, file] of chosen.entries()) {
      const { key } = items[index];
      const problem = uploadProblem(file, onlyKind);
      const finish = (patch: Partial<UploadItem>) =>
        setUploads((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
      if (problem) {
        finish({ status: "error", message: problem });
        continue;
      }
      try {
        const { file: fileToUpload } = await optimizeImageToWebP(file);
        await mediaApi.upload({
          file: fileToUpload,
          clientId,
          websiteId,
          folderId: uploadFolderId,
        });
        added++;
        finish({ status: "done" });
      } catch (err) {
        finish({ status: "error", message: `${file.name}: ${errorMessage(err)}` });
      }
    }
    if (added > 0) {
      await Promise.all([load(1), loadFolders()]);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) void uploadFiles(event.dataTransfer.files);
  }

  async function afterDelete() {
    setPendingDelete(null);
    setSelected(null);
    await Promise.all([load(1), loadFolders()]);
  }

  async function saveFolder({ name }: { name: string }) {
    if (!folderDialog) return;
    if (folderDialog.mode === "create") {
      const folder = await mediaApi.createFolder(name, clientId);
      setFolderFilter(folder.id);
    } else {
      await mediaApi.renameFolder(folderDialog.folder.id, name);
    }
    setFolderDialog(null);
    await loadFolders();
  }

  async function confirmFolderDelete() {
    const folder = pendingFolderDelete;
    if (!folder) return;
    setPendingFolderDelete(null);
    try {
      await mediaApi.deleteFolder(folder.id);
      if (folderFilter === folder.id) setFolderFilter("");
      await Promise.all([loadFolders(), load(1)]);
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  const accept = onlyKind ? ACCEPT_BY_KIND[onlyKind] : ACCEPT_ANY;
  const hasFilters = Boolean(debouncedSearch || (kind && !onlyKind) || folderFilter);
  const folderButton = (value: string, label: string, count?: number) => (
    <button
      type="button"
      onClick={() => setFolderFilter(value)}
      aria-pressed={folderFilter === value}
      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
        folderFilter === value ? "bg-brand-soft font-medium text-brand" : "text-ink-body hover:bg-canvas"
      }`}
    >
      <Folder className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && <span className="text-xs text-ink-muted">{count}</span>}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField aria-label="Search media" value={search} onChange={setSearch} className="w-full max-w-xs">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by name or alt text" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        {!onlyKind && <SelectInput ariaLabel="Filter by type" value={kind} onChange={setKind} options={KIND_OPTIONS} />}
        {loading && files.length > 0 && <Spinner size="sm" aria-label="Updating" />}
        <div className="ml-auto flex items-center gap-3">
          {usage && (
            <div className="w-40 text-xs text-ink-muted" title="Storage used">
              <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, (usage.usedBytes / usage.limitBytes) * 100)}%` }} />
              </div>
              {formatBytes(usage.usedBytes)} of {formatBytes(usage.limitBytes)} used
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              if (event.target.files) void uploadFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <Button onPress={() => inputRef.current?.click()} isDisabled={!canManage}>
            <Upload className="size-4" aria-hidden /> Upload
          </Button>
        </div>
      </div>

      {requiresClient && !clientId && <FormAlert status="warning">Choose a client to upload files or manage folders. Showing files from all clients.</FormAlert>}
      {loadError && <FormAlert status="danger">{loadError}</FormAlert>}
      {actionError && (
        <FormAlert status="danger">
          {actionError}{" "}
          <button type="button" className="underline" onClick={() => setActionError(null)}>
            Dismiss
          </button>
        </FormAlert>
      )}

      {uploads.length > 0 && (
        <ul aria-label="Uploads" className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-2 text-sm">
          {uploads.map((item) => (
            <li key={item.key} className="flex items-center gap-2 px-1">
              {item.status === "uploading" && <Spinner size="sm" aria-label="Uploading" />}
              {item.status === "done" && <CheckCircle2 className="size-4 text-ed-success" aria-hidden />}
              {item.status === "error" && <AlertCircle className="size-4 text-ed-danger" aria-hidden />}
              <span className={`min-w-0 flex-1 truncate ${item.status === "error" ? "text-ed-danger" : "text-ink-body"}`}>
                {item.status === "error" ? item.message : item.status === "done" ? `${item.name} uploaded` : `Uploading ${item.name}…`}
              </span>
            </li>
          ))}
          {uploads.every((item) => item.status !== "uploading") && (
            <li>
              <button type="button" onClick={() => setUploads([])} className="flex items-center gap-1 px-1 text-xs text-ink-muted hover:text-ink">
                <X className="size-3" aria-hidden /> Clear
              </button>
            </li>
          )}
        </ul>
      )}

      <div className="flex flex-col gap-4 md:flex-row">
        {canManage && (
          <nav aria-label="Folders" className="flex shrink-0 flex-col gap-0.5 md:w-52">
            {folderButton("", "All files")}
            {folderButton("none", "Not in a folder")}
            {folders.map((folder) => (
              <div key={folder.id} className="group relative">
                {folderButton(folder.id, folder.name, folder.fileCount)}
                {!onPick && (
                  <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 gap-0.5 group-focus-within:flex group-hover:flex">
                    <button
                      type="button"
                      aria-label={`Rename folder ${folder.name}`}
                      onClick={() => setFolderDialog({ mode: "rename", folder })}
                      className="grid size-6 place-items-center rounded bg-surface text-ink-muted hover:text-ink"
                    >
                      <Pencil className="size-3" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete folder ${folder.name}`}
                      onClick={() => setPendingFolderDelete(folder)}
                      className="grid size-6 place-items-center rounded bg-surface text-ink-muted hover:text-ed-danger"
                    >
                      <Trash2 className="size-3" aria-hidden />
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFolderDialog({ mode: "create" })}
              className="mt-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-brand hover:bg-brand-soft"
            >
              <FolderPlus className="size-4" aria-hidden /> New folder
            </button>
          </nav>
        )}

        <div
          className={`min-w-0 flex-1 rounded-xl border-2 border-dashed p-3 transition-colors ${dragging ? "border-brand bg-brand-soft/40" : "border-transparent"}`}
          onDragOver={(event) => {
            if (!canManage) return;
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {files.length === 0 && loading ? (
            <div className="grid place-items-center py-16">
              <Spinner aria-label="Loading media" />
            </div>
          ) : files.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
                <Images className="size-6" aria-hidden />
              </span>
              <h2 className="mt-4 text-base font-semibold text-ink">{hasFilters ? "No files match" : "No files yet"}</h2>
              <p className="mt-1 text-sm text-ink-body">
                {hasFilters ? "Try a different search, type or folder." : canManage ? "Upload files or drag them here." : "Files appear here when clients upload them."}
              </p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {files.map((file) => (
                  <li key={file.id}>
                    <button
                      type="button"
                      onClick={() => (onPick ? onPick(file) : setSelected(file))}
                      aria-label={onPick ? `Use ${file.fileName}` : `Open ${file.fileName}`}
                      className="group flex w-full flex-col overflow-hidden rounded-lg border border-line bg-surface text-left shadow-xs transition hover:border-brand focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <span className="grid aspect-4/3 place-items-center overflow-hidden bg-canvas">
                        {file.kind === "IMAGE" ? (
                          <img src={file.url} alt="" loading="lazy" className="size-full object-cover" />
                        ) : file.kind === "VIDEO" ? (
                          <Film className="size-8 text-ink-muted" aria-hidden />
                        ) : (
                          <FileText className="size-8 text-ink-muted" aria-hidden />
                        )}
                      </span>
                      <span className="flex flex-col px-2 py-1.5">
                        <span className="truncate text-sm font-medium text-ink">{file.fileName}</span>
                        <span className="truncate text-xs text-ink-muted">
                          {formatBytes(file.sizeBytes)}
                          {file.width && file.height ? ` · ${file.width}×${file.height}` : ""}
                          {requiresClient && !clientId ? ` · ${file.clientName}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {files.length < total && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onPress={() => void load(page + 1)} isPending={loading}>
                    Load more ({total - files.length} left)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selected && (
        <MediaDetailsDialog
          key={selected.id}
          file={selected}
          folders={folders}
          onSaved={(updated) => {
            setSelected(null);
            setFiles((current) => current.map((file) => (file.id === updated.id ? updated : file)));
            if (updated.folderId !== selected.folderId) void Promise.all([load(1), loadFolders()]);
          }}
          onDelete={(file) => {
            setSelected(null);
            setPendingDelete(file);
          }}
          onClose={() => setSelected(null)}
        />
      )}
      {pendingImage && (
        <ImageUploadDialog
          file={pendingImage}
          clientId={clientId}
          websiteId={websiteId}
          folderId={uploadFolderId}
          onSaved={() => {
            setPendingImage(null);
            void Promise.all([load(1), loadFolders()]);
          }}
          onClose={() => setPendingImage(null)}
        />
      )}
      {pendingDelete && (
        <MediaDeleteDialog
          key={pendingDelete.id}
          file={pendingDelete}
          onDeleted={() => void afterDelete()}
          onClose={() => setPendingDelete(null)}
        />
      )}
      {folderDialog && (
        <SaveNameDialog
          isOpen
          title={folderDialog.mode === "create" ? "New folder" : "Rename folder"}
          intro={folderDialog.mode === "create" ? "Group files, for example “Logos” or “Product photos”." : "Files in the folder stay where they are."}
          defaultName={folderDialog.mode === "create" ? "" : folderDialog.folder.name}
          submitLabel={folderDialog.mode === "create" ? "Create folder" : "Rename"}
          onSubmit={saveFolder}
          onClose={() => setFolderDialog(null)}
        />
      )}
      <ConfirmDialog
        isOpen={pendingFolderDelete !== null}
        title={`Delete folder “${pendingFolderDelete?.name ?? ""}”?`}
        confirmLabel="Delete folder"
        tone="danger"
        onConfirm={() => void confirmFolderDelete()}
        onCancel={() => setPendingFolderDelete(null)}
      >
        The files inside are kept and moved to “Not in a folder”.
      </ConfirmDialog>
    </div>
  );
}
