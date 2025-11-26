# Spec-Driven Development Tools - Implementation Tasks

## 📊 Overview

| Tool | Total Tasks | Est. Time | Status |
|------|-------------|-----------|--------|
| **Common Setup** | 3 | 1 hour | ✅ Complete |
| **Spec Kit** | 5 | 3 hours | ✅ Complete |
| **B-MAD Method** | 6 | 3.5 hours | ✅ Complete |

**Total Estimated Time:** ~7.5 hours for minimal viable demos

---

## 🔧 Common Setup Tasks

| ID | Task | Est. Time | Status |
|----|------|-----------|--------|
| COMMON-01 | ✅ Create shared test prompts JSON | 30 min | ✅ Complete |
| COMMON-02 | ✅ Create expected output schema | 30 min | ✅ Complete |
| COMMON-03 | Create shared TypeScript types | 15 min | ⬜ Not Started |

---

## 📦 Spec Kit - Minimal Viable Demo

**Goal:** Demonstrate spec-driven AI guidance with compiled Markdown specs

**Location:** `ai_experiments/spec_kit/demo/`

| ID | Task | Est. Time | Status | Notes |
|----|------|-----------|--------|-------|
| SK-MVP-01 | Initialize Node/TS project | 15 min | ⬜ | `npm init`, tsconfig, install `@github/spec-kit` |
| SK-MVP-02 | Write task-planner.md spec | 1 hour | ⬜ | Define inputs, outputs, constraints, rubrics |
| SK-MVP-03 | Compile spec to JSON guards | 15 min | ⬜ | `speckit build specs/task-planner.md` |
| SK-MVP-04 | Create TypeScript integration | 45 min | ⬜ | Wrap AI call with compiled validators |
| SK-MVP-05 | Test with Cursor/Opus 4.5 | 45 min | ⬜ | Run scenarios, document behavior |

**Total:** ~3 hours

### Spec Kit Demo Structure
```
spec_kit/demo/
├── package.json
├── tsconfig.json
├── specs/
│   └── task-planner.md          # The spec
├── builds/                       # Compiled output
├── src/
│   ├── index.ts                 # CLI entry
│   └── planner.ts               # Spec Kit wrapper
└── test/
    └── planner.test.ts
```

---

## 🔄 B-MAD Method - Minimal Viable Demo

**Goal:** Demonstrate methodology-driven AI development with specialized agents

**Location:** `ai_experiments/bmad/demo/`

| ID | Task | Est. Time | Status | Notes |
|----|------|-----------|--------|-------|
| BM-MVP-01 | Install B-MAD Method | 15 min | ⬜ | `npx bmad-method install` |
| BM-MVP-02 | Initialize project with workflow-init | 15 min | ⬜ | Load agent, run `*workflow-init` |
| BM-MVP-03 | Create PRD with PM agent | 1 hour | ⬜ | Define task planner requirements |
| BM-MVP-04 | Architecture with Architect agent | 30 min | ⬜ | Technical design |
| BM-MVP-05 | Implementation with Developer agent | 1 hour | ⬜ | Generate TypeScript code |
| BM-MVP-06 | Document workflow observations | 30 min | ⬜ | Compare to Spec Kit approach |

**Total:** ~3.5 hours

### B-MAD Demo Structure
```
bmad/demo/
├── package.json
├── .bmad/                       # B-MAD configuration
├── docs/
│   ├── prd.md                   # Product requirements
│   ├── architecture.md          # Technical design
│   └── stories/                 # User stories
├── src/
│   └── task-planner/           # Implementation
└── README.md
```

---

## 📋 Execution Checklist

### Day 1: Spec Kit

- [ ] **SK-MVP-01**: Set up project
  ```bash
  cd ai_experiments/spec_kit/demo
  npm init -y
  npm install @github/spec-kit typescript @types/node
  npx tsc --init
  ```

- [ ] **SK-MVP-02**: Write spec
  - Define task planner inputs (project description)
  - Define outputs (task array with structure)
  - Define constraints (max 10 tasks, required fields)
  - Add rubrics for evaluation

- [ ] **SK-MVP-03**: Compile
  ```bash
  npx speckit build specs/task-planner.md --out builds/
  ```

- [ ] **SK-MVP-04**: Integrate
  - Create planner.ts with Spec Kit wrapper
  - Handle validation and re-prompting

- [ ] **SK-MVP-05**: Test
  - Run with sample inputs
  - Document AI behavior

### Day 1-2: B-MAD Method

- [ ] **BM-MVP-01**: Install
  ```bash
  npx bmad-method install
  # or for v6 alpha: npx bmad-method@alpha install
  ```

- [ ] **BM-MVP-02**: Initialize
  - Load PM agent in Cursor
  - Run `*workflow-init`

- [ ] **BM-MVP-03**: PRD
  - Use PM agent to create requirements
  - Document the experience

- [ ] **BM-MVP-04**: Architecture
  - Switch to Architect agent
  - Generate technical design

- [ ] **BM-MVP-05**: Implementation
  - Switch to Developer agent
  - Generate TypeScript code

- [ ] **BM-MVP-06**: Document
  - Compare workflows
  - Note strengths/weaknesses

---

## 📊 Comparison Report Template

After completing both demos, document:

### Setup Experience
| Aspect | Spec Kit | B-MAD Method |
|--------|----------|--------------|
| Time to first run | | |
| Documentation clarity | | |
| Error messages | | |

### Spec/Methodology Quality
| Aspect | Spec Kit | B-MAD Method |
|--------|----------|--------------|
| Spec authoring effort | | |
| Spec readability | | |
| Maintenance burden | | |

### AI Guidance
| Aspect | Spec Kit | B-MAD Method |
|--------|----------|--------------|
| Follows specs correctly? | | |
| Handles edge cases? | | |
| Consistent outputs? | | |

### Cursor Integration
| Aspect | Spec Kit | B-MAD Method |
|--------|----------|--------------|
| Natural workflow? | | |
| Opus 4.5 compatibility | | |
| IDE integration | | |

### Overall
| Aspect | Spec Kit | B-MAD Method |
|--------|----------|--------------|
| Recommended for | | |
| Not recommended for | | |
| Would use again? | | |

---

## 🎯 Next Steps After Demos

1. **Compare results** - Fill in comparison report
2. **Identify winner** - Which fits our needs better?
3. **Consider combination** - Can we use both?
4. **Plan full implementation** - If demos succeed, expand
