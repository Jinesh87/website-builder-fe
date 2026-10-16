import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type PreloadableComponent<T extends ComponentType<any>> =
  LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };

interface RetryOptions {
  retries?: number;
  interval?: number;
  reloadKey?: string;
}

const CHUNK_LOAD_ERROR_PATTERN =
  /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: RetryOptions = {},
): PreloadableComponent<T> {
  const {
    retries = 2,
    interval = 800,
    reloadKey = "chunk_reload_lock",
  } = options;

  let cachedPromise: Promise<{ default: T }> | null = null;

  const load = async (attemptsLeft = retries): Promise<{ default: T }> => {
    try {
      return await factory();
    } catch (error: unknown) {
      const err = error as Error | undefined;
      const isChunkError =
        err?.message && CHUNK_LOAD_ERROR_PATTERN.test(err.message);

      if (attemptsLeft > 0) {
        await wait(interval);
        return load(attemptsLeft - 1);
      }

      if (typeof window !== "undefined" && isChunkError) {
        const storageKey = `ag_${reloadKey}_${window.location.pathname}`;
        const hasReloaded = window.sessionStorage.getItem(storageKey);

        if (!hasReloaded) {
          window.sessionStorage.setItem(storageKey, "true");
          window.location.reload();
          return new Promise(() => {});
        }
      }

      throw error;
    }
  };

  const preload = () => {
    if (!cachedPromise) {
      cachedPromise = load().catch((err) => {
        cachedPromise = null;
        throw err;
      });
    }
    return cachedPromise;
  };

  const LazyComponent = lazy(() => preload()) as PreloadableComponent<T>;
  LazyComponent.preload = preload;

  return LazyComponent;
}
