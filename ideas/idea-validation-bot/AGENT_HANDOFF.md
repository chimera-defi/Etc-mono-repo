## Agent Handoff: Build Idea Validation Bot (MVP)

### Objective
Build an MVP that turns a user’s voice/text into:
- a structured idea interview result (facts/assumptions/risks),
- adversarial validation (kill criteria + experiments),
- exports (PRD markdown + agent spec JSON).

### MVP Must-Haves
- Session lifecycle: create session → answer questions → finalize artifacts
- Structured facts editor (user can correct what was extracted)
- Deterministic interview stages (not free-form chat)
- Export/download artifacts

### MVP Nice-to-Haves
- Voice input + transcription
- Section-by-section regeneration
- Cost/usage estimate per session

### Acceptance Criteria
- A user can complete a full session in < 15 minutes (text-only) and export PRD+JSON.
- The output includes: problem, ICP, MVP scope, risks, assumptions, experiments, and kill criteria.
- Every generated claim is labeled as user-provided vs inferred/uncertain (at least at section level).

### Suggested Build Plan (Tasks)
1. Define JSON schemas for `facts`, `assumptions`, `risks`, `experiments`, `agentSpec`.
2. Implement interview stage machine + coverage checks.
3. Implement extraction pipeline (answers → facts).
4. Implement PRD/spec generation from facts.
5. Implement UI for:
   - answering questions,
   - viewing/editing facts,
   - exporting artifacts.
6. Add adversarial mode output and kill criteria.
7. Add basic analytics (stage drop-off, completion time).

### Non-Functional Requirements (MVP)
- Reliable schema conformance (no broken JSON exports)
- Fast iteration (regenerate a single section without re-running whole session)
- Clear privacy controls (delete session)

