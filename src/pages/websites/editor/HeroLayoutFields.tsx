import type {
  HeroAlign,
  HeroAlignElement,
  HeroButtonShape,
  HeroData,
} from "../../../site-kit/index.ts";
import { HERO_BUTTON_RADIUS_MAX } from "../../../site-kit/index.ts";
import {
  HERO_BUTTON_RADIUS_DEFAULT,
  clampButtonRadius,
  heroButtonRadius,
  isHeroAlign,
} from "../../../site-kit/hero-layout.ts";
import { FormGroup, SelectField, TextField } from "./fields.tsx";

type HeroFieldsProps = { data: HeroData; onChange: (data: HeroData) => void };

const ALL_ALIGN_OPTIONS: { value: HeroAlign | ""; label: string }[] = [
  { value: "", label: "Layout default" },
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const ELEMENT_ALIGN_OPTIONS: { value: HeroAlign | ""; label: string }[] = [
  { value: "", label: "Same as all" },
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const ELEMENT_LABELS: Record<HeroAlignElement, string> = {
  badge: "Badge / eyebrow",
  heading: "Heading",
  subheading: "Subheading",
  description: "Description",
  actions: "Buttons",
  trustedBy: "Trusted-by logos",
};

/** Elements each layout renders; the rest have nothing to align. */
function alignableElements(variant: HeroData["variant"]): HeroAlignElement[] {
  if (variant === "curved-carousel" || variant === "campaign-banner") {
    return ["badge", "heading", "subheading", "actions"];
  }
  return ["badge", "heading", "subheading", "description", "actions", "trustedBy"];
}

function withAlignment(
  data: HeroData,
  key: "all" | HeroAlignElement,
  value: HeroAlign | "",
): HeroData {
  const next = { ...data.alignment };
  if (value) next[key] = value;
  else delete next[key];
  const { alignment: _previous, ...rest } = data;
  return Object.keys(next).length > 0 ? { ...rest, alignment: next } : rest;
}

export function HeroAlignmentGroup({ data, onChange }: HeroFieldsProps) {
  const isBanner = data.variant === "campaign-banner";
  const legacyBannerAlign =
    isBanner && isHeroAlign(data.contentAlign) ? data.contentAlign : "";
  const allValue = isHeroAlign(data.alignment?.all)
    ? data.alignment.all
    : legacyBannerAlign;

  return (
    <FormGroup
      title="Content alignment"
      description="Align all hero content at once, or override individual elements."
    >
      <SelectField<HeroAlign | "">
        label="All content"
        value={allValue}
        options={ALL_ALIGN_OPTIONS}
        onChange={(value) => {
          const next = withAlignment(data, "all", value);
          // The banner's legacy field is superseded once alignment is chosen here.
          if (isBanner) delete next.contentAlign;
          onChange(next);
        }}
        hint={
          isBanner
            ? "Layout default is left aligned."
            : "Layout default follows the hero design and the Style tab's heading alignment."
        }
      />
      <div className="grid grid-cols-2 gap-2">
        {alignableElements(data.variant).map((element) => {
          const own = data.alignment?.[element];
          return (
            <SelectField<HeroAlign | "">
              key={element}
              label={ELEMENT_LABELS[element]}
              value={isHeroAlign(own) ? own : ""}
              options={ELEMENT_ALIGN_OPTIONS}
              onChange={(value) => onChange(withAlignment(data, element, value))}
            />
          );
        })}
      </div>
    </FormGroup>
  );
}

const SHAPE_OPTIONS: { value: HeroButtonShape | ""; label: string }[] = [
  { value: "", label: "Theme default" },
  { value: "square", label: "Square (sharp corners)" },
  { value: "soft", label: "Soft (slightly rounded)" },
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill (fully rounded ends)" },
  { value: "oval", label: "Oval (elliptical)" },
  { value: "custom", label: "Custom radius" },
];

export function HeroButtonShapeGroup({ data, onChange }: HeroFieldsProps) {
  const shape = data.buttonShape ?? "";
  const previewRadius = heroButtonRadius(data.buttonShape, data.buttonRadius) ?? "8px";

  return (
    <FormGroup title="Button shape">
      <SelectField<HeroButtonShape | "">
        label="Shape"
        value={shape}
        options={SHAPE_OPTIONS}
        onChange={(value) => {
          const { buttonShape: _shape, buttonRadius: _radius, ...rest } = data;
          if (!value) return onChange(rest);
          if (value === "custom") {
            return onChange({
              ...rest,
              buttonShape: value,
              buttonRadius: clampButtonRadius(data.buttonRadius) ?? HERO_BUTTON_RADIUS_DEFAULT,
            });
          }
          onChange({ ...rest, buttonShape: value });
        }}
        hint="Applies to every button in this hero."
      />
      {shape === "custom" && (
        <TextField
          label={`Corner radius (0–${HERO_BUTTON_RADIUS_MAX}px)`}
          type="number"
          value={String(clampButtonRadius(data.buttonRadius) ?? HERO_BUTTON_RADIUS_DEFAULT)}
          onChange={(raw) =>
            onChange({
              ...data,
              buttonRadius: clampButtonRadius(Number.parseInt(raw, 10)) ?? 0,
            })
          }
        />
      )}
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="text-ed-2xs text-ed-muted">Preview</span>
        <span
          className="inline-flex h-8 items-center bg-ed-accent px-5 text-ed-xs font-semibold text-white"
          style={{ borderRadius: previewRadius }}
        >
          Get started
        </span>
      </div>
    </FormGroup>
  );
}
