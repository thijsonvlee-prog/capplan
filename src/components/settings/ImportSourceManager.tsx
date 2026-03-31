"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, ArrowRight, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, Play, Clock, ChevronDown, ChevronUp, Globe, Key, Eye, EyeOff } from "lucide-react";
import type { ImportSource, CsvUploadResult, ImportExecuteResult, ImportLog } from "@/domain/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useApiDataWithLoading, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";

const TARGET_ENTITIES: { value: string; label: string }[] = [
  { value: "drivers", label: "Chauffeurs" },
  { value: "employers", label: "Werkgevers" },
  { value: "departments", label: "Afdelingen" },
  { value: "locations", label: "Standplaatsen" },
];

const TARGET_FIELDS: Record<string, { value: string; label: string }[]> = {
  drivers: [
    { value: "firstName", label: "Voornaam" },
    { value: "lastName", label: "Achternaam" },
    { value: "employeeNumber", label: "Personeelsnummer" },
    { value: "licenseTypes", label: "Rijbewijscategorieën" },
  ],
  employers: [
    { value: "code", label: "Code" },
    { value: "description", label: "Omschrijving" },
  ],
  departments: [
    { value: "code", label: "Code" },
    { value: "description", label: "Omschrijving" },
  ],
  locations: [
    { value: "code", label: "Code" },
    { value: "description", label: "Omschrijving" },
  ],
};

type FieldMapping = { sourceColumn: string; targetField: string };
type HeaderEntry = { key: string; value: string };

const AUTH_TYPE_LABELS: Record<string, string> = {
  NONE: "Geen",
  BASIC: "Basic (gebruikersnaam/wachtwoord)",
  BEARER: "Bearer token",
  API_KEY: "API-sleutel",
};

type FormState = {
  name: string;
  description: string;
  sourceType: string;
  targetEntity: string;
  mappings: FieldMapping[];
  // API-specific
  apiUrl: string;
  apiMethod: string;
  apiHeaders: HeaderEntry[];
  apiAuthType: string;
  apiCredentials: Record<string, string>;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  sourceType: "CSV",
  targetEntity: "",
  mappings: [{ sourceColumn: "", targetField: "" }],
  apiUrl: "",
  apiMethod: "GET",
  apiHeaders: [{ key: "", value: "" }],
  apiAuthType: "NONE",
  apiCredentials: {},
};

function mappingsToRecord(mappings: FieldMapping[]): Record<string, string> {
  const record: Record<string, string> = {};
  for (const m of mappings) {
    if (m.sourceColumn.trim() && m.targetField) {
      record[m.sourceColumn.trim()] = m.targetField;
    }
  }
  return record;
}

function recordToMappings(record: Record<string, string>): FieldMapping[] {
  const entries = Object.entries(record);
  return entries.length > 0
    ? entries.map(([sourceColumn, targetField]) => ({ sourceColumn, targetField }))
    : [{ sourceColumn: "", targetField: "" }];
}

function headersToEntries(headers?: Record<string, string> | null): HeaderEntry[] {
  if (!headers || Object.keys(headers).length === 0) return [{ key: "", value: "" }];
  return Object.entries(headers).map(([key, value]) => ({ key, value }));
}

function entriesToHeaders(entries: HeaderEntry[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const e of entries) {
    if (e.key.trim()) result[e.key.trim()] = e.value;
  }
  return result;
}

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

export function ImportSourceManager({ readOnly }: { readOnly?: boolean }) {
  const [sources, loading, sourcesError] = useApiDataWithLoading(() => api.importSources.list(), [], []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showValidation, setShowValidation] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ImportSource | null>(null);
  const [uploadSourceId, setUploadSourceId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<CsvUploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executeResult, setExecuteResult] = useState<ImportExecuteResult | null>(null);
  const [importMode, setImportMode] = useState<"create" | "upsert">("create");
  const [logsSourceId, setLogsSourceId] = useState<string | null>(null);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowValidation(false);
    setShowForm(true);
  }

  function openEditForm(source: ImportSource) {
    setEditingId(source.id);
    setForm({
      name: source.name,
      description: source.description || "",
      sourceType: source.type || "CSV",
      targetEntity: source.targetEntity,
      mappings: recordToMappings(source.fieldMappings),
      apiUrl: source.apiUrl || "",
      apiMethod: source.apiMethod || "GET",
      apiHeaders: headersToEntries(source.apiHeaders),
      apiAuthType: source.apiAuthType || "NONE",
      apiCredentials: (source.apiCredentials as Record<string, string>) || {},
    });
    setShowValidation(false);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowValidation(false);
  }

  function addMappingRow() {
    setForm(prev => ({
      ...prev,
      mappings: [...prev.mappings, { sourceColumn: "", targetField: "" }],
    }));
  }

  function removeMappingRow(index: number) {
    setForm(prev => ({
      ...prev,
      mappings: prev.mappings.length > 1
        ? prev.mappings.filter((_, i) => i !== index)
        : prev.mappings,
    }));
  }

  function updateMapping(index: number, field: "sourceColumn" | "targetField", value: string) {
    setForm(prev => ({
      ...prev,
      mappings: prev.mappings.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  }

  function addHeaderRow() {
    setForm(prev => ({
      ...prev,
      apiHeaders: [...prev.apiHeaders, { key: "", value: "" }],
    }));
  }

  function removeHeaderRow(index: number) {
    setForm(prev => ({
      ...prev,
      apiHeaders: prev.apiHeaders.length > 1
        ? prev.apiHeaders.filter((_, i) => i !== index)
        : prev.apiHeaders,
    }));
  }

  function updateHeader(index: number, field: "key" | "value", value: string) {
    setForm(prev => ({
      ...prev,
      apiHeaders: prev.apiHeaders.map((h, i) => i === index ? { ...h, [field]: value } : h),
    }));
  }

  function updateCredential(key: string, value: string) {
    setForm(prev => ({
      ...prev,
      apiCredentials: { ...prev.apiCredentials, [key]: value },
    }));
  }

  function isFormValid(): boolean {
    if (!form.name.trim() || !form.targetEntity) return false;
    const validMappings = form.mappings.filter(m => m.sourceColumn.trim() && m.targetField);
    if (validMappings.length === 0) return false;
    if (form.sourceType === "API" && !form.apiUrl.trim()) return false;
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid()) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      type: form.sourceType,
      targetEntity: form.targetEntity,
      fieldMappings: mappingsToRecord(form.mappings),
      description: form.description.trim() || undefined,
    };

    if (form.sourceType === "API") {
      payload.apiUrl = form.apiUrl.trim();
      payload.apiMethod = form.apiMethod;
      payload.apiAuthType = form.apiAuthType;
      const headers = entriesToHeaders(form.apiHeaders);
      if (Object.keys(headers).length > 0) payload.apiHeaders = headers;
      if (form.apiAuthType !== "NONE") payload.apiCredentials = form.apiCredentials;
    }

    const typedPayload = payload as Parameters<typeof api.importSources.create>[0];
    if (editingId) {
      mutate(() => api.importSources.update(editingId, typedPayload))
        .then(() => { showToast("Importbron bijgewerkt"); closeForm(); })
        .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    } else {
      mutate(() => api.importSources.create(typedPayload))
        .then(() => { showToast("Importbron aangemaakt"); closeForm(); })
        .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    }
  }

  function handleDelete(id: string) {
    mutate(() => api.importSources.remove(id))
      .then(() => showToast("Importbron verwijderd"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
  }

  function openUpload(sourceId: string) {
    setUploadSourceId(sourceId);
    setUploadResult(null);
    setUploadError(null);
    setUploadFile(null);
    setExecuteResult(null);
    setImportMode("create");
  }

  function closeUpload() {
    setUploadSourceId(null);
    setUploadResult(null);
    setUploadError(null);
    setUploadFile(null);
    setExecuteResult(null);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadSourceId) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);
    setUploadFile(file);
    setExecuteResult(null);

    api.importSources.upload(uploadSourceId, file)
      .then((result) => {
        setUploadResult(result);
        setUploading(false);
      })
      .catch((err) => {
        setUploadError(err instanceof Error ? err.message : "Upload mislukt. Controleer het bestand.");
        setUploading(false);
        setUploadFile(null);
      });

    // Reset file input so the same file can be re-selected
    e.target.value = "";
  }

  function handleExecute() {
    if (!uploadSourceId || !uploadFile) return;
    setExecuting(true);

    api.importSources.execute(uploadSourceId, uploadFile, importMode)
      .then((result) => {
        setExecuteResult(result);
        setExecuting(false);
        if (result.importedRows > 0 || result.updatedRows > 0) {
          const parts: string[] = [];
          if (result.importedRows > 0) parts.push(`${result.importedRows} aangemaakt`);
          if (result.updatedRows > 0) parts.push(`${result.updatedRows} bijgewerkt`);
          showToast(parts.join(", "));
          // Invalidate data caches so imported records appear in other views
          mutate(() => Promise.resolve());
        }
        if (result.importedRows === 0 && result.updatedRows === 0 && result.skippedRows > 0) {
          showToast("Geen rijen geïmporteerd — controleer de fouten.", "error");
        }
      })
      .catch((err) => {
        setExecuting(false);
        showToast(err instanceof Error ? err.message : "Import mislukt.", "error");
      });
  }

  function toggleLogs(sourceId: string) {
    if (logsSourceId === sourceId) {
      setLogsSourceId(null);
      setLogs([]);
      return;
    }
    setLogsSourceId(sourceId);
    setLogsLoading(true);
    setLogs([]);
    setExpandedLogId(null);

    api.importSources.getLogs(sourceId)
      .then((result) => {
        setLogs(result);
        setLogsLoading(false);
      })
      .catch(() => {
        setLogsLoading(false);
        showToast("Kan importlogboek niet laden.", "error");
      });
  }

  const targetEntityLabel = (entity: string) =>
    TARGET_ENTITIES.find(t => t.value === entity)?.label || entity;

  const availableTargetFields = TARGET_FIELDS[form.targetEntity] || [];

  const allMappingsDetected = uploadResult
    ? uploadResult.mappingValidation.every((mv) => mv.detected)
    : false;

  return (
    <div className="space-y-4">
      {/* Source list */}
      <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle">
        <div className="p-4 flex items-center justify-between border-b border-border-subtle">
          <div>
            <h3 className="text-section-title">Importbronnen</h3>
            <p className="text-caption mt-1">CSV- en API-bronnen met veldkoppelingen voor het importeren van gegevens.</p>
          </div>
          {!readOnly && (
            <button onClick={openCreateForm} className="btn-primary" disabled={showForm}>
              <Plus className="w-4 h-4" />
              Nieuwe bron
            </button>
          )}
        </div>

        {loading && (
          <div className="p-6 flex justify-center">
            <div className="spinner" />
          </div>
        )}

        {!loading && sourcesError && sources.length === 0 && (
          <div className="p-6 text-center">
            <div className="text-sm font-medium text-danger-600">Fout bij ophalen importbronnen</div>
            <div className="text-xs text-text-tertiary mt-1">{sourcesError}</div>
          </div>
        )}

        {!loading && sources.length === 0 && !showForm && !sourcesError && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-tertiary flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6 text-text-tertiary" />
            </div>
            <p className="text-sm text-text-secondary">Nog geen importbronnen geconfigureerd.</p>
            <p className="text-xs text-text-tertiary mt-1">Klik op &quot;Nieuwe bron&quot; om een import­configuratie aan te maken.</p>
          </div>
        )}

        {!loading && sources.length > 0 && (
          <div className="divide-y divide-border-subtle">
            {sources.map(source => (
              <div key={source.id}>
                <div className="p-4 hover:bg-surface-secondary transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-medium text-text-primary">{source.name}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          source.type === "API"
                            ? "bg-brand-50 text-brand-700"
                            : "bg-surface-tertiary text-text-secondary"
                        }`}>
                          {source.type === "API" ? <Globe className="w-3 h-3" /> : <FileSpreadsheet className="w-3 h-3" />}
                          {source.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-text-secondary">
                          Doel: <span className="font-medium text-text-primary">{targetEntityLabel(source.targetEntity)}</span>
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {Object.keys(source.fieldMappings).length} veldkoppeling{Object.keys(source.fieldMappings).length !== 1 ? "en" : ""}
                        </span>
                      </div>
                      {source.type === "API" && source.apiUrl && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-text-tertiary font-mono truncate max-w-md">{source.apiMethod || "GET"} {source.apiUrl}</span>
                          {source.apiAuthType && source.apiAuthType !== "NONE" && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-text-tertiary">
                              <Key className="w-3 h-3" />
                              {AUTH_TYPE_LABELS[source.apiAuthType] || source.apiAuthType}
                            </span>
                          )}
                        </div>
                      )}
                      {source.description && (
                        <p className="text-xs text-text-tertiary mt-1">{source.description}</p>
                      )}
                      {/* Field mapping preview */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Object.entries(source.fieldMappings).map(([src, target]) => (
                          <span key={src} className="inline-flex items-center gap-1 bg-surface-tertiary px-2 py-0.5 rounded text-xs text-text-secondary">
                            <span className="font-mono">{src}</span>
                            <ArrowRight className="w-3 h-3 text-text-tertiary" />
                            <span>{availableTargetFieldLabel(source.targetEntity, target)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <button onClick={() => toggleLogs(source.id)} className="btn-icon" aria-label="Importgeschiedenis">
                        <Clock className="w-4 h-4" />
                      </button>
                      {!readOnly && (
                        <>
                          {source.type !== "API" && (
                            <button onClick={() => openUpload(source.id)} className="btn-icon" aria-label="CSV uploaden">
                              <Upload className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => openEditForm(source)} className="btn-icon" aria-label="Bewerken">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setPendingDelete(source)} className="btn-icon-danger" aria-label="Verwijderen">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Import logs inline */}
                {logsSourceId === source.id && (
                  <div className="px-4 pb-4">
                    <div className="bg-surface-secondary rounded-md border border-border-subtle">
                      <div className="p-3 border-b border-border-subtle">
                        <h4 className="text-label">Importgeschiedenis</h4>
                      </div>
                      {logsLoading && (
                        <div className="p-4 flex justify-center">
                          <div className="spinner" />
                        </div>
                      )}
                      {!logsLoading && logs.length === 0 && (
                        <div className="p-4 text-center">
                          <p className="text-xs text-text-tertiary">Nog geen imports uitgevoerd voor deze bron.</p>
                        </div>
                      )}
                      {!logsLoading && logs.length > 0 && (
                        <div className="divide-y divide-border-subtle">
                          {logs.map((log) => (
                            <div key={log.id} className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-text-secondary">{formatDateTime(log.executedAt)}</span>
                                  <span className="font-mono text-text-tertiary">{log.fileName}</span>
                                  <span className="text-success-700 font-medium">{log.importedRows} aangemaakt</span>
                                  {log.updatedRows > 0 && (
                                    <span className="text-brand-700 font-medium">{log.updatedRows} bijgewerkt</span>
                                  )}
                                  {log.skippedRows > 0 && (
                                    <span className="text-warning-700">{log.skippedRows} overgeslagen</span>
                                  )}
                                  <span className="text-text-tertiary">van {log.totalRows} rijen</span>
                                </div>
                                {log.errors.length > 0 && (
                                  <button
                                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                    className="btn-icon"
                                    aria-label="Fouten tonen"
                                  >
                                    {expandedLogId === log.id ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                              {expandedLogId === log.id && log.errors.length > 0 && (
                                <div className="mt-2 bg-danger-50 rounded p-2 space-y-1">
                                  {log.errors.map((err, i) => (
                                    <p key={i} className="text-xs text-danger-700">
                                      {err.row > 0 ? `Rij ${err.row}: ` : ""}{err.message}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit form */}
      {showForm && !readOnly && (
        <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle">
          <div className="p-4 border-b border-border-subtle">
            <h3 className="text-section-title">
              {editingId ? "Importbron bewerken" : "Nieuwe importbron"}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Name and target entity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Naam <span className="text-danger-600">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Bijv. AFAS chauffeurexport"
                  className="input-field w-full"
                />
                {showValidation && !form.name.trim() && (
                  <p className="text-xs text-danger-600 mt-1">Naam is verplicht.</p>
                )}
              </div>
              <div>
                <label className="form-label">Doelentiteit <span className="text-danger-600">*</span></label>
                <select
                  value={form.targetEntity}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    targetEntity: e.target.value,
                    mappings: [{ sourceColumn: "", targetField: "" }],
                  }))}
                  className="input-field w-full"
                >
                  <option value="">-- Selecteer --</option>
                  {TARGET_ENTITIES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {showValidation && !form.targetEntity && (
                  <p className="text-xs text-danger-600 mt-1">Doelentiteit is verplicht.</p>
                )}
              </div>
            </div>

            {/* Source type selector */}
            <div>
              <label className="form-label">Brontype <span className="text-danger-600">*</span></label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, sourceType: "CSV" }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                    form.sourceType === "CSV"
                      ? "bg-brand-50 border-brand-300 text-brand-700"
                      : "bg-surface-secondary border-border-subtle text-text-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV-bestand
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, sourceType: "API" }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                    form.sourceType === "API"
                      ? "bg-brand-50 border-brand-300 text-brand-700"
                      : "bg-surface-secondary border-border-subtle text-text-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  API-verbinding
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="form-label">Omschrijving</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optionele toelichting op deze importbron"
                className="input-field w-full"
              />
            </div>

            {/* API configuration */}
            {form.sourceType === "API" && (
              <div className="space-y-4 p-4 bg-surface-secondary rounded-lg">
                <h4 className="text-label flex items-center gap-2">
                  <Globe className="w-4 h-4 text-text-tertiary" />
                  API-configuratie
                </h4>

                {/* URL and Method */}
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <div>
                    <label className="form-label">URL <span className="text-danger-600">*</span></label>
                    <input
                      type="text"
                      value={form.apiUrl}
                      onChange={e => setForm(prev => ({ ...prev, apiUrl: e.target.value }))}
                      placeholder="https://api.voorbeeld.nl/v1/chauffeurs"
                      className="input-field w-full"
                    />
                    {showValidation && form.sourceType === "API" && !form.apiUrl.trim() && (
                      <p className="text-xs text-danger-600 mt-1">URL is verplicht voor API-bronnen.</p>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Methode</label>
                    <select
                      value={form.apiMethod}
                      onChange={e => setForm(prev => ({ ...prev, apiMethod: e.target.value }))}
                      className="input-field"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                </div>

                {/* Headers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label !mb-0">Headers</label>
                    <button
                      type="button"
                      onClick={addHeaderRow}
                      className="btn-secondary text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Header toevoegen
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.apiHeaders.map((header, index) => (
                      <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                        <input
                          type="text"
                          value={header.key}
                          onChange={e => updateHeader(index, "key", e.target.value)}
                          placeholder="Header-naam"
                          className="input-field"
                        />
                        <input
                          type="text"
                          value={header.value}
                          onChange={e => updateHeader(index, "value", e.target.value)}
                          placeholder="Waarde"
                          className="input-field"
                        />
                        <button
                          type="button"
                          onClick={() => removeHeaderRow(index)}
                          className="btn-icon"
                          aria-label="Header verwijderen"
                          disabled={form.apiHeaders.length <= 1}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authentication */}
                <div>
                  <label className="form-label">Authenticatie</label>
                  <select
                    value={form.apiAuthType}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      apiAuthType: e.target.value,
                      apiCredentials: {},
                    }))}
                    className="input-field w-full"
                  >
                    {Object.entries(AUTH_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Credentials based on auth type */}
                {form.apiAuthType === "BASIC" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label">Gebruikersnaam</label>
                      <input
                        type="text"
                        value={form.apiCredentials.username || ""}
                        onChange={e => updateCredential("username", e.target.value)}
                        placeholder="Gebruikersnaam"
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">Wachtwoord</label>
                      <div className="relative">
                        <input
                          type={showCredentials ? "text" : "password"}
                          value={form.apiCredentials.password || ""}
                          onChange={e => updateCredential("password", e.target.value)}
                          placeholder="Wachtwoord"
                          className="input-field w-full pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCredentials(!showCredentials)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                          aria-label={showCredentials ? "Verbergen" : "Tonen"}
                        >
                          {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {form.apiAuthType === "BEARER" && (
                  <div>
                    <label className="form-label">Bearer token</label>
                    <div className="relative">
                      <input
                        type={showCredentials ? "text" : "password"}
                        value={form.apiCredentials.token || ""}
                        onChange={e => updateCredential("token", e.target.value)}
                        placeholder="Token"
                        className="input-field w-full pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCredentials(!showCredentials)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                        aria-label={showCredentials ? "Verbergen" : "Tonen"}
                      >
                        {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {form.apiAuthType === "API_KEY" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label">Header-naam</label>
                      <input
                        type="text"
                        value={form.apiCredentials.headerName || ""}
                        onChange={e => updateCredential("headerName", e.target.value)}
                        placeholder="Bijv. X-Api-Key"
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="form-label">API-sleutel</label>
                      <div className="relative">
                        <input
                          type={showCredentials ? "text" : "password"}
                          value={form.apiCredentials.apiKey || ""}
                          onChange={e => updateCredential("apiKey", e.target.value)}
                          placeholder="Sleutel"
                          className="input-field w-full pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCredentials(!showCredentials)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                          aria-label={showCredentials ? "Verbergen" : "Tonen"}
                        >
                          {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Field mappings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label !mb-0">Veldkoppelingen <span className="text-danger-600">*</span></label>
                <button
                  type="button"
                  onClick={addMappingRow}
                  className="btn-secondary text-xs"
                  disabled={!form.targetEntity}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Koppeling toevoegen
                </button>
              </div>

              {!form.targetEntity && (
                <p className="text-xs text-text-tertiary">Selecteer eerst een doelentiteit om veldkoppelingen in te stellen.</p>
              )}

              {form.targetEntity && (
                <div className="space-y-2">
                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                    <span className="text-xs text-text-tertiary font-medium">{form.sourceType === "API" ? "Bronveld (JSON-pad)" : "Bronkolom (CSV)"}</span>
                    <span className="w-5" />
                    <span className="text-xs text-text-tertiary font-medium">Doelveld</span>
                    <span className="w-7" />
                  </div>
                  {form.mappings.map((mapping, index) => (
                    <div key={index} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                      <input
                        type="text"
                        value={mapping.sourceColumn}
                        onChange={e => updateMapping(index, "sourceColumn", e.target.value)}
                        placeholder={form.sourceType === "API" ? "Bijv. employee.firstName" : "Kolomnaam in CSV"}
                        className="input-field"
                      />
                      <ArrowRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                      <select
                        value={mapping.targetField}
                        onChange={e => updateMapping(index, "targetField", e.target.value)}
                        className="input-field"
                      >
                        <option value="">-- Selecteer --</option>
                        {availableTargetFields.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeMappingRow(index)}
                        className="btn-icon"
                        aria-label="Koppeling verwijderen"
                        disabled={form.mappings.length <= 1}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {showValidation && form.mappings.every(m => !m.sourceColumn.trim() || !m.targetField) && (
                    <p className="text-xs text-danger-600">Voeg minimaal één geldige veldkoppeling toe.</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <button type="button" onClick={closeForm} className="btn-secondary">
                Annuleren
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? "Opslaan" : "Aanmaken"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upload panel */}
      {uploadSourceId && !readOnly && (
        <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-section-title">CSV uploaden en importeren</h3>
            <button onClick={closeUpload} className="btn-icon" aria-label="Sluiten">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {/* File input */}
            <div>
              <label className="form-label">Bestand selecteren</label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileSelect}
                className="input-field w-full file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-surface-tertiary file:text-text-primary hover:file:bg-surface-inset"
                disabled={uploading || executing}
              />
              <p className="text-xs text-text-tertiary mt-1">CSV- of TXT-bestand, maximaal 5 MB.</p>
            </div>

            {/* Loading state */}
            {uploading && (
              <div className="flex items-center gap-2 p-3 bg-surface-secondary rounded-md">
                <div className="spinner" />
                <span className="text-sm text-text-secondary">Bestand verwerken…</span>
              </div>
            )}

            {/* Error state */}
            {uploadError && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-md">
                <p className="text-sm text-danger-700">{uploadError}</p>
              </div>
            )}

            {/* Upload results */}
            {uploadResult && !executeResult && (
              <div className="space-y-4">
                {/* File info */}
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span>{uploadResult.fileName}</span>
                  <span>{(uploadResult.fileSize / 1024).toFixed(1)} KB</span>
                  <span>{uploadResult.totalRows} rij{uploadResult.totalRows !== 1 ? "en" : ""}</span>
                  <span>{uploadResult.detectedColumns.length} kolom{uploadResult.detectedColumns.length !== 1 ? "men" : ""}</span>
                </div>

                {/* Mapping validation */}
                <div>
                  <h4 className="text-label mb-2">Koppelingsvalidatie</h4>
                  <div className="space-y-1">
                    {uploadResult.mappingValidation.map((mv) => (
                      <div key={mv.sourceColumn} className="flex items-center gap-2 text-sm">
                        {mv.detected ? (
                          <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-danger-600 flex-shrink-0" />
                        )}
                        <span className="font-mono text-text-primary">{mv.sourceColumn}</span>
                        <ArrowRight className="w-3 h-3 text-text-tertiary" />
                        <span className="text-text-secondary">{mv.targetField}</span>
                        {!mv.detected && (
                          <span className="text-xs text-danger-600">— kolom niet gevonden</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {uploadResult.mappingValidation.length === 0 && (
                    <p className="text-xs text-text-tertiary">Geen veldkoppelingen geconfigureerd voor deze bron.</p>
                  )}
                </div>

                {/* Unmapped columns */}
                {uploadResult.unmappedColumns.length > 0 && (
                  <div>
                    <h4 className="text-label mb-2">Niet-gekoppelde kolommen</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {uploadResult.unmappedColumns.map((col) => (
                        <span key={col} className="bg-surface-tertiary px-2 py-0.5 rounded text-xs font-mono text-text-secondary">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview table */}
                {uploadResult.previewRows.length > 0 && (
                  <div>
                    <h4 className="text-label mb-2">Voorbeeld ({Math.min(uploadResult.previewRows.length, 5)} van {uploadResult.totalRows} rijen)</h4>
                    <div className="overflow-x-auto rounded-md border border-border-subtle">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-surface-tertiary">
                            {uploadResult.detectedColumns.map((col) => (
                              <th key={col} className="text-left px-3 py-2 font-medium text-text-secondary whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResult.previewRows.map((row, i) => (
                            <tr key={i} className={i % 2 === 1 ? "bg-surface-secondary" : ""}>
                              {uploadResult.detectedColumns.map((col) => (
                                <td key={col} className="px-3 py-1.5 text-text-primary whitespace-nowrap">
                                  {row[col] || ""}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Import mode + Execute button */}
                <div className="pt-3 border-t border-border-subtle space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-label">Modus:</span>
                    <label className="flex items-center gap-1.5 text-sm text-text-secondary cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="create"
                        checked={importMode === "create"}
                        onChange={() => setImportMode("create")}
                        className="accent-brand-600"
                      />
                      Alleen aanmaken
                    </label>
                    <label className="flex items-center gap-1.5 text-sm text-text-secondary cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="upsert"
                        checked={importMode === "upsert"}
                        onChange={() => setImportMode("upsert")}
                        className="accent-brand-600"
                      />
                      Aanmaken of bijwerken
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-text-tertiary">
                      {allMappingsDetected
                        ? importMode === "upsert"
                          ? `Klaar om ${uploadResult.totalRows} rij(en) te importeren. Bestaande records worden bijgewerkt.`
                          : `Klaar om ${uploadResult.totalRows} rij(en) te importeren.`
                        : "Let op: niet alle koppelingen zijn gevonden. Ontbrekende velden worden overgeslagen."
                      }
                    </div>
                    <button
                      onClick={handleExecute}
                      disabled={executing || uploadResult.mappingValidation.length === 0}
                      className="btn-primary"
                    >
                      {executing ? (
                        <>
                          <div className="spinner !w-4 !h-4" />
                          Importeren…
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Importeren
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Execute result */}
            {executeResult && (
              <div className="space-y-3">
                <div className={`p-4 rounded-md border ${
                  (executeResult.importedRows > 0 || executeResult.updatedRows > 0)
                    ? "bg-success-50 border-success-200"
                    : "bg-danger-50 border-danger-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {(executeResult.importedRows > 0 || executeResult.updatedRows > 0) ? (
                      <CheckCircle2 className="w-5 h-5 text-success-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-danger-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      (executeResult.importedRows > 0 || executeResult.updatedRows > 0) ? "text-success-700" : "text-danger-700"
                    }`}>
                      Import {(executeResult.importedRows > 0 || executeResult.updatedRows > 0) ? "voltooid" : "mislukt"}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-text-secondary">
                      Totaal: <span className="font-medium text-text-primary">{executeResult.totalRows}</span> rijen
                    </span>
                    <span className="text-success-700">
                      Aangemaakt: <span className="font-medium">{executeResult.importedRows}</span>
                    </span>
                    {executeResult.updatedRows > 0 && (
                      <span className="text-brand-700">
                        Bijgewerkt: <span className="font-medium">{executeResult.updatedRows}</span>
                      </span>
                    )}
                    {executeResult.skippedRows > 0 && (
                      <span className="text-warning-700">
                        Overgeslagen: <span className="font-medium">{executeResult.skippedRows}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Error details */}
                {executeResult.errors.length > 0 && (
                  <div className="bg-danger-50 rounded-md border border-danger-200 p-3">
                    <h4 className="text-label text-danger-700 mb-2">
                      Fouten ({executeResult.errors.length})
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {executeResult.errors.map((err, i) => (
                        <p key={i} className="text-xs text-danger-700">
                          {err.row > 0 ? `Rij ${err.row}: ` : ""}{err.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Importbron verwijderen"
          message={`Weet je zeker dat je de importbron "${pendingDelete.name}" wilt verwijderen?`}
          onConfirm={() => { handleDelete(pendingDelete.id); setPendingDelete(null); }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

function availableTargetFieldLabel(entity: string, fieldValue: string): string {
  const fields = TARGET_FIELDS[entity];
  if (!fields) return fieldValue;
  return fields.find(f => f.value === fieldValue)?.label || fieldValue;
}
