# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

_No unreleased changes._

## Release History

### 2026-03-29 (nacht 2) — API-validatie en ESLint-opschoning

#### Betrouwbaarheid

- Dienstverband-, functie- en roostertoewijzing-bewerkingsendpoints valideren nu dat de einddatum niet voor de startdatum ligt. Ongeldige datumbereiken worden afgewezen met een duidelijke foutmelding.
- Het dupliceren van een scenario met een ongeldig bron-ID geeft nu een 404-fout in plaats van stilzwijgend een leeg scenario aan te maken.

#### Interne kwaliteit

- De laatste ESLint-waarschuwing in het planningsrooster (stale closure in drag-handler) is opgelost. De codebase heeft nu 0 ESLint-waarschuwingen.

### 2026-03-29 (laat) — Chauffeurspagina herontwerp

#### UX / design verbeteringen

- De chauffeurspagina heeft een vernieuwd ontwerp met een samengestelde paginakop inclusief contextbeschrijving.
- De chauffeurslijst gebruikt nu tonale rijafwisseling en subtiele scheidingslijnen in plaats van harde randen, consistent met het planningsrooster.
- Chauffeursnamen worden weergegeven als "Achternaam, Voornaam" voor consistentie met het planningsrooster.
- Bij het bewerken of toevoegen van een chauffeur wordt de tabel verborgen en verschijnt een sectiekop met titel en beschrijving, waardoor de focus op het formulier ligt.
- Bewerkknop heeft een beschrijvend aria-label per chauffeur voor betere screenreader-ondersteuning.
- Lege cellen tonen subtiele placeholders in plaats van een streepje met volle tekstkleur.

### 2026-03-29 (nacht) — Instellingenpagina herontwerp en technische opschoning

#### UX / design verbeteringen

- De instellingenpagina gebruikt nu tabnavigatie (Stamgegevens, Competenties, Roosters) in plaats van een lange verticale lijst. Elke tab toont een duidelijke sectietitel met contextbeschrijving. Het tabblad Stamgegevens toont een totaalbadge.
- Invoervelden in stamtabelbeheer gebruiken nu dezelfde gestylede `input-field` klasse als de rest van de applicatie, voor consistente focus- en randstijlen.

#### Betrouwbaarheid

- Race condition opgelost bij gelijktijdige planningsbewerkingen: de database voorkomt nu dubbele planningregels per chauffeur/datum/scenario via een unieke constraint. Zowel enkele als bulk-planningsoperaties zijn beschermd met transacties.
- Het planning-API-endpoint vereist nu een datum- of chauffeurfilter, waardoor onbegrensde queries die alle planningsregels ophalen niet meer mogelijk zijn.

#### Prestaties

- Het planningsrooster herberekent de gefilterde en gesorteerde chauffeurlijst alleen wanneer data of filter daadwerkelijk wijzigen, in plaats van bij elke render.

#### Interne kwaliteit

- Ongebruikte `patchBody` helper, `isDriverActiveByEmployment` functie, misleidende `userId` parameter in voorkeuren-API en overbodige cascade-verwijderingen opgeruimd.
- Ongebruikte `preferences.getAll()` en `preferences.remove()` methoden verwijderd uit de frontend API-laag.

### 2026-03-29 (avond) — Datuminvoer, planningsrooster verfijning en codekwaliteit

#### UX / design verbeteringen

- Alle datumvelden in de applicatie gebruiken nu een gestylede invoer met kalenderknop, consistent met het ontwerpsysteem.
- Statuscellen in het planningsrooster tonen nu een kleurindicatorstip naast de statusletter voor snellere visuele herkenning bij scannen.
- Lege cellen in het planningsrooster zijn subtieler en vallen visueel minder op, waardoor de aandacht naar gevulde cellen gaat.
- Geaggregeerde weergave (week/maand) gebruikt dezelfde statuschip-stijl als de dagweergave voor consistentie.
- Celknoppen hebben een zachtere rand voor een meer product-achtige uitstraling.

### 2026-03-29 — DayCell popup, planningsrooster redesign en kwaliteitsverbeteringen

#### UX / design verbeteringen

- Het statusselectiemenu opent nu direct naast de aangeklikte cel in het planningsrooster, in plaats van in het midden van het scherm. Het menu blijft binnen het scherm bij randen.
- Het statusselectiemenu heeft een nieuw ontwerp: kleurindicatoren per status, vinkje bij de huidige status, verfijnde typografie en subtielere opmaak. Het donkere achtergrondoverlay is verwijderd — het menu gedraagt zich als een contextueel menu.
- Het planningsrooster gebruikt nu tonale lagen in plaats van rasterlijnen. Koprij, datarijen, groepsrijen en totaalrijen zijn visueel onderscheiden door achtergrondkleur en subtiele scheidingslijnen.
- Chauffeursnamen in het planningsrooster worden weergegeven als "Achternaam, Voornaam" met dikkere typografie voor snellere herkenning.
- Personeelsnummers en metadata gebruiken een subtielere tekststijl voor duidelijkere visuele hiërarchie.
- Vastgezette identiteitskolommen erven de afwisselende rijtinten bij horizontaal scrollen.
- Datarijen hebben licht afwisselende achtergrondtinten voor betere leesbaarheid.
- Alle verwijderbevestigingen gebruiken een gestylede dialoog in plaats van de standaard browserdialoog.
- De werkbalk van het planningsscherm is gegroepeerd in logische secties.
- Volledige paginakoppen met titels, badges en acties op alle hoofdpagina's.
- Verplichte formuliervelden zijn gemarkeerd met rode sterretjes.
- Toastmeldingen bij alle aanmaak-, wijzig- en verwijderacties.
- Lege stamtabellen tonen instructietekst.

#### Toegankelijkheid

- Alle modale vensters sluiten bij de Escape-toets.
- Focus wordt vastgehouden binnen open modale vensters (Tab/Shift+Tab).
- Bevestigingsdialogen ondersteunen Escape en klikken op achtergrond voor annuleren.
- Alle modale vensters hebben `role="dialog"`, `aria-modal="true"`, en beschrijvende labels.
- Alle icoon-knoppen hebben beschrijvende labels voor screenreaders.
- Toastmeldingen worden aangekondigd door screenreaders.
- Laadspinners bij het ophalen van data in SkillManager, RosterProfileEditor en instellingenpagina.

#### Bugfix

- Probleem opgelost waarbij chauffeurs zonder actief dienstverband niet zichtbaar waren in het planningsscherm.

#### Betrouwbaarheid

- Alle meervoudige databasebewerkingen zijn verpakt in transacties.
- Chauffeur actief/inactief status wordt bepaald op basis van dienstverbandgegevens.
- Alle POST en PUT API-endpoints valideren verplichte velden.
- Samengestelde database-index op roostertoewijzingen voor snellere opzoekingen.

#### Interne kwaliteit

- Ongebruikt API-endpoint `/api/drivers/[id]/computed` en bijbehorende frontend-methode verwijderd.
- Invoervalidatie toegevoegd aan PUT-endpoints voor voorkeuren en actief scenario.
- Foutlogging in alle API-routes opgeschoond.

### 2026-03-29 — Workflow setup

- Multi-agent coördinatieworkflow opgezet met Product Backlog, aanbevelingsbestanden, release notes en escalatietracking.

## Release Note Rules

- Each entry is a concise, product-level description of the change. Avoid technical jargon.
- Group changes under the correct subsection (UX, Functional, Performance, Internal).
- When items from `Unreleased` are deployed, move them under a new dated heading in `Release History`.
- Use the format `### YYYY-MM-DD — Short description` for each release.
- The Product Owner Agent is responsible for maintaining this file.
- Do not include work-in-progress items. Only completed and deployed changes appear here.
