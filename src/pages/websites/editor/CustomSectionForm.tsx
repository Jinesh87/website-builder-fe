import { RichTextField } from "./RichTextField.tsx";
import type { ReactNode } from "react";
import type { CustomBlock, CustomData } from "../../../site-kit/index.ts";
import { FormGroup, ImageField, ItemList, LinkField, SelectField, TextField } from "./fields.tsx";
import { blockImageSize } from "./media-dimensions.ts";

type Path = number[];

type EditableBlock = { path: Path; block: CustomBlock };

/** Leaf blocks in reading order; containers only carry layout, which the AI Copilot owns. */
function collectEditable(blocks: CustomBlock[], parent: Path = []): EditableBlock[] {
  return blocks.flatMap((block, index) => {
    const path = [...parent, index];
    return "children" in block ? collectEditable(block.children ?? [], path) : [{ path, block }];
  });
}

function replaceAt(blocks: CustomBlock[], path: Path, next: CustomBlock): CustomBlock[] {
  const [index, ...rest] = path;
  return blocks.map((block, i) => {
    if (i !== index) return block;
    if (rest.length === 0) return next;
    return "children" in block ? { ...block, children: replaceAt(block.children, rest, next) } : block;
  });
}

const WIDTH_OPTIONS: { value: NonNullable<CustomData["width"]>; label: string }[] = [
  { value: "contained", label: "Contained" },
  { value: "wide", label: "Wide" },
];

const ALIGN_OPTIONS: { value: NonNullable<CustomData["align"]>; label: string }[] = [
  { value: "start", label: "Left" },
  { value: "center", label: "Center" },
];

function BlockFields({ block, onChange }: { block: CustomBlock; onChange: (block: CustomBlock) => void }): ReactNode {
  switch (block.type) {
    case "heading":
      return (
        <RichTextField
          label={`Heading (H${block.level ?? 2})`}
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          maxLength={200}
          required
        />
      );
    case "text":
      return (
        <RichTextField multiline
          label="Text"
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          maxLength={1200}
          required
        />
      );
    case "badge":
      return (
        <RichTextField label="Badge" value={block.text} onChange={(text) => onChange({ ...block, text })} maxLength={60} required />
      );
    case "button":
      return (
        <LinkField
          label={block.tone === "secondary" ? "Secondary button" : "Button"}
          value={{ label: block.label, href: block.href }}
          onChange={(link) => onChange({ ...block, label: link.label, href: link.href })}
        />
      );
    case "image":
      return (
        <ImageField
          label="Image"
          value={{ url: block.url, alt: block.alt }}
          onChange={(image) => image && onChange({ ...block, url: image.url, alt: image.alt })}
          dimensionHint={blockImageSize(block.aspect)}
        />
      );
    case "list":
      return (
        <ItemList<string>
          label="List items"
          items={block.items}
          max={12}
          onChange={(items) => onChange({ ...block, items })}
          create={() => "New item"}
          itemTitle={(item) => item}
          addLabel="Add item"
          renderItem={(item, update) => <TextField label="Text" value={item} onChange={update} maxLength={200} required />}
        />
      );
    default:
      return null;
  }
}

export default function CustomSectionForm({ data, onChange }: { data: CustomData; onChange: (data: CustomData) => void }) {
  const editable = collectEditable(data.blocks ?? []).filter(({ block }) => block.type !== "icon");

  return (
    <>
      <FormGroup title="Layout" description="Ask the AI Copilot to change the structure, columns or cards.">
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Width"
            value={data.width ?? "contained"}
            options={WIDTH_OPTIONS}
            onChange={(width) => onChange({ ...data, width })}
          />
          <SelectField
            label="Alignment"
            value={data.align ?? "start"}
            options={ALIGN_OPTIONS}
            onChange={(align) => onChange({ ...data, align })}
          />
        </div>
      </FormGroup>

      <FormGroup title="Content" badge={`${editable.length} blocks`}>
        {editable.map(({ path, block }) => (
          <BlockFields
            key={path.join(".")}
            block={block}
            onChange={(next) => onChange({ ...data, blocks: replaceAt(data.blocks, path, next) })}
          />
        ))}
      </FormGroup>
    </>
  );
}
