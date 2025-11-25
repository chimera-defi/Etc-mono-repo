# AI Experiment Tracks

This workspace collects AI constraint toolkits we can evaluate while prototyping agentic apps. Each toolkit folder contains a hand-off packet (`README`, `UNDERSTANDING`, `TASKS`, `NEXT_STEPS`, `HANDOFF`) so another agent can immediately continue the investigation.

## Current Shortlist

| Toolkit | Repo | Constraint Strategy | Recommended Use Case |
| --- | --- | --- | --- |
| Spec Kit | `github/spec-kit` | Spec-first workflow that compiles Markdown specs into JSON schemas and guard policies enforced at runtime | When we need deterministic, auditable responses (checklists, workflows, policy compliance) |
| Guardrails AI | `guardrails-ai/guardrails` | `RAIL` definition files plus validators, re-asking, and security filters on top of any LLM backend | Customer-facing bots that must stay within compliance, safety, or formatting rails |
| Microsoft Guidance | `microsoft/guidance` | Token-level control via templating, regex/JSON schema constraints, and streaming function calls | Fine-grained orchestration for multi-step generations or structured tool use |
| Outlines | `normal-computing/outlines` | Grammars and finite-state machines to guarantee outputs that satisfy EBNF/JSON schema | Rapid prototyping of structured data generation or code that must compile |

If we identify more candidates, follow the same folder template and append them to the table above.

## Folder Layout

```
ai_experiments/
  └─ <toolkit>/
       README.md          # overview + integration notes
       UNDERSTANDING.md   # research context & assumptions
       TASKS.md           # actionable backlog
       NEXT_STEPS.md      # prioritized near-term plan
       HANDOFF.md         # quick-start for the next agent
```

Each document favors brevity and clear action items so agents can pick up work without re-reading the entire repository.
