"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Users,
  UserPlus,
  Clock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/planning", label: "Planning", icon: CalendarDays },
  { href: "/drivers", label: "Chauffeurs", icon: Users },
  { href: "/external-hires", label: "Inhuur", icon: UserPlus },
  { href: "/hours", label: "Uren", icon: Clock },
];

const adminItems = [
  { href: "/admin", label: "AFAS Sync", icon: RefreshCw },
  { href: "/admin/audit", label: "Audit Log", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">CapPlan</h1>
        <p className="text-gray-400 text-sm">Driver Planning Tool</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname.startsWith(item.href)
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-700">
          <p className="px-3 text-xs text-gray-500 uppercase mb-2">Admin</p>
          {adminItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
