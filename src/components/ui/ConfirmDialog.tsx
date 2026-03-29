"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Verwijderen",
  cancelLabel = "Annuleren",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const focusTrapRef = useFocusTrap();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        ref={focusTrapRef}
        className="bg-surface-primary rounded-lg shadow-modal p-6 w-[400px] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-danger-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-danger-600" />
          </div>
          <div>
            <h3 className="text-section-title">{title}</h3>
            <p className="text-sm text-text-secondary mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-danger-600 text-white hover:bg-danger-700 shadow-xs transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
