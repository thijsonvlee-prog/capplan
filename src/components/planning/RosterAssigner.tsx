"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";

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
    }));
    setProfileId("");
    setStartDate("");
    setWeeklyHours("");
  }

  function handleDelete(recordId: string) {
    const record = records.find((r) => r.id === recordId);
    const recordLabel = record ? `${record.profileName} vanaf ${record.startDate}` : "dit roosterrecord";
    if (!window.confirm(`Weet je zeker dat je "${recordLabel}" wilt verwijderen?`)) return;
    mutate(() => api.drivers.deleteRosterAssignment(driverId, recordId));
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[520px] space-y-4 max-h-[80vh] overflow-y-auto">
        <h3 className="font-semibold text-sm">Roosterprofiel — {driverName}</h3>

        {records.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Roosterhistorie</div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500">
                  <th className="text-left p-2 border border-gray-200">#</th>
                  <th className="text-left p-2 border border-gray-200">Profiel</th>
                  <th className="text-left p-2 border border-gray-200">Ingangsdatum</th>
                  <th className="text-left p-2 border border-gray-200">Einddatum</th>
                  <th className="text-left p-2 border border-gray-200">Uren/wk</th>
                  <th className="w-8 border border-gray-200"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className={!r.endDate ? "bg-blue-50" : ""}>
                    <td className="p-2 border border-gray-200 text-sm">{r.sequenceNumber}</td>
                    <td className="p-2 border border-gray-200 text-sm">{r.profileName}</td>
                    <td className="p-2 border border-gray-200 text-sm">{r.startDate}</td>
                    <td className="p-2 border border-gray-200 text-sm">
                      {r.endDate || <span className="text-green-600 text-xs font-medium">Actief</span>}
                    </td>
                    <td className="p-2 border border-gray-200 text-sm">{r.weeklyHours ?? "-"}</td>
                    <td className="p-1 border border-gray-200 text-center">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Verwijderen"
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

        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="text-xs font-medium text-gray-500">Nieuw roosterprofiel toewijzen</div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Roosterprofiel</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">-- Selecteer --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {profiles.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">Maak eerst een profiel aan via Instellingen.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ingangsdatum</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Uren/week (gem.)</label>
              <input
                type="number"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value ? Number(e.target.value) : "")}
                placeholder="40"
                min={0}
                max={60}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAssign}
              disabled={!profileId || !startDate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Toewijzen
            </button>
            <button onClick={onClose} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
              Sluiten
            </button>
          </div>
          <p className="text-xs text-gray-400">Het roosterprofiel wordt voor 1 jaar (364 dagen) cyclisch toegepast. Bestaande verlof- en ziekmeldingen blijven behouden.</p>
        </div>
      </div>
    </div>
  );
}
