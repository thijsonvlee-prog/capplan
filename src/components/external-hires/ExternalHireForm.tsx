"use client";

import { useState } from "react";
import type { DriverType } from "@prisma/client";

type Props = {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    type: DriverType;
    companyName?: string;
  }) => void;
  onCancel: () => void;
};

export function ExternalHireForm({ onSubmit, onCancel }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [type, setType] = useState<"CHARTER" | "TEMPORARY">("CHARTER");
  const [companyName, setCompanyName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      firstName,
      lastName,
      type,
      ...(companyName && { companyName }),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voornaam
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Achternaam
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "CHARTER" | "TEMPORARY")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="CHARTER">Charter</option>
          <option value="TEMPORARY">Uitzendkracht</option>
        </select>
      </div>

      {type === "CHARTER" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bedrijfsnaam
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Toevoegen
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
