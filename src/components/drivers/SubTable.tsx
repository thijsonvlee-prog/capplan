"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

type SubTableColumn<T> = {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
};

type SubTableProps<T extends { id: string; sequenceNumber: number; startDate: string; endDate?: string }> = {
  rows: T[];
  columns: SubTableColumn<T>[];
  onAdd: (data: any) => void;
  onDelete: (id: string) => void;
  renderForm: (onSubmit: (data: any) => void, onCancel: () => void) => React.ReactNode;
  emptyMessage?: string;
};

export function SubTable<T extends { id: string; sequenceNumber: number; startDate: string; endDate?: string }>({
  rows,
  columns,
  onAdd,
  onDelete,
  renderForm,
  emptyMessage = "Geen records",
}: SubTableProps<T>) {
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(data: any) {
    onAdd(data);
    setShowForm(false);
  }

  const sorted = [...rows].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-3.5 h-3.5" />
          Toevoegen
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {renderForm(handleSubmit, () => setShowForm(false))}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">{emptyMessage}</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500">
              <th className="text-left p-2 border border-gray-200">#</th>
              <th className="text-left p-2 border border-gray-200">Begindatum</th>
              <th className="text-left p-2 border border-gray-200">Einddatum</th>
              {columns.map((col) => (
                <th key={String(col.key)} className="text-left p-2 border border-gray-200">
                  {col.label}
                </th>
              ))}
              <th className="w-8 border border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className={!row.endDate ? "bg-blue-50" : ""}>
                <td className="p-2 border border-gray-200 text-sm">{row.sequenceNumber}</td>
                <td className="p-2 border border-gray-200 text-sm">{row.startDate}</td>
                <td className="p-2 border border-gray-200 text-sm">
                  {row.endDate || <span className="text-green-600 text-xs font-medium">Actief</span>}
                </td>
                {columns.map((col) => (
                  <td key={String(col.key)} className="p-2 border border-gray-200 text-sm">
                    {col.render ? col.render((row as any)[col.key], row) : String((row as any)[col.key] ?? "-")}
                  </td>
                ))}
                <td className="p-1 border border-gray-200 text-center">
                  <button
                    onClick={() => { if (window.confirm("Weet je zeker dat je dit record wilt verwijderen?")) onDelete(row.id); }}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Verwijderen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
