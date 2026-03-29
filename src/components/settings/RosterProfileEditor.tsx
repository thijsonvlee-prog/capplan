"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import type { RosterProfileEntry, RosterProfile } from "@/domain/types";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { ROSTER_PROFILE_STATUSES, STATUS_CODES, STATUS_COLORS, DAY_LABELS, type RosterProfileStatus } from "@/domain/constants";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";

function emptyGrid(): RosterProfileEntry[] {
  return Array.from({ length: 28 }, (_, i) => ({ dayOffset: i, status: "ROSTER_FREE" as const }));
}

export function RosterProfileEditor() {
  const profiles = useApiData(() => api.rosterProfiles.list(), [], []);
  const [editingProfile, setEditingProfile] = useState<RosterProfile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState("");
  const [grid, setGrid] = useState<RosterProfileEntry[]>(emptyGrid());
  const [showValidation, setShowValidation] = useState(false);

  function startNew() {
    setIsNew(true);
    setEditingProfile(null);
    setName("");
    setGrid(emptyGrid());
    setShowValidation(false);
  }

  function startEdit(profile: RosterProfile) {
    setEditingProfile(profile);
    setIsNew(false);
    setName(profile.name);
    setShowValidation(false);
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
    if (!name.trim()) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    if (isNew) {
      mutate(() => api.rosterProfiles.create(name.trim(), grid))
        .then(() => showToast("Roosterprofiel aangemaakt"))
        .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    } else if (editingProfile) {
      mutate(() => api.rosterProfiles.update(editingProfile.id, name.trim(), grid))
        .then(() => showToast("Roosterprofiel bijgewerkt"))
        .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    }
    setEditingProfile(null);
    setIsNew(false);
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Weet je zeker dat je roosterprofiel "${name}" wilt verwijderen?`)) return;
    mutate(() => api.rosterProfiles.remove(id))
      .then(() => showToast("Roosterprofiel verwijderd"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
  }

  const showEditor = isNew || editingProfile;

  return (
    <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle">
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h3 className="text-section-title">Roosterprofielen</h3>
          <p className="text-caption mt-1">Een roosterprofiel van 4 weken kan cyclisch aan chauffeurs worden toegewezen.</p>
        </div>
        {!showEditor && (
          <button onClick={startNew} className="btn-primary">
            <Plus className="w-4 h-4" /> Nieuw profiel
          </button>
        )}
      </div>

      {showEditor && (
        <div className="p-4 border-b border-border-subtle space-y-3">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setShowValidation(false); }}
              placeholder="Profielnaam..."
              className={`input-field w-64 ${showValidation && !name.trim() ? "border-red-400" : ""}`}
              autoFocus
            />
            {showValidation && !name.trim() && (
              <div className="text-xs text-red-600 mt-1">Vul een profielnaam in.</div>
            )}
          </div>
          <div className="text-caption mb-1">Klik op een cel om de status te wisselen: Roostervrij → Basisrooster → Aanvullend beschikbaar</div>
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-text-secondary font-medium">Week</th>
                  {DAY_LABELS.map((d) => (
                    <th key={d} className="p-1 text-center text-text-secondary font-medium min-w-[32px]">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3].map((weekIdx) => (
                  <tr key={weekIdx}>
                    <td className="p-1 text-text-tertiary font-medium">{weekIdx + 1}</td>
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
            <button onClick={handleSave} className="btn-primary">
              <Save className="w-4 h-4" /> Opslaan
            </button>
            <button onClick={() => { setEditingProfile(null); setIsNew(false); }} className="btn-secondary">
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-border-subtle">
        {profiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 hover:bg-surface-secondary">
            <div>
              <span className="text-sm text-text-primary font-medium">{p.name}</span>
              <span className="text-xs text-text-tertiary ml-2">
                ({p.entries.filter((e) => e.status === "BASE_ROSTER").length} basisdagen,{" "}
                {p.entries.filter((e) => e.status === "AVAILABLE_EXTRA").length} aanvullend)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(p)} className="btn-icon">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(p.id, p.name)} className="btn-icon-danger">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {profiles.length === 0 && !showEditor && (
          <div className="p-4 text-center text-text-tertiary text-sm">Nog geen roosterprofielen. Maak een profiel aan om het aan chauffeurs toe te wijzen.</div>
        )}
      </div>
    </div>
  );
}
