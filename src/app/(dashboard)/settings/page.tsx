"use client";

import { SkillManager } from "@/components/settings/SkillManager";
import { StamtabelManager } from "@/components/settings/StamtabelManager";
import { RosterProfileEditor } from "@/components/settings/RosterProfileEditor";
import { useStore } from "@/repositories/localStorage/storage";
import { services } from "@/services";

export default function SettingsPage() {
  const employers = useStore(() => services.settings.getEmployers());
  const departments = useStore(() => services.settings.getDepartments());
  const locations = useStore(() => services.settings.getLocations());
  const leaveTypes = useStore(() => services.settings.getLeaveTypes());

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Instellingen</h2>
      <div className="max-w-2xl space-y-6">
        <StamtabelManager
          title="Werkgevers"
          description="Beheer werkgevers die in het chauffeurscherm beschikbaar zijn."
          records={employers}
          onCreate={(code, desc) => services.settings.createEmployer(code, desc)}
          onUpdate={(id, code, desc) => services.settings.updateEmployer(id, code, desc)}
          onDelete={(id) => services.settings.deleteEmployer(id)}
        />
        <StamtabelManager
          title="Afdelingen"
          description="Beheer afdelingen die in het chauffeurscherm beschikbaar zijn."
          records={departments}
          onCreate={(code, desc) => services.settings.createDepartment(code, desc)}
          onUpdate={(id, code, desc) => services.settings.updateDepartment(id, code, desc)}
          onDelete={(id) => services.settings.deleteDepartment(id)}
        />
        <StamtabelManager
          title="Standplaatsen"
          description="Beheer standplaatsen die in het chauffeurscherm beschikbaar zijn."
          records={locations}
          onCreate={(code, desc) => services.settings.createLocation(code, desc)}
          onUpdate={(id, code, desc) => services.settings.updateLocation(id, code, desc)}
          onDelete={(id) => services.settings.deleteLocation(id)}
        />
        <StamtabelManager
          title="Verloftypes"
          description="Beheer verloftypes die beschikbaar zijn bij de categorie Verlof in het planningsscherm."
          records={leaveTypes}
          onCreate={(code, desc) => services.settings.createLeaveType(code, desc)}
          onUpdate={(id, code, desc) => services.settings.updateLeaveType(id, code, desc)}
          onDelete={(id) => services.settings.deleteLeaveType(id)}
        />
        <SkillManager />
        <RosterProfileEditor />
      </div>
    </div>
  );
}
