# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Release History

### 2026-03-31 — API-bronnen datamodel en prestatieverbetering

#### Functionele verbeteringen

- **API-bronnen datamodel:** Het ImportSource-model ondersteunt nu naast CSV ook API-bronnen. Nieuwe velden: URL, HTTP-methode, headers, authenticatietype (geen/basic/bearer/API-key) en credentials. Bestaande CSV-bronnen werken ongewijzigd. Migratie is aangemaakt.
- **API-bron validatie:** POST- en PUT-routes voor importbronnen valideren API-specifieke velden (URL verplicht, methode, authenticatietype) wanneer het brontype API is.

#### Prestaties

- **Snellere sub-record aanmaak:** Overbodige database-query verwijderd uit `autoCloseOpenRecords()`. Bespaart ~3 roundtrips per dienstverband-, functie- of roosterwijziging op Neon serverless.

### 2026-03-31 — Audittrail, validatie en visuele verbeteringen

#### UX / design verbeteringen

- **Auditlog viewer in instellingen:** Nieuw tabblad "Auditlog" op de instellingenpagina, alleen zichtbaar voor beheerders (ADMIN). Chronologisch overzicht van alle vastgelegde mutaties met: gebruikersnaam, tabelnaam (in Nederlands), actie en tijdstip. Klik op een rij om oude en nieuwe waarden in te zien. Filter op tabel, actie (aangemaakt/bewerkt/verwijderd) en datumbereik. Actie-badges met semantische kleuren. Paginering met 25 items per pagina.
- **Planningsrooster werkbalk herstructurering:** Werkbalk samengevoegd van twee losse rijen naar één samengestelde balk met vier zones: Periode, Filter, Weergave en Status. Zones gescheiden door verticale dividers.
- **Tonale rijscheiding in planningsrooster:** 1px-randen tussen datarijen vervangen door afwisselende achtergrondtinten. Rij-hover toont zachte merkkleur.
- **Scenariokiezer verplaatst:** Van de "Weergave"-zone naar de "Periode"-zone (scenario is een datacontext, geen weergave-instelling).
- **Chauffeurspagina visuele verbetering:** Tabel ingepakt in samengesteld dataoppervlak met geïntegreerde zoekbalk en tonale rijafwisseling.
- **Capaciteitspagina visuele verbetering:** KPI-samenvattingsmodule toegevoegd met vijf kernmetrieken. Werkbalk geïntegreerd in paginakop. Buitenranden verwijderd.

#### Functionele verbeteringen

- **Volledige audittrail:** Alle mutaties op stamtabellen, chauffeurs, roosterprofielen, importbronnen, scenario's, gebruikersgroepen en gebruikers worden vastgelegd in een auditlogboek. Per mutatie: tabel, record-ID, actie, oude/nieuwe waarden, gebruiker en tijdstip. Planning-entries uitgezonderd vanwege hoog volume.
- **Per-gebruiker scenario:** Het actieve scenario wordt nu per ingelogde gebruiker opgeslagen.
- **Foutmeldingen zichtbaar:** Server-foutmeldingen worden nu in toastmeldingen getoond in plaats van generieke berichten. Alle pagina's tonen foutmeldingen bij mislukt ophalen van gegevens.

#### Beveiliging

- **Afdelingsfilter op planning-schrijfroutes:** Planners met beperkte gebruikersgroep-toegang kunnen niet langer planningsitems aanmaken voor chauffeurs buiten hun afdelingen.

#### Betrouwbaarheid

- **Invoervalidatie compleet:** Alle POST/PUT-endpoints hebben nu lengtebegrenzingen op tekstvelden, enum-validatie en referentievalidatie. Specifiek: chauffeursvelden, scenarionaam/-omschrijving, importbronnaam, roosterprofielnaam, gebruikersgroepnaam, dienstverband-type, competentienamen (uniek), planningsnotities (max 500 tekens), ziektepercentage (max 99), datumslimiet (max 366 per verzoek).

#### Technische verbeteringen

- **AuditLog datamodel:** Nieuw model met JSONB old/new values, geoptimaliseerde indexes en herbruikbare `logAudit()` helper.
- **Foutstatus in data-hooks:** `useApiDataWithLoading` geeft nu een `error`-veld terug.
- **Verbeterde foutafhandeling bij verwijderen:** Alle DELETE- en PUT-routes geven 404 bij niet-bestaande records.
- **POC capaciteitssamenvatting verwijderd:** De experimentele samenvatting in het planningsrooster is verwijderd. De capaciteitspagina dekt deze functionaliteit.

#### Bugfix

- **Rijstreeppatroon bij groepering hersteld:** Bij gebruik van groepering liep het streeppatroon nu continu door over alle groepen.
- **Gebruikersgroepen zonder afdelingen:** Gebruikers in een groep zonder afdelingen zagen een leeg scherm. Nu terugval op onbeperkte toegang.
- **Beveiligingsverbetering importlogboek:** Endpoint voor importlogboeken vereist nu ADMIN-rol.

### 2026-03-30 — Gebruikersgroepen autorisatie compleet

#### Beveiliging

- **Gebruikersgroepen op alle routes:** Alle lees-endpoints passen afdelingsfiltering toe op basis van gebruikersgroepen. Chauffeurs, planning en capaciteit buiten de toegewezen afdelingen zijn niet zichtbaar.
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

- **Capaciteitsendpoint geoptimaliseerd:** Prisma-relatiefilter in plaats van aparte query.
- **Snellere CSV-import:** Batch-lookups en `createMany` (~90% minder database-queries).
- **Virtual scrolling planningsrooster:** Alleen zichtbare rijen gerenderd. Soepel bij 1000+ chauffeurs.
- **Paginering:** Server-side paginering op planningsrooster en chauffeurspagina.
- **Samengestelde index:** `(scenarioId, date, status)` op planning-entries.

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
