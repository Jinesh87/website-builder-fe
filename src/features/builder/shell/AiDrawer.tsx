import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Compass,
  Eye,
  FileEdit,
  FilePlus,
  HelpCircle,
  History,
  Loader2,
  MessageSquarePlus,
  Palette,
  RotateCcw,
  Square,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { AiSparklesIcon } from "../../../components/icons/AiSparklesIcon.tsx";
import {
  DEFAULT_SECTION_SETTINGS,
  HERO_ALIGN_ELEMENTS,
  HERO_ALIGNS,
  HERO_BUTTON_RADIUS_MAX,
  HERO_BUTTON_SHAPES,
  HERO_VARIANTS,
  SECTION_DEFINITIONS,
  type FooterData,
  type HeaderData,
  type Section,
  type SectionSettings,
  type SectionType,
} from "../../../site-kit/index.ts";
import { websitesApi, type AiLayoutSlot, type PageType } from "../../../api/websites.ts";
import type { AiSuggestion } from "../schema/editor-document.ts";
import { useEditor, type AiLock } from "../editor-context.ts";
import { homePage, updatePageMeta } from "../../../pages/websites/editor/editor-state.ts";
import { aiPlaceholderItem, itemAsSection, sectionToItem, type BuilderItem } from "../puck/adapter.ts";
import { selectSection, useBuilderPuck } from "../puck/puck-api.ts";
import { scrollCanvasToSection } from "./AiBuilderCanvasOverlay.tsx";
import { ToolButton } from "./ui.tsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.tsx";
import {
  formatCountdown,
  pruneExpiredRollbacks,
  rollbackRemainingMs,
  toHistoryPayload,
  useNow,
  type ChatMessage,
  type ChatSession,
} from "./ai-chat-history.ts";
import {
  ensureUniqueSlugs,
  getKnownRoutes,
  normalizeSlug,
  reconcileHeaderMenu,
  resolveInternalLink,
  sanitizeSectionLinks,
} from "../utils/link-validator.ts";
import { isChromeSection, splitSiteChrome, withSiteChrome } from "../utils/site-chrome.ts";

const COLOR_MAP: Record<string, string> = {
  red: "#dc2626",
  darkred: "#991b1b",
  lightred: "#f87171",
  blue: "#2563eb",
  darkblue: "#1e3a8a",
  lightblue: "#60a5fa",
  green: "#16a34a",
  darkgreen: "#14532d",
  emerald: "#059669",
  teal: "#0d9488",
  cyan: "#0891b2",
  purple: "#9333ea",
  violet: "#7c3aed",
  indigo: "#4f46e5",
  pink: "#db2777",
  yellow: "#ca8a04",
  orange: "#ea580c",
  amber: "#d97706",
  black: "#000000",
  white: "#ffffff",
  gray: "#4b5563",
  darkgray: "#1f2937",
  slate: "#0f172a",
  zinc: "#18181b",
};

function sanitizeHex(val: unknown): string | undefined {
  if (typeof val !== "string") return undefined;
  const trimmed = val.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed;
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const [, r, g, b] = trimmed.split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  const cleanKey = trimmed.replace(/[^a-z]/g, "");
  return COLOR_MAP[cleanKey];
}

function normalizeSection(raw: Section): Section {
  const type =
    (raw.type as SectionType) in SECTION_DEFINITIONS
      ? (raw.type as SectionType)
      : "hero";
  const def = SECTION_DEFINITIONS[type] || SECTION_DEFINITIONS.hero;
  const defaultData = def ? def.createData() : {};
  const rawData = (raw.data || {}) as Record<string, unknown>;

  const mergedData: Record<string, unknown> = {
    ...defaultData,
    ...rawData,
  };

  // Safe mapping for common AI field name synonyms
  if (
    rawData.title &&
    !rawData.heading &&
    "heading" in (defaultData as Record<string, unknown>)
  ) {
    mergedData.heading = rawData.title;
  }
  if (
    rawData.subtitle &&
    !rawData.subheading &&
    "subheading" in (defaultData as Record<string, unknown>)
  ) {
    mergedData.subheading = rawData.subtitle;
  }
  if (
    rawData.subtitle &&
    !rawData.intro &&
    "intro" in (defaultData as Record<string, unknown>)
  ) {
    mergedData.intro = rawData.subtitle;
  }
  if (
    rawData.description &&
    !rawData.intro &&
    "intro" in (defaultData as Record<string, unknown>)
  ) {
    mergedData.intro = rawData.description;
  }

  // Normalize string image URLs to { url, alt } objects, and strip empty images
  if (typeof mergedData.backgroundImage === "string") {
    mergedData.backgroundImage = mergedData.backgroundImage.trim()
      ? { url: mergedData.backgroundImage.trim(), alt: "Hero Background" }
      : undefined;
  }
  if (
    mergedData.backgroundImage &&
    typeof mergedData.backgroundImage === "object"
  ) {
    const bg = mergedData.backgroundImage as Record<string, unknown>;
    if (!bg.url || typeof bg.url !== "string" || !bg.url.trim()) {
      delete mergedData.backgroundImage;
    }
  }

  if (typeof mergedData.image === "string") {
    mergedData.image = mergedData.image.trim()
      ? { url: mergedData.image.trim(), alt: "Image" }
      : undefined;
  }
  if (mergedData.image && typeof mergedData.image === "object") {
    const img = mergedData.image as Record<string, unknown>;
    if (!img.url || typeof img.url !== "string" || !img.url.trim()) {
      delete mergedData.image;
    }
  }

  if (
    mergedData.secondaryImage &&
    typeof mergedData.secondaryImage === "object"
  ) {
    const img = mergedData.secondaryImage as Record<string, unknown>;
    if (!img.url || typeof img.url !== "string" || !img.url.trim()) {
      delete mergedData.secondaryImage;
    }
  }

  // Type-specific schema normalization
  if (type === "hero") {
    const validHeroVariants = [
      ...HERO_VARIANTS,
      "split-left",
    ];
    if (
      typeof mergedData.variant !== "string" ||
      !validHeroVariants.includes(mergedData.variant as any)
    ) {
      mergedData.variant = mergedData.backgroundImage
        ? "background-image"
        : "centered";
    }
    const validImagePositions = [
      "right",
      "left",
      "bottom",
      "background",
      "card",
    ];
    if (
      mergedData.imagePosition &&
      !validImagePositions.includes(mergedData.imagePosition as string)
    ) {
      delete mergedData.imagePosition;
    }
    const validBgPositions = ["bottom", "center", "top", "cover"];
    if (
      mergedData.bgImagePosition &&
      !validBgPositions.includes(mergedData.bgImagePosition as string)
    ) {
      delete mergedData.bgImagePosition;
    }
    const validBgOverlays = ["dark", "light", "gradient", "none"];
    if (
      mergedData.bgOverlayType &&
      !validBgOverlays.includes(mergedData.bgOverlayType as string)
    ) {
      delete mergedData.bgOverlayType;
    }
    const validImageStyles = ["mockup", "rounded", "glow", "shadow", "plain"];
    if (
      mergedData.imageStyle &&
      !validImageStyles.includes(mergedData.imageStyle as string)
    ) {
      delete mergedData.imageStyle;
    }
    const validMinHeights = ["auto", "compact", "screen", "tall"];
    if (
      mergedData.minHeight &&
      !validMinHeights.includes(mergedData.minHeight as string)
    ) {
      delete mergedData.minHeight;
    }
    const validAligns = ["center", "left", "right"];
    if (
      mergedData.contentAlign &&
      !validAligns.includes(mergedData.contentAlign as string)
    ) {
      delete mergedData.contentAlign;
    }
    if (mergedData.alignment !== undefined) {
      const alignKeys: readonly string[] = ["all", ...HERO_ALIGN_ELEMENTS];
      const rawAlignment = mergedData.alignment;
      const alignment =
        rawAlignment && typeof rawAlignment === "object"
          ? Object.fromEntries(
              Object.entries(rawAlignment).filter(
                ([key, value]) =>
                  alignKeys.includes(key) &&
                  (HERO_ALIGNS as readonly unknown[]).includes(value),
              ),
            )
          : {};
      if (Object.keys(alignment).length > 0) mergedData.alignment = alignment;
      else delete mergedData.alignment;
    }
    if (
      mergedData.buttonShape !== undefined &&
      !(HERO_BUTTON_SHAPES as readonly unknown[]).includes(mergedData.buttonShape)
    ) {
      delete mergedData.buttonShape;
    }
    if (mergedData.buttonRadius !== undefined) {
      const radius = mergedData.buttonRadius;
      if (typeof radius === "number" && Number.isFinite(radius)) {
        mergedData.buttonRadius = Math.min(
          Math.max(Math.round(radius), 0),
          HERO_BUTTON_RADIUS_MAX,
        );
      } else {
        delete mergedData.buttonRadius;
      }
    }
    const validBottomShapes = [
      "none",
      "wave",
      "curve",
      "curved",
      "slant",
      "tilt",
      "arch",
      "normal",
    ];
    if (
      mergedData.bottomShape &&
      !validBottomShapes.includes(mergedData.bottomShape as string)
    ) {
      delete mergedData.bottomShape;
    }

    if (mergedData.primaryCta && typeof mergedData.primaryCta === "object") {
      const cta = mergedData.primaryCta as Record<string, unknown>;
      if (!cta.href || typeof cta.href !== "string" || !cta.href.trim()) {
        cta.href = "/contact";
      }
      if (!cta.label || typeof cta.label !== "string" || !cta.label.trim()) {
        cta.label = "Get Started";
      }
    }
    if (
      mergedData.secondaryCta &&
      typeof mergedData.secondaryCta === "object"
    ) {
      const cta = mergedData.secondaryCta as Record<string, unknown>;
      if (
        !cta.href ||
        typeof cta.href !== "string" ||
        !cta.href.trim() ||
        !cta.label ||
        typeof cta.label !== "string" ||
        !cta.label.trim()
      ) {
        delete mergedData.secondaryCta;
      }
    }
  } else if (type === "cta") {
    const validCtaVariants = [
      "centered-card",
      "split-visual",
      "floating-card",
      "minimal-editorial",
    ];
    if (
      typeof mergedData.variant !== "string" ||
      !validCtaVariants.includes(mergedData.variant)
    ) {
      mergedData.variant = "centered-card";
    }
    if (rawData.description && !mergedData.text) {
      mergedData.text = rawData.description;
    }
    if (rawData.primaryButton && !mergedData.button) {
      mergedData.button = rawData.primaryButton;
    }
    if (rawData.cta && !mergedData.button) {
      mergedData.button = rawData.cta;
    }
    if (
      !mergedData.button ||
      typeof (mergedData.button as Record<string, unknown>)?.label !== "string"
    ) {
      mergedData.button = { label: "Get started", href: "/contact" };
    }
  } else if (type === "contact") {
    const validContactVariants = [
      "split-form",
      "cards-hub",
      "minimal-editorial",
      "floating-glass",
    ];
    if (
      typeof mergedData.variant !== "string" ||
      !validContactVariants.includes(mergedData.variant)
    ) {
      mergedData.variant = "split-form";
    }
    if (mergedData.showForm === undefined) {
      mergedData.showForm = true;
    }
    if (!mergedData.submitLabel) {
      mergedData.submitLabel = "Send message";
    }
  } else if (type === "pricing") {
    const validPricingVariants = [
      "cards-grid",
      "minimal-monochrome",
      "spotlight-tier",
      "horizontal-rows",
    ];
    if (
      typeof mergedData.variant !== "string" ||
      !validPricingVariants.includes(mergedData.variant)
    ) {
      mergedData.variant = "cards-grid";
    }
    if (!mergedData.heading) mergedData.heading = "Transparent Pricing";
    const rawPlans = Array.isArray(rawData.plans)
      ? rawData.plans
      : Array.isArray(rawData.tiers)
        ? rawData.tiers
        : Array.isArray(mergedData.plans)
          ? (mergedData.plans as unknown[])
          : [];
    if (rawPlans.length > 0) {
      mergedData.plans = rawPlans.map((p: any, idx: number) => ({
        name: typeof p?.name === "string" ? p.name : `Plan ${idx + 1}`,
        price: typeof p?.price === "string" ? p.price : "$29",
        period:
          typeof p?.period === "string"
            ? p.period
            : typeof p?.interval === "string"
              ? p.interval
              : "/mo",
        originalPrice:
          typeof p?.originalPrice === "string" ? p.originalPrice : undefined,
        badge: typeof p?.badge === "string" ? p.badge : undefined,
        description: typeof p?.description === "string" ? p.description : "",
        features: Array.isArray(p?.features)
          ? p.features.map(String)
          : ["All core features"],
        excludedFeatures: Array.isArray(p?.excludedFeatures)
          ? p.excludedFeatures.map(String)
          : undefined,
        cta:
          p?.cta && typeof p.cta === "object"
            ? p.cta
            : p?.button && typeof p.button === "object"
              ? p.button
              : { label: "Get started", href: "/contact" },
        featured: Boolean(p?.featured ?? p?.highlighted ?? idx === 1),
        highlightNote:
          typeof p?.highlightNote === "string" ? p.highlightNote : undefined,
      }));
    }
  } else if (type === "features") {
    const validFeaturesVariants = [
      "grid",
      "split",
      "pastel-icons",
      "minimal",
      "cards",
    ];
    if (
      typeof mergedData.variant !== "string" ||
      !validFeaturesVariants.includes(mergedData.variant)
    ) {
      mergedData.variant = "pastel-icons";
    }
  } else if (type === "services") {
    const validServicesVariants = [
      "cards-grid",
      "bento-grid",
      "split-showcase",
      "interactive-list",
      "horizontal-cards",
      "minimal-numbered",
    ];
    if (
      typeof mergedData.variant !== "string" ||
      !validServicesVariants.includes(mergedData.variant)
    ) {
      mergedData.variant = "cards-grid";
    }
  } else if (type === "faq") {
    const validFaqVariants = [
      "accordion-classic",
      "two-column-grid",
      "split-sidebar",
      "minimal-numbered",
      "categorized-cards",
    ];
    if (
      typeof mergedData.variant !== "string" ||
      !validFaqVariants.includes(mergedData.variant)
    ) {
      mergedData.variant = "accordion-classic";
    }
  } else if (type === "team") {
    const validTeamVariants = [
      "grid-cards",
      "spotlight-featured",
      "minimal-editorial",
      "glass-overlay",
    ];
    if (
      typeof mergedData.variant !== "string" ||
      !validTeamVariants.includes(mergedData.variant)
    ) {
      mergedData.variant = "grid-cards";
    }
  } else if (type === "footer") {
    const validFooterDesigns = [
      "columns",
      "simple",
      "mega",
      "newsletter",
      "split",
      "inline",
      "centered",
      "cta-banner",
    ];
    if (
      typeof mergedData.design !== "string" ||
      !validFooterDesigns.includes(mergedData.design)
    ) {
      mergedData.design = "columns";
    }
    if (!mergedData.siteName) {
      mergedData.siteName = "Brand";
    }
    if (
      !Array.isArray(mergedData.columns) ||
      (mergedData.columns as unknown[]).length === 0
    ) {
      mergedData.columns = [
        {
          title: "Product",
          links: [
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ],
        },
      ];
    }
    if (!mergedData.copyright) {
      mergedData.copyright = `© ${new Date().getFullYear()} ${mergedData.siteName || "Company"}. All rights reserved.`;
    }
  } else if (type === "header") {
    const validHeaderDesigns = [
      "logo-left",
      "centered",
      "classical",
      "minimalist",
      "comprehensive",
      "floating",
      "transparent",
      "glass-dock",
      "split-stacked",
      "mega-menu-grid",
      "side-drawer",
      "headline-ticker",
      "clean-transparent",
    ];
    if (
      typeof mergedData.design !== "string" ||
      !validHeaderDesigns.includes(mergedData.design)
    ) {
      mergedData.design = "logo-left";
    }
    if (!mergedData.siteName) {
      mergedData.siteName = "Brand";
    }
    if (
      !Array.isArray(mergedData.menu) ||
      (mergedData.menu as unknown[]).length === 0
    ) {
      mergedData.menu = [
        { label: "Home", href: "/" },
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Contact", href: "#contact" },
      ];
    }
    if (mergedData.sticky === undefined) {
      mergedData.sticky = false;
    }
  }

  // Ensure arrays like items, tiers, members, slides never become non-arrays
  for (const [key, val] of Object.entries(
    defaultData as Record<string, unknown>,
  )) {
    if (
      Array.isArray(val) &&
      (!Array.isArray(mergedData[key]) ||
        (mergedData[key] as unknown[]).length === 0)
    ) {
      if (!Array.isArray(mergedData[key])) {
        mergedData[key] = val;
      }
    }
  }

  const rawSettings = (raw.settings || {}) as Record<string, unknown>;
  const { background: _background, customColors: _customColors, ...otherSettings } = rawSettings;
  const cleanSettings: SectionSettings = {
    ...DEFAULT_SECTION_SETTINGS,
    ...(otherSettings as Partial<SectionSettings>),
  };

  const validBgs = ["default", "surface", "primary", "dark"];
  if (
    typeof rawSettings.background === "string" &&
    validBgs.includes(rawSettings.background)
  ) {
    cleanSettings.background =
      rawSettings.background as SectionSettings["background"];
  } else if (typeof rawSettings.background === "string") {
    // If user passed a custom color like "red" or "#ff0000" in background
    const hex = sanitizeHex(rawSettings.background);
    if (hex) {
      cleanSettings.customColors = {
        ...(cleanSettings.customColors || {}),
        background: hex,
      };
    }
    cleanSettings.background = "default";
  }

  if (
    typeof rawSettings.customColors === "object" &&
    rawSettings.customColors !== null
  ) {
    const rawCustom = rawSettings.customColors as Record<string, unknown>;
    const cleanCustom: Record<string, string> = {
      ...(cleanSettings.customColors || {}),
    };
    for (const key of [
      "background",
      "text",
      "primary",
      "muted",
      "border",
      "gradientFrom",
      "gradientTo",
    ] as const) {
      const hex = sanitizeHex(rawCustom[key]);
      if (hex) {
        cleanCustom[key] = hex;
      }
    }
    if (Object.keys(cleanCustom).length > 0) {
      cleanSettings.customColors = cleanCustom;
    }
  }

  if (typeof cleanSettings.hideOnMobile !== "boolean") {
    cleanSettings.hideOnMobile = DEFAULT_SECTION_SETTINGS.hideOnMobile;
  }

  return {
    id: raw.id || crypto.randomUUID(),
    type,
    hidden: Boolean(raw.hidden),
    settings: cleanSettings,
    data: mergedData,
  } as Section;
}

type NavPatch = NonNullable<AiSuggestion["navigationPatch"]>;
type HeaderLike = Pick<Partial<HeaderData>, "menu" | "cta">;
type FooterLike = Pick<Partial<FooterData>, "columns">;

/**
 * A navigation patch applied to header/footer data. Used for the draft's site-wide header and
 * footer and for the header/footer shown on the canvas, so the canvas commit that follows an
 * accepted suggestion carries the same menu instead of restoring the old one.
 */
function patchChrome<H extends HeaderLike, F extends FooterLike>(
  header: H,
  footer: F,
  patch: NavPatch,
  validRoutes: Set<string>,
): { header: H; footer: F } {
  const nextHeader = { ...header };
  const nextFooter = { ...footer };
  const rawMenu = patch.menu || patch.headerMenu;
  if (rawMenu && rawMenu.length > 0) {
    nextHeader.menu = reconcileHeaderMenu(rawMenu, validRoutes);
  }
  const cta = patch.cta ?? patch.headerCta;
  if (cta !== undefined) {
    nextHeader.cta = cta ? { label: cta.label, href: resolveInternalLink(cta.href, validRoutes) } : undefined;
  }
  if (patch.footerColumns && patch.footerColumns.length > 0) {
    nextFooter.columns = patch.footerColumns.map((col) => ({
      title: col.title,
      links: col.links.map((link) => ({ label: link.label, href: resolveInternalLink(link.href, validRoutes) })),
    }));
  }
  return { header: nextHeader, footer: nextFooter };
}

/** Sections the suggestion adds or modifies; unchanged ones (e.g. an SEO-only update) are left out. */
function changedSections(suggestion: AiSuggestion): AiSuggestion["after"] {
  const before = new Map(suggestion.before.map((section) => [section.id, JSON.stringify(section)]));
  return suggestion.after.filter((section) => before.get(section.id) !== JSON.stringify(section));
}

function formatRelativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const MAX_SESSIONS = 15;

const sessionsStorageKey = (websiteId: string | undefined) =>
  `ai_chat_sessions_${websiteId}`;

const sameContent = (a: Section[], b: Section[]) =>
  JSON.stringify(a) === JSON.stringify(b);

export default function AiDrawer() {
  const { aiOpen, setAiOpen, website, draft, page, editDraft, selectPage, notify, setAiBuilding, setAiLock } = useEditor();
  /** AI-built sites get the business-aware copilot (content, copy and SEO from the original brief). */
  const isAiSite = website.builderType === "AI";
  const dispatch = useBuilderPuck((state) => state.dispatch);
  const selectedIndex = useBuilderPuck(
    (state) => state.appState.ui.itemSelector?.index ?? null,
  );
  const selectedItem = useBuilderPuck((state) =>
    selectedIndex !== null
      ? (state.appState.data.content[selectedIndex] ?? null)
      : null,
  );
  const allItems = useBuilderPuck((state) => state.appState.data.content);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [planned, setPlanned] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);

  // Chat sessions history
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem(sessionsStorageKey(website?.id));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [originalCanvasContent, setOriginalCanvasContent] = useState<
    typeof allItems | null
  >(null);
  const [previewCanvasContent, setPreviewCanvasContent] = useState<
    typeof allItems | null
  >(null);
  const [previewingCreatedPageId, setPreviewingCreatedPageId] = useState<
    string | null
  >(null);
  const [previewMode, setPreviewMode] = useState<"ai" | "original">("ai");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [rollbackRequest, setRollbackRequest] = useState<ChatMessage | null>(
    null,
  );
  const [closeRequested, setCloseRequested] = useState(false);

  const hasLiveRollback = chatMessages.some(
    (m) => rollbackRemainingMs(m, Date.now()) > 0,
  );
  const now = useNow(hasLiveRollback);

  const promptId = useId();
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isAcceptedRef = useRef(false);
  const originalCanvasRef = useRef<typeof allItems | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    originalCanvasRef.current = originalCanvasContent;
  }, [originalCanvasContent]);

  useEffect(() => {
    if (aiOpen) {
      setTimeout(() => promptRef.current?.focus(), 50);
    }
  }, [aiOpen]);

  // Auto-scroll chat feed to bottom on new messages
  useEffect(() => {
    if (chatMessages.length > 0) {
      chatScrollRef.current?.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages, suggestion, loading]);

  // Clean up and restore original canvas ONLY if drawer is unmounted/closed without accepting
  useEffect(() => {
    return () => {
      setAiBuilding(null);
      if (!isAcceptedRef.current && originalCanvasRef.current) {
        dispatch({
          type: "setData",
          data: (previous) => ({
            ...previous,
            root: previous.root ?? { props: {} },
            content: originalCanvasRef.current!,
          }),
        });
      }
    };
  }, [dispatch, setAiBuilding]);

  const aiLock: AiLock = loading
    ? planned
      ? "building"
      : "thinking"
    : previewCanvasContent
      ? "reviewing"
      : null;
  useEffect(() => {
    setAiLock(aiLock);
  }, [aiLock, setAiLock]);
  // Declared after the restore-on-unmount effect so the canvas is restored before editing unlocks.
  useEffect(() => () => setAiLock(null), [setAiLock]);
  const aiBusy = aiLock === "thinking" || aiLock === "building";

  if (!isAiSite || !aiOpen) return null;

  const currentSection = selectedItem ? itemAsSection(selectedItem) : null;
  const isSectionScope = Boolean(currentSection);
  const activeType = currentSection?.type as SectionType | undefined;

  const VIBE_PRESETS = isAiSite
    ? isSectionScope
      ? [
          { label: "Rewrite for my customers", prompt: "Rewrite this section's copy so it speaks directly to my customers and what my business offers" },
          { label: "Shorter & punchier", prompt: "Make this section's text shorter and punchier while keeping the key message about my business" },
          { label: "Match my brand tone", prompt: "Rewrite this section in my brand's tone of voice" },
          { label: "Use my photos", prompt: "Use a fitting image from my media library in this section" },
        ]
      : [
          { label: "Improve this page's copy", prompt: "Rewrite the copy on this page to better sell my business, keeping the layout" },
          { label: "Improve SEO", prompt: "Write a better SEO title and description for this page based on my business" },
          { label: "What's missing?", prompt: "Review this page for my business and tell me what content is missing or could convert better" },
          { label: "Add a customer FAQ", prompt: "Add an FAQ section answering the questions my customers are most likely to ask" },
        ]
    : isSectionScope
    ? [
        {
          label: "Modern SaaS",
          prompt:
            "Transform into modern high-converting SaaS style with punchy copy and high-contrast CTA",
        },
        {
          label: "Cyber Glow",
          prompt:
            "Give this section a futuristic cyberpunk dark mode with vibrant neon glow and glassmorphism styling",
        },
        {
          label: "Clean Luxury",
          prompt:
            "Redesign with elegant luxury minimalist layout, elegant typography, and calm spacing",
        },
        {
          label: "Stock Image",
          prompt:
            "Add a full cover high-resolution background image with dark overlay and crisp white text",
        },
      ]
    : [
        {
          label: "Modern AI SaaS",
          prompt:
            "Generate a complete modern AI SaaS landing page with dark mode, high-converting hero, features, and pricing",
        },
        {
          label: "Luxury Agency",
          prompt:
            "Generate a high-end design agency landing page with proof, showcase carousel, and client testimonials",
        },
        {
          label: "Artisan Boutique",
          prompt:
            "Generate a warm boutique artisan bakery landing page with rich menus and contact cards",
        },
        {
          label: "Enterprise Platform",
          prompt:
            "Generate a high-trust enterprise B2B platform page with stats, security badges, and tiered plans",
        },
      ];

  // Sync chat sessions with backend on mount
  useEffect(() => {
    if (!website?.id) return;
    websitesApi
      .listAiSessions(website.id)
      .then((serverSessions) => {
        if (serverSessions && serverSessions.length > 0) {
          setSessions(serverSessions as ChatSession[]);
          try {
            localStorage.setItem(
              sessionsStorageKey(website.id),
              JSON.stringify(serverSessions),
            );
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Graceful fallback to localStorage
      });
  }, [website?.id]);

  /** Updates the chat feed and persists it as the active session. */
  const saveSession = (messages: ChatMessage[]) => {
    setChatMessages(messages);

    const sessionId = activeSessionId ?? crypto.randomUUID();
    if (!activeSessionId) setActiveSessionId(sessionId);

    const firstPrompt = messages[0]?.content ?? "";
    const session: ChatSession = {
      id: sessionId,
      title:
        firstPrompt.length > 40 ? `${firstPrompt.slice(0, 40)}…` : firstPrompt,
      timestamp: Date.now(),
      messages: pruneExpiredRollbacks(messages, Date.now()),
    };

    setSessions((prev) => {
      const updated = [
        session,
        ...prev.filter((s) => s.id !== sessionId),
      ].slice(0, MAX_SESSIONS);
      try {
        localStorage.setItem(
          sessionsStorageKey(website?.id),
          JSON.stringify(updated),
        );
      } catch {
        // Storage full or unavailable; the in-memory session still works.
      }
      return updated;
    });

    if (website?.id) {
      websitesApi
        .saveAiSession(website.id, {
          id: sessionId,
          title: session.title,
          messages: session.messages,
        })
        .catch(() => {
          // background sync fails silently
        });
    }
  };

  const handleNewChat = () => {
    if (originalCanvasContent) {
      handleReject();
    }
    setChatMessages([]);
    setActiveSessionId(null);
    setActiveMessageId(null);
    setPrompt("");
    setSuggestion(null);
    notify("Started a fresh AI conversation session.", "success");
  };

  const handleClearHistory = () => {
    setSessions([]);
    try {
      localStorage.removeItem(sessionsStorageKey(website?.id));
    } catch {
      // ignore
    }
    if (website?.id) {
      websitesApi.clearAiSessions(website.id).catch(() => {});
    }
  };

  const handleRestoreSession = (session: ChatSession) => {
    setChatMessages(pruneExpiredRollbacks(session.messages, Date.now()));
    setActiveSessionId(session.id);
    setActiveMessageId(null);
    setSuggestion(null);
  };

  /** Puts empty blocks where the AI will add sections and scrolls to the first change. */
  const showPlannedLayout = (
    layout: AiLayoutSlot[],
    baseline: typeof allItems,
  ) => {
    setPlanned(true);
    const existing = new Map(baseline.map((item) => [item.props.id, item]));
    const items = layout.flatMap((slot) => {
      if (slot.status !== "pending") return existing.get(slot.id) ?? [];
      return slot.type in SECTION_DEFINITIONS
        ? aiPlaceholderItem(slot.id, slot.type as SectionType)
        : [];
    });

    dispatch({
      type: "setData",
      data: (previous) => ({
        ...previous,
        root: previous.root ?? { props: {} },
        content: items,
      }),
    });

    const focus = layout.find((slot) => slot.status !== "existing");
    const focusIdx = focus
      ? items.findIndex((item) => item.props.id === focus.id)
      : -1;
    if (!focus || focusIdx === -1) return;

    const label = focus.type.toUpperCase();
    setAiBuilding({
      active: true,
      step:
        focus.status === "pending"
          ? `Building ${label} section...`
          : `Updating ${label} layout & typography...`,
      scope: focus.status === "pending" ? "page" : "section",
      sectionType: focus.type,
      sectionIndex: focusIdx,
      totalSections: items.length,
      targetId: focus.id,
      progressPercent: 50,
      pointerY: 50,
    });
    setTimeout(() => {
      scrollCanvasToSection({
        sectionIndex: focusIdx,
        sectionType: focus.type,
        targetId: focus.id,
      });
    }, 60);
  };

  const handleGenerate = async (customPrompt?: string) => {
    const textToRun = (
      typeof customPrompt === "string" ? customPrompt : prompt
    ).trim();
    if (!textToRun || loading) return;

    // Immediately clear input box
    setPrompt("");

    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add user message to thread
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: textToRun,
      timestamp: nowTime,
    };

    const nextMessages = [...chatMessages, userMessage];
    setChatMessages(nextMessages);
    setLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Regenerating during review must start from the original page, not the unapplied preview.
    const baseline = structuredClone(originalCanvasContent ?? allItems);
    setOriginalCanvasContent(baseline);

    try {
      const historyPayload = toHistoryPayload(nextMessages);

      const result = await websitesApi.generateAiSuggestionStream(
        website.id,
        {
          prompt: textToRun,
          scope: isSectionScope ? "section" : "page",
          sectionId: currentSection?.id,
          currentSection: currentSection ?? undefined,
          currentSections: baseline.map(itemAsSection),
          pageId: page.id,
          history: historyPayload,
        },
        (layout) => showPlannedLayout(layout, baseline),
        abortController.signal,
      );

      const target = result.target;
      const hasClarification = Boolean(result.clarification);
      const isChatOnly = target.scope === "chat" || hasClarification;
      const chatReply =
        isChatOnly ? result.clarification?.question || result.chatReply || result.summary : null;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: chatReply ?? result.summary,
        timestamp: nowTime,
        suggestion: !isChatOnly ? result : null,
        chatReply,
        clarification: result.clarification ?? null,
        ...(!isChatOnly ? { status: "pending" as const } : {}),
      };

      saveSession([...nextMessages, assistantMessage]);
      setActiveMessageId(!isChatOnly ? assistantMessage.id : null);

      if (isChatOnly) {
        setAiBuilding(null);
        setSuggestion(null);
        setOriginalCanvasContent(null);
        setPreviewCanvasContent(null);
        return;
      }

      // The server returns the final section list; the preview renders it as-is.
      let nextItems: typeof allItems;

      if (target.scope === "section") {
        const updated = result.after[0]
          ? normalizeSection(result.after[0] as Section)
          : null;
        nextItems = updated
          ? baseline.map((it) =>
              it.props.id === updated.id ? sectionToItem(updated) : it,
            )
          : baseline;
        const targetIdx = nextItems.findIndex(
          (it) => it.props.id === updated?.id,
        );

        if (updated && targetIdx !== -1) {
          setAiBuilding({
            active: true,
            step: `Updating ${updated.type.toUpperCase()} layout & typography...`,
            scope: "section",
            sectionType: updated.type,
            sectionIndex: targetIdx,
            targetId: updated.id,
            progressPercent: 70,
            pointerY: 45,
          });
          setTimeout(() => {
            scrollCanvasToSection({
              sectionIndex: targetIdx,
              sectionType: updated.type,
              targetId: updated.id,
            });
          }, 60);
        }
      } else if (target.scope === "site") {
        const hasAfter = result.after.length > 0;
        const firstCreated = result.createdPages?.[0];

        if (!hasAfter && firstCreated && firstCreated.sections.length > 0) {
          nextItems = withSiteChrome(
            firstCreated.sections.map((s) => normalizeSection(s as Section)),
            draft,
          ).map(sectionToItem);
          setPreviewingCreatedPageId(firstCreated.id);
        } else {
          nextItems = hasAfter
            ? result.after.map((s) =>
                sectionToItem(normalizeSection(s as Section)),
              )
            : baseline;
          setPreviewingCreatedPageId(null);
        }

        setAiBuilding({
          active: true,
          step: "Reviewing multi-page site structure, navigation & pages...",
          scope: "page",
          progressPercent: 80,
          pointerY: 50,
        });
      } else if (!target.rebuild) {
        setPreviewingCreatedPageId(null);
        nextItems = result.after.map((s) =>
          sectionToItem(normalizeSection(s as Section)),
        );
        const focusIdx = nextItems.findIndex(
          (it) => it.props.id === target.focusSectionId,
        );

        if (focusIdx !== -1) {
          const focused = itemAsSection(nextItems[focusIdx]);
          setTimeout(() => {
            scrollCanvasToSection({
              sectionIndex: focusIdx,
              sectionType: focused.type,
              targetId: focused.id,
            });
          }, 60);
        }
      } else {
        setPreviewingCreatedPageId(null);
        nextItems = result.after.map((s) =>
          sectionToItem(normalizeSection(s as Section)),
        );

        // Progressive section-by-section construction on canvas
        for (let i = 0; i < nextItems.length; i++) {
          const currentPartial = nextItems.slice(0, i + 1);
          const sec = itemAsSection(nextItems[i]);
          const pct = Math.round(20 + ((i + 1) / nextItems.length) * 75);
          const posY = Math.min(
            92,
            Math.max(12, Math.round(15 + ((i + 1) / nextItems.length) * 75)),
          );

          dispatch({
            type: "setData",
            data: (previous) => ({
              ...previous,
              root: previous.root ?? { props: {} },
              content: currentPartial,
            }),
          });

          setAiBuilding({
            active: true,
            step: `Building ${sec.type.toUpperCase()} section...`,
            scope: "page",
            sectionIndex: i,
            totalSections: nextItems.length,
            sectionType: sec.type,
            targetId: sec.id,
            progressPercent: pct,
            pointerY: posY,
          });

          setTimeout(() => {
            scrollCanvasToSection({
              sectionIndex: i,
              sectionType: sec.type,
              targetId: sec.id,
            });
          }, 40);

          await new Promise((r) => setTimeout(r, 320));
        }
      }

      setPreviewCanvasContent(nextItems);
      setPreviewMode("ai");
      setSuggestion(result);

      // Final styling polish pass
      setAiBuilding({
        active: true,
        step: "Polishing responsive tokens & theme aesthetics...",
        scope: isSectionScope ? "section" : "page",
        progressPercent: 100,
        pointerY: 85,
      });

      // Immediately render live preview onto canvas!
      dispatch({
        type: "setData",
        data: (previous) => ({
          ...previous,
          root: previous.root ?? { props: {} },
          content: nextItems,
        }),
      });

      await new Promise((r) => setTimeout(r, 300));

      setAiBuilding({
        active: false,
        step: "Completed",
        progressPercent: 100,
      });
    } catch (err: unknown) {
      setAiBuilding(null);
      dispatch({
        type: "setData",
        data: (previous) => ({
          ...previous,
          root: previous.root ?? { props: {} },
          content: baseline,
        }),
      });
      saveSession(
        nextMessages.map((m) => (m.id === userMessage.id ? { ...m, failed: true } : m)),
      );
      if (
        abortController.signal.aborted ||
        (err as Error)?.name === "AbortError" ||
        (err as Error)?.message?.toLowerCase().includes("cancel")
      ) {
        notify("AI generation stopped.");
      } else {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to generate AI changes.";
        notify(errorMsg, "danger");
      }
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
      setPlanned(false);
    }
  };

  const handleTogglePreview = (mode: "ai" | "original") => {
    setPreviewMode(mode);
    const targetItems =
      mode === "ai" ? previewCanvasContent : originalCanvasContent;
    if (targetItems) {
      dispatch({
        type: "setData",
        data: (previous) => ({
          ...previous,
          root: previous.root ?? { props: {} },
          content: targetItems,
        }),
      });
    }
  };

  const handleAccept = () => {
    if (
      !previewCanvasContent &&
      !suggestion?.createdPages?.length &&
      !suggestion?.navigationPatch &&
      !suggestion?.updatedPages?.length
    ) {
      return;
    }

    isAcceptedRef.current = true;

    // Commit preview content as the permanent canvas state for the current page
    if (previewCanvasContent && !previewingCreatedPageId) {
      dispatch({
        type: "setData",
        data: (previous) => ({
          ...previous,
          root: previous.root ?? { props: {} },
          content: previewCanvasContent,
        }),
      });
    }

    const seo = suggestion?.seo;
    const seoPage = seo ? draft.pages.find((candidate) => candidate.id === seo.pageId) : undefined;

    // Full draft rollback snapshot for cross-page changes
    const draftSnapshot = {
      pages: structuredClone(draft.pages),
      header: structuredClone(draft.header),
      footer: structuredClone(draft.footer),
      theme: structuredClone(draft.theme),
    };

    let firstCreatedPageId: string | null = null;

    editDraft((current) => {
      let nextPages = [...current.pages];
      const validRoutes = getKnownRoutes(nextPages, suggestion?.createdPages ?? []);
      let nextHeader = { ...current.header };
      let nextFooter = { ...current.footer };
      const bodyOnly = (sections: readonly Section[]) => sections.filter((s) => !isChromeSection(s));

      // Update current open page's sections; its header/footer stay the site-wide, own or none it had
      if (previewCanvasContent && !previewingCreatedPageId) {
        const sanitizedSections = previewCanvasContent
          .map(itemAsSection)
          .map((s) => sanitizeSectionLinks(normalizeSection(s), validRoutes));
        const split = splitSiteChrome(
          sanitizedSections,
          current,
          current.pages.find((p) => p.id === page.id)?.sections,
        );
        nextHeader = split.header;
        nextFooter = split.footer;
        nextPages = nextPages.map((p) =>
          p.id === page.id ? { ...p, sections: split.body } : p,
        );
      }

      // Apply SEO update if present
      if (seo) {
        nextPages = nextPages.map((p) =>
          p.id === seo.pageId
            ? { ...p, seoTitle: seo.seoTitle || null, seoDescription: seo.seoDescription || null }
            : p,
        );
      }

      // Handle newly created pages
      if (suggestion?.createdPages && suggestion.createdPages.length > 0) {
        const uniqueCreated = ensureUniqueSlugs(nextPages, suggestion.createdPages);
        for (const cp of uniqueCreated) {
          const sanitizedSections = bodyOnly(
            cp.sections.map((s) => sanitizeSectionLinks(normalizeSection(s as Section), validRoutes)),
          );
          nextPages.push({
            id: cp.id,
            name: cp.name,
            slug: cp.slug,
            pageType: (cp.pageType as PageType) || "CUSTOM",
            visible: true,
            showInNav: cp.showInNav ?? true,
            seoTitle: cp.seoTitle ?? null,
            seoDescription: cp.seoDescription ?? null,
            seoKeywords: [],
            sections: sanitizedSections,
          });
          if (!firstCreatedPageId) {
            firstCreatedPageId = cp.id;
          }
        }
      }

      // Handle updated pages
      if (suggestion?.updatedPages && suggestion.updatedPages.length > 0) {
        for (const up of suggestion.updatedPages) {
          const targetId = up.pageId || up.id;
          nextPages = nextPages.map((p) => {
            if (
              (targetId && p.id === targetId) ||
              (up.slug && p.slug === up.slug) ||
              (up.name && p.name.toLowerCase() === up.name.toLowerCase())
            ) {
              return {
                ...p,
                name: up.name || p.name,
                slug: up.slug ? normalizeSlug(up.slug) : p.slug,
                showInNav: up.showInNav !== undefined ? up.showInNav : p.showInNav,
                seoTitle: up.seoTitle !== undefined ? up.seoTitle : p.seoTitle,
                seoDescription: up.seoDescription !== undefined ? up.seoDescription : p.seoDescription,
                sections:
                  up.sections && up.sections.length > 0
                    ? bodyOnly(
                        up.sections.map((s) => sanitizeSectionLinks(normalizeSection(s as Section), validRoutes)),
                      )
                    : p.sections,
              };
            }
            return p;
          });
        }
      }

      // Handle deleted pages (never delete home page)
      if (suggestion?.deletedPageIds && suggestion.deletedPageIds.length > 0) {
        const deleteSet = new Set(suggestion.deletedPageIds);
        nextPages = nextPages.filter((p) => !deleteSet.has(p.id) || p.slug === "/");
      }

      // Handle navigation patch (the header is site-wide, so this reaches every page)
      if (suggestion?.navigationPatch) {
        ({ header: nextHeader, footer: nextFooter } = patchChrome(nextHeader, nextFooter, suggestion.navigationPatch, validRoutes));
      }

      // Handle theme patch
      let nextTheme = { ...current.theme };
      if (suggestion?.themePatch) {
        if (suggestion.themePatch.colors) {
          nextTheme.colors = { ...nextTheme.colors, ...suggestion.themePatch.colors };
        }
        if (suggestion.themePatch.fonts) {
          nextTheme.fonts = {
            heading:
              (suggestion.themePatch.fonts.heading as typeof nextTheme.fonts.heading) ||
              nextTheme.fonts.heading,
            body:
              (suggestion.themePatch.fonts.body as typeof nextTheme.fonts.body) ||
              nextTheme.fonts.body,
          };
        }
      }

      return {
        ...current,
        pages: nextPages,
        header: nextHeader,
        footer: nextFooter,
        theme: nextTheme,
      };
    });

    // The canvas header/footer get the same menu: once editing unlocks, the canvas is committed
    // to the draft, and a stale header there would put the old menu back.
    if (suggestion?.navigationPatch) {
      const patch = suggestion.navigationPatch;
      const validRoutes = getKnownRoutes(draft.pages, suggestion.createdPages ?? []);
      dispatch({
        type: "setData",
        data: (previous) => ({
          ...previous,
          content: ((previous.content ?? []) as BuilderItem[]).map((item) => {
            const section = itemAsSection(item);
            if (section.type === "header") {
              const { header } = patchChrome(section.data as HeaderData, {}, patch, validRoutes);
              return sectionToItem({ ...section, data: header } as Section);
            }
            if (section.type === "footer") {
              const { footer } = patchChrome({}, section.data as FooterData, patch, validRoutes);
              return sectionToItem({ ...section, data: footer } as Section);
            }
            return item;
          }),
        }),
      });
    }

    if (activeMessageId) {
      const rollback = {
        before: (originalCanvasContent ?? allItems).map(itemAsSection),
        after: (previewCanvasContent ?? allItems).map(itemAsSection),
        seo: seoPage
          ? { pageId: seoPage.id, seoTitle: seoPage.seoTitle, seoDescription: seoPage.seoDescription }
          : undefined,
        draft: draftSnapshot,
      };
      // Rollback restores a whole-canvas snapshot, so only the latest accepted change may use it.
      saveSession(
        chatMessages.map((m) =>
          m.id === activeMessageId
            ? { ...m, status: "accepted", acceptedAt: Date.now(), rollback }
            : m.rollback
              ? { ...m, rollback: undefined }
              : m,
        ),
      );
    }

    if (suggestion?.createdPages && suggestion.createdPages.length > 0) {
      notify(`AI changes accepted! Created ${suggestion.createdPages.length} new page(s).`, "success");
      if (firstCreatedPageId) {
        selectPage(firstCreatedPageId);
      }
    } else {
      notify("AI changes accepted and saved!", "success");
    }

    setPreviewingCreatedPageId(null);
    setActiveMessageId(null);
    setSuggestion(null);
    setOriginalCanvasContent(null);
    setPreviewCanvasContent(null);
    setTimeout(() => {
      isAcceptedRef.current = false;
    }, 150);
  };

  const handleReject = () => {
    isAcceptedRef.current = true;
    setPreviewingCreatedPageId(null);
    if (originalCanvasContent) {
      // Revert canvas to original
      dispatch({
        type: "setData",
        data: (previous) => ({
          ...previous,
          root: previous.root ?? { props: {} },
          content: originalCanvasContent,
        }),
      });
      notify("AI changes discarded — restored original canvas.");
    }
    if (activeMessageId) {
      saveSession(
        chatMessages.map((m) =>
          m.id === activeMessageId ? { ...m, status: "rejected" } : m,
        ),
      );
    }
    setActiveMessageId(null);
    setSuggestion(null);
    setOriginalCanvasContent(null);
    setPreviewCanvasContent(null);
    setTimeout(() => {
      isAcceptedRef.current = false;
    }, 150);
  };

  const applyRollback = (message: ChatMessage) => {
    setRollbackRequest(null);
    if (!message.rollback || rollbackRemainingMs(message, Date.now()) === 0) {
      notify("The rollback window for this change has expired.", "danger");
      return;
    }

    if (message.rollback.draft) {
      const restored = message.rollback.draft;
      editDraft(() => restored);
      const currentPageRestored =
        restored.pages.find((p) => p.id === page.id) ?? homePage(restored.pages);
      if (currentPageRestored) {
        dispatch({
          type: "setData",
          data: (previous) => ({
            ...previous,
            root: previous.root ?? { props: {} },
            content: withSiteChrome(currentPageRestored.sections, restored).map(sectionToItem),
          }),
        });
      }
    } else {
      const before = message.rollback.before;
      dispatch({
        type: "setData",
        data: (previous) => ({
          ...previous,
          root: previous.root ?? { props: {} },
          content: before.map(sectionToItem),
        }),
      });
      const previousSeo = message.rollback.seo;
      if (previousSeo) {
        editDraft((current) =>
          updatePageMeta(current, previousSeo.pageId, {
            seoTitle: previousSeo.seoTitle,
            seoDescription: previousSeo.seoDescription,
          }),
        );
      }
    }

    saveSession(
      chatMessages.map((m) =>
        m.id === message.id
          ? { ...m, status: "rolled_back", rollback: undefined }
          : m,
      ),
    );
    notify("Rolled back to the version before this AI change.", "success");
  };

  /** Asks first when the canvas was edited after accepting, since rollback would discard those edits. */
  const handleRollback = (message: ChatMessage) => {
    if (!message.rollback) return;
    if (aiLock) {
      notify(
        "Apply or discard the current AI changes before rolling back.",
        "danger",
      );
      return;
    }
    if (sameContent(allItems.map(itemAsSection), message.rollback.after)) {
      applyRollback(message);
    } else {
      setRollbackRequest(message);
    }
  };

  /** Closing discards an unapplied preview, so ask first; nothing can close mid-generation. */
  const requestClose = () => {
    if (aiBusy) return;
    if (aiLock === "reviewing") {
      setCloseRequested(true);
      return;
    }
    setAiOpen(false);
  };

  const isNewChat = chatMessages.length === 0;

  return (
    <aside
      aria-label="AI Copilot"
      onKeyDown={(event) => event.key === "Escape" && requestClose()}
      className="z-(--z-ed-panel) flex h-full min-h-0 w-96 shrink-0 flex-col border-l border-ed-border bg-ed-panel overflow-hidden transition-all duration-150 shadow-sm select-none"
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-ed-border px-3.5 py-2.5 bg-ed-subtle/40 shrink-0">
        <div className="flex items-center gap-2">
          <AiSparklesIcon className="size-4" variant="glossy" glow />
          <h2 className="text-ed-xs font-bold text-ed-text tracking-tight">
            AI Copilot
          </h2>
        </div>

        <div className="flex items-center gap-0.5">
          <ToolButton
            label="New chat thread (Reset context)"
            size="sm"
            disabled={aiBusy}
            onClick={handleNewChat}
          >
            <MessageSquarePlus className="size-3.5" aria-hidden />
          </ToolButton>
          <ToolButton
            label="Close AI assistant"
            size="sm"
            disabled={aiBusy}
            onClick={requestClose}
          >
            <X className="size-3.5" aria-hidden />
          </ToolButton>
        </div>
      </header>

      {/* Main Drawer Scroll Area */}
      <div
        ref={chatScrollRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-3.5"
      >
        {/* Sleek Mode Indicator Bar */}
        <div className="flex items-center justify-between px-1 text-ed-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            <span className="font-semibold text-ed-text text-[11.5px]">
              {isSectionScope
                ? `Single Section: ${activeType ? SECTION_DEFINITIONS[activeType]?.label || activeType : "Selected"}`
                : "Whole Page (Smart Mode)"}
            </span>
          </div>

          {isSectionScope && (
            <button
              type="button"
              onClick={() => selectSection(dispatch, null)}
              className="text-ed-2xs font-medium text-brand hover:underline cursor-pointer"
            >
              Deselect (Page Mode)
            </button>
          )}
        </div>

        {/* 1-Click Style & Vibe Compact Chips (ONLY on fresh / new chat) */}
        {isNewChat && (
          <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-200">
            {VIBE_PRESETS.map((vibe) => (
              <button
                key={vibe.label}
                type="button"
                disabled={loading}
                onClick={() => handleGenerate(vibe.prompt)}
                className="flex items-center gap-1.5 rounded-xl border border-ed-border/70 bg-ed-subtle/50 px-2.5 py-1.5 text-left text-ed-2xs text-ed-text hover:border-brand/40 hover:bg-blue-500/5 hover:text-brand transition-all group cursor-pointer"
              >
                <span className="truncate font-medium">{vibe.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Centered Prompt Box (ONLY on fresh / new chat) */}
        {isNewChat && (
          <div className="flex flex-col rounded-2xl border border-ed-border bg-ed-panel p-3 shadow-xs focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all animate-in fade-in duration-200">
            <textarea
              id={promptId}
              ref={promptRef}
              value={prompt}
              maxLength={2000}
              rows={3}
              disabled={aiLock !== null}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder={
                isAiSite
                  ? isSectionScope
                    ? `Rewrite, update or restyle this ${activeType || "section"} for your business...`
                    : "Ask about your site, rewrite this page's copy, improve SEO, add a section..."
                  : isSectionScope
                  ? `Ask anything, describe changes to this ${activeType || "section"}...`
                  : "Ask anything, describe your website goal..."
              }
              className="w-full resize-none bg-transparent text-ed-xs text-ed-text placeholder:text-ed-muted/60 focus:outline-none leading-relaxed"
            />

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-ed-border/40 pt-2 text-ed-xs">
              <ScopeSelect
                items={allItems}
                selectedIndex={selectedIndex}
                disabled={aiLock !== null}
                onSelect={(index) => selectSection(dispatch, index)}
              />

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-ed-faint font-mono">
                  {prompt.length}/2000
                </span>
                <button
                  type="button"
                  disabled={!prompt.trim() || aiLock !== null}
                  onClick={() => handleGenerate()}
                  className="grid size-7 place-items-center rounded-full bg-brand text-white shadow-xs hover:bg-brand-hover active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE CONVERSATION CHAT FEED (WhatsApp / ChatGPT conversational bubbles) */}
        {!isNewChat && (
          <div className="flex flex-col gap-3 py-1 animate-in fade-in duration-200">
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 text-ed-xs leading-relaxed shadow-xs transition-all ${
                      isUser
                        ? "bg-brand text-white rounded-tr-xs"
                        : "bg-ed-subtle/80 border border-ed-border/70 text-ed-text rounded-tl-xs"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1.5 mb-1 text-ed-2xs font-bold text-brand">
                        <AiSparklesIcon className="size-3.5" variant="glossy" />
                        <span>AI Copilot</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Clarification Selectable Options & Custom Input */}
                    {msg.clarification && (
                      <div className="mt-2.5 flex flex-col gap-2 rounded-xl border border-brand/25 bg-brand/5 p-2.5">
                        <div className="flex items-center gap-1.5 text-ed-2xs font-bold text-brand">
                          <HelpCircle className="size-3.5 shrink-0" />
                          <span>Choose an option to clarify:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.clarification.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleGenerate(opt)}
                              disabled={loading}
                              className="group inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-ed-panel px-2.5 py-1 text-ed-xs font-semibold text-ed-text shadow-2xs hover:border-brand hover:bg-brand hover:text-white active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                            >
                              <span>{opt}</span>
                              <ArrowRight className="size-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                        {msg.clarification.allowCustomInput !== false && (
                          <span className="text-[10px] text-ed-muted">
                            Or reply with custom requirements in the prompt box below.
                          </span>
                        )}
                      </div>
                    )}

                    <span
                      className={`mt-1 block text-[9.5px] font-mono ${
                        isUser
                          ? "text-blue-100/70 text-right"
                          : "text-ed-muted/70 text-left"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Attached Live Canvas Preview Capsule under latest active suggestion */}
                  {!isUser && msg.id !== activeMessageId && msg.status && (
                    <SuggestionStatusCard
                      message={msg}
                      remainingMs={rollbackRemainingMs(msg, now)}
                      onRollback={() => handleRollback(msg)}
                      onSelectPage={(pageId) => selectPage(pageId)}
                    />
                  )}

                  {!isUser && msg.id === activeMessageId && suggestion && (
                    <section
                      aria-label="Suggested change"
                      className="w-full flex flex-col gap-2.5 rounded-2xl border border-brand/30 bg-ed-panel p-3 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-200 mt-1"
                    >
                      {/* Live Indicator Header & Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                          </span>
                          <span className="text-ed-2xs font-bold tracking-tight text-ed-text">
                            Live Canvas Preview
                          </span>
                        </div>

                        {/* Minimal Segmented Toggle */}
                        <div className="flex items-center rounded-lg bg-ed-subtle p-0.5 border border-ed-border/70 text-[10.5px]">
                          <button
                            type="button"
                            onClick={() => handleTogglePreview("ai")}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                              previewMode === "ai"
                                ? "bg-brand text-white shadow-xs"
                                : "text-ed-muted hover:text-ed-text"
                            }`}
                          >
                            <Eye className="size-3" />
                            AI
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePreview("original")}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                              previewMode === "original"
                                ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 shadow-xs"
                                : "text-ed-muted hover:text-ed-text"
                            }`}
                          >
                            <Undo2 className="size-3" />
                            Original
                          </button>
                        </div>
                      </div>

                      {/* Affected Section Tags */}
                      {suggestion.seo && (
                        <div className="flex flex-col gap-0.5 rounded-xl border border-ed-border/70 bg-ed-subtle/50 px-2.5 py-2 text-[10.5px]">
                          <span className="font-bold text-ed-text">SEO for this page</span>
                          <span className="text-ed-text">{suggestion.seo.seoTitle}</span>
                          <span className="text-ed-muted">{suggestion.seo.seoDescription}</span>
                        </div>
                      )}

                      {/* Multi-page / Site Impact Summary */}
                      {suggestion.createdPages && suggestion.createdPages.length > 0 && (
                        <div className="flex flex-col gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                              <FilePlus className="size-3.5" />
                              <span>Pages to be Created ({suggestion.createdPages.length})</span>
                            </div>
                            {previewingCreatedPageId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewingCreatedPageId(null);
                                  const items =
                                    suggestion.after && suggestion.after.length > 0
                                      ? suggestion.after.map((s) =>
                                          sectionToItem(normalizeSection(s as Section)),
                                        )
                                      : originalCanvasContent ?? [];
                                  setPreviewCanvasContent(items);
                                  dispatch({
                                    type: "setData",
                                    data: (previous) => ({
                                      ...previous,
                                      root: previous.root ?? { props: {} },
                                      content: items,
                                    }),
                                  });
                                }}
                                className="text-[10px] font-semibold text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-400 cursor-pointer"
                              >
                                View {page.name}
                              </button>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 pl-1">
                            {suggestion.createdPages.map((cp) => {
                              const isPreviewing = previewingCreatedPageId === cp.id;
                              return (
                                <button
                                  key={cp.id}
                                  type="button"
                                  onClick={() => {
                                    setPreviewingCreatedPageId(cp.id);
                                    const items = withSiteChrome(
                                      cp.sections.map((s) => normalizeSection(s as Section)),
                                      draft,
                                    ).map(sectionToItem);
                                    setPreviewCanvasContent(items);
                                    setPreviewMode("ai");
                                    dispatch({
                                      type: "setData",
                                      data: (previous) => ({
                                        ...previous,
                                        root: previous.root ?? { props: {} },
                                        content: items,
                                      }),
                                    });
                                  }}
                                  className={`flex items-center justify-between rounded-lg px-2 py-1 text-left transition-colors cursor-pointer ${
                                    isPreviewing
                                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/40"
                                      : "hover:bg-emerald-500/10 text-ed-text"
                                  }`}
                                  title="Click to preview this page on canvas"
                                >
                                  <span className="font-medium">
                                    {cp.name} <code className="text-[10px] text-ed-muted font-mono">{cp.slug}</code>
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[10px] text-ed-muted">
                                    <span>{cp.sections.length} sections</span>
                                    {isPreviewing && (
                                      <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                        previewing
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {suggestion.updatedPages && suggestion.updatedPages.length > 0 && (
                        <div className="flex flex-col gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/5 p-2.5 text-[11px]">
                          <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                            <FileEdit className="size-3.5" />
                            <span>Other Pages Modified ({suggestion.updatedPages.length})</span>
                          </div>
                          <div className="flex flex-col gap-1 pl-1 text-ed-text">
                            {suggestion.updatedPages.map((up, i) => (
                              <span key={up.pageId || up.id || i} className="font-medium">
                                {up.name || up.slug || "Existing page"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestion.deletedPageIds && suggestion.deletedPageIds.length > 0 && (
                        <div className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/5 p-2 text-[11px] text-red-600 dark:text-red-400 font-bold">
                          <Trash2 className="size-3.5" />
                          <span>{suggestion.deletedPageIds.length} page(s) marked for removal</span>
                        </div>
                      )}

                      {suggestion.navigationPatch && (
                        <div className="flex flex-col gap-1 rounded-xl border border-purple-500/30 bg-purple-500/5 p-2.5 text-[11px]">
                          <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                            <Compass className="size-3.5" />
                            <span>Navigation & Menus</span>
                          </div>
                          {(suggestion.navigationPatch.menu || suggestion.navigationPatch.headerMenu) && (
                            <span className="text-ed-muted text-[10.5px]">
                              Menu links: {(suggestion.navigationPatch.menu || suggestion.navigationPatch.headerMenu)?.map((m) => m.label).join(", ")}
                            </span>
                          )}
                          {(suggestion.navigationPatch.cta || suggestion.navigationPatch.headerCta) && (
                            <span className="text-ed-muted text-[10.5px]">
                              CTA button: "{(suggestion.navigationPatch.cta || suggestion.navigationPatch.headerCta)?.label}"
                            </span>
                          )}
                        </div>
                      )}

                      {suggestion.themePatch && (
                        <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                          <Palette className="size-3.5" />
                          <span>Theme styling will be updated</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {changedSections(suggestion).map((sec, sIdx) => (
                          <span
                            key={sec.id || sIdx}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand"
                          >
                            <span className="size-1 rounded-full bg-brand" />
                            {SECTION_DEFINITIONS[sec.type as SectionType]
                              ?.label || sec.type}
                          </span>
                        ))}
                      </div>

                      {/* Primary Actions: Accept / Reject / Retry */}
                      <div className="flex flex-col gap-1.5 pt-0.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAccept}
                            className="flex h-8.5 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-ed-xs font-bold text-white shadow-sm hover:bg-emerald-500 active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <Check className="size-3.5" />
                            Accept Changes
                          </button>

                          <button
                            type="button"
                            onClick={handleReject}
                            className="flex h-8.5 px-3 items-center justify-center gap-1.5 rounded-xl border border-ed-border bg-ed-subtle text-ed-xs font-medium text-ed-text hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <X className="size-3" />
                            Reject
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-0.5 text-[10.5px] text-ed-muted">
                          <button
                            type="button"
                            onClick={() => handleGenerate(msg.suggestion?.prompt || msg.content)}
                            disabled={loading}
                            className="flex items-center gap-1 hover:text-brand transition-colors cursor-pointer"
                          >
                            <RotateCcw className="size-3" />
                            Regenerate
                          </button>
                          <span className="text-[9.5px] text-ed-muted/80">
                            Click Accept to keep on canvas
                          </span>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              );
            })}

            {/* Loading Thinking Indicator */}
            {loading && (
              <div className="flex items-start gap-2 max-w-[85%] rounded-2xl bg-ed-subtle/80 border border-ed-border/70 p-3 text-ed-xs text-ed-text rounded-tl-xs shadow-xs animate-pulse">
                <AiSparklesIcon
                  className="size-3.5 animate-spin text-brand"
                  variant="glossy"
                />
                <span className="text-ed-muted font-medium">
                  {planned ? "Building on canvas..." : "Thinking..."}
                </span>
              </div>
            )}
          </div>
        )}

        {/* SESSIONS HISTORY (ONLY rendered on fresh / new chat screen) */}
        {isNewChat && sessions.length > 0 && (
          <div className="flex flex-col gap-1 pt-1 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-ed-faint">
                Recent Sessions
              </span>
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-[10.5px] text-ed-muted hover:text-brand transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <div className="flex flex-col gap-0.5">
              {sessions.slice(0, 8).map((sess) => (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => handleRestoreSession(sess)}
                  className="group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left hover:bg-ed-subtle/80 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate text-ed-xs text-ed-text/90 group-hover:text-brand font-normal group-hover:font-medium">
                      {sess.title}
                    </span>
                    <span className="rounded bg-ed-subtle px-1 py-0.2 text-[9.5px] font-mono text-ed-muted shrink-0">
                      {sess.messages.length} msg
                      {sess.messages.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="shrink-0 text-ed-2xs text-ed-muted/70 font-mono ml-2">
                    {formatRelativeTime(sess.timestamp)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Docked Input Area (Shown when conversation is active) */}
      {!isNewChat && (
        <div className="p-3 border-t border-ed-border shrink-0 bg-ed-panel flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-col rounded-2xl border border-ed-border bg-ed-subtle/30 p-2.5 shadow-xs focus-within:border-brand focus-within:bg-ed-panel focus-within:ring-2 focus-within:ring-brand/20 transition-all">
            <textarea
              id={promptId}
              ref={promptRef}
              value={prompt}
              maxLength={2000}
              rows={2}
              disabled={aiLock !== null}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder={
                aiLock === "reviewing"
                  ? "Accept or reject the AI changes to continue..."
                  : isSectionScope
                    ? `Describe changes to ${activeType || "section"}...`
                    : isAiSite
                      ? "Ask about your site, rewrite copy, improve SEO..."
                      : "Ask anything, describe your next section goal..."
              }
              className="w-full resize-none bg-transparent text-ed-xs text-ed-text placeholder:text-ed-muted/60 focus:outline-none leading-relaxed max-h-32"
            />

            <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-ed-border/40 pt-1.5 text-ed-xs">
              <ScopeSelect
                items={allItems}
                selectedIndex={selectedIndex}
                disabled={aiLock !== null}
                onSelect={(index) => selectSection(dispatch, index)}
              />

              <div className="flex items-center gap-2">
                {loading ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 text-ed-xs font-medium transition-all cursor-pointer animate-pulse"
                    title="Stop AI generation"
                  >
                    <Square className="size-2.5 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <>
                    <span className="text-[10px] text-ed-faint font-mono">
                      {prompt.length}/2000
                    </span>
                    <button
                      type="button"
                      disabled={!prompt.trim() || aiLock !== null}
                      onClick={() => handleGenerate()}
                      className="grid size-6.5 place-items-center rounded-full bg-brand text-white shadow-xs hover:bg-brand-hover active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ArrowRight className="size-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {aiLock === "reviewing" && (
        <div
          role="region"
          aria-label="AI changes preview"
          className="fixed bottom-16 left-1/2 z-(--z-ed-toast) flex -translate-x-1/2 items-center gap-3 rounded-full border border-ed-border bg-ed-panel py-1.5 pl-4 pr-1.5 shadow-ed-pop animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-ed-xs font-medium text-ed-text">
            {previewingCreatedPageId && suggestion?.createdPages?.find((p) => p.id === previewingCreatedPageId)
              ? `Previewing new page: ${suggestion.createdPages.find((p) => p.id === previewingCreatedPageId)?.name} (${suggestion.createdPages.find((p) => p.id === previewingCreatedPageId)?.slug})`
              : "Previewing AI changes"}
          </span>
          <button
            type="button"
            onClick={handleReject}
            className="h-7 rounded-full px-3 text-ed-xs font-medium text-ed-muted hover:bg-ed-hover hover:text-ed-text"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex h-7 items-center gap-1 rounded-full bg-emerald-600 px-3 text-ed-xs font-semibold text-white hover:bg-emerald-500"
          >
            <Check className="size-3.5" aria-hidden /> Apply
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={closeRequested}
        title="Discard AI changes?"
        confirmLabel="Discard & close"
        tone="warning"
        onConfirm={() => {
          setCloseRequested(false);
          setPreviewingCreatedPageId(null);
          handleReject();
          setAiOpen(false);
        }}
        onCancel={() => setCloseRequested(false)}
      >
        The AI changes on the canvas haven&apos;t been applied yet. Closing the
        assistant discards them.
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={rollbackRequest !== null}
        title="Roll back this AI change?"
        confirmLabel="Roll back"
        tone="warning"
        onConfirm={() => rollbackRequest && applyRollback(rollbackRequest)}
        onCancel={() => setRollbackRequest(null)}
      >
        The canvas was edited after this change was accepted. Rolling back
        restores the page as it was before the AI change, and those later edits
        will be lost.
      </ConfirmDialog>
    </aside>
  );
}

/** Chooses what the AI works on: the whole page or one section; kept in sync with the canvas selection. */
function ScopeSelect({
  items,
  selectedIndex,
  disabled,
  onSelect,
}: {
  items: Parameters<typeof itemAsSection>[0][];
  selectedIndex: number | null;
  disabled: boolean;
  onSelect: (index: number | null) => void;
}) {
  const options = items.map((item, index) => {
    const section = itemAsSection(item);
    const label = SECTION_DEFINITIONS[section.type as SectionType]?.label ?? section.type;
    const data = section.data as Record<string, unknown>;
    const title = [data.heading, data.siteName, data.title].find((value) => typeof value === "string" && value.trim());
    return { index, text: title ? `${label} · ${String(title).slice(0, 40)}` : label };
  });
  return (
    <select
      aria-label="What the AI should change"
      value={selectedIndex ?? ""}
      disabled={disabled}
      onChange={(event) => onSelect(event.target.value === "" ? null : Number(event.target.value))}
      className="min-w-0 max-w-[60%] truncate rounded-md border border-ed-border/60 bg-ed-panel px-1.5 py-0.5 text-[10.5px] font-medium text-ed-text focus:border-brand focus:outline-none disabled:opacity-50 cursor-pointer"
    >
      <option value="">Whole page</option>
      {options.map((option) => (
        <option key={option.index} value={option.index}>
          {option.text}
        </option>
      ))}
    </select>
  );
}

function SuggestionStatusCard({
  message,
  remainingMs,
  onRollback,
  onSelectPage,
}: {
  message: ChatMessage;
  remainingMs: number;
  onRollback: () => void;
  onSelectPage?: (pageId: string) => void;
}) {
  const createdPages = message.suggestion?.createdPages;

  if (message.status === "accepted" && remainingMs > 0) {
    return (
      <div className="flex w-full flex-col gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-900 dark:text-amber-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <History
              className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden
            />
            <span className="truncate text-ed-2xs">
              Applied · rollback available
            </span>
          </div>
          <button
            type="button"
            onClick={onRollback}
            className="ml-2 flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/20 px-2 py-1 text-[10.5px] font-semibold text-amber-700 transition-colors hover:bg-amber-500/30 dark:text-amber-300 cursor-pointer"
          >
            <Undo2 className="size-3" aria-hidden />
            Rollback
            <span
              className="font-mono tabular-nums"
              aria-label={`${formatCountdown(remainingMs)} remaining`}
            >
              {formatCountdown(remainingMs)}
            </span>
          </button>
        </div>
        {createdPages && createdPages.length > 0 && onSelectPage && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 border-t border-amber-500/20">
            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">Switch to created page:</span>
            {createdPages.map((cp) => (
              <button
                key={cp.id}
                type="button"
                onClick={() => onSelectPage(cp.id)}
                className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold hover:bg-amber-500/30 transition-colors cursor-pointer"
              >
                <span>{cp.name}</span>
                <ArrowRight className="size-2.5 opacity-60" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const label =
    message.status === "accepted"
      ? "✓ Applied"
      : message.status === "rolled_back"
        ? "Rolled back"
        : message.status === "rejected"
          ? "Discarded"
          : "Not applied";

  return (
    <div className="flex flex-col gap-1 px-1">
      <span className="text-[10.5px] font-medium text-ed-muted">
        {label}
      </span>
      {message.status === "accepted" && createdPages && createdPages.length > 0 && onSelectPage && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-ed-muted">Open page:</span>
          {createdPages.map((cp) => (
            <button
              key={cp.id}
              type="button"
              onClick={() => onSelectPage(cp.id)}
              className="inline-flex items-center gap-1 rounded-md bg-brand/10 text-brand px-1.5 py-0.5 text-[10px] font-semibold hover:bg-brand/20 transition-colors cursor-pointer"
            >
              <span>{cp.name}</span>
              <ArrowRight className="size-2.5 opacity-60" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
