"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { DriverForm } from "./DriverForm";
import type { Driver } from "@/domain/types";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { getComputedFields } from "@/lib/api-helpers";

export function DriverList() {
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [search, setSearch] = useState("");

  const drivers = useApiData(() => api.drivers.list({ search: search || undefined }), [search], []);
  const skills = useApiData(() => api.settings.getSkills(), [], []);
  const employers = useApiData(() => api.settings.getEmployers(), [], []);
  const departments = useApiData(() => api.settings.getDepartments(), [], []);
  const locations = useApiData(() => api.settings.getLocations(), [], []);
  const rosterProfiles = useApiData(() => api.rosterProfiles.list(), [], []);

  const skillMap = new Map(skills.map((s) => [s.id, s.name]));

  function handleCreate(data: Omit<Driver, "id" | "isActive" | "createdAt" | "updatedAt">) {
    mutate(() => api.drivers.create(data));
    setShowForm(false);
  }

  function handleUpdate(data: Partial<Omit<Driver, "id" | "createdAt">>) {
    if (!editingDriver) return;
    mutate(() => api.drivers.update(editingDriver.id, data));
    setEditingDriver(null);
  }

  function startEdit(driver: Driver) {
    setEditingDriver(driver);
    setShowForm(false);
  }

  const lookups = { employers, departments, locations, rosterProfiles };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Zoek op naam of personeelsnummer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-border-default rounded-lg text-sm w-64 bg-surface-primary placeholder:text-text-tertiary focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
        />
        <button
          onClick={() => { setShowForm(true); setEditingDriver(null); }}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 text-sm font-medium shadow-xs transition-colors"
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

      <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-tertiary">
            <tr>
              <th className="text-left p-3 text-label">Naam</th>
              <th className="text-left p-3 text-label">Leidinggevende</th>
              <th className="text-left p-3 text-label">Dienstverband</th>
              <th className="text-left p-3 text-label">Werkgever</th>
              <th className="text-left p-3 text-label">Afdeling</th>
              <th className="text-left p-3 text-label">Standplaats</th>
              <th className="text-left p-3 text-label">Rijbewijs</th>
              <th className="text-left p-3 text-label">Vaardigheden</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const computed = getComputedFields(d, lookups);
              return (
                <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-sm">
                    <div>{d.firstName} {d.lastName}</div>
                    {d.employeeNumber && <div className="text-gray-400 text-xs">{d.employeeNumber}</div>}
                  </td>
                  <td className="p-3 text-sm text-gray-600">{computed.currentManager || "-"}</td>
                  <td className="p-3 text-sm">
                    {computed.currentEmploymentType ? (
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {computed.currentEmploymentType}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="p-3 text-sm text-gray-600">{computed.currentEmployer || "-"}</td>
                  <td className="p-3 text-sm text-gray-600">{computed.currentDepartment || "-"}</td>
                  <td className="p-3 text-sm text-gray-600">{computed.currentLocation || "-"}</td>
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
              );
            })}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400 text-sm">
                  {search ? `Geen chauffeurs gevonden voor "${search}"` : "Nog geen chauffeurs. Klik op \"Chauffeur toevoegen\" om te beginnen."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
