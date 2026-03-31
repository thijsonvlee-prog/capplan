# Product Backlog

## Purpose

This is the single source of truth for all planned work in CapPlan. The Product Owner Agent maintains this file. Experience Agent and Delivery Agent propose items via their recommendation files; only items approved and added here are considered scheduled work.

## Priority Rules

- **P1 Critical**: Blocks users or breaks core functionality. Must be addressed in the next cycle.
- **P2 High**: Significant improvement to usability, reliability, or correctness. Scheduled within 1-2 cycles.
- **P3 Medium**: Valuable but not urgent. Scheduled when capacity allows.
- **P4 Low**: Nice-to-have. Deferred until higher-priority work is complete.

Items are ordered by priority within each section. Ties are broken by expected user impact.

**Current direction:** The product is stable and all major screens are at product-grade quality. Authorization, input validation, and core features are complete. Three new strategic initiatives have been submitted by the Scrum Master (audit trail, API management, mobile version) — all are escalated for scope decisions before any work begins. Remaining backlog items are P4 polish/maintenance.

## Status Definitions

- **Ready**: Fully scoped, no blockers, can be picked up immediately.
- **In Progress**: Actively being worked on by the assigned owner.
- **Blocked**: Cannot proceed without a decision or dependency resolution.
- **Completed**: Done, verified, and deployed.
- **Deferred**: Intentionally postponed. Reason documented.

---

## Ready for Next Cycle

_No items ready for next cycle. Three initiatives are blocked on Scrum Master scope decisions (see below)._

---

## Blocked / Needs Decision

### SMI-017: Audittrail op stamdata

- **Owner:** TBD (pending scope decision)
- **Priority:** TBD
- **Status:** Blocked — awaiting ESC-011 decision
- **Problem:** Scrum Master wil dat alle stamdata-mutaties traceerbaar zijn (wie, wat, wanneer).
- **Scope notes:** Approach and phasing depend on ESC-011. Cannot plan backlog items until a scope option is chosen.
- **Escalation:** ESC-011

### SMI-018: API management

- **Owner:** TBD (pending scope decision)
- **Priority:** TBD
- **Status:** Blocked — awaiting ESC-012 decision
- **Problem:** Scrum Master wil API-beheer: catalogus, uitgaande data-ophaling, credential-beheer, inkomend toegangsbeheer.
- **Scope notes:** Very large initiative. Approach and phasing depend on ESC-012. Cannot plan backlog items until a scope option is chosen.
- **Escalation:** ESC-012

### SMI-019: Mobiele versie

- **Owner:** TBD (pending scope decision)
- **Priority:** TBD
- **Status:** Blocked — awaiting ESC-013 decision
- **Problem:** Scrum Master wil een mobiele versie van CapPlan.
- **Scope notes:** Desktop-first B2B tool. Mobile requires fundamental UX decisions. Approach depends on ESC-013.
- **Escalation:** ESC-013

---

## In Progress

_No items currently in progress._

---

## Completed Recently

### PB-139: Resolve sickPercentage domain inconsistency

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-143–PB-145: Input validation hardening (drivers, scenarios, import sources, roster profiles, user groups)

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31
- **Note:** Completes full input validation coverage across all POST/PUT routes.

### PB-140–PB-142: Enum validation, text field limits, duplicate skill prevention

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-134–PB-138: Error state propagation, date cap, notes cap, error surfacing, department scope enforcement

- **Status:** Completed
- **Owner:** Delivery Agent
- **Completed:** 2026-03-31

### PB-129–PB-133: POC removal, P2025 handling, capacity visual lift, per-user scenario, error hooks

- **Status:** Completed
- **Owner:** Delivery Agent / Experience Agent
- **Completed:** 2026-03-31

---

## Deferred

### EX-REC-049: Capacity chart — custom tooltip and axis styling

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk polish. Capacity page is structurally aligned. Custom tooltip is cosmetic.

### EX-REC-048: Planning grid toolbar — responsive collapse for narrow viewports

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current flex-wrap handles basic cases. Only relevant if narrow viewport usage is reported.

### DE-REC-041: Remove unused type exports from domain/types.ts

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Quick cleanup but no user impact.

### EX-REC-044: User group member assignment — batch API

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current sequential approach works for typical group sizes.

### PB-030: Move hardcoded constants and chart colors to centralized config

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low user impact. Covers DE-REC-014, DE-REC-030, DE-REC-047.

### PB-061: Add PerformanceEvent table cleanup mechanism

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Table grows unbounded but traffic is low.

### EX-REC-038: Extend Manrope to section titles and modal headers

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Low-risk typographic refinement. Needs visual evaluation.

### EX-REC-043: Import source manager — visual mapping builder enhancement

- **Owner:** Experience Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Current field mapping editor is functional. Polish item.

### EX-REC-042: Deduplicate scenarios list fetch

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** No direct user impact. Minor code hygiene.

### DE-REC-058: Cap value length on preferences PUT route

- **Owner:** Delivery Agent
- **Priority:** P4 Low
- **Status:** Deferred
- **Reason:** Only remaining route without text field length cap. Near-zero risk.

---

## Backlog Hygiene Rules

- The Product Owner Agent reviews and updates this file at the start of each cycle.
- Items stay in `Completed Recently` for one cycle, then are removed.
- Blocked items must reference their blocking dependency.
- New items must originate from `RECOMMENDATIONS_EXPERIENCE.md` or `RECOMMENDATIONS_DELIVERY.md`, or be directly added by the Scrum Master.
- Each item must have all required fields filled in. Incomplete items are not considered ready.
- Backlog IDs are sequential and never reused. Next available: PB-146.
- Do not let the active backlog grow indefinitely.
- Completed items should be moved out of active sections into `Completed Recently`.
- Remove stale items that are no longer relevant.
- Merge overlapping or duplicate items.
- Vague items must be rewritten or split before they are ready for execution.
- The backlog should be rewritten into a clean current state, not endlessly appended to.
