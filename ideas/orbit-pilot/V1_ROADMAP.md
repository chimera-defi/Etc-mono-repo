# Orbit Pilot — V1 roadmap (single forward tracker)

**Canonical progress doc.** Update this file when scope changes or a slice ships. Detailed checklists stay in [`TASKS.md`](./TASKS.md); this file answers “where are we?” and “what’s next?” without re-reading the whole repo.

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

### Next (ordered — do these to call V1 “complete”)

1. **Milestone 4 — Pilot launch run** — Use [`PILOT_RUN_CHECKLIST.md`](./PILOT_RUN_CHECKLIST.md); record outcome when done.
2. **Sample outputs** — Done: [`SAMPLE_OUTPUTS.md`](./SAMPLE_OUTPUTS.md) includes representative `--json`; re-run locally and update if CLI keys change.
3. **Registry growth (optional)** — Extended with Microlaunch + OpenAlternative (2026-03); add more the same way: `PLATFORM_MATRIX.md` + `seed_platforms.yaml` + `test_platform_matrix_parity._NAME_TO_SLUG`.

### Deferred (explicitly not V1 blockers)

- Full web operator UI.
- Additional official publishers until API contracts are confirmed.
- Automated posting to high-risk / ToS-sensitive flows without human approval.

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
