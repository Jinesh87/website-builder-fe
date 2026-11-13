import { applyImportedHtmlEdits } from "../../../site-kit/sections/ImportedHtmlSection.tsx";
import type { ImportedHtmlData, ImportedHtmlMediaSlot, ImportedHtmlText } from "../../../site-kit/types.ts";
import { FormGroup, ImageField, TextAreaField, TextField, VideoField } from "./fields.tsx";

type Props = {
  data: ImportedHtmlData;
  onChange: (data: ImportedHtmlData) => void;
};

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

export default function ImportedHtmlForm({ data, onChange }: Props) {
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

  return (
    <div className="space-y-5">
      <TextField
        label="Block name"
        value={data.title || ""}
        onChange={(title) => onChange({ ...data, title: title.trim() || undefined })}
        hint="Only shown in the builder."
      />

      {data.chrome ? (
        <p className="text-sm text-ink-body">
          This is the imported site {data.chrome}. It is placed on every page, so edit it on each page
          where you want the change.
        </p>
      ) : null}

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
    </div>
  );
}
