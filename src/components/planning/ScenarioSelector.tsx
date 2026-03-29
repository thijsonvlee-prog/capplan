"use client";

import { useState } from "react";
import { Plus, Copy, Trash2 } from "lucide-react";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function ScenarioSelector() {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const focusTrapRef = useFocusTrap();

  const scenarios = useApiData(() => api.scenarios.list(), [], []);
  const activeId = useApiData(() => api.scenarios.getActiveId(), [], "default");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    mutate(async () => {
      const s = await api.scenarios.create(newName.trim(), newDesc.trim() || undefined);
      await api.scenarios.setActiveId(s.id);
    })
      .then(() => showToast("Scenario aangemaakt"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    setNewName("");
    setNewDesc("");
    setShowCreate(false);
  }

  function handleDuplicate() {
    const name = activeId === "default" ? "Kopie van Actueel" : `Kopie van ${scenarios.find((s) => s.id === activeId)?.name || "scenario"}`;
    mutate(async () => {
      const s = await api.scenarios.duplicate(activeId, name);
      await api.scenarios.setActiveId(s.id);
    })
      .then(() => showToast("Scenario gedupliceerd"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
  }

  function handleDelete() {
    if (activeId === "default") return;
    setShowDeleteConfirm(true);
  }

  function confirmDelete() {
    mutate(() => api.scenarios.remove(activeId))
      .then(() => showToast("Scenario verwijderd"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    setShowDeleteConfirm(false);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={activeId}
        onChange={(e) => mutate(() => api.scenarios.setActiveId(e.target.value))}
        className="input-field"
      >
        <option value="default">Actuele planning</option>
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {activeId !== "default" && (
        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium" title="Dit scenario is een werkkopie en heeft geen invloed op de actuele planning">
          Concept
        </span>
      )}

      <button
        onClick={() => setShowCreate(true)}
        className="btn-icon p-1.5"
        title="Nieuw scenario"
        aria-label="Nieuw scenario"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={handleDuplicate}
        className="btn-icon p-1.5"
        title="Dupliceer scenario"
        aria-label="Dupliceer scenario"
      >
        <Copy className="w-4 h-4" />
      </button>
      {activeId !== "default" && (
        <button
          onClick={handleDelete}
          className="btn-icon-danger p-1.5"
          title="Verwijder scenario"
          aria-label="Verwijder scenario"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Nieuw scenario aanmaken">
          <form ref={focusTrapRef} onSubmit={handleCreate} className="bg-surface-primary rounded-lg shadow-modal p-6 w-96 space-y-3">
            <h3 className="text-section-title">Nieuw scenario</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Naam *"
              className="input-field w-full"
              autoFocus
              required
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Beschrijving (optioneel)..."
              className="input-field w-full"
            />
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary">
                Aanmaken
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Scenario verwijderen"
          message={`Weet je zeker dat je "${scenarios.find((s) => s.id === activeId)?.name || "dit scenario"}" wilt verwijderen? Alle bijbehorende planningsdata gaat verloren.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
