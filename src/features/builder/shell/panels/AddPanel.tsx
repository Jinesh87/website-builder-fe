import {
  useMemo,
  useState,
  type CSSProperties,
  type ComponentType,
} from "react";
import { Drawer } from "@puckeditor/core";
import {
  BookOpen,
  Briefcase,
  CreditCard,
  FileText,
  Grid,
  HelpCircle,
  Image,
  Layers,
  LogIn,
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
import { LIMITS } from "../../../../pages/websites/editor/editor-state.ts";
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
    id: "blog",
    category: "Blog",
    label: "Blog",
    shortLabel: "Blog",
    icon: BookOpen,
  },
  {
    id: "footer",
    category: "Footer",
    label: "Footer",
    shortLabel: "Footer",
    icon: PanelBottom,
  },
];

// Temporarily hidden categories from the sidebar without deleting code or designs
const HIDDEN_CATEGORIES = new Set<string>(["Contact", "Auth"]);

export const VISIBLE_CATEGORIES = CATEGORIES.filter(
  (c) => !HIDDEN_CATEGORIES.has(c.category),
);

const PREVIEW_WIDTH = 1040;
const PREVIEW_SCALE = 0.27;
/** Headers are previewed at a full desktop width so their desktop layout shows, at the same thumbnail size. */
const HEADER_PREVIEW_WIDTH = 1360;
const HEADER_PREVIEW_SCALE =
  (PREVIEW_WIDTH * PREVIEW_SCALE) / HEADER_PREVIEW_WIDTH;

function SectionLivePreview({
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

  return (
    <div
      className={`relative ${heightClass} w-full overflow-hidden rounded-md border border-ed-border/70 bg-white dark:bg-zinc-950 pointer-events-none select-none`}
      aria-hidden
      inert
    >
      <SiteStyles />
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
    </div>
  );
}

function matches(preset: SectionPreset, query: string): boolean {
  const text =
    `${preset.label} ${preset.category} ${preset.description}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => text.includes(word));
}

export default function AddPanel() {
  const { notify, draft } = useEditor();
  const dispatch = useBuilderPuck((state) => state.dispatch);
  const selectedIndex = useBuilderPuck(
    (state) => state.appState.ui.itemSelector?.index ?? null,
  );
  const count = useBuilderPuck((state) => state.appState.data.content.length);
  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("hero");

  const selectedCategory =
    VISIBLE_CATEGORIES.find((c) => c.id === selectedCategoryId) ?? VISIBLE_CATEGORIES[0]!;

  const filteredPresets = useMemo(() => {
    const trimmed = query.trim();
    const availablePresets = SECTION_PRESETS.filter(
      (preset) => !HIDDEN_CATEGORIES.has(preset.category),
    );
    if (trimmed) {
      return availablePresets.filter((preset) => matches(preset, trimmed));
    }
    if (selectedCategory.category === "All") {
      return availablePresets;
    }
    return availablePresets.filter(
      (preset) => preset.category === selectedCategory.category,
    );
  }, [query, selectedCategory]);

  const full = count >= LIMITS.sectionsPerPage;
  const insertAt = selectedIndex === null ? count : selectedIndex + 1;

  function add(preset: SectionPreset) {
    if (full) return;
    insertSections(dispatch, [preset.create()], insertAt);
    notify(`${preset.label} added`);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
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
        <nav
          aria-label="Section categories"
          className="flex w-[70px] shrink-0 flex-col gap-1 border-r border-ed-border bg-ed-subtle/40 p-1 overflow-y-auto overscroll-contain"
        >
          {VISIBLE_CATEGORIES.map(({ id, shortLabel, label, icon: Icon }) => {
            const isSelected = selectedCategoryId === id && !query.trim();
            return (
              <AppTooltip key={id} content={label} placement="right" offset={8}>
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedCategoryId(id);
                    if (query) setQuery("");
                  }}
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
            <Drawer>
              <div className="flex flex-col gap-2.5">
                {filteredPresets.map((preset) => (
                  <Drawer.Item
                    key={preset.key}
                    name={preset.key}
                    label={preset.label}
                    isDragDisabled={full}
                  >
                    {() => (
                      <div
                        onClick={() => add(preset)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            add(preset);
                          }
                        }}
                        aria-label={`Add ${preset.label}`}
                        className="group relative flex flex-col overflow-hidden rounded-lg border border-ed-border/90 bg-ed-panel p-2 text-left transition-all hover:border-ed-accent/60 hover:shadow-xs focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15 cursor-grab active:cursor-grabbing select-none"
                      >
                        {/* Live Rendered Section Preview matching actual page design 1:1 */}
                        <div className="mb-2 w-full transition-transform duration-150 group-hover:scale-[1.01] pointer-events-none">
                          <SectionLivePreview
                            preset={preset}
                            theme={draft.theme}
                          />
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
                    )}
                  </Drawer.Item>
                ))}
              </div>
            </Drawer>
          )}
        </div>
      </div>
    </div>
  );
}
