## Idea Validation Bot Technical Spec (MVP)

### Summary
System that converts **voice/text input** into:
- structured extracted facts (idea, ICP, constraints, assumptions),
- adversarial validations (risks + kill criteria),
- exportable artifacts (PRD + agent spec JSON + build plan).

### Architecture (Proposed)
**Client (mobile/web)**
- Capture voice (optional) + text notes
- Show live outline (sections filling in)
- Let user edit extracted facts directly (source-of-truth UI)
- Exports: Markdown + JSON

**Backend API**
- Auth + sessions
- File storage (audio, transcripts, exports)
- Orchestrator that runs the interview state machine

**Model services**
- STT provider for audio → transcript
- LLM for: extraction, question selection, section writing, adversarial tests

### Core Design Principle
Treat the LLM as a component inside a **deterministic workflow**:
- State machine drives questions
- Extraction produces structured facts
- Generation uses structured facts to write outputs
- Validation enforces schema + completeness checks

### Data Model (MVP)
- `Session`
  - `id`, `userId`, `createdAt`, `status`
  - `title`
  - `inputs[]` (audio/text)
  - `transcript` (normalized text)
  - `facts` (structured JSON)
  - `risks[]`, `assumptions[]`, `experiments[]`
  - `artifacts` (PRD markdown, spec markdown, agentSpec JSON)

### Interview Engine
Represent as:
- `Stage`: enum (`setup`, `problem`, `solution`, `diff`, `feasibility`, `biz_model`, `gtm`, `adversarial`, `finalize`)
- `Question`: id, stage, prompt template, answer type, extraction target, follow-up rules
- `Coverage`: required fields per stage

**Algorithm (high level)**
1. Start stage → ask best next question
2. Capture answer (voice/text)
3. Run extraction → update `facts`
4. Check coverage → decide next question or advance stage

### Output Generation
Generate per-section from `facts`:
- PRD sections (problem, goals, scope, user journeys, metrics, risks)
- Feasibility summary + constraints list
- Adversarial: kill criteria + experiments

**Key constraint**: Output must label confidence/source:
- `source=user` (explicit)
- `source=inferred` (model inference)
- `source=unknown` (flag + ask user)

### Guardrails (MVP)
- “No external facts without citations”: if model mentions competitors/pricing, mark as uncertain and ask user to confirm.
- “Advice disclaimer”: business planning support only, not legal/financial advice.
- Schema validation for JSON outputs; retry with narrower prompts on failure.

### Export Formats
1. `PRD.md` (Markdown)
2. `AGENT_SPEC.json` (structured; includes acceptance criteria + tasks)
3. `TASKS.md` (optional) for human readability

### Observability
- Trace per session: stage transitions, token usage, cost estimates, completion time.
- Quality signals: user edits per section, regenerate counts, abandon points.

### MVP Tech Stack (suggested, not mandatory)
- Backend: Node/TS (Fastify) or Python (FastAPI)
- DB: Postgres
- Storage: S3-compatible for audio/exports
- Client: React Native (if mobile-first) or Next.js (if web-first)

### Security / Privacy
- Encrypt at rest where possible (or rely on managed storage encryption).
- Minimize data retention: user-controlled delete.
- Separate “audio” from “facts” so users can keep artifacts without storing raw recordings.

