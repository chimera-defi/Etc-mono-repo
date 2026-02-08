# Staking Projects Guide

> **Master rules:** `.cursorrules` | **Token efficiency:** `/token-reduce` skill | **Benchmarks:** `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`

## Git & Workflow

See `.cursorrules` **Git Discipline** and **Meta Learnings** sections for shared rules (PRs, rebasing, attribution, hooks).

## Projects

### Monad Validator (`staking/monad/`) - ✅ Operational
Production validator infrastructure for Monad network:
- **infra/scripts/** - 26+ operational scripts (setup, health checks, hardening)
- **infra/config/** - Configuration templates (validator, systemd, reverse proxy)
- **infra/monitoring/** - Prometheus + Grafana + Loki stack
- **infra/RUNBOOK.md** - Operations manual
- **liquid/** - Liquid staking MVP skeleton

**Commands:**
```bash
cd staking/monad/infra
./scripts/healthcheck.sh  # Check validator status
./scripts/check_rpc.sh http://localhost:8080 eth_blockNumber  # RPC check
```

### Aztec Liquid Staking (`staking/aztec/`) - 🔧 Phase 2 Complete
Privacy-focused liquid staking using Aztec Network:
- 3 production contracts (Noir): liquid-staking-core, staked-aztec-token, withdrawal-queue
- 1 test suite: staking-math-tests (74 tests passing)
- 6-month implementation plan documented
- Zero-knowledge proofs for private staking

**Key docs:** `EXECUTIVE-SUMMARY.md`, `ECONOMICS.md`, `IMPLEMENTATION-PLAN.md`
**Current status:** `aztec/PROGRESS.md` | **Handoff:** `aztec/HANDOFF.md`

### Staking Research (`staking/research/`) - 📚 Active
Market analysis and opportunity research:
- Liquid staking landscape ($66B+ market)
- `OPPORTUNITIES.md` - Priority-ranked opportunities
- `monad-validator-plan.md` - Monad strategy

**Key insight:** Aztec is urgent first-mover opportunity for private liquid staking.

## Core Principles

1. **Security first** - Real value involved
2. **Document thoroughly** - Complex contracts need docs
3. **Test rigorously** - Verify economic models
4. **Store knowledge** - Avoid re-researching
5. **Track decisions** - Document rationale

## Noir/Aztec Patterns

**Language rules:**
- `|` for OR, `&` for AND (not `||` and `&&`)
- No early returns - use if-else
- Loops need compile-time bounds
- No dynamic arrays

**Aztec specifics:**
- `FunctionSelector::from_signature("fn_name((Field),u128)")` for cross-contract calls
- `AztecAddress` is `(Field)` in signatures
- AuthWit required for token transfers
- `aztec-nargo` (Docker) for compilation
- Separate pure math into testable modules

## Token Reduction

**Full guide:** `.cursor/TOKEN_REDUCTION.md` | **Skill:** `/token-reduce`

**Staking-specific searches:**
```bash
rg -g "*.nr" "reentrancy" staking/
rg -g "*.md" "slashing" staking/
```

## Security Checklist

- [ ] Reentrancy guards on withdraw
- [ ] Integer overflow checks
- [ ] Access control on admin functions
- [ ] Emergency pause mechanism
- [ ] Time-locked parameter updates
- [ ] Audit before mainnet

## Economic Model

**Key formulas:**
- APY: `(rewards / staked) * (365 / period_days) * 100`
- Revenue: `TVL * APY * fee_rate`

**Parameters to document:**
- Minimum stake, lock-up period, APY range
- Slashing penalty, reward frequency
- Governance threshold

## Testing Strategy

| Type | Purpose |
|------|---------|
| Unit | Individual function correctness |
| Integration | Multi-contract interactions |
| Fuzz | Random input boundaries |
| Invariant | System invariants maintained |
| Economic | APY, reward distribution |
| Security | Reentrancy, overflow, access |

## Handoff Documentation

Distinguish:
- **Verified working** - Tests pass
- **Needs environment** - Requires aztec-nargo/sandbox

Never claim full completion for uncompiled code.

