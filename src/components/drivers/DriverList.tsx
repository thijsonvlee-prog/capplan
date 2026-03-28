"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { DriverForm } from "./DriverForm";
import {
  useStore,
  getDrivers,
  createDriver,
  updateDriver,
  getSkills,
  getEmployers,
  getDepartments,
  getLocations,
  type Driver,
  type EmploymentType,
  EMPLOYMENT_TYPE_LABELS,
} from "@/lib/store";

export function DriverList() {
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [search, setSearch] = useState("");

  const drivers = useStore(() => getDrivers({ search: search || undefined }));
  const skills = useStore(() => getSkills());
  const employers = useStore(() => getEmployers());
  const departments = useStore(() => getDepartments());
  const locations = useStore(() => getLocations());

  const skillMap = new Map(skills.map((s) => [s.id, s.name]));
  const employerMap = new Map(employers.map((e) => [e.id, e.description]));
  const departmentMap = new Map(departments.map((d) => [d.id, d.description]));
  const locationMap = new Map(locations.map((l) => [l.id, l.description]));

  function handleCreate(data: Omit<Driver, "id" | "isActive" | "createdAt" | "updatedAt">) {
    createDriver(data);
    setShowForm(false);
  }

  function handleUpdate(data: Omit<Driver, "id" | "isActive" | "createdAt" | "updatedAt">) {
    if (!editingDriver) return;
    updateDriver(editingDriver.id, data);
    setEditingDriver(null);
  }

  function startEdit(driver: Driver) {
    setEditingDriver(driver);
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Zoek chauffeur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-64"
        />
        <button
          onClick={() => { setShowForm(true); setEditingDriver(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          Chauffeur toevoegen
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <DriverForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingDriver && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Chauffeur bewerken: {editingDriver.firstName} {editingDriver.lastName}</h3>
          <DriverForm
            onSubmit={handleUpdate}
            onCancel={() => setEditingDriver(null)}
            initialData={editingDriver}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Naam</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Dienstverband</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Werkgever</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Afdeling</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Standplaats</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Rijbewijs</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Vaardigheden</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{d.firstName} {d.lastName}</span>
                    {d.isManager && <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs">LG</span>}
                  </div>
                  {d.employeeNumber && <div className="text-gray-400 text-xs">{d.employeeNumber}</div>}
                </td>
                <td className="p-3 text-sm">
                  {d.employmentType ? (
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {EMPLOYMENT_TYPE_LABELS[d.employmentType]}
                    </span>
                  ) : "-"}
                </td>
                <td className="p-3 text-sm text-gray-600">{(d.employer && employerMap.get(d.employer)) || "-"}</td>
                <td className="p-3 text-sm text-gray-600">{(d.department && departmentMap.get(d.department)) || "-"}</td>
                <td className="p-3 text-sm text-gray-600">{(d.location && locationMap.get(d.location)) || "-"}</td>
                <td className="p-3 text-sm">
                  {d.licenseTypes?.length ? (
                    <div className="flex gap-1 flex-wrap">
                      {d.licenseTypes.map((lt) => (
                        <span key={lt} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">{lt}</span>
                      ))}
                    </div>
                  ) : "-"}
                </td>
                <td className="p-3 text-sm">
                  {d.skillIds?.length ? (
                    <div className="flex gap-1 flex-wrap">
                      {d.skillIds.map((sid) => (
                        <span key={sid} className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs">
                          {skillMap.get(sid) || sid}
                        </span>
                      ))}
                    </div>
                  ) : "-"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => startEdit(d)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Bewerken"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                  Geen chauffeurs gevonden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
