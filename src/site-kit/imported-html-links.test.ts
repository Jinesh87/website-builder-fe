// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { applyImportedLinkEdit, readImportedLinks } from "./sections/ImportedHtmlSection.tsx";

const HTML = `<section><a class="btn" href="/contact" data-wb-text-id="t1"><svg viewBox="0 0 1 1"></svg>Call us now</a>
  <a href="https://instagram.com/x" target="_blank" rel="noopener noreferrer"><img src="/ig.png" alt="Instagram"></a></section>`;

describe("imported HTML links", () => {
  it("lists every link with its label and destination", () => {
    expect(readImportedLinks(HTML)).toEqual([
      { index: 0, link: { label: "Call us now", href: "/contact" }, hasText: true, textId: "t1" },
      { index: 1, link: { label: "Instagram", href: "https://instagram.com/x", openInNewTab: true }, hasText: false },
    ]);
  });

  it("changes destination, new-tab and label without touching the rest of the markup", () => {
    let html = applyImportedLinkEdit(HTML, 0, { label: "Get a quote", href: "/products", openInNewTab: true });
    const [first] = readImportedLinks(html);
    expect(first!.link).toEqual({ label: "Get a quote", href: "/products", openInNewTab: true });
    expect(html).toContain("<svg"); // the icon inside the button is kept
    expect(html).toContain('class="btn"');

    html = applyImportedLinkEdit(html, 1, { label: "ignored for image links", href: "https://facebook.com/x" });
    const second = readImportedLinks(html)[1]!;
    expect(second.link).toEqual({ label: "Instagram", href: "https://facebook.com/x" });
    expect(html).not.toContain('target="_blank" rel="noopener noreferrer"><img');
  });

  it("supports download and video links", () => {
    const html = applyImportedLinkEdit(HTML, 0, { label: "Watch", href: "", actionType: "video", videoUrl: "https://youtu.be/abc" });
    expect(readImportedLinks(html)[0]!.link).toEqual({ label: "Watch", href: "https://youtu.be/abc", actionType: "video", videoUrl: "https://youtu.be/abc" });
    const pdf = applyImportedLinkEdit(HTML, 0, { label: "Brochure", href: "/api/media/files/x", actionType: "download" });
    expect(readImportedLinks(pdf)[0]!.link.actionType).toBe("download");
  });

  it("keeps an emptied destination empty and names nested-text links readably", () => {
    const cleared = applyImportedLinkEdit(HTML, 0, { label: "Call us now", href: "" });
    expect(readImportedLinks(cleared)[0]!.link.href).toBe("");
    const brand = `<a href="/"><img src="/l.png" alt=""><span><b>W<span>OO</span>DFIT FURNITA</b><small>Furniture &amp; Plywood</small></span></a>`;
    expect(readImportedLinks(brand)[0]!.link.label).toBe("WOODFIT FURNITA Furniture & Plywood");
  });
});
