# MODEL_ROUTING.md

## Goal
Minimize premium-token burn while preserving quality on complex tasks.

## Routing policy (manual workflow)

### Tier 0 — Local tiny (heartbeat/microtasks)
Use local Ollama model `qwen2.5:3b` for:
- heartbeat checks
- short status summaries
- simple classification / extraction
- rewrite/format tasks

(We also have `qwen3:4b` installed, but it’s currently unreliable for strict-format outputs in our pipeline due to its thinking-mode behavior.)

Hard limits:
- no codebase-wide refactors
- no multi-file architecture decisions
- no security-critical changes

### Tier 1 — Cheap cloud model (general tasks)
Use a low-cost cloud model for:
- normal Q&A
- medium summarization
- light planning

Escalate if uncertain, long-context required, or repeated failures.

### Tier 2 — Premium model (Codex / strongest)
Use premium model for:
- coding/debugging with tools
- high-stakes decisions
- ambiguous, multi-step, or failure-prone tasks
- final review when Tier 0/1 output confidence is low

Thinking policy for premium tasks:
- Keep main chat low-think/off for normal back-and-forth.
- For hard tasks, run premium work in a sub-agent with high/long thinking.
- Codex is reserved for tool-heavy config/debugging and final hard-task passes.

## Escalation rules
Escalate one tier up when any is true:
- task needs repository/tool execution with non-trivial changes
- confidence < 0.8
- response requires strict correctness and auditability
- prior tier failed twice

## Cost-control rules
- Default to Tier 0 for heartbeat.
- Keep heartbeat disabled unless explicitly configured in HEARTBEAT.md.
- Prefer short prompts and targeted context retrieval.
- Use premium model only when needed, not by default.

## Local model status
- Ollama installed and running via systemd
- Model available: `qwen3:4b`
