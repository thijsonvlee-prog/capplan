"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  useStore,
  getRosterProfiles,
  assignRosterProfile,
  getActiveScenarioId,
  getDriverRosterAssignments,
  deleteRosterAssignment,
} from "@/lib/store";
import { get4WeekPeriodStarts } from "@/lib/utils";

type Props = {
  driverId: string;
  driverName: string;
  onClose: () => void;
};

export function RosterAssigner({ driverId, driverName, onClose }: Props) {
  const profiles = useStore(() => getRosterProfiles());
  const activeScenarioId = useStore(() => getActiveScenarioId());
  const assignments = useStore(() => getDriverRosterAssignments(driverId));
  const [profileId, setProfileId] = useState("");
  const [startDate, setStartDate] = useState("");

  const currentYear = new Date().getFullYear();
  // Show period starts for current year and next year
  const periodStarts = [...get4WeekPeriodStarts(currentYear), ...get4WeekPeriodStarts(currentYear + 1)];

  function handleAssign() {
    if (!profileId || !startDate) return;
    assignRosterProfile(driverId, profileId, startDate, activeScenarioId === "default" ? undefined : activeScenarioId);
    setProfileId("");
    setStartDate("");
  }

  function handleDeleteAssignment(assignmentId: string) {
    deleteRosterAssignment(driverId, assignmentId);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[480px] space-y-4 max-h-[80vh] overflow-y-auto">
        <h3 className="font-semibold text-sm">Roosterprofiel — {driverName}</h3>

        {/* History table */}
        {assignments.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Roosterhistorie</div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500">
                  <th className="text-left p-2 border border-gray-200">Profiel</th>
                  <th className="text-left p-2 border border-gray-200">Ingangsdatum</th>
                  <th className="text-left p-2 border border-gray-200">Einddatum</th>
                  <th className="w-8 border border-gray-200"></th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className={!a.endDate ? "bg-blue-50" : ""}>
                    <td className="p-2 border border-gray-200 text-sm">{a.profileName}</td>
                    <td className="p-2 border border-gray-200 text-sm">{a.startDate}</td>
                    <td className="p-2 border border-gray-200 text-sm">
                      {a.endDate || <span className="text-green-600 text-xs font-medium">Actief</span>}
                    </td>
                    <td className="p-1 border border-gray-200 text-center">
                      <button
                        onClick={() => handleDeleteAssignment(a.id)}
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

        {/* Assign new */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="text-xs font-medium text-gray-500">Nieuw roosterprofiel toewijzen</div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Roosterprofiel</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">-- Selecteer profiel --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {profiles.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">Maak eerst een profiel aan via Instellingen.</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Ingangsdatum (start 4-weken periode)</label>
            <select
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">-- Selecteer datum --</option>
              {periodStarts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAssign}
              disabled={!profileId || !startDate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Toewijzen (1 jaar)
            </button>
            <button onClick={onClose} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
