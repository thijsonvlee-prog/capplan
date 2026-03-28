"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import type { RosterProfileEntry, RosterProfile } from "@/domain/types";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { ROSTER_PROFILE_STATUSES, STATUS_CODES, STATUS_COLORS, DAY_LABELS, type RosterProfileStatus } from "@/domain/constants";
import { cn } from "@/lib/utils";

function emptyGrid(): RosterProfileEntry[] {
  return Array.from({ length: 28 }, (_, i) => ({ dayOffset: i, status: "ROSTER_FREE" as const }));
}

export function RosterProfileEditor() {
  const profiles = useApiData(() => api.rosterProfiles.list(), [], []);
  const [editingProfile, setEditingProfile] = useState<RosterProfile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState("");
  const [grid, setGrid] = useState<RosterProfileEntry[]>(emptyGrid());

  function startNew() {
    setIsNew(true);
    setEditingProfile(null);
    setName("");
    setGrid(emptyGrid());
  }

  function startEdit(profile: RosterProfile) {
    setEditingProfile(profile);
    setIsNew(false);
    setName(profile.name);
    // Ensure all 28 days have an entry
    const g = emptyGrid();
    for (const e of profile.entries) {
      if (e.dayOffset >= 0 && e.dayOffset < 28) {
        g[e.dayOffset] = e;
      }
    }
    setGrid(g);
  }

  function cycleStatus(dayOffset: number) {
    setGrid((prev) => {
      const next = [...prev];
      const current = next[dayOffset].status;
      const idx = ROSTER_PROFILE_STATUSES.indexOf(current as RosterProfileStatus);
      next[dayOffset] = { dayOffset, status: ROSTER_PROFILE_STATUSES[(idx + 1) % ROSTER_PROFILE_STATUSES.length] };
      return next;
    });
  }

  function handleSave() {
    if (!name.trim()) return;
    if (isNew) {
      mutate(() => api.rosterProfiles.create(name.trim(), grid));
    } else if (editingProfile) {
      mutate(() => api.rosterProfiles.update(editingProfile.id, name.trim(), grid));
    }
    setEditingProfile(null);
    setIsNew(false);
  }

  function handleDelete(id: string) {
    mutate(() => api.rosterProfiles.remove(id));
  }

  const showEditor = isNew || editingProfile;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Roosterprofielen</h3>
          <p className="text-xs text-gray-400 mt-1">Een roosterprofiel van 4 weken kan cyclisch aan chauffeurs worden toegewezen.</p>
        </div>
        {!showEditor && (
          <button onClick={startNew} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" /> Nieuw profiel
          </button>
        )}
      </div>

      {showEditor && (
        <div className="p-4 border-b border-gray-100 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Profielnaam..."
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
            autoFocus
          />
          <div className="text-xs text-gray-500 mb-1">Klik op een cel om de status te wisselen: Roostervrij → Basisrooster → Aanvullend beschikbaar</div>
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-gray-500 font-medium">Week</th>
                  {DAY_LABELS.map((d) => (
                    <th key={d} className="p-1 text-center text-gray-500 font-medium min-w-[32px]">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3].map((weekIdx) => (
                  <tr key={weekIdx}>
                    <td className="p-1 text-gray-400 font-medium">{weekIdx + 1}</td>
                    {Array.from({ length: 7 }, (_, dayIdx) => {
                      const offset = weekIdx * 7 + dayIdx;
                      const entry = grid[offset];
                      return (
                        <td key={offset} className="p-0.5">
                          <button
                            type="button"
                            onClick={() => cycleStatus(offset)}
                            className={cn(
                              "w-8 h-8 rounded text-xs font-bold flex items-center justify-center transition-colors",
                              STATUS_COLORS[entry.status]
                            )}
                          >
                            {STATUS_CODES[entry.status]}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              <Save className="w-4 h-4" /> Opslaan
            </button>
            <button onClick={() => { setEditingProfile(null); setIsNew(false); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {profiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
            <div>
              <span className="text-sm text-gray-700 font-medium">{p.name}</span>
              <span className="text-xs text-gray-400 ml-2">
                ({p.entries.filter((e) => e.status === "BASE_ROSTER").length} B,{" "}
                {p.entries.filter((e) => e.status === "AVAILABLE_EXTRA").length} A)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(p)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {profiles.length === 0 && !showEditor && (
          <div className="p-4 text-center text-gray-400 text-sm">Geen roosterprofielen</div>
        )}
      </div>
    </div>
  );
}
