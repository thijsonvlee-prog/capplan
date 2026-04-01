"use client";

import { useState } from "react";
import { PlanningGrid } from "@/components/planning/PlanningGrid";
import { MobilePlanningView } from "@/components/planning/MobilePlanningView";
import { MobileHomescreen } from "@/components/layout/MobileHomescreen";

export default function PlanningPage() {
  const [mobileView, setMobileView] = useState<"homescreen" | "planning">("homescreen");

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Desktop: full planning grid */}
      <div className="hidden md:flex flex-col h-full min-h-0">
        <PlanningGrid />
      </div>
      {/* Mobile: homescreen or planning view */}
      <div className="md:hidden flex-1">
        {mobileView === "homescreen" ? (
          <MobileHomescreen onNavigateToPlanning={() => setMobileView("planning")} />
        ) : (
          <MobilePlanningView onBackToHome={() => setMobileView("homescreen")} />
        )}
      </div>
    </div>
  );
}
