import type { Skill, StamtabelRecord, Driver } from "@/domain/types";
import type { StamtabelRepository } from "@/repositories/interfaces/StamtabelRepository";
import type { SkillRepository } from "@/repositories/interfaces/SkillRepository";
import type { DriverRepository } from "@/repositories/interfaces/DriverRepository";

export class SettingsService {
  constructor(
    private stamtabelRepo: StamtabelRepository,
    private skillRepo: SkillRepository,
    private driverRepo: DriverRepository,
  ) {}

  // Skills
  getSkills(): Skill[] {
    return this.skillRepo.getAll();
  }

  createSkill(name: string): Skill {
    return this.skillRepo.create(name);
  }

  updateSkill(id: string, name: string): Skill {
    return this.skillRepo.update(id, name);
  }

  deleteSkill(id: string): void {
    this.skillRepo.delete(id);
    // Remove skill from all drivers
    const drivers = this.driverRepo.getAll();
    for (const driver of drivers) {
      if (driver.skillIds?.includes(id)) {
        this.driverRepo.update(driver.id, {
          skillIds: driver.skillIds.filter((sid) => sid !== id),
        });
      }
    }
  }

  // Stamtabels
  getEmployers(): StamtabelRecord[] {
    return this.stamtabelRepo.getAll("employers");
  }

  createEmployer(code: string, description: string): StamtabelRecord {
    return this.stamtabelRepo.create("employers", code, description);
  }

  updateEmployer(id: string, code: string, description: string): StamtabelRecord {
    return this.stamtabelRepo.update("employers", id, code, description);
  }

  deleteEmployer(id: string): void {
    this.stamtabelRepo.delete("employers", id);
  }

  getDepartments(): StamtabelRecord[] {
    return this.stamtabelRepo.getAll("departments");
  }

  createDepartment(code: string, description: string): StamtabelRecord {
    return this.stamtabelRepo.create("departments", code, description);
  }

  updateDepartment(id: string, code: string, description: string): StamtabelRecord {
    return this.stamtabelRepo.update("departments", id, code, description);
  }

  deleteDepartment(id: string): void {
    this.stamtabelRepo.delete("departments", id);
  }

  getLocations(): StamtabelRecord[] {
    return this.stamtabelRepo.getAll("locations");
  }

  createLocation(code: string, description: string): StamtabelRecord {
    return this.stamtabelRepo.create("locations", code, description);
  }

  updateLocation(id: string, code: string, description: string): StamtabelRecord {
    return this.stamtabelRepo.update("locations", id, code, description);
  }

  deleteLocation(id: string): void {
    this.stamtabelRepo.delete("locations", id);
  }

  getLeaveTypes(): StamtabelRecord[] {
    return this.stamtabelRepo.getAll("leaveTypes");
  }

  createLeaveType(code: string, description: string): StamtabelRecord {
    return this.stamtabelRepo.create("leaveTypes", code, description);
  }

  updateLeaveType(id: string, code: string, description: string): StamtabelRecord {
    return this.stamtabelRepo.update("leaveTypes", id, code, description);
  }

  deleteLeaveType(id: string): void {
    this.stamtabelRepo.delete("leaveTypes", id);
  }
}
