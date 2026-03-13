## SpecForge

**Status**: Exploration (docs-first)

### Concept
A collaborative spec IDE where humans and AI agents work on the same markdown canvas with depth gates, governed patch review, and attributable changes.

### Thesis
Collaborative editors already exist. The wedge is not generic editing; it is a spec-native workspace that keeps humans and agents on one canvas, enforces decision depth, and turns approved specs into execution-ready outputs.

### Key Docs (Review Path)
0. `README_REVIEW_GUIDE.md`
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

### Current Product Position
1. Validate authoring behavior first:
   - repeat collaborative use
   - trust in governed agent patches
   - ability to reach a build-ready spec
2. Use selected `ideas/` packs as example corpora and end-to-end benchmarks.
3. Treat repo generation as a downstream proof surface, not the initial product gate.
