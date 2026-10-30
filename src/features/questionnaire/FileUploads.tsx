import { useEffect, useRef, useState, type DragEvent } from "react";
import { Spinner } from "@heroui/react";
import { AlertCircle, FileText, Film, ImagePlus, Upload, X } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import {
  ACCEPT_ANY,
  ACCEPT_BY_KIND,
  formatBytes,
  mediaApi,
  uploadProblem,
  type MediaFile,
} from "../../api/media.ts";
import { MAX_QUESTIONNAIRE_FILES } from "./options.ts";

export type Attachments = { logo: MediaFile | null; files: MediaFile[] };

type Pending = { id: string; name: string; target: "logo" | "files"; error: string | null };

type FileUploadsProps = {
  value: Attachments;
  onChange: (update: (prev: Attachments) => Attachments) => void;
  /** True while any upload is still running, so the form can wait. */
  onBusyChange: (busy: boolean) => void;
  isDark: boolean;
};

let pendingSeq = 0;

export default function FileUploads({ value, onChange, onBusyChange, isDark }: FileUploadsProps) {
  const filesInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);

  const busy = pending.some((item) => item.error === null);
  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);

  const uploadingFiles = pending.filter((item) => item.target === "files" && item.error === null).length;
  const slotsLeft = MAX_QUESTIONNAIRE_FILES - value.files.length - uploadingFiles;

  function addPending(item: Omit<Pending, "id">): string {
    pendingSeq += 1;
    const id = `upload-${pendingSeq}`;
    setPending((prev) => [...prev, { ...item, id }]);
    return id;
  }

  function settle(id: string, error: string | null) {
    setPending((prev) =>
      error === null ? prev.filter((item) => item.id !== id) : prev.map((item) => (item.id === id ? { ...item, error } : item)),
    );
  }

  async function upload(file: File, target: "logo" | "files") {
    const problem = uploadProblem(file, target === "logo" ? "IMAGE" : undefined);
    if (problem) {
      addPending({ name: file.name, target, error: problem });
      return;
    }
    const id = addPending({ name: file.name, target, error: null });
    try {
      const saved = await mediaApi.upload({ file, altText: target === "logo" ? "Logo" : undefined });
      onChange((prev) =>
        target === "logo"
          ? { ...prev, logo: saved }
          : prev.files.length >= MAX_QUESTIONNAIRE_FILES
            ? prev
            : { ...prev, files: [...prev.files, saved] },
      );
      settle(id, null);
    } catch (err) {
      settle(id, errorMessage(err));
    }
  }

  function addFiles(list: FileList | null) {
    const chosen = Array.from(list ?? []);
    const accepted = chosen.slice(0, Math.max(0, slotsLeft));
    for (const file of accepted) void upload(file, "files");
    for (const file of chosen.slice(accepted.length)) {
      addPending({ name: file.name, target: "files", error: `You can attach up to ${MAX_QUESTIONNAIRE_FILES} files.` });
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  const muted = isDark ? "text-slate-400" : "text-ink-muted";
  const strong = isDark ? "text-white" : "text-ink";
  const tile = isDark ? "border-[#242f44] bg-[#0b0e17]" : "border-line bg-canvas";
  const button = isDark
    ? "bg-white text-slate-900 hover:bg-slate-100"
    : "border border-line bg-surface text-ink hover:bg-canvas";
  const logoPending = pending.find((item) => item.target === "logo" && item.error === null);

  return (
    <div className="space-y-4">
      {/* Logo */}
      <div className={`flex items-center gap-3 rounded-xl border p-3 ${tile}`}>
        <div className={`grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border ${tile}`}>
          {value.logo ? (
            <img src={value.logo.url} alt="Your logo" className="size-full object-contain p-1" />
          ) : logoPending ? (
            <Spinner size="sm" />
          ) : (
            <ImagePlus className={`size-5 ${muted}`} aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold ${strong}`}>Logo (optional)</p>
          <p className={`truncate text-[11px] ${muted}`}>
            {value.logo ? value.logo.fileName : "PNG, WebP or JPG · ideally 250 × 60 px"}
          </p>
        </div>
        {value.logo && (
          <button
            type="button"
            onClick={() => onChange((prev) => ({ ...prev, logo: null }))}
            className={`grid size-7 place-items-center rounded-lg ${muted} hover:text-red-500`}
            aria-label="Remove logo"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
        <button
          type="button"
          onClick={() => logoInput.current?.click()}
          disabled={Boolean(logoPending)}
          className={`rounded-lg px-3 py-1 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 ${button}`}
        >
          {value.logo ? "Change" : "Choose"}
        </button>
        <input
          ref={logoInput}
          type="file"
          accept={ACCEPT_BY_KIND.IMAGE}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file, "logo");
          }}
        />
      </div>

      {/* Photos, videos, documents */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (slotsLeft > 0) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex items-center justify-between gap-3 rounded-xl border border-dashed p-4 transition-colors ${
          dragging ? "border-brand bg-brand-soft/30" : tile
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`grid size-9 place-items-center rounded-xl ${
              isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
            }`}
          >
            <Upload className="size-4" aria-hidden />
          </div>
          <div>
            <p className={`text-xs font-bold ${strong}`}>Drop photos, videos or PDFs here</p>
            <p className={`text-[11px] ${muted}`}>
              Images up to 10 MB, videos up to 50 MB · {value.files.length}/{MAX_QUESTIONNAIRE_FILES} added
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => filesInput.current?.click()}
          disabled={slotsLeft <= 0}
          className={`shrink-0 rounded-lg px-3.5 py-1 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 ${button}`}
        >
          Choose
        </button>
        <input
          ref={filesInput}
          type="file"
          multiple
          accept={ACCEPT_ANY}
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {(value.files.length > 0 || pending.some((item) => item.target === "files")) && (
        <ul className="grid grid-cols-4 gap-2">
          {value.files.map((file) => (
            <li key={file.id} className={`group relative aspect-square overflow-hidden rounded-lg border ${tile}`}>
              {file.kind === "IMAGE" ? (
                <img src={file.url} alt={file.altText ?? file.fileName} className="size-full object-cover" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1 p-1 text-center">
                  {file.kind === "VIDEO" ? (
                    <Film className={`size-5 ${muted}`} aria-hidden />
                  ) : (
                    <FileText className={`size-5 ${muted}`} aria-hidden />
                  )}
                  <span className={`w-full truncate text-[10px] ${muted}`}>{file.fileName}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onChange((prev) => ({ ...prev, files: prev.files.filter((f) => f.id !== file.id) }))}
                className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label={`Remove ${file.fileName}`}
                title={`${file.fileName} · ${formatBytes(file.sizeBytes)}`}
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
          {pending
            .filter((item) => item.target === "files" && item.error === null)
            .map((item) => (
              <li
                key={item.id}
                className={`grid aspect-square place-items-center rounded-lg border ${tile}`}
                title={item.name}
              >
                <Spinner size="sm" />
              </li>
            ))}
        </ul>
      )}

      {pending.some((item) => item.error) && (
        <ul className="space-y-1">
          {pending
            .filter((item) => item.error)
            .map((item) => (
              <li key={item.id} className="flex items-start gap-1.5 text-[11px] text-red-500">
                <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
                <span className="flex-1">
                  {item.name}: {item.error}
                </span>
                <button
                  type="button"
                  onClick={() => setPending((prev) => prev.filter((p) => p.id !== item.id))}
                  className="shrink-0 underline"
                >
                  Dismiss
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
