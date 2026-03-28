import type { UserPreference } from "@/domain/types";
import type { UserPreferenceRepository } from "@/repositories/interfaces/UserPreferenceRepository";
import { STORAGE_KEYS, notify, generateId } from "./storage";

function readPreferences(): UserPreference[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
  return raw ? JSON.parse(raw) : [];
}

function writePreferences(prefs: UserPreference[]) {
  localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs));
  notify();
}

export class LocalStorageUserPreferenceRepository implements UserPreferenceRepository {
  get(userId: string, key: string): string | null {
    const prefs = readPreferences();
    const pref = prefs.find((p) => p.userId === userId && p.key === key);
    return pref?.value ?? null;
  }

  set(userId: string, key: string, value: string): void {
    const prefs = readPreferences();
    const idx = prefs.findIndex((p) => p.userId === userId && p.key === key);
    const now = new Date().toISOString();
    if (idx >= 0) {
      prefs[idx] = { ...prefs[idx], value, updatedAt: now };
    } else {
      prefs.push({ id: generateId(), userId, key, value, updatedAt: now });
    }
    writePreferences(prefs);
  }

  getAll(userId: string): UserPreference[] {
    return readPreferences().filter((p) => p.userId === userId);
  }

  delete(userId: string, key: string): void {
    const prefs = readPreferences().filter((p) => !(p.userId === userId && p.key === key));
    writePreferences(prefs);
  }
}
