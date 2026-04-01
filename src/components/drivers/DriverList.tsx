"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DriverForm } from "./DriverForm";
import type { Driver } from "@/domain/types";
import { useApiData, useApiDataWithLoading, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { getComputedFields, buildLookupMaps } from "@/lib/api-helpers";
import { showToast } from "@/components/ui/Toast";
import { useHeaderSubtitle } from "@/hooks/useHeaderSubtitle";
import { useUserRole } from "@/hooks/useUserRole";

type ViewMode = "list" | "create" | "edit";

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
const DEFAULT_PAGINATED = { data: [] as Driver[], total: 0, page: 1, pageSize: 50 };

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function DriverList() {
  const { canWrite } = useUserRole();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const debouncedSearch = useDebounce(search, 300);

  // Paginated driver fetch with auto-invalidation
  const [driversResult, driversLoading, driversError] = useApiDataWithLoading(
    () => api.drivers.listPaginated({
      search: debouncedSearch || undefined,
      page,
      pageSize,
    }),
    [debouncedSearch, page, pageSize],
    DEFAULT_PAGINATED
  );

  const drivers = driversResult.data;
  const total = driversResult.total;

  const skills = useApiData(() => api.settings.getSkills(), [], []);
  const employers = useApiData(() => api.settings.getEmployers(), [], []);
  const departments = useApiData(() => api.settings.getDepartments(), [], []);
  const locations = useApiData(() => api.settings.getLocations(), [], []);
  const rosterProfiles = useApiData(() => api.rosterProfiles.list(), [], []);

  useHeaderSubtitle(total > 0 ? `${total} chauffeurs` : "");

  const skillMap = new Map(skills.map((s) => [s.id, s.name]));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
  const lookupMaps = buildLookupMaps(lookups);
  const isFormOpen = viewMode === "create" || viewMode === "edit";

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-header-context">
              <h1 className="text-page-title">Chauffeurs</h1>
              {total > 0 && (
                <span className="count-badge">{total}</span>
              )}
            </div>
            <p className="text-text-secondary text-sm mt-1 hidden md:block">
              Beheer chauffeurgegevens, dienstverbanden, functies en roostertoewijzingen.
            </p>
          </div>
          {!isFormOpen && canWrite && (
            <button
              onClick={() => { setViewMode("create"); setEditingDriver(null); }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Chauffeur toevoegen</span>
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

      {/* Drivers data surface */}
      {!isFormOpen && (
        <div>
          {/* Search toolbar */}
          <div className="bg-surface-primary rounded-lg shadow-card overflow-hidden mb-3 md:mb-0 md:rounded-b-none">
            <div className="flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 border-b border-border-subtle bg-surface-primary">
              <div className="relative flex-1 md:flex-none md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                <input
                  type="text"
                  placeholder="Zoek op naam of personeelsnummer..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="input-field w-full pl-9"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                    aria-label="Zoekopdracht wissen"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {total > 0 && (
                <span className="text-sm text-text-tertiary hidden md:inline ml-4">
                  {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} van {total}
                </span>
              )}
            </div>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden mobile-page-enter">
            {driversError && drivers.length === 0 ? (
              <div className="bg-surface-primary rounded-lg shadow-card p-6 text-center">
                <div className="text-sm font-medium text-danger-600">Fout bij ophalen chauffeurs</div>
                <div className="text-xs text-text-tertiary mt-1">{driversError}</div>
              </div>
            ) : driversLoading && drivers.length === 0 ? (
              <div className="bg-surface-primary rounded-lg shadow-card p-8 text-center">
                <div className="spinner mb-2 mx-auto" />
                <div className="text-sm text-text-tertiary">Chauffeurs laden...</div>
              </div>
            ) : drivers.length === 0 && !driversLoading ? (
              <div className="bg-surface-primary rounded-lg shadow-card p-8 text-center text-text-tertiary text-sm">
                {search
                  ? `Geen chauffeurs gevonden voor "${search}"`
                  : "Nog geen chauffeurs. Tik op \"Chauffeur toevoegen\" om te beginnen."}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {drivers.map((d) => {
                  const computed = getComputedFields(d, lookups, lookupMaps);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => canWrite && startEdit(d)}
                      className="driver-card"
                      aria-label={`${d.lastName}, ${d.firstName}${canWrite ? " bewerken" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-text-primary truncate">
                            {d.lastName}, {d.firstName}
                          </div>
                          {d.employeeNumber && (
                            <div className="text-xs text-text-tertiary mt-0.5">
                              Nr. {d.employeeNumber}
                            </div>
                          )}
                        </div>
                        {canWrite && (
                          <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        {computed.currentDepartment && (
                          <span className="text-xs text-text-secondary">{computed.currentDepartment}</span>
                        )}
                        {computed.currentEmploymentType && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[0.6875rem] font-medium bg-surface-tertiary text-text-secondary">
                            {computed.currentEmploymentType}
                          </span>
                        )}
                        {computed.currentLocation && (
                          <span className="text-xs text-text-tertiary">{computed.currentLocation}</span>
                        )}
                      </div>
                      {(d.licenseTypes?.length || d.skillIds?.length) ? (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {d.licenseTypes?.map((lt) => (
                            <span key={lt} className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-md text-[0.6875rem] font-medium">{lt}</span>
                          ))}
                          {d.skillIds?.map((sid) => (
                            <span key={sid} className="bg-success-50 text-success-700 px-1.5 py-0.5 rounded-md text-[0.6875rem] font-medium">
                              {skillMap.get(sid) || sid}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mobile pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-xs text-text-tertiary">
                  {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} van {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Vorige pagina"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-text-secondary px-1.5 min-w-[3rem] text-center">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Volgende pagina"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-surface-primary rounded-b-lg shadow-card overflow-hidden">
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
                {driversError && drivers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-danger-600">
                      <div className="text-sm font-medium">Fout bij ophalen chauffeurs</div>
                      <div className="text-xs text-text-tertiary mt-1">{driversError}</div>
                    </td>
                  </tr>
                ) : driversLoading && drivers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-text-tertiary">
                      <div className="spinner mb-2 mx-auto" />
                      <div className="text-sm">Chauffeurs laden...</div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {drivers.map((d, idx) => {
                      const computed = getComputedFields(d, lookups, lookupMaps);
                      return (
                        <tr
                          key={d.id}
                          className={`hover:bg-brand-50 transition-colors ${
                            idx % 2 === 1 ? "bg-surface-secondary" : ""
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
                            {canWrite && (
                              <button
                                onClick={() => startEdit(d)}
                                className="btn-icon"
                                title="Bewerken"
                                aria-label={`${d.lastName}, ${d.firstName} bewerken`}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {drivers.length === 0 && !driversLoading && (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-text-tertiary text-sm">
                          {search
                            ? `Geen chauffeurs gevonden voor "${search}"`
                            : "Nog geen chauffeurs. Klik op \"Chauffeur toevoegen\" om te beginnen."}
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>

            {/* Desktop pagination controls */}
            {total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-surface-tertiary/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-caption whitespace-nowrap">Per pagina:</label>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      className="input-field text-xs py-1 px-2"
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page <= 1}
                    className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Eerste pagina"
                    aria-label="Eerste pagina"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Vorige pagina"
                    aria-label="Vorige pagina"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-text-secondary px-2 min-w-[4rem] text-center">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Volgende pagina"
                    aria-label="Volgende pagina"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                    className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Laatste pagina"
                    aria-label="Laatste pagina"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
