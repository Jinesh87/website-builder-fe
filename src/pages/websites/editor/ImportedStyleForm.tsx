import { FONT_KEYS, FONTS } from "../../../site-kit/index.ts";
import { hasImportedStyle } from "../../../site-kit/imported-html-style.ts";
import type { SectionSettings } from "../../../site-kit/types.ts";
import { ColorField, FormGroup, SelectField } from "./fields.tsx";

/**
 * Style tab for imported HTML blocks. Every option starts on "As imported" (the block's own
 * look) and only what you change is layered on top of the imported design.
 */
type Props = {
  settings: SectionSettings;
  onChange: (settings: SectionSettings) => void;
  /** Switches the inspector to the Content tab, where each button can be styled on its own. */
  onShowContent?: () => void;
};

const AS_IMPORTED = "As imported";

const BACKGROUNDS = [
  { value: "default", label: AS_IMPORTED },
  { value: "surface", label: "Tinted (theme)" },
  { value: "primary", label: "Primary colour (theme)" },
  { value: "dark", label: "Dark (theme)" },
] as const;

const SPACING = [
  { value: "default", label: AS_IMPORTED },
  { value: "none", label: "No space" },
  { value: "compact", label: "Compact" },
  { value: "relaxed", label: "Relaxed" },
] as const;

const SIZES = [
  { value: "default", label: AS_IMPORTED },
  { value: "small", label: "Smaller" },
  { value: "medium", label: "A bit larger" },
  { value: "large", label: "Larger" },
  { value: "huge", label: "Much larger" },
];

const ALIGN = [
  { value: "default", label: AS_IMPORTED },
  { value: "left", label: "Left" },
  { value: "center", label: "Centered" },
  { value: "right", label: "Right" },
];

const WEIGHTS = [
  { value: "default", label: AS_IMPORTED },
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi-bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra bold" },
];

const FONT_OPTIONS = [{ value: "default", label: AS_IMPORTED }, ...FONT_KEYS.map((key) => ({ value: key, label: FONTS[key].label }))];

/** Drops a key when it goes back to "As imported", so nothing is layered for it. */
function setKey<K extends keyof SectionSettings>(settings: SectionSettings, key: K, value: SectionSettings[K] | "" | "default" | undefined): SectionSettings {
  const next = { ...settings };
  if (value === undefined || value === "" || value === "default") delete next[key];
  else next[key] = value as SectionSettings[K];
  return next;
}

export default function ImportedStyleForm({ settings, onChange, onShowContent }: Props) {
  const colors = settings.customColors ?? {};
  const setColor = (key: keyof NonNullable<SectionSettings["customColors"]>, value: string) => {
    const next = { ...colors, [key]: value || undefined };
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, v]) => Boolean(v)));
    onChange({ ...settings, customColors: Object.keys(cleaned).length ? cleaned : undefined });
  };
  const changed = hasImportedStyle(settings);

  return (
    <>
      <p className="px-4 pb-1 pt-3 text-ed-xs text-ed-muted">
        This block keeps its imported design. Anything you set here is applied on top; leave an option on “{AS_IMPORTED}” to keep the original.
      </p>

      <FormGroup title="Colours">
        <SelectField
          label="Background"
          value={settings.background ?? "default"}
          options={[...BACKGROUNDS]}
          onChange={(background) => onChange({ ...settings, background })}
        />
        <ColorField
          label="Custom background"
          value={colors.background}
          onChange={(value) => setColor("background", value)}
          placeholder={AS_IMPORTED}
          hint="Replaces the block's background, including imported gradients or images."
        />
        <p className="-mt-1 text-ed-2xs text-ed-muted">Heading and text colours change the block's own text; cards keep theirs.</p>
        <ColorField label="Headings" value={colors.text} onChange={(value) => setColor("text", value)} fallback="#0f172a" placeholder={AS_IMPORTED} />
        <ColorField label="Text" value={colors.muted} onChange={(value) => setColor("muted", value)} fallback="#475569" placeholder={AS_IMPORTED} />
        <ColorField label="Buttons" value={colors.primary} onChange={(value) => setColor("primary", value)} fallback="#2563eb" placeholder={AS_IMPORTED} />
        <div className="-mt-1 rounded-ed-md border border-ed-accent/25 bg-ed-accent/5 p-2 text-ed-2xs text-ed-muted">
          This colours <strong className="text-ed-text">every</strong> button in the block. To give one button its own colour, open it in Content and
          choose “Style this button”.
          {onShowContent ? (
            <button type="button" onClick={onShowContent} className="mt-1.5 block font-semibold text-ed-accent hover:underline">
              Style buttons one by one →
            </button>
          ) : null}
        </div>
        <ColorField label="Borders & lines" value={colors.border} onChange={(value) => setColor("border", value)} fallback="#e2e8f0" placeholder={AS_IMPORTED} />
      </FormGroup>

      <FormGroup title="Text">
        <SelectField label="Font" value={settings.font ?? "default"} options={FONT_OPTIONS} onChange={(font) => onChange(setKey(settings, "font", font as SectionSettings["font"]))} />
        <SelectField label="Heading size" value={settings.headingSize ?? "default"} options={SIZES} onChange={(size) => onChange(setKey(settings, "headingSize", size))} />
        <SelectField label="Heading weight" value={settings.headingWeight ?? "default"} options={WEIGHTS} onChange={(weight) => onChange(setKey(settings, "headingWeight", weight as SectionSettings["headingWeight"]))} />
        <SelectField label="Heading alignment" value={settings.align ?? "default"} options={ALIGN} onChange={(align) => onChange(setKey(settings, "align", align as SectionSettings["align"]))} />
        <SelectField label="Text size" value={settings.bodySize ?? "default"} options={SIZES} onChange={(size) => onChange(setKey(settings, "bodySize", size))} />
      </FormGroup>

      <FormGroup title="Spacing">
        <SelectField
          label="Space above & below"
          value={settings.spacing ?? "default"}
          options={[...SPACING]}
          onChange={(spacing) => onChange(setKey(settings, "spacing", spacing))}
        />
      </FormGroup>

      {changed && (
        <button
          type="button"
          className="text-ed-xs font-medium text-ed-danger hover:underline"
          onClick={() =>
            onChange({ background: "default", hideOnMobile: settings.hideOnMobile, ...(settings.hideOnDesktop ? { hideOnDesktop: true } : {}), ...(settings.anchor ? { anchor: settings.anchor } : {}) })
          }
        >
          Reset to the imported look
        </button>
      )}
    </>
  );
}
