# Spec Kit (github/spec-kit)

GitHub's open-source toolkit for **Spec-Driven Development** - a methodology where specifications become executable, directly generating working implementations.

## 🎯 What is Spec Kit?

Spec Kit is a **development methodology** that works with AI agents (including **Cursor**, Claude Code, Copilot, and more). It provides:

1. **Slash commands** for AI agents (`/speckit.specify`, `/speckit.plan`, etc.)
2. **A CLI tool** (`specify`) for project initialization
3. **A structured workflow** from specification to implementation

### Core Philosophy

- **Intent-driven development**: Specifications define the "what" before the "how"
- **Multi-step refinement**: Not one-shot code generation, but structured phases
- **AI agent integration**: Works with Cursor, Claude Code, Copilot, and many others

## 🚀 Quick Start

### 1. Install the CLI

```bash
# Persistent installation (recommended)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Or one-time usage
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>
```

### 2. Initialize Project

```bash
specify init my-project
```

### 3. Use Slash Commands in Cursor

Launch Cursor in your project directory and use the commands:

```
/speckit.constitution   # Create project principles
/speckit.specify        # Describe what you want to build
/speckit.plan           # Create technical implementation plan
/speckit.tasks          # Break down into actionable tasks
/speckit.implement      # Execute implementation
```

## 📋 Workflow Overview

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `/speckit.constitution` | Establish project principles and guidelines |
| 2 | `/speckit.specify` | Describe WHAT you want (not HOW) |
| 3 | `/speckit.plan` | Define tech stack and architecture |
| 4 | `/speckit.tasks` | Create actionable task list |
| 5 | `/speckit.implement` | Build according to the plan |

## 🤖 Supported AI Agents

| Agent | Support |
|-------|---------|
| **Cursor** | ✅ |
| Claude Code | ✅ |
| GitHub Copilot | ✅ |
| Windsurf | ✅ |
| Gemini CLI | ✅ |
| And more... | ✅ |

## 📂 Our Demo

The `demo/` folder contains a **TypeScript implementation** demonstrating spec-driven concepts:

- `specs/task-planner.md` - A specification document
- `src/validator.ts` - Validation against spec constraints
- `src/index.ts` - CLI for testing spec-driven prompts

This demo shows the **validation** aspect of spec-driven development - ensuring AI outputs conform to specifications.

### Using the Demo

```bash
cd demo
npm install

# Generate a spec-driven prompt
npx tsx src/index.ts prompt "Build a todo app"

# Validate an AI response
npx tsx src/index.ts validate response.json

# View the specification
npx tsx src/index.ts spec
```

## 🔗 Key Links

- **Repository**: https://github.com/github/spec-kit
- **Documentation**: https://github.github.io/spec-kit/
- **Video Overview**: https://www.youtube.com/watch?v=a9eR1xsfvHg

## 💡 When to Use

| Scenario | Use Spec Kit |
|----------|--------------|
| New project ("greenfield") | ✅ Full workflow |
| Adding features | ✅ `/speckit.specify` → `/speckit.implement` |
| Validating AI outputs | ✅ Spec-based validation |
| Enterprise/compliance | ✅ Constitution + structured specs |

## 📚 Development Phases

| Phase | Focus |
|-------|-------|
| **0-to-1 (Greenfield)** | Generate from scratch with full spec workflow |
| **Creative Exploration** | Parallel implementations, different stacks |
| **Iterative Enhancement** | Add features, modernize legacy systems |
