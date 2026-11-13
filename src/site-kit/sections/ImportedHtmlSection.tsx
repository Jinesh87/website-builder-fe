import type { ImportedHtmlData, LinkRef, SectionOf, SectionSettings } from "../types.ts";
import { importedStyleCss } from "../imported-html-style.ts";

const SCOPE_PATTERN = /^wbi-[a-z0-9]{4,40}$/;

/**
 * Writes `value` into the element's own text (its direct text nodes) and leaves child elements —
 * highlighted <span>s, icons, <br>s — untouched.
 */
function setOwnText(node: Element, value: string): void {
  const textNodes = Array.from(node.childNodes).filter(
    (child): child is Text => child.nodeType === Node.TEXT_NODE && Boolean(child.textContent?.trim()),
  );
  if (textNodes.length === 0) {
    node.appendChild(node.ownerDocument.createTextNode(value));
    return;
  }
  const [first, ...rest] = textNodes;
  const original = first!.textContent ?? "";
  const lead = /^\s*/.exec(original)?.[0] ?? "";
  const trail = /\s*$/.exec(original)?.[0] ?? "";
  first!.textContent = `${lead}${value}${trail}`;
  for (const extra of rest) extra.textContent = " ";
}

function ownText(node: Element): string {
  return Array.from(node.childNodes)
    .filter((child) => child.nodeType === Node.TEXT_NODE)
    .map((child) => child.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Bakes inspector edits into the stored HTML. Called by the inspector form only, so rendering
 * stays a pure function of `data.html` (identical in the editor, preview and server render).
 */
export function applyImportedHtmlEdits(
  html: string,
  texts: { id: string; value: string }[] | undefined,
  mediaSlots: { key: string; url: string; alt?: string }[] | undefined,
): string {
  if (typeof document === "undefined") return html;
  const template = document.createElement("template");
  template.innerHTML = html;
  const root = template.content;

  for (const text of texts ?? []) {
    const node = root.querySelector(`[data-wb-text-id="${CSS.escape(text.id)}"]`);
    if (node && ownText(node) !== text.value.replace(/\s+/g, " ").trim()) setOwnText(node, text.value);
  }

  for (const slot of mediaSlots ?? []) {
    root.querySelectorAll(`[data-wb-media-key="${CSS.escape(slot.key)}"]`).forEach((node) => {
      if (node instanceof HTMLImageElement) {
        if (node.getAttribute("src") !== slot.url) {
          node.setAttribute("src", slot.url);
          node.removeAttribute("srcset"); // otherwise the browser keeps showing the old responsive image
        }
        if (slot.alt != null) node.setAttribute("alt", slot.alt);
      } else if (node instanceof HTMLVideoElement) {
        if (node.getAttribute("src") !== slot.url) {
          node.setAttribute("src", slot.url);
          node.querySelectorAll("source").forEach((source) => source.remove());
        }
      }
    });
  }

  return template.innerHTML;
}

/**
 * Imported forms post to the site's contact endpoint as `{ sectionId, formIndex, fields }`; the
 * section id is only known at render time (blocks get copied/duplicated), so it is stamped here.
 */
function withFormSection(html: string, sectionId: string | undefined): string {
  if (!sectionId || !html.includes("data-wb-imported-form")) return html;
  const safeId = sectionId.replace(/[^\w-]/g, "");
  return html.replace(/<form\b(?![^>]*\sdata-wb-section=)/g, `<form data-wb-section="${safeId}"`);
}

/**
 * Visible text with a space where separate elements meet ("WOODFIT FURNITA" + "Furniture &
 * Plywood"), but not inside all-caps words split for styling ("W<span>OO</span>DFIT").
 */
export function spacedText(el: Element): string {
  let out = "";
  let lastText = "";
  let lastParent: Node | null = null;
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    if (!text.trim() || node.parentElement?.closest("svg")) continue;
    const prev = out.at(-1) ?? "";
    const next = text.trimStart()[0] ?? "";
    // A word split for styling: capitals on both sides and one side a short fragment.
    const capsJoin = /\p{Lu}/u.test(prev) && /\p{Lu}/u.test(next) && (lastText.trim().length <= 3 || text.trim().length <= 3);
    if (out && lastParent !== node.parentNode && !/\s/.test(prev) && !/^\s/.test(text) && !capsJoin) out += " ";
    out += text;
    lastText = text;
    lastParent = node.parentNode;
  }
  return out.replace(/\s+/g, " ").trim();
}

/** One link (`<a href>`) inside imported markup, as the builder's link editor sees it. */
export type ImportedLink = {
  /** Position among the block's links (stable: link edits never add or remove links). */
  index: number;
  link: LinkRef;
  /** The link has its own words (not just an image/icon), so its label is editable. */
  hasText: boolean;
  /** `data-wb-text-id` of the link, when its words are also listed under "Text". */
  textId?: string;
  /** The link shows an icon or logo (an inline SVG or an icon-font glyph) that can be swapped. */
  hasIcon: boolean;
};

const ICON_CLASS = /(^|[\s_-])(icon|fa[a-z]?|bi|ri|ti|la[a-z]?|mdi|ion|feather|glyph\w*|social\w*)([\s_-]|$)/i;

/** The link's icon element: an inline <svg>, or an empty icon-font element like <i class="fa fa-facebook">. */
export function findLinkIcon(anchor: Element): Element | null {
  for (const el of Array.from(anchor.querySelectorAll("svg, i, span"))) {
    // Document order: the outermost <svg> comes first.
    if (el.tagName.toLowerCase() === "svg") return el;
    if (el.textContent?.trim() || el.querySelector("img, svg")) continue;
    if (el.tagName.toLowerCase() === "i" || ICON_CLASS.test(el.getAttribute("class") || "")) return el;
  }
  return null;
}

function parseFragment(html: string): HTMLTemplateElement {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template;
}

/** Lists every link in imported markup with its label and destination. */
export function readImportedLinks(html: string): ImportedLink[] {
  if (typeof document === "undefined" || !html.includes("href")) return [];
  return Array.from(parseFragment(html).content.querySelectorAll("a[href]")).map((anchor, index) => {
    const words = ownText(anchor) || spacedText(anchor);
    const fallback = anchor.getAttribute("aria-label") || anchor.querySelector("img")?.getAttribute("alt") || "";
    const isVideo = anchor.hasAttribute("data-wb-video-modal");
    const link: LinkRef = {
      label: words || fallback || "Link",
      href: anchor.getAttribute("href") ?? "",
      ...(anchor.getAttribute("target") === "_blank" ? { openInNewTab: true } : {}),
      ...(anchor.hasAttribute("download") ? { actionType: "download" as const } : {}),
      ...(isVideo ? { actionType: "video" as const, videoUrl: anchor.getAttribute("data-wb-video-url") ?? "" } : {}),
    };
    const icon = findLinkIcon(anchor);
    const iconName = icon?.getAttribute("data-wb-icon");
    if (iconName) link.icon = iconName;
    return {
      index,
      link,
      hasText: Boolean(ownText(anchor)),
      hasIcon: Boolean(icon),
      ...(anchor.getAttribute("data-wb-text-id") ? { textId: anchor.getAttribute("data-wb-text-id")! } : {}),
    };
  });
}

/** Applies a link edit (destination, new tab, download/video, label) to link #index. */
export function applyImportedLinkEdit(html: string, index: number, link: LinkRef): string {
  if (typeof document === "undefined") return html;
  const template = parseFragment(html);
  const anchor = template.content.querySelectorAll("a[href]")[index];
  if (!anchor) return html;

  const isVideo = link.actionType === "video";
  // An emptied field stays empty while the user picks a page (a "#" would hide the page list).
  anchor.setAttribute("href", (isVideo ? link.videoUrl || link.href : link.href) ?? "");
  if (link.openInNewTab && !isVideo) {
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
  } else {
    anchor.removeAttribute("target");
    anchor.removeAttribute("rel");
  }
  if (link.actionType === "download") anchor.setAttribute("download", link.downloadFileName?.trim() || "");
  else anchor.removeAttribute("download");
  if (isVideo) {
    anchor.setAttribute("data-wb-video-modal", "true");
    anchor.setAttribute("data-wb-video-url", link.videoUrl || link.href || "");
  } else {
    anchor.removeAttribute("data-wb-video-modal");
    anchor.removeAttribute("data-wb-video-url");
  }
  if (ownText(anchor) && link.label.trim() && ownText(anchor) !== link.label.trim()) setOwnText(anchor, link.label.trim());
  return template.innerHTML;
}

/**
 * Swaps the icon/logo of link #index for `iconMarkup` (a single <svg> or <img>, tagged with
 * `data-wb-icon`). The new icon keeps the old one's classes and size so the imported CSS still
 * styles it; a link without an icon gets one before its words. Empty markup removes the icon.
 */
export function applyImportedLinkIcon(html: string, index: number, iconMarkup: string): string {
  if (typeof document === "undefined") return html;
  const template = parseFragment(html);
  const anchor = template.content.querySelectorAll("a[href]")[index];
  if (!anchor) return html;
  const old = findLinkIcon(anchor);
  if (!iconMarkup) {
    // Never leave a link with nothing to click on.
    if (old && ownText(anchor)) old.remove();
    return template.innerHTML;
  }
  const next = parseFragment(iconMarkup).content.firstElementChild;
  if (!next) return html;
  if (old) {
    const oldClass = old.getAttribute("class");
    // Icon-font classes draw their own glyph (::before): don't carry those over.
    if (oldClass && old.tagName.toLowerCase() === "svg") next.setAttribute("class", oldClass);
    for (const attr of ["width", "height", "style"]) {
      const value = old.getAttribute(attr);
      if (value && old.tagName.toLowerCase() === "svg") next.setAttribute(attr, value);
    }
    if (!next.getAttribute("width") && !next.getAttribute("style")) {
      next.setAttribute("width", "1em");
      next.setAttribute("height", "1em");
    }
    old.replaceWith(next);
  } else {
    next.setAttribute("width", "1em");
    next.setAttribute("height", "1em");
    next.setAttribute("style", "display:inline-block;vertical-align:-0.125em;margin-inline-end:0.4em");
    anchor.prepend(next);
  }
  return template.innerHTML;
}

/**
 * Renders sanitized, pre-scoped imported markup (a page block or the imported site header/footer).
 * `settings` (page blocks only) layers the section's Style / Responsive / Advanced choices on top.
 */
export function ImportedHtmlBlock({ data, sectionId, settings }: { data: ImportedHtmlData; sectionId?: string; settings?: SectionSettings }) {
  const scope = data.scope && SCOPE_PATTERN.test(data.scope) ? data.scope : "";
  const css = scope ? data.css || "" : "";
  const overrides = importedStyleCss(sectionId, settings);
  const className = [
    "wb-imported-html",
    scope,
    data.chrome ? `wb-imported-html--${data.chrome}` : "",
    settings?.hideOnMobile ? "wb-hide-mobile" : "",
    settings?.hideOnDesktop ? "wb-hide-desktop" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={className} id={settings?.anchor || undefined} data-section-id={sectionId} data-wb-imported-html="">
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      {overrides ? <style dangerouslySetInnerHTML={{ __html: overrides }} /> : null}
      <div className="wb-imported-html-root" dangerouslySetInnerHTML={{ __html: withFormSection(data.html, sectionId) }} />
    </div>
  );
}

/**
 * Full-fidelity block imported from HTML. Markup is sanitized and CSS is pre-scoped to
 * `.wb-site .{scope}` on the server, so it is rendered verbatim here.
 */
export default function ImportedHtmlSection({ section }: { section: SectionOf<"imported_html"> }) {
  const { data } = section;
  if (!data.html?.trim()) {
    return (
      <section className="wb-section wb-imported-html-empty" data-section-id={section.id}>
        <div className="wb-container">
          <p className="wb-empty">Imported HTML is empty.</p>
        </div>
      </section>
    );
  }
  return <ImportedHtmlBlock data={data} sectionId={section.id} settings={section.settings} />;
}
