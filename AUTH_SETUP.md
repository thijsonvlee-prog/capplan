# Authenticatie configureren — CapPlan

Deze handleiding beschrijft hoe je authenticatie activeert voor CapPlan in Vercel (of een andere hostingomgeving).

---

## Overzicht

CapPlan gebruikt **NextAuth.js v4** met database-sessies via Prisma. Authenticatie is **optioneel**: zonder configuratie werkt de applicatie zonder inlogvereiste en zijn alle functies beschikbaar. Zodra de omgevingsvariabelen zijn ingesteld, worden gebruikers verplicht in te loggen en geldt rolhandhaving (Admin, Planner, Kijker).

Ondersteunde providers:
- **Google** (OAuth 2.0)
- **Microsoft** (Azure AD)

Je kunt één of beide providers configureren.

---

## Stap 1: Vereiste omgevingsvariabelen

Stel de volgende variabelen in via **Vercel → Project Settings → Environment Variables** (of `.env.local` voor lokale ontwikkeling):

| Variabele | Verplicht | Beschrijving |
|---|---|---|
| `NEXTAUTH_SECRET` | Ja | Willekeurige geheime sleutel voor sessie-encryptie |
| `NEXTAUTH_URL` | Ja | Volledige URL van de applicatie (bijv. `https://capplan.vercel.app`) |
| `GOOGLE_CLIENT_ID` | Per provider | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Per provider | Google OAuth Client Secret |
| `AZURE_AD_CLIENT_ID` | Per provider | Azure AD Application (client) ID |
| `AZURE_AD_CLIENT_SECRET` | Per provider | Azure AD Client Secret |
| `AZURE_AD_TENANT_ID` | Per provider | Azure AD Directory (tenant) ID |

**Minimale configuratie:** `NEXTAUTH_SECRET` + `NEXTAUTH_URL` + ten minste één providerpaar.

---

## Stap 2: NEXTAUTH_SECRET genereren

Genereer een veilige willekeurige sleutel:

```bash
openssl rand -base64 32
```

Kopieer de uitvoer en stel deze in als `NEXTAUTH_SECRET`.

---

## Stap 3a: Google OAuth instellen

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/).
2. Selecteer of maak een project.
3. Ga naar **APIs & Services → Credentials**.
4. Klik op **Create Credentials → OAuth client ID**.
5. Selecteer **Web application** als type.
6. Stel in:
   - **Authorized JavaScript origins:** `https://capplan.vercel.app` (je Vercel-URL)
   - **Authorized redirect URIs:** `https://capplan.vercel.app/api/auth/callback/google`
7. Klik op **Create**.
8. Kopieer de **Client ID** en **Client Secret**.
9. Stel in Vercel in:
   - `GOOGLE_CLIENT_ID` = de Client ID
   - `GOOGLE_CLIENT_SECRET` = de Client Secret

**Let op:** Bij lokale ontwikkeling voeg je ook `http://localhost:3000` toe als origin en `http://localhost:3000/api/auth/callback/google` als redirect URI.

---

## Stap 3b: Microsoft (Azure AD) instellen

1. Ga naar [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade).
2. Klik op **New registration**.
3. Stel in:
   - **Name:** CapPlan (of een naam naar keuze)
   - **Supported account types:** kies het gewenste bereik (alleen je organisatie, of alle Microsoft-accounts)
   - **Redirect URI:** selecteer **Web** en voer in: `https://capplan.vercel.app/api/auth/callback/azure-ad`
4. Klik op **Register**.
5. Noteer de **Application (client) ID** en **Directory (tenant) ID** van de overzichtspagina.
6. Ga naar **Certificates & secrets → New client secret**.
7. Maak een secret aan en kopieer de **Value** (niet de Secret ID).
8. Stel in Vercel in:
   - `AZURE_AD_CLIENT_ID` = Application (client) ID
   - `AZURE_AD_CLIENT_SECRET` = de secret value
   - `AZURE_AD_TENANT_ID` = Directory (tenant) ID

**Let op:** Bij lokale ontwikkeling voeg je ook `http://localhost:3000/api/auth/callback/azure-ad` toe als redirect URI.

---

## Stap 4: Verifiëren

1. Deploy de applicatie (of herstart lokaal).
2. Open de applicatie in de browser.
3. Je wordt doorgestuurd naar de inlogpagina (`/login`).
4. Klik op de knop van je geconfigureerde provider.
5. Na succesvol inloggen word je doorgestuurd naar het planningsscherm.
6. De eerste gebruiker die inlogt krijgt automatisch de rol **PLANNER**. Wijzig de rol naar **ADMIN** via de database als je beheertoegang nodig hebt:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'jouw-email@voorbeeld.nl';
```

Daarna kun je via de applicatie (Instellingen → Gebruikers) rollen toewijzen aan andere gebruikers.

---

## Rollen

| Rol | Rechten |
|---|---|
| **Admin** | Volledige toegang: instellingen, gebruikersbeheer, importbronnen, roosterprofielen, chauffeurs, planning, scenario's |
| **Planner** | Lezen + schrijven: chauffeurs, planning, scenario's |
| **Kijker** | Alleen lezen: alle schermen, geen bewerkingsmogelijkheden |

---

## Gedrag zonder authenticatie

Wanneer `NEXTAUTH_SECRET` **niet** is ingesteld:
- De applicatie werkt zonder inlogvereiste
- Alle functies zijn beschikbaar voor iedereen
- Rolhandhaving is uitgeschakeld
- Er verschijnt geen inlogpagina of sessie-indicator

Dit is het standaardgedrag voor ontwikkel- en preview-omgevingen.

---

## Probleemoplossing

| Probleem | Oorzaak | Oplossing |
|---|---|---|
| "Server error" bij openen | `NEXTAUTH_SECRET` is ingesteld maar provider-variabelen ontbreken | Stel ten minste één providerpaar in, of verwijder `NEXTAUTH_SECRET` |
| Callback-fout na inloggen | Redirect URI komt niet overeen | Controleer dat de redirect URI exact overeenkomt (inclusief protocol en pad) |
| Gebruiker kan niet inloggen | Provider is niet geconfigureerd | Controleer of alle vereiste variabelen voor de provider zijn ingesteld |
| Rol is niet zichtbaar | Eerste keer inloggen | Standaardrol is PLANNER. Wijzig via SQL of via een bestaande Admin |
