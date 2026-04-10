"use client";

import { useState, useMemo, useCallback } from "react";
import { SkillManager } from "@/components/settings/SkillManager";
import { StamtabelManager } from "@/components/settings/StamtabelManager";
import { RosterProfileEditor } from "@/components/settings/RosterProfileEditor";
import { ImportSourceManager } from "@/components/settings/ImportSourceManager";
import { UserManager } from "@/components/settings/UserManager";
import { UserGroupManager } from "@/components/settings/UserGroupManager";
import { AuditLogViewer } from "@/components/settings/AuditLogViewer";
import { useApiDataWithLoading, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useMobileTitle } from "@/hooks/useHeaderSubtitle";
import { Database, Award, CalendarClock, Link2, Users, UsersRound, ScrollText, ChevronRight } from "lucide-react";

type TabKey = "stamgegevens" | "competenties" | "roosters" | "connectiviteit" | "gebruikers" | "gebruikersgroepen" | "auditlog";

const TABS: { key: TabKey; label: string }[] = [
  { key: "stamgegevens", label: "Stamgegevens" },
  { key: "competenties", label: "Competenties" },
  { key: "roosters", label: "Roosters" },
  { key: "connectiviteit", label: "Connectiviteit" },
  { key: "gebruikers", label: "Gebruikers" },
  { key: "gebruikersgroepen", label: "Gebruikersgroepen" },
  { key: "auditlog", label: "Auditlog" },
];

const TAB_ICONS: Record<TabKey, React.ComponentType<{ className?: string }>> = {
  stamgegevens: Database,
  competenties: Award,
  roosters: CalendarClock,
  connectiviteit: Link2,
  gebruikers: Users,
  gebruikersgroepen: UsersRound,
  auditlog: ScrollText,
};

const TAB_ICON_STYLES: Record<TabKey, { bg: string; text: string }> = {
  stamgegevens: { bg: "bg-brand-50", text: "text-brand-600" },
  competenties: { bg: "bg-success-50", text: "text-success-700" },
  roosters: { bg: "bg-warning-50", text: "text-warning-700" },
  connectiviteit: { bg: "bg-surface-tertiary", text: "text-text-secondary" },
  gebruikers: { bg: "bg-brand-50", text: "text-brand-600" },
  gebruikersgroepen: { bg: "bg-success-50", text: "text-success-700" },
  auditlog: { bg: "bg-surface-tertiary", text: "text-text-secondary" },
};

const TAB_DESCRIPTIONS: Record<TabKey, { title: string; desc: string }> = {
  stamgegevens: {
    title: "Stamgegevens beheren",
    desc: "Werkgevers, afdelingen, standplaatsen en verloftypes die in de rest van de applicatie beschikbaar zijn.",
  },
  competenties: {
    title: "Competenties beheren",
    desc: "Vaardigheden die aan chauffeurs gekoppeld kunnen worden voor planning en filtering.",
  },
  roosters: {
    title: "Roosterprofielen beheren",
    desc: "Cyclische roosters van 4 weken die aan chauffeurs toegewezen kunnen worden.",
  },
  connectiviteit: {
    title: "Importbronnen beheren",
    desc: "CSV-importconfiguraties met veldkoppelingen voor het automatisch inlezen van gegevens uit externe systemen.",
  },
  gebruikers: {
    title: "Gebruikersbeheer",
    desc: "Bekijk alle gebruikers en beheer hun rollen. Gebruikers worden automatisch aangemaakt bij de eerste aanmelding.",
  },
  gebruikersgroepen: {
    title: "Gebruikersgroepen beheren",
    desc: "Maak groepen aan en koppel afdelingen. Leden van een groep zien alleen chauffeurs en planning van hun afdelingen.",
  },
  auditlog: {
    title: "Auditlogboek",
    desc: "Overzicht van alle mutaties in de applicatie. Filter op tabel, actie of datumbereik om specifieke wijzigingen te vinden.",
  },
};

export default function SettingsPage() {
  const { canWriteSettings } = useUserRole();
  const [activeTab, setActiveTab] = useState<TabKey>("stamgegevens");
  // Mobile: null = show section list, string = show content for that section
  const [mobileSectionOpen, setMobileSectionOpen] = useState<TabKey | null>(null);

  const handleMobileSectionBack = useCallback(() => setMobileSectionOpen(null), []);

  // When a mobile section is open, show its title in the header with back arrow
  const mobileSectionTitle = mobileSectionOpen ? TAB_DESCRIPTIONS[mobileSectionOpen].title : "";
  useMobileTitle(mobileSectionTitle, handleMobileSectionBack);

  const [employers, employersLoading, employersError] = useApiDataWithLoading(() => api.settings.getEmployers(), [], []);
  const [departments, departmentsLoading, departmentsError] = useApiDataWithLoading(() => api.settings.getDepartments(), [], []);
  const [locations, locationsLoading, locationsError] = useApiDataWithLoading(() => api.settings.getLocations(), [], []);
  const [leaveTypes, leaveTypesLoading, leaveTypesError] = useApiDataWithLoading(() => api.settings.getLeaveTypes(), [], []);

  const tabCounts = useMemo((): Record<TabKey, number | null> => ({
    stamgegevens: employers.length + departments.length + locations.length + leaveTypes.length,
    competenties: null,
    roosters: null,
    connectiviteit: null,
    gebruikers: null,
    gebruikersgroepen: null,
    auditlog: null,
  }), [employers.length, departments.length, locations.length, leaveTypes.length]);

  function toastMutate(fn: () => Promise<unknown>, successMsg: string) {
    mutate(fn)
      .then(() => showToast(successMsg))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
  }

  const sectionInfo = TAB_DESCRIPTIONS[activeTab];
  const visibleTabs = TABS.filter((tab) => (tab.key !== "gebruikers" && tab.key !== "gebruikersgroepen" && tab.key !== "auditlog") || canWriteSettings);

  function renderTabContent(tab: TabKey) {
    switch (tab) {
      case "stamgegevens": return (
        <div className="space-y-6">
          <StamtabelManager
            title="Werkgevers"
            description="Beschikbaar in het chauffeurscherm bij het toevoegen van dienstverbanden."
            records={employers}
            loading={employersLoading}
            error={employersError}
            readOnly={!canWriteSettings}
            onCreate={(code, desc) => toastMutate(() => api.settings.createEmployer(code, desc), "Werkgever toegevoegd")}
            onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateEmployer(id, code, desc), "Werkgever bijgewerkt")}
            onDelete={(id) => toastMutate(() => api.settings.deleteEmployer(id), "Werkgever verwijderd")}
          />
          <StamtabelManager
            title="Afdelingen"
            description="Beschikbaar in het chauffeurscherm bij het toevoegen van dienstverbanden."
            records={departments}
            loading={departmentsLoading}
            error={departmentsError}
            readOnly={!canWriteSettings}
            onCreate={(code, desc) => toastMutate(() => api.settings.createDepartment(code, desc), "Afdeling toegevoegd")}
            onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateDepartment(id, code, desc), "Afdeling bijgewerkt")}
            onDelete={(id) => toastMutate(() => api.settings.deleteDepartment(id), "Afdeling verwijderd")}
          />
          <StamtabelManager
            title="Standplaatsen"
            description="Beschikbaar in het chauffeurscherm bij het toevoegen van dienstverbanden."
            records={locations}
            loading={locationsLoading}
            error={locationsError}
            readOnly={!canWriteSettings}
            onCreate={(code, desc) => toastMutate(() => api.settings.createLocation(code, desc), "Standplaats toegevoegd")}
            onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateLocation(id, code, desc), "Standplaats bijgewerkt")}
            onDelete={(id) => toastMutate(() => api.settings.deleteLocation(id), "Standplaats verwijderd")}
          />
          <StamtabelManager
            title="Verloftypes"
            description="Beschikbaar bij de categorie Verlof in het planningsscherm."
            records={leaveTypes}
            loading={leaveTypesLoading}
            error={leaveTypesError}
            readOnly={!canWriteSettings}
            onCreate={(code, desc) => toastMutate(() => api.settings.createLeaveType(code, desc), "Verloftype toegevoegd")}
            onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateLeaveType(id, code, desc), "Verloftype bijgewerkt")}
            onDelete={(id) => toastMutate(() => api.settings.deleteLeaveType(id), "Verloftype verwijderd")}
          />
        </div>
      );
      case "competenties": return <SkillManager readOnly={!canWriteSettings} />;
      case "roosters": return <RosterProfileEditor readOnly={!canWriteSettings} />;
      case "connectiviteit": return <ImportSourceManager readOnly={!canWriteSettings} />;
      case "gebruikers": return canWriteSettings ? <UserManager /> : null;
      case "gebruikersgroepen": return canWriteSettings ? <UserGroupManager /> : null;
      case "auditlog": return canWriteSettings ? <AuditLogViewer /> : null;
      default: return null;
    }
  }

  return (
    <div className={activeTab === "auditlog" || mobileSectionOpen === "auditlog" ? "max-w-5xl" : "max-w-3xl"}>
      {/* Desktop layout: tabs + content */}
      <div className="hidden md:block">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="text-page-title">Instellingen</h1>
              <p className="text-text-secondary text-sm mt-1">
                Configuratie en referentiegegevens voor de gehele applicatie.
              </p>
            </div>
          </div>
        </div>

        <nav className="tab-bar" role="tablist" aria-label="Instellingencategorieën">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              data-active={activeTab === tab.key}
              className="tab-item"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tabCounts[tab.key] !== null && (
                <span className="tab-item-badge">{tabCounts[tab.key]}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="settings-section-intro">
          <h2 className="settings-section-title">{sectionInfo.title}</h2>
          <p className="settings-section-desc">{sectionInfo.desc}</p>
        </div>

        {renderTabContent(activeTab)}
      </div>

      {/* Mobile layout: section cards or section content */}
      <div className="md:hidden">
        {mobileSectionOpen === null ? (
          <div className="mobile-settings-sections mobile-page-enter">
            {visibleTabs.map((tab) => {
              const Icon = TAB_ICONS[tab.key];
              const iconStyle = TAB_ICON_STYLES[tab.key];
              const desc = TAB_DESCRIPTIONS[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setMobileSectionOpen(tab.key)}
                  className="mobile-settings-section-card"
                >
                  <div className={`mobile-settings-section-icon ${iconStyle.bg} ${iconStyle.text}`}>
                    <Icon className="w-[1.125rem] h-[1.125rem]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary">{tab.label}</div>
                    <div className="text-xs text-text-secondary mt-0.5 line-clamp-1">{desc.desc}</div>
                  </div>
                  {tabCounts[tab.key] !== null && (
                    <span className="text-xs font-medium text-text-tertiary bg-surface-tertiary rounded-full px-2 py-0.5 flex-shrink-0">
                      {tabCounts[tab.key]}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mobile-page-enter">
            <div className="mb-4">
              <p className="text-xs text-text-secondary">{TAB_DESCRIPTIONS[mobileSectionOpen].desc}</p>
            </div>
            {renderTabContent(mobileSectionOpen)}
          </div>
        )}
      </div>
    </div>
  );
}
