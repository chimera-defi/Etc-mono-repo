---
name: specforge-plan
description: Use when a user wants to run the SpecForge Sprint Planning pipeline — the structured Act 1 ideation phase inspired by G-Stack's sprint planning skills. Walks through Discovery, CEO Review, Engineering Review, Design Review, and Security Review stages. Each stage produces a governed patch proposal against the live spec document. All stages optional and skippable. Works in CLI/TUI for solo and agent-native flows; multiplayer in the web workspace.
---

# SpecForge Plan Skill

Use this skill when the user wants to:
- pressure-test a product idea before writing a spec
- run structured planning stages (discovery, CEO review, engineering review, design review, security review)
- run a single named planning stage
- skip specific stages and proceed
- get machine-readable stage outputs for agent pipelines

## Stages

| Stage | What it does |
|---|---|
| `discovery` | Problem framing, user segments, success signals. Pre-fills PRD "Problem" section. |
| `ceo-review` | 10-star product vision, scope hardening, anti-goals. Pre-fills PRD "Vision" + "Non-goals". |
| `eng-review` | Architecture, data flow, tech stack choices, failure modes, test matrix. Pre-fills SPEC. |
| `design-review` | Design system constraints, interaction model, accessibility decisions. Emits `DESIGN_SYSTEM.md`. |
| `security-review` | OWASP threat model, trust boundaries, security requirements. Emits `SECURITY.md`. |

Each stage: AI asks structured questions → user answers → AI generates structured output as a governed patch proposal → user reviews/accepts in the normal SpecForge patch queue. No stage auto-applies changes.

## Default flow

### Run the full pipeline (interactive TUI)

```bash
bun run specforge -- plan
```

Walks through stages in order. Presents AI questions, collects answers, generates patch proposals. User can skip any stage at any time.

### Run a specific stage

```bash
bun run specforge -- plan --stage discovery
bun run specforge -- plan --stage ceo-review
bun run specforge -- plan --stage eng-review
bun run specforge -- plan --stage design-review
bun run specforge -- plan --stage security-review
```

### Skip a stage and continue

```bash
bun run specforge -- plan --skip security-review
bun run specforge -- plan --skip design-review --skip security-review
```

### Agent-native / machine-readable output

```bash
bun run specforge -- plan --json
bun run specforge -- plan --stage discovery --json
```

Returns JSON with stage name, patch proposal ID, questions asked, and structured outputs. Skipped stages are recorded with `"status": "skipped"` in the session state.

### Hosted API mode

If `SPECFORGE_API_URL` is set (no local repo available):

```bash
POST $SPECFORGE_API_URL/documents/:id/plan-sessions
POST $SPECFORGE_API_URL/documents/:id/plan-sessions/:sid/advance
POST $SPECFORGE_API_URL/documents/:id/plan-sessions/:sid/skip-stage
```

### Check session state

```bash
bun run specforge -- status --json   # shows current stage + completed/skipped stages
```

## After planning

When the user has completed the stages they want, proceed to spec generation:

```bash
bun run specforge -- init            # guided spec wizard (pre-filled from planning outputs)
bun run specforge -- tui             # interactive menu
```

Or open the web workspace for multiplayer spec editing:
- `/workspace` → spec editor with all planning patch proposals already in the review queue

## Emit handoff JSON

After spec is complete:
```bash
bun run specforge -- handoff --json
```

See `/specforge-handoff` for the full handoff flow.

## Rules

- Never hard-block on a skipped stage. Planning stages are optional by design.
- Do not invent answers to AI questions — ask the user, even if the question seems obvious.
- All stage outputs go through the governed patch workflow; never write directly to canonical doc state.
- In multiplayer mode, all collaborators can participate in the same planning session via the web workspace.
- If the local `specforge` CLI is not available, fall back to the hosted API (`SPECFORGE_API_URL`). If neither is available, ask the user to run `bun install` in the SpecForge repo.

## Verification

```bash
bun run test:cli
bun run specforge -- plan --stage discovery --json   # smoke test: should return structured JSON
```
