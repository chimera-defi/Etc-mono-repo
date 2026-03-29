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
- explicit UX coverage for frontend design, wireframes, or UI guidelines before build kickoff

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
- what is the primary surface and what are the key screens or failure states?

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

### Post-Spec Design Review

After exporting, designers can review the UX Pack and submit structured feedback:

1. In the Export stage, open the Design Handoff Panel
2. Review the UX Pack preview and design system outputs
3. Enter design feedback in the feedback box — submits as a governed patch
4. Switch to the Decide stage to review/accept the design patch
5. Re-export to get updated handoff.json with design feedback incorporated

Or via API:

```bash
curl -X POST /api/documents/:id/design-feedback \
  -H "Content-Type: application/json" \
  -d '{"feedback": "Primary CTA needs more contrast", "section": "ux-pack"}'
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
- If the product has a human-facing interface, require a UX Pack:
  - primary surface
  - key screens
  - failure states
  - responsive expectations
  - or an explicit `API-only` / `CLI-only` note if no GUI is needed
- Treat the UX Pack as part of the canonical spec, not optional polish.
- When local Codex CLI or Claude Code CLI is available, the web assist flow can reuse that runtime; browser clients should not receive provider secrets.
- SpecForge does not currently hardwire a `gstack` design runtime; hand the UX Pack to an external design-focused skill or agent when wireframes or visual direction are needed.

## Verification

```bash
bun run verify
bun run test:cli
```
