# InfraKit Review Checklist (Meta + Content)

## Multi‑Pass Review (Required)
Pass 1: Accuracy (script‑grounded)
- [ ] Every claim maps to a verified script or is labeled as future/optional.
- [ ] No Aztec validator ops assumptions (dev/test only unless proven).
- [ ] No shared protocol clients between Ethereum/Monad (ops only).

Pass 2: Consistency
- [ ] Naming uses **InfraKit** everywhere.
- [ ] Diagram labels match SPEC.md flows and adapter names.
- [ ] README doc list matches actual files.

Pass 3: Completeness
- [ ] PRD present and scoped to MVP.
- [ ] OVERVIEW present (newcomer‑friendly).
- [ ] SPEC has verified script inventory.
- [ ] PLAN + TASKS + PROMPTS present.
- [ ] EXECUTIVE_SUMMARY + DECISIONS + CONTEXT present.
- [ ] EXACT_SUMMARY present (single paragraph).
- [ ] MASTER_PROMPT + META_ENGINEERING present.
- [ ] META_LEARNINGS present (process + content).

Pass 4: Concision
- [ ] No repeated sections or redundant bullets.
- [ ] Diagrams are ASCII and readable on GitHub.

## Design Diagram Checklist
- [ ] High‑level architecture (business view) present.
- [ ] Control plane evolution (repo → hosted → orchestration) present.
- [ ] Shared vs adapter boundary clear.
- [ ] Monitoring + security paths explained.

## Research Checklist (Current Scope)
- [ ] eth2‑quickstart run_1/run_2/exports/common_functions verified.
- [ ] eth2‑quickstart security + web + SSL scripts verified.
- [ ] Monad infra scripts verified (setup_server + status service).
- [ ] Aztec scripts verified (dev/test only).

## PR Readiness
- [ ] No mermaid diagrams (ASCII only).
- [ ] All links in README still valid.
- [ ] No unverified claims about chain hardware or economics.
