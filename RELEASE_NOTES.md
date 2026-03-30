# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

### CSV-import uitvoeren

- **Importuitvoering:** Gebruikers kunnen nu een CSV-bestand uploaden, de veldkoppelingen bekijken, en de import daadwerkelijk uitvoeren. Het systeem valideert alle rijen vooraf, importeert geldige rijen in een transactie, en toont een samenvatting met het aantal geïmporteerde en overgeslagen rijen en eventuele fouten per rij.
- **Importgeschiedenis:** Per importbron is nu een logboek beschikbaar met de laatste 20 imports. Elk logboekitem toont datum, bestandsnaam, aantal rijen, en eventuele fouten (uitklapbaar).
- **Doelentiteiten:** Import ondersteunt chauffeurs (voornaam, achternaam, personeelsnummer, rijbewijscategorieën), werkgevers, afdelingen en standplaatsen (code, omschrijving). Dubbele codes worden automatisch overgeslagen.

### Inloggen en sessie-UI

- **Inlogpagina:** Nieuwe inlogpagina (`/login`) met ondersteuning voor inloggen via Google en Microsoft. Samengesteld ontwerp met merkpaneel en inlogformulier. Alle tekst in het Nederlands.
- **Sessie-indicator:** De koptekstbalk toont nu de ingelogde gebruiker met profielfoto (of initialen), naam en uitlogknop.
- **Routebeveiliging:** Niet-ingelogde gebruikers worden automatisch doorgestuurd naar de inlogpagina.

## Release History

### 2026-03-30 — Authenticatie-infrastructuur, CSV-upload en documentatie

#### Authenticatie

- **NextAuth.js infrastructuur:** Authenticatie-infrastructuur opgezet met NextAuth.js v4. Ondersteuning voor inloggen via Google en Microsoft (Azure AD). Gebruikerssessies worden opgeslagen in de database via Prisma-adapter. Sessie bevat gebruikers-ID en rol. Auth is conditioneel actief — de applicatie werkt zonder auth-configuratie, maar inloggen vereist dat provideromgevingsvariabelen zijn ingesteld (`NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`/`SECRET` of `AZURE_AD_CLIENT_ID`/`SECRET`/`TENANT_ID`).

#### Connectiviteitshub

- **CSV-bestand uploaden:** Nieuwe uploadfunctie voor CSV-bestanden per importbron. Ondersteunt komma-, puntkomma- en tabgescheiden bestanden, aanhalingstekens in velden, en BOM-detectie. Na upload worden gedetecteerde kolommen getoond, een voorbeeld van de eerste 5 rijen, validatie van geconfigureerde veldkoppelingen (welke kolommen gevonden zijn), en niet-gekoppelde kolommen. Uploadknop toegevoegd per importbron in het connectiviteitstabblad.

#### Documentatie

- **CLAUDE.md herschreven:** Volledig herschreven projecthandboek dat de huidige applicatiestaat weerspiegelt: bijgewerkte bestandsstructuur, alle 27 API-routes, 21 databasemodellen, ontwerpstrategie (uit DESIGN.md), authenticatie-infrastructuur, hooks, componentenbibliotheek en configuratiereferenties.

### 2026-03-30 — Connectiviteitshub en codekwaliteit

#### UX / design verbeteringen

- **Knopsysteem uitgebreid:** Nieuwe `.btn-danger` CSS-klasse toegevoegd voor destructieve acties. Bevestigingsdialogen en documentatiepagina gebruiken nu herbruikbare knopklassen in plaats van inline stijlen.

- **Importbronnen beheerinterface:** Nieuw tabblad "Connectiviteit" in de instellingenpagina voor het configureren van CSV-importbronnen. Ondersteuning voor aanmaken, bewerken en verwijderen van importconfiguraties met visuele veldkoppelingseditor. Elke bron bevat een naam, doelentiteit (chauffeurs, werkgevers, afdelingen, standplaatsen), optionele omschrijving en veldkoppelingen die CSV-kolommen aan doelvelden koppelen. Overzichtslijst toont alle bronnen met type-badge, doelentiteit, aantal koppelingen en koppelingschips.
- **Planningspagina koptekst:** De koptekstbalk op de planningspagina toont nu het actieve scenario ("Basisplanning" of scenarionaam), consistent met de capaciteits- en chauffeurspagina. Alle drie de hoofdpagina's tonen nu contextuele informatie in de koptekst.

#### Prestaties

- **DriverForm Map-memoization:** Werkgever-, afdeling- en standplaats-lookups in het chauffeurformulier worden nu met `useMemo` gecached, consistent met het Map-patroon in het planningsrooster.

#### Interne kwaliteit

- **Dode code verwijderd:** Tien ongebruikte hulpfuncties verwijderd uit `utils.ts` en het ongebruikte `StamtabelType` enum uit `enums.ts`. Zeven ongebruikte imports opgeruimd. `utils.ts` bevat nu alleen actief gebruikte functies.

### 2026-03-29 — Ontwerp, prestaties en betrouwbaarheid

#### UX / design verbeteringen

- **Koptekst met context:** De koptekstbalk toont nu contextuele informatie per pagina. De capaciteitspagina toont het actieve scenario ("Basisplanning" of scenarionaam). De chauffeurspagina toont het aantal chauffeurs.
- **Waarschuwingstokens uitgebreid:** Drie nieuwe waarschuwingskleuren toegevoegd (warning-50, warning-500, warning-700) voor meer genuanceerde badge-styling. "Concept" scenario-badge gebruikt nu een subtielere kleurcombinatie.
- **Planningsrooster herontwerp:** Tonale lagen in plaats van rasterlijnen. Chauffeursnamen als "Achternaam, Voornaam" met dikkere typografie. Statuscellen met kleurindicatorstippen. Statusselectiemenu opent naast de aangeklikte cel.
- **Planningsrooster werkbalk:** Beide werkbalkrijen gebruiken consistent `.control-group`-patroon met labels. Statuslegende in eigen visuele groep met "Status" label.
- **Scenario-badge:** "Concept" badge bij scenarioselectie gebruikt ontwerptokens in plaats van directe Tailwind-kleuren.
- **Chauffeurspagina herontwerp:** Samengestelde paginakop met contextbeschrijving. Tonale rijafwisseling en subtiele scheidingslijnen.
- **Instellingenpagina herontwerp:** Tabnavigatie (Stamgegevens, Competenties, Roosters) in plaats van verticale lijst. Invoervelden met gestylede `input-field` klasse.
- **Capaciteitspagina:** Statuschips met kleurindicatorstippen. Werkbalk met gegroepeerde bedieningselementen. Actieve scenariotoggle gebruikt merkkleuren.
- **Datuminvoer:** Alle datumvelden gebruiken een gestylede invoer met kalenderknop.
- **Subtabellen:** Tonale rijscheidingen en afwisselende achtergrondtinten op alle subtabellen (dienstverbanden, functies, roostertoewijzingen).
- **Roosterprofiel-editor:** Kleurindicatorstippen bij elke statuscel.
- **Roostertoewijzingsvenster:** Tonale rijscheidingen, kaartoppervlak. Chauffeurnaam als "Achternaam, Voornaam". Actieve toewijzingen met groene achtergrond.
- **Verwijderbevestigingen:** Alle destructieve acties gebruiken gestylede bevestigingsdialogen.
- **Volledige paginakoppen:** Koppen, verplichte-veldmarkeringen en toastmeldingen op alle schermen.
- **Typografie:** Manrope lettertype toegevoegd voor paginatitels. Titels hebben nu sterker visueel gewicht en duidelijkere hiërarchie.
- **Koptekstbalk:** Rand onder de koptekst verwijderd; scheiding via kleurverschil. Overtollig "CapPlan" label verwijderd.

#### Toegankelijkheid

- Modale vensters sluiten bij Escape, focus wordt vastgehouden, beschrijvende labels voor screenreaders.

#### Prestaties

- **Map-gebaseerde lookups:** Alle lookups in het planningsrooster (werkgever, afdeling, standplaats, verloftype, planning-entries) geoptimaliseerd van lineair zoeken naar O(1) Map-lookup. Bij 50 chauffeurs × 90 dagen scheelt dit duizenden lineaire zoekopdrachten per renderbeurt.
- Planningsrooster herberekent gefilterde chauffeurlijst alleen wanneer data of filter wijzigen.

#### Connectiviteitshub

- **Importbronnen datamodel:** Nieuw `ImportSource` model toegevoegd aan de database voor het configureren van CSV-importbronnen met veldkoppelingen.
- **Importbronnen API:** Volledige CRUD API (`/api/import-sources`) met validatie van verplichte velden, doelentiteiten en veldkoppelingsformaat. Foutmeldingen in het Nederlands.

#### Betrouwbaarheid

- **Referentievalidatie:** Alle API-routes die relaties aanmaken valideren dat referenties bestaan. Ongeldige referenties geven een duidelijke 400-fout in het Nederlands.
- **Datumvalidatie:** Dienstverband-, functie- en roostertoewijzingroutes valideren dat einddatum niet voor startdatum ligt.
- **Transactieveiligheid:** Alle meervoudige databasebewerkingen in transacties, inclusief PUT-routes.
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
