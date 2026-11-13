/**
 * Turns an imported HTML block into a native builder section: the block's content (headings,
 * text, buttons, images, repeated cards, FAQ pairs, stats) is read from its markup and poured into
 * the chosen section type, which then renders with the site's theme like any other section.
 *
 * Structure-based (no per-site rules), so it works for any HTML that follows common patterns.
 * Browser-only (uses the DOM parser).
 */
import { SECTION_DEFINITIONS } from "./registry.ts";
import type {
  ContactFormField,
  FaqItem,
  ImportedHtmlData,
  FeatureItem,
  FooterData,
  HeaderData,
  GridColumns,
  ImageRef,
  LinkRef,
  Section,
  SectionDataMap,
  SectionOf,
  ServiceItem,
} from "./types.ts";

export const CONVERTIBLE_TYPES = [
  "hero",
  "features",
  "services",
  "faq",
  "cta",
  "contact",
  "testimonials",
  "team",
  "pricing",
  "text",
  "split",
  "gallery",
  "logos",
  "media",
  "stats",
] as const;
export type ConvertibleType = (typeof CONVERTIBLE_TYPES)[number];

export type ExtractedItem = {
  title: string;
  description: string;
  /** Short secondary line (job title, subtitle). */
  role?: string;
  image?: ImageRef;
  link?: LinkRef;
  bullets: string[];
  price?: string;
  period?: string;
  /** Marked as featured/popular in the markup. */
  featured?: boolean;
};

export type ExtractedQuote = { quote: string; name: string; role?: string; avatar?: ImageRef };

export type ExtractedContact = {
  emails: string[];
  phones: string[];
  address?: string;
  hours?: string;
  formFields: ContactFormField[];
  submitLabel?: string;
  formHeading?: string;
};

export type ExtractedContent = {
  eyebrow?: string;
  heading?: string;
  headingLevel?: number;
  paragraphs: string[];
  buttons: LinkRef[];
  images: ImageRef[];
  video?: { url: string; poster?: string };
  items: ExtractedItem[];
  faqs: FaqItem[];
  bullets: string[];
  stats: { value: string; label: string }[];
  quotes: ExtractedQuote[];
  contact: ExtractedContact;
  hasForm: boolean;
  /** `data-wb-section="TYPE"` on the block: the author's chosen builder section. */
  typeHint?: ConvertibleType;
};

/** `data-wb-field` marks (see the import guide) take priority over structural guessing. */
function field(root: Element, ...names: string[]): Element | null {
  for (const name of names) {
    const el = root.querySelector(`[data-wb-field="${name}"]`);
    if (el) return el;
  }
  return null;
}

const HEADINGS = "h1, h2, h3, h4, h5, h6";
const SKIP = "svg, script, style, template, [data-wb-import-ancestor][hidden]";

function clean(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

const UPPER = /\p{Lu}/u;
const WORD = /[\p{L}\p{N}]/u;

/**
 * Visible text with a space where separate elements meet ("Custom Furniture<span>Made to
 * order</span>" → "Custom Furniture Made to order"), except inside all-caps words ("W<span>OO</span>DFIT").
 */
function textOf(el: Element | null | undefined): string {
  if (!el) return "";
  const parts: { text: string; parent: Node | null }[] = [];
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if ((node as Element).tagName === "BR") parts.push({ text: " ", parent: null });
      continue;
    }
    if (node.parentElement?.closest(SKIP)) continue;
    if (node.textContent) parts.push({ text: node.textContent, parent: node.parentNode });
  }
  let out = "";
  for (const [index, part] of parts.entries()) {
    const prev = out.at(-1) ?? "";
    const next = part.text[0] ?? "";
    const boundary = index > 0 && parts[index - 1]!.parent !== part.parent;
    const glue = boundary && WORD.test(prev) && WORD.test(next) && !(UPPER.test(prev) && UPPER.test(next));
    out += (glue ? " " : "") + part.text;
  }
  return clean(out);
}

/** Cuts at a word boundary so values fit the section validators. */
function fit(value: string, max: number): string {
  const text = clean(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trim()}…`;
}

function linkOf(anchor: Element | null | undefined, fallbackLabel = "Learn more"): LinkRef | undefined {
  if (!anchor) return undefined;
  const href = anchor.getAttribute("href")?.trim();
  if (!href) return undefined;
  const label = fit(textOf(anchor) || anchor.getAttribute("aria-label") || fallbackLabel, 60);
  return { label: label || fallbackLabel, href, ...(anchor.getAttribute("target") === "_blank" ? { openInNewTab: true } : {}) };
}

function imageOf(img: Element | null | undefined): ImageRef | undefined {
  const url = img?.getAttribute("src")?.trim();
  if (!url || url.startsWith("data:")) return undefined;
  return { url, alt: fit(img?.getAttribute("alt") || "", 200) };
}

/** Tag + first class: `card` and `card cta` are the same kind of card with a modifier. */
function signature(el: Element): string {
  return `${el.tagName}.${el.classList[0] ?? ""}`;
}

/**
 * Finds the best set of repeated siblings (cards, tiles, list rows): the parent whose children
 * mostly share one tag+class signature and carry the most content.
 */
function findRepeatedGroup(root: Element): Element[] {
  let best: Element[] = [];
  let bestScore = 0;
  root.querySelectorAll("*").forEach((parent) => {
    if (parent.closest(SKIP)) return;
    const children = [...parent.children].filter((child) => !child.matches(SKIP));
    if (children.length < 2) return;
    const counts = new Map<string, Element[]>();
    for (const child of children) {
      const key = signature(child);
      counts.set(key, [...(counts.get(key) ?? []), child]);
    }
    for (const group of counts.values()) {
      if (group.length < 2 || group.length < children.length * 0.5) continue;
      const rich = group.filter((el) => el.querySelector(`${HEADINGS}, b, strong, img, p`) || el.matches("a, li"));
      if (rich.length < 2) continue;
      // A row of buttons ("Contact us", "About us") is a call to action, not a set of cards.
      if (group.every((el) => el.matches("a, button") && !el.querySelector(`${HEADINGS}, img, p`) && textOf(el).length <= 30)) continue;
      // Plain text bullets (li without headings/images) are not cards.
      if (group.every((el) => el.tagName === "LI" && !el.querySelector(`${HEADINGS}, img, b, strong`))) continue;
      const score = rich.length * 10 + group.reduce((sum, el) => sum + Math.min(textOf(el).length, 200), 0) / 50;
      if (score > bestScore) {
        bestScore = score;
        best = group;
      }
    }
  });
  return best;
}

function extractItem(el: Element): ExtractedItem {
  const titleEl = field(el, "title", "name", "question") ?? el.querySelector(HEADINGS) ?? el.querySelector("b, strong, summary");
  const title = textOf(titleEl);
  const markedDescription = field(el, "description", "answer", "quote", "bio");
  const descriptionParts = [...(markedDescription ? [markedDescription] : el.querySelectorAll("p, small, span"))]
    .filter((node) => !titleEl?.contains(node) && !node.contains(titleEl ?? null) && !node.closest("a.btn, button"))
    .filter((node) => !node.querySelector("p, small, span"))
    .map((node) => textOf(node))
    .filter((text) => text && text !== title);
  const description = descriptionParts.join(" ") || clean(textOf(el).replace(title, ""));
  const anchor = el.matches("a[href]") ? el : el.querySelector("a[href]");
  const fullText = textOf(el);
  const price = PRICE.exec(fullText)?.[0]?.trim();
  const role = descriptionParts.find((part) => part.length <= 60 && !PRICE.test(part));
  return {
    title: title || fit(description, 60),
    description: description === title ? "" : description,
    ...(role ? { role } : {}),
    image: imageOf(field(el, "image", "photo", "avatar") ?? el.querySelector("img")),
    link: linkOf(field(el, "link", "cta") ?? anchor),
    bullets: [...el.querySelectorAll("li")].map((li) => textOf(li)).filter(Boolean),
    ...(field(el, "role") ? { role: textOf(field(el, "role")) } : {}),
    ...(field(el, "price") ? { price: textOf(field(el, "price")) } : price ? { price } : {}),
    ...(price && PERIOD.test(fullText) ? { period: `/${PERIOD.exec(fullText)![1]!.toLowerCase().startsWith("y") ? "year" : PERIOD.exec(fullText)![1]!.toLowerCase().startsWith("w") ? "week" : "month"}` } : {}),
    ...(/featured|popular|highlight|recommended|best/i.test(el.className) ? { featured: true } : {}),
  };
}

const PRICE = /(?:₹|\$|€|£|Rs\.?\s?|INR\s?|USD\s?)\s?\d[\d,]*(?:\.\d+)?|\d[\d,]*(?:\.\d+)?\s?(?:₹|€|£|\/-)/;
const PERIOD = /(?:\/|per\s)\s?(mo|month|yr|year|week|wk)\b/i;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const PHONE = /(?:\+?\d[\d\s().-]{6,16}\d)/g;
const HOURS = /\b(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\b[^\n]{0,60}\d|\b\d{1,2}(?::\d{2})?\s?(?:am|pm)\b/i;
const ADDRESS_HINT = /\b(?:road|rd\.?|street|st\.|avenue|ave|lane|nagar|marg|opp\.?|near|floor|building|block|sector|district|pin|\d{6})\b/i;

function slugId(value: string, used: Set<string>): string {
  let base = value.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^[^a-z]+/, "").slice(0, 32) || "field";
  if (!/^[a-z]/.test(base)) base = `f_${base}`;
  let id = base;
  for (let i = 2; used.has(id); i += 1) id = `${base.slice(0, 36)}_${i}`;
  used.add(id);
  return id;
}

function labelFor(control: Element): string {
  const id = control.getAttribute("id");
  const byFor = id ? control.ownerDocument.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
  const wrap = control.closest("label");
  const fromLabel = byFor ? textOf(byFor) : wrap ? textOf(wrap).replace(textOf(control), "") : "";
  return clean(fromLabel.replace(/\*/g, "")) || control.getAttribute("aria-label") || control.getAttribute("placeholder") || control.getAttribute("name") || "";
}

/** Enquiry-form fields (label, type, required, options) read from the block's <form>. */
function extractFormFields(form: Element | null): { fields: ContactFormField[]; submitLabel?: string } {
  if (!form) return { fields: [] };
  const used = new Set<string>();
  const fields: ContactFormField[] = [];
  const radioGroups = new Set<string>();
  for (const control of form.querySelectorAll("input, select, textarea")) {
    const inputType = (control.getAttribute("type") || "text").toLowerCase();
    if (["hidden", "submit", "button", "reset", "image", "file", "password"].includes(inputType)) continue;
    const name = control.getAttribute("name") || "";
    // The spam trap added on import (and any control hidden from people) is not a real field.
    if (name === "_wb_hp" || control.getAttribute("aria-hidden") === "true") continue;
    let type: ContactFormField["type"] = "text";
    let options: string[] | undefined;
    if (control.tagName === "TEXTAREA") type = "textarea";
    else if (control.tagName === "SELECT") {
      type = "select";
      options = [...control.querySelectorAll("option")]
        .map((option) => textOf(option))
        .filter((label, index) => label && !(index === 0 && /select|choose|pick|--/i.test(label)))
        .slice(0, 12)
        .map((label) => fit(label, 80));
    } else if (inputType === "radio" || inputType === "checkbox") {
      if (!name || radioGroups.has(name)) continue;
      radioGroups.add(name);
      type = inputType === "radio" ? "radio" : "checkboxes";
      options = [...form.querySelectorAll(`input[name="${CSS.escape(name)}"]`)].map((input) => fit(labelFor(input), 80)).filter(Boolean).slice(0, 12);
    } else if (["email", "tel", "number", "date"].includes(inputType)) type = inputType as ContactFormField["type"];
    const rawLabel = type === "radio" || type === "checkboxes" ? textOf(control.closest("fieldset")?.querySelector("legend")) || name : labelFor(control);
    const label = fit(rawLabel, 80);
    const labelSource = (control.id && form.querySelector(`label[for="${CSS.escape(control.id)}"]`)) || control.closest("label");
    fields.push({
      id: slugId(name || label, used),
      type,
      label: label || "Field",
      ...(control.getAttribute("placeholder") ? { placeholder: fit(control.getAttribute("placeholder")!, 120) } : {}),
      ...(control.hasAttribute("required") || /\*/.test(labelSource?.textContent ?? "") ? { required: true } : {}),
      width: type === "textarea" || type === "radio" || type === "checkboxes" ? "full" : "half",
      ...(options?.length ? { options } : {}),
    });
    if (fields.length >= 20) break;
  }
  const submit = form.querySelector("button[type=submit], input[type=submit], button:not([type])");
  const submitLabel = submit ? fit(textOf(submit) || submit.getAttribute("value") || "", 40) : undefined;
  return { fields, ...(submitLabel ? { submitLabel } : {}) };
}

function extractContact(root: Element): ExtractedContact {
  const form = root.querySelector("form");
  const outsideForm = (el: Element) => !form?.contains(el);
  const isLeaf = (el: Element) => [...el.children].every((child) => child.tagName === "BR" || child.tagName === "WBR");
  const textNodes = [...root.querySelectorAll("p, li, span, a, address, div, small, b, strong")]
    .filter((el) => outsideForm(el) && isLeaf(el))
    .map((el) => textOf(el))
    .filter(Boolean);
  const unique = (values: string[]) => [...new Set(values.map((value) => clean(value)))].filter(Boolean);

  const emails = unique([
    ...[...root.querySelectorAll("a[href^='mailto:' i]")].map((a) => (a.getAttribute("href") || "").slice(7).split("?")[0]!),
    ...textNodes.flatMap((text) => text.match(EMAIL) ?? []),
  ]);
  const phones = unique([
    ...[...root.querySelectorAll("a[href^='tel:' i]")].filter(outsideForm).map((a) => textOf(a) || (a.getAttribute("href") || "").slice(4)),
    ...textNodes.flatMap((text) => (text.match(PHONE) ?? []).filter((match) => match.replace(/\D/g, "").length >= 8)),
  ]).filter((phone) => phone.replace(/\D/g, "").length >= 8);

  // "Address" label followed by its value (<small>Address</small><b>…</b>), then semantic markup.
  const labelled = [...root.querySelectorAll("small, span, dt, label, strong, b, h4, h5, h6")]
    .filter((el) => outsideForm(el) && /^(address|location|our address|shop address|store address)\s*:?$/i.test(textOf(el)))
    .map((el) => el.nextElementSibling)
    .find((el): el is Element => Boolean(el && textOf(el) && !el.matches(HEADINGS)));
  const addressEl = labelled ?? root.querySelector("address") ?? root.querySelector("[class*='address' i], [class*='location' i], [itemprop='address']");
  const address =
    (addressEl && outsideForm(addressEl) ? textOf(addressEl) : undefined) ??
    textNodes.find((text) => ADDRESS_HINT.test(text) && !EMAIL.test(text) && text.length > 10 && text.length < 300);
  EMAIL.lastIndex = 0;
  const hours = textNodes.find((text) => HOURS.test(text) && text.length < 100);
  const { fields, submitLabel } = extractFormFields(form);
  const formHeading = form ? textOf(form.querySelector(HEADINGS) ?? form.parentElement?.querySelector(HEADINGS)) || undefined : undefined;
  return {
    emails,
    phones,
    ...(address ? { address } : {}),
    ...(hours ? { hours } : {}),
    formFields: fields,
    ...(submitLabel ? { submitLabel } : {}),
    ...(formHeading ? { formHeading } : {}),
  };
}

/** Customer quotes: <blockquote>s, or cards whose main text is in quotation marks. */
function extractQuotes(root: Element, items: ExtractedItem[], itemEls: Element[]): ExtractedQuote[] {
  const quotes = [...root.querySelectorAll("blockquote")].map((block) => {
    const card = block.closest("figure, article, li, [class*='testimonial' i], [class*='review' i]") ?? block.parentElement!;
    const nameEl = card.querySelector("cite, figcaption, strong, b, h3, h4, h5, [class*='name' i]");
    const roleEl = card.querySelector("small, [class*='role' i], [class*='title' i], [class*='company' i]");
    const quoteCopy = block.cloneNode(true) as Element;
    quoteCopy.querySelectorAll("cite, footer").forEach((node) => node.remove());
    return {
      quote: textOf(quoteCopy).replace(/^["“”']|["“”']$/g, ""),
      name: textOf(nameEl) || "Customer",
      ...(roleEl && textOf(roleEl) !== textOf(nameEl) ? { role: textOf(roleEl) } : {}),
      ...(imageOf(card.querySelector("img")) ? { avatar: imageOf(card.querySelector("img")) } : {}),
    };
  });
  if (quotes.length) return quotes.filter((q) => q.quote);
  return items
    .map((item, index) => ({ item, el: itemEls[index] }))
    .filter(({ item, el }) => /^["“]/.test(item.description) || /testimonial|review|quote/i.test(el?.className ?? ""))
    .map(({ item }) => ({ quote: item.description.replace(/^["“]|["”]$/g, ""), name: item.title, ...(item.role && item.role !== item.description ? { role: item.role } : {}), ...(item.image ? { avatar: item.image } : {}) }));
}

const STAT_VALUE = /^[\d₹$€£+~<>]?[\d.,]+\s*(?:[%+kKmMxX★]|\/\d+|yrs?|years?|\+)?\+?$/;

export function extractImportedContent(html: string): ExtractedContent {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const root = doc.body;
  root.querySelectorAll("script, style, template").forEach((node) => node.remove());

  const markedItems = [...root.querySelectorAll("[data-wb-item]")];
  const itemEls = markedItems.length > 0 ? markedItems : findRepeatedGroup(root);
  const inItems = (node: Element) => itemEls.some((item) => item === node || item.contains(node));

  // The block's own title: the highest-level heading outside the repeated cards.
  const headingEl =
    field(root, "heading") ??
    [...root.querySelectorAll(HEADINGS)]
      .filter((el) => !inItems(el) && textOf(el))
      .sort((a, b) => Number(a.tagName.slice(1)) - Number(b.tagName.slice(1)))[0];
  const heading = textOf(headingEl);

  // Eyebrow: short label right before the heading (".eyebrow", ".badge", a small span…).
  let eyebrow: string | undefined = textOf(field(root, "eyebrow")) || undefined;
  if (headingEl && !eyebrow) {
    const candidates = [...root.querySelectorAll("span, p, small, div, strong")].filter(
      (el) =>
        !inItems(el) &&
        el.children.length === 0 &&
        Boolean(el.compareDocumentPosition(headingEl) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        WORD.test(textOf(el)) &&
        textOf(el).length <= 50 &&
        !el.closest("a, button, nav, [aria-label*='breadcrumb' i], [class*='crumb']"),
    );
    eyebrow = textOf(candidates.at(-1)) || undefined;
  }

  const leadEl = field(root, "subheading", "intro", "text", "body");
  const paragraphs = [
    ...(leadEl ? [textOf(leadEl)] : []),
    ...[...root.querySelectorAll("p")]
      .filter((el) => el !== leadEl && !inItems(el) && !el.closest("details, form, footer, nav"))
      .map((el) => textOf(el)),
  ].filter((text) => text.length > 0 && text !== eyebrow);

  // Links before the heading are breadcrumbs / nav, not calls to action.
  const afterHeading = (el: Element) => !headingEl || Boolean(headingEl.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  const markedButtons = ["primaryCta", "secondaryCta", "button", "cta"]
    .map((name) => field(root, name))
    .map((el) => (el?.matches("a[href]") ? el : el?.querySelector("a[href]")))
    .map((el) => linkOf(el))
    .filter((link): link is LinkRef => Boolean(link));
  const buttons = (
    markedButtons.length
      ? markedButtons
      : [...root.querySelectorAll("a[href], button")]
          .filter((el) => !inItems(el) && afterHeading(el) && !el.closest("nav, form, details, [class*='crumb']"))
          .map((el) => (el.tagName === "A" ? linkOf(el) : undefined))
          .filter((link): link is LinkRef => Boolean(link && link.label.length <= 40))
  ).slice(0, 3);

  const markedImage = field(root, "image", "media");
  const images = [
    ...(markedImage ? [imageOf(markedImage.matches("img") ? markedImage : markedImage.querySelector("img"))] : []),
    ...[...root.querySelectorAll("img")].filter((el) => el !== markedImage && !inItems(el)).map((el) => imageOf(el)),
  ].filter((image): image is ImageRef => Boolean(image));

  const videoEl = root.querySelector("video");
  const videoUrl = videoEl?.getAttribute("src") || videoEl?.querySelector("source[src]")?.getAttribute("src") || "";

  const faqs: FaqItem[] = [...root.querySelectorAll("details")]
    .map((details) => {
      const summary = details.querySelector("summary");
      const question = textOf(summary);
      const answerCopy = details.cloneNode(true) as Element;
      answerCopy.querySelector("summary")?.remove();
      return { question, answer: textOf(answerCopy) };
    })
    .filter((item) => item.question && item.answer);

  const items = itemEls.map(extractItem).filter((item) => item.title || item.description);
  const stats = items
    .filter((item) => STAT_VALUE.test(item.title) && item.description)
    .map((item) => ({ value: item.title, label: item.description }));

  const bullets = [...root.querySelectorAll("li")]
    .filter((el) => !inItems(el) && !el.closest("nav, form"))
    .map((el) => textOf(el))
    .filter(Boolean);
  const quotes = extractQuotes(root, items, itemEls);
  const rawHint = (root.querySelector("[data-wb-section]")?.getAttribute("data-wb-section") || "").trim().toLowerCase();
  const typeHint = (CONVERTIBLE_TYPES as readonly string[]).includes(rawHint) ? (rawHint as ConvertibleType) : undefined;
  const contact = extractContact(root);

  return {
    eyebrow,
    heading: heading || undefined,
    headingLevel: headingEl ? Number(headingEl.tagName.slice(1)) : undefined,
    paragraphs,
    buttons,
    images,
    ...(videoUrl ? { video: { url: videoUrl, poster: videoEl?.getAttribute("poster") || undefined } } : {}),
    items,
    faqs,
    bullets,
    stats,
    quotes,
    contact,
    hasForm: Boolean(root.querySelector("form")),
    ...(typeHint ? { typeHint } : {}),
  };
}

/** Section types that fit the block, best first (all convertible types are still allowed). */
export function suggestSectionTypes(content: ExtractedContent): ConvertibleType[] {
  const picks: ConvertibleType[] = [];
  const add = (type: ConvertibleType) => {
    if (!picks.includes(type)) picks.push(type);
  };
  if (content.typeHint) add(content.typeHint);
  const contactInfo = content.contact.emails.length + content.contact.phones.length + (content.contact.address ? 1 : 0);
  const pricedItems = content.items.filter((item) => item.price).length;
  const textLength = content.paragraphs.join(" ").length + content.items.reduce((sum, item) => sum + item.description.length, 0);
  if (content.contact.formFields.length > 0 || (content.hasForm && contactInfo > 0)) add("contact");
  if (pricedItems >= 2) add("pricing");
  if (content.quotes.length >= 2) add("testimonials");
  if (content.faqs.length >= 2) add("faq");
  if (contactInfo >= 2) add("contact");
  if (content.items.length < 2 && content.images.length >= 4 && textLength < 120) add("logos");
  if (content.items.length < 2 && content.paragraphs.length <= 1 && !content.buttons.length && (content.video || content.images.length === 1)) add("media");
  if (content.stats.length >= 2 && content.stats.length >= content.items.length * 0.7) add("stats");
  if (content.headingLevel === 1 || ((content.images.length > 0 || content.video) && content.buttons.length > 0 && content.items.length < 2)) add("hero");
  if (content.items.length >= 2) {
    const withImages = content.items.filter((item) => item.image).length;
    if (withImages >= content.items.length * 0.7 && content.items.every((item) => item.description.length < 80)) {
      // Photo + name + short role on every card reads as a team.
      if (content.items.every((item) => item.title.split(" ").length <= 4 && (item.role?.length ?? 0) <= 40)) add("team");
      add("gallery");
    }
    if (withImages >= content.items.length * 0.7 && content.items.every((item) => item.description.length < 20)) add("logos");
    add(content.items.some((item) => item.image || item.link) ? "services" : "features");
    add(content.items.some((item) => item.image || item.link) ? "features" : "services");
  }
  if (content.images.length > 0 && content.paragraphs.length > 0) add("split");
  if (content.heading && content.buttons.length > 0 && content.items.length < 2 && content.paragraphs.join(" ").length < 300) add("cta");
  if (content.paragraphs.length > 0) add("text");
  for (const type of CONVERTIBLE_TYPES) add(type);
  return picks;
}

function columnsFor(count: number): GridColumns {
  return Math.max(1, Math.min(4, count)) as GridColumns;
}

function defaults<T extends ConvertibleType>(type: T): SectionDataMap[T] {
  return SECTION_DEFINITIONS[type].createData() as SectionDataMap[T];
}

function intro(content: ExtractedContent): string | undefined {
  return content.paragraphs[0] ? fit(content.paragraphs[0], 300) : undefined;
}

/** Template placeholder copy that must not survive when the block simply has no such text. */
const REQUIRED_HEADING = new Set<ConvertibleType>(["hero", "services", "faq", "cta", "split", "contact", "testimonials", "team", "pricing"]);
const PLACEHOLDER_FIELDS = ["eyebrow", "intro", "subheading", "description", "text", "italicText"] as const;

function defaultsWithoutPlaceholders<T extends ConvertibleType>(type: T, title: string): SectionDataMap[T] {
  const data = defaults(type) as Record<string, unknown>;
  for (const field of PLACEHOLDER_FIELDS) delete data[field];
  // Required headings fall back to the block name; optional ones are left out.
  if (REQUIRED_HEADING.has(type)) data.heading = title || String(data.heading ?? "");
  else delete data.heading;
  // Template buttons only where the section needs one (CTA); otherwise the block's own buttons win.
  if (type !== "cta") for (const field of ["primaryCta", "secondaryCta", "cta", "bottomCta"]) delete data[field];
  return data as SectionDataMap[T];
}

function buildData(type: ConvertibleType, c: ExtractedContent, title: string): SectionDataMap[ConvertibleType] {
  const heading = c.heading ? fit(c.heading, 120) : undefined;
  const eyebrow = c.eyebrow ? fit(c.eyebrow, 60) : undefined;
  const pick = <T extends object>(base: T, patch: Partial<T>): T => {
    const out = { ...base };
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined && !(Array.isArray(value) && value.length === 0)) (out as Record<string, unknown>)[key] = value;
    }
    return out;
  };

  switch (type) {
    case "hero": {
      const base = defaultsWithoutPlaceholders("hero", title);
      const image = c.images[0] ?? (c.video?.poster ? { url: c.video.poster, alt: "" } : undefined);
      return pick(base, {
        variant: image || c.video ? "split" : base.variant,
        eyebrow,
        heading,
        subheading: intro(c),
        primaryCta: c.buttons[0],
        secondaryCta: c.buttons[1],
        image,
        ...(c.video ? { mediaType: "video" as const, videoUrl: c.video.url, videoAutoplay: true, videoLoop: true } : {}),
      });
    }
    case "features": {
      const base = defaultsWithoutPlaceholders("features", title);
      const items: FeatureItem[] = c.items.slice(0, 12).map((item, index) => ({
        ...(base.items[index % Math.max(base.items.length, 1)]?.icon ? { icon: base.items[index % base.items.length]!.icon } : {}),
        title: fit(item.title, 80),
        description: fit(item.description, 140),
        ...(item.image ? { image: item.image } : {}),
        ...(item.link ? { link: item.link } : {}),
      }));
      return pick(base, { heading, eyebrow, intro: intro(c), items, columns: items.length ? columnsFor(items.length) : base.columns, bottomCta: c.buttons[0] });
    }
    case "services": {
      const base = defaultsWithoutPlaceholders("services", title);
      const items: ServiceItem[] = c.items.slice(0, 12).map((item) => ({
        title: fit(item.title, 80),
        description: fit(item.description, 300),
        ...(item.image ? { image: item.image } : {}),
        ...(item.link ? { link: item.link } : {}),
        ...(item.bullets.length ? { features: item.bullets.slice(0, 8).map((b) => fit(b, 80)) } : {}),
      }));
      return pick(base, { heading, eyebrow, intro: intro(c), items, columns: items.length ? columnsFor(items.length) : base.columns, bottomCta: c.buttons[0] });
    }
    case "faq": {
      const base = defaultsWithoutPlaceholders("faq", title);
      const items = (c.faqs.length ? c.faqs : c.items.filter((i) => i.title.endsWith("?")).map((i) => ({ question: i.title, answer: i.description })))
        .slice(0, 30)
        .map((item) => ({ question: fit(item.question, 300), answer: fit(item.answer, 2000) }));
      return pick(base, { heading, eyebrow, intro: intro(c), items });
    }
    case "cta": {
      const base = defaultsWithoutPlaceholders("cta", title);
      return pick(base, { heading, eyebrow, text: intro(c), button: c.buttons[0], secondaryButton: c.buttons[1] });
    }
    case "text": {
      const base = defaultsWithoutPlaceholders("text", title);
      const body = c.paragraphs.join("\n\n") || c.items.map((i) => `${i.title}\n${i.description}`).join("\n\n");
      return pick(base, { heading, eyebrow, body: body ? fit(body, 5000) : undefined, cta: c.buttons[0] });
    }
    case "split": {
      const base = defaultsWithoutPlaceholders("split", title);
      return pick(base, {
        heading,
        eyebrow,
        body: c.paragraphs.length ? fit(c.paragraphs.join("\n\n"), 2000) : undefined,
        bullets: c.bullets.slice(0, 10).map((b) => fit(b, 120)),
        image: c.images[0] ?? c.items.find((i) => i.image)?.image,
        cta: c.buttons[0],
      });
    }
    case "gallery": {
      const base = defaultsWithoutPlaceholders("gallery", title);
      const images = c.items
        .filter((item) => item.image)
        .slice(0, 24)
        .map((item) => ({ ...item.image!, ...(item.title ? { title: fit(item.title, 80) } : {}), ...(item.description ? { description: fit(item.description, 140) } : {}) }));
      const loose = images.length ? [] : c.images.slice(0, 24);
      const all = [...images, ...loose];
      return pick(base, { heading, eyebrow, intro: intro(c), images: all, columns: all.length ? columnsFor(all.length) : base.columns, cta: c.buttons[0] });
    }
    case "contact": {
      const base = defaultsWithoutPlaceholders("contact", title);
      const k = c.contact;
      return pick(base, {
        heading,
        eyebrow,
        text: c.paragraphs[0] ? fit(c.paragraphs[0], 500) : undefined,
        email: k.emails[0] ? fit(k.emails[0], 255) : undefined,
        phone: k.phones[0] ? fit(k.phones[0], 32) : undefined,
        address: k.address ? fit(k.address, 500) : undefined,
        officeHours: k.hours ? fit(k.hours, 100) : undefined,
        // Only blocks that had a form get one; a details-only block stays details-only.
        showForm: c.hasForm || k.formFields.length > 0,
        submitLabel: k.submitLabel,
        formHeading: k.formHeading ? fit(k.formHeading, 120) : undefined,
        formFields: k.formFields,
      });
    }
    case "testimonials": {
      const base = defaultsWithoutPlaceholders("testimonials", title);
      const quotes = c.quotes.length ? c.quotes : c.items.map((item) => ({ quote: item.description, name: item.title, role: item.role, avatar: item.image }));
      const items = quotes
        .filter((q) => q.quote && q.name)
        .slice(0, 24)
        .map((q) => ({
          quote: fit(q.quote, 800),
          name: fit(q.name, 120),
          ...(q.role ? { role: fit(q.role, 120) } : {}),
          ...(q.avatar ? { avatar: q.avatar } : {}),
        }));
      return pick(base, { heading, eyebrow, intro: intro(c), items });
    }
    case "team": {
      const base = defaultsWithoutPlaceholders("team", title);
      const members = c.items.slice(0, 24).map((item) => ({
        name: fit(item.title, 120),
        ...(item.role ? { role: fit(item.role, 120) } : {}),
        ...(item.description && item.description !== item.role ? { bio: fit(item.description, 600) } : {}),
        ...(item.image ? { photo: item.image } : {}),
      }));
      return pick(base, { heading, eyebrow, intro: intro(c), members, columns: members.length ? columnsFor(members.length) : base.columns });
    }
    case "pricing": {
      const base = defaultsWithoutPlaceholders("pricing", title);
      const source = c.items.some((item) => item.price) ? c.items.filter((item) => item.price) : c.items;
      const plans = source.slice(0, 6).map((item) => ({
        name: fit(item.title, 60),
        price: fit(item.price || "On request", 30),
        ...(item.period ? { period: item.period } : {}),
        ...(item.description ? { description: fit(item.description.replace(item.price ?? "", ""), 300) } : {}),
        features: item.bullets.slice(0, 15).map((b) => fit(b, 160)),
        ...(item.link ? { cta: item.link } : {}),
        featured: Boolean(item.featured),
      }));
      return pick(base, { heading, eyebrow, intro: intro(c), plans });
    }
    case "logos": {
      const base = defaultsWithoutPlaceholders("logos", title);
      const logos = [...c.images, ...c.items.map((item) => item.image).filter((image): image is ImageRef => Boolean(image))].slice(0, 24);
      return pick(base, { heading, logos });
    }
    case "media": {
      const base = defaultsWithoutPlaceholders("media", title);
      const image = c.images[0] ?? (c.video?.poster ? { url: c.video.poster, alt: "" } : undefined);
      return pick(base, {
        heading,
        caption: c.paragraphs[0] ? fit(c.paragraphs[0], 300) : undefined,
        kind: c.video ? "video" : "image",
        image,
        videoUrl: c.video?.url,
      });
    }
    case "stats": {
      const base = defaultsWithoutPlaceholders("stats", title);
      return pick(base, { heading, intro: intro(c), items: c.stats.slice(0, 8).map((s) => ({ value: fit(s.value, 20), label: fit(s.label, 80) })) });
    }
  }
}

/** The other version of a section ({type, data}) kept in `data.importAlternate`. */
export type ImportAlternate = { type: Section["type"]; data: Record<string, unknown> };

function withoutAlternate(data: unknown): Record<string, unknown> {
  const { importAlternate: _drop, ...rest } = (data ?? {}) as Record<string, unknown>;
  return rest;
}

export function alternateOf(section: Section): ImportAlternate | null {
  const alternate = (section.data as { importAlternate?: ImportAlternate }).importAlternate;
  return alternate && typeof alternate.type === "string" && alternate.data ? alternate : null;
}

/**
 * Replaces an imported block with a native section of `type`, keeping its id, visibility and
 * settings. The imported original is kept on the new section so it can be switched back.
 */
export function convertImportedSection(section: SectionOf<"imported_html">, type: ConvertibleType): Section {
  const content = extractImportedContent(section.data.html || "");
  return {
    id: section.id,
    type,
    hidden: section.hidden,
    settings: section.settings,
    data: {
      ...(buildData(type, content, fit(section.data.title || content.heading || "", 120)) as Record<string, unknown>),
      importAlternate: { type: "imported_html", data: withoutAlternate(section.data) } satisfies ImportAlternate,
    },
  } as unknown as Section;
}

/** Swaps a section with its kept other version; the current version is kept in turn (no edits lost). */
export function switchToAlternate(section: Section): Section | null {
  const alternate = alternateOf(section);
  if (!alternate) return null;
  return {
    id: section.id,
    type: alternate.type,
    hidden: section.hidden,
    settings: section.settings,
    data: { ...alternate.data, importAlternate: { type: section.type, data: withoutAlternate(section.data) } },
  } as unknown as Section;
}

/** Header/footer: show the builder design but keep the imported markup to switch back to. */
export function chromeToBuilder<T extends HeaderData | FooterData>(value: T): T {
  const { imported, ...rest } = value;
  return (imported ? { ...rest, importedHidden: imported } : rest) as T;
}

/** Header/footer: bring the imported markup back (the builder settings stay for later). */
export function chromeToImported<T extends HeaderData | FooterData>(value: T): T {
  const { importedHidden, ...rest } = value;
  return (importedHidden ? { ...rest, imported: importedHidden } : rest) as T;
}

const SOCIAL_HOSTS: [RegExp, string][] = [
  [/facebook\.com|fb\.com/i, "Facebook"],
  [/instagram\.com/i, "Instagram"],
  [/twitter\.com|(^|\.)x\.com/i, "X"],
  [/linkedin\.com/i, "LinkedIn"],
  [/youtube\.com|youtu\.be/i, "YouTube"],
  [/wa\.me|whatsapp\.com/i, "WhatsApp"],
  [/pinterest\./i, "Pinterest"],
  [/tiktok\.com/i, "TikTok"],
];

function socialName(href: string): string | undefined {
  try {
    const host = new URL(href).hostname;
    return SOCIAL_HOSTS.find(([pattern]) => pattern.test(host))?.[1];
  } catch {
    return undefined;
  }
}

/**
 * Builder footer from an imported footer: logo, description, link columns (heading + links),
 * social links, contact details and copyright are read from its markup.
 */
export function footerFromImported(imported: ImportedHtmlData, base: FooterData): FooterData {
  const doc = new DOMParser().parseFromString(`<body>${imported.html || ""}</body>`, "text/html");
  const root = doc.body;
  const anchors = [...root.querySelectorAll("a[href]")];

  const social: LinkRef[] = [];
  for (const anchor of anchors) {
    const href = anchor.getAttribute("href") || "";
    const name = socialName(href);
    if (name && !social.some((link) => link.href === href)) social.push({ label: name, href, openInNewTab: true });
  }

  // A column is a heading-like element plus the links that follow it inside the same parent.
  const columns: FooterData["columns"] = [];
  const usedLinks = new Set<Element>();
  for (const headingEl of root.querySelectorAll("h2, h3, h4, h5, h6, strong, b, [class*='title' i]")) {
    const container = headingEl.parentElement;
    if (!container || headingEl.closest("a")) continue;
    const links = [...container.querySelectorAll("a[href]")].filter(
      (a) => !usedLinks.has(a) && !socialName(a.getAttribute("href") || "") && !/^(mailto|tel):/i.test(a.getAttribute("href") || "") && textOf(a),
    );
    if (links.length < 2 || !textOf(headingEl) || textOf(headingEl).length > 40) continue;
    links.forEach((link) => usedLinks.add(link));
    columns.push({
      title: fit(textOf(headingEl), 60),
      links: links.slice(0, 12).map((a) => ({ label: fit(textOf(a), 80), href: a.getAttribute("href")! })),
    });
    if (columns.length >= 4) break;
  }

  const contact = extractContact(root);
  const copyright = [...root.querySelectorAll("p, span, small, div")]
    .filter((el) => el.children.length === 0)
    .map((el) => textOf(el))
    .find((text) => /©|&copy;|copyright/i.test(text));
  const description = [...root.querySelectorAll("p")]
    .map((el) => textOf(el))
    .find((text) => text.length > 30 && !/©|copyright/i.test(text) && !EMAIL.test(text));
  EMAIL.lastIndex = 0;
  const logo = imageOf(root.querySelector("img"));

  return {
    ...base,
    design: columns.length ? "columns" : base.design,
    ...(logo ? { logo } : {}),
    ...(description ? { description: fit(description, 500) } : {}),
    columns: columns.length ? columns : base.columns,
    social: social.length ? social.slice(0, 12) : base.social,
    ...(contact.emails[0] || contact.phones[0] || contact.address
      ? {
          contact: {
            ...(contact.emails[0] ? { email: fit(contact.emails[0], 255) } : {}),
            ...(contact.phones[0] ? { phone: fit(contact.phones[0], 32) } : {}),
            ...(contact.address ? { address: fit(contact.address, 500) } : {}),
            ...(contact.hours ? { hours: fit(contact.hours, 200) } : {}),
          },
        }
      : {}),
    ...(copyright ? { copyright: fit(copyright, 200) } : {}),
  };
}

type ConvertibleDraft = {
  header: HeaderData;
  footer: FooterData;
  pages: { id: string; sections: Section[] }[];
};

/** True when the draft still has imported HTML (blocks or an imported header/footer). */
export function hasImportedHtml(draft: ConvertibleDraft, pageId?: string): boolean {
  const pages = pageId ? draft.pages.filter((page) => page.id === pageId) : draft.pages;
  return (
    pages.some((page) => page.sections.some((section) => section.type === "imported_html")) ||
    (!pageId && Boolean(draft.header.imported || draft.footer.imported))
  );
}

/**
 * Converts every imported block (on `pageIds`, or all pages) into its best-matching builder section.
 * When converting the whole site, the imported header/footer switch to the builder designs too
 * (their logo and menu were prefilled at import).
 */
export function convertDraftToBuilder<D extends ConvertibleDraft>(draft: D, options: { pageIds?: string[] } = {}): { draft: D; converted: number } {
  let converted = 0;
  const wholeSite = !options.pageIds;
  const inScope = (pageId: string) => wholeSite || options.pageIds!.includes(pageId);
  let droppedLegacyHeader = false;
  let droppedLegacyFooter = false;

  const pages = draft.pages.map((page) => {
    if (!inScope(page.id)) return page;
    const sections = page.sections.flatMap((section): Section[] => {
      if (section.type !== "imported_html") return [section];
      const imported = section as SectionOf<"imported_html">;
      // Older imports stored the header/footer as page blocks; the builder header/footer replace them.
      if (imported.data.chrome) {
        if (imported.data.chrome === "header") droppedLegacyHeader = true;
        else droppedLegacyFooter = true;
        converted += 1;
        return [];
      }
      const type = suggestSectionTypes(extractImportedContent(imported.data.html || ""))[0] ?? "text";
      converted += 1;
      return [convertImportedSection(imported, type)];
    });
    return { ...page, sections };
  });

  let { header, footer } = draft;
  if (wholeSite || droppedLegacyHeader) {
    if (header.imported) converted += 1;
    header = { ...chromeToBuilder(header), hidden: false };
  }
  if (wholeSite || droppedLegacyFooter) {
    if (footer.imported) {
      converted += 1;
      footer = { ...chromeToBuilder(footerFromImported(footer.imported, footer)), hidden: false };
    } else footer = { ...footer, hidden: false };
  }
  return { draft: { ...draft, header, footer, pages }, converted };
}
