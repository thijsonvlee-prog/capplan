"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const { setMobileTitle, setMobileBackAction } = useContext(HeaderSubtitleContext);
  const backActionRef = useRef(backAction);

  useEffect(() => {
    backActionRef.current = backAction;
  }, [backAction]);

  useEffect(() => {
    setMobileTitle(value);
    if (value) {
      setMobileBackAction(() => backActionRef.current?.());
    } else {
      setMobileBackAction(null);
    }
    return () => {
      setMobileTitle("");
      setMobileBackAction(null);
    };
  }, [value, setMobileTitle, setMobileBackAction]);
}

export function useMobileTitleValue() {
  return useContext(HeaderSubtitleContext).mobileTitle;
}

export function useMobileBackAction() {
  return useContext(HeaderSubtitleContext).mobileBackAction;
}
