# AI Guiding Tools - Implementation Task List

This document tracks all implementation tasks for comparing AI constraint/guiding tools.

## 📊 Master Task Overview

| Tool | Category | Total Tasks | High Priority | Status |
|------|----------|-------------|---------------|--------|
| **Common/Benchmarks** | Infrastructure | 6 | 3 | 🟡 In Progress |
| **Outlines** | Token-Level | 7 | 3 | ⬜ Not Started |
| **Guardrails AI** | Runtime Validation | 8 | 4 | ⬜ Not Started |
| **Microsoft Guidance** | Token-Level | 7 | 3 | ⬜ Not Started |
| **Spec Kit** | Runtime Validation | 7 | 3 | ⬜ Not Started |
| **B-MAD Method** | Workflow | 8 | 3 | ⬜ Not Started |
| **Beckett (TBD)** | Unknown | ? | ? | ❓ Needs Clarification |

---

## 🔧 Common Infrastructure Tasks

| ID | Task | Priority | Est. Effort | Status |
|----|------|----------|-------------|--------|
| COMMON-01 | ✅ Create unified test prompts JSON | High | 1h | ✅ Complete |
| COMMON-02 | ✅ Create expected response schema JSON | High | 1h | ✅ Complete |
| COMMON-03 | ✅ Create benchmark runner skeleton | High | 2h | ✅ Complete |
| COMMON-04 | Create Python Pydantic models from schema | Medium | 1h | ⬜ Not Started |
| COMMON-05 | Create TypeScript types from schema | Medium | 1h | ⬜ Not Started |
| COMMON-06 | Set up environment/dependencies management | Medium | 1h | ⬜ Not Started |

---

## 📦 Outlines Implementation (Recommended First - Simplest)

**Location:** `ai_experiments/outlines/demo/`

| ID | Task | Priority | Est. Effort | Status | Dependencies |
|----|------|----------|-------------|--------|--------------|
| OL-IMPL-01 | Create Pydantic models for travel response | High | 1h | ⬜ | COMMON-04 |
| OL-IMPL-02 | Create Outlines grammar-constrained generator | High | 1h | ⬜ | OL-IMPL-01 |
| OL-IMPL-03 | Build FastAPI endpoint wrapper | High | 1h | ⬜ | OL-IMPL-02 |
| OL-IMPL-04 | Add complex nested schema support | Medium | 1h | ⬜ | OL-IMPL-03 |
| OL-IMPL-05 | Test different sampling strategies | Medium | 1h | ⬜ | OL-IMPL-03 |
| OL-IMPL-06 | Add post-hoc semantic validation layer | Medium | 2h | ⬜ | OL-IMPL-04 |
| OL-IMPL-07 | Benchmark decoding speed | Low | 1h | ⬜ | OL-IMPL-03 |

**Total Estimated Effort:** 8 hours

---

## 🛡️ Guardrails AI Implementation (Most Mature)

**Location:** `ai_experiments/guardrails_ai/demo/`

| ID | Task | Priority | Est. Effort | Status | Dependencies |
|----|------|----------|-------------|--------|--------------|
| GR-IMPL-01 | Create travel assistant RAIL spec | High | 2h | ⬜ | COMMON-02 |
| GR-IMPL-02 | Implement custom budget validator | High | 1h | ⬜ | GR-IMPL-01 |
| GR-IMPL-03 | Implement date constraint validator | High | 1h | ⬜ | GR-IMPL-01 |
| GR-IMPL-04 | Build FastAPI server with Guard wrapper | High | 2h | ⬜ | GR-IMPL-02, GR-IMPL-03 |
| GR-IMPL-05 | Configure re-ask strategies (1/2/3 loop) | Medium | 1h | ⬜ | GR-IMPL-04 |
| GR-IMPL-06 | Add structured logging/telemetry | Medium | 1h | ⬜ | GR-IMPL-04 |
| GR-IMPL-07 | Write pytest compliance suite | Medium | 2h | ⬜ | GR-IMPL-04 |
| GR-IMPL-08 | Benchmark latency with re-asks | Low | 1h | ⬜ | GR-IMPL-05 |

**Total Estimated Effort:** 11 hours

---

## 🎯 Microsoft Guidance Implementation (Token-Level Control)

**Location:** `ai_experiments/microsoft_guidance/demo/`

| ID | Task | Priority | Est. Effort | Status | Dependencies |
|----|------|----------|-------------|--------|--------------|
| MG-IMPL-01 | Create Guidance template with JSON constraints | High | 2h | ⬜ | COMMON-02 |
| MG-IMPL-02 | Implement multi-step workflow (understand → plan → respond) | High | 2h | ⬜ | MG-IMPL-01 |
| MG-IMPL-03 | Add regex constraints for dates/budgets | Medium | 1h | ⬜ | MG-IMPL-01 |
| MG-IMPL-04 | Build FastAPI server with template execution | High | 1h | ⬜ | MG-IMPL-02 |
| MG-IMPL-05 | Implement streaming token hooks | Medium | 1h | ⬜ | MG-IMPL-04 |
| MG-IMPL-06 | Write template test suite | Medium | 1h | ⬜ | MG-IMPL-04 |
| MG-IMPL-07 | Benchmark token-level enforcement overhead | Low | 1h | ⬜ | MG-IMPL-04 |

**Total Estimated Effort:** 9 hours

---

## 📋 Spec Kit Implementation (Spec-First Approach)

**Location:** `ai_experiments/spec_kit/demo/`

| ID | Task | Priority | Est. Effort | Status | Dependencies |
|----|------|----------|-------------|--------|--------------|
| SK-IMPL-01 | Create travel assistant spec in Markdown | High | 2h | ⬜ | COMMON-02 |
| SK-IMPL-02 | Compile spec to JSON guards | High | 30m | ⬜ | SK-IMPL-01 |
| SK-IMPL-03 | Build Express server with validation | High | 2h | ⬜ | SK-IMPL-02 |
| SK-IMPL-04 | Implement retry logic on validation failure | Medium | 1h | ⬜ | SK-IMPL-03 |
| SK-IMPL-05 | Add telemetry/logging | Medium | 1h | ⬜ | SK-IMPL-03 |
| SK-IMPL-06 | Write compliance test suite | Medium | 2h | ⬜ | SK-IMPL-03 |
| SK-IMPL-07 | Benchmark latency and token usage | Low | 1h | ⬜ | SK-IMPL-03 |

**Total Estimated Effort:** 9.5 hours

---

## 🔄 B-MAD Method Evaluation (Workflow-Based)

**Location:** `ai_experiments/bmad/demo/`

| ID | Task | Priority | Est. Effort | Status | Dependencies |
|----|------|----------|-------------|--------|--------------|
| BM-IMPL-01 | Install B-MAD v6 and initialize project | High | 30m | ⬜ | None |
| BM-IMPL-02 | Use PM agent for travel assistant PRD | High | 1h | ⬜ | BM-IMPL-01 |
| BM-IMPL-03 | Use Architect agent for technical design | High | 1h | ⬜ | BM-IMPL-02 |
| BM-IMPL-04 | Use Developer agent for implementation | Medium | 2h | ⬜ | BM-IMPL-03 |
| BM-IMPL-05 | Create custom workflow for constraint validation | Medium | 2h | ⬜ | BM-IMPL-04 |
| BM-IMPL-06 | Test B-MAD Builder for custom agents | Medium | 2h | ⬜ | BM-IMPL-04 |
| BM-IMPL-07 | Compare output quality with manual implementations | Low | 1h | ⬜ | BM-IMPL-04 |
| BM-IMPL-08 | Document workflow observations and learnings | Low | 1h | ⬜ | BM-IMPL-07 |

**Total Estimated Effort:** 10.5 hours

---

## ❓ Beckett (Needs Clarification)

**Status:** Unknown - not found in existing documentation

| ID | Task | Priority | Status |
|----|------|----------|--------|
| BK-RESEARCH-01 | Identify what Beckett is (tool, framework, library?) | High | ⬜ |
| BK-RESEARCH-02 | Find repository/documentation | High | ⬜ |
| BK-RESEARCH-03 | Create research packet (README, TASKS, etc.) | Medium | ⬜ |
| BK-IMPL-XX | Implementation tasks TBD | TBD | ⬜ |

---

## 📅 Recommended Implementation Order

### Phase 1: Quick Wins (Days 1-2)
1. **Outlines** - Simplest integration, fastest to implement
2. **Common infrastructure** - Pydantic models, TypeScript types

### Phase 2: Core Comparison (Days 3-5)
3. **Guardrails AI** - Most mature, production-ready
4. **Microsoft Guidance** - Token-level control comparison

### Phase 3: Spec-First & Workflow (Days 6-8)
5. **Spec Kit** - Different paradigm (TypeScript-first)
6. **B-MAD Method** - Workflow evaluation

### Phase 4: Analysis & Additional Tools (Days 9-10)
7. **Beckett** - Once clarified
8. **Benchmark runs and comparison report**
9. **Any additional tools identified**

---

## 🎯 Success Criteria

Each implementation is complete when:
- [ ] Can process all test prompts from `common/test_prompts.json`
- [ ] Produces responses matching `common/expected_schemas.json`
- [ ] Passes validation for happy path scenarios
- [ ] Properly rejects/handles constraint violations
- [ ] Logs metrics for benchmarking
- [ ] Has documentation for setup and usage

---

## 📝 Notes

- All Python implementations should use FastAPI for consistency
- All TypeScript implementations should use Express for consistency
- Each tool's demo should be self-contained with its own dependencies
- Benchmark runner should be able to call each demo's API
