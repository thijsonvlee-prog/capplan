import type { RosterProfile, RosterProfileEntry } from "@/domain/types";
import type { RosterProfileRepository } from "@/repositories/interfaces/RosterProfileRepository";

export class RosterProfileService {
  constructor(private rosterProfileRepo: RosterProfileRepository) {}

  getAll(): RosterProfile[] {
    return this.rosterProfileRepo.getAll();
  }

  getById(id: string): RosterProfile | undefined {
    return this.rosterProfileRepo.getById(id);
  }

  create(name: string, entries: RosterProfileEntry[]): RosterProfile {
    return this.rosterProfileRepo.create(name, entries);
  }

  update(id: string, name: string, entries: RosterProfileEntry[]): RosterProfile {
    return this.rosterProfileRepo.update(id, name, entries);
  }

  delete(id: string): void {
    this.rosterProfileRepo.delete(id);
  }
}
