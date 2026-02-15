# Golden Principles

These are non-negotiables. They're enforced mechanically (linters, CI, tests). Not guidelines—rules.

## Core Operating Principles

### 1. Git is Source of Truth
- Everything versioned in git (code, docs, configs, plans)
- No external context (Slack, Google Docs, email) is canonical
- Context that lives externally must be captured + committed
- **Enforcement:** CI linter checks for `docs/` completeness

### 2. Documentation is Living Code
- Docs are not afterthoughts; they're first-class citizens
- Out-of-date docs are tech debt + must be fixed
- `docs/` changes reviewed with same rigor as code changes
- **Enforcement:** `doc-gardening` tasks scan for stale refs

### 3. Constraints Enable Speed
- Loose rules → drift → slowdown
- Tight, mechanical rules → predictable behavior → fast agents
- Enforce boundaries, allow autonomy within them
- **Enforcement:** Custom linters per domain (layering, naming, etc.)

### 4. Agent Legibility Over Human Preference
- Code optimized first for agent understanding
- If it's correct & maintainable, it's good enough
- Schemas > prose; structured data > comments
- **Enforcement:** Structured logging, typed configs, validated inputs

### 5. Testing is Continuous, Not Gated
- Tests validate, not block
- High throughput > perfect testing
- Failures addressed via follow-ups, not indefinite blocking
- **Enforcement:** Fast test suite; flakes retried; coverage tracked

### 6. Memory is Intentional
- Daily notes (`memory/YYYY-MM-DD.md`) for raw context
- `MEMORY.md` for curated, long-term insights
- Stale memory cleaned up weekly
- **Enforcement:** Memory files reviewed in heartbeats

---

## Domain-Specific Rules

### Eth2/Staking
- **No magic numbers:** Validator counts, deposit amounts, penalties → named constants
- **Validated at boundaries:** Parse + validate all external inputs (blockchain data, API responses)
- **Fail safely:** Staking operations must have rollback/recovery paths
- **Enforcement:** Domain linter (`linters/eth2.sh`) + schema validation

### OpenClaw Infrastructure
- **No hardcoded paths:** Use env vars + config
- **Logs structured:** JSON + queryable
- **Health checks runnable:** Agents must be able to probe system state
- **Enforcement:** Config schema validation + log format linter

---

## Enforcement Mechanisms

Each principle is backed by:
1. **Code linter** — catches violations automatically
2. **CI check** — fails PR if violated
3. **Cleanup task** — background job fixes patterns (if auto-fixable)
4. **Documentation** — explains why + how to comply

## Adding New Principles

1. Document in this file (with enforcement mechanism)
2. Create corresponding linter/test
3. Add to CI pipeline
4. Document exception process (if applicable)

---

_Last reviewed: 2026-02-15 | Next review: 2026-02-22_
