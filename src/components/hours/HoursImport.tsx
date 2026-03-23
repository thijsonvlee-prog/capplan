"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export function HoursImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  async function handleImport() {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const text = await file.text();
      let rows;

      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : parsed.rows;
      } else {
        // CSV parsing
        const lines = text.trim().split("\n");
        const headers = lines[0].split(";").map((h) => h.trim());
        rows = lines.slice(1).map((line) => {
          const values = line.split(";").map((v) => v.trim());
          const row: Record<string, string | number | null> = {};
          headers.forEach((h, i) => {
            const val = values[i];
            if (["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(h)) {
              row[h] = val ? parseFloat(val.replace(",", ".")) : null;
            } else if (["weekNumber", "year"].includes(h)) {
              row[h] = parseInt(val);
            } else {
              row[h] = val || null;
            }
          });
          return row;
        });
      }

      const res = await fetch("/api/hours/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import mislukt");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij importeren");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Uren importeren</h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload een CSV of JSON bestand met gerealiseerde uren per week.
          CSV kolommen: employeeNumber;weekNumber;year;monday;tuesday;wednesday;thursday;friday;saturday;sunday
        </p>

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".csv,.json"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            <Upload className="w-4 h-4" />
            {loading ? "Bezig..." : "Importeren"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-green-50 p-4 rounded-lg text-sm">
          <p className="text-green-700 font-medium">
            Import voltooid: {result.imported} rij(en) geïmporteerd, {result.skipped} overgeslagen
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-red-600 list-disc list-inside">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
