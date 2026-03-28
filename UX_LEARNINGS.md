# UX Learnings

## Doel
Dit bestand bevat de verzamelde learnings van terugkerende UX- en flowscans op deze applicatie. Elke volgende run moet dit bestand eerst lezen, zodat eerdere inzichten, keuzes en valkuilen behouden blijven.

## Terugkerende UX-patronen en aandachtspunten
- De app is Nederlandstalig, maar technische termen en Engelse woorden sluipen er snel in (bijv. sidebar subtitle, labels, HTML title)
- Destructieve acties (verwijderen) hadden overal geen bevestigingsdialoog — dit is een terugkerend risico bij nieuwe features
- Verwijderbevestigingen moeten specifiek zijn: toon wát er verwijderd wordt (naam, datum), niet "dit record"
- Empty states zijn vaak generiek ("Geen records") en missen guidance over wat de gebruiker kan doen
- Documentatiepagina bevat hardcoded tekst die snel veroudert bij architectuurwijzigingen
- Roosterprofiel-toewijzing heeft complexe gevolgen (364 dagen generatie) die onvoldoende uitgelegd werden aan de gebruiker
- Afkortingen in de UI (bijv. "B", "A" voor roosterstatussen) zijn cryptisch voor nieuwe gebruikers
- Invoervelden met eenheden (percentages, uren) moeten het eenheidssymbool bij het veld tonen

## Bekende UX-problemen
| Onderdeel | Probleem | Impact | Status | Opmerking |
|---|---|---|---|---|
| Alle verwijderacties | Geen bevestigingsdialoog | Hoog — onbedoeld dataverlies | Opgelost | Confirm dialogen toegevoegd |
| Sidebar subtitle | "Driver Planning Tool" (Engels) | Laag — inconsistentie | Opgelost | Gewijzigd naar "Chauffeurplanning" |
| Dichtheidslabel | "Gezellig" onprofessioneel | Laag — verwarring | Opgelost | Gewijzigd naar "Normaal" |
| Header versie | "v1.0" terwijl app v2.0 is | Laag — verwarrend | Opgelost | Bijgewerkt naar v2.0 |
| Skills header | "(Stamtabel)" jargon | Laag — onnodig technisch | Opgelost | Verwijderd |
| Documentatie | Verwees nog naar localStorage | Middel — misleidend | Opgelost | Bijgewerkt naar PostgreSQL/Prisma |
| Planningsgrid loading | Alleen tekst "Laden..." | Laag — geen visuele indicator | Opgelost | Spinner + betere tekst toegevoegd |
| Lege states | Generiek/inconsistent | Middel — geen guidance | Opgelost | Contextafhankelijke teksten toegevoegd |
| Rooster toewijzen knop | "Toewijzen (1 jaar)" onduidelijk | Middel — gevolg niet helder | Opgelost | Helpertekst toegevoegd |
| Dropdown placeholders | Inconsistent ("-- Selecteer --" vs "-- Selecteer profiel --") | Laag | Opgelost | Geconsistentiseerd |
| Capaciteit loading | Geen loading state | Laag | Opgelost | Spinner toegevoegd |
| Geen succesfeedback | Geen toast/melding na acties | Middel — onzekerheid | Open | Vereist toast-systeem, grotere wijziging |
| DriverList edit flow | Edit verschijnt inline, weinig onderscheid met create | Laag | Open | Overweeg modal of duidelijker visueel onderscheid |
| Header leeg | Grotendeels ongebruikte ruimte | Laag | Open | Kan later benut worden voor breadcrumbs of contextuele info |
| Ziekpercentage range | 0-99, niet 0-100 | Laag | Open | 100% aanwezig = niet ziek, maar range is vreemd voor gebruikers |
| Geen succesfeedback | Geen toast/melding na acties (opslaan, verwijderen, toewijzen) | Middel | Open | Vereist toast-systeem, grotere wijziging |
| StatusSelector inconsistentie | Verlof: klik op type = direct opslaan. Ziek: apart "Bevestigen" nodig | Laag | Open | Twee patronen voor hetzelfde type interactie |
| DriverList niet sorteerbaar | Geen kolomsortering, bij veel chauffeurs moeilijk navigeerbaar | Middel | Open | PlanningGrid heeft wél sortering |
| DriverForm computed velden | Actuele gegevens lijken bewerkbaar maar zijn read-only | Laag | Open | Visueel onderscheid ontbreekt (bijv. disabled styling) |
| ScenarioSelector dubbel dupliceren | "Kopie van Kopie van..." bij herhaald dupliceren | Laag | Open | Naamgeving wordt onwerkbaar |

## Bewezen effectieve verbeteringen
- Bevestigingsdialogen bij verwijderacties: direct hoge waarde, nul risico op regressies
- Specifieke verwijderbevestigingen (met naam/datum): meer vertrouwen voor de gebruiker, nul extra risico
- Taalconsistentie in labels: kleine moeite, merkbaar effect op professionaliteit
- Loading spinners: visueel simpel, grote verbetering in perceived performance
- Contextafhankelijke empty states: helpt gebruikers de volgende stap te vinden
- Helperteksten bij complexe acties: verduidelijkt gevolgen zonder de flow te vertragen
- Uitgeschreven labels i.p.v. afkortingen: maakt de app direct begrijpelijker voor nieuwe gebruikers
- Eenheidsindicatoren bij invoervelden: voorkomt verwarring over wat er ingevuld moet worden

## Dingen die weinig opleverden of juist risico gaven
- Nog geen negatieve ervaringen geregistreerd (eerste scan)

## Aandachtspunten voor volgende runs
- Controleer of nieuwe features bevestigingsdialogen hebben bij destructieve acties
- Controleer of verwijderbevestigingen specifiek zijn (toon naam/datum, niet "dit record")
- Controleer of nieuwe lege states guidance geven
- Controleer of nieuwe labels/teksten in het Nederlands zijn (ook HTML title, meta tags)
- Controleer of afkortingen in de UI uitgeschreven of tenminste verklaard zijn
- Overweeg een toast/notificatiesysteem voor succesfeedback na acties
- Overweeg of de DriverForm edit-flow beter kan (modal vs inline)
- Controleer of documentatiepagina nog actueel is na architectuurwijzigingen
- Let op of het ziekpercentage-bereik (0-99) verwarring oplevert bij gebruikers
- De Header biedt ruimte voor contextuele informatie (breadcrumbs, actief scenario, etc.)
- DriverList heeft geen sortering — bij groei van chauffeursbestand wordt dit problematisch
- StatusSelector heeft twee verschillende interactiepatronen voor Verlof en Ziek — harmoniseren?
- ScenarioSelector: dupliceernaamgeving "Kopie van..." kan onwerkbaar worden bij herhaald gebruik

## Scan- en wijzigingsgeschiedenis

### 2026-03-28
**Samenvatting**
- Eerste volledige UX- en flowscan uitgevoerd op alle 5 pagina's en 17 componenten

**Geanalyseerd**
- Sidebar, Header, PlanningGrid, DayCell, StatusSelector, WeekSelector, ZoomSelector, ScenarioSelector, RosterAssigner, StatusBadge
- DriverList, DriverForm, SubTable
- CapacityChart, CapacityTable
- StamtabelManager, SkillManager, RosterProfileEditor
- Documentatiepagina (hardcoded documentatie)
- Navigatiestructuur, formulierflows, verwijderacties, loading/empty/error states

**Doorgevoerd**
1. Sidebar subtitle: "Driver Planning Tool" -> "Chauffeurplanning" (taalconsistentie)
2. Header versie: "v1.0" -> "v2.0" (correctheid)
3. Dichtheidslabel: "Gezellig" -> "Normaal" (professionaliteit)
4. Skills header: "(Stamtabel)" verwijderd (jargon)
5. Bevestigingsdialogen toegevoegd bij alle verwijderacties:
   - ScenarioSelector (met scenarionaam en waarschuwing dataverlies)
   - StamtabelManager (met recordnaam)
   - SkillManager (met vaardigheidsnaam)
   - RosterProfileEditor (met profielnaam)
   - SubTable (generiek record)
   - RosterAssigner (generiek record)
6. Planning loading state: spinner + "Planning laden..." tekst
7. Capacity loading state: spinner + "Capaciteitsgegevens laden..." tekst
8. Lege states verbeterd:
   - PlanningGrid: contextafhankelijk (filter vs geen chauffeurs)
   - DriverList: contextafhankelijk (zoekresultaat vs lege lijst)
9. "Toewijzen (1 jaar)" -> "Toewijzen" + helpertekst over 364-dagen cyclus
10. Dropdown placeholder geconsistentiseerd naar "-- Selecteer --"
11. Documentatiepagina: localStorage-verwijzingen vervangen door PostgreSQL/Prisma
12. Documentatie architectuursectie herschreven voor huidige API-route-architectuur
13. Documentatie broncode-structuur bijgewerkt

**Niet doorgevoerd**
- Toast/notificatiesysteem: vereist nieuwe dependency of eigen component, te groot voor deze run
- DriverForm edit-flow modal: te groot ontwerp-besluit voor automatische doorvoering
- Header vullen met contextuele info: vereist product-besluit
- Ziekpercentage range aanpassen: vereist businesslogica-wijziging

**Nieuwe learnings**
- De documentatiepagina is hardcoded als string in de component — bij elke architectuurwijziging moet deze handmatig worden bijgewerkt
- Alle stamtabel-managers (werkgevers, afdelingen, locaties, verloftypes) gebruiken hetzelfde StamtabelManager component, waardoor verbeteringen daar breed doorwerken
- De app heeft een consistent designsysteem: bg-blue-600 voor primaire acties, bg-gray-100 voor secundaire, hover-states overal aanwezig

**Aanbevolen vervolgstappen**
1. Toast/succesfeedback implementeren (bijv. na opslaan, verwijderen, toewijzen)
2. DriverForm edit-flow heroverwegen (modal met duidelijker context)
3. Header benutten voor contextuele informatie
4. Ziekpercentage-range evalueren met gebruikers

### 2026-03-28 (run 2)
**Samenvatting**
- Tweede UX-scan met focus op taalconsistentie, verwijderbevestigingen, empty states, cryptische afkortingen en invoervelden

**Geanalyseerd**
- Alle 6 pagina's (planning, capacity, drivers, settings, documentatie, root)
- Alle 17 componenten opnieuw doorgelopen
- Layout (Sidebar, Header, DashboardLayout, RootLayout)
- Focus op: taalconsistentie, verwijderflows, empty states, formulierinvoer, afkortingen

**Doorgevoerd**
1. HTML title: "Driver Planning Tool" → "Chauffeurplanning" (taalconsistentie)
2. DriverList zoekplaceholder: "Zoek chauffeur..." → "Zoek op naam of personeelsnummer..." (duidelijkheid)
3. RosterProfileEditor profielsamenvatting: "(4 B, 5 A)" → "(4 basisdagen, 5 aanvullend)" (begrijpelijkheid)
4. RosterProfileEditor empty state: "Geen roosterprofielen" → met guidance over volgende stap
5. SkillManager empty state: "Geen vaardigheden gedefinieerd" → met guidance over koppeling aan chauffeurs
6. StamtabelManager empty state: "Geen records" → dynamisch met sectienaam (bijv. "Nog geen werkgevers toegevoegd.")
7. SubTable verwijderbevestiging: "dit record" → toont begindatum van het record
8. RosterAssigner verwijderbevestiging: "dit roosterrecord" → toont profielnaam en ingangsdatum
9. StatusSelector ziekpercentage: eenheidsindicator "%" toegevoegd naast invoerveld

**Niet doorgevoerd**
- Toast/notificatiesysteem: vereist aparte component of dependency, te groot voor deze run
- DriverList sortering: vereist state management en UI voor sorteerknoppen, middelgroot
- StatusSelector harmonisatie (Verlof vs Ziek flow): vereist UX-besluit over gewenst patroon
- DriverForm computed velden visueel onderscheiden: vereist designkeuze (disabled styling vs apart blok)
- ScenarioSelector dupliceernaamgeving: vereist logica voor nummering, klein maar gevoelig

**Nieuwe learnings**
- Verwijderbevestigingen met context (naam, datum) zijn eenvoudig te implementeren en verhogen direct het vertrouwen van de gebruiker
- Dynamische empty states (met sectienaam) werken goed bij herbruikbare componenten zoals StamtabelManager
- HTML <title> wordt makkelijk vergeten bij taalconsistentie-checks — ook meta tags controleren
- De StatusSelector heeft twee fundamenteel verschillende interactiepatronen: directe selectie (Verlof) vs. invoer + bevestiging (Ziek). Dit is een bewuste designkeuze maar kan verwarrend zijn.

**Aanbevolen vervolgstappen**
1. Toast/succesfeedback implementeren (hoogste prioriteit UX-verbetering)
2. DriverList sortering toevoegen (klik op kolomkop)
3. StatusSelector Verlof/Ziek-flow harmoniseren
4. DriverForm computed velden visueel onderscheiden van bewerkbare velden
5. Documentatiepagina opnieuw valideren op actualiteit
