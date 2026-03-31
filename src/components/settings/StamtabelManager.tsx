"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { StamtabelRecord } from "@/domain/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Props = {
  title: string;
  description: string;
  records: StamtabelRecord[];
  onCreate: (code: string, description: string) => void;
  onUpdate: (id: string, code: string, description: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  readOnly?: boolean;
  error?: string | null;
};

export function StamtabelManager({ title, description, records, onCreate, onUpdate, onDelete, loading, readOnly, error }: Props) {
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StamtabelRecord | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newCode.trim() || !newDesc.trim()) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    onCreate(newCode.trim(), newDesc.trim());
    setNewCode("");
    setNewDesc("");
  }

  function startEdit(r: StamtabelRecord) {
    setEditingId(r.id);
    setEditCode(r.code);
    setEditDesc(r.description);
  }

  function saveEdit() {
    if (editingId && editCode.trim() && editDesc.trim()) {
      onUpdate(editingId, editCode.trim(), editDesc.trim());
    }
    setEditingId(null);
  }

  return (
    <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle">
      <div className="p-4 border-b border-border-subtle">
        <h3 className="text-section-title">{title}</h3>
        <p className="text-caption mt-1">{description}</p>
      </div>

      {!readOnly && (
        <>
          <form onSubmit={handleAdd} className="p-4 border-b border-border-subtle flex gap-2">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Code *"
              className="input-field w-24"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Omschrijving *"
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary">
              <Plus className="w-4 h-4" />
              Toevoegen
            </button>
          </form>
          {showValidation && (!newCode.trim() || !newDesc.trim()) && (
            <div className="px-4 pb-2 -mt-2 text-xs text-danger-600">Vul zowel een code als een omschrijving in.</div>
          )}
        </>
      )}

      <div className="divide-y divide-border-subtle">
        {loading && (
          <div className="p-6 flex justify-center">
            <div className="spinner" />
          </div>
        )}
        {!loading && error && records.length === 0 && (
          <div className="p-6 text-center">
            <div className="text-sm font-medium text-danger-600">Fout bij ophalen gegevens</div>
            <div className="text-xs text-text-tertiary mt-1">{error}</div>
          </div>
        )}
        {!loading && records.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-3 hover:bg-surface-secondary">
            {editingId === r.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="input-field w-24"
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="input-field flex-1"
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                />
                <button onClick={saveEdit} className="p-1 text-success-600 hover:bg-success-50 rounded-md" aria-label="Opslaan">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingId(null)} className="btn-icon" aria-label="Annuleren">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="bg-surface-tertiary px-2 py-0.5 rounded text-xs font-mono">{r.code}</span>
                  <span className="text-sm text-text-primary">{r.description}</span>
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(r)} className="btn-icon" aria-label="Bewerken">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setPendingDelete(r)} className="btn-icon-danger" aria-label="Verwijderen">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {!loading && records.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-text-secondary">Nog geen {title.toLowerCase()} toegevoegd.</p>
            <p className="text-xs text-text-tertiary mt-1">Vul hierboven een code en omschrijving in en klik op &quot;Toevoegen&quot; om te beginnen.</p>
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Verwijderen bevestigen"
          message={`Weet je zeker dat je "${pendingDelete.description}" wilt verwijderen?`}
          onConfirm={() => { onDelete(pendingDelete.id); setPendingDelete(null); }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
