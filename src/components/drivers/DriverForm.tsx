"use client";

import { useState } from "react";
import type { DriverType, EmploymentType } from "@/lib/store";
import { useStore, getSkills } from "@/lib/store";

const LICENSE_OPTIONS = ["B", "C", "C1", "CE", "D", "DE"];

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "FULLTIME", label: "Fulltime" },
  { value: "PARTTIME", label: "Parttime" },
  { value: "ONCALL", label: "Oproepkracht" },
  { value: "TEMPORARY", label: "Uitzendkracht" },
];

type Props = {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    type: DriverType;
    employeeNumber?: string;
    companyName?: string;
    employer?: string;
    department?: string;
    location?: string;
    licenseTypes?: string[];
    employmentType?: EmploymentType;
    skillIds?: string[];
  }) => void;
  onCancel: () => void;
  initialType?: DriverType;
  saving?: boolean;
};

export function DriverForm({ onSubmit, onCancel, initialType = "INTERNAL", saving }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [type, setType] = useState<DriverType>(initialType);
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [employer, setEmployer] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [licenseTypes, setLicenseTypes] = useState<string[]>([]);
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FULLTIME");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const skills = useStore(() => getSkills());

  function toggleLicense(lt: string) {
    setLicenseTypes((prev) =>
      prev.includes(lt) ? prev.filter((l) => l !== lt) : [...prev, lt]
    );
  }

  function toggleSkill(id: string) {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      firstName,
      lastName,
      type,
      ...(employeeNumber && { employeeNumber }),
      ...(companyName && { companyName }),
      ...(employer && { employer }),
      ...(department && { department }),
      ...(location && { location }),
      ...(licenseTypes.length > 0 && { licenseTypes }),
      employmentType,
      ...(selectedSkills.length > 0 && { skillIds: selectedSkills }),
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as DriverType)} className={inputClass}>
            <option value="INTERNAL">Intern</option>
            <option value="CHARTER">Charter</option>
            <option value="TEMPORARY">Uitzendkracht</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dienstverband</label>
          <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} className={inputClass}>
            {EMPLOYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {type === "INTERNAL" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personeelsnummer</label>
            <input type="text" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} className={inputClass} />
          </div>
        )}
        {type === "CHARTER" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijfsnaam</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Werkgever</label>
          <input type="text" value={employer} onChange={(e) => setEmployer(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Afdeling</label>
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Standplaats</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
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
                licenseTypes.includes(lt)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
                  selectedSkills.includes(s.id)
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}
