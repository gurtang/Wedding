# Wedding RSVP App

Production-ready mini aplikacija za svadbene pozivnice sa RSVP funkcionalnošcu.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Google Sheets API (`googleapis`)
- Session/cookie admin auth
- Deploy na Vercel

## Funkcionalnosti

- Javna personalizovana strana: `/rsvp/[token]`
- Dvojezicni UI na javnoj strani: SR/EN
- Pracenje otvaranja linka (`first_opened_at`, `last_opened_at`, `invite_status`)
- RSVP forma sa limitom dodatnih gostiju po `max_guests`
- Zakljucavanje posle RSVP roka + rucno zakljucavanje po gostu
- Admin login: `/admin/login`
- Admin dashboard: `/admin`
- Detalji gosta: `/admin/guests/[guestId]`
- Settings editor: `/admin/settings`

## Lokalni setup

1. Instaliraj zavisnosti:

```bash
npm install
```

2. Kreiraj `.env.local` iz `.env.example` i popuni vrednosti.

3. Pokreni dev server:

```bash
npm run dev
```

4. Otvori:

- `http://localhost:3000/admin/login`
- `http://localhost:3000/rsvp/<token>`

## ENV varijable

Obavezne:

- `ADMIN_USERNAME` (npr. `slobodan`)
- `ADMIN_PASSWORD` (npr. `milena`)
- `SESSION_SECRET` (duga random vrednost)
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (sa escaped `\n`)
- `GOOGLE_SHEETS_SPREADSHEET_ID`

Opcione:

- `NEXT_PUBLIC_BASE_URL` (npr. `https://your-domain.vercel.app`)

## Google Sheets podešavanje

Potrebna su 2 sheet taba:

### 1) `Guests`

Prvi red mora imati tacno ove kolone:

- `guest_id`
- `token`
- `display_name`
- `custom_greeting`
- `side`
- `group`
- `phone`
- `invite_status`
- `invite_sent_at`
- `invite_channel`
- `default_language`
- `max_guests`
- `rsvp_status`
- `attending_count`
- `additional_guest_names`
- `note`
- `decline_reason`
- `response_updated_at`
- `first_opened_at`
- `last_opened_at`
- `is_locked_manual`

Napomene:

- `additional_guest_names` je JSON string, npr. `["Ana Petrovic","Luka Petrovic"]`
- `invite_status`: `nije_poslata | poslata | otvorena`
- `rsvp_status`: `nije_odgovorio | dolazi | ne_dolazi`
- `default_language`: `sr | en`
- `max_guests >= 1`

### 2) `Settings`

Kolone:

- `key`
- `value`

Obavezni kljucevi:

- `couple_names_sr`
- `couple_names_en`
- `event_date`
- `venue_name`
- `venue_address`
- `map_url`
- `guest_arrival_time`
- `ceremony_time`
- `rsvp_deadline`
- `intro_text_sr`
- `intro_text_en`
- `agenda_sr`
- `agenda_en`

## Service Account setup

1. U Google Cloud projektu ukljuci Google Sheets API.
2. Kreiraj Service Account i JSON key.
3. U `.env.local` prekopiraj:
   - `client_email` -> `GOOGLE_CLIENT_EMAIL`
   - `private_key` -> `GOOGLE_PRIVATE_KEY` (zameni newline sa `\n`)
4. Podeli Google Sheet sa service account email-om kao Editor.

## Seed primer

Primer CSV fajla je u [`docs-seed-guests.csv`](./docs-seed-guests.csv).

Možeš da ga importuješ u `Guests` sheet ili rucno uneseš 4 primera:

- `max_guests=1`
- `max_guests=2`
- `max_guests=4`
- gost sa `default_language=en`

## Skripte

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run start
```

## Deploy na Vercel

1. Push na GitHub.
2. Import projekta na Vercel.
3. Dodaj sve env varijable iz `.env.example`.
4. Redeploy.

Aplikacija je kompatibilna sa Vercel deployment modelom (server-side env, App Router, bez potrebe za dodatnom bazom).

## Struktura foldera

```text
app/
  admin/
    guests/[guestId]/page.tsx
    login/page.tsx
    settings/page.tsx
    actions.ts
    layout.tsx
    page.tsx
  api/rsvp/[token]/route.ts
  rsvp/[token]/page.tsx
  layout.tsx
  page.tsx
  globals.css
components/
  admin/
  rsvp/
lib/
  auth.ts
  date.ts
  sheets.ts
  translations.ts
  types.ts
  validation.ts
tests/
  date-utils.test.ts
```

## Rute

- `GET /`
- `GET /rsvp/[token]`
- `POST /api/rsvp/[token]`
- `GET /admin/login`
- `GET /admin`
- `GET /admin/guests/[guestId]`
- `GET /admin/settings`

## Sigurnosne napomene

- Admin kredencijali se proveravaju server-side preko env varijabli.
- Session je `httpOnly` cookie sa HMAC potpisom.
- Middleware štiti sve `/admin/*` rute osim `/admin/login`.
- Google credentials se koriste iskljucivo na serveru.
- Javna RSVP ruta ne može da menja odgovor nakon roka ili kada je gost rucno zakljucan.

