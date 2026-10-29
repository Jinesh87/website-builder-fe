import "@puckeditor/core/no-external.css";
import "./builder.css";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Puck, useGetPuck, type Data, type OnAction, type Permissions } from "@puckeditor/core";
import { AlertTriangle, CheckCircle2, RotateCw, X } from "lucide-react";
import type { WebsiteHosting } from "../../api/hosting.ts";
import type { SavedSection, ThemeOption, WebsiteDetail, WebsitePage } from "../../api/websites.ts";
import type { Device } from "../../components/websites/DevicePreview.tsx";
import PublishSuccessModal from "../../components/websites/PublishSuccessModal.tsx";
import { draftFromWebsite, homePage, updatePage, type EditorDraft } from "../../pages/websites/editor/editor-state.ts";
import { LinkTargetsContext, MediaTargetContext } from "../../pages/websites/editor/fields.tsx";
import { isExternalHref, isOffsiteHref, resolvePageLink } from "../../site-kit/links.ts";
import type { Section } from "../../site-kit/index.ts";
import { useAutosave } from "./autosave/use-autosave.ts";
import {
  BuilderSiteContext,
  EditorContext,
  useEditor,
  type AiLock,
  type BuilderSiteValue,
  type EditorRole,
  type EditorValue,
  type LeftPanelId,
  type SiteArea,
} from "./editor-context.ts";
import { builderConfig } from "./puck/config.tsx";
import {
  EditorDataError,
  getSectionType,
  hasAiPlaceholder,
  itemAsSection,
  puckDataToSections,
  ROOT_ZONE,
  sectionToItem,
  sectionsToPuckData,
  type BuilderItem,
} from "./puck/adapter.ts";
import { selectSection, useBuilderPuck } from "./puck/puck-api.ts";
import { applyCanvasSections, canvasChromeFix, isChromeSection, setPageChrome, withSiteChrome } from "./utils/site-chrome.ts";
import { lazyWithRetry } from "../../utils/lazy-with-retry.ts";
import AiDrawerSkeleton from "./shell/AiDrawerSkeleton.tsx";

export const AiDrawer = lazyWithRetry(() => import("./shell/AiDrawer.tsx"), {
  reloadKey: "ai_drawer",
});
import ShopCatalogBridge from "./ShopCatalogBridge.tsx";
import CanvasViewport from "./shell/CanvasViewport.tsx";
import Inspector from "./shell/Inspector.tsx";
import LeftRail from "./shell/LeftRail.tsx";
import PublishDialog from "./shell/PublishDialog.tsx";
import TopBar from "./shell/TopBar.tsx";
import { TourProvider, EditorOnboarding, EDITOR_TOUR_STEPS } from "./onboarding/index.ts";

type Toast = { id: number; message: string; tone: "success" | "danger" };

export type EditorAppProps = {
  website: WebsiteDetail;
  themes: ThemeOption[];
  savedSections: SavedSection[];
  role: EditorRole;
  backTo: string;
  justCreated: boolean;
};

// Puck merges this prop into its state, so unlocking must pass explicit `true`s rather than `undefined`.
const EDITABLE_PERMISSIONS: Permissions = { drag: true, duplicate: true, delete: true, edit: true, insert: true };
const LOCKED_PERMISSIONS: Permissions = { drag: false, duplicate: false, delete: false, edit: false, insert: false };

/** Swallows undo/redo shortcuts (host page and canvas iframe) so they can't rewind an AI change mid-review. */
function blockHistoryHotkeys(): () => void {
  const block = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if ((event.metaKey || event.ctrlKey) && (key === "z" || key === "y")) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  const targets: Window[] = [window];
  for (const iframe of Array.from(document.querySelectorAll("iframe"))) {
    try {
      if (iframe.contentWindow?.document) targets.push(iframe.contentWindow);
    } catch {
      // Cross-origin iframes are not the canvas.
    }
  }
  for (const target of targets) target.addEventListener("keydown", block, true);
  return () => {
    for (const target of targets) target.removeEventListener("keydown", block, true);
  };
}

/** Lives inside <Puck> so it can reach editor state; draws the canvas and site chrome. */
function EditorShell({ backTo, onPublish, onCommit }: { backTo: string; onPublish: () => void; onCommit: (data: Data) => void }) {
  const { website, draft, page, siteArea, setSiteArea, setLeftPanel, device, aiOpen, setAiOpen, aiLock, selectPage, notify } = useEditor();
  const dispatch = useBuilderPuck((state) => state.dispatch);
  const getPuck = useGetPuck();
  const wasLocked = useRef(false);

  // Autosave skips changes while the AI holds the canvas, and Puck won't re-emit unchanged data,
  // so the applied (or restored) canvas is committed explicitly once the lock is released.
  useEffect(() => {
    if (aiLock) {
      wasLocked.current = true;
      return;
    }
    if (!wasLocked.current) return;
    wasLocked.current = false;
    onCommit(getPuck().appState.data);
  }, [aiLock, getPuck, onCommit]);

  useEffect(() => {
    if (!aiLock) return;
    return blockHistoryHotkeys();
  }, [aiLock]);

  // The header/footer also change outside this canvas (page renames, site settings, accepted AI
  // navigation, showing or removing them on this page). Keep the canvas showing exactly the ones
  // this page uses: the site-wide pair, the page's own, or none.
  const chromeOnCanvas = useBuilderPuck((state) =>
    state.appState.data.content
      .filter((item) => {
        const type = getSectionType(item.type);
        return type === "header" || type === "footer";
      })
      .map((item) => item.props.id)
      .join("|"),
  );
  useEffect(() => {
    if (aiLock) return;
    const { data, ui } = getPuck().appState;
    const content = data.content as BuilderItem[];
    const fix = canvasChromeFix(content.map(itemAsSection), page.sections, draft);
    if (!fix) return;
    const body = content.filter((item) => !isChromeSection({ type: getSectionType(item.type) }));
    dispatch({
      type: "setData",
      data: (previous) => ({
        ...previous,
        content: [
          ...(fix.header ? [sectionToItem(fix.header)] : []),
          ...(previous.content ?? []).filter((item) => !isChromeSection({ type: getSectionType(item.type) })),
          ...(fix.footer ? [sectionToItem(fix.footer)] : []),
        ],
      }),
    });
    // A selected header/footer (such as one just dropped mid-page) stays selected at its new place.
    const selected = ui.itemSelector ? content[ui.itemSelector.index] : undefined;
    const selectedType = selected ? getSectionType(selected.type) : null;
    if (selectedType === "header") selectSection(dispatch, fix.header ? 0 : null);
    else if (selectedType === "footer") selectSection(dispatch, fix.footer ? (fix.header ? 1 : 0) + body.length : null);
  }, [aiLock, chromeOnCanvas, draft, page.sections, dispatch, getPuck]);
  const hasSelection = useBuilderPuck((state) => state.appState.ui.itemSelector !== null);
  const isEmpty = useBuilderPuck((state) => state.appState.data.content.length === 0);

  const pagesRef = useRef(draft.pages);
  pagesRef.current = draft.pages;
  const [productSlug, setProductSlug] = useState<string | undefined>();
  const [productSelection, setProductSelection] = useState<Record<string, string> | undefined>();

  const site = useMemo<BuilderSiteValue>(
    () => ({
      theme: draft.theme,
      header: draft.header,
      footer: draft.footer,
      activeArea: hasSelection || siteArea === "page" ? null : siteArea,
      isEmpty,
      selectArea: (area: SiteArea) => {
        selectSection(dispatch, null);
        setSiteArea(area);
      },
      openAddPanel: () => setLeftPanel("add"),
      navigateToHref: (href: string) => {
        if (!href || href === "#") return;
        if (isOffsiteHref(href) || isExternalHref(href)) {
          window.open(href, "_blank", "noopener,noreferrer");
          return;
        }
        if (href.startsWith("#")) {
          const anchorName = href.slice(1);
          const el = document.getElementById(anchorName) || document.querySelector(`[data-section-id="${anchorName}"]`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
          return;
        }
        const bare = href.split("#")[0] ?? "";
        const queryAt = bare.indexOf("?");
        const pathOnly = queryAt === -1 ? bare : bare.slice(0, queryAt);
        const selection = Object.fromEntries(new URLSearchParams(queryAt === -1 ? "" : bare.slice(queryAt + 1)));
        const clean = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
        const pages = pagesRef.current;
        const resolved = resolvePageLink(pages, href, page);
        if (resolved) {
          setProductSlug(undefined);
          setProductSelection(undefined);
          selectPage(resolved.page.id);
          notify(`Switched to page: ${resolved.page.name}`);
          if (resolved.hash) {
            setTimeout(() => {
              const el = document.getElementById(resolved.hash) || document.querySelector(`[data-section-id="${resolved.hash}"]`);
              el?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
          return;
        }
        const target = pages.find(
          (p) =>
            p.slug === clean ||
            p.slug === pathOnly ||
            p.id === pathOnly ||
            p.slug.replace(/^\//, "") === pathOnly.replace(/^\//, ""),
        );
        if (target) {
          setProductSlug(undefined);
          setProductSelection(undefined);
          selectPage(target.id);
          notify(`Switched to page: ${target.name}`);
          return;
        }
        const detail = pages
          .filter(
            (p) =>
              p.slug !== "/" &&
              clean.startsWith(`${p.slug}/`) &&
              p.sections.some((section) => section.type === "product_detail"),
          )
          .sort((a, b) => b.slug.length - a.slug.length)[0];
        if (detail) {
          setProductSlug(decodeURIComponent(clean.slice(detail.slug.length + 1).split("/")[0] ?? ""));
          setProductSelection(Object.keys(selection).length > 0 ? selection : undefined);
          selectPage(detail.id);
          notify(`Switched to page: ${detail.name}`);
          return;
        }
        notify(`Page "${clean}" not found (create this page in the Pages tab to view it)`);
      },
    }),
    [draft.theme, draft.header, draft.footer, hasSelection, siteArea, isEmpty, dispatch, setSiteArea, setLeftPanel, selectPage, notify],
  );

  const handleDeselect = useCallback(() => {
    selectSection(dispatch, null);
    setSiteArea("page");
  }, [dispatch, setSiteArea]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (hasSelection || siteArea !== "page")) {
        handleDeselect();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasSelection, siteArea, handleDeselect]);

  return (
    <BuilderSiteContext.Provider value={site}>
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <TopBar backTo={backTo} onPublish={onPublish} />
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <LeftRail />
          <CanvasViewport device={device} onDeselect={handleDeselect}>
            <ShopCatalogBridge productSlug={productSlug} selection={productSelection}>
              <Puck.Preview />
            </ShopCatalogBridge>
          </CanvasViewport>
          {website.builderType === "AI" && aiOpen ? (
            <Suspense fallback={<AiDrawerSkeleton onClose={() => setAiOpen(false)} />}>
              <AiDrawer />
            </Suspense>
          ) : (
            <Inspector />
          )}
        </div>
      </div>
    </BuilderSiteContext.Provider>
  );
}

/** One Puck instance per page; initial data is read once and later edits flow out through onChange. */
function PageCanvas({
  page,
  backTo,
  onChange,
  onAction,
  onPublish,
}: {
  page: WebsitePage;
  backTo: string;
  onChange: (data: Data) => void;
  onAction: OnAction;
  onPublish: () => void;
}) {
  const { aiLock, draft } = useEditor();
  const [initialData] = useState(() => sectionsToPuckData(withSiteChrome(page.sections, draft)));
  return (
    <Puck
      config={builderConfig}
      data={initialData}
      onChange={onChange}
      onAction={onAction}
      permissions={aiLock ? LOCKED_PERMISSIONS : EDITABLE_PERMISSIONS}
    >
      <EditorShell backTo={backTo} onPublish={onPublish} onCommit={onChange} />
    </Puck>
  );
}

export default function EditorApp({ website: initialWebsite, themes, savedSections: initialSaved, role, backTo, justCreated }: EditorAppProps) {
  const [website, setWebsite] = useState(initialWebsite);
  const [draft, setDraft] = useState<EditorDraft>(() => draftFromWebsite(initialWebsite));
  const [pageId, setPageId] = useState(() => homePage(initialWebsite.draft.pages)?.id ?? "");
  const [savedSections, setSavedSectionsState] = useState(initialSaved);
  const [leftPanel, setLeftPanel] = useState<LeftPanelId | null>("add");
  const [siteArea, setSiteArea] = useState<SiteArea>("page");
  const isAiSite = website.builderType === "AI";
  const [aiOpen, setAiOpenState] = useState(false);
  const setAiOpen = useCallback(
    (open: boolean) => {
      if (website.builderType !== "AI") return;
      setAiOpenState(open);
    },
    [website.builderType],
  );
  const [aiBuilding, setAiBuilding] = useState<import("./editor-context.ts").AiBuildingState>(null);
  const [aiLock, setAiLockState] = useState<AiLock>(null);
  const aiLockRef = useRef<AiLock>(null);
  const setAiLock = useCallback((lock: AiLock) => {
    aiLockRef.current = lock;
    setAiLockState(lock);
  }, []);
  const [device, setDevice] = useState<Device>("desktop");
  const [publishOpen, setPublishOpen] = useState(false);
  const [published, setPublished] = useState<{ hosting: WebsiteHosting | null } | null>(null);
  const [toast, setToast] = useState<Toast | null>(
    justCreated ? { id: 0, message: "Website created. Add sections from the left panel.", tone: "success" } : null,
  );

  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const autosave = useAutosave({
    websiteId: website.id,
    draft,
    initialToken: initialWebsite.draft.draftUpdatedAt,
    onWebsite: setWebsite,
  });

  const page = draft.pages.find((candidate) => candidate.id === pageId) ?? homePage(draft.pages) ?? draft.pages[0]!;

  const notify = useCallback((message: string, tone: Toast["tone"] = "success") => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const editDraft = useCallback((update: (current: EditorDraft) => EditorDraft) => {
    setDraft((current) => update(current));
    setWebsite((current) => (current.status === "PUBLISHED" && !current.hasUnpublishedChanges ? { ...current, hasUnpublishedChanges: true } : current));
  }, []);

  const selectPage = useCallback((id: string) => setPageId(id), []);
  const setSavedSections = useCallback((update: (current: SavedSection[]) => SavedSection[]) => setSavedSectionsState(update), []);

  const handlePuckChange = useCallback(
    (data: Data) => {
      // AI previews and placeholders are not saved until the change is applied (see EditorShell).
      if (aiLockRef.current || hasAiPlaceholder(data)) return;
      let sections: Section[];
      try {
        sections = puckDataToSections(data);
      } catch (error) {
        notify(error instanceof EditorDataError ? error.message : "That change couldn't be applied.", "danger");
        return;
      }
      // Edits to the site-wide header/footer apply to every page; a page's own apply to it alone.
      // Puck reports changes synchronously, before React applies updates queued in the same action
      // (removing the header from this page, say), so the change is applied to the latest draft;
      // `draftRef` only skips changes that are already saved.
      if (applyCanvasSections(draftRef.current, page.id, sections) === draftRef.current) return;
      editDraft((d) => applyCanvasSections(d, page.id, sections));
    },
    [page.id, editDraft, notify],
  );

  // Deleting the header/footer on the canvas (toolbar or Delete/Backspace) removes it from this page only.
  const handlePuckAction = useCallback<OnAction>(
    (action, _appState, previous) => {
      if (action.type !== "remove" || action.zone !== ROOT_ZONE || aiLockRef.current) return;
      const removed = previous.data.content[action.index];
      const type = removed ? getSectionType(removed.type) : null;
      if (type !== "header" && type !== "footer") return;
      editDraft((d) => updatePage(d, page.id, (p) => ({ ...p, sections: setPageChrome(p.sections, type, "none", d) })));
      notify(`${type === "header" ? "Header" : "Footer"} removed from this page`);
    },
    [page.id, editDraft, notify],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void autosave.flush();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [autosave]);

  const linkTargets = useMemo(() => draft.pages.map((candidate) => ({ label: candidate.name, href: candidate.slug })), [draft.pages]);
  const mediaTarget = useMemo(() => ({ clientId: website.clientId, websiteId: website.id }), [website.clientId, website.id]);

  const value = useMemo<EditorValue>(
    () => ({
      website,
      setWebsite,
      draft,
      page,
      role,
      themes,
      savedSections,
      setSavedSections,
      autosave,
      editDraft,
      selectPage,
      leftPanel,
      setLeftPanel,
      siteArea,
      setSiteArea,
      aiOpen,
      setAiOpen,
      device,
      setDevice,
      notify,
      aiBuilding,
      setAiBuilding,
      aiLock,
      setAiLock,
    }),
    [website, draft, page, role, themes, savedSections, setSavedSections, autosave, editDraft, selectPage, leftPanel, siteArea, aiOpen, device, notify, aiBuilding, aiLock, setAiLock],
  );

  return (
    <EditorContext.Provider value={value}>
      <LinkTargetsContext.Provider value={linkTargets}>
        <MediaTargetContext.Provider value={mediaTarget}>
          <TourProvider steps={isAiSite ? EDITOR_TOUR_STEPS : EDITOR_TOUR_STEPS.filter((step) => step.id !== "step-3-ai-chat")}>
            <div className="ed-root flex h-dvh flex-col overflow-hidden bg-ed-app font-sans text-ed-text">
              <PageCanvas
                key={page.id}
                page={page}
                backTo={backTo}
                onChange={handlePuckChange}
                onAction={handlePuckAction}
                onPublish={() => setPublishOpen(true)}
              />

              {(autosave.status === "conflict" || (autosave.status === "failed" && autosave.issue)) && (
                <div
                  role="alert"
                  className="fixed left-1/2 top-14 z-(--z-ed-toast) flex max-w-xl -translate-x-1/2 items-start gap-2 rounded-ed-lg border border-ed-border bg-ed-panel px-3 py-2 shadow-ed-pop"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-ed-danger" aria-hidden />
                  <p className="text-ed-sm text-ed-text">
                    {autosave.status === "conflict"
                      ? "This website was changed in another tab or by someone else. Reload to get the latest version; your recent edits here can't be saved."
                      : autosave.issue?.message}
                  </p>
                  {autosave.status === "conflict" && (
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="flex h-7 shrink-0 items-center gap-1 rounded-ed bg-ed-accent px-2.5 text-ed-xs font-medium text-white hover:bg-ed-accent-hover"
                    >
                      <RotateCw className="size-3.5" aria-hidden /> Reload
                    </button>
                  )}
                </div>
              )}

              {toast && (
                <div
                  key={toast.id}
                  role="status"
                  className="fixed bottom-5 left-1/2 z-(--z-ed-toast) flex -translate-x-1/2 items-center gap-2 rounded-ed-lg bg-ed-text px-3 py-2 text-ed-sm text-white shadow-ed-pop"
                >
                  {toast.tone === "danger" ? (
                    <AlertTriangle className="size-4 text-ed-danger-soft" aria-hidden />
                  ) : (
                    <CheckCircle2 className="size-4 text-ed-success-soft" aria-hidden />
                  )}
                  {toast.message}
                  <button type="button" aria-label="Dismiss" onClick={() => setToast(null)} className="ml-1 text-white/60 hover:text-white">
                    <X className="size-3.5" aria-hidden />
                  </button>
                </div>
              )}

              <PublishDialog
                isOpen={publishOpen}
                onClose={() => setPublishOpen(false)}
                onPublished={(updated, hosting) => {
                  setWebsite(updated);
                  setPublishOpen(false);
                  setPublished({ hosting });
                }}
              />

              <PublishSuccessModal
                isOpen={published !== null}
                onClose={() => setPublished(null)}
                website={website}
                hosting={published?.hosting}
                redirect={{ to: `/websites/${website.id}`, seconds: 5, stayLabel: "Keep editing" }}
              />

              <EditorOnboarding />
            </div>
          </TourProvider>
        </MediaTargetContext.Provider>
      </LinkTargetsContext.Provider>
    </EditorContext.Provider>
  );
}
