"use client";

export default function DocumentatiePage() {
  function handleDownload() {
    const content = generateDocumentation();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "capplan-documentatie.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Documentatie</h2>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Download de volledige documentatie van CapPlan als tekstbestand. Hierin staat een beschrijving van alle functionaliteiten en de opbouw van de applicatie.
        </p>
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Download documentatie (.txt)
        </button>
      </div>
    </div>
  );
}

function generateDocumentation(): string {
  return `================================================================================
CAPPLAN - DRIVER PLANNING TOOL - VOLLEDIGE DOCUMENTATIE
================================================================================

1. OVERZICHT
================================================================================

CapPlan is een webapplicatie voor het plannen en beheren van chauffeurs in een
transportorganisatie. De applicatie biedt functionaliteiten voor:

- Het beheren van chauffeursgegevens en hun historische records
- Het plannen van inzet via een visueel planningsrooster
- Het analyseren van capaciteit via grafieken en tabellen
- Het werken met scenario's voor what-if analyses
- Het beheren van stamgegevens (werkgevers, afdelingen, locaties, etc.)

Technische stack: Next.js 14, React 18, TypeScript, Tailwind CSS.
Data wordt opgeslagen in de browser via localStorage.


2. APPLICATIESTRUCTUUR
================================================================================

De applicatie heeft 5 hoofdpagina's, bereikbaar via de navigatiebalk (sidebar):

  - Planning       : Planningsrooster met dagelijkse statussen per chauffeur
  - Capaciteit     : Grafiek en tabel met capaciteitsoverzicht
  - Chauffeurs     : Beheer van chauffeursgegevens en subtabellen
  - Instellingen   : Beheer van stamgegevens en roosterprofielen
  - Documentatie   : Deze documentatie downloaden

Layout:
  - Links: sidebar (navigatie, altijd zichtbaar)
  - Boven: header met versienummer
  - Midden: pagina-inhoud


3. PLANNING
================================================================================

Het planningsscherm toont een rooster met chauffeurs (rijen) en data (kolommen).

3.1 Statustypen:
  - Roostervrij (-)         : Geen inzet gepland (grijs)
  - Basisrooster (B)        : Reguliere dienst (donkergroen)
  - Aanvullend beschikbaar (A) : Extra beschikbaarheid (lichtgroen)
  - Verlof (V)              : Vrije dag/vakantie (geel)
  - Ziek (Z)                : Ziekmelding (rood)

  Bij 'Verlof' kan een verloftype worden gekozen (vakantie, ADV, etc.).
  Bij 'Ziek' kan een percentage worden opgegeven (deels ziek/deels werken).

3.2 Interactie:
  - Klik op een cel om de status te wijzigen
  - Klik en sleep over meerdere cellen om ze in bulk te wijzigen
  - Klik op het roostericoon naast een chauffeur om een roosterprofiel toe te wijzen

3.3 Weergaveopties:
  - Aggregatieniveau: dag, week, 4 weken, maand, kwartaal, jaar
  - Dichtheid: ruim, gezellig, compact (bepaalt celhoogte)
  - Navigatie: vorige/volgende periode, vandaag-knop
  - Filter: zoek op chauffeursnaam
  - Groeperen op: werkgever, afdeling, standplaats, rijbewijstype, dienstverband
  - Kolommen: toon extra chauffeursinformatie (personeelsnr., werkgever, etc.)
  - Sorteren: klik op kolomkop om te sorteren

3.4 Scenario's:
  - "Actuele planning" is het standaardscenario
  - Scenario's aanmaken voor what-if analyses
  - Scenario's dupliceren vanuit bestaande planning
  - Elk scenario heeft eigen planningsdata


4. CHAUFFEURS
================================================================================

Beheer van alle chauffeurs in de organisatie.

4.1 Overzicht:
  - Tabel met alle actieve chauffeurs
  - Zoeken op naam of personeelsnummer
  - Nieuwe chauffeur aanmaken
  - Bestaande chauffeur bewerken of verwijderen

4.2 Gegevens (tabblad):
  - Voornaam, achternaam
  - Personeelsnummer
  - Rijbewijstypes: B, C, C1, CE, D, DE
  - Vaardigheden: gekoppeld aan stamtabel (bijv. ADR, Koelvervoer)
  - Actuele gegevens: afgeleid van de actieve records in de subtabellen

4.3 Dienstverband (subtabblad):
  - Historisch overzicht van dienstverbanden
  - Velden: begindatum, type (fulltime/parttime/oproep/uitzend/charter), werkgever
  - Begindatum kan iedere datum zijn (vrij invoerbaar via datumveld)
  - Bij toevoegen wordt het vorige actieve record automatisch afgesloten

4.4 Functie (subtabblad):
  - Historisch overzicht van functiewijzigingen
  - Velden: begindatum, functienaam, standplaats, afdeling, leidinggevende
  - Begindatum kan iedere datum zijn (vrij invoerbaar via datumveld)
  - Bij toevoegen wordt het vorige actieve record automatisch afgesloten

4.5 Rooster (subtabblad):
  - Historisch overzicht van toegewezen roosterprofielen
  - Velden: begindatum, roosterprofiel, uren per week
  - Begindatum kan iedere datum zijn (vrij invoerbaar via datumveld)
  - Bij toewijzing worden automatisch 364 dagen (1 jaar) aan planningregels
    gegenereerd op basis van het 28-daags patroon van het roosterprofiel
  - Bestaande verlof- en ziekstatussen worden niet overschreven


5. ROOSTERPROFIELEN
================================================================================

Een roosterprofiel definieert een herhalend 4-weeks (28-dagen) patroon.

- Beheer via Instellingen > Roosterprofielen
- Visuele editor: 4 rijen (weken) x 7 kolommen (dagen)
- Per dag een status: Roostervrij, Basisrooster, Aanvullend beschikbaar
- Klik om door de statussen te cyclen
- Profielen worden gekoppeld aan chauffeurs via het rooster-subtabblad

Bij toewijzing aan een chauffeur:
- Het 28-daags patroon herhaalt zich 13x (= 364 dagen / 1 jaar)
- Planningregels worden automatisch aangemaakt
- Verlof en ziek worden niet overschreven


6. CAPACITEITSANALYSE
================================================================================

Het capaciteitsscherm toont een grafiek en tabel met het aantal chauffeurs
per status over een tijdsperiode.

- Aggregatie: dag, week, 4 weken, maand, kwartaal, jaar
- Vergelijk meerdere scenario's naast elkaar
- Statusverdeling: hoeveel chauffeurs zijn roostervrij, op basisrooster,
  aanvullend beschikbaar, met verlof of ziek per periode


7. INSTELLINGEN (STAMGEGEVENS)
================================================================================

Beheer van referentiegegevens die in de applicatie worden gebruikt:

7.1 Werkgevers:
  - Code + omschrijving (bijv. CAPPLAN / CapPlan BV)
  - Worden gekoppeld aan dienstverbandrecords van chauffeurs

7.2 Afdelingen:
  - Code + omschrijving (bijv. DIST / Distributie)
  - Worden gekoppeld aan functierecords van chauffeurs

7.3 Standplaatsen:
  - Code + omschrijving (bijv. AMS / Amsterdam)
  - Worden gekoppeld aan functierecords van chauffeurs

7.4 Verloftypes:
  - Code + omschrijving (bijv. VAK / Vakantie)
  - Worden geselecteerd bij het instellen van verlofstatus in planning

7.5 Vaardigheden:
  - Naam (bijv. ADR, Koelvervoer)
  - Worden gekoppeld aan chauffeurs

7.6 Roosterprofielen:
  - Naam + 28-daags patroon
  - Worden toegewezen aan chauffeurs


8. DATA-OPSLAG
================================================================================

Alle data wordt opgeslagen in de browser via localStorage. De persistentielaag
is opgebouwd via het Repository-patroon, waardoor de opslagmethode in de
toekomst eenvoudig vervangen kan worden door een database.

De volgende localStorage-keys worden gebruikt:

  capplan_drivers          : Alle chauffeurs met subtabellen
  capplan_planning         : Planningregels (standaardscenario)
  capplan_planning_{id}    : Planningregels per scenario
  capplan_skills           : Vaardigheden
  capplan_employers        : Werkgevers
  capplan_departments      : Afdelingen
  capplan_locations        : Standplaatsen
  capplan_leave_types      : Verloftypes
  capplan_roster_profiles  : Roosterprofielen
  capplan_scenarios        : Lijst met scenario's
  capplan_active_scenario  : Actief scenario ID
  capplan_user_preferences : Gebruikersvoorkeuren (voorbereiding multi-user)

Let op: localStorage is gebonden aan de browser. Data gaat verloren bij het
wissen van browsergegevens. Er is geen server-side opslag.


9. ARCHITECTUUR
================================================================================

De applicatie volgt een gelaagde architectuur (Domain-Driven Design):

  UI (Components/Pages)
       ↓ gebruikt
  Services (bedrijfslogica)
       ↓ gebruikt
  Repositories (data-abstractie via interfaces)
       ↓ implementatie
  localStorage (huidige opslag)

9.1 Domeinlaag (/src/domain):
  - enums.ts      : Alle enum-types (PlanningStatus, EmploymentType, UserRole, etc.)
  - types.ts      : Alle domeinentiteiten (Driver, PlanningEntry, Scenario, etc.)
  - constants.ts  : Labels, kleuren, statusarrays (STATUS_LABELS, DAY_LABELS, etc.)

  Voorbereiding voor toekomstige uitbreidingen:
  - ExternalSourceMetadata op entiteiten (voor AFAS-koppeling)
  - User, UserContext, UserPreference types (voor multi-user ondersteuning)

9.2 Repository-interfaces (/src/repositories/interfaces):
  Definiëren contracten voor data-toegang, onafhankelijk van opslagmethode:
  - DriverRepository        : CRUD chauffeurs + sub-records
  - PlanningRepository      : Planningregels per scenario
  - ScenarioRepository      : Scenario CRUD + actief scenario
  - SkillRepository         : Vaardigheden CRUD
  - StamtabelRepository     : Generiek stamtabelbeheer (werkgevers, afdelingen, etc.)
  - RosterProfileRepository : Roosterprofielen CRUD
  - UserPreferenceRepository: Gebruikersvoorkeuren CRUD

9.3 localStorage-implementaties (/src/repositories/localStorage):
  - Eén implementatie per repository-interface
  - storage.ts: gedeelde infrastructuur (useStore hook, notify, initializeStore)
  - Elke schrijfactie roept notify() aan voor automatische UI-updates

9.4 Services (/src/services):
  Bevatten de bedrijfslogica, gescheiden van de opslaglaag:
  - DriverService       : Chauffeur-CRUD, sub-record beheer (autoCloseAndAdd),
                          roosterprofiel-toewijzing met planninggeneratie,
                          berekende velden, groepering
  - PlanningService     : Planningregels ophalen/bijwerken, capaciteitsberekening
  - ScenarioService     : Scenario CRUD, dupliceren, actief scenario
  - SettingsService     : Vaardigheden + stamtabellen, cascade-verwijdering
  - RosterProfileService: Roosterprofiel CRUD
  - UserPreferenceService: Gebruikersvoorkeuren (voorbereiding multi-user)
  - index.ts            : Service-container (createServices factory + singleton)

9.5 Reactiviteit:
  De applicatie gebruikt een pub/sub patroon voor reactieve UI-updates:
  - storage.ts bevat een set listeners + notify() functie
  - useStore(getter) hook: abonneert component op wijzigingen
  - Alle repositories roepen notify() aan na schrijfacties
  - Components renderen automatisch opnieuw na datawijzigingen


10. BRONCODE STRUCTUUR
================================================================================

/src
  /app                              Next.js App Router
    /(dashboard)                    Dashboard layout (sidebar + header)
      /planning/page.tsx            Planningspagina
      /capacity/page.tsx            Capaciteitspagina
      /drivers/page.tsx             Chauffeurspagina
      /settings/page.tsx            Instellingenpagina
      /documentatie/page.tsx        Documentatiepagina
      layout.tsx                    Dashboard wrapper (initializeStore)

  /domain                           Domeinlaag
    enums.ts                        Enum-types en union types
    types.ts                        Domeinentiteiten en modellen
    constants.ts                    Labels, kleuren, statusarrays

  /repositories                     Data-abstractielaag
    /interfaces                     Repository-contracten (7 interfaces)
    /localStorage                   localStorage-implementaties (7 repos + storage.ts)

  /services                         Bedrijfslogica
    DriverService.ts                Chauffeur bedrijfslogica
    PlanningService.ts              Planning bedrijfslogica
    ScenarioService.ts              Scenario bedrijfslogica
    SettingsService.ts              Stamgegevens bedrijfslogica
    RosterProfileService.ts         Roosterprofiel bedrijfslogica
    UserPreferenceService.ts        Gebruikersvoorkeuren
    index.ts                        Service-container en singleton

  /components
    /layout
      Sidebar.tsx                   Navigatiebalk
      Header.tsx                    Bovenste balk
    /planning
      PlanningGrid.tsx              Hoofdplanningsrooster
      DayCell.tsx                   Individuele dagcel
      WeekSelector.tsx              Periodenavigatie
      ZoomSelector.tsx              Aggregatieniveau schakelaar
      StatusSelector.tsx            Statuskeuzescherm
      StatusBadge.tsx               Statusweergave badge
      ScenarioSelector.tsx          Scenariobeheer
      RosterAssigner.tsx            Roosterprofiel toewijzen
    /drivers
      DriverList.tsx                Chauffeurstabel
      DriverForm.tsx                Chauffeur aanmaken/bewerken
      SubTable.tsx                  Herbruikbare subtabel component
    /capacity
      CapacityChart.tsx             Grafiek (Recharts)
      CapacityTable.tsx             Capaciteitstabel
    /settings
      SkillManager.tsx              Vaardigheden CRUD
      StamtabelManager.tsx          Generiek stamtabelbeheer
      RosterProfileEditor.tsx       Roosterprofiel editor

  /lib
    utils.ts                        Datum-hulpfuncties (cn, getWeekDates, etc.)


================================================================================
Einde documentatie - CapPlan v2.0
================================================================================
`;
}
