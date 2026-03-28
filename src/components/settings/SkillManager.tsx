"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";

export function SkillManager() {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const skills = useApiData(() => api.settings.getSkills(), [], []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    mutate(() => api.settings.createSkill(newName.trim()));
    setNewName("");
  }

  function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditingName(name);
  }

  function saveEdit() {
    if (editingId && editingName.trim()) {
      mutate(() => api.settings.updateSkill(editingId, editingName.trim()));
    }
    setEditingId(null);
    setEditingName("");
  }

  function handleDelete(id: string) {
    mutate(() => api.settings.deleteSkill(id));
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Vaardigheden (Stamtabel)</h3>
        <p className="text-xs text-gray-400 mt-1">Beheer de vaardigheden die aan chauffeurs gekoppeld kunnen worden.</p>
      </div>

      <form onSubmit={handleAdd} className="p-4 border-b border-gray-100 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nieuwe vaardigheid..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button
          type="submit"
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          Toevoegen
        </button>
      </form>

      <div className="divide-y divide-gray-100">
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
            {editingId === skill.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                />
                <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-sm text-gray-700">{skill.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(skill.id, skill.name)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {skills.length === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">
            Geen vaardigheden gedefinieerd
          </div>
        )}
      </div>
    </div>
  );
}
