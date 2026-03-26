# Orbit Pilot Task List

## Milestones
1. Spec package approved.
2. Seed platform registry locked.
3. Core orchestrator skeleton implemented.
4. Pilot launch run completed.

## Phase 0
- [x] Finalize naming and positioning.
- [x] Confirm initial platform allowlist (seed registry in `apps/.../bundled/seed_platforms.yaml`).
- [ ] Confirm pilot launch dataset (operator-specific).

## Workstreams

### WS-1 Registry
- [x] Normalize initial platforms (seed list; extend as needed).
- [x] Assign mode, risk, URLs; optional `image_constraints`, `cta_in_body`.
- [x] Image presets in code + registry overrides.

### WS-2 Core Orchestrator
- [x] State model and config loader.
- [x] UTM processor and duplicate detector.
- [x] Audit logging (SQLite + JSONL), cooldowns, LangGraph plan + generate.

### WS-3 Publishers
- [x] Medium, GitHub, DEV, LinkedIn, X (official paths where configured).
- [ ] Additional publishers only when API contracts are stable.

### WS-4 Manual Queue
- [x] Manual packs, checklists, status, live URL.
- [x] Operator notes (`orbit mark-done --note`).

### WS-5 Operator Surface
- [x] Optional Textual TUI (`orbit tui`), HTML export, JSON schemas, `validate-json`, `check-run`.
- [x] V1 scheduling (`orbit schedule-add` / `schedule-list` / `schedule-run`).
- [x] V1 optional browser assist (Playwright portal open; policy + env gated).
- [ ] Full web operator UI (see `FRONTEND_VISION.md`).

## One-Shot Build Gates
- [x] Build graph documented (`orchestrate`, SPEC).
- [x] Code aligned with safety rules and registry.
- [x] Seed registry present.
- [ ] Sample outputs refreshed if UX changes (optional).
- [x] First 60 minutes documented.
