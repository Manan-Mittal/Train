# LeaveTime

LeaveTime is a mobile-first Next.js app that computes a risk-aware **"leave home by"** time for public-transit trips with transfers.

## Features

- Presets for:
  - Abigail → Rutgers 9:00 AM (default destination: College Ave Student Center)
  - Me → Christopher St
- Custom origin/destination/date/arrival time.
- Buffer-aware recommendation:
  - Per-transfer safety buffer (default 8 min)
  - Global uncertainty buffer (default 10 min)
- Risk score model:
  - `transfers * 1.0`
  - `short transfers <6m * 2.5`
  - `legs with no realtime * 0.75`
  - `known disruption alerts * 3.0`
- Backup itinerary selection.
- Realtime/alerts adapters:
  - PATH GTFS-RT (`https://path.transitdata.nyc/gtfsrt`)
  - MTA GTFS-RT alerts feed
  - NJ TRANSIT adapter with graceful fallback when no key/endpoint exists
- Planner architecture:
  - `TransitlandPlanner` primary
  - `GooglePlanner` fallback (optional key)
- In-memory LRU caching + retry w/ exponential backoff for transient failures.

## Stack

- Next.js 14 (App Router) + TypeScript
- Route handlers for secure API calls (`/app/api/compute/route.ts`)
- `gtfs-realtime-bindings` for protobuf GTFS-RT parsing
- Vitest unit tests + Playwright e2e test

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Required env vars

See `.env.example`.

- `TRANSITLAND_API_KEY` (optional but recommended). This app passes it as `apikey` query/header as required by Transitland.
- `GOOGLE_MAPS_API_KEY` (optional fallback planner)
- `MTA_ALERT_FEED_URL` (defaults provided)
- `NJT_ALERT_ENDPOINT` and `NJT_API_KEY` (optional)

App runs in Transitland-only mode with safe defaults when paid keys are absent.

If you get `No route found from planners`, inspect `/api/compute` response `details.diagnostics` for provider-level errors and coverage gaps.

## Run tests

```bash
npm test
npm run test:e2e
```

## Project structure

- `/app` – pages + API route handlers
- `/components` – UI components
- `/lib/planners` – planner provider interface + Transitland/Google providers
- `/lib/realtime` – PATH/MTA/NJT adapters
- `/lib/scoring` – risk and buffer logic
- `/lib/storage` – local storage helpers
- `/tests/unit` – risk/buffer/sorting tests
- `/tests/e2e` – Rutgers preset happy-path using mocked API response

## Adding presets

Update `components/TripForm.tsx` preset handlers, or add local-storage-backed presets via `lib/storage/local.ts`.
