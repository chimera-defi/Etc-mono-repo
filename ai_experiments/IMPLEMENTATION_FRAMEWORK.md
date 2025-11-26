# AI Guiding Tools - Implementation Framework

This document defines a unified approach to comparing AI constraint/guiding tools through practical implementation.

## 🎯 Comparison Philosophy

To fairly compare these tools, we'll build **the same application** with each one, measuring:
1. **Implementation Effort** - Time and complexity to build
2. **Constraint Effectiveness** - How well it enforces rules
3. **Performance** - Latency, token usage, reliability
4. **Developer Experience** - Ergonomics, debugging, maintenance
5. **Production Readiness** - Scalability, observability, security

---

## 🏗️ Unified Demo Application: "Smart Assistant API"

We'll build a **travel planning assistant** that must:
1. Accept natural language queries about trip planning
2. Return structured JSON responses (dates, destinations, budgets)
3. Enforce content policies (no illegal activities, PII handling)
4. Validate business rules (budget limits, date constraints)
5. Handle multi-turn conversations with context

### Why This Demo?
- **Structured outputs**: Tests JSON schema enforcement
- **Safety constraints**: Tests content filtering
- **Business rules**: Tests custom validation logic
- **Real-world relevance**: Representative of production use cases

---

## 📊 Tool Categories

### Category A: Runtime Validation (Post-Generation)
| Tool | Focus | Primary Use |
|------|-------|-------------|
| **Spec Kit** | Spec-first workflow | Auditable policy compliance |
| **Guardrails AI** | Safety + structure | Customer-facing compliance |

### Category B: Generation-Time Constraints (Token-Level)
| Tool | Focus | Primary Use |
|------|-------|-------------|
| **Microsoft Guidance** | Template orchestration | Multi-step workflows |
| **Outlines** | Grammar-constrained decoding | Guaranteed valid structures |

### Category C: Development Workflow (Process-Level)
| Tool | Focus | Primary Use |
|------|-------|-------------|
| **B-MAD Method** | AI-driven methodology | Full development lifecycle |

### Category D: To Be Researched
| Tool | Status | Notes |
|------|--------|-------|
| **Beckett** | ❓ Unknown | Needs clarification - not found in documentation |
| **Others?** | ❓ | Additional tools to compare? |

---

## 🛠️ Implementation Plan Per Tool

### 1. Spec Kit Implementation
**Location:** `ai_experiments/spec_kit/demo/`

```
spec_kit/demo/
├── specs/
│   └── travel-assistant.md      # Human-readable spec
├── builds/
│   └── travel-assistant.json    # Compiled guards
├── src/
│   ├── server.ts                # Express endpoint
│   └── validator.ts             # Spec Kit integration
├── tests/
│   └── compliance.test.ts       # Spec compliance tests
└── package.json
```

**Tasks:**
| ID | Task | Priority | Estimated Effort |
|----|------|----------|------------------|
| SK-IMPL-01 | Create travel assistant spec in Markdown | High | 2 hours |
| SK-IMPL-02 | Compile spec to JSON guards | High | 30 min |
| SK-IMPL-03 | Build Express server with validation | High | 2 hours |
| SK-IMPL-04 | Implement retry logic on validation failure | Medium | 1 hour |
| SK-IMPL-05 | Add telemetry/logging | Medium | 1 hour |
| SK-IMPL-06 | Write compliance test suite | Medium | 2 hours |
| SK-IMPL-07 | Benchmark latency and token usage | Low | 1 hour |

---

### 2. Guardrails AI Implementation
**Location:** `ai_experiments/guardrails_ai/demo/`

```
guardrails_ai/demo/
├── rails/
│   └── travel_assistant.rail    # RAIL spec file
├── validators/
│   ├── budget_validator.py      # Custom budget rules
│   └── date_validator.py        # Date constraint validator
├── src/
│   ├── main.py                  # FastAPI endpoint
│   └── guard.py                 # Guardrails wrapper
├── tests/
│   └── test_compliance.py       # Pytest compliance tests
└── requirements.txt
```

**Tasks:**
| ID | Task | Priority | Estimated Effort |
|----|------|----------|------------------|
| GR-IMPL-01 | Create travel assistant RAIL spec | High | 2 hours |
| GR-IMPL-02 | Implement custom budget validator | High | 1 hour |
| GR-IMPL-03 | Implement date constraint validator | High | 1 hour |
| GR-IMPL-04 | Build FastAPI server with Guard wrapper | High | 2 hours |
| GR-IMPL-05 | Configure re-ask strategies | Medium | 1 hour |
| GR-IMPL-06 | Add structured logging/telemetry | Medium | 1 hour |
| GR-IMPL-07 | Write pytest compliance suite | Medium | 2 hours |
| GR-IMPL-08 | Benchmark latency with 1/2/3 re-asks | Low | 1 hour |

---

### 3. Microsoft Guidance Implementation
**Location:** `ai_experiments/microsoft_guidance/demo/`

```
microsoft_guidance/demo/
├── templates/
│   └── travel_assistant.py      # Guidance template
├── schemas/
│   └── trip_response.json       # JSON Schema
├── src/
│   ├── main.py                  # FastAPI endpoint
│   └── orchestrator.py          # Guidance program runner
├── tests/
│   └── test_templates.py        # Template tests
└── requirements.txt
```

**Tasks:**
| ID | Task | Priority | Estimated Effort |
|----|------|----------|------------------|
| MG-IMPL-01 | Create Guidance template with JSON schema constraints | High | 2 hours |
| MG-IMPL-02 | Implement multi-step workflow (understand → plan → respond) | High | 2 hours |
| MG-IMPL-03 | Add regex constraints for dates/budgets | Medium | 1 hour |
| MG-IMPL-04 | Build FastAPI server with template execution | High | 1 hour |
| MG-IMPL-05 | Implement streaming token hooks | Medium | 1 hour |
| MG-IMPL-06 | Write template test suite | Medium | 1 hour |
| MG-IMPL-07 | Benchmark token-level enforcement overhead | Low | 1 hour |

---

### 4. Outlines Implementation
**Location:** `ai_experiments/outlines/demo/`

```
outlines/demo/
├── schemas/
│   ├── trip_response.py         # Pydantic models
│   └── trip_response.json       # JSON Schema
├── src/
│   ├── main.py                  # FastAPI endpoint
│   └── generator.py             # Outlines generator
├── tests/
│   └── test_generation.py       # Generation tests
└── requirements.txt
```

**Tasks:**
| ID | Task | Priority | Estimated Effort |
|----|------|----------|------------------|
| OL-IMPL-01 | Define Pydantic models for trip response | High | 1 hour |
| OL-IMPL-02 | Create grammar-constrained generator | High | 1 hour |
| OL-IMPL-03 | Build FastAPI endpoint | High | 1 hour |
| OL-IMPL-04 | Add complex nested schema support | Medium | 1 hour |
| OL-IMPL-05 | Test with different sampling strategies | Medium | 1 hour |
| OL-IMPL-06 | Combine with post-hoc semantic validation | Medium | 2 hours |
| OL-IMPL-07 | Benchmark decoding speed with/without constraints | Low | 1 hour |

---

### 5. B-MAD Method Evaluation
**Location:** `ai_experiments/bmad/demo/`

```
bmad/demo/
├── .bmad/                       # B-MAD project config
├── docs/
│   ├── prd.md                   # Product requirements
│   ├── architecture.md          # Architecture doc
│   └── stories/                 # User stories
├── src/
│   └── travel_assistant/        # Generated app structure
├── workflows/
│   └── custom_validator.md      # Custom workflow for constraints
└── README.md
```

**Tasks:**
| ID | Task | Priority | Estimated Effort |
|----|------|----------|------------------|
| BM-IMPL-01 | Initialize B-MAD project with workflow-init | High | 30 min |
| BM-IMPL-02 | Use PM agent to create travel assistant PRD | High | 1 hour |
| BM-IMPL-03 | Use Architect agent for technical design | High | 1 hour |
| BM-IMPL-04 | Use Developer agent for implementation | High | 2 hours |
| BM-IMPL-05 | Create custom workflow for constraint validation | Medium | 2 hours |
| BM-IMPL-06 | Test B-MAD Builder for domain-specific agents | Medium | 2 hours |
| BM-IMPL-07 | Compare B-MAD output with manually built implementations | Low | 1 hour |

---

## 📈 Benchmark Criteria

### Quantitative Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| **Latency (p50/p95/p99)** | Time from request to validated response | <500ms p95 |
| **Token Usage** | Tokens consumed per successful request | Minimize |
| **Validation Rate** | % of responses passing validation first try | >90% |
| **Retry Rate** | Average retries needed per request | <0.5 |
| **Error Rate** | % of requests that fail even after retries | <1% |

### Qualitative Metrics
| Metric | Description | Score 1-5 |
|--------|-------------|-----------|
| **Code Clarity** | How readable is the constraint code? | - |
| **Debugging Experience** | How easy to diagnose failures? | - |
| **Documentation Quality** | How helpful are the docs? | - |
| **Flexibility** | How easy to modify constraints? | - |
| **Testing Support** | How easy to test constraints? | - |

---

## 🧪 Test Scenarios

Each implementation must handle these test cases:

### Happy Path
1. Valid trip request → Structured JSON response
2. Multi-turn conversation → Context preserved

### Constraint Enforcement
3. Budget exceeds limit → Validation triggers, corrective action
4. Invalid date range → Schema validation fails
5. Missing required field → Re-prompt or error

### Safety Filters
6. Request for illegal activity → Blocked
7. PII in response → Filtered or redacted
8. Prompt injection attempt → Defended

### Edge Cases
9. Ambiguous query → Clarification requested
10. Very long context → Graceful handling
11. Rate limiting → Proper error response

---

## 📁 Project Structure

```
ai_experiments/
├── IMPLEMENTATION_FRAMEWORK.md    # This document
├── COMPARISON.md                  # Benefits/downsides comparison
├── COMPARISON_CRITERIA.md         # Evaluation criteria
├── README.md                      # Overview
├── benchmarks/                    # Cross-tool benchmark scripts
│   ├── run_benchmarks.py
│   └── results/
├── common/                        # Shared test data
│   ├── test_prompts.json
│   └── expected_schemas.json
├── spec_kit/
│   ├── demo/                     # Implementation
│   └── *.md                      # Documentation
├── guardrails_ai/
│   ├── demo/                     # Implementation
│   └── *.md
├── microsoft_guidance/
│   ├── demo/                     # Implementation
│   └── *.md
├── outlines/
│   ├── demo/                     # Implementation
│   └── *.md
└── bmad/
    ├── demo/                     # Implementation
    └── *.md
```

---

## ⏱️ Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Set up common test data and schemas
- [ ] Create benchmark infrastructure
- [ ] Implement Outlines demo (simplest integration)
- [ ] Implement Guardrails demo (most mature)

### Phase 2: Advanced (Week 2)
- [ ] Implement Guidance demo (token-level control)
- [ ] Implement Spec Kit demo (spec-first approach)
- [ ] Begin B-MAD evaluation

### Phase 3: Comparison (Week 3)
- [ ] Run full benchmark suite
- [ ] Document findings
- [ ] Create recommendation matrix
- [ ] Final comparison report

---

## ❓ Open Questions (Need Clarification)

1. **What is "Beckett"?** 
   - Not found in current documentation
   - Is this another AI guiding tool to evaluate?
   - Please provide repository/documentation link

2. **Are there other tools to compare?**
   - LangChain output parsers?
   - Instructor (structured outputs for OpenAI)?
   - DSPy assertions?
   - LMQL (query language)?

3. **Language/Stack Preference**
   - Python-first (Guardrails, Guidance, Outlines)?
   - TypeScript-first (Spec Kit)?
   - Or build both for each tool where possible?

4. **LLM Provider**
   - Which provider to use for benchmarks? (OpenAI, Anthropic, Azure?)
   - Use same provider across all tools for fair comparison?
   - Or test provider flexibility as a criterion?

5. **Priority Order**
   - Which tools should we implement first?
   - Any specific tool more important for your use case?

6. **Deployment Target**
   - Server-side only?
   - Edge/serverless considerations?
   - On-device constraints relevant?

---

## 🔄 Next Steps

Once clarifications are received:
1. Create common test data and schemas
2. Set up benchmark infrastructure
3. Implement demos in priority order
4. Run comparisons and document findings
