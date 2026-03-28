import type { Skill } from "@/domain/types";

export interface SkillRepository {
  getAll(): Skill[];
  create(name: string): Skill;
  update(id: string, name: string): Skill;
  delete(id: string): void;
}
