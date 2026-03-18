# SpecForge Local Runbook

## Scope
- Local demo recovery for the SpecForge web app, collab server, and parity runner.
- Lightweight observability for room auth, room load/store, and reconnect flows.

## Primary Commands
```bash
cd ideas/collab-markdown-spec-studio/web
npm run dev
npm run test
npm run lint
npm run build
npm run test:e2e

cd ../collab-server
npm run dev

cd ..
docker compose up --build
```

## Runtime Signals
- Web app: editor toolbar status chip shows `connecting`, `live`, `saving`, `recovering`, `offline`, `stale`, or `error`.
- Collab server: structured JSON logs for `server_listen`, `auth_ok`, `auth_failed`, `room_load`, `room_store`, `client_connected`, and `client_disconnected`.
- Health endpoints:
  - web app: `GET /api/health`
  - collab server: `GET http://127.0.0.1:4322/health`
- Persistence:
  - app state snapshot under `web/.data/`
  - room snapshots under `collab-server/.data/collab-rooms/`
  - hosted overrides:
    - `SPECFORGE_DB_PATH`
    - `SPECFORGE_COLLAB_STORE_DIR`

## Failure Modes

### Collab room auth fails
- Symptom: editor banner shows auth/error state and the room never becomes live.
- Check:
  - web route `POST /api/collab/session`
  - `SPECFORGE_COLLAB_SECRET` matches between web and collab-server shells if overridden
  - collab server log event `auth_failed`
- Recovery:
  - restart `web` and `collab-server`
  - click `Reconnect room`

### Room goes stale after another save
- Symptom: banner says a newer snapshot is available.
- Check:
  - `GET /api/documents/:id` returns a higher version than the open workspace
- Recovery:
  - click `Reload latest snapshot`
  - verify version increment in the toolbar message

### Offline / reconnect
- Symptom: banner says `Offline` or `Reconnecting room`.
- Recovery:
  - restore network or restart the local collab server
  - click `Reconnect room`
  - confirm toolbar returns to `live`

### Snapshot drift between app workers
- Symptom: page reload shows old document state.
- Check:
  - `web/.data/` exists and is writable
  - latest save created a new snapshot timestamp
- Recovery:
  - save again from the draft stage
  - refresh the page

## Observability Notes
- Use collab server JSON logs as the first debugging surface.
- Hit the health endpoints before deeper debugging to distinguish startup issues from document-sync issues.
- Both health endpoints now expose the active persistence configuration, which is the first place to check for mounted-volume drift.
- Use Playwright `npm run test:e2e` as the local integration smoke test after fixes.
- Treat the launch packet as the final parity artifact: if export/handoff/execution diverge, rebuild the launch context first.
