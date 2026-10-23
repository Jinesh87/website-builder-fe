import type {
  ContactBlock,
  ContactBlockType,
  ContactColumn,
  ContactData,
  ContactFieldType,
  ContactFormField,
  ContactInfoKind,
  ContactLayout,
} from "./types.ts";

/** Mirrors CONTACT_LIMITS on the server, which rejects anything larger. */
export const CONTACT_LIMITS = {
  maxFields: 20,
  maxOptions: 12,
  maxColumns: 4,
  maxBlocksPerColumn: 12,
  maxBlocks: 32,
  maxTextValue: 500,
  maxLongValue: 5000,
} as const;

export const CONTACT_ID_PATTERN = /^[a-z][a-z0-9_-]{0,39}$/;

export const CONTACT_FIELD_TYPE_LABELS: Record<ContactFieldType, string> = {
  text: "Short text",
  email: "Email",
  tel: "Phone",
  textarea: "Long text",
  select: "Dropdown",
  radio: "Single choice",
  checkboxes: "Multiple choice",
  date: "Date",
  number: "Number",
};

export const CONTACT_BLOCK_LABELS: Record<ContactBlockType, string> = {
  heading: "Heading",
  text: "Paragraph",
  badge: "Badge",
  info: "Contact detail",
  form: "Enquiry form",
  map: "Google Map",
  button: "Button",
  image: "Image",
  divider: "Divider",
};

export const CONTACT_INFO_KIND_LABELS: Record<ContactInfoKind, string> = {
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  address: "Our location",
  hours: "Business hours",
  link: "Website",
  text: "Info",
};

const CHOICE_TYPES: ReadonlySet<ContactFieldType> = new Set(["select", "radio", "checkboxes"]);

export function isChoiceField(type: ContactFieldType): boolean {
  return CHOICE_TYPES.has(type);
}

/** Choices a visitor can actually pick; blank options are ignored. */
export function fieldOptions(field: ContactFormField): string[] {
  return (field.options ?? []).map((option) => option.trim()).filter(Boolean);
}

export function fieldMaxLength(type: ContactFieldType): number {
  return type === "textarea" ? CONTACT_LIMITS.maxLongValue : CONTACT_LIMITS.maxTextValue;
}

/** True when the owner can reply: the form asks for an email or a phone number. */
export function hasReplyField(fields: readonly ContactFormField[]): boolean {
  return fields.some((field) => field.type === "email" || field.type === "tel");
}

/** Short id that matches CONTACT_ID_PATTERN and isn't in `taken`. */
export function newContactId(prefix: string, taken: Iterable<string> = []): string {
  const used = new Set(taken);
  for (;;) {
    const id = `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
    if (CONTACT_ID_PATTERN.test(id) && !used.has(id)) return id;
  }
}

/** The fields the form shows when the owner hasn't customized it. */
export function defaultContactFields(data: Pick<ContactData, "serviceOptions">): ContactFormField[] {
  const services = (data.serviceOptions ?? [])
    .map((option) => option.trim())
    .filter(Boolean)
    .slice(0, CONTACT_LIMITS.maxOptions);
  return [
    { id: "name", type: "text", label: "Your name", placeholder: "Jane Doe", required: true, width: "half" },
    { id: "email", type: "email", label: "Email address", placeholder: "jane@company.com", required: true, width: "half" },
    ...(services.length > 0
      ? [{ id: "services", type: "checkboxes" as const, label: "I'm interested in", options: services, width: "full" as const }]
      : []),
    {
      id: "message",
      type: "textarea",
      label: "Project details / Message",
      placeholder: "Tell us about your timeline, scope, and objectives...",
      required: true,
      width: "full",
    },
  ];
}

export function createContactField(type: ContactFieldType, taken: Iterable<string>): ContactFormField {
  return {
    id: newContactId("field", taken),
    type,
    label: CONTACT_FIELD_TYPE_LABELS[type],
    width: "full",
    ...(isChoiceField(type) ? { options: ["Option 1", "Option 2"] } : {}),
  };
}

export function createContactBlock(
  type: ContactBlockType,
  taken: Iterable<string>,
  data: Pick<ContactData, "address" | "phone"> = {},
): ContactBlock {
  const id = newContactId("block", taken);
  switch (type) {
    case "heading":
      return { id, type, text: "Send us a message", level: 3 };
    case "text":
      return { id, type, text: "We usually reply within one business day." };
    case "badge":
      return { id, type, text: "Get in touch" };
    case "info":
      return { id, type, kind: "email", label: CONTACT_INFO_KIND_LABELS.email, value: "hello@example.com", boxed: true };
    case "form":
      return { id, type };
    case "map":
      return { id, type, query: data.address?.trim() ?? "", height: "md" };
    case "button":
      return {
        id,
        type,
        label: data.phone ? "Call us" : "Get directions",
        href: data.phone ? `tel:${data.phone.replace(/[^\d+]/g, "")}` : "#",
        tone: "secondary",
      };
    case "image":
      return { id, type, image: { url: "", alt: "" } };
    case "divider":
      return { id, type };
  }
}

function contactInfoBlocks(data: ContactData, taken: Set<string>): ContactBlock[] {
  const blocks: ContactBlock[] = [];
  const add = (kind: ContactInfoKind, value: string | undefined, label?: string) => {
    if (!value?.trim()) return;
    const id = newContactId("block", taken);
    taken.add(id);
    blocks.push({ id, type: "info", kind, label: label ?? CONTACT_INFO_KIND_LABELS[kind], value: value.trim(), boxed: true });
  };
  add("address", data.address);
  add("phone", data.phone);
  add("email", data.email);
  add("hours", data.officeHours);
  for (const channel of data.channels ?? []) {
    const kind: ContactInfoKind =
      channel.icon === "mail" || channel.value.includes("@")
        ? "email"
        : channel.icon === "phone"
          ? "phone"
          : /^https?:\/\//i.test(channel.value)
            ? "link"
            : "text";
    add(kind, channel.value, channel.label);
  }
  return blocks.slice(0, CONTACT_LIMITS.maxBlocksPerColumn);
}

/** Starting columns for the "custom" variant that keep what the section already shows. */
export function createContactLayout(data: ContactData): ContactLayout {
  const taken = new Set<string>();
  const nextId = (prefix: string) => {
    const id = newContactId(prefix, taken);
    taken.add(id);
    return id;
  };
  const info = contactInfoBlocks(data, taken);
  const formBlocks: ContactBlock[] = data.showForm
    ? [
        ...(data.formHeading?.trim()
          ? [{ id: nextId("block"), type: "heading" as const, text: data.formHeading.trim(), level: 3 as const }]
          : []),
        { id: nextId("block"), type: "form" },
      ]
    : [];

  const columns: ContactColumn[] = [];
  if (info.length > 0) columns.push({ id: nextId("col"), width: formBlocks.length > 0 ? 5 : 12, blocks: info });
  if (formBlocks.length > 0) {
    columns.push({ id: nextId("col"), width: info.length > 0 ? 7 : 12, boxed: true, blocks: formBlocks });
  }
  if (columns.length === 0) {
    columns.push({
      id: nextId("col"),
      width: 12,
      blocks: [{ id: nextId("block"), type: "text", text: "Add your contact details or an enquiry form here." }],
    });
  }
  return { columns, gap: "lg", align: "start" };
}

/** The saved layout, or one derived from the section's other fields when none is saved yet. */
export function resolveContactLayout(data: ContactData): ContactLayout {
  const columns = data.layout?.columns;
  return Array.isArray(columns) && columns.length > 0 && data.layout ? data.layout : createContactLayout(data);
}

export function layoutHasForm(layout: ContactLayout): boolean {
  return layout.columns.some((column) => column.blocks.some((block) => block.type === "form"));
}

export function layoutIds(layout: ContactLayout): string[] {
  return layout.columns.flatMap((column) => [column.id, ...column.blocks.map((block) => block.id)]);
}

export function layoutBlockCount(layout: ContactLayout): number {
  return layout.columns.reduce((total, column) => total + column.blocks.length, 0);
}

/** Moves a block to the end of another column. */
export function moveContactBlock(layout: ContactLayout, blockId: string, toColumnId: string): ContactLayout {
  const block = layout.columns.flatMap((column) => column.blocks).find((candidate) => candidate.id === blockId);
  const target = layout.columns.find((column) => column.id === toColumnId);
  if (!block || !target || target.blocks.some((candidate) => candidate.id === blockId)) return layout;
  if (target.blocks.length >= CONTACT_LIMITS.maxBlocksPerColumn) return layout;
  return {
    ...layout,
    columns: layout.columns.map((column) =>
      column.id === toColumnId
        ? { ...column, blocks: [...column.blocks, block] }
        : { ...column, blocks: column.blocks.filter((candidate) => candidate.id !== blockId) },
    ),
  };
}

/** Google Maps embed for a place name or address; no API key needed. */
export function contactMapEmbedUrl(query: string): string | null {
  const place = query.trim();
  return place ? `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed` : null;
}

/** Where tapping a contact detail goes, or null when it isn't a link. */
export function contactInfoHref(kind: ContactInfoKind, value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  switch (kind) {
    case "email":
      return `mailto:${text}`;
    case "phone": {
      const dial = text.replace(/[^\d+]/g, "");
      return dial ? `tel:${dial}` : null;
    }
    case "whatsapp": {
      const digits = text.replace(/\D/g, "");
      return digits ? `https://wa.me/${digits}` : null;
    }
    case "address":
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
    case "link":
      return /^https?:\/\//i.test(text) ? text : `https://${text}`;
    default:
      return null;
  }
}
