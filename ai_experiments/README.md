# AI Experiment Tracks

This workspace collects AI constraint toolkits we can evaluate while prototyping agentic apps. Each toolkit folder contains a hand-off packet (`README`, `UNDERSTANDING`, `TASKS`, `NEXT_STEPS`, `HANDOFF`) so another agent can immediately continue the investigation.

## 🚀 Quick Start

1. **Understand the landscape**: Read [COMPARISON.md](./COMPARISON.md) for benefits/downsides
2. **Review criteria**: See [COMPARISON_CRITERIA.md](./COMPARISON_CRITERIA.md) for evaluation framework
3. **Implementation plan**: Check [IMPLEMENTATION_FRAMEWORK.md](./IMPLEMENTATION_FRAMEWORK.md) for the unified demo approach
4. **Task tracking**: See [IMPLEMENTATION_TASKS.md](./IMPLEMENTATION_TASKS.md) for all implementation tasks

## 🎯 Comparison Approach

We're building the **same demo application** (Travel Planning Assistant) with each tool to enable fair comparison across:
- Implementation effort & developer experience
- Constraint effectiveness & validation
- Performance (latency, tokens, retries)
- Production readiness

## Current Shortlist

| Toolkit | Repo | Constraint Strategy | Category | Recommended Use Case |
| --- | --- | --- | --- | --- |
| Spec Kit | `github/spec-kit` | Spec-first workflow that compiles Markdown specs into JSON schemas and guard policies | Runtime Validation | Auditable policy compliance |
| Guardrails AI | `guardrails-ai/guardrails` | `RAIL` definition files plus validators, re-asking, and security filters | Runtime Validation | Customer-facing compliance |
| Microsoft Guidance | `microsoft/guidance` | Token-level control via templating, regex/JSON schema constraints | Token-Level | Multi-step orchestration |
| Outlines | `normal-computing/outlines` | Grammars and finite-state machines to guarantee outputs | Token-Level | Structured data generation |
| B-MAD Method | `bmad-code-org/BMAD-METHOD` | Development methodology framework with specialized agents | Workflow | AI-driven development lifecycle |
| **Beckett** | ❓ Unknown | ❓ TBD | ❓ TBD | ❓ Needs clarification |

If we identify more candidates, follow the same folder template and append them to the table above.

## 📁 Folder Layout

```
ai_experiments/
├── README.md                    # This file - overview
├── COMPARISON.md                # Benefits/downsides comparison
├── COMPARISON_CRITERIA.md       # Evaluation criteria
├── IMPLEMENTATION_FRAMEWORK.md  # Unified demo approach
├── IMPLEMENTATION_TASKS.md      # All implementation tasks
├── common/                      # Shared test data & schemas
│   ├── test_prompts.json       # Unified test prompts
│   └── expected_schemas.json   # Expected response schema
├── benchmarks/                  # Cross-tool benchmarking
│   ├── run_benchmarks.py       # Benchmark runner
│   └── results/                # Benchmark results
└── <toolkit>/                   # Per-toolkit folders
    ├── README.md               # Overview + integration notes
    ├── UNDERSTANDING.md        # Research context & assumptions
    ├── TASKS.md                # Actionable backlog
    ├── NEXT_STEPS.md           # Prioritized near-term plan
    ├── HANDOFF.md              # Quick-start for the next agent
    └── demo/                   # Implementation (when built)
```

Each document favors brevity and clear action items so agents can pick up work without re-reading the entire repository.

## 📊 Implementation Status

| Tool | Documentation | Demo Implementation |
|------|---------------|---------------------|
| Spec Kit | ✅ Complete | ⬜ Not Started |
| Guardrails AI | ✅ Complete | ⬜ Not Started |
| Microsoft Guidance | ✅ Complete | ⬜ Not Started |
| Outlines | ✅ Complete | ⬜ Not Started |
| B-MAD Method | ✅ Complete | ⬜ Not Started |
| Beckett | ❓ Unknown | ❓ Unknown |
