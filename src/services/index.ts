import { LocalStorageDriverRepository } from "@/repositories/localStorage/LocalStorageDriverRepository";
import { LocalStoragePlanningRepository } from "@/repositories/localStorage/LocalStoragePlanningRepository";
import { LocalStorageScenarioRepository } from "@/repositories/localStorage/LocalStorageScenarioRepository";
import { LocalStorageSkillRepository } from "@/repositories/localStorage/LocalStorageSkillRepository";
import { LocalStorageStamtabelRepository } from "@/repositories/localStorage/LocalStorageStamtabelRepository";
import { LocalStorageRosterProfileRepository } from "@/repositories/localStorage/LocalStorageRosterProfileRepository";
import { LocalStorageUserPreferenceRepository } from "@/repositories/localStorage/LocalStorageUserPreferenceRepository";
import { DriverService } from "./DriverService";
import { PlanningService } from "./PlanningService";
import { ScenarioService } from "./ScenarioService";
import { SettingsService } from "./SettingsService";
import { RosterProfileService } from "./RosterProfileService";
import { UserPreferenceService } from "./UserPreferenceService";

function createServices() {
  const driverRepo = new LocalStorageDriverRepository();
  const planningRepo = new LocalStoragePlanningRepository();
  const scenarioRepo = new LocalStorageScenarioRepository();
  const skillRepo = new LocalStorageSkillRepository();
  const stamtabelRepo = new LocalStorageStamtabelRepository();
  const rosterProfileRepo = new LocalStorageRosterProfileRepository();
  const userPrefRepo = new LocalStorageUserPreferenceRepository();

  return {
    driver: new DriverService(driverRepo, planningRepo, stamtabelRepo, rosterProfileRepo),
    planning: new PlanningService(planningRepo, driverRepo, scenarioRepo),
    scenario: new ScenarioService(scenarioRepo),
    settings: new SettingsService(stamtabelRepo, skillRepo, driverRepo),
    rosterProfile: new RosterProfileService(rosterProfileRepo),
    userPreference: new UserPreferenceService(userPrefRepo),
  };
}

export const services = createServices();
