# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

_No unreleased changes._

## Release History

### 2026-03-30 — Gebruikersbeheer, inloggen, CSV-import en authenticatie

#### Functionele verbeteringen

- **Gebruikersbeheer:** Nieuw tabblad "Gebruikers" op de instellingenpagina. Toont alle gebruikers met profielfoto, naam, e-mailadres, rol en lidmaatschapsdatum. Beheerders kunnen rollen toewijzen (Admin, Planner, Kijker) via klikbare rolbadges met bevestigingsdialoog.

### 2026-03-30 — Inloggen, CSV-import uitvoeren en authenticatie-infrastructuur

#### Functionele verbeteringen

- **Inlogpagina:** Nieuwe inlogpagina (`/login`) met ondersteuning voor inloggen via Google en Microsoft. Samengesteld ontwerp met merkpaneel (links) en inlogformulier (rechts). Alle tekst in het Nederlands.
- **Sessie-indicator:** De koptekstbalk toont nu de ingelogde gebruiker met profielfoto (of initialen), naam en uitlogknop.
- **Routebeveiliging:** Niet-ingelogde gebruikers worden automatisch doorgestuurd naar de inlogpagina.
- **CSV-import uitvoeren:** Gebruikers kunnen nu een CSV-bestand uploaden, de veldkoppelingen bekijken, en de import daadwerkelijk uitvoeren. Het systeem valideert alle rijen vooraf, importeert geldige rijen in een transactie, en toont een samenvatting met het aantal geïmporteerde en overgeslagen rijen en eventuele fouten per rij.
- **Importgeschiedenis:** Per importbron is nu een logboek beschikbaar met de laatste 20 imports. Elk logboekitem toont datum, bestandsnaam, aantal rijen, en eventuele fouten (uitklapbaar).
- **Doelentiteiten:** Import ondersteunt chauffeurs (voornaam, achternaam, personeelsnummer, rijbewijscategorieën), werkgevers, afdelingen en standplaatsen (code, omschrijving). Dubbele codes worden automatisch overgeslagen.

#### Authenticatie-infrastructuur

- **NextAuth.js:** Authenticatie-infrastructuur opgezet met NextAuth.js v4. Ondersteuning voor Google en Microsoft (Azure AD). Gebruikerssessies in de database via Prisma-adapter. Sessie bevat gebruikers-ID en rol. Conditioneel actief — vereist provideromgevingsvariabelen.

#### UX / design verbeteringen

- **Knopsysteem uitgebreid:** `.btn-danger` CSS-klasse toegevoegd. Bevestigingsdialogen en documentatiepagina gebruiken herbruikbare knopklassen.

#### Interne kwaliteit

- **CLAUDE.md herschreven:** Volledig herschreven projecthandboek dat de huidige applicatiestaat weerspiegelt.
- **CSV-parser geëxtraheerd:** Gedeelde `src/lib/csv-parser.ts` module voor CSV-parsing met separatordetectie.
- **Map-memoization in DriverForm:** Werkgever-, afdeling- en standplaats-lookups gecached met `useMemo`.
- **Dode code verwijderd:** Ongebruikte hulpfuncties en enums opgeruimd.
- **0 ESLint-waarschuwingen, 0 typecheck-fouten.**

### 2026-03-29 — Ontwerp, prestaties en betrouwbaarheid

#### UX / design verbeteringen

- **Koptekst met context:** Contextuele informatie per pagina (actief scenario, aantal chauffeurs).
- **Waarschuwingstokens uitgebreid:** Drie nieuwe waarschuwingskleuren voor genuanceerdere badge-styling.
- **Planningsrooster herontwerp:** Tonale lagen, statuscellen met kleurindicatorstippen, selectiemenu naast cel.
- **Planningsrooster werkbalk:** Consistent `.control-group`-patroon met labels.
- **Chauffeurspagina herontwerp:** Samengestelde paginakop met contextbeschrijving.
- **Instellingenpagina herontwerp:** Tabnavigatie in plaats van verticale lijst.
- **Capaciteitspagina:** Statuschips met kleurindicatorstippen, gegroepeerde werkbalk.
- **Datuminvoer:** Alle datumvelden met gestylede invoer en kalenderknop.
- **Subtabellen:** Tonale rijscheidingen op alle subtabellen.
- **Verwijderbevestigingen:** Alle destructieve acties met gestylede bevestigingsdialogen.
- **Typografie:** Manrope lettertype voor paginatitels.

#### Connectiviteitshub

- **Importbronnen:** `ImportSource` datamodel, CRUD API, en beheerscherm met visuele veldkoppelingseditor.
- **CSV-upload:** Uploadfunctie met kolomdetectie, voorbeeldrijen en koppelingvalidatie.

#### Prestaties

- **Map-gebaseerde lookups:** O(1) lookups in het planningsrooster voor alle referentietabellen.

#### Betrouwbaarheid

- **Referentievalidatie:** Alle API-routes valideren dat relaties bestaan.
- **Datumvalidatie:** Einddatum niet voor startdatum bij dienstverbanden, functies en roostertoewijzingen.
- **Transactieveiligheid:** Alle meervoudige databasebewerkingen in transacties.
- **Taalafstemming:** Alle foutmeldingen in alle API-routebestanden in het Nederlands.

#### Toegankelijkheid

- Modale vensters sluiten bij Escape, focusvasthouding, beschrijvende labels voor screenreaders.

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
