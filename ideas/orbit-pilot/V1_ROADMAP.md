# Orbit Pilot — V1 roadmap (single forward tracker)

**V1 CLI + agent contracts are shipped** — see [`V1_SHIPPED.md`](./V1_SHIPPED.md). This file tracks **what’s left for your launches** (operator work), not missing product code.

**Canonical progress doc.** Update when scope changes. Detailed checklists: [`TASKS.md`](./TASKS.md).

## V1 product definition (ship target)

**V1 = production-ready CLI + agent contracts** for launch/backlink ops: one `launch.yaml`, registry YAML, generate/publish/report/mark-done, audit, optional risk policy, webhook, deferred jobs, optional Playwright assist — **not** a full web app.

| In scope for V1 | Out of scope (post-V1) |
|-----------------|-------------------------|
| CLI, `--json`, bundled JSON Schemas, `validate-json` | Full web operator UI → [`FRONTEND_VISION.md`](./FRONTEND_VISION.md) |
| `check-run`, `registry-lint`, CI (unit + optional Playwright job) | Live-site browser E2E in CI (manual / separate harness) |
| Seed registry ↔ [`PLATFORM_MATRIX.md`](./PLATFORM_MATRIX.md) parity test | “Every backlink site on the internet” |
| Official publishers where tokens + APIs are stable | New publishers only when contracts are stable |

## Progress dashboard

### Done (V1 foundation — keep stable)

- Core orchestration: plan, doctor, generate, regenerate, publish, mark-done, report, next, guide, campaigns, latest, export (json/md/html), audit, init, serve (webhook).
- Risk policy YAML; LangGraph plan + generate graphs; CTA policy; registry image constraints.
- Agent tooling: schemas manifest, `orbit schemas`, `orbit validate-json`, `orbit check-run`, `orbit registry-lint`, `orbit version`, [`AGENTS.md`](../../apps/orbit-pilot/AGENTS.md).
- Scheduling: `schedule-add/list/run/cancel`, timezone + recurrence, argv allowlist, file lock.
- Browser path: policy + env gated assist; optional autofill via `browser_form_selectors`; Playwright E2E tests in CI (`browser-e2e` job).
- Tests: ~87 unit/integration (+ 2 opt-in browser tests); matrix/seed parity test.

### Next (your launches — not blocked on repo code)

1. **Pilot runs** — [`PILOT_RUN_CHECKLIST.md`](./PILOT_RUN_CHECKLIST.md) for each product (Orbit Pilot, WalletRadar, …): edit `launch.yaml`, run **`orbit pipeline --json`** (or steps), then manual/API publish and `mark-done`.
2. **Sample outputs** — [`SAMPLE_OUTPUTS.md`](./SAMPLE_OUTPUTS.md); refresh if CLI keys change.
3. **Registry** — Add rows via `PLATFORM_MATRIX.md` + `seed_platforms.yaml` + parity test map when you need more sites.

### Post-V1 product (separate initiatives)

- Full web operator UI.
- More official publishers when APIs are stable.
- Unsupervised high-risk automation (out of scope for this CLI’s safety model).

## How we iterate (anti-regression)

1. Pick the **top unchecked item** under **Next** (or a TASKS checkbox that maps to it).
2. Ship a **small PR**; update **this file** and **`TASKS.md`** in the same change when status changes.
3. Do **not** treat refactors or doc-only cleanups as “new scope” unless they unblock a **Next** item.

## Links

| Doc | Role |
|-----|------|
| [`TASKS.md`](./TASKS.md) | Workstream checkboxes |
| [`SPEC.md`](./SPEC.md) | Technical contract |
| [`AGENTS.md`](../../apps/orbit-pilot/AGENTS.md) | Agent workflows |
| [`V0_BUILD_PLAN.md`](./V0_BUILD_PLAN.md) | Historical V0 plan (superseded by V1 for forward work) |
| [`PILOT_RUN_CHECKLIST.md`](./PILOT_RUN_CHECKLIST.md) | Milestone 4 operator steps |
| [`SAMPLE_OUTPUTS.md`](./SAMPLE_OUTPUTS.md) | Human copy + CLI JSON examples |
| [`V1_SHIPPED.md`](./V1_SHIPPED.md) | What V1 means; agent fast path |
