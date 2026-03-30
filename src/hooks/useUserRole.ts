"use client";

import { useSession } from "next-auth/react";

/**
 * Exposes the current user's role and derived permission flags.
 * When auth is not configured (no session), grants full access (development mode).
 */
export function useUserRole() {
  const { data: session } = useSession();

  // No session available — auth not configured or user not yet loaded.
  // Grant full access so development/preview environments work without auth.
  if (!session?.user?.role) {
    return {
      role: null as string | null,
      isAdmin: true,
      isPlanner: true,
      isViewer: false,
      canWrite: true,
      canWriteSettings: true,
    };
  }

  const role = session.user.role;
  return {
    role,
    isAdmin: role === "ADMIN",
    isPlanner: role === "PLANNER" || role === "ADMIN",
    isViewer: role === "VIEWER",
    canWrite: role !== "VIEWER",
    canWriteSettings: role === "ADMIN",
  };
}
