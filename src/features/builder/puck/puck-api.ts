import { createUsePuck, type PuckAction } from "@puckeditor/core";
import type { Section } from "../../../site-kit/index.ts";
import { ROOT_ZONE, sectionToItem } from "./adapter.ts";
import type { builderConfig } from "./config.tsx";

/** Selector-based Puck hook: components re-render only when their selected slice changes. */
export const useBuilderPuck = createUsePuck<typeof builderConfig>();

type Dispatch = (action: PuckAction) => void;

export function selectSection(dispatch: Dispatch, index: number | null) {
  dispatch({ type: "setUi", ui: { itemSelector: index === null ? null : { index, zone: ROOT_ZONE } } });
}

/** Inserts ready-made sections (presets, saved sections) at `index` and selects the first one. */
export function insertSections(dispatch: Dispatch, sections: Section[], index: number) {
  const items = sections.map(sectionToItem);
  dispatch({
    type: "setData",
    data: (previous) => {
      const content = previous.content ?? [];
      const at = Math.min(Math.max(index, 0), content.length);
      return { content: [...content.slice(0, at), ...items, ...content.slice(at)] };
    },
  });
  selectSection(dispatch, index);
}

export function replaceSection(dispatch: Dispatch, index: number, section: Section) {
  dispatch({ type: "replace", destinationIndex: index, destinationZone: ROOT_ZONE, data: sectionToItem(section) });
}

export function moveSection(dispatch: Dispatch, from: number, to: number) {
  dispatch({ type: "reorder", sourceIndex: from, destinationIndex: to, destinationZone: ROOT_ZONE });
  selectSection(dispatch, to);
}

export function duplicateSection(dispatch: Dispatch, index: number) {
  dispatch({ type: "duplicate", sourceIndex: index, sourceZone: ROOT_ZONE });
}

export function removeSection(dispatch: Dispatch, index: number) {
  dispatch({ type: "remove", index, zone: ROOT_ZONE });
  selectSection(dispatch, null);
}

export function setAllSections(dispatch: Dispatch, sections: Section[]) {
  const items = sections.map(sectionToItem);
  dispatch({
    type: "setData",
    data: (previous) => ({
      ...previous,
      root: previous.root ?? { props: {} },
      content: items,
    }),
  });
}

