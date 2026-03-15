# Spec Stage Checklist (SpecForge)

- [x] README
- [x] PRD
- [x] SPEC
- [x] Feasibility analysis
- [x] Adversarial tests
- [x] Validation plan
- [x] Vision and flow
- [x] UX principles
- [x] User flows
- [x] Frontend vision
- [x] Wireframes (lo-fi acceptable)
- [x] Competitor analysis
- [x] Competitor matrix (named + scored)
- [x] Alternatives and variants
- [x] Name options
- [x] Research prompt
- [x] Agent handoff
- [x] Tasks
- [x] Decisions
- [x] Versioned contracts + examples (`contracts/`)
- [x] Deterministic fixtures (`fixtures/`)
- [x] Acceptance test matrix (`ACCEPTANCE_TEST_MATRIX.md`)
- [x] First 60-minute runbook (`FIRST_60_MINUTES.md`)
- [x] Sub-agent prompt pack (`SUBAGENT_PROMPT_PACK.md`)
- [x] Event model appendix (`EVENT_MODEL.md`)

## Readiness Note
The checklist above tracks presence of spec-stage assets, not proof that a runnable implementation already exists. Assets like `FIRST_60_MINUTES.md` and `ACCEPTANCE_TEST_MATRIX.md` currently define target implementation behavior.

## Depth Standard
1. Must include explicit execution outcome metric.
2. Must include retention and trust signals.
3. Must include phased rollout and scope cuts.
4. Must include adversarial and kill criteria.
5. Must include UX primary path + failure path coverage.
6. Must include guided clarification ("ask user") path for ambiguous sections.
7. Must include contract, fixture, and acceptance test linkage for one-shot builds.
