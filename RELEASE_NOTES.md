# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

### Accessibility & UX consistency

- Toast notifications are now announced by screen readers via `aria-live` region. All CRUD success/error feedback is accessible to users with assistive technology.
- SkillManager and RosterProfileEditor now show loading spinners during initial data fetch, matching the StamtabelManager pattern. Empty state messages only appear once data has genuinely loaded.

## Release History

### 2026-03-29 — Reliability, validation, and UX polish

#### Performance / reliability improvements

- Roster assignment creation now wraps all database operations in a single transaction. Partial failures roll back cleanly — no more incomplete roster data on error.
- All POST and PUT API endpoints now validate required fields before processing. Missing or empty fields return a clear Dutch-language error message (e.g., "Startdatum is verplicht") instead of a database error.
- Added composite database index on roster assignments for faster date-range lookups.

#### UX / usability improvements

- Driver creation form shows inline error messages when required fields are left empty. Fields highlight in red on validation failure and errors clear as the user types.
- Settings page shows loading spinners while data is being fetched. Empty state messages only appear when data has genuinely loaded and is empty.
- Delete confirmation dialogs in driver editing now specify what type of record is being deleted (e.g., "het dienstverband vanaf 2026-01-01") instead of generic text.
- Toast notifications appear for all create, update, and delete operations, giving users clear feedback when data is saved or removed.
- Stamtabel empty states show instructional guidance text prompting users to add their first item.

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
