# UX Learnings

## Doel
Dit bestand bevat de verzamelde learnings van terugkerende UX- en flowscans op deze applicatie. Elke volgende run moet dit bestand eerst lezen, zodat eerdere inzichten, keuzes en valkuilen behouden blijven.

## Terugkerende UX-patronen en aandachtspunten
- De app is Nederlandstalig, maar technische termen en Engelse woorden sluipen er snel in (bijv. sidebar subtitle, labels)
- Destructieve acties (verwijderen) hadden overal geen bevestigingsdialoog — dit is een terugkerend risico bij nieuwe features
- Empty states zijn vaak generiek ("Geen records") en missen guidance over wat de gebruiker kan doen
- Documentatiepagina bevat hardcoded tekst die snel veroudert bij architectuurwijzigingen
- Roosterprofiel-toewijzing heeft complexe gevolgen (364 dagen generatie) die onvoldoende uitgelegd werden aan de gebruiker

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

## Bewezen effectieve verbeteringen
- Bevestigingsdialogen bij verwijderacties: direct hoge waarde, nul risico op regressies
- Taalconsistentie in labels: kleine moeite, merkbaar effect op professionaliteit
- Loading spinners: visueel simpel, grote verbetering in perceived performance
- Contextafhankelijke empty states: helpt gebruikers de volgende stap te vinden
- Helperteksten bij complexe acties: verduidelijkt gevolgen zonder de flow te vertragen

## Dingen die weinig opleverden of juist risico gaven
- Nog geen negatieve ervaringen geregistreerd (eerste scan)

## Aandachtspunten voor volgende runs
- Controleer of nieuwe features bevestigingsdialogen hebben bij destructieve acties
- Controleer of nieuwe lege states guidance geven
- Controleer of nieuwe labels/teksten in het Nederlands zijn
- Overweeg een toast/notificatiesysteem voor succesfeedback na acties
- Overweeg of de DriverForm edit-flow beter kan (modal vs inline)
- Controleer of documentatiepagina nog actueel is na architectuurwijzigingen
- Let op of het ziekpercentage-bereik (0-99) verwarring oplevert bij gebruikers
- De Header biedt ruimte voor contextuele informatie (breadcrumbs, actief scenario, etc.)

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
