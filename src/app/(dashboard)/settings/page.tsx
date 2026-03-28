"use client";

import { SkillManager } from "@/components/settings/SkillManager";

export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Instellingen</h2>
      <div className="max-w-2xl">
        <SkillManager />
      </div>
    </div>
  );
}
