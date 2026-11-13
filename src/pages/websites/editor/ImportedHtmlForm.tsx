import { useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CopyPlus,
  Image as ImageIcon,
  Link2,
  MousePointerClick,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Type,
} from "lucide-react";
import { onImportedFocus, recentImportedFocus } from "../../../features/builder/imported-focus.ts";
import {
  duplicateImportedElement,
  duplicateImportedItem,
  entryKey,
  moveImportedItem,
  readImportedOutline,
  removeImportedElement,
  removeImportedItem,
  type OutlineEntry,
  type OutlineGroup,
} from "../../../site-kit/imported-html-structure.ts";
import {
  convertImportedSection,
  extractImportedContent,
  suggestSectionTypes,
  type ConvertibleType,
} from "../../../site-kit/imported-html-convert.ts";
import { SECTION_DEFINITIONS } from "../../../site-kit/registry.ts";
import { renderToStaticMarkup } from "react-dom/server";
import {
  applyImportedHtmlEdits,
  applyImportedLinkEdit,
  applyImportedLinkIcon,
} from "../../../site-kit/sections/ImportedHtmlSection.tsx";
import { SiteIcon } from "../../../site-kit/primitives.tsx";
import { IconPickerField } from "./IconPicker.tsx";
import type {
  ImportedHtmlData,
  ImportedHtmlMediaSlot,
  ImportedHtmlText,
  LinkRef,
  Section,
  SectionOf,
} from "../../../site-kit/types.ts";
import { ImageField, LinkField, LinkTargetsContext, TextAreaField, TextField, VideoField } from "./fields.tsx";

type Props = {
  section: SectionOf<"imported_html">;
  onChange: (data: ImportedHtmlData) => void;
  /** Swaps this block for a native builder section (same position and id). */
  onReplace: (section: Section) => void;
};

const buttonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-ed-lg border border-ed-border bg-ed-panel px-3 py-1.5 text-ed-xs font-semibold text-ed-text transition-colors hover:bg-ed-hover";

/** Notice + button to swap a section with the version it was converted from/to. */
export function SwitchBackBar({ text, action, onSwitch }: { text: string; action: string; onSwitch: () => void }) {
  return (
    <div className="mb-5 flex flex-col gap-2 rounded-ed-lg border border-ed-accent/30 bg-ed-accent/5 p-3">
      <p className="text-ed-xs text-ed-muted">{text}</p>
      <button type="button" onClick={onSwitch} className={`${buttonClass} w-full py-2`}>
        {action}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function IconAction({
  label,
  onClick,
  disabled,
  tone,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "danger";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-ed-md text-ed-muted transition-colors hover:bg-ed-hover disabled:pointer-events-none disabled:opacity-30 ${tone === "danger" ? "hover:text-red-600" : "hover:text-ed-text"}`}
    >
      {children}
    </button>
  );
}

/** Collapsible panel with a title row (used for "Content" and for each card). */
function Panel({
  title,
  icon,
  open,
  onToggle,
  actions,
  children,
  highlighted,
}: {
  title: ReactNode;
  icon?: ReactNode;
  open: boolean;
  onToggle: () => void;
  actions?: ReactNode;
  children: ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded-ed-lg border bg-ed-panel transition-colors ${highlighted ? "border-ed-accent" : "border-ed-border"}`}>
      <div className="group flex items-center gap-1 px-2 py-1.5">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-1.5 text-left" aria-expanded={open}>
          {open ? <ChevronDown className="size-3.5 shrink-0 text-ed-muted" aria-hidden /> : <ChevronRight className="size-3.5 shrink-0 text-ed-muted" aria-hidden />}
          {icon}
          <span className="truncate text-ed-xs font-semibold text-ed-text">{title}</span>
        </button>
        {actions ? <div className="flex shrink-0 items-center opacity-60 transition-opacity group-hover:opacity-100">{actions}</div> : null}
      </div>
      {open ? <div className="space-y-3 border-t border-ed-border/70 px-3 py-3">{children}</div> : null}
    </div>
  );
}

/** Wraps one field: hover shows "add another like this" / "remove"; flashes when jumped to. */
function EntryShell({
  entryKey: key,
  focused,
  what,
  onDuplicate,
  onRemove,
  children,
}: {
  entryKey: string;
  focused: boolean;
  what: string;
  onDuplicate: () => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div
      data-entry={key}
      className={`group relative rounded-ed-md transition-shadow ${focused ? "ring-2 ring-ed-accent ring-offset-2 ring-offset-ed-panel" : ""}`}
    >
      <div className="absolute right-0 top-0 z-10 flex gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <IconAction label={`Add another ${what} like this`} onClick={onDuplicate}>
          <Plus className="size-3.5" aria-hidden />
        </IconAction>
        <IconAction label={`Remove this ${what}`} tone="danger" onClick={onRemove}>
          <Trash2 className="size-3.5" aria-hidden />
        </IconAction>
      </div>
      {children}
    </div>
  );
}

/** Button/link: its words and where it goes, side by side; rarer options behind "More". */
/** Static markup for a picked icon/logo, tagged so the picker can show it again. */
function linkIconMarkup(link: LinkRef): string {
  const name = link.iconImage?.url || link.icon;
  if (!name) return "";
  const holder = document.createElement("div");
  holder.innerHTML = renderToStaticMarkup(<SiteIcon name={link.icon} image={link.iconImage} inline />);
  const icon = holder.querySelector("svg, img");
  if (!icon) return "";
  for (const attr of ["class", "style", "width", "height", "aria-hidden"]) icon.removeAttribute(attr);
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("data-wb-icon", name);
  return icon.outerHTML;
}

function LinkEntry({ link, hasText, hasIcon, onChange }: { link: LinkRef; hasText: boolean; hasIcon: boolean; onChange: (next: LinkRef) => void }) {
  const [more, setMore] = useState(false);
  const targets = useContext(LinkTargetsContext);
  const listId = useMemo(() => `imported-link-${Math.random().toString(36).slice(2)}`, []);
  if (more) {
    return (
      <div className="space-y-2">
        <LinkField label={hasText ? "Button / link" : `${link.label} (image link)`} value={link} onChange={onChange} />
        <button type="button" className="text-ed-2xs font-semibold text-ed-accent" onClick={() => setMore(false)}>
          Fewer options
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {hasText ? (
        <TextField label="Button / link text" value={link.label} onChange={(label) => onChange({ ...link, label })} />
      ) : (
        <p className="text-ed-xs font-medium text-ed-text">
          {link.label} <span className="font-normal text-ed-muted">({hasIcon ? "icon link" : "image link"})</span>
        </p>
      )}
      {hasIcon ? (
        <IconPickerField
          label="Icon / logo"
          value={link.icon}
          imageValue={link.iconImage}
          hint="Pick a social media logo or any icon."
          onChange={({ icon, iconImage }) => onChange({ ...link, icon, iconImage })}
        />
      ) : null}
      <TextField
        label="Goes to"
        value={link.actionType === "video" ? link.videoUrl || link.href : link.href}
        onChange={(href) => onChange({ ...link, href, ...(link.actionType === "video" ? { videoUrl: href } : {}) })}
        placeholder="Pick a page or paste a link"
        list={listId}
      />
      <datalist id={listId}>
        {targets.map((target) => (
          <option key={target.href} value={target.href}>
            {target.label}
          </option>
        ))}
      </datalist>
      <button type="button" className="inline-flex items-center gap-1 text-ed-2xs font-semibold text-ed-accent" onClick={() => setMore(true)}>
        <SlidersHorizontal className="size-3" aria-hidden /> More: new tab, download, video{hasIcon ? "" : ", add an icon"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editing logic shared by blocks and the imported header/footer
// ---------------------------------------------------------------------------

function withSyncedHtml(data: ImportedHtmlData, texts: ImportedHtmlText[], mediaSlots: ImportedHtmlMediaSlot[]): ImportedHtmlData {
  return { ...data, texts, mediaSlots, html: applyImportedHtmlEdits(data.html || "", texts, mediaSlots) };
}

function useEditing(data: ImportedHtmlData, onChange: (data: ImportedHtmlData) => void) {
  const texts = data.texts ?? [];
  const slots = data.mediaSlots ?? [];
  return {
    text(id: string, value: string) {
      onChange(withSyncedHtml(data, texts.map((item) => (item.id === id ? { ...item, value } : item)), slots));
    },
    media(key: string, patch: Partial<ImportedHtmlMediaSlot>) {
      onChange(withSyncedHtml(data, texts, slots.map((slot) => (slot.key === key ? { ...slot, ...patch } : slot))));
    },
    link(entry: Extract<OutlineEntry, { kind: "link" }>, next: LinkRef) {
      let html = applyImportedLinkEdit(data.html || "", entry.index, next);
      const iconChanged = (next.icon || "") !== (entry.link.icon || "") || (next.iconImage?.url || "") !== (entry.link.iconImage?.url || "");
      if (iconChanged) html = applyImportedLinkIcon(html, entry.index, linkIconMarkup(next));
      // The link's words are also a text entry: keep both in step.
      const nextTexts = entry.textId && entry.hasText ? texts.map((item) => (item.id === entry.textId ? { ...item, value: next.label } : item)) : texts;
      onChange({ ...data, html, texts: nextTexts });
    },
  };
}

function EntryField({
  entry,
  data,
  onChange,
  focused,
}: {
  entry: OutlineEntry;
  data: ImportedHtmlData;
  onChange: (data: ImportedHtmlData) => void;
  focused: boolean;
}) {
  const edit = useEditing(data, onChange);
  const what = entry.kind === "link" ? "button" : entry.kind === "media" ? entry.slot.kind : "text";
  let field: ReactNode;
  if (entry.kind === "text") {
    const long = entry.value.length > 70 || entry.value.includes("\n");
    field = long ? (
      <TextAreaField label={entry.label} value={entry.value} onChange={(value) => edit.text(entry.id, value)} rows={Math.min(6, Math.ceil(entry.value.length / 45))} />
    ) : (
      <TextField label={entry.label} value={entry.value} onChange={(value) => edit.text(entry.id, value)} />
    );
  } else if (entry.kind === "link") {
    field = <LinkEntry link={entry.link} hasText={entry.hasText} hasIcon={entry.hasIcon} onChange={(next) => edit.link(entry, next)} />;
  } else if (entry.slot.kind === "video") {
    field = (
      <VideoField
        label={entry.slot.alt ? `Video: ${entry.slot.alt.slice(0, 40)}` : "Video"}
        value={entry.slot.url}
        onChange={(url) => edit.media(entry.key, { url: url || "" })}
        optional={false}
        mode="any"
      />
    );
  } else {
    field = (
      <ImageField
        label={entry.slot.alt ? `Image: ${entry.slot.alt.slice(0, 40)}` : "Image"}
        value={{ url: entry.slot.url, alt: entry.slot.alt || "" }}
        onChange={(image) => edit.media(entry.key, { url: image?.url || "", alt: image?.alt || undefined })}
        optional={false}
      />
    );
  }
  return (
    <EntryShell
      entryKey={entryKey(entry)}
      focused={focused}
      what={what}
      onDuplicate={() => onChange(duplicateImportedElement(data, entry.ref))}
      onRemove={() => onChange(removeImportedElement(data, entry.ref))}
    >
      {field}
    </EntryShell>
  );
}

function matches(entry: OutlineEntry, needle: string): boolean {
  if (!needle) return true;
  const haystack =
    entry.kind === "text"
      ? `${entry.label} ${entry.value}`
      : entry.kind === "link"
        ? `${entry.link.label} ${entry.link.href}`
        : `${entry.slot.alt ?? ""} ${entry.slot.url}`;
  return haystack.toLowerCase().includes(needle);
}

function entryIcon(groupHasMedia: boolean, groupHasLink: boolean) {
  if (groupHasMedia) return <ImageIcon className="size-3.5 shrink-0 text-ed-muted" aria-hidden />;
  if (groupHasLink) return <Link2 className="size-3.5 shrink-0 text-ed-muted" aria-hidden />;
  return <Type className="size-3.5 shrink-0 text-ed-muted" aria-hidden />;
}

/**
 * The block's editable parts, laid out like the canvas: the block's own content first, then each
 * set of cards/rows with one collapsible panel per card. Clicking a part on the canvas opens and
 * highlights its field.
 */
export function ImportedHtmlFields({
  data,
  onChange,
  sectionId,
}: {
  data: ImportedHtmlData;
  onChange: (data: ImportedHtmlData) => void;
  /** Section id on the canvas (for click-to-edit). */
  sectionId?: string;
}) {
  const outline = useMemo(() => readImportedOutline(data), [data]);
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const [openPanels, setOpenPanels] = useState<Set<string>>(() => new Set(["main"]));
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) =>
    setOpenPanels((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Click-to-edit: open the panel holding the clicked part, scroll to it and highlight it.
  useEffect(() => {
    if (!sectionId) return;
    const jump = (key: string) => {
      const panel =
        outline.main.some((entry) => entryKey(entry) === key)
          ? "main"
          : outline.groups.flatMap((group) => group.items.filter((item) => item.entries.some((entry) => entryKey(entry) === key)).map((item) => `g${group.index}-${item.index}`))[0];
      if (!panel) return;
      setQuery("");
      setOpenPanels((current) => new Set(current).add(panel));
      setFocusedKey(key);
      window.setTimeout(() => {
        const el = rootRef.current?.querySelector<HTMLElement>(`[data-entry="${CSS.escape(key)}"]`);
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
        el?.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true });
      }, 60);
      window.setTimeout(() => setFocusedKey((current) => (current === key ? null : current)), 2200);
    };
    const recent = recentImportedFocus(sectionId);
    if (recent) jump(recent.key);
    return onImportedFocus((focus) => {
      if (focus.sectionId === sectionId) jump(focus.key);
    });
  }, [sectionId, outline]);

  if (outline.total === 0) {
    return (
      <p className="text-ed-xs text-ed-muted">
        Nothing editable was found in this block. It still shows exactly as imported.
      </p>
    );
  }

  const mainEntries = outline.main.filter((entry) => matches(entry, needle));
  const renderEntries = (entries: OutlineEntry[]) =>
    entries.map((entry) => (
      <EntryField key={entryKey(entry)} entry={entry} data={data} onChange={onChange} focused={focusedKey === entryKey(entry)} />
    ));

  return (
    <div ref={rootRef} className="space-y-3">
      {sectionId ? (
        <p className="flex items-center gap-1.5 text-ed-2xs text-ed-muted">
          <MousePointerClick className="size-3.5" aria-hidden /> Tip: click any text, button or image on the canvas to jump to it here.
        </p>
      ) : null}

      {outline.total > 10 ? (
        <label className="flex items-center gap-2 rounded-ed-lg border border-ed-border bg-ed-panel px-2.5 py-1.5">
          <Search className="size-3.5 text-ed-muted" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a text, link or image…"
            className="min-w-0 flex-1 bg-transparent text-ed-xs text-ed-text outline-none placeholder:text-ed-muted"
          />
        </label>
      ) : null}

      {mainEntries.length > 0 ? (
        <Panel title="Content" open={needle ? true : openPanels.has("main")} onToggle={() => toggle("main")} highlighted={Boolean(focusedKey && outline.main.some((e) => entryKey(e) === focusedKey))}>
          {renderEntries(mainEntries)}
        </Panel>
      ) : null}

      {outline.groups.map((group) => (
        <GroupPanels
          key={`${group.index}-${group.items.length}`}
          group={group}
          data={data}
          onChange={onChange}
          needle={needle}
          openPanels={openPanels}
          toggle={toggle}
          focusedKey={focusedKey}
          renderEntries={renderEntries}
        />
      ))}
    </div>
  );
}

function GroupPanels({
  group,
  data,
  onChange,
  needle,
  openPanels,
  toggle,
  focusedKey,
  renderEntries,
}: {
  group: OutlineGroup;
  data: ImportedHtmlData;
  onChange: (data: ImportedHtmlData) => void;
  needle: string;
  openPanels: Set<string>;
  toggle: (id: string) => void;
  focusedKey: string | null;
  renderEntries: (entries: OutlineEntry[]) => ReactNode;
}) {
  const items = group.items
    .map((item) => ({ ...item, visible: item.entries.filter((entry) => matches(entry, needle)) }))
    .filter((item) => !needle || item.visible.length > 0);
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="px-0.5 pt-1 text-ed-2xs font-semibold uppercase tracking-wider text-ed-muted">{group.title}</p>
      {items.map((item) => {
        const id = `g${group.index}-${item.index}`;
        return (
          <Panel
            key={id}
            title={item.label}
            icon={entryIcon(item.entries.some((e) => e.kind === "media"), item.entries.some((e) => e.kind === "link"))}
            open={needle ? true : openPanels.has(id)}
            onToggle={() => toggle(id)}
            highlighted={Boolean(focusedKey && item.entries.some((e) => entryKey(e) === focusedKey))}
            actions={
              <>
                <IconAction label="Move up" disabled={item.index === 0} onClick={() => onChange(moveImportedItem(data, group.index, item.index, -1))}>
                  <ChevronUp className="size-3.5" aria-hidden />
                </IconAction>
                <IconAction label="Move down" disabled={item.index === group.items.length - 1} onClick={() => onChange(moveImportedItem(data, group.index, item.index, 1))}>
                  <ChevronDown className="size-3.5" aria-hidden />
                </IconAction>
                <IconAction label="Add a copy below" onClick={() => onChange(duplicateImportedItem(data, group.index, item.index))}>
                  <CopyPlus className="size-3.5" aria-hidden />
                </IconAction>
                <IconAction label="Remove" tone="danger" disabled={group.items.length <= 1} onClick={() => onChange(removeImportedItem(data, group.index, item.index))}>
                  <Trash2 className="size-3.5" aria-hidden />
                </IconAction>
              </>
            }
          >
            {renderEntries(item.visible)}
          </Panel>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Block form + imported header/footer form
// ---------------------------------------------------------------------------

/** One compact row: pick a builder section type and swap the block for it. */
function ConvertRow({ section, onReplace }: Pick<Props, "section" | "onReplace">) {
  const suggestions = useMemo(() => suggestSectionTypes(extractImportedContent(section.data.html || "")), [section.data.html]);
  const [type, setType] = useState<ConvertibleType>(suggestions[0] ?? "text");
  return (
    <div className="space-y-2 rounded-ed-lg border border-ed-border bg-ed-hover/40 p-3">
      <p className="text-ed-xs font-semibold text-ed-text">Want full builder controls?</p>
      <div className="flex gap-2">
        <select
          aria-label="Builder section type"
          value={type}
          onChange={(event) => setType(event.target.value as ConvertibleType)}
          className="min-w-0 flex-1 rounded-ed-lg border border-ed-border bg-ed-panel px-2 py-1.5 text-ed-xs text-ed-text"
        >
          {suggestions.map((value, index) => (
            <option key={value} value={value}>
              {SECTION_DEFINITIONS[value].label}
              {index < 2 ? " (suggested)" : ""}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => onReplace(convertImportedSection(section, type))} className={buttonClass}>
          Convert
        </button>
      </div>
      <p className="text-ed-2xs text-ed-muted">Your text, images and buttons are copied in. You can switch back at any time.</p>
    </div>
  );
}

export default function ImportedHtmlForm({ section, onChange, onReplace }: Props) {
  const data = section.data;
  return (
    <div className="space-y-4">
      {data.chrome ? null : <ConvertRow section={section} onReplace={onReplace} />}
      <ImportedHtmlFields data={data} onChange={onChange} sectionId={section.id} />
      <TextField
        label="Block name (only shown in the builder)"
        value={data.title || ""}
        onChange={(title) => onChange({ ...data, title: title.trim() || undefined })}
      />
    </div>
  );
}

/** Imported site header/footer: edit its parts, or switch to the builder's own design. */
export function ImportedChromeForm({
  kind,
  data,
  onChange,
  onUseBuilder,
  sectionId,
}: {
  kind: "header" | "footer";
  data: ImportedHtmlData;
  onChange: (data: ImportedHtmlData) => void;
  onUseBuilder: () => void;
  sectionId?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-ed-lg border border-ed-border bg-ed-hover/40 p-3">
        <p className="text-ed-xs text-ed-muted">
          Your original {kind}, shared by every page. Prefer the theme&apos;s {kind} designs? Logo and menu are already filled in.
        </p>
        <button type="button" onClick={onUseBuilder} className={`${buttonClass} w-full`}>
          Use a builder {kind} instead
        </button>
      </div>
      <ImportedHtmlFields data={data} onChange={onChange} sectionId={sectionId} />
    </div>
  );
}
