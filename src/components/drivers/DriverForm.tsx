"use client";

import { useState } from "react";
import type { EmploymentType, EmploymentRecord, PositionRecord, RosterRecord, Driver } from "@/lib/store";
import {
  useStore,
  getSkills,
  getEmployers,
  getDepartments,
  getLocations,
  getRosterProfiles,
  addEmploymentRecord,
  deleteEmploymentRecord,
  addPositionRecord,
  deletePositionRecord,
  addRosterRecord,
  deleteRosterRecord,
  getDriverEmploymentRecords,
  getDriverPositionRecords,
  getDriverRosterRecords,
  getDriverComputedFields,
  getActiveScenarioId,
  EMPLOYMENT_TYPE_LABELS,
} from "@/lib/store";
import { get4WeekPeriodStarts } from "@/lib/utils";
import { SubTable } from "./SubTable";

const LICENSE_OPTIONS = ["B", "C", "C1", "CE", "D", "DE"];

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "FULLTIME", label: "Fulltime" },
  { value: "PARTTIME", label: "Parttime" },
  { value: "ONCALL", label: "Oproepkracht" },
  { value: "TEMPORARY", label: "Uitzendkracht" },
  { value: "CHARTER", label: "Charter" },
];

type DriverMainData = {
  firstName: string;
  lastName: string;
  employeeNumber?: string;
  licenseTypes?: string[];
  skillIds?: string[];
};

type Props = {
  onSubmit: (data: DriverMainData) => void;
  onCancel: () => void;
  initialData?: Driver;
  saving?: boolean;
};

type TabKey = "gegevens" | "dienstverband" | "functie" | "rooster";

export function DriverForm({ onSubmit, onCancel, initialData, saving }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("gegevens");
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [employeeNumber, setEmployeeNumber] = useState(initialData?.employeeNumber || "");
  const [licenseTypes, setLicenseTypes] = useState<string[]>(initialData?.licenseTypes || []);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.skillIds || []);

  const skills = useStore(() => getSkills());
  const employers = useStore(() => getEmployers());
  const departments = useStore(() => getDepartments());
  const locations = useStore(() => getLocations());
  const profiles = useStore(() => getRosterProfiles());
  const activeScenarioId = useStore(() => getActiveScenarioId());

  // Sub-table data (only for edit mode)
  const employmentRecords = useStore(() => initialData ? getDriverEmploymentRecords(initialData.id) : []);
  const positionRecords = useStore(() => initialData ? getDriverPositionRecords(initialData.id) : []);
  const rosterRecords = useStore(() => initialData ? getDriverRosterRecords(initialData.id) : []);

  // Computed fields for display
  const computed = initialData ? getDriverComputedFields(initialData) : null;

  function toggleLicense(lt: string) {
    setLicenseTypes((prev) => prev.includes(lt) ? prev.filter((l) => l !== lt) : [...prev, lt]);
  }

  function toggleSkill(id: string) {
    setSelectedSkills((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      firstName,
      lastName,
      ...(employeeNumber && { employeeNumber }),
      ...(licenseTypes.length > 0 && { licenseTypes }),
      ...(selectedSkills.length > 0 && { skillIds: selectedSkills }),
    });
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";
  const isEdit = !!initialData;

  const TABS: { key: TabKey; label: string; editOnly?: boolean }[] = [
    { key: "gegevens", label: "Gegevens" },
    { key: "dienstverband", label: "Dienstverband", editOnly: true },
    { key: "functie", label: "Functie", editOnly: true },
    { key: "rooster", label: "Rooster", editOnly: true },
  ];

  const currentYear = new Date().getFullYear();
  const periodStarts = [...get4WeekPeriodStarts(currentYear), ...get4WeekPeriodStarts(currentYear + 1)];

  const employerMap = new Map(employers.map((e) => [e.id, e.description]));
  const departmentMap = new Map(departments.map((d) => [d.id, d.description]));
  const locationMap = new Map(locations.map((l) => [l.id, l.description]));

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.filter((t) => !t.editOnly || isEdit).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Gegevens */}
      {activeTab === "gegevens" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voornaam</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Achternaam</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personeelsnummer</label>
            <input type="text" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rijbewijstype</label>
            <div className="flex flex-wrap gap-2">
              {LICENSE_OPTIONS.map((lt) => (
                <button
                  key={lt}
                  type="button"
                  onClick={() => toggleLicense(lt)}
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                    licenseTypes.includes(lt) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {lt}
                </button>
              ))}
            </div>
          </div>

          {skills.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vaardigheden</label>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSkill(s.id)}
                    className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                      selectedSkills.includes(s.id) ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Computed fields (read-only, edit mode only) */}
          {computed && (
            <div className="border-t border-gray-200 pt-4">
              <div className="text-xs font-medium text-gray-500 mb-2">Actuele gegevens (afgeleid van subtabellen)</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {[
                  { label: "Werkgever", value: computed.currentEmployer },
                  { label: "Dienstverband", value: computed.currentEmploymentType },
                  { label: "Leidinggevende", value: computed.currentManager },
                  { label: "Standplaats", value: computed.currentLocation },
                  { label: "Afdeling", value: computed.currentDepartment },
                  { label: "Roosterprofiel", value: computed.currentRosterProfile },
                ].map((f) => (
                  <div key={f.label}>
                    <span className="text-gray-500 text-xs">{f.label}</span>
                    <div className="text-gray-700">{f.value || "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            <button type="button" onClick={onCancel} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              Annuleren
            </button>
          </div>
        </form>
      )}

      {/* Tab: Dienstverband */}
      {activeTab === "dienstverband" && initialData && (
        <SubTable<EmploymentRecord>
          rows={employmentRecords}
          columns={[
            { key: "employmentType", label: "Type", render: (v) => v ? EMPLOYMENT_TYPE_LABELS[v as EmploymentType] : "-" },
            { key: "employerId", label: "Werkgever", render: (v) => (v && employerMap.get(v)) || "-" },
          ]}
          onAdd={(data) => addEmploymentRecord(initialData.id, data)}
          onDelete={(id) => deleteEmploymentRecord(initialData.id, id)}
          emptyMessage="Geen dienstverbanden"
          renderForm={(onSubmit, onCancel) => (
            <EmploymentForm employers={employers} periodStarts={periodStarts} onSubmit={onSubmit} onCancel={onCancel} />
          )}
        />
      )}

      {/* Tab: Functie */}
      {activeTab === "functie" && initialData && (
        <SubTable<PositionRecord>
          rows={positionRecords}
          columns={[
            { key: "position", label: "Functie" },
            { key: "locationId", label: "Standplaats", render: (v) => (v && locationMap.get(v)) || "-" },
            { key: "departmentId", label: "Afdeling", render: (v) => (v && departmentMap.get(v)) || "-" },
            { key: "manager", label: "Leidinggevende", render: (v) => v || "-" },
          ]}
          onAdd={(data) => addPositionRecord(initialData.id, data)}
          onDelete={(id) => deletePositionRecord(initialData.id, id)}
          emptyMessage="Geen functierecords"
          renderForm={(onSubmit, onCancel) => (
            <PositionForm departments={departments} locations={locations} periodStarts={periodStarts} onSubmit={onSubmit} onCancel={onCancel} />
          )}
        />
      )}

      {/* Tab: Rooster */}
      {activeTab === "rooster" && initialData && (
        <SubTable<RosterRecord & { profileName: string }>
          rows={rosterRecords}
          columns={[
            { key: "profileName", label: "Roosterprofiel" },
            { key: "weeklyHours", label: "Uren/week", render: (v) => v !== undefined && v !== null ? String(v) : "-" },
          ]}
          onAdd={(data) => addRosterRecord(initialData.id, data, activeScenarioId === "default" ? undefined : activeScenarioId)}
          onDelete={(id) => deleteRosterRecord(initialData.id, id)}
          emptyMessage="Geen roosterrecords"
          renderForm={(onSubmit, onCancel) => (
            <RosterForm profiles={profiles} periodStarts={periodStarts} onSubmit={onSubmit} onCancel={onCancel} />
          )}
        />
      )}
    </div>
  );
}

// === Inline sub-table forms ===

function EmploymentForm({
  employers,
  periodStarts,
  onSubmit,
  onCancel,
}: {
  employers: { id: string; description: string }[];
  periodStarts: string[];
  onSubmit: (data: Omit<EmploymentRecord, "id" | "sequenceNumber">) => void;
  onCancel: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FULLTIME");
  const [employerId, setEmployerId] = useState("");

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Begindatum</label>
          <select value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass}>
            <option value="">-- Selecteer --</option>
            {periodStarts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Type</label>
          <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} className={inputClass}>
            {EMPLOYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Werkgever</label>
          <select value={employerId} onChange={(e) => setEmployerId(e.target.value)} className={inputClass}>
            <option value="">-- Selecteer --</option>
            {employers.map((e) => <option key={e.id} value={e.id}>{e.description}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { if (startDate) onSubmit({ startDate, employmentType, employerId: employerId || undefined }); }}
          disabled={!startDate}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Toevoegen
        </button>
        <button onClick={onCancel} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200">
          Annuleren
        </button>
      </div>
    </div>
  );
}

function PositionForm({
  departments,
  locations,
  periodStarts,
  onSubmit,
  onCancel,
}: {
  departments: { id: string; description: string }[];
  locations: { id: string; description: string }[];
  periodStarts: string[];
  onSubmit: (data: Omit<PositionRecord, "id" | "sequenceNumber">) => void;
  onCancel: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [position, setPosition] = useState("");
  const [locationId, setLocationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [manager, setManager] = useState("");

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Begindatum</label>
          <select value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass}>
            <option value="">-- Selecteer --</option>
            {periodStarts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Functie</label>
          <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Functienaam" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Standplaats</label>
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className={inputClass}>
            <option value="">-- Selecteer --</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.description}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Afdeling</label>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={inputClass}>
            <option value="">-- Selecteer --</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.description}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Leidinggevende</label>
          <input type="text" value={manager} onChange={(e) => setManager(e.target.value)} placeholder="Naam" className={inputClass} />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { if (startDate) onSubmit({ startDate, position, locationId: locationId || undefined, departmentId: departmentId || undefined, manager }); }}
          disabled={!startDate}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Toevoegen
        </button>
        <button onClick={onCancel} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200">
          Annuleren
        </button>
      </div>
    </div>
  );
}

function RosterForm({
  profiles,
  periodStarts,
  onSubmit,
  onCancel,
}: {
  profiles: { id: string; name: string }[];
  periodStarts: string[];
  onSubmit: (data: Omit<RosterRecord, "id" | "sequenceNumber">) => void;
  onCancel: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [rosterProfileId, setRosterProfileId] = useState("");
  const [weeklyHours, setWeeklyHours] = useState<number | "">("");

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Begindatum</label>
          <select value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass}>
            <option value="">-- Selecteer --</option>
            {periodStarts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Roosterprofiel</label>
          <select value={rosterProfileId} onChange={(e) => setRosterProfileId(e.target.value)} className={inputClass}>
            <option value="">-- Selecteer --</option>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {profiles.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">Maak eerst een profiel aan via Instellingen.</p>
          )}
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
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (startDate && rosterProfileId) {
              onSubmit({ startDate, rosterProfileId, weeklyHours: weeklyHours !== "" ? weeklyHours : undefined });
            }
          }}
          disabled={!startDate || !rosterProfileId}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Toewijzen (1 jaar)
        </button>
        <button onClick={onCancel} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200">
          Annuleren
        </button>
      </div>
    </div>
  );
}
