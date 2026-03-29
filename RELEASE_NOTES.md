# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

### UX / usability improvements

- Stamtabel empty states (werkgevers, afdelingen, standplaatsen, verloftypes) now show instructional text guiding users to fill in the form and click "Toevoegen" to add their first item.

### Functional improvements

- _No unreleased functional changes._

### Performance / reliability improvements

- Added composite database index on DriverRosterAssignment (driverId, startDate, endDate) to improve roster assignment query performance for date-range lookups. Deployed via migration `20260329000000_add_roster_assignment_composite_index`.

### Internal quality improvements

- _No unreleased internal changes._

## Release History

### 2026-03-29 — Workflow setup

- Established multi-agent coordination workflow with Product Backlog, recommendation files, release notes, and escalation tracking.
- No application code changes in this release.

## Release Note Rules

- Each entry is a concise, product-level description of the change. Avoid technical jargon.
- Group changes under the correct subsection (UX, Functional, Performance, Internal).
- When items from `Unreleased` are deployed, move them under a new dated heading in `Release History`.
- Use the format `### YYYY-MM-DD — Short description` for each release.
- The Product Owner Agent is responsible for maintaining this file.
- Do not include work-in-progress items. Only completed and deployed changes appear here.
