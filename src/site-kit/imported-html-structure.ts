/**
 * Structural edits on imported HTML blocks: duplicate / remove single elements (a paragraph,
 * button, list item, image) and add / remove / reorder repeated items (cards, list rows, FAQ rows).
 *
 * New content is always a copy of existing markup, so it is styled by the block's own (imported)
 * CSS automatically. Copies get fresh text ids / media keys and their own inspector entries.
 * Browser-only (uses <template>).
 */
import { readImportedLinks, spacedText } from "./sections/ImportedHtmlSection.tsx";
import type { ImportedHtmlData, ImportedHtmlMediaSlot, ImportedHtmlText, LinkRef } from "./types.ts";

const SKIP = "svg, script, style, template";

function parse(html: string): HTMLTemplateElement {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template;
}

function nextNumber(root: ParentNode, attr: string, prefix: string): () => string {
  let max = -1;
  root.querySelectorAll(`[${attr}]`).forEach((el) => {
    const n = Number((el.getAttribute(attr) || "").slice(prefix.length));
    if (Number.isFinite(n)) max = Math.max(max, n);
  });
  return () => `${prefix}${++max}`;
}

function labelOf(el: Element): string {
  const text = spacedText(el);
  if (text) return text.length > 48 ? `${text.slice(0, 45)}…` : text;
  return el.querySelector("img")?.getAttribute("alt") || el.getAttribute("aria-label") || el.tagName.toLowerCase();
}

/**
 * Gives every editable node in `clone` a fresh id and returns the matching inspector entries,
 * copied from the originals (same label, value, url).
 */
function reassignIds(
  root: ParentNode,
  clone: Element,
  data: ImportedHtmlData,
): { texts: ImportedHtmlText[]; slots: ImportedHtmlMediaSlot[] } {
  const nextText = nextNumber(root, "data-wb-text-id", "t");
  const nextMedia = nextNumber(root, "data-wb-media-key", "m");
  const texts: ImportedHtmlText[] = [];
  const slots: ImportedHtmlMediaSlot[] = [];
  const nodes = [clone, ...clone.querySelectorAll("*")];
  for (const node of nodes) {
    const textId = node.getAttribute("data-wb-text-id");
    if (textId) {
      const id = nextText();
      node.setAttribute("data-wb-text-id", id);
      const source = data.texts?.find((text) => text.id === textId);
      if (source) texts.push({ ...source, id });
    }
    const mediaKey = node.getAttribute("data-wb-media-key");
    if (mediaKey) {
      const key = nextMedia();
      node.setAttribute("data-wb-media-key", key);
      const source = data.mediaSlots?.find((slot) => slot.key === mediaKey);
      if (source) slots.push({ ...source, key });
    }
    // Ids must stay unique on the page (labels, anchors, forms).
    if (node.id) node.removeAttribute("id");
  }
  return { texts, slots };
}

/** Inspector entries that live inside `el` (to drop them when it is removed). */
function idsInside(el: Element): { textIds: Set<string>; mediaKeys: Set<string> } {
  const nodes = [el, ...el.querySelectorAll("*")];
  return {
    textIds: new Set(nodes.map((n) => n.getAttribute("data-wb-text-id")).filter((v): v is string => Boolean(v))),
    mediaKeys: new Set(nodes.map((n) => n.getAttribute("data-wb-media-key")).filter((v): v is string => Boolean(v))),
  };
}

function insertAfterInOrder<T>(list: T[], afterIndex: number, added: T[]): T[] {
  if (afterIndex < 0) return [...list, ...added];
  return [...list.slice(0, afterIndex + 1), ...added, ...list.slice(afterIndex + 1)];
}

function duplicateElement(data: ImportedHtmlData, find: (root: DocumentFragment) => Element | null | undefined): ImportedHtmlData {
  if (typeof document === "undefined") return data;
  const template = parse(data.html || "");
  const target = find(template.content);
  if (!target) return data;
  const clone = target.cloneNode(true) as Element;
  const { texts, slots } = reassignIds(template.content, clone, data);
  target.after(clone);
  // Keep the inspector lists in page order: new entries right after the copied ones.
  const { textIds, mediaKeys } = idsInside(target);
  const lastText = Math.max(-1, ...[...textIds].map((id) => (data.texts ?? []).findIndex((t) => t.id === id)));
  const lastSlot = Math.max(-1, ...[...mediaKeys].map((key) => (data.mediaSlots ?? []).findIndex((s) => s.key === key)));
  return {
    ...data,
    html: template.innerHTML,
    texts: insertAfterInOrder(data.texts ?? [], lastText, texts),
    mediaSlots: insertAfterInOrder(data.mediaSlots ?? [], lastSlot, slots),
  };
}

function removeElement(data: ImportedHtmlData, find: (root: DocumentFragment) => Element | null | undefined): ImportedHtmlData {
  if (typeof document === "undefined") return data;
  const template = parse(data.html || "");
  const target = find(template.content);
  if (!target) return data;
  const { textIds, mediaKeys } = idsInside(target);
  target.remove();
  return {
    ...data,
    html: template.innerHTML,
    texts: (data.texts ?? []).filter((text) => !textIds.has(text.id)),
    mediaSlots: (data.mediaSlots ?? []).filter((slot) => !mediaKeys.has(slot.key)),
  };
}

// ---------------------------------------------------------------------------
// Single elements (a text, a link, an image)
// ---------------------------------------------------------------------------

export type ElementRef = { kind: "text"; id: string } | { kind: "media"; key: string } | { kind: "link"; index: number };

function findRef(root: DocumentFragment, ref: ElementRef): Element | null | undefined {
  if (ref.kind === "text") return root.querySelector(`[data-wb-text-id="${CSS.escape(ref.id)}"]`);
  if (ref.kind === "media") return root.querySelector(`[data-wb-media-key="${CSS.escape(ref.key)}"]`);
  return root.querySelectorAll("a[href]")[ref.index];
}

/** Adds a copy of the element right after it (another paragraph, button, list item, image…). */
export function duplicateImportedElement(data: ImportedHtmlData, ref: ElementRef): ImportedHtmlData {
  return duplicateElement(data, (root) => findRef(root, ref));
}

export function removeImportedElement(data: ImportedHtmlData, ref: ElementRef): ImportedHtmlData {
  return removeElement(data, (root) => findRef(root, ref));
}

// ---------------------------------------------------------------------------
// Per-element look (one button, one heading, one image)
// ---------------------------------------------------------------------------

/** Style of a single imported element, stored as `!important` inline style so it wins over the block's CSS. */
export type ElementStyle = {
  background?: string;
  color?: string;
  borderColor?: string;
  /** Corner rounding, e.g. "8px". */
  radius?: string;
  /** e.g. "18px". */
  fontSize?: string;
  fontWeight?: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
};

const STYLE_PROPS: Record<"background" | "color" | "borderColor" | "radius" | "fontSize" | "fontWeight", string> = {
  background: "background-color",
  color: "color",
  borderColor: "border-color",
  radius: "border-radius",
  fontSize: "font-size",
  fontWeight: "font-weight",
};
const SAFE_STYLE_VALUE = /^[#\w\s(),.%-]{1,40}$/;

function toHex(value: string): string {
  const rgb = value.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!rgb) return value;
  return `#${rgb.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
}

/** The style set on one element through the panel (not what its imported CSS gives it). */
export function readElementStyle(data: ImportedHtmlData, ref: ElementRef): ElementStyle {
  if (typeof document === "undefined") return {};
  const el = findRef(parse(data.html || "").content, ref) as HTMLElement | null | undefined;
  if (!el?.style) return {};
  const style: ElementStyle = {};
  for (const [key, prop] of Object.entries(STYLE_PROPS) as [keyof typeof STYLE_PROPS, string][]) {
    const value = el.style.getPropertyValue(prop).trim();
    if (value) style[key] = key === "background" || key === "color" || key === "borderColor" ? toHex(value) : value;
  }
  if (el.classList.contains("wb-hide-mobile")) style.hideOnMobile = true;
  if (el.classList.contains("wb-hide-desktop")) style.hideOnDesktop = true;
  return style;
}

/** Sets (or, with an empty value, clears) parts of one element's own style. */
export function applyElementStyle(data: ImportedHtmlData, ref: ElementRef, patch: ElementStyle): ImportedHtmlData {
  if (typeof document === "undefined") return data;
  const template = parse(data.html || "");
  const el = findRef(template.content, ref) as HTMLElement | null | undefined;
  if (!el?.style) return data;
  for (const [key, prop] of Object.entries(STYLE_PROPS) as [keyof typeof STYLE_PROPS, string][]) {
    if (!(key in patch)) continue;
    const value = patch[key]?.trim();
    if (value && SAFE_STYLE_VALUE.test(value)) {
      el.style.setProperty(prop, value, "important");
      // A gradient/image background would cover the new colour (only once the colour is valid).
      if (key === "background") {
        if (el.style.getPropertyValue(prop)) el.style.setProperty("background-image", "none", "important");
        else el.style.removeProperty("background-image");
      }
    } else {
      el.style.removeProperty(prop);
      if (key === "background") el.style.removeProperty("background-image");
    }
  }
  if ("hideOnMobile" in patch) el.classList.toggle("wb-hide-mobile", Boolean(patch.hideOnMobile));
  if ("hideOnDesktop" in patch) el.classList.toggle("wb-hide-desktop", Boolean(patch.hideOnDesktop));
  if (!el.getAttribute("style")?.trim()) el.removeAttribute("style");
  if (!el.getAttribute("class")?.trim()) el.removeAttribute("class");
  return { ...data, html: template.innerHTML };
}

// ---------------------------------------------------------------------------
// Repeated items (cards, list rows, FAQ rows, link columns)
// ---------------------------------------------------------------------------

export type ImportedGroup = {
  index: number;
  /** e.g. "4 cards: Plywood, Waterproof Plywood, …" */
  label: string;
  items: { index: number; label: string }[];
};

function signature(el: Element): string {
  return `${el.tagName}.${el.classList[0] ?? ""}`;
}

function hasEditableContent(el: Element): boolean {
  return Boolean(el.matches("[data-wb-text-id], [data-wb-media-key], a[href]") || el.querySelector("[data-wb-text-id], [data-wb-media-key], a[href]"));
}

/** Every set of 2+ sibling elements of the same kind that hold editable content, in page order. */
function groupElements(root: ParentNode): Element[][] {
  const groups: Element[][] = [];
  root.querySelectorAll("*").forEach((parent) => {
    if (parent.closest(SKIP)) return;
    const children = [...parent.children].filter((child) => !child.matches(SKIP) && !child.hasAttribute("data-wb-import-ancestor"));
    const bySignature = new Map<string, Element[]>();
    for (const child of children) bySignature.set(signature(child), [...(bySignature.get(signature(child)) ?? []), child]);
    for (const group of bySignature.values()) {
      if (group.length >= 2 && group.every(hasEditableContent)) groups.push(group);
    }
  });
  return groups.slice(0, 12);
}

export function readImportedGroups(html: string): ImportedGroup[] {
  if (typeof document === "undefined" || !html) return [];
  return groupElements(parse(html).content).map((group, index) => {
    const items = group.map((el, itemIndex) => ({ index: itemIndex, label: labelOf(el) }));
    const kind = group[0]!.tagName === "LI" ? "list items" : group[0]!.tagName === "DETAILS" ? "questions" : group[0]!.tagName === "A" ? "links" : "items";
    const preview = items.slice(0, 2).map((item) => item.label).join(", ");
    return { index, label: `${items.length} ${kind}: ${preview}${items.length > 2 ? ", …" : ""}`, items };
  });
}

function findItem(root: DocumentFragment, group: number, item: number): Element | undefined {
  return groupElements(root)[group]?.[item];
}

/** Adds a copy of item #item right after it (a new card / row with the same design). */
export function duplicateImportedItem(data: ImportedHtmlData, group: number, item: number): ImportedHtmlData {
  return duplicateElement(data, (root) => findItem(root, group, item));
}

/** Removes item #item; the last item of a group can't be removed (the design would be lost). */
export function removeImportedItem(data: ImportedHtmlData, group: number, item: number): ImportedHtmlData {
  return removeElement(data, (root) => {
    const items = groupElements(root)[group];
    return items && items.length > 1 ? items[item] : undefined;
  });
}

/** Moves item #item one place up (-1) or down (+1) among its group. */
export function moveImportedItem(data: ImportedHtmlData, group: number, item: number, delta: -1 | 1): ImportedHtmlData {
  if (typeof document === "undefined") return data;
  const template = parse(data.html || "");
  const items = groupElements(template.content)[group];
  const from = items?.[item];
  const to = items?.[item + delta];
  if (!from || !to) return data;
  if (delta < 0) to.before(from);
  else to.after(from);
  // Inspector entries follow page order.
  const order = [...template.content.querySelectorAll("[data-wb-text-id]")].map((el) => el.getAttribute("data-wb-text-id"));
  const mediaOrder = [...template.content.querySelectorAll("[data-wb-media-key]")].map((el) => el.getAttribute("data-wb-media-key"));
  return {
    ...data,
    html: template.innerHTML,
    texts: [...(data.texts ?? [])].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)),
    mediaSlots: [...(data.mediaSlots ?? [])].sort((a, b) => mediaOrder.indexOf(a.key) - mediaOrder.indexOf(b.key)),
  };
}

// ---------------------------------------------------------------------------
// Outline: the block's editable parts grouped the way they appear on the canvas
// ---------------------------------------------------------------------------

export type OutlineEntry =
  | { kind: "text"; ref: ElementRef; id: string; label: string; value: string }
  | { kind: "link"; ref: ElementRef; index: number; link: LinkRef; hasText: boolean; hasIcon: boolean; textId?: string }
  | { kind: "media"; ref: ElementRef; key: string; slot: ImportedHtmlMediaSlot };

export type OutlineItem = { index: number; label: string; entries: OutlineEntry[] };
export type OutlineGroup = { index: number; title: string; items: OutlineItem[] };
export type ImportedOutline = { main: OutlineEntry[]; groups: OutlineGroup[]; total: number };

function groupTitle(items: Element[]): string {
  const tag = items[0]!.tagName;
  const noun = tag === "LI" ? "List items" : tag === "DETAILS" ? "Questions" : tag === "A" && !items[0]!.querySelector("img, h2, h3, h4, p") ? "Links" : "Cards";
  return `${noun} (${items.length})`;
}

/**
 * Every editable part of an imported block in page order. Parts inside a repeated item (card,
 * row) are listed under that item; a button's words and destination form a single "link" entry.
 */
export function readImportedOutline(data: ImportedHtmlData): ImportedOutline {
  const empty: ImportedOutline = { main: [], groups: [], total: 0 };
  if (typeof document === "undefined" || !data.html) return empty;
  const root = parse(data.html).content;
  const allGroups = groupElements(root);
  // Only top-level groups get their own panel; lists inside a card stay inside that card.
  const topGroups = allGroups
    .map((items, index) => ({ items, index }))
    .filter(({ items }) => !allGroups.some((other) => other !== items && other.some((item) => item !== items[0] && item.contains(items[0]!))));

  const groups: OutlineGroup[] = topGroups.map(({ items, index }) => ({
    index,
    title: groupTitle(items),
    items: items.map((el, itemIndex) => ({ index: itemIndex, label: labelOf(el), entries: [] })),
  }));
  const ownerOf = (node: Element): OutlineItem | null => {
    for (const [g, { items }] of topGroups.entries()) {
      const i = items.findIndex((item) => item === node || item.contains(node));
      if (i >= 0) return groups[g]!.items[i]!;
    }
    return null;
  };

  const anchors = [...root.querySelectorAll("a[href]")];
  const links = readImportedLinks(data.html);
  const texts = new Map((data.texts ?? []).map((text) => [text.id, text]));
  const slots = new Map((data.mediaSlots ?? []).map((slot) => [slot.key, slot]));
  const main: OutlineEntry[] = [];
  let total = 0;

  for (const node of root.querySelectorAll("[data-wb-text-id], [data-wb-media-key], a[href]")) {
    let entry: OutlineEntry | null = null;
    if (node.matches("a[href]")) {
      const index = anchors.indexOf(node);
      const info = links[index];
      if (info) entry = { kind: "link", ref: { kind: "link", index }, index, link: info.link, hasText: info.hasText, hasIcon: info.hasIcon, ...(info.textId ? { textId: info.textId } : {}) };
    } else if (node.hasAttribute("data-wb-media-key")) {
      const slot = slots.get(node.getAttribute("data-wb-media-key")!);
      if (slot) entry = { kind: "media", ref: { kind: "media", key: slot.key }, key: slot.key, slot };
    } else {
      const text = texts.get(node.getAttribute("data-wb-text-id")!);
      if (text) entry = { kind: "text", ref: { kind: "text", id: text.id }, id: text.id, label: text.label, value: text.value };
    }
    if (!entry) continue;
    total += 1;
    (ownerOf(node)?.entries ?? main).push(entry);
  }
  return { main, groups: groups.filter((group) => group.items.some((item) => item.entries.length > 0)), total };
}

/** Which outline entry a click on the canvas landed on (link > image > text). */
export function entryKeyForElement(blockRoot: Element, target: Element): string | null {
  const anchor = target.closest("a[href]");
  if (anchor && blockRoot.contains(anchor)) return `link:${[...blockRoot.querySelectorAll("a[href]")].indexOf(anchor)}`;
  const media = target.closest("[data-wb-media-key]");
  if (media && blockRoot.contains(media)) return `media:${media.getAttribute("data-wb-media-key")}`;
  const text = target.closest("[data-wb-text-id]");
  if (text && blockRoot.contains(text)) return `text:${text.getAttribute("data-wb-text-id")}`;
  return null;
}

export function entryKey(entry: OutlineEntry): string {
  return entry.kind === "link" ? `link:${entry.index}` : entry.kind === "media" ? `media:${entry.key}` : `text:${entry.id}`;
}
