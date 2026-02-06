# Staking Projects Guide

> **Master rules:** `.cursorrules` | **MCP CLI:** `.cursor/MCP_CLI.md` | **Token efficiency:** `/token-reduce` skill

## Git Discipline (Required)

- One task = one PR (keep all commits on a single PR branch)
- Never push directly to `main` or `master`
- Create a branch/worktree before changes
- Always use a feature branch + PR
- Enable hooks: `git config core.hooksPath .githooks`

## Projects

### Monad Validator (`staking/monad/`) - ✅ Operational
Production validator infrastructure for Monad network:
- **infra/** - Validator setup, systemd configs, monitoring
- **runbook/** - Operations manual
- **scripts/** - Health checks, deployment automation
- **watchers/** - Monitoring infrastructure

**Commands:**
```bash
cd staking/monad/infra
./scripts/healthcheck.sh  # Check validator status
```

### Aztec Liquid Staking (`staking/aztec/`) - 🔧 Development
Privacy-focused liquid staking using Aztec Network:
- 4 smart contracts (Noir): staking-pool, staked-token, withdrawal-queue, validator-registry
- 34 unit tests passing
- 6-month implementation plan documented
- Zero-knowledge proofs for private staking

**Key docs:** `EXECUTIVE-SUMMARY.md`, `ECONOMICS.md`, `IMPLEMENTATION-PLAN.md`

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

## MCP CLI Patterns (Staking-Specific)

**General patterns:** See `.cursor/MCP_CLI.md`

```bash
# Use MCP CLI for bulk reads (10+ files)
mcp-cli filesystem/read_multiple_files '{"paths": ["staking/README.md", "staking/aztec/README.md"]}'

# Explore structure
mcp-cli filesystem/directory_tree '{"path": "staking/aztec"}'

# Find contracts
mcp-cli filesystem/search_files '{"path": "staking", "pattern": "**/*.nr"}'

# Batch read docs
mcp-cli filesystem/read_multiple_files '{"paths": ["staking/README.md", "staking/aztec/README.md"]}'

# Store security findings
mcp-cli memory/create_entities '{"entities": [{"name": "Contract Security Review", "entityType": "security", "observations": ["finding1", "finding2"]}]}'
```

## Token Reduction Bootstrap

```bash
command -v mcp-cli >/dev/null 2>&1 || curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
command -v qmd >/dev/null 2>&1 || bun install -g https://github.com/tobi/qmd
```

**Workflow:** Use QMD first for docs/notes, then targeted reads.

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

## Meta Learnings

- Always open a PR for changes; do not push directly to main.
- Always pull latest `main` and rebase your branch on `main` at the start of each new request.
- After rebasing, force-push with lease if the branch diverges from the PR head.
- Keep one task in one PR; do not create multiple PRs for the same request.
- Always commit changes with a descriptive message and model attribution.
- Record research inputs in `.cursor/artifacts/` or project artifacts to preserve source context.
- Token reduction: bootstrap MCP CLI + QMD first, use QMD before targeted reads.
