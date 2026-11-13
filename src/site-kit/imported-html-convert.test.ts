// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { alternateOf, chromeToBuilder, chromeToImported, convertDraftToBuilder, convertImportedSection, extractImportedContent, footerFromImported, hasImportedHtml, suggestSectionTypes, switchToAlternate } from "./imported-html-convert.ts";
import type { FooterData, HeaderData, Section } from "./types.ts";
import type { SectionOf } from "./types.ts";

function block(html: string, title = "Block"): SectionOf<"imported_html"> {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    type: "imported_html",
    hidden: false,
    settings: { background: "default", hideOnMobile: false },
    data: { title, html, css: "", scope: "wbi-test1" },
  };
}

const CARDS = `<section class="sec"><div class="sec-head"><span class="eyebrow">Our products</span><h2>Plywood &amp; Boards</h2>
  <p>Strong, reliable boards.</p></div>
  <div class="prods">
    <article class="card"><img src="/m/a.png" alt="A"><div class="body"><h3>Plywood</h3><p>Everyday plywood.</p></div></article>
    <article class="card"><img src="/m/b.png" alt="B"><div class="body"><h3>Multiwood</h3><p>Moisture resistant.</p></div></article>
    <article class="card cta"><h3>Not sure?</h3><p>Call us.</p><a class="btn" href="/contact">Call us</a></article>
  </div>
  <a class="btn" href="/products">View all products</a></section>`;

describe("imported HTML → builder section", () => {
  it("reads heading, eyebrow, intro, cards and buttons from structure", () => {
    const content = extractImportedContent(CARDS);
    expect(content.heading).toBe("Plywood & Boards");
    expect(content.eyebrow).toBe("Our products");
    expect(content.paragraphs[0]).toBe("Strong, reliable boards.");
    expect(content.items.map((item) => item.title)).toEqual(["Plywood", "Multiwood", "Not sure?"]);
    expect(content.items[0]!.image).toEqual({ url: "/m/a.png", alt: "A" });
    expect(content.buttons).toEqual([{ label: "View all products", href: "/products" }]);
    expect(suggestSectionTypes(content)[0]).toBe("services");
  });

  it("converts into the chosen type, keeping id and dropping template placeholder copy", () => {
    const converted = convertImportedSection(block(CARDS), "services") as SectionOf<"services">;
    expect(converted.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(converted.type).toBe("services");
    expect(converted.data.heading).toBe("Plywood & Boards");
    expect(converted.data.intro).toBe("Strong, reliable boards.");
    expect(converted.data.items).toHaveLength(3);
    expect(converted.data.columns).toBe(3);

    const strip = convertImportedSection(block(`<div class="grid"><div class="item"><b>Fast</b><small>Quick</small></div><div class="item"><b>Safe</b><small>Secure</small></div></div>`), "features") as SectionOf<"features">;
    expect(strip.data.heading).toBeUndefined();
    expect(strip.data.intro).toBeUndefined();
    expect(strip.data.items.map((item) => [item.title, item.description])).toEqual([["Fast", "Quick"], ["Safe", "Secure"]]);
  });

  it("recognises FAQs, heroes and breadcrumbs", () => {
    const faq = extractImportedContent(`<h2>Questions</h2><details><summary>Do you deliver?</summary><p>Yes.</p></details><details><summary>Custom sizes?</summary><p>Yes, any size.</p></details>`);
    expect(suggestSectionTypes(faq)[0]).toBe("faq");
    expect(faq.faqs[1]).toEqual({ question: "Custom sizes?", answer: "Yes, any size." });

    const hero = convertImportedSection(
      block(`<section class="hero"><span class="badge">New</span><h1>Furniture for <span>Every Home</span></h1><p>Quality wood.</p><a href="/contact">Call us</a><img src="/m/h.jpg" alt=""></section>`),
      "hero",
    ) as SectionOf<"hero">;
    expect(hero.data.heading).toBe("Furniture for Every Home");
    expect(hero.data.eyebrow).toBe("New");
    expect(hero.data.primaryCta).toEqual({ label: "Call us", href: "/contact" });
    expect(hero.data.image?.url).toBe("/m/h.jpg");

    const pageHead = convertImportedSection(block(`<section class="pagehead"><div class="crumb"><a href="/">Home</a> › Products</div><h1>Products</h1><p>All boards.</p></section>`), "hero") as SectionOf<"hero">;
    expect(pageHead.data.eyebrow).toBeUndefined();
    expect(pageHead.data.primaryCta).toBeUndefined();
  });

  it("converts a whole site, switching the imported header/footer to builder designs", () => {
    const header = { design: "logo-left", siteName: "S", menu: [{ label: "Home", href: "/" }], sticky: true, hidden: false, imported: { html: "<header>x</header>" } } as HeaderData;
    const footer = { design: "simple", siteName: "S", columns: [], social: [], hidden: false, imported: { html: "<footer>y</footer>" } } as unknown as FooterData;
    const legacyChrome = { ...block("<header>old</header>"), id: "22222222-2222-4222-8222-222222222222" };
    legacyChrome.data = { ...legacyChrome.data, chrome: "header" };
    const draft = {
      header,
      footer,
      pages: [
        { id: "p1", sections: [legacyChrome, block(CARDS)] as Section[] },
        { id: "p2", sections: [block(`<h2>FAQ</h2><details><summary>A?</summary><p>B</p></details><details><summary>C?</summary><p>D</p></details>`)] as Section[] },
      ],
    };
    expect(hasImportedHtml(draft)).toBe(true);

    const onePage = convertDraftToBuilder(draft, { pageIds: ["p2"] });
    expect(onePage.draft.pages[1]!.sections[0]!.type).toBe("faq");
    expect(onePage.draft.pages[0]!.sections[1]!.type).toBe("imported_html");
    expect(onePage.draft.header.imported).toBeDefined();

    const site = convertDraftToBuilder(draft);
    expect(site.draft.pages.flatMap((p) => p.sections.map((s) => s.type))).toEqual(["services", "faq"]);
    expect(site.draft.header.imported).toBeUndefined();
    expect(site.draft.footer.imported).toBeUndefined();
    expect(site.draft.header.menu).toEqual([{ label: "Home", href: "/" }]);
    expect(hasImportedHtml(site.draft)).toBe(false);
  });

  it("converts a contact block with its details and enquiry form fields", () => {
    const html = `<section class="contact"><span class="eyebrow">Get in touch</span><h2>Visit our shop</h2><p>We reply within a day.</p>
      <div class="row"><small>Address</small><b>12 MG Road,<br>Bengaluru 560038</b></div>
      <p><a href="tel:+919876543210">+91 98765 43210</a> · <a href="mailto:hi@shop.in">hi@shop.in</a></p><p>Mon–Sat 9:00 am – 7:00 pm</p>
      <form><label for="n">Your name *</label><input id="n" name="name" required>
        <label>Email <input type="email" name="email"></label>
        <label for="t">Topic</label><select id="t" name="topic"><option>Select one</option><option>Sales</option><option>Support</option></select>
        <textarea name="message" placeholder="How can we help?"></textarea><button type="submit">Send enquiry</button>
        <input type="text" name="_wb_hp" tabindex="-1" aria-hidden="true"></form></section>`;
    const content = extractImportedContent(html);
    expect(suggestSectionTypes(content)[0]).toBe("contact");
    const contact = convertImportedSection(block(html), "contact") as SectionOf<"contact">;
    expect(contact.data).toMatchObject({
      heading: "Visit our shop",
      eyebrow: "Get in touch",
      text: "We reply within a day.",
      email: "hi@shop.in",
      phone: "+91 98765 43210",
      address: "12 MG Road, Bengaluru 560038",
      showForm: true,
      submitLabel: "Send enquiry",
    });
    expect(contact.data.officeHours).toMatch(/9:00 am/);
    expect(contact.data.formFields).toEqual([
      { id: "name", type: "text", label: "Your name", required: true, width: "half" },
      { id: "email", type: "email", label: "Email", width: "half" },
      { id: "topic", type: "select", label: "Topic", width: "half", options: ["Sales", "Support"] },
      { id: "message", type: "textarea", label: "How can we help?", placeholder: "How can we help?", width: "full" },
    ]);
  });

  it("follows data-wb-section / data-wb-field / data-wb-item markers", () => {
    const html = `<section data-wb-section="pricing"><p data-wb-field="eyebrow">Plans</p><h3>Small print</h3><h2 data-wb-field="heading">Pick a plan</h2>
      <div data-wb-item><b data-wb-field="title">Starter</b><span data-wb-field="price">₹499</span><p data-wb-field="description">For one shop</p></div>
      <div data-wb-item><b data-wb-field="title">Growth</b><span data-wb-field="price">₹999</span><p data-wb-field="description">For chains</p></div></section>`;
    const content = extractImportedContent(html);
    expect(content.typeHint).toBe("pricing");
    expect(suggestSectionTypes(content)[0]).toBe("pricing");
    const pricing = convertImportedSection(block(html), "pricing") as SectionOf<"pricing">;
    expect(pricing.data.heading).toBe("Pick a plan");
    expect(pricing.data.eyebrow).toBe("Plans");
    expect(pricing.data.plans.map((p) => [p.name, p.price, p.description])).toEqual([["Starter", "₹499", "For one shop"], ["Growth", "₹999", "For chains"]]);
  });

  it("recognises testimonials, pricing, team and logos", () => {
    const testimonials = extractImportedContent(`<h2>Reviews</h2><figure><blockquote>“Great service.”</blockquote><figcaption>Asha</figcaption></figure><figure><blockquote>“Fast delivery.”</blockquote><figcaption>Ravi</figcaption></figure>`);
    expect(suggestSectionTypes(testimonials)[0]).toBe("testimonials");
    expect(testimonials.quotes.map((q) => [q.quote, q.name])).toEqual([["Great service.", "Asha"], ["Fast delivery.", "Ravi"]]);

    const pricingHtml = `<h2>Plans</h2><div class="plans"><div class="plan"><h3>Basic</h3><p>₹999 / month</p><ul><li>1 site</li></ul></div><div class="plan popular"><h3>Pro</h3><p>₹1,999 / month</p><ul><li>5 sites</li><li>Support</li></ul><a href="/buy">Buy</a></div></div>`;
    expect(suggestSectionTypes(extractImportedContent(pricingHtml))[0]).toBe("pricing");
    const pricing = convertImportedSection(block(pricingHtml), "pricing") as SectionOf<"pricing">;
    expect(pricing.data.plans.map((p) => [p.name, p.price, p.period, p.featured, p.features.length])).toEqual([
      ["Basic", "₹999", "/month", false, 1],
      ["Pro", "₹1,999", "/month", true, 2],
    ]);

    const teamHtml = `<h2>Our team</h2><div class="team"><div class="m"><img src="/a.jpg" alt="Asha"><h3>Asha Rao</h3><p>Founder</p></div><div class="m"><img src="/b.jpg" alt="Ravi"><h3>Ravi K</h3><p>Designer</p></div></div>`;
    expect(suggestSectionTypes(extractImportedContent(teamHtml))[0]).toBe("team");
    const team = convertImportedSection(block(teamHtml), "team") as SectionOf<"team">;
    expect(team.data.members.map((m) => [m.name, m.role, m.photo?.url])).toEqual([["Asha Rao", "Founder", "/a.jpg"], ["Ravi K", "Designer", "/b.jpg"]]);

    const logos = extractImportedContent(`<div class="clients"><img src="/1.png" alt=""><img src="/2.png" alt=""><img src="/3.png" alt=""><img src="/4.png" alt=""></div>`);
    expect(suggestSectionTypes(logos)).toContain("logos");
  });

  it("builds a builder footer from the imported footer", () => {
    const footer = footerFromImported(
      {
        html: `<footer><img src="/logo.png" alt="Shop"><p>Quality furniture and plywood since 1998.</p>
          <div><h4>Quick links</h4><a href="/">Home</a><a href="/about">About</a></div>
          <div><h4>Call us</h4><a href="tel:+919876543210">+91 98765 43210</a></div>
          <a href="https://instagram.com/shop">IG</a><p>© 2026 Shop. All rights reserved.</p></footer>`,
      },
      { design: "simple", siteName: "Shop", columns: [], social: [], copyright: "x" } as unknown as FooterData,
    );
    expect(footer.design).toBe("columns");
    expect(footer.columns).toEqual([{ title: "Quick links", links: [{ label: "Home", href: "/" }, { label: "About", href: "/about" }] }]);
    expect(footer.social).toEqual([{ label: "Instagram", href: "https://instagram.com/shop", openInNewTab: true }]);
    expect(footer.contact?.phone).toBe("+91 98765 43210");
    expect(footer.copyright).toBe("© 2026 Shop. All rights reserved.");
    expect(footer.logo?.url).toBe("/logo.png");
  });

  it("switches between the converted section and the imported original without losing edits", () => {
    const original = block(CARDS, "Products");
    const converted = convertImportedSection(original, "services") as SectionOf<"services">;
    expect(alternateOf(converted)).toEqual({ type: "imported_html", data: original.data });

    const edited = { ...converted, data: { ...converted.data, heading: "Edited heading" } };
    const back = switchToAlternate(edited)!;
    expect(back.type).toBe("imported_html");
    expect(back.id).toBe(original.id);
    expect((back.data as { html: string }).html).toBe(original.data.html);
    expect(alternateOf(back)?.type).toBe("services");

    const again = switchToAlternate(back) as SectionOf<"services">;
    expect(again.type).toBe("services");
    expect(again.data.heading).toBe("Edited heading");
    expect(alternateOf(again)?.data).toEqual(original.data);
    // Never nests: each version holds exactly one other version.
    expect((alternateOf(again)?.data as Record<string, unknown>).importAlternate).toBeUndefined();
  });

  it("keeps the imported header/footer when switching to the builder design", () => {
    const header = { design: "logo-left", siteName: "S", menu: [], sticky: true, imported: { html: "<header>x</header>" } } as unknown as HeaderData;
    const builder = chromeToBuilder(header);
    expect(builder.imported).toBeUndefined();
    expect(builder.importedHidden).toEqual({ html: "<header>x</header>" });
    expect(chromeToImported(builder).imported).toEqual({ html: "<header>x</header>" });
    expect(convertDraftToBuilder({ header, footer: { ...header, imported: undefined } as unknown as FooterData, pages: [] }).draft.header.importedHidden).toBeDefined();
  });
});
