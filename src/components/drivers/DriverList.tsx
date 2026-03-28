"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DriverForm } from "./DriverForm";
import {
  useStore,
  getDrivers,
  createDriver,
  type DriverType,
} from "@/lib/store";

export function DriverList() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const drivers = useStore(() => getDrivers({ search: search || undefined }));

  function handleCreate(data: {
    firstName: string;
    lastName: string;
    type: DriverType;
    employeeNumber?: string;
    companyName?: string;
  }) {
    createDriver(data);
    setShowForm(false);
  }

  const typeLabels: Record<string, string> = {
    INTERNAL: "Intern",
    CHARTER: "Charter",
    TEMPORARY: "Uitzend",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Zoek chauffeur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-64"
        />
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          Chauffeur toevoegen
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <DriverForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Naam</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Type</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Nr.</th>
              <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-sm">
                  {d.firstName} {d.lastName}
                  {d.companyName && (
                    <span className="text-gray-400 ml-1">({d.companyName})</span>
                  )}
                </td>
                <td className="p-3 text-sm">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {typeLabels[d.type] || d.type}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-500">
                  {d.employeeNumber || "-"}
                </td>
                <td className="p-3 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      d.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {d.isActive ? "Actief" : "Inactief"}
                  </span>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                  Geen chauffeurs gevonden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
