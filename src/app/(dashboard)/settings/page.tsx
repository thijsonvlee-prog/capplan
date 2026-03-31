"use client";

import { useState, useMemo } from "react";
import { SkillManager } from "@/components/settings/SkillManager";
import { StamtabelManager } from "@/components/settings/StamtabelManager";
import { RosterProfileEditor } from "@/components/settings/RosterProfileEditor";
import { ImportSourceManager } from "@/components/settings/ImportSourceManager";
import { UserManager } from "@/components/settings/UserManager";
import { UserGroupManager } from "@/components/settings/UserGroupManager";
import { useApiDataWithLoading, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import { useUserRole } from "@/hooks/useUserRole";

type TabKey = "stamgegevens" | "competenties" | "roosters" | "connectiviteit" | "gebruikers" | "gebruikersgroepen";

const TABS: { key: TabKey; label: string }[] = [
  { key: "stamgegevens", label: "Stamgegevens" },
  { key: "competenties", label: "Competenties" },
  { key: "roosters", label: "Roosters" },
  { key: "connectiviteit", label: "Connectiviteit" },
  { key: "gebruikers", label: "Gebruikers" },
  { key: "gebruikersgroepen", label: "Gebruikersgroepen" },
];

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
};

export default function SettingsPage() {
  const { canWriteSettings } = useUserRole();
  const [activeTab, setActiveTab] = useState<TabKey>("stamgegevens");

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
  }), [employers.length, departments.length, locations.length, leaveTypes.length]);

  function toastMutate(fn: () => Promise<unknown>, successMsg: string) {
    mutate(fn)
      .then(() => showToast(successMsg))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
  }

  const sectionInfo = TAB_DESCRIPTIONS[activeTab];

  return (
    <div className="max-w-3xl">
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

      <nav className="settings-tabs" role="tablist" aria-label="Instellingencategorieën">
        {TABS.filter((tab) => (tab.key !== "gebruikers" && tab.key !== "gebruikersgroepen") || canWriteSettings).map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            data-active={activeTab === tab.key}
            className="settings-tab"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tabCounts[tab.key] !== null && (
              <span className="settings-tab-badge">{tabCounts[tab.key]}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="settings-section-intro">
        <h2 className="settings-section-title">{sectionInfo.title}</h2>
        <p className="settings-section-desc">{sectionInfo.desc}</p>
      </div>

      {activeTab === "stamgegevens" && (
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
      )}

      {activeTab === "competenties" && <SkillManager readOnly={!canWriteSettings} />}

      {activeTab === "roosters" && <RosterProfileEditor readOnly={!canWriteSettings} />}

      {activeTab === "connectiviteit" && <ImportSourceManager readOnly={!canWriteSettings} />}

      {activeTab === "gebruikers" && canWriteSettings && <UserManager />}

      {activeTab === "gebruikersgroepen" && canWriteSettings && <UserGroupManager />}
    </div>
  );
}
