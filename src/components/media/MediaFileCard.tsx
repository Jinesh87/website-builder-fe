import { Suspense } from "react";
import { Check, FileText, Film } from "lucide-react";
import { formatBytes, isFontFile, type MediaFile } from "../../api/media.ts";
import { lazyWithRetry } from "../../utils/lazy-with-retry.ts";

const FontPreview = lazyWithRetry(() => import("./FontPreview.tsx"), {
  reloadKey: "media_font_preview",
});

type Selection = {
  selected: boolean;
  /** Some file is selected, so clicking a card selects it instead of opening it. */
  active: boolean;
  onToggle: () => void;
};

/** One file in the media grid: preview, name and size, a "Not used" tag, and a tick box for selecting. */
export default function MediaFileCard({
  file,
  onOpen,
  openLabel,
  showClient,
  selection,
}: {
  file: MediaFile;
  onOpen: () => void;
  openLabel: string;
  showClient?: boolean;
  /** Left out in picker mode, where files can't be selected. */
  selection?: Selection;
}) {
  const unused = file.inUse === false;
  const selected = selection?.selected ?? false;
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={selection?.active ? selection.onToggle : onOpen}
        aria-label={selection?.active ? `${selected ? "Unselect" : "Select"} ${file.fileName}` : openLabel}
        className={`flex w-full flex-col overflow-hidden rounded-lg border bg-surface text-left shadow-xs transition hover:border-brand focus-visible:outline-2 focus-visible:outline-brand ${
          selected ? "border-brand ring-2 ring-brand" : unused ? "border-amber-400" : "border-line"
        }`}
      >
        <span className="grid aspect-4/3 place-items-center overflow-hidden bg-canvas">
          {file.kind === "IMAGE" ? (
            <img src={file.url} alt="" loading="lazy" className={`size-full object-cover ${unused && !selected ? "opacity-70" : ""}`} />
          ) : isFontFile(file) ? (
            <Suspense fallback={<span className="text-4xl text-ink">Aa</span>}>
              <FontPreview url={file.url} id={file.id} className="text-4xl text-ink" />
            </Suspense>
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
            {showClient ? ` · ${file.clientName}` : ""}
          </span>
        </span>
      </button>
      {unused && (
        <span
          className="pointer-events-none absolute right-1.5 top-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 shadow-xs"
          title="Not used on any page, site, template or saved section"
        >
          Not used
        </span>
      )}
      {selection && (
        <button
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-label={`Select ${file.fileName}`}
          onClick={selection.onToggle}
          className={`absolute left-1.5 top-1.5 grid size-6 place-items-center rounded-md border shadow-xs transition-opacity ${
            selected
              ? "border-brand bg-brand text-white opacity-100"
              : `border-line bg-surface/95 text-transparent hover:border-brand ${selection.active ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`
          }`}
        >
          <Check className="size-4" aria-hidden />
        </button>
      )}
    </li>
  );
}
