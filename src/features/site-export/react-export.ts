import { EXPORT_BASE_CSS } from "./export-css.ts";
import { slugify, type ExportFile, type ExportProgress, type ExportSite } from "./export-content.ts";
import { fontsourcePackages, usedFonts } from "./export-fonts.ts";

/** The renderer is copied as source; it only depends on React (and lucide-react for the curved banner). */
const KIT_SOURCES = import.meta.glob<string>(
  ["/src/site-kit/**/*.{ts,tsx}", "/src/components/common/CurvedBannerCarousel.tsx"],
  { query: "?raw", import: "default" },
);

const SITE_PAGE = "src/site-kit/SitePage.tsx";
const CURVED_BANNER = "src/components/common/CurvedBannerCarousel.tsx";

/** Header and footer stay: SitePage renders them for every page. */
const ALWAYS_RENDERED = new Set(["header", "footer"]);

/** Drops the switch cases and imports for section types the site doesn't use. */
function trimSitePage(source: string, usedTypes: Set<string>): string {
  const unused: string[] = [];
  let trimmed = source.replace(
    /\n {4}case "(\w+)":\n {6}return <(\w+) section=\{section\} \/>;/g,
    (block, type: string, component: string) => {
      if (usedTypes.has(type) || ALWAYS_RENDERED.has(type)) return block;
      unused.push(component);
      return "";
    },
  );
  for (const component of unused) {
    trimmed = trimmed.replace(new RegExp(`import ${component} from "[^"]+";\\n`), "");
  }
  return unused.length > 0 ? trimmed.replace(/(\n {2}switch \(section\.type\) \{[\s\S]*?)\n {2}\}\n\}/, "$1\n    default:\n      return null;\n  }\n}") : trimmed;
}

function resolveImport(from: string, specifier: string): string {
  const parts = from.split("/").slice(0, -1);
  for (const part of specifier.split("/")) {
    if (part === "..") parts.pop();
    else if (part !== ".") parts.push(part);
  }
  return parts.join("/");
}

/** Every file reachable from `entry` through relative imports. */
function importClosure(entry: string, sources: Map<string, string>): string[] {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const path = queue.pop()!;
    if (seen.has(path) || !sources.has(path)) continue;
    seen.add(path);
    for (const match of sources.get(path)!.matchAll(/(?:from|import)\s+"(\.{1,2}\/[^"]+)"/g)) {
      queue.push(resolveImport(path, match[1]));
    }
  }
  return [...seen];
}

const VERSIONS = {
  react: "^19.2.0",
  "react-dom": "^19.2.0",
  "lucide-react": "^1.31.0",
  fontsource: "^5.2.0",
  vite: "^8.2.0",
  "@vitejs/plugin-react": "^6.0.0",
  typescript: "^5.9.0",
  "@types/react": "^19.2.0",
  "@types/react-dom": "^19.2.0",
};

function packageJson(site: ExportSite, fontPackages: string[], needsIcons: boolean): string {
  const dependencies: Record<string, string> = {
    react: VERSIONS.react,
    "react-dom": VERSIONS["react-dom"],
  };
  if (needsIcons) dependencies["lucide-react"] = VERSIONS["lucide-react"];
  for (const name of [...fontPackages].sort()) dependencies[name] = VERSIONS.fontsource;
  return `${JSON.stringify(
    {
      name: slugify(site.name),
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: { dev: "vite", build: "vite build", preview: "vite preview", typecheck: "tsc --noEmit" },
      dependencies,
      devDependencies: {
        "@types/react": VERSIONS["@types/react"],
        "@types/react-dom": VERSIONS["@types/react-dom"],
        "@vitejs/plugin-react": VERSIONS["@vitejs/plugin-react"],
        typescript: VERSIONS.typescript,
        vite: VERSIONS.vite,
      },
    },
    null,
    2,
  )}\n`;
}

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
`;

const VITE_CONFIG = `import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // The site stylesheet ships inside the JS bundle, so the bundle is larger than Vite's default warning size.
  build: { chunkSizeWarningLimit: 1000 },
});
`;

const MAIN_TSX = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./fonts.ts";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

const APP_TSX = `import { useEffect } from "react";
import content from "./content/site.json";
import SitePage, { SiteStyles } from "./site-kit/SitePage.tsx";
import type { PageData, SiteData } from "./site-kit/types.ts";

type Page = PageData & { seoTitle?: string | null; seoDescription?: string | null };
type Site = SiteData & { name: string; pages: Page[] };

const site = content as unknown as Site;

/** Each page lives at its slug ("/", "/about", ...). Links are plain <a href>, so navigation is a normal page load. */
function findPage(pathname: string): Page {
  const path = pathname.replace(/\\/+$/, "") || "/";
  return site.pages.find((page) => page.slug === path) ?? site.pages.find((page) => page.slug === "/") ?? site.pages[0];
}

export default function App() {
  const page = findPage(window.location.pathname);

  useEffect(() => {
    document.title = page.seoTitle || (page.slug === "/" ? site.name : \`\${page.name} | \${site.name}\`);
    document.querySelector('meta[name="description"]')?.setAttribute("content", page.seoDescription ?? "");
  }, [page]);

  return (
    <>
      <SiteStyles />
      <SitePage site={site} page={page} />
    </>
  );
}
`;

function indexHtml(site: ExportSite): string {
  const title = site.name.replace(/[<>&"]/g, "");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function fontsTs(imports: string[]): string {
  if (imports.length === 0) return "// The theme uses system fonts, so there is nothing to load.\nexport {};\n";
  return `// Self-hosted web fonts used by the theme and sections.\n${imports.map((name) => `import "${name}";`).join("\n")}\n`;
}

function readme(site: ExportSite): string {
  return `# ${site.name}

React + Vite project for your website.

## Run it

\`\`\`bash
npm install
npm run dev
\`\`\`

Then open the URL Vite prints (usually http://localhost:5173).

## Build for production

\`\`\`bash
npm run build
\`\`\`

The site is written to \`dist/\`. Every page is served by \`index.html\` and picked from the URL, so configure
your host to fall back to \`index.html\` for unknown paths (Netlify: \`_redirects\` with \`/* /index.html 200\`,
Vercel: a rewrite to \`/index.html\`, Nginx: \`try_files $uri /index.html;\`).

## Where things are

- \`src/content/site.json\`: all your content: theme, pages and their sections. Edit text, links and images here.
- \`src/site-kit/\`: the React components for the sections this site uses, and the site stylesheet (\`styles.ts\`).
- \`src/App.tsx\`: picks the page for the current URL.
- \`public/media/\`: your uploaded images and files.

Forms (contact, newsletter, sign in) are visual only; connect them to your own backend or a form service.
`;
}

export async function buildReactProject(site: ExportSite, onProgress: ExportProgress): Promise<ExportFile[]> {
  onProgress("Collecting source files");
  const allSources = new Map(
    await Promise.all(
      Object.entries(KIT_SOURCES).map(async ([path, load]) => [path.replace(/^\//, ""), await load()] as const),
    ),
  );
  const usedTypes = new Set(site.pages.flatMap((page) => page.sections.map((section) => section.type)));
  allSources.set(SITE_PAGE, trimSitePage(allSources.get(SITE_PAGE) ?? "", usedTypes));
  const sources = importClosure(SITE_PAGE, allSources)
    .sort()
    .map((path) => ({ path, data: allSources.get(path)! }));

  const fonts = fontsourcePackages(usedFonts(site.theme, site.pages));
  const { name, theme, header, footer, pages } = site;
  const content = { name, theme, header, footer, pages };

  return [
    ...sources,
    { path: "package.json", data: packageJson(site, fonts.packages, sources.some((file) => file.path === CURVED_BANNER)) },
    { path: "tsconfig.json", data: TSCONFIG },
    { path: "vite.config.ts", data: VITE_CONFIG },
    { path: "index.html", data: indexHtml(site) },
    { path: ".gitignore", data: "node_modules\ndist\n" },
    { path: "README.md", data: readme(site) },
    { path: "src/main.tsx", data: MAIN_TSX },
    { path: "src/App.tsx", data: APP_TSX },
    { path: "src/fonts.ts", data: fontsTs(fonts.imports) },
    { path: "src/index.css", data: EXPORT_BASE_CSS },
    { path: "src/content/site.json", data: `${JSON.stringify(content, null, 2)}\n` },
  ];
}
