## SpecForge

**Status**: Scoped MVP/spec parity reached on the build branch

## Usage Modes

SpecForge runs across four surfaces — all backed by the same spec engine:

| Mode | When to use | Entry point |
|------|-------------|-------------|
| **Browser GUI** | Human-driven spec authoring with live collaboration | `bun run dev` → `http://localhost:3000/workspace` |
| **Terminal / TUI** | Spec creation and status from the command line | `specforge init`, `specforge tui` |
| **REST API (BYOA)** | Your own agent submits a brief and polls for artifacts | `POST /api/service/spec-jobs` |
| **Autonomous agent** | SpecForge's own agent runs the full spec loop unattended | `POST /api/service/spec-jobs` with `"mode": "autonomous"` |

See `API_REFERENCE.md` for the full endpoint catalog.

### Concept
A collaborative spec IDE where humans and AI agents work on the same markdown canvas with depth gates, governed patch review, and attributable changes.

### Thesis
Collaborative editors already exist. The wedge is not generic editing; it is a spec-native workspace that keeps humans and agents on one canvas, enforces decision depth, and turns approved specs into execution-ready outputs.

### Canonical Docs
1. `EXECUTIVE_SUMMARY.md`
2. `PRD.md`
3. `SPEC.md`
4. `ARCHITECTURE_DECISIONS.md`
5. `TECH_STACK.md`
6. `TASKS.md`
7. `web/README.md`
8. `LOCAL_RUNBOOK.md`
9. `DESIGN_PARTNER_TRIAL_PROMPT.md`

### Full Pack (Grouped)
- Product and strategy: `EXECUTIVE_SUMMARY`, `PRD`, `SPEC`
- Architecture and runtime: `ARCHITECTURE_DECISIONS`, `TECH_STACK`, `LOCAL_RUNBOOK`, `EVENT_MODEL`
- UX and flow: `VISION_AND_FLOW`, `UX_PRINCIPLES`, `USER_FLOWS`
- Validation and economics: `VALIDATION_PLAN`, `GO_NO_GO_SCORECARD`, `PILOT_SCORECARD_TEMPLATE`, `FINANCIAL_MODEL`, `RISK_REGISTER`
- Build surface: `web/`, `collab-server/`, `contracts/`, `fixtures/`, `FIRST_60_MINUTES.md`, `ACCEPTANCE_TEST_MATRIX.md`
- Component plan: `COMPONENT_MODEL.md`
- Backlog and execution: `TASKS`, `90_DAY_EXECUTION_PLAN`, `DECISIONS`, `AGENT_HANDOFF`
- Archived/working notes: `archive/`, `RESEARCH_NOTES.md`

### Source Notes
Primary references and links are consolidated in `RESEARCH_NOTES.md` to avoid duplication.

### Current Product Position
1. Validate authoring behavior first:
   - repeat collaborative use
   - trust in governed agent patches
   - ability to reach a build-ready spec
2. Use selected `ideas/` packs as example corpora and end-to-end benchmarks.
3. Treat repo generation as a downstream proof surface, not the initial product gate.
4. Use `/` as the marketing/overview surface, `/pricing` as the commercial framing page, and `/workspace` as the actual product.
5. Let local operators reuse existing Codex CLI or Claude Code CLI logins for guided assist without shipping secrets to the browser.
6. Reuse one OpenSpec core across the web app, terminal CLI, and orchestrator so the product stops drifting across surfaces.
7. Give design partners a copy-paste prompt they can hand to their own AI helper so trial sessions stay structured even without a live moderator.

### Applied Learnings
1. Lock the wedge early:
   - guided specs + governed agent review + one-shot handoff
   - avoid drifting back into generic collaborative editing
2. Export is not enough:
   - the product only becomes legible when export turns into starter handoff, execution brief, and launch packet
3. Put the workflow into the UI:
   - if the next action is not obvious on screen, the spec is still too ambiguous
4. Constrain generation first:
   - one curated TypeScript starter is a better MVP than broad repo generation claims
5. Keep browser tests on the real path:
   - create -> review -> decide -> handoff is the regression boundary for future idea builds
6. Remove placeholder content aggressively:
   - live `TBD` text in seeds, fallbacks, or generated scaffolds makes the product feel unfinished even when the underlying code works
7. Share commercial contracts:
   - pricing, plan JSON, and entitlement logic should come from one catalog or they will drift immediately
8. Thin pages and stores early:
   - once a route or persistence module becomes hard to skim, extract by domain before more product logic piles in

### Current Runtime
1. `web/` is the real Next.js app.
2. `collab-server/` is the real Hocuspocus/Yjs collaboration service.
3. `core/` now contains the first shared OpenSpec runtime modules used by both browser and terminal flows.
4. `orchestrator/` now contains shared delivery-loop backlog logic consumed by the runner and the web UI.
5. `cli/` now exposes a terminal-native `specforge` wizard over the same guided spec model.
6. The local app persists state in `web/.data/` and auto-seeds from `fixtures/`.
7. The root workspace scripts are only wrappers around the real runnable app and test commands.
8. `docker compose up --build` now brings up the web app, collaboration service, and Postgres with health checks.
9. Runtime health surfaces:
   - `web`: `/api/health`
   - `web metrics`: `/api/metrics`
   - `collab-server`: `http://localhost:4322/health`
   - `collab metrics`: `http://localhost:4322/metrics`
10. Health and metrics responses include persistence configuration so local-vs-hosted storage drift is visible without opening the code.
11. The local deployment rehearsal now ships `fixtures/` inside the web image and exercises the hosted Postgres path instead of only local snapshots.
12. Local demo mode still includes admin controls for resetting workspace state and seeding review activity during MVP testing.

### Post-Parity Company Plan
1. Run design-partner validation on the hosted rehearsal path.
2. Decide hosted SaaS only vs self-hosted OSS + hosted SaaS.
3. Add deeper commercial onboarding and conversion instrumentation on top of the current landing/pricing surfaces.
4. Add billing, metering, backup/restore, and stronger operational dashboards.
5. Expand starter generation only after design-partner usage proves the next templates.
