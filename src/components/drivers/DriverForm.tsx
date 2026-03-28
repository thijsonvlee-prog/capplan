"use client";

import { useState } from "react";
import type { EmploymentType, Driver } from "@/lib/store";
import { useStore, getSkills, getEmployers, getDepartments, getLocations } from "@/lib/store";

const LICENSE_OPTIONS = ["B", "C", "C1", "CE", "D", "DE"];

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "FULLTIME", label: "Fulltime" },
  { value: "PARTTIME", label: "Parttime" },
  { value: "ONCALL", label: "Oproepkracht" },
  { value: "TEMPORARY", label: "Uitzendkracht" },
  { value: "CHARTER", label: "Charter" },
];

type DriverData = Omit<Driver, "id" | "isActive" | "createdAt" | "updatedAt">;

type Props = {
  onSubmit: (data: DriverData) => void;
  onCancel: () => void;
  initialData?: Driver;
  saving?: boolean;
};

export function DriverForm({ onSubmit, onCancel, initialData, saving }: Props) {
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [employeeNumber, setEmployeeNumber] = useState(initialData?.employeeNumber || "");
  const [employer, setEmployer] = useState(initialData?.employer || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [licenseTypes, setLicenseTypes] = useState<string[]>(initialData?.licenseTypes || []);
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initialData?.employmentType || "FULLTIME");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.skillIds || []);
  const [manager, setManager] = useState(initialData?.manager || "");

  const skills = useStore(() => getSkills());
  const employers = useStore(() => getEmployers());
  const departments = useStore(() => getDepartments());
  const locations = useStore(() => getLocations());

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
      ...(employer && { employer }),
      ...(department && { department }),
      ...(location && { location }),
      ...(licenseTypes.length > 0 && { licenseTypes }),
      employmentType,
      ...(selectedSkills.length > 0 && { skillIds: selectedSkills }),
      ...(manager && { manager }),
    });
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Personeelsnummer</label>
          <input type="text" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dienstverband</label>
          <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} className={inputClass}>
            {EMPLOYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leidinggevende</label>
          <input type="text" value={manager} onChange={(e) => setManager(e.target.value)} placeholder="Naam leidinggevende" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Werkgever</label>
          <select value={employer} onChange={(e) => setEmployer(e.target.value)} className={inputClass}>
            <option value="">-- Selecteer --</option>
            {employers.map((e) => (
              <option key={e.id} value={e.id}>{e.description}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Afdeling</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass}>
            <option value="">-- Selecteer --</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.description}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Standplaats</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass}>
            <option value="">-- Selecteer --</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.description}</option>
            ))}
          </select>
        </div>
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

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
          Annuleren
        </button>
      </div>
    </form>
  );
}
