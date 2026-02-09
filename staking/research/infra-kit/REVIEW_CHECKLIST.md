# InfraKit Review Checklist (Meta + Content)

## Multi‑Pass Review (Required)
Pass 1: Accuracy (script‑grounded)
- [x] Every claim maps to a verified script or is labeled as future/optional.
- [x] No Aztec validator ops assumptions (dev/test only unless proven).
- [x] No shared protocol clients between Ethereum/Monad (ops only).

Pass 2: Consistency
- [x] Naming uses **InfraKit** everywhere.
- [x] Diagram labels match SPEC.md flows and adapter names.
- [x] README doc list matches actual files.

Pass 3: Completeness
- [x] PRD present and scoped to MVP.
- [x] OVERVIEW present (newcomer‑friendly).
- [x] SPEC has verified script inventory.
- [x] PLAN + TASKS + PROMPTS present.
- [x] EXECUTIVE_SUMMARY + DECISIONS + CONTEXT present.
- [x] EXACT_SUMMARY present (single paragraph).
- [x] MASTER_PROMPT + META_ENGINEERING present.
- [x] META_LEARNINGS present (process + content).

Pass 4: Concision
- [x] No repeated sections or redundant bullets.
- [x] Diagrams are ASCII and readable on GitHub.

## Design Diagram Checklist
- [x] High‑level architecture (business view) present.
- [x] Control plane evolution (repo → hosted → orchestration) present.
- [x] Shared vs adapter boundary clear.
- [x] Monitoring + security paths explained.

## Research Checklist (Current Scope)
- [x] eth2‑quickstart run_1/run_2/exports/common_functions verified.
- [x] eth2‑quickstart security + web + SSL scripts verified.
- [x] Monad infra scripts verified (setup_server + status service).
- [x] Aztec scripts verified (dev/test only).

## PR Readiness
- [x] No mermaid diagrams (ASCII only).
- [x] All links in README still valid.
- [x] No unverified claims about chain hardware or economics.
