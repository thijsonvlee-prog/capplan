# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Release History

### 2026-03-31 — Planningsrooster visuele verbetering en bugfix

#### UX / design verbeteringen

- **Planningsrooster werkbalk herstructurering:** Werkbalk samengevoegd van twee losse rijen naar één samengestelde balk met vier duidelijke zones: Periode, Filter, Weergave en Status. Zones gescheiden door verticale dividers voor snellere visuele oriëntatie.
- **Tonale rijscheiding in planningsrooster:** 1px-randen tussen datarijen vervangen door afwisselende achtergrondtinten (wit/lichtgrijs). Rij-hover toont zachte merkkleur. Koprij-rand versoepeld. Planningsrooster oogt nu als productoppervlak in plaats van spreadsheet.

#### Bugfix

- **Rijstreeppatroon bij groepering hersteld:** Bij gebruik van groepering (bijv. op afdeling) startte het even/oneven streeppatroon opnieuw bij elke groep, wat visuele inconsistentie veroorzaakte. Nu loopt het streeppatroon continu door over alle groepen.

### 2026-03-30 — Gebruikersgroepen autorisatie compleet

#### Beveiliging

- **Gebruikersgroepen op alle routes:** Alle lees-endpoints (lijsten én individuele toegang) passen nu afdelingsfiltering toe op basis van gebruikersgroepen. Chauffeurs, planning en capaciteit buiten de toegewezen afdelingen zijn niet zichtbaar. Gebruikers zonder groep zien alle gegevens (achterwaarts compatibel).
- **Individuele routes beveiligd:** `/api/drivers/[id]` en `/api/planning` (per chauffeur) geven 404 voor chauffeurs buiten de gebruikersgroep, zonder informatie te lekken.
- **Voorkeuren per gebruiker:** Het voorkeuren-endpoint leest de gebruikers-ID uit de sessie. Niet-ingelogde gebruikers krijgen een 401-fout.
- **Geen automatische gebruikersaanmaak:** Alleen vooraf aangemaakte gebruikers kunnen inloggen via OAuth.
- **Rolhandhaving op alle schrijfroutes:** Settings/gebruikersbeheer = Admin. Chauffeurs/planning/scenario's = Planner.

#### Functionele verbeteringen

- **Gebruikersgroepen beheer:** Nieuw tabblad "Gebruikersgroepen" op de instellingenpagina (alleen beheerders). Groepen aanmaken, bewerken en verwijderen met afdelingskoppeling en ledenbeheer.
- **Gebruikersgroepen datamodel:** Gebruikers kunnen aan een groep worden gekoppeld die bepaalt welke afdelingen ze mogen zien. API-routes voor CRUD-beheer op `/api/user-groups`.
- **CSV-import upsert modus:** Keuze tussen "Alleen aanmaken" en "Aanmaken of bijwerken" bij CSV-import.
- **Gebruikersbeheer:** Tabblad "Gebruikers" op instellingenpagina met roloverzicht en rolbeheer.
- **Inlogpagina:** Google login met "onder constructie"-melding. Alleen bekende gebruikers kunnen inloggen.

#### Prestaties

- **Capaciteitsendpoint geoptimaliseerd:** Prisma-relatiefilter in plaats van aparte query voor chauffeur-ID's.
- **Snellere CSV-import:** Batch-lookups en `createMany` in plaats van per-rij queries (~90% minder database-queries).
- **Virtual scrolling planningsrooster:** Alleen zichtbare rijen worden gerenderd. Soepel scrollen bij 1000+ chauffeurs.
- **Paginering:** Server-side paginering op planningsrooster en chauffeurspagina.
- **Samengestelde index:** `(scenarioId, date, status)` index op planning-entries.
- **Scenario-duplicatie in chunks:** Planningitems in blokken van 5.000 verwerkt.

#### Betrouwbaarheid

- **Statusvalidatie:** Planning POST en bulk-endpoints valideren status tegen domein-enum.
- **Ziektepercentage bereikvalidatie:** Veld gevalideerd op 0–100.
- **Datumvalidatie:** Alle planningsendpoints valideren datumformaat (JJJJ-MM-DD).
- **Capaciteitsendpoint:** Datumformaatvalidatie en limiet van 366 datums per verzoek.
- **Import in chunks:** Grote CSV-imports in blokken van 500 rijen. Maximaal 10.000 rijen per import.
- **JSON-parseerbeveiliging:** Alle POST/PUT API-routes gebruiken `parseJsonBody()` helper.
- **Veldkoppelingsvalidatie:** Import-bronnen valideren veldkoppelingen.

#### UX / design verbeteringen

- **Rolbewuste interface:** Interface past zich aan op basis van gebruikersrol.
- **Server-side zoeken planningsrooster:** Zoekfilter doorzoekt alle chauffeurs in de database.
- **Volledige capaciteitstotalen:** Totaalrij toont capaciteit over alle chauffeurs.
- **Gebruikersidentiteit in zijbalk:** Naam en rol van ingelogde gebruiker zichtbaar.
- **Sessie-indicator:** Profielfoto en uitlogknop in koptekstbalk.
- **Instellingen-tabbladen op smal scherm:** Horizontaal scrollende tabbalk.
- **Paginering chauffeurspagina:** Pagineringknoppen, paginagrootte-kiezer (25/50/100) en totaalteller.

#### Documentatie

- **Masterdata-documentatie:** `masterdata.md` met veldbeschrijvingen voor alle 22 databasemodellen.
- **Authenticatie-setuphandleiding:** `AUTH_SETUP.md` met configuratie-instructies.

### 2026-03-29 — Ontwerp, connectiviteit en prestaties

#### UX / design verbeteringen

- **Planningsrooster herontwerp:** Tonale lagen, statuscellen met kleurindicatorstippen.
- **Koptekst met context:** Contextuele informatie per pagina.
- **Chauffeurspagina herontwerp:** Samengestelde paginakop met contextbeschrijving.
- **Instellingenpagina herontwerp:** Tabnavigatie met secties.
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
