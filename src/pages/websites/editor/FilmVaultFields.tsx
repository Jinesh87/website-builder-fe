import type { CardItem, CardsData, CardsVariant } from "../../../site-kit/index.ts";
import {
  CheckboxField,
  ColorField,
  CommaListField,
  FormGroup,
  ImageField,
  ItemList,
  OptionalLinkField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields.tsx";
import { cardImageSize } from "./media-dimensions.ts";

type Props = {
  data: CardsData;
  onChange: (data: CardsData) => void;
};

const VARIANT_OPTIONS: { value: CardsVariant; label: string }[] = [
  { value: "film-vault", label: "Film reel vault (35mm strip)" },
  { value: "product-classic", label: "Product classic" },
  { value: "polaroid-grid", label: "Polaroid grid" },
  { value: "floating-icon", label: "Floating icon badge" },
  { value: "image-overlay", label: "Image overlay" },
  { value: "horizontal-split", label: "Horizontal split" },
  { value: "minimal-accent", label: "Minimal accent" },
  { value: "floating-panel", label: "Floating panel" },
  { value: "dos-donts", label: "Do's & Don'ts" },
];

const TIMECODE_MODE_OPTIONS: { value: "live" | "static"; label: string }[] = [
  { value: "live", label: "Live (24fps)" },
  { value: "static", label: "Static" },
];

export default function FilmVaultFields({ data, onChange }: Props) {
  const set = (patch: Partial<CardsData>) => onChange({ ...data, ...patch });

  const headingWords = (data.heading || "OUR WORK").trim().split(/\s+/);
  const defaultSolid = headingWords[0] || "OUR";
  const defaultOutline = headingWords.slice(1).join(" ") || "WORK";

  const solidHeading = data.solidHeading !== undefined ? data.solidHeading : defaultSolid;
  const outlineHeading = data.outlineHeading !== undefined ? data.outlineHeading : defaultOutline;

  return (
    <>
      <FormGroup title="Design">
        <SelectField<CardsVariant>
          label="Card design"
          value={data.variant ?? "film-vault"}
          options={VARIANT_OPTIONS}
          onChange={(value) => set({ variant: value })}
        />
      </FormGroup>

      <FormGroup title="Title & Typography">
        <TextField
          label="Eyebrow"
          value={data.eyebrow ?? "PORTFOLIO"}
          onChange={(eyebrow) => set({ eyebrow: eyebrow || undefined })}
          placeholder="PORTFOLIO"
          maxLength={100}
        />
        <div className="grid grid-cols-2 gap-2 items-start">
          <TextField
            label="Solid word"
            value={solidHeading}
            onChange={(val) => {
              set({
                solidHeading: val,
                heading: `${val} ${outlineHeading}`.trim(),
              });
            }}
            placeholder="OUR"
            maxLength={60}
          />
          <TextField
            label="Outline word"
            value={outlineHeading}
            onChange={(val) => {
              set({
                outlineHeading: val,
                heading: `${solidHeading} ${val}`.trim(),
              });
            }}
            placeholder="WORK"
            maxLength={60}
          />
        </div>
        <TextAreaField
          label="Intro description"
          value={
            data.intro ??
            "Music videos, brand films, weddings and short films. Swipe the strip and press play on any frame."
          }
          onChange={(intro) => set({ intro: intro || undefined })}
          maxLength={500}
        />
      </FormGroup>

      <FormGroup title="Camera HUD & Status">
        <CheckboxField
          label="Enable REC status badge"
          checked={data.showRecBadge !== false}
          onChange={(showRecBadge) => set({ showRecBadge })}
        />
        {data.showRecBadge !== false && (
          <div className="flex flex-col gap-2.5">
            <TextField
              label="REC text"
              value={data.recText ?? "REC - NOW SHOWING"}
              onChange={(recText) => set({ recText: recText || undefined })}
              placeholder="REC - NOW SHOWING"
              maxLength={40}
            />
            <ColorField
              label="REC color"
              value={data.recColor || "#FF3333"}
              onChange={(recColor) => set({ recColor: recColor || undefined })}
              fallback="#FF3333"
            />
          </div>
        )}
      </FormGroup>

      <FormGroup title="Digital Timecode">
        <div className="grid grid-cols-2 gap-2 items-start">
          <SelectField<"live" | "static">
            label="Timecode mode"
            value={data.timecodeMode ?? "live"}
            options={TIMECODE_MODE_OPTIONS}
            onChange={(timecodeMode) => set({ timecodeMode })}
          />
          <TextField
            label="Timecode value"
            value={data.timecode ?? "00:00:45:14"}
            onChange={(timecode) => set({ timecode: timecode || undefined })}
            placeholder="00:00:45:14"
            maxLength={16}
          />
        </div>
        <ColorField
          label="Timecode color"
          value={data.timecodeColor || "#FF3333"}
          onChange={(timecodeColor) => set({ timecodeColor: timecodeColor || undefined })}
          fallback="#FF3333"
        />
      </FormGroup>

      <FormGroup title="Category Filter Tabs">
        <CheckboxField
          label="Enable filter tabs"
          checked={data.showCategories !== false}
          onChange={(showCategories) => set({ showCategories })}
        />
        {data.showCategories !== false && (
          <CommaListField
            label="Categories"
            value={
              data.categories ?? [
                "ALL",
                "MUSIC VIDEOS",
                "BRAND FILMS",
                "WEDDINGS & EVENTS",
                "SHORT FILMS",
              ]
            }
            onChange={(categories) => set({ categories })}
            maxLength={400}
            hint="Films matching category in their subtitle are filtered."
          />
        )}
      </FormGroup>

      <FormGroup title="35mm Filmstrip Reel">
        <CheckboxField
          label="Show 35mm film sprocket holes"
          checked={data.showSprockets !== false}
          onChange={(showSprockets) => set({ showSprockets })}
        />
        <div className="grid grid-cols-2 gap-2 items-start">
          <TextField
            label="Frame width (px)"
            type="number"
            value={String(data.filmCardWidth ?? 380)}
            onChange={(raw) => {
              const num = parseInt(raw, 10);
              set({ filmCardWidth: isNaN(num) ? undefined : Math.max(260, Math.min(640, num)) });
            }}
          />
          <TextField
            label="Frame height (px)"
            type="number"
            value={String(data.filmCardHeight ?? 240)}
            onChange={(raw) => {
              const num = parseInt(raw, 10);
              set({ filmCardHeight: isNaN(num) ? undefined : Math.max(160, Math.min(480, num)) });
            }}
          />
        </div>
        <TextField
          label="Counter text"
          value={data.filmCounterText ?? "{count} FILMS - SWIPE OR USE ARROWS"}
          onChange={(filmCounterText) => set({ filmCounterText: filmCounterText || undefined })}
          placeholder="{count} FILMS - SWIPE OR USE ARROWS"
          hint="Use {count} for the number of matching films."
          maxLength={80}
        />
        <CheckboxField
          label="Show navigation arrows (← / →)"
          checked={data.showFilmArrows !== false}
          onChange={(showFilmArrows) => set({ showFilmArrows })}
        />
      </FormGroup>

      <FormGroup title="Film Reel Items">
        <ItemList<CardItem>
          label="Films"
          items={data.items}
          max={24}
          onChange={(items) => set({ items })}
          create={() => ({
            title: "NEW FILM",
            subtitle: "BRAND FILMS",
            badge: "BRAND FILM • 01:30",
            description: "Cinematic commercial filmed on vintage anamorphic lenses.",
            image: { url: "", alt: "Film frame thumbnail" },
          })}
          itemTitle={(item) => item.title || "Untitled Film"}
          addLabel="Add film frame"
          renderItem={(item, update) => (
            <>
              <TextField
                label="Film title"
                value={item.title}
                onChange={(title) => update({ ...item, title })}
                maxLength={100}
                required
              />
              <div className="grid grid-cols-2 gap-2 items-start">
                <TextField
                  label="Category"
                  value={item.subtitle ?? ""}
                  onChange={(subtitle) => update({ ...item, subtitle: subtitle || undefined })}
                  placeholder="e.g. MUSIC VIDEOS"
                  maxLength={60}
                />
                <TextField
                  label="Runtime tag"
                  value={item.badge ?? ""}
                  onChange={(badge) => update({ ...item, badge: badge || undefined })}
                  placeholder="e.g. 03:42"
                  maxLength={40}
                />
              </div>
              <ImageField
                label="Thumbnail photo"
                value={item.image}
                onChange={(image) => update({ ...item, image })}
                optional
                dimensionHint={cardImageSize("16:9")}
              />
              <TextField
                label="Video URL"
                value={item.videoUrl ?? ""}
                onChange={(videoUrl) => update({ ...item, videoUrl: videoUrl || undefined })}
                placeholder="https://youtube.com/watch?v=... or .mp4"
                hint="YouTube, Vimeo, or MP4 link for preview player."
              />
              <TextAreaField
                label="Synopsis / Description"
                value={item.description ?? ""}
                onChange={(description) => update({ ...item, description: description || undefined })}
                maxLength={800}
              />
              <OptionalLinkField
                label="Project link (optional)"
                value={item.link}
                onChange={(link) => update({ ...item, link })}
                fallback={{ label: "View Project", href: "/work" }}
              />
            </>
          )}
        />
      </FormGroup>
    </>
  );
}
