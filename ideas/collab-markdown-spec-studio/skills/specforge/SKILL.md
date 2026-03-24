---
name: specforge
description: Use when a user wants to turn a rough product idea into a thoroughly planned, collaboratively authored spec bundle. This skill drives the full SpecForge workflow — Sprint Planning stages (Act 1), guided spec generation (Act 2), section-level iteration, and build-agnostic handoff. Works in CLI/TUI for solo or agent-native flows; directs to the web workspace for multiplayer collaboration.
---

# SpecForge Skill

Use this skill when the user wants:
- a rough prompt expanded into a structured spec brief
- to walk through planning stages (discovery, CEO review, engineering review, design review, security review) before writing a spec
- guided follow-up questions before committing to a PRD
- terminal-native spec creation through SpecForge
- to iterate on a specific section of a spec with AI assistance
- a path from idea → Sprint Planning → PRD/SPEC/TASKS → handoff JSON

## Workflow overview

SpecForge is a two-act workflow:
- **Act 1 (Sprint Planning):** optional planning stages inspired by the G-Stack sprint discipline. Each stage produces a governed patch proposal. All stages skippable.
- **Act 2 (Spec Generation):** guided spec wizard, multiplayer CRDT editing, governed patch review, export bundle.
- **Handoff:** `handoff.json` with export bundle + stage provenance. Build tooling agnostic.

## Default flow

### Starting fresh with planning

1. Walk through sprint planning stages:
```bash
bun run specforge -- plan
# or a specific stage:
bun run specforge -- plan --stage discovery
bun run specforge -- plan --stage ceo-review
bun run specforge -- plan --stage eng-review
bun run specforge -- plan --stage design-review
bun run specforge -- plan --stage security-review
# skip a stage:
bun run specforge -- plan --skip security-review
# machine-readable output for agent use:
bun run specforge -- plan --json
```

2. After planning, move to spec generation:
```bash
bun run specforge -- init --title "<title>" --problem "<problem>"
```

### Jumping straight to spec (no planning)

```bash
bun run specforge -- init --title "<title>" --problem "<problem>"
```

If the brief is fuzzy, ask only the minimum missing questions:
- who is the user?
- what outcome matters most?
- what is explicitly out of scope?
- what constraints are real?

### Interactive TUI (recommended for terminal-native flows)

```bash
bun run specforge -- tui   # includes plan, init, iterate, status, handoff menu
```

### Iterating on a specific section

```bash
bun run specforge -- iterate --section <block-id> --message "make user segments more specific"
# interactive (prompts for message):
bun run specforge -- iterate --section <block-id>
```

### Runtime status and backlog

```bash
bun run specforge -- status --json
bun run specforge -- context --json
bun run specforge -- backlog
```

### Handoff

```bash
bun run specforge -- handoff         # emit handoff.json with export bundle + stage provenance
bun run specforge -- handoff --json  # machine-readable
```

### Multiplayer / web workspace

When the user needs live multiplayer collaboration (all planning stages and spec editing support multiplayer):
- `/workspace` for the live web app
- the stable document share URL after the draft exists

## Related skills

- `/specforge-plan` — runs the full Act 1 planning pipeline (or a named stage)
- `/specforge-handoff` — emits the final handoff.json

## Rules

- Prefer the local CLI/TUI for solo or agent-native flows.
- Prefer the web workspace for multiplayer collaboration, review, comments, and patch decisions.
- All planning stages are optional — never hard-block on a skipped stage.
- Do not invent missing requirements; use a short clarifying question instead.
- Treat the first output as a minimum extensible product spec, not a final perfect spec.
- When local Codex CLI or Claude Code CLI is available, the web assist flow can reuse that runtime; browser clients should not receive provider secrets.

## Verification

```bash
bun run verify
bun run test:cli
```
