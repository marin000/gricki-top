# Grički top

Mobilna aplikacija (iOS / Android) oko zagrebačkog podneva: digitalni pucanj topa, timing izazov, dnevne priče i kviz.

## Struktura

```text
backend/   # Express + TypeScript + MongoDB
mobile/    # Expo Router + NativeWind
```

## Preduvjeti

- Node.js 22+
- MongoDB Atlas (development baza)
- Expo CLI / EAS kad budeš buildao native

## Backend

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

API default: `http://localhost:3000`

## Mobile

```bash
cd mobile
cp .env.example .env   # EXPO_PUBLIC_API_URL
npm install
npx expo start
```

## Napomene

- Sadržajni paket živi u `backend/content/` (seed s ključevima odgovora — nikad u mobile bundle).
- `CONTENT_START_DATE` se zadaje eksplicitno pri seedanju; nije hardkodiran.
- Lokalni folderi `dizajn/`, `Gricki_top/` i `PROJECT_STRUCTURE.md` su u `.gitignore` i ne commitaju se.
