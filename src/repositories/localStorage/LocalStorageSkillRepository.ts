import type { Skill } from "@/domain/types";
import type { SkillRepository } from "@/repositories/interfaces/SkillRepository";
import { STORAGE_KEYS, notify, generateId } from "./storage";

function readSkills(): Skill[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.SKILLS);
  return raw ? JSON.parse(raw) : [];
}

function writeSkills(skills: Skill[]) {
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  notify();
}

export class LocalStorageSkillRepository implements SkillRepository {
  getAll(): Skill[] {
    return readSkills().sort((a, b) => a.name.localeCompare(b.name));
  }

  create(name: string): Skill {
    const skills = readSkills();
    const skill: Skill = { id: generateId(), name };
    skills.push(skill);
    writeSkills(skills);
    return skill;
  }

  update(id: string, name: string): Skill {
    const skills = readSkills();
    const idx = skills.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Skill not found");
    skills[idx] = { ...skills[idx], name };
    writeSkills(skills);
    return skills[idx];
  }

  delete(id: string): void {
    const skills = readSkills().filter((s) => s.id !== id);
    writeSkills(skills);
  }
}
