"use client";

import { PlanningGrid } from "@/components/planning/PlanningGrid";

export default function PlanningPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page title is shown in the header */}
      <PlanningGrid />
    </div>
  );
}
