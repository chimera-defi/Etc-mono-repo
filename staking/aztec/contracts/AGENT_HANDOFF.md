# Contract Development Handoff

**Status:** Code complete, compilation unverified

---

## Quick Verification

```bash
cd /workspace/staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 64 tests passed
```

---

## Contract Summary

| Contract | Functions | Notes |
|----------|-----------|-------|
| `liquid-staking-core/` | 37 | Main entry point, 4 cross-contract calls |
| `rewards-manager/` | 33 | Exchange rate updates |
| `vault-manager/` | 28 | 200k batch staking |
| `withdrawal-queue/` | 24 | FIFO with unbonding period |
| `aztec-staking-pool/` | 21 | Base staking logic |
| `validator-registry/` | 20 | Validator tracking |
| `staked-aztec-token/` | 13 | stAZTEC ERC20-like token |
| `staking-math-tests/` | 64 tests | Pure Noir math tests |

---

## Cross-Contract Call Pattern

All contracts use:

```noir
#[contract_library_method]
fn call_some_function(context: &mut PublicContext, target: AztecAddress, ...) {
    let selector = FunctionSelector::from_signature("function_name((Field),u128)");
    context.call_public_function(target, selector, args.as_slice());
}
```

---

## Known Risks

1. **Function selectors are guesses** - `from_signature()` format inferred from docs, not verified
2. **u128 to Field casting** - May lose precision for large values
3. **No compilation test** - Requires `aztec-nargo` which needs Docker

---

## To Compile (When Environment Ready)

```bash
# Requires aztec-nargo (Docker-based)
cd contracts/liquid-staking-core
aztec-nargo compile
```

See [NEXT_AGENT_PROMPT.md](../NEXT_AGENT_PROMPT.md) for environment setup.
