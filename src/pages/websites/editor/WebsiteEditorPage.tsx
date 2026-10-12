import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Button, Spinner } from "@heroui/react";
import {
  ArrowLeft,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Home,
  LayoutPanelTop,
  LayoutTemplate,
  Palette,
  PanelBottom,
  Plus,
  Trash2,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError, errorMessage, type FieldIssue } from "../../../api/http.ts";
import { websitesApi, type SavedSection, type ThemeOption, type WebsiteDetail } from "../../../api/websites.ts";
import { useAuth } from "../../../auth/auth-context.ts";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.tsx";
import FormAlert from "../../../components/ui/FormAlert.tsx";
import { DeviceToggle, PreviewFrame, type Device } from "../../../components/websites/DevicePreview.tsx";
import { WebsiteStatusChip } from "../../../components/websites/website-labels.tsx";
import {
  DEFAULT_FONT,
  isFontKey,
  SECTION_DEFINITIONS,
  SitePage,
  type Section,
  type SitePageEditorHooks,
} from "../../../site-kit/index.ts";
import type { CreatedState } from "../CreateWebsitePage.tsx";
import ComponentLibrary from "./ComponentLibrary.tsx";
import {
  addPage,
  deletePage,
  draftFromWebsite,
  duplicateSection,
  homePage,
  LIMITS,
  moveItem,
  toSaveInput,
  updatePageMeta,
  updateSections,
  type EditorDraft,
  type Selection,
} from "./editor-state.ts";
import { IconButton, LinkTargetsContext } from "./fields.tsx";
import { describeIssue } from "./save-errors.ts";
import SaveNameDialog from "./SaveNameDialog.tsx";
import SectionForm from "./SectionForm.tsx";
import { FooterForm, HeaderForm, PageForm, ThemeForm } from "./SiteSettingsForms.tsx";

/** Keeps builder controls drawn inside the scaled preview at their normal size. */
function unscaled(origin: string): CSSProperties {
  return { transform: "scale(calc(1 / var(--preview-scale, 1)))", transformOrigin: origin };
}

type SaveState = { status: "idle" } | { status: "saving" } | { status: "error"; message: string; conflict: boolean };

function sectionTitle(section: Section): string {
  const heading = "heading" in section.data ? section.data.heading : undefined;
  return heading?.trim() || SECTION_DEFINITIONS[section.type].label;
}

export default function WebsiteEditorPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const backTo = user?.role === "SUPER_ADMIN" ? "/admin/websites" : "/websites";

  const [website, setWebsite] = useState<WebsiteDetail | null>(null);
  const [draft, setDraft] = useState<EditorDraft | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [notice, setNotice] = useState<{ title: string; text: string } | null>(
    (location.state as CreatedState | null)?.created === true
      ? { title: "Website created", text: "Add sections from the left panel, click anything in the preview to edit it, then press Save." }
      : null,
  );
  const [savedSections, setSavedSections] = useState<SavedSection[]>([]);
  const [nameDialog, setNameDialog] = useState<{ kind: "template" } | { kind: "section"; section: Section } | null>(null);

  const [pageId, setPageId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection>({ kind: "page" });
  const [device, setDevice] = useState<Device>("desktop");
  const [library, setLibrary] = useState<{ insertAt: number } | null>(null);
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [newPageName, setNewPageName] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<
    { kind: "delete-page" } | { kind: "leave" } | { kind: "delete-saved"; saved: SavedSection } | null
  >(null);

  const draftRef = useRef<EditorDraft | null>(null);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    let cancelled = false;
    websitesApi
      .get(id)
      .then((loaded) => {
        if (cancelled) return;
        const initial = draftFromWebsite(loaded);
        setWebsite(loaded);
        setDraft(initial);
        setSavedJson(JSON.stringify(initial));
        setPageId(homePage(initial.pages)?.id ?? null);
      })
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    websitesApi
      .themes()
      .then((loaded) => !cancelled && setThemes(loaded))
      .catch(() => undefined);
    websitesApi
      .savedSections(id)
      .then((loaded) => !cancelled && setSavedSections(loaded))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [id]);

  const draftJson = useMemo(() => (draft ? JSON.stringify(draft) : ""), [draft]);
  const dirty = draft !== null && draftJson !== savedJson;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const pages = draft?.pages ?? [];
  const page = pages.find((candidate) => candidate.id === pageId) ?? homePage(pages);
  const selectedSection =
    selection.kind === "section" ? page?.sections.find((section) => section.id === selection.sectionId) : undefined;
  const linkTargets = useMemo(() => pages.map((candidate) => ({ label: candidate.name, href: candidate.slug })), [pages]);

  const edit = useCallback((update: (current: EditorDraft) => EditorDraft) => {
    setDraft((current) => (current ? update(current) : current));
  }, []);

  /** Resolves true when the draft is saved (or there was nothing to save). */
  const save = useCallback(async (): Promise<boolean> => {
    const current = draftRef.current;
    if (!website || !current || saveState.status === "saving") return false;
    const sentJson = JSON.stringify(current);
    setSaveState({ status: "saving" });
    try {
      const saved = await websitesApi.saveDraft(website.id, toSaveInput(current, website.draft.draftUpdatedAt));
      setWebsite(saved);
      // Edits made while the request was in flight stay local and keep the draft dirty.
      if (JSON.stringify(draftRef.current) === sentJson) {
        const next = draftFromWebsite(saved);
        const slug = draftRef.current?.pages.find((candidate) => candidate.id === pageId)?.slug;
        setDraft(next);
        setSavedJson(JSON.stringify(next));
        setPageId(next.pages.find((candidate) => candidate.slug === slug)?.id ?? homePage(next.pages)?.id ?? null);
      } else {
        setSavedJson(sentJson);
      }
      setSaveState({ status: "idle" });
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_ERROR" && Array.isArray(err.details) && err.details.length) {
        const issue = describeIssue(current, err.details[0] as FieldIssue);
        if (issue.pageId) setPageId(issue.pageId);
        if (issue.selection) setSelection(issue.selection);
        setSaveState({ status: "error", message: `Couldn't save. ${issue.message}`, conflict: false });
        return false;
      }
      const conflict = err instanceof ApiError && err.code === "DRAFT_CONFLICT";
      setSaveState({ status: "error", message: errorMessage(err), conflict });
      return false;
    }
  }, [website, saveState.status, pageId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save]);

  useEffect(() => {
    if (selection.kind !== "section") return;
    document
      .querySelector(`[data-editor-section="${CSS.escape(selection.sectionId)}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selection]);

  function selectPage(nextPageId: string) {
    setPageId(nextPageId);
    setSelection({ kind: "page" });
  }

  function editSections(update: (sections: Section[]) => Section[]) {
    if (!page) return;
    edit((current) => updateSections(current, page.id, update));
  }

  function moveSection(sectionId: string, delta: number) {
    editSections((sections) => moveItem(sections, sections.findIndex((section) => section.id === sectionId), delta));
  }

  function copySection(section: Section) {
    const copy = duplicateSection(section);
    editSections((sections) => {
      const index = sections.findIndex((candidate) => candidate.id === section.id);
      return [...sections.slice(0, index + 1), copy, ...sections.slice(index + 1)];
    });
    setSelection({ kind: "section", sectionId: copy.id });
  }

  function removeSection(sectionId: string) {
    editSections((sections) => sections.filter((section) => section.id !== sectionId));
    setSelection({ kind: "page" });
  }

  function toggleHidden(sectionId: string) {
    editSections((sections) =>
      sections.map((section) => (section.id === sectionId ? { ...section, hidden: !section.hidden } : section)),
    );
  }

  function openLibrary(insertAt?: number) {
    setLibrary({ insertAt: insertAt ?? page?.sections.length ?? 0 });
  }

  function addSection(section: Section) {
    const insertAt = library?.insertAt ?? page?.sections.length ?? 0;
    editSections((sections) => [...sections.slice(0, insertAt), section, ...sections.slice(insertAt)]);
    setSelection({ kind: "section", sectionId: section.id });
    setLibrary(null);
  }

  function submitNewPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || newPageName === null) return;
    const result = addPage(draft, newPageName);
    setDraft(result.draft);
    setNewPageName(null);
    selectPage(result.pageId);
  }

  function confirmDeletePage() {
    if (!page) return;
    edit((current) => deletePage(current, page.id));
    setPageId(homePage(pages)?.id ?? null);
    setSelection({ kind: "page" });
    setConfirm(null);
  }

  /** Templates are copied from the saved draft, so unsaved edits are saved first. */
  async function openSaveTemplate() {
    if (dirty && !(await save())) return;
    setNameDialog({ kind: "template" });
  }

  async function saveTemplate({ name, description }: { name: string; description: string }) {
    if (!website) return;
    const template = await websitesApi.saveAsTemplate(website.id, { name, ...(description ? { description } : {}) });
    setNameDialog(null);
    setNotice({
      title: "Saved as template",
      text: `“${template.name}” is in My templates. Choose it under “Starting point” when you create your next website.`,
    });
  }

  async function saveSectionToLibrary({ name }: { name: string }) {
    if (!website || nameDialog?.kind !== "section") return;
    let saved: SavedSection;
    try {
      saved = await websitesApi.saveSection(website.id, { name, section: nameDialog.section });
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_ERROR" && Array.isArray(err.details) && err.details.length) {
        const issue = err.details[0] as FieldIssue;
        const field = [...issue.path].reverse().find((part) => typeof part === "string") ?? "value";
        throw new Error(`Fix this section first: ${field} ${issue.message.replace(/^"[^"]*"\s*/, "")}.`);
      }
      throw err;
    }
    setSavedSections((current) => [saved, ...current]);
    setNameDialog(null);
    setNotice({ title: "Section saved", text: `“${saved.name}” is in My saved sections. Add it to any page from the section library.` });
  }

  async function confirmDeleteSaved(saved: SavedSection) {
    if (!website) return;
    setConfirm(null);
    try {
      await websitesApi.deleteSavedSection(website.id, saved.id);
      setSavedSections((current) => current.filter((candidate) => candidate.id !== saved.id));
    } catch (err) {
      setSaveState({ status: "error", message: errorMessage(err), conflict: false });
    }
  }

  function leave() {
    if (dirty) setConfirm({ kind: "leave" });
    else navigate(backTo);
  }

  const sectionCount = page?.sections.length ?? 0;
  const canAddSection = sectionCount < LIMITS.sectionsPerPage;

  const editorHooks: SitePageEditorHooks | undefined = page && {
    renderHeader: (content) => (
      <SelectableArea label="Header" selected={selection.kind === "header"} onSelect={() => setSelection({ kind: "header" })}>
        {content}
      </SelectableArea>
    ),
    renderFooter: (content) => (
      <SelectableArea label="Footer" selected={selection.kind === "footer"} onSelect={() => setSelection({ kind: "footer" })}>
        {content}
      </SelectableArea>
    ),
    renderSection: (section, content) => {
      const index = page.sections.findIndex((candidate) => candidate.id === section.id);
      const selected = selection.kind === "section" && selection.sectionId === section.id;
      return (
        <div data-editor-section={section.id} className={section.hidden ? "opacity-40" : undefined}>
          <SelectableArea
            label={`${SECTION_DEFINITIONS[section.type].label}${section.hidden ? " · hidden" : ""}`}
            selected={selected}
            onSelect={() => setSelection({ kind: "section", sectionId: section.id })}
            toolbar={
              <>
                <IconButton label="Move up" onClick={() => moveSection(section.id, -1)} disabled={index === 0}>
                  <ChevronUp className="size-4" />
                </IconButton>
                <IconButton label="Move down" onClick={() => moveSection(section.id, 1)} disabled={index === sectionCount - 1}>
                  <ChevronDown className="size-4" />
                </IconButton>
                <IconButton label="Duplicate" onClick={() => copySection(section)} disabled={!canAddSection}>
                  <Copy className="size-4" />
                </IconButton>
                <IconButton label="Save to my sections" onClick={() => setNameDialog({ kind: "section", section })}>
                  <BookmarkPlus className="size-4" />
                </IconButton>
                <IconButton label={section.hidden ? "Show" : "Hide"} onClick={() => toggleHidden(section.id)}>
                  {section.hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </IconButton>
                <IconButton label="Delete" tone="danger" onClick={() => removeSection(section.id)}>
                  <Trash2 className="size-4" />
                </IconButton>
              </>
            }
          >
            {content}
          </SelectableArea>
          {selected && canAddSection && (
            <div className="wb-editor-chrome relative z-10 flex h-0 items-center justify-center">
              <button
                type="button"
                onClick={() => openLibrary(index + 1)}
                style={unscaled("center")}
                className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 font-sans text-sm font-medium text-white shadow-md hover:bg-brand-hover"
              >
                <Plus className="size-4" aria-hidden /> Add section below
              </button>
            </div>
          )}
        </div>
      );
    },
    emptyState: (
      <div
        className="wb-editor-chrome flex flex-col items-center gap-3 px-6 py-16 text-center font-sans"
        style={{ zoom: "calc(1 / var(--preview-scale, 1))" }}
      >
        <p className="text-lg font-semibold text-ink">This page is empty</p>
        <p className="max-w-md text-sm text-ink-body">
          Add ready-made sections like a hero, services, gallery or contact form, then change the text, images and layout.
        </p>
        <button
          type="button"
          onClick={() => openLibrary(0)}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          <Plus className="size-4" aria-hidden /> Add your first section
        </button>
      </div>
    ),
  };

  let inspectorTitle = "";
  let inspector: ReactNode = null;
  if (draft && page) {
    if (selection.kind === "section" && selectedSection) {
      inspectorTitle = SECTION_DEFINITIONS[selectedSection.type].label;
      inspector = (
        <>
          <SectionForm
            key={selectedSection.id}
            section={selectedSection}
            siteFont={isFontKey(draft.theme.fonts.heading) ? draft.theme.fonts.heading : DEFAULT_FONT}
            onChange={(updated) =>
              editSections((sections) => sections.map((section) => (section.id === updated.id ? updated : section)))
            }
          />
          <div className="flex flex-wrap gap-2 px-4 py-4">
            <Button variant="outline" size="sm" onPress={() => setNameDialog({ kind: "section", section: selectedSection })}>
              <BookmarkPlus className="size-4" aria-hidden /> Save to my sections
            </Button>
            <Button variant="danger-soft" size="sm" onPress={() => removeSection(selectedSection.id)}>
              <Trash2 className="size-4" aria-hidden /> Delete section
            </Button>
          </div>
        </>
      );
    } else if (selection.kind === "header") {
      inspectorTitle = "Header";
      inspector = <HeaderForm header={draft.header} pages={pages} onChange={(header) => edit((current) => ({ ...current, header }))} />;
    } else if (selection.kind === "footer") {
      inspectorTitle = "Footer";
      inspector = <FooterForm footer={draft.footer} pages={pages} onChange={(footer) => edit((current) => ({ ...current, footer }))} />;
    } else if (selection.kind === "theme") {
      inspectorTitle = "Colours & fonts";
      inspector = <ThemeForm theme={draft.theme} presets={themes} onChange={(theme) => edit((current) => ({ ...current, theme }))} />;
    } else {
      inspectorTitle = "Page settings";
      inspector = (
        <>
          <PageForm
            key={page.id}
            page={page}
            pages={pages}
            website={website}
            onChange={(patch) => edit((current) => updatePageMeta(current, page.id, patch))}
          />

          {page.slug !== "/" && (
            <div className="px-4 py-4">
              <Button variant="danger-soft" size="sm" onPress={() => setConfirm({ kind: "delete-page" })}>
                <Trash2 className="size-4" aria-hidden /> Delete page
              </Button>
            </div>
          )}
        </>
      );
    }
  }

  const saving = saveState.status === "saving";

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <header className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-ink px-4 py-2.5 text-white">
        <button type="button" onClick={leave} className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white">
          <ArrowLeft className="size-4" aria-hidden /> Back
        </button>
        {website && (
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium">{website.name}</span>
            <WebsiteStatusChip website={website} />
          </div>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <DeviceToggle value={device} onChange={setDevice} tone="dark" />
          {website && (
            <Link
              to={`/websites/${website.id}/preview`}
              target="_blank"
              className="text-sm text-white/80 hover:text-white"
              title={dirty ? "Preview shows the last saved draft" : undefined}
            >
              Preview
            </Link>
          )}
          <button
            type="button"
            onClick={() => void openSaveTemplate()}
            disabled={!draft || saving}
            className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white disabled:opacity-50"
          >
            <LayoutTemplate className="size-4" aria-hidden /> Save as template
          </button>
          <span className="min-w-24 text-right text-xs text-white/60" aria-live="polite">
            {saving ? "Saving…" : dirty ? "Unsaved changes" : draft ? "All changes saved" : ""}
          </span>
          <Button size="sm" onPress={() => void save()} isPending={saving} isDisabled={!dirty || saving}>
            Save
          </Button>
        </div>
      </header>

      {(notice || saveState.status === "error") && (
        <div className="border-b border-line bg-surface px-4 py-2">
          {saveState.status === "error" ? (
            <FormAlert status="danger">
              {saveState.message}
              {saveState.conflict && (
                <button type="button" onClick={() => window.location.reload()} className="ml-2 font-medium underline">
                  Reload latest draft
                </button>
              )}
            </FormAlert>
          ) : (
            notice && (
              <FormAlert status="success" title={notice.title}>
                {notice.text}{" "}
                <button type="button" onClick={() => setNotice(null)} className="font-medium underline">
                  Got it
                </button>
              </FormAlert>
            )
          )}
        </div>
      )}

      {loadError && (
        <div className="mx-auto max-w-3xl px-6 pt-8">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      {!draft && !loadError && (
        <div className="grid flex-1 place-items-center">
          <Spinner aria-label="Loading editor" />
        </div>
      )}

      {draft && page && editorHooks && (
        <LinkTargetsContext.Provider value={linkTargets}>
          <div className="flex min-h-0 flex-1">
            <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface" aria-label="Pages and sections">
              <PanelHeading>Pages</PanelHeading>
              <ul className="flex flex-col px-2">
                {pages.map((candidate, index) => (
                  <li key={candidate.id} className="group flex items-center">
                    <button
                      type="button"
                      onClick={() => selectPage(candidate.id)}
                      aria-current={candidate.id === page.id ? "page" : undefined}
                      className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                        candidate.id === page.id ? "bg-brand-soft font-medium text-brand" : "text-ink hover:bg-canvas"
                      }`}
                    >
                      {candidate.slug === "/" ? <Home className="size-4 shrink-0" aria-hidden /> : <FileText className="size-4 shrink-0" aria-hidden />}
                      <span className="truncate">{candidate.name}</span>
                      {!candidate.visible && <EyeOff className="size-3.5 shrink-0 text-ink-muted" aria-label="Hidden page" />}
                    </button>
                    <span className="hidden group-hover:flex">
                      <IconButton label="Move page up" onClick={() => edit((current) => ({ ...current, pages: moveItem(current.pages, index, -1) }))} disabled={index === 0}>
                        <ChevronUp className="size-3.5" />
                      </IconButton>
                      <IconButton label="Move page down" onClick={() => edit((current) => ({ ...current, pages: moveItem(current.pages, index, 1) }))} disabled={index === pages.length - 1}>
                        <ChevronDown className="size-3.5" />
                      </IconButton>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="px-3 pb-3 pt-1">
                {newPageName === null ? (
                  <button
                    type="button"
                    onClick={() => setNewPageName("")}
                    disabled={pages.length >= LIMITS.pages}
                    className="inline-flex items-center gap-1 text-sm text-brand hover:underline disabled:opacity-50"
                  >
                    <Plus className="size-4" aria-hidden /> Add page
                  </button>
                ) : (
                  <form onSubmit={submitNewPage} className="flex flex-col gap-2">
                    <input
                      autoFocus
                      aria-label="New page name"
                      placeholder="Page name, e.g. About us"
                      value={newPageName}
                      maxLength={120}
                      onChange={(event) => setNewPageName(event.target.value)}
                      onKeyDown={(event) => event.key === "Escape" && setNewPageName(null)}
                      className="h-8 rounded-md border border-line-strong px-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" isDisabled={!newPageName.trim()}>
                        Add page
                      </Button>
                      <Button size="sm" variant="ghost" onPress={() => setNewPageName(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              <PanelHeading>Site design</PanelHeading>
              <div className="flex flex-col px-2 pb-3">
                <PanelItem icon={<LayoutPanelTop className="size-4" />} label="Header & menu" active={selection.kind === "header"} onClick={() => setSelection({ kind: "header" })} />
                <PanelItem icon={<PanelBottom className="size-4" />} label="Footer" active={selection.kind === "footer"} onClick={() => setSelection({ kind: "footer" })} />
                <PanelItem icon={<Palette className="size-4" />} label="Colours & fonts" active={selection.kind === "theme"} onClick={() => setSelection({ kind: "theme" })} />
              </div>

              <PanelHeading>
                Sections on “{page.name}” <span className="text-ink-muted">({sectionCount})</span>
              </PanelHeading>
              <ul className="flex flex-col gap-0.5 px-2">
                {page.sections.map((section, index) => {
                  const active = selection.kind === "section" && selection.sectionId === section.id;
                  return (
                    <li key={section.id} className="group flex items-center">
                      <button
                        type="button"
                        onClick={() => setSelection({ kind: "section", sectionId: section.id })}
                        className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-left ${active ? "bg-brand-soft" : "hover:bg-canvas"} ${section.hidden ? "opacity-50" : ""}`}
                      >
                        <span className={`block truncate text-sm ${active ? "font-medium text-brand" : "text-ink"}`}>{sectionTitle(section)}</span>
                        <span className="block text-[11px] text-ink-muted">
                          {SECTION_DEFINITIONS[section.type].label}
                          {section.hidden ? " · hidden" : ""}
                        </span>
                      </button>
                      <span className="hidden group-hover:flex">
                        <IconButton label="Move up" onClick={() => moveSection(section.id, -1)} disabled={index === 0}>
                          <ChevronUp className="size-3.5" />
                        </IconButton>
                        <IconButton label="Move down" onClick={() => moveSection(section.id, 1)} disabled={index === sectionCount - 1}>
                          <ChevronDown className="size-3.5" />
                        </IconButton>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="p-3">
                <Button fullWidth size="sm" onPress={() => openLibrary()} isDisabled={!canAddSection}>
                  <Plus className="size-4" aria-hidden /> Add section
                </Button>
              </div>
            </aside>

            <main className="min-w-0 flex-1 overflow-y-auto" aria-label="Page preview">
              <PreviewFrame device={device} fit>
                <SitePage site={{ ...draft, pages }} page={page} editor={editorHooks} />
              </PreviewFrame>
            </main>

            <aside className="w-80 shrink-0 overflow-y-auto border-l border-line bg-surface" aria-label="Settings">
              <div className="sticky top-0 z-10 border-b border-line bg-surface px-4 py-3">
                <h2 className="text-sm font-semibold text-ink">{inspectorTitle}</h2>
                {selection.kind === "section" && <p className="text-xs text-ink-muted">On page “{page.name}”</p>}
              </div>
              {inspector}
            </aside>
          </div>
        </LinkTargetsContext.Provider>
      )}

      {draft && (
        <ComponentLibrary
          isOpen={library !== null}
          onClose={() => setLibrary(null)}
          theme={draft.theme}
          savedSections={savedSections}
          onAdd={addSection}
          onDeleteSaved={(saved) => setConfirm({ kind: "delete-saved", saved })}
        />
      )}

      {nameDialog?.kind === "template" && (
        <SaveNameDialog
          isOpen
          title="Save as template"
          intro="Saves all pages, sections, header, footer, colours and fonts as a template you can start new websites from. This website isn't changed."
          defaultName={`${website?.name ?? "My"} design`}
          withDescription
          submitLabel="Save template"
          onSubmit={saveTemplate}
          onClose={() => setNameDialog(null)}
        />
      )}
      {nameDialog?.kind === "section" && (
        <SaveNameDialog
          isOpen
          title="Save to my sections"
          intro="Saves this section with its content and style, so you can add it to any page of your websites."
          defaultName={sectionTitle(nameDialog.section)}
          submitLabel="Save section"
          onSubmit={saveSectionToLibrary}
          onClose={() => setNameDialog(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirm?.kind === "delete-saved"}
        title={`Delete “${confirm?.kind === "delete-saved" ? confirm.saved.name : ""}”?`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => confirm?.kind === "delete-saved" && void confirmDeleteSaved(confirm.saved)}
        onCancel={() => setConfirm(null)}
      >
        The saved section is removed from your library. Pages that already use it are not changed.
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={confirm?.kind === "delete-page"}
        title={`Delete “${page?.name ?? ""}”?`}
        confirmLabel="Delete page"
        tone="danger"
        onConfirm={confirmDeletePage}
        onCancel={() => setConfirm(null)}
      >
        The page and its sections are removed from your draft, along with menu links to it. Nothing is permanent until you
        press Save.
      </ConfirmDialog>
      <ConfirmDialog
        isOpen={confirm?.kind === "leave"}
        title="Leave without saving?"
        confirmLabel="Leave"
        tone="danger"
        onConfirm={() => navigate(backTo)}
        onCancel={() => setConfirm(null)}
      >
        You have unsaved changes. They will be lost if you leave now.
      </ConfirmDialog>
    </div>
  );
}

function PanelHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-4 pb-1.5 pt-4 font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">{children}</h2>
  );
}

function PanelItem({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${active ? "bg-brand-soft font-medium text-brand" : "text-ink hover:bg-canvas"}`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  );
}

type SelectableAreaProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
  toolbar?: ReactNode;
  children: ReactNode;
};

/** Click-to-select wrapper drawn around header, footer and sections inside the preview. */
function SelectableArea({ label, selected, onSelect, toolbar, children }: SelectableAreaProps) {
  return (
    <div
      onClick={onSelect}
      className={`group/area relative cursor-pointer outline-2 -outline-offset-2 ${
        selected ? "outline outline-brand" : "hover:outline hover:outline-brand/40"
      }`}
    >
      {children}
      <span
        style={unscaled("top left")}
        className={`wb-editor-chrome pointer-events-none absolute left-2 top-2 z-10 rounded bg-brand px-2 py-0.5 font-sans text-xs font-medium text-white ${
          selected ? "" : "hidden group-hover/area:block"
        }`}
      >
        {label}
      </span>
      {selected && toolbar && (
        <div
          style={unscaled("top right")}
          className="wb-editor-chrome absolute right-2 top-2 z-10 flex items-center rounded-md border border-line bg-white p-0.5 font-sans shadow-md"
          onClick={(event) => event.stopPropagation()}
        >
          {toolbar}
        </div>
      )}
    </div>
  );
}
