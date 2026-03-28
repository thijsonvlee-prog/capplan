"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Global invalidation system
const listeners = new Set<() => void>();

export function invalidate() {
  listeners.forEach((l) => l());
}

// In-memory cache: stale-while-revalidate
const cache = new Map<string, unknown>();

function cacheKey(fetcher: Function, deps: unknown[]): string {
  return fetcher.toString() + "|" + JSON.stringify(deps);
}

// Hook that fetches data and refetches on invalidation.
// Returns cached data immediately on re-mount so pages don't flash empty.
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  defaultValue: T
): T {
  const key = cacheKey(fetcher, deps);
  const [data, setData] = useState<T>(
    () => (cache.has(key) ? (cache.get(key) as T) : defaultValue)
  );
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const keyRef = useRef(key);
  keyRef.current = key;

  const doFetch = useCallback(() => {
    fetcherRef
      .current()
      .then((result) => {
        cache.set(keyRef.current, result);
        setData(result);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Always fetch fresh data on mount / dep change
    doFetch();
    const cb = () => doFetch();
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}

// Helper for mutations that auto-invalidates
export async function mutate<T>(fn: () => Promise<T>): Promise<T> {
  const result = await fn();
  invalidate();
  return result;
}
