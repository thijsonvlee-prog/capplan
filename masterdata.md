# Masterdata — CapPlan Datamodel Documentatie

Dit document beschrijft alle stamtabellen (masterdata), kernentiteiten en hun relaties in CapPlan. De Prisma-schema (`prisma/schema.prisma`) is de technische bron van waarheid.

---

## 1. Stamtabellen (Master Data)

### Employer (Werkgever)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| code | String | Unique, verplicht | Werkgevercode (bijv. "WG001") |
| description | String | Verplicht | Naam/omschrijving van de werkgever |
| sourceSystem | String? | Optioneel | Bronsysteem bij externe import (bijv. "AFAS") |
| externalId | String? | Optioneel | ID in het bronsysteem |
| syncedAt | DateTime? | Optioneel | Tijdstip laatste synchronisatie |

**Relaties:**
- Heeft meerdere `DriverEmploymentRecord` (dienstverbanden van chauffeurs)

---

### Department (Afdeling)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| code | String | Unique, verplicht | Afdelingscode (bijv. "AFD01") |
| description | String | Verplicht | Naam/omschrijving van de afdeling |
| sourceSystem | String? | Optioneel | Bronsysteem bij externe import |
| externalId | String? | Optioneel | ID in het bronsysteem |
| syncedAt | DateTime? | Optioneel | Tijdstip laatste synchronisatie |

**Relaties:**
- Heeft meerdere `DriverFunctionRecord` (functies van chauffeurs)

---

### Location (Locatie)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| code | String | Unique, verplicht | Locatiecode (bijv. "LOC01") |
| description | String | Verplicht | Naam/omschrijving van de locatie |
| sourceSystem | String? | Optioneel | Bronsysteem bij externe import |
| externalId | String? | Optioneel | ID in het bronsysteem |
| syncedAt | DateTime? | Optioneel | Tijdstip laatste synchronisatie |

**Relaties:**
- Heeft meerdere `DriverFunctionRecord` (functies van chauffeurs)

---

### LeaveType (Verloftype)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| code | String | Unique, verplicht | Verloftypecode (bijv. "VAK") |
| description | String | Verplicht | Naam/omschrijving (bijv. "Vakantie") |
| sourceSystem | String? | Optioneel | Bronsysteem bij externe import |
| externalId | String? | Optioneel | ID in het bronsysteem |
| syncedAt | DateTime? | Optioneel | Tijdstip laatste synchronisatie |

**Relaties:**
- Heeft meerdere `PlanningEntry` (planningitems met status LEAVE)

---

### Skill (Competentie)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| name | String | Verplicht | Naam van de competentie |
| sourceSystem | String? | Optioneel | Bronsysteem bij externe import |
| externalId | String? | Optioneel | ID in het bronsysteem |
| syncedAt | DateTime? | Optioneel | Tijdstip laatste synchronisatie |

**Relaties:**
- Heeft meerdere `DriverSkill` (koppeltabel met chauffeurs)

**Opmerking:** Skills hebben geen `code`-veld — identificatie gaat op `name`.

---

### RosterProfile (Roosterprofiel)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| name | String | Verplicht | Naam van het roosterprofiel (bijv. "Standaard 5-2") |
| createdAt | DateTime | Auto-generated | Aanmaaktijdstip |
| updatedAt | DateTime | Auto-updated | Laatst gewijzigd |

**Relaties:**
- Heeft meerdere `RosterProfileDay` (dagpatronen binnen het profiel)
- Heeft meerdere `DriverRosterAssignment` (toewijzingen aan chauffeurs)

---

### RosterProfileDay (Roosterprofiel Dag)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| rosterProfileId | String | FK → RosterProfile, verplicht | Bijbehorend roosterprofiel |
| dayOffset | Int | 0–27, unique per profiel | Dagnummer binnen het 4-wekencyclus (0 = dag 1) |
| status | String | Verplicht | Status: ROSTER_FREE, BASE_ROSTER, of AVAILABLE_EXTRA |

**Constraints:**
- Unique: `(rosterProfileId, dayOffset)` — elk profiel heeft maximaal 28 dagpatronen
- Cascade delete: wordt verwijderd als het roosterprofiel wordt verwijderd

---

## 2. Kernentiteiten

### Driver (Chauffeur)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| firstName | String | Verplicht | Voornaam |
| lastName | String | Verplicht | Achternaam |
| employeeNumber | String? | Optioneel | Personeelsnummer (gebruikt als matchveld bij import-upsert) |
| licenseTypes | String[] | PostgreSQL array | Rijbewijscategorieën (bijv. ["B", "C", "CE"]) |
| isActive | Boolean | Default: true | Actieve/inactieve status |
| createdAt | DateTime | Auto-generated | Aanmaaktijdstip |
| updatedAt | DateTime | Auto-updated | Laatst gewijzigd |
| sourceSystem | String? | Optioneel | Bronsysteem (AFAS-voorbereiding) |
| externalId | String? | Optioneel | ID in het bronsysteem |
| syncedAt | DateTime? | Optioneel | Tijdstip laatste synchronisatie |

**Relaties:**
- Heeft meerdere `DriverSkill` (competenties)
- Heeft meerdere `DriverEmploymentRecord` (dienstverbanden)
- Heeft meerdere `DriverFunctionRecord` (functies)
- Heeft meerdere `DriverRosterAssignment` (roostertoewijzingen)
- Heeft meerdere `PlanningEntry` (planningitems)

**Indexen:**
- `(lastName, firstName)` — voor zoeken en sorteren
- `(isActive)` — voor filteren op actieve chauffeurs

**Opmerking:** `employeeNumber` is niet uniek in het schema. Bij import-upsert wordt `findFirst` gebruikt; bij meerdere chauffeurs met hetzelfde nummer wordt alleen de eerste bijgewerkt.

---

### DriverSkill (Chauffeur-Competentie koppeling)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| driverId | String | FK → Driver, verplicht | Chauffeur |
| skillId | String | FK → Skill, verplicht | Competentie |

**Constraints:**
- Unique: `(driverId, skillId)` — een chauffeur kan elke competentie maar één keer hebben
- Cascade delete op beide FK's

---

### DriverEmploymentRecord (Dienstverband)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| driverId | String | FK → Driver, verplicht | Chauffeur |
| sequenceNumber | Int | Verplicht | Volgordenummer (voor chronologische weergave) |
| startDate | String | Verplicht, YYYY-MM-DD | Startdatum dienstverband |
| endDate | String? | Optioneel, YYYY-MM-DD | Einddatum (leeg = lopend) |
| employmentType | String | Verplicht | Type: FULLTIME, PARTTIME, ONCALL, TEMPORARY, CHARTER |
| employerId | String? | FK → Employer, optioneel | Werkgever (SetNull bij verwijdering werkgever) |

**Cascade delete:** Wordt verwijderd als de chauffeur wordt verwijderd.

---

### DriverFunctionRecord (Functie)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| driverId | String | FK → Driver, verplicht | Chauffeur |
| sequenceNumber | Int | Verplicht | Volgordenummer |
| startDate | String | Verplicht, YYYY-MM-DD | Startdatum functie |
| endDate | String? | Optioneel, YYYY-MM-DD | Einddatum (leeg = lopend) |
| position | String | Verplicht | Functienaam (bijv. "Chauffeur", "Planner") |
| locationId | String? | FK → Location, optioneel | Locatie (SetNull bij verwijdering) |
| departmentId | String? | FK → Department, optioneel | Afdeling (SetNull bij verwijdering) |
| manager | String? | Optioneel | Naam van de leidinggevende |

**Cascade delete:** Wordt verwijderd als de chauffeur wordt verwijderd.

---

### DriverRosterAssignment (Roostertoewijzing)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| driverId | String | FK → Driver, verplicht | Chauffeur |
| sequenceNumber | Int | Verplicht | Volgordenummer |
| startDate | String | Verplicht, YYYY-MM-DD | Startdatum toewijzing |
| endDate | String? | Optioneel, YYYY-MM-DD | Einddatum (leeg = lopend) |
| rosterProfileId | String | FK → RosterProfile, verplicht | Roosterprofiel |
| weeklyHours | Float? | Optioneel | Wekelijkse contracturen |

**Indexen:**
- `(driverId, startDate, endDate)` — voor datum-overlap queries

**Business rule:** Bij het opslaan van een roostertoewijzing worden automatisch `PlanningEntry`-records gegenereerd voor maximaal 364 dagen op basis van het roosterprofiel-dagpatroon (cyclus van 28 dagen).

---

### PlanningEntry (Planningitem)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| driverId | String | FK → Driver, verplicht | Chauffeur |
| date | String | Verplicht, YYYY-MM-DD | Datum |
| status | String | Verplicht | Status: ROSTER_FREE, BASE_ROSTER, AVAILABLE_EXTRA, LEAVE, SICK |
| leaveTypeId | String? | FK → LeaveType, optioneel | Verloftype (alleen bij status LEAVE) |
| sickPercentage | Int? | Optioneel | Ziektepercentage (alleen bij status SICK) |
| notes | String? | Optioneel | Notities |
| scenarioId | String? | FK → Scenario, optioneel | Scenario (NULL = standaard/basisscenario) |

**Constraints:**
- Unique: `(driverId, date, scenarioId)` — maximaal één item per chauffeur per dag per scenario

**Indexen:**
- `(driverId)` — voor chauffeur-specifieke queries
- `(date)` — voor datum-range queries
- `(scenarioId)` — voor scenario-specifieke queries
- `(scenarioId, date)` — voor planning-grid ophalen
- `(scenarioId, date, status)` — voor capaciteitsberekeningen

**Cascade delete:** Wordt verwijderd als de chauffeur of het scenario wordt verwijderd. LeaveType wordt op NULL gezet bij verwijdering.

---

### Scenario

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| name | String | Verplicht | Naam van het scenario |
| description | String? | Optioneel | Beschrijving |
| createdAt | DateTime | Auto-generated | Aanmaaktijdstip |
| updatedAt | DateTime | Auto-updated | Laatst gewijzigd |

**Relaties:**
- Heeft meerdere `PlanningEntry` (planningitems)

**Business rule:** Het standaardscenario heeft geen databaserecord — planningitems met `scenarioId = NULL` behoren tot het standaardscenario. Scenario's kunnen worden gedupliceerd, waarbij alle planningitems worden gekopieerd.

---

## 3. Gebruikersbeheer

### User (Gebruiker)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| name | String | Verplicht | Naam |
| email | String | Unique, verplicht | E-mailadres (login-identifier) |
| emailVerified | DateTime? | Optioneel | Tijdstip e-mailverificatie |
| image | String? | Optioneel | Profielfoto-URL |
| role | String | Default: "PLANNER" | Rol: ADMIN, PLANNER, VIEWER |
| createdAt | DateTime | Auto-generated | Aanmaaktijdstip |
| updatedAt | DateTime | Auto-updated | Laatst gewijzigd |

**Relaties:**
- Heeft meerdere `Account` (OAuth-koppelingen)
- Heeft meerdere `Session` (actieve sessies)
- Heeft meerdere `UserPreference` (voorkeuren)

**Rollen:**
- **ADMIN:** Volledige toegang — inclusief instellingen, gebruikersbeheer, importbronnen en roosterprofielen
- **PLANNER:** Lezen + schrijven op chauffeurs, planning en scenario's
- **VIEWER:** Alleen leestoegang op alle gegevens

---

### Account (OAuth-koppeling)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| userId | String | FK → User, verplicht | Gebruiker |
| type | String | Verplicht | Accounttype (bijv. "oauth") |
| provider | String | Verplicht | Provider (bijv. "google", "azure-ad") |
| providerAccountId | String | Verplicht | ID bij de provider |
| refresh_token | String? | Optioneel | OAuth refresh token |
| access_token | String? | Optioneel | OAuth access token |
| expires_at | Int? | Optioneel | Vervaltijdstip token |
| token_type | String? | Optioneel | Type token |
| scope | String? | Optioneel | OAuth scope |
| id_token | String? | Optioneel | OpenID Connect ID token |
| session_state | String? | Optioneel | Sessiestatus |

**Constraints:**
- Unique: `(provider, providerAccountId)` — één koppeling per provider per account
- Cascade delete: wordt verwijderd als de gebruiker wordt verwijderd

---

### Session (Sessie)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| sessionToken | String | Unique, verplicht | Sessietoken |
| userId | String | FK → User, verplicht | Gebruiker |
| expires | DateTime | Verplicht | Vervaldatum sessie |

**Cascade delete:** Wordt verwijderd als de gebruiker wordt verwijderd.

---

### UserPreference (Gebruikersvoorkeur)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| userId | String | FK → User, verplicht | Gebruiker |
| key | String | Verplicht | Voorkeursleutel |
| value | String | Verplicht | Voorkeurwaarde |
| updatedAt | DateTime | Auto-updated | Laatst gewijzigd |

**Constraints:**
- Unique: `(userId, key)` — één waarde per voorkeur per gebruiker
- Cascade delete: wordt verwijderd als de gebruiker wordt verwijderd

---

## 4. Connectiviteitshub

### ImportSource (Importbron)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| name | String | Verplicht | Naam van de importbron |
| type | String | Default: "CSV" | Type bron (momenteel alleen CSV) |
| targetEntity | String | Verplicht | Doelentiteit: "drivers", "employers", "departments", "locations" |
| fieldMappings | Json (JSONB) | Verplicht | Veldkoppelingen: `{ bronKolom: doelVeld }` |
| description | String? | Optioneel | Beschrijving |
| createdAt | DateTime | Auto-generated | Aanmaaktijdstip |
| updatedAt | DateTime | Auto-updated | Laatst gewijzigd |

**Relaties:**
- Heeft meerdere `ImportLog` (importgeschiedenis)

---

### ImportLog (Importlogboek)

| Veld | Type | Constraints | Beschrijving |
|---|---|---|---|
| id | String (UUID) | PK, auto-generated | Unieke identifier |
| importSourceId | String | FK → ImportSource, verplicht | Importbron |
| fileName | String | Verplicht | Naam van het geüploade bestand |
| totalRows | Int | Verplicht | Totaal aantal rijen in het bestand |
| importedRows | Int | Verplicht | Aantal nieuw aangemaakte rijen |
| updatedRows | Int | Default: 0 | Aantal bijgewerkte rijen (bij upsert) |
| skippedRows | Int | Verplicht | Aantal overgeslagen rijen |
| errors | Json? (JSONB) | Optioneel | Array van foutdetails: `[{ row, field?, message }]` |
| executedAt | DateTime | Auto-generated | Tijdstip uitvoering |

**Cascade delete:** Wordt verwijderd als de importbron wordt verwijderd.

---

## 5. Relatieoverzicht

```
Employer ─────┐
              ├──→ DriverEmploymentRecord ──→ Driver
              │
Department ───┤
              ├──→ DriverFunctionRecord ────→ Driver
Location ─────┘

Skill ──→ DriverSkill ──→ Driver

RosterProfile ──→ RosterProfileDay
              ──→ DriverRosterAssignment ──→ Driver

LeaveType ──→ PlanningEntry ──→ Driver
                             ──→ Scenario

User ──→ Account
     ──→ Session
     ──→ UserPreference

ImportSource ──→ ImportLog
```

**Cascade-gedrag:**
- Verwijdering van een **Driver** verwijdert alle gerelateerde records (skills, dienstverbanden, functies, roostertoewijzingen, planningitems)
- Verwijdering van een **Scenario** verwijdert alle planningitems van dat scenario
- Verwijdering van een **User** verwijdert accounts, sessies en voorkeuren
- Verwijdering van een **Employer/Location/Department** zet de FK in gerelateerde records op NULL (SetNull)
- Verwijdering van een **LeaveType** zet `leaveTypeId` in planningitems op NULL
- Verwijdering van een **RosterProfile** wordt geblokkeerd als er roostertoewijzingen aan gekoppeld zijn
- Verwijdering van een **ImportSource** verwijdert de importgeschiedenis
- Verwijdering van een **Skill** verwijdert de koppeling met chauffeurs (Cascade op DriverSkill)
