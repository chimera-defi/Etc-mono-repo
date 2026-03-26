# Orbit Pilot Task List

**Forward progress:** use **[`V1_ROADMAP.md`](./V1_ROADMAP.md)** for “what’s done / what’s next” in one place. Update that file when V1 status changes.

## Milestones
1. Spec package approved. ✅
2. Seed platform registry locked. ✅
3. Core orchestrator implemented (CLI + services + CI). ✅
4. **Pilot launch run completed** — real operator run (see V1_ROADMAP Next #1). ⬜

## Phase 0
- [x] Finalize naming and positioning.
- [x] Confirm initial platform allowlist (seed registry in `apps/.../bundled/seed_platforms.yaml`).
- [ ] Confirm pilot launch dataset (operator-specific).

## Workstreams

### WS-1 Registry
- [x] Normalize initial platforms (seed list; extend as needed).
- [x] Assign mode, risk, URLs; optional `image_constraints`, `cta_in_body`.
- [x] Image presets in code + registry overrides.
- [x] `orbit registry-lint` + CI on bundled `seed_platforms.yaml` (HTTPS / no placeholders / unique slugs).

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
- [x] V1 scheduling (`schedule-add` / `schedule-list` / `schedule-run` / `schedule-cancel`, file lock).
- [x] V1 schedule: timezone + recurrence, argv allowlist (`ORBIT_SCHEDULE_ALLOW_ARBITRARY` escape hatch).
- [x] V1 optional browser assist (Playwright portal open; policy + env gated).
- [x] V1 optional supervised browser autofill (registry `browser_form_selectors` + policy + env).
- [ ] Full web operator UI (see `FRONTEND_VISION.md`).

## One-Shot Build Gates
- [x] Build graph documented (`orchestrate`, SPEC).
- [x] Code aligned with safety rules and registry.
- [x] Seed registry present.
- [x] Sample outputs refreshed (CLI `--json` examples in `SAMPLE_OUTPUTS.md`; revisit if output shape changes).
- [x] First 60 minutes documented.
