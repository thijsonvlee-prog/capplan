"use client";

import { usePathname } from "next/navigation";
import { useHeaderSubtitleValue } from "@/hooks/useHeaderSubtitle";

const PAGE_TITLES: Record<string, string> = {
  "/planning": "Planning",
  "/capacity": "Capaciteit",
  "/drivers": "Chauffeurs",
  "/settings": "Instellingen",
  "/documentatie": "Documentatie",
};

export function Header() {
  const pathname = usePathname();
  const subtitle = useHeaderSubtitleValue();
  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1];

  return (
    <header className="h-14 bg-surface-primary flex items-center px-6">
      {title ? (
        <div className="flex items-baseline gap-3">
          <h1 className="text-page-title">{title}</h1>
          {subtitle && (
            <span className="text-caption">{subtitle}</span>
          )}
        </div>
      ) : (
        <div />
      )}
    </header>
  );
}
