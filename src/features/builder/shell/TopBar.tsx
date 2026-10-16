import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Code2, ExternalLink, Monitor, Redo2, ShieldCheck, Smartphone, Tablet, Undo2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import AppTooltip from "../../../components/ui/AppTooltip.tsx";
import { lazyWithRetry } from "../../../utils/lazy-with-retry.ts";
import type { Device } from "../../../components/websites/DevicePreview.tsx";

const DownloadCodeDialog = lazyWithRetry(
  () => import("../../../components/websites/DownloadCodeDialog.tsx"),
  { reloadKey: "topbar_download_code" },
);
import { useEditor } from "../editor-context.ts";
import { useBuilderPuck } from "../puck/puck-api.ts";
import AutosaveIndicator from "./AutosaveIndicator.tsx";
import { ToolButton } from "./ui.tsx";

const DEVICE_OPTIONS: { id: Device; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

function PublishState() {
  const { website } = useEditor();
  const [label, dot] =
    website.status === "PUBLISHED"
      ? website.hasUnpublishedChanges
        ? ["Unpublished changes", "bg-ed-warning"]
        : ["Published", "bg-ed-success"]
      : website.status === "UNPUBLISHED"
        ? ["Offline", "bg-ed-faint"]
        : ["Draft", "bg-ed-faint"];
  return (
    <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-ed-border px-2 text-ed-xs text-ed-muted">
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}

type TopBarProps = {
  backTo: string;
  onPublish: () => void;
};

export default function TopBar({ backTo, onPublish }: TopBarProps) {
  const { website, draft, page, selectPage, role, device, setDevice, autosave, aiLock } = useEditor();
  const history = useBuilderPuck((state) => state.history);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!pageDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPageDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [pageDropdownOpen]);

  const blogDetailSection = page.sections?.find((s) => s.type === "blog_detail");
  const blogArticleTitle = (blogDetailSection?.data as any)?.title as string | undefined;
  const isBlogPage = page.pageType === "BLOG" || Boolean(blogDetailSection);

  async function openPreview() {
    const url = `/websites/${website.id}/preview`;
    if (autosave.status === "saved") {
      window.open(url, "_blank", "noopener");
      return;
    }
    // Open synchronously to avoid popup blockers, then navigate once the draft is saved.
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    await autosave.flush();
    if (tab) tab.location.href = url;
  }

  return (
    <header className="z-(--z-ed-toolbar) flex h-12 shrink-0 items-center gap-2 border-b border-ed-border bg-ed-panel px-2">
      <AppTooltip content="Back to websites" placement="bottom">
        <Link
          to={backTo}
          aria-label="Back to websites"
          className="grid size-8 place-items-center rounded-ed text-ed-muted hover:bg-ed-hover hover:text-ed-text"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
      </AppTooltip>
      <span className="h-5 w-px bg-ed-border" aria-hidden />

      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-1.5 text-ed-sm">
          <li className="hidden truncate text-ed-muted lg:block">{website.clientName}</li>
          <li className="hidden text-ed-faint lg:block" aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="max-w-40 truncate text-ed-muted">{website.name}</li>
          <li className="text-ed-faint" aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="relative flex items-center" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setPageDropdownOpen((v) => !v)}
              className="group flex items-center gap-1.5 rounded-md px-2 py-1 text-ed-xs font-medium text-ed-text bg-ed-subtle/80 hover:bg-ed-hover border border-ed-border transition-colors cursor-pointer"
              aria-expanded={pageDropdownOpen}
              title={blogArticleTitle ? `Page: ${page.name} — "${blogArticleTitle}"` : `Page: ${page.name}`}
            >
              <span className="text-ed-muted font-normal">Page:</span>
              <span className="font-semibold text-ed-text max-w-28 truncate">{page.name}</span>
              {blogArticleTitle ? (
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10.5px] font-medium text-indigo-600 dark:text-indigo-400 max-w-48 truncate">
                  Blog: “{blogArticleTitle}”
                </span>
              ) : isBlogPage ? (
                <span className="hidden sm:inline-flex items-center rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10.5px] font-medium text-indigo-600 dark:text-indigo-400">
                  Blog
                </span>
              ) : null}
              <ChevronDown className={`size-3 text-ed-muted transition-transform group-hover:text-ed-text ${pageDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {pageDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-ed-border bg-ed-panel p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ed-muted border-b border-ed-border/60 mb-1">
                  Switch Editor Page ({draft.pages.length})
                </div>
                <div className="max-h-64 overflow-y-auto space-y-0.5 overscroll-contain">
                  {draft.pages.map((p) => {
                    const isCurrent = p.id === page.id;
                    const pBlogDetail = p.sections?.find((s) => s.type === "blog_detail");
                    const pBlogTitle = (pBlogDetail?.data as any)?.title as string | undefined;
                    const pIsBlog = p.pageType === "BLOG" || Boolean(pBlogDetail);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          selectPage(p.id);
                          setPageDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                          isCurrent
                            ? "bg-ed-accent/10 font-semibold text-ed-accent"
                            : "text-ed-text hover:bg-ed-hover"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="shrink-0">{p.slug === "/" ? "🏠" : pIsBlog ? "📰" : "📄"}</span>
                            <span className="truncate">{p.name}</span>
                          </div>
                          {pBlogTitle && (
                            <p className="truncate text-[10.5px] text-indigo-600 dark:text-indigo-400 pl-5 font-normal">
                              “{pBlogTitle}”
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-ed-muted shrink-0">{p.slug}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </li>
        </ol>
      </nav>
      <PublishState />
      <AutosaveIndicator autosave={autosave} />

      <div className="mx-auto flex items-center gap-1">
        <ToolButton label="Undo" shortcut="⌘Z" onClick={history.back} disabled={!history.hasPast || aiLock !== null}>
          <Undo2 className="size-4" aria-hidden />
        </ToolButton>
        <ToolButton label="Redo" shortcut="⇧⌘Z" onClick={history.forward} disabled={!history.hasFuture || aiLock !== null}>
          <Redo2 className="size-4" aria-hidden />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-ed-border" aria-hidden />
        <div role="radiogroup" aria-label="Preview device" className="flex rounded-ed bg-ed-subtle p-0.5">
          {DEVICE_OPTIONS.map(({ id, label, icon: Icon }) => (
            <AppTooltip key={id} content={label} placement="bottom">
              <button
                type="button"
                role="radio"
                aria-checked={device === id}
                aria-label={label}
                onClick={() => setDevice(id)}
                className={`grid h-7 w-8 place-items-center rounded-ed-sm transition-colors ${
                  device === id ? "bg-ed-panel text-ed-text shadow-ed-xs" : "text-ed-muted hover:text-ed-text"
                }`}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            </AppTooltip>
          ))}
        </div>
      </div>

      <AppTooltip
        content={role === "SUPER_ADMIN" ? "Platform admin: can edit and publish any website" : "Owner: can edit and publish this website"}
        placement="bottom"
      >
        <span className="hidden items-center gap-1 text-ed-xs text-ed-muted xl:inline-flex cursor-default">
          {role === "SUPER_ADMIN" ? <ShieldCheck className="size-3.5" aria-hidden /> : <UserRound className="size-3.5" aria-hidden />}
          {role === "SUPER_ADMIN" ? "Admin" : "Owner"}
        </span>
      </AppTooltip>
      <AppTooltip content="Download code" placement="bottom">
        <button
          type="button"
          onClick={() => setDownloadOpen(true)}
          onMouseEnter={() => void DownloadCodeDialog.preload()}
          onFocus={() => void DownloadCodeDialog.preload()}
          disabled={autosave.status === "conflict"}
          aria-label="Download code"
          className="grid size-8 place-items-center rounded-ed border border-ed-border text-ed-muted hover:bg-ed-hover hover:text-ed-text disabled:opacity-50"
        >
          <Code2 className="size-4" aria-hidden />
        </button>
      </AppTooltip>
      <button
        type="button"
        onClick={() => void openPreview()}
        className="inline-flex h-8 items-center gap-1.5 rounded-ed border border-ed-border px-2.5 text-ed-sm font-medium text-ed-text hover:bg-ed-hover"
      >
        <ExternalLink className="size-3.5" aria-hidden /> Preview
      </button>
      <button
        type="button"
        onClick={onPublish}
        disabled={autosave.status === "conflict" || aiLock !== null}
        title={aiLock ? "Apply or discard the AI changes before publishing" : undefined}
        className="inline-flex h-8 items-center rounded-ed bg-ed-accent px-3 text-ed-sm font-medium text-white shadow-ed-xs hover:bg-ed-accent-hover disabled:opacity-50"
      >
        Publish
      </button>
      {downloadOpen && (
        <Suspense fallback={null}>
          <DownloadCodeDialog
            websiteId={website.id}
            isOpen={downloadOpen}
            onClose={() => setDownloadOpen(false)}
            beforeExport={autosave.flush}
          />
        </Suspense>
      )}
    </header>
  );
}
