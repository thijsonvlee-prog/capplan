"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { StamtabelRecord } from "@/domain/types";

type Props = {
  title: string;
  description: string;
  records: StamtabelRecord[];
  onCreate: (code: string, description: string) => void;
  onUpdate: (id: string, code: string, description: string) => void;
  onDelete: (id: string) => void;
};

export function StamtabelManager({ title, description, records, onCreate, onUpdate, onDelete }: Props) {
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDesc, setEditDesc] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newCode.trim() || !newDesc.trim()) return;
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>

      <form onSubmit={handleAdd} className="p-4 border-b border-gray-100 flex gap-2">
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="Code..."
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="text"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Omschrijving..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button type="submit" className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="w-4 h-4" />
          Toevoegen
        </button>
      </form>

      <div className="divide-y divide-gray-100">
        {records.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
            {editingId === r.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
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
                <div className="flex items-center gap-3">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{r.code}</span>
                  <span className="text-sm text-gray-700">{r.description}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(r)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (window.confirm(`Weet je zeker dat je "${r.description}" wilt verwijderen?`)) onDelete(r.id); }} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {records.length === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">Nog geen {title.toLowerCase()} toegevoegd.</div>
        )}
      </div>
    </div>
  );
}
