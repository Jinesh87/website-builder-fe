import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Spinner } from "@heroui/react";
import { Check, ImagePlus, Maximize2, Plus, Sparkles, Upload } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { MAX_VARIATIONS, mediaApi, type ImageSample } from "../../api/media.ts";
import { optimizeImageToWebP } from "../../utils/image-optimizer.ts";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";
import ImagePreviewModal from "./ImagePreviewModal.tsx";

type Mode = "save" | "generate";
type Tile = { id: string; file: File; url: string; label: string };

const ORIGINAL_ID = "original";

type ImageUploadDialogProps = {
  file: File;
  clientId?: string;
  websiteId?: string;
  folderId?: string;
  /** Called after at least one image was saved. */
  onSaved: (count: number) => void;
  onClose: () => void;
};

function baseName(file: File): string {
  return file.name.replace(/\.[^/.]+$/, "") || "image";
}

function sampleToFile(sample: ImageSample, name: string): File {
  const bytes = Uint8Array.from(atob(sample.data), (char) => char.charCodeAt(0));
  return new File([bytes], name, { type: sample.mimeType });
}

/** Lets the user save a picked image as is, or generate AI variations of it and save the ones they like. */
export default function ImageUploadDialog({ file, clientId, websiteId, folderId, onSaved, onClose }: ImageUploadDialogProps) {
  const [mode, setMode] = useState<Mode>("save");
  const [count, setCount] = useState(2);
  const [instructions, setInstructions] = useState("");
  const [samples, setSamples] = useState<Tile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewIndex, setViewIndex] = useState<number | null>(null);

  const [originalUrl, setOriginalUrl] = useState("");
  const sampleUrls = useRef<string[]>([]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => () => sampleUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const original: Tile = { id: ORIGINAL_ID, file, url: originalUrl, label: "Original" };
  const busy = generating || saving;
  const showResults = samples.length > 0;
  const tiles = [original, ...samples];

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const { file: source } = await optimizeImageToWebP(file);
      const result = await mediaApi.generateVariations({ file: source, count, instructions: instructions.trim() || undefined, clientId, websiteId });
      const name = baseName(file);
      const added = result.map((sample, index) => {
        const number = samples.length + index + 1;
        const sampleFile = sampleToFile(sample, `${name}-variation-${number}.jpg`);
        const url = URL.createObjectURL(sampleFile);
        sampleUrls.current.push(url);
        return { id: crypto.randomUUID(), file: sampleFile, url, label: `Sample ${number}` };
      });
      setSamples((current) => [...current, ...added]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  async function save(chosen: Tile[]) {
    if (chosen.length === 0) return;
    setSaving(true);
    setError(null);
    const savedIds = new Set<string>();
    try {
      for (const tile of chosen) {
        const { file: upload } = await optimizeImageToWebP(tile.file);
        await mediaApi.upload({ file: upload, clientId, websiteId, folderId });
        savedIds.add(tile.id);
      }
      onSaved(savedIds.size);
    } catch (err) {
      if (savedIds.size > 0) {
        setSamples((current) => current.filter((sample) => !savedIds.has(sample.id)));
        setSelected((current) => new Set([...current].filter((id) => !savedIds.has(id))));
      }
      const prefix = savedIds.size > 0 ? `Saved ${savedIds.size}, then stopped: ` : "";
      setError(prefix + errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const optionCard = (value: Mode, icon: ReactNode, title: string, text: string) => (
    <button
      type="button"
      aria-pressed={mode === value}
      onClick={() => setMode(value)}
      disabled={busy}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
        mode === value ? "border-brand bg-brand-soft/40 ring-2 ring-brand/20" : "border-line bg-surface hover:border-ink-muted/40"
      }`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">{icon}</span>
      <span>
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-muted">{text}</span>
      </span>
    </button>
  );

  const countPicker = (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">Number of samples</span>
      <div className="flex gap-2" role="radiogroup" aria-label="Number of samples">
        {Array.from({ length: MAX_VARIATIONS }, (_, index) => index + 1).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={count === value}
            onClick={() => setCount(value)}
            disabled={busy}
            className={`size-9 rounded-lg border text-sm font-semibold transition-all ${
              count === value ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-ink-muted/40"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );

  const selectedTiles = tiles.filter((tile) => selected.has(tile.id));

  const footer = showResults ? (
    <div className="flex w-full flex-wrap items-center gap-2">
      <Button variant="ghost" onPress={onClose} isDisabled={busy}>
        Cancel
      </Button>
      <div className="ml-auto flex flex-wrap gap-2">
        <Button variant="outline" onPress={() => void save(samples)} isDisabled={busy}>
          Save all samples ({samples.length})
        </Button>
        <Button onPress={() => void save(selectedTiles)} isDisabled={busy || selectedTiles.length === 0} isPending={saving}>
          Save selected ({selectedTiles.length})
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex w-full items-center justify-end gap-2">
      <Button variant="ghost" onPress={onClose} isDisabled={busy}>
        Cancel
      </Button>
      {mode === "save" ? (
        <Button onPress={() => void save([original])} isPending={saving}>
          <Upload className="size-4" aria-hidden /> Save image
        </Button>
      ) : (
        <Button onPress={() => void generate()} isPending={generating}>
          <Sparkles className="size-4" aria-hidden /> Generate {count} {count === 1 ? "sample" : "samples"}
        </Button>
      )}
    </div>
  );

  const viewButton = (index: number, label: string) => (
    <button
      type="button"
      aria-label={`View ${label} full size`}
      title="View full size"
      onClick={() => setViewIndex(index)}
      className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70"
    >
      <Maximize2 className="size-3.5" aria-hidden />
    </button>
  );

  return (
    <>
      <CommonModal
        isOpen
        onClose={() => !busy && onClose()}
        isDismissable={!busy && viewIndex === null}
        headerDetails={{
          icon: <ImagePlus className="size-4.5" />,
          title: showResults ? "Choose samples to save" : "Upload image",
          description: showResults ? "Click an image to select it. Unsaved samples are discarded when you close." : file.name,
        }}
        iconTone="brand"
        size="lg"
        dialogClassName={showResults ? "sm:max-w-4xl!" : ""}
        bodyClassName="max-h-[70vh] overflow-y-auto"
        modalFooter={footer}
      >
        <div className="flex flex-col gap-4">
          {error && <FormAlert status="danger">{error}</FormAlert>}

          {!showResults && (
            <div className="grid gap-4 sm:grid-cols-[13rem_minmax(0,1fr)]">
              <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl border border-line bg-canvas sm:self-start">
                {originalUrl && <img src={originalUrl} alt="Selected" className="max-h-full max-w-full object-contain" />}
                {originalUrl && viewButton(0, "the image")}
              </div>
              <div className="flex flex-col gap-2.5">
                {optionCard("save", <Upload className="size-4" aria-hidden />, "Save this image", "Add it to your library as it is.")}
                {optionCard("generate", <Sparkles className="size-4" aria-hidden />, "Generate images from it", "AI makes new versions; you keep the ones you like.")}
                {mode === "generate" && (
                  <div className="flex flex-col gap-3 rounded-xl border border-line p-3">
                    {countPicker}
                    <TextAreaInput
                      label="Instructions (optional)"
                      name="instructions"
                      value={instructions}
                      onChange={setInstructions}
                      rows={2}
                      placeholder="e.g. Same person in an office with soft daylight"
                      description="Leave empty for close variations."
                      isDisabled={busy}
                    />
                  </div>
                )}
                {generating && (
                  <p className="flex items-center gap-2 text-xs text-ink-muted">
                    <Spinner size="sm" aria-hidden /> Generating… this can take up to a minute.
                  </p>
                )}
              </div>
            </div>
          )}

          {showResults && (
            <>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-ink-muted">{selectedTiles.length} selected</span>
                <button type="button" className="text-brand hover:underline" onClick={() => setSelected(new Set(tiles.map((tile) => tile.id)))}>
                  Select all
                </button>
                {selected.size > 0 && (
                  <button type="button" className="text-ink-muted hover:text-ink hover:underline" onClick={() => setSelected(new Set())}>
                    Clear
                  </button>
                )}
              </div>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {tiles.map((tile, index) => {
                  const isSelected = selected.has(tile.id);
                  return (
                    <li key={tile.id} className="relative">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={`${isSelected ? "Deselect" : "Select"} ${tile.label}`}
                        onClick={() => toggle(tile.id)}
                        disabled={busy}
                        className={`flex w-full flex-col overflow-hidden rounded-lg border-2 bg-surface text-left transition ${
                          isSelected ? "border-brand" : "border-line hover:border-ink-muted/40"
                        }`}
                      >
                        <span className="grid aspect-square place-items-center overflow-hidden bg-canvas">
                          <img src={tile.url} alt="" className="max-h-full max-w-full object-contain" />
                        </span>
                        <span className="px-2 py-1.5 text-xs font-medium text-ink">{tile.label}</span>
                      </button>
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute right-2 top-2 grid size-6 place-items-center rounded-full border-2 ${
                          isSelected ? "border-brand bg-brand text-white" : "border-white bg-black/30 text-transparent"
                        }`}
                      >
                        <Check className="size-3.5" />
                      </span>
                      {viewButton(index, tile.label)}
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-col gap-3 rounded-xl border border-line p-3 sm:flex-row sm:items-end">
                <div className="flex-1">{countPicker}</div>
                <Button variant="outline" onPress={() => void generate()} isPending={generating} isDisabled={saving}>
                  <Plus className="size-4" aria-hidden /> Generate {count} more
                </Button>
              </div>
            </>
          )}
        </div>
      </CommonModal>

      {viewIndex !== null && (
        <ImagePreviewModal
          items={tiles.map((tile) => ({ url: tile.url, label: tile.label }))}
          index={Math.min(viewIndex, tiles.length - 1)}
          onIndexChange={setViewIndex}
          onClose={() => setViewIndex(null)}
          isSelected={showResults ? (index) => selected.has(tiles[index].id) : undefined}
          onToggleSelect={showResults ? (index) => toggle(tiles[index].id) : undefined}
        />
      )}
    </>
  );
}
