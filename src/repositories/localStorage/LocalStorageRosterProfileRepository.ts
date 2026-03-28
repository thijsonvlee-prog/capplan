import type { RosterProfile, RosterProfileEntry } from "@/domain/types";
import type { RosterProfileRepository } from "@/repositories/interfaces/RosterProfileRepository";
import { STORAGE_KEYS, notify, generateId } from "./storage";

function readRosterProfiles(): RosterProfile[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.ROSTER_PROFILES);
  return raw ? JSON.parse(raw) : [];
}

function writeRosterProfiles(profiles: RosterProfile[]) {
  localStorage.setItem(STORAGE_KEYS.ROSTER_PROFILES, JSON.stringify(profiles));
  notify();
}

export class LocalStorageRosterProfileRepository implements RosterProfileRepository {
  getAll(): RosterProfile[] {
    return readRosterProfiles().sort((a, b) => a.name.localeCompare(b.name));
  }

  getById(id: string): RosterProfile | undefined {
    return readRosterProfiles().find((p) => p.id === id);
  }

  create(name: string, entries: RosterProfileEntry[]): RosterProfile {
    const profiles = readRosterProfiles();
    const now = new Date().toISOString();
    const profile: RosterProfile = { id: generateId(), name, entries, createdAt: now, updatedAt: now };
    profiles.push(profile);
    writeRosterProfiles(profiles);
    return profile;
  }

  update(id: string, name: string, entries: RosterProfileEntry[]): RosterProfile {
    const profiles = readRosterProfiles();
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Profile not found");
    profiles[idx] = { ...profiles[idx], name, entries, updatedAt: new Date().toISOString() };
    writeRosterProfiles(profiles);
    return profiles[idx];
  }

  delete(id: string): void {
    const profiles = readRosterProfiles().filter((p) => p.id !== id);
    writeRosterProfiles(profiles);
  }
}
