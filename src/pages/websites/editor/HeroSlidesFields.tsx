import type { HeroData } from "../../../site-kit/index.ts";
import { ImageField, ItemList, SelectField } from "./fields.tsx";
import { MEDIA_SIZE } from "./media-dimensions.ts";

const INTERVALS = [
  { value: 3, label: "Every 3 seconds" },
  { value: 5, label: "Every 5 seconds" },
  { value: 7, label: "Every 7 seconds" },
  { value: 10, label: "Every 10 seconds" },
  { value: 0, label: "Don't change automatically" },
];

/** Background slides for the hero's background-image layout: photos that crossfade behind the text. */
export default function HeroSlidesFields({ data, onChange }: { data: HeroData; onChange: (data: HeroData) => void }) {
  if (data.variant !== "background-image" && data.imagePosition !== "background") return null;
  const slides = data.backgroundSlides ?? [];

  return (
    <>
      <ItemList
        label="Background slides"
        items={slides}
        max={8}
        onChange={(backgroundSlides) => onChange({ ...data, backgroundSlides })}
        create={() => ({ url: "", alt: "" })}
        itemTitle={(slide, index) => slide.alt || `Slide ${index + 1}`}
        addLabel="Add slide"
        renderItem={(slide, update) => (
          <ImageField
            label="Photo"
            value={slide}
            onChange={(next) => update(next ?? { url: "", alt: "" })}
            dimensionHint={MEDIA_SIZE.fullBleed}
          />
        )}
      />
      <p className="-mt-1 text-ed-2xs text-ed-muted">
        {slides.length >= 2
          ? "These photos take turns behind the text, with arrows and dots. The background image above is not shown."
          : "Add two or more photos to turn the background into a slider."}
      </p>
      {slides.length >= 2 && (
        <SelectField
          label="Change slide"
          value={data.slideInterval ?? 5}
          options={INTERVALS}
          onChange={(slideInterval) => onChange({ ...data, slideInterval })}
        />
      )}
    </>
  );
}
