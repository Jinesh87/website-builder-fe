import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { errorMessage } from "../api/http.ts";

export type InfinitePage<T> = { items: T[]; hasMore: boolean };

/**
 * A list loaded a page at a time: page 1 whenever `key` changes (a new search or filter), then
 * `loadMore()` appends the next page. Answers for an older key are dropped, so fast typing can't
 * show stale results.
 */
export function useInfiniteList<T>(key: string, fetchPage: (page: number) => Promise<InfinitePage<T>>, enabled = true) {
  const [items, setItems] = useState<T[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(0);
  const requestRef = useRef(0);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const load = useCallback(async (page: number) => {
    const request = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRef.current(page);
      if (request !== requestRef.current) return;
      pageRef.current = page;
      setItems((current) => (page === 1 ? result.items : [...(current ?? []), ...result.items]));
      setHasMore(result.hasMore);
    } catch (err) {
      if (request === requestRef.current) setError(errorMessage(err));
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    setItems(null);
    setHasMore(false);
    void load(1);
  }, [key, enabled, load]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) void load(pageRef.current + 1);
  }, [loading, hasMore, load]);

  /** Starts again from page 1 with the same search, e.g. after stock changed. */
  const reload = useCallback(() => void load(1), [load]);

  return { items, hasMore, loading, error, loadMore, reload, setItems };
}

/** Calls `onVisible` when `sentinel` scrolls near view (inside `root`, or the window), for "load more on scroll". */
export function useLoadMoreSentinel(
  sentinel: RefObject<Element | null>,
  onVisible: () => void,
  enabled: boolean,
  root?: RefObject<Element | null>,
) {
  const callback = useRef(onVisible);
  callback.current = onVisible;
  useEffect(() => {
    const target = sentinel.current;
    if (!enabled || !target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) callback.current();
      },
      { root: root?.current ?? null, rootMargin: "300px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  });
}
