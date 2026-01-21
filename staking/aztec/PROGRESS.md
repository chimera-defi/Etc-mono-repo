# Development Progress

**Status:** ✅ Phase 2 Complete - All contracts compile with v3.0.x

---

## Environment Status ✅

| Tool | Version | Status |
|------|---------|--------|
| Docker | 28.2.2 | ✅ Working |
| noirup/nargo | 1.0.0-beta.18 | ✅ Installed |
| aztec-nargo | 1.0.0-beta.15 (from devnet image) | ✅ Extracted |
| aztec-packages | v3.0.3 | ✅ Dependencies updated |

---

## What Works

```bash
# Unit tests (64/64 passing)
cd contracts/staking-math-tests && ~/.nargo/bin/nargo test
# 64 tests passed ✅

# All 3 core contracts compile successfully
cd ~/aztec-contracts/staked-aztec-token && ~/aztec-bin/aztec-nargo compile   # 773 KB
cd ~/aztec-contracts/liquid-staking-core && ~/aztec-bin/aztec-nargo compile  # 782 KB
cd ~/aztec-contracts/withdrawal-queue && ~/aztec-bin/aztec-nargo compile     # 791 KB
```

---

## Contract Architecture (Simplified)

Reduced from 7 contracts (176 functions) to 3 core contracts (38 functions):

| Contract | Functions | Artifact Size | Status |
|----------|-----------|---------------|--------|
| StakedAztecToken | 13 | 773 KB | ✅ Compiles |
| LiquidStakingCore | 14 | 782 KB | ✅ Compiles |
| WithdrawalQueue | 11 | 791 KB | ✅ Compiles |
| **Total** | **38** | **2.3 MB** | **3/3 ✅** |

### Removed Contracts (Redundant)
- `aztec-staking-pool` - Standalone pool, not part of liquid staking flow
- `validator-registry` - Duplicated VaultManager functionality
- `vault-manager` - Admin operations simplified into LiquidStakingCore
- `rewards-manager` - Admin operations simplified into LiquidStakingCore

### Core Flow
```
User deposits AZTEC → LiquidStakingCore.deposit() → Mints stAZTEC (StakedAztecToken)
User withdraws → LiquidStakingCore.request_withdrawal() → Creates unbonding request (WithdrawalQueue)
After 7 days → WithdrawalQueue.claim_withdrawal() → Returns AZTEC to user
```

---

## Breaking Changes (v2.1.9 → v3.0.x)

See `contracts/NOIR_GUIDE.md` section 1.1 for full migration guide.

Key changes:
- `#[public]` → `#[external("public")]`
- `storage.field` → `self.storage.field`
- `context.msg_sender()` → `self.msg_sender().unwrap()`
- `context.this_address()` → `self.address`
- Cross-contract calls: `self.context.call_public_function(..., GasOpts::default())`
- Add `use dep::aztec::protocol_types::traits::ToField` for `.to_field()` calls

---

## Next Steps (Phase 3)

1. **Verify function selectors** against actual Aztec Token contract ABI
2. **Run integration tests** with Aztec sandbox/devnet
3. **Deploy to devnet** for full flow testing
4. **Add private transfer support** (optional enhancement)

---

## Commands Reference

```bash
# Install nargo (for unit tests)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
~/.nargo/bin/noirup

# Extract aztec-nargo from Docker
docker pull aztecprotocol/aztec:devnet
docker create --name tmp-aztec aztecprotocol/aztec:devnet
docker cp tmp-aztec:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/aztec-nargo
docker rm tmp-aztec
chmod +x ~/aztec-bin/aztec-nargo

# Compile Aztec contracts (must be under $HOME)
cp -r contracts/staked-aztec-token ~/aztec-contracts/
cd ~/aztec-contracts/staked-aztec-token
~/aztec-bin/aztec-nargo compile
```
