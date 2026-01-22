# Staking Projects Guide

> **Master rules:** `.cursorrules` | **MCP CLI:** `.cursor/MCP_CLI.md` | **Token efficiency:** `.cursor/token-reduction-skill.md`

## Projects

### Aztec Staking (`staking/aztec/`)
Privacy-focused staking using Aztec Network. Zero-knowledge proofs, private transactions, Noir smart contracts. **Status:** Research phase.

### Staking Research (`staking/research/`)
Staking mechanism comparisons, economic models, risk analysis, implementation strategies. **Status:** Active research.

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
# Explore structure
mcp-cli filesystem/directory_tree '{"path": "staking/aztec"}'

# Find contracts
mcp-cli filesystem/search_files '{"path": "staking", "pattern": "**/*.nr"}'

# Batch read docs
mcp-cli filesystem/read_multiple_files '{"paths": ["staking/README.md", "staking/aztec/README.md"]}'

# Store security findings
mcp-cli memory/create_entities '{"entities": [{"name": "Contract Security Review", "entityType": "security", "observations": ["finding1", "finding2"]}]}'
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
