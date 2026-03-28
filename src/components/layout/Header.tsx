"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/planning": "Planning",
  "/capacity": "Capaciteit",
  "/drivers": "Chauffeurs",
  "/settings": "Instellingen",
  "/documentatie": "Documentatie",
};

export function Header() {
  const pathname = usePathname();
  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1];

  return (
    <header className="h-14 bg-surface-primary border-b border-border-default flex items-center justify-between px-6">
      {title ? (
        <h1 className="text-page-title">{title}</h1>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-3">
        <span className="text-caption">CapPlan</span>
      </div>
    </header>
  );
}
