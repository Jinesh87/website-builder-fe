import { beforeEach, describe, expect, it } from "vitest";
import {
  TOUR_STORAGE_KEY,
  getHasCompletedTour,
  resetTourStorage,
  setHasCompletedTour,
} from "./storage.ts";
import { EDITOR_TOUR_STEPS } from "./tour-steps.ts";

describe("Onboarding Storage", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockLocalStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    (globalThis as any).window = {
      localStorage: mockLocalStorage,
    };
  });

  it("returns false by default when tour hasn't been completed", () => {
    expect(getHasCompletedTour()).toBe(false);
  });

  it("stores and retrieves tour completion state", () => {
    setHasCompletedTour(true);
    expect(globalThis.window.localStorage.getItem(TOUR_STORAGE_KEY)).toBe("true");
    expect(getHasCompletedTour()).toBe(true);
  });

  it("resets tour completion in localStorage", () => {
    setHasCompletedTour(true);
    expect(getHasCompletedTour()).toBe(true);

    resetTourStorage();
    expect(getHasCompletedTour()).toBe(false);
    expect(globalThis.window.localStorage.getItem(TOUR_STORAGE_KEY)).toBeNull();
  });
});

describe("Onboarding Steps Configuration", () => {
  it("defines 8 tour steps including AI Assistant", () => {
    expect(EDITOR_TOUR_STEPS).toHaveLength(8);
  });

  it("has valid unique step IDs and target selectors", () => {
    const ids = new Set();
    for (const step of EDITOR_TOUR_STEPS) {
      expect(step.id).toBeDefined();
      expect(ids.has(step.id)).toBe(false);
      ids.add(step.id);

      expect(step.targetSelector).toMatch(/^\[data-tour=".*"\]$/);
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it("matches the exact flow steps with AI assistant chat included", () => {
    expect(EDITOR_TOUR_STEPS[0].title).toBe("Welcome to your website editor");
    expect(EDITOR_TOUR_STEPS[0].targetSelector).toBe('[data-tour="canvas-area"]');

    expect(EDITOR_TOUR_STEPS[1].title).toBe("Add new sections");
    expect(EDITOR_TOUR_STEPS[1].targetSelector).toBe('[data-tour="left-rail-add"]');

    expect(EDITOR_TOUR_STEPS[2].title).toBe("Chat with AI Assistant");
    expect(EDITOR_TOUR_STEPS[2].targetSelector).toBe('[data-tour="left-rail-ai"]');

    expect(EDITOR_TOUR_STEPS[3].title).toBe("Manage your pages");
    expect(EDITOR_TOUR_STEPS[3].targetSelector).toBe('[data-tour="page-selector"]');

    expect(EDITOR_TOUR_STEPS[4].title).toBe("Edit directly on the page");
    expect(EDITOR_TOUR_STEPS[4].targetSelector).toBe('[data-tour="canvas-viewport"]');

    expect(EDITOR_TOUR_STEPS[5].title).toBe("Fine-tune every detail");
    expect(EDITOR_TOUR_STEPS[5].targetSelector).toBe('[data-tour="right-inspector"]');

    expect(EDITOR_TOUR_STEPS[6].title).toBe("Check every screen size");
    expect(EDITOR_TOUR_STEPS[6].targetSelector).toBe('[data-tour="device-selector"]');

    expect(EDITOR_TOUR_STEPS[7].title).toBe("Your website is ready");
    expect(EDITOR_TOUR_STEPS[7].targetSelector).toBe('[data-tour="publish-button"]');
  });
});
