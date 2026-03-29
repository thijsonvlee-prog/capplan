# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

_No unreleased changes._

## Release History

### 2026-03-29 — Transaction safety and API input validation

#### Performance / reliability improvements

- The roster assignment creation endpoint now wraps all database operations (auto-close, sequence number, create assignment, generate 364 planning entries) in a single database transaction. If any step fails, all changes roll back cleanly — no more partial roster data on error.
- All POST and PUT API endpoints now validate required fields before processing. Missing or empty fields return a clear Dutch-language error message (e.g., "Startdatum is verplicht") instead of a cryptic database error. Validation covers: employment records, function records, roster assignments, roster profiles, scenarios, settings, and skills.

### 2026-03-29 — Form validation, loading states, and delete dialog improvements

#### UX / usability improvements

- The driver creation form now shows inline Dutch-language error messages when required fields (voornaam, achternaam) are left empty. Input fields highlight in red on validation failure and errors clear as the user types.
- The settings page now shows loading spinners while data is being fetched. Empty state messages ("Nog geen werkgevers toegevoegd") only appear when data has genuinely loaded and is empty, preventing a misleading flash.
- Delete confirmation dialogs in the driver editing sub-tables (dienstverband, functiegegevens, roostertoewijzing) now specify what type of record is being deleted instead of the generic "het record".

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
