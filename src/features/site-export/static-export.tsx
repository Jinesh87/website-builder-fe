import { renderToStaticMarkup } from "react-dom/server";
import { SitePage, SiteRenderModeProvider, SITE_CSS } from "../../site-kit/index.ts";
import { EXPORT_BASE_CSS, STATIC_STATE_CSS } from "./export-css.ts";
import { escapeHtml, type ExportFile, type ExportProgress, type ExportSite } from "./export-content.ts";
import { googleFontLinks, toGoogleFontNames, usedFonts } from "./export-fonts.ts";
import runtimeJs from "./static-runtime.js?raw";

/** "/" is index.html; "/services/web" is services-web.html. Every page sits at the root so relative links work offline. */
function fileNameFor(slug: string, taken: Set<string>): string {
  const base = slug === "/" ? "index" : slug.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "page";
  let name = `${base}.html`;
  for (let n = 2; taken.has(name); n++) name = `${base}-${n}.html`;
  taken.add(name);
  return name;
}

async function formatHtml(html: string): Promise<string> {
  try {
    const [prettier, htmlPlugin, postcssPlugin] = await Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/html"),
      import("prettier/plugins/postcss"),
    ]);
    return await prettier.format(html, { parser: "html", plugins: [htmlPlugin, postcssPlugin], printWidth: 120 });
  } catch {
    return html;
  }
}

/** React emits image preload hints ahead of the markup; they belong in <head>. */
const LEADING_LINKS = /^(?:<link [^>]*>)+/;

function pageDocument(site: ExportSite, page: ExportSite["pages"][number], markup: string, fontLinks: string[]): string {
  const title = page.seoTitle || (page.slug === "/" ? site.name : `${page.name} | ${site.name}`);
  const preloads = markup.match(LEADING_LINKS)?.[0] ?? "";
  const body = markup.slice(preloads.length);
  const head = [
    `<meta charset="utf-8" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
    `<title>${escapeHtml(title)}</title>`,
    page.seoDescription ? `<meta name="description" content="${escapeHtml(page.seoDescription)}" />` : "",
    ...(fontLinks.length > 0
      ? [
          `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
          `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
          ...fontLinks.map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}" />`),
        ]
      : []),
    preloads,
    `<link rel="stylesheet" href="css/styles.css" />`,
  ].filter(Boolean);
  return `<!doctype html>
<html lang="en">
<head>
${head.join("\n")}
</head>
<body>
${body}
<script src="js/site.js" defer></script>
</body>
</html>
`;
}

function readme(site: ExportSite, pages: { file: string; name: string }[]): string {
  return `# ${site.name}

Static export of your website: plain HTML, CSS and JavaScript, no build step.

## Run it

Open \`index.html\` in a browser, or serve the folder with any static web server:

\`\`\`bash
npx serve .
\`\`\`

Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, S3, cPanel, Nginx…).

## Files

${pages.map((page) => `- \`${page.file}\`: ${page.name}`).join("\n")}
- \`css/styles.css\`: all site styles; theme colors and fonts are CSS variables on the \`.wb-site\` element of each page
- \`js/site.js\`: mobile menu, carousels, sign-in views, video posters and the curved banner
- \`assets/media/\`: your uploaded images and files

## Notes

- Fonts load from Google Fonts.
- Interactive parts (menu drawer, each carousel slide, sign-in views) are in the HTML with the \`hidden\`
  attribute; \`site.js\` switches between them. Edit every copy if you change text inside them.
- Forms (contact, newsletter, sign in) don't send anywhere yet. Add an \`action\` attribute pointing at your
  form handler (for example Formspree, Netlify Forms or your own API) and they will submit normally.
`;
}

/** Internal links ("/about#team", including ones the components hard-code) point at the page files. */
function linkPageFiles(markup: string, fileBySlug: Map<string, string>): string {
  return markup.replace(/href="(\/(?!\/)[^"#?]*)([^"]*)"/g, (attribute, path: string, suffix: string) => {
    const file = fileBySlug.get(path.replace(/\/+$/, "") || "/");
    return file ? `href="${file}${suffix}"` : attribute;
  });
}

export async function buildStaticSite(site: ExportSite, onProgress: ExportProgress): Promise<ExportFile[]> {
  const taken = new Set<string>();
  const fileBySlug = new Map(site.pages.map((page) => [page.slug.replace(/\/+$/, "") || "/", fileNameFor(page.slug, taken)]));

  const fontLinks = googleFontLinks(usedFonts(site.theme, site.pages));
  const files: ExportFile[] = [];
  const pageList: { file: string; name: string }[] = [];

  for (const [index, page] of site.pages.entries()) {
    onProgress(`Rendering pages (${index + 1} of ${site.pages.length})`);
    const markup = renderToStaticMarkup(
      <SiteRenderModeProvider mode="static">
        <SitePage site={site} page={page} />
      </SiteRenderModeProvider>,
    );
    const file = fileBySlug.get(page.slug.replace(/\/+$/, "") || "/") ?? fileNameFor(page.slug, taken);
    const html = await formatHtml(pageDocument(site, page, linkPageFiles(toGoogleFontNames(markup), fileBySlug), fontLinks));
    files.push({ path: file, data: html });
    pageList.push({ file, name: page.name });
  }

  files.push(
    { path: "css/styles.css", data: `${EXPORT_BASE_CSS}\n${STATIC_STATE_CSS}\n${SITE_CSS.trim()}\n` },
    { path: "js/site.js", data: runtimeJs },
    { path: "README.md", data: readme(site, pageList) },
  );
  return files;
}
