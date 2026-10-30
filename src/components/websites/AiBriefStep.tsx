import { Suspense, useState, type KeyboardEvent } from "react";
import { Button } from "@heroui/react";
import { ImagePlus, Lock, Plus, X } from "lucide-react";
import type { MediaFile } from "../../api/media.ts";
import {
  GENERATION_TONES,
  MAX_BRIEF_IMAGES,
  MAX_GENERATED_PAGES,
  type GenerationTone,
  type ThemeOption,
} from "../../api/websites.ts";
import { lazyWithRetry } from "../../utils/lazy-with-retry.ts";

const MediaPickerDialog = lazyWithRetry(
  () => import("../media/MediaPickerDialog.tsx"),
  { reloadKey: "aibrief_media_picker" },
);
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../ui/SelectInput.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";

export type BriefMedia = Pick<MediaFile, "id" | "url" | "fileName" | "altText">;

export type AiBrief = {
  prompt: string;
  /** Extra pages after Home, in nav order. */
  pages: string[];
  tone: GenerationTone | "";
  /** Empty = let the AI pick the colours. */
  themeId: string;
  images: BriefMedia[];
  logo: BriefMedia | null;
};

export type AiBriefErrors = Partial<Record<"prompt" | "pages", string>>;

export const EMPTY_AI_BRIEF: AiBrief = {
  prompt: "",
  pages: ["About", "Services", "Contact"],
  tone: "",
  themeId: "",
  images: [],
  logo: null,
};

export const MIN_PROMPT_LENGTH = 20;
const MAX_PROMPT_LENGTH = 2000;
const SUGGESTED_PAGES = ["About", "Services", "Contact", "Pricing", "FAQ", "Team", "Portfolio", "Testimonials"];

export function validateAiBrief(brief: AiBrief): AiBriefErrors {
  const errors: AiBriefErrors = {};
  const length = brief.prompt.trim().length;
  if (length < MIN_PROMPT_LENGTH) errors.prompt = `Describe your website in at least ${MIN_PROMPT_LENGTH} characters`;
  if (length > MAX_PROMPT_LENGTH) errors.prompt = `Keep the description under ${MAX_PROMPT_LENGTH} characters`;
  if (brief.pages.length + 1 > MAX_GENERATED_PAGES) errors.pages = `Choose at most ${MAX_GENERATED_PAGES} pages`;
  return errors;
}

const TONE_OPTIONS: SelectOption<GenerationTone | "">[] = [
  { value: "", label: "Let AI decide" },
  ...GENERATION_TONES.map((tone) => ({ value: tone, label: tone.charAt(0).toUpperCase() + tone.slice(1) })),
];

type AiBriefStepProps = {
  brief: AiBrief;
  onChange: (brief: AiBrief) => void;
  errors: AiBriefErrors;
  themes: ThemeOption[] | null;
  /** Library owner; the picker is disabled until it's known. */
  mediaClientId: string;
};

type PickerTarget = "image" | "logo" | null;

export default function AiBriefStep({ brief, onChange, errors, themes, mediaClientId }: AiBriefStepProps) {
  const [customPage, setCustomPage] = useState("");
  const [picker, setPicker] = useState<PickerTarget>(null);
  const pageCount = brief.pages.length + 1;
  const pagesFull = pageCount >= MAX_GENERATED_PAGES;

  function set<K extends keyof AiBrief>(key: K, value: AiBrief[K]) {
    onChange({ ...brief, [key]: value });
  }

  function hasPage(name: string): boolean {
    const lower = name.trim().toLowerCase();
    return lower === "home" || brief.pages.some((page) => page.toLowerCase() === lower);
  }

  function togglePage(name: string) {
    if (hasPage(name)) set("pages", brief.pages.filter((page) => page.toLowerCase() !== name.toLowerCase()));
    else if (!pagesFull) set("pages", [...brief.pages, name]);
  }

  function addCustomPage() {
    const name = customPage.trim().slice(0, 60);
    if (!name || hasPage(name) || pagesFull) return;
    set("pages", [...brief.pages, name]);
    setCustomPage("");
  }

  function onCustomKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomPage();
    }
  }

  function pick(file: MediaFile) {
    if (picker === "logo") set("logo", file);
    else if (!brief.images.some((image) => image.id === file.id) && brief.images.length < MAX_BRIEF_IMAGES) {
      set("images", [...brief.images, file]);
    }
    setPicker(null);
  }

  const customPages = brief.pages.filter((page) => !SUGGESTED_PAGES.some((name) => name.toLowerCase() === page.toLowerCase()));

  return (
    <div className="space-y-8">
      <div>
        <TextAreaInput
          label="Describe your website"
          name="prompt"
          value={brief.prompt}
          onChange={(value) => set("prompt", value)}
          error={errors.prompt}
          rows={5}
          placeholder="e.g. A cosy neighbourhood bakery in Colombo. We bake sourdough and pastries every morning, take cake orders for events and want customers to visit or call to order."
          description={`What you do, who it's for and what visitors should do. ${brief.prompt.trim().length}/${MAX_PROMPT_LENGTH}`}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink">Pages</h3>
        <p className="mt-0.5 text-sm text-ink-body">
          Up to {MAX_GENERATED_PAGES} pages. You can add, rename or remove pages in the editor later.
        </p>
        <div role="group" aria-label="Pages" className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-sm text-white">
            <Lock className="size-3" aria-hidden /> Home
          </span>
          {[...SUGGESTED_PAGES, ...customPages].map((name) => {
            const selected = hasPage(name);
            return (
              <button
                key={name}
                type="button"
                aria-pressed={selected}
                disabled={!selected && pagesFull}
                onClick={() => togglePage(name)}
                className={`rounded-full px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected ? "bg-brand text-white" : "bg-canvas text-ink-body hover:text-ink"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex max-w-sm gap-2">
          <input
            aria-label="Custom page name"
            value={customPage}
            onChange={(event) => setCustomPage(event.target.value)}
            onKeyDown={onCustomKey}
            maxLength={60}
            disabled={pagesFull}
            placeholder="Another page, e.g. Menu"
            className="h-9 flex-1 rounded-lg border border-ed-border bg-surface px-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15 disabled:bg-canvas"
          />
          <Button size="sm" variant="outline" onPress={addCustomPage} isDisabled={!customPage.trim() || pagesFull}>
            <Plus className="size-4" aria-hidden /> Add
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          {pageCount} of {MAX_GENERATED_PAGES} pages: Home{brief.pages.length > 0 ? `, ${brief.pages.join(", ")}` : ""}
        </p>
        {errors.pages && <p className="mt-1 text-xs text-ed-danger">{errors.pages}</p>}
      </div>

      <div className="max-w-xs">
        <SelectInput label="Tone of voice" value={brief.tone} onChange={(value) => set("tone", value)} options={TONE_OPTIONS} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink">Images</h3>
        <p className="mt-0.5 text-sm text-ink-body">
          Pick photos from your media library; the AI places them in the right sections. Without images, sections are
          text-only and you can add pictures later.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {brief.images.map((image) => (
            <figure key={image.id} className="relative size-24 overflow-hidden rounded-lg border border-line bg-canvas">
              <img src={image.url} alt={image.altText ?? image.fileName} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => set("images", brief.images.filter((candidate) => candidate.id !== image.id))}
                aria-label={`Remove ${image.fileName}`}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </figure>
          ))}
          {brief.images.length < MAX_BRIEF_IMAGES && (
            <button
              type="button"
              onClick={() => setPicker("image")}
              onMouseEnter={() => void MediaPickerDialog.preload()}
              onFocus={() => void MediaPickerDialog.preload()}
              disabled={!mediaClientId}
              className="grid size-24 place-items-center rounded-lg border-2 border-dashed border-line-strong text-ink-body hover:border-brand hover:text-brand disabled:opacity-50"
            >
              <span className="flex flex-col items-center gap-1 text-xs">
                <ImagePlus className="size-5" aria-hidden /> Add image
              </span>
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          {brief.images.length} of {MAX_BRIEF_IMAGES} images. Alt text from the library helps the AI place them.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {brief.logo ? (
              <figure className="relative h-12 w-24 overflow-hidden rounded-lg border border-line bg-canvas">
                <img src={brief.logo.url} alt={brief.logo.altText ?? "Logo"} className="size-full object-contain p-1" />
                <button
                  type="button"
                  onClick={() => set("logo", null)}
                  aria-label="Remove logo"
                  className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </figure>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              onPress={() => setPicker("logo")}
              onMouseEnter={() => void MediaPickerDialog.preload()}
              onFocus={() => void MediaPickerDialog.preload()}
              isDisabled={!mediaClientId}
            >
              {brief.logo ? "Change logo" : "Choose a logo (optional)"}
            </Button>
          </div>
          <p className="text-xs text-ink-muted">
            <span className="font-medium text-ink">Recommended logo dimensions:</span> <b>200 × 50 px</b> to <b>250 × 60 px</b> (horizontal, aspect ratio ~4:1 or 5:1, transparent PNG / SVG / WebP).
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink">Colour style</h3>
        <p className="mt-0.5 text-sm text-ink-body">Let the AI match colours and fonts to your business, or pick a style.</p>
        <div role="radiogroup" aria-label="Colour style" className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <button
            type="button"
            role="radio"
            aria-checked={brief.themeId === ""}
            onClick={() => set("themeId", "")}
            className={`rounded-lg border-2 p-3 text-left transition-colors ${
              brief.themeId === "" ? "border-brand" : "border-line hover:border-line-strong"
            }`}
          >
            <span className="grid h-14 place-items-center rounded-md border border-dashed border-line-strong text-xs text-ink-body">
              Chosen by AI
            </span>
            <span className="mt-2 block text-sm font-medium text-ink">Let AI choose</span>
          </button>
          {(themes ?? []).map((theme) => {
            const selected = theme.id === brief.themeId;
            const { colors } = theme.settings;
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set("themeId", theme.id)}
                className={`rounded-lg border-2 p-3 text-left transition-colors ${
                  selected ? "border-brand" : "border-line hover:border-line-strong"
                }`}
              >
                <span
                  className="flex h-14 items-end gap-1.5 rounded-md border border-black/5 p-2"
                  style={{ background: colors.background }}
                  aria-hidden
                >
                  <span className="h-6 w-10 rounded" style={{ background: colors.primary }} />
                  <span className="h-4 w-6 rounded" style={{ background: colors.secondary }} />
                  <span className="h-3 flex-1 rounded" style={{ background: colors.surface }} />
                </span>
                <span className="mt-2 block text-sm font-medium text-ink">{theme.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!mediaClientId && <FormAlert status="warning">Choose a client in Website info to use their media library.</FormAlert>}

      {picker && mediaClientId && (
        <Suspense fallback={null}>
          <MediaPickerDialog clientId={mediaClientId} kind="IMAGE" onPick={pick} onClose={() => setPicker(null)} />
        </Suspense>
      )}
    </div>
  );
}
