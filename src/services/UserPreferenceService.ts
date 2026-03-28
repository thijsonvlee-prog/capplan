import type { UserPreference } from "@/domain/types";
import type { UserPreferenceRepository } from "@/repositories/interfaces/UserPreferenceRepository";

// Default mock user for current single-user mode
const DEFAULT_USER_ID = "default";

export class UserPreferenceService {
  constructor(private userPrefRepo: UserPreferenceRepository) {}

  getPreference(key: string, userId: string = DEFAULT_USER_ID): string | null {
    return this.userPrefRepo.get(userId, key);
  }

  setPreference(key: string, value: string, userId: string = DEFAULT_USER_ID): void {
    this.userPrefRepo.set(userId, key, value);
  }

  getAllPreferences(userId: string = DEFAULT_USER_ID): UserPreference[] {
    return this.userPrefRepo.getAll(userId);
  }

  deletePreference(key: string, userId: string = DEFAULT_USER_ID): void {
    this.userPrefRepo.delete(userId, key);
  }
}
