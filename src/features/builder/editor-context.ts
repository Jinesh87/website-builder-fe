import { createContext, useContext } from "react";
import type { SavedSection, ThemeOption, WebsiteDetail, WebsitePage } from "../../api/websites.ts";
import type { Device } from "../../components/websites/DevicePreview.tsx";
import type { EditorDraft } from "../../pages/websites/editor/editor-state.ts";
import type { FooterData, HeaderData, ThemeSettings } from "../../site-kit/index.ts";
import type { AutosaveState } from "./autosave/use-autosave.ts";

export type SiteArea = "header" | "page" | "theme" | "footer";
export type LeftPanelId = "add" | "pages" | "layers" | "assets" | "templates";
export type EditorRole = "SUPER_ADMIN" | "CLIENT";

/** What the canvas iframe needs to draw the site chrome around the page content. */
export type BuilderSiteValue = {
  theme: ThemeSettings;
  header: HeaderData;
  footer: FooterData;
  activeArea: SiteArea | null;
  isEmpty: boolean;
  selectArea: (area: SiteArea) => void;
  openAddPanel: () => void;
  navigateToHref?: (href: string) => void;
};

export const BuilderSiteContext = createContext<BuilderSiteValue | null>(null);

export function useBuilderSite(): BuilderSiteValue {
  const value = useContext(BuilderSiteContext);
  if (!value) throw new Error("useBuilderSite must be used inside the builder");
  return value;
}

export type AiBuildingState = {
  active: boolean;
  step: string;
  scope?: "page" | "section" | "header" | "footer" | "theme" | null;
  targetId?: string | null;
  sectionType?: string | null;
  sectionIndex?: number;
  totalSections?: number;
  progressPercent?: number;
  pointerY?: number; // percentage 0 - 100 for canvas vertical position
} | null;

/**
 * While set, the AI owns the canvas: manual edits are blocked until its change is applied or discarded.
 * "thinking" covers the time before the AI decides whether to reply or edit, so no build UI is shown.
 */
export type AiLock = "thinking" | "building" | "reviewing" | null;

export type EditorValue = {
  website: WebsiteDetail;
  draft: EditorDraft;
  page: WebsitePage;
  role: EditorRole;
  themes: ThemeOption[];
  savedSections: SavedSection[];
  setSavedSections: (update: (current: SavedSection[]) => SavedSection[]) => void;
  autosave: AutosaveState;
  editDraft: (update: (current: EditorDraft) => EditorDraft) => void;
  selectPage: (pageId: string) => void;
  leftPanel: LeftPanelId | null;
  setLeftPanel: (panel: LeftPanelId | null) => void;
  siteArea: SiteArea;
  setSiteArea: (area: SiteArea) => void;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  device: Device;
  setDevice: (device: Device) => void;
  notify: (message: string, tone?: "success" | "danger") => void;
  aiBuilding: AiBuildingState;
  setAiBuilding: (state: AiBuildingState | ((prev: AiBuildingState) => AiBuildingState)) => void;
  aiLock: AiLock;
  setAiLock: (lock: AiLock) => void;
};

export const EditorContext = createContext<EditorValue | null>(null);

export function useEditor(): EditorValue {
  const value = useContext(EditorContext);
  if (!value) throw new Error("useEditor must be used inside the builder");
  return value;
}
