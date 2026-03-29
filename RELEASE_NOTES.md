# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

_No unreleased changes._

### 2026-03-29 — Planningsrooster werkbalk en kleurcorrectie

#### UX / design verbeteringen

- **Planningsrooster werkbalk:** Statuslegende in de tweede werkbalkrij heeft nu een eigen visuele groep met "Status" label, consistent met de groepering van de overige bedieningselementen.
- **Scenario-badge:** "Concept" badge bij scenarioselectie gebruikt nu ontwerptokens in plaats van directe Tailwind-kleuren.

## Release History

### 2026-03-29 — Typografie, koptekst en prestatieoptimalisatie

#### UX / design verbeteringen

- **Typografie:** Manrope lettertype toegevoegd voor paginatitels. Titels hebben nu een sterker visueel gewicht en duidelijkere hiërarchie.
- **Koptekstbalk:** Rand onder de koptekst verwijderd; scheiding gebeurt nu via kleurverschil tussen oppervlakken. Overtollig "CapPlan" label verwijderd.
- **Capaciteitspagina:** Actieve scenariotoggle gebruikt nu merkkleuren in plaats van waarschuwingskleuren.

#### Prestaties

- **Verloftype-lookup:** Verloftype-lookup in planningsroostercellen geoptimaliseerd van lineair zoeken naar O(1) Map-lookup, consistent met het patroon in de rest van de applicatie.

### 2026-03-29 — Prestatieoptimalisatie, connectiviteitshub en API-hardening

Dit is een samenvatting van alle wijzigingen die op 2026-03-29 zijn doorgevoerd over meerdere nachtelijke cycli.

#### UX / design verbeteringen

- **Planningsrooster herontwerp:** Tonale lagen in plaats van rasterlijnen. Chauffeursnamen als "Achternaam, Voornaam" met dikkere typografie. Statuscellen met kleurindicatorstippen. Statusselectiemenu opent naast de aangeklikte cel.
- **Chauffeurspagina herontwerp:** Samengestelde paginakop met contextbeschrijving. Tonale rijafwisseling en subtiele scheidingslijnen.
- **Instellingenpagina herontwerp:** Tabnavigatie (Stamgegevens, Competenties, Roosters) in plaats van verticale lijst. Invoervelden met gestylede `input-field` klasse.
- **Capaciteitspagina:** Statuschips met kleurindicatorstippen. Werkbalk met gegroepeerde periode-/zoom- en vergelijkingsknoppen in afgebakende secties.
- **Datuminvoer:** Alle datumvelden gebruiken een gestylede invoer met kalenderknop.
- **Subtabellen:** Tonale rijscheidingen en afwisselende achtergrondtinten op alle subtabellen (dienstverbanden, functies, roostertoewijzingen).
- **Roosterprofiel-editor:** Kleurindicatorstippen bij elke statuscel.
- **Roostertoewijzingsvenster:** Tonale rijscheidingen, kaartoppervlak. Chauffeurnaam als "Achternaam, Voornaam". Actieve toewijzingen met groene achtergrond.
- **Verwijderbevestigingen:** Alle destructieve acties gebruiken gestylede bevestigingsdialogen.
- **Volledige paginakoppen:** Koppen, verplichte-veldmarkeringen en toastmeldingen op alle schermen.

#### Toegankelijkheid

- Modale vensters sluiten bij Escape, focus wordt vastgehouden, beschrijvende labels voor screenreaders.

#### Prestaties

- **Map-gebaseerde lookups:** Werkgever-, afdeling- en standplaatslookups in het planningsrooster, chauffeurslijst en groeperingsfuncties zijn geoptimaliseerd van O(N×M) naar O(1) per lookup via vooraf opgebouwde Maps.
- Planningsrooster herberekent gefilterde chauffeurlijst alleen wanneer data of filter wijzigen.

#### Connectiviteitshub

- **Importbronnen datamodel:** Nieuw `ImportSource` model toegevoegd aan de database voor het configureren van CSV-importbronnen met veldkoppelingen.
- **Importbronnen API:** Volledige CRUD API (`/api/import-sources`) met validatie van verplichte velden, doelentiteiten en veldkoppelingsformaat. Foutmeldingen in het Nederlands.

#### Betrouwbaarheid

- **Referentievalidatie:** Alle API-routes die relaties aanmaken valideren dat referenties (werkgever, locatie, afdeling, competenties, verloftype) bestaan. Ongeldige referenties geven een duidelijke 400-fout in het Nederlands.
- **Datumvalidatie:** Dienstverband-, functie- en roostertoewijzingroutes valideren dat einddatum niet voor startdatum ligt.
- **Transactieveiligheid:** Alle meervoudige databasebewerkingen in transacties, inclusief PUT-routes voor dienstverband, functie en roostertoewijzing.
- **Race condition opgelost:** Unieke constraint en transacties voor gelijktijdige planningsbewerkingen.
- **Scenarioduplicatie:** Ongeldig bron-ID geeft nu 404.
- **Plannings-API:** Vereist datum- of chauffeurfilter.

#### Taalafstemming

- Alle foutmeldingen in alle 24 API-routebestanden zijn volledig in het Nederlands.

#### Interne kwaliteit

- 0 ESLint-waarschuwingen in de volledige codebase.

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
