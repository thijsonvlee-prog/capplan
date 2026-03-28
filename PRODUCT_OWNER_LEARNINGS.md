# Product Owner Learnings

## Doel
Dit bestand bevat de verzamelde learnings van cross-domain reviews over alle terugkerende verbeter-runs op deze applicatie. Het doel is om te bewaken dat performance, UX, design, technical debt, security, observability, documentatie, build stability en experimenten elkaar versterken in plaats van tegenwerken.

## Beschikbare learningdomeinen
| Domein | Document | Status | Opmerking |
|---|---|---|---|
| Performance | PERFORMANCE_LEARNINGS.md | Volwassen (1 run) | 8 optimalisaties doorgevoerd, duidelijke bottleneck-tabel |
| Performance Observability | PERFORMANCE_OBSERVABILITY.md | Volwassen (1 run) | Volledige instrumentatie-infra, 7 routes gemeten |
| Technical Debt | TECH_DEBT_LEARNINGS.md | Volwassen (1 run) | ~1200 regels dode code verwijderd, API utils geconsolideerd |
| UX | UX_LEARNINGS.md | Zeer volwassen (3 runs) | Breed scala aan verbeteringen, duidelijke checklist voor nieuwe features |
| Design | DESIGN_LEARNINGS.md | Zeer volwassen (3 runs) | Volledig tokensysteem, component classes, nul hardcoded kleuren |
| Build Stability | BUILD_STABILITY_LEARNINGS.md | Volwassen (1 run) | ESLint en typecheck stabiel, verify-script beschikbaar |
| POC Experimenten | POC_EXPERIMENTS.md | Compact (1 experiment) | CapacitySummaryRow ingebouwd |
| Architectuur | docs/PERSISTENCE_LAYER.md | Stabiel | Persistence layer documentatie |
| Security | - | Ontbreekt | Geen SECURITY_NOTES.md aanwezig. User model met rollen bestaat, maar geen auth-implementatie. |
| Documentatie | - | Ontbreekt | Geen DOCUMENTATION_NOTES.md. Documentatiepagina bevat hardcoded tekst die handmatig bijgewerkt moet worden. |

## Terugkerende domeinoverstijgende aandachtspunten
- **PlanningGrid.tsx is het convergentiepunt van 4+ domeinen**: Performance (virtualisatie), Tech Debt (709 regels, opsplitsing), UX (labels, flows, accessibility), Design (tokens), POC (CapacitySummaryRow). Elke run die dit bestand raakt moet rekening houden met wijzigingen uit andere runs.
- **Toast/notificatiesysteem is de #1 cross-domain behoefte**: 3x door UX geidentificeerd als hoogste prioriteit. Raakt ook Design (styling via tokens) en Tech Debt (correct implementeren). Niet-implementatie houdt UX-verbetering structureel tegen.
- **Alle runs vonden plaats op dezelfde dag (2026-03-28)**: dit was de eerste golf. Er is nog geen ervaring met runs die op elkaars wijzigingen voortbouwen. Volgende runs moeten expliciet lezen wat vorige runs hebben gedaan.
- **Security ontbreekt volledig als domein**: User model met rollen (ADMIN/PLANNER/VIEWER) bestaat in het schema, maar er is geen authenticatie, geen autorisatie, geen security-document. Bij feature-expansie of externe exposure is dit een risico.

## Bekende conflicten of spanningen
| Domein A | Domein B | Conflict / spanning | Impact | Status | Opmerking |
|---|---|---|---|---|---|
| POC | UX | POC_EXPERIMENTS.md verwees naar "Σ Totalen" terwijl UX-run 3 dit had gewijzigd naar "Totalen" | Laag - documentatie out-of-sync | Opgelost | POC_EXPERIMENTS.md bijgewerkt in deze review |
| Performance | Tech Debt | Virtualisatie van PlanningGrid vereist eerst opsplitsing, maar beide runs behandelden dit onafhankelijk | Middel - verkeerde volgorde kan dubbel werk opleveren | Open | Opsplitsing (Tech Debt) moet eerst, dan virtualisatie (Performance) |
| Performance | Observability | Observability voegt per request een DB-write toe aan gemeten routes. Bij agressieve performance-optimalisatie kan dit de meting vervuilen. | Laag - fire-and-forget, ~1-5ms | Open | Gedocumenteerd in PERFORMANCE_OBSERVABILITY.md maar niet in PERFORMANCE_LEARNINGS.md. Aanbeveling toegevoegd. |
| Tech Debt | POC | CapacitySummaryRow voegt complexiteit toe aan PlanningGrid (al 709 regels). POC-runs en tech debt-runs trekken in tegengestelde richting. | Middel - PlanningGrid groeit terwijl opsplitsing gewenst is | Open | Bij PlanningGrid-opsplitsing: CapacitySummaryRow als apart subcomponent meenemen |
| Design | UX | Design-runs focussen op visuele polish, UX-runs op flows en begrijpelijkheid. Beide raken dezelfde componenten maar vanuit andere prioriteiten. | Laag - versterken elkaar meestal | Open | Design-runs moeten UX_LEARNINGS.md meelezen voor context over labelwijzigingen en flows |
| UX (toast) | Tech Debt | Toast-systeem is de hoogste UX-prioriteit maar vereist een nieuwe component of dependency. Toevoegen vergroot codebase. | Laag - eenmalige investering | Open | Liever een lightweight eigen component dan een externe dependency |

## Belangrijke kruisverbanden en afhankelijkheden
- **Build stability is randvoorwaardelijk voor alle runs**: zonder `npm run verify` (prisma generate + typecheck + lint) is de startpositie van elke run onbetrouwbaar. BUILD_STABILITY_LEARNINGS.md moet door elke run worden gerespecteerd.
- **Design token-systeem versterkt UX en Tech Debt**: het voltooide tokensysteem (.btn-primary, .input-field, .form-label) maakt nieuwe componenten (toast, form validation) consistent zonder extra design-werk.
- **Performance observability versterkt performance-runs**: PERFORMANCE_LEARNINGS.md verwijst al expliciet naar PERFORMANCE_OBSERVABILITY.md. Dit is een goed voorbeeld van kruisbestuiving.
- **Tech Debt en Performance delen dezelfde bottleneck**: PlanningGrid is zowel de grootste tech debt als de grootste performance-uitdaging. Opsplitsing maakt virtualisatie mogelijk.
- **UX-checklist is bruikbaar voor alle runs**: de UX-aandachtspuntenlijst (Nederlands, bevestigingsdialogen, empty states, aria-labels) is relevant voor elke run die UI-componenten raakt.
- **Aggregatielogica-duplicatie raakt 3 domeinen**: Tech Debt (consolidatie), Performance (efficiency), POC (CapacitySummaryRow gebruikt dezelfde patronen). Oplossing in Tech Debt helpt alle drie.
- **Persistence layer documentatie is stabiel maar niet gekoppeld aan learnings**: docs/PERSISTENCE_LAYER.md beschrijft architectuurbeslissingen die relevant zijn voor Performance en Tech Debt, maar wordt niet expliciet genoemd in die documenten.

## Randvoorwaardelijke fundamenten
1. **Build stability** (opgelost): ESLint, typecheck en Prisma-generatie werken. `npm run verify` is het startpunt voor elke run.
2. **Design token-systeem** (opgelost): volledige token-migratie in 3 runs. Nieuwe componenten kunnen direct tokens gebruiken.
3. **Performance observability** (opgezet): instrumentatie staat, maar dagelijkse summaries en cleanup moeten nog geautomatiseerd worden (cron/nacht-run).
4. **API route utilities** (opgelost): gedeelde helpers in api-route-utils.ts reduceren duplicatie bij nieuwe routes.
5. **Security baseline** (ontbreekt): geen auth, geen autorisatie, geen security-documentatie. Dit wordt randvoorwaardelijk zodra de app breder wordt ingezet.
6. **PlanningGrid opsplitsing** (niet opgelost): randvoorwaardelijk voor virtualisatie, betere testbaarheid, en veiligere POC-experimenten.

## Aanbevolen leesvolgorde en afhankelijkheden voor volgende runs

### Alle runs
1. CLAUDE.md (altijd eerst - branchbeleid, stack, conventies)
2. BUILD_STABILITY_LEARNINGS.md (controleer of verify-script nog werkt)
3. Eigen learningsdocument

### Performance-run
- Lees ook: PERFORMANCE_OBSERVABILITY.md (gebruik echte data, niet alleen code-inspectie)
- Lees ook: TECH_DEBT_LEARNINGS.md (PlanningGrid opsplitsing is prerequisite voor virtualisatie)
- Check: UX_LEARNINGS.md (voorkom dat performance-wijzigingen UX-verbeteringen breken)

### UX-run
- Lees ook: DESIGN_LEARNINGS.md (gebruik bestaande token-classes voor nieuwe componenten)
- Check: POC_EXPERIMENTS.md (zijn POC-labels en flows UX-proof?)

### Design-run
- Lees ook: UX_LEARNINGS.md (begrijp welke labels en flows zijn gewijzigd)
- Check: POC_EXPERIMENTS.md (zijn POC-componenten visueel consistent?)

### Tech Debt-run
- Lees ook: PERFORMANCE_LEARNINGS.md (PlanningGrid opsplitsing raakt performance-pad)
- Lees ook: POC_EXPERIMENTS.md (CapacitySummaryRow mee-refactoren bij PlanningGrid opsplitsing)

### POC-run
- Lees ook: TECH_DEBT_LEARNINGS.md (voorkom dat experimenten tech debt vergroten)
- Lees ook: UX_LEARNINGS.md (labels, taal, flows)
- Check: PERFORMANCE_LEARNINGS.md (batch-patronen als experiment DB raakt)

### Documentatie-run
- Lees: alle learningsdocumenten (om te bepalen of de documentatiepagina nog actueel is)
- Check: docs/PERSISTENCE_LAYER.md (architectuurbeslissingen die in de app-documentatie thuishoren)

## Aanbevelingen die ook aan andere learningsbestanden zijn toegevoegd
| Document | Waarom nodig | Korte omschrijving |
|---|---|---|
| POC_EXPERIMENTS.md | "Σ Totalen" label was out-of-sync met UX-wijziging | Label-verwijzingen bijgewerkt naar "Totalen" + notitie over UX-run 3 |
| POC_EXPERIMENTS.md | Ontbrekende cross-domain context | Sectie "Cross-domain aandachtspunten" toegevoegd: check PlanningGrid-complexiteit, UX-richtlijnen, performance-patronen |
| TECH_DEBT_LEARNINGS.md | PlanningGrid refactoring-afhankelijkheid niet expliciet | Sectie "Cross-domain aandachtspunten" toegevoegd: PlanningGrid is prerequisite voor performance, aggregatielogica raakt POC |
| PERFORMANCE_LEARNINGS.md | UX-impact en observability-overhead niet benoemd | Sectie "Cross-domain aandachtspunten" toegevoegd: UX-impact meewegen, opsplitsing eerst, observability-overhead |

## Dingen die weinig opleverden of juist verwarring gaven
- (Eerste cross-domain review - nog geen negatieve ervaringen)

## Aandachtspunten voor volgende cross-learning reviews
- Monitor of de cross-domain aandachtspunten in andere documenten daadwerkelijk worden gelezen door volgende runs
- Controleer of PlanningGrid-wijzigingen uit verschillende runs geen merge-conflicten hebben veroorzaakt
- Controleer of het toast-systeem inmiddels is geimplementeerd (al 3x de hoogste UX-prioriteit)
- Beoordeel of SECURITY_NOTES.md inmiddels is aangemaakt, zeker als er feature-expansie heeft plaatsgevonden
- Controleer of performance observability (dagelijkse summaries, cleanup) inmiddels is geautomatiseerd
- Beoordeel of PlanningGrid-opsplitsing is begonnen en of dit de weg heeft vrijgemaakt voor virtualisatie
- Check of de documentatiepagina in de app nog actueel is na eerdere architectuurwijzigingen

## Reviewgeschiedenis

### 2026-03-28
**Samenvatting**
Eerste cross-domain review over alle 8 learningsdocumenten. Focus op het identificeren van conflicten, afhankelijkheden en kruisverbanden tussen de eerste golf van verbeter-runs die allemaal op dezelfde dag plaatsvonden.

**Geanalyseerde documenten**
- CLAUDE.md (repository-instructies)
- PERFORMANCE_LEARNINGS.md (1 run, 8 optimalisaties)
- PERFORMANCE_OBSERVABILITY.md (1 run, volledige instrumentatie)
- TECH_DEBT_LEARNINGS.md (1 run, ~1200 regels opgeschoond)
- UX_LEARNINGS.md (3 runs, breed scala verbeteringen)
- DESIGN_LEARNINGS.md (3 runs, volledig tokensysteem)
- BUILD_STABILITY_LEARNINGS.md (1 run, lint/typecheck stabiel)
- POC_EXPERIMENTS.md (1 experiment, CapacitySummaryRow)
- docs/PERSISTENCE_LAYER.md (architectuurdocumentatie)

**Belangrijkste conflicten**
1. POC-documentatie verwees naar "Σ Totalen" terwijl UX dit al had gewijzigd naar "Totalen" → opgelost
2. Performance (virtualisatie) en Tech Debt (opsplitsing) behandelen PlanningGrid onafhankelijk terwijl er een volgorde-afhankelijkheid is → gedocumenteerd
3. POC-experimenten voegen complexiteit toe aan PlanningGrid terwijl Tech Debt dit wil opsplitsen → gedocumenteerd

**Belangrijkste kruisverbanden**
1. PlanningGrid is convergentiepunt voor 4+ domeinen — wijzigingen moeten gecoordineerd worden
2. Toast-systeem is hoogste cross-domain prioriteit (UX + Design + Tech Debt)
3. Build stability is randvoorwaardelijk voor alle geautomatiseerde runs
4. Design-tokensysteem is voltooid en maakt nieuwe componenten consistent
5. Performance observability maakt data-gedreven optimalisatie mogelijk
6. PlanningGrid-opsplitsing (Tech Debt) is prerequisite voor virtualisatie (Performance)

**Doorgevoerde alignment-verbeteringen**
1. POC_EXPERIMENTS.md: "Σ Totalen" verwijzingen bijgewerkt naar "Totalen"
2. POC_EXPERIMENTS.md: cross-domain aandachtspunten sectie toegevoegd
3. TECH_DEBT_LEARNINGS.md: cross-domain aandachtspunten sectie toegevoegd
4. PERFORMANCE_LEARNINGS.md: cross-domain aandachtspunten sectie toegevoegd
5. PRODUCT_OWNER_LEARNINGS.md: aangemaakt met volledige cross-domain analyse

**Aan andere learningsbestanden toegevoegde aanbevelingen**
- POC_EXPERIMENTS.md: label-sync + check PlanningGrid-complexiteit, UX-richtlijnen, performance-patronen
- TECH_DEBT_LEARNINGS.md: PlanningGrid is prerequisite voor performance, aggregatielogica raakt POC
- PERFORMANCE_LEARNINGS.md: UX-impact meewegen, opsplitsing eerst, observability-overhead

**Niet doorgevoerd**
- Aanmaken SECURITY_NOTES.md: er zijn nog geen concrete security-runs geweest, document zou speculatief zijn. Wel als aandachtspunt vastgelegd.
- Aanmaken DOCUMENTATION_NOTES.md: zelfde reden, nog geen documentatie-specifieke run geweest.
- Cross-domain sectie in UX_LEARNINGS.md: niet nodig, UX is al het meest volwassen document en bevat al impliciete verwijzingen naar design en flows.
- Cross-domain sectie in DESIGN_LEARNINGS.md: niet nodig, design is relatief zelfstandig en het tokensysteem is een output die andere runs consumeren, niet andersom.
- Cross-domain sectie in BUILD_STABILITY_LEARNINGS.md: niet nodig, build stability is al randvoorwaardelijk en wordt door alle runs als eerste gelezen.

**Nieuwe learnings**
- Alle 8 documenten zijn op dezelfde dag aangemaakt — dit is zowel een kracht (consistente baseline) als een risico (geen ervaring met incrementele voortbouw)
- PlanningGrid is de gevaarlijkste plek voor parallelle runs: 4+ domeinen raken hetzelfde bestand
- De design-tokenmigratie is volledig afgerond, wat een stabiel fundament geeft voor alle toekomstige UI-wijzigingen
- Security is het grootste gat in de huidige learnings-coverage
- De UX-checklist (taal, bevestigingen, empty states, aria-labels) is herbruikbaar als acceptatiecriteria voor alle runs

**Aanbevolen vervolgstappen**
1. **P1**: Toast/notificatiesysteem implementeren (unblock hoogste UX-prioriteit, gebruik design tokens)
2. **P1**: PlanningGrid opsplitsen (unblock performance-virtualisatie, verminder merge-risico)
3. **P2**: Security baseline vestigen (SECURITY_NOTES.md, auth-middleware, route-bescherming)
4. **P2**: Performance observability automatiseren (dagelijkse summaries + cleanup via cron)
5. **P2**: Aggregatielogica consolideren (raakt Tech Debt, Performance en POC)
6. **P3**: Formuliervalidatie generiek oplossen (stille validatie in meerdere componenten)
7. **P3**: StatusBadge kleuren als design tokens (laatste hardcoded kleuren)
8. **P4**: Documentatiepagina dynamisch maken (nu hardcoded string, veroudert snel)
