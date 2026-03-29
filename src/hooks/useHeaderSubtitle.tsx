"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

const HeaderSubtitleContext = createContext<{
  subtitle: string;
  setSubtitle: (value: string) => void;
}>({ subtitle: "", setSubtitle: () => {} });

export function HeaderSubtitleProvider({ children }: { children: ReactNode }) {
  const [subtitle, setSubtitle] = useState("");
  return (
    <HeaderSubtitleContext.Provider value={{ subtitle, setSubtitle }}>
      {children}
    </HeaderSubtitleContext.Provider>
  );
}

export function useHeaderSubtitle(value: string) {
  const { setSubtitle } = useContext(HeaderSubtitleContext);
  const stableSet = useCallback((v: string) => setSubtitle(v), [setSubtitle]);
  useEffect(() => {
    stableSet(value);
    return () => stableSet("");
  }, [value, stableSet]);
}

export function useHeaderSubtitleValue() {
  return useContext(HeaderSubtitleContext).subtitle;
}
