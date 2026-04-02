"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";

const HeaderSubtitleContext = createContext<{
  subtitle: string;
  setSubtitle: (value: string) => void;
  mobileTitle: string;
  setMobileTitle: (value: string) => void;
  mobileBackActionRef: RefObject<(() => void) | null>;
}>({
  subtitle: "",
  setSubtitle: () => {},
  mobileTitle: "",
  setMobileTitle: () => {},
  mobileBackActionRef: { current: null },
});

export function HeaderSubtitleProvider({ children }: { children: ReactNode }) {
  const [subtitle, setSubtitle] = useState("");
  const [mobileTitle, setMobileTitle] = useState("");
  const mobileBackActionRef = useRef<(() => void) | null>(null);
  return (
    <HeaderSubtitleContext.Provider value={{ subtitle, setSubtitle, mobileTitle, setMobileTitle, mobileBackActionRef }}>
      {children}
    </HeaderSubtitleContext.Provider>
  );
}

export function useHeaderSubtitle(value: string) {
  const { setSubtitle } = useContext(HeaderSubtitleContext);
  useEffect(() => {
    setSubtitle(value);
    return () => setSubtitle("");
  }, [value, setSubtitle]);
}

export function useHeaderSubtitleValue() {
  return useContext(HeaderSubtitleContext).subtitle;
}

/** Set a mobile-only title override with an optional back action callback. */
export function useMobileTitle(value: string, backAction?: () => void) {
  const { setMobileTitle, mobileBackActionRef } = useContext(HeaderSubtitleContext);

  useEffect(() => {
    setMobileTitle(value);
    mobileBackActionRef.current = value ? (backAction ?? null) : null;
    return () => {
      setMobileTitle("");
      mobileBackActionRef.current = null;
    };
  }, [value, backAction, setMobileTitle, mobileBackActionRef]);
}

export function useMobileTitleValue() {
  return useContext(HeaderSubtitleContext).mobileTitle;
}

export function useMobileBackAction() {
  return useContext(HeaderSubtitleContext).mobileBackActionRef;
}
