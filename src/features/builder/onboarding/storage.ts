export const TOUR_STORAGE_KEY = "editor_onboarding_completed";

/**
 * Checks if the user has previously completed or dismissed the onboarding tour.
 */
export function getHasCompletedTour(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks the tour as completed in localStorage.
 */
export function setHasCompletedTour(completed: boolean): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      if (completed) {
        window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
      } else {
        window.localStorage.removeItem(TOUR_STORAGE_KEY);
      }
    }
  } catch {
    // Graceful fallback if localStorage is unavailable
  }
}

/**
 * Resets the tour completion state so the tour can be triggered again.
 */
export function resetTourStorage(): void {
  setHasCompletedTour(false);
}
