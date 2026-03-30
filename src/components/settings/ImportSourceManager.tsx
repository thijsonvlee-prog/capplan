"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, ArrowRight, FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import type { ImportSource, CsvUploadResult } from "@/domain/types";
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

type FormState = {
  name: string;
  description: string;
  targetEntity: string;
  mappings: FieldMapping[];
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  targetEntity: "",
  mappings: [{ sourceColumn: "", targetField: "" }],
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

export function ImportSourceManager() {
  const [sources, loading] = useApiDataWithLoading(() => api.importSources.list(), [], []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showValidation, setShowValidation] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ImportSource | null>(null);
  const [uploadSourceId, setUploadSourceId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<CsvUploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      targetEntity: source.targetEntity,
      mappings: recordToMappings(source.fieldMappings),
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

  function isFormValid(): boolean {
    if (!form.name.trim() || !form.targetEntity) return false;
    const validMappings = form.mappings.filter(m => m.sourceColumn.trim() && m.targetField);
    return validMappings.length > 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid()) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);

    const payload = {
      name: form.name.trim(),
      targetEntity: form.targetEntity,
      fieldMappings: mappingsToRecord(form.mappings),
      description: form.description.trim() || undefined,
    };

    if (editingId) {
      mutate(() => api.importSources.update(editingId, payload))
        .then(() => { showToast("Importbron bijgewerkt"); closeForm(); })
        .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    } else {
      mutate(() => api.importSources.create(payload))
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
  }

  function closeUpload() {
    setUploadSourceId(null);
    setUploadResult(null);
    setUploadError(null);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadSourceId) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    api.importSources.upload(uploadSourceId, file)
      .then((result) => {
        setUploadResult(result);
        setUploading(false);
      })
      .catch((err) => {
        setUploadError(err instanceof Error ? err.message : "Upload mislukt. Controleer het bestand.");
        setUploading(false);
      });

    // Reset file input so the same file can be re-selected
    e.target.value = "";
  }

  const targetEntityLabel = (entity: string) =>
    TARGET_ENTITIES.find(t => t.value === entity)?.label || entity;

  const availableTargetFields = TARGET_FIELDS[form.targetEntity] || [];

  return (
    <div className="space-y-4">
      {/* Source list */}
      <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle">
        <div className="p-4 flex items-center justify-between border-b border-border-subtle">
          <div>
            <h3 className="text-section-title">Importbronnen</h3>
            <p className="text-caption mt-1">CSV-bronnen met veldkoppelingen voor het importeren van gegevens.</p>
          </div>
          <button onClick={openCreateForm} className="btn-primary" disabled={showForm}>
            <Plus className="w-4 h-4" />
            Nieuwe bron
          </button>
        </div>

        {loading && (
          <div className="p-6 flex justify-center">
            <div className="spinner" />
          </div>
        )}

        {!loading && sources.length === 0 && !showForm && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-tertiary flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6 text-text-tertiary" />
            </div>
            <p className="text-sm text-text-secondary">Nog geen importbronnen geconfigureerd.</p>
            <p className="text-xs text-text-tertiary mt-1">Klik op &quot;Nieuwe bron&quot; om een CSV-importconfiguratie aan te maken.</p>
          </div>
        )}

        {!loading && sources.length > 0 && (
          <div className="divide-y divide-border-subtle">
            {sources.map(source => (
              <div key={source.id} className="p-4 hover:bg-surface-secondary transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-medium text-text-primary">{source.name}</span>
                      <span className="bg-surface-tertiary px-2 py-0.5 rounded text-xs font-mono text-text-secondary">
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
                    <button onClick={() => openUpload(source.id)} className="btn-icon" aria-label="CSV uploaden">
                      <Upload className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditForm(source)} className="btn-icon" aria-label="Bewerken">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setPendingDelete(source)} className="btn-icon-danger" aria-label="Verwijderen">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit form */}
      {showForm && (
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
                    <span className="text-xs text-text-tertiary font-medium">Bronkolom (CSV)</span>
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
                        placeholder="Kolomnaam in CSV"
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
      {uploadSourceId && (
        <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-section-title">CSV uploaden</h3>
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
                disabled={uploading}
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
            {uploadResult && (
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
