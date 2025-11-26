# Task Backlog — B-MAD Method (TypeScript)

## Minimal Viable Demo

| ID | Priority | Task | Est. Time | Status |
|----|----------|------|-----------|--------|
| BM-MVP-01 | High | Install B-MAD Method | 15 min | ✅ Complete |
| BM-MVP-02 | High | Initialize project with workflow-init | 15 min | ✅ Complete |
| BM-MVP-03 | High | Create Task Planner PRD with PM agent | 1 hour | ✅ Complete |
| BM-MVP-04 | High | Generate architecture with Architect agent | 30 min | ✅ Complete |
| BM-MVP-05 | High | Implement with Developer agent | 1 hour | ✅ Complete |
| BM-MVP-06 | High | Document workflow observations | 30 min | ✅ Complete |

**Total:** ~3.5 hours

---

## Detailed Task Breakdown

### BM-MVP-01: Install B-MAD Method

```bash
# For stable v4:
npx bmad-method install

# For alpha v6 (more features):
npx bmad-method@alpha install
```

**Deliverables:**
- [ ] B-MAD CLI installed
- [ ] Verify with `bmad --version`

---

### BM-MVP-02: Initialize Project

In Cursor:
1. Load any B-MAD agent
2. Run `*workflow-init`
3. Select "Quick Flow" or "B-MAD Method" track

**Deliverables:**
- [ ] `.bmad/` configuration folder
- [ ] Project structure recognized
- [ ] Workflow initialized

---

### BM-MVP-03: Create PRD with PM Agent

**Use the PM (Product Manager) agent to create:**
- [ ] Project overview: "Task Planner CLI"
- [ ] User stories for the demo
- [ ] Acceptance criteria
- [ ] Success metrics

**PRD should cover:**
- Input: Project description string
- Output: Structured task breakdown (JSON)
- Constraints: Max 10 tasks, required fields
- User experience expectations

**Deliverables:**
- [ ] `docs/prd.md` with product requirements
- [ ] Clear scope and constraints defined

---

### BM-MVP-04: Generate Architecture with Architect Agent

**Use the Architect agent to create:**
- [ ] Technical design for TypeScript CLI
- [ ] Data models (matching expected_schema.json)
- [ ] Integration approach with Cursor/Opus
- [ ] Validation strategy

**Deliverables:**
- [ ] `docs/architecture.md` with technical design
- [ ] Data model definitions
- [ ] Component structure

---

### BM-MVP-05: Implement with Developer Agent

**Use the Developer agent to:**
- [ ] Scaffold TypeScript project
- [ ] Implement core planner logic
- [ ] Add CLI interface
- [ ] Integrate with Cursor/Opus

**Expected structure:**
```
demo/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts       # CLI entry
│   ├── planner.ts     # Core logic
│   └── types.ts       # Type definitions
└── docs/
    ├── prd.md
    └── architecture.md
```

---

### BM-MVP-06: Document Workflow Observations

**Compare to Spec Kit approach:**
- [ ] How did the agents guide development?
- [ ] What was the spec creation experience like?
- [ ] How well did the AI follow the methodology?
- [ ] Was the output consistent with specs?
- [ ] Developer experience notes

**Document:**
- [ ] Strengths of B-MAD approach
- [ ] Weaknesses/friction points
- [ ] Comparison notes for final report

---

## Future Enhancements (Post-MVP)

| ID | Priority | Task | Status |
|----|----------|------|--------|
| BM-02 | Medium | Create custom workflow for constraint validation | ⬜ |
| BM-03 | Medium | Test B-MAD Builder for custom agent | ⬜ |
| BM-04 | Low | Compare v4 stable vs v6 alpha | ⬜ |
| BM-05 | Low | Integrate with Spec Kit for output validation | ⬜ |
