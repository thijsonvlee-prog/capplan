# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

_No unreleased changes._

## Release History

### 2026-03-29 (nacht 7) — Naamformaat en werkbalkgroeperingen

#### UX / design verbeteringen

- Het roosterprofieltoewijzingsvenster toont nu de chauffeurnaam als "Achternaam, Voornaam", consistent met het planningsrooster en de chauffeurstabel.
- De werkbalk op de capaciteitspagina groepeert nu periode-/zoomknoppen en vergelijkingsknoppen in duidelijk afgebakende secties met achtergrondkleur en scheidingslijnen.

### 2026-03-29 (nacht 6) — API-taalafstemming en transactieveiligheid

#### Taalafstemming

- Alle foutmeldingen in alle API-routes zijn nu volledig in het Nederlands. Dit omvat validatiemeldingen, 404-fouten, en interne serverfouten over alle 24 routebestanden.

#### Betrouwbaarheid

- De PUT-routes voor dienstverband, functie en roostertoewijzing gebruiken nu databasetransacties voor de verificatie- en bijwerkstappen. Dit voorkomt race conditions bij gelijktijdige bewerkingen.

### 2026-03-29 (nacht 5) — Visuele consistentie afronden

#### UX / design verbeteringen

- De capaciteitstabel gebruikt nu statuschips met kleurindicatorstippen, consistent met het planningsrooster. Dichte celranden zijn vervangen door tonale rijscheidingen en afwisselende achtergrondtinten.
- De roosterhistorietabel in het toewijzingsvenster gebruikt nu tonale rijscheidingen met een kaartoppervlak en consistente kopstijl. Actieve toewijzingen worden gemarkeerd met een groene achtergrond.
- Het roosterprofielrooster in de instellingen toont nu kleurindicatorstippen bij elke statuscel, consistent met het planningsrooster.

### 2026-03-29 (nacht 4) — API-validatie completering en taalafstemming

#### Betrouwbaarheid

- Dienstverband-, functie- en roostertoewijzing-aanmaakendpoints valideren nu dat de einddatum niet voor de startdatum ligt.

#### Taalafstemming

- Alle foutmeldingen in de instellingen-API-routes zijn nu in het Nederlands.

### 2026-03-29 (nacht 3) — SubTable visuele consistentie

#### UX / design verbeteringen

- De subtabellen in het bewerkscherm van chauffeurs gebruiken nu tonale rijscheidingen en afwisselende achtergrondtinten in plaats van dichte celranden.
- Actieve records worden gemarkeerd met een subtiele groene achtergrond.

### 2026-03-29 (nacht 2) — API-validatie en ESLint-opschoning

#### Betrouwbaarheid

- Dienstverband-, functie- en roostertoewijzing-bewerkingsendpoints valideren nu dat de einddatum niet voor de startdatum ligt.
- Het dupliceren van een scenario met een ongeldig bron-ID geeft nu een 404-fout.

#### Interne kwaliteit

- De codebase heeft nu 0 ESLint-waarschuwingen.

### 2026-03-29 (laat) — Chauffeurspagina herontwerp

#### UX / design verbeteringen

- De chauffeurspagina heeft een vernieuwd ontwerp met een samengestelde paginakop inclusief contextbeschrijving.
- De chauffeurslijst gebruikt nu tonale rijafwisseling en subtiele scheidingslijnen.
- Chauffeursnamen worden weergegeven als "Achternaam, Voornaam" voor consistentie met het planningsrooster.

### 2026-03-29 (nacht) — Instellingenpagina herontwerp en technische opschoning

#### UX / design verbeteringen

- De instellingenpagina gebruikt nu tabnavigatie (Stamgegevens, Competenties, Roosters) in plaats van een lange verticale lijst.
- Invoervelden in stamtabelbeheer gebruiken nu de gestylede `input-field` klasse.

#### Betrouwbaarheid

- Race condition opgelost bij gelijktijdige planningsbewerkingen via unieke constraint en transacties.
- Het planning-API-endpoint vereist nu een datum- of chauffeurfilter.

#### Prestaties

- Het planningsrooster herberekent de gefilterde chauffeurlijst alleen wanneer data of filter daadwerkelijk wijzigen.

### 2026-03-29 (avond) — Datuminvoer, planningsrooster verfijning en codekwaliteit

#### UX / design verbeteringen

- Alle datumvelden gebruiken nu een gestylede invoer met kalenderknop.
- Statuscellen in het planningsrooster tonen nu een kleurindicatorstip naast de statusletter.

### 2026-03-29 — DayCell popup, planningsrooster redesign en kwaliteitsverbeteringen

#### UX / design verbeteringen

- Het statusselectiemenu opent nu direct naast de aangeklikte cel, met kleurindicatoren per status.
- Het planningsrooster gebruikt tonale lagen in plaats van rasterlijnen.
- Chauffeursnamen als "Achternaam, Voornaam" met dikkere typografie.
- Alle verwijderbevestigingen gebruiken gestylede dialogen.
- Volledige paginakoppen, verplichte-veldmarkeringen en toastmeldingen op alle schermen.

#### Toegankelijkheid

- Modale vensters sluiten bij Escape, focus wordt vastgehouden, beschrijvende labels voor screenreaders.

#### Bugfix

- Chauffeurs zonder actief dienstverband zijn nu zichtbaar in het planningsscherm.

#### Betrouwbaarheid

- Alle meervoudige databasebewerkingen in transacties. Verplichte-veldvalidatie op alle POST/PUT endpoints.

### 2026-03-29 — Workflow setup

- Multi-agent coördinatieworkflow opgezet.

## Release Note Rules

- Each entry is a concise, product-level description of the change. Avoid technical jargon.
- Group changes under the correct subsection (UX, Functional, Performance, Internal).
- When items from `Unreleased` are deployed, move them under a new dated heading in `Release History`.
- Use the format `### YYYY-MM-DD — Short description` for each release.
- The Product Owner Agent is responsible for maintaining this file.
- Do not include work-in-progress items. Only completed and deployed changes appear here.
