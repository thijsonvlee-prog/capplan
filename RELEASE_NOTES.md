# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Release History

### 2026-03-30 — Server-side zoeken en volledige capaciteitstotalen

#### UX / design verbeteringen

- **Server-side zoeken planningsrooster:** Het zoekfilter in het planningsrooster doorzoekt nu alle chauffeurs in de database, niet alleen de huidige pagina. Zoeken werkt op naam en personeelsnummer. Resultaten worden vertraagd opgehaald (300ms) en de pagina springt terug naar 1 bij een nieuwe zoekopdracht.
- **Volledige capaciteitstotalen:** De totaalrij onderaan het planningsrooster toont nu capaciteitstotalen over alle chauffeurs, onafhankelijk van de huidige pagina of zoekopdracht. Voorheen waren deze totalen beperkt tot de 100 chauffeurs op de huidige pagina.

### 2026-03-30 — Loginbeveiliging, paginering planningsrooster en documentatie

#### Beveiliging

- **Loginbeperking tot bekende gebruikers:** Alleen gebruikers die vooraf door een beheerder zijn aangemaakt in het admin-paneel kunnen inloggen via Google. Onbekende Google-accounts worden geweigerd met een duidelijke Nederlandse foutmelding op de inlogpagina.

#### Inlogpagina

- **Alleen Google-login:** De inlogpagina toont nu alleen de Google-knop. De Microsoft-knop is verborgen (backend-configuratie blijft intact voor toekomstig gebruik).
- **Ontwikkelingsmelding:** Een zichtbare melding "Deze applicatie is in ontwikkeling" is toegevoegd aan de inlogpagina.

#### Prestaties

- **Paginering planningsrooster:** Het planningsrooster haalt chauffeurs nu op in pagina's van 100. Paginaknoppen (eerste/vorige/volgende/laatste) verschijnen onder het rooster bij meer dan 100 chauffeurs.
- **Scenario-duplicatie in chunks:** Het dupliceren van scenario's verwerkt planningitems nu in blokken van 5.000 in plaats van alles in één keer. Bij 50.000 items blijft het geheugengebruik constant.

#### Documentatie

- **Masterdata-documentatie:** Nieuw `masterdata.md` document met volledige veldbeschrijvingen, typen, constraints en relaties voor alle 22 databasemodellen.

### 2026-03-30 — Virtual scrolling, paginering chauffeurs, import-betrouwbaarheid

#### Prestaties

- **Virtual scrolling planningsrooster:** Het planningsrooster rendert nu alleen de zichtbare rijen in de browser. Bij 1000+ chauffeurs blijft het scrollen soepel doordat slechts ~30-50 rijen tegelijk in het DOM aanwezig zijn, in plaats van alle rijen. Alle bestaande functionaliteit (vastgezette kolommen, groepskoppen, slepen-selecteren, capaciteitstotalen) blijft ongewijzigd werken.

#### UX / design verbeteringen

- **Paginering chauffeurspagina:** De chauffeurspagina gebruikt nu server-side paginering en zoeken. Pagineringknoppen (eerste/vorige/volgende/laatste), een paginagrootte-kiezer (25/50/100) en een totaalteller zijn toegevoegd. Zoeken is vertraagd (300ms) voor responsieve server-side filtering op naam en personeelsnummer.

#### Betrouwbaarheid

- **Import in chunks:** Grote CSV-imports worden nu in blokken van 500 rijen verwerkt in plaats van in één transactie. Bij 10.000 rijen voorkomt dit time-outs op de Neon serverless-verbinding.
- **Datumvalidatie planningsendpoints:** Alle planningsendpoints valideren nu het datumformaat (JJJJ-MM-DD). Ongeldige datums geven een duidelijke 400-foutmelding in het Nederlands.

### 2026-03-30 — Schaalbaarheid: paginering en index-optimalisatie

#### Prestaties

- **Paginering planningsrooster-API:** Het endpoint `/api/planning/for-range` ondersteunt nu optionele `page` en `pageSize` parameters.
- **Paginering chauffeurs-API:** Het endpoint `/api/drivers` ondersteunt nu optionele `page` en `pageSize` parameters met server-side zoeken.
- **Capaciteitsindex:** Een samengestelde index op `(scenarioId, date, status)` is toegevoegd aan de PlanningEntry-tabel.

#### Betrouwbaarheid

- **CSV-import rijlimiet:** Het importeren van CSV-bestanden is nu begrensd tot maximaal 10.000 rijen per import.

### 2026-03-30 — Gebruikersidentiteit, upsert-import en sessie-optimalisatie

#### Functionele verbeteringen

- **CSV-import upsert modus:** Bij het importeren van CSV-bestanden kan nu gekozen worden tussen "Alleen aanmaken" en "Aanmaken of bijwerken".

#### UX / design verbeteringen

- **Gebruikersidentiteit in zijbalk:** De zijbalk toont nu de naam en rol van de ingelogde gebruiker onderaan.

#### Prestaties

- **Sessie-optimalisatie:** De extra databasequery voor de gebruikersrol is verwijderd. De rol wordt direct uit het sessieobject gelezen.

### 2026-03-30 — Rolbewuste interface, betrouwbaarheid en documentatie

#### UX / design verbeteringen

- **Rolbewuste interface:** De interface past zich aan op basis van de rol van de ingelogde gebruiker. Kijkers zien geen bewerkingsknoppen, niet-beheerders zien geen schrijfknoppen op instellingen.
- **Instellingen-tabbladen op smal scherm:** De tabbalk scrollt nu horizontaal op smalle schermen.

#### Betrouwbaarheid

- **JSON-parseerbeveiliging:** Alle 23 POST/PUT API-routes gebruiken nu een gedeelde `parseJsonBody()` helper die ongeldige JSON afvangt.

#### Documentatie

- **Authenticatie-setuphandleiding:** Nieuw `AUTH_SETUP.md` document met stapsgewijze instructies voor het configureren van authenticatie in Vercel.

### 2026-03-30 — Bugfix: server error bij openen applicatie

#### Bugfix

- **Server error opgelost:** De applicatie gaf een "Server error" fout bij het openen wanneer authenticatie niet volledig was geconfigureerd. De middleware slaat authenticatie nu over wanneer `NEXTAUTH_SECRET` niet is ingesteld.

### 2026-03-30 — Rolhandhaving en importvalidatie

#### Beveiliging

- **Rolhandhaving op API-routes:** Alle schrijfbewerkingen (POST/PUT/DELETE) vereisen nu de juiste rol.
- **Rechtenmatrix:** Settings, gebruikersbeheer, importbronnen en roosterprofielen vereisen Admin-rechten. Chauffeurs, planning en scenario's vereisen Planner-rechten.

#### Betrouwbaarheid

- **Veldkoppelingsvalidatie verbeterd:** Import-bronnen valideren nu dat veldkoppelingen geldig zijn.

### 2026-03-30 — Gebruikersbeheer, inloggen, CSV-import en authenticatie

#### Functionele verbeteringen

- **Gebruikersbeheer:** Nieuw tabblad "Gebruikers" op de instellingenpagina met roloverzicht en rolbeheer.
- **Inlogpagina:** Nieuwe inlogpagina met ondersteuning voor Google en Microsoft.
- **Sessie-indicator:** De koptekstbalk toont nu de ingelogde gebruiker met profielfoto, naam en uitlogknop.
- **Routebeveiliging:** Niet-ingelogde gebruikers worden automatisch doorgestuurd naar de inlogpagina.
- **CSV-import uitvoeren:** CSV-bestanden kunnen nu worden geüpload, gevalideerd en geïmporteerd.
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
