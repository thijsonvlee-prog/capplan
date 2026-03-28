import type { Scenario } from "@/domain/types";

export interface ScenarioRepository {
  getAll(): Scenario[];
  getActiveId(): string;
  setActiveId(id: string): void;
  create(name: string, description?: string): Scenario;
  duplicate(sourceId: string, name: string): Scenario;
  delete(id: string): void;
}
