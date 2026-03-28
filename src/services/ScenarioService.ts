import type { Scenario } from "@/domain/types";
import type { ScenarioRepository } from "@/repositories/interfaces/ScenarioRepository";

export class ScenarioService {
  constructor(private scenarioRepo: ScenarioRepository) {}

  getScenarios(): Scenario[] {
    return this.scenarioRepo.getAll();
  }

  getActiveId(): string {
    return this.scenarioRepo.getActiveId();
  }

  setActiveId(id: string): void {
    this.scenarioRepo.setActiveId(id);
  }

  create(name: string, description?: string): Scenario {
    return this.scenarioRepo.create(name, description);
  }

  duplicate(sourceId: string, name: string): Scenario {
    return this.scenarioRepo.duplicate(sourceId, name);
  }

  delete(id: string): void {
    this.scenarioRepo.delete(id);
  }
}
