## SpecForge (Collaborative Markdown Spec Studio)

**Status**: Build-ready — all open questions resolved (see `OPEN_QUESTIONS.md`)
**Product name:** SpecForge (alt: ShipSpec — see `NAME_OPTIONS.md`)
**Tech stack:** Yjs + Next.js 15 + CodeMirror 6 + Hono/Bun + Postgres + Clerk + Claude API

### Concept
A multiplayer Markdown editor for humans + AI agents to co-author PRDs/specs/design docs with branch/merge semantics and AI patch governance. Outputs a build-ready spec bundle that can scaffold a starter repository (Phase 2).

### Thesis
Collaborative editors exist, but a focused "spec studio" with agent patch governance, section-level provenance, and merge-safe AI edits can win for startup/engineering teams focused on spec-to-ship workflows.

### Key Docs (Review Path)
0. `README_REVIEW_GUIDE.md`
0b. `OPEN_QUESTIONS.md` ← **start here before building**
1. `EXECUTIVE_SUMMARY.md`
2. `PRD.md`
3. `SPEC.md`
4. `ARCHITECTURE_DIAGRAMS.md`
5. `UX_PRINCIPLES.md`
6. `USER_FLOWS.md`
7. `FRONTEND_VISION.md`
8. `WIREFRAMES.md`
9. `COMPETITOR_MATRIX.md`
10. `VALIDATION_PLAN.md`
11. `GO_NO_GO_SCORECARD.md`

### Full Pack (Grouped)
- Strategy and product: `EXECUTIVE_SUMMARY`, `PRD`, `ALTERNATIVES_AND_VARIANTS`, `COMPETITOR_ANALYSIS`, `COMPETITOR_MATRIX`
- Technical design: `SPEC`, `ARCHITECTURE_DIAGRAMS`, `ARCHITECTURE_DECISIONS`
- UX and product surface: `VISION_AND_FLOW`, `UX_PRINCIPLES`, `USER_FLOWS`, `FRONTEND_VISION`, `WIREFRAMES`
- Validation and economics: `VALIDATION_PLAN`, `GO_NO_GO_SCORECARD`, `PILOT_SCORECARD_TEMPLATE`, `FINANCIAL_MODEL`, `RISK_REGISTER`
- Execution and governance: `90_DAY_EXECUTION_PLAN`, `TASKS`, `DECISIONS`, `AGENT_HANDOFF`, `SPEC_STAGE_CHECKLIST`
- Iteration history: `REFINEMENTS`, `MULTIPASS_REVIEW`, `META_LEARNINGS`, `IDEA_DEVELOPMENT_FRAMEWORK`
- One-shot build assets: `contracts/`, `fixtures/`, `ACCEPTANCE_TEST_MATRIX.md`, `FIRST_60_MINUTES.md`, `SUBAGENT_PROMPT_PACK.md`

### Source Notes
Primary references and links are consolidated in `RESEARCH_NOTES.md` to avoid duplication.
