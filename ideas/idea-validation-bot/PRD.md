## Idea Validation Bot PRD

**Status**: Draft | **Last Updated**: Feb 5, 2026 | **Owner**: TBD

### Problem
People can generate “ideas” easily, but they struggle to:
- turn fuzzy thoughts into a coherent plan,
- identify hidden assumptions and fatal flaws early,
- produce a concrete PRD/spec that an engineering team (or coding agents) can implement.

### Goal (Product Thesis)
Convert an unstructured spoken idea into a **high-quality, adversarially-tested** product spec that is ready for build agents, with a clear “ship / iterate / kill” recommendation and next experiments.

### Target Users
- **Solo builders using coding agents** (Cursor/Claude/other) who need a PRD to get good results
- Early-stage founders doing fast iteration and customer discovery
- Product-minded engineers validating side projects

### Non-Goals
- Replacing real customer discovery (it can guide it, not do it)
- Providing legal/financial advice
- Building a general-purpose voice assistant
- Guaranteeing idea success (only improves decision quality)

### Core Value Proposition
- **Structured clarity**: converts rambling audio to structured requirements
- **Adversarial pressure testing**: surfaces weak assumptions and “tar pit” risks
- **Agent-ready output**: produces specs that reduce prompt-churn and rework

### MVP Scope (Phase 1)
**Input**
- Voice capture (mobile) and/or paste text
- Automatic transcription (cloud STT)

**Core flow**
1. Capture idea statement + user context
2. Multi-stage interview (problem, user, solution, differentiation, constraints)
3. Feasibility analysis (technical + execution)
4. Adversarial tests (business model + GTM + “why now?” + distribution)
5. Output: PRD + technical spec + experiment plan + risk register

**Output artifacts (MVP)**
- PRD (Markdown)
- Agent spec (structured JSON + Markdown)
- “Top 10 assumptions” list with proposed experiments
- “Kill criteria” (what evidence would make you stop)

### Out of Scope (MVP)
- Fully offline/on-device STT+LLM
- Long-term CRM-like idea tracking
- Multi-user collaboration / team workspaces
- Automated competitor scraping (may be added later)

### Differentiation (How it wins)
- **Interview engine** as a state machine with coverage guarantees (not a free-form chat)
- **Adversarial mode** that is explicit, repeatable, and outputs kill criteria
- **Spec fidelity**: outputs are buildable (acceptance criteria, APIs, data model, tasks)

### Key UX Requirements
- “One button record” simplicity (no setup friction)
- Visible structure: user sees a live outline of what’s been captured
- Fast iteration: allow “regenerate section” and “tighten assumptions”
- Trust: show which claims are user-provided vs model-inferred; warn on uncertainty

### Quality Bar (What “good” looks like)
- Output is **specific enough** that a coding agent can implement MVP without hallucinating requirements
- Each critical claim has a “source”: (user said / inferred / uncertain)
- Adversarial section produces at least 3 meaningful risks + experiments

### Success Metrics
- Activation: % of users who complete an interview to PRD
- Output usefulness: self-reported “ready to build” score
- Reduction in iteration: fewer follow-up prompts needed to start implementation
- Retention: users come back to refine ideas or run new ones

### Risks
- Generic outputs (no differentiation vs “chat with any LLM”)
- Users don’t want to be challenged (“adversarial” increases churn)
- Cost structure (STT + LLM) makes pricing hard for casual users
- Liability perception (business advice); must add disclaimers and guardrails

### Open Questions
- Primary wedge: voice-first mobile vs “idea-to-spec” workflow regardless of input?
- Best initial ICP: solo builders vs founders vs PMs?
- Pricing: per report vs subscription vs credits?

