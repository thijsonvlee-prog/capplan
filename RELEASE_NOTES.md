# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

### Datuminvoer en planningsrooster verfijning

#### UX / design verbeteringen

- Alle datumvelden in de applicatie gebruiken nu een gestylede invoer met kalenderknop, consistent met het ontwerpsysteem. De standaard browser-datuminvoer is vervangen door een wrapper met een zichtbaar kalendericoon.
- Statuscellen in het planningsrooster tonen nu een kleurindicatorstip naast de statusletter voor snellere visuele herkenning bij scannen.
- Lege cellen in het planningsrooster zijn subtieler en vallen visueel minder op, waardoor de aandacht naar gevulde cellen gaat.
- Geaggregeerde weergave (week/maand) gebruikt dezelfde statuschip-stijl als de dagweergave voor consistentie.
- Celknoppen hebben een zachtere rand voor een meer product-achtige uitstraling.

## Release History

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
