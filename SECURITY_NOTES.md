# Security Notes

## Doel
Dit bestand bevat de verzamelde learnings van terugkerende security- en hardeningchecks op deze applicatie. Elke volgende run moet dit bestand eerst lezen, zodat eerdere inzichten, keuzes en open risico's behouden blijven.

## Applicatieprofiel
- **Type**: Chauffeur-planning en roosterbeheer (interne bedrijfsapplicatie)
- **Stack**: Next.js 14 (App Router) + Prisma 7 + PostgreSQL (Neon) + Vercel
- **Auth**: Geen authenticatie/autorisatie geimplementeerd (meest kritieke open risico)
- **Aanvalsvlak**: Alle API routes zijn publiek toegankelijk zonder credentials

## Terugkerende security- en hardeningaandachtspunten
- Alle API routes missen authenticatie en autorisatie
- Inputvalidatie is minimaal; vertrouwen op Prisma-types is niet voldoende
- Bulk-operaties (planning/bulk, scenario duplication, roster assignments) hebben DoS-potentieel door onbegrensde arrays
- Sub-resource routes ([recordId]) controleerden niet of het record bij de opgegeven driver hoort
- Settings routes reflecteerden user-input in foutmeldingen
- Preferences route accepteerde userId van de client, waardoor cross-user toegang mogelijk was
- Geen security headers geconfigureerd in Next.js

## Bekende risico's
| Onderdeel | Risico | Ernst | Status | Opmerking |
|---|---|---|---|---|
| Alle API routes | Geen authenticatie | Kritiek | Open | Auth-architectuur (bijv. NextAuth) moet apart worden opgezet |
| Alle API routes | Geen autorisatie/RBAC | Kritiek | Open | Afhankelijk van auth-implementatie |
| planning/bulk | DoS via onbegrensd dates-array | Hoog | Opgelost | Limiet van 366 dates toegevoegd |
| scenarios/duplicate | DoS via bulk data-kopie | Hoog | Opgelost | Limiet van 50.000 entries en naam-validatie |
| planning/for-range | DoS via onbegrensd date range | Hoog | Opgelost | Limiet van 90 dates toegevoegd |
| Sub-resource routes | Geen ownership check (IDOR) | Hoog | Opgelost | driverId-check toegevoegd op alle [recordId] routes |
| preferences | Cross-user toegang via userId param | Hoog | Opgelost | userId wordt nu server-side bepaald |
| settings routes | Inputreflectie in foutmelding | Laag | Opgelost | Type-parameter verwijderd uit foutmelding |
| POST endpoints | Ontbrekende verplichte velden-validatie | Medium | Opgelost | Basisvalidatie toegevoegd op drivers, planning, settings, scenarios |
| next.config | Geen security headers | Medium | Opgelost | X-Content-Type-Options, X-Frame-Options, etc. toegevoegd |
| Alle mutaties | Geen audit logging | Medium | Open | Overweeg audit trail voor DELETE operaties |
| Alle API routes | Geen rate limiting | Medium | Open | Overweeg rate limiting middleware |
| roster-profiles PUT | Geen database transactie | Laag | Open | Delete + recreate van days zonder transactie |
| Alle routes | Geen CSRF-bescherming | Medium | Open | Next.js API routes hebben standaard geen CSRF tokens |
| scenarios/active | Hardcoded userId "default" | Laag | Open | Multi-user functionaliteit nog niet geimplementeerd |

## Bewezen effectieve mitigaties
- Ownership checks op sub-resource routes voorkomen IDOR-aanvallen
- Array/count limieten op bulk endpoints voorkomen DoS
- Server-side bepaling van userId voorkomt cross-user data-access
- Verwijderen van user-input uit foutmeldingen reduceert informatielekken
- Security headers via next.config bieden basis browser-bescherming
- Verplichte velden-validatie op POST endpoints voorkomt database-errors en onverwachte data

## Dingen die weinig opleverden of juist risico gaven
- Volledige auth-herstructurering in een security-scan is te risicovol; moet als apart project worden opgepakt
- Zware inputvalidatie-libraries (Zod) toevoegen als dependency is een bewuste keuze, niet iets om in een security-pass te forceren

## Aandachtspunten voor volgende runs
- Controleer of authenticatie inmiddels is geimplementeerd
- Als auth aanwezig is: controleer of alle routes beschermd zijn
- Controleer of rate limiting is toegevoegd
- Controleer of audit logging is geimplementeerd voor DELETE operaties
- Controleer of roster-profiles PUT in een transactie draait
- Overweeg Zod-validatie als de codebase groeit
- Controleer of CSRF-bescherming nodig is (afhankelijk van auth-aanpak)
- Let op nieuwe API routes die dezelfde patronen herhalen

## Check- en wijzigingsgeschiedenis

### 2026-03-28
**Samenvatting**
Eerste security- en hardeningcheck. Focus op praktische risicoreductie zonder breaking changes.

**Geanalyseerd**
- Alle 25+ API routes (drivers, planning, scenarios, preferences, settings, roster-profiles, skills)
- Frontend code (geen dangerouslySetInnerHTML, eval, of hardcoded secrets gevonden)
- next.config.mjs (geen security headers)
- Prisma schema en seed data
- .gitignore, .env behandeling
- Dependencies en configuratie

**Doorgevoerd**
- Security headers in next.config.mjs (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy)
- Array size limiet op planning/bulk (max 366 dates)
- Entry count limiet op scenario duplication (max 50.000)
- Date range limiet op planning/for-range (max 90 dates)
- Ownership checks op alle 6 sub-resource routes (employment, functions, roster-assignments - PUT en DELETE)
- Verwijdering van client-controlled userId uit preferences route (voorkomt cross-user access)
- Verwijdering van user-input reflectie uit settings foutmeldingen
- Verplichte velden-validatie op POST /api/drivers (firstName, lastName)
- Verplichte velden-validatie op POST /api/planning (driverId, date, status)
- Verplichte velden-validatie op POST /api/planning/bulk (driverId, dates array, status)
- Verplichte velden-validatie op POST /api/settings/[type] (code, max 100 chars)
- Naam-validatie op POST /api/scenarios/[id]/duplicate

**Niet doorgevoerd**
- Authenticatie/autorisatie: te groot en architectureel om in een security-pass door te voeren; vereist keuze voor auth-provider en session-strategie
- Rate limiting: vereist middleware of externe dependency; aanbevolen als vervolgstap
- Audit logging: vereist apart ontwerp voor wat, waar en hoe te loggen
- CSRF-bescherming: hangt af van gekozen auth-aanpak
- Zod-validatie: bewuste keuze om geen nieuwe dependency te introduceren in een security-pass
- Database transacties op roster-profiles PUT: risico op regressie door verandering in data-flow

**Nieuwe learnings**
- Prisma voorkomt SQL injection effectief; alle queries gebruiken parameterized access
- Geen secrets of credentials in de repo gevonden
- Seed data bevat alleen testdata, geen echte PII
- Frontend gebruikt geen onveilige rendering patronen
- Docker-compose credentials zijn development-defaults (acceptabel)

**Aanbevolen vervolgstappen**
1. **Authenticatie implementeren** (bijv. NextAuth.js) - hoogste prioriteit
2. **Rate limiting** toevoegen op schrijf-endpoints
3. **Audit trail** implementeren voor mutaties (vooral DELETE)
4. **Zod-validatie** overwegen voor structurele inputvalidatie
5. **Database transacties** gebruiken waar multi-step operaties plaatsvinden
