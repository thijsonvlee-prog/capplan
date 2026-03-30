# Release Notes

## Purpose

This is the central release log for CapPlan. All user-facing and significant internal changes are documented here. The Product Owner Agent updates this file when work is completed and deployed.

## Unreleased

### UX / design verbeteringen

- **Rolbewuste interface:** De interface past zich nu aan op basis van de rol van de ingelogde gebruiker. Kijkers (VIEWER) zien geen bewerkingsknoppen meer op het planningsscherm, chauffeurscherm en scenario's. Niet-beheerders zien geen schrijfknoppen meer op de instellingenpagina en het tabblad "Gebruikers" is alleen zichtbaar voor beheerders. Wanneer authenticatie niet is geconfigureerd, blijven alle acties beschikbaar.
- **Instellingen-tabbladen op smal scherm:** De tabbalk op de instellingenpagina scrollt nu horizontaal op smalle schermen in plaats van tekst af te kappen of te laten terugvloeien.

### Betrouwbaarheid

- **JSON-parseerbeveiliging:** Alle 23 POST/PUT API-routes gebruiken nu een gedeelde `parseJsonBody()` helper die ongeldige JSON afvangt en een duidelijke 400-foutmelding ("Ongeldige JSON in verzoek") teruggeeft in plaats van een generieke 500-fout. Relevant voor externe integraties die data naar de import-API sturen.

### Documentatie

- **Authenticatie-setuphandleiding:** Nieuw `AUTH_SETUP.md` document met stapsgewijze instructies voor het configureren van authenticatie in Vercel. Behandelt alle vereiste omgevingsvariabelen, generatie van `NEXTAUTH_SECRET`, Google OAuth-setup, Azure AD-setup, verificatiestappen, roloverzicht en probleemoplossing.

## Release History

### 2026-03-30 — Bugfix: server error bij openen applicatie

#### Bugfix

- **Server error opgelost:** De applicatie gaf een "Server error — There is a problem with the server configuration" fout bij het openen wanneer authenticatie niet volledig was geconfigureerd. De middleware voor routebeveiliging vereiste `NEXTAUTH_SECRET`, terwijl de rest van de applicatie daar niet van afhankelijk was. De middleware slaat authenticatie nu over wanneer `NEXTAUTH_SECRET` niet is ingesteld, zodat de applicatie ook zonder authenticatieconfiguratie werkt.

### 2026-03-30 — Rolhandhaving en importvalidatie

#### Beveiliging

- **Rolhandhaving op API-routes:** Alle schrijfbewerkingen (POST/PUT/DELETE) vereisen nu de juiste rol. Beheerders (Admin) hebben volledige toegang. Planners kunnen chauffeurs, planning en scenario's beheren. Kijkers hebben alleen leestoegang. Ongeautoriseerde verzoeken worden afgewezen met 401 of 403 en een duidelijke Nederlandse foutmelding.
- **Rechtenmatrix:** Settings, gebruikersbeheer, importbronnen en roosterprofielen vereisen Admin-rechten. Chauffeurs, planning en scenario's vereisen Planner-rechten. Voorkeuren zijn beschikbaar voor alle ingelogde gebruikers.
- **Ontwikkelomgevingen:** Rolhandhaving wordt automatisch overgeslagen als `NEXTAUTH_SECRET` niet is ingesteld, zodat lokale ontwikkeling en preview-omgevingen zonder authenticatie blijven werken.

#### Betrouwbaarheid

- **Veldkoppelingsvalidatie verbeterd:** Import-bronnen valideren nu diepgaand dat veldkoppelingen een geldig object zijn met niet-lege tekst als sleutels en waarden. Doelvelden worden gevalideerd tegen een lijst per entiteit (chauffeurs, werkgevers, afdelingen, standplaatsen). Ongeldige configuraties worden nu direct bij opslaan afgewezen.

#### Interne kwaliteit

- **CLAUDE.md bijgewerkt:** Authenticatiesecties aangepast om aan te geven dat rolhandhaving actief is.
- **0 ESLint-waarschuwingen, 0 typecheck-fouten.**

### 2026-03-30 — Gebruikersbeheer, inloggen, CSV-import en authenticatie

#### Functionele verbeteringen

- **Gebruikersbeheer:** Nieuw tabblad "Gebruikers" op de instellingenpagina. Toont alle gebruikers met profielfoto, naam, e-mailadres, rol en lidmaatschapsdatum. Beheerders kunnen rollen toewijzen (Admin, Planner, Kijker) via klikbare rolbadges met bevestigingsdialoog.
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
