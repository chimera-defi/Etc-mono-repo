# AI Spec-Driven Development Tools

This workspace evaluates tools that enable **spec-driven development** to guide AI agents. We focus on tools where specifications (Markdown, structured docs, methodologies) drive AI behavior during development.

## 🚀 Quick Start

1. **Understand the landscape**: Read [COMPARISON.md](./COMPARISON.md) for benefits/downsides
2. **Review criteria**: See [COMPARISON_CRITERIA.md](./COMPARISON_CRITERIA.md) for evaluation framework
3. **Implementation plan**: Check [IMPLEMENTATION_FRAMEWORK.md](./IMPLEMENTATION_FRAMEWORK.md) for the unified demo approach
4. **Task tracking**: See [IMPLEMENTATION_TASKS.md](./IMPLEMENTATION_TASKS.md) for all implementation tasks

## 🎯 What We're Looking For

Tools that:
- Use **specifications** (Markdown, structured docs) to guide AI behavior
- Enable **spec-first development** workflows
- Help AI agents follow defined methodologies and constraints
- Work with **Cursor + Claude Opus 4.5** as the underlying AI

## ✅ Active Tools

| Toolkit | Repo | Approach | Best For |
| --- | --- | --- | --- |
| **Spec Kit** | `github/spec-kit` | Markdown specs → JSON Schema + guard policies | Auditable, deterministic AI responses |
| **B-MAD Method** | `bmad-code-org/BMAD-METHOD` | Structured methodology with PRDs, architecture, workflows | Full AI-driven development lifecycle |

## ❌ Removed Tools (Not Spec-Driven)

These tools were evaluated but removed because they focus on **runtime validation** or **token-level constraints** rather than spec-driven development:

| Tool | Why Removed |
|------|-------------|
| Guardrails AI | Runtime validation layer, not development guidance |
| Microsoft Guidance | Token-level templating, not spec-driven methodology |
| Outlines | Grammar constraints for valid outputs, not development specs |

> **Note**: These are good tools for their purposes, but don't fit our focus on spec-driven development guidance.

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
│   └── run_benchmarks.ts       # Benchmark runner (TypeScript)
├── spec_kit/                    # Spec Kit implementation
│   ├── README.md
│   └── demo/                   # TypeScript demo
└── bmad/                        # B-MAD Method implementation
    ├── README.md
    └── demo/                   # TypeScript demo
```

## 📊 Implementation Status

| Tool | Documentation | Demo Implementation |
|------|---------------|---------------------|
| Spec Kit | ✅ Complete | ✅ Complete |
| B-MAD Method | ✅ Complete | ✅ Complete |

### Quick Start

```bash
# Spec Kit Demo
cd ai_experiments/spec_kit/demo && npm install
npx tsx src/index.ts prompt "Build a todo app"

# B-MAD Demo
cd ai_experiments/bmad/demo && npm install
npx tsx src/index.ts prompt "Build a todo app"
```

See [COMPARISON_REPORT.md](./COMPARISON_REPORT.md) for detailed findings.

## 🛠️ Technical Stack

- **Language**: TypeScript/JavaScript (all implementations)
- **Runtime**: Node.js
- **AI Provider**: Cursor + Claude Opus 4.5
- **Demo Type**: Minimal viable demos first
