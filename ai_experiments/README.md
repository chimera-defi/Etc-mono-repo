# AI Spec-Driven Development Tools

Comparison of tools that use **specifications to guide AI behavior** in development.

## 🚀 Quick Start

```bash
# Spec Kit demo (validation)
cd spec_kit/demo && npm install
npx tsx src/index.ts prompt "Build a todo app"

# B-MAD demo (PRD-based)
cd bmad/demo && npm install
npx tsx src/index.ts prompt "Build a todo app"
```

## ✅ Tools Compared

| Tool | Interface | Installation | Best For |
|------|-----------|--------------|----------|
| **[Spec Kit](https://github.com/github/spec-kit)** | `/speckit.*` slash commands | `uv tool install specify-cli` | Structured spec → implementation |
| **[B-MAD Method](https://github.com/bmad-code-org/BMAD-METHOD)** | `*workflow-init` + agents | `npx bmad-method@alpha install` | Full lifecycle with specialized agents |

Both work natively with **Cursor**!

## 📂 Key Files

| File | Description |
|------|-------------|
| [COMPARISON_REPORT.md](./COMPARISON_REPORT.md) | **Start here** - findings and recommendations |
| [COMPARISON.md](./COMPARISON.md) | Head-to-head comparison |
| [HANDOFF.md](./HANDOFF.md) | Quick context for next agent |
| `spec_kit/demo/` | TypeScript validation demo |
| `bmad/demo/` | PRD/Architecture demo |

## 📋 Status

| Item | Status |
|------|--------|
| Research | ✅ Complete |
| Documentation | ✅ Complete |
| TypeScript demos | ✅ Working |
| Comparison report | ✅ Complete |

## 🔜 Next Steps

1. **Read** [COMPARISON_REPORT.md](./COMPARISON_REPORT.md)
2. **Try Spec Kit**: Use `/speckit.specify` in Cursor
3. **Try B-MAD**: Run `npx bmad-method@alpha install`
4. **Choose** based on your project needs

## 📁 Archived Tools

The `guardrails_ai/`, `microsoft_guidance/`, and `outlines/` folders contain documentation for tools that were evaluated but **removed** - they focus on runtime validation rather than spec-driven development. Kept for reference.
