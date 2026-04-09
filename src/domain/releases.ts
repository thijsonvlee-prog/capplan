/**
 * Single source of truth for release notes shown on the in-app documentatie page.
 *
 * This module is the authoritative source for release data. `RELEASE_NOTES.md`
 * is maintained as a human-readable mirror and must be kept in sync when
 * entries are added here. See CLAUDE.md section 11 for the sync rule.
 *
 * Add new releases at the TOP of the array (reverse chronological).
 */

export interface ReleaseGroup {
  heading: string;
  items: string[];
}

export interface Release {
  date: string;
  title: string;
  groups: ReleaseGroup[];
}

export const RELEASES: Release[] = [
  {
    date: "9 april 2026",
    title: "UX-verfijningen en validatie-consolidatie",
    groups: [
      {
        heading: "UX / design",
        items: [
          "StatusSelector bevestigknop: de 'Bevestigen'-knop bij het instellen van een ziektepercentage gebruikte een rode (danger) achtergrond, wat ten onrechte een destructieve actie suggereerde. De knop toont nu de standaard merkkleur, consistent met alle andere bevestigacties in de applicatie (PB-198).",
          "SubTable lege-staat verbeterd: lege subtabellen (dienstverbanden, functies, roostertoewijzingen) tonen nu een actiegerichte boodschap met een hint om 'Toevoegen' te gebruiken, in plaats van een kale melding zonder context. Het woord 'records' is verwijderd uit de standaardtekst (PB-199).",
          "SubTable rijafwisseling: de afwisselende rijkleuring in subtabellen gebruikt nu een solide oppervlaktekleur in plaats van een halftransparante waarde, wat zorgt voor een schonere tonale laag consistent met de rest van de applicatie (PB-199).",
        ],
      },
      {
        heading: "Onderhoud",
        items: [
          "Enum-validatie en notitieslimiet gecentraliseerd: de gedupliceerde VALID_STATUSES, validEmploymentTypes en MAX_NOTES_LENGTH constanten in planning- en dienstverbandroutes zijn vervangen door gedeelde exports in api-route-utils. Eén plek om aan te passen bij enum-wijzigingen; geen gedragswijziging (PB-200).",
          "Eigendomscontrole sub-records gecentraliseerd: de 6 herhaalde findFirst-checks in dienstverband-, functie- en roostertoewijzingsroutes (PUT + DELETE) zijn vervangen door de nieuwe helper verifyRecordOwnership. Dezelfde 404-foutmelding; geen gedragswijziging (PB-201).",
        ],
      },
    ],
  },
  {
    date: "8 april 2026",
    title: "Header-titel dubbel opgelost en validatie-consolidatie",
    groups: [
      {
        heading: "UX / design",
        items: [
          "Geen dubbele paginatitel meer op desktop: op de schermen Capaciteit, Chauffeurs en Instellingen werd de Manrope-paginatitel tweemaal getoond (één keer in de bovenbalk en één keer in de paginakop eronder). De bovenbalk onderdrukt zijn titel nu op deze drie routes, waardoor de samengestelde paginakop met contextbadges de enige titelanker blijft. Op mobiel en op Planning/Releasenotes is het gedrag ongewijzigd.",
        ],
      },
      {
        heading: "Onderhoud",
        items: [
          "Lengte-validatie gecentraliseerd: ~28 gedupliceerde inline lengtechecks in schrijfroutes zijn vervangen door de nieuwe helpers validateMaxLength en validateMaxLengths in api-route-utils (PB-196). Dezelfde Nederlandse foutmeldingen en 400-statuscodes; geen gedragswijziging voor geldige invoer.",
          "Datumbereik-validatie gecentraliseerd: 6 identieke einddatum-vóór-startdatum checks in dienstverband-, functie- en roostertoewijzingsroutes zijn vervangen door de nieuwe helper validateDateRange (PB-197). Vergelijking gebeurt lexicografisch op het al gevalideerde JJJJ-MM-DD formaat.",
          "Ontbrekende lengte-caps gesloten: POST /api/scenarios/[id]/duplicate dwingt nu dezelfde 200-tekens limiet af als de hoofdroute, en PUT /api/preferences begrenst het value-veld op 500 tekens.",
        ],
      },
    ],
  },
  {
    date: "7 april 2026",
    title: "Releasenotes single source-of-truth",
    groups: [
      {
        heading: "Onderhoud",
        items: [
          "Releasenotes worden nu geladen uit één typed module (src/domain/releases.ts). De in-app releasenotes-pagina rendert direct uit deze module. RELEASE_NOTES.md blijft als menselijk leesbare mirror; de CLAUDE.md sync-regel verwijst nu naar de module als bron van waarheid.",
        ],
      },
    ],
  },
  {
    date: "6 april 2026",
    title: "Validatieverbeteringen op planning- en scenario-endpoints",
    groups: [
      {
        heading: "Validatie",
        items: [
          "Type-controle ziektepercentage: POST /api/planning/bulk weigert nu non-numerieke waarden voor sickPercentage met een 400-fout in plaats van een onduidelijke 500.",
          "Bestaanscontrole actief scenario: PUT /api/scenarios/active controleert nu of het opgegeven scenario bestaat voordat het als voorkeur wordt opgeslagen. Niet-bestaande IDs retourneren 404.",
        ],
      },
    ],
  },
  {
    date: "6 april 2026",
    title: "Releasenotes sync-proces en drift-fix",
    groups: [
      {
        heading: "Onderhoud",
        items: [
          "Verplichte sync-regel toegevoegd aan CLAUDE.md: elke agent die RELEASE_NOTES.md bijwerkt moet in dezelfde commit ook deze in-app releasenotes-pagina bijwerken.",
          "Drift hersteld: de ontbrekende entry van 5 april 2026 is toegevoegd aan de in-app releasenotes.",
        ],
      },
    ],
  },
  {
    date: "5 april 2026",
    title: "Auth-enforcement compleet, releasenotes bijgewerkt",
    groups: [
      {
        heading: "Beveiliging",
        items: [
          "Auth-checks op settings GET endpoints: GET /api/settings/[type] en GET /api/settings/skills vereisen nu minimaal de VIEWER-rol. Auth-enforcement is nu 100% dekking op GET-endpoints.",
        ],
      },
      {
        heading: "UX / design",
        items: [
          "Releasenotes-pagina gesynchroniseerd: de ontbrekende entries van 2, 3 en 4 april 2026 zijn toegevoegd aan de in-app releasenotes.",
        ],
      },
    ],
  },
  {
    date: "4 april 2026",
    title: "Bugfix, beveiliging, validatie, prestaties en audittrail",
    groups: [
      {
        heading: "Bugfixes",
        items: [
          "Scenario-voorkeur opschoning: bij het verwijderen van een scenario worden nu de actieve scenario-voorkeuren van alle gebruikers opgeruimd, niet alleen van de standaardgebruiker.",
        ],
      },
      {
        heading: "Beveiliging",
        items: [
          "Auth-checks op GET endpoints: scenario\u2019s, roosterprofielen en chauffeur sub-records vereisen nu minimaal de VIEWER-rol.",
        ],
      },
      {
        heading: "Functioneel",
        items: [
          "Datumvalidatie op sub-records: ongeldige datums retourneren een duidelijke 400-fout in plaats van een onduidelijke 500.",
          "Scenario-ID validatie: verwijderde of ongeldige scenario-ID\u2019s retourneren een duidelijke 400-fout bij het aanmaken van planningsitems.",
        ],
      },
      {
        heading: "Prestaties",
        items: [
          "Sessie-hergebruik op planning routes: maximaal \u00e9\u00e9n sessie-lookup per request. Bespaart ~50-100ms per geauthenticeerd verzoek.",
        ],
      },
      {
        heading: "Onderhoud",
        items: [
          "Audittrail voor sub-records compleet: alle mutaties op dienstverbanden, functies en roostertoewijzingen worden nu vastgelegd.",
        ],
      },
    ],
  },
  {
    date: "3 april 2026",
    title: "Capaciteitstabel visuele verbetering en code-onderhoud",
    groups: [
      {
        heading: "UX / design",
        items: [
          "Capaciteitstabel tonale lagen: de tabel gebruikt nu oppervlaktecontrasten in plaats van 1px randen. Header- en samenvattingsrijen onderscheiden zich door oppervlaktekleur. Datarijen zijn borderless met subtiele hover-feedback.",
        ],
      },
      {
        heading: "Onderhoud",
        items: [
          "Date-parsing geconsolideerd: gedupliceerde logica uit drie planning API-routes ge\u00ebtraheerd naar een gedeelde functie. Elimineert ~30 regels duplicatie.",
        ],
      },
    ],
  },
  {
    date: "2 april 2026",
    title: "Visuele verfijning, instellingen en code-opruiming",
    groups: [
      {
        heading: "UX / design",
        items: [
          "Instellingen lijstitems: StamtabelManager en SkillManager rijen hebben nu subtiele hover-elevatie, afgeronde vormen en vloeiende overgangen. Bewerkmodus met merkkleur-accentrand.",
          "Capaciteit vergelijkingsknoppen: omgestyled naar pilvormige badges met duidelijke actief/inactief-staten.",
        ],
      },
      {
        heading: "Onderhoud",
        items: [
          "COMPARE_COLORS gecentraliseerd naar constants.ts.",
          "Ongebruikte types en mobiele CSS opgeruimd.",
        ],
      },
    ],
  },
  {
    date: "1 april 2026",
    title: "Mobiel startscherm, navigatie en releasenotes",
    groups: [
      {
        heading: "UX / design",
        items: [
          "Mobiel startscherm met kaartnavigatie naar alle secties. Planningkaart als hero met merkkleurgradient, overige secties in 2-koloms raster.",
          "Terugknop op alle mobiele subpagina\u2019s om terug te keren naar het startscherm. Hamburger-menu en sidebar-slideout op mobiel verwijderd.",
          "Documentatiepagina vervangen door een chronologisch releasenotes-overzicht met inklapbare secties per dag.",
          "Maandkalender op mobiel: maandnavigatie met vorige/volgende, weeknummers, statuskleurdots per dag, dagdetailpaneel met status en notities. Vandaag gemarkeerd met blauwe cirkel.",
          "Zoekicoon-uitlijning in zoekbalken verbeterd.",
        ],
      },
      {
        heading: "Bugfixes",
        items: [
          "Mobiele sidebar opende niet betrouwbaar: z-index conflict en useEffect mount-bug opgelost met mount-guard.",
        ],
      },
      {
        heading: "Onderhoud",
        items: [
          "resolveUserId en validateApiFields geconsolideerd naar gedeelde modules.",
        ],
      },
    ],
  },
  {
    date: "31 maart 2026",
    title: "API-connecties, audittrail, beveiliging en mobiele navigatie",
    groups: [
      {
        heading: "UX / design",
        items: [
          "API-bron configuratie: brontype-kiezer (CSV/API), URL, HTTP-methode, headers, authenticatietype met credential-velden.",
          "Verbinding testen met inline succes/fout-feedback.",
          "Response-structuur ontdekking na verbindingstest met interactieve padkeuze en autocomplete.",
          "Auditlog viewer in instellingen met filters, expandeerbare rijen en paginering.",
          "Planningsrooster werkbalk herstructurering naar vier zones: Periode, Filter, Weergave, Status.",
          "Capaciteitspagina KPI-samenvattingsmodule met vijf kernmetrieken.",
          "Chauffeurspagina: ge\u00efntegreerde zoekbalk en tonale rijafwisseling.",
          "Mobiele navigatie met hamburger-menu en slide-over sidebar.",
          "Mobiele chauffeurlijst met kaartweergave, zoekbalk en vereenvoudigde paginering.",
        ],
      },
      {
        heading: "Functioneel",
        items: [
          "API-bron uitvoering: server-side HTTP-request met authenticatie, JSON-veldmappings en automatische data-array detectie.",
          "Volledige audittrail op alle mutaties (planning-entries uitgezonderd).",
          "Per-gebruiker actief scenario.",
          "Server-foutmeldingen zichtbaar in toastmeldingen.",
        ],
      },
      {
        heading: "Beveiliging",
        items: [
          "Importbron endpoints beveiligd (ADMIN-rol vereist).",
          "Afdelingsfilter op planning DELETE- en schrijfroutes.",
        ],
      },
      {
        heading: "Prestaties",
        items: [
          "Snellere sub-record aanmaak: ~3 roundtrips bespaard per wijziging.",
        ],
      },
    ],
  },
  {
    date: "30 maart 2026",
    title: "Gebruikersgroepen autorisatie compleet",
    groups: [
      {
        heading: "Beveiliging",
        items: [
          "Gebruikersgroepen op alle lees- en schrijfendpoints met afdelingsfiltering.",
          "Individuele routes beveiligd: 404 voor chauffeurs buiten gebruikersgroep.",
          "Voorkeuren per gebruiker: 401-fout voor niet-ingelogde gebruikers.",
          "Alleen vooraf aangemaakte gebruikers kunnen inloggen via OAuth.",
          "Rolhandhaving op alle schrijfroutes (Admin/Planner/Viewer).",
        ],
      },
      {
        heading: "Functioneel",
        items: [
          "Gebruikersgroepen beheer met afdelingskoppeling en ledenbeheer.",
          "CSV-import upsert modus: keuze tussen aanmaken en bijwerken.",
          "Gebruikersbeheer met roloverzicht en rolbeheer.",
          "Inlogpagina met Google OAuth.",
        ],
      },
      {
        heading: "Prestaties",
        items: [
          "Capaciteitsendpoint geoptimaliseerd.",
          "Snellere CSV-import met batch-lookups en createMany.",
          "Virtual scrolling planningsrooster: soepel bij 1000+ chauffeurs.",
          "Server-side paginering op planningsrooster en chauffeurspagina.",
        ],
      },
    ],
  },
  {
    date: "29 maart 2026",
    title: "Ontwerp, connectiviteit en prestaties",
    groups: [
      {
        heading: "UX / design",
        items: [
          "Planningsrooster herontwerp: tonale lagen, statuscellen met kleurindicatorstippen.",
          "Koptekst met contextuele informatie per pagina.",
          "Chauffeurspagina herontwerp: samengestelde paginakop met contextbeschrijving.",
          "Instellingenpagina herontwerp: tabnavigatie met secties.",
          "Capaciteitspagina: statuschips met kleurindicatorstippen.",
          "Gestylede datuminvoer met kalenderknop.",
          "Gestylede verwijderbevestigingsdialogen.",
          "Manrope lettertype voor paginatitels.",
        ],
      },
      {
        heading: "Connectiviteit",
        items: [
          "Importbronnen: datamodel, CRUD API en beheerscherm met visuele veldkoppelingseditor.",
          "CSV-upload met kolomdetectie en voorbeeldrijen.",
        ],
      },
      {
        heading: "Prestaties",
        items: [
          "Map-gebaseerde lookups voor O(1) toegang in het planningsrooster.",
        ],
      },
      {
        heading: "Bugfixes",
        items: [
          "Chauffeurs zonder actief dienstverband nu zichtbaar in het planningsscherm.",
        ],
      },
    ],
  },
];
