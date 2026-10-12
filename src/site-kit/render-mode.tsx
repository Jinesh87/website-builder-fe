import { createContext, useContext, type ReactNode } from "react";

/**
 * "static" is for the HTML code export: components render every interactive
 * state (open menu, each carousel slide, each auth view) into the markup, all
 * but one hidden, and a small plain-JS runtime switches between them.
 */
export type SiteRenderMode = "interactive" | "static";

const RenderModeContext = createContext<SiteRenderMode>("interactive");

export function SiteRenderModeProvider({ mode, children }: { mode: SiteRenderMode; children: ReactNode }) {
  return <RenderModeContext.Provider value={mode}>{children}</RenderModeContext.Provider>;
}

export function useStaticRender(): boolean {
  return useContext(RenderModeContext) === "static";
}

type StaticStatesProps<State extends string | number> = {
  states: readonly State[];
  initial: State;
  render: (state: State) => ReactNode;
  /** Advances to the next state every N seconds. */
  autoplaySeconds?: number;
  pauseOnHover?: boolean;
};

/**
 * Renders one copy of the content per state. Inside a copy, elements with
 * `data-wb-go="next" | "prev" | <state>` switch states on click, or on hover
 * when they also carry `data-wb-go-hover`.
 */
export function StaticStates<State extends string | number>({
  states,
  initial,
  render,
  autoplaySeconds,
  pauseOnHover,
}: StaticStatesProps<State>) {
  return (
    <div
      className="wb-states"
      data-wb-states={states.join(" ")}
      data-wb-autoplay={autoplaySeconds}
      data-wb-pause-on-hover={pauseOnHover ? "true" : undefined}
    >
      {states.map((state) => (
        <div key={state} className="wb-state" data-wb-state={state} hidden={state !== initial}>
          {render(state)}
        </div>
      ))}
    </div>
  );
}
