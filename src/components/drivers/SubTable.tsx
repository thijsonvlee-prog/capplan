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
  entityName?: string;
};

export function SubTable<T extends { id: string; sequenceNumber: number; startDate: string; endDate?: string }>({
  rows,
  columns,
  onAdd,
  onDelete,
  renderForm,
  emptyMessage = "Geen records",
  entityName = "het record",
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
          className="btn-primary"
        >
          <Plus className="w-3.5 h-3.5" />
          Toevoegen
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-secondary rounded-lg p-4 border border-border-default">
          {renderForm(handleSubmit, () => setShowForm(false))}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-4">{emptyMessage}</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface-tertiary text-xs text-text-secondary">
              <th className="text-left p-2 border border-border-default">#</th>
              <th className="text-left p-2 border border-border-default">Begindatum</th>
              <th className="text-left p-2 border border-border-default">Einddatum</th>
              {columns.map((col) => (
                <th key={String(col.key)} className="text-left p-2 border border-border-default">
                  {col.label}
                </th>
              ))}
              <th className="w-8 border border-border-default"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className={!row.endDate ? "bg-brand-50" : ""}>
                <td className="p-2 border border-border-default text-sm">{row.sequenceNumber}</td>
                <td className="p-2 border border-border-default text-sm">{row.startDate}</td>
                <td className="p-2 border border-border-default text-sm">
                  {row.endDate || <span className="text-success-600 text-xs font-medium">Actief</span>}
                </td>
                {columns.map((col) => (
                  <td key={String(col.key)} className="p-2 border border-border-default text-sm">
                    {col.render ? col.render((row as any)[col.key], row) : String((row as any)[col.key] ?? "-")}
                  </td>
                ))}
                <td className="p-1 border border-border-default text-center">
                  <button
                    onClick={() => { if (window.confirm(`Weet je zeker dat je ${entityName} vanaf ${row.startDate} wilt verwijderen?`)) onDelete(row.id); }}
                    className="btn-icon-danger"
                    title="Verwijderen"
                    aria-label="Verwijderen"
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
