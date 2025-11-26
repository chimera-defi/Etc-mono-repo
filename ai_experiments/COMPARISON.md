# Spec-Driven Development Tools Comparison

## Overview

Both tools enable **spec-driven development** but take different approaches:

| Aspect | Spec Kit | B-MAD Method |
|--------|----------|--------------|
| **Core Philosophy** | Specs as contracts for AI outputs | Methodology as guidance for AI workflows |
| **Spec Format** | Markdown → JSON Schema + guards | PRDs, architecture docs, user stories |
| **Enforcement** | Runtime validation + re-prompting | Workflow-based agent guidance |
| **Scope** | Single AI call/response | Full development lifecycle |

---

## Benefits and Downsides

### Spec Kit

| Benefits | Downsides |
|----------|-----------|
| ✅ Spec-first keeps human intent as source of truth | ⚠️ Large specs become hard to maintain |
| ✅ Markdown specs are readable and version-controllable | ⚠️ Runtime validation adds 50-150ms latency |
| ✅ Generates JSON Schema + guard policies automatically | ⚠️ Requires compiled artifacts at runtime |
| ✅ Traceability for compliance/auditing | ⚠️ Better for single-call constraints than workflows |
| ✅ TypeScript-first (aligns with our stack) | |
| ✅ Tool-agnostic (works with any LLM provider) | |

### B-MAD Method

| Benefits | Downsides |
|----------|-----------|
| ✅ Complete development lifecycle framework | ⚠️ Methodology framework, not runtime validator |
| ✅ 19 specialized agents (PM, Architect, Dev, UX, etc.) | ⚠️ v6 is alpha; v4 is stable but less feature-rich |
| ✅ 50+ guided workflows adapting to project complexity | ⚠️ Learning curve for methodology adoption |
| ✅ Scale-adaptive intelligence | ⚠️ Higher integration effort |
| ✅ Document sharding (90% token savings) | ⚠️ Works best with specific IDEs (Cursor, Claude Code) |
| ✅ B-MAD Builder for custom agents/workflows | |
| ✅ JavaScript/TypeScript-first | |

---

## Head-to-Head Comparison

| Criteria | Spec Kit | B-MAD Method | Notes |
|----------|----------|--------------|-------|
| **Spec-Driven** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Both are spec-first approaches |
| **TypeScript Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Both are TS/JS first |
| **Ease of Integration** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Spec Kit is drop-in; B-MAD is methodology |
| **Learning Curve** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Spec Kit is simpler to start |
| **Customization** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | B-MAD has custom agents/workflows |
| **Cursor Integration** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | B-MAD explicitly supports Cursor |
| **Documentation** | ⭐⭐⭐ | ⭐⭐⭐⭐ | B-MAD has more extensive docs |
| **Maturity** | ⭐⭐⭐ | ⭐⭐⭐ | Both are relatively new |

---

## When to Use Each

### Use Spec Kit When:
- You need **deterministic, auditable AI responses**
- Working with **specific AI call contracts** (input → output)
- Building features that require **compliance traceability**
- You want **minimal methodology overhead**
- Focus is on **constraining individual AI outputs**

### Use B-MAD Method When:
- You need **complete AI-driven development workflow**
- Building **products/platforms** from scratch
- Want **specialized AI agents** for different roles (PM, Architect, etc.)
- Need **scale-adaptive planning** for varying project complexity
- Working extensively in **Cursor** or similar IDEs
- Want to **customize agents and workflows** for your domain

### Use Both Together When:
- B-MAD for **development process** (PRDs, architecture, implementation)
- Spec Kit for **specific feature contracts** (API responses, data validation)
- This combination gives you both **workflow guidance** and **output guarantees**

---

## Complementary Usage Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    B-MAD Method                              │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│  │   PM    │ → │ Architect│ → │Developer│ → │  QA     │     │
│  │ Agent   │   │  Agent   │   │  Agent  │   │ Agent   │     │
│  └────┬────┘   └────┬────┘   └────┬────┘   └─────────┘     │
│       │             │             │                          │
│       ▼             ▼             ▼                          │
│    [PRD]      [Architecture]  [Implementation]               │
│                                   │                          │
│                                   ▼                          │
│                         ┌─────────────────┐                  │
│                         │    Spec Kit     │                  │
│                         │   (per feature) │                  │
│                         └────────┬────────┘                  │
│                                  │                           │
│                                  ▼                           │
│                         [Validated AI Outputs]               │
└─────────────────────────────────────────────────────────────┘
```

---

## Decision Matrix

| Your Situation | Recommendation |
|----------------|----------------|
| Building a quick feature with AI | **Spec Kit** |
| Starting a new product from scratch | **B-MAD Method** |
| Need compliance/audit trails | **Spec Kit** |
| Want AI to follow development methodology | **B-MAD Method** |
| Working heavily in Cursor | **B-MAD Method** (or both) |
| Need specific output guarantees | **Spec Kit** |
| Want customizable AI agents | **B-MAD Method** |
| Minimal setup, fast start | **Spec Kit** |
