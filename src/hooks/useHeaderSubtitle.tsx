"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

const HeaderSubtitleContext = createContext<{
  subtitle: string;
  setSubtitle: (value: string) => void;
  mobileTitle: string;
  setMobileTitle: (value: string) => void;
  mobileBackAction: (() => void) | null;
  setMobileBackAction: (action: (() => void) | null) => void;
}>({ subtitle: "", setSubtitle: () => {}, mobileTitle: "", setMobileTitle: () => {}, mobileBackAction: null, setMobileBackAction: () => {} });

export function HeaderSubtitleProvider({ children }: { children: ReactNode }) {
  const [subtitle, setSubtitle] = useState("");
  const [mobileTitle, setMobileTitle] = useState("");
  const [mobileBackAction, setMobileBackAction] = useState<(() => void) | null>(null);
  return (
    <HeaderSubtitleContext.Provider value={{ subtitle, setSubtitle, mobileTitle, setMobileTitle, mobileBackAction, setMobileBackAction }}>
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

/** Set a mobile-only title override. When set, the header shows this title
 *  with a back arrow instead of branding, even on the "home" route.
 *  Optionally provide a back action callback (used instead of Link navigation). */
export function useMobileTitle(value: string, backAction?: () => void) {
  const { setMobileTitle, setMobileBackAction } = useContext(HeaderSubtitleContext);
  const stableSetTitle = useCallback((v: string) => setMobileTitle(v), [setMobileTitle]);
  const stableSetBack = useCallback((a: (() => void) | null) => setMobileBackAction(a), [setMobileBackAction]);
  useEffect(() => {
    stableSetTitle(value);
    // Only set the back action when the title is actually active
    stableSetBack(value ? (backAction ?? null) : null);
    return () => {
      stableSetTitle("");
      stableSetBack(null);
    };
  }, [value, backAction, stableSetTitle, stableSetBack]);
}

export function useMobileTitleValue() {
  return useContext(HeaderSubtitleContext).mobileTitle;
}

export function useMobileBackAction() {
  return useContext(HeaderSubtitleContext).mobileBackAction;
}
