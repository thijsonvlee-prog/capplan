"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Filter,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { DateInput } from "@/components/ui/DateInput";
import type { AuditLogEntry, AuditLogPagination } from "@/domain/types";

// === Constants ===

const TABLE_NAME_OPTIONS: { value: string; label: string }[] = [
  { value: "Driver", label: "Chauffeurs" },
  { value: "Scenario", label: "Scenario's" },
  { value: "RosterProfile", label: "Roosterprofielen" },
  { value: "ImportSource", label: "Importbronnen" },
  { value: "UserGroup", label: "Gebruikersgroepen" },
  { value: "User", label: "Gebruikers" },
  { value: "Skill", label: "Competenties" },
  { value: "Employer", label: "Werkgevers" },
  { value: "Department", label: "Afdelingen" },
  { value: "Location", label: "Standplaatsen" },
  { value: "LeaveType", label: "Verloftypes" },
];

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "CREATE", label: "Aangemaakt" },
  { value: "UPDATE", label: "Bewerkt" },
  { value: "DELETE", label: "Verwijderd" },
];

const TABLE_NAME_MAP = new Map(TABLE_NAME_OPTIONS.map((o) => [o.value, o.label]));
const ACTION_LABEL_MAP = new Map(ACTION_OPTIONS.map((o) => [o.value, o.label]));

const PAGE_SIZE = 25;

// === Helpers ===

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActionBadge({ action }: { action: string }) {
  const label = ACTION_LABEL_MAP.get(action) ?? action;
  if (action === "CREATE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success-50 text-success-700 text-xs font-medium">
        <Plus className="w-3 h-3" />
        {label}
      </span>
    );
  }
  if (action === "UPDATE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-medium">
        <Pencil className="w-3 h-3" />
        {label}
      </span>
    );
  }
  if (action === "DELETE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-danger-50 text-danger-600 text-xs font-medium">
        <Trash2 className="w-3 h-3" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-tertiary text-text-secondary text-xs font-medium">
      {label}
    </span>
  );
}

function ValueDisplay({ label, values }: { label: string; values: Record<string, unknown> | null }) {
  if (!values || Object.keys(values).length === 0) {
    return (
      <div>
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">{label}</span>
        <p className="text-xs text-text-tertiary mt-1 italic">Geen waarden</p>
      </div>
    );
  }
  return (
    <div>
      <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">{label}</span>
      <div className="mt-1.5 space-y-1">
        {Object.entries(values).map(([key, val]) => (
          <div key={key} className="flex gap-2 text-xs">
            <span className="text-text-tertiary font-medium min-w-[100px] shrink-0">{key}</span>
            <span className="text-text-primary break-all">
              {val === null ? <span className="text-text-tertiary italic">null</span> : String(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// === Main Component ===

export function AuditLogViewer() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<AuditLogPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [tableName, setTableName] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (tableName) count++;
    if (action) count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    return count;
  }, [tableName, action, dateFrom, dateTo]);

  const fetchData = useCallback(async (p: number, tbl: string, act: string, from: string, to: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.auditLog.list({
        page: p,
        pageSize: PAGE_SIZE,
        tableName: tbl || undefined,
        action: act || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setEntries(result.data);
      setPagination(result.pagination);
    } catch {
      setError("Kon het auditlogboek niet laden. Probeer het opnieuw.");
      setEntries([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page, tableName, action, dateFrom, dateTo);
  }, [fetchData, page, tableName, action, dateFrom, dateTo]);

  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setTableName("");
    setAction("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-surface-primary rounded-xl shadow-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-text-tertiary" />
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Filteren</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-text-inverse text-[10px] font-semibold">
              {activeFilterCount}
            </span>
          )}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-text-tertiary hover:text-brand-600 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Wis filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-caption text-text-secondary block mb-1">Tabel</label>
            <select
              value={tableName}
              onChange={(e) => handleFilterChange(setTableName, e.target.value)}
              className="input-field w-full"
            >
              <option value="">Alle tabellen</option>
              {TABLE_NAME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-caption text-text-secondary block mb-1">Actie</label>
            <select
              value={action}
              onChange={(e) => handleFilterChange(setAction, e.target.value)}
              className="input-field w-full"
            >
              <option value="">Alle acties</option>
              {ACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-caption text-text-secondary block mb-1">Vanaf</label>
            <DateInput
              value={dateFrom}
              onChange={(v) => handleFilterChange(setDateFrom, v)}
            />
          </div>
          <div>
            <label className="text-caption text-text-secondary block mb-1">Tot en met</label>
            <DateInput
              value={dateTo}
              onChange={(v) => handleFilterChange(setDateTo, v)}
            />
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="bg-surface-primary rounded-xl shadow-card overflow-hidden">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="spinner" />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-danger-600">{error}</p>
            <button
              onClick={() => fetchData(page, tableName, action, dateFrom, dateTo)}
              className="btn-secondary mt-3"
            >
              Opnieuw proberen
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && entries.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-text-secondary font-medium">Geen logboekitems gevonden</p>
            <p className="text-xs text-text-tertiary mt-1">
              {activeFilterCount > 0
                ? "Pas de filters aan of wis ze om meer resultaten te zien."
                : "Er zijn nog geen mutaties vastgelegd in het auditlogboek."}
            </p>
          </div>
        )}

        {/* Data rows */}
        {!loading && !error && entries.length > 0 && (
          <>
            {/* Header row */}
            <div className="grid grid-cols-[1fr_120px_100px_140px] gap-3 px-4 py-2.5 bg-surface-tertiary text-xs font-medium text-text-secondary uppercase tracking-wide">
              <span>Beschrijving</span>
              <span>Tabel</span>
              <span>Actie</span>
              <span className="text-right">Tijdstip</span>
            </div>

            {/* Entry rows */}
            <div>
              {entries.map((entry, index) => {
                const isExpanded = expandedId === entry.id;
                const tableLabel = TABLE_NAME_MAP.get(entry.tableName) ?? entry.tableName;
                const userName = entry.userName || entry.userEmail || "Systeem";

                return (
                  <div key={entry.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className={`w-full text-left grid grid-cols-[1fr_120px_100px_140px] gap-3 px-4 py-3 items-center transition-colors hover:bg-brand-50/40 ${
                        index % 2 === 0 ? "bg-surface-primary" : "bg-surface-secondary/60"
                      } ${isExpanded ? "bg-brand-50/30" : ""}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className="text-sm text-text-primary truncate block">
                            {userName}
                          </span>
                          <span className="text-xs text-text-tertiary truncate block">
                            Record {entry.recordId.slice(0, 8)}…
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-text-secondary">{tableLabel}</span>
                      <div>
                        <ActionBadge action={entry.action} />
                      </div>
                      <span className="text-xs text-text-secondary text-right whitespace-nowrap">
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 py-4 bg-surface-tertiary/50 border-y border-border-subtle">
                        <div className="ml-5.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <ValueDisplay label="Oude waarden" values={entry.oldValues} />
                          <ValueDisplay label="Nieuwe waarden" values={entry.newValues} />
                        </div>
                        <div className="ml-5.5 mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-text-tertiary">
                          <span>Gebruiker: <span className="text-text-secondary">{userName}</span></span>
                          {entry.userEmail && (
                            <span>E-mail: <span className="text-text-secondary">{entry.userEmail}</span></span>
                          )}
                          <span>Record-ID: <span className="text-text-secondary font-mono text-[11px]">{entry.recordId}</span></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-surface-tertiary/50">
                <span className="text-caption text-text-tertiary">
                  {pagination.total} {pagination.total === 1 ? "item" : "items"} — pagina {pagination.page} van {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page <= 1}
                    className="btn-icon"
                    title="Eerste pagina"
                    aria-label="Eerste pagina"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn-icon"
                    title="Vorige pagina"
                    aria-label="Vorige pagina"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="btn-icon"
                    title="Volgende pagina"
                    aria-label="Volgende pagina"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                    className="btn-icon"
                    title="Laatste pagina"
                    aria-label="Laatste pagina"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
