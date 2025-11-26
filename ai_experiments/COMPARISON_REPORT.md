# Spec-Driven Development Tools - Comparison Report

**Date**: November 2024  
**Tools Compared**: Spec Kit, B-MAD Method  
**Stack**: Cursor + Claude Opus 4.5

---

## Executive Summary

Both **Spec Kit** and **B-MAD Method** enable spec-driven development with AI agents like Cursor:

| Aspect | Spec Kit | B-MAD Method |
|--------|----------|--------------|
| **Primary Interface** | Slash commands (`/speckit.*`) | Agent personas + workflows |
| **Best For** | Structured spec → implementation flow | Full development lifecycle with specialized agents |
| **Spec Format** | Constitution + Specifications | PRD + Architecture docs |
| **Workflow** | specify → plan → tasks → implement | PM → Architect → Developer agents |
| **Cursor Support** | ✅ Native | ✅ Native |
| **Installation** | `uv tool install` (Python CLI) | `npm install` (Node.js) |

**Recommendation**: 
- Use **Spec Kit** for its structured slash-command workflow
- Use **B-MAD Method** for specialized agent personas and deeper methodology
- **Both work great with Cursor!**

---

## Spec Kit Overview

**Repository**: https://github.com/github/spec-kit

Spec Kit provides a **structured workflow** through slash commands:

```
/speckit.constitution   → Establish project principles
/speckit.specify        → Describe what you want to build  
/speckit.plan           → Create technical implementation plan
/speckit.tasks          → Break down into actionable tasks
/speckit.implement      → Execute implementation
```

### Key Features
- Works with Cursor, Claude Code, Copilot, and many AI agents
- Multi-step refinement (not one-shot generation)
- Intent-driven: focus on WHAT, not HOW
- Specifications become executable

### Our Demo

The `spec_kit/demo/` folder demonstrates the **validation aspect** of spec-driven development:
- Spec file defines expected outputs
- Validator checks AI responses against spec
- CLI for testing spec-driven prompts

---

## B-MAD Method Overview

**Repository**: https://github.com/bmad-code-org/BMAD-METHOD  
**npm**: `bmad-method`

B-MAD provides **19 specialized AI agents** with distinct expertise:

| Agent | Role |
|-------|------|
| PM Agent | Product requirements, user stories |
| Architect Agent | Technical design, system architecture |
| Developer Agent | Implementation, coding |
| UX Designer Agent | User experience, design |
| QA Agent | Testing, quality assurance |
| + 14 more... | Specialized expertise |

### Key Features
- Scale-adaptive intelligence (bug fixes → enterprise systems)
- Complete development lifecycle
- PRD + Architecture documentation
- Works with Cursor, Claude Code, Windsurf

### Our Demo

The `bmad/demo/` folder shows B-MAD-style documentation:
- PRD document (PM agent output)
- Architecture document (Architect agent output)
- Implementation following both specs

---

## Head-to-Head Comparison

### Workflow Comparison

| Step | Spec Kit | B-MAD Method |
|------|----------|--------------|
| **1. Principles** | `/speckit.constitution` | Project guidelines in PRD |
| **2. Requirements** | `/speckit.specify` | PM Agent creates PRD |
| **3. Technical Design** | `/speckit.plan` | Architect Agent creates design |
| **4. Task Breakdown** | `/speckit.tasks` | Stories/tasks in PRD |
| **5. Implementation** | `/speckit.implement` | Developer Agent implements |

### When to Use Each

| Scenario | Recommendation |
|----------|----------------|
| New project with clear requirements | **Spec Kit** - structured flow |
| Complex project needing multiple perspectives | **B-MAD** - specialized agents |
| Quick feature addition | **Spec Kit** - fast specify → implement |
| Enterprise/compliance needs | **B-MAD** - governance workflows |
| Learning spec-driven development | **Spec Kit** - simpler model |
| Full product development | **B-MAD** - comprehensive lifecycle |

### Using Both Together

These tools are **complementary**:

```
┌─────────────────────────────────────────────────────────────┐
│              B-MAD Method (Lifecycle)                       │
│  ┌─────────┐   ┌─────────────┐   ┌────────────┐            │
│  │   PM    │ → │  Architect  │ → │  Developer │            │
│  │  Agent  │   │    Agent    │   │   Agent    │            │
│  └─────────┘   └─────────────┘   └─────┬──────┘            │
│                                        │                    │
│                        For each feature:                    │
│                                        ▼                    │
│                         ┌──────────────────────┐           │
│                         │      Spec Kit        │           │
│                         │ /speckit.specify     │           │
│                         │ /speckit.plan        │           │
│                         │ /speckit.implement   │           │
│                         └──────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start Commands

### Spec Kit (Real Tool)

```bash
# Install CLI
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Initialize project
specify init my-project

# Then in Cursor, use slash commands:
# /speckit.specify Build a todo app with React
# /speckit.plan Use TypeScript, Vite, minimal dependencies
# /speckit.tasks
# /speckit.implement
```

### B-MAD Method

```bash
# Install
npx bmad-method@alpha install

# Initialize in Cursor
# Load agent, then: *workflow-init

# Choose track:
# - Quick Flow (bug fixes)
# - BMad Method (products)
# - Enterprise (compliance)
```

### Our Demos

```bash
# Spec-driven validation demo
cd /workspace/ai_experiments/spec_kit/demo
npm install
npx tsx src/index.ts prompt "Build a todo app"

# B-MAD-style documentation demo
cd /workspace/ai_experiments/bmad/demo
npm install
npx tsx src/index.ts prompt "Build a todo app"
```

---

## Conclusion

Both tools excel at spec-driven development for Cursor:

| Tool | Strength |
|------|----------|
| **Spec Kit** | Clean slash-command workflow, simple model |
| **B-MAD Method** | Rich agent ecosystem, full lifecycle |

**For most projects**: Start with **Spec Kit** for simplicity, add **B-MAD** for complex projects needing specialized expertise.
