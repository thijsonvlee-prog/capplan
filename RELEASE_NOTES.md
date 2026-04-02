# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Release History

### 2026-04-02 — Visuele verfijning instellingen en capaciteitspagina

#### UX / design verbeteringen

- **Instellingen lijstitems:** StamtabelManager en SkillManager rijen hebben nu subtiele hover-elevatie, afgeronde vormen en vloeiende overgangen. Bewerkmodus is visueel duidelijk onderscheiden met merkkleur-accentrand en achtergrond. Verbetert de premium uitstraling over alle stamtabel- en vaardigheidssecties.
- **Capaciteit vergelijkingsknoppen:** Scenario-vergelijkingsknoppen zijn omgestyled naar pilvormige badges met duidelijke actief/inactief-staten. Actieve staat toont merkkleur-vulling, inactieve staat heeft subtiele rand met hover-feedback.

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
