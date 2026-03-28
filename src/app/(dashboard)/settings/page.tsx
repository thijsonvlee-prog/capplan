"use client";

import { SkillManager } from "@/components/settings/SkillManager";
import { StamtabelManager } from "@/components/settings/StamtabelManager";
import { RosterProfileEditor } from "@/components/settings/RosterProfileEditor";
import {
  useStore,
  getEmployers, createEmployer, updateEmployer, deleteEmployer,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getLocations, createLocation, updateLocation, deleteLocation,
  getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType,
} from "@/lib/store";

export default function SettingsPage() {
  const employers = useStore(() => getEmployers());
  const departments = useStore(() => getDepartments());
  const locations = useStore(() => getLocations());
  const leaveTypes = useStore(() => getLeaveTypes());

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Instellingen</h2>
      <div className="max-w-2xl space-y-6">
        <StamtabelManager
          title="Werkgevers"
          description="Beheer werkgevers die in het chauffeurscherm beschikbaar zijn."
          records={employers}
          onCreate={createEmployer}
          onUpdate={updateEmployer}
          onDelete={deleteEmployer}
        />
        <StamtabelManager
          title="Afdelingen"
          description="Beheer afdelingen die in het chauffeurscherm beschikbaar zijn."
          records={departments}
          onCreate={createDepartment}
          onUpdate={updateDepartment}
          onDelete={deleteDepartment}
        />
        <StamtabelManager
          title="Standplaatsen"
          description="Beheer standplaatsen die in het chauffeurscherm beschikbaar zijn."
          records={locations}
          onCreate={createLocation}
          onUpdate={updateLocation}
          onDelete={deleteLocation}
        />
        <StamtabelManager
          title="Verloftypes"
          description="Beheer verloftypes die beschikbaar zijn bij de categorie Verlof in het planningsscherm."
          records={leaveTypes}
          onCreate={createLeaveType}
          onUpdate={updateLeaveType}
          onDelete={deleteLeaveType}
        />
        <SkillManager />
        <RosterProfileEditor />
      </div>
    </div>
  );
}
