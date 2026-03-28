import type { StamtabelType } from "@/domain/enums";
import type { StamtabelRecord } from "@/domain/types";
import type { StamtabelRepository } from "@/repositories/interfaces/StamtabelRepository";
import { STORAGE_KEYS, notify, generateId } from "./storage";

const TYPE_KEY_MAP: Record<StamtabelType, string> = {
  employers: STORAGE_KEYS.EMPLOYERS,
  departments: STORAGE_KEYS.DEPARTMENTS,
  locations: STORAGE_KEYS.LOCATIONS,
  leaveTypes: STORAGE_KEYS.LEAVE_TYPES,
};

function readStamtabel(key: string): StamtabelRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function writeStamtabel(key: string, records: StamtabelRecord[]) {
  localStorage.setItem(key, JSON.stringify(records));
  notify();
}

export class LocalStorageStamtabelRepository implements StamtabelRepository {
  getAll(type: StamtabelType): StamtabelRecord[] {
    return readStamtabel(TYPE_KEY_MAP[type]).sort((a, b) => a.description.localeCompare(b.description));
  }

  create(type: StamtabelType, code: string, description: string): StamtabelRecord {
    const key = TYPE_KEY_MAP[type];
    const records = readStamtabel(key);
    const record: StamtabelRecord = { id: generateId(), code, description };
    records.push(record);
    writeStamtabel(key, records);
    return record;
  }

  update(type: StamtabelType, id: string, code: string, description: string): StamtabelRecord {
    const key = TYPE_KEY_MAP[type];
    const records = readStamtabel(key);
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Record not found");
    records[idx] = { ...records[idx], code, description };
    writeStamtabel(key, records);
    return records[idx];
  }

  delete(type: StamtabelType, id: string): void {
    const key = TYPE_KEY_MAP[type];
    const records = readStamtabel(key).filter((r) => r.id !== id);
    writeStamtabel(key, records);
  }
}
