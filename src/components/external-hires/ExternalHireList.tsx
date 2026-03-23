"use client";

import { useState, useEffect } from "react";
import type { Driver } from "@prisma/client";
import { Plus } from "lucide-react";
import { ExternalHireForm } from "./ExternalHireForm";

export function ExternalHireList() {
  const [hires, setHires] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function fetchHires() {
    setLoading(true);
    const res = await fetch("/api/external-hires");
    const data = await res.json();
    setHires(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchHires();
  }, []);

  async function handleCreate(data: {
    firstName: string;
    lastName: string;
    type: string;
    companyName?: string;
  }) {
    await fetch("/api/external-hires", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    fetchHires();
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          Inhuur toevoegen
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <ExternalHireForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
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
                <th className="text-left p-3 text-sm font-medium text-gray-600">Bedrijf</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {hires.map((h) => (
                <tr key={h.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-sm">
                    {h.firstName} {h.lastName}
                  </td>
                  <td className="p-3 text-sm">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                      {h.type === "CHARTER" ? "Charter" : "Uitzend"}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">{h.companyName || "-"}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs ${h.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {h.isActive ? "Actief" : "Inactief"}
                    </span>
                  </td>
                </tr>
              ))}
              {hires.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                    Geen inhuur chauffeurs gevonden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
