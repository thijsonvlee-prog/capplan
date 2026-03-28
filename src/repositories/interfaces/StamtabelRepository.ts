import type { StamtabelType } from "@/domain/enums";
import type { StamtabelRecord } from "@/domain/types";

export interface StamtabelRepository {
  getAll(type: StamtabelType): StamtabelRecord[];
  create(type: StamtabelType, code: string, description: string): StamtabelRecord;
  update(type: StamtabelType, id: string, code: string, description: string): StamtabelRecord;
  delete(type: StamtabelType, id: string): void;
}
