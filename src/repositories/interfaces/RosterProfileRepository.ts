import type { RosterProfile, RosterProfileEntry } from "@/domain/types";

export interface RosterProfileRepository {
  getAll(): RosterProfile[];
  getById(id: string): RosterProfile | undefined;
  create(name: string, entries: RosterProfileEntry[]): RosterProfile;
  update(id: string, name: string, entries: RosterProfileEntry[]): RosterProfile;
  delete(id: string): void;
}
