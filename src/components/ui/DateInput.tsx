"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  required?: boolean;
};

export function DateInput({ value, onChange, className, id, required }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("date-input-wrapper", className)}>
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="date-input-native"
      />
      <button
        type="button"
        className="date-input-icon"
        aria-label="Kalender openen"
        tabIndex={-1}
        onClick={() => {
          inputRef.current?.showPicker?.();
          inputRef.current?.focus();
        }}
      >
        <Calendar className="w-4 h-4" />
      </button>
    </div>
  );
}
