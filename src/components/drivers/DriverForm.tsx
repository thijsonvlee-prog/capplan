"use client";

import { useState } from "react";
import type { EmploymentType } from "@/domain/enums";
import type { DriverEmploymentRecord, DriverFunctionRecord, DriverRosterAssignment, Driver } from "@/domain/types";
import { EMPLOYMENT_TYPE_LABELS } from "@/domain/constants";
import { useApiData, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { getComputedFields } from "@/lib/api-helpers";
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

  const skills = useApiData(() => api.settings.getSkills(), [], []);
  const employers = useApiData(() => api.settings.getEmployers(), [], []);
  const departments = useApiData(() => api.settings.getDepartments(), [], []);
  const locations = useApiData(() => api.settings.getLocations(), [], []);
  const profiles = useApiData(() => api.rosterProfiles.list(), [], []);
  const activeScenarioId = useApiData(() => api.scenarios.getActiveId(), [], "default");

  // Sub-table data (only for edit mode)
  const employmentRecords = useApiData(
    () => initialData ? api.drivers.getEmploymentRecords(initialData.id) : Promise.resolve([]),
    [initialData?.id], []
  );
  const functionRecords = useApiData(
    () => initialData ? api.drivers.getFunctionRecords(initialData.id) : Promise.resolve([]),
    [initialData?.id], []
  );
  const rosterAssignments = useApiData(
    () => initialData ? api.drivers.getRosterAssignments(initialData.id) : Promise.resolve([]),
    [initialData?.id], []
  );

  // Computed fields for display
  const computed = initialData ? getComputedFields(initialData, { employers, departments, locations, rosterProfiles: profiles }) : null;

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

  const isEdit = !!initialData;

  const TABS: { key: TabKey; label: string; editOnly?: boolean }[] = [
    { key: "gegevens", label: "Gegevens" },
    { key: "dienstverband", label: "Dienstverband", editOnly: true },
    { key: "functie", label: "Functie", editOnly: true },
    { key: "rooster", label: "Rooster", editOnly: true },
  ];

  const employerMap = new Map(employers.map((e) => [e.id, e.description]));
  const departmentMap = new Map(departments.map((d) => [d.id, d.description]));
  const locationMap = new Map(locations.map((l) => [l.id, l.description]));

  return (
    <div className="bg-surface-primary p-6 rounded-lg shadow-card border border-border-subtle space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-border-default">
        {TABS.filter((t) => !t.editOnly || isEdit).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong"
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
              <label className="form-label">Voornaam</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field w-full" required />
            </div>
            <div>
              <label className="form-label">Achternaam</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field w-full" required />
            </div>
          </div>

          <div>
            <label className="form-label">Personeelsnummer</label>
            <input type="text" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} className="input-field w-full" />
          </div>

          <div>
            <label className="form-label mb-2">Rijbewijstype</label>
            <div className="flex flex-wrap gap-2">
              {LICENSE_OPTIONS.map((lt) => (
                <button
                  key={lt}
                  type="button"
                  onClick={() => toggleLicense(lt)}
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                    licenseTypes.includes(lt) ? "bg-brand-600 text-white border-brand-600" : "bg-surface-primary text-text-primary border-border-default hover:bg-surface-secondary"
                  }`}
                >
                  {lt}
                </button>
              ))}
            </div>
          </div>

          {skills.length > 0 && (
            <div>
              <label className="form-label mb-2">Vaardigheden</label>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSkill(s.id)}
                    className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                      selectedSkills.includes(s.id) ? "bg-green-600 text-white border-green-600" : "bg-surface-primary text-text-primary border-border-default hover:bg-surface-secondary"
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
            <div className="border-t border-border-default pt-4">
              <div className="text-caption font-medium mb-2">Actuele gegevens (op basis van dienstverband, functie en rooster)</div>
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
                    <span className="text-text-tertiary text-xs">{f.label}</span>
                    <div className="text-text-secondary">{f.value || "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary">
              Annuleren
            </button>
          </div>
        </form>
      )}

      {/* Tab: Dienstverband */}
      {activeTab === "dienstverband" && initialData && (
        <SubTable<DriverEmploymentRecord>
          rows={employmentRecords}
          columns={[
            { key: "employmentType", label: "Type", render: (v) => v ? EMPLOYMENT_TYPE_LABELS[v as EmploymentType] : "-" },
            { key: "employerId", label: "Werkgever", render: (v) => (v && employerMap.get(v)) || "-" },
          ]}
          onAdd={(data) => mutate(() => api.drivers.addEmploymentRecord(initialData.id, data))}
          onDelete={(id) => mutate(() => api.drivers.deleteEmploymentRecord(initialData.id, id))}
          emptyMessage="Geen dienstverbanden"
          renderForm={(onSubmit, onCancel) => (
            <EmploymentForm employers={employers} onSubmit={onSubmit} onCancel={onCancel} />
          )}
        />
      )}

      {/* Tab: Functie */}
      {activeTab === "functie" && initialData && (
        <SubTable<DriverFunctionRecord>
          rows={functionRecords}
          columns={[
            { key: "position", label: "Functie" },
            { key: "locationId", label: "Standplaats", render: (v) => (v && locationMap.get(v)) || "-" },
            { key: "departmentId", label: "Afdeling", render: (v) => (v && departmentMap.get(v)) || "-" },
            { key: "manager", label: "Leidinggevende", render: (v) => v || "-" },
          ]}
          onAdd={(data) => mutate(() => api.drivers.addFunctionRecord(initialData.id, data))}
          onDelete={(id) => mutate(() => api.drivers.deleteFunctionRecord(initialData.id, id))}
          emptyMessage="Geen functiegegevens"
          renderForm={(onSubmit, onCancel) => (
            <PositionForm departments={departments} locations={locations} onSubmit={onSubmit} onCancel={onCancel} />
          )}
        />
      )}

      {/* Tab: Rooster */}
      {activeTab === "rooster" && initialData && (
        <SubTable<DriverRosterAssignment & { profileName: string }>
          rows={rosterAssignments}
          columns={[
            { key: "profileName", label: "Roosterprofiel" },
            { key: "weeklyHours", label: "Uren/week", render: (v) => v !== undefined && v !== null ? String(v) : "-" },
          ]}
          onAdd={(data) => mutate(() => api.drivers.addRosterAssignment(initialData.id, { ...data, scenarioId: activeScenarioId === "default" ? undefined : activeScenarioId }))}
          onDelete={(id) => mutate(() => api.drivers.deleteRosterAssignment(initialData.id, id))}
          emptyMessage="Geen roostergegevens"
          renderForm={(onSubmit, onCancel) => (
            <RosterForm profiles={profiles} onSubmit={onSubmit} onCancel={onCancel} />
          )}
        />
      )}
    </div>
  );
}

// === Inline sub-table forms ===

function EmploymentForm({
  employers,
  onSubmit,
  onCancel,
}: {
  employers: { id: string; description: string }[];
  onSubmit: (data: Omit<DriverEmploymentRecord, "id" | "sequenceNumber">) => void;
  onCancel: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FULLTIME");
  const [employerId, setEmployerId] = useState("");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="form-label">Begindatum</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field w-full" />
        </div>
        <div>
          <label className="form-label">Type</label>
          <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} className="input-field w-full">
            {EMPLOYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Werkgever</label>
          <select value={employerId} onChange={(e) => setEmployerId(e.target.value)} className="input-field w-full">
            <option value="">-- Selecteer --</option>
            {employers.map((e) => <option key={e.id} value={e.id}>{e.description}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { if (startDate) onSubmit({ startDate, employmentType, employerId: employerId || undefined }); }}
          disabled={!startDate}
          className="btn-primary"
        >
          Toevoegen
        </button>
        <button onClick={onCancel} className="btn-secondary">
          Annuleren
        </button>
      </div>
    </div>
  );
}

function PositionForm({
  departments,
  locations,
  onSubmit,
  onCancel,
}: {
  departments: { id: string; description: string }[];
  locations: { id: string; description: string }[];
  onSubmit: (data: Omit<DriverFunctionRecord, "id" | "sequenceNumber">) => void;
  onCancel: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [position, setPosition] = useState("");
  const [locationId, setLocationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [manager, setManager] = useState("");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Begindatum</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field w-full" />
        </div>
        <div>
          <label className="form-label">Functie</label>
          <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Functienaam" className="input-field w-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="form-label">Standplaats</label>
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="input-field w-full">
            <option value="">-- Selecteer --</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.description}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Afdeling</label>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="input-field w-full">
            <option value="">-- Selecteer --</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.description}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Leidinggevende</label>
          <input type="text" value={manager} onChange={(e) => setManager(e.target.value)} placeholder="Naam" className="input-field w-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { if (startDate) onSubmit({ startDate, position, locationId: locationId || undefined, departmentId: departmentId || undefined, manager }); }}
          disabled={!startDate}
          className="btn-primary"
        >
          Toevoegen
        </button>
        <button onClick={onCancel} className="btn-secondary">
          Annuleren
        </button>
      </div>
    </div>
  );
}

function RosterForm({
  profiles,
  onSubmit,
  onCancel,
}: {
  profiles: { id: string; name: string }[];
  onSubmit: (data: Omit<DriverRosterAssignment, "id" | "sequenceNumber">) => void;
  onCancel: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [rosterProfileId, setRosterProfileId] = useState("");
  const [weeklyHours, setWeeklyHours] = useState<number | "">("");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="form-label">Begindatum</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field w-full" />
        </div>
        <div>
          <label className="form-label">Roosterprofiel</label>
          <select value={rosterProfileId} onChange={(e) => setRosterProfileId(e.target.value)} className="input-field w-full">
            <option value="">-- Selecteer --</option>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {profiles.length === 0 && (
            <p className="text-caption mt-1">Maak eerst een profiel aan via Instellingen.</p>
          )}
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
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (startDate && rosterProfileId) {
              onSubmit({ startDate, rosterProfileId, weeklyHours: weeklyHours !== "" ? weeklyHours : undefined });
            }
          }}
          disabled={!startDate || !rosterProfileId}
          className="btn-primary"
        >
          Toewijzen
        </button>
        <button onClick={onCancel} className="btn-secondary">
          Annuleren
        </button>
      </div>
      <p className="text-caption">Het roosterprofiel wordt voor 1 jaar (364 dagen) cyclisch toegepast. Bestaande verlof- en ziekmeldingen blijven behouden.</p>
    </div>
  );
}
