"use client";

import Link from "next/link";
import { CalendarDays, BarChart3, Users, Settings, FileText, ChevronRight } from "lucide-react";

interface MobileHomescreenProps {
  onNavigateToPlanning: () => void;
}

export function MobileHomescreen({ onNavigateToPlanning }: MobileHomescreenProps) {
  return (
    <div className="mobile-homescreen-grid">
      {/* Hero card: Planning */}
      <button
        onClick={onNavigateToPlanning}
        className="mobile-homescreen-card mobile-homescreen-card--hero text-left"
      >
        <div className="flex items-center gap-3">
          <div className="mobile-homescreen-card-icon bg-white/20">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white">Planning</h3>
            <p className="text-xs text-white/70 mt-0.5">Dagelijkse inzet en roosters beheren</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/50 flex-shrink-0" />
        </div>
      </button>

      {/* Capaciteit */}
      <Link href="/capacity" className="mobile-homescreen-card">
        <div className="mobile-homescreen-card-icon bg-success-50 mb-3">
          <BarChart3 className="w-5 h-5 text-success-600" />
        </div>
        <h3 className="text-[0.8125rem] font-semibold text-text-primary">Capaciteit</h3>
        <p className="text-[0.6875rem] text-text-secondary mt-0.5 leading-relaxed">
          Beschikbaarheid en bezetting analyseren
        </p>
      </Link>

      {/* Chauffeurs */}
      <Link href="/drivers" className="mobile-homescreen-card">
        <div className="mobile-homescreen-card-icon bg-brand-100 mb-3">
          <Users className="w-5 h-5 text-brand-700" />
        </div>
        <h3 className="text-[0.8125rem] font-semibold text-text-primary">Chauffeurs</h3>
        <p className="text-[0.6875rem] text-text-secondary mt-0.5 leading-relaxed">
          Chauffeurgegevens en dossiers
        </p>
      </Link>

      {/* Instellingen */}
      <Link href="/settings" className="mobile-homescreen-card">
        <div className="mobile-homescreen-card-icon bg-surface-tertiary mb-3">
          <Settings className="w-5 h-5 text-text-secondary" />
        </div>
        <h3 className="text-[0.8125rem] font-semibold text-text-primary">Instellingen</h3>
        <p className="text-[0.6875rem] text-text-secondary mt-0.5 leading-relaxed">
          Stamgegevens en configuratie
        </p>
      </Link>

      {/* Releasenotes */}
      <Link href="/documentatie" className="mobile-homescreen-card">
        <div className="mobile-homescreen-card-icon bg-warning-50 mb-3">
          <FileText className="w-5 h-5 text-warning-700" />
        </div>
        <h3 className="text-[0.8125rem] font-semibold text-text-primary">Releasenotes</h3>
        <p className="text-[0.6875rem] text-text-secondary mt-0.5 leading-relaxed">
          Nieuwe functies en verbeteringen
        </p>
      </Link>
    </div>
  );
}
