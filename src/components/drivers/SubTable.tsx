"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
  const [pendingDeleteRow, setPendingDeleteRow] = useState<T | null>(null);

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
        <div className="bg-surface-secondary rounded-lg p-4 border border-border-subtle">
          {renderForm(handleSubmit, () => setShowForm(false))}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-4">{emptyMessage}</p>
      ) : (
        <div className="bg-surface-primary rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-tertiary border-b border-border-subtle">
                <th className="text-left p-2 text-label">#</th>
                <th className="text-left p-2 text-label">Begindatum</th>
                <th className="text-left p-2 text-label">Einddatum</th>
                {columns.map((col) => (
                  <th key={String(col.key)} className="text-left p-2 text-label">
                    {col.label}
                  </th>
                ))}
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-border-subtle hover:bg-surface-secondary transition-colors ${
                    !row.endDate
                      ? "bg-success-50"
                      : idx % 2 === 1
                        ? "bg-surface-secondary/50"
                        : ""
                  }`}
                >
                  <td className="p-2 text-sm text-text-secondary">{row.sequenceNumber}</td>
                  <td className="p-2 text-sm text-text-secondary">{row.startDate}</td>
                  <td className="p-2 text-sm">
                    {row.endDate || <span className="text-success-600 text-xs font-medium">Actief</span>}
                  </td>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="p-2 text-sm text-text-secondary">
                      {col.render ? col.render((row as any)[col.key], row) : String((row as any)[col.key] ?? "-")}
                    </td>
                  ))}
                  <td className="p-1 text-center">
                    <button
                      onClick={() => setPendingDeleteRow(row)}
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
        </div>
      )}

      {pendingDeleteRow && (
        <ConfirmDialog
          title="Verwijderen bevestigen"
          message={`Weet je zeker dat je ${entityName} vanaf ${pendingDeleteRow.startDate} wilt verwijderen?`}
          onConfirm={() => { onDelete(pendingDeleteRow.id); setPendingDeleteRow(null); }}
          onCancel={() => setPendingDeleteRow(null)}
        />
      )}
    </div>
  );
}
