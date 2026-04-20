# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Release History

### 2026-04-20 — Toegankelijkheid en visuele consistentie

#### Toegankelijkheid

- **Sorteerbare kolomkoppen toetsenbordtoegankelijk (PB-213):** De kolomkoppen "Chauffeur" en extra kolommen in het planningsrooster hebben nu `role="columnheader"`, `aria-sort`, `tabIndex={0}` en `onKeyDown` (Enter/Spatie). Toetsenbordgebruikers kunnen nu sorteren zonder muis. Schermlezers melden de huidige sorteerrichting.

#### UX / design

- **Uitgeschakelde paginaknoppen gecentraliseerd en verbeterd (PB-214):** De `.btn-icon` en `.btn-icon-danger` CSS-klassen bevatten nu een `:disabled` regel (opacity 0.4, cursor not-allowed, pointer-events none). De 16 inline `disabled:opacity-30 disabled:cursor-not-allowed` declaraties in `PlanningGrid.tsx`, `DriverList.tsx`, `MobilePlanningView.tsx` en `AuditLogViewer.tsx` zijn verwijderd. Disabled buttons zijn nu duidelijker zichtbaar dan voorheen (40% vs 30% opacity).

### 2026-04-19 — VALID_AUDIT_ACTIONS gecentraliseerd

#### Onderhoud

- **VALID_AUDIT_ACTIONS gecentraliseerd (PB-216):** De inline `validActions`-array in `src/app/api/audit-log/route.ts` is vervangen door een gedeelde export uit `api-route-utils.ts`. Zelfde centraliseringpatroon als `VALID_PLANNING_STATUSES`, `VALID_EMPLOYMENT_TYPES` en `VALID_ROLES`. Geen gedragswijziging.

### 2026-04-18 — VALID_ROLES gecentraliseerd

#### Onderhoud

- **VALID_ROLES gecentraliseerd (PB-215):** De inline `VALID_ROLES`-array in `src/app/api/users/[id]/route.ts` is vervangen door een gedeelde export uit `api-route-utils.ts`, afgeleid van de `UserRole`-enum via `Object.values()`. Zelfde patroon als `VALID_PLANNING_STATUSES` en `VALID_EMPLOYMENT_TYPES`. Sluit de laatste bekende inline validatieconstante. Geen gedragswijziging.

### 2026-04-16 — Import-logboek queries geparallelliseerd

#### Prestaties

- **Import-logboek queries geparallelliseerd (PB-212):** De GET /api/import-sources/[id]/logs route voerde de bestaanscontrole van de importbron en het ophalen van logregels sequentieel uit. Beide queries draaien nu gelijktijdig via `Promise.all()`. Bespaart één DB-roundtrip per logpagina-weergave op Neon serverless. Zelfde response-shape en foutmeldingen.

### 2026-04-13 — Actief-chip in subtabellen

#### UX / design verbeteringen

- **Actief-chip in subtabellen (PB-210):** De platte groene tekst "Actief" in de Einddatum-kolom van dienstverbanden, functies en roostertoewijzingen is vervangen door een compacte success-toon chip (afgerond, uppercase, bg-success-100/text-success-700). De actieve rij is nu sneller te scannen dankzij zowel de tonale rijhighlight als de chip in dezelfde rij. Geen layout- of gedragswijziging.

### 2026-04-12 — Interne parallellisatie validateForeignKeys

#### Prestaties

- **validateForeignKeys intern geparallelliseerd (PB-211):** De helper die batched FK-referenties controleert voert nu alle count-queries gelijktijdig uit via `Promise.all()` in plaats van sequentieel. Foutgedrag en foutmeldingen zijn ongewijzigd — bij meerdere ongeldige referenties wordt de eerste check-spec in declaratievolgorde gerapporteerd. Sluit de parallellisatietrack af die begon met PB-205/PB-208/PB-209.

### 2026-04-11 — FK-validatie versneld op planning- en chauffeurroutes

#### Prestaties

- **Planning-routes parallelle FK-validatie (PB-208):** `POST /api/planning` en `POST /api/planning/bulk` controleren `scenarioId` en `leaveTypeId` nu gelijktijdig via `Promise.all()` in plaats van sequentieel. Bespaart één DB-roundtrip per planning-actie op Neon serverless. Zelfde gedrag en zelfde foutmeldingen.
- **Batch FK-validatie bij chauffeur aanmaken (PB-209):** `POST /api/drivers` verzamelt nu unieke IDs per FK-veld (werkgevers, locaties, afdelingen, roosterprofielen) via een kleine `collectUnique()`-helper en roept `validateForeignKeys()` één keer per veld aan, in plaats van één `validateOptionalForeignKey()` per genest record. Een chauffeur met tien functie-records levert nu maximaal twee count-queries op in plaats van twintig. Zelfde validatiegedrag; foutmeldingen gebruiken nu de meervoudsvorm ("Eén of meer opgegeven locaties bestaan niet").

### 2026-04-11 — Capaciteitsgrafiek en typografische verfijning

#### UX / design verbeteringen

- **Capaciteitsgrafiek volledig in de huisstijl (PB-206):** De tooltip, asindeling en rasterlijnen van de capaciteitsgrafiek op de capaciteitspagina gebruikten standaard Recharts-styling en staken daardoor visueel af van de KPI-kaarten en de tabel eromheen. De grafiek heeft nu:
  - Een eigen `CapacityChartTooltip` op `surface-primary` met `shadow-dropdown`, `border-border-subtle`, een datum-koptekst in `text-caption` uppercase, en per serie een gekleurde stip + seriesnaam + rechts uitgelijnde tabular-nums waarde.
  - Een eigen `CapacityChartLegend` met kleine afgeronde staaltjes en `text-text-secondary` labels in plaats van de standaard Recharts-balk.
  - Zachte astonen (`#9ca3af` = `--color-text-tertiary`), horizontale rasterlijnen in `#e2e5eb` (= `--color-border-default`) met een dash-patroon, een verborgen Y-aslijn, en een zachte X-basislijn.
  - Een hover-cursor die in plaats van een hard grijs blok oplost in het raster (25% dekking op dezelfde token-kleur).
  - Alle hex-waarden dragen een inline comment met de bijbehorende design-token (per CLAUDE.md Recharts-uitzondering).
- **Manrope uitgebreid naar sectietitels en modaaltitels (PB-207):** De klassen `.text-section-title` en `.settings-section-title` gebruiken nu beide `font-family: var(--font-display)` (Manrope) op `0.9375rem / 600` met `letter-spacing: -0.01em`. Eerder stonden sectietitels nog in Inter op `0.8125rem`, waardoor ze visueel te dicht bij de labels en ondertitels zaten. Modaaltitels (ConfirmDialog, ScenarioSelector, RosterAssigner, het bulk-statusmodaal van het planningsrooster), instellingensecties en de sectie-koppen op de capaciteitspagina, het chauffeursscherm en elders delen nu één Manrope-gebaseerde sectietitel-ritme. Hierdoor zijn de drie typografische tiers — paginatitel → sectietitel → label — duidelijker van elkaar te onderscheiden, conform DESIGN.md §5.2. Geen gedragswijziging, alleen typografie.

### 2026-04-10 — Validatie en prestatieverbetering sub-records

#### Betrouwbaarheid

- **weeklyHours bereikvalidatie (PB-204):** Roostertoewijzing POST en PUT routes weigeren nu waarden kleiner dan 0 of groter dan 168 met een duidelijke 400-fout en Nederlandse foutmelding. Dit was het laatste ongevalideerde numerieke veld in sub-record routes.

#### Prestaties

- **Sub-record aanmaak versneld (PB-205):** `autoCloseOpenRecords` en `getNextSequenceNumber` draaien nu parallel (`Promise.all`) in de transacties van dienstverband-, functie- en roostertoewijzingsroutes. Bespaart één DB-roundtrip (~50-100ms) per sub-record aanmaak op Neon serverless. Zelfde transactiegedrag; de twee operaties werken op onafhankelijke velden.

### 2026-04-10 — Toegankelijkheid en tabbalk-consistentie

#### UX / design verbeteringen

- **DayCell toegankelijkheid (PB-202):** Alle dagcellen in het planningsrooster hebben nu een `aria-label` met chauffeurnaam, datum en huidige status. Schermlezer-gebruikers krijgen hiermee zinvolle context bij elke interactieve cel. Daarnaast produceren nu alle vijf planningsstatussen een hover-tooltip — voorheen hadden 'Roostervrij' en 'Aanvullend beschikbaar' geen tooltip.
- **Tabbalk-systeem geünificeerd (PB-203):** De handmatige inline-stijlen voor de tabbalk in het chauffeurformulier zijn vervangen door het gedeelde CSS-systeem (`.tab-bar` / `.tab-item`). De actieve tabkleur is nu consistent (brand-700) over zowel de instellingen- als de chauffeurtabs. De CSS-klassen zijn hernoemd van `settings-tabs` naar generieke namen zodat ze herbruikbaar zijn in alle contexten.

### 2026-04-09 — UX-verfijningen en validatie-consolidatie

#### UX / design verbeteringen

- **StatusSelector bevestigknop (PB-198):** De 'Bevestigen'-knop bij het instellen van een ziektepercentage gebruikte een rode (danger) achtergrond, wat ten onrechte een destructieve actie suggereerde. De knop toont nu de standaard merkkleur, consistent met alle andere bevestigacties in de applicatie.
- **SubTable lege-staat verbeterd (PB-199):** Lege subtabellen (dienstverbanden, functies, roostertoewijzingen) tonen nu een actiegerichte boodschap met een hint om 'Toevoegen' te gebruiken, in plaats van een kale melding zonder context. Het woord 'records' is verwijderd uit de standaardtekst.
- **SubTable rijafwisseling (PB-199):** De afwisselende rijkleuring in subtabellen gebruikt nu een solide oppervlaktekleur in plaats van een halftransparante waarde, wat zorgt voor een schonere tonale laag consistent met de rest van de applicatie.

#### Onderhoud

- **Enum-validatie en notitieslimiet gecentraliseerd (PB-200):** De gedupliceerde `VALID_STATUSES`, `validEmploymentTypes` en `MAX_NOTES_LENGTH` constanten in planning- en dienstverbandroutes zijn vervangen door gedeelde exports `VALID_PLANNING_STATUSES`, `VALID_EMPLOYMENT_TYPES` en `MAX_NOTES_LENGTH` in `api-route-utils.ts`. Eén plek om aan te passen bij enum-wijzigingen; geen gedragswijziging.
- **Eigendomscontrole sub-records gecentraliseerd (PB-201):** De 6 herhaalde `findFirst({ id, driverId })`-checks in dienstverband-, functie- en roostertoewijzingsroutes (PUT + DELETE) zijn vervangen door de nieuwe helper `verifyRecordOwnership` in `api-route-utils.ts`. Dezelfde 404-foutmelding; geen gedragswijziging.

### 2026-04-08 — Header-titel dubbel opgelost en validatie-consolidatie

#### UX / design verbeteringen

- **Geen dubbele paginatitel meer op desktop (EX-REC-057):** Op de schermen Capaciteit, Chauffeurs en Instellingen werd de Manrope-paginatitel tweemaal getoond — één keer in de bovenbalk (via `Header.tsx`) en één keer in de samengestelde paginakop eronder. De bovenbalk onderdrukt zijn titel nu op deze drie routes, zodat de paginakop met contextbadges (actief scenario, aantal chauffeurs, etc.) de enige titelanker blijft. Op mobiel en op de schermen Planning en Releasenotes is het gedrag ongewijzigd; die vertrouwen nog steeds op de bovenbalk omdat zij geen eigen samengestelde paginakop hebben.

#### Onderhoud

- **Lengte-validatie gecentraliseerd (PB-196):** ~28 gedupliceerde inline lengtechecks in schrijfroutes (drivers, scenarios, import-sources, user-groups, roster-profiles, settings, skills, sub-records, planning notes) zijn vervangen door de nieuwe helpers `validateMaxLength` en `validateMaxLengths` in `api-route-utils.ts`. Dezelfde Nederlandse foutmeldingen en 400-statuscodes; geen gedragswijziging voor geldige invoer.
- **Datumbereik-validatie gecentraliseerd (PB-197):** 6 identieke "einddatum vóór startdatum" checks in dienstverband-, functie- en roostertoewijzingsroutes (POST + PUT) zijn vervangen door de nieuwe helper `validateDateRange` in `api-route-utils.ts`. Vergelijking gebeurt lexicografisch op het al gevalideerde `JJJJ-MM-DD` formaat, wat goedkoper is dan `new Date()` allocaties.
- **Ontbrekende lengte-caps gesloten:** `POST /api/scenarios/[id]/duplicate` dwingt nu dezelfde 200-tekens limiet af als de hoofdroute (DE-REC-073), en `PUT /api/preferences` begrenst het `value`-veld op 500 tekens (DE-REC-058). Beide waren eerder de enige schrijfroutes zonder cap.

### 2026-04-07 — Releasenotes single source-of-truth

#### Onderhoud

- **Releasenotes structureel gesynchroniseerd (PB-195):** Release-data is verplaatst naar een typed module `src/domain/releases.ts`. De in-app releasenotes-pagina (`documentatie/page.tsx`) importeert nu direct uit deze module; de hardcoded array is verwijderd. `RELEASE_NOTES.md` blijft een menselijk leesbare mirror. De CLAUDE.md sync-regel is bijgewerkt om de module als bron van waarheid te benoemen. Elimineert de terugkerende drift tussen markdown en in-app pagina structureel.

### 2026-04-06 — Validatieverbeteringen op planning- en scenario-endpoints

#### Validatie

- **Type-controle ziektepercentage:** `POST /api/planning/bulk` weigert nu non-numerieke waarden voor `sickPercentage` met een 400-fout in plaats van een onduidelijke 500. Completeert de validatiedekking op het enige numerieke veld zonder typecontrole (PB-192).
- **Bestaanscontrole actief scenario:** `PUT /api/scenarios/active` controleert nu of het opgegeven scenario bestaat voordat het als voorkeur wordt opgeslagen. Niet-bestaande IDs retourneren 404 met Nederlandse foutmelding; `"default"` blijft toegestaan zonder check (PB-193).

### 2026-04-06 — Releasenotes sync-proces en drift-fix

#### Onderhoud

- **Verplichte sync-regel in CLAUDE.md:** Elke agent die `RELEASE_NOTES.md` aanvult moet in dezelfde commit ook de in-app releasenotes-pagina (`src/app/(dashboard)/documentatie/page.tsx`) bijwerken. Hiermee wordt voorkomen dat de in-app releasenotes achterlopen op het hoofdlogbestand (PB-194).
- **Drift hersteld:** De ontbrekende entry van 5 april 2026 is toegevoegd aan de in-app releasenotes-pagina.

### 2026-04-05 — Auth-enforcement compleet, releasenotes bijgewerkt

#### Beveiliging

- **Auth-checks op settings endpoints:** `GET /api/settings/[type]` en `GET /api/settings/skills` vereisen nu minimaal de VIEWER-rol. Hiermee is auth-enforcement op 100% van alle GET-endpoints bereikt. Geen gedragswijziging in omgevingen zonder authenticatie.

#### UX / design verbeteringen

- **Releasenotes-pagina gesynchroniseerd:** De ontbrekende entries van 2, 3 en 4 april 2026 zijn toegevoegd aan de releasenotes-pagina. Gebruikers zien nu alle recente wijzigingen.

### 2026-04-04 — Bugfix, beveiliging, validatie, prestaties en audittrail

#### Bugfixes

- **Scenario-voorkeur opschoning:** Bij het verwijderen van een scenario worden nu de actieve scenario-voorkeuren van alle gebruikers opgeruimd, niet alleen van de standaardgebruiker. Voorheen bleven voorkeuren staan bij ingelogde gebruikers, wat leidde tot een leeg planningsscherm na het verwijderen van het actieve scenario.

#### Beveiliging

- **Auth-checks op GET endpoints:** Scenario's, roosterprofielen, en chauffeur sub-records (dienstverbanden, functies, roostertoewijzingen) GET-endpoints vereisen nu minimaal de VIEWER-rol. Geen gedragswijziging in omgevingen zonder authenticatie.

#### Betrouwbaarheid

- **Datumvalidatie op sub-records:** Dienstverband, functie en roostertoewijzing POST/PUT-routes valideren nu het datumformaat (JJJJ-MM-DD) vóór de startdatum/einddatum-vergelijking. Ongeldige datums retourneren een duidelijke 400-fout in plaats van een onduidelijke 500.
- **Scenario-ID validatie:** Plannings POST en bulk-routes valideren nu of het opgegeven scenario-ID bestaat. Verwijderde of ongeldige scenario-ID's retourneren een duidelijke 400-fout.

#### Prestaties

- **Sessie-hergebruik op planning routes:** Planning POST, bulk en DELETE routes doen nu maximaal één sessie-lookup per request in plaats van twee. Bespaart ~50-100ms per geauthenticeerd verzoek op Neon serverless.

#### Onderhoud

- **Audittrail voor sub-records compleet:** Alle mutaties op dienstverbanden, functies en roostertoewijzingen (aanmaken, bijwerken, verwijderen) worden nu vastgelegd in de auditlog. Volgt het bestaande fire-and-forget patroon.

### 2026-04-03 — Capaciteitstabel visuele verbetering en code-onderhoud

#### UX / design verbeteringen

- **Capaciteitstabel tonale lagen:** De capaciteitstabel op de capaciteitspagina gebruikt nu tonale oppervlaktecontrasten in plaats van 1px randen en afwisselende rijtinten. Header- en samenvattingsrijen (Beschikbaar, Totaal ingepland) onderscheiden zich door oppervlaktekleur (surface-tertiary en surface-inset). Datarijen zijn borderless met subtiele hover-feedback. De tabel sluit nu visueel aan bij de KPI-kaarten en grafiek erboven.

#### Onderhoud

- **Date-parsing geconsolideerd:** Gedupliceerde date-parsing en validatielogica uit drie planning API-routes geëxtraheerd naar een gedeelde `parseDateList()` functie in `api-route-utils.ts`. Eén centraal punt voor het splitsen, lege-check, maximale-lengte controle en datumformaatvalidatie van komma-gescheiden datumlijsten. Elimineert ~30 regels duplicatie.

### 2026-04-02 — Visuele verfijning, instellingen en code-opruiming

#### UX / design verbeteringen

- **Instellingen lijstitems:** StamtabelManager en SkillManager rijen hebben nu subtiele hover-elevatie, afgeronde vormen en vloeiende overgangen. Bewerkmodus is visueel duidelijk onderscheiden met merkkleur-accentrand en achtergrond. Verbetert de premium uitstraling over alle stamtabel- en vaardigheidssecties.
- **Capaciteit vergelijkingsknoppen:** Scenario-vergelijkingsknoppen zijn omgestyled naar pilvormige badges met duidelijke actief/inactief-staten. Actieve staat toont merkkleur-vulling, inactieve staat heeft subtiele rand met hover-feedback.

#### Onderhoud

- **COMPARE_COLORS gecentraliseerd:** Vergelijkingskleuren voor de capaciteitsgrafiek verplaatst van een inline-definitie in de component naar `src/domain/constants.ts`. Hex-waarden zijn voorzien van commentaar met design token equivalenten. Verbetert render-stabiliteit en centraliseert kleurenbeheer.
- **Ongebruikte types verwijderd:** `PlanningEntryOptions` en `UserContext` verwijderd uit `domain/types.ts`. Beide types werden nergens geïmporteerd.
- **Ongebruikte mobiele CSS opgeruimd:** `.mobile-nav-overlay`, `.mobile-nav-panel` en bijbehorende keyframe-animaties verwijderd uit `globals.css`. Deze waren overbodig na de mobiele navigatie-herziening.

### 2026-04-01 — Mobiele navigatie hersteld

#### Bugfixes

- **Mobiele navigatie werkt weer:** Tappen op de Planning-kaart op het mobiele startscherm en tappen op secties in Instellingen navigeert nu betrouwbaar. Voorheen flikkerde het scherm zonder te navigeren. Oorzaak was een React state-bug in de mobiele titelhook.

### 2026-04-01 — Mobiele chauffeurspagina opfrisbeurt

#### UX / design verbeteringen

- **Mobiele chauffeurspagina:** De mobiele chauffeurlijst heeft nu dezelfde ingangsanimatie (fade + slide-up) als de overige mobiele schermen. Kaartspacing is vergroot voor consistentie met de instellingen- en planningsweergaven.

### 2026-04-01 — Mobiele app-ervaring compleet

#### UX / design verbeteringen

- **Mobiele planning navigatie:** De planningsweergave op mobiel is nu volledig geïntegreerd met het startscherm. De header toont "Planning" met een terugpijl wanneer de planning actief is. De losse home-knop in de chauffeurlijst is verwijderd ten gunste van de consistente header-navigatie.
- **Mobiele capaciteitsweergave:** De capaciteitspagina is geoptimaliseerd voor mobiel. Filters en periodebesturing worden gestapeld weergegeven. De grafiekhoogte past zich aan het schermformaat aan. KPI-kaarten tonen in een 2-koloms raster.
- **Mobiele instellingenweergave:** Op mobiel worden de 7 instellingentabs vervangen door een kaartgebaseerde sectielijst. Elke sectie toont een icoon, titel, beschrijving en telling. Tik op een sectie om de inhoud te openen met terugnavigatie via de header.
- **Mobiele transities en touch-kwaliteit:** Alle mobiele schermwisselingen hebben nu een subtiele ingangsanimatie (fade + slide-up). Alle interactieve elementen voldoen aan de 44px minimale touch-target richtlijn. Consistente spacing en interactiekwaliteit over alle mobiele schermen.

### 2026-04-01 — Mobiel startscherm, releasenotes en navigatie-overhaul

#### UX / design verbeteringen

- **Mobiel startscherm:** Op mobiel opent de app nu met een kaartgebaseerd startscherm. Een hero-kaart voor Planning (met merkkleurgradient) en vier sectiekaarten (Capaciteit, Chauffeurs, Instellingen, Releasenotes) in een 2-koloms raster. Tikken op een kaart navigeert naar de betreffende sectie.
- **Terugknop op mobiel:** Alle mobiele subpagina's tonen een terugpijl in de header om terug te keren naar het startscherm. De planning-chauffeurlijst heeft een eigen home-knop. Het hamburger-menu en de slide-over sidebar op mobiel zijn volledig verwijderd.
- **Releasenotes-pagina:** De documentatiepagina is vervangen door een chronologisch overzicht van alle releasenotes. Inklapbare secties per dag met categoriebadges (UX, Functioneel, Beveiliging, etc.). Sidebar-label gewijzigd van "Documentatie" naar "Releasenotes".
- **Maandkalender op mobiel:** De mobiele planningsweergave is volledig herschreven naar een maandkalender. Zeven kolommen (ma-zo) met weeknummers per rij. Maandnavigatie met vorige/volgende en "Vandaag"-knop. Statuskleurdots per dag. Tik op een dag voor details (status, verloftype, ziektepercentage, notities). Vandaag gemarkeerd met blauwe cirkel. Dagen buiten de huidige maand worden gedimd getoond. Vervangt de eerdere dag-/weekweergave.
- **Zoekicoon-uitlijning:** Het vergrootglas in zoekbalken (chauffeurlijst en mobiele planning) is iets naar rechts verschoven voor betere visuele uitlijning met de invoertekst.

#### Bugfixes

- **Mobiele sidebar opent nu betrouwbaar:** De sidebar sloot zichzelf direct na het openen doordat een useEffect op de initiële mount werd getriggerd (z-index conflict + mount-bug). Opgelost met een z-index correctie op de header en een mount-guard die de eerste useEffect-uitvoering overslaat. Navigatie via het hamburger-menu werkt nu betrouwbaar op mobiel.

#### Onderhoud

- **resolveUserId geconsolideerd:** Gedupliceerde functie geëxtraheerd naar `api-route-utils.ts`. Voorkeuren- en actief-scenario-routes importeren nu van dezelfde module.
- **validateApiFields geconsolideerd:** Gedupliceerde functie en 4 validatieconstanten verplaatst naar `api-import-helpers.ts`. ~85 regels duplicatie geëlimineerd.

### 2026-03-31 — API-connecties, audittrail, beveiliging en mobiele navigatie

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

- **Importbron endpoints beveiligd:** Ophalen van importbronnen (lijst en individueel, inclusief API-credentials) vereist nu de ADMIN-rol.
- **Afdelingsfilter op planning-routes:** DELETE-route past nu dezelfde afdelingscontrole toe als POST-routes. Planners kunnen geen items verwijderen buiten hun scope.
- **Afdelingsfilter op planning-schrijfroutes:** Planners met beperkte toegang kunnen geen planningsitems aanmaken buiten hun afdelingen.

#### Betrouwbaarheid

- **Invoervalidatie compleet:** Alle POST/PUT-endpoints hebben lengtebegrenzingen, enum-validatie en referentievalidatie.
- **Audit log opschoning:** Automatische verwijdering van audit-entries ouder dan 90 dagen.

#### Prestaties

- **Snellere sub-record aanmaak:** Overbodige database-query verwijderd. Bespaart ~3 roundtrips per wijziging op Neon serverless.

#### Onderhoud

- **API-import helpers geconsolideerd:** Gedeelde functies geëxtraheerd naar `api-import-helpers.ts`. Elimineert ~80 regels duplicatie.

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
