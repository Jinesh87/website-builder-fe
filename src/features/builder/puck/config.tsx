import type { ComponentConfig, Config } from "@puckeditor/core";
import { memo, useMemo, type MouseEvent, type ReactNode } from "react";
import {
  DEFAULT_SECTION_SETTINGS,
  SECTION_DEFINITIONS,
  SECTION_PRESETS,
  SectionView,
  SiteFrame,
  SiteStyles,
  type Section,
  type SectionDataMap,
  type SectionSettings,
  type SectionType,
} from "../../../site-kit/index.ts";
import { useBuilderSite } from "../editor-context.ts";
import { isAiPlaceholderData, itemToSection, type BuilderComponents, type BuilderRootProps, type SectionProps } from "./adapter.ts";

type SectionWrapperProps<T extends SectionType> = {
  id: string;
  type: T;
  data: SectionDataMap[T];
  settings?: SectionSettings;
  hidden?: boolean;
  isEditing?: boolean;
};

const SectionWrapper = memo(
  function SectionWrapper<T extends SectionType>({
    id,
    type,
    data,
    settings,
    hidden,
    isEditing,
  }: SectionWrapperProps<T>) {
    const section = useMemo(
      () =>
        itemToSection(type, {
          id,
          data,
          settings: settings ?? DEFAULT_SECTION_SETTINGS,
          hidden: Boolean(hidden),
        }),
      [type, id, data, settings, hidden],
    );

    const view = <SectionView section={section} />;
    if (!hidden) {
      return (
        <div id={id} className="wb-editor-section-wrap w-full">
          {view}
        </div>
      );
    }
    return isEditing ? (
      <div id={id} className="wb-editor-hidden wb-editor-section-wrap w-full">
        {view}
      </div>
    ) : null;
  },
  (prev, next) => {
    if (prev.id !== next.id) return false;
    if (prev.type !== next.type) return false;
    if (prev.hidden !== next.hidden) return false;
    if (prev.isEditing !== next.isEditing) return false;
    if (prev.settings !== next.settings) {
      if (JSON.stringify(prev.settings) !== JSON.stringify(next.settings)) return false;
    }
    if (prev.data !== next.data) {
      if (JSON.stringify(prev.data) !== JSON.stringify(next.data)) return false;
    }
    return true;
  },
);

function sectionComponent<T extends SectionType>(type: T): ComponentConfig<SectionProps<T>> {
  const definition = SECTION_DEFINITIONS[type];
  return {
    label: definition.label,
    defaultProps: { data: definition.createData(), settings: DEFAULT_SECTION_SETTINGS, hidden: false },
    render: ({ id, data, settings, hidden, puck }) => {
      if (isAiPlaceholderData(data)) {
        return (
          <div
            id={id}
            data-ai-placeholder="true"
            className="wb-editor-section-wrap relative w-full my-4 min-h-[220px] rounded-2xl border border-dashed border-cyan-400/35 bg-cyan-500/[0.03] select-none transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
            <div className="relative flex min-h-[220px] flex-col items-center justify-center gap-3 px-8 py-10 font-sans">
              <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600">
                Building {definition.label}…
              </span>
              <div className="h-5 w-2/3 max-w-md animate-pulse rounded-md bg-cyan-500/15" />
              <div className="h-3 w-1/2 max-w-sm animate-pulse rounded-md bg-cyan-500/10" />
              <div className="mt-2 flex gap-3">
                <div className="h-8 w-24 animate-pulse rounded-lg bg-cyan-500/20" />
                <div className="h-8 w-24 animate-pulse rounded-lg bg-cyan-500/10" />
              </div>
            </div>
          </div>
        );
      }
      return (
        <SectionWrapper
          id={id}
          type={type}
          data={data as SectionDataMap[T]}
          settings={settings}
          hidden={hidden}
          isEditing={puck.isEditing}
        />
      );
    },
  };
}

function EmptyCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 px-6 py-24 text-center font-sans select-none">
      <p className="text-base font-semibold text-ed-text">Start building this page</p>
      <p className="max-w-md text-sm text-ed-muted">
        Drag a component or add a section from the left panel onto the page.
      </p>
    </div>
  );
}

function RootRender({ children }: { children: ReactNode }) {
  const site = useBuilderSite();

  const handleLinkClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    const anchor = target instanceof Element ? target.closest<HTMLAnchorElement>("a") : null;
    const cardWithHref = target instanceof Element ? target.closest<HTMLElement>("[data-href]") : null;
    const href = anchor?.getAttribute("href") || cardWithHref?.getAttribute("data-href");

    if (anchor || cardWithHref) {
      event.preventDefault();
      if (href && href !== "#") {
        site.navigateToHref?.(href);
      }
    }
  };

  const handleRootClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    const isSection = target?.closest(".wb-editor-section-wrap") !== null;
    const isInteractive = target?.closest("button, input, textarea, a, select, [role='button']") !== null;

    if (!isSection && !isInteractive) {
      site.selectArea("page");
    }
  };

  const siteBg = site.theme?.colors?.background || "transparent";

  return (
    <div
      onClickCapture={handleLinkClick}
      onClick={handleRootClick}
      className="min-h-full w-full flex flex-col flex-1"
      style={{ backgroundColor: siteBg }}
    >
      <style>{`
        html {
          background-color: ${siteBg} !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100% !important;
          height: 100% !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          overscroll-behavior: none !important;
          overscroll-behavior-y: none !important;
        }
        body {
          background-color: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100% !important;
          height: auto !important;
          overflow: visible !important;
          overscroll-behavior: none !important;
          overscroll-behavior-y: none !important;
        }
        /* The body's height is auto, so a percentage would collapse the drop zone to its content. */
        #frame-root {
          background-color: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100vh !important;
          height: auto !important;
          overflow: visible !important;
          display: flex !important;
          flex-direction: column !important;
        }
        html, body, #frame-root, [data-puck-dropzone], * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar,
        #frame-root::-webkit-scrollbar,
        [data-puck-dropzone]::-webkit-scrollbar,
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
        html::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb,
        #frame-root::-webkit-scrollbar-thumb,
        [data-puck-dropzone]::-webkit-scrollbar-thumb,
        *::-webkit-scrollbar-thumb {
          display: none !important;
          background: transparent !important;
        }
        /* Ensure natural section heights without artificial whitespace */
        div[data-puck-dropzone] {
          min-height: 100% !important;
          height: auto !important;
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          flex: 1 0 auto !important;
          padding-bottom: 48px !important;
        }
        [class*="_DropZone-item"] {
          height: auto !important;
          min-height: 0 !important;
          flex: 0 0 auto !important;
          width: 100% !important;
          position: relative !important;
          display: block !important;
        }
        [class*="_DropZone-linePlaceholder"] {
          height: 3px !important;
          min-height: 0 !important;
          max-height: 3px !important;
          background: #2447c7 !important;
          z-index: 50 !important;
          pointer-events: none !important;
        }
        [class*="_DropZone-hitbox"] {
          height: 16px !important;
          min-height: 0 !important;
          max-height: 16px !important;
        }
        /* Hitboxes must never block clicking sections when not dragging */
        body:not([data-puck-dragging]) [class*="_DropZone-hitbox"] {
          pointer-events: none !important;
        }
        body[data-puck-dragging] [class*="_DropZone-hitbox"] {
          pointer-events: auto !important;
        }
        /* Production section selection overlay */
        [class*="_DraggableComponent-overlay"] {
          cursor: pointer !important;
          outline: 2px solid transparent !important;
          outline-offset: -2px !important;
          transition: outline-color 140ms ease, box-shadow 140ms ease !important;
          background-color: transparent !important;
        }
        [class*="_DraggableComponent--hover"]:not([class*="_DraggableComponent--isSelected"]) > [class*="_DraggableComponent-overlayWrapper"] > [class*="_DraggableComponent-overlay"] {
          outline: 2px dashed rgba(36, 71, 199, 0.45) !important;
          outline-offset: -2px !important;
          background-color: transparent !important;
        }
        [class*="_DraggableComponent--isSelected"] > [class*="_DraggableComponent-overlayWrapper"] > [class*="_DraggableComponent-overlay"] {
          outline: 2px solid #2447c7 !important;
          outline-offset: -2px !important;
          box-shadow: inset 0 0 0 1px rgba(36, 71, 199, 0.25) !important;
          background-color: transparent !important;
        }
        /* Component drag handle and selection reliability */
        [data-puck-component] {
          pointer-events: auto !important;
          cursor: grab !important;
        }
        [data-puck-component]:active {
          cursor: grabbing !important;
        }
        /* Hide unwanted floating handler bar */
        [class*="_DraggableComponent-actionsOverlay"],
        [class*="_DraggableComponent-actions"],
        [class*="_DraggableComponent-loadingOverlay"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
        }
      `}</style>
      <SiteStyles />
      <SiteFrame theme={site.theme} header={null} footer={null}>
        <div className="relative flex min-h-full w-full flex-1 flex-col">
          {site.isEmpty && <EmptyCanvas />}
          <div className="relative z-10 flex min-h-full w-full flex-1 flex-col">
            {children}
          </div>
        </div>
      </SiteFrame>
    </div>
  );
}

const baseComponents: { [T in SectionType]: ComponentConfig<SectionProps<T>> } = {
  header: sectionComponent("header"),
  footer: sectionComponent("footer"),
  hero: sectionComponent("hero"),
  features: sectionComponent("features"),
  services: sectionComponent("services"),
  cards: sectionComponent("cards"),
  testimonials: sectionComponent("testimonials"),
  faq: sectionComponent("faq"),
  cta: sectionComponent("cta"),
  contact: sectionComponent("contact"),
  text: sectionComponent("text"),
  gallery: sectionComponent("gallery"),
  logos: sectionComponent("logos"),
  split: sectionComponent("split"),
  stats: sectionComponent("stats"),
  pricing: sectionComponent("pricing"),
  media: sectionComponent("media"),
  team: sectionComponent("team"),
  carousel: sectionComponent("carousel"),
  marquee: sectionComponent("marquee"),
  auth: sectionComponent("auth"),
  custom: sectionComponent("custom"),
  blog: sectionComponent("blog"),
  blog_detail: sectionComponent("blog_detail"),
};

const presetComponents = Object.fromEntries(
  SECTION_PRESETS.map((preset) => {
    const sample = preset.create();
    return [
      preset.key,
      {
        label: preset.label,
        defaultProps: {
          data: sample.data,
          settings: sample.settings,
          hidden: sample.hidden,
        },
        render: ({ id, data, settings, hidden, puck }: any) => {
          const section = {
            id,
            type: preset.type,
            hidden,
            settings,
            data,
          };
          const view = <SectionView section={section as Section} />;
          if (!hidden) return <div className="wb-editor-section-wrap w-full">{view}</div>;
          return puck.isEditing ? <div className="wb-editor-hidden wb-editor-section-wrap w-full">{view}</div> : <></>;
        },
      },
    ];
  }),
);

/** Fields are intentionally empty: the builder's own inspector edits section props. */
export const builderConfig: Config<BuilderComponents, BuilderRootProps> = {
  components: {
    ...baseComponents,
    ...presetComponents,
  } as unknown as { [T in SectionType]: ComponentConfig<SectionProps<T>> },
  root: { render: RootRender },
};
