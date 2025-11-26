# Spec-Driven Development Tools Comparison

## Overview

Both tools enable **spec-driven development** with AI agents like Cursor:

| Aspect | Spec Kit | B-MAD Method |
|--------|----------|--------------|
| **Core Philosophy** | Slash-command workflow | Agent-based methodology |
| **Spec Format** | Constitution + Specifications | PRD + Architecture docs |
| **Enforcement** | Structured workflow phases | Specialized agent guidance |
| **Scope** | Spec → Implementation flow | Full development lifecycle |

---

## Benefits and Downsides

### Spec Kit

| Benefits | Downsides |
|----------|-----------|
| ✅ Simple slash-command interface | ⚠️ Python CLI for setup |
| ✅ Clear workflow phases | ⚠️ Newer project (less documentation) |
| ✅ Works with many AI agents (Cursor, Copilot, etc.) | ⚠️ Less customizable than B-MAD |
| ✅ Intent-driven: focus on WHAT not HOW | |
| ✅ Multi-step refinement | |
| ✅ From GitHub (trusted source) | |

### B-MAD Method

| Benefits | Downsides |
|----------|-----------|
| ✅ 19 specialized agents with domain expertise | ⚠️ Steeper learning curve |
| ✅ 50+ guided workflows | ⚠️ v6 is alpha (v4 is stable) |
| ✅ Scale-adaptive (bug fixes → enterprise) | ⚠️ More setup overhead |
| ✅ npm package (TypeScript/JavaScript) | |
| ✅ Visual workflows (v6) | |
| ✅ Document sharding (90% token savings) | |
| ✅ B-MAD Builder for custom agents | |

---

## Workflow Comparison

### Spec Kit Workflow

```
/speckit.constitution  → Project principles
        ↓
/speckit.specify       → What you want to build
        ↓
/speckit.plan          → Technical implementation plan
        ↓
/speckit.tasks         → Actionable task list
        ↓
/speckit.implement     → Execute implementation
```

### B-MAD Workflow

```
*workflow-init         → Analyze project, choose track
        ↓
PM Agent               → PRD, user stories
        ↓
Architect Agent        → Technical design
        ↓
Developer Agent        → Implementation
        ↓
QA Agent               → Testing
```

---

## Head-to-Head Comparison

| Criteria | Spec Kit | B-MAD Method |
|----------|----------|--------------|
| **Ease of Start** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cursor Integration** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Customization** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Specialized Agents** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Enterprise Features** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Learning Curve** | ⭐⭐⭐⭐⭐ (easy) | ⭐⭐⭐ (moderate) |

---

## When to Use Each

### Use Spec Kit When:
- You want a **simple, structured workflow**
- Starting a **new project** with clear requirements
- You prefer **slash commands** over methodology adoption
- Quick **spec → implementation** cycle is important
- You're new to spec-driven development

### Use B-MAD Method When:
- Building a **complex product** or platform
- You want **specialized AI agents** for different roles
- Project needs **scale-adaptive planning**
- Working on **enterprise** systems with compliance needs
- You want to **customize agents** for your domain

### Use Both Together When:
- **B-MAD** for overall lifecycle (PM, Architect, Developer agents)
- **Spec Kit** for specific feature implementation phases
- This gives you both **methodology depth** and **structured implementation**

---

## Decision Matrix

| Your Situation | Recommendation |
|----------------|----------------|
| Quick prototype | **Spec Kit** |
| Single feature | **Spec Kit** |
| Full product | **B-MAD Method** |
| Enterprise system | **B-MAD Method** (or both) |
| Learning spec-driven | **Spec Kit** (simpler) |
| Custom AI agents needed | **B-MAD Method** |
| Compliance/governance | **B-MAD Method** |

---

## Quick Start

### Spec Kit

```bash
# Install CLI
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Initialize
specify init my-project

# Use in Cursor:
/speckit.specify Build a todo app
/speckit.plan Use React, TypeScript
/speckit.tasks
/speckit.implement
```

### B-MAD Method

```bash
# Install
npx bmad-method@alpha install

# Initialize in Cursor:
*workflow-init

# Follow the guided workflow
```

---

## Links

### Spec Kit
- **Repo**: https://github.com/github/spec-kit
- **Docs**: https://github.github.io/spec-kit/

### B-MAD Method
- **Repo**: https://github.com/bmad-code-org/BMAD-METHOD
- **npm**: `bmad-method`
- **Discord**: https://discord.gg/gk8jAdXWmj
