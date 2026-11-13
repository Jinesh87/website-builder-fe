import type { ImportedHtmlData, SectionOf } from "../types.ts";

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

/** Renders sanitized, pre-scoped imported markup (a page block or the imported site header/footer). */
export function ImportedHtmlBlock({ data, sectionId }: { data: ImportedHtmlData; sectionId?: string }) {
  const scope = data.scope && SCOPE_PATTERN.test(data.scope) ? data.scope : "";
  const css = scope ? data.css || "" : "";
  const className = ["wb-imported-html", scope, data.chrome ? `wb-imported-html--${data.chrome}` : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={className} data-section-id={sectionId} data-wb-imported-html="">
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
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
  return <ImportedHtmlBlock data={data} sectionId={section.id} />;
}
