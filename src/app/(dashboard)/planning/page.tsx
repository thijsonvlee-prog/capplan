"use client";

import { PlanningGrid } from "@/components/planning/PlanningGrid";

export default function PlanningPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Planning</h2>
      <PlanningGrid />
    </div>
  );
}
