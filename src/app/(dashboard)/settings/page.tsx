"use client";

import { SkillManager } from "@/components/settings/SkillManager";
import { StamtabelManager } from "@/components/settings/StamtabelManager";
import { RosterProfileEditor } from "@/components/settings/RosterProfileEditor";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const employers = useApiData(() => api.settings.getEmployers(), [], []);
  const departments = useApiData(() => api.settings.getDepartments(), [], []);
  const locations = useApiData(() => api.settings.getLocations(), [], []);
  const leaveTypes = useApiData(() => api.settings.getLeaveTypes(), [], []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Instellingen</h2>
      <div className="max-w-2xl space-y-6">
        <StamtabelManager
          title="Werkgevers"
          description="Beheer werkgevers die in het chauffeurscherm beschikbaar zijn."
          records={employers}
          onCreate={(code, desc) => mutate(() => api.settings.createEmployer(code, desc))}
          onUpdate={(id, code, desc) => mutate(() => api.settings.updateEmployer(id, code, desc))}
          onDelete={(id) => mutate(() => api.settings.deleteEmployer(id))}
        />
        <StamtabelManager
          title="Afdelingen"
          description="Beheer afdelingen die in het chauffeurscherm beschikbaar zijn."
          records={departments}
          onCreate={(code, desc) => mutate(() => api.settings.createDepartment(code, desc))}
          onUpdate={(id, code, desc) => mutate(() => api.settings.updateDepartment(id, code, desc))}
          onDelete={(id) => mutate(() => api.settings.deleteDepartment(id))}
        />
        <StamtabelManager
          title="Standplaatsen"
          description="Beheer standplaatsen die in het chauffeurscherm beschikbaar zijn."
          records={locations}
          onCreate={(code, desc) => mutate(() => api.settings.createLocation(code, desc))}
          onUpdate={(id, code, desc) => mutate(() => api.settings.updateLocation(id, code, desc))}
          onDelete={(id) => mutate(() => api.settings.deleteLocation(id))}
        />
        <StamtabelManager
          title="Verloftypes"
          description="Beheer verloftypes die beschikbaar zijn bij de categorie Verlof in het planningsscherm."
          records={leaveTypes}
          onCreate={(code, desc) => mutate(() => api.settings.createLeaveType(code, desc))}
          onUpdate={(id, code, desc) => mutate(() => api.settings.updateLeaveType(id, code, desc))}
          onDelete={(id) => mutate(() => api.settings.deleteLeaveType(id))}
        />
        <SkillManager />
        <RosterProfileEditor />
      </div>
    </div>
  );
}
