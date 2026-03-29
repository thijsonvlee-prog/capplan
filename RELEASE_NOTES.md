# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

_No unreleased changes._

## Release History

### 2026-03-29 — Empty states, toast notifications, and performance indexes

#### UX / usability improvements

- Toast notifications now appear for all create, update, and delete operations across the application, giving users clear feedback when data is saved or removed.
- Stamtabel empty states (werkgevers, afdelingen, standplaatsen, verloftypes) now show instructional guidance text prompting users to add their first item.

#### Performance / reliability improvements

- Added composite database index on DriverRosterAssignment (driverId, startDate, endDate) to improve roster assignment query performance for date-range lookups.

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
