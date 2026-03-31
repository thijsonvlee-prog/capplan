# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Release History

### 2026-03-31 — Invoervalidatie dienstverband, tekstvelden en competenties

#### Betrouwbaarheid

- **Dienstverband type-validatie:** POST en PUT op dienstverbandrecords valideren nu het type (FULLTIME, PARTTIME, ONCALL, TEMPORARY, CHARTER) tegen het domein-enum. Ongeldige waarden worden afgewezen met een foutmelding die de geldige opties toont.
- **Tekstveldlimieten uitgebreid:** Omschrijvingsvelden op stamtabellen (werkgevers, afdelingen, locaties, verloftypes) zijn begrensd op 500 tekens. Functie- en leidinggevendevelden zijn begrensd op 200 tekens. Competentienamen zijn begrensd op 200 tekens. Code-veldlimiet (100 tekens) nu ook op PUT-routes.
- **Dubbele competentienamen voorkomen:** Het aanmaken of hernoemen van een competentie naar een bestaande naam (hoofdletterongevoelig) wordt nu afgewezen met een foutmelding die de bestaande naam toont.

### 2026-03-31 — Autorisatie planning-schrijfroutes, foutmeldingen en invoervalidatie

#### Beveiliging

- **Afdelingsfilter op planning-schrijfroutes:** `POST /api/planning` en `POST /api/planning/bulk` controleren nu of de chauffeur binnen het afdelingsbereik van de ingelogde gebruiker valt. Planners met beperkte gebruikersgroep-toegang kunnen niet langer planningsitems aanmaken voor chauffeurs buiten hun afdelingen.

#### Functionele verbeteringen

- **Specifieke foutmeldingen zichtbaar:** Foutmeldingen van de server worden nu in toastmeldingen getoond in plaats van generieke "Er ging iets mis" berichten. Alle 29 API-routes leveren al Nederlandstalige foutmeldingen — deze zijn nu zichtbaar voor gebruikers.

#### Betrouwbaarheid

- **Notitieveld begrensd:** Planningsnotities zijn begrensd op maximaal 500 tekens per item. Voorheen was er geen limiet, waardoor bij bulkbewerkingen met 366 datums zeer grote hoeveelheden tekst opgeslagen konden worden.

### 2026-03-31 — Invoervalidatie planning-endpoint

#### Betrouwbaarheid

- **Datumslimiet op planning-endpoint:** `GET /api/planning` beperkt het aantal datums per verzoek nu tot maximaal 366, in lijn met de capaciteits- en bulkendpoints. Voorheen was dit onbeperkt.

### 2026-03-31 — Per-gebruiker scenario, foutmeldingen en opschoning

#### Functionele verbeteringen

- **Actief scenario per gebruiker:** Het actieve scenario wordt nu per ingelogde gebruiker opgeslagen. Gebruikers beïnvloeden elkaars scenariokeuze niet meer. Bij ontwikkelomgevingen zonder authenticatie wordt teruggevallen op een standaardwaarde.
- **Foutmeldingen bij laden chauffeurs:** De chauffeurspagina toont nu een duidelijke foutmelding wanneer het ophalen van gegevens mislukt, in plaats van een leeg scherm.
- **Foutmeldingen op alle pagina's:** Alle instellingenpagina's (stamgegevens, competenties, roosters, connectiviteit, gebruikers, gebruikersgroepen) tonen nu een foutmelding wanneer het ophalen van gegevens mislukt. Voorheen werd alleen een leeg scherm getoond.

#### Technische verbeteringen

- **Foutstatus in data-hooks:** `useApiDataWithLoading` geeft nu een `error`-veld terug (tekst of null). Bestaande componenten blijven ongewijzigd werken. Nieuwe componenten kunnen foutmeldingen tonen.
- **POC capaciteitssamenvatting verwijderd:** De experimentele capaciteitssamenvatting in het planningsrooster is verwijderd (ESC-009 beslissing). De capaciteitspagina dekt deze functionaliteit. Het planningsrooster is hierdoor eenvoudiger en beter onderhoudbaar.

### 2026-03-31 — Planningsrooster visuele verbetering en bugfix

#### UX / design verbeteringen

- **Planningsrooster werkbalk herstructurering:** Werkbalk samengevoegd van twee losse rijen naar één samengestelde balk met vier duidelijke zones: Periode, Filter, Weergave en Status. Zones gescheiden door verticale dividers voor snellere visuele oriëntatie.
- **Tonale rijscheiding in planningsrooster:** 1px-randen tussen datarijen vervangen door afwisselende achtergrondtinten (wit/lichtgrijs). Rij-hover toont zachte merkkleur. Koprij-rand versoepeld. Planningsrooster oogt nu als productoppervlak in plaats van spreadsheet.
- **Scenariokiezer verplaatst:** Scenariokiezer verplaatst van de "Weergave"-zone naar de "Periode"-zone in de planningswerkbalk. Scenario is een datacontext, geen weergave-instelling.
- **Chauffeurspagina visuele verbetering:** Tabel ingepakt in samengesteld dataoppervlak met geïntegreerde zoekbalk. 1px-rijranden vervangen door tonale rijafwisseling (overeenkomstig planningsrooster). Rij-hover toont zachte merkkleur voor duidelijke rij-identificatie.
- **Capaciteitspagina visuele verbetering:** KPI-samenvattingsmodule toegevoegd boven de grafiek met vijf kernmetrieken: gemiddeld beschikbaar, gemiddeld totaal, gemiddeld verlof, gemiddeld ziek en bezettingsgraad. Werkbalk geïntegreerd in paginakop met control-group-patroon. Grafiek en tabel voorzien van sectiekoppen. Buitenranden verwijderd conform het No-Line-principe.

#### Bugfix

- **Rijstreeppatroon bij groepering hersteld:** Bij gebruik van groepering (bijv. op afdeling) startte het even/oneven streeppatroon opnieuw bij elke groep, wat visuele inconsistentie veroorzaakte. Nu loopt het streeppatroon continu door over alle groepen.

#### Technische verbeteringen

- **Typecorrectie PlanningEntry:** `scenarioId` veld toegevoegd aan het `PlanningEntry` domeintype. Sluit de typekloof tussen API-transformatie en optimistische updates in het planningsrooster.
- **Verbeterde foutafhandeling bij verwijderen:** Verwijderverzoeken voor niet-bestaande chauffeurs, planningsitems en scenario's geven nu een 404 "niet gevonden"-foutmelding in plaats van een generieke 500-fout.
- **Foutafhandeling verwijderen uitgebreid:** Alle overige verwijderroutes (roosterprofielen, instellingen, competenties, gebruikersgroepen) geven nu ook een 404 bij niet-bestaande records. Alle DELETE-endpoints zijn nu consistent. Ook toegevoegd op PUT-routes voor instellingen en competenties.
- **Bugfix gebruikersgroepen zonder afdelingen:** Gebruikers in een groep zonder gekoppelde afdelingen zagen een leeg scherm zonder foutmelding. Nu wordt teruggevallen op onbeperkte toegang bij een lege afdelingsconfiguratie.
- **Beveiligingsverbetering importlogboek:** Het endpoint voor importlogboeken (`/api/import-sources/[id]/logs`) vereist nu de ADMIN-rol, in lijn met alle andere import-endpoints.

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
