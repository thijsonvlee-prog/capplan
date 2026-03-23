"use client";

import { useState, useEffect } from "react";
import type { Driver } from "@prisma/client";
import { Plus } from "lucide-react";
import { DriverForm } from "./DriverForm";

export function DriverList() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  async function fetchDrivers() {
    setLoading(true);
    const res = await fetch(`/api/drivers?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setDrivers(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleCreate(data: {
    firstName: string;
    lastName: string;
    type: "INTERNAL" | "CHARTER" | "TEMPORARY";
    employeeNumber?: string;
    companyName?: string;
  }) {
    await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    fetchDrivers();
  }

  const typeLabels = {
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

      {loading ? (
        <div className="text-center py-8 text-gray-500">Laden...</div>
      ) : (
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
                      {typeLabels[d.type]}
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
