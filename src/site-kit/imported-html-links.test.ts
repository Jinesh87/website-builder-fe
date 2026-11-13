// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { applyImportedLinkEdit, applyImportedLinkIcon, readImportedLinks } from "./sections/ImportedHtmlSection.tsx";

const HTML = `<section><a class="btn" href="/contact" data-wb-text-id="t1"><svg viewBox="0 0 1 1"></svg>Call us now</a>
  <a href="https://instagram.com/x" target="_blank" rel="noopener noreferrer"><img src="/ig.png" alt="Instagram"></a></section>`;

describe("imported HTML links", () => {
  it("lists every link with its label and destination", () => {
    expect(readImportedLinks(HTML)).toEqual([
      { index: 0, link: { label: "Call us now", href: "/contact" }, hasText: true, hasIcon: true, textId: "t1" },
      { index: 1, link: { label: "Instagram", href: "https://instagram.com/x", openInNewTab: true }, hasText: false, hasIcon: false },
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

  it("swaps a link's icon or icon-font glyph for a picked logo, keeping its size classes", () => {
    const logo = `<svg viewBox="0 0 24 24" fill="currentColor" data-wb-icon="brand:facebook"><path d="M1 1"></path></svg>`;
    const social = `<a href="https://fb.com/x"><i class="fa fa-twitter"></i></a><a href="/c"><svg class="ico" width="18" height="18"></svg>Call</a><a href="/d">Plain</a>`;
    let html = applyImportedLinkIcon(social, 0, logo);
    expect(html).not.toContain("fa-twitter");
    expect(readImportedLinks(html)[0]!.link.icon).toBe("brand:facebook");
    html = applyImportedLinkIcon(html, 1, logo);
    expect(html).toMatch(/<svg[^>]*class="ico"[^>]*>|<svg[^>]*width="18"/);
    expect(html).toContain("Call");
    html = applyImportedLinkIcon(html, 2, logo);
    expect(readImportedLinks(html)[2]).toMatchObject({ hasIcon: true, hasText: true, link: { icon: "brand:facebook" } });
    // Removing an icon never empties an icon-only link.
    expect(applyImportedLinkIcon(html, 0, "")).toContain('data-wb-icon="brand:facebook"');
  });
});
