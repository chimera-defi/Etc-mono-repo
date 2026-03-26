# Orbit Pilot V1 — shipped (CLI + agent contracts)

**V1 is the current CLI** in `apps/orbit-pilot/`: production-oriented commands, `--json` outputs, bundled JSON Schemas, CI (ruff, pytest, registry-lint, optional Playwright E2E).

## What “usable for agents” means here

- **`orbit pipeline --launch … --platforms … --out … --json`** — one round-trip: plan, doctor, generate, `check-run`; `ok_all` + exit code for automation.
- **`orbit validate-json <schema>`** — validate any CLI-shaped JSON against bundled schemas (`orbit schemas --json` for the manifest).
- **`orbit init --preset walletradar`** — WalletRadar-oriented `launch.yaml` stub (edit before real use).
- **Post-generate:** `orbit next` / `orbit guide` / `orbit mark-done` / `orbit publish` (dry-run by default) as documented in [`AGENTS.md`](../../apps/orbit-pilot/AGENTS.md).

## Explicitly not V1 (later)

- Full **web operator UI** → [`FRONTEND_VISION.md`](./FRONTEND_VISION.md).
- **Live credential E2E** in CI (tokens, real site posts) — run locally or in your environment.

## Real launches (Orbit Pilot + WalletRadar)

Use [`PILOT_RUN_CHECKLIST.md`](./PILOT_RUN_CHECKLIST.md). Filling `launch.yaml` and posting to third-party sites requires **your** accounts and compliance review — the CLI provides packs and audit, not automatic mass posting.
