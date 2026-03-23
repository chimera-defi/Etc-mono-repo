---
name: specforge
description: Use when a user wants to turn a rough product idea into a guided spec bundle with follow-up questions, PRD/SPEC/TASKS outputs, or a terminal-native SpecForge flow. This skill drives the local SpecForge CLI/TUI, asks for missing requirements, and points to the shared workspace when multiplayer review is needed.
---

# SpecForge Skill

Use this skill when the user wants:
- a rough prompt expanded into a structured spec brief
- guided follow-up questions before committing to a PRD
- terminal-native spec creation through SpecForge instead of a browser flow
- a path from brief -> PRD/SPEC/TASKS -> workspace handoff

## Default flow

1. If the user already has a short brief, start with:
```bash
bun run specforge -- init --title "<title>" --problem "<problem>"
```

2. If the brief is fuzzy, ask only the minimum missing questions:
- who is the user?
- what outcome matters most?
- what is explicitly out of scope?
- what constraints are real?

3. When interactive terminal guidance is better, use:
```bash
bun run specforge -- tui
```

4. For the current backlog/runtime state, use:
```bash
bun run specforge -- status --json
bun run specforge -- context --json
bun run specforge -- backlog
```

5. When the user needs multiplayer review or shared editing, direct them to:
- `/workspace` for the live app
- the stable document share URL after the draft exists

## Rules

- Prefer the local CLI/TUI for solo or agent-native spec generation.
- Prefer the web workspace for multiplayer collaboration, review, comments, and patch decisions.
- Do not invent missing requirements if a short clarifying question can resolve them.
- Treat the first output as a minimum extensible product spec, not a final perfect spec.
- When local Codex CLI or Claude Code CLI is available, the web assist flow can reuse that runtime; browser clients should not receive provider secrets.

## Verification

Run the shared gate before claiming the skill-backed flow is healthy:
```bash
bun run verify
bun run test:cli
```
