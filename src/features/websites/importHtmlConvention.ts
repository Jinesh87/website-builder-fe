/**
 * Guide shown on the "Import HTML" step. The markers it documents are read by:
 *  - backend html-import-components.ts (pages, blocks, header/footer detection, block names), and
 *  - site-kit/imported-html-convert.ts (data-wb-section type, data-wb-field / data-wb-item hints
 *    used when a block is converted to a builder section), and
 *  - features/site-export/imported-menu-runtime.js (data-wb-nav-toggle / data-wb-nav / data-wb-nav-open-class
 *    for mobile menus).
 */
import { CONVERTIBLE_TYPES, type ConvertibleType } from "../../site-kit/imported-html-convert.ts";

/** What happens to any HTML, tagged or not. */
export const IMPORT_MARKUP_SUMMARY = [
  "Any HTML works. The page's own JavaScript runs first, then each top-level block inside <main> becomes an editable block with its original look.",
  "<header> and <footer> outside <main> become the site-wide header and footer. Forms keep working and send enquiries to the site's contact email.",
  "Your own scripts don't run on the published site (they're removed for safety). The mobile menu button is handled for you; mark it as shown below to make it exact.",
  "Pages: put each page in its own .html file in a .zip (index.html is Home, about.html becomes /about), or wrap pages in data-wb-page=\"slug\" inside one file.",
  "Upload a .zip with the HTML, CSS and images so file paths resolve. Colours and fonts are taken from your CSS for the builder theme.",
] as const;

/** Optional markers: they make the split and the conversion to builder sections exact. */
export const IMPORT_MARKER_RULES = [
  'data-wb-section="TYPE" on a block chooses the builder section it converts to (types listed below). Without it, the type is guessed from the content.',
  'data-wb-component="Name" names the block in the component library.',
  'data-wb-field="…" marks a part of a block: heading, eyebrow, subheading, primaryCta, secondaryCta, image.',
  'data-wb-item marks each repeated card; inside it use data-wb-field: title, description, image, link, price, role.',
  'data-wb-nav-toggle marks the mobile menu (hamburger) button. Put data-wb-nav on the menu it opens, and data-wb-nav-open-class="open" on that menu with the class your CSS uses for an open menu. Without them the menu is detected automatically.',
] as const;

/** What each builder section type is for; `satisfies` makes a new type fail to compile until documented. */
const SECTION_TYPE_USES = {
  hero: "Main banner: heading, text, buttons, image or video",
  features: "Grid of short benefits (title + description)",
  services: "Cards for products or services, with image, price and link",
  faq: "Questions and answers (<details>/<summary> works)",
  cta: "Call-to-action band with one or two buttons",
  contact: "Contact details and an enquiry <form>",
  testimonials: "Customer quotes (<blockquote> + name)",
  team: "People with photo, name and role",
  pricing: "Plans with price, features and button",
  text: "Heading and paragraphs",
  split: "Text and bullet points beside an image",
  gallery: "Image grid",
  logos: "Row of client or partner logos",
  media: "Single image or video",
  stats: "Big numbers with labels",
} satisfies Record<ConvertibleType, string>;

/** Builder section types a block can convert to (`data-wb-section` values). */
export const IMPORT_SECTION_TYPES = CONVERTIBLE_TYPES.map((type) => ({ type, use: SECTION_TYPE_USES[type] }));

/** Starter template users can copy. Opens correctly in a browser as-is. */
export const IMPORT_MARKUP_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My business</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Site header: shared by every page -->
  <header>
    <a href="index.html"><img src="images/logo.png" alt="My business"></a>
    <!-- Mobile menu: the button opens the nav by adding the "open" class (style .menu.open in your CSS) -->
    <button data-wb-nav-toggle aria-label="Open menu">☰</button>
    <nav class="menu" data-wb-nav data-wb-nav-open-class="open">
      <a href="index.html">Home</a> <a href="contact.html">Contact</a>
    </nav>
  </header>

  <main>
    <!-- Each top-level block here becomes one block on the page -->
    <section data-wb-section="hero" data-wb-component="Home hero">
      <span data-wb-field="eyebrow">Since 1998</span>
      <h1 data-wb-field="heading">Furniture for every home</h1>
      <p data-wb-field="subheading">Quality plywood and custom furniture.</p>
      <a data-wb-field="primaryCta" href="contact.html">Get a quote</a>
      <img data-wb-field="image" src="images/hero.jpg" alt="Showroom">
    </section>

    <section data-wb-section="services" data-wb-component="Products">
      <h2 data-wb-field="heading">Our products</h2>
      <article data-wb-item>
        <img data-wb-field="image" src="images/plywood.jpg" alt="Plywood">
        <h3 data-wb-field="title">Plywood</h3>
        <p data-wb-field="description">Everyday boards for furniture.</p>
      </article>
      <article data-wb-item>
        <img data-wb-field="image" src="images/doors.jpg" alt="Doors">
        <h3 data-wb-field="title">Doors</h3>
        <p data-wb-field="description">Made to your size.</p>
      </article>
    </section>

    <section data-wb-section="faq">
      <h2 data-wb-field="heading">Questions</h2>
      <details><summary>Do you deliver?</summary><p>Yes, across the city.</p></details>
      <details><summary>Custom sizes?</summary><p>Yes, any size.</p></details>
    </section>

    <section data-wb-section="contact">
      <h2 data-wb-field="heading">Send an enquiry</h2>
      <p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
      <form>
        <label>Your name <input name="name" required></label>
        <label>Phone <input type="tel" name="phone" required></label>
        <label>Message <textarea name="message"></textarea></label>
        <button type="submit">Send</button>
      </form>
    </section>
  </main>

  <!-- Site footer: shared by every page -->
  <footer>
    <div><h4>Quick links</h4><a href="index.html">Home</a> <a href="contact.html">Contact</a></div>
    <p>© 2026 My business</p>
  </footer>

</body>
</html>
`;

/** Rules + types + template for the clipboard. */
export const IMPORT_MARKUP_COPY_TEXT = [
  "How import works",
  ...IMPORT_MARKUP_SUMMARY.map((rule) => `• ${rule}`),
  "",
  "Optional markers",
  ...IMPORT_MARKER_RULES.map((rule) => `• ${rule}`),
  "",
  "Section types (data-wb-section)",
  ...IMPORT_SECTION_TYPES.map(({ type, use }) => `• ${type}: ${use}`),
  "",
  "Template (index.html):",
  "",
  IMPORT_MARKUP_TEMPLATE.trimEnd(),
].join("\n");
