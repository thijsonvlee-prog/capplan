"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ToastContainer } from "@/components/ui/Toast";
import { HeaderSubtitleProvider } from "@/hooks/useHeaderSubtitle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <HeaderSubtitleProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar — always visible on md+ */}
        <Sidebar />

        {/* Mobile sidebar slide-over */}
        {mobileNavOpen && (
          <>
            <div
              className="mobile-nav-overlay md:hidden"
              onClick={closeMobileNav}
              aria-hidden="true"
            />
            <Sidebar mobile onClose={closeMobileNav} />
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuOpen={openMobileNav} />
          <main className="flex-1 p-4 md:p-6 bg-surface-secondary overflow-auto flex flex-col min-h-0">{children}</main>
        </div>
        <ToastContainer />
      </div>
    </HeaderSubtitleProvider>
  );
}
