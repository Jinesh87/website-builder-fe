import type { ContactData, ContactVariant } from "../../../site-kit/index.ts";
import {
  CommaListField,
  FormGroup,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields.tsx";

type Props = {
  data: ContactData;
  onChange: (data: ContactData) => void;
};

const CONTACT_VARIANT_OPTIONS: { value: ContactVariant; label: string }[] = [
  { value: "clapper-slate", label: "Clapperboard Slate · 35mm film slate & details (Current)" },
  { value: "split-form", label: "Split screen form & links" },
  { value: "cards-hub", label: "Multi-channel direct hub cards" },
  { value: "minimal-editorial", label: "Minimal architectural editorial" },
  { value: "floating-glass", label: "Floating glass framed card" },
  { value: "custom", label: "Custom builder" },
];

const TIMECODE_MODE_OPTIONS: { value: "live" | "static"; label: string }[] = [
  { value: "live", label: "Live (24fps)" },
  { value: "static", label: "Static" },
];

export default function ClapperContactFields({ data, onChange }: Props) {
  const set = (patch: Partial<ContactData>) => onChange({ ...data, ...patch });

  const headingWords = (data.heading || "ROLL CAMERA").trim().split(/\s+/);
  const defaultSolid = headingWords[0] || "ROLL";
  const defaultOutline = headingWords.slice(1).join(" ") || "CAMERA";

  const solidHeading = data.solidHeading !== undefined ? data.solidHeading : defaultSolid;
  const outlineHeading = data.outlineHeading !== undefined ? data.outlineHeading : defaultOutline;

  return (
    <>
      <FormGroup title="Design">
        <SelectField<ContactVariant>
          label="Layout variant"
          value={data.variant ?? "clapper-slate"}
          options={CONTACT_VARIANT_OPTIONS}
          onChange={(variant) => set({ variant })}
        />
      </FormGroup>

      <FormGroup title="Title & Typography">
        <TextField
          label="Eyebrow"
          value={data.eyebrow ?? "CONTACT"}
          onChange={(eyebrow) => set({ eyebrow: eyebrow || undefined })}
          placeholder="CONTACT"
          maxLength={80}
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
            placeholder="ROLL"
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
            placeholder="CAMERA"
            maxLength={60}
          />
        </div>
        <TextAreaField
          label="Subheading / Text"
          value={
            data.text ??
            "Tell us about your project. We reply within 24 hours with ideas, timing and a quote."
          }
          onChange={(text) => set({ text: text || undefined })}
          maxLength={500}
        />
      </FormGroup>

      <FormGroup title="Camera HUD & Status">
        <div className="grid grid-cols-2 gap-2 items-start">
          <TextField
            label="REC text"
            value={data.recText ?? "REC · TAKE 01"}
            onChange={(recText) => set({ recText: recText || undefined })}
            placeholder="REC · TAKE 01"
            maxLength={40}
          />
          <SelectField<"live" | "static">
            label="Timecode mode"
            value={data.timecodeMode ?? "live"}
            options={TIMECODE_MODE_OPTIONS}
            onChange={(timecodeMode) => set({ timecodeMode })}
          />
        </div>
        <TextField
          label="Timecode value"
          value={data.timecode ?? "00:00:25:10"}
          onChange={(timecode) => set({ timecode: timecode || undefined })}
          placeholder="00:00:25:10"
          maxLength={16}
        />
      </FormGroup>

      <FormGroup title="Clapper Slate Form">
        <div className="grid grid-cols-2 gap-2 items-start">
          <TextField
            label="Scene / Take tag"
            value={data.sceneTakeLabel ?? "SCENE 01 · TAKE 01"}
            onChange={(sceneTakeLabel) => set({ sceneTakeLabel: sceneTakeLabel || undefined })}
            placeholder="SCENE 01 · TAKE 01"
            maxLength={50}
          />
          <TextField
            label="Button label"
            value={data.submitLabel ?? "SEND IT ●"}
            onChange={(submitLabel) => set({ submitLabel: submitLabel || undefined })}
            placeholder="SEND IT ●"
            maxLength={40}
          />
        </div>
        <CommaListField
          label="Project type pills"
          hint="Comma separated list"
          value={
            data.serviceOptions ?? [
              "MUSIC VIDEO",
              "BRAND FILM",
              "WEDDING / EVENT",
              "SHORT FILM",
              "DOCUMENTARY",
              "POST-PRODUCTION",
            ]
          }
          onChange={(serviceOptions) => set({ serviceOptions })}
          maxLength={400}
        />
        <CommaListField
          label="Budget options"
          hint="Comma separated list"
          value={
            data.budgetOptions ?? [
              "Choose a range",
              "Under $5,000",
              "$5,000 – $15,000",
              "$15,000 – $30,000",
              "$30,000+",
            ]
          }
          onChange={(budgetOptions) => set({ budgetOptions })}
          maxLength={400}
        />
      </FormGroup>

      <FormGroup title="Production Contact Details">
        <TextField
          label="Email address"
          value={data.email ?? "hello@vintagereels.com"}
          onChange={(email) => set({ email: email || undefined })}
          placeholder="hello@vintagereels.com"
          maxLength={100}
        />
        <TextField
          label="Phone / WhatsApp"
          value={data.phone ?? "+91 98201 44520"}
          onChange={(phone) => set({ phone: phone || undefined })}
          placeholder="+91 98201 44520"
          maxLength={50}
        />
        <TextField
          label="Studio address"
          value={data.address ?? "14 Film City Rd, Goregaon East, Mumbai 400065"}
          onChange={(address) => set({ address: address || undefined })}
          placeholder="14 Film City Rd, Goregaon East, Mumbai 400065"
          maxLength={120}
        />
        <TextField
          label="Business hours"
          value={data.officeHours ?? "Mon–Sat, 10:00–19:00"}
          onChange={(officeHours) => set({ officeHours: officeHours || undefined })}
          placeholder="Mon–Sat, 10:00–19:00"
          maxLength={80}
        />
        <TextField
          label="Follow channels"
          value={data.socialLinksText ?? "Instagram · YouTube · Vimeo"}
          onChange={(socialLinksText) => set({ socialLinksText: socialLinksText || undefined })}
          placeholder="Instagram · YouTube · Vimeo"
          maxLength={120}
        />
      </FormGroup>
    </>
  );
}

