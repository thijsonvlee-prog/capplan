# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

### Accessibility

- All modal overlays (scenario aanmaken, roosterprofiel toewijzen, kolommen selecteren, bulk status instellen, dagstatus instellen) hebben nu `role="dialog"`, `aria-modal="true"`, en beschrijvende `aria-label` attributen voor screenreaders.

### UX / instellingenpagina

- De instellingenpagina is gegroepeerd in drie secties: Stamgegevens, Competenties en Roosters. Elke sectie heeft een koptekst. De pagina opent met een korte introductietekst.

## Release History

### 2026-03-29 — Planning grid fix, accessibility, transactions, and error hardening

#### Bug fix

- Fixed a regression where drivers without active employment records were hidden from the planning grid. All drivers now appear in the planning grid regardless of employment status.

#### UX / usability improvements

- All icon-only buttons (edit, delete, save, cancel, navigation) now have `aria-label` attributes for screen reader users.
- Required form fields are now visually marked with red asterisks before submission.
- Toast notifications are announced by screen readers via `aria-live` region.
- SkillManager and RosterProfileEditor show loading spinners during initial data fetch.

#### Reliability improvements

- All multi-step database operations are now wrapped in transactions (driver updates, driver deletion, roster profile updates, scenario duplication, scenario deletion, skill deletion, employment creation, function creation, roster assignment creation).

#### Data consistency

- Driver active/inactive status is now determined by employment records instead of a manually set flag.
- The `isActive` field can no longer be set directly via the driver update API.

#### Security / internal

- All API route error logging now logs only the error message instead of the full error object, preventing connection strings and schema internals from appearing in production logs.

### 2026-03-29 — Reliability, validation, and UX polish

#### Performance / reliability improvements

- Roster assignment creation wraps all database operations in a single transaction.
- All POST and PUT API endpoints validate required fields before processing.
- Added composite database index on roster assignments for faster date-range lookups.

#### UX / usability improvements

- Driver creation form shows inline error messages when required fields are left empty.
- Settings page shows loading spinners while data is being fetched.
- Delete confirmation dialogs now specify what type of record is being deleted.
- Toast notifications appear for all create, update, and delete operations.
- Stamtabel empty states show instructional guidance text.

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
