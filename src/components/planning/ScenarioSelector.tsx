"use client";

import { useState } from "react";
import { Plus, Copy, Trash2 } from "lucide-react";
import { useStore } from "@/repositories/localStorage/storage";
import { services } from "@/services";

export function ScenarioSelector() {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const scenarios = useStore(() => services.scenario.getScenarios());
  const activeId = useStore(() => services.scenario.getActiveId());

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const s = services.scenario.create(newName.trim(), newDesc.trim() || undefined);
    services.scenario.setActiveId(s.id);
    setNewName("");
    setNewDesc("");
    setShowCreate(false);
  }

  function handleDuplicate() {
    const name = activeId === "default" ? "Kopie van Actueel" : `Kopie van ${scenarios.find((s) => s.id === activeId)?.name || "scenario"}`;
    const s = services.scenario.duplicate(activeId, name);
    services.scenario.setActiveId(s.id);
  }

  function handleDelete() {
    if (activeId === "default") return;
    services.scenario.delete(activeId);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={activeId}
        onChange={(e) => services.scenario.setActiveId(e.target.value)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
      >
        <option value="default">Actuele planning</option>
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {activeId !== "default" && (
        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">
          Concept
        </span>
      )}

      <button
        onClick={() => setShowCreate(true)}
        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
        title="Nieuw scenario"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={handleDuplicate}
        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
        title="Dupliceer scenario"
      >
        <Copy className="w-4 h-4" />
      </button>
      {activeId !== "default" && (
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
          title="Verwijder scenario"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-xl p-6 w-96 space-y-3">
            <h3 className="font-semibold text-sm">Nieuw scenario</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Naam..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              autoFocus
              required
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Beschrijving (optioneel)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <div className="flex gap-2 pt-1">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Aanmaken
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
