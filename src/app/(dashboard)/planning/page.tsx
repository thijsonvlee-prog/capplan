"use client";

import { PlanningGrid } from "@/components/planning/PlanningGrid";
import { MobilePlanningView } from "@/components/planning/MobilePlanningView";

export default function PlanningPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Desktop: full planning grid */}
      <div className="hidden md:flex flex-col h-full min-h-0">
        <PlanningGrid />
      </div>
      {/* Mobile: month calendar per driver */}
      <div className="md:hidden">
        <MobilePlanningView />
      </div>
    </div>
  );
}
