"use client";

import { useState } from "react";
import { Plus, Pencil, Search } from "lucide-react";
import { DriverForm } from "./DriverForm";
import type { Driver } from "@/domain/types";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { getComputedFields } from "@/lib/api-helpers";
import { showToast } from "@/components/ui/Toast";

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
    mutate(() => api.drivers.create(data))
      .then(() => showToast("Chauffeur toegevoegd"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    setShowForm(false);
  }

  function handleUpdate(data: Partial<Omit<Driver, "id" | "createdAt">>) {
    if (!editingDriver) return;
    mutate(() => api.drivers.update(editingDriver.id, data))
      .then(() => showToast("Chauffeur bijgewerkt"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    setEditingDriver(null);
  }

  function startEdit(driver: Driver) {
    setEditingDriver(driver);
    setShowForm(false);
  }

  const lookups = { employers, departments, locations, rosterProfiles };

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-context">
            <h1 className="text-page-title">Chauffeurs</h1>
            {drivers.length > 0 && (
              <span className="count-badge">{drivers.length}</span>
            )}
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingDriver(null); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Chauffeur toevoegen
          </button>
        </div>
        <div className="mt-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              placeholder="Zoek op naam of personeelsnummer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-9"
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="mb-4">
          <DriverForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingDriver && (
        <div className="mb-4">
          <h3 className="text-section-title mb-2">Chauffeur bewerken: {editingDriver.firstName} {editingDriver.lastName}</h3>
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
                <tr key={d.id} className="border-t border-border-subtle hover:bg-surface-secondary">
                  <td className="p-3 text-sm">
                    <div>{d.firstName} {d.lastName}</div>
                    {d.employeeNumber && <div className="text-text-tertiary text-xs">{d.employeeNumber}</div>}
                  </td>
                  <td className="p-3 text-sm text-text-secondary">{computed.currentManager || "-"}</td>
                  <td className="p-3 text-sm">
                    {computed.currentEmploymentType ? (
                      <span className="bg-surface-tertiary px-2 py-0.5 rounded text-xs">
                        {computed.currentEmploymentType}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="p-3 text-sm text-text-secondary">{computed.currentEmployer || "-"}</td>
                  <td className="p-3 text-sm text-text-secondary">{computed.currentDepartment || "-"}</td>
                  <td className="p-3 text-sm text-text-secondary">{computed.currentLocation || "-"}</td>
                  <td className="p-3 text-sm">
                    {d.licenseTypes?.length ? (
                      <div className="flex gap-1 flex-wrap">
                        {d.licenseTypes.map((lt) => (
                          <span key={lt} className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded text-xs">{lt}</span>
                        ))}
                      </div>
                    ) : "-"}
                  </td>
                  <td className="p-3 text-sm">
                    {d.skillIds?.length ? (
                      <div className="flex gap-1 flex-wrap">
                        {d.skillIds.map((sid) => (
                          <span key={sid} className="bg-success-50 text-success-700 px-1.5 py-0.5 rounded text-xs">
                            {skillMap.get(sid) || sid}
                          </span>
                        ))}
                      </div>
                    ) : "-"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => startEdit(d)}
                      className="btn-icon"
                      title="Bewerken"
                      aria-label="Bewerken"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-text-tertiary text-sm">
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
