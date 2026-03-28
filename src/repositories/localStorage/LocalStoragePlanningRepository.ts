import type { PlanningStatus } from "@/domain/enums";
import type { PlanningEntry, PlanningEntryOptions } from "@/domain/types";
import type { PlanningRepository } from "@/repositories/interfaces/PlanningRepository";
import { STORAGE_KEYS, notify, generateId } from "./storage";

function entriesKey(scenarioId?: string): string {
  const id = scenarioId || getActiveScenarioId();
  return id === "default" ? STORAGE_KEYS.ENTRIES : `capplan_planning_${id}`;
}

function getActiveScenarioId(): string {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_SCENARIO) || "default";
}

function readEntries(scenarioId?: string): PlanningEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(entriesKey(scenarioId));
  return raw ? JSON.parse(raw) : [];
}

function writeEntries(entries: PlanningEntry[], scenarioId?: string) {
  localStorage.setItem(entriesKey(scenarioId), JSON.stringify(entries));
  notify();
}

export class LocalStoragePlanningRepository implements PlanningRepository {
  getEntries(scenarioId?: string): PlanningEntry[] {
    return readEntries(scenarioId);
  }

  upsert(driverId: string, date: string, status: PlanningStatus, options?: PlanningEntryOptions, scenarioId?: string): PlanningEntry {
    const entries = readEntries(scenarioId);
    const idx = entries.findIndex((e) => e.driverId === driverId && e.date === date);

    const entryData: Partial<PlanningEntry> = {
      status,
      leaveTypeId: options?.leaveTypeId,
      sickPercentage: options?.sickPercentage,
      notes: options?.notes,
    };

    if (idx >= 0) {
      entries[idx] = { ...entries[idx], ...entryData };
      writeEntries(entries, scenarioId);
      return entries[idx];
    }

    const entry: PlanningEntry = {
      id: generateId(),
      driverId,
      date,
      ...entryData,
    } as PlanningEntry;
    entries.push(entry);
    writeEntries(entries, scenarioId);
    return entry;
  }

  upsertBulk(driverId: string, dates: string[], status: PlanningStatus, options?: PlanningEntryOptions, scenarioId?: string): void {
    const entries = readEntries(scenarioId);
    for (const date of dates) {
      const entryIdx = entries.findIndex((e) => e.driverId === driverId && e.date === date);
      const entryData: Partial<PlanningEntry> = {
        status,
        leaveTypeId: options?.leaveTypeId,
        sickPercentage: options?.sickPercentage,
        notes: options?.notes,
      };
      if (entryIdx >= 0) {
        entries[entryIdx] = { ...entries[entryIdx], ...entryData };
      } else {
        entries.push({ id: generateId(), driverId, date, ...entryData } as PlanningEntry);
      }
    }
    writeEntries(entries, scenarioId);
  }

  delete(id: string, scenarioId?: string): void {
    const entries = readEntries(scenarioId).filter((e) => e.id !== id);
    writeEntries(entries, scenarioId);
  }

  deleteByDriver(driverId: string, scenarioId?: string): void {
    const entries = readEntries(scenarioId).filter((e) => e.driverId !== driverId);
    writeEntries(entries, scenarioId);
  }
}
