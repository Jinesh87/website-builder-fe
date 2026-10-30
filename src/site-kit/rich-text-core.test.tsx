import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { richTextFonts, sanitizeRichText, toPlainText } from "./rich-text-core.ts";
import { parseRichText } from "./rich-text.tsx";

const html = (value: string) => renderToStaticMarkup(<>{parseRichText(value)}</>);

describe("rich text", () => {
  it("leaves plain strings untouched", () => {
    expect(sanitizeRichText("Fish & Chips < 5")).toBe("Fish & Chips < 5");
    expect(parseRichText("Plain heading")).toBe("Plain heading");
    expect(toPlainText("Plain heading")).toBe("Plain heading");
  });

  it("keeps existing template markup working", () => {
    expect(html("Old soul,<br><em>new</em> stories.")).toBe("Old soul,<br/><em>new</em> stories.");
    expect(html("<b>Bold</b> and <i>italic</i>")).toBe("<strong>Bold</strong> and <em>italic</em>");
    expect(html('<span style="color: red">Red</span>')).toBe('<span class="wb-rt" style="--rt-c:red">Red</span>');
  });

  it("renders word styles as scoped custom properties", () => {
    const value = '<span style="color:#ff0000;font-size:32px;font-weight:800;font-style:italic" data-font="lora" data-size-mobile="20px">Bakery</span>';
    const markup = html(`Best ${value} in town`);
    expect(markup).toContain('class="wb-rt"');
    expect(markup).toContain("--rt-c:#ff0000");
    expect(markup).toContain("--rt-fs:32px");
    expect(markup).toContain("--rt-mfs:20px");
    expect(markup).toContain("--rt-fw:800");
    expect(markup).toContain("--rt-it:italic");
    expect(markup).toContain("Lora Variable");
  });

  it("supports nested spans", () => {
    const value = '<span style="color:#111111">A <span style="font-weight:700">B</span> C</span>';
    expect(sanitizeRichText(value)).toBe(value);
    expect(toPlainText(value)).toBe("A B C");
  });

  it("drops unsafe styles and never emits unknown tags as markup", () => {
    expect(sanitizeRichText('<span style="background:url(javascript:alert(1));color:#00ff00">x</span>')).toBe(
      '<span style="color:#00ff00">x</span>',
    );
    expect(sanitizeRichText('<span style="color:expression(alert(1))">x</span>')).toBe("x");
    expect(sanitizeRichText('<span onclick="alert(1)" style="color:#000000">x</span>')).toBe('<span style="color:#000000">x</span>');
    expect(sanitizeRichText('<span data-font="evil">x</span>')).toBe("x");
    expect(sanitizeRichText('<span style="font-size:9999px">x</span>')).toBe("x");
    expect(html('<img src=x onerror="alert(1)"><script>alert(1)</script>')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });

  it("tolerates broken markup", () => {
    expect(sanitizeRichText("<strong>never closed")).toBe("<strong>never closed</strong>");
    expect(sanitizeRichText("stray</em> close")).toBe("stray close");
    expect(sanitizeRichText("<em><strong>x</em></strong>")).toBe("<em><strong>x</strong></em>");
    expect(sanitizeRichText("<strong></strong>empty")).toBe("empty");
  });

  it("measures and extracts plain text", () => {
    expect(toPlainText('Line<br>two <span style="color:#000000">words</span>')).toBe("Line two words");
    expect(toPlainText("a<br>b", "\n")).toBe("a\nb");
  });

  it("finds fonts used on words", () => {
    expect([...richTextFonts('<span data-font="lora">a</span> <span data-font="inter">b</span>')]).toEqual(["lora", "inter"]);
    expect([...richTextFonts("plain")]).toEqual([]);
  });
});
