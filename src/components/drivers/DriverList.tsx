"use client";

import { useState } from "react";
import { Plus, Pencil, Search, X } from "lucide-react";
import { DriverForm } from "./DriverForm";
import type { Driver } from "@/domain/types";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { getComputedFields } from "@/lib/api-helpers";
import { showToast } from "@/components/ui/Toast";

type ViewMode = "list" | "create" | "edit";

export function DriverList() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
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
    setViewMode("list");
  }

  function handleUpdate(data: Partial<Omit<Driver, "id" | "createdAt">>) {
    if (!editingDriver) return;
    mutate(() => api.drivers.update(editingDriver.id, data))
      .then(() => showToast("Chauffeur bijgewerkt"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    setEditingDriver(null);
    setViewMode("list");
  }

  function startEdit(driver: Driver) {
    setEditingDriver(driver);
    setViewMode("edit");
  }

  function cancelForm() {
    setEditingDriver(null);
    setViewMode("list");
  }

  const lookups = { employers, departments, locations, rosterProfiles };
  const isFormOpen = viewMode === "create" || viewMode === "edit";

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-header-context">
              <h1 className="text-page-title">Chauffeurs</h1>
              {drivers.length > 0 && (
                <span className="count-badge">{drivers.length}</span>
              )}
            </div>
            <p className="text-text-secondary text-sm mt-1">
              Beheer chauffeurgegevens, dienstverbanden, functies en roostertoewijzingen.
            </p>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => { setViewMode("create"); setEditingDriver(null); }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Chauffeur toevoegen
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      {viewMode === "create" && (
        <div className="mb-6">
          <div className="drivers-form-header">
            <h2 className="settings-section-title">Nieuwe chauffeur</h2>
            <p className="settings-section-desc">Vul de basisgegevens in om een chauffeur toe te voegen.</p>
          </div>
          <DriverForm onSubmit={handleCreate} onCancel={cancelForm} />
        </div>
      )}

      {/* Edit form */}
      {viewMode === "edit" && editingDriver && (
        <div className="mb-6">
          <div className="drivers-form-header">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="settings-section-title">
                  {editingDriver.lastName}, {editingDriver.firstName}
                </h2>
                <p className="settings-section-desc">
                  {editingDriver.employeeNumber ? `Nr. ${editingDriver.employeeNumber} — ` : ""}Bewerk gegevens, dienstverband, functie of rooster.
                </p>
              </div>
              <button onClick={cancelForm} className="btn-icon" aria-label="Sluiten">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <DriverForm
            onSubmit={handleUpdate}
            onCancel={cancelForm}
            initialData={editingDriver}
          />
        </div>
      )}

      {/* Search bar */}
      {!isFormOpen && (
        <div className="mb-4">
          <div className="relative w-80">
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
      )}

      {/* Drivers table */}
      {!isFormOpen && (
        <div className="bg-surface-primary rounded-lg shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-tertiary">
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
              {drivers.map((d, idx) => {
                const computed = getComputedFields(d, lookups);
                return (
                  <tr
                    key={d.id}
                    className={`border-b border-border-subtle hover:bg-surface-secondary transition-colors ${
                      idx % 2 === 1 ? "bg-surface-secondary/50" : ""
                    }`}
                  >
                    <td className="p-3 text-sm">
                      <div className="font-medium text-text-primary">{d.lastName}, {d.firstName}</div>
                      {d.employeeNumber && <div className="text-text-tertiary text-xs mt-0.5">{d.employeeNumber}</div>}
                    </td>
                    <td className="p-3 text-sm text-text-secondary">{computed.currentManager || <span className="text-text-tertiary">-</span>}</td>
                    <td className="p-3 text-sm">
                      {computed.currentEmploymentType ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-surface-tertiary text-text-secondary">
                          {computed.currentEmploymentType}
                        </span>
                      ) : <span className="text-text-tertiary">-</span>}
                    </td>
                    <td className="p-3 text-sm text-text-secondary">{computed.currentEmployer || <span className="text-text-tertiary">-</span>}</td>
                    <td className="p-3 text-sm text-text-secondary">{computed.currentDepartment || <span className="text-text-tertiary">-</span>}</td>
                    <td className="p-3 text-sm text-text-secondary">{computed.currentLocation || <span className="text-text-tertiary">-</span>}</td>
                    <td className="p-3 text-sm">
                      {d.licenseTypes?.length ? (
                        <div className="flex gap-1 flex-wrap">
                          {d.licenseTypes.map((lt) => (
                            <span key={lt} className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-md text-xs font-medium">{lt}</span>
                          ))}
                        </div>
                      ) : <span className="text-text-tertiary">-</span>}
                    </td>
                    <td className="p-3 text-sm">
                      {d.skillIds?.length ? (
                        <div className="flex gap-1 flex-wrap">
                          {d.skillIds.map((sid) => (
                            <span key={sid} className="bg-success-50 text-success-700 px-1.5 py-0.5 rounded-md text-xs font-medium">
                              {skillMap.get(sid) || sid}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-text-tertiary">-</span>}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => startEdit(d)}
                        className="btn-icon"
                        title="Bewerken"
                        aria-label={`${d.lastName}, ${d.firstName} bewerken`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-text-tertiary text-sm">
                    {search
                      ? `Geen chauffeurs gevonden voor "${search}"`
                      : "Nog geen chauffeurs. Klik op \"Chauffeur toevoegen\" om te beginnen."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
