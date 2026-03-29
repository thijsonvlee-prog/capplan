"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

// Global listener pattern (same approach as invalidate() in useApi.ts)
type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();
let nextId = 0;

/**
 * Show a toast notification from anywhere in the app.
 * No context or provider needed — uses a global listener pattern.
 */
export function showToast(message: string, type: ToastType = "success") {
  const toast: ToastMessage = { id: nextId++, message, type };
  listeners.forEach((l) => l(toast));
}

const AUTO_DISMISS_MS = 3500;

/**
 * Mount this component once in the dashboard layout.
 * It listens for showToast() calls and renders them.
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: ToastMessage) => {
    setToasts((prev) => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => { listeners.delete(addToast); };
  }, [addToast]);

  // Auto-dismiss
  useEffect(() => {
    if (toasts.length === 0) return;
    const oldest = toasts[0];
    const timer = setTimeout(() => removeToast(oldest.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-lg shadow-dropdown text-sm font-medium animate-slide-in ${
            toast.type === "success"
              ? "bg-success-50 text-success-800 border border-success-200"
              : "bg-danger-50 text-danger-800 border border-danger-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-success-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-danger-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-0.5 rounded hover:bg-black/5 shrink-0"
            aria-label="Melding sluiten"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
