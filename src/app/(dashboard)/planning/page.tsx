"use client";

import { PlanningGrid } from "@/components/planning/PlanningGrid";
import { MobilePlanningView } from "@/components/planning/MobilePlanningView";

export default function PlanningPage() {
  return (
    <>
      {/* Desktop: full planning grid */}
      <div className="hidden md:flex flex-col h-full min-h-0">
        <PlanningGrid />
      </div>
      {/* Mobile: single-driver day/week view */}
      <div className="md:hidden">
        <MobilePlanningView />
      </div>
    </>
  );
}
