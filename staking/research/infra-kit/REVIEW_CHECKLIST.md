# InfraKit Review Checklist (Meta + Content)

## Multi-Pass Review (Required)
Pass 1: Accuracy (script-grounded)
- [x] Every claim maps to a verified script or is labeled as future/optional.
- [x] No Aztec validator ops assumptions (dev/test only unless proven).
- [x] No shared protocol clients between Ethereum/Monad (ops only).
- [x] eth2-quickstart script inventory complete (7 EL, 6 CL, 5 MEV, utils, tests).

Pass 2: Consistency
- [x] Naming uses **InfraKit** everywhere.
- [x] Diagram labels match SPEC.md flows and adapter names.
- [x] README doc list matches actual files.
- [x] Aztec scripts use shared `lib/common.sh` (no duplicated helpers).

Pass 3: Completeness
- [x] PRD present and scoped to MVP.
- [x] OVERVIEW present (newcomer-friendly).
- [x] SPEC has verified script inventory (expanded with full eth2-quickstart).
- [x] PLAN + TASKS + PROMPTS present.
- [x] EXECUTIVE_SUMMARY + DECISIONS + CONTEXT present.
- [x] EXACT_SUMMARY present (single paragraph).
- [x] MASTER_PROMPT + META_ENGINEERING present.
- [x] META_LEARNINGS present (process + content).
- [x] Aztec scripts/README.md present.

Pass 4: Concision
- [x] No repeated sections or redundant bullets.
- [x] Diagrams are ASCII and readable on GitHub.

## Design Diagram Checklist
- [x] High-level architecture (business view) present.
- [x] Control plane evolution (repo -> hosted -> orchestration) present.
- [x] Shared vs adapter boundary clear.
- [x] Monitoring + security paths explained.

## Research Checklist (Current Scope)
- [x] eth2-quickstart run_1/run_2/exports/common_functions verified.
- [x] eth2-quickstart security + web + SSL scripts verified.
- [x] eth2-quickstart full client catalog verified (7 EL, 6 CL, 5 MEV).
- [x] eth2-quickstart utility and test scripts verified.
- [x] Monad infra scripts verified (setup_server + status service + all 23 scripts).
- [x] Aztec scripts verified (dev/test only, now with shared lib).

## Script Quality Checklist
- [x] Aztec scripts use consistent error handling (set -euo pipefail via lib/common.sh).
- [x] Aztec scripts have --help flags.
- [x] No hardcoded paths in Aztec scripts (env vars with defaults).
- [x] Monad scripts use portable commands (grep not rg).

## PR Readiness
- [x] No mermaid diagrams (ASCII only).
- [x] All links in README still valid.
- [x] No unverified claims about chain hardware or economics.
