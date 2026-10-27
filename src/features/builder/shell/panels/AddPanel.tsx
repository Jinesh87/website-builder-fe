import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
} from "react";
import { Drawer } from "@puckeditor/core";
import {
  BookOpen,
  ShoppingBag,
  Briefcase,
  CreditCard,
  FileText,
  Grid,
  HelpCircle,
  Image,
  Layers,
  LayoutGrid,
  LogIn,
  UserCircle,
  Mail,
  Megaphone,
  MessageSquareQuote,
  PanelBottom,
  PanelTop,
  PlaySquare,
  Plus,
  Rocket,
  SearchX,
  SlidersHorizontal,
  MoveHorizontal,
  Users,
  type LucideProps,
} from "lucide-react";
import AppTooltip from "../../../../components/ui/AppTooltip.tsx";
import { LIMITS, updatePage } from "../../../../pages/websites/editor/editor-state.ts";
import {
  SECTION_PRESETS,
  SectionView,
  SiteStyles,
  themeToCssVars,
  type HeroData,
  type SectionCategory,
  type SectionPreset,
  type ThemeSettings,
} from "../../../../site-kit/index.ts";
import { useEditor } from "../../editor-context.ts";
import { insertSections, useBuilderPuck } from "../../puck/puck-api.ts";
import { getSectionType, sectionToItem } from "../../puck/adapter.ts";
import {
  PAGE_FOOTER_ID,
  PAGE_HEADER_ID,
  SITE_FOOTER_ID,
  SITE_HEADER_ID,
  pageChromeMode,
  setPageChrome,
  withSiteBrand,
} from "../../utils/site-chrome.ts";
import { EmptyState, PanelHeader, SearchField } from "../ui.tsx";

type CategoryItem = {
  id: string;
  category: SectionCategory | "All";
  label: string;
  shortLabel: string;
  icon: ComponentType<LucideProps>;
};

const CATEGORIES: CategoryItem[] = [
  {
    id: "all",
    category: "All",
    label: "All sections",
    shortLabel: "All",
    icon: Grid,
  },
  {
    id: "header",
    category: "Header",
    label: "Header",
    shortLabel: "Header",
    icon: PanelTop,
  },
  {
    id: "hero",
    category: "Hero",
    label: "Hero",
    shortLabel: "Hero",
    icon: Rocket,
  },
  {
    id: "features",
    category: "Features",
    label: "Features",
    shortLabel: "Features",
    icon: Layers,
  },
  {
    id: "services",
    category: "Services",
    label: "Services",
    shortLabel: "Services",
    icon: Briefcase,
  },
  {
    id: "cards",
    category: "Cards",
    label: "Cards",
    shortLabel: "Cards",
    icon: LayoutGrid,
  },
  {
    id: "social-proof",
    category: "Social proof",
    label: "Testimonials",
    shortLabel: "Testimonials",
    icon: MessageSquareQuote,
  },
  {
    id: "pricing",
    category: "Pricing",
    label: "Pricing",
    shortLabel: "Pricing",
    icon: CreditCard,
  },
  {
    id: "faq",
    category: "FAQ",
    label: "FAQ",
    shortLabel: "FAQ",
    icon: HelpCircle,
  },
  {
    id: "cta",
    category: "CTA",
    label: "Call to action",
    shortLabel: "CTA",
    icon: Megaphone,
  },
  {
    id: "contact",
    category: "Contact",
    label: "Contact",
    shortLabel: "Contact",
    icon: Mail,
  },
  {
    id: "content",
    category: "Content",
    label: "Content",
    shortLabel: "Content",
    icon: FileText,
  },
  {
    id: "portfolio",
    category: "Portfolio",
    label: "Gallery",
    shortLabel: "Gallery",
    icon: Image,
  },
  {
    id: "media",
    category: "Media",
    label: "Media",
    shortLabel: "Media",
    icon: PlaySquare,
  },
  {
    id: "team",
    category: "Team",
    label: "Team",
    shortLabel: "Team",
    icon: Users,
  },
  {
    id: "carousel",
    category: "Carousel",
    label: "Carousel & Sliders",
    shortLabel: "Carousel",
    icon: SlidersHorizontal,
  },
  {
    id: "marquee",
    category: "Marquee",
    label: "Marquee & Tickers",
    shortLabel: "Marquee",
    icon: MoveHorizontal,
  },
  {
    id: "auth",
    category: "Auth",
    label: "Login & Sign up",
    shortLabel: "Auth",
    icon: LogIn,
  },
  {
    id: "account",
    category: "Account",
    label: "Customer account",
    shortLabel: "Account",
    icon: UserCircle,
  },
  {
    id: "blog",
    category: "Blog",
    label: "Blog",
    shortLabel: "Blog",
    icon: BookOpen,
  },
  {
    id: "shop",
    category: "Shop",
    label: "Shop",
    shortLabel: "Shop",
    icon: ShoppingBag,
  },
  {
    id: "footer",
    category: "Footer",
    label: "Footer",
    shortLabel: "Footer",
    icon: PanelBottom,
  },
];

export const VISIBLE_CATEGORIES = CATEGORIES;

const PREVIEW_WIDTH = 1040;
const PREVIEW_SCALE = 0.27;
/** Headers are previewed at a full desktop width so their desktop layout shows, at the same thumbnail size. */
const HEADER_PREVIEW_WIDTH = 1360;
const HEADER_PREVIEW_SCALE =
  (PREVIEW_WIDTH * PREVIEW_SCALE) / HEADER_PREVIEW_WIDTH;

/** Previews already rendered once; Puck remounts every drawer item after each drag, and they must not blank out. */
const shownPreviews = new Set<string>();

function useInView(key: string) {
  const [inView, setInView] = useState(() => shownPreviews.has(key));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const show = () => {
      shownPreviews.add(key);
      setInView(true);
    };
    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          show();
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, key]);

  return { ref, inView };
}

const SectionLivePreview = memo(function SectionLivePreview({
  preset,
  theme,
}: {
  preset: SectionPreset;
  theme: ThemeSettings;
}) {
  const isHeader = preset.type === "header";
  const isAuth = preset.type === "auth";
  const isCurvedHero = preset.key === "hero-curved-carousel";
  const isCampaignHero = preset.key === "hero-campaign-banner";
  const isHeaderOrFooter = isHeader || preset.type === "footer";
  const heightClass = isHeaderOrFooter
    ? "h-20"
    : isAuth
      ? "h-36"
      : isCurvedHero || isCampaignHero
        ? "h-48"
        : "h-32";
  const isWide = isHeader || isAuth;
  const width = isWide ? HEADER_PREVIEW_WIDTH : PREVIEW_WIDTH;
  const scale = isWide
    ? HEADER_PREVIEW_SCALE
    : isCurvedHero || isCampaignHero
      ? 0.25
      : PREVIEW_SCALE;

  const section = useMemo(() => {
    const s = preset.create();
    if (isCurvedHero && s.data) {
      s.data = {
        ...(s.data as HeroData),
        carouselSpeed: 0,
      };
    }
    return s;
  }, [preset.key, isCurvedHero]);

  const { ref, inView } = useInView(preset.key);

  return (
    <div
      ref={ref}
      className={`relative ${heightClass} w-full overflow-hidden rounded-md border border-ed-border/70 bg-white dark:bg-zinc-950 pointer-events-none select-none`}
      aria-hidden
      inert
    >
      {inView ? (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 origin-top"
          style={{ width, transform: `scale(${scale})` }}
        >
          <div
            className={`wb-site wb-buttons-${theme.buttonStyle} wb-cards-${theme.cardStyle}`}
            style={
              {
                ...themeToCssVars(theme),
                "--wb-section-y": isCurvedHero
                  ? "14px"
                  : isHeaderOrFooter
                    ? "16px"
                    : "24px",
                "--wb-container": isWide ? "1280px" : "1000px",
                "--wb-auth-screen-h": "680px",
              } as CSSProperties
            }
          >
            <SectionView section={section} />
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-ed-subtle/30 text-ed-faint">
          <span className="text-[10px] font-medium tracking-wider uppercase opacity-50">
            {preset.label}
          </span>
        </div>
      )}
    </div>
  );
});

function matches(preset: SectionPreset, query: string): boolean {
  const text =
    `${preset.label} ${preset.category} ${preset.description}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => text.includes(word));
}

type PresetCardItemProps = {
  preset: SectionPreset;
  theme: ThemeSettings;
  full: boolean;
  onAdd: (preset: SectionPreset) => void;
};

const PresetCardItem = memo(
  function PresetCardItem({ preset, theme, full, onAdd }: PresetCardItemProps) {
    // Puck uses this render function as a component type, so a new function would remount the card.
    const renderCard = useCallback(
      () => (
          <div
            onClick={() => onAdd(preset)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAdd(preset);
              }
            }}
            aria-label={`Add ${preset.label}`}
            style={{ contentVisibility: "auto", containIntrinsicSize: "160px" }}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-ed-border/90 bg-ed-panel p-2 text-left transition-all hover:border-ed-accent/60 hover:shadow-xs focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15 cursor-grab active:cursor-grabbing select-none"
          >
            {/* Live Rendered Section Preview matching actual page design 1:1 */}
            <div className="mb-2 w-full transition-transform duration-150 group-hover:scale-[1.01] pointer-events-none">
              <SectionLivePreview preset={preset} theme={theme} />
            </div>

            {/* Section Title, Description & Action Button */}
            <div className="flex items-start justify-between gap-2 px-0.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-ed-xs font-semibold text-ed-text group-hover:text-ed-accent transition-colors">
                  {preset.label}
                </p>
                <p className="line-clamp-1 text-ed-2xs leading-tight text-ed-muted">
                  {preset.description}
                </p>
              </div>

              <div className="flex size-5 shrink-0 items-center justify-center rounded-ed bg-ed-subtle text-ed-muted border border-ed-border shadow-2xs transition-colors group-hover:bg-ed-accent group-hover:border-ed-accent group-hover:text-white">
                <Plus className="size-3" aria-hidden />
              </div>
            </div>
          </div>
      ),
      [preset, theme, onAdd],
    );
    return (
      <Drawer.Item
        name={preset.key}
        label={preset.label}
        isDragDisabled={full && preset.type !== "header" && preset.type !== "footer"}
      >
        {renderCard}
      </Drawer.Item>
    );
  },
  (prev, next) => {
    if (prev.preset.key !== next.preset.key) return false;
    if (prev.full !== next.full) return false;
    if (prev.onAdd !== next.onAdd) return false;
    if (prev.theme !== next.theme) {
      if (JSON.stringify(prev.theme) !== JSON.stringify(next.theme))
        return false;
    }
    return true;
  },
);

const PresetsList = memo(function PresetsList({
  presets,
  theme,
  full,
  onAdd,
}: {
  presets: SectionPreset[];
  theme: ThemeSettings;
  full: boolean;
  onAdd: (preset: SectionPreset) => void;
}) {
  return (
    <Drawer>
      <div className="flex flex-col gap-2.5">
        {presets.map((preset) => (
          <PresetCardItem
            key={preset.key}
            preset={preset}
            theme={theme}
            full={full}
            onAdd={onAdd}
          />
        ))}
      </div>
    </Drawer>
  );
});

const CategoryRail = memo(function CategoryRail({
  selectedId,
  isSearching,
  onSelect,
}: {
  selectedId: string;
  isSearching: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Section categories"
      className="flex w-17.5 shrink-0 flex-col gap-1 border-r border-ed-border bg-ed-subtle/40 p-1 overflow-y-auto overscroll-contain"
    >
      {VISIBLE_CATEGORIES.map(({ id, shortLabel, label, icon: Icon }) => {
        const isSelected = selectedId === id && !isSearching;
        return (
          <AppTooltip key={id} content={label} placement="right" offset={8}>
            <button
              type="button"
              aria-label={label}
              aria-pressed={isSelected}
              onClick={() => onSelect(id)}
              className={`group flex w-full flex-col items-center justify-center rounded-ed py-1.5 px-0.5 text-center transition-all ${
                isSelected
                  ? "bg-white text-ed-accent shadow-xs dark:bg-zinc-800"
                  : "text-ed-muted hover:bg-ed-hover hover:text-ed-text"
              }`}
            >
              <Icon
                className={`size-4 transition-transform group-hover:scale-105 ${
                  isSelected
                    ? "text-ed-accent"
                    : "text-ed-muted group-hover:text-ed-text"
                }`}
                aria-hidden
              />
              <span className="mt-0.5 block w-full truncate text-[8px] font-medium leading-tight tracking-tight">
                {shortLabel}
              </span>
            </button>
          </AppTooltip>
        );
      })}
    </nav>
  );
});

export default function AddPanel() {
  const { notify, draft, page, editDraft } = useEditor();
  const dispatch = useBuilderPuck((state) => state.dispatch);
  const selectedIndex = useBuilderPuck(
    (state) => state.appState.ui.itemSelector?.index ?? null,
  );
  const count = useBuilderPuck((state) => state.appState.data.content.length);
  // "End of page" means above the footer, so a new section never lands below it.
  const endsWithFooter = useBuilderPuck((state) => {
    const last = state.appState.data.content.at(-1);
    return Boolean(last) && getSectionType(last!.type) === "footer";
  });
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedCategoryId, setSelectedCategoryId] = useState("hero");

  const selectedCategory =
    VISIBLE_CATEGORIES.find((c) => c.id === selectedCategoryId) ??
    VISIBLE_CATEGORIES[0]!;

  const filteredPresets = useMemo(() => {
    const trimmed = deferredQuery.trim();
    if (trimmed) {
      return SECTION_PRESETS.filter((preset) => matches(preset, trimmed));
    }
    if (selectedCategory.category === "All") {
      return SECTION_PRESETS;
    }
    return SECTION_PRESETS.filter(
      (preset) => preset.category === selectedCategory.category,
    );
  }, [deferredQuery, selectedCategory]);

  const full = count >= LIMITS.sectionsPerPage;
  const insertAt = selectedIndex === null ? (endsWithFooter ? count - 1 : count) : selectedIndex + 1;

  const insertAtRef = useRef(insertAt);
  insertAtRef.current = insertAt;
  const fullRef = useRef(full);
  fullRef.current = full;
  // Read at click time so content edits don't give every preset card a new handler.
  const latestRef = useRef({ draft, page });
  latestRef.current = { draft, page };

  const handleAdd = useCallback(
    (preset: SectionPreset) => {
      const { draft: latestDraft, page: latestPage } = latestRef.current;
      const created = withSiteBrand(preset.create(), latestDraft);
      if (fullRef.current && created.type !== "header" && created.type !== "footer") return;
      if (created.type === "header" || created.type === "footer") {
        // A new design replaces the header/footer this page shows: the site-wide one or the page's own.
        const type = created.type;
        const mode = pageChromeMode(latestPage.sections, type);
        if (mode === "none") {
          editDraft((current) =>
            updatePage(current, latestPage.id, (p) => ({ ...p, sections: setPageChrome(p.sections, type, "page", current, created) })),
          );
          notify(`${preset.label} added to this page`);
          return;
        }
        const ids = mode === "site" ? { header: SITE_HEADER_ID, footer: SITE_FOOTER_ID } : { header: PAGE_HEADER_ID, footer: PAGE_FOOTER_ID };
        const item = sectionToItem({ ...created, id: ids[type] });
        dispatch({
          type: "setData",
          data: (previous) => {
            const content = previous.content ?? [];
            const index = content.findIndex((existing) => getSectionType(existing.type) === type);
            if (index !== -1) return { content: content.map((existing, i) => (i === index ? item : existing)) };
            return { content: type === "header" ? [item, ...content] : [...content, item] };
          },
        });
        notify(mode === "site" ? `${preset.label} now shows on every page using the site ${type}` : `${preset.label} now shows on this page`);
        return;
      }
      insertSections(dispatch, [created], insertAtRef.current);
      notify(`${preset.label} added`);
    },
    [dispatch, notify, editDraft],
  );

  const handleSelectCategory = useCallback((id: string) => {
    setSelectedCategoryId(id);
    setQuery("");
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <SiteStyles />
      <PanelHeader
        title="Add sections"
        description={
          selectedIndex === null
            ? "Added to the end of page"
            : "Added below selected"
        }
      />
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search sections..."
      />

      {full && (
        <p className="mx-3 mb-2 rounded-ed bg-ed-warning-soft px-2 py-1.5 text-ed-xs text-ed-warning">
          Page limit reached ({LIMITS.sectionsPerPage} sections max).
        </p>
      )}

      {/* Dual pane container: Categories Left Rail + Section Cards Main Area */}
      <div className="flex min-h-0 flex-1 overflow-hidden border-t border-ed-border">
        {/* Compact Category Icons Left Sub-Sidebar */}
        <CategoryRail
          selectedId={selectedCategoryId}
          isSearching={Boolean(query.trim())}
          onSelect={handleSelectCategory}
        />

        {/* Section Cards Area with Live Layout Previews */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-2.5">
          <div className="mb-2 flex items-center justify-between px-0.5">
            <h3 className="text-ed-2xs font-semibold uppercase tracking-wider text-ed-faint">
              {query.trim()
                ? `Search results (${filteredPresets.length})`
                : selectedCategory.label}
            </h3>
            <span className="text-ed-2xs text-ed-faint">
              {filteredPresets.length}{" "}
              {filteredPresets.length === 1 ? "layout" : "layouts"}
            </span>
          </div>

          {filteredPresets.length === 0 ? (
            <EmptyState
              icon={<SearchX className="size-4" />}
              title="No matching sections"
            >
              Try a different search term like “pricing” or “hero”.
            </EmptyState>
          ) : (
            <PresetsList
              presets={filteredPresets}
              theme={draft.theme}
              full={full}
              onAdd={handleAdd}
            />
          )}
        </div>
      </div>
    </div>
  );
}
