# POC Experiments

## Doel
Dit bestand bevat een logboek van kleine experimentele functionaliteiten die aan de applicatie zijn toegevoegd om snel te toetsen of iets waardevol is. Elke volgende run moet dit bestand eerst lezen, zodat eerdere experimenten, voorkeuren en afwijzingen meegenomen worden.

## Richtlijnen voor experimenten
- Houd experimenten klein
- Houd experimenten logisch passend bij de applicatie
- Vermijd grote architectuurwijzigingen
- Bouw experimenten zo dat ze makkelijk te verwijderen zijn
- Geef voorkeur aan zichtbare, testbare en afgebakende functionaliteit

## Historie van experimenten
| Datum | Naam | Onderdeel | Doel | Status | Opmerking |
|---|---|---|---|---|---|
| 2026-03-28 | Capacity Summary Row | Planning Grid | Inline capaciteitsoverzicht per kolom in de planningtabel | Ingebouwd | Togglebaar via "Totalen" knop, makkelijk verwijderbaar (label gewijzigd van "Σ Totalen" naar "Totalen" door UX-run 3) |

## Terugkerende inzichten
- De PlanningGrid is het meest zichtbare en meest gebruikte scherm — experimenten hier hebben direct impact
- Data is al geladen in de PlanningGrid (drivers + entries), dus client-side berekeningen zijn gratis
- De app is Nederlandstalig — labels en tooltips altijd in het Nederlands
- Geen database-migraties nodig voor UI-experimenten die bestaande data hergebruiken

## Cross-domain aandachtspunten
- Lees voor nieuwe experimenten op PlanningGrid ook TECH_DEBT_LEARNINGS.md: PlanningGrid is al 709 regels en kandidaat voor opsplitsing. Nieuwe experimenten hier vergroten de complexiteit.
- Spiegel experimenten altijd tegen UX_LEARNINGS.md: labels in het Nederlands, geen cryptische symbolen, bevestigingsdialogen bij destructieve acties.
- Als een experiment database-wijzigingen vereist, check PERFORMANCE_LEARNINGS.md voor batch-patronen en PERFORMANCE_OBSERVABILITY.md voor instrumentatie.

## Ideeën voor volgende experimenten
- Weeknummers met kleurindicatie (groen/oranje/rood) op basis van bezettingsgraad
- "Vandaag" markering als visuele highlight in de planningkolommen
- Snelle conflictsignalering: markeer chauffeurs die > X dagen achtereen ingeroosterd staan
- Mini-trendgrafiek per chauffeur (sparkline) in de naamkolom
- Export-knop voor het zichtbare planningsvenster (CSV)
- Drag-and-drop kopie van planningspatroon naar andere chauffeurs

## Experimentdetails

### 2026-03-28 - Capacity Summary Row

**Waarom dit experiment**
- Planners moeten nu naar het aparte Capaciteit-scherm navigeren om te zien hoeveel chauffeurs per dag beschikbaar zijn
- Een inline samenvatting onderaan de planningtabel bespaart navigatie en geeft direct context
- Het antwoord op "heb ik genoeg mensen?" is de meest gestelde vraag bij het plannen

**Wat is toegevoegd**
- Een samenvattingsrij onderaan de planningtabel die per kolom (dag/week/maand/etc) toont hoeveel chauffeurs er per status zijn
- Compact view: toont alleen "beschikbaar" (Basisrooster + Aanvullend beschikbaar) vs totaal
- Uitklapbaar: klik om alle 5 statussen per kolom te zien
- Togglebaar via een "Σ Totalen" knop in de filterbalk
- Standaard ingeschakeld

**Waar in de app**
- Planning-pagina, onderaan de planningtabel (als `<tfoot>`-achtige rijen in de `<tbody>`)

**Bestanden geraakt**
- `src/components/planning/CapacitySummaryRow.tsx` — **NIEUW** — volledig zelfstandige component
- `src/components/planning/PlanningGrid.tsx` — 3 kleine wijzigingen:
  1. Import van CapacitySummaryRow (regel ~17)
  2. `showCapacitySummary` state variabele (regel ~76)
  3. Toggle-knop "Totalen" in toolbar (regel ~443) — label gewijzigd door UX-run 3
  4. Rendering van `<CapacitySummaryRow>` in tbody (regel ~530)

**Waarom dit klein en omkeerbaar is**
- Alle logica zit in één nieuw bestand (`CapacitySummaryRow.tsx`)
- Slechts 3 kleine toevoegingen aan PlanningGrid (import, state, render)
- Geen database-wijzigingen
- Geen nieuwe API calls (berekent alles client-side uit reeds geladen data)
- Geen nieuwe dependencies
- Geen wijzigingen aan bestaande functionaliteit

**Hoe te verwijderen**
1. Verwijder `src/components/planning/CapacitySummaryRow.tsx`
2. Verwijder uit `PlanningGrid.tsx`:
   - De import regel voor `CapacitySummaryRow`
   - De `showCapacitySummary` state regel
   - De "Totalen" toggle-knop
   - Het `<CapacitySummaryRow>` render-blok in tbody
3. Klaar — geen database, geen API, geen andere bestanden geraakt

**Beperkingen / aandachtspunten**
- Bij veel chauffeurs (>100) en dagweergave met 56 kolommen kan de berekening per render wat kosten — `React.memo` vangt dit deels op
- De samenvattingsrij scrollt mee met de tabel (niet sticky aan onderkant) — bij lange lijsten moet je scrollen om hem te zien
- Toont alleen aantallen, geen percentages of drempelwaarden

**Aanbevolen beoordeling door gebruiker**
- Open het Planning-scherm met een aantal chauffeurs die roosters/statussen hebben
- Bekijk de samenvattingsrij onderaan: toont het nuttige informatie?
- Klik op "▸ Beschikbaar" om de uitgebreide weergave te zien
- Toggle de "Totalen" knop om te bevestigen dat aan/uit werkt
- Wissel van dagweergave naar weekweergave — past de samenvatting zich aan?
- Beoordeel: is dit waardevoller dan naar het Capaciteit-scherm navigeren?
