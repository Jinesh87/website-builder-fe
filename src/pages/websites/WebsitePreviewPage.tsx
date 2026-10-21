import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/react";
import { ArrowLeft, ArrowUpRight, Check, Copy, Lock, Pencil, X } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { errorMessage } from "../../api/http.ts";
import { websitesApi, type WebsiteDetail } from "../../api/websites.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { DeviceToggle, PreviewFrame, type Device } from "../../components/websites/DevicePreview.tsx";
import { contactEndpointFor, ContactEndpointProvider } from "../../site-kit/contact-endpoint.tsx";
import { SitePage, type SiteData } from "../../site-kit/index.ts";
import { resolvePageLink } from "../../site-kit/links.ts";
import { getLiveSiteDomain, getLiveSiteUrl } from "../../utils/live-url.ts";
import { isLightColor } from "../../utils/colors.ts";
import type { CreatedState } from "./CreateWebsitePage.tsx";

export default function WebsitePreviewPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [showCreatedBanner, setShowCreatedBanner] = useState(
    () => (location.state as CreatedState | null)?.created === true,
  );
  const backTo = user?.role === "SUPER_ADMIN" ? "/admin/websites" : "/websites";

  const [website, setWebsite] = useState<WebsiteDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [pageId, setPageId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    websitesApi
      .get(id)
      .then((loaded) => !cancelled && setWebsite(loaded))
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const site = useMemo<SiteData | null>(
    () =>
      website && {
        theme: website.draft.theme,
        header: website.draft.header,
        footer: website.draft.footer,
        pages: website.draft.pages,
      },
    [website],
  );
  const pages = website?.draft.pages ?? [];
  const page = pages.find((candidate) => candidate.id === pageId) ?? pages.find((candidate) => candidate.slug === "/") ?? pages[0];

  function openLink(href: string): boolean {
    const target = resolvePageLink(pages, href, page);
    if (!target) return false;
    setPageId(target.page.id);
    return true;
  }

  const simulatedDomain = getLiveSiteDomain(website?.subdomain || "preview", website?.customDomain);
  const currentPath = page?.slug === "/" ? "" : page?.slug ?? "";
  const fullUrl = `https://${simulatedDomain}${currentPath}`;

  useEffect(() => {
    if (!page) return;
    const originalTitle = document.title;
    const pageTitle = page.seoTitle || (website?.name ? `${page.name} | ${website.name}` : page.name);
    document.title = `${pageTitle} — Preview`;

    let metaDesc = document.querySelector('meta[name="description"]');
    const createdMeta = !metaDesc;
    const originalDescription = metaDesc?.getAttribute("content") ?? null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", page.seoDescription || "");

    return () => {
      document.title = originalTitle;
      if (createdMeta) metaDesc.remove();
      else if (originalDescription === null) metaDesc.removeAttribute("content");
      else metaDesc.setAttribute("content", originalDescription);
    };
  }, [page, website]);

  function copyUrl() {
    navigator.clipboard.writeText(fullUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }


  return (
    <div className="h-screen flex flex-col bg-zinc-900 text-zinc-100 antialiased overflow-hidden">
      {/* Top Preview Control Bar */}
      <header className="shrink-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-white/10 bg-zinc-950/90 px-4 backdrop-blur-md">
        {/* Left Side: Back & Site Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> Back
          </Link>

          {website && (
            <div className="hidden sm:flex items-center gap-2 min-w-0 pl-1">
              <span className="truncate text-sm font-semibold text-white">{website.name}</span>
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/25">
                Draft Preview
              </span>
            </div>
          )}
        </div>

        {/* Center: Simulated Browser Address Bar */}
        <div className="hidden md:flex flex-1 max-w-lg items-center justify-center">
          <div className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-zinc-900/90 px-3.5 py-1 text-xs text-zinc-300 shadow-inner">
            <Lock className="size-3 text-emerald-400 shrink-0" aria-hidden />
            <span className="text-zinc-500">https://</span>
            <span className="truncate font-medium text-zinc-200">{simulatedDomain}</span>
            {currentPath && <span className="text-brand-300 font-medium">{currentPath}</span>}
            <button
              type="button"
              onClick={copyUrl}
              title="Copy URL"
              className="ml-auto rounded p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            </button>
            {website?.status === "PUBLISHED" && (
              <a
                href={getLiveSiteUrl(website.subdomain, website.customDomain)}
                target="_blank"
                rel="noreferrer"
                title="Open real live site in new tab"
                className="flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 transition hover:bg-emerald-500/25"
              >
                <span>Live</span>
                <ArrowUpRight className="size-3" />
              </a>
            )}
          </div>
        </div>

        {/* Right Side: Page Selector, Device Switcher & Edit CTA */}
        <div className="flex items-center gap-2.5">
          {pages.length > 1 && (
            <div className="relative">
              <select
                value={page?.id ?? ""}
                onChange={(event) => setPageId(event.target.value)}
                className="h-8.5 rounded-lg border border-white/15 bg-zinc-900 px-2.5 pr-7 text-xs font-medium text-zinc-200 outline-none transition focus:border-brand"
              >
                {pages.map((candidate) => (
                  <option key={candidate.id} value={candidate.id} className="bg-zinc-900 text-zinc-100">
                    {candidate.name} ({candidate.slug})
                  </option>
                ))}
              </select>
            </div>
          )}

          <DeviceToggle value={device} onChange={setDevice} tone="dark" />

          {website && (
            <Link
              to={`/websites/${website.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              <Pencil className="size-3.5" aria-hidden />
              <span>Edit</span>
            </Link>
          )}
        </div>
      </header>

      {/* Floating Notification for new draft */}
      {showCreatedBanner && website && (
        <div className="relative z-30 flex items-center justify-between border-b border-emerald-500/20 bg-emerald-950/70 px-4 py-2 text-xs text-emerald-200 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-300">“{website.name}” draft ready!</span>
            <span>Created with {website.pageCount} pages. Explore your preview below.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCreatedBanner(false)}
            className="rounded p-1 text-emerald-300/80 hover:bg-emerald-900/50 hover:text-emerald-200"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Error state */}
      {loadError && (
        <div className="mx-auto my-8 max-w-xl rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
          {loadError}
        </div>
      )}

      {/* Loading state */}
      {!website && !loadError && (
        <div className="grid flex-1 place-items-center py-32">
          <Spinner aria-label="Loading website preview" />
        </div>
      )}

      {/* Realistic Website Preview Frame */}
      {site && page && (() => {
        const isSiteLight = isLightColor(site.theme?.colors?.background ?? "#ffffff");
        const scrollThumbColor = isSiteLight ? "rgba(24, 24, 27, 0.45)" : "rgba(255, 255, 255, 0.45)";
        const scrollThumbHoverColor = isSiteLight ? "rgba(24, 24, 27, 0.75)" : "rgba(255, 255, 255, 0.75)";
        return (
          <main
            className={`flex-1 w-full relative ${
              device === "desktop" ? "overflow-y-auto overflow-x-hidden bg-transparent" : "overflow-hidden bg-[#f4f5f8]"
            }`}
            style={
              device === "desktop"
                ? {
                    backgroundColor: site.theme?.colors?.background || "transparent",
                    scrollbarWidth: "thin",
                    scrollbarColor: `${scrollThumbColor} transparent`,
                    ["--scrollbar-thumb" as any]: scrollThumbColor,
                    ["--scrollbar-thumb-hover" as any]: scrollThumbHoverColor,
                  }
                : undefined
            }
          >
            <PreviewFrame
              device={device}
              onLinkClick={openLink}
              allowOffsiteLinks
              scrollResetKey={page.id}
              theme={site?.theme}
            >
              <ContactEndpointProvider endpoint={contactEndpointFor(website?.subdomain)}>
                <SitePage site={site} page={page} />
              </ContactEndpointProvider>
            </PreviewFrame>
          </main>
        );
      })()}
    </div>
  );
}
