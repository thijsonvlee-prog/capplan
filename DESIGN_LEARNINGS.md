# Design Learnings

## Doel
Dit bestand bevat de verzamelde learnings van terugkerende design- en visual polish runs op deze applicatie. Elke volgende run moet dit bestand eerst lezen, zodat eerdere inzichten, keuzes en ontwerpprincipes behouden blijven.

## Gewenste designrichting
- modern SaaS-niveau
- sterk fundament in spacing, hiërarchie, typografie en componentconsistentie
- eigen signatuur zonder gimmicks
- custom UI-details binnen een strak en schaalbaar systeem

## Terugkerende designaandachtspunten
- globals.css was leeg — geen tokens, geen basisstijlen, geen typografiesysteem
- alle componenten gebruiken losse Tailwind utility classes zonder centraal systeem
- sidebar en header waren minimaal en generiek
- knoppen, inputs en kaarten hadden geen consistente focus/hover/active states
- er was geen kleurpalet met eigen karakter; alles gebruikte standaard Tailwind grays/blues

## Bekende designproblemen
| Onderdeel | Probleem | Impact | Status | Opmerking |
|---|---|---|---|---|
| globals.css | Was volledig leeg, geen tokens | Hoog | Opgelost | Tokens, shadows, typography classes toegevoegd |
| Font | Geen custom font geladen | Midden | Opgelost | System font stack met Inter als voorkeur |
| Sidebar | Generiek gray-900, geen brandmark | Midden | Opgelost | Donkerder kleur, brand icon, betere spacing |
| Header | Bijna leeg, geen pagina-context | Midden | Opgelost | Toont nu paginatitel, gebruikt tokens |
| Page titles | Dubbel: in header EN op pagina | Laag | Opgelost | Verwijderd uit individuele pagina's |
| Card surfaces | Alleen `shadow`, geen border, geen token | Midden | Opgelost | shadow-card + border-border-subtle |
| Inputs | Geen focus ring, geen consistent token-gebruik | Midden | Deels opgelost | Planning en drivers search inputs aangepast |
| Buttons (primary) | Hardcoded blue-600, geen token | Midden | Deels opgelost | Brand token op enkele plekken, niet overal |
| Tabel headers | Inconsistente styling | Laag | Deels opgelost | DriverList thead gebruikt text-label class |
| Form controls breed | Alle forms gebruiken losse inline classes | Midden | Open | Volgende run: unify form input classes |
| ZoomSelector/filters | Generieke stijl, geen token-gebruik | Laag | Open | Volgende run |
| StatusBadge kleuren | Direct in constants.ts, niet in tokens | Laag | Open | Overwegen bij P2 verfijning |
| Modals | Inconsistente overlay/shadow stijlen | Laag | Open | |
| Density/toolbar buttons | Geen uniforme control stijl | Laag | Open | |

## Bewezen effectieve designverbeteringen
- CSS @theme tokens voor kleuren, shadows, radius — werkt goed met Tailwind v4
- Typography utility classes (.text-page-title, .text-section-title, .text-label, .text-caption) — herbruikbaar
- Sidebar met brand icon geeft direct meer identiteit
- Header met dynamische paginatitel maakt navigatie duidelijker
- shadow-card + border-subtle combinatie geeft kaarten meer diepte zonder zwaar te zijn
- Scrollbar styling draagt subtiel bij aan een gepolijst gevoel

## Dingen die weinig opleverden of juist risico gaven
- Google Fonts (Inter) via next/font/google werkt niet in offline/sandbox omgevingen — system font stack is veiliger
- Te veel tegelijk veranderen vergroot risico op regressies; tokens eerst, dan component voor component

## Aandachtspunten voor volgende runs
- Form input styling unificeren (alle inputs, selects, textareas via gedeelde classes of tokens)
- Primary/secondary/ghost button varianten definiëren als herbruikbare classes
- ZoomSelector, density toggle en toolbar controls harmoniseren
- StamtabelManager edit-mode inputs afstemmen op nieuwe tokens
- StatusBadge kleuren overwegen als tokens
- Modal/overlay styling standaardiseren (shadow-modal token bestaat al, nog niet overal gebruikt)
- Spacing tussen secties op settings-pagina evalueren
- Planning grid table header styling afstemmen op tokens

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
1. Form controls unificeren (inputs, selects) — grootste open inconsistentie
2. Button varianten definiëren (primary, secondary, ghost)
3. Toolbar/filter controls harmoniseren (ZoomSelector, density, column picker)
4. Modal styling standaardiseren
