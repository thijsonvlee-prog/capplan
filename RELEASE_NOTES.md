# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Release History

### 2026-03-30 — Beveiliging OAuth-adapter en zoekverbeteringen

#### Beveiliging

- **Geen automatische gebruikersaanmaak bij OAuth-login:** De PrismaAdapter maakt niet langer automatisch nieuwe gebruikersrecords aan wanneer een onbekend Google-account inlogt. Alleen gebruikers die vooraf door een beheerder zijn aangemaakt kunnen een OAuth-account koppelen. Onbekende accounts worden direct geweigerd.
- **Verbeterde foutmeldingen op inlogpagina:** De inlogpagina toont nu duidelijke Nederlandse foutmeldingen voor alle OAuth-fouttypen, inclusief een generieke fallback voor onverwachte fouten.
- **Loginbeperking tot bekende gebruikers:** Alleen gebruikers die vooraf door een beheerder zijn aangemaakt in het admin-paneel kunnen inloggen via Google. Onbekende Google-accounts worden geweigerd met een duidelijke Nederlandse foutmelding.

#### UX / design verbeteringen

- **Server-side zoeken planningsrooster:** Het zoekfilter in het planningsrooster doorzoekt nu alle chauffeurs in de database, niet alleen de huidige pagina. Zoeken werkt op naam en personeelsnummer met vertraagd ophalen (300ms).
- **Volledige capaciteitstotalen:** De totaalrij onderaan het planningsrooster toont nu capaciteitstotalen over alle chauffeurs, onafhankelijk van de huidige pagina of zoekopdracht.
- **Alleen Google-login:** De inlogpagina toont nu alleen de Google-knop met een zichtbare melding "Deze applicatie is in ontwikkeling".

#### Prestaties

- **Paginering planningsrooster:** Het planningsrooster haalt chauffeurs nu op in pagina's van 100 met paginaknoppen.
- **Scenario-duplicatie in chunks:** Het dupliceren van scenario's verwerkt planningitems nu in blokken van 5.000.

#### Documentatie

- **Masterdata-documentatie:** Nieuw `masterdata.md` document met volledige veldbeschrijvingen voor alle 22 databasemodellen.

### 2026-03-30 — Virtual scrolling, paginering chauffeurs, import-betrouwbaarheid

#### Prestaties

- **Virtual scrolling planningsrooster:** Het planningsrooster rendert nu alleen de zichtbare rijen. Bij 1000+ chauffeurs blijft het scrollen soepel.

#### UX / design verbeteringen

- **Paginering chauffeurspagina:** Server-side paginering en zoeken met pagineringknoppen, paginagrootte-kiezer (25/50/100) en totaalteller.

#### Betrouwbaarheid

- **Import in chunks:** Grote CSV-imports worden nu in blokken van 500 rijen verwerkt om time-outs te voorkomen.
- **Datumvalidatie planningsendpoints:** Alle planningsendpoints valideren nu het datumformaat (JJJJ-MM-DD).

### 2026-03-30 — Schaalbaarheid: paginering en index-optimalisatie

#### Prestaties

- **Paginering planningsrooster-API:** `/api/planning/for-range` ondersteunt nu `page` en `pageSize` parameters.
- **Paginering chauffeurs-API:** `/api/drivers` ondersteunt nu `page` en `pageSize` parameters met server-side zoeken.
- **Capaciteitsindex:** Samengestelde index op `(scenarioId, date, status)` toegevoegd.

#### Betrouwbaarheid

- **CSV-import rijlimiet:** Importeren begrensd tot maximaal 10.000 rijen per import.

### 2026-03-30 — Gebruikersidentiteit, upsert-import en sessie-optimalisatie

#### Functionele verbeteringen

- **CSV-import upsert modus:** Keuze tussen "Alleen aanmaken" en "Aanmaken of bijwerken" bij CSV-import.

#### UX / design verbeteringen

- **Gebruikersidentiteit in zijbalk:** Naam en rol van ingelogde gebruiker zichtbaar onderaan de zijbalk.

#### Prestaties

- **Sessie-optimalisatie:** Gebruikersrol wordt direct uit het sessieobject gelezen zonder extra databasequery.

### 2026-03-30 — Rolbewuste interface en betrouwbaarheid

#### UX / design verbeteringen

- **Rolbewuste interface:** De interface past zich aan op basis van de gebruikersrol.
- **Instellingen-tabbladen op smal scherm:** Horizontaal scrollende tabbalk.

#### Betrouwbaarheid

- **JSON-parseerbeveiliging:** Alle 23 POST/PUT API-routes gebruiken `parseJsonBody()` helper.

#### Documentatie

- **Authenticatie-setuphandleiding:** `AUTH_SETUP.md` met stapsgewijze configuratie-instructies.

### 2026-03-30 — Bugfix: server error bij openen applicatie

#### Bugfix

- **Server error opgelost:** Middleware slaat authenticatie nu over wanneer `NEXTAUTH_SECRET` niet is ingesteld.

### 2026-03-30 — Rolhandhaving en importvalidatie

#### Beveiliging

- **Rolhandhaving op API-routes:** Alle schrijfbewerkingen vereisen de juiste rol.
- **Rechtenmatrix:** Settings/gebruikersbeheer/importbronnen/roosterprofielen = Admin. Chauffeurs/planning/scenario's = Planner.

#### Betrouwbaarheid

- **Veldkoppelingsvalidatie verbeterd:** Import-bronnen valideren veldkoppelingen.

### 2026-03-30 — Gebruikersbeheer, inloggen, CSV-import en authenticatie

#### Functionele verbeteringen

- **Gebruikersbeheer:** Tabblad "Gebruikers" op instellingenpagina met roloverzicht en rolbeheer.
- **Inlogpagina:** Google en Microsoft login-ondersteuning.
- **Sessie-indicator:** Ingelogde gebruiker in koptekstbalk met profielfoto en uitlogknop.
- **Routebeveiliging:** Automatische doorverwijzing naar inlogpagina.
- **CSV-import uitvoeren:** Upload, validatie en import van CSV-bestanden.
- **Importgeschiedenis:** Logboek per importbron.

#### Interne kwaliteit

- **CLAUDE.md herschreven.** CSV-parser geëxtraheerd. Map-memoization in DriverForm. Dode code verwijderd.

### 2026-03-29 — Ontwerp, prestaties en betrouwbaarheid

#### UX / design verbeteringen

- **Koptekst met context:** Contextuele informatie per pagina.
- **Planningsrooster herontwerp:** Tonale lagen, statuscellen met kleurindicatorstippen.
- **Chauffeurspagina herontwerp:** Samengestelde paginakop met contextbeschrijving.
- **Instellingenpagina herontwerp:** Tabnavigatie.
- **Capaciteitspagina:** Statuschips met kleurindicatorstippen.
- **Datuminvoer:** Gestylede invoer met kalenderknop.
- **Subtabellen:** Tonale rijscheidingen.
- **Verwijderbevestigingen:** Gestylede bevestigingsdialogen.
- **Typografie:** Manrope lettertype voor paginatitels.

#### Connectiviteitshub

- **Importbronnen:** Datamodel, CRUD API en beheerscherm met visuele veldkoppelingseditor.
- **CSV-upload:** Uploadfunctie met kolomdetectie en voorbeeldrijen.

#### Prestaties

- **Map-gebaseerde lookups:** O(1) lookups in het planningsrooster.

#### Betrouwbaarheid

- **Referentievalidatie:** Alle API-routes valideren relaties.
- **Transactieveiligheid:** Meervoudige databasebewerkingen in transacties.

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
