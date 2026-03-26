---
name: specforge
description: |
  MANUAL TRIGGER ONLY: invoke only when user types /specforge.
  Full SpecForge workflow: Act 1 (Sprint Planning) → Act 2 (Spec Generation) → Handoff.
  Guides you through optional planning stages (Discovery, CEO Review, Eng Review,
  Design Review, Security Review), then into the multiplayer spec editor with governed
  patch proposals, clarification queue, readiness gate, and export bundle (PRD, SPEC,
  TASKS, agent_spec.json, handoff.json).
  Also suggest adjacent skills: /specforge-plan for Act 1 only, /specforge-handoff
  for emitting the final handoff JSON.
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

# SpecForge

You are running the full SpecForge workflow (idea → thoroughly pressure-tested, collaboratively authored spec → build-ready handoff JSON).

## Context Detection

Detect which runtime context you are in:

```bash
# Check for local CLI
_LOCAL=$(ls ideas/collab-markdown-spec-studio/web/package.json 2>/dev/null && echo "yes" || echo "no")
# Check for hosted API
_API_URL="${SPECFORGE_API_URL:-}"
echo "LOCAL: $_LOCAL"
echo "API_URL: $_API_URL"
```

## Workflow

### Act 1 — Sprint Planning (optional)

Five optional stages. Each produces a governed patch proposal against the spec.

| Stage | Key outputs |
|-------|-------------|
| Discovery | Problem statement, user segments, success signals |
| CEO Review | 10-star vision, scope hardening, anti-goals |
| Engineering Review | Architecture, data flow, tech stack, failure modes, test matrix |
| Design Review | Design system, interaction model, accessibility |
| Security Review | Trust boundaries, OWASP threat model, auth model |

```bash
# If local repo:
cd ideas/collab-markdown-spec-studio/web
# Open the web UI at http://localhost:3000/workspace?stage=plan
# Or use the API directly:
# POST /api/documents/:id/plan-sessions
# POST /api/documents/:id/plan-sessions/:sid/advance   (complete a stage with answers)
# POST /api/documents/:id/plan-sessions/:sid/skip-stage (skip a stage)
```

All stages are **optional and skippable**. Stage completion/skip state is recorded in the final handoff JSON for provenance.

### Act 2 — Spec Generation (existing)

1. Start/open a document at `?stage=start`
2. Draft on the shared canvas (`?stage=draft`) — Tiptap + Yjs CRDT multiplayer
3. Review stage (`?stage=review`) — open comments, queue patch proposals, use **Iterate with AI** per section
4. Decide stage (`?stage=decide`) — accept/cherry-pick/reject patch queue
5. Export stage (`?stage=export`) — readiness gate, export bundle, handoff JSON

### Section-Level Iteration

Every spec section has an **"Iterate with AI"** button. Usage:
```bash
# Via API:
POST /api/documents/:id/sections/:blockId/iterate
# Body: { "message": "make the success criteria more specific", "actor_id": "...", "actor_type": "human" }
# Returns: { patch_id, block_id, proposed_content, tool }
```

### Handoff

```bash
# Emit final handoff.json:
POST /api/documents/:id/handoff
# Or use /specforge-handoff skill
```

## Running Locally

```bash
cd ideas/collab-markdown-spec-studio
bun install
bun run dev          # web + collab server
# Open http://localhost:3000
```

## Neither local nor API configured?

Tell the user:
> "To use SpecForge, either:
> 1. Clone the repo and run `bun run dev` in `ideas/collab-markdown-spec-studio/`
> 2. Set `SPECFORGE_API_URL=https://your-hosted-instance` in your environment"
