"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
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
  const { data: session } = useSession();
  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1];

  return (
    <header className="h-14 bg-surface-primary flex items-center justify-between px-6">
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

      {session?.user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={28}
                height={28}
                className="rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-[0.6875rem] font-semibold text-brand-700">
                  {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-[0.8125rem] font-medium text-text-primary hidden sm:inline">
              {session.user.name ?? session.user.email}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-icon"
            aria-label="Uitloggen"
            title="Uitloggen"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
