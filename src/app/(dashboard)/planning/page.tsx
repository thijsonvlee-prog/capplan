"use client";

import { useState, useCallback } from "react";
import { PlanningGrid } from "@/components/planning/PlanningGrid";
import { MobilePlanningView } from "@/components/planning/MobilePlanningView";
import { MobileHomescreen } from "@/components/layout/MobileHomescreen";
import { useMobileTitle } from "@/hooks/useHeaderSubtitle";

export default function PlanningPage() {
  const [mobileView, setMobileView] = useState<"homescreen" | "planning">("homescreen");
  const goHome = useCallback(() => setMobileView("homescreen"), []);

  // When in planning mode, show "Planning" in the header with back arrow
  useMobileTitle(mobileView === "planning" ? "Planning" : "", goHome);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Desktop: full planning grid */}
      <div className="hidden md:flex flex-col h-full min-h-0">
        <PlanningGrid />
      </div>
      {/* Mobile: homescreen or planning view */}
      <div className="md:hidden flex-1">
        {mobileView === "homescreen" ? (
          <div className="mobile-page-enter">
            <MobileHomescreen onNavigateToPlanning={() => setMobileView("planning")} />
          </div>
        ) : (
          <div className="mobile-page-enter">
            <MobilePlanningView />
          </div>
        )}
      </div>
    </div>
  );
}
