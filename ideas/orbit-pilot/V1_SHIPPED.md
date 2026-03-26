# Orbit Pilot V1 — shipped (CLI + agent contracts)

**V1 is the current CLI** in `apps/orbit-pilot/`: production-oriented commands, `--json` outputs, bundled JSON Schemas, CI (ruff, registry-lint, full pytest with Playwright/Chromium — **no skipped tests** in `orbit-pilot.yml`).

## What “usable for agents” means here

- **`orbit pipeline --launch … --platforms … --out … --json`** — one round-trip: plan, doctor, generate, `check-run`; `ok_all` + exit code for automation.
- **`orbit validate-json <schema>`** — validate any CLI-shaped JSON against bundled schemas (`orbit schemas --json` for the manifest).
- **`orbit init --preset walletradar`** — WalletRadar-oriented `launch.yaml` stub (edit before real use).
- **Post-generate:** `orbit next` / `orbit guide` / `orbit mark-done` / `orbit publish` (dry-run by default) — [`HUMAN_GUIDE.md`](../../apps/orbit-pilot/HUMAN_GUIDE.md), [`AGENTS.md`](../../apps/orbit-pilot/AGENTS.md).
- **Browser:** `browser_assisted` via **`allow_browser_fallback`** + **`allow_browser_automation`** (registry `browser_fallback_opt_in`) and/or **`allow_browser_assist_manual`** + **`allow_browser_automation`** (registry `manual` rows); autofill/submit/CDP/Kernel — see [`HUMAN_GUIDE.md`](../../apps/orbit-pilot/HUMAN_GUIDE.md), [`SPEC.md`](./SPEC.md).

## Explicitly not V1 (later)

- Full **web operator UI** → [`FRONTEND_VISION.md`](./FRONTEND_VISION.md).
- **Live credential / real-site posting** in CI — not automated; run locally or in your environment (Playwright E2E in CI uses local HTML only).
- **Commercial V2** (hosted tiers, pricing, GTM) — planning in [`V2_ROADMAP.md`](./V2_ROADMAP.md).

## Real launches (Orbit Pilot + WalletRadar)

Use [`PILOT_RUN_CHECKLIST.md`](./PILOT_RUN_CHECKLIST.md) (same steps as `HUMAN_GUIDE.md`). Filling `launch.yaml` and posting to third-party sites requires **your** accounts and compliance review.
