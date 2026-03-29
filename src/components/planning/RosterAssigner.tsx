"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";

type Props = {
  driverId: string;
  driverName: string;
  onClose: () => void;
};

export function RosterAssigner({ driverId, driverName, onClose }: Props) {
  const profiles = useApiData(() => api.rosterProfiles.list(), [], []);
  const activeScenarioId = useApiData(() => api.scenarios.getActiveId(), [], "default");
  const records = useApiData(() => api.drivers.getRosterAssignments(driverId), [driverId], []);
  const [profileId, setProfileId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState<number | "">("");

  function handleAssign() {
    if (!profileId || !startDate) return;
    mutate(() => api.drivers.addRosterAssignment(driverId, {
      startDate,
      rosterProfileId: profileId,
      weeklyHours: weeklyHours !== "" ? weeklyHours : undefined,
      scenarioId: activeScenarioId === "default" ? undefined : activeScenarioId,
    }))
      .then(() => showToast("Roosterprofiel toegewezen"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    setProfileId("");
    setStartDate("");
    setWeeklyHours("");
  }

  function handleDelete(recordId: string) {
    const record = records.find((r) => r.id === recordId);
    const recordLabel = record ? `${record.profileName} vanaf ${record.startDate}` : "dit roosterrecord";
    if (!window.confirm(`Weet je zeker dat je "${recordLabel}" wilt verwijderen?`)) return;
    mutate(() => api.drivers.deleteRosterAssignment(driverId, recordId))
      .then(() => showToast("Roostertoewijzing verwijderd"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label={`Roosterprofiel toewijzen aan ${driverName}`}>
      <div className="bg-surface-primary rounded-lg shadow-modal p-6 w-[520px] space-y-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-section-title">Roosterprofiel — {driverName}</h3>

        {records.length > 0 && (
          <div>
            <div className="text-caption font-medium mb-1">Roosterhistorie</div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-surface-tertiary text-xs text-text-secondary">
                  <th className="text-left p-2 border border-border-default">#</th>
                  <th className="text-left p-2 border border-border-default">Profiel</th>
                  <th className="text-left p-2 border border-border-default">Ingangsdatum</th>
                  <th className="text-left p-2 border border-border-default">Einddatum</th>
                  <th className="text-left p-2 border border-border-default">Uren/week</th>
                  <th className="w-8 border border-border-default"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className={!r.endDate ? "bg-brand-50" : ""}>
                    <td className="p-2 border border-border-default text-sm">{r.sequenceNumber}</td>
                    <td className="p-2 border border-border-default text-sm">{r.profileName}</td>
                    <td className="p-2 border border-border-default text-sm">{r.startDate}</td>
                    <td className="p-2 border border-border-default text-sm">
                      {r.endDate || <span className="text-success-600 text-xs font-medium">Actief</span>}
                    </td>
                    <td className="p-2 border border-border-default text-sm">{r.weeklyHours ?? "-"}</td>
                    <td className="p-1 border border-border-default text-center">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="btn-icon-danger"
                        title="Verwijderen"
                        aria-label="Verwijderen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-border-default pt-4 space-y-3">
          <div className="text-caption font-medium">Nieuw roosterprofiel toewijzen</div>
          <div>
            <label className="form-label">Roosterprofiel <span className="text-danger-600">*</span></label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="input-field w-full"
            >
              <option value="">-- Selecteer --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {profiles.length === 0 && (
              <p className="text-caption mt-1">Maak eerst een profiel aan via Instellingen.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Ingangsdatum <span className="text-danger-600">*</span></label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="form-label">Uren/week (gemiddeld)</label>
              <input
                type="number"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value ? Number(e.target.value) : "")}
                placeholder="40"
                min={0}
                max={60}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAssign}
              disabled={!profileId || !startDate}
              className="btn-primary"
            >
              Toewijzen
            </button>
            <button onClick={onClose} className="btn-secondary">
              Sluiten
            </button>
          </div>
          <p className="text-caption">Het roosterprofiel wordt voor 1 jaar (364 dagen) cyclisch toegepast. Bestaande verlof- en ziekmeldingen blijven behouden.</p>
        </div>
      </div>
    </div>
  );
}
