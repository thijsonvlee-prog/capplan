# Escalations to Scrum Master

## Purpose

This file is the formal decision log for unresolved product, scope, UX, and technical choices that agents cannot or should not decide autonomously.

The workflow is:

1. The Product Owner Agent (or any agent) presents a decision in multiple-choice format.
2. The Scrum Master responds by placing `(X)` next to exactly one option.
3. The Product Owner Agent treats that choice as the approved decision.
4. The Product Owner Agent translates the choice into backlog planning and execution in `PRODUCT_BACKLOG.md`.

This file is **not** a generic issue list or scratchpad. Every entry must be a concrete decision with clear options.

## Status Definitions

- **Open**: Decision is waiting for the Scrum Master to choose an option.
- **Chosen**: The Scrum Master has selected an option. Awaiting translation into backlog planning.
- **Planned**: The choice has been translated into backlog items in `PRODUCT_BACKLOG.md`.
- **Closed**: Decision is fully resolved and executed. No further action needed.

## Open Escalations

### ESC-011: Audittrail op stamdata — aanpak en scope

- **Status:** Open
- **Date / run context:** 2026-03-31 — triggered by SMI-017
- **Decision needed:** De Scrum Master wil een audittrail op alle stamdata (wie heeft wat aangemaakt/gewijzigd en wanneer). Er zijn verschillende technische aanpakken met uiteenlopende complexiteit en functionaliteit. Welke aanpak past bij de huidige fase van het product?
- **Why it matters:** Een audittrail raakt alle 22 databasemodellen en alle API-routes. De keuze bepaalt de omvang van het werk (van 1-2 cycli tot 5+ cycli) en of er schema-migraties nodig zijn.
- **Recommendation from Product Owner Agent:** Option A. Voegt `createdBy`/`updatedBy`/`createdAt`/`updatedAt` velden toe aan stamtabellen. Dit is de eenvoudigste aanpak die de kernvraag beantwoordt ("wie heeft wat wanneer gedaan") zonder een volledig audit-logsysteem te bouwen. Kan in 2-3 cycli worden geleverd.

**Choose one option:**

- ( ) **Option A — Velden op bestaande tabellen (recommended):** Voeg `createdAt`, `updatedAt`, `createdBy`, `updatedBy` velden toe aan alle stamtabellen (werkgevers, afdelingen, locaties, verloftypes, competenties, roosterprofielen, importbronnen). Toon "Laatst gewijzigd door X op datum" in de UI. Bewaar alleen de laatste wijziging, niet de volledige historie. Scope: ~2-3 cycli (migratie + API + UI).
- ( ) **Option B — Aparte audit-logtabel:** Maak een `AuditLog` tabel die elke mutatie vastlegt (tabel, record-ID, actie, oude/nieuwe waarden, gebruiker, tijdstip). Toon een doorzoekbaar auditlogboek in de instellingen. Bewaart volledige historie. Scope: ~4-5 cycli (migratie + middleware + API + UI).
- ( ) **Option C — Alleen `createdAt`/`updatedAt` timestamps:** Voeg alleen automatische timestamps toe zonder gebruikerskoppeling. Geen UI-wijzigingen nodig. Prisma kan `@updatedAt` automatisch bijhouden. Scope: ~1 cyclus (migratie alleen). Beperkt: toont niet wie de wijziging deed.
- ( ) **Option D — Uitstellen:** Parkeer dit initiatief tot een latere fase. Focus op andere initiatieven eerst.

**Trade-offs:**
- Option A is een goede balans: beantwoordt de kernvraag, beheersbare scope, maar bewaart geen historie.
- Option B is het meest volledig, maar vereist significant meer werk en een audit-viewer UI.
- Option C is het snelst, maar mist de "wie"-informatie die expliciet gevraagd is.
- Option D geeft ruimte voor de andere twee initiatieven (API management, mobiel).

**What the Scrum Master must do:** Place `(X)` next to exactly one option.

---

### ESC-012: API management — scope en fasering

- **Status:** Open
- **Date / run context:** 2026-03-31 — triggered by SMI-018
- **Decision needed:** De Scrum Master wil API management: API-catalogus, uitgaande data-ophaling, credential-beheer, en inkomend toegangsbeheer. Dit zijn vier afzonderlijke grote functionaliteiten. Welk deel moet als eerste worden gebouwd, en hoe breed is de scope?
- **Why it matters:** Dit is het grootste van de drie nieuwe initiatieven. Zonder fasering en scopeafbakening riskeert het wekenlang werk zonder bruikbaar tussenresultaat. De bestaande connectiviteitshub (CSV-import) biedt een basis, maar API-integratie is fundamenteel anders.
- **Recommendation from Product Owner Agent:** Option B. Start met uitgaande API-connecties als uitbreiding van de bestaande connectiviteitshub. Dit levert als eerste waarde op (data ophalen uit externe systemen) en bouwt voort op bestaande ImportSource-infrastructuur.

**Choose one option:**

- ( ) **Option A — Volledig API management platform:** Bouw alle vier onderdelen in één initiatief: API-catalogus, uitgaande fetches, credential vault, inkomend toegangsbeheer. Scope: 8-12+ cycli.
- ( ) **Option B — Fase 1: Uitgaande API-connecties (recommended):** Breid de connectiviteitshub uit met REST API-bronnen naast CSV. Configureer URL, headers, authenticatie per bron. Voer GET-requests uit en importeer de response. Credential-opslag per bron. Scope: ~4-5 cycli.
- ( ) **Option C — Fase 1: API-catalogus en credential-beheer:** Begin met het registreren en beheren van externe API's en hun credentials, zonder nog data op te halen. Scope: ~2-3 cycli. Levert geen directe gebruikerswaarde tot fase 2.
- ( ) **Option D — Uitstellen:** Dit initiatief is te groot voor de huidige fase. Focus op audittrail en/of mobiel eerst.

**Trade-offs:**
- Option A levert het volledige plaatje maar is zeer groot en risicovol als één geheel.
- Option B levert snel waarde (data ophalen) en bouwt voort op bestaande connectiviteitsinfrastructuur.
- Option C legt de basis maar levert pas waarde in combinatie met een volgende fase.
- Option D vermijdt overbelasting als audittrail en/of mobiel prioriteit hebben.

**What the Scrum Master must do:** Place `(X)` next to exactly one option.

---

### ESC-013: Mobiele versie — scope en aanpak

- **Status:** Open
- **Date / run context:** 2026-03-31 — triggered by SMI-019
- **Decision needed:** De Scrum Master wil een mobiele versie. Het huidige product is een desktop-first B2B planningstool met datarijke schermen (planningsrooster, capaciteitsgrafieken, instellingen). Een volledige mobiele versie vereist fundamentele UX-keuzes. Wat is de gewenste scope?
- **Why it matters:** "Mobiele versie" kan betekenen van responsive layout-aanpassingen tot een volledig aparte mobiele app. De planning grid met 30+ kolommen past niet op een telefoonscherm. De doelgroep en use case bepalen de aanpak.
- **Recommendation from Product Owner Agent:** Option B. Maak een beperkt aantal schermen mobielvriendelijk voor de meest voorkomende mobiele use cases (snel inzien van planning, chauffeurgegevens opzoeken). Het volledige planningsrooster en instellingenbeheer blijven desktop-only.

**Choose one option:**

- ( ) **Option A — Volledig responsive redesign:** Maak alle schermen responsive voor mobiel. Inclusief een mobiele versie van het planningsrooster (bijv. dag-/weekweergave per chauffeur). Scope: 8-12+ cycli.
- ( ) **Option B — Selectieve mobiele weergaven (recommended):** Maak 2-3 kernschermen mobielvriendelijk: chauffeurlijst met zoeken, individueel chauffeurprofiel, en dag-/weekplanning per chauffeur. Planningsrooster en instellingen blijven desktop-only. Scope: ~4-5 cycli.
- ( ) **Option C — Alleen lezen, mobiele viewer:** Bouw een eenvoudige read-only mobiele weergave: "Mijn planning deze week" voor chauffeurs zelf. Geen bewerkfunctionaliteit. Scope: ~2-3 cycli.
- ( ) **Option D — Uitstellen:** Focus eerst op audittrail en/of API management. Mobiel is een later initiatief.

**Trade-offs:**
- Option A is het meest ambitieus maar vereist fundamenteel herontwerp van het planningsrooster voor mobiel.
- Option B levert nuttige mobiele toegang voor planners onderweg zonder het kernproduct te herstructureren.
- Option C is het snelst en bedient mogelijk een andere doelgroep (chauffeurs zelf i.p.v. planners).
- Option D voorkomt spreiding over te veel initiatieven tegelijk.

**What the Scrum Master must do:** Place `(X)` next to exactly one option.

---

## Closed Escalations

### ESC-010: sickPercentage maximumwaarde — 99 of 100

- **Status:** Closed
- **Date / run context:** 2026-03-31 — triggered by DE-REC-051
- **Decision needed:** The `sickPercentage` field (attendance percentage when a driver has SICK status) has inconsistent max values: the API validates 0–100, the UI caps at 99, and the domain type comment says "0-99". What should the correct maximum be?
- **Why it matters:** A planner can submit 100 via the API but only 99 via the UI. The field semantics are also unclear: if 100% means "fully present", that contradicts being on SICK status. Resolving this removes a data inconsistency and clarifies the domain model.
- **Recommendation from Product Owner Agent:** Option A (max 99). If a driver is 100% present, they should not be on SICK status at all. The UI already enforces this. Aligning the API to match is the simplest fix.

**Choose one option:**

- (X) **Option A — Max 99 (recommended):** Align the API to cap at 99, matching the current UI behavior. Rationale: 100% attendance means the driver is not sick. A planner should change the status instead.
- ( ) **Option B — Max 100:** Align the UI to allow 100, matching the current API. Rationale: 100% could mean "registered as sick but fully operational" for administrative tracking purposes.

**Trade-offs:**
- Option A is simpler and matches existing UI behavior. Only requires changing one API validation line.
- Option B allows more flexibility but the semantic meaning of "100% sick attendance" is confusing.

- **Resolution:** Option A chosen by Scrum Master. PB-139 unblocked and moved to Ready with max 99 scope. Backlog updated 2026-03-31.

---

### ESC-009: POC capaciteitssamenvatting in planningsrooster — behouden of verwijderen

- **Status:** Closed
- **Date / run context:** 2026-03-31 — triggered by DE-REC-038
- **Decision needed:** The planning grid contains a POC "capacity summary row" feature (`showCapacitySummary` toggle in PlanningGrid.tsx). This experimental code adds maintenance overhead — it must stay in sync with any grid changes. Should it be promoted to a real feature or removed?
- **Why it matters:** The planning grid just received visual updates (PB-123, PB-124). Carrying unresolved POC code increases risk of regressions during future grid work. Deciding now prevents wasted effort.
- **Recommendation from Product Owner Agent:** Option B (remove). The capacity page already serves the aggregation use case. Having a second capacity view embedded in the planning grid creates redundancy and maintenance cost.

**Choose one option:**

- ( ) **Option A — Promote:** Remove the POC label, ensure the summary row matches the new grid styling (tonal rows, no borders), and document it as a supported feature. Assign to Experience Agent (styling) + Delivery Agent (DE-REC-036 optimization).
- (X) **Option B — Remove (recommended):** Delete `CapacitySummaryRow.tsx` and all related code from PlanningGrid. The capacity page covers this need. Assign cleanup to Delivery Agent.
- ( ) **Option C — Defer decision:** Keep the POC as-is for now. Accept the maintenance cost. Revisit after user feedback.

**Trade-offs:**
- Option A adds a feature but increases grid complexity permanently. Requires styling + optimization work.
- Option B reduces code and maintenance. Loses the inline summary, but the separate capacity page is more comprehensive.
- Option C avoids a decision but keeps dead-weight code in the most critical component.

- **Resolution:** Option B chosen. CapacitySummaryRow.tsx deleted and all related code removed from PlanningGrid. Completed in PB-129 (2026-03-31).

### ESC-008: Gebruikersgroepen met autorisatiefilters — scope en fasering

- **Status:** Closed
- **Date / run context:** 2026-03-30 — triggered by SMI-015
- **Chosen option:** Option A — Minimal MVP with single-dimension filter, modified to use **Afdeling (Department)** as the filter criterion instead of Werkgever (Employer).
- **Scrum Master note:** "maar laat 'afdeling' het filtercriterium zijn"
- **Backlog linkage:** PB-109 (data model + API, Phase 1), PB-110 (admin UI, Phase 2), PB-111 (enforcement, Phase 3).
- **Product Owner action:** Broken into 3 phased backlog items. Phase 1 (PB-109) is ready for the Delivery Agent. Phase 2 (PB-110) assigned to Experience Agent, blocked on PB-109. Phase 3 (PB-111) assigned to Delivery Agent, blocked on PB-110.

### ESC-007: Virtual scrolling approach for 1000-driver planning grid

- **Status:** Closed
- **Date / run context:** 2026-03-30 — triggered by SMI-011
- **Chosen option:** Option A — Use `react-window` library. (Implementation chose manual table virtualization instead to preserve table structure; approved approach, same outcome.)
- **Backlog linkage:** PB-096 (completed).

### ESC-006: Server error — Vercel environment verification

- **Status:** Closed
- **Chosen option:** Option B — Auth is needed. Verify Vercel environment.
- **Backlog linkage:** PB-088.

### ESC-005: Authentication approach for user management

- **Status:** Closed
- **Chosen option:** Option B — NextAuth.js with external provider (Google/Microsoft).
- **Backlog linkage:** PB-080, PB-081, PB-079, PB-082 (all completed).

### ESC-004: Custom date picker — scope and approach

- **Status:** Closed
- **Chosen option:** Option B — Styled date input wrapper.
- **Backlog linkage:** PB-039 (completed).

### ESC-003: Planning grid visual redesign — scope and phasing

- **Status:** Closed
- **Chosen option:** Option B — Phased redesign across 3 cycles. All completed.

### ESC-001: Define MVP scope for connectivity hub

- **Status:** Closed
- **Chosen option:** Option A — Configuration-first MVP.
- **Backlog linkage:** PB-015, PB-016 (completed).

### ESC-002: Conflicting driver status computation between views

- **Status:** Closed
- **Chosen option:** Option A — Employment-based status.
- **Backlog linkage:** PB-003, PB-025 (completed).

## Escalation Rules

- Prefer multiple-choice decisions over open-ended questions. Present 3-5 clear options.
- Always include one recommended option with a brief justification.
- Keep context short and decision-oriented. Avoid long narrative explanations.
- The Scrum Master should only need to place `(X)` next to one option to make a decision.
- After a choice is made, the Product Owner Agent must translate it into execution planning in `PRODUCT_BACKLOG.md`.
- Escalations move through the status flow: Open → Chosen → Planned → Closed. Do not leave items open indefinitely.
- Any agent can create an escalation, but the Product Owner Agent is responsible for formatting it correctly.
- IDs are sequential (ESC-001, ESC-002, ...) and never reused.
- Blocked backlog items must reference the relevant escalation ID.
- Do not use this file for minor questions or preferences. Escalate only when work is genuinely blocked or a cross-cutting decision is required.
