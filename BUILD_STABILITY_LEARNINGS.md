# Build Stability Learnings

## Doel
Dit bestand bevat de verzamelde learnings van terugkerende build-, lint-, typecheck- en toolchainstabilisatie op deze applicatie. Elke volgende run moet dit bestand eerst lezen, zodat eerdere inzichten, keuzes en valkuilen niet verloren gaan.

## Terugkerende structurele aandachtspunten
- Prisma client (`src/generated/prisma/`) staat in `.gitignore` en moet altijd gegenereerd worden vóór typecheck of lint. Gebruik `npx prisma generate` of `npm run verify`.
- ESLint flat config (`eslint.config.mjs`) vereist directe import van `eslint-config-next/core-web-vitals`, niet via `FlatCompat`. Het project gebruikt ESLint 9 + `eslint-config-next@16` (native flat config support).
- `next lint` werkt niet betrouwbaar met ESLint 9 flat config in Next.js 14; gebruik `eslint .` via `npm run lint` in plaats daarvan.
- De `src/generated/` directory moet in de ESLint ignore staan, anders lint ESLint de Prisma-gegenereerde WASM-bestanden (traag, nutteloos).
- Detached HEAD is normaal in Claude Code runs; branch `claude/driver-planning-tool-Qv7lL` moet altijd uitgecheckt worden per CLAUDE.md.

## Bekende blokkades
| Onderdeel | Probleem | Impact | Status | Opmerking |
|---|---|---|---|---|
| ESLint config | `FlatCompat` + `eslint-config-next@16` veroorzaakte circular structure crash | Lint volledig broken | Opgelost | Vervangen door directe native flat config import |
| `next lint` script | Triggerde interactieve prompt in plaats van linting | Lint werkte niet in CI/Claude runs | Opgelost | Script veranderd naar `eslint .` |
| `useApi.ts` ref assignment | `react-hooks/refs` error door ref update tijdens render | 2 lint errors | Opgelost | Ref updates verplaatst naar `useEffect` |
| Generated files in lint | Prisma WASM-bestanden werden gelinkt | Trage lint, nutteloze output | Opgelost | `src/generated/**` toegevoegd aan ESLint ignores |
| `@eslint/eslintrc` dependency | Niet meer nodig na verwijdering `FlatCompat` | Onnodige dependency | Opgelost | Verwijderd uit devDependencies |

## Bewezen effectieve stabiliteitsverbeteringen
- `npm run verify` script: `prisma generate && typecheck && lint` in juiste volgorde
- `npm run typecheck` script: `tsc --noEmit` voor standalone typechecking
- Directe `eslint-config-next/core-web-vitals` import zonder `FlatCompat` wrapper
- ESLint ignore voor `src/generated/**`

## Dingen die weinig opleverden of juist risico gaven
- `next lint` gebruiken met ESLint 9 flat config — werkt niet in Next.js 14, triggert interactive prompt
- `FlatCompat` gebruiken voor `eslint-config-next@16` — veroorzaakt circular structure crash, niet nodig want v16 exporteert native flat config
- Losse `tsc` of `eslint` commands zonder eerst Prisma te genereren — levert misleidende fouten op

## Aanbevolen checkvolgorde voor volgende runs
1. `git checkout claude/driver-planning-tool-Qv7lL` (of branch aanmaken als die niet bestaat)
2. `npm install` (triggert automatisch `prisma generate` via postinstall)
3. `npm run verify` (prisma generate + typecheck + lint)
4. Optioneel: `npm run build` (vereist DATABASE_URL, werkt alleen op Vercel of met lokale DB)

## Aandachtspunten voor volgende runs
- Er zijn 2 ESLint warnings in `src/components/planning/PlanningGrid.tsx` (react-hooks/exhaustive-deps). Deze zijn niet blocking maar verdienen aandacht als die component aangepast wordt.
- `npm run build` vereist DATABASE_URL (Neon/Vercel). Zonder DATABASE_URL faalt de build bij de migrate-stap. Dit is by design.
- `eslint-config-next@16` is nieuwer dan Next.js 14 zelf — dit werkt nu, maar bij een Next.js upgrade moet de compatibiliteit gecontroleerd worden.
- `@types/node`, `@types/react`, `@types/react-dom` en `typescript` staan in `dependencies` i.p.v. `devDependencies`. Dit is niet ideaal maar functioneel en niet breaking. Verplaatsen is een P3.

## Herstelgeschiedenis

### 2026-03-28
**Samenvatting**
Lint was volledig broken door incompatibele ESLint configuratie. Typecheck en build werkten al correct.

**Geanalyseerd**
- TypeScript typecheck: passed clean
- Next.js build: passed clean
- ESLint via `next lint`: interactieve prompt, werkt niet in CI/Claude runs
- ESLint via `eslint .`: circular structure crash door `FlatCompat` + `eslint-config-next@16`
- 2 lint errors in `useApi.ts`: ref assignment during render (nieuwe `react-hooks/refs` rule)
- Generated Prisma WASM files werden meegelinkt (traag, nutteloos)

**Doorgevoerd**
- `eslint.config.mjs`: herschreven naar directe `eslint-config-next/core-web-vitals` import, `FlatCompat` verwijderd
- `eslint.config.mjs`: `src/generated/**` ignore toegevoegd
- `package.json`: lint script veranderd van `next lint` naar `eslint .`
- `package.json`: `typecheck` script toegevoegd (`tsc --noEmit`)
- `package.json`: `verify` script toegevoegd (`prisma generate && typecheck && lint`)
- `package.json`: `@eslint/eslintrc` verwijderd uit devDependencies
- `src/hooks/useApi.ts`: ref assignments verplaatst naar `useEffect` (fix `react-hooks/refs` errors)

**Niet doorgevoerd**
- PlanningGrid.tsx warnings: niet gefixed, zijn non-blocking en vereisen component-specifieke analyse
- Type dependencies verplaatsen naar devDependencies: functioneel niet breaking, risico op build-issues op Vercel (P3)

**Nieuwe learnings**
- `eslint-config-next@16` exporteert native flat config; `FlatCompat` is niet nodig en veroorzaakt crashes
- `next lint` in Next.js 14 ondersteunt ESLint 9 flat config niet betrouwbaar
- `react-hooks/refs` is een nieuwe rule in eslint-plugin-react-hooks v7 die ref assignments buiten effects/handlers flagged

**Aanbevolen vervolgstappen**
- Fix de 2 PlanningGrid.tsx warnings als die component wordt aangepast
- Overweeg `@types/*` en `typescript` naar devDependencies te verplaatsen (laag risico, lage prioriteit)
- Bij Next.js upgrade: controleer compatibiliteit met `eslint-config-next` versie
