# InfraKit Decision Log

## 2026-02-XX -- Repo-based control plane (MVP)
**Decision:** Keep the control plane as scripts + runbooks in phase 1.
**Rationale:** Aligns with eth2-quickstart/Monad workflows and minimizes overhead.

## 2026-02-XX -- Shared primitives + thin adapters
**Decision:** Centralize common ops steps; keep chain-specific logic in adapters.
**Rationale:** Reduces duplication while preserving chain-specific flexibility.

## 2026-02-XX -- Aztec scope limited to dev/test tooling
**Decision:** Do not define production validator roles until scripts exist.
**Rationale:** Avoid unverified assumptions; keep spec grounded in code.

## 2026-02-09 -- Aztec scripts shared library
**Decision:** Create `scripts/lib/common.sh` for Aztec dev tooling with shared colors, env detection, binary finders, test tracking.
**Rationale:** Aztec scripts duplicated ~150 lines of identical code (colors, env detection, pass/fail helpers). A shared library eliminates drift and simplifies maintenance.

## 2026-02-09 -- Portable commands (grep not rg)
**Decision:** All infra scripts must use standard coreutils (grep, sed, awk) rather than non-standard tools like ripgrep.
**Rationale:** Target validator hosts may not have rg installed. grep is universally available on Linux.

## 2026-02-09 -- snake_case for shared primitive filenames
**Decision:** Use snake_case for all shared primitive scripts (matching Monad convention).
**Rationale:** Monad scripts (production-grade) already use snake_case. eth2-quickstart functions use snake_case. Aztec scripts use kebab-case but these are dev-only tooling.
