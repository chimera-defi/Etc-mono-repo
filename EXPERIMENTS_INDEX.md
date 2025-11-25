# Experiments Repository - Master Index

**Quick Navigation Guide for Follow-Up Agents**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [AI Experiments](#ai-experiments)
3. [Mobile Experiments](#mobile-experiments)
4. [Quick Start Guides](#quick-start-guides)
5. [Status Dashboard](#status-dashboard)

---

## Project Overview

**Repository Purpose**: Evaluate AI constraint tools and mobile frameworks for future use.

**Current Phase**: Documentation complete, implementation pending

**Key Documents**:
- [`PROJECT_REVIEW.md`](./PROJECT_REVIEW.md) - **START HERE** - Comprehensive review and assessment
- [`README.md`](./README.md) - Repository overview
- [`.cursorrules`](./.cursorrules) - Workspace rules and guidelines

---

## AI Experiments

**Location**: [`ai_experiments/`](./ai_experiments/)

**Purpose**: Evaluate 5 AI constraint/validation toolkits for LLM output control

**Comparison Documents**:
- [`COMPARISON.md`](./ai_experiments/COMPARISON.md) - Detailed comparison matrix
- [`COMPARISON_CRITERIA.md`](./ai_experiments/COMPARISON_CRITERIA.md) - Evaluation framework

### Available Toolkits

| Toolkit | Status | Handoff | Best For |
|---------|--------|---------|----------|
| **Spec Kit** | 📝 Documented | [`HANDOFF.md`](./ai_experiments/spec_kit/HANDOFF.md) | Auditable policy compliance |
| **Guardrails AI** | 📝 Documented | [`HANDOFF.md`](./ai_experiments/guardrails_ai/HANDOFF.md) | Customer-facing bots with compliance |
| **Microsoft Guidance** | 📝 Documented | [`HANDOFF.md`](./ai_experiments/microsoft_guidance/HANDOFF.md) | Multi-step workflows with tool calling |
| **Outlines** | 📝 Documented | [`HANDOFF.md`](./ai_experiments/outlines/HANDOFF.md) | Structured data generation (JSON, SQL) |
| **B-MAD Method** | 📝 Documented | [`HANDOFF.md`](./ai_experiments/bmad/HANDOFF.md) | Complete AI-driven development lifecycle |

**Recommended Starting Point**: Outlines (simplest) or Guardrails AI (most mature)

**Next Steps**: See individual `HANDOFF.md` files for implementation guidance

---

## Mobile Experiments

**Location**: [`mobile_experiments/`](./mobile_experiments/)

**Purpose**: Evaluate 3 cross-platform mobile frameworks

**Comparison Document**:
- [`FRAMEWORK_COMPARISON.md`](./mobile_experiments/FRAMEWORK_COMPARISON.md) - Comprehensive 10-framework comparison

### Available Frameworks

| Framework | Status | Code Status | Handoff | Best For |
|-----------|--------|-------------|---------|----------|
| **Valdi** | 📝 Documented | ✅ Real syntax | [`HANDOFF.md`](./mobile_experiments/Valdi/HANDOFF.md) | Cross-platform native performance |
| **Flutter** | 📝 Documented | ⚠️ Placeholder | [`HANDOFF.md`](./mobile_experiments/Flutter/HANDOFF.md) | High-performance cross-platform |
| **React Native** | 📝 Documented | ❌ Not created | [`HANDOFF.md`](./mobile_experiments/ReactNative/HANDOFF.md) | Large ecosystem, familiar React |

**Recommended Starting Point**: Valdi (code ready, needs testing)

**Next Steps**: See individual `HANDOFF.md` files for installation and setup

---

## Quick Start Guides

### For AI Toolkit Implementation

1. **Choose a toolkit** from [`ai_experiments/`](./ai_experiments/)
2. **Read** the toolkit's `HANDOFF.md` file
3. **Review** `README.md` for overview
4. **Check** `TASKS.md` for backlog
5. **Follow** setup instructions
6. **Create** minimal proof-of-concept
7. **Document** results in `NEXT_STEPS.md`

### For Mobile Framework Implementation

1. **Choose a framework** from [`mobile_experiments/`](./mobile_experiments/)
2. **Read** the framework's `HANDOFF.md` file
3. **Review** `SETUP.md` for prerequisites
4. **Check** `HELLO_WORLD_PLAN.md` for app requirements
5. **Execute** installation/setup steps
6. **Create/update** project
7. **Test** on simulator/emulator
8. **Document** learnings in `UNDERSTANDING.md`

---

## Status Dashboard

### AI Experiments Status

| Toolkit | Documentation | Code | Testing | Status |
|---------|--------------|------|---------|--------|
| Spec Kit | ✅ Complete | ❌ None | ❌ Not started | 📝 Ready for implementation |
| Guardrails AI | ✅ Complete | ❌ None | ❌ Not started | 📝 Ready for implementation |
| Microsoft Guidance | ✅ Complete | ❌ None | ❌ Not started | 📝 Ready for implementation |
| Outlines | ✅ Complete | ❌ None | ❌ Not started | 📝 Ready for implementation |
| B-MAD Method | ✅ Complete | ❌ None | ❌ Not started | 📝 Ready for implementation |

### Mobile Experiments Status

| Framework | Documentation | Code | Testing | Status |
|-----------|--------------|------|---------|--------|
| Valdi | ✅ Complete | ✅ Real syntax | ❌ Not tested | 🚀 Ready for testing |
| Flutter | ✅ Complete | ⚠️ Placeholder | ❌ Not started | 📝 Ready for project creation |
| React Native | ✅ Complete | ❌ None | ❌ Not started | 📝 Ready for project creation |

**Legend**:
- ✅ Complete
- ⚠️ Partial
- ❌ Not started
- 📝 Documentation phase
- 🚀 Implementation phase

---

## File Structure Reference

### Standard Experiment Structure

Each experiment folder contains:

```
<experiment>/
├── README.md              # Overview and integration notes
├── UNDERSTANDING.md       # Research context and assumptions
├── TASKS.md              # Actionable backlog
├── NEXT_STEPS.md         # Prioritized near-term plan
├── HANDOFF.md            # Quick-start for next agent
└── [framework-specific files]
```

### Mobile-Specific Files

Mobile experiments also include:
- `SETUP.md` - Environment prerequisites
- `DOCUMENTATION.md` - Curated framework docs
- `HELLO_WORLD_PLAN.md` - App requirements
- `README_AGENT.md` - Agent-specific notes

---

## Key Decisions & Notes

### Important Corrections

1. **Valdi Framework** - Initial documentation had incorrect assumptions
   - **Status**: ✅ Corrected
   - **Documentation**: See [`Valdi/CORRECTION_SUMMARY.md`](./mobile_experiments/Valdi/CORRECTION_SUMMARY.md)
   - **Impact**: Code updated with real Valdi syntax

### Methodology Notes

1. **Documentation-First Approach**: All experiments documented before implementation
2. **Consistent Structure**: All experiments follow same pattern for easy handoff
3. **Correction Documentation**: Hallucinations/errors properly documented
4. **Comparison Documents**: Cross-toolkit/framework comparisons maintained

---

## Next Agent Checklist

Before starting work:

- [ ] Read [`PROJECT_REVIEW.md`](./PROJECT_REVIEW.md) completely
- [ ] Choose experiment (AI toolkit or mobile framework)
- [ ] Read experiment's `HANDOFF.md`
- [ ] Review `README.md` for overview
- [ ] Check `TASKS.md` for backlog
- [ ] Verify tool/framework still exists (check links)
- [ ] Review `NEXT_STEPS.md` for priorities

During work:

- [ ] Document deviations from HANDOFF steps
- [ ] Update `TASKS.md` as items complete
- [ ] Document errors/solutions in `NEXT_STEPS.md`
- [ ] Update `HANDOFF.md` if process changes

After work:

- [ ] Update `TASKS.md` with completion status
- [ ] Update `NEXT_STEPS.md` with new priorities
- [ ] Document learnings in `UNDERSTANDING.md`
- [ ] Verify no hallucinations or unverified claims

---

## Resources

### External Links

**AI Toolkits**:
- [Spec Kit](https://github.com/github/spec-kit)
- [Guardrails AI](https://github.com/guardrails-ai/guardrails)
- [Microsoft Guidance](https://github.com/microsoft/guidance)
- [Outlines](https://github.com/normal-computing/outlines)
- [B-MAD Method](https://github.com/bmad-code-org/BMAD-METHOD)

**Mobile Frameworks**:
- [Valdi](https://github.com/Snapchat/Valdi)
- [Flutter](https://flutter.dev)
- [React Native](https://reactnative.dev)

### Internal Resources

- [`PROJECT_REVIEW.md`](./PROJECT_REVIEW.md) - Comprehensive assessment
- [`.cursorrules`](./.cursorrules) - Workspace guidelines
- Individual experiment folders for detailed documentation

---

**Last Updated**: 2024-11-24  
**Next Review**: After implementation phase begins
