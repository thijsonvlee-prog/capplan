"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Global invalidation system (replaces localStorage notify pattern)
const listeners = new Set<() => void>();
let invalidationVersion = 0;

export function invalidate() {
  invalidationVersion++;
  listeners.forEach((l) => l());
}

// Hook that fetches data and refetches on invalidation
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
  defaultValue: T
): T {
  const [data, setData] = useState<T>(defaultValue);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const doFetch = useCallback(() => {
    fetcherRef.current().then(setData).catch(console.error);
  }, []);

  useEffect(() => {
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
