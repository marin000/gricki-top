# Grički top

Mobilna aplikacija (iOS / Android) oko zagrebačkog podneva: digitalni pucanj topa, timing izazov, dnevne priče i kviz.

## Struktura

```text
backend/   # Express + TypeScript + MongoDB
mobile/    # Expo Router + NativeWind
```

## Preduvjeti

- Node.js 22+
- MongoDB Atlas (odvojene development / production baze)
- Expo CLI / EAS za native buildove

## Backend (lokalno)

```bash
cd backend
cp .env.example .env   # popuni MONGODB_URI
npm install
npm run content:validate
npm run content:seed -- --start-date YYYY-MM-DD --dry-run
npm run content:seed -- --start-date YYYY-MM-DD
npm run content:reset-schedule -- --start-date YYYY-MM-DD --dry-run
npm run content:reset-schedule -- --start-date YYYY-MM-DD
npm run dev
```

`content:reset-schedule` pomiče `contentStartDate` i ponovno računa `publishAt` za sve dnevne priče/kvizove (dan 1 opet kreće od novog datuma u 12:00 Zagreb). Ne briše korisnički napredak.

API default lokalno: `http://localhost:3000`

### Env (backend)

| Varijabla | Opis |
|---|---|
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_DB_NAME` | Ime baze (npr. `gricki-top`) |
| `PORT` | Lokalni port (default `3000`) |
| `NODE_ENV` | `development` / `production` |
| `CONTENT_TIMEZONE` | `Europe/Zagreb` |
| `RATE_LIMIT_*` | Vidi `.env.example` |

`CONTENT_START_DATE` se **ne** drži u runtime envu — zadaje se eksplicitno pri `content:seed` / `content:reset-schedule`.

### Deploy (Vercel)

API je deployan na Vercel kao Express aplikacija. U Vercel projektu postavi iste Mongo env varijable kao gore (produkcijska baza, odvojena od developmenta).

Nakon deploya, mobilni `EXPO_PUBLIC_API_URL` mora pokazivati na produkcijski / preview API URL (bez trailing slasha).

**Ne** seedaj produkcijsku bazu iz preview okruženja. Seed i `reset-schedule` pokreći namjerno, s poznatim `--start-date`.

## Mobile

```bash
cd mobile
cp .env.example .env   # EXPO_PUBLIC_API_URL
npm install
npx expo start
```

### Env (mobile)

| Varijabla | Opis |
|---|---|
| `EXPO_PUBLIC_API_URL` | Javni API base URL (lokalni LAN IP, Vercel preview ili production) |

Za EAS buildove isti ključ postavi u Expo → Project → Environment variables za `development` / `preview` / `production`.

### EAS

Profili su u [`mobile/eas.json`](mobile/eas.json):

- `development` — dev client, internal APK
- `preview` — internal distributija
- `production` — store / app-bundle, autoIncrement

```bash
cd mobile
eas build --profile preview --platform android
eas build --profile production --platform all
```

Native ikone, splash i zvuk topa ulaze u build iz `mobile/assets/`. Expo Go ne zamjenjuje potpuno native module (AV / notifikacije).

## Vlasnički resursi (checklist)

- MongoDB Atlas URI + odvojene development / production baze
- `CONTENT_START_DATE` za seed (YYYY-MM-DD)
- Vercel projekt + env za API
- Expo / EAS account, `EXPO_PUBLIC_API_URL` po okruženju
- Store listing materijali (kad ideš u store): finalni ikone već u repo, screenshotovi po potrebi

## Napomene

- Sadržajni paket živi u `backend/content/` (seed s ključevima odgovora — nikad u mobile bundle).
- Lokalni folderi `dizajn/`, `Gricki_top/` i `PROJECT_STRUCTURE.md` su u `.gitignore` i ne commitaju se.
- `DELETE /v1/me` briše napredak uređaja; sadržaj ostaje. U Postavkama: „Izbriši moje podatke”.
