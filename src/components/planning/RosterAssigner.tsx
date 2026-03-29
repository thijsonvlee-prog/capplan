"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DateInput } from "@/components/ui/DateInput";

type Props = {
  driverId: string;
  driverName: string;
  onClose: () => void;
};

export function RosterAssigner({ driverId, driverName, onClose }: Props) {
  const focusTrapRef = useFocusTrap();
  const profiles = useApiData(() => api.rosterProfiles.list(), [], []);
  const activeScenarioId = useApiData(() => api.scenarios.getActiveId(), [], "default");
  const records = useApiData(() => api.drivers.getRosterAssignments(driverId), [driverId], []);
  const [profileId, setProfileId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState<number | "">("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
    setPendingDeleteId(recordId);
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    mutate(() => api.drivers.deleteRosterAssignment(driverId, pendingDeleteId))
      .then(() => showToast("Roostertoewijzing verwijderd"))
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    setPendingDeleteId(null);
  }

  const pendingRecord = pendingDeleteId ? records.find((r) => r.id === pendingDeleteId) : null;
  const pendingLabel = pendingRecord ? `${pendingRecord.profileName} vanaf ${pendingRecord.startDate}` : "dit roosterrecord";

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label={`Roosterprofiel toewijzen aan ${driverName}`} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
      <div ref={focusTrapRef} className="bg-surface-primary rounded-lg shadow-modal p-6 w-[520px] space-y-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-section-title">Roosterprofiel — {driverName}</h3>

        {records.length > 0 && (
          <div className="bg-surface-primary rounded-lg border border-border-subtle overflow-hidden">
            <div className="text-caption font-medium px-3 py-2">Roosterhistorie</div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-surface-tertiary text-label border-b border-border-subtle">
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Profiel</th>
                  <th className="text-left p-2">Ingangsdatum</th>
                  <th className="text-left p-2">Einddatum</th>
                  <th className="text-left p-2">Uren/week</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={r.id} className={`${!r.endDate ? "bg-success-50" : idx % 2 === 1 ? "bg-surface-secondary/50" : ""} ${idx < records.length - 1 ? "border-b border-border-subtle" : ""}`}>
                    <td className="p-2 text-sm">{r.sequenceNumber}</td>
                    <td className="p-2 text-sm font-medium">{r.profileName}</td>
                    <td className="p-2 text-sm">{r.startDate}</td>
                    <td className="p-2 text-sm">
                      {r.endDate || <span className="text-success-600 text-xs font-medium">Actief</span>}
                    </td>
                    <td className="p-2 text-sm">{r.weeklyHours ?? "-"}</td>
                    <td className="p-1 text-center">
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
              <DateInput value={startDate} onChange={setStartDate} className="w-full" />
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

      {pendingDeleteId && (
        <ConfirmDialog
          title="Verwijderen bevestigen"
          message={`Weet je zeker dat je "${pendingLabel}" wilt verwijderen?`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}
