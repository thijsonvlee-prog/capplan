"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

type SyncStatus = {
  status: string;
  startedAt?: string;
  completedAt?: string;
  recordCount?: number;
  errorMsg?: string;
};

export default function AdminPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sync/afas/status")
      .then((r) => r.json())
      .then(setSyncStatus);
  }, []);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/sync/afas", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult(`Sync voltooid: ${data.empCount} medewerkers, ${data.rosterCount} roosters, ${data.leaveCount} verlof/ziekte`);
      } else {
        setResult(`Fout: ${data.error}`);
      }
      // Refresh status
      const status = await fetch("/api/sync/afas/status").then((r) => r.json());
      setSyncStatus(status);
    } catch {
      setResult("Sync mislukt");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">AFAS Synchronisatie</h2>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Laatste sync</h3>
          {syncStatus ? (
            <div className="text-sm text-gray-600">
              <p>Status: <span className="font-medium">{syncStatus.status}</span></p>
              {syncStatus.startedAt && (
                <p>Gestart: {new Date(syncStatus.startedAt).toLocaleString("nl-NL")}</p>
              )}
              {syncStatus.recordCount !== undefined && (
                <p>Records: {syncStatus.recordCount}</p>
              )}
              {syncStatus.errorMsg && (
                <p className="text-red-600">Fout: {syncStatus.errorMsg}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nog nooit gesynchroniseerd</p>
          )}
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Synchroniseren..." : "Nu synchroniseren"}
        </button>

        {result && (
          <div className={`p-3 rounded-lg text-sm ${result.startsWith("Fout") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
