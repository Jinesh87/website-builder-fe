import { useMemo, useState } from "react";
import {
  convertImportedSection,
  extractImportedContent,
  suggestSectionTypes,
  type ConvertibleType,
} from "../../../site-kit/imported-html-convert.ts";
import { SECTION_DEFINITIONS } from "../../../site-kit/registry.ts";
import {
  applyImportedHtmlEdits,
  applyImportedLinkEdit,
  readImportedLinks,
} from "../../../site-kit/sections/ImportedHtmlSection.tsx";
import type {
  ImportedHtmlData,
  ImportedHtmlMediaSlot,
  ImportedHtmlText,
  LinkRef,
  Section,
  SectionOf,
} from "../../../site-kit/types.ts";
import { FormGroup, ImageField, LinkField, SelectField, TextAreaField, TextField, VideoField } from "./fields.tsx";

type Props = {
  section: SectionOf<"imported_html">;
  onChange: (data: ImportedHtmlData) => void;
  /** Swaps this block for a native builder section (same position and id). */
  onReplace: (section: Section) => void;
};

/** Notice + button to swap a section with the version it was converted from/to. */
export function SwitchBackBar({ text, action, onSwitch }: { text: string; action: string; onSwitch: () => void }) {
  return (
    <div className="mb-5 flex flex-col gap-2 rounded-ed-lg border border-ed-accent/30 bg-ed-accent/5 p-3">
      <p className="text-ed-xs text-ed-muted">{text}</p>
      <button
        type="button"
        onClick={onSwitch}
        className="flex w-full items-center justify-center rounded-ed-lg border border-ed-border bg-ed-panel py-2 text-ed-xs font-semibold text-ed-text transition-colors hover:bg-ed-hover"
      >
        {action}
      </button>
    </div>
  );
}

/** Converts the block into one of the builder's own sections, prefilled from its content. */
function ReplaceWithBuilderSection({ section, onReplace }: Pick<Props, "section" | "onReplace">) {
  const suggestions = useMemo(
    () => suggestSectionTypes(extractImportedContent(section.data.html || "")),
    [section.data.html],
  );
  const [type, setType] = useState<ConvertibleType>(suggestions[0] ?? "text");
  const recommended = suggestions.slice(0, 2);

  return (
    <FormGroup
      title="Replace with a builder section"
      description="Uses your site theme's design. The text, images, buttons and cards from this block are copied in so you can keep editing."
    >
      <div className="space-y-3">
        <SelectField<ConvertibleType>
          label="Section type"
          value={type}
          options={suggestions.map((value) => ({
            value,
            label: `${SECTION_DEFINITIONS[value].label}${recommended.includes(value) ? " (suggested)" : ""}`,
          }))}
          onChange={setType}
        />
        <button
          type="button"
          onClick={() => onReplace(convertImportedSection(section, type))}
          className="flex w-full items-center justify-center rounded-ed-lg border border-ed-border bg-ed-panel py-2 text-ed-xs font-semibold text-ed-text transition-colors hover:bg-ed-hover"
        >
          Replace with {SECTION_DEFINITIONS[type].label}
        </button>
        <p className="text-ed-xs text-ed-muted">Undo (Ctrl+Z) brings the imported block back.</p>
      </div>
    </FormGroup>
  );
}

function withSyncedHtml(
  data: ImportedHtmlData,
  texts: ImportedHtmlText[] | undefined,
  mediaSlots: ImportedHtmlMediaSlot[] | undefined,
): ImportedHtmlData {
  const nextTexts = texts ?? data.texts;
  const nextSlots = mediaSlots ?? data.mediaSlots;
  return {
    ...data,
    texts: nextTexts,
    mediaSlots: nextSlots,
    html: applyImportedHtmlEdits(data.html || "", nextTexts, nextSlots),
  };
}

/** Text + media editors for imported markup (blocks and the imported header/footer). */
export function ImportedHtmlFields({ data, onChange }: { data: ImportedHtmlData; onChange: (data: ImportedHtmlData) => void }) {
  const texts = data.texts ?? [];
  const mediaSlots = data.mediaSlots ?? [];

  function updateText(id: string, value: string) {
    const nextTexts = texts.map((item) => (item.id === id ? { ...item, value } : item));
    onChange(withSyncedHtml(data, nextTexts, mediaSlots));
  }

  function updateSlot(key: string, patch: Partial<ImportedHtmlMediaSlot>) {
    const nextSlots = mediaSlots.map((slot) => (slot.key === key ? { ...slot, ...patch } : slot));
    onChange(withSyncedHtml(data, texts, nextSlots));
  }

  const links = useMemo(() => readImportedLinks(data.html || ""), [data.html]);

  function updateLink(index: number, next: LinkRef) {
    const current = links.find((item) => item.index === index);
    const html = applyImportedLinkEdit(data.html || "", index, next);
    // Keep the "Text" entry of a link in step with a label edited here.
    const nextTexts =
      current?.textId && current.hasText
        ? texts.map((item) => (item.id === current.textId ? { ...item, value: next.label } : item))
        : texts;
    onChange({ ...data, html, texts: nextTexts });
  }

  return (
    <>
      {texts.length === 0 && mediaSlots.length === 0 ? (
        <p className="text-sm text-ink-body">
          No editable text or media was extracted from this import. The original layout still
          renders on the canvas.
        </p>
      ) : null}

      {texts.length > 0 ? (
        <FormGroup title="Text">
          <div className="space-y-3">
            {texts.map((item, index) => (
              <TextAreaField
                key={item.id}
                label={item.label || `Text ${index + 1}`}
                value={item.value}
                onChange={(value) => updateText(item.id, value)}
                rows={item.value.length > 120 ? 4 : 2}
              />
            ))}
          </div>
        </FormGroup>
      ) : null}

      {links.length > 0 ? (
        <FormGroup title="Links" description="Where each link or button goes. Pick a page, or enter a web address, phone or email.">
          <div className="space-y-4">
            {links.map((item) => (
              <LinkField
                key={item.index}
                label={item.hasText ? item.link.label.slice(0, 48) : `${item.link.label.slice(0, 40)} (image link)`}
                value={item.link}
                onChange={(next) => updateLink(item.index, next)}
              />
            ))}
          </div>
        </FormGroup>
      ) : null}

      {mediaSlots.length > 0 ? (
        <FormGroup title="Media">
          <div className="space-y-4">
            {mediaSlots.map((slot, index) =>
              slot.kind === "video" ? (
                <VideoField
                  key={slot.key}
                  label={slot.alt ? `Video: ${slot.alt.slice(0, 40)}` : `Video ${index + 1}`}
                  value={slot.url}
                  onChange={(url) => updateSlot(slot.key, { url: url || "" })}
                  optional={false}
                  mode="any"
                />
              ) : (
                <ImageField
                  key={slot.key}
                  label={slot.alt ? `Image: ${slot.alt.slice(0, 40)}` : `Image ${index + 1}`}
                  value={{ url: slot.url, alt: slot.alt || "" }}
                  onChange={(image) =>
                    updateSlot(slot.key, {
                      url: image?.url || "",
                      alt: image?.alt || undefined,
                    })
                  }
                  optional={false}
                />
              ),
            )}
          </div>
        </FormGroup>
      ) : null}
    </>
  );
}

/** Imported site header/footer: edit its text/media, or switch to the builder's own design. */
export function ImportedChromeForm({
  kind,
  data,
  onChange,
  onUseBuilder,
}: {
  kind: "header" | "footer";
  data: ImportedHtmlData;
  onChange: (data: ImportedHtmlData) => void;
  onUseBuilder: () => void;
}) {
  return (
    <div className="space-y-5">
      <FormGroup
        title={`Imported ${kind}`}
        description={`This is your original ${kind}, shared by every page. Switch to a builder ${kind} to use the theme's designs (logo and menu are already filled in).`}
      >
        <button
          type="button"
          onClick={onUseBuilder}
          className="flex w-full items-center justify-center rounded-ed-lg border border-ed-border bg-ed-panel py-2 text-ed-xs font-semibold text-ed-text transition-colors hover:bg-ed-hover"
        >
          Use a builder {kind} instead
        </button>
      </FormGroup>
      <ImportedHtmlFields data={data} onChange={onChange} />
    </div>
  );
}

export default function ImportedHtmlForm({ section, onChange, onReplace }: Props) {
  const data = section.data;
  return (
    <div className="space-y-5">
      {data.chrome ? null : <ReplaceWithBuilderSection section={section} onReplace={onReplace} />}

      <TextField
        label="Block name"
        value={data.title || ""}
        onChange={(title) => onChange({ ...data, title: title.trim() || undefined })}
        hint="Only shown in the builder."
      />

      <ImportedHtmlFields data={data} onChange={onChange} />
    </div>
  );
}
