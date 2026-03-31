# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Release History

### 2026-03-31 — Beveiligingsfixes autorisatie

#### Beveiliging

- **Afdelingsfilter op planning-verwijderroute:** Planners met beperkte afdelingstoegang konden eerder planningsitems verwijderen voor chauffeurs buiten hun scope. De DELETE-route past nu dezelfde afdelingscontrole toe als de POST-routes.
- **Importbron GET-endpoint beveiligd:** Het ophalen van een individuele importbron (inclusief API-credentials) vereist nu de ADMIN-rol, consistent met alle andere importbron-endpoints.

### 2026-03-31 — API-bronnen test en response mapping

#### UX / design verbeteringen

- **Verbinding testen voor API-bronnen:** Nieuwe "Verbinding testen" knop in het API-configuratieformulier. Test de geconfigureerde URL, headers en authenticatie met inline feedback (succes/fout). Werkt ook voor nog niet opgeslagen bronnen.
- **Response-structuur ontdekking:** Na een succesvolle verbindingstest worden de ontdekte JSON-paden en voorbeeldwaarden uit de API-response getoond. Klik op een pad om het direct als bronveld in de veldkoppeling over te nemen.
- **Autocomplete op bronvelden:** Bij API-bronnen biedt het bronveld-invoerveld autocomplete-suggesties op basis van ontdekte JSON-paden uit de laatste verbindingstest.

### 2026-03-31 — API-bronnen uitvoering

#### Functionele verbeteringen

- **API-bron uitvoering:** API-importbronnen kunnen nu worden uitgevoerd. De server haalt data op van de geconfigureerde URL met de ingestelde HTTP-methode, headers en authenticatie (Basic, Bearer, API-sleutel). De JSON-response wordt automatisch geparseerd en via dot-notatie veldmappings (bijv. `employee.firstName`) worden gegevens geëxtraheerd en geïmporteerd. Resultaten zijn zichtbaar in het importlogboek met dezelfde detailinformatie als CSV-imports.
- **Uitvoerknop voor API-bronnen:** In de bronnenlijst verschijnt een uitvoerknop voor API-type bronnen. Klik om een importpaneel te openen met moduskeuze (aanmaken of bijwerken) en directe uitvoering.
- **Automatische data-array detectie:** JSON-responses worden automatisch doorzocht op data-arrays in veelgebruikte wrapper-structuren (`data`, `results`, `items`, `rows`, `records`).

### 2026-03-31 — API-bronnen, audittrail en validatie

#### UX / design verbeteringen

- **API-bron configuratie in connectiviteitshub:** Importbronnen ondersteunen nu naast CSV ook API-verbindingen. Brontype-kiezer (CSV/API) in het aanmaak- en bewerkformulier. Bij API-type: URL en HTTP-methode (GET/POST), headers key-value editor, authenticatietype (geen, basic, bearer token, API-sleutel) met bijbehorende credential-velden. Wachtwoorden en tokens zijn standaard verborgen met een toon/verberg-knop. De bronnenlijst toont type-badge met icoon, API-URL en authenticatie-informatie.
- **Auditlog viewer in instellingen:** Nieuw tabblad "Auditlog" op de instellingenpagina, alleen zichtbaar voor beheerders. Chronologisch overzicht met filter op tabel, actie en datumbereik. Expandeerbare rijen tonen oude en nieuwe waarden. Paginering met 25 items per pagina.
- **Planningsrooster werkbalk herstructurering:** Twee losse werkbalkrijen samengevoegd tot één balk met vier zones: Periode, Filter, Weergave en Status.
- **Tonale rijscheiding in planningsrooster:** Randen vervangen door afwisselende achtergrondtinten met hover-effect.
- **Capaciteitspagina:** KPI-samenvattingsmodule met vijf kernmetrieken. Werkbalk geïntegreerd in paginakop.
- **Chauffeurspagina:** Samengesteld dataoppervlak met geïntegreerde zoekbalk en tonale rijafwisseling.

#### Functionele verbeteringen

- **API-bronnen datamodel:** Het ImportSource-model ondersteunt API-bronnen met URL, HTTP-methode, headers, authenticatietype en credentials. Validatie op API-specifieke velden bij aanmaken en bewerken.
- **Volledige audittrail:** Alle mutaties op stamtabellen, chauffeurs, roosterprofielen, importbronnen, scenario's, gebruikersgroepen en gebruikers worden vastgelegd. Planning-entries uitgezonderd vanwege hoog volume.
- **Per-gebruiker scenario:** Het actieve scenario wordt per ingelogde gebruiker opgeslagen.
- **Foutmeldingen zichtbaar:** Server-foutmeldingen worden in toastmeldingen getoond.

#### Beveiliging

- **Afdelingsfilter op planning-schrijfroutes:** Planners met beperkte toegang kunnen geen planningsitems aanmaken voor chauffeurs buiten hun afdelingen.

#### Betrouwbaarheid

- **Invoervalidatie compleet:** Alle POST/PUT-endpoints hebben lengtebegrenzingen, enum-validatie en referentievalidatie.

#### Prestaties

- **Snellere sub-record aanmaak:** Overbodige database-query verwijderd uit `autoCloseOpenRecords()`. Bespaart ~3 roundtrips per wijziging op Neon serverless.

#### Bugfixes

- **Rijstreeppatroon bij groepering hersteld.**
- **Gebruikersgroepen zonder afdelingen:** Terugval op onbeperkte toegang in plaats van leeg scherm.
- **Beveiligingsverbetering importlogboek:** Endpoint vereist nu ADMIN-rol.

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
