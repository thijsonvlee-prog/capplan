# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

### UX / design verbeteringen

- Het planningsrooster gebruikt nu tonale lagen in plaats van rasterlijnen. Koprij, datarijen, groepsrijen en totaalrijen zijn visueel onderscheiden door achtergrondkleur en subtiele scheidingslijnen. Vastgezette kolommen (chauffeursnaam, extra kolommen) tonen een zijschaduw bij scrollen.
- Datarijen in het planningsrooster hebben licht afwisselende achtergrondtinten voor betere leesbaarheid.

### Toegankelijkheid

- Alle modale vensters (scenario aanmaken, roosterprofiel toewijzen, statuskeuzescherm, bulkselectie) sluiten nu bij het indrukken van de Escape-toets.

## Release History

### 2026-03-29 — Design, toegankelijkheid, planning grid fix en betrouwbaarheid

#### UX / design verbeteringen

- Alle verwijderbevestigingen gebruiken nu een gestylede dialoog in plaats van de standaard browserdialoog. Elke bevestiging toont specifiek wat er verwijderd wordt (naam, datum).
- De werkbalk van het planningsscherm is gegroepeerd in logische secties: Periode, Weergave, Zoeken & Filteren, en Weergaveopties. Elke groep is visueel onderscheiden met subtiele containers.
- Het chauffeursoverzicht heeft een volledige paginakop met de titel "Chauffeurs", een teller-badge, zoekbalk met icoon, en een prominente knop "Chauffeur toevoegen".
- De instellingenpagina heeft een paginakop met titel en beschrijving, en is gegroepeerd in drie secties: Stamgegevens, Competenties en Roosters.
- De capaciteitspagina heeft een paginakop met titel en scenariobadge. Vergelijkingsknoppen gebruiken nu de juiste designtokens.
- Verplichte formuliervelden zijn gemarkeerd met rode sterretjes.
- Toastmeldingen verschijnen bij alle aanmaak-, wijzig- en verwijderacties.
- Lege stamtabellen tonen instructietekst.
- Formulier voor chauffeur aanmaken toont foutmeldingen bij lege verplichte velden.

#### Toegankelijkheid

- Focus wordt vastgehouden binnen open modale vensters. Tab/Shift+Tab bladert alleen door elementen in het venster. Bij sluiten keert de focus terug naar het oorspronkelijke element.
- Bevestigingsdialogen ondersteunen de Escape-toets voor annuleren en klikken op de achtergrond.
- Alle modale vensters hebben `role="dialog"`, `aria-modal="true"`, en beschrijvende labels voor screenreaders.
- Alle icoon-knoppen hebben beschrijvende labels voor screenreaders.
- Toastmeldingen worden aangekondigd door screenreaders.
- SkillManager, RosterProfileEditor en instellingenpagina tonen laadspinners tijdens het ophalen van data.

#### Bugfix

- Probleem opgelost waarbij chauffeurs zonder actief dienstverband niet zichtbaar waren in het planningsscherm. Alle chauffeurs zijn nu altijd zichtbaar.

#### Betrouwbaarheid

- Alle meervoudige databasebewerkingen zijn verpakt in transacties (chauffeur bijwerken/verwijderen, roosterprofiel bijwerken, scenario dupliceren/verwijderen, competentie verwijderen, dienstverband/functie/roostertoewijzing aanmaken).
- Chauffeur actief/inactief status wordt bepaald op basis van dienstverbandgegevens.
- Alle POST en PUT API-endpoints valideren verplichte velden.
- Samengestelde database-index op roostertoewijzingen voor snellere opzoekingen.

#### Interne kwaliteit

- Foutlogging in alle API-routes opgeschoond — alleen foutmeldingen worden gelogd, geen volledige foutobjecten of verbindingsgegevens.

### 2026-03-29 — Workflow setup

- Multi-agent coördinatieworkflow opgezet met Product Backlog, aanbevelingsbestanden, release notes en escalatietracking.
- Geen applicatiecodewijzigingen in deze release.

## Release Note Rules

- Each entry is a concise, product-level description of the change. Avoid technical jargon.
- Group changes under the correct subsection (UX, Functional, Performance, Internal).
- When items from `Unreleased` are deployed, move them under a new dated heading in `Release History`.
- Use the format `### YYYY-MM-DD — Short description` for each release.
- The Product Owner Agent is responsible for maintaining this file.
- Do not include work-in-progress items. Only completed and deployed changes appear here.
