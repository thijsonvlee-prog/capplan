"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarDays, BarChart3, Users, Settings, FileText, ShieldCheck, Shield, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const navItems = [
  { href: "/planning", label: "Planning", icon: CalendarDays },
  { href: "/capacity", label: "Capaciteit", icon: BarChart3 },
  { href: "/drivers", label: "Chauffeurs", icon: Users },
  { href: "/settings", label: "Instellingen", icon: Settings },
  { href: "/documentatie", label: "Documentatie", icon: FileText },
];

const SIDEBAR_ROLE_CONFIG: Record<string, { label: string; icon: typeof Shield }> = {
  ADMIN: { label: "Admin", icon: ShieldCheck },
  PLANNER: { label: "Planner", icon: Shield },
  VIEWER: { label: "Kijker", icon: Eye },
};

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const roleConfig = user?.role ? SIDEBAR_ROLE_CONFIG[user.role] ?? null : null;

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobile && onClose) {
      onClose();
    }
    // Only trigger on pathname change for mobile
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside
      className={cn(
        "bg-sidebar-bg text-sidebar-text flex flex-col",
        mobile
          ? "mobile-nav-panel h-full"
          : "w-60 min-h-screen hidden md:flex"
      )}
    >
      {/* Brand mark */}
      <div className="px-5 pt-6 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tight">CP</span>
          </div>
          <div>
            <h1 className="text-[0.9375rem] font-semibold text-white leading-tight tracking-tight">CapPlan</h1>
            <p className="text-[0.6875rem] text-sidebar-text leading-tight">Chauffeurplanning</p>
          </div>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors"
            aria-label="Menu sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 rounded-lg text-[0.8125rem] font-medium transition-colors",
                mobile ? "py-2.5" : "py-2",
                isActive
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
              )}
            >
              <item.icon className={cn("w-[1.125rem] h-[1.125rem]", isActive ? "text-white" : "text-sidebar-text")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section — user identity + version */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        {user ? (
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0">
              <span className="text-[0.6875rem] font-semibold text-white/80">
                {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.75rem] font-medium text-white/90 truncate leading-tight">
                {user.name ?? user.email}
              </p>
              {roleConfig && (
                <span className="inline-flex items-center gap-1 mt-0.5 text-[0.625rem] font-medium text-sidebar-text/70 uppercase tracking-wider">
                  <roleConfig.icon className="w-3 h-3" />
                  {roleConfig.label}
                </span>
              )}
            </div>
          </div>
        ) : null}
        <span className="text-[0.6875rem] text-sidebar-text/40">v2.0</span>
      </div>
    </aside>
  );
}
