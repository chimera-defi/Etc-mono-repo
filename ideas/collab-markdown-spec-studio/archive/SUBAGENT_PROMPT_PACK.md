# SpecForge Sub-Agent Prompt Pack

Template basis: `ideas/_templates/SUBAGENT_PROMPT_PACK.template.md`

## Prompt A: Product/UX
Scope: `PRD.md`, `USER_FLOWS.md`, `WIREFRAMES.md`
Task: convert primary flows into measurable acceptance criteria with failure/recovery states.
Output: updated docs + changed-assumptions summary.
Constraints: no speculative integrations; keep MVP strict.

## Prompt B: Core Collaboration/Contracts
Scope: `SPEC.md`, `contracts/v1/*`
Task: define deterministic event/state behavior for concurrent edits.
Output: schemas + examples + invariants.
Constraints: `v1` may break while iterating; enforce backward compatibility from `v2` onward.

## Prompt C: Safety/Risk
Scope: `ADVERSARIAL_TESTS.md`, `RISK_REGISTER.md`
Task: enumerate abuse paths and define blocking controls + rollback logic.
Output: risk/control matrix mapped to tests.
Constraints: every risk must map to an observable signal.

## Prompt D: Validation/Economics
Scope: `VALIDATION_PLAN.md`, `GO_NO_GO_SCORECARD.md`, `ACCEPTANCE_TEST_MATRIX.md`
Task: map each KPI and each key user flow to concrete tests and owners.
Output: test matrix + go/no-go thresholds.
Constraints: no KPI without instrumentation source.

---

## Prompt E: Build Kickoff (one-shot execution)

> **Use this prompt to start a fresh build session. All planning is complete.**

Read these files in order before writing any code:
1. `ideas/collab-markdown-spec-studio/ARCHITECTURE_DECISIONS.md` — all 18 decisions are final. Do not re-litigate them.
2. `ideas/collab-markdown-spec-studio/SPEC.md` — MVP scope only (Core Components sections 1–5). Phase 2 Extensions are out of scope.
3. `ideas/collab-markdown-spec-studio/STATE_MODEL.md` — canonical lifecycle states for documents, patches, sessions.
4. `ideas/collab-markdown-spec-studio/contracts/v1/patch_proposal.request.schema.json` — the patch protocol schema.
5. `ideas/collab-markdown-spec-studio/FIRST_60_MINUTES.md` — local bootstrap commands and acceptance checks.

**Your first task:** Update `contracts/v1/patch_proposal.request.schema.json` to reflect the AST operations format decided in D13:
- Operations: `replace-section`, `insert-section`, `delete-section`, `insert-paragraph`
- Each op must include: `op`, `section_id` (UUID), `content` (new markdown for the section), `agent_id`, `timestamp`
- Add an example payload to `contracts/v1/examples/patch_proposal.request.json`

**Then scaffold the project** per `FIRST_60_MINUTES.md`. Key stack:
- Web: `pnpm create next-app@latest specforge-web --typescript --tailwind --app`
- Deps: `yjs y-websocket @codemirror/collab codemirror @clerk/nextjs`
- API: Hono + Bun (`bun create hono specforge-api`)
- DB: Postgres via Drizzle ORM; local dev via `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16`
- CRDT sync: PartyKit (`npx partykit@latest create`)

**Acceptance criteria (must pass before calling done):**
1. `pnpm test:acceptance --filter specforge:create-document` passes
2. `pnpm test:acceptance --filter specforge:accept-patch` passes
3. Two browser clients show live cursor presence on the same document
4. A patch proposal is applied optimistically on accept and rolls back on simulated conflict
5. Export produces valid `PRD.md` + `agent_spec.json` from `fixtures/workspace.seed.json`

**Hard constraints:**
- Sections are heading-level only (H1/H2/H3 + body until next heading) — D12
- Agents write patch proposals only, never directly to the canonical doc — D8
- Section IDs are UUID comment markers (`<!-- sf:id:uuid -->`) stripped on export — D7
- No staged preview on patch accept — optimistic apply via CRDT — D18
