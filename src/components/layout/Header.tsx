"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ArrowLeft } from "lucide-react";
import { useHeaderSubtitleValue, useMobileTitleValue, useMobileBackAction } from "@/hooks/useHeaderSubtitle";

const PAGE_TITLES: Record<string, string> = {
  "/planning": "Planning",
  "/capacity": "Capaciteit",
  "/drivers": "Chauffeurs",
  "/settings": "Instellingen",
  "/documentatie": "Releasenotes",
};

export function Header() {
  const pathname = usePathname();
  const subtitle = useHeaderSubtitleValue();
  const mobileTitle = useMobileTitleValue();
  const mobileBackActionRef = useMobileBackAction();
  const { data: session } = useSession();
  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1];
  const isHome = pathname === "/planning" || pathname === "/";
  const showMobileBack = !isHome || !!mobileTitle;
  const mobileDisplayTitle = mobileTitle || title;

  return (
    <header className="h-14 bg-surface-primary flex items-center justify-between px-4 md:px-6 relative z-50">
      <div className="flex items-center gap-2">
        {/* Mobile: back button on non-home routes or when mobile title is set */}
        {showMobileBack && (
          mobileTitle ? (
            <button
              onClick={() => mobileBackActionRef.current?.()}
              className="mobile-menu-btn md:hidden"
              aria-label="Terug naar startscherm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link
              href="/planning"
              className="mobile-menu-btn md:hidden"
              aria-label="Terug naar startscherm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )
        )}

        {/* Mobile: branding on home, page title on subpages */}
        <div className="md:hidden">
          {!showMobileBack ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs tracking-tight">CP</span>
              </div>
              <span className="text-[0.9375rem] font-semibold text-text-primary font-display">
                CapPlan
              </span>
            </div>
          ) : mobileDisplayTitle ? (
            <h1 className="text-page-title">{mobileDisplayTitle}</h1>
          ) : null}
        </div>

        {/* Desktop: page title with subtitle (unchanged) */}
        <div className="hidden md:flex items-baseline gap-3">
          {title && <h1 className="text-page-title">{title}</h1>}
          {subtitle && (
            <span className="text-caption">{subtitle}</span>
          )}
        </div>
      </div>

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
