# LiveAlerts (TikAlerts / YTAlerts / KickAlerts / TwitchAlerts)

Local-first Windows desktop streaming alerts app built with Electron + Node.js + TypeScript.

## Node Version
- Node.js 20 to 24 supported

## Setup
```bash
npm install
npm run start
```

## Windows Compatibility (important)
- Node 24.12.0 is supported.
- No Visual Studio C++ Build Tools are required for install anymore.
- Run:
```powershell
npm install
npm run start
```

If you previously saw:
`Named export 'autoUpdater' not found`
update to the latest commit and run:
```powershell
npm run build
npm run start
```

## Architecture
- `src/main`: Electron main + preload
- `src/renderer`: Minimal dashboard UI
- `src/overlay`: Local HTTP + WebSocket overlay server for OBS Browser Sources
- `src/core`: Event bus, canonicalization, rule engine, conditions/actions/templates
- `src/storage`: SQLite DB + repos
- `src/services`: TikTok/licensing/cache/TTS/points service modules (MVP stubs + core logic)

---

## Milestone A — Bootstrapped Electron+TS
Implemented:
- ESM TypeScript project with Electron startup scripts.
- Main window loads renderer HTML.

How to run:
```bash
npm run start
```
How to test:
- Confirm desktop app opens and shows LiveAlerts MVP dashboard.

## Milestone B — Event Bus + Logging
Implemented:
- Pino JSON logger in main process (`LiveAlerts` app name).
- Event bus with `emitEvent` and `onEvent`.
- App emits and logs `app.started`.

How to run:
```bash
npm run start
```
How to test:
- Check console output for `app.started emitted`.

## Milestone C — Overlay HTTP+WS
Implemented:
- Local server at port `3210`.
- `GET /` health text.
- `GET /screen/:id` transparent overlay page.
- `GET /screen/:id?debug` debug panel with status/event count.
- WS protocol supports `HELLO`, `READY`, `HEARTBEAT` and tracks `LOADING/ONLINE/OFFLINE`.
- Alert queue rendering centered with enter/exit animation.
- `GET /api/screens`, `POST /api/screens` endpoints.

How to run:
```bash
npm run start
```
How to test:
- Open `http://127.0.0.1:3210/screen/screen-default`
- Open `http://127.0.0.1:3210/screen/screen-default?debug`

## Milestone D — SQLite Storage + Screens Persistence
Implemented:
- DB file: `./data/livealerts.sqlite` (JSON-backed local store for Node 24 compatibility).
- Migrations for `profiles`, `screens`, `rules`, and `points`.
- Seeds default profile (`profile-default`) and default screen (`screen-default`).
- Startup logs show loaded counts and default screen URL.

How to run:
```bash
npm run start
```
How to test:
- Verify `data/livealerts.sqlite` is created.
- Use `POST /api/screens` and restart app; confirm screen persists with `GET /api/screens`.

## Milestone E — Profiles + Rules Base
Implemented:
- `profilesRepo`: list/set active/get active.
- `rulesRepo`: list enabled and upsert rules.
- Default rule `rule-test-alert` for `test.alert` targeting `screen-default`.
- `/test` endpoint emits local raw event.

How to run:
```bash
npm run start
```
How to test:
- Open default overlay URL in browser.
- Hit `http://127.0.0.1:3210/test` and verify alert appears.

## Milestone F — Canonical Events + Normalization
Implemented:
- CanonicalEvent model includes `platform/kind/user/metrics/gift/chat/text/raw`.
- Normalizer transforms bus events into canonical events.
- Platform icon metadata map.

How to run:
```bash
npm run start
```
How to test:
- Trigger `/test`; observe rules engine logs using normalized event fields.

## Milestone G — Rules Engine v1
Implemented:
- Conditions DSL (`eq/gte/contains/startsWith/in` with `AND/OR`).
- Global + per-user cooldown support.
- Dot-notation placeholders (`{user.name}`, `{gift.name}`, etc.) with safe fallback.
- Alert action builder with layout/theme/media/badge/platform icon/duration/target screen.
- Emits `overlay.alert` and broadcasts WS `ALERT` by target screen.

How to run:
```bash
npm run start
```
How to test:
- Use seeded `test.alert` rule and `/test` endpoint.
- Check alert appears only on target screen URL.

## Milestone H — Overlay Style Baseline
Implemented:
- Dark gray + mint green variables.
- Overlay remains transparent except alert cards.
- Debug card appears only with `?debug`.

How to run:
```bash
npm run start
```
How to test:
- Compare `/screen/screen-default` vs `/screen/screen-default?debug`.

## Milestones I–M (MVP scaffolding + ready for expansion)
Implemented now:
- TikTok connector skeleton + periodic sample chat emission.
- Gifts catalog skeleton handling unknown gifts placeholders.
- Licensing/session lock stubs with offline grace model.
- Local cache pruning service (size-capped).
- TTS/blocked-words plan limit logic.
- Points local store + inactivity prune.
- Electron auto-update hooks (`electron-updater`) and `electron-builder` configuration for Windows installer + GitHub Releases.

Planned next:
- Real TikTok live detection + stream event ingestion.
- YouTube/Twitch/Kick connectors.
- Full login/backend for one-device lock and mandatory update policy.
- Polished UI screens and rule editor.

---

## OBS Browser Source URLs
- Normal: `http://127.0.0.1:3210/screen/screen-default`
- Debug: `http://127.0.0.1:3210/screen/screen-default?debug`

## Quick Test Checklist
1. Start app with `npm run start`.
2. Open overlay normal and debug URLs.
3. Trigger `http://127.0.0.1:3210/test` and verify alert queue appears centered.
4. Create a new screen from UI or `POST /api/screens`.
5. Open the new screen URL and confirm status updates in debug mode.
6. Confirm normal mode shows no debug information.

## Notes on Source Protection
- Distribution is configured for binary installers via GitHub Releases (`electron-builder` + `electron-updater`).
- Keep repository private and publish only release binaries.
