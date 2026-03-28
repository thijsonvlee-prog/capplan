"use client";

import { useState } from "react";
import { useStore, getRosterProfiles, assignRosterProfile, getActiveScenarioId } from "@/lib/store";
import { get4WeekPeriodStarts } from "@/lib/utils";

type Props = {
  driverId: string;
  driverName: string;
  year: number;
  onClose: () => void;
};

export function RosterAssigner({ driverId, driverName, year, onClose }: Props) {
  const profiles = useStore(() => getRosterProfiles());
  const activeScenarioId = useStore(() => getActiveScenarioId());
  const [profileId, setProfileId] = useState("");
  const [startDate, setStartDate] = useState("");

  const periodStarts = get4WeekPeriodStarts(year);

  function handleAssign() {
    if (!profileId || !startDate) return;
    assignRosterProfile(driverId, profileId, startDate, activeScenarioId === "default" ? undefined : activeScenarioId);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 space-y-4">
        <h3 className="font-semibold text-sm">Roosterprofiel toewijzen aan {driverName}</h3>

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
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}
