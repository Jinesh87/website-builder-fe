import type { HeroData, HeroFact, HeroRegistrationForm } from "../../../site-kit/index.ts";
import {
  DEFAULT_HERO_REGISTRATION_FIELDS,
  HERO_REGISTRATION_DEFAULTS,
  HERO_REGISTRATION_LIMITS,
  heroRegistrationFields,
} from "../../../site-kit/hero-registration.ts";
import { FormFieldsList } from "./ContactBuilderFields.tsx";
import { CheckboxField, FormGroup, ItemList, TextField } from "./fields.tsx";

/** Inspector panels of the registration-form hero: intro line, fact tiles, checklist and the sign-up card. */
export function HeroRegistrationFields({
  data,
  onChange,
}: {
  data: HeroData;
  onChange: (data: HeroData) => void;
}) {
  const form = data.registrationForm ?? {};
  const setForm = (patch: Partial<HeroRegistrationForm>) =>
    onChange({ ...data, registrationForm: { ...form, ...patch } });

  return (
    <>
      <FormGroup
        title="Registration details"
        description="Key facts and highlights shown under the headline. Set the section background to Dark for the navy look."
      >
        <TextField
          label="Intro line (above the badge)"
          value={data.kicker ?? ""}
          onChange={(kicker) => onChange({ ...data, kicker: kicker || undefined })}
          maxLength={120}
          placeholder="e.g. Acme Consulting presents"
        />
        <ItemList<HeroFact>
          label="Fact tiles"
          items={data.heroFacts ?? []}
          max={HERO_REGISTRATION_LIMITS.maxFacts}
          onChange={(heroFacts) => onChange({ ...data, heroFacts })}
          create={() => ({ label: "Label", value: "Value" })}
          itemTitle={(fact) => `${fact.label || "Untitled"}: ${fact.value || "—"}`}
          addLabel="Add fact"
          renderItem={(fact, update) => (
            <>
              <TextField
                label="Label"
                value={fact.label}
                onChange={(label) => update({ ...fact, label })}
                maxLength={40}
                placeholder="e.g. Date"
                required
              />
              <TextField
                label="Value"
                value={fact.value}
                onChange={(value) => update({ ...fact, value })}
                maxLength={80}
                placeholder="e.g. 12 Dec 2026"
                required
              />
              <CheckboxField
                label="Highlight in accent colour"
                checked={Boolean(fact.highlight)}
                onChange={(highlight) => update({ ...fact, highlight })}
              />
            </>
          )}
        />
        <ItemList<string>
          label="Checklist"
          items={data.checklist ?? []}
          max={HERO_REGISTRATION_LIMITS.maxChecklist}
          onChange={(checklist) => onChange({ ...data, checklist })}
          create={() => "New highlight"}
          itemTitle={(item) => item || "Untitled"}
          addLabel="Add highlight"
          renderItem={(item, update) => (
            <TextField label="Text" value={item} onChange={update} maxLength={160} required />
          )}
        />
      </FormGroup>

      <FormGroup
        title="Registration form"
        description="Entries are emailed to you like contact form messages. Test it on the published site."
      >
        <TextField
          label="Card title"
          value={form.heading ?? ""}
          onChange={(heading) => setForm({ heading: heading || undefined })}
          maxLength={120}
          placeholder={HERO_REGISTRATION_DEFAULTS.heading}
        />
        <TextField
          label="Card subtitle"
          value={form.subheading ?? ""}
          onChange={(subheading) => setForm({ subheading: subheading || undefined })}
          maxLength={160}
          placeholder="e.g. Takes under 2 minutes · Free"
        />
        <TextField
          label="Submit button label"
          value={form.submitLabel ?? ""}
          onChange={(submitLabel) => setForm({ submitLabel: submitLabel || undefined })}
          maxLength={60}
          placeholder={HERO_REGISTRATION_DEFAULTS.submitLabel}
        />
        <TextField
          label="Note under the button"
          value={form.note ?? ""}
          onChange={(note) => setForm({ note: note || undefined })}
          maxLength={240}
          placeholder="e.g. Seats are limited. We'll confirm by email."
        />
        <FormFieldsList
          fields={heroRegistrationFields(data)}
          onChange={(fields) => setForm({ fields })}
          onReset={() => setForm({ fields: DEFAULT_HERO_REGISTRATION_FIELDS })}
        />
      </FormGroup>
    </>
  );
}
