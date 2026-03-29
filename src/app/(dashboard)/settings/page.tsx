"use client";

import { useState, useMemo } from "react";
import { SkillManager } from "@/components/settings/SkillManager";
import { StamtabelManager } from "@/components/settings/StamtabelManager";
import { RosterProfileEditor } from "@/components/settings/RosterProfileEditor";
import { useApiDataWithLoading, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";

type TabKey = "stamgegevens" | "competenties" | "roosters";

const TABS: { key: TabKey; label: string }[] = [
  { key: "stamgegevens", label: "Stamgegevens" },
  { key: "competenties", label: "Competenties" },
  { key: "roosters", label: "Roosters" },
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
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("stamgegevens");

  const [employers, employersLoading] = useApiDataWithLoading(() => api.settings.getEmployers(), [], []);
  const [departments, departmentsLoading] = useApiDataWithLoading(() => api.settings.getDepartments(), [], []);
  const [locations, locationsLoading] = useApiDataWithLoading(() => api.settings.getLocations(), [], []);
  const [leaveTypes, leaveTypesLoading] = useApiDataWithLoading(() => api.settings.getLeaveTypes(), [], []);

  const tabCounts = useMemo(() => ({
    stamgegevens: employers.length + departments.length + locations.length + leaveTypes.length,
    competenties: null,
    roosters: null,
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
        {TABS.map((tab) => (
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
            onCreate={(code, desc) => toastMutate(() => api.settings.createEmployer(code, desc), "Werkgever toegevoegd")}
            onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateEmployer(id, code, desc), "Werkgever bijgewerkt")}
            onDelete={(id) => toastMutate(() => api.settings.deleteEmployer(id), "Werkgever verwijderd")}
          />
          <StamtabelManager
            title="Afdelingen"
            description="Beschikbaar in het chauffeurscherm bij het toevoegen van dienstverbanden."
            records={departments}
            loading={departmentsLoading}
            onCreate={(code, desc) => toastMutate(() => api.settings.createDepartment(code, desc), "Afdeling toegevoegd")}
            onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateDepartment(id, code, desc), "Afdeling bijgewerkt")}
            onDelete={(id) => toastMutate(() => api.settings.deleteDepartment(id), "Afdeling verwijderd")}
          />
          <StamtabelManager
            title="Standplaatsen"
            description="Beschikbaar in het chauffeurscherm bij het toevoegen van dienstverbanden."
            records={locations}
            loading={locationsLoading}
            onCreate={(code, desc) => toastMutate(() => api.settings.createLocation(code, desc), "Standplaats toegevoegd")}
            onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateLocation(id, code, desc), "Standplaats bijgewerkt")}
            onDelete={(id) => toastMutate(() => api.settings.deleteLocation(id), "Standplaats verwijderd")}
          />
          <StamtabelManager
            title="Verloftypes"
            description="Beschikbaar bij de categorie Verlof in het planningsscherm."
            records={leaveTypes}
            loading={leaveTypesLoading}
            onCreate={(code, desc) => toastMutate(() => api.settings.createLeaveType(code, desc), "Verloftype toegevoegd")}
            onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateLeaveType(id, code, desc), "Verloftype bijgewerkt")}
            onDelete={(id) => toastMutate(() => api.settings.deleteLeaveType(id), "Verloftype verwijderd")}
          />
        </div>
      )}

      {activeTab === "competenties" && <SkillManager />}

      {activeTab === "roosters" && <RosterProfileEditor />}
    </div>
  );
}
