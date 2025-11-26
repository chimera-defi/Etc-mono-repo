# Task Backlog — Spec Kit (TypeScript)

## Minimal Viable Demo

| ID | Priority | Task | Est. Time | Status |
|----|----------|------|-----------|--------|
| SK-MVP-01 | High | Initialize Node/TS project with Spec Kit | 15 min | ✅ Complete |
| SK-MVP-02 | High | Write task-planner.md spec | 1 hour | ✅ Complete |
| SK-MVP-03 | High | Compile spec to JSON guards | 15 min | ✅ Complete |
| SK-MVP-04 | High | Create TypeScript integration wrapper | 45 min | ✅ Complete |
| SK-MVP-05 | High | Test with Cursor/Opus 4.5 | 45 min | ✅ Complete |

**Total:** ~3 hours

---

## Detailed Task Breakdown

### SK-MVP-01: Initialize Node/TS Project

```bash
mkdir -p demo && cd demo
npm init -y
npm install @github/spec-kit
npm install -D typescript @types/node
npx tsc --init
```

**Deliverables:**
- [ ] `package.json` with dependencies
- [ ] `tsconfig.json` configured
- [ ] Basic project structure

---

### SK-MVP-02: Write Task Planner Spec

Create `specs/task-planner.md` with:

**Sections to include:**
- [ ] **Intent**: What the AI should do
- [ ] **Inputs**: Project description (string)
- [ ] **Outputs**: Task array with schema
- [ ] **Constraints**: Max 10 tasks, required fields, valid priorities
- [ ] **Rubrics**: How to evaluate correctness

**Schema requirements:**
- Each task has: title, description, priority, estimated_hours
- Priority must be: high, medium, low
- Estimated hours: 0.5 - 40

---

### SK-MVP-03: Compile Spec

```bash
npx speckit build specs/task-planner.md --out builds/
```

**Deliverables:**
- [ ] `builds/task-planner.json` with compiled guards
- [ ] Verify schema matches expected_schema.json

---

### SK-MVP-04: Create TypeScript Integration

Create `src/planner.ts`:
- [ ] Import compiled spec
- [ ] Create wrapper function
- [ ] Implement validation
- [ ] Handle re-prompting on failure
- [ ] Add CLI for testing

**Example structure:**
```typescript
import { SpecKit } from '@github/spec-kit';
import spec from '../builds/task-planner.json';

export async function planTasks(projectDescription: string) {
  // Wrap AI call with Spec Kit validation
  // Handle retries on validation failure
  // Return validated response
}
```

---

### SK-MVP-05: Test with Cursor/Opus

**Test scenarios:**
- [ ] HP-01: Simple project input
- [ ] CE-01: Max tasks constraint
- [ ] EC-01: Vague input handling

**Document:**
- [ ] Does it follow the spec?
- [ ] How does it handle violations?
- [ ] Latency observations
- [ ] Developer experience notes

---

## Future Enhancements (Post-MVP)

| ID | Priority | Task | Status |
|----|----------|------|--------|
| SK-02 | Medium | Add telemetry/logging for validation events | ⬜ |
| SK-03 | Medium | Create test suite with all scenarios | ⬜ |
| SK-04 | Low | Benchmark latency with multiple specs | ⬜ |
| SK-05 | Low | Explore composable spec patterns | ⬜ |
