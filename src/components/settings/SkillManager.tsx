"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useApiDataWithLoading, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function SkillManager() {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const [skills, loading] = useApiDataWithLoading(() => api.settings.getSkills(), [], []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    mutate(() => api.settings.createSkill(newName.trim()))
      .then(() => showToast("Vaardigheid toegevoegd"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    setNewName("");
  }

  function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditingName(name);
  }

  function saveEdit() {
    if (editingId && editingName.trim()) {
      mutate(() => api.settings.updateSkill(editingId, editingName.trim()))
        .then(() => showToast("Vaardigheid bijgewerkt"))
        .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    }
    setEditingId(null);
    setEditingName("");
  }

  function handleDelete(id: string, name: string) {
    setPendingDelete({ id, name });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    mutate(() => api.settings.deleteSkill(pendingDelete.id))
      .then(() => showToast("Vaardigheid verwijderd"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    setPendingDelete(null);
  }

  return (
    <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle">
      <div className="p-4 border-b border-border-subtle">
        <h3 className="text-section-title">Vaardigheden</h3>
        <p className="text-caption mt-1">Beheer de vaardigheden die aan chauffeurs gekoppeld kunnen worden.</p>
      </div>

      <form onSubmit={handleAdd} className="p-4 border-b border-border-subtle flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nieuwe vaardigheid *"
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary">
          <Plus className="w-4 h-4" />
          Toevoegen
        </button>
      </form>
      {showValidation && !newName.trim() && (
        <div className="px-4 pb-2 -mt-2 text-xs text-danger-600">Vul een vaardigheidsnaam in.</div>
      )}

      <div className="divide-y divide-border-subtle">
        {loading && (
          <div className="p-6 flex justify-center">
            <div className="spinner" />
          </div>
        )}
        {!loading && skills.map((skill) => (
          <div key={skill.id} className="flex items-center justify-between p-3 hover:bg-surface-secondary">
            {editingId === skill.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="input-field flex-1"
                  autoFocus
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
                <span className="text-sm text-text-primary">{skill.name}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(skill.id, skill.name)} className="btn-icon" aria-label="Bewerken">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(skill.id, skill.name)} className="btn-icon-danger" aria-label="Verwijderen">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {!loading && skills.length === 0 && (
          <div className="p-4 text-center text-text-tertiary text-sm">
            Nog geen vaardigheden. Voeg een vaardigheid toe om deze aan chauffeurs te koppelen.
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Verwijderen bevestigen"
          message={`Weet je zeker dat je "${pendingDelete.name}" wilt verwijderen?`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
