import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Extension, Mark, type Editor, type JSONContent } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import HardBreak from "@tiptap/extension-hard-break";
import { history, redo, undo } from "@tiptap/pm/history";
import { Plugin } from "@tiptap/pm/state";
import { EditorContent, useEditor } from "@tiptap/react";
import { Bold as BoldIcon, Highlighter, Italic as ItalicIcon, RemoveFormatting, SlidersHorizontal, Strikethrough, Type, Underline as UnderlineIcon } from "lucide-react";
import {
  cleanColor,
  cleanFontSize,
  cleanRichTextStyle,
  FONT_CATEGORIES,
  FONT_KEYS,
  FONTS,
  fontStack,
  isFontKey,
  parseRichTextTree,
  richTextSpanAttributeMap,
  richTextStyleFromAttributes,
  serializeRichTextTree,
  toPlainText,
  type RichTextNode,
  type RichTextStyle,
} from "../../../site-kit/index.ts";

type RichTextFieldProps = {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  /** Counts visible characters only; formatting markup is free. */
  maxLength?: number;
  required?: boolean;
  /** Multi-line fields keep line breaks as "\n", like the textarea they replace. */
  multiline?: boolean;
  rows?: number;
};

type StylePatch = { [K in keyof RichTextStyle]?: RichTextStyle[K] | undefined };

const STYLE_MARK = "wbStyle";
const GRADIENT_MARK = "wbGradient";

const PALETTE = [
  "#0f172a", "#334155", "#64748b", "#ffffff",
  "#dc2626", "#ea580c", "#d97706", "#16a34a",
  "#0d9488", "#2563eb", "#4f46e5", "#9333ea",
  "#db2777", "#facc15", "#fde68a", "#bfdbfe",
];

const WEIGHT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "300", label: "Light 300" },
  { value: "400", label: "Regular 400" },
  { value: "500", label: "Medium 500" },
  { value: "600", label: "Semibold 600" },
  { value: "700", label: "Bold 700" },
  { value: "800", label: "Extra bold 800" },
  { value: "900", label: "Black 900" },
];

const LETTER_SPACING_OPTIONS = [
  { value: "", label: "Default" },
  { value: "-0.04em", label: "Tighter" },
  { value: "-0.02em", label: "Tight" },
  { value: "0.02em", label: "Wide" },
  { value: "0.06em", label: "Wider" },
  { value: "0.12em", label: "Widest" },
];

const LINE_HEIGHT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "1", label: "1.0" },
  { value: "1.15", label: "1.15" },
  { value: "1.3", label: "1.3" },
  { value: "1.5", label: "1.5" },
  { value: "1.75", label: "1.75" },
  { value: "2", label: "2.0" },
];

const TRANSFORM_OPTIONS = [
  { value: "", label: "Default" },
  { value: "uppercase", label: "UPPERCASE" },
  { value: "lowercase", label: "lowercase" },
  { value: "capitalize", label: "Capitalize" },
  { value: "none", label: "As typed" },
];

const SIZE_PRESETS = ["12", "14", "16", "18", "20", "24", "28", "32", "40", "48", "56", "64", "72", "96"];

const recentColors: string[] = [];

function rememberColor(color: string) {
  const index = recentColors.indexOf(color);
  if (index >= 0) recentColors.splice(index, 1);
  recentColors.unshift(color);
  recentColors.length = Math.min(recentColors.length, 8);
}

/** Inline style mark; previews color, weight, style and font in the field, the rest only on the canvas. */
function spanStyle(element: HTMLElement): RichTextStyle | undefined {
  const attributes: Record<string, string> = {};
  for (const name of ["style", "data-font", "data-size-tablet", "data-size-mobile"]) {
    const value = element.getAttribute(name);
    if (value) attributes[name] = value;
  }
  return richTextStyleFromAttributes(attributes);
}

const StyleMark = Mark.create({
  name: STYLE_MARK,
  priority: 1100,
  addAttributes() {
    // Not named "style": TipTap would fill an attribute named like a DOM attribute with that attribute's raw string.
    return { textStyle: { default: null, rendered: false, parseHTML: (element) => spanStyle(element) ?? null } };
  },
  parseHTML() {
    return [{ tag: "span", getAttrs: (element) => (spanStyle(element as HTMLElement) ? null : false) }];
  },
  renderHTML({ mark }) {
    const style = (mark.attrs.textStyle ?? undefined) as RichTextStyle | undefined;
    const preview: string[] = [];
    if (style?.color) preview.push(`color:${style.color}`);
    if (style?.background) preview.push(`background-color:${style.background}`);
    if (style?.fontWeight) preview.push(`font-weight:${style.fontWeight}`);
    if (style?.italic) preview.push("font-style:italic");
    if (style?.fontFamily) preview.push(`font-family:${fontStack(style.fontFamily)}`);
    if (style?.textDecoration) preview.push(`text-decoration:${style.textDecoration}`);
    return ["span", { style: preview.join(";") }, 0];
  },
});

const GradientMark = Mark.create({
  name: GRADIENT_MARK,
  parseHTML() {
    return [{ tag: "mark" }];
  },
  renderHTML() {
    return ["mark", { class: "wb-rt-editor-gradient" }, 0];
  },
});

function editorBehavior(multiline: boolean, maxLength: number | undefined) {
  return Extension.create({
    name: "wbFieldBehavior",
    addProseMirrorPlugins() {
      const plugins = [history()];
      if (maxLength) {
        plugins.push(
          new Plugin({
            filterTransaction: (transaction, state) =>
              !transaction.docChanged ||
              transaction.doc.textContent.length <= maxLength ||
              transaction.doc.textContent.length <= state.doc.textContent.length,
          }),
        );
      }
      return plugins;
    },
    addKeyboardShortcuts() {
      return {
        "Mod-z": () => undo(this.editor.state, this.editor.view.dispatch),
        "Mod-y": () => redo(this.editor.state, this.editor.view.dispatch),
        "Shift-Mod-z": () => redo(this.editor.state, this.editor.view.dispatch),
        Enter: () => (multiline ? this.editor.commands.setHardBreak() : true),
        "Mod-\\": () => this.editor.chain().selectAll().unsetAllMarks().run(),
      };
    },
  });
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function nodesToEditorHtml(nodes: RichTextNode[]): string {
  let out = "";
  for (const node of nodes) {
    if (typeof node === "string") {
      out += escapeHtml(node).replace(/\n/g, "<br>");
      continue;
    }
    if (node.tag === "br") {
      out += "<br>";
      continue;
    }
    const inner = nodesToEditorHtml(node.children);
    if (node.tag === "span") {
      const attributes = Object.entries(richTextSpanAttributeMap(node.style))
        .map(([name, value]) => ` ${name}="${escapeHtml(value).replace(/"/g, "&quot;")}"`)
        .join("");
      out += attributes ? `<span${attributes}>${inner}</span>` : inner;
      continue;
    }
    out += `<${node.tag}>${inner}</${node.tag}>`;
  }
  return out;
}

function storageToEditorHtml(value: string): string {
  return `<p>${nodesToEditorHtml(parseRichTextTree(value))}</p>`;
}

const MARK_TAGS: Record<string, string> = { bold: "strong", italic: "em", underline: "u", strike: "s", [GRADIENT_MARK]: "mark" };
const MARK_ORDER = [STYLE_MARK, "bold", "italic", "underline", "strike", GRADIENT_MARK];

function textNodeToStorage(node: JSONContent): RichTextNode[] {
  const marks = [...(node.marks ?? [])].sort((a, b) => MARK_ORDER.indexOf(a.type) - MARK_ORDER.indexOf(b.type));
  let content: RichTextNode[] = [node.text ?? ""];
  for (const mark of [...marks].reverse()) {
    if (mark.type === STYLE_MARK) {
      const style = cleanRichTextStyle(mark.attrs?.textStyle as RichTextStyle | undefined);
      if (style) content = [{ tag: "span", style, children: content }];
      continue;
    }
    const tag = MARK_TAGS[mark.type];
    if (tag) content = [{ tag: tag as "strong", children: content }];
  }
  return content;
}

function editorToStorage(doc: JSONContent, multiline: boolean): string {
  const nodes: RichTextNode[] = [];
  const lineBreak = (): RichTextNode => (multiline ? "\n" : { tag: "br" });
  (doc.content ?? []).forEach((paragraph, index) => {
    if (index > 0) nodes.push(multiline ? lineBreak() : " ");
    for (const child of paragraph.content ?? []) {
      if (child.type === "text") nodes.push(...textNodeToStorage(child));
      else if (child.type === "hardBreak") nodes.push(lineBreak());
    }
  });
  return serializeRichTextTree(nodes);
}

type SavedSelection = { current: { from: number; to: number } | null };

/**
 * Selection, or the whole text when nothing is selected. Toolbar controls
 * work on the selection saved when the toolbar was pressed, because moving
 * focus to a control (keyboard, touch, color input) can collapse the live one.
 */
function targetRange(editor: Editor, saved: SavedSelection): { from: number; to: number; whole: boolean } {
  const size = editor.state.doc.content.size;
  const range = saved.current && saved.current.to <= size ? saved.current : editor.state.selection;
  if (range.from !== range.to) return { from: range.from, to: range.to, whole: false };
  return { from: 0, to: size, whole: true };
}

function applyStyle(editor: Editor, saved: SavedSelection, patch: StylePatch) {
  const { from, to } = targetRange(editor, saved);
  const type = editor.schema.marks[STYLE_MARK]!;
  const { tr, doc } = editor.state;
  doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText) return;
    const start = Math.max(pos, from);
    const end = Math.min(pos + node.nodeSize, to);
    const current = (node.marks.find((mark) => mark.type === type)?.attrs.textStyle ?? {}) as RichTextStyle;
    const merged = cleanRichTextStyle({ ...current, ...patch } as RichTextStyle);
    if (merged) tr.addMark(start, end, type.create({ textStyle: merged }));
    else tr.removeMark(start, end, type);
  });
  if (tr.docChanged || tr.steps.length > 0) editor.view.dispatch(tr);
}

function onTarget(editor: Editor, saved: SavedSelection, command: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) {
  const { from, to, whole } = targetRange(editor, saved);
  const restore = saved.current ?? { from: editor.state.selection.from, to: editor.state.selection.to };
  const chain = whole ? editor.chain().focus().selectAll() : editor.chain().focus().setTextSelection({ from, to });
  command(chain).setTextSelection(restore).run();
}

function toggleMark(editor: Editor, saved: SavedSelection, name: "bold" | "italic" | "underline" | "strike") {
  onTarget(editor, saved, (chain) => chain.toggleMark(name));
}

function clearFormatting(editor: Editor, saved: SavedSelection) {
  onTarget(editor, saved, (chain) => chain.unsetAllMarks());
}

function activeStyle(editor: Editor, saved: SavedSelection): RichTextStyle {
  const { from, whole } = targetRange(editor, saved);
  const type = editor.schema.marks[STYLE_MARK]!;
  let found: RichTextStyle | undefined;
  editor.state.doc.nodesBetween(whole ? 0 : from, editor.state.doc.content.size, (node) => {
    if (found || !node.isText) return !found;
    found = (node.marks.find((mark) => mark.type === type)?.attrs.textStyle ?? {}) as RichTextStyle;
    return false;
  });
  return found ?? {};
}

function isMarkActive(editor: Editor, saved: SavedSelection, name: string): boolean {
  const { from, to } = targetRange(editor, saved);
  let all = true;
  let any = false;
  editor.state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) return;
    any = true;
    if (!node.marks.some((mark) => mark.type.name === name)) all = false;
  });
  return any && all;
}

function ToolButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex size-6 shrink-0 items-center justify-center rounded-[5px] transition-colors ${
        active ? "bg-ed-accent text-white" : "text-ed-muted hover:bg-ed-hover hover:text-ed-text"
      }`}
    >
      {children}
    </button>
  );
}

const smallInput =
  "h-7 w-full rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-xs text-ed-text focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15";

function SmallSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-ed-2xs font-medium text-ed-muted">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={smallInput}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SizeInput({ label, value, placeholder, onChange }: { label: string; value: string | undefined; placeholder?: string; onChange: (value: string | undefined) => void }) {
  const listId = useId();
  const [draft, setDraft] = useState(value?.replace(/px$/, "") ?? "");
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setDraft(value?.replace(/px$/, "") ?? "");
  }
  const commit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return onChange(undefined);
    const size = cleanFontSize(trimmed);
    if (size) onChange(size);
  };
  return (
    <label className="flex flex-col gap-1 text-ed-2xs font-medium text-ed-muted">
      {label}
      <input
        value={draft}
        list={listId}
        inputMode="decimal"
        placeholder={placeholder ?? "Auto"}
        onChange={(event) => {
          setDraft(event.target.value);
          commit(event.target.value);
        }}
        className={smallInput}
      />
      <datalist id={listId}>
        {SIZE_PRESETS.map((size) => (
          <option key={size} value={size} />
        ))}
      </datalist>
    </label>
  );
}

function ColorPanel({ value, onChange }: { value: string | undefined; onChange: (color: string | undefined) => void }) {
  const [hex, setHex] = useState(value ?? "");
  const pick = (color: string | undefined) => {
    if (color) rememberColor(color);
    setHex(color ?? "");
    onChange(color);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-8 gap-1">
        {PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            aria-label={`Use ${color}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(color)}
            className={`size-6 rounded-[5px] border ${value === color ? "border-ed-accent ring-2 ring-ed-accent/30" : "border-ed-border"}`}
            style={{ background: color }}
          />
        ))}
      </div>
      {recentColors.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-ed-2xs text-ed-muted">Recent</span>
          {recentColors.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              aria-label={`Use ${color}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(color)}
              className="size-5 rounded-[4px] border border-ed-border"
              style={{ background: color }}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          aria-label="Custom color"
          value={cleanColor(value)?.startsWith("#") && value!.length === 7 ? value : "#000000"}
          onChange={(event) => pick(event.target.value)}
          className="h-7 w-9 shrink-0 cursor-pointer rounded-ed border border-ed-border bg-ed-panel p-0.5"
        />
        <input
          value={hex}
          placeholder="#000000"
          aria-label="Hex color"
          onChange={(event) => {
            setHex(event.target.value);
            const color = cleanColor(event.target.value);
            if (color?.startsWith("#")) onChange(color);
          }}
          className={`${smallInput} font-mono`}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => pick(undefined)}
          className="h-7 shrink-0 rounded-ed px-2 text-ed-2xs font-medium text-ed-muted hover:bg-ed-hover hover:text-ed-danger"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

type Panel = "color" | "highlight" | "font" | "more" | null;

function Toolbar({ editor, saved, panel, setPanel }: { editor: Editor; saved: SavedSelection; panel: Panel; setPanel: (panel: Panel) => void }) {
  const style = activeStyle(editor, saved);
  const { whole } = targetRange(editor, saved);
  const toggle = (next: Panel) => setPanel(panel === next ? null : next);
  const set = (patch: StylePatch) => applyStyle(editor, saved, patch);
  const saveSelection = () => {
    saved.current ??= { from: editor.state.selection.from, to: editor.state.selection.to };
  };

  return (
    <div className="flex flex-col gap-1.5" onPointerDownCapture={saveSelection} onFocusCapture={saveSelection}>
      <div className="flex items-center gap-0.5 rounded-ed border border-ed-border bg-ed-subtle/60 p-0.5">
        <ToolButton label="Bold (⌘B)" active={isMarkActive(editor, saved, "bold")} onClick={() => toggleMark(editor, saved, "bold")}>
          <BoldIcon className="size-3.5" />
        </ToolButton>
        <ToolButton label="Italic (⌘I)" active={isMarkActive(editor, saved, "italic")} onClick={() => toggleMark(editor, saved, "italic")}>
          <ItalicIcon className="size-3.5" />
        </ToolButton>
        <ToolButton label="Underline (⌘U)" active={isMarkActive(editor, saved, "underline")} onClick={() => toggleMark(editor, saved, "underline")}>
          <UnderlineIcon className="size-3.5" />
        </ToolButton>
        <ToolButton label="Strikethrough" active={isMarkActive(editor, saved, "strike")} onClick={() => toggleMark(editor, saved, "strike")}>
          <Strikethrough className="size-3.5" />
        </ToolButton>
        <span className="mx-0.5 h-4 w-px bg-ed-border" />
        <ToolButton label="Text color" active={panel === "color"} onClick={() => toggle("color")}>
          <span className="flex flex-col items-center leading-none">
            <span className="text-[12px] font-bold">A</span>
            <span className="mt-px h-[3px] w-3.5 rounded-full border border-black/10" style={{ background: style.color ?? "currentColor" }} />
          </span>
        </ToolButton>
        <ToolButton label="Highlight" active={panel === "highlight"} onClick={() => toggle("highlight")}>
          <Highlighter className="size-3.5" style={style.background ? { color: style.background } : undefined} />
        </ToolButton>
        <ToolButton label="Font family" active={panel === "font"} onClick={() => toggle("font")}>
          <Type className="size-3.5" />
        </ToolButton>
        <ToolButton label="Size, weight & spacing" active={panel === "more"} onClick={() => toggle("more")}>
          <SlidersHorizontal className="size-3.5" />
        </ToolButton>
        <span className="mx-0.5 h-4 w-px bg-ed-border" />
        <ToolButton label="Clear formatting (⌘\)" onClick={() => clearFormatting(editor, saved)}>
          <RemoveFormatting className="size-3.5" />
        </ToolButton>
        <span className="ml-auto truncate pr-1 text-[10px] font-medium text-ed-faint">{whole ? "Whole text" : "Selection"}</span>
      </div>

      {panel && (
        <div className="rounded-ed-lg border border-ed-border bg-ed-panel p-2.5 shadow-ed-pop">
          {panel === "color" && <ColorPanel key="color" value={style.color} onChange={(color) => set({ color })} />}
          {panel === "highlight" && <ColorPanel key="highlight" value={style.background} onChange={(background) => set({ background })} />}
          {panel === "font" && (
            <SmallSelect
              label="Font family"
              value={style.fontFamily ?? ""}
              options={[
                { value: "", label: "Default (section font)" },
                ...FONT_CATEGORIES.flatMap((category) =>
                  FONT_KEYS.filter((key) => FONTS[key].category === category).map((key) => ({ value: key, label: FONTS[key].label })),
                ),
              ]}
              onChange={(font) => set({ fontFamily: isFontKey(font) ? font : undefined })}
            />
          )}
          {panel === "more" && (
            <div className="grid grid-cols-3 gap-2">
              <SizeInput label="Size (desktop)" value={style.fontSize} onChange={(fontSize) => set({ fontSize })} />
              <SizeInput label="Tablet" value={style.fontSizeTablet} placeholder="Same" onChange={(fontSizeTablet) => set({ fontSizeTablet })} />
              <SizeInput label="Mobile" value={style.fontSizeMobile} placeholder="Same" onChange={(fontSizeMobile) => set({ fontSizeMobile })} />
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <SmallSelect label="Weight" value={style.fontWeight ?? ""} options={WEIGHT_OPTIONS} onChange={(fontWeight) => set({ fontWeight: fontWeight || undefined })} />
                <SmallSelect
                  label="Case"
                  value={style.textTransform ?? ""}
                  options={TRANSFORM_OPTIONS}
                  onChange={(textTransform) => set({ textTransform: (textTransform || undefined) as RichTextStyle["textTransform"] })}
                />
                <SmallSelect label="Letter spacing" value={style.letterSpacing ?? ""} options={LETTER_SPACING_OPTIONS} onChange={(letterSpacing) => set({ letterSpacing: letterSpacing || undefined })} />
                <SmallSelect label="Line height" value={style.lineHeight ?? ""} options={LINE_HEIGHT_OPTIONS} onChange={(lineHeight) => set({ lineHeight: lineHeight || undefined })} />
              </div>
              <p className="col-span-3 text-ed-2xs leading-normal text-ed-muted">Sizes in px. Leave tablet and mobile empty to use the desktop size.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Text input with inline formatting. Select words to style just them; with
 * nothing selected, the toolbar styles the whole text of this field only.
 */
export function RichTextField({ label, value = "", onChange, placeholder, hint, maxLength, required, multiline = false, rows = 3 }: RichTextFieldProps) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [focused, setFocused] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const savedSelection = useRef<{ from: number; to: number } | null>(null);
  const releaseSelection = () => {
    savedSelection.current = null;
  };

  const editor = useEditor({
    immediatelyRender: true,
    shouldRerenderOnTransaction: true,
    extensions: [
      Document.extend({ content: "paragraph+" }),
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      HardBreak.extend({ addKeyboardShortcuts: () => ({ "Shift-Enter": ({ editor: e }) => e.commands.setHardBreak() }) }),
      StyleMark,
      GradientMark,
      editorBehavior(multiline, maxLength),
    ],
    content: storageToEditorHtml(value),
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-label": label,
        "aria-multiline": String(multiline),
        class: "wb-rt-editor min-h-8 w-full px-2.5 py-[5px] text-ed-sm leading-relaxed text-ed-text outline-none",
        style: multiline ? `min-height:${Math.max(rows, 2) * 1.625 + 0.75}em` : "",
      },
      transformPastedText: (text) => (multiline ? text : text.replace(/\s*\n\s*/g, " ")),
    },
    onUpdate: ({ editor: instance }) => {
      const next = editorToStorage(instance.getJSON(), multiline);
      if (next === lastEmitted.current) return;
      lastEmitted.current = next;
      onChangeRef.current(next);
    },
  });

  useEffect(() => {
    if (!focused) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) return;
      setFocused(false);
      setPanel(null);
      savedSelection.current = null;
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, [focused]);

  useEffect(() => {
    if (!editor || value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(storageToEditorHtml(value), { emitUpdate: false });
  }, [editor, value]);

  const plainLength = toPlainText(value, "").length;
  const empty = plainLength === 0;
  const message = required && !toPlainText(value).trim() ? "Required" : undefined;

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col gap-1"
      onFocus={() => setFocused(true)}
      onPointerDown={() => setFocused(true)}
      onBlur={(event) => {
        // Only keyboard moves to another control close the toolbar; a native color picker or window switch has no related target.
        const next = event.relatedTarget as Node | null;
        if (!next || wrapperRef.current?.contains(next)) return;
        setFocused(false);
        setPanel(null);
        releaseSelection();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && panel) {
          event.stopPropagation();
          setPanel(null);
          editor?.commands.focus();
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-ed-xs font-medium text-ed-text" onClick={() => editor?.commands.focus("end")}>
          {label}
        </label>
        {maxLength && (focused || plainLength > maxLength * 0.9) && (
          <span className={`text-ed-2xs tabular-nums ${plainLength >= maxLength ? "text-ed-danger" : "text-ed-faint"}`}>
            {plainLength}/{maxLength}
          </span>
        )}
      </div>
      {editor && (focused || panel) && <Toolbar editor={editor} saved={savedSelection} panel={panel} setPanel={setPanel} />}
      <div
        aria-invalid={message ? true : undefined}
        className={`relative w-full rounded-ed border bg-ed-panel shadow-ed-xs transition-all duration-150 ${
          message ? "border-ed-danger" : focused ? "border-ed-accent ring-2 ring-ed-accent/15" : "border-ed-border hover:border-ed-border-strong"
        }`}
      >
        {empty && placeholder && (
          <span className="pointer-events-none absolute left-2.5 top-[5px] text-ed-sm leading-relaxed text-ed-faint">{placeholder}</span>
        )}
        <EditorContent editor={editor} onPointerDown={releaseSelection} onKeyDown={releaseSelection} />
      </div>
      {message ? <p className="text-ed-2xs font-medium text-ed-danger">{message}</p> : hint && <p className="text-ed-2xs leading-normal text-ed-muted">{hint}</p>}
    </div>
  );
}
