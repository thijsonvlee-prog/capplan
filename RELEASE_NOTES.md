# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

_No unreleased changes._

## Release History

### 2026-03-29 — Planning grid fix, transaction coverage, and error logging

#### Bug fix

- Fixed a regression where drivers without active employment records were hidden from the planning grid. All drivers now appear in the planning grid regardless of employment status. The employment-based active/inactive indicator remains available for display purposes.

#### Reliability improvements

- Employment and function record creation are now wrapped in database transactions. A failure during auto-close of previous records or record creation rolls back cleanly, preventing data corruption.
- All sub-record creation handlers (employment, function, roster assignment) now have full transaction protection.

#### Data consistency

- The `isActive` field can no longer be set directly via the driver update API. Driver active status is exclusively determined by employment records, eliminating a confusing write path that had no effect.

#### Security / internal

- All API route error logging now logs only the error message instead of the full error object. This prevents connection strings, SQL details, and schema internals from appearing in production server logs.

### 2026-03-29 — Accessibility labels and required field indicators

#### UX / usability improvements

- All icon-only buttons (edit, delete, save, cancel, navigation) now have `aria-label` attributes. Screen reader users can identify every button action across the entire application.
- Required form fields are now visually marked before submission. Label-based forms (driver details, employment, function, roster) show a red asterisk next to required field names. Inline forms (settings, scenario creation) show `*` in placeholder text. Users no longer need to submit and fail to discover which fields are mandatory.



### 2026-03-29 — Accessibility, transactions, and employment-based driver status

#### UX / usability improvements

- Toast notifications are now announced by screen readers via `aria-live` region. All CRUD success/error feedback is accessible to users with assistive technology.
- SkillManager and RosterProfileEditor now show loading spinners during initial data fetch. Empty state messages only appear once data has genuinely loaded.

#### Reliability improvements

- All remaining multi-step database operations are now wrapped in transactions. This covers: driver updates (skill reassignment), driver deletion, roster profile updates (day replacement), scenario duplication, scenario deletion, and skill deletion. Partial failures roll back cleanly.

#### Data consistency

- Driver active/inactive status is now determined by employment records instead of a manually set flag. A driver is considered active when they have an employment record covering the current date. Both the planning grid and driver list now use this same logic, eliminating count discrepancies between views.

#### Known issue

- The employment-based driver filter in the planning grid hides drivers without active employment records. This is tracked as PB-025 (P1 Critical) and will be fixed in the next cycle.

### 2026-03-29 — Reliability, validation, and UX polish

#### Performance / reliability improvements

- Roster assignment creation now wraps all database operations in a single transaction. Partial failures roll back cleanly.
- All POST and PUT API endpoints now validate required fields before processing. Missing or empty fields return a clear Dutch-language error message.
- Added composite database index on roster assignments for faster date-range lookups.

#### UX / usability improvements

- Driver creation form shows inline error messages when required fields are left empty. Fields highlight in red on validation failure and errors clear as the user types.
- Settings page shows loading spinners while data is being fetched. Empty state messages only appear when data has genuinely loaded and is empty.
- Delete confirmation dialogs in driver editing now specify what type of record is being deleted.
- Toast notifications appear for all create, update, and delete operations.
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
