# Spec-Driven Development Tools - Implementation Framework

This document defines our approach to comparing **Spec Kit** and **B-MAD Method** through practical TypeScript implementations.

## 🎯 Comparison Philosophy

We'll build **minimal viable demos** with each tool to compare:
1. **Ease of Setup** - Time to get started
2. **Spec Authoring** - How specs are written and maintained
3. **AI Guidance Effectiveness** - How well it guides AI behavior
4. **Developer Experience** - Ergonomics, debugging, iteration
5. **Cursor Integration** - How it works with Cursor + Opus 4.5

---

## 🛠️ Technical Stack

| Aspect | Choice |
|--------|--------|
| **Language** | TypeScript |
| **Runtime** | Node.js 20+ |
| **AI Provider** | Cursor + Claude Opus 4.5 |
| **Demo Type** | Minimal Viable Demo |
| **Package Manager** | npm |

---

## 🏗️ Demo Application: "Task Planner"

A simple AI-guided task planning assistant that:
1. Accepts a project description
2. Returns structured task breakdown (JSON)
3. Follows defined constraints (max tasks, required fields)
4. Validates output structure

### Why This Demo?
- **Simple enough** for minimal viable implementation
- **Structured output** to test spec enforcement
- **Clear constraints** to verify guidance works
- **Relevant** to actual development workflows

---

## 📦 Tool Implementations

### 1. Spec Kit Implementation

**Location:** `ai_experiments/spec_kit/demo/`

```
spec_kit/demo/
├── package.json
├── tsconfig.json
├── specs/
│   └── task-planner.md          # Human-readable spec
├── builds/                       # Compiled artifacts
├── src/
│   ├── index.ts                 # Entry point
│   └── planner.ts               # Spec Kit integration
└── test/
    └── planner.test.ts
```

**Minimal Viable Tasks:**

| ID | Task | Est. Time |
|----|------|-----------|
| SK-MVP-01 | Set up Node/TS project with Spec Kit | 30 min |
| SK-MVP-02 | Write task-planner.md spec | 1 hour |
| SK-MVP-03 | Compile spec and integrate | 30 min |
| SK-MVP-04 | Create simple CLI to test | 30 min |
| SK-MVP-05 | Verify with Cursor/Opus 4.5 | 30 min |

**Total Estimated:** ~3 hours

---

### 2. B-MAD Method Implementation

**Location:** `ai_experiments/bmad/demo/`

```
bmad/demo/
├── package.json
├── .bmad/                       # B-MAD config
├── docs/
│   └── task-planner-prd.md     # Product requirements
├── src/
│   └── task-planner/           # Generated structure
└── workflows/
    └── planning.md             # Custom workflow
```

**Minimal Viable Tasks:**

| ID | Task | Est. Time |
|----|------|-----------|
| BM-MVP-01 | Install B-MAD and initialize project | 30 min |
| BM-MVP-02 | Create task planner PRD with PM agent | 1 hour |
| BM-MVP-03 | Generate architecture with Architect agent | 30 min |
| BM-MVP-04 | Implement with Developer agent | 1 hour |
| BM-MVP-05 | Document observations and compare | 30 min |

**Total Estimated:** ~3.5 hours

---

## 📊 Comparison Criteria

### Quantitative Metrics

| Metric | How We Measure |
|--------|----------------|
| **Setup Time** | Time from zero to first working call |
| **Spec Authoring Time** | Time to write the specification |
| **Lines of Config** | Amount of boilerplate needed |
| **Iteration Speed** | Time to modify spec and see changes |

### Qualitative Metrics

| Metric | What We Evaluate |
|--------|------------------|
| **Spec Readability** | How clear are the specs to humans? |
| **AI Guidance Quality** | Does the AI follow the spec correctly? |
| **Error Messages** | How helpful when things go wrong? |
| **Cursor Integration** | How natural is the workflow? |
| **Documentation** | How easy to learn from docs? |

---

## 🧪 Test Scenarios

Both implementations must handle:

### Happy Path
1. **Valid project input** → Structured task breakdown
2. **Simple description** → Appropriate number of tasks

### Constraint Enforcement
3. **Request too many tasks** → Enforce max limit
4. **Missing required fields** → Proper error/guidance
5. **Invalid format request** → Return correct structure

### Edge Cases
6. **Vague input** → Ask for clarification or make reasonable assumptions
7. **Very long input** → Handle gracefully

---

## 📁 Project Structure

```
ai_experiments/
├── README.md
├── COMPARISON.md
├── COMPARISON_CRITERIA.md
├── IMPLEMENTATION_FRAMEWORK.md      # This file
├── IMPLEMENTATION_TASKS.md
├── common/
│   ├── test_prompts.json           # Shared test inputs
│   └── expected_schema.json        # Expected output schema
├── spec_kit/
│   ├── README.md
│   ├── TASKS.md
│   └── demo/                       # TypeScript implementation
└── bmad/
    ├── README.md
    ├── TASKS.md
    └── demo/                       # TypeScript implementation
```

---

## ⏱️ Implementation Status

### Phase 1: Spec Kit MVP ✅ Complete
- [x] Framework documentation
- [x] Set up demo project (TypeScript validation demo)
- [x] Write spec (`specs/task-planner.md`)
- [x] Test validation with Cursor/Opus

### Phase 2: B-MAD MVP ✅ Complete
- [x] Create PRD and architecture docs
- [x] Generate implementation
- [x] Test workflow

### Phase 3: Comparison ✅ Complete
- [x] Document findings for each tool
- [x] Create comparison report
- [x] Identify recommendations

---

## 🎯 What Was Delivered

- [x] Working TypeScript demos for both approaches
- [x] Comparison report (`COMPARISON_REPORT.md`)
- [x] Example specs and PRDs
- [x] Validation tools that work with Cursor

---

## 📝 Next Steps

1. **Human review** of comparison report
2. **Try real Spec Kit** with `/speckit.*` commands in Cursor
3. **Try B-MAD** with `npx bmad-method@alpha install`
4. **Choose approach** based on project needs
