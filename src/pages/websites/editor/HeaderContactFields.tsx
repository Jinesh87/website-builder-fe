import { isContactHeaderDesign, type HeaderData, type HeaderPhoneIcon, type LinkRef } from "../../../site-kit/index.ts";
import { CheckboxField, FormGroup, ItemList, LinkField, SelectField, TextField } from "./fields.tsx";

/** Design-picker entries for the phone-first header designs. */
export const CONTACT_HEADER_DESIGN_OPTIONS: { value: HeaderData["design"]; label: string }[] = [
  { value: "contact-topbar", label: "Contact top bar (Phone, email & hours strip above the menu)" },
  { value: "call-now", label: "Call now (Big phone number beside the button)" },
  { value: "contact-stacked", label: "Contact stacked (Contact cards on top, coloured menu bar below)" },
  { value: "centered-phone", label: "Centered logo with phone (Phone left, logo centre, button right)" },
];

const SHOWS: Record<string, string> = {
  "contact-topbar": "The top strip shows each detail you fill in. On phones only the number stays.",
  "call-now": "The number and its label sit beside the main button.",
  "contact-stacked": "Each detail you fill in becomes a card next to the logo.",
  "centered-phone": "The number and its label sit left of the logo.",
};

const newLink = (): LinkRef => ({ label: "Link", href: "/" });

const PHONE_ICON_OPTIONS: { value: HeaderPhoneIcon; label: string }[] = [
  { value: "phone", label: "Phone (outline)" },
  { value: "phone-solid", label: "Phone (filled)" },
  { value: "phone-call", label: "Phone ringing" },
  { value: "smartphone", label: "Mobile phone" },
  { value: "headset", label: "Support headset" },
  { value: "whatsapp", label: "WhatsApp" },
];

/** "Contact details" group of the header form, for the phone-first designs only. */
export function HeaderContactFields({ header, onChange }: { header: HeaderData; onChange: (header: HeaderData) => void }) {
  if (!isContactHeaderDesign(header.design)) return null;
  const { design } = header;
  const set = (patch: Partial<HeaderData>) => onChange({ ...header, ...patch });
  const text = (value: string) => value.trim() || undefined;
  const listsEverything = design === "contact-topbar" || design === "contact-stacked";

  return (
    <FormGroup title="Contact details" description={`${SHOWS[design]} Leave a field empty to hide it.`}>
      <TextField
        label="Phone number"
        type="tel"
        value={header.phone ?? ""}
        onChange={(phone) => set({ phone: text(phone) })}
        maxLength={32}
        placeholder="+91 98765 43210"
        hint="Visitors can tap it to call."
      />
      {design !== "contact-topbar" && (
        <TextField
          label="Phone label"
          value={header.phoneLabel ?? ""}
          onChange={(phoneLabel) => set({ phoneLabel: text(phoneLabel) })}
          maxLength={40}
          placeholder="e.g. Call us 24/7"
          hint="Small text above the number. Leave empty to show just the number."
        />
      )}
      <SelectField
        label="Phone icon"
        value={header.phoneIcon ?? "phone"}
        options={PHONE_ICON_OPTIONS}
        onChange={(phoneIcon) => set({ phoneIcon: phoneIcon === "phone" ? undefined : phoneIcon })}
      />
      <CheckboxField
        label="Call button on phones"
        checked={header.mobileCallButton !== false}
        onChange={(mobileCallButton) => set({ mobileCallButton })}
        hint="A round phone button next to the menu button on small screens."
      />
      {listsEverything && (
        <>
          <TextField
            label="Email"
            type="email"
            value={header.contactEmail ?? ""}
            onChange={(contactEmail) => set({ contactEmail: text(contactEmail) })}
            maxLength={255}
          />
          <TextField
            label="Opening hours"
            value={header.contactHours ?? ""}
            onChange={(contactHours) => set({ contactHours: text(contactHours) })}
            maxLength={80}
            placeholder="Mon–Sat, 9am–7pm"
          />
          <TextField
            label="Address"
            value={header.contactAddress ?? ""}
            onChange={(contactAddress) => set({ contactAddress: text(contactAddress) })}
            maxLength={160}
          />
        </>
      )}
      {design === "contact-topbar" && (
        <ItemList
          label="Top strip links (right side)"
          items={header.utilityLinks ?? []}
          max={8}
          onChange={(utilityLinks) => set({ utilityLinks: utilityLinks.length ? utilityLinks : undefined })}
          create={newLink}
          itemTitle={(link) => link.label}
          renderItem={(item, update) => <LinkField label="Link" value={item} onChange={update} />}
          addLabel="Add link"
        />
      )}
    </FormGroup>
  );
}
