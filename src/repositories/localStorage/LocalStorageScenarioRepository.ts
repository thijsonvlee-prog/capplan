import type { Scenario, PlanningEntry } from "@/domain/types";
import type { ScenarioRepository } from "@/repositories/interfaces/ScenarioRepository";
import { STORAGE_KEYS, notify, generateId } from "./storage";

function readScenarios(): Scenario[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
  return raw ? JSON.parse(raw) : [];
}

function readEntries(scenarioId?: string): PlanningEntry[] {
  if (typeof window === "undefined") return [];
  const key = !scenarioId || scenarioId === "default"
    ? STORAGE_KEYS.ENTRIES
    : `capplan_planning_${scenarioId}`;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

export class LocalStorageScenarioRepository implements ScenarioRepository {
  getAll(): Scenario[] {
    return readScenarios();
  }

  getActiveId(): string {
    if (typeof window === "undefined") return "default";
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SCENARIO) || "default";
  }

  setActiveId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SCENARIO, id);
    notify();
  }

  create(name: string, description?: string): Scenario {
    const scenarios = readScenarios();
    const now = new Date().toISOString();
    const scenario: Scenario = { id: generateId(), name, description, createdAt: now, updatedAt: now };
    scenarios.push(scenario);
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    localStorage.setItem(`capplan_planning_${scenario.id}`, JSON.stringify([]));
    notify();
    return scenario;
  }

  duplicate(sourceId: string, name: string): Scenario {
    const sourceEntries = readEntries(sourceId);
    const scenario = this.create(name);
    const newEntries = sourceEntries.map((e) => ({ ...e, id: generateId() }));
    localStorage.setItem(`capplan_planning_${scenario.id}`, JSON.stringify(newEntries));
    notify();
    return scenario;
  }

  delete(id: string): void {
    const scenarios = readScenarios().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    localStorage.removeItem(`capplan_planning_${id}`);
    if (this.getActiveId() === id) {
      this.setActiveId("default");
    }
    notify();
  }
}
