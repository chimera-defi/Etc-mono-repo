# B-MAD Method Demo - Task Planner

A minimal viable demo of **spec-driven development** using the B-MAD methodology.

## 🎯 What This Demo Shows

1. **PRD-Driven Development**: Product requirements define the spec
2. **Architecture Docs**: Technical design guides implementation
3. **Validation Against PRD**: Responses are validated against PRD specs
4. **B-MAD Workflow**: PM → Architect → Developer agent flow

## 🔄 B-MAD Methodology

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PM Agent   │ →   │  Architect  │ →   │  Developer  │
│             │     │    Agent    │     │    Agent    │
│  (PRD)      │     │  (Design)   │     │  (Code)     │
└─────────────┘     └─────────────┘     └─────────────┘
      ↓                   ↓                   ↓
   docs/prd.md      docs/architecture.md    src/
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate a prompt (includes PRD specs)
npx tsx src/index.ts prompt "Build a todo list web app with React"

# Or generate a prompt with the FULL PRD document
npx tsx src/index.ts prd-prompt "Build a todo list web app with React"

# Copy the prompt to Cursor/Opus 4.5, get response, save as response.json

# Validate against PRD specs
npx tsx src/index.ts validate response.json
```

## 📁 Project Structure

```
demo/
├── docs/                        # B-MAD specification documents
│   ├── prd.md                  # Product Requirements (PM Agent)
│   └── architecture.md         # Technical Design (Architect Agent)
├── src/                        # Implementation (Developer Agent)
│   ├── index.ts               # CLI entry point
│   ├── prompts.ts             # PRD-aware prompt templates
│   ├── validator.ts           # PRD-based validation
│   └── types.ts               # TypeScript types from PRD
├── .bmad/                      # B-MAD project config (placeholder)
└── package.json
```

## 📋 Commands

### Generate Basic Prompt
```bash
npx tsx src/index.ts prompt "Your project description"
```
Generates a prompt with embedded spec constraints.

### Generate PRD-Aware Prompt
```bash
npx tsx src/index.ts prd-prompt "Your project description"
```
Generates a prompt that includes the **full PRD document** for complete context.

### Validate Response
```bash
npx tsx src/index.ts validate response.json
```
Validates against PRD section 4.3 (Validation Rules).

### View Specification Docs
```bash
npx tsx src/index.ts docs
```
Displays the PRD and Architecture documents.

## 📖 B-MAD Documents

### PRD (`docs/prd.md`)
Created by the **PM Agent**, defines:
- Product vision and goals
- User stories and acceptance criteria
- Input/Output specifications
- Validation rules
- Success metrics

### Architecture (`docs/architecture.md`)
Created by the **Architect Agent**, defines:
- System architecture diagram
- Component design
- Data flow
- Error handling strategy
- Testing approach

## 🔄 B-MAD Workflow Comparison

| Aspect | Spec Kit | B-MAD Method |
|--------|----------|--------------|
| **Spec Format** | Single Markdown file | PRD + Architecture docs |
| **Scope** | Output validation | Full development lifecycle |
| **Agents** | N/A | PM, Architect, Developer |
| **Customization** | Spec language | Custom agents/workflows |

## 🤝 Integration with Cursor/Opus 4.5

1. **Basic flow**: `npx tsx src/index.ts prompt "project"` → Cursor → validate
2. **PRD flow**: `npx tsx src/index.ts prd-prompt "project"` → Cursor → validate
3. **Full B-MAD flow**: 
   - Use PM agent to refine PRD
   - Use Architect agent to update design
   - Use Developer agent to implement

## 📊 PRD Compliance

Validation checks these PRD requirements:
- ✅ Task count: 1-10 tasks
- ✅ Required fields: id, title, description, priority, estimated_hours
- ✅ ID format: TASK-N pattern
- ✅ Priority values: high, medium, low
- ✅ Hour range: 0.5-40
- ✅ No duplicate IDs

## 🎓 B-MAD Learning

To fully use B-MAD in your projects:
1. Install: `npx bmad-method install`
2. Initialize: Load agent, run `*workflow-init`
3. Follow the guided workflow

This demo shows the **output** of following B-MAD methodology.
