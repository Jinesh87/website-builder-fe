import { useEffect } from "react";
import { Button } from "@heroui/react";
import { Check, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import CommonModal from "../ui/CommonModal.tsx";

export type PreviewItem = { url: string; label: string };

type ImagePreviewModalProps = {
  items: PreviewItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Shows a select toggle for the current image when given. */
  isSelected?: (index: number) => boolean;
  onToggleSelect?: (index: number) => void;
};

/** Full-size viewer with previous/next; stacks on top of another modal without closing it. */
export default function ImagePreviewModal({ items, index, onIndexChange, onClose, isSelected, onToggleSelect }: ImagePreviewModalProps) {
  const item = items[index];
  const many = items.length > 1;
  const step = (delta: number) => onIndexChange((index + delta + items.length) % items.length);

  useEffect(() => {
    if (!many) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") onIndexChange((index + 1) % items.length);
      if (event.key === "ArrowLeft") onIndexChange((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [many, index, items.length, onIndexChange]);

  if (!item) return null;
  const selected = isSelected?.(index) ?? false;
  const navButton = "absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-ink shadow-md backdrop-blur transition hover:bg-surface";

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      headerDetails={{
        icon: <Maximize2 className="size-4.5" />,
        title: item.label,
        description: many ? `${index + 1} of ${items.length} · arrow keys to browse` : undefined,
      }}
      iconTone="brand"
      size="lg"
      dialogClassName="w-fit! max-w-[94vw]! min-w-[min(92vw,420px)]"
      modalFooter={
        <div className="flex w-full items-center justify-end gap-2">
          {onToggleSelect && (
            <Button variant={selected ? "primary" : "outline"} onPress={() => onToggleSelect(index)}>
              {selected && <Check className="size-4" aria-hidden />}
              {selected ? "Selected" : "Select"}
            </Button>
          )}
          <Button variant="ghost" onPress={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="relative mx-auto w-fit">
        <img
          src={item.url}
          alt={item.label}
          className="block h-auto max-h-[72vh] w-auto max-w-[calc(94vw-3rem)] rounded-lg border border-line object-contain"
        />
        {many && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => step(-1)} className={`${navButton} left-3`}>
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button type="button" aria-label="Next image" onClick={() => step(1)} className={`${navButton} right-3`}>
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        )}
      </div>
    </CommonModal>
  );
}
