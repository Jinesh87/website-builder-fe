/**
 * Structural edits on imported HTML blocks: duplicate / remove single elements (a paragraph,
 * button, list item, image) and add / remove / reorder repeated items (cards, list rows, FAQ rows).
 *
 * New content is always a copy of existing markup, so it is styled by the block's own (imported)
 * CSS automatically. Copies get fresh text ids / media keys and their own inspector entries.
 * Browser-only (uses <template>).
 */
import { spacedText } from "./sections/ImportedHtmlSection.tsx";
import type { ImportedHtmlData, ImportedHtmlMediaSlot, ImportedHtmlText } from "./types.ts";

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
