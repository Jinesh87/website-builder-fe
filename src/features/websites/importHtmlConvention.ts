/**
 * HTML → saved component import guide.
 * Keep aligned with backend html-import-convention / html-import-components.
 */

/** Short bullets shown above the copyable template. */
export const IMPORT_MARKUP_SUMMARY = [
  "Any HTML works: the page's JavaScript is run first, then each top-level block becomes an editable component with its original look.",
  "Upload a .zip with the HTML, CSS and images (or a single .html file). Linked pages and SPA views (data-view) become separate pages.",
  "Optional: data-wb-page=\"slug\" marks pages and data-wb-section marks blocks when you want to control the split.",
  "Optional: data-wb-component=\"Name\" names a block in the component library; data-wb-field labels a text in the editor.",
] as const;

/** Full starter template users can copy into their HTML. */
export const IMPORT_MARKUP_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <title>My site</title>
  <style>/* your styles */</style>
</head>
<body>

<section data-wb-page="home">
  <section data-wb-section="hero" data-wb-component="Hero Banner">
    <h1 data-wb-field="heading">Furniture for Every Home</h1>
    <p data-wb-field="subheading">Quality plywood and custom furniture.</p>
    <a data-wb-field="primaryCta" href="/contact">Call us</a>
    <img data-wb-field="image" src="images/hero.jpg" alt="Showroom">
  </section>

  <section data-wb-section="features" data-wb-component="Highlights">
    <article data-wb-item>
      <h3 data-wb-field="title">Wholesale</h3>
      <p data-wb-field="description">Fair prices for every order</p>
    </article>
  </section>
</section>

<section data-wb-page="products">
  <section data-wb-section="services" data-wb-component="Products">
    <h2 data-wb-field="heading">Our products</h2>
    <img data-wb-field="image" src="images/board.jpg" alt="Plywood">
  </section>
</section>

</body>
</html>
`;

/** Instructions + template for clipboard. */
export const IMPORT_MARKUP_COPY_TEXT = [
  "Markup rules",
  "",
  ...IMPORT_MARKUP_SUMMARY.map((rule) => `• ${rule}`),
  "",
  "Template:",
  "",
  IMPORT_MARKUP_TEMPLATE.trimEnd(),
].join("\n");
