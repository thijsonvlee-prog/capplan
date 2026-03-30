# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

_Geen wijzigingen in afwachting van release._

## Release History

### 2026-03-30 — Schaalbaarheid: paginering en index-optimalisatie

#### Prestaties

- **Paginering planningsrooster-API:** Het endpoint `/api/planning/for-range` ondersteunt nu optionele `page` en `pageSize` parameters. Hiermee worden chauffeurs in pagina's opgehaald in plaats van allemaal tegelijk, wat de laadtijd bij grote aantallen chauffeurs aanzienlijk verkort.
- **Paginering chauffeurs-API:** Het endpoint `/api/drivers` ondersteunt nu optionele `page` en `pageSize` parameters met server-side zoeken op voornaam, achternaam en personeelsnummer. Bestaande aanroepen zonder paginering blijven ongewijzigd werken.
- **Capaciteitsindex:** Een samengestelde index op `(scenarioId, date, status)` is toegevoegd aan de PlanningEntry-tabel. Dit versnelt de capaciteitsberekeningen bij groeiende datavolumes.

#### Betrouwbaarheid

- **CSV-import rijlimiet:** Het importeren van CSV-bestanden is nu begrensd tot maximaal 10.000 rijen per import. Bij overschrijding wordt een duidelijke foutmelding getoond. Dit voorkomt geheugen- en time-outproblemen bij grote bestanden.

### 2026-03-30 — Gebruikersidentiteit, upsert-import en sessie-optimalisatie

#### Functionele verbeteringen

- **CSV-import upsert modus:** Bij het importeren van CSV-bestanden kan nu gekozen worden tussen "Alleen aanmaken" en "Aanmaken of bijwerken". Bestaande records worden herkend op basis van unieke sleutel (code voor stamtabellen, personeelsnummer voor chauffeurs). Importresultaten en -geschiedenis tonen apart het aantal aangemaakte, bijgewerkte en overgeslagen rijen.

#### UX / design verbeteringen

- **Gebruikersidentiteit in zijbalk:** De zijbalk toont nu de naam en rol van de ingelogde gebruiker onderaan, naast het versienummer.

#### Prestaties

- **Sessie-optimalisatie:** De extra databasequery voor de gebruikersrol is verwijderd. De rol wordt direct uit het sessieobject gelezen.

### 2026-03-30 — Rolbewuste interface, betrouwbaarheid en documentatie

#### UX / design verbeteringen

- **Rolbewuste interface:** De interface past zich aan op basis van de rol van de ingelogde gebruiker. Kijkers (VIEWER) zien geen bewerkingsknoppen op het planningsscherm, chauffeurscherm en scenario's. Niet-beheerders zien geen schrijfknoppen op de instellingenpagina en het tabblad "Gebruikers" is alleen zichtbaar voor beheerders. Wanneer authenticatie niet is geconfigureerd, blijven alle acties beschikbaar.
- **Instellingen-tabbladen op smal scherm:** De tabbalk op de instellingenpagina scrollt nu horizontaal op smalle schermen in plaats van tekst af te kappen of te laten terugvloeien.

#### Betrouwbaarheid

- **JSON-parseerbeveiliging:** Alle 23 POST/PUT API-routes gebruiken nu een gedeelde `parseJsonBody()` helper die ongeldige JSON afvangt en een duidelijke 400-foutmelding teruggeeft in plaats van een generieke 500-fout.

#### Documentatie

- **Authenticatie-setuphandleiding:** Nieuw `AUTH_SETUP.md` document met stapsgewijze instructies voor het configureren van authenticatie in Vercel. Behandelt alle vereiste omgevingsvariabelen, Google OAuth-setup, Azure AD-setup, verificatiestappen en probleemoplossing.

### 2026-03-30 — Bugfix: server error bij openen applicatie

#### Bugfix

- **Server error opgelost:** De applicatie gaf een "Server error" fout bij het openen wanneer authenticatie niet volledig was geconfigureerd. De middleware slaat authenticatie nu over wanneer `NEXTAUTH_SECRET` niet is ingesteld, zodat de applicatie ook zonder authenticatieconfiguratie werkt.

### 2026-03-30 — Rolhandhaving en importvalidatie

#### Beveiliging

- **Rolhandhaving op API-routes:** Alle schrijfbewerkingen (POST/PUT/DELETE) vereisen nu de juiste rol. Beheerders hebben volledige toegang, planners kunnen chauffeurs, planning en scenario's beheren, kijkers hebben alleen leestoegang.
- **Rechtenmatrix:** Settings, gebruikersbeheer, importbronnen en roosterprofielen vereisen Admin-rechten. Chauffeurs, planning en scenario's vereisen Planner-rechten.

#### Betrouwbaarheid

- **Veldkoppelingsvalidatie verbeterd:** Import-bronnen valideren nu dat veldkoppelingen geldig zijn. Ongeldige configuraties worden bij opslaan afgewezen.

### 2026-03-30 — Gebruikersbeheer, inloggen, CSV-import en authenticatie

#### Functionele verbeteringen

- **Gebruikersbeheer:** Nieuw tabblad "Gebruikers" op de instellingenpagina met roloverzicht en rolbeheer.
- **Inlogpagina:** Nieuwe inlogpagina met ondersteuning voor Google en Microsoft.
- **Sessie-indicator:** De koptekstbalk toont nu de ingelogde gebruiker met profielfoto, naam en uitlogknop.
- **Routebeveiliging:** Niet-ingelogde gebruikers worden automatisch doorgestuurd naar de inlogpagina.
- **CSV-import uitvoeren:** CSV-bestanden kunnen nu worden geüpload, gevalideerd en geïmporteerd met samenvatting van resultaten.
- **Importgeschiedenis:** Per importbron een logboek met de laatste 20 imports.

#### Authenticatie-infrastructuur

- **NextAuth.js:** Authenticatie-infrastructuur met Google en Microsoft (Azure AD). Sessies in de database via Prisma-adapter.

#### Interne kwaliteit

- **CLAUDE.md herschreven.** CSV-parser geëxtraheerd. Map-memoization in DriverForm. Dode code verwijderd. 0 ESLint-waarschuwingen, 0 typecheck-fouten.

### 2026-03-29 — Ontwerp, prestaties en betrouwbaarheid

#### UX / design verbeteringen

- **Koptekst met context:** Contextuele informatie per pagina (actief scenario, aantal chauffeurs).
- **Planningsrooster herontwerp:** Tonale lagen, statuscellen met kleurindicatorstippen, selectiemenu naast cel.
- **Chauffeurspagina herontwerp:** Samengestelde paginakop met contextbeschrijving.
- **Instellingenpagina herontwerp:** Tabnavigatie in plaats van verticale lijst.
- **Capaciteitspagina:** Statuschips met kleurindicatorstippen, gegroepeerde werkbalk.
- **Datuminvoer:** Alle datumvelden met gestylede invoer en kalenderknop.
- **Subtabellen:** Tonale rijscheidingen op alle subtabellen.
- **Verwijderbevestigingen:** Alle destructieve acties met gestylede bevestigingsdialogen.
- **Typografie:** Manrope lettertype voor paginatitels.

#### Connectiviteitshub

- **Importbronnen:** Datamodel, CRUD API, en beheerscherm met visuele veldkoppelingseditor.
- **CSV-upload:** Uploadfunctie met kolomdetectie, voorbeeldrijen en koppelingvalidatie.

#### Prestaties

- **Map-gebaseerde lookups:** O(1) lookups in het planningsrooster.

#### Betrouwbaarheid

- **Referentievalidatie:** Alle API-routes valideren dat relaties bestaan.
- **Transactieveiligheid:** Alle meervoudige databasebewerkingen in transacties.

#### Bugfix

- Chauffeurs zonder actief dienstverband zijn nu zichtbaar in het planningsscherm.

### 2026-03-29 — Workflow setup

- Multi-agent coördinatieworkflow opgezet.

## Release Note Rules

- Each entry is a concise, product-level description of the change. Avoid technical jargon.
- Group changes under the correct subsection (UX, Functional, Performance, Internal).
- When items from `Unreleased` are deployed, move them under a new dated heading in `Release History`.
- Use the format `### YYYY-MM-DD — Short description` for each release.
- The Product Owner Agent is responsible for maintaining this file.
- Do not include work-in-progress items. Only completed and deployed changes appear here.
