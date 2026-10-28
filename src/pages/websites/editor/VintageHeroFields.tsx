import type { HeroData } from "../../../site-kit/index.ts";
import { type VintagePolaroid, vintageHeroPolaroids } from "../../../site-kit/hero-layout.ts";
import { FormGroup, ImageField, OptionalLinkField, SelectField, TextAreaField, TextField } from "./fields.tsx";
import { MEDIA_SIZE } from "./media-dimensions.ts";

type HeroFieldsProps = { data: HeroData; onChange: (data: HeroData) => void };

export const VINTAGE_HERO_VARIANTS: readonly NonNullable<HeroData["variant"]>[] = [
  "vintage-editorial",
  "vintage-sunburst",
];

export function isVintageHero(data: HeroData): boolean {
  return data.variant !== undefined && VINTAGE_HERO_VARIANTS.includes(data.variant);
}

const RICH_HEADING_HINT = "Wrap words in <em>…</em> for the red italic accent and use <br> for a line break.";

const TILT_OPTIONS: { value: number; label: string }[] = Array.from({ length: 13 }, (_, index) => {
  const degrees = index - 6;
  const label = degrees === 0 ? "Straight" : `${Math.abs(degrees)}° ${degrees < 0 ? "left" : "right"}`;
  return { value: degrees, label };
});

function tiltOptions(current: number): { value: number; label: string }[] {
  if (TILT_OPTIONS.some((option) => option.value === current)) return TILT_OPTIONS;
  return [...TILT_OPTIONS, { value: current, label: `${current}° (custom)` }];
}

function PolaroidFields({
  title,
  value,
  dimensionHint,
  onChange,
}: {
  title: string;
  value: VintagePolaroid;
  dimensionHint: string;
  onChange: (value: VintagePolaroid) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-ed-border p-2.5">
      <p className="text-ed-2xs font-semibold text-ed-text">{title}</p>
      <ImageField
        label="Photo"
        value={value.image}
        onChange={(image) => onChange({ ...value, image: image ?? { url: "", alt: "" } })}
        dimensionHint={dimensionHint}
      />
      <TextField
        label="Caption"
        value={value.caption ?? ""}
        onChange={(caption) => onChange({ ...value, caption: caption || undefined })}
        maxLength={120}
      />
      <SelectField
        label="Tilt"
        value={value.rotation ?? 0}
        options={tiltOptions(value.rotation ?? 0)}
        onChange={(rotation) => onChange({ ...value, rotation: rotation || undefined })}
      />
    </div>
  );
}

function EditorialFields({ data, onChange }: HeroFieldsProps) {
  const topStrip = data.topStrip ?? {};
  const [topPhoto, bottomPhoto] = vintageHeroPolaroids(data);
  const updateStrip = (patch: Partial<NonNullable<HeroData["topStrip"]>>) =>
    onChange({ ...data, topStrip: { ...topStrip, ...patch } });

  return (
    <>
      <FormGroup title="Layout">
        <SelectField
          label="Media position (Left / Right)"
          value={data.imagePosition === "left" ? "left" : "right"}
          options={[
            {
              value: "right",
              label: "Right side (Headline on left, polaroid photos on right)",
            },
            {
              value: "left",
              label: "Left side (Polaroid photos on left, headline on right)",
            },
          ]}
          onChange={(imagePosition) =>
            onChange({ ...data, imagePosition: imagePosition as "left" | "right" })
          }
          hint="Swap placement of the polaroid photos and the text."
        />
      </FormGroup>

      <FormGroup title="Issue strip" description="The thin newspaper line under the header. Leave all three empty to hide it.">
        <TextField
          label="Left text"
          value={topStrip.left ?? ""}
          onChange={(left) => updateStrip({ left: left || undefined })}
          maxLength={120}
          placeholder="VOL. 01 — THE EDITORIAL ISSUE"
        />
        <TextField
          label="Centre text"
          value={topStrip.center ?? ""}
          onChange={(center) => updateStrip({ center: center || undefined })}
          maxLength={120}
          placeholder="VINTAGE FILMS & ADS COMPANY"
        />
        <TextField
          label="Right text"
          value={topStrip.right ?? ""}
          onChange={(right) => updateStrip({ right: right || undefined })}
          maxLength={120}
          placeholder="MUSIC • FILMS • EVENTS"
        />
      </FormGroup>

      <FormGroup title="Headline & copy">
        <TextField
          label="Heading"
          value={data.heading ?? ""}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
          hint={RICH_HEADING_HINT}
        />
        <TextAreaField
          label="Intro paragraph"
          value={data.subheading ?? ""}
          onChange={(subheading) => onChange({ ...data, subheading: subheading || undefined })}
          maxLength={500}
          rows={4}
        />
      </FormGroup>

      <FormGroup title="Buttons">
        <OptionalLinkField
          label="Primary button"
          value={data.primaryCta}
          onChange={(primaryCta) => onChange({ ...data, primaryCta })}
          fallback={{ label: "Start a project", href: "/contact" }}
        />
        <OptionalLinkField
          label="Showreel button"
          value={data.secondaryCta}
          onChange={(secondaryCta) => onChange({ ...data, secondaryCta })}
          fallback={{ label: "Watch showreel", href: "/work" }}
        />
      </FormGroup>

      <FormGroup title="Polaroid photos">
        <PolaroidFields
          title="Top photo (shown in sepia)"
          value={topPhoto}
          dimensionHint={MEDIA_SIZE.vintagePolaroidTop}
          onChange={(next) => onChange({ ...data, vintagePolaroids: [next, bottomPhoto] })}
        />
        <PolaroidFields
          title="Bottom photo"
          value={bottomPhoto}
          dimensionHint={MEDIA_SIZE.vintagePolaroidBottom}
          onChange={(next) => onChange({ ...data, vintagePolaroids: [topPhoto, next] })}
        />
      </FormGroup>
    </>
  );
}

function SunburstFields({ data, onChange }: HeroFieldsProps) {
  return (
    <>
      <FormGroup title="Headline & copy">
        <TextField
          label="Badge"
          value={data.eyebrow ?? ""}
          onChange={(eyebrow) => onChange({ ...data, eyebrow: eyebrow || undefined })}
          maxLength={200}
          placeholder="ABOUT US"
        />
        <TextField
          label="Heading (dark lines)"
          value={data.heading ?? ""}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
          hint="Use <br> to start a new line, e.g. Lights!<br>Camera!"
        />
        <TextField
          label="Last line (cream with shadow)"
          value={data.sunburstTitleWhite ?? ""}
          onChange={(sunburstTitleWhite) =>
            onChange({ ...data, sunburstTitleWhite: sunburstTitleWhite || undefined })
          }
          maxLength={100}
          placeholder="Nostalgia!"
        />
        <TextAreaField
          label="Intro paragraph"
          value={data.subheading ?? ""}
          onChange={(subheading) => onChange({ ...data, subheading: subheading || undefined })}
          maxLength={500}
          rows={3}
        />
        <OptionalLinkField
          label="Button"
          value={data.primaryCta}
          onChange={(primaryCta) => onChange({ ...data, primaryCta })}
          fallback={{ label: "See our reels", href: "/work" }}
        />
      </FormGroup>

      <FormGroup title="Round portrait">
        <ImageField
          label="Portrait photo"
          value={data.circularPortrait ?? data.image}
          onChange={(circularPortrait) => onChange({ ...data, circularPortrait })}
          optional
          dimensionHint={MEDIA_SIZE.vintagePortrait}
          hint="Cropped to a circle and toned sepia, so keep the subject centred."
        />
      </FormGroup>
    </>
  );
}

/** Replaces the generic hero controls, which these layouts don't read. */
export function VintageHeroFields(props: HeroFieldsProps) {
  return props.data.variant === "vintage-sunburst" ? <SunburstFields {...props} /> : <EditorialFields {...props} />;
}
