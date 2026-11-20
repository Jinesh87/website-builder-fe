import { useRef, useState } from "react";
import { Spinner } from "@heroui/react";
import { ImagePlus, Trash2 } from "lucide-react";
import { ACCEPT_BY_KIND, mediaApi, uploadProblem } from "../../../api/media.ts";
import { errorMessage } from "../../../api/http.ts";
import type { ShopImage } from "../../../api/shop.ts";
import { optimizeImageToWebP } from "../../../utils/image-optimizer.ts";
import { MAX_PRODUCT_IMAGES } from "./product-draft.ts";

/** Where product photos are uploaded to, and how the form hears about upload errors and progress. */
export type PhotoUpload = {
  clientId: string;
  websiteId: string;
  onError: (message: string) => void;
  /** Called with true when an upload starts and false when it ends, so the form can wait before saving. */
  onBusy: (busy: boolean) => void;
};

/** A row of product photo thumbnails with an upload tile. */
export default function ImageStrip({
  images,
  onChange,
  upload,
  altText,
  label,
  hint,
  compact = false,
}: {
  images: ShopImage[];
  onChange: (images: ShopImage[]) => void;
  upload: PhotoUpload;
  altText: string;
  label?: string;
  hint?: string;
  compact?: boolean;
}) {
  const { clientId, websiteId, onError, onBusy } = upload;
  const fileRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const [uploading, setUploading] = useState(false);
  const thumb = compact ? "size-14" : "size-24";

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = MAX_PRODUCT_IMAGES - imagesRef.current.length;
    if (room <= 0) {
      onError(`You can add at most ${MAX_PRODUCT_IMAGES} photos.`);
      return;
    }
    setUploading(true);
    onBusy(true);
    const added: ShopImage[] = [];
    try {
      for (const rawFile of Array.from(files).slice(0, room)) {
        const problem = uploadProblem(rawFile, "IMAGE");
        if (problem) {
          onError(problem);
          continue;
        }
        const { file } = await optimizeImageToWebP(rawFile, { quality: 0.88, maxWidth: 1600, maxHeight: 1600 });
        const uploaded = await mediaApi.upload({ file, clientId, websiteId, altText: altText.trim() || rawFile.name });
        added.push({ mediaId: uploaded.id, url: uploaded.url, alt: uploaded.altText ?? "" });
      }
      if (added.length > 0) {
        const next = [...imagesRef.current, ...added].slice(0, MAX_PRODUCT_IMAGES);
        imagesRef.current = next;
        onChange(next);
      }
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setUploading(false);
      onBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className={compact ? "text-xs font-medium text-ink" : "text-sm font-medium text-ink"}>{label}</span>
          {!compact && (
            <span className="text-xs text-ink-muted">
              {images.length} / {MAX_PRODUCT_IMAGES}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <div key={image.mediaId} className={`relative ${thumb} overflow-hidden rounded-lg border border-line`}>
            <img src={image.url} alt={image.alt} className="size-full object-cover" />
            {index === 0 && !compact && (
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">Cover</span>
            )}
            <button
              type="button"
              onClick={() => onChange(images.filter((item) => item.mediaId !== image.mediaId))}
              aria-label="Remove photo"
              className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white"
            >
              <Trash2 className="size-3" aria-hidden />
            </button>
          </div>
        ))}
        {images.length < MAX_PRODUCT_IMAGES && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label={label ? `Add photos for ${label}` : "Add photos"}
            className={`grid ${thumb} place-items-center rounded-lg border border-dashed border-ed-border text-ink-muted hover:border-ed-border-strong hover:text-ink disabled:opacity-50`}
          >
            {uploading ? (
              <Spinner size="sm" aria-label="Uploading photos" />
            ) : compact ? (
              <ImagePlus className="size-4" aria-hidden />
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs">
                <ImagePlus className="size-5" aria-hidden />
                Add photos
              </span>
            )}
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT_BY_KIND.IMAGE}
        multiple
        className="sr-only"
        onChange={(event) => void uploadImages(event.target.files)}
      />
      {hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
