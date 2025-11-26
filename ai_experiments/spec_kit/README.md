# Spec Kit (github/spec-kit)

> ⚠️ **IMPORTANT CLARIFICATION**: The demo in this folder (`demo/`) is a **custom TypeScript implementation** that demonstrates the *concept* of spec-driven development. It is NOT a wrapper around the actual GitHub Spec Kit, which is Python-based. See the "Demo vs Real Spec Kit" section below.

## Overview

Spec Kit is GitHub's experimental toolkit for Spec-Driven Development. It allows you to focus on product scenarios and predictable outcomes using specifications that guide AI behavior.

**Key concept**: Specifications become executable, directly guiding AI implementations rather than just documenting them.

## Real Spec Kit (Python)

The actual GitHub Spec Kit is **Python-based**:

```bash
# Install the real Spec Kit CLI
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Use the CLI
specify init <PROJECT_NAME>
specify check
```

### Key Links (Real Spec Kit)
- **Repo**: https://github.com/github/spec-kit
- **Docs**: https://github.github.io/spec-kit/
- **Language**: Python (uses `uv` package manager)
- **CLI**: `specify` (not `speckit`)

## Demo vs Real Spec Kit

| Aspect | Real Spec Kit | Our Demo |
|--------|---------------|----------|
| **Language** | Python | TypeScript |
| **Installation** | `uv tool install specify-cli` | `npm install` |
| **Purpose** | Full spec-driven development toolkit | Conceptual demonstration |
| **CLI** | `specify` | `npx tsx src/index.ts` |
| **Status** | Official GitHub project | Custom implementation |

### Why the TypeScript Demo?

We created a TypeScript demo because:
1. **TypeScript preference**: User requested TypeScript for all implementations
2. **Cursor integration**: Designed for Cursor + Opus 4.5 workflow
3. **Conceptual value**: Demonstrates spec-driven principles regardless of implementation

The demo shows **how spec-driven development works** conceptually:
- Write specs in Markdown
- Use specs to guide AI prompts
- Validate AI outputs against spec constraints

## What Spec-Driven Development Offers

- **Spec-first workflow**: Human intent as source of truth
- **Validation**: Responses checked against spec constraints
- **Traceability**: Every output tied to a spec version
- **Tool-agnostic**: Concepts work with any LLM provider

## Using the Demo

```bash
cd demo
npm install
npx tsx src/index.ts help
```

See `demo/README.md` for detailed usage.

## Recommendations

1. **For Python projects**: Use the real GitHub Spec Kit
2. **For TypeScript projects**: Our demo provides a starting point for spec-driven concepts
3. **Consider both**: Real Spec Kit for full features, our demo for TypeScript integration
