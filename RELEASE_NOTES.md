# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Release History

### 2026-03-31 — API-import helpers, audit cleanup, mobiele navigatie

#### Onderhoud

- **API-import helpers geconsolideerd:** De vier gedeelde functies (`buildApiHeaders`, `extractDataArray`, `resolveJsonPath`, `discoverPaths`) zijn geëxtraheerd naar `src/lib/api-import-helpers.ts`. Test-verbinding en uitvoerroutes importeren nu van dezelfde module. Elimineert ~80 regels duplicatie.
- **Audit log opschoning:** Nieuwe `cleanupOldAuditLogs()` functie in `src/lib/audit.ts` verwijdert automatisch audit-entries ouder dan 90 dagen. Wordt fire-and-forget aangeroepen na elke import-uitvoering.

### 2026-03-31 — API-connecties, audittrail en beveiligingsfixes

#### UX / design verbeteringen

- **API-bron configuratie:** Importbronnen ondersteunen nu naast CSV ook API-verbindingen. Brontype-kiezer (CSV/API), URL en HTTP-methode, headers key-value editor, authenticatietype (geen, basic, bearer token, API-sleutel) met credential-velden. Bronnenlijst toont type-badge met icoon en API-details.
- **Verbinding testen:** Nieuwe "Verbinding testen" knop in het API-configuratieformulier met inline succes/fout-feedback. Werkt ook voor nog niet opgeslagen bronnen.
- **Response-structuur ontdekking:** Na een succesvolle verbindingstest worden ontdekte JSON-paden en voorbeeldwaarden getoond. Klik op een pad om het als bronveld in de veldkoppeling over te nemen. Bronveld-invoer biedt autocomplete op basis van ontdekte paden.
- **Auditlog viewer:** Nieuw tabblad "Auditlog" in instellingen (alleen beheerders). Filter op tabel, actie en datumbereik. Expandeerbare rijen met oude en nieuwe waarden. Paginering.
- **Planningsrooster:** Werkbalk herstructurering naar vier zones (Periode, Filter, Weergave, Status). Tonale rijscheiding met hover-effect.
- **Capaciteitspagina:** KPI-samenvattingsmodule met vijf kernmetrieken.
- **Chauffeurspagina:** Geïntegreerde zoekbalk en tonale rijafwisseling.
- **Mobiele navigatie:** Sidebar is nu verborgen op mobiele schermen (< 768px) en opent als slide-over paneel via een hamburger-menu in de header. Navigatie sluit automatisch na een paginawissel. Touch-vriendelijke tap targets en compactere padding op mobiel. Desktop-layout blijft ongewijzigd.
- **Mobiele chauffeurlijst:** Op mobiele schermen wordt de chauffeurstabel vervangen door een kaartweergave. Elke kaart toont naam, personeelsnummer, afdeling, dienstverband, standplaats, rijbewijzen en vaardigheden. Zoekbalk is volledig breed. Tik op een kaart om te bewerken. Vereenvoudigde paginering (vorige/volgende). Desktop-weergave is ongewijzigd.

#### Functionele verbeteringen

- **API-bron uitvoering:** Server-side HTTP-request naar geconfigureerde URL met authenticatie. JSON-response wordt geparseerd via dot-notatie veldmappings (bijv. `employee.firstName`). Automatische data-array detectie in veelgebruikte wrapper-structuren. Resultaten zichtbaar in importlogboek.
- **Volledige audittrail:** Alle mutaties op stamtabellen, chauffeurs, roosterprofielen, importbronnen, scenario's, gebruikersgroepen en gebruikers worden vastgelegd. Planning-entries uitgezonderd vanwege hoog volume.
- **Per-gebruiker scenario:** Het actieve scenario wordt per ingelogde gebruiker opgeslagen.
- **Foutmeldingen zichtbaar:** Server-foutmeldingen worden in toastmeldingen getoond.

#### Beveiliging

- **Afdelingsfilter op planning-routes:** DELETE-route past nu dezelfde afdelingscontrole toe als POST-routes. Planners kunnen geen items verwijderen buiten hun scope.
- **Importbron GET-endpoint beveiligd:** Ophalen van individuele importbron (inclusief API-credentials) vereist nu ADMIN-rol.
- **Afdelingsfilter op planning-schrijfroutes:** Planners met beperkte toegang kunnen geen planningsitems aanmaken buiten hun afdelingen.

#### Betrouwbaarheid

- **Invoervalidatie compleet:** Alle POST/PUT-endpoints hebben lengtebegrenzingen, enum-validatie en referentievalidatie.

#### Prestaties

- **Snellere sub-record aanmaak:** Overbodige database-query verwijderd. Bespaart ~3 roundtrips per wijziging op Neon serverless.

#### Bugfixes

- **Rijstreeppatroon bij groepering hersteld.**
- **Gebruikersgroepen zonder afdelingen:** Terugval op onbeperkte toegang in plaats van leeg scherm.

### 2026-03-30 — Gebruikersgroepen autorisatie compleet

#### Beveiliging

- **Gebruikersgroepen op alle routes:** Alle lees-endpoints passen afdelingsfiltering toe op basis van gebruikersgroepen.
- **Individuele routes beveiligd:** `/api/drivers/[id]` en `/api/planning` geven 404 voor chauffeurs buiten de gebruikersgroep.
- **Voorkeuren per gebruiker:** Niet-ingelogde gebruikers krijgen een 401-fout.
- **Geen automatische gebruikersaanmaak:** Alleen vooraf aangemaakte gebruikers kunnen inloggen via OAuth.
- **Rolhandhaving op alle schrijfroutes:** Settings/gebruikersbeheer = Admin. Chauffeurs/planning/scenario's = Planner.

#### Functionele verbeteringen

- **Gebruikersgroepen beheer:** Nieuw tabblad op de instellingenpagina met afdelingskoppeling en ledenbeheer.
- **CSV-import upsert modus:** Keuze tussen "Alleen aanmaken" en "Aanmaken of bijwerken".
- **Gebruikersbeheer:** Tabblad "Gebruikers" met roloverzicht en rolbeheer.
- **Inlogpagina:** Google login met "onder constructie"-melding.

#### Prestaties

- **Capaciteitsendpoint geoptimaliseerd.**
- **Snellere CSV-import:** Batch-lookups en `createMany`.
- **Virtual scrolling planningsrooster:** Soepel bij 1000+ chauffeurs.
- **Server-side paginering** op planningsrooster en chauffeurspagina.

#### Documentatie

- **Masterdata-documentatie** en **authenticatie-setuphandleiding**.

### 2026-03-29 — Ontwerp, connectiviteit en prestaties

#### UX / design verbeteringen

- **Planningsrooster herontwerp:** Tonale lagen, statuscellen met kleurindicatorstippen.
- **Koptekst met context:** Contextuele informatie per pagina.
- **Chauffeurspagina herontwerp:** Samengestelde paginakop met contextbeschrijving.
- **Instellingenpagina herontwerp:** Tabnavigatie met secties.
- **Capaciteitspagina:** Statuschips met kleurindicatorstippen.
- **Datuminvoer:** Gestylede invoer met kalenderknop.
- **Verwijderbevestigingen:** Gestylede bevestigingsdialogen.
- **Typografie:** Manrope lettertype voor paginatitels.

#### Connectiviteitshub

- **Importbronnen:** Datamodel, CRUD API en beheerscherm met visuele veldkoppelingseditor.
- **CSV-upload:** Uploadfunctie met kolomdetectie en voorbeeldrijen.

#### Prestaties

- **Map-gebaseerde lookups:** O(1) lookups in het planningsrooster.

#### Bugfix

- Chauffeurs zonder actief dienstverband nu zichtbaar in het planningsscherm.

### 2026-03-29 — Workflow setup

- Multi-agent coördinatieworkflow opgezet.

## Release Note Rules

- Each entry is a concise, product-level description of the change. Avoid technical jargon.
- Group changes under the correct subsection (UX, Functional, Performance, Internal).
- When items from `Unreleased` are deployed, move them under a new dated heading in `Release History`.
- Use the format `### YYYY-MM-DD — Short description` for each release.
- The Product Owner Agent is responsible for maintaining this file.
- Do not include work-in-progress items. Only completed and deployed changes appear here.
