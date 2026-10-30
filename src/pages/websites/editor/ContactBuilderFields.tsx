import { RichTextField } from "./RichTextField.tsx";
import type {
  ContactBlock,
  ContactBlockType,
  ContactColumn,
  ContactData,
  ContactFieldType,
  ContactFormField,
  ContactInfoKind,
  ContactLayout,
  ContactLayoutAlign,
  ContactLayoutGap,
  ContactMapHeight,
} from "../../../site-kit/index.ts";
import {
  CONTACT_BLOCK_LABELS,
  CONTACT_FIELD_TYPE_LABELS,
  CONTACT_INFO_KIND_LABELS,
  CONTACT_LIMITS,
  createContactBlock,
  createContactField,
  defaultContactFields,
  hasReplyField,
  isChoiceField,
  layoutBlockCount,
  layoutHasForm,
  layoutIds,
  moveContactBlock,
  newContactId,
  resolveContactLayout,
} from "../../../site-kit/contact-builder.ts";
import {
  CheckboxField,
  FormGroup,
  ImageField,
  ItemList,
  LinkField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields.tsx";

type Props = { data: ContactData; onChange: (data: ContactData) => void };

const FIELD_TYPE_OPTIONS = (Object.keys(CONTACT_FIELD_TYPE_LABELS) as ContactFieldType[]).map((value) => ({
  value,
  label: CONTACT_FIELD_TYPE_LABELS[value],
}));

const WIDTH_OPTIONS: { value: "full" | "half"; label: string }[] = [
  { value: "full", label: "Full row" },
  { value: "half", label: "Half row" },
];

const INFO_KIND_OPTIONS = (Object.keys(CONTACT_INFO_KIND_LABELS) as ContactInfoKind[]).map((value) => ({
  value,
  label: CONTACT_INFO_KIND_LABELS[value],
}));

const COLUMN_WIDTH_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 12].map((value) => ({
  value,
  label: `${value}/12 (${Math.round((value / 12) * 100)}%)`,
}));

const GAP_OPTIONS: { value: ContactLayoutGap; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const ALIGN_OPTIONS: { value: ContactLayoutAlign; label: string }[] = [
  { value: "start", label: "Top" },
  { value: "center", label: "Middle" },
  { value: "stretch", label: "Equal height" },
];

const MAP_HEIGHT_OPTIONS: { value: ContactMapHeight; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const VALUE_HINTS: Record<ContactInfoKind, string> = {
  email: "e.g. hello@company.com",
  phone: "e.g. +91 98765 43210",
  whatsapp: "WhatsApp number with country code, e.g. +91 97780 31136",
  address: "Full address; opens in Google Maps",
  hours: "e.g. Mon – Sat: 9:00 AM – 6:00 PM",
  link: "e.g. https://instagram.com/yourpage",
  text: "Any short note",
};

function OptionsEditor({ field, onChange }: { field: ContactFormField; onChange: (field: ContactFormField) => void }) {
  return (
    <ItemList<string>
      label="Options"
      items={field.options ?? []}
      max={CONTACT_LIMITS.maxOptions}
      onChange={(options) => onChange({ ...field, options })}
      create={() => `Option ${(field.options?.length ?? 0) + 1}`}
      itemTitle={(option) => option || "Untitled option"}
      addLabel="Add option"
      renderItem={(option, update) => <TextField label="Option" value={option} onChange={update} maxLength={80} required />}
    />
  );
}

function FieldEditor({ field, onChange }: { field: ContactFormField; onChange: (field: ContactFormField) => void }) {
  const choice = isChoiceField(field.type);
  return (
    <>
      <TextField
        label="Label"
        value={field.label}
        onChange={(label) => onChange({ ...field, label })}
        maxLength={80}
        required
        hint="Shown on the form and in the email you receive."
      />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Type"
          value={field.type}
          options={FIELD_TYPE_OPTIONS}
          onChange={(type) =>
            onChange({
              ...field,
              type,
              options: isChoiceField(type) ? (field.options?.length ? field.options : ["Option 1", "Option 2"]) : undefined,
            })
          }
        />
        <SelectField
          label="Width"
          value={field.width ?? "full"}
          options={WIDTH_OPTIONS}
          onChange={(width) => onChange({ ...field, width })}
        />
      </div>
      {field.type !== "radio" && field.type !== "checkboxes" && field.type !== "date" && (
        <TextField
          label={field.type === "select" ? "Prompt" : "Placeholder"}
          value={field.placeholder ?? ""}
          onChange={(placeholder) => onChange({ ...field, placeholder })}
          maxLength={120}
        />
      )}
      {choice && <OptionsEditor field={field} onChange={onChange} />}
      <CheckboxField
        label="Required"
        checked={Boolean(field.required)}
        onChange={(required) => onChange({ ...field, required })}
      />
    </>
  );
}

/** Field list of the enquiry form, shared by every contact design. */
export function ContactFormFieldsEditor({ data, onChange }: Props) {
  const fields = data.formFields;
  if (!fields) {
    return (
      <div className="flex flex-col gap-2 rounded-ed border border-dashed border-ed-border-strong p-3">
        <p className="text-ed-2xs text-ed-muted leading-normal">
          The form uses the default fields: name, email and message. Customize to add, remove, rename or reorder fields.
          Everything visitors fill in is emailed to you with its label.
        </p>
        <button
          type="button"
          onClick={() => onChange({ ...data, formFields: defaultContactFields(data) })}
          className="inline-flex items-center justify-center rounded-ed bg-ed-accent px-3 py-1.5 text-ed-sm font-medium text-white hover:opacity-90"
        >
          Customize form fields
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ItemList<ContactFormField>
        label="Form fields (drag to reorder)"
        items={fields}
        max={CONTACT_LIMITS.maxFields}
        onChange={(formFields) => onChange({ ...data, formFields })}
        create={() => createContactField("text", fields.map((field) => field.id))}
        itemTitle={(field) =>
          `${field.label || "Untitled field"} · ${CONTACT_FIELD_TYPE_LABELS[field.type]}${field.required ? " *" : ""}`
        }
        addLabel="Add field"
        renderItem={(field, update) => <FieldEditor field={field} onChange={update} />}
      />
      {!hasReplyField(fields) && (
        <p role="alert" className="text-ed-2xs font-medium text-amber-600">
          Add an Email or Phone field so you can reply to people who contact you.
        </p>
      )}
      <button
        type="button"
        onClick={() => onChange({ ...data, formFields: undefined })}
        className="self-start text-ed-2xs font-medium text-ed-muted underline-offset-2 hover:text-ed-text hover:underline"
      >
        Reset to default fields
      </button>
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
  columns,
  columnId,
  onMove,
}: {
  block: ContactBlock;
  onChange: (block: ContactBlock) => void;
  columns: ContactColumn[];
  columnId: string;
  onMove: (toColumnId: string) => void;
}) {
  return (
    <>
      {block.type === "heading" && (
        <>
          <RichTextField label="Heading" value={block.text} onChange={(text) => onChange({ ...block, text })} maxLength={200} required />
          <SelectField
            label="Size"
            value={block.level ?? 3}
            options={[
              { value: 2, label: "Large" },
              { value: 3, label: "Medium" },
            ]}
            onChange={(level) => onChange({ ...block, level })}
          />
        </>
      )}
      {block.type === "text" && (
        <RichTextField multiline label="Text" value={block.text} onChange={(text) => onChange({ ...block, text })} maxLength={1200} />
      )}
      {block.type === "badge" && (
        <RichTextField label="Badge text" value={block.text} onChange={(text) => onChange({ ...block, text })} maxLength={80} />
      )}
      {block.type === "info" && (
        <>
          <SelectField
            label="Kind"
            value={block.kind}
            options={INFO_KIND_OPTIONS}
            onChange={(kind) => onChange({ ...block, kind, label: block.label || CONTACT_INFO_KIND_LABELS[kind] })}
          />
          <TextField label="Label" value={block.label ?? ""} onChange={(label) => onChange({ ...block, label })} maxLength={80} />
          <TextAreaField
            label="Value"
            value={block.value}
            onChange={(value) => onChange({ ...block, value })}
            maxLength={500}
            rows={2}
            hint={VALUE_HINTS[block.kind]}
          />
        </>
      )}
      {block.type === "form" && (
        <p className="text-ed-2xs text-ed-muted leading-normal">
          Edit the fields and button in the “Enquiry form” group below.
        </p>
      )}
      {block.type === "map" && (
        <>
          <TextField
            label="Place or address"
            value={block.query}
            onChange={(query) => onChange({ ...block, query })}
            maxLength={200}
            hint="Shown with Google Maps, e.g. HILKWUD, Vettikulam, Ernakulam"
          />
          <SelectField
            label="Height"
            value={block.height ?? "md"}
            options={MAP_HEIGHT_OPTIONS}
            onChange={(height) => onChange({ ...block, height })}
          />
        </>
      )}
      {block.type === "button" && (
        <>
          <LinkField
            label="Button"
            value={{ label: block.label, href: block.href }}
            onChange={(link) => onChange({ ...block, label: link.label, href: link.href })}
          />
          <SelectField
            label="Style"
            value={block.tone ?? "primary"}
            options={[
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Outline" },
            ]}
            onChange={(tone) => onChange({ ...block, tone })}
          />
        </>
      )}
      {block.type === "image" && (
        <ImageField label="Image" value={block.image} onChange={(image) => image && onChange({ ...block, image })} />
      )}
      {block.type !== "divider" && (
        <CheckboxField
          label="Show in a card"
          checked={Boolean(block.boxed)}
          onChange={(boxed) => onChange({ ...block, boxed })}
        />
      )}
      {columns.length > 1 && (
        <SelectField
          label="Column"
          value={columnId}
          options={columns.map((column, index) => ({ value: column.id, label: `Column ${index + 1}` }))}
          onChange={(toColumnId) => toColumnId !== columnId && onMove(toColumnId)}
        />
      )}
    </>
  );
}

function blockTitle(block: ContactBlock): string {
  const label = CONTACT_BLOCK_LABELS[block.type];
  switch (block.type) {
    case "heading":
    case "text":
    case "badge":
      return block.text ? `${label} · ${block.text}` : label;
    case "info":
      return `${block.label || CONTACT_INFO_KIND_LABELS[block.kind]} · ${block.value}`;
    case "map":
      return block.query ? `${label} · ${block.query}` : label;
    case "button":
      return block.label ? `${label} · ${block.label}` : label;
    default:
      return label;
  }
}

/** Columns and blocks of the "custom" contact design. */
export function ContactLayoutEditor({ data, onChange }: Props) {
  const layout = resolveContactLayout(data);
  const total = layoutBlockCount(layout);
  const hasForm = layoutHasForm(layout);
  const setLayout = (next: ContactLayout) => onChange({ ...data, layout: next });
  const setColumns = (columns: ContactColumn[]) => setLayout({ ...layout, columns });

  const blockTypeOptions = (Object.keys(CONTACT_BLOCK_LABELS) as ContactBlockType[])
    .filter((type) => type !== "form" || !hasForm)
    .map((type) => ({ value: type, label: CONTACT_BLOCK_LABELS[type] }));

  return (
    <>
      <FormGroup title="Layout" description="Drag columns to swap sides. Each column holds blocks you can drag, edit or move.">
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Spacing"
            value={layout.gap ?? "lg"}
            options={GAP_OPTIONS}
            onChange={(gap) => setLayout({ ...layout, gap })}
          />
          <SelectField
            label="Vertical align"
            value={layout.align ?? "start"}
            options={ALIGN_OPTIONS}
            onChange={(align) => setLayout({ ...layout, align })}
          />
        </div>
        <CheckboxField
          label="Show section heading"
          checked={data.showHeader !== false}
          onChange={(showHeader) => onChange({ ...data, showHeader })}
          hint="Eyebrow, heading and text above the columns."
        />
        <CheckboxField
          label="Reverse column order on mobile"
          checked={Boolean(layout.mobileReverse)}
          onChange={(mobileReverse) => setLayout({ ...layout, mobileReverse })}
        />
      </FormGroup>

      <FormGroup title="Columns & blocks" badge={`${total}/${CONTACT_LIMITS.maxBlocks} blocks`}>
        <ItemList<ContactColumn>
          label="Columns (drag to reorder)"
          items={layout.columns}
          max={CONTACT_LIMITS.maxColumns}
          onChange={(columns) => setColumns(columns.length > 0 ? columns : layout.columns)}
          create={() => ({ id: newContactId("col", layoutIds(layout)), width: 6, blocks: [] })}
          itemTitle={(column, index) => `Column ${index + 1} · ${column.width}/12 · ${column.blocks.length} blocks`}
          addLabel="Add column"
          renderItem={(column, updateColumn) => (
            <>
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Width"
                  value={column.width}
                  options={COLUMN_WIDTH_OPTIONS}
                  onChange={(width) => updateColumn({ ...column, width })}
                />
                <div className="flex items-end pb-1">
                  <CheckboxField
                    label="Card"
                    checked={Boolean(column.boxed)}
                    onChange={(boxed) => updateColumn({ ...column, boxed })}
                  />
                </div>
              </div>
              <ItemList<ContactBlock>
                label="Blocks (drag to reorder)"
                items={column.blocks}
                max={Math.min(CONTACT_LIMITS.maxBlocksPerColumn, column.blocks.length + CONTACT_LIMITS.maxBlocks - total)}
                onChange={(blocks) => updateColumn({ ...column, blocks })}
                create={() => createContactBlock("text", layoutIds(layout), data)}
                itemTitle={blockTitle}
                renderAdd={(add, full) => (
                  <SelectField<ContactBlockType | "">
                    label={full ? "Block limit reached" : "Add a block"}
                    value=""
                    options={[{ value: "", label: full ? "No more blocks" : "+ Choose a block…" }, ...(full ? [] : blockTypeOptions)]}
                    onChange={(type) => type && add(createContactBlock(type, layoutIds(layout), data))}
                  />
                )}
                renderItem={(block, updateBlock) => (
                  <BlockEditor
                    block={block}
                    onChange={updateBlock}
                    columns={layout.columns}
                    columnId={column.id}
                    onMove={(toColumnId) => setLayout(moveContactBlock(layout, block.id, toColumnId))}
                  />
                )}
              />
            </>
          )}
        />
      </FormGroup>
    </>
  );
}
