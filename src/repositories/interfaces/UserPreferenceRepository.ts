import type { UserPreference } from "@/domain/types";

export interface UserPreferenceRepository {
  get(userId: string, key: string): string | null;
  set(userId: string, key: string, value: string): void;
  getAll(userId: string): UserPreference[];
  delete(userId: string, key: string): void;
}
