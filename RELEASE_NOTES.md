# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

_No unreleased changes._

## Release History

### 2026-03-29 — API-opschoning en validatie

#### Interne kwaliteit

- Ongebruikt API-endpoint `/api/drivers/[id]/computed` verwijderd, inclusief de bijbehorende `getComputedFields` methode in de frontend API-wrapper. Chauffeursvelden worden al client-side berekend.
- Invoervalidatie toegevoegd aan de PUT-endpoints voor voorkeuren en actief scenario. Ontbrekende velden geven nu een duidelijke 400-foutmelding.

### 2026-03-29 — DayCell popup en planningsrooster rijcompositie

#### UX / design verbeteringen

- Het statusselectiemenu opent nu direct naast de aangeklikte cel in het planningsrooster, in plaats van in het midden van het scherm. Het menu blijft binnen het scherm bij randen.
- Het statusselectiemenu heeft een nieuw ontwerp: kleurindicatoren per status, vinkje bij de huidige status, verfijnde typografie en subtielere opmaak. Het donkere achtergrondoverlay is verwijderd — het menu gedraagt zich als een contextueel menu.
- Chauffeursnamen in het planningsrooster worden nu weergegeven als "Achternaam, Voornaam" met dikkere typografie voor snellere herkenning bij het scannen van rijen.
- Personeelsnummers en metadata onder de naam gebruiken nu een subtielere tekststijl voor duidelijkere visuele hiërarchie.
- Vastgezette identiteitskolommen erven nu de afwisselende rijtinten, zodat er geen visueel verschil ontstaat bij horizontaal scrollen.

### 2026-03-29 — Design, toegankelijkheid, planning grid fix en betrouwbaarheid

#### UX / design verbeteringen

- Het planningsrooster gebruikt nu tonale lagen in plaats van rasterlijnen. Koprij, datarijen, groepsrijen en totaalrijen zijn visueel onderscheiden door achtergrondkleur en subtiele scheidingslijnen. Vastgezette kolommen tonen een zijschaduw bij scrollen.
- Datarijen in het planningsrooster hebben licht afwisselende achtergrondtinten voor betere leesbaarheid.
- Alle verwijderbevestigingen gebruiken nu een gestylede dialoog in plaats van de standaard browserdialoog. Elke bevestiging toont specifiek wat er verwijderd wordt (naam, datum).
- De werkbalk van het planningsscherm is gegroepeerd in logische secties: Periode, Weergave, Zoeken & Filteren, en Weergaveopties.
- Het chauffeursoverzicht, de instellingenpagina en de capaciteitspagina hebben volledige paginakoppen met titels, badges en acties.
- Vergelijkingsknoppen op de capaciteitspagina gebruiken nu de juiste designtokens.
- Verplichte formuliervelden zijn gemarkeerd met rode sterretjes.
- Toastmeldingen verschijnen bij alle aanmaak-, wijzig- en verwijderacties.
- Lege stamtabellen tonen instructietekst.
- Formulier voor chauffeur aanmaken toont foutmeldingen bij lege verplichte velden.

#### Toegankelijkheid

- Alle modale vensters (scenario aanmaken, roosterprofiel toewijzen, statuskeuzescherm, bulkselectie) sluiten bij de Escape-toets.
- Focus wordt vastgehouden binnen open modale vensters. Tab/Shift+Tab bladert alleen door elementen in het venster.
- Bevestigingsdialogen ondersteunen de Escape-toets en klikken op de achtergrond voor annuleren.
- Alle modale vensters hebben `role="dialog"`, `aria-modal="true"`, en beschrijvende labels voor screenreaders.
- Alle icoon-knoppen hebben beschrijvende labels voor screenreaders.
- Toastmeldingen worden aangekondigd door screenreaders.
- Laadspinners tonen bij het ophalen van data in SkillManager, RosterProfileEditor en instellingenpagina.

#### Bugfix

- Probleem opgelost waarbij chauffeurs zonder actief dienstverband niet zichtbaar waren in het planningsscherm. Alle chauffeurs zijn nu altijd zichtbaar.

#### Betrouwbaarheid

- Alle meervoudige databasebewerkingen zijn verpakt in transacties.
- Chauffeur actief/inactief status wordt bepaald op basis van dienstverbandgegevens.
- Alle POST en PUT API-endpoints valideren verplichte velden.
- Samengestelde database-index op roostertoewijzingen voor snellere opzoekingen.

#### Interne kwaliteit

- Foutlogging in alle API-routes opgeschoond — alleen foutmeldingen worden gelogd, geen volledige foutobjecten.

### 2026-03-29 — Workflow setup

- Multi-agent coördinatieworkflow opgezet met Product Backlog, aanbevelingsbestanden, release notes en escalatietracking.

## Release Note Rules

- Each entry is a concise, product-level description of the change. Avoid technical jargon.
- Group changes under the correct subsection (UX, Functional, Performance, Internal).
- When items from `Unreleased` are deployed, move them under a new dated heading in `Release History`.
- Use the format `### YYYY-MM-DD — Short description` for each release.
- The Product Owner Agent is responsible for maintaining this file.
- Do not include work-in-progress items. Only completed and deployed changes appear here.
