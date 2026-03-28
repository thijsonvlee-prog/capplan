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
- er was geen kleurpalet met eigen karakter; alles gebruikte standaard Tailwind grays/blues (grotendeels opgelost)

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
| Tabel headers | Inconsistente styling | Laag | Deels opgelost | DriverList thead gebruikt text-label class |
| Form labels | Mix van text-sm/text-gray-600/text-gray-700 | Midden | Opgelost | .form-label class, alle formulieren gebruiken deze nu |
| Form controls breed | Alle forms gebruiken losse inline classes | Midden | Opgelost | .input-field + .form-label classes, overal toegepast |
| ZoomSelector/filters | Generieke stijl, geen token-gebruik | Laag | Opgelost | Brand tokens + border-default/surface tokens |
| Modals | Inconsistente overlay/shadow stijlen | Laag | Opgelost | shadow-modal token, surface-primary bg, consistente structuur |
| Density/toolbar buttons | Geen uniforme control stijl | Laag | Opgelost | border-border-default + text-text-secondary + surface-secondary hover |
| Icon buttons (edit/delete) | Mix van inline hover kleuren | Laag | Opgelost | .btn-icon en .btn-icon-danger classes |
| StatusBadge kleuren | Direct in constants.ts, niet in tokens | Laag | Open | Overwegen bij P2 verfijning |
| Settings card surfaces | SkillManager/RosterProfileEditor gebruikten bg-white/shadow | Laag | Opgelost | surface-primary + shadow-card + border-border-subtle |

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

## Dingen die weinig opleverden of juist risico gaven
- Google Fonts (Inter) via next/font/google werkt niet in offline/sandbox omgevingen — system font stack is veiliger
- Te veel tegelijk veranderen vergroot risico op regressies; tokens eerst, dan component voor component

## Aandachtspunten voor volgende runs
- StatusBadge kleuren overwegen als design tokens (nu in constants.ts)
- Planning grid table header styling verder afstemmen op tokens (bg-gray-50 → surface-tertiary)
- Planning grid table borders (border-gray-200) nog niet op tokens
- Spacing tussen secties op settings-pagina evalueren
- Tab component (DriverForm) herbruikbaar maken als shared component
- Toggle chip buttons (rijbewijs, vaardigheden) eigen chip-class overwegen
- Subtable thead/tbody borders nog op gray-200 i.p.v. tokens
- Checkbox styling in column picker nog standaard browser
- Loading spinner (PlanningGrid) als herbruikbaar component
- Capacity page nog niet geaudit op token-gebruik

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
1. Planning grid tabel borders/headers migreren naar tokens
2. StatusBadge kleuren als design tokens
3. Shared Tab component voor DriverForm en eventueel settings
4. Toggle chip class voor multi-select buttons (rijbewijs, vaardigheden)
5. Checkbox/radio styling verbeteren (column picker)
6. Capacity pagina op tokens brengen
