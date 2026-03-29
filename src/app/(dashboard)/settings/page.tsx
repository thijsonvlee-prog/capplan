"use client";

import { SkillManager } from "@/components/settings/SkillManager";
import { StamtabelManager } from "@/components/settings/StamtabelManager";
import { RosterProfileEditor } from "@/components/settings/RosterProfileEditor";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const employers = useApiData(() => api.settings.getEmployers(), [], []);
  const departments = useApiData(() => api.settings.getDepartments(), [], []);
  const locations = useApiData(() => api.settings.getLocations(), [], []);
  const leaveTypes = useApiData(() => api.settings.getLeaveTypes(), [], []);

  function toastMutate(fn: () => Promise<unknown>, successMsg: string) {
    mutate(fn)
      .then(() => showToast(successMsg))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
  }

  return (
    <div>
      {/* Page title is shown in the header */}
      <div className="max-w-2xl space-y-6">
        <StamtabelManager
          title="Werkgevers"
          description="Beheer werkgevers die in het chauffeurscherm beschikbaar zijn."
          records={employers}
          onCreate={(code, desc) => toastMutate(() => api.settings.createEmployer(code, desc), "Werkgever toegevoegd")}
          onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateEmployer(id, code, desc), "Werkgever bijgewerkt")}
          onDelete={(id) => toastMutate(() => api.settings.deleteEmployer(id), "Werkgever verwijderd")}
        />
        <StamtabelManager
          title="Afdelingen"
          description="Beheer afdelingen die in het chauffeurscherm beschikbaar zijn."
          records={departments}
          onCreate={(code, desc) => toastMutate(() => api.settings.createDepartment(code, desc), "Afdeling toegevoegd")}
          onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateDepartment(id, code, desc), "Afdeling bijgewerkt")}
          onDelete={(id) => toastMutate(() => api.settings.deleteDepartment(id), "Afdeling verwijderd")}
        />
        <StamtabelManager
          title="Standplaatsen"
          description="Beheer standplaatsen die in het chauffeurscherm beschikbaar zijn."
          records={locations}
          onCreate={(code, desc) => toastMutate(() => api.settings.createLocation(code, desc), "Standplaats toegevoegd")}
          onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateLocation(id, code, desc), "Standplaats bijgewerkt")}
          onDelete={(id) => toastMutate(() => api.settings.deleteLocation(id), "Standplaats verwijderd")}
        />
        <StamtabelManager
          title="Verloftypes"
          description="Beheer verloftypes die beschikbaar zijn bij de categorie Verlof in het planningsscherm."
          records={leaveTypes}
          onCreate={(code, desc) => toastMutate(() => api.settings.createLeaveType(code, desc), "Verloftype toegevoegd")}
          onUpdate={(id, code, desc) => toastMutate(() => api.settings.updateLeaveType(id, code, desc), "Verloftype bijgewerkt")}
          onDelete={(id) => toastMutate(() => api.settings.deleteLeaveType(id), "Verloftype verwijderd")}
        />
        <SkillManager />
        <RosterProfileEditor />
      </div>
    </div>
  );
}
