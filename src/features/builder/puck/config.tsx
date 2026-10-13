import type { ComponentConfig, Config } from "@puckeditor/core";
import type { MouseEvent, ReactNode } from "react";
import {
  DEFAULT_SECTION_SETTINGS,
  SECTION_DEFINITIONS,
  SECTION_PRESETS,
  SectionView,
  SiteFrame,
  SiteStyles,
  type Section,
  type SectionDataMap,
  type SectionType,
} from "../../../site-kit/index.ts";
import { useBuilderSite } from "../editor-context.ts";
import { isAiPlaceholderData, itemToSection, type BuilderComponents, type BuilderRootProps, type SectionProps } from "./adapter.ts";

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
      const section = itemToSection(type, { id, data: data as SectionDataMap[T], settings, hidden });
      const view = <SectionView section={section} />;
      if (!hidden) return <div id={id} className="wb-editor-section-wrap w-full">{view}</div>;
      return puck.isEditing ? <div id={id} className="wb-editor-hidden wb-editor-section-wrap w-full">{view}</div> : <></>;
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

  return (
    <div
      onClickCapture={handleLinkClick}
      onClick={handleRootClick}
      className="min-h-full h-full flex flex-col flex-1"
    >
      <SiteStyles />
      <SiteFrame theme={site.theme} header={null} footer={null}>
        <div className="relative flex min-h-full h-full w-full flex-1 flex-col">
          {site.isEmpty && <EmptyCanvas />}
          <div className="relative z-10 flex min-h-full h-full w-full flex-1 flex-col">
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
