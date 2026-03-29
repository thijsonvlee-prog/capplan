# Design Learnings

## Doel
Dit bestand bevat de verzamelde learnings van terugkerende design- en visual polish runs op deze applicatie. Elke volgende run moet dit bestand eerst lezen, zodat eerdere inzichten, keuzes en ontwerpprincipes behouden blijven.

## Gewenste designrichting
- modern SaaS-niveau
- sterk fundament in spacing, hiërarchie, typografie en componentconsistentie
- eigen signatuur zonder gimmicks
- custom UI-details binnen een strak en schaalbaar systeem

## Terugkerende designaandachtspunten
- globals.css was leeg — geen tokens, geen basisstijlen, geen typografiesysteem (opgelost in run 1)
- alle componenten gebruikten losse Tailwind utility classes zonder centraal systeem (grotendeels opgelost in run 1+2)
- sidebar en header waren minimaal en generiek (opgelost in run 1)
- knoppen, inputs en kaarten hadden geen consistente focus/hover/active states (opgelost in run 2)
- er was geen kleurpalet met eigen karakter; alles gebruikte standaard Tailwind grays/blues (opgelost in run 3)
- hardcoded Tailwind gray/blue/white kleuren in tabel- en datacomponenten ondermijnden tokensysteem (opgelost in run 3)

## Bekende designproblemen
| Onderdeel | Probleem | Impact | Status | Opmerking |
|---|---|---|---|---|
| globals.css | Was volledig leeg, geen tokens | Hoog | Opgelost | Tokens, shadows, typography classes toegevoegd |
| Font | Geen custom font geladen | Midden | Opgelost | System font stack met Inter als voorkeur |
| Sidebar | Generiek gray-900, geen brandmark | Midden | Opgelost | Donkerder kleur, brand icon, betere spacing |
| Header | Bijna leeg, geen pagina-context | Midden | Opgelost | Toont nu paginatitel, gebruikt tokens |
| Page titles | Dubbel: in header EN op pagina | Laag | Opgelost | Verwijderd uit individuele pagina's |
| Card surfaces | Alleen `shadow`, geen border, geen token | Midden | Opgelost | shadow-card + border-border-subtle |
| Inputs | Geen focus ring, geen consistent token-gebruik | Midden | Opgelost | .input-field class in globals.css, alle componenten gebruiken deze nu |
| Buttons (primary) | Hardcoded blue-600, geen token | Midden | Opgelost | .btn-primary/.btn-secondary/.btn-icon classes in globals.css |
| Tabel headers | Inconsistente styling | Laag | Opgelost | Alle tabellen gebruiken surface-tertiary + border-default tokens |
| Form labels | Mix van text-sm/text-gray-600/text-gray-700 | Midden | Opgelost | .form-label class, alle formulieren gebruiken deze nu |
| Form controls breed | Alle forms gebruiken losse inline classes | Midden | Opgelost | .input-field + .form-label classes, overal toegepast |
| ZoomSelector/filters | Generieke stijl, geen token-gebruik | Laag | Opgelost | Brand tokens + border-default/surface tokens |
| Modals | Inconsistente overlay/shadow stijlen | Laag | Opgelost | shadow-modal token, surface-primary bg, consistente structuur |
| Density/toolbar buttons | Geen uniforme control stijl | Laag | Opgelost | border-border-default + text-text-secondary + surface-secondary hover |
| Icon buttons (edit/delete) | Mix van inline hover kleuren | Laag | Opgelost | .btn-icon en .btn-icon-danger classes |
| StatusBadge kleuren | Direct in constants.ts, niet in tokens | Laag | Opgelost | Gemigreerd naar success/danger/warning tokens in run 4 |
| Functionele kleuren | Geen success/danger/warning tokens | Midden | Opgelost | 18 tokens toegevoegd (success, danger, warning) in run 4 |
| Toast kleuren | Hardcoded green-*/red-* | Laag | Opgelost | Gemigreerd naar success/danger tokens in run 4 |
| Validatie kleuren | Hardcoded red-400/red-600 | Laag | Opgelost | Gemigreerd naar danger tokens in run 4 |
| Skill badges/toggles | Hardcoded green-50/green-600 | Laag | Opgelost | Gemigreerd naar success tokens in run 4 |
| Ziek-bevestigknop | Hardcoded bg-red-500 | Laag | Opgelost | bg-danger-500 in run 4 |
| btn-icon-danger | Hardcoded hex #dc2626/#fef2f2 | Laag | Opgelost | CSS vars danger-600/danger-50 in run 4 |
| Capacity compare button | orange-100/orange-700 (hardcoded) | Laag | Open | Enige resterende hardcoded kleur; overwegen als apart token |
| Settings card surfaces | SkillManager/RosterProfileEditor gebruikten bg-white/shadow | Laag | Opgelost | surface-primary + shadow-card + border-border-subtle |
| Planning grid borders/headers | Hardcoded gray-50/gray-200 | Midden | Opgelost | Alle borders → border-default, headers → surface-tertiary |
| Capacity page/table | Hardcoded grays, geen tokens | Midden | Opgelost | Volledige migratie naar tokens in run 3 |
| CapacityChart | bg-white, shadow, text-gray-700 | Laag | Opgelost | surface-primary + shadow-card + section-title class |
| CapacitySummaryRow | Hardcoded blue-50/blue-200/gray-200 | Laag | Opgelost | Brand tokens + border-default |
| SubTable borders | border-gray-200 | Laag | Opgelost | border-border-default |
| RosterAssigner table | border-gray-200 | Laag | Opgelost | border-border-default |
| DayCell popup | bg-white, border-gray-200, text-gray-500 | Laag | Opgelost | surface-primary + shadow-dropdown + text-text-secondary |
| StatusSelector | text-gray-400/500, hover:bg-gray-100, text-blue-600 | Laag | Opgelost | text-text-tertiary/secondary, hover:bg-surface-secondary, text-brand-600 |
| WeekSelector | text-gray-400 | Laag | Opgelost | text-text-tertiary |
| RosterProfileEditor | text-gray-400/500 | Laag | Opgelost | text-text-tertiary/secondary |
| DriverList license badge | bg-blue-50 text-blue-700 | Laag | Opgelost | bg-brand-50 text-brand-700 |
| Loading spinners | Hardcoded inline border classes | Laag | Opgelost | .spinner utility class in globals.css |

## Terugkerende designaandachtspunten (bijgewerkt)
- functionele kleuren (success/danger/warning) ontbraken als tokens — nu opgelost in run 4
- StatusBadge kleuren waren hardcoded Tailwind utilities — nu opgelost via functionele tokens
- .btn-icon-danger bevatte nog hardcoded hex — nu opgelost via CSS vars

## Bewezen effectieve designverbeteringen
- CSS @theme tokens voor kleuren, shadows, radius — werkt goed met Tailwind v4
- Typography utility classes (.text-page-title, .text-section-title, .text-label, .text-caption) — herbruikbaar
- Sidebar met brand icon geeft direct meer identiteit
- Header met dynamische paginatitel maakt navigatie duidelijker
- shadow-card + border-subtle combinatie geeft kaarten meer diepte zonder zwaar te zijn
- Scrollbar styling draagt subtiel bij aan een gepolijst gevoel
- .input-field class: één bron voor alle input/select styling, inclusief focus states — grote consistentiewinst
- .btn-primary/.btn-secondary classes: elimineren tientallen varianten van inline button styling
- .btn-icon/.btn-icon-danger: consistente icon button hover states over alle componenten
- .form-label class: uniforme label styling (gewicht, kleur, spacing) over alle formulieren
- .spinner class: herbruikbare loading spinner via globals.css — voorkomt dubbele inline border-constructies
- Systematische replace_all van hardcoded kleuren is effectief en veilig als de tokenlaag al goed staat
- Functionele kleur-tokens (success/danger/warning) geven semantische betekenis aan kleuren; makkelijker te onderhouden dan losse Tailwind green/red/yellow
- STATUS_COLORS migreren naar tokens was onterecht als "risicovol" gemarkeerd — bleek een eenvoudige string-vervanging

## Dingen die weinig opleverden of juist risico gaven
- Google Fonts (Inter) via next/font/google werkt niet in offline/sandbox omgevingen — system font stack is veiliger
- Te veel tegelijk veranderen vergroot risico op regressies; tokens eerst, dan component voor component

## Aandachtspunten voor volgende runs
- Tab component (DriverForm) herbruikbaar maken als shared component
- Toggle chip buttons (rijbewijs, vaardigheden) eigen .chip-toggle class overwegen
- Checkbox/radio styling verbeteren (column picker gebruikt nu accent-brand-600 maar verder browser defaults)
- Spacing tussen secties op settings-pagina evalueren
- Scenario compare buttons op capacity page gebruiken nog orange-100/orange-700 (geen token — enige resterende hardcoded kleur)
- Shared component voor tabel-header styling (nu herhaald patroon: bg-surface-tertiary + text-label)
- Motion/transition systeem: transitions zijn nu ad-hoc per component, geen centraal patroon
- Nu P1+P2 token fundament compleet is: runs kunnen focussen op componentpatronen (tab, chip, tabel-header) en custom UI

## Designgeschiedenis

### 2026-03-28
**Samenvatting**
Eerste design-run. Fundament aangelegd: design tokens, typografie, layout shell verfijning.

**Gekozen ontwerpthema**
Design Tokens & Typography Foundation (P1 fundament)

**Geanalyseerd**
- Alle pagina's, layout, sidebar, header, components
- globals.css (was leeg), constants.ts, alle page-level en component-level styling
- Spacing, typografie, kleur, componentconsistentie, states, density, eigen karakter

**Doorgevoerd**
- globals.css: CSS @theme block met brand kleuren, neutral surfaces, borders, text kleuren, sidebar tokens, shadows, radius
- globals.css: base body styles, focus-visible styling, scrollbar refinement
- globals.css: typography utility classes (page-title, section-title, label, caption)
- layout.tsx: system font stack met Inter voorkeur
- Sidebar: donkerder achtergrond (sidebar-bg), brand icon met CP logo, betere nav spacing, bottom version
- Header: dynamische paginatitel uit pathname, semantic token gebruik
- Dashboard layout: bg-surface-secondary
- Alle pagina's: dubbele h2 titels verwijderd (header toont ze nu)
- DriverList: tabel surface (shadow-card, border-subtle), thead met text-label class, input/button tokens
- StamtabelManager: card surface tokens, typography classes, input focus states, brand button
- CapacityTable: card surface tokens
- PlanningGrid: card surface tokens, input focus state
- Documentatie: card surface tokens, brand button

**Niet doorgevoerd**
- Volledige button component systeem (te breed voor eerste run)
- Form input unificatie over alle componenten (te breed)
- StatusBadge kleur tokens (vereist grotere refactor van constants.ts)
- Modal styling standaardisatie
- ZoomSelector/toolbar control harmonisatie
- Font loading via next/font (geen netwerk beschikbaar)

**Nieuwe learnings**
- Tailwind v4 @theme werkt goed voor CSS custom properties die direct als utility classes beschikbaar komen
- System font stack is betrouwbaarder dan Google Fonts in alle omgevingen
- Kleine token-laag heeft groot effect op consistentie

**Aanbevolen vervolgstappen**
1. ~~Form controls unificeren (inputs, selects)~~ → Opgelost in run 2
2. ~~Button varianten definiëren (primary, secondary, ghost)~~ → Opgelost in run 2
3. ~~Toolbar/filter controls harmoniseren (ZoomSelector, density, column picker)~~ → Opgelost in run 2
4. ~~Modal styling standaardiseren~~ → Opgelost in run 2

### 2026-03-28 (Run 2)
**Samenvatting**
Form control & button unification. Gedeelde CSS utility classes gedefinieerd en toegepast over alle componenten.

**Gekozen ontwerpthema**
Form Controls & Button System (P1 fundament)

**Geanalyseerd**
- Alle 12+ componenten met form controls (DriverForm, DriverList, StamtabelManager, SkillManager, RosterProfileEditor, SubTable, ScenarioSelector, StatusSelector, RosterAssigner, PlanningGrid, ZoomSelector, WeekSelector)
- Inventarisatie van inline input/button/label patronen: 4+ inputvarianten, 3+ buttonvarianten, 3+ label-stijlen

**Doorgevoerd**
- globals.css: .input-field class (border, radius, bg, focus ring via brand-400 token)
- globals.css: .form-label class (font-size, weight, color, spacing)
- globals.css: .btn-primary class (brand-600 bg, shadow-xs, hover, disabled states)
- globals.css: .btn-secondary class (surface-tertiary bg, hover state)
- globals.css: .btn-icon class (tertiary color, brand hover)
- globals.css: .btn-icon-danger class (tertiary color, red hover)
- DriverForm: alle inputs, selects, labels, buttons op nieuwe classes; card surface op tokens; tabs op brand tokens
- DriverForm inline sub-forms (EmploymentForm, PositionForm, RosterForm): idem
- DriverList: table rows, text colors, icon buttons op tokens
- StamtabelManager: edit-mode inputs, dividers, icon buttons op tokens/classes
- SkillManager: volledige card surface, inputs, buttons, icon buttons, dividers op tokens/classes
- RosterProfileEditor: card surface, inputs, buttons, dividers, text colors op tokens/classes
- SubTable: add button, form container, table headers, delete buttons op tokens/classes
- ScenarioSelector: select, icon buttons, modal op tokens/classes
- RosterAssigner: modal, table headers, inputs, labels, buttons op tokens/classes
- StatusSelector: sick percentage input op input-field class
- ZoomSelector: segment buttons op brand/surface tokens
- PlanningGrid: density button, group select, column picker, toggle buttons, bulk modal op tokens
- WeekSelector: nav buttons op btn-icon class

**Niet doorgevoerd**
- Planning grid tabelcellen (border-gray-200) — te risicovol, raakt complexe layout
- StatusBadge kleuren als tokens — vereist refactor van constants.ts
- Shared Tab component — te breed voor deze run
- Toggle chip class voor rijbewijs/vaardigheden — kan in aparte run
- Capacity pagina audit — niet in scope

**Nieuwe learnings**
- CSS utility classes (.input-field, .btn-primary etc.) zijn zeer effectief: één wijziging geldt overal
- Tailwind v4 utility classes overschrijven CSS classes, dus w-full / flex-1 kunnen naast .input-field
- .btn-icon + .btn-icon-danger patroon werkt goed voor consistente icon buttons met verschillende hover-intentie

**Aanbevolen vervolgstappen**
1. ~~Planning grid tabel borders/headers migreren naar tokens~~ → Opgelost in run 3
2. StatusBadge kleuren als design tokens
3. Shared Tab component voor DriverForm en eventueel settings
4. Toggle chip class voor multi-select buttons (rijbewijs, vaardigheden)
5. Checkbox/radio styling verbeteren (column picker)
6. ~~Capacity pagina op tokens brengen~~ → Opgelost in run 3

### 2026-03-28 (Run 3)
**Samenvatting**
Volledige token-migratie: alle resterende hardcoded Tailwind gray/blue/white kleuren in componenten vervangen door design tokens. Spinner utility class toegevoegd.

**Gekozen ontwerpthema**
Token-migratie in tabellen en data-componenten (P1 fundament — consistentie)

**Geanalyseerd**
- Alle 19 componentbestanden gescand op hardcoded kleuren (gray-*, blue-*, bg-white)
- 12 bestanden bevatten nog hardcoded kleuren die al als tokens beschikbaar waren
- Pattern: bg-gray-50 → surface-tertiary, border-gray-200 → border-default, text-gray-400/500 → text-tertiary/secondary, bg-white → surface-primary, text-blue-600 → brand-600, etc.

**Doorgevoerd**
- PlanningGrid.tsx: ~20 kleurverwijzingen gemigreerd (thead, borders, hover states, group rows, sort icons, empty states, driver cells, extra columns, drag selection ring, checkbox)
- CapacityTable.tsx: thead, borders, hover states, summary rows → tokens
- CapacityChart.tsx: card surface (bg-white → surface-primary + shadow-card + border-subtle), section-title class
- CapacitySummaryRow.tsx: blue-50/blue-200 → brand-50/brand-200, borders, text colors → tokens
- SubTable.tsx: alle border-gray-200 → border-border-default
- RosterAssigner.tsx: alle border-gray-200 → border-border-default
- DayCell.tsx: empty cell bg → surface-secondary/tertiary, popup → surface-primary + shadow-dropdown + border-default, text → text-secondary
- StatusSelector.tsx: hover states → surface-secondary, text colors → text-tertiary/secondary, back links → brand-600
- WeekSelector.tsx: loading text → text-tertiary
- RosterProfileEditor.tsx: text-gray-400/500 → text-tertiary/secondary
- DriverList.tsx: license badge bg-blue-50 → bg-brand-50
- Capacity page.tsx: loading spinner, compare button inactive state → surface tokens
- globals.css: .spinner utility class (border-strong + brand-600 top, 0.6s spin animation)
- PlanningGrid + Capacity page: inline spinner → .spinner class

**Niet doorgevoerd**
- StatusBadge kleuren als tokens — vereist refactor van constants.ts STATUS_COLORS map, risicovol voor planning grid rendering
- Scenario compare buttons (orange-100/orange-700) — functionele kleur, beter als apart token
- StatusSelector ziek-bevestigknop (bg-red-500) — functionele destructive color, beter als token
- Shared tabel-header component — te breed voor deze run, patroon is al consistent via tokens

**Nieuwe learnings**
- Na 3 runs zijn er nul hardcoded gray/white Tailwind kleuren meer in .tsx bestanden
- replace_all edits zijn zeer effectief voor token-migratie als de tokenlaag compleet is
- shadow-dropdown token werkt goed voor inline popups (DayCell status selector)
- accent-brand-600 op checkboxen is een subtiele maar effectieve verbetering

**Aanbevolen vervolgstappen**
1. StatusBadge kleuren als design tokens (P2 verfijning)
2. Shared Tab component (P2 structurele verfijning)
3. Toggle chip class voor multi-select buttons (P2)
4. Checkbox/radio custom styling (P3 polish)
5. Functionele kleur-tokens toevoegen (success/warning/danger) voor scenario compare, ziek-bevestig, etc.
6. Motion/transition standaardisatie (P3)
7. Nu het tokenfundament compleet is: volgende runs kunnen focussen op P2/P3 verfijning en custom UI-elementen

### 2026-03-29 (Run 4)
**Samenvatting**
Functionele kleur-tokens (success/danger/warning) toegevoegd en alle hardcoded green/red/yellow Tailwind kleuren in componenten gemigreerd. STATUS_COLORS in constants.ts nu volledig op design tokens. Token-systeem is nu compleet.

**Gekozen ontwerpthema**
Functionele Kleur Tokens (P2 verfijning — semantische kleuren)

**Geanalyseerd**
- Alle .tsx bestanden gescand op resterende hardcoded functionele kleuren (green-*, red-*, yellow-*, orange-*)
- 18 locaties in 14 bestanden gevonden
- STATUS_COLORS in constants.ts: 5 statussen met losse Tailwind utilities
- StatusBadge inline gradient met hardcoded hex
- Toast success/error kleuren
- Validatie-foutmeldingen (red-600, red-400)
- Actief-labels (green-600)
- Beschikbaar-tellers (green-700)
- Skill badges/toggles (green-50/green-600)
- Save/confirm buttons (green-600, red-500)
- .btn-icon-danger hover met hardcoded hex

**Doorgevoerd**
- globals.css @theme: 18 functionele kleur-tokens (success-50/200/300/500/600/700/800/900, danger-50/200/400/500/600/800, warning-200/300/900)
- globals.css: .btn-icon-danger hover van hardcoded #dc2626/#fef2f2 naar var(--color-danger-600)/var(--color-danger-50))
- constants.ts: STATUS_COLORS volledig op tokens (surface-inset, success-700, success-300, warning-300, danger-500)
- StatusBadge.tsx: inline gradient hex → CSS vars (--color-danger-500, --color-success-500, --color-text-inverse)
- DriverForm.tsx: skill toggle bg-green-600 → bg-success-600
- DriverList.tsx: skill badge bg-green-50 text-green-700 → success-50/success-700
- SubTable.tsx: "Actief" label text-green-600 → text-success-600
- RosterAssigner.tsx: "Actief" label text-green-600 → text-success-600
- CapacityTable.tsx: beschikbaar-rij text-green-700 → text-success-700
- CapacitySummaryRow.tsx: beschikbaar-teller text-green-700 → text-success-700
- SkillManager.tsx: validatie text-red-600 → text-danger-600, save button text-green-600 → text-success-600
- StamtabelManager.tsx: idem
- RosterProfileEditor.tsx: validatie border-red-400 → border-danger-400, text-red-600 → text-danger-600
- StatusSelector.tsx: ziek-bevestigknop bg-red-500 → bg-danger-500, verloftype bg-yellow-200 → bg-warning-200
- Toast.tsx: success bg-green-50/text-green-800/border-green-200 → success tokens, error bg-red-50/text-red-800 → danger tokens

**Niet doorgevoerd**
- Capacity page scenario compare button (orange-100/orange-700) — enige resterende hardcoded kleur, past niet in success/danger/warning taxonomie. Documenteren als apart token voor toekomstige run.
- STATUS_CHART_COLORS hex waarden — Recharts vereist string hex, geen CSS vars mogelijk. Overweeg commentaar toevoegen dat deze hex waarden corresponderen met tokens.

**Nieuwe learnings**
- Functionele kleur-tokens geven semantische betekenis: text-danger-600 communiceert intent beter dan text-red-600
- STATUS_COLORS migratie was eenvoudiger dan verwacht; eerder onterecht als risicovol aangemerkt
- Na 4 runs: nul hardcoded kleuren in .tsx bestanden behalve 1 orange compare button
- .btn-icon-danger was laatste CSS-regel met hardcoded hex; nu ook via tokens
- CSS vars werken goed in inline styles voor gradiënten (StatusBadge sick split)
- Het complete tokensysteem omvat nu: brand (10), neutral surfaces (4), borders (3), text (4), sidebar (5), functional (18), shadows (4), radius (4) = 52 design tokens

**Aanbevolen vervolgstappen**
1. Tab component herbruikbaar maken (P2 structurele verfijning)
2. Toggle chip class (.chip-toggle) voor rijbewijs/vaardigheden/filter buttons (P2)
3. Shared tabel-header component of utility class (P2)
4. Checkbox/radio custom styling (P3 polish)
5. Motion/transition standaardisatie (P3)
6. Orange compare token overwegen of negeren (P4 — slechts 1 locatie)
7. Spacing en compositie evalueren op settings/drivers pagina's (P2 structureel)
8. Custom UI-patronen identificeren voor meer eigen signatuur (P3 onderscheidend)
