# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

_No unreleased changes._

## Release History

### 2026-03-29 — Design verbetering, planning grid fix, accessibility, en betrouwbaarheid

#### UX / design verbeteringen

- De werkbalk van het planningsscherm is gegroepeerd in logische secties: Periode (navigatie + zoom), Weergave (dichtheid + scenario), Zoeken & Filteren (zoekveld + groeperen), en Weergaveopties (kolommen + totalen). Elke groep is visueel onderscheiden.
- Het chauffeursoverzicht heeft een volledige paginakop met de titel "Chauffeurs", een teller-badge met het aantal chauffeurs, en een zoekbalk met zoekicoon. De knop "Chauffeur toevoegen" is nu visueel prominent als primaire actie.
- De instellingenpagina is gegroepeerd in drie secties: Stamgegevens, Competenties en Roosters. Elke sectie heeft een koptekst en de pagina opent met een korte introductietekst.
- Verplichte formuliervelden zijn nu gemarkeerd met rode sterretjes.

#### Toegankelijkheid

- Alle modale vensters (scenario aanmaken, roosterprofiel toewijzen, kolommen selecteren, bulk status instellen, dagstatus instellen) hebben `role="dialog"`, `aria-modal="true"`, en beschrijvende labels voor screenreaders.
- Alle icoon-knoppen (bewerken, verwijderen, opslaan, annuleren, navigatie) hebben beschrijvende labels voor screenreaders.
- Toastmeldingen worden nu aangekondigd door screenreaders.
- SkillManager en RosterProfileEditor tonen laadspinners tijdens het ophalen van data.

#### Bugfix

- Probleem opgelost waarbij chauffeurs zonder actief dienstverband niet zichtbaar waren in het planningsscherm. Alle chauffeurs zijn nu altijd zichtbaar.

#### Betrouwbaarheid

- Alle meervoudige databasebewerkingen zijn nu verpakt in transacties (chauffeur bijwerken, chauffeur verwijderen, roosterprofiel bijwerken, scenario dupliceren, scenario verwijderen, competentie verwijderen, dienstverband aanmaken, functie aanmaken, roostertoewijzing aanmaken).
- Chauffeur actief/inactief status wordt nu bepaald op basis van dienstverbandgegevens in plaats van een handmatig ingestelde vlag.

#### Interne kwaliteit

- Foutlogging in alle API-routes is opgeschoond — alleen foutmeldingen worden gelogd, geen volledige foutobjecten of verbindingsgegevens.

### 2026-03-29 — Betrouwbaarheid, validatie en UX-verbeteringen

#### Betrouwbaarheid

- Roostertoewijzing verpakt alle databasebewerkingen in één transactie.
- Alle POST en PUT API-endpoints valideren verplichte velden.
- Samengestelde database-index op roostertoewijzingen voor snellere opzoekingen.

#### UX / usability

- Formulier voor chauffeur aanmaken toont foutmeldingen bij lege verplichte velden.
- Instellingenpagina toont laadspinners tijdens het ophalen van data.
- Bevestigingsdialogen bij verwijderen specificeren nu welk type gegeven wordt verwijderd.
- Toastmeldingen verschijnen bij alle aanmaak-, wijzig- en verwijderacties.
- Lege stamtabellen tonen instructietekst.

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
