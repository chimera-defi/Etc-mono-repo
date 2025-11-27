# AI Experiments - Handoff for Next Agent

**Last Updated**: November 2024  
**Status**: ✅ Comparison Framework Complete

---

## 🎯 Quick Context

This folder compares **spec-driven development tools** for use with Cursor + Claude:

| Tool | What It Is | Status |
|------|------------|--------|
| **Spec Kit** | GitHub's slash-command workflow (`/speckit.*`) | ✅ Documented, demo built |
| **B-MAD Method** | npm package with 19 specialized agents | ✅ Documented, demo built |

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `README.md` | Overview and quick start |
| `COMPARISON.md` | Head-to-head comparison |
| `COMPARISON_REPORT.md` | Detailed findings and recommendations |
| `COMPARISON_CRITERIA.md` | Evaluation criteria |
| `spec_kit/demo/` | TypeScript validation demo |
| `bmad/demo/` | B-MAD-style documentation demo |

---

## 🚀 Quick Start Commands

```bash
# Spec Kit demo (validation)
cd /workspace/ai_experiments/spec_kit/demo
npm install
npx tsx src/index.ts help

# B-MAD demo (PRD-based validation)
cd /workspace/ai_experiments/bmad/demo
npm install
npx tsx src/index.ts help
```

---

## ⚠️ Important Notes

1. **Spec Kit** uses `/speckit.*` slash commands in Cursor - the demos show the validation aspect only
2. **B-MAD Method** is a real npm package (`bmad-method`) - install with `npx bmad-method@alpha install`
3. **Archived tools** (Guardrails, Guidance, Outlines) are in separate folders - kept for reference but not spec-driven

---

## 📋 What's Done

- [x] Comparison framework documentation
- [x] Both tools researched and documented
- [x] TypeScript demos for validation concepts
- [x] Comparison report with recommendations
- [x] Meta learnings added to `.cursorrules`

---

## 🔜 Next Steps for Human

1. **Review** `COMPARISON_REPORT.md` for recommendations
2. **Try Spec Kit** in Cursor: `/speckit.specify`, `/speckit.plan`, etc.
3. **Try B-MAD**: `npx bmad-method@alpha install` then `*workflow-init`
4. **Decide** which approach fits your project needs

---

## 🔜 Next Steps for Agent

If continuing this work:

1. **Install real tools** - Set up actual Spec Kit and B-MAD in a test project
2. **Test slash commands** - Verify `/speckit.*` commands work in Cursor
3. **Compare outputs** - Run same project through both workflows
4. **Document findings** - Update comparison with real-world results

---

## 💡 Lessons Learned

See `.cursorrules` for full meta learnings. Key points:

- **Verify before building**: Check npm packages exist before referencing them
- **Slash commands vs CLI**: Some tools (Spec Kit) are primarily AI agent integrations
- **Don't propagate errors**: Pre-existing docs may have hallucinations
- **Both tools work with Cursor**: Spec Kit and B-MAD are complementary, not competing
