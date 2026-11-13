// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import {
  duplicateImportedElement,
  duplicateImportedItem,
  moveImportedItem,
  readImportedGroups,
  removeImportedElement,
  removeImportedItem,
} from "./imported-html-structure.ts";
import { applyImportedHtmlEdits } from "./sections/ImportedHtmlSection.tsx";
import type { ImportedHtmlData } from "./types.ts";

const data: ImportedHtmlData = {
  html: `<section><h2 data-wb-text-id="t0">Products</h2><p class="lead" data-wb-text-id="t1">Strong boards.</p>
    <div class="grid">
      <article class="card" id="c1"><img src="/a.jpg" alt="A" data-wb-media-key="m0"><h3 data-wb-text-id="t2">Plywood</h3><a class="btn" href="/products" data-wb-text-id="t3">More</a></article>
      <article class="card"><img src="/b.jpg" alt="B" data-wb-media-key="m1"><h3 data-wb-text-id="t4">Doors</h3><a class="btn" href="/doors" data-wb-text-id="t5">More</a></article>
    </div></section>`,
  texts: [
    { id: "t0", label: "Heading", value: "Products" },
    { id: "t1", label: "Paragraph", value: "Strong boards." },
    { id: "t2", label: "Subheading", value: "Plywood" },
    { id: "t3", label: "Link", value: "More" },
    { id: "t4", label: "Subheading", value: "Doors" },
    { id: "t5", label: "Link", value: "More" },
  ],
  mediaSlots: [
    { key: "m0", kind: "image", url: "/a.jpg", alt: "A" },
    { key: "m1", kind: "image", url: "/b.jpg", alt: "B" },
  ],
};

describe("structural edits on imported blocks", () => {
  it("finds the repeated cards", () => {
    const groups = readImportedGroups(data.html);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.label).toBe("2 items: Plywood More, Doors More");
  });

  it("adds a card as a copy with its own editable text and image", () => {
    const next = duplicateImportedItem(data, 0, 0);
    expect(readImportedGroups(next.html)[0]!.items).toHaveLength(3);
    expect(next.texts!.map((t) => t.id)).toEqual(["t0", "t1", "t2", "t3", "t6", "t7", "t4", "t5"]);
    expect(next.mediaSlots!.map((m) => m.key)).toEqual(["m0", "m2", "m1"]);
    expect(next.html).not.toMatch(/id="c1"[\s\S]*id="c1"/); // element ids stay unique
    // Editing the copy changes only the copy.
    const edited = applyImportedHtmlEdits(next.html, [{ id: "t6", value: "Waterproof" }], undefined);
    expect(edited.match(/>Plywood</g)).toHaveLength(1);
    expect(edited).toContain(">Waterproof<");
  });

  it("removes and reorders cards, but never the last one", () => {
    const removed = removeImportedItem(data, 0, 0);
    expect(removed.html).not.toContain("Plywood");
    expect(removed.texts!.map((t) => t.id)).toEqual(["t0", "t1", "t4", "t5"]);
    expect(removed.mediaSlots!.map((m) => m.key)).toEqual(["m1"]);
    expect(removeImportedItem(removed, 0, 0)).toBe(removed);

    const moved = moveImportedItem(data, 0, 1, -1);
    expect(moved.html.indexOf("Doors")).toBeLessThan(moved.html.indexOf("Plywood"));
    expect(moved.texts!.map((t) => t.id)).toEqual(["t0", "t1", "t4", "t5", "t2", "t3"]);
  });

  it("adds or removes a single paragraph, button or image", () => {
    const more = duplicateImportedElement(data, { kind: "text", id: "t1" });
    expect(more.html.match(/class="lead"/g)).toHaveLength(2);
    expect(more.texts![2]).toEqual({ id: "t6", label: "Paragraph", value: "Strong boards." });

    const withButton = duplicateImportedElement(data, { kind: "link", index: 1 });
    expect(withButton.html.match(/href="\/doors"/g)).toHaveLength(2);

    const noImage = removeImportedElement(data, { kind: "media", key: "m0" });
    expect(noImage.html).not.toContain("/a.jpg");
    expect(noImage.mediaSlots!.map((m) => m.key)).toEqual(["m1"]);
  });
});
