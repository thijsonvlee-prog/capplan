"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Global invalidation system
const listeners = new Set<() => void>();

export function invalidate() {
  listeners.forEach((l) => l());
}

// In-memory cache with freshness tracking
interface CacheEntry {
  data: unknown;
  fetchedAt: number;
}
const cache = new Map<string, CacheEntry>();
const STALE_MS = 30_000; // consider data fresh for 30 seconds

function cacheKey(fetcher: Function, deps: unknown[]): string {
  return fetcher.toString() + "|" + JSON.stringify(deps);
}

/**
 * Fetches data from the API with caching and selective refetching.
 *
 * - Returns cached data immediately on re-mount (no empty flash).
 * - Skips refetch if cache is fresh (<30 s) — prevents visible shifting
 *   when navigating between pages.
 * - Still refetches on explicit `invalidate()` or when deps change.
 * - Returns an `error` field (string | null) when a fetch fails.
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  defaultValue: T
): T {
  const key = cacheKey(fetcher, deps);
  const entry = cache.get(key);
  const [data, setData] = useState<T>(
    () => (entry ? (entry.data as T) : defaultValue)
  );
  const fetcherRef = useRef(fetcher);
  const keyRef = useRef(key);

  useEffect(() => {
    fetcherRef.current = fetcher;
    keyRef.current = key;
  });

  const doFetch = useCallback(() => {
    fetcherRef
      .current()
      .then((result) => {
        cache.set(keyRef.current, { data: result, fetchedAt: Date.now() });
        setData(result);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Only fetch if cache is missing or stale
    const cached = cache.get(key);
    const isFresh = cached && Date.now() - cached.fetchedAt < STALE_MS;
    if (!isFresh) doFetch();

    // Listen for explicit invalidation
    const cb = () => doFetch();
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}

/**
 * Same as useApiData but also returns loading and error state.
 * Returns a tuple [data, loading, error] where:
 * - loading is true during the initial fetch
 * - error is a string message when the most recent fetch failed, null otherwise
 */
export function useApiDataWithLoading<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  defaultValue: T
): [T, boolean, string | null] {
  const key = cacheKey(fetcher, deps);
  const entry = cache.get(key);
  const [data, setData] = useState<T>(
    () => (entry ? (entry.data as T) : defaultValue)
  );
  const [loading, setLoading] = useState(() => !entry);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  const keyRef = useRef(key);

  useEffect(() => {
    fetcherRef.current = fetcher;
    keyRef.current = key;
  });

  const doFetch = useCallback(() => {
    fetcherRef
      .current()
      .then((result) => {
        cache.set(keyRef.current, { data: result, fetchedAt: Date.now() });
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Onbekende fout bij ophalen gegevens");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const cached = cache.get(key);
    const isFresh = cached && Date.now() - cached.fetchedAt < STALE_MS;
    if (!isFresh) doFetch();

    const cb = () => doFetch();
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return [data, loading, error];
}

// Helper for mutations that auto-invalidates
export async function mutate<T>(fn: () => Promise<T>): Promise<T> {
  const result = await fn();
  invalidate();
  return result;
}
