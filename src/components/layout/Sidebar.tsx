"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, BarChart3, Users, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/planning", label: "Planning", icon: CalendarDays },
  { href: "/capacity", label: "Capaciteit", icon: BarChart3 },
  { href: "/drivers", label: "Chauffeurs", icon: Users },
  { href: "/settings", label: "Instellingen", icon: Settings },
  { href: "/documentatie", label: "Documentatie", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-sidebar-bg text-sidebar-text min-h-screen flex flex-col">
      {/* Brand mark */}
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tight">CP</span>
          </div>
          <div>
            <h1 className="text-[0.9375rem] font-semibold text-white leading-tight tracking-tight">CapPlan</h1>
            <p className="text-[0.6875rem] text-sidebar-text leading-tight">Chauffeurplanning</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[0.8125rem] font-medium transition-colors",
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

      {/* Bottom section */}
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <span className="text-[0.6875rem] text-sidebar-text/60">v2.0</span>
      </div>
    </aside>
  );
}
