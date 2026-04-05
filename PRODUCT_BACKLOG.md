# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** PB-190 completed in the 2026-04-05 cycle (Delivery Agent). PB-191 completed in the 2026-04-05 cycle (Experience Agent). All GET endpoints now have auth enforcement. Desktop homescreen (SMI-026) remains blocked on ESC-014 awaiting Scrum Master scope decision. No critical or high-priority Delivery items pending.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items currently ready for Delivery Agent._

---

## In Progress

_No items currently in progress._

---

## Blocked / Needs Decision

### Desktop homescreen (SMI-026)

- **Status:** Blocked — awaiting Scrum Master scope decision
- **Escalation:** ESC-014
- **Summary:** Scrum Master wil een desktop startscherm. Scope en aanpak moeten gekozen worden voordat dit gepland kan worden. Zie ESC-014 voor de opties.

---

## Completed Recently

### PB-190: Voeg auth-checks toe aan settings GET endpoints

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-05
- **Summary:** Added `requireRole("VIEWER")` to GET handlers in `src/app/api/settings/[type]/route.ts` and `src/app/api/settings/skills/route.ts`. All GET endpoints now enforce minimum VIEWER role. No behavior change without NEXTAUTH_SECRET.

### PB-191: Releasenotes-pagina synchroniseren met RELEASE_NOTES.md

- **Status:** Completed
- **Owner:** Experience Agent
- **Completed:** 2026-04-05
- **Summary:** Added April 2, 3, and 4 entries to the hardcoded `RELEASES` array in `src/app/(dashboard)/documentatie/page.tsx`. Content sourced from `RELEASE_NOTES.md`. Existing format preserved (date, title, category badges with items).

### PB-184: Fix scenario DELETE preference cleanup voor ingelogde gebruikers

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-04
- **Summary:** Replaced hardcoded `userId: "default"` findFirst+delete with `deleteMany` matching on `key: "activeScenario", value: id` regardless of userId. Stale preferences are now cleaned up for all users when a scenario is deleted.

### PB-185: Voeg auth-checks toe aan onbeschermde GET endpoints

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-04
- **Summary:** Added `requireRole("VIEWER")` to GET handlers on scenarios, roster-profiles, employment, functions, and roster-assignments. No behavior change when auth is not configured.

### PB-186: Valideer datumformaten op sub-record routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-04
- **Summary:** Added `validateDateFormat()` calls on startDate and endDate before the range comparison in all 6 sub-record route files. Invalid dates now return 400 with Dutch error message instead of 500.

### PB-187: Valideer scenario-ID voordat planning entries worden aangemaakt

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-04
- **Summary:** Added `validateOptionalForeignKey()` for scenario ID in planning POST and bulk handlers. Invalid/deleted scenario IDs now return 400 with Dutch error message instead of FK constraint 500.

### PB-188: Verminder dubbele sessie-lookups op planning routes

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-04
- **Summary:** Added `requireRoleWithSession()` to `api-route-utils.ts` and optional `session` parameter to `getAllowedDepartmentIds()`. Planning POST, bulk, and DELETE routes now perform a single session lookup per request, saving ~50-100ms on authenticated requests.

### PB-189: Voeg audit logging toe aan driver sub-record mutaties

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-04-04
- **Summary:** Added `logAudit()` calls to all 9 mutation handlers across employment, functions, and roster-assignments routes (3 POST + 3 PUT + 3 DELETE). Follows existing fire-and-forget pattern.

---

## Deferred

### EX-REC-055: RosterProfileEditor — tonale lagen en weekendonderscheid

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-traffic screen. All other settings sections are at design system standard. Pick up when capacity allows.

### EX-REC-052: Mobiele planning — bewerkingsmogelijkheid (v2)

- **Owner:** Experience Agent
- **Priority:** P3 Medium
- **Status:** Deferred
- **Reason:** Natural next step after mobile initiative is complete. The read-only planning flow should be validated with user feedback first.

### EX-REC-053: Mobiel startscherm — begroeting en scenario-context

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-effort personalization enhancement. Can be combined with any future mobile work cycle.

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Most visible remaining desktop integration gap. Low risk but no user demand driving it.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Desktop-only concern. Only relevant if narrow desktop viewport usage is reported.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk typographic refinement.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. Desktop-only concern.

### DE-REC-070: Align client-side TARGET_ENTITIES met server-side constante

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No user impact. Pick up when capacity allows.

### DE-REC-062: Parallelize autoCloseOpenRecords + getNextSequenceNumber

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Minor optimization. Low urgency.

### DE-REC-063: weeklyHours range validation on roster assignment routes

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Trivial validation gap on a single numeric field. Near-zero risk.

### DE-REC-058: Cap value length on preferences PUT route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Only remaining route without text field length cap. Near-zero risk.

### DE-REC-059: Parallelize sequential DB calls in import-source execute route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick optimization but not user-facing.

### DE-REC-065: API response data path configuration

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Natural Phase 1 follow-up but not blocking.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Partially addressed by PB-176.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene.

### EX-REC-044: User group member assignment — batch API

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current sequential approach works for typical group sizes.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused. Next available: PB-192.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
